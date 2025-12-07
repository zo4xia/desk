import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/pages/App';
import MobileApp from './src/pages/MobileApp';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// 根据 URL 路径选择应用（移动端或管理后台）
const isMobileApp =
  window.location.pathname.startsWith('/mobile') ||
  window.location.pathname === '/login' ||
  window.location.pathname === '/category' ||
  window.location.pathname === '/chat' ||
  window.location.pathname.startsWith('/spotlist') ||
  window.location.pathname.startsWith('/spotdetail') ||
  window.location.pathname === '/profile';

const AppComponent = isMobileApp ? MobileApp : App;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>
);
