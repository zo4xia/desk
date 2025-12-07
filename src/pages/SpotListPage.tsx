import { useState } from 'react';
import { NavBar, List, PullToRefresh, Empty, Badge } from 'antd-mobile';
import { RightOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import MapView from '../components/MapView';
import { SPOTS_DATA } from '../services/staticData';
import './global.css';

interface Spot {
  id: string;
  name: string;
  address: string;
  type: 'red-culture' | 'nature-spots' | 'people' | 'media' | 'activities';
  category?: string;
}

const SpotListPage = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [spots] = useState<Spot[]>([
    {
      id: '1',
      name: '旌义状石碑',
      address: '东里村侨光亭旁',
      type: 'red-culture' as const,
    },
    {
      id: '2',
      name: '辛亥革命纪念馆',
      address: '东里村郑氏宗祠',
      type: 'red-culture' as const,
    },
    {
      id: '3',
      name: '侨光亭',
      address: '东里村中心',
      type: 'red-culture' as const,
    },
    {
      id: '4',
      name: '东里山水景观',
      address: '东里村北部',
      type: 'nature-spots' as const,
    },
    {
      id: '5',
      name: '生态休闲区',
      address: '东里村南部',
      type: 'nature-spots' as const,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const getTitle = () => {
    const titles: Record<string, string> = {
      'red-culture': '红色文旅',
      'nature-spots': '自然景点',
      people: '东里人物',
      media: '自媒体视频号',
      activities: '活动公告',
    };
    return titles[type || ''] || '景点列表';
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
  };

  const handleSpotClick = (spotId: string) => {
    navigate(`/spotdetail/${spotId}`);
  };

  const handleBack = () => {
    navigate('/category');
  };

  return (
    <div
      className="spot-list-page"
      style={{
        width: '100vw',
        height: '100vh',
        margin: '0 auto',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={handleBack}
        style={
          {
            '--height': '50px',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e8e8e8',
          } as any
        }
      >
        {getTitle()}地图
      </NavBar>

      {/* 地图区域（占屏幕 1/3） */}
      <MapView
        spots={SPOTS_DATA}
        heightRatio={0.333}
        onSelectSpot={(spot) => navigate(`/spotdetail/${spot.id}`)}
      />

      {/* 列表标题 */}
      <div
        style={{
          padding: '15px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#2d3748',
        }}
      >
        景点列表
      </div>

      {/* 下拉刷新列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <PullToRefresh onRefresh={handleRefresh}>
        {spots.length > 0 ? (
          <List style={{ flex: 1, overflow: 'auto' }}>
            {spots.map(spot => (
              <List.Item
                key={spot.id}
                onClick={() => handleSpotClick(spot.id)}
                style={
                  {
                    padding: '12px 20px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  } as any
                }
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flex: 1,
                    }}
                  >
                    <Badge
                      content="景点"
                      style={{ '--badge-background-color': '#f5222d' } as any}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#2d3748',
                        }}
                      >
                        🚩 {spot.name}
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#718096',
                          marginTop: '4px',
                        }}
                      >
                        地址：{spot.address}
                      </div>
                    </div>
                  </div>
                  <RightOutlined
                    style={{ color: '#bdbdbd', fontSize: '16px' }}
                  />
                </div>
              </List.Item>
            ))}
          </List>
        ) : (
          <Empty description="暂无景点数据" style={{ marginTop: '50px' }} />
        )}
      </PullToRefresh>
      </div>

      {/* 全局 Agent 悬浮按钮 */}
      <div
        onClick={() => {
          console.log('Agent 对话框已打开');
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: 'clamp(40px, 10vw, 56px)',
          height: 'clamp(40px, 10vw, 56px)',
          borderRadius: '50%',
          backgroundColor: '#1677ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 100,
        }}
      >
        🧑‍💼
      </div>
    </div>
  );
};

export default SpotListPage;
