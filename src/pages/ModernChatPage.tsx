import React, { useState, useEffect, useRef } from 'react';
import { 
  NavBar, 
  Input, 
  Button, 
  Space, 
  List, 
  Avatar, 
  PullToRefresh,
  VirtualList,
  Toast
} from 'antd-mobile';
import { SendOutline, ArrowLeftOutline, RobotOutline, UserOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { AgentA } from '../services/agentSystem';
import { ANPMessage } from '../types/anp-protocol';
import MobileSmartInput from '../components/MobileSmartInput';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'delivered' | 'error';
}

const ModernChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '您好！我是村官小助理 🌿\n\n可为您提供：\n1. 红色景点介绍\n2. 游玩路线推荐\n3. 村史文化讲解\n4. 最新动态查询',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 使用Agent系统处理消息
      const response = await AgentA.processUserRequest(
        'user-' + Date.now(), // 临时用户ID
        inputValue,
        '', // contextSpot
        'text' // inputType
      );
      
      // 处理响应，response应该是AI的回复内容
      let responseText = '';
      if (typeof response === 'string') {
        responseText = response;
      } else if (response && typeof response === 'object') {
        // 如果response是对象，尝试获取content字段或其他可能的文本字段
        if (response.content) {
          responseText = response.content;
        } else if (response.text) {
          responseText = response.text;
        } else if (response.message) {
          responseText = response.message;
        } else {
          responseText = JSON.stringify(response);
        }
      } else {
        responseText = '村官小助理：我收到了您的消息，正在处理中...';
      }
      
      // 添加助手回复
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseText,
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
      Toast.show({
        icon: 'fail',
        content: '发送失败，请重试',
      });

      // 更新用户消息状态
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageItem = (item: Message) => {
    return (
      <div 
        key={item.id}
        className={`message-item ${item.type}`}
        style={{
          display: 'flex',
          justifyContent: item.type === 'user' ? 'flex-end' : 'flex-start',
          marginBottom: '16px',
          paddingLeft: item.type === 'assistant' ? '16px' : '48px',
          paddingRight: item.type === 'user' ? '16px' : '48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: '80%' }}>
          {item.type === 'assistant' && (
            <Avatar 
              style={{ backgroundColor: '#10b981', flexShrink: 0 }} 
              icon={<RobotOutline />}
            />
          )}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: item.type === 'user' ? '#10b981' : '#f5f5f5',
              color: item.type === 'user' ? 'white' : 'black',
              wordWrap: 'break-word',
              wordBreak: 'break-word',
            }}
          >
            {item.content.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          {item.type === 'user' && (
            <Avatar 
              style={{ backgroundColor: '#3b82f6', flexShrink: 0 }} 
              icon={<UserOutline />}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* 导航栏 */}
      <NavBar
        left={
          <Button
            fill="none"
            onClick={() => navigate('/category')}
            icon={<ArrowLeftOutline />}
          />
        }
        right={
          <Button 
            fill="none" 
            onClick={() => navigate('/admin')}
          >
            管理
          </Button>
        }
        style={{ 
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        村官小助理
      </NavBar>

      {/* 消息列表 */}
      <PullToRefresh
        onRefresh={() => {
          Toast.show('已刷新');
          return new Promise(resolve => setTimeout(resolve, 1000));
        }}
      >
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px 0',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #fff 50%, #f0fdfa 100%)'
          }}
        >
          <List>
            <VirtualList
              data={messages}
              itemSize={100}
              height={window.innerHeight - 180}
            >
              {renderMessageItem}
            </VirtualList>
          </List>
          <div ref={messagesEndRef} />
        </div>
      </PullToRefresh>

      {/* 输入区域 */}
      <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #eee' }}>
        <Space block direction="vertical">
          {/* 智能输入框 - 使用移动端优化的组件 */}
          <MobileSmartInput 
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={isLoading}
          />
          
          {/* 发送按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              fill="solid"
              color="primary"
              size="large"
              disabled={!inputValue.trim() || isLoading}
              onClick={handleSendMessage}
              loading={isLoading}
              icon={<SendOutline />}
              style={{ width: 'auto', minWidth: '80px' }}
            >
              {isLoading ? '发送中...' : '发送'}
            </Button>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default ModernChatPage;