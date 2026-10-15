-- 用户云同步数据表：每个登录用户一行，存「学习数据 + 用户导入题」的 JSON 快照
-- 由 src/storage/remote.ts 的 SyncedPayload 决定字段；updated_at 供 LWW 判新旧

create table if not exists public.user_state (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  payload        jsonb not null default '{}'::jsonb,
  updated_at     timestamptz not null default now(),
  schema_version int not null default 1
);

-- 行级权限（RLS）：用户只能读写自己的那一行，后端无法越权
alter table public.user_state enable row level security;

drop policy if exists "user_state_select" on public.user_state;
drop policy if exists "user_state_insert" on public.user_state;
drop policy if exists "user_state_update" on public.user_state;
drop policy if exists "user_state_delete" on public.user_state;

create policy "user_state_select" on public.user_state
  for select using (auth.uid() = user_id);

create policy "user_state_insert" on public.user_state
  for insert with check (auth.uid() = user_id);

create policy "user_state_update" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_state_delete" on public.user_state
  for delete using (auth.uid() = user_id);
