import React, { useState, useRef } from 'react';
import {
  Button,
  Input,
  Card,
  Toast,
  Divider,
  Space,
  NavBar,
} from 'antd-mobile';
import {
  WechatOutlined,
  AlipayOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import './global.css';

// 模拟倒计时组件，因为 antd-mobile 5.x 没有内置 CountDown 组件，需要手动实现
const CountdownButton: React.FC<{ phone: string; onSend: () => void }> = ({
  phone,
  onSend,
}) => {
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const validatePhone = (p: string) => /^1[3-9]\d{9}$/.test(p);

  const getCode = () => {
    if (countdown > 0) return;
    if (!validatePhone(phone)) {
      Toast.show({
        content: '请输入有效的中国大陆手机号',
        duration: 2000,
        position: 'bottom',
      });
      return;
    }

    // 开始倒计时
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 模拟发送验证码
    onSend();
    Toast.show({
      content: '验证码已发送至您的手机',
      duration: 2000,
      position: 'bottom',
    });
  };

  return (
    <Button
      className="get-code-btn"
      disabled={countdown > 0}
      onClick={getCode}
      color={countdown > 0 ? 'default' : 'primary'}
      style={{
        '--border-radius': '12px',
        '--border-color': countdown > 0 ? '#e8e8e8' : '#1677ff',
        '--text-color': countdown > 0 ? '#999' : '#fff',
        width: 'clamp(60px, 15vw, 80px)',
        height: 'clamp(30px, 10vw, 40px)',
        fontSize: '14px',
        padding: '0 5px',
      }}
    >
      {countdown > 0 ? `${countdown}s` : '获取验证码'}
    </Button>
  );
};

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate(); // 假设使用了 react-router-dom

  const validatePhone = (p: string) => /^1[3-9]\d{9}$/.test(p);

  // 手机号登录逻辑 (真实API调用)
  const handlePhoneLogin = async () => {
    if (!validatePhone(phone)) {
      Toast.show({
        content: '手机号格式错误',
        duration: 2000,
        position: 'bottom',
      });
      return;
    }
    if (code.length !== 6) {
      Toast.show({
        content: '请输入6位验证码',
        duration: 2000,
        position: 'bottom',
      });
      return;
    }

    try {
      Toast.show({ content: '登录中...', icon: 'loading', duration: 0 });
      
      // 调用登录API
      const response = await apiService.auth.login(phone, code);
      
      if (response.success && response.data) {
        // 存储token到localStorage
        localStorage.setItem('token', response.data.token);
        
        Toast.show({
          content: response.data.message || '登录成功！欢迎来到东里村',
          duration: 2000,
          position: 'bottom',
        });
        
        // 跳转到 Agent 对话页 (ChatPage)
        setTimeout(() => navigate('/chat'), 2000);
      } else {
        Toast.show({
          content: response.error || '登录失败',
          duration: 2000,
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      Toast.show({
        content: '网络错误，请稍后重试',
        duration: 2000,
        position: 'bottom',
      });
    }
  };

  // 发送验证码逻辑 (真实API调用)
  const handleSendCode = async () => {
    if (!validatePhone(phone)) {
      Toast.show({
        content: '请输入有效的中国大陆手机号',
        duration: 2000,
        position: 'bottom',
      });
      return;
    }

    try {
      Toast.show({ content: '发送中...', icon: 'loading', duration: 0 });
      
      // 调用发送验证码API
      const response = await apiService.auth.sendCode(phone);
      
      if (response.success) {
        Toast.show({
          content: response.data?.message || '验证码已发送至您的手机',
          duration: 2000,
          position: 'bottom',
        });
      } else {
        Toast.show({
          content: response.error || '发送失败',
          duration: 2000,
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      Toast.show({
        content: '网络错误，请稍后重试',
        duration: 2000,
        position: 'bottom',
      });
    }
  };

  // 第三方登录逻辑 (保持模拟逻辑)
  const handleThirdLogin = (type: 'wx' | 'alipay' | 'guest') => {
    const tips = {
      wx: '正在唤起微信授权...',
      alipay: '正在唤起支付宝授权...',
      guest: '游客登录中...',
    };
    const successTips = {
      wx: '微信登录成功！',
      alipay: '支付宝登录成功！',
      guest: '游客登录成功！',
    };
    const delay = type === 'guest' ? 1000 : 1500;

    Toast.show({ content: tips[type], duration: 1500, position: 'bottom' });
    setTimeout(() => {
      Toast.clear();
      Toast.show({
        content: successTips[type],
        duration: 2000,
        position: 'bottom',
      });
      // 跳转到 Agent 对话页 (ChatPage)
      setTimeout(() => navigate('/chat'), delay);
    }, delay);
  };

  return (
    <div className="login-page">
      <NavBar
        back={null}
        style={{ '--height': '50px', backgroundColor: '#f5f5f5' }}
      >
        东里村文旅服务平台
      </NavBar>

      {/* 登录卡片（黏土风格） */}
      <Card className="clay-card" style={{ marginTop: '50px' }}>
        {/* LOGO占位 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px' }}>🏞️</div>
          <div
            style={{ fontSize: '18px', fontWeight: 'bold', color: '#4a5568' }}
          >
            东里村
          </div>
        </div>

        {/* 手机号输入 */}
        <div className="form-item" style={{ marginBottom: '15px' }}>
          <Input
            type="tel"
            placeholder="请输入11位手机号"
            value={phone}
            onChange={setPhone}
            style={{ height: 'clamp(35px, 8vw, 40px)', border: '1px solid #e8e8e8' }}
          />
        </div>

        {/* 验证码输入 + 倒计时按钮 */}
        <div className="form-item" style={{ marginBottom: '25px' }}>
          <Space block justify="between" style={{ width: '100%' }}>
            <Input
              type="number"
              placeholder="6位验证码"
              value={code}
              onChange={setCode}
              style={{ height: 'clamp(35px, 8vw, 40px)', border: '1px solid #e8e8e8', flex: 1 }}
            />
            <CountdownButton
              phone={phone}
              onSend={handleSendCode}
            />
          </Space>
        </div>

        {/* 手机号登录按钮 */}
        <Button
          className="login-btn cute-bounce"
          color="primary"
          onClick={handlePhoneLogin}
          style={{
            backgroundColor: '#2d3748',
            marginBottom: '20px',
            height: 'clamp(40px, 10vw, 48px)',
            '--border-radius': '16px',
          }}
          block
        >
          手机号登录
        </Button>

        {/* 分隔线 */}
        <Divider style={{ color: '#999', fontSize: '12px', margin: '10px 0' }}>
          其他登录方式
        </Divider>

        {/* 微信登录 */}
        <Button
          className="third-login-btn cute-bounce"
          onClick={() => handleThirdLogin('wx')}
          style={{
            backgroundColor: '#07c160',
            marginBottom: '12px',
            height: 'clamp(40px, 10vw, 48px)',
            '--border-radius': '16px',
          }}
          block
        >
          <WechatOutlined /> 微信登录
        </Button>

        {/* 支付宝登录 */}
        <Button
          className="third-login-btn cute-bounce"
          onClick={() => handleThirdLogin('alipay')}
          style={{
            backgroundColor: '#1677ff',
            marginBottom: '12px',
            height: 'clamp(40px, 10vw, 48px)',
            '--border-radius': '16px',
          }}
          block
        >
          <AlipayOutlined /> 支付宝登录
        </Button>

        {/* 游客登录 */}
        <Button
          className="third-login-btn cute-bounce"
          onClick={() => handleThirdLogin('guest')}
          style={{
            backgroundColor: '#f5f5f5',
            color: '#4a5568',
            height: 'clamp(40px, 10vw, 48px)',
            '--border-radius': '16px',
          }}
          block
        >
          <UserOutlined /> 游客登录
        </Button>
      </Card>

      {/* 底部协议 */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#999',
          marginTop: '20px',
        }}
      >
        登录即同意{' '}
        <a href="javascript:;" style={{ color: '#1677ff' }}>
          《用户服务协议》
        </a>{' '}
        和{' '}
        <a href="javascript:;" style={{ color: '#1677ff' }}>
          《隐私政策》
        </a>
      </div>
      <div
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#999',
          marginTop: '5px',
        }}
      >
        Design by 东里村团队
      </div>
    </div>
  );
};

export default LoginPage;
