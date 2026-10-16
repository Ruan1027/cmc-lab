import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * 鉴权流转的单测：用假客户端把「先发码、再验码、验码时不重发」这条契约钉死。
 * 这是本模块最容易写错的地方 —— 在验码处理器里再调一次发码接口，
 * 会让用户每输错一次验证码就收到一封新邮件，而且旧 challenge 直接作废。
 */

const sdkState = vi.hoisted(() => ({ cloud: null as unknown }));
vi.mock('../../cloud/sdk', () => ({ getCloud: () => sdkState.cloud }));

interface FakePlan {
  usernameAvailable?: boolean;
  registerResult?: string;
  loginEmail?: string | null;
  currentUsername?: string | null;
  sendOtp?: { verificationId: string; isExistingUser: boolean };
  sendOtpError?: unknown;
  verifyOtp?: { data: unknown; error: unknown };
  signInPassword?: { data: unknown; error: unknown };
}

function makeSession(email = 'a@b.com', id = 'uid-1') {
  return {
    accessToken: 'at',
    refreshToken: 'rt',
    expiresAt: Date.now() + 3_600_000,
    user: { id, email, isAnonymous: false },
  };
}

function makeFake(plan: FakePlan = {}) {
  const calls: Array<{ name: string; args: unknown[] }> = [];
  const rec = (name: string, ...args: unknown[]) => {
    calls.push({ name, args });
  };

  const cloud = {
    auth: {
      async sendOtp(c: unknown) {
        rec('sendOtp', c);
        if (plan.sendOtpError) return { data: null, error: plan.sendOtpError };
        return {
          data: plan.sendOtp ?? { verificationId: 'vid-1', isExistingUser: false },
          error: null,
        };
      },
      async verifyOtp(p: unknown) {
        rec('verifyOtp', p);
        return plan.verifyOtp ?? { data: makeSession(), error: null };
      },
      async signInWithPassword(c: unknown) {
        rec('signInWithPassword', c);
        return plan.signInPassword ?? { data: makeSession(), error: null };
      },
      async getSession() {
        rec('getSession');
        return { data: null, error: null };
      },
      async signOut() {
        rec('signOut');
        return { data: null, error: null };
      },
      async resetPasswordForEmail(email: string) {
        rec('resetPasswordForEmail', email);
        return { data: { updateUser: async () => ({ data: makeSession(), error: null }) }, error: null };
      },
    },
    database: {
      async rpc(fn: string, args?: unknown) {
        rec(`rpc:${fn}`, args);
        switch (fn) {
          case 'fn_username_available':
            return { data: plan.usernameAvailable ?? true, error: null };
          case 'fn_register_account':
            return { data: plan.registerResult ?? 'ok', error: null };
          case 'fn_login_email':
            return { data: plan.loginEmail ?? null, error: null };
          case 'fn_get_username':
            return { data: plan.currentUsername ?? null, error: null };
          default:
            return { data: null, error: null };
        }
      },
    },
  };

  return {
    cloud,
    names: () => calls.map((c) => c.name),
    call: (name: string) => calls.find((c) => c.name === name),
  };
}

type Store = typeof import('../useAuthStore')['useAuthStore'];
let store: Store;

/** 每个用例都重新加载模块：发码 challenge 存在闭包里，不能跨用例泄漏 */
async function loadStore(plan: FakePlan) {
  const fake = makeFake(plan);
  sdkState.cloud = fake.cloud;
  vi.resetModules();
  const mod = await import('../useAuthStore');
  store = mod.useAuthStore;
  return fake;
}

beforeEach(() => {
  vi.resetModules();
  sdkState.cloud = null;
});

describe('注册：先发码，验码时不重发', () => {
  it('发码前先查用户名，可用才发', async () => {
    const fake = await loadStore({});
    await store.getState().sendRegisterCode('小明', 'a@b.com');
    expect(fake.names()).toEqual(['rpc:fn_username_available', 'sendOtp']);
    expect(fake.call('rpc:fn_username_available')?.args[0]).toEqual({ p_username: '小明' });
    expect(fake.call('sendOtp')?.args[0]).toEqual({ email: 'a@b.com' });
  });

  it('用户名已存在 → 提示「该用户名已存在，请重新设置」，且不发验证码', async () => {
    const fake = await loadStore({ usernameAvailable: false });
    await expect(store.getState().sendRegisterCode('小明', 'a@b.com')).rejects.toThrow(
      '该用户名已存在，请重新设置',
    );
    expect(fake.names()).not.toContain('sendOtp');
  });

  it('验码时带上发码返回的 verificationId 与 isExistingUser，且不再调发码接口', async () => {
    const fake = await loadStore({ currentUsername: '小明' });
    await store.getState().sendRegisterCode('小明', 'a@b.com');
    await store.getState().completeRegister('小明', 'pw123456', '654321');

    const verify = fake.call('verifyOtp')?.args[0] as Record<string, unknown>;
    expect(verify).toMatchObject({
      email: 'a@b.com',
      verificationId: 'vid-1',
      isExistingUser: false,
      token: '654321',
      password: 'pw123456',
    });
    // 只有一次发码
    expect(fake.names().filter((n) => n === 'sendOtp')).toHaveLength(1);
    expect(store.getState().username).toBe('小明');
  });

  it('邮箱已注册（isExistingUser=true）→ 不验码、不建号，引导去登录', async () => {
    const fake = await loadStore({ sendOtp: { verificationId: 'vid-2', isExistingUser: true } });
    await store.getState().sendRegisterCode('小明', 'a@b.com');
    await expect(store.getState().completeRegister('小明', 'pw123456', '654321')).rejects.toThrow(
      /已可直接登录/,
    );
    expect(fake.names()).not.toContain('verifyOtp');
  });

  it('没发码就提交 → 提示先获取验证码，且不发任何请求', async () => {
    const fake = await loadStore({});
    await expect(store.getState().completeRegister('小明', 'pw123456', '654321')).rejects.toThrow(
      '请先获取验证码',
    );
    expect(fake.names()).toEqual([]);
  });

  it('建号成功后用户名登记失败 → 仍然保持登录（降级为补设用户名）', async () => {
    await loadStore({ registerResult: 'username_taken' });
    await store.getState().sendRegisterCode('小明', 'a@b.com');
    await expect(store.getState().completeRegister('小明', 'pw123456', '654321')).rejects.toThrow(
      '该用户名已存在，请重新设置',
    );
    // 账号已建（会话已建立），只是还没用户名
    expect(store.getState().user?.id).toBe('uid-1');
    expect(store.getState().username).toBeNull();
  });

  it('发码失败（离线）→ 不进入验码环节，给可读提示', async () => {
    await loadStore({ sendOtpError: { kind: 'network', message: 'fetch failed', status: 0 } });
    await expect(store.getState().sendRegisterCode('小明', 'a@b.com')).rejects.toThrow(
      '网络连接失败，请检查网络后重试',
    );
  });
});

describe('登录：用户名 / 邮箱 + 密码', () => {
  it('输邮箱 → 直接走平台密码登录，不查用户名表', async () => {
    const fake = await loadStore({ currentUsername: 'alice' });
    await store.getState().signIn('a@b.com', 'pw123456');
    expect(fake.names()).toEqual(['signInWithPassword', 'rpc:fn_get_username']);
    expect(fake.call('signInWithPassword')?.args[0]).toEqual({
      email: 'a@b.com',
      password: 'pw123456',
    });
    expect(store.getState().username).toBe('alice');
  });

  it('输用户名 → 先用口令换回邮箱，再用邮箱+密码登录', async () => {
    const fake = await loadStore({ loginEmail: 'alice@b.com', currentUsername: 'alice' });
    await store.getState().signIn('alice', 'pw123456');
    expect(fake.names()).toEqual([
      'rpc:fn_login_email',
      'signInWithPassword',
      'rpc:fn_get_username',
    ]);
    expect(fake.call('rpc:fn_login_email')?.args[0]).toEqual({
      p_username: 'alice',
      p_password: 'pw123456',
    });
    expect(fake.call('signInWithPassword')?.args[0]).toEqual({
      email: 'alice@b.com',
      password: 'pw123456',
    });
  });

  it('用户名或口令不对 → 统一提示「用户名或密码错误」，不发登录请求', async () => {
    const fake = await loadStore({ loginEmail: null });
    await expect(store.getState().signIn('alice', 'wrongpw')).rejects.toThrow('用户名或密码错误');
    expect(fake.names()).not.toContain('signInWithPassword');
  });

  it('平台密码错 → 不暴露账号是否存在', async () => {
    await loadStore({
      signInPassword: {
        data: null,
        error: { kind: 'unauthenticated', message: 'invalid_grant', status: 401 },
      },
    });
    await expect(store.getState().signIn('a@b.com', 'wrongpw')).rejects.toThrow('账号或密码错误');
  });
});

describe('忘记密码', () => {
  it('重置成功后同步用户名登录用的口令闸门', async () => {
    const fake = await loadStore({ currentUsername: 'alice' });
    await store.getState().sendResetCode('a@b.com');
    await store.getState().completeReset('a@b.com', '123456', 'newpw123');
    expect(fake.names()).toContain('rpc:fn_sync_password_hash');
    expect(store.getState().username).toBe('alice');
  });
});

describe('登录态恢复', () => {
  it('未接入云服务时 init 直接 ready，不报错', async () => {
    vi.resetModules();
    sdkState.cloud = null;
    const mod = await import('../useAuthStore');
    await mod.useAuthStore.getState().init();
    expect(mod.useAuthStore.getState().ready).toBe(true);
    expect(mod.useAuthStore.getState().user).toBeNull();
  });

  it('登出清空身份与同步状态', async () => {
    await loadStore({ currentUsername: 'alice' });
    await store.getState().signIn('a@b.com', 'pw123456');
    await store.getState().signOut();
    expect(store.getState().user).toBeNull();
    expect(store.getState().username).toBeNull();
    expect(store.getState().syncStatus).toBe('idle');
  });
});
