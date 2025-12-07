import React from 'react';
import { 
  Grid, 
  Card, 
  Button, 
  NavBar,
  Avatar,
  NoticeBar
} from 'antd-mobile';
import { 
  AppOutline, 
  UserOutline, 
  MessageOutline, 
  LinkOutline,
  TrophyOutline,
  CameraOutline
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';

const ModernCategoryPage: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'red-culture',
      title: '红色文化',
      description: '革命历史与红色景点',
      icon: <AppOutline />,
      color: '#ef4444',
      path: '/red-culture'
    },
    {
      id: 'nature-spots',
      title: '自然景观',
      description: '山水风光与自然美景',
      icon: <TrophyOutline />,
      color: '#10b981',
      path: '/nature-spots'
    },
    {
      id: 'figures',
      title: '东里人物',
      description: '村史名人与杰出乡贤',
      icon: <UserOutline />,
      color: '#3b82f6',
      path: '/figures'
    },
    {
      id: 'media',
      title: '自媒体',
      description: '村务公告与动态',
      icon: <CameraOutline />,
      color: '#8b5cf6',
      path: '/announcements'
    },
    {
      id: 'checkin',
      title: '活动打卡',
      description: '签到活动与纪念',
      icon: <LinkOutline />,
      color: '#f59e0b',
      path: '/checkin'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #ecfdf5 0%, #fff 50%, #f0fdfa 100%)'
    }}>
      {/* 导航栏 */}
      <NavBar
        backArrow={false}
        right={
          <Button 
            fill="none" 
            onClick={() => navigate('/modern-chat')}
          >
            💬
          </Button>
        }
        style={{ 
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        东里村导览
      </NavBar>

      {/* 公告栏 */}
      <div style={{ padding: '12px 16px' }}>
        <NoticeBar 
          content="欢迎来到东里村！探索红色文化，感受自然之美"
          style={{ borderRadius: '12px' }}
        />
      </div>

      {/* 分类网格 */}
      <div style={{ padding: '16px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          分类浏览
        </h2>
        
        <Grid 
          columns={2} 
          gap={12}
        >
          {categories.map((category) => (
            <Grid.Item key={category.id}>
              <Card
                style={{ 
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  height: '140px'
                }}
                onClick={() => navigate(category.path)}
                className="cute-bounce"
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  padding: '16px'
                }}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '16px',
                    background: `${category.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{ 
                      fontSize: '28px', 
                      color: category.color 
                    }}>
                      {category.icon}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      {category.title}
                    </h3>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {category.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* AI助手快捷入口 */}
      <div style={{ padding: '0 16px 24px' }}>
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <div style={{ padding: '20px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: '0 0 8px 0',
              color: 'white'
            }}>
              🤖 村官小助理
            </h3>
            <p style={{ 
              fontSize: '14px', 
              margin: '0 0 16px 0',
              color: 'rgba(255,255,255,0.9)'
            }}>
              有问题？随时问我！
            </p>
            <Button
              fill="solid"
              color="primary"
              onClick={() => navigate('/modern-chat')}
              style={{ 
                background: 'white',
                color: '#667eea',
                borderRadius: '24px',
                fontWeight: '500'
              }}
            >
              立即咨询
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ModernCategoryPage;