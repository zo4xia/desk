import { useState } from 'react';
import { NavBar, Card, Button, Tag, Slider, Modal, Image } from 'antd-mobile';
import {
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import './global.css';

interface SpotDetail {
  id: string;
  name: string;
  coordinates: string;
  introduction: string;
  story: string;
  imageUrl?: string;
  isCheckedIn?: boolean;
}

const SpotDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isCollected, setIsCollected] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const spotDetail: SpotDetail = {
    id: id || '1',
    name: '旌义状石碑',
    coordinates: '东经118.2042° 北纬25.2357°',
    introduction:
      '孙中山为表彰侨领郑玉指革命贡献颁发的旌义状石刻，立于侨光亭内，见证百年爱国情怀。',
    story:
      '1912年，郑玉指先生捐赠巨款支持辛亥革命，孙中山亲书"旌义状"表彰其功绩...',
    imageUrl: '🏛️',
    isCheckedIn: false,
  };

  const handleShare = () => {
    console.log('分享景点:', spotDetail.name);
    Modal.alert({
      title: '分享',
      content: `分享 ${spotDetail.name} 到社交媒体`,
      closeOnMaskClick: true,
    });
  };

  const handleCollect = () => {
    setIsCollected(!isCollected);
    console.log(isCollected ? '取消收藏' : '收藏景点:', spotDetail.name);
  };

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    console.log('打卡景点:', spotDetail.name);
    Modal.alert({
      title: '打卡成功',
      content: `您已成功打卡 ${spotDetail.name}`,
      closeOnMaskClick: true,
    });
  };

  const handleGeneratePostcard = () => {
    console.log('生成 AI 明信片');
    Modal.alert({
      title: 'AI 明信片',
      content: '正在生成个性明信片...',
      closeOnMaskClick: true,
    });
  };

  const handleAudioToggle = () => {
    setIsPlaying(!isPlaying);
    console.log(isPlaying ? '暂停音频' : '播放音频');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="spot-detail-page"
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
          <div style={{ display: 'flex', gap: '15px' }}>
            <ShareAltOutlined
              onClick={handleShare}
              style={{ fontSize: '18px', cursor: 'pointer', color: '#4a5568' }}
            />
            {isCollected ? (
              <HeartFilled
                onClick={handleCollect}
                style={{
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#f5222d',
                }}
              />
            ) : (
              <HeartOutlined
                onClick={handleCollect}
                style={{
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#4a5568',
                }}
              />
            )}
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
        {spotDetail.name}
      </NavBar>

      {/* 内容区域（可滚动） */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <Card className="clay-card" style={{ marginBottom: '20px' }}>
          {/* 景点图片 */}
          <div
            style={{
              width: '100%',
              height: '40vh',
              maxHeight: '240px',
              backgroundColor: '#e8f5e9',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(40px, 10vw, 80px)',
              marginBottom: '15px',
            }}
          >
            {spotDetail.imageUrl}
          </div>

          {/* 坐标 */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#999',
              marginBottom: '15px',
            }}
          >
            {spotDetail.coordinates}
          </div>

          {/* 景点简介 */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '10px',
              }}
            >
              景点简介
            </div>
            <div
              style={{
                backgroundColor: '#f0f0f0',
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#4a5568',
              }}
            >
              {spotDetail.introduction}
            </div>
          </div>

          {/* 历史故事 */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '10px',
              }}
            >
              历史故事
            </div>
            <div
              style={{
                backgroundColor: '#f0f0f0',
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#4a5568',
              }}
            >
              {spotDetail.story}
            </div>
          </div>

          {/* 音频播放控件 */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '10px',
              }}
            >
              音频讲解
            </div>
            <Button
              onClick={handleAudioToggle}
              style={
                {
                  height: 'clamp(35px, 8vw, 40px)',
                  backgroundColor: isPlaying ? '#f5222d' : '#1677ff',
                  width: '100%',
                } as any
              }
              block
            >
              {isPlaying ? '⏸️ 暂停' : '▶️ 播放音频'}
            </Button>
            <Slider
              value={audioProgress}
              onChange={(value) => setAudioProgress(value as number)}
              style={{ marginTop: '10px' }}
              min={0}
              max={100}
            />
          </div>

          {/* AI 明信片按钮 */}
          <Button
            onClick={handleGeneratePostcard}
            style={
              {
                height: 'clamp(40px, 10vw, 48px)',
                backgroundColor: '#722ed1',
                marginBottom: '12px',
              } as any
            }
            block
          >
            🎨 AI 生成个性明信片
          </Button>

          {/* 打卡按钮 */}
          <Button
            onClick={handleCheckIn}
            disabled={isCheckedIn}
            style={
              {
                height: 'clamp(40px, 10vw, 48px)',
                backgroundColor: isCheckedIn ? '#999' : '#f5222d',
                marginBottom: '15px',
              } as any
            }
            block
          >
            {isCheckedIn ? '✓ 已打卡' : '📸 打卡点亮景点'}
          </Button>

          {/* 周边景点 */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '10px',
              }}
            >
              周边景点
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#e3f2fd',
                  borderRadius: '16px',
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#2d3748',
                  cursor: 'pointer',
                }}
              >
                辛亥革命纪念馆
              </div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#e3f2fd',
                  borderRadius: '16px',
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#2d3748',
                  cursor: 'pointer',
                }}
              >
                侨光亭
              </div>
            </div>
          </div>

          {/* 二维码 */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div
              style={{
                width: '25vw',
                height: '25vw',
                maxWidth: '120px',
                maxHeight: '120px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                margin: '0 auto 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(24px, 6vw, 48px)',
              }}
            >
              📱
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              扫码查看景点页面
            </div>
          </div>
        </Card>
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

export default SpotDetailPage;
