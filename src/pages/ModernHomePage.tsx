import React from 'react';
import { 
  Space, 
  Card, 
  Grid, 
  Button, 
  Divider,
  Avatar,
  NoticeBar
} from 'antd-mobile';
import { 
  MessageOutline, 
  MessageFill,
  AppOutline,
  UserOutline,
  InfoOutline,
  LinkOutline
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';

const ModernHomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'chat',
      title: '智能对话',
      description: '与村官小助理AI对话',
      icon: <MessageOutline />,
      color: '#10b981',
      path: '/modern-chat',
      new: true
    },
    {
      id: 'legacy-chat',
      title: '传统对话',
      description: '经典版聊天界面',
      icon: <MessageFill />,
      color: '#3b82f6',
      path: '/chat',
      new: false
    },
    {
      id: 'category',
      title: '内容浏览',
      description: '红色文化、自然景观等',
      icon: <AppOutline />,
      color: '#8b5cf6',
      path: '/category',
      new: false
    },
    {
      id: 'profile',
      title: '个人中心',
      description: '我的打卡记录',
      icon: <UserOutline />,
      color: '#ec4899',
      path: '/profile',
      new: false
    },
    {
      id: 'about',
      title: '关于我们',
      description: '东里村介绍',
      icon: <InfoOutline />,
      color: '#f59e0b',
      path: '/about',
      new: false
    },
    {
      id: 'admin',
      title: '管理后台',
      description: '内容管理',
      icon: <LinkOutline />,
      color: '#ef4444',
      path: '/admin',
      new: false
    }
  ];

  return (
    <div style={{ 
      height: '100vh', 
      background: 'linear-gradient(135deg, #ecfdf5 0%, #fff 50%, #f0fdfa 100%)',
      padding: '16px',
      overflowY: 'auto'
    }}>
      {/* 顶部公告栏 */}
      <NoticeBar 
        content="东里村智能导游系统 - AI伴您探索乡土文化"
        style={{ marginBottom: '16px' }}
      />
      
      {/* 头部信息 */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '32px',
        padding: '24px 16px'
      }}>
        <Avatar
          src="/src/assets/images/logo.png"
          style={{ 
            width: '80px', 
            height: '80px', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
            fontSize: '32px'
          }}
          alt="东里村"
        >
          🏘️
        </Avatar>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          margin: '8px 0'
        }}>
          东里村智能导游
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#6b7280',
          lineHeight: '1.5'
        }}>
          AI伴您 · 探索乡土文化
        </p>
      </div>

      {/* 功能网格 */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          功能导航
        </h2>
        <Grid 
          columns={2} 
          gap={12}
        >
          {features.map((feature, index) => (
            <Grid.Item key={feature.id}>
              <Card
                style={{ 
                  height: '120px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => navigate(feature.path)}
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
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%',
                    background: `${feature.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ 
                      fontSize: '24px', 
                      color: feature.color 
                    }}>
                      {feature.icon}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {feature.description}
                    </p>
                  </div>
                  {feature.new && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 'bold'
                    }}>
                      NEW
                    </div>
                  )}
                </div>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* 快捷操作 */}
      <div>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          快捷操作
        </h2>
        <Space 
          direction="vertical" 
          style={{ width: '100%' }}
          block
        >
          <Button
            fill="solid"
            color="primary"
            size="large"
            onClick={() => navigate('/modern-chat')}
            style={{ 
              borderRadius: '12px',
              height: '50px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            🚀 开始AI对话 (新)
          </Button>
          <Button
            fill="outline"
            color="primary"
            size="large"
            onClick={() => navigate('/chat')}
            style={{ 
              borderRadius: '12px',
              height: '50px',
              fontSize: '16px'
            }}
          >
            💬 经典聊天界面
          </Button>
        </Space>
      </div>

      {/* 底部信息 */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '32px',
        padding: '16px',
        color: '#9ca3af',
        fontSize: '12px'
      }}>
        <p>东里村智能导游系统 v2.0</p>
        <p>AI技术赋能乡村振兴</p>
      </div>
    </div>
  );
};

export default ModernHomePage;