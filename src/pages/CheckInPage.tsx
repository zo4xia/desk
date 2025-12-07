import { useState, useEffect } from 'react';
import { NavBar, Card, Button, Tag, Toast, Dialog, Empty } from 'antd-mobile';
import { CheckCircleOutline, LocationOutline } from 'antd-mobile-icons';
import { useNavigate, useParams } from 'react-router-dom';
import './global.css';

/**
 * 活动打卡页 - 景点打卡功能
 */

interface CheckInSpot {
  id: string;
  name: string;
  type: string;
  address: string;
  checkedIn: boolean;
  checkedInTime?: string;
}

const CheckInPage = () => {
  const navigate = useNavigate();
  const { spotId } = useParams();
  const [spot, setSpot] = useState<CheckInSpot | null>(null);
  const [checking, setChecking] = useState(false);

  // 模拟景点数据
  const mockSpot: CheckInSpot = {
    id: spotId || '1',
    name: '东里村古樟树',
    type: '自然景观',
    address: '东里村村口广场东侧',
    checkedIn: false,
  };

  useEffect(() => {
    // 从本地存储读取打卡状态
    const checkedSpots = JSON.parse(
      localStorage.getItem('checkedSpots') || '{}'
    );
    setSpot({
      ...mockSpot,
      checkedIn: !!checkedSpots[mockSpot.id],
      checkedInTime: checkedSpots[mockSpot.id],
    });
  }, [spotId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCheckIn = async () => {
    if (!spot) return;

    const result = await Dialog.confirm({
      content: `确认在「${spot.name}」打卡吗？`,
      confirmText: '确认打卡',
      cancelText: '取消',
    });

    if (result) {
      setChecking(true);

      // 模拟定位检查
      await new Promise(resolve => setTimeout(resolve, 1500));

      const now = new Date().toLocaleString('zh-CN');

      // 保存到本地存储
      const checkedSpots = JSON.parse(
        localStorage.getItem('checkedSpots') || '{}'
      );
      checkedSpots[spot.id] = now;
      localStorage.setItem('checkedSpots', JSON.stringify(checkedSpots));

      setSpot({
        ...spot,
        checkedIn: true,
        checkedInTime: now,
      });

      setChecking(false);

      Toast.show({
        icon: 'success',
        content: '打卡成功！',
      });
    }
  };

  if (!spot) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Empty description="加载中..." />
      </div>
    );
  }

  return (
    <div
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
      {/* 顶部导航 */}
      <NavBar
        onBack={handleBack}
        style={
          {
            '--height': '50px',
            backgroundColor: '#fff3e0',
            borderBottom: '1px solid #e8e8e8',
          } as any
        }
      >
        景点打卡
      </NavBar>

      {/* 打卡内容 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 景点卡片 */}
        <Card
          style={{
            width: '100%',
            borderRadius: '24px',
            border: '1px solid #e8e8e8',
            boxShadow: '0 0 0 2px #fff inset',
            marginBottom: '24px',
          }}
        >
          {/* 景点图标 */}
          <div
            style={{
              width: 'clamp(60px, 20vw, 80px)',
              height: 'clamp(60px, 20vw, 80px)',
              borderRadius: '50%',
              backgroundColor: spot.checkedIn ? '#e8f5e9' : '#fff3e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 16px',
              border: `3px solid ${spot.checkedIn ? '#4caf50' : '#ff9800'}`,
            }}
          >
            {spot.checkedIn ? '✅' : '📍'}
          </div>

          {/* 景点名称 */}
          <div
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2d3748',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            {spot.name}
          </div>

          {/* 景点类型 */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <Tag color="primary" fill="outline">
              {spot.type}
            </Tag>
          </div>

          {/* 地址 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              color: '#718096',
              marginBottom: '16px',
            }}
          >
            <LocationOutline style={{ marginRight: '4px' }} />
            {spot.address}
          </div>

          {/* 打卡状态 */}
          {spot.checkedIn && (
            <div
              style={{
                backgroundColor: '#e8f5e9',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <CheckCircleOutline
                style={{ fontSize: '20px', color: '#4caf50', marginRight: '8px' }}
              />
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                已打卡
              </span>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                {spot.checkedInTime}
              </div>
            </div>
          )}
        </Card>

        {/* 打卡按钮 */}
        {!spot.checkedIn && (
          <Button
            block
            color="primary"
            size="large"
            loading={checking}
            className="cute-bounce"
            onClick={handleCheckIn}
            style={{
              width: '100%',
              height: 'clamp(45px, 12vw, 56px)',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {checking ? '定位中...' : '📍 立即打卡'}
          </Button>
        )}

        {/* 已打卡提示 */}
        {spot.checkedIn && (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: '#718096',
            }}
          >
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>
              🎉 恭喜完成打卡！
            </p>
            <p style={{ fontSize: '12px' }}>继续探索东里村的其他景点吧</p>
          </div>
        )}

        {/* 打卡说明 */}
        <Card
          style={{
            width: '100%',
            borderRadius: '16px',
            marginTop: '20px',
            backgroundColor: '#fafafa',
          }}
        >
          <div style={{ fontSize: '13px', color: '#718096' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              📌 打卡说明
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.8' }}>
              <li>请确保您在景点附近</li>
              <li>每个景点每天可打卡一次</li>
              <li>打卡记录可在个人中心查看</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CheckInPage;
