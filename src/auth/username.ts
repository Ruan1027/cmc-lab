/**
 * 用户名校验规则 —— 前后端必须一致
 *
 * 前端这一份负责即时反馈；权威判定在数据库侧：
 *   - 格式：`fn_register_account` 里的同名正则
 *   - 唯一性：`accounts.username` 主键 + `lower(username)` 唯一索引（大小写不敏感）
 * 改了这里就要同步改 db/schema.sql 里的正则，否则会出现「前端放行、后端拒绝」。
 */

/** 2–20 位：中文 / 字母 / 数字 / 下划线 */
export const USERNAME_RE = /^[A-Za-z0-9_\u4e00-\u9fa5]{2,20}$/;

export const USERNAME_HINT = '2–20 位，可用中文、字母、数字、下划线';

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 72;

export function validateUsername(name: string): string | null {
  const v = name.trim();
  if (!v) return '请输入用户名';
  if (!USERNAME_RE.test(v)) return `用户名${USERNAME_HINT}`;
  return null;
}

export function validatePassword(pwd: string): string | null {
  if (!pwd) return '请输入密码';
  if (pwd.length < PASSWORD_MIN) return `密码至少 ${PASSWORD_MIN} 位`;
  if (pwd.length > PASSWORD_MAX) return `密码最多 ${PASSWORD_MAX} 位`;
  return null;
}

/** 邮箱只做形状预检，权威判定在服务商那一侧（不重复实现一套严格校验） */
export function validateEmail(email: string): string | null {
  const v = email.trim();
  if (!v) return '请输入邮箱';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return '请输入正确的邮箱地址';
  return null;
}
