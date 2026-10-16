-- ============================================================================
-- CMC Lab 云同步 · 数据库结构（WorkBuddy 云服务 / 托管 PostgreSQL 17）
--
-- 这份文件是**权威记录**，不是可以一键执行的迁移脚本：平台要求逐条执行
-- （每次一条语句），执行入口是内置的云数据库 SQL 工具，不在应用里跑 DDL。
-- 保留在这里是为了可审计、可复刻（自建 PostgreSQL 时照抄即可）。
--
-- 三张表：
--   accounts         应用层用户名字典：username -> 平台账号 owner_id
--   account_secrets  用户名登录的口令闸门（邮箱 + bcrypt 散列）—— Server-only
--   user_state       每用户一行学习数据快照
--
-- 两个平台事实驱动了整个设计，别绕开它们：
--   1. 平台**不支持用户名登录**，也不存在「未经验证的密码注册」
--      → 平台身份只能是邮箱（验证码验证后建号），用户名是应用层加的一层
--   2. 新建的表和函数会被平台**默认授予 anon / authenticated 权限**
--      → 想要「只给服务端用」，光开 RLS 不够，必须显式 REVOKE
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. 口令散列
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- 验证：SELECT crypt('x', gen_salt('bf', 10));  →  $2a$10$...


-- ----------------------------------------------------------------------------
-- 1. accounts —— 应用层用户名字典
-- ----------------------------------------------------------------------------
CREATE TABLE accounts (
  username   TEXT PRIMARY KEY,
  owner_id   TEXT NOT NULL UNIQUE,          -- 平台账号 id（= 会话里的 user.id = auth.uid()）
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 用户名唯一性**大小写不敏感**：Alice 和 alice 视为同一个，避免钓鱼式重名
CREATE UNIQUE INDEX accounts_username_lower_key ON accounts (lower(username));

COMMENT ON TABLE accounts IS '应用层用户名字典：username -> 平台账号 owner_id（一个平台账号一个用户名）';

-- RLS 开启 + 零策略 = 全拒；再显式 REVOKE 掉平台默认授予的权限，做到名副其实的 Server-only
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.accounts FROM anon, authenticated;


-- ----------------------------------------------------------------------------
-- 2. account_secrets —— 用户名登录的口令闸门（Server-only）
-- ----------------------------------------------------------------------------
-- 为什么需要它：登录要先拿用户名换回邮箱，而邮箱是 PII，不能对匿名调用者开放。
-- 所以这一列不直读，只经 SECURITY DEFINER 函数在**口令正确**的前提下返回邮箱，
-- 这样既解决了「用户名 → 邮箱」，也堵住了「用户名 → 邮箱」的批量枚举。
--
-- 于是口令有两份散列，必须保持同步：
--   1. 平台侧（真身份凭据，登录时用）
--   2. 本表 pass_hash（闸门），在任何改动平台口令的路径后调 fn_sync_password_hash 更新
CREATE TABLE account_secrets (
  username   TEXT PRIMARY KEY REFERENCES accounts(username) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  pass_hash  TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE account_secrets IS '用户名登录凭据（邮箱 + bcrypt 口令散列）。Server-only：开 RLS 且零策略零 GRANT，仅经 SECURITY DEFINER 函数访问';

ALTER TABLE account_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.account_secrets FROM anon, authenticated;


-- ----------------------------------------------------------------------------
-- 3. user_state —— 学习数据快照（每用户一行）
-- ----------------------------------------------------------------------------
-- payload 是同步子集（见 src/storage/remote.ts 的 SyncedPayload）：
-- **不含内置 101 题** —— 题库随代码分发，各端本地重建，云端只存学习数据 + 用户导入题。
CREATE TABLE user_state (
  owner_id       TEXT PRIMARY KEY DEFAULT auth.uid(),
  payload        JSONB NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_state IS '每用户一行学习数据同步快照（payload 为 JSONB，不含内置题库）';

ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;

-- 只给 authenticated：**不要**给 anon。
-- 平台给匿名请求的 auth.uid() 返回字面量 'anon'，一旦 anon 能写，
-- 所有未登录访客就会共用 owner_id='anon' 这一行（实测踩过）。
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_state TO authenticated;

CREATE POLICY user_state_read_own ON user_state
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY user_state_insert_own ON user_state
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY user_state_update_own ON user_state
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY user_state_delete_own ON user_state
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- 客户端**不发送** owner_id：它由 DEFAULT auth.uid() 填入，WITH CHECK 再把伪造的挡掉。
-- 写入用 upsert（owner_id 是主键 → 冲突即更新），因此不需要知道自己的 owner_id。


-- ----------------------------------------------------------------------------
-- 4. 函数 —— 全部 SECURITY DEFINER（跨用户读写字典表，必须绕过调用者的 RLS）
-- ----------------------------------------------------------------------------
-- 统一的 `SET search_path = public, pg_temp`：SECURITY DEFINER 函数必须钉死
-- search_path，否则恶意调用者可以抢先建同名对象来劫持函数体里的引用。

-- 4.1 用户名是否可用（匿名可调：注册第一步的即时反馈）
--     p_username_bad → false：把格式校验也放在这里，前端放行后端也必须拦
CREATE OR REPLACE FUNCTION fn_username_available(p_username text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT p_username IS NOT NULL
     AND btrim(p_username) ~ '^[A-Za-z0-9_\u4e00-\u9fa5]{2,20}$'
     AND NOT EXISTS (SELECT 1 FROM accounts a WHERE lower(a.username) = lower(btrim(p_username)))
$$;

-- 4.2 登记用户名（仅登录用户）
--     返回值：ok | username_taken | invalid_username | invalid_password | invalid_email
--             | not_signed_in | already_registered
--     一次事务里同时写 accounts 与 account_secrets，避免「有用户名没闸门」的半成品
CREATE OR REPLACE FUNCTION fn_register_account(p_username text, p_email text, p_password text)
RETURNS text
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid  text := auth.uid();
  v_name text := btrim(coalesce(p_username, ''));
  v_mail text := lower(btrim(coalesce(p_email, '')));
BEGIN
  IF v_uid IS NULL THEN RETURN 'not_signed_in'; END IF;
  IF v_name !~ '^[A-Za-z0-9_\u4e00-\u9fa5]{2,20}$' THEN RETURN 'invalid_username'; END IF;
  IF p_password IS NULL OR length(p_password) < 6 OR length(p_password) > 72 THEN RETURN 'invalid_password'; END IF;
  IF v_mail = '' THEN RETURN 'invalid_email'; END IF;
  IF EXISTS (SELECT 1 FROM accounts a WHERE a.owner_id = v_uid) THEN RETURN 'already_registered'; END IF;
  IF EXISTS (SELECT 1 FROM accounts a WHERE lower(a.username) = lower(v_name)) THEN RETURN 'username_taken'; END IF;
  INSERT INTO accounts (username, owner_id) VALUES (v_name, v_uid);
  INSERT INTO account_secrets (username, email, pass_hash)
    VALUES (v_name, v_mail, crypt(p_password, gen_salt('bf', 10)));
  RETURN 'ok';
EXCEPTION
  WHEN unique_violation THEN RETURN 'username_taken';
END $$;

-- 4.3 用户名 + 口令 → 邮箱（匿名可调，口令闸门）
--     口令不对返回 NULL：调用方无法区分「用户名不存在」与「口令错」，防枚举
CREATE OR REPLACE FUNCTION fn_login_email(p_username text, p_password text)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT s.email
  FROM account_secrets s
  WHERE lower(s.username) = lower(btrim(coalesce(p_username, '')))
    AND p_password IS NOT NULL
    AND s.pass_hash = crypt(p_password, s.pass_hash)
$$;

-- 4.4 同步口令闸门（仅登录用户）
--     忘记密码 / 改密之后必须调一次，否则用户名登录会被旧闸门挡掉
CREATE OR REPLACE FUNCTION fn_sync_password_hash(p_password text)
RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid text := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;
  IF p_password IS NULL OR length(p_password) < 6 OR length(p_password) > 72 THEN RETURN false; END IF;
  UPDATE account_secrets s
     SET pass_hash = crypt(p_password, gen_salt('bf', 10)), updated_at = now()
   WHERE s.username IN (SELECT a.username FROM accounts a WHERE a.owner_id = v_uid);
  RETURN FOUND;
END $$;

-- 4.5 读当前账号的用户名（仅登录用户）
CREATE OR REPLACE FUNCTION fn_get_username()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT a.username FROM accounts a WHERE a.owner_id = auth.uid()
$$;


-- ----------------------------------------------------------------------------
-- 5. 函数执行权限
-- ----------------------------------------------------------------------------
-- 平台默认把新函数的 EXECUTE 授予 anon / authenticated，所以除了
-- `REVOKE ... FROM PUBLIC` 之外，还要**单独撤掉 anon**，否则后者原封不动留着。
REVOKE EXECUTE ON FUNCTION fn_username_available(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION fn_username_available(text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION fn_login_email(text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION fn_login_email(text, text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION fn_register_account(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION fn_register_account(text, text, text) FROM anon;
GRANT  EXECUTE ON FUNCTION fn_register_account(text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION fn_sync_password_hash(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION fn_sync_password_hash(text) FROM anon;
GRANT  EXECUTE ON FUNCTION fn_sync_password_hash(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION fn_get_username() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION fn_get_username() FROM anon;
GRANT  EXECUTE ON FUNCTION fn_get_username() TO authenticated;


-- ----------------------------------------------------------------------------
-- 6. 自检
-- ----------------------------------------------------------------------------
-- node scripts/e2e-cloud.mjs
--   → 匿名可调的两个函数返回正确值；accounts / account_secrets / user_state
--     对匿名一律 DATABASE_42501
