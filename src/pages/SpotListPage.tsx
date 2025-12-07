import { useState, useEffect } from 'react';
import { NavBar, List, PullToRefresh, Empty, Badge, Toast } from 'antd-mobile';
import { RightOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import MapView from '../components/MapView';
import { apiService } from '../services/apiService';
import './global.css';

interface Spot {
  id: string;
  name: string;
  address?: string;
  location?: string;
  type: 'red-culture' | 'nature-spots' | 'people' | 'media' | 'activities';
  category?: string;
  desc?: string;
}

const SpotListPage = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);

  // 根据类型获取数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (type === 'red-culture' || type === 'nature-spots') {
          // 获取景点数据
          response = await apiService.spots.getSpots({ 
            category: type,
            limit: 50 
          });
        } else if (type === 'people') {
          // 获取人物数据
          response = await apiService.figures.getFigures({ 
            category: 'sages', // 或其他相关类别
            limit: 50 
          });
        } else {
          // 默认获取景点数据
          response = await apiService.spots.getSpots({ limit: 50 });
        }

        if (response.success && response.data) {
          // 适配数据结构
          const adaptedSpots = response.data.map((item: any) => ({
            id: item.id,
            name: item.name || item.title,
            address: item.location || item.address,
            type: type as 'red-culture' | 'nature-spots' | 'people' | 'media' | 'activities',
            desc: item.desc || item.summary,
          }));
          setSpots(adaptedSpots);
        } else {
          Toast.show({
            content: response.error || '获取数据失败',
            duration: 2000,
            position: 'bottom',
          });
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        Toast.show({
          content: '网络错误，请稍后重试',
          duration: 2000,
          position: 'bottom',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

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
