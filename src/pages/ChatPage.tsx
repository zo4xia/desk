import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './global.css';

/**
 * 聊天页 - 外墙直接抄的旧代码
 */
const ChatPage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'assistant', text: '您好！我是村官小助理 🌿\n\n可为您提供：\n1. 红色景点介绍\n2. 游玩路线推荐\n3. 村史文化讲解\n4. 最新动态查询' },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // 添加用户消息
    const userMsg = { type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // 模拟AI回复
    setTimeout(() => {
      const replies = [
        '收到您的消息！我正在为您查找相关信息... 🤔',
        '东里村有很多红色历史景点，比如烈士纪念碑、红军驻扎旧址等 🏛️',
        '村子里有美丽的田园风光和古树名木，非常适合休闲游览 🌿',
        '我们村有很多历史名人和优秀青年，他们的故事很值得了解 👥',
        '最新的村务公告、乡民集市和农家服务信息都在这里 📢',
      ];
      const aiMsg = { type: 'assistant', text: replies[Math.floor(Math.random() * replies.length)] };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <div style={{ maxWidth: '480px', minHeight: '100vh', margin: '0 auto', position: 'relative' }}>
      {/* 骚包背景 - 直接抄的 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #ecfdf5 0%, #fff 50%, #f0fdfa 100%)' }} />
        <div className="pulse" style={{ position: 'absolute', top: '-10vw', right: '-10vw', width: '40vw', height: '40vw', maxWidth: '200px', maxHeight: '200px', background: 'rgba(16,185,129,0.12)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />
      </div>

      {/* 导航栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px', background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar-sm" style={{ width: 'clamp(30px, 10vw, 40px)', height: 'clamp(30px, 10vw, 40px)', background: 'linear-gradient(135deg, #10b981, #14b8a6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            🧑‍💼
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1f2937' }}>村官小助理</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>在线</div>
          </div>
        </div>
        <button
          className="btn"
          onClick={() => navigate('/category')}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          跳过
        </button>
      </div>

      {/* 聊天区域 - 直接抄的 */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.type}`}
            style={{ alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start' }}
          >
            {msg.text.split('\n').map((line, j) => <div key={j}>{line}</div>)}
          </div>
        ))}
      </div>

      {/* 输入区域 - 直接抄的 */}
      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="和小叶子聊聊..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button className="btn" onClick={handleSend}>
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
