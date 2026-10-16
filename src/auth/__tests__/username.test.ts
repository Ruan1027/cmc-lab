import { describe, it, expect } from 'vitest';
import {
  PASSWORD_MAX,
  USERNAME_RE,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../username';

/**
 * 用户名校验是前后端**共享规则**：数据库侧 `fn_register_account` 用的是同一个正则。
 * 这里锁死形状，避免哪天只改了一边导致「前端放行、后端 42501」。
 */
describe('用户名规则', () => {
  it('接受中文 / 字母 / 数字 / 下划线，2–20 位', () => {
    expect(validateUsername('小明')).toBeNull();
    expect(validateUsername('alice_01')).toBeNull();
    expect(validateUsername('A'.repeat(20))).toBeNull();
    expect(USERNAME_RE.test('a'.repeat(20))).toBe(true);
  });

  it('拒绝太短 / 太长 / 含空格或符号', () => {
    expect(validateUsername('a')).toMatch(/用户名/);
    expect(validateUsername('a'.repeat(21))).toMatch(/用户名/);
    expect(validateUsername('a b')).toMatch(/用户名/);
    expect(validateUsername('小-明')).toMatch(/用户名/);
    expect(validateUsername('  ')).toBe('请输入用户名');
  });

  it('前后空格先 trim 再判定（与后端 btrim 一致）', () => {
    expect(validateUsername('  小明  ')).toBeNull();
  });
});

describe('密码规则', () => {
  it('6–72 位', () => {
    expect(validatePassword('12345')).toMatch(/至少/);
    expect(validatePassword('123456')).toBeNull();
    expect(validatePassword('x'.repeat(PASSWORD_MAX))).toBeNull();
    expect(validatePassword('x'.repeat(PASSWORD_MAX + 1))).toMatch(/最多/);
    expect(validatePassword('')).toBe('请输入密码');
  });
});

describe('邮箱形状', () => {
  it('只做形状预检', () => {
    expect(validateEmail('a@b.com')).toBeNull();
    expect(validateEmail('alice@qq.com')).toBeNull();
    expect(validateEmail('a@b')).toMatch(/邮箱/);
    expect(validateEmail('noat')).toMatch(/邮箱/);
    expect(validateEmail('')).toBe('请输入邮箱');
  });
});
