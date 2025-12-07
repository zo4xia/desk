import { useState } from 'react';
import {
  NavBar,
  Card,
  List,
  Badge,
  Empty,
  Button,
  Modal,
  Avatar,
} from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import './global.css';

interface CheckInRecord {
  id: string;
  spotName: string;
  date: string;
  location: string;
}

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [checkInRecords] = useState<CheckInRecord[]>([
    {
      id: '1',
      spotName: '旌义状石碑',
      date: '2025-01-15',
      location: '东里村侨光亭旁',
    },
    {
      id: '2',
      spotName: '辛亥革命纪念馆',
      date: '2025-01-10',
      location: '东里村郑氏宗祠',
    },
    { id: '3', spotName: '侨光亭', date: '2025-01-05', location: '东里村中心' },
  ]);

  const userInfo = {
    name: '游客12345',
    phone: '138****1234',
    uid: 'UID-20250115-001',
    checkInCount: checkInRecords.length,
    avatar: '👤',
  };

  const handleLogout = () => {
    Modal.confirm({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: () => {
        console.log('用户已退出登录');
        navigate('/login');
      },
    });
  };

  const handleEditInfo = () => {
    Modal.alert({
      title: '修改信息',
      content: '修改用户信息功能开发中...',
      closeOnMaskClick: true,
    });
  };

  const handleBack = () => {
    navigate('/category');
  };

  return (
    <div
      className="user-profile-page"
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
        right={
          <div
            onClick={handleLogout}
            style={{
              cursor: 'pointer',
              color: '#f5222d',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            退出登录
          </div>
        }
        style={
          {
            '--height': '50px',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e8e8e8',
          } as any
        }
      >
        个人中心
      </NavBar>

      {/* 内容区域（可滚动） */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {/* 用户信息卡 */}
        <Card
          className="clay-card"
          style={{ marginBottom: '20px', backgroundColor: '#e3f2fd' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div
                style={{
                  width: 'clamp(45px, 15vw, 60px)',
                  height: 'clamp(45px, 15vw, 60px)',
                  borderRadius: '50%',
                  backgroundColor: '#1677ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}
              >
                {userInfo.avatar}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#2d3748',
                    marginBottom: '5px',
                  }}
                >
                  {userInfo.name}
                </div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  打卡总数：{userInfo.checkInCount}个
                </div>
              </div>
            </div>
            <Badge
              content={userInfo.checkInCount}
              style={{ '--badge-background-color': '#f5222d' } as any}
            />
          </div>

          {/* 修改信息按钮 */}
          <Button
            onClick={handleEditInfo}
            style={
              {
                height: 'clamp(30px, 8vw, 36px)',
                backgroundColor: '#1677ff',
                marginTop: '15px',
                fontSize: '14px',
              } as any
            }
            block
          >
            修改信息
          </Button>
        </Card>

        {/* 用户信息列表 */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#2d3748',
              marginBottom: '10px',
            }}
          >
            账户信息
          </div>
          <List>
            <List.Item title="手机号" description={userInfo.phone} />
            <List.Item title="UID" description={userInfo.uid} />
          </List>
        </div>

        {/* 打卡记录 */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#2d3748',
              marginBottom: '10px',
            }}
          >
            我的打卡记录
          </div>
          {checkInRecords.length > 0 ? (
            <List>
              {checkInRecords.map(record => (
                <List.Item
                  key={record.id}
                  title={record.spotName}
                  description={
                    <div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        📍 {record.location}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        📅 {record.date}
                      </div>
                    </div>
                  }
                />
              ))}
            </List>
          ) : (
            <Empty description="暂无打卡记录" style={{ marginTop: '20px' }} />
          )}
        </div>

        {/* 底部空间 */}
        <div style={{ height: 'clamp(15px, 4vw, 20px)' }} />
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

export default UserProfilePage;
