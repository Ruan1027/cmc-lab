import { defineConfig } from 'vitest/config';

/**
 * 独立 vitest 配置。
 *
 * 关键点是 cacheDir：默认情况下 vitest 把转换缓存写到系统临时目录，
 * 在受限环境（沙箱、部分 CI 容器）会出现 EPERM，导致部分测试文件被静默跳过
 * ——表现为「测试数忽多忽少」且仍然显示通过，属于会误导人的假绿。
 * 把缓存固定在项目内即可消除该不确定性。
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    cacheDir: 'node_modules/.vitest',
    reporters: ['default'],
    // 串行跑测试文件。并发 worker 在受限环境下会间歇性丢文件，
    // 本项目测试量很小（几十个用例），串行几乎不增加耗时，但结果确定。
    fileParallelism: false,
  },
});
