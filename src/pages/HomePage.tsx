import { useNavigate } from 'react-router-dom';
import './global.css';

/**
 * 东里村首页 - 入口欢迎页
 * 外墙直接抄的旧代码，骚包动效拉满
 */
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page" style={{
      maxWidth: '480px',
      minHeight: '100vh',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ========== 骚包动效背景 - 电脑上逼格拉满 ========== */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        {/* 渐变背景 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #f0fdfa 100%)',
        }} />
        
        {/* 流动光效圆 - 直接抄的 */}
        <div className="pulse" style={{
          position: 'absolute', top: 0, left: 0,
          width: '60vw', height: '60vw',
          maxWidth: '300px', maxHeight: '300px',
          background: 'rgba(16, 185, 129, 0.15)',
          borderRadius: '50%', filter: 'blur(80px)',
        }} />
        <div className="pulse" style={{
          position: 'absolute', top: 0, right: 0,
          width: '50vw', height: '50vw',
          maxWidth: '250px', maxHeight: '250px',
          background: 'rgba(20, 184, 166, 0.12)',
          borderRadius: '50%', filter: 'blur(60px)',
          animationDelay: '1s',
        }} />
        <div className="pulse" style={{
          position: 'absolute', bottom: '20%', left: '30%',
          width: '55vw', height: '55vw',
          maxWidth: '280px', maxHeight: '280px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '50%', filter: 'blur(70px)',
          animationDelay: '2s',
        }} />
        
        {/* 网格背景 - 科技感 */}
        <div className="grid-bg" style={{
          position: 'absolute', inset: 0, opacity: 0.4,
        }} />
      </div>

      {/* ========== 主内容区 ========== */}
      <div style={{
        padding: '60px 24px 40px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', minHeight: '100vh',
      }}>
        {/* 头像区域 - 甲方爸爸的原创肖像 */}
        <div className="fade-in-up" style={{
          position: 'relative', marginBottom: '24px',
        }}>
          <div className="avatar-lg pulse" style={{
            width: 'clamp(80px, 25vw, 100px)', height: 'clamp(80px, 25vw, 100px)',
            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
            borderRadius: '50%', padding: '4px',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
          }}>
            <div style={{
              width: '100%', height: '100%',
              background: '#fff', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '48px',
            }}>
              🏡
            </div>
          </div>
          {/* 在线状态绿点 */}
          <div className="online-dot" style={{
            position: 'absolute', bottom: '4px', right: '4px',
            width: 'clamp(12px, 4vw, 16px)', height: 'clamp(12px, 4vw, 16px)',
            background: '#22c55e', borderRadius: '50%',
            border: '3px solid white',
          }} />
        </div>

        {/* 主标题 */}
        <h1 className="fade-in-up" style={{
          fontSize: '26px', fontWeight: 'bold',
          color: '#1f2937', marginBottom: '8px',
          animationDelay: '0.1s',
        }}>
          东里村智能导游
        </h1>
        <p className="fade-in-up" style={{
          fontSize: '14px', color: '#6b7280', marginBottom: '40px',
          animationDelay: '0.2s',
        }}>
          AI伴您 · 探索乡土文化 🌿
        </p>

        {/* 功能卡片网格 - 直接抄的 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px', width: '100%', maxWidth: '360px',
          marginBottom: '32px',
        }}>
          {[
            { icon: '🏛️', title: '红色之旅', desc: '革命历史', path: '/red-culture' },
            { icon: '🌿', title: '伴你游东里', desc: '精选路线', path: '/nature-spots' },
            { icon: '📚', title: '走进东里', desc: '村史文化', path: '/figures' },
            { icon: '📢', title: '村子动态', desc: '最新资讯', path: '/announcements' },
          ].map((item, i) => (
            <div
              key={item.title}
              className="card fade-in-up"
              onClick={() => navigate(item.path)}
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 主按钮 - 直接抄的 */}
        <button
          className="btn fade-in-up"
          onClick={() => navigate('/category')}
          style={{
            width: '100%', maxWidth: '320px',
            padding: '16px', fontSize: '16px', fontWeight: 'bold',
            marginBottom: '12px', animationDelay: '0.7s',
          }}
        >
          🗺️ 开始探索
        </button>

        {/* 次按钮 */}
        <button
          className="btn btn-secondary fade-in-up"
          onClick={() => navigate('/chat')}
          style={{
            width: '100%', maxWidth: '320px',
            padding: '16px', fontSize: '16px',
            animationDelay: '0.8s',
          }}
        >
          🎤 语音导游
        </button>

        {/* 底部信息 */}
        <div className="fade-in-up" style={{
          marginTop: 'auto', paddingTop: '40px',
          textAlign: 'center', animationDelay: '0.9s',
        }}>
          <p style={{ fontSize: '11px', color: '#9ca3af' }}>
            Powered by AI · 公益助农
          </p>
          <p style={{ fontSize: '11px', color: '#d1d5db', marginTop: '4px' }}>
            东里村文化旅游服务平台
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
