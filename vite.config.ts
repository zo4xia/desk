import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    root: '.',
    build: {
      outDir: 'dist',
      // 智能代码分割配置
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          // 手动代码分割策略
          manualChunks: {
            // React 核心库
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // Ant Design 组件库
            'vendor-antd': ['antd', 'antd-mobile', '@ant-design/icons'],
            // 地图库
            'vendor-map': ['leaflet'],
            // Agent 系统核心
            'agent-core': [
              './src/services/agentSystem.ts',
              './src/services/simpleAgentSystem.ts',
              './src/services/businessAgentImplementation.ts',
            ],
            // 移动端页面
            'pages-mobile': [
              './src/pages/LoginPage.tsx',
              './src/pages/ChatPage.tsx',
              './src/pages/CategoryPage.tsx',
              './src/pages/SpotListPage.tsx',
              './src/pages/SpotDetailPage.tsx',
            ],
            // 管理后台
            'pages-admin': [
              './src/components/AdminPanelRefactored.tsx',
              './src/components/AgentManager.tsx',
            ],
          },
          // 文件命名策略
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    define: {
      'process.env': {
        GEMINI_API_KEY: JSON.stringify(env.GEMINI_API_KEY || ''),
        MINIMAX_API_KEY: JSON.stringify(
          env.MINIMAX_API_KEY ||
            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJscyBsbGx5eXlzc3MiLCJVc2VyTmFtZSI6ImxzIGxsbHl5eXNzcyIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTE4Nzk2Mjk4NDAwNTY3NDkyIiwiUGhvbmUiOiIiLCJHcm91cElEIjoiMTkxODc5NjI5ODM5NjM3MzE4OCIsIlBhZ2VOYW1lIjoiIiwiTWFpbCI6ImxsbC55eXkuc3NzLjc3QGdtYWlsLmNvbSIsIkNyZWF0ZVRpbWUiOiIyMDI1LTExLTIwIDE1OjUxOjQwIiwiVG9rZW5UeXBlIjoxLCJpc3MiOiJtaW5pbWF4In0.Nvc6I_x53hQk_OSankcxU1uyb2Cek9-EhZoNO44mS1wsyiR2TNiof8FA9JmELCEBjnkomCCho1cxseEb098hAebTNklqRL5PlVl4rxaj4spAZt-1oloxojSSU3g-NoiurR-4dPcSMp43KOp0mc3Ci_piLylbxOG9H2WT3iN4Eaaj_558q7DgsbmpwLmpf3vOiy_j_qBEF5QztVN4gF8xhPasjXWAmT_hox7fmjTubn4PcQMbaAHKVBj95uP8l4VwbrjRpLaajyMIKHGoTS_0JAhmBH2psw49I2CouBNLggZGsOQS9XLepjX7euCtrMPJC7V0kPsUGJuxddLnYLrzJw'
        ),
        MINIMAX_GROUP_ID: JSON.stringify(
          env.MINIMAX_GROUP_ID || '1918796298396373188'
        ),
        SILICON_FLOW_API_KEY: JSON.stringify(
          env.SILICON_FLOW_API_KEY ||
            'sk-cjqstblrzdcgwpayffghxnzletgcckesnysskzdfnwdhiutg'
        ),
        ZHIPU_API_KEY: JSON.stringify(
          env.ZHIPU_API_KEY ||
            'a049afdafb1b41a0862cdc1d73d5d6eb.YuGYXVGRQEUILpog'
        ),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
  };
});
