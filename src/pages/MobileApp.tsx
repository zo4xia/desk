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
import HomePage from './HomePage';
import CategoryPage from './CategoryPage';
import ChatPage from './ChatPage';
import SpotListPage from './SpotListPage';
import SpotDetailPage from './SpotDetailPage';
import UserProfilePage from './UserProfilePage';
import FiguresCategoryPage from './FiguresCategoryPage';
import AnnouncementPage from './AnnouncementPage';
import CheckInPage from './CheckInPage';
import RedCultureListPage from './RedCultureListPage';
import NatureSpotsListPage from './NatureSpotsListPage';

const MobileApp = () => {
  return (
    <Router>
      <ADMConfigProvider>
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
            {/* 入口流程 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            
            {/* 核心导航 */}
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/chat" element={<ChatPage />} />
            
            {/* 景点相关 */}
            <Route path="/red-culture" element={<RedCultureListPage />} />
            <Route path="/nature-spots" element={<NatureSpotsListPage />} />
            <Route path="/spotlist/:type" element={<SpotListPage />} />
            <Route path="/spotdetail/:id" element={<SpotDetailPage />} />
            <Route path="/checkin/:spotId" element={<CheckInPage />} />
            
            {/* 人物分类 */}
            <Route path="/figures" element={<FiguresCategoryPage />} />
            <Route path="/figures/students" element={<SpotListPage />} />
            
            {/* 公告动态 */}
            <Route path="/announcements" element={<AnnouncementPage />} />
            
            {/* 个人中心 */}
            <Route path="/profile" element={<UserProfilePage />} />
            
            {/* 默认跳转 */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </ConfigProvider>
      </ADMConfigProvider>
    </Router>
  );
};

export default MobileApp;
