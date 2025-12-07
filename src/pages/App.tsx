import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider as ADMConfigProvider } from 'antd-mobile';

// 导入移动端页面 - 路径已修正
import LoginPage from './LoginPage';
import CategoryPage from './CategoryPage';
import ChatPage from './ChatPage';
import SpotListPage from './SpotListPage';
import SpotDetailPage from './SpotDetailPage';
import UserProfilePage from './UserProfilePage';

// 导入管理后台组件 - 路径已修正
import AdminPanelRefactored from '../components/AdminPanelRefactored';
import AgentManager from '../components/AgentManager';

// 🏛️ 东里村智能导游系统 - 主应用组件
// 军工品质，精准高效，极简实用

const App: React.FC = () => {
  // 假设我们通过 URL 路径来区分是移动端应用还是管理后台
  // 移动端应用路径: /login, /category, /chat, /spotlist, /spotdetail, /profile
  // 管理后台路径: /admin, /agent

  // 默认跳转到登录页
  return (
    <Router>
      {/* Ant Design Mobile 配置，用于移动端页面 */}
      <ADMConfigProvider>
        {/* Ant Design PC 配置，用于管理后台 */}
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: '#1677ff',
              borderRadius: 8,
              fontSize: 14,
            },
          }}
        >
          <Routes>
            {/* 移动端页面路由 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/spotlist/:type" element={<SpotListPage />} />
            <Route path="/spotdetail/:id" element={<SpotDetailPage />} />
            <Route path="/profile" element={<UserProfilePage />} />

            {/* 管理后台/Agent演示路由 (保留原有逻辑，但通过路径区分) */}
            <Route path="/admin" element={<AdminPanelRefactored />} />
            <Route path="/agent" element={<AgentManager />} />

            {/* 默认路由：如果访问根路径，重定向到 /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 兼容原有逻辑，如果访问 /admin 或 /agent 以外的路径，重定向到 /login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ConfigProvider>
      </ADMConfigProvider>
    </Router>
  );
};

export default App;
