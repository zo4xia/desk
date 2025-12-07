/**
 * 自然景点列表页
 * 上：地图（自然景点标记）
 * 下：景点列表（点击跳转详情）
 */

import { NavBar, List } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { SPOTS_DATA } from '../services/staticData';
import './global.css';

const NatureSpotsListPage = () => {
  const navigate = useNavigate();
  
  // 过滤自然景点（包含nature和culture）
  const natureSpots = SPOTS_DATA.filter(s => s.category === 'nature' || s.category === 'culture');

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
        backgroundColor: '#f0fdf4',
      }}
    >
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={handleBack}
        style={{
          '--height': '50px',
          backgroundColor: '#16a34a',
          color: 'white',
          '--border-bottom': 'none',
        } as any}
      >
        <span style={{ color: 'white', fontWeight: 600 }}>🌿 自然景点</span>
      </NavBar>

      {/* 地图区域（1/3屏） */}
      <MapView
        spots={natureSpots}
        heightRatio={0.333}
        center={[118.204, 25.236]}
        zoom={16.5}
        onSelectSpot={(spot) => handleSpotClick(spot.id)}
      />

      {/* 列表标题 */}
      <div
        style={{
          padding: '12px 16px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#166534',
          backgroundColor: '#f0fdf4',
          borderBottom: '1px solid #bbf7d0',
        }}
      >
        📍 景点列表（{natureSpots.length}个）
      </div>

      {/* 景点列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List>
          {natureSpots.map(spot => (
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
                {/* 绿色圆点 */}
                <div
                  style={{
                    width: 'clamp(28px, 8vw, 36px)',
                    height: 'clamp(28px, 8vw, 36px)',
                    background: spot.category === 'nature' ? '#16a34a' : '#ca8a04',
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
                            background: spot.category === 'nature' ? '#dcfce7' : '#fef9c3',
                            color: spot.category === 'nature' ? '#15803d' : '#a16207',
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

export default NatureSpotsListPage;
