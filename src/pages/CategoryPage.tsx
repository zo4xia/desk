import { NavBar } from 'antd-mobile';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './global.css';

/**
 * 分类导航页 - 外墙直接抄的旧代码
 */
const CategoryPage = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 'red', icon: '🏛️', title: '红色之旅', desc: '革命历史', color: '#fef2f2', path: '/red-culture' },
    { id: 'nature', icon: '🌿', title: '伴你游东里', desc: '精选路线', color: '#ecfdf5', path: '/nature-spots' },
    { id: 'people', icon: '📚', title: '走进东里', desc: '村史文化', color: '#eff6ff', path: '/figures' },
    { id: 'news', icon: '📢', title: '村子动态', desc: '最新资讯', color: '#fefce8', path: '/announcements' },
  ];

  return (
    <div style={{ maxWidth: '480px', minHeight: '100vh', margin: '0 auto', position: 'relative' }}>
      {/* 骚包背景 - 直接抄的 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #ecfdf5 0%, #fff 50%, #f0fdfa 100%)' }} />
        <div className="pulse" style={{ position: 'absolute', top: '-10vw', right: '-10vw', width: '40vw', height: '40vw', maxWidth: '200px', maxHeight: '200px', background: 'rgba(16,185,129,0.12)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />
      </div>

      {/* 导航栏 */}
      <NavBar
        back={null}
        right={<UserOutlined onClick={() => navigate('/profile')} style={{ fontSize: '20px', cursor: 'pointer', color: '#374151' }} />}
        style={{ '--height': '56px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.06)' } as any}
      >
        <span style={{ fontWeight: 'bold', color: '#1f2937' }}>东里村</span>
      </NavBar>

      {/* 分类卡片网格 - 直接抄的 */}
      <div style={{ padding: '20px 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            className="card fade-in-up"
            onClick={() => navigate(cat.path)}
            style={{
              background: cat.color,
              padding: '20px 16px',
              textAlign: 'center',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{cat.icon}</div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
              {cat.title}
            </h4>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>{cat.desc}</p>
          </div>
        ))}
      </div>

      {/* 快捷入口 */}
      <div style={{ padding: '0 16px 20px' }}>
        <div
          className="card glass fade-in-up"
          onClick={() => navigate('/chat')}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '16px 20px', animationDelay: '0.4s',
          }}
        >
          <div style={{
            width: 'clamp(40px, 10vw, 48px)', height: 'clamp(40px, 10vw, 48px)', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px',
          }}>
            🧑‍💼
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1f2937' }}>AI村官小助理</h4>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>语音导览 · 智能问答</p>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '20px', color: '#10b981' }}>→</div>
        </div>
      </div>

      {/* 悬浮按钮 - 直接抄的 */}
      <div
        className="pulse"
        onClick={() => navigate('/chat')}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: 'clamp(40px, 12vw, 56px)', height: 'clamp(40px, 12vw, 56px)', borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', color: 'white',
          boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
          cursor: 'pointer', zIndex: 100,
        }}
      >
        🎤
      </div>
    </div>
  );
};

export default CategoryPage;
