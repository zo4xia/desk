/**
 * 红色文旅列表页
 * 上：地图（红色景点标记）
 * 下：景点列表（点击跳转详情）
 */

import { NavBar, List } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { SPOTS_DATA } from '../services/staticData';
import './global.css';

const RedCultureListPage = () => {
  const navigate = useNavigate();
  
  // 过滤红色景点
  const redSpots = SPOTS_DATA.filter(s => s.category === 'red');

  const handleBack = () => {
    navigate('/category');
  };

  const handleSpotClick = (spotId: string) => {
    navigate(`/spotdetail/${spotId}`);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fef2f2',
      }}
    >
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={handleBack}
        style={{
          '--height': '50px',
          backgroundColor: '#dc2626',
          color: 'white',
          '--border-bottom': 'none',
        } as any}
      >
        <span style={{ color: 'white', fontWeight: 600 }}>🔴 红色文旅</span>
      </NavBar>

      {/* 地图区域（1/3屏） */}
      <MapView
        spots={redSpots}
        heightRatio={0.333}
        center={[118.205, 25.235]}
        zoom={17}
        onSelectSpot={(spot) => handleSpotClick(spot.id)}
      />

      {/* 列表标题 */}
      <div
        style={{
          padding: '12px 16px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#991b1b',
          backgroundColor: '#fef2f2',
          borderBottom: '1px solid #fecaca',
        }}
      >
        📍 景点列表（{redSpots.length}个）
      </div>

      {/* 景点列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List>
          {redSpots.map(spot => (
            <List.Item
              key={spot.id}
              onClick={() => handleSpotClick(spot.id)}
              arrow={<RightOutline />}
              style={{
                '--padding-left': '16px',
                '--padding-right': '16px',
              } as any}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* 红色圆点 */}
                <div
                  style={{
                    width: 'clamp(28px, 8vw, 36px)',
                    height: 'clamp(28px, 8vw, 36px)',
                    background: '#dc2626',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 'clamp(10px, 3vw, 14px)',
                    flexShrink: 0,
                  }}
                >
                  {spot.name.substring(0, 1)}
                </div>
                {/* 景点信息 */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '2px' }}>
                    {spot.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {spot.intro_short}
                  </div>
                  {/* 标签 */}
                  {spot.tags && spot.tags.length > 0 && (
                    <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {spot.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            borderRadius: '10px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </List.Item>
          ))}
        </List>
        
        {/* 底部提示 */}
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px',
          }}
        >
          点击景点查看详情，或在地图上点击标记导航
        </div>
      </div>
    </div>
  );
};

export default RedCultureListPage;
