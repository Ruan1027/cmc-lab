import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor 配置
 *
 * webDir 指向 Vite 的构建产物：同一份 dist 同时服务 Web 与原生 App，
 * 这是本项目「一套代码多端」的落点。
 */
const config: CapacitorConfig = {
  appId: 'io.cmclab.app',
  appName: 'CMC Lab',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#ffffffff',
      showSpinner: false,
    },
  },
};

export default config;
