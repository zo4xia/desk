// src/components/OptimizedAgentManager.tsx
import React, { useState, useEffect, useRef, memo } from 'react';

// Agent A - 眼睛和耳朵
interface AgentAState {
  mode: 'standby' | 'eye_mode' | 'ear_mode';
  isListening: boolean;
  lastInput: string;
  inputType: 'text' | 'voice' | null;
}

// Agent B - 瞎子
interface AgentBState {
  isProcessing: boolean;
  lastAnswer: string;
  querySource: 'cheat_sheet' | 'ai_model' | 'mcp_search';
  processingTime: number;
  cost: number;
}

// 消息格式
interface AgentMessage {
  from: 'A' | 'B' | 'C' | 'D';
  to: 'A' | 'B' | 'C' | 'D';
  type: 'INPUT' | 'QUERY' | 'ANSWER' | 'STATUS';
  payload: any;
  timestamp: string;
}

// 虚拟滚动消息项组件
const MessageItem = memo(({ message }: { message: AgentMessage }) => {
  const colorMap = {
    A: '#4CAF50',
    B: '#FF9800',
    C: '#9C27B0',
    D: '#F44336',
  };

  return (
    <div
      style={{
        padding: '8px',
        marginBottom: '4px',
        background: '#f8f9fa',
        borderRadius: '4px',
        borderLeft: `3px solid ${colorMap[message.from]}`,
      }}
    >
      <strong>{message.timestamp}</strong> {message.from} → {message.to}: {message.type}
      <br />
      <small>{JSON.stringify(message.payload, null, 2)}</small>
    </div>
  );
});
MessageItem.displayName = 'MessageItem';

const OptimizedAgentManager: React.FC = () => {
  // Agent A状态
  const [agentA, setAgentA] = useState<AgentAState>({
    mode: 'standby',
    isListening: false,
    lastInput: '',
    inputType: null,
  });

  // Agent B状态
  const [agentB, setAgentB] = useState<AgentBState>({
    isProcessing: false,
    lastAnswer: '',
    querySource: 'cheat_sheet',
    processingTime: 0,
    cost: 0,
  });

  // 消息队列
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // 虚拟滚动相关状态
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 音频录制相关
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 添加消息到队列
  const addMessage = (message: AgentMessage) => {
    setMessages(prev => [...prev, message]);
  };

  // Agent A: 切换到眼睛模式
  const switchToEyeMode = () => {
    setAgentA({
      mode: 'eye_mode',
      isListening: true,
      lastInput: '',
      inputType: 'text',
    });

    addMessage({
      from: 'A',
      to: 'B',
      type: 'STATUS',
      payload: { action: 'mode_switch', mode: 'eye_mode' },
      timestamp: new Date().toISOString(),
    });
  };

  // Agent A: 切换到耳朵模式
  const switchToEarMode = () => {
    setAgentA({
      mode: 'ear_mode',
      isListening: true,
      lastInput: '',
      inputType: 'voice',
    });

    addMessage({
      from: 'A',
      to: 'B',
      type: 'STATUS',
      payload: { action: 'mode_switch', mode: 'ear_mode' },
      timestamp: new Date().toISOString(),
    });
  };

  // Agent A: 文字输入处理
  const handleTextInput = (input: string) => {
    if (!input.trim()) return;

    setAgentA(prev => ({
      ...prev,
      lastInput: input,
    }));

    // A向B发送文字输入
    addMessage({
      from: 'A',
      to: 'B',
      type: 'INPUT',
      payload: {
        inputType: 'text',
        content: input,
        mode: 'eye_mode',
      },
      timestamp: new Date().toISOString(),
    });

    // 触发B处理
    processQuery(input, 'text');
    setTextInput('');
  };

  // Agent A: 语音录制
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        handleVoiceInput(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAgentA(prev => ({ ...prev, isListening: true }));

      addMessage({
        from: 'A',
        to: 'D',
        type: 'STATUS',
        payload: { action: 'voice_recording_start' },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('启动录音失败:', error);
      alert('录音功能不可用，请检查麦克风权限');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAgentA(prev => ({ ...prev, isListening: false }));
    }
  };

  // Agent A: 语音输入处理
  const handleVoiceInput = async (audioBlob: Blob) => {
    try {
      // 模拟语音转文字
      const transcribedText = await simulateSpeechToText(audioBlob);

      setAgentA(prev => ({
        ...prev,
        lastInput: transcribedText,
      }));

      // A向B发送语音输入
      addMessage({
        from: 'A',
        to: 'B',
        type: 'INPUT',
        payload: {
          inputType: 'voice',
          content: transcribedText,
          audioBlob: audioBlob,
          mode: 'ear_mode',
        },
        timestamp: new Date().toISOString(),
      });

      // 触发B处理
      processQuery(transcribedText, 'voice');
    } catch (error: any) {
      console.error('语音处理失败:', error);
      addMessage({
        from: 'A',
        to: 'D',
        type: 'STATUS',
        payload: {
          action: 'voice_processing_error',
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Agent B: 处理查询
  const processQuery = async (query: string, inputType: 'text' | 'voice') => {
    setAgentB(prev => ({ ...prev, isProcessing: true }));

    const startTime = Date.now();

    try {
      // 模拟智能判断
      const processingResult = await simulateIntelligentProcessing(query);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      setAgentB({
        isProcessing: false,
        lastAnswer: processingResult.answer,
        querySource: processingResult.source,
        processingTime,
        cost: processingResult.cost,
      });

      // B向D报告处理结果
      addMessage({
        from: 'B',
        to: 'D',
        type: 'ANSWER',
        payload: {
          query,
          answer: processingResult.answer,
          source: processingResult.source,
          processingTime,
          cost: processingResult.cost,
          inputType,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('查询处理失败:', error);
      setAgentB(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // 模拟语音转文字
  const simulateSpeechToText = async (audioBlob: Blob): Promise<string> => {
    // 模拟Minimax STT API调用
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟识别结果
        const sampleTexts = [
          '东里村有什么红色景点？',
          '郑玉指是谁？',
          '仙灵瀑布怎么去？',
          '集庆廊桥什么时候建的？',
        ];
        resolve(sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
      }, 1500); // 模拟1.5秒处理时间
    });
  };

  // 模拟智能处理
  const simulateIntelligentProcessing = async (
    query: string
  ): Promise<{
    answer: string;
    source: 'cheat_sheet' | 'ai_model' | 'mcp_search';
    cost: number;
  }> => {
    return new Promise(resolve => {
      setTimeout(
        () => {
          // 模拟小抄优先策略
          if (
            query.includes('郑玉指') ||
            query.includes('红色') ||
            query.includes('景点')
          ) {
            resolve({
              answer: `根据小抄数据：${query}的详细信息...`,
              source: 'cheat_sheet',
              cost: 0,
            });
          } else if (query.includes('怎么去') || query.includes('路线')) {
            resolve({
              answer: `通过AI分析：为您规划最佳路线...`,
              source: 'ai_model',
              cost: 0.25,
            });
          } else {
            resolve({
              answer: `通过MCP搜索：为您查找相关信息...`,
              source: 'mcp_search',
              cost: 0.29,
            });
          }
        },
        Math.random() * 2000 + 500
      ); // 0.5-2.5秒随机处理时间
    });
  };

  // 重置系统
  const resetSystem = () => {
    setAgentA({
      mode: 'standby',
      isListening: false,
      lastInput: '',
      inputType: null,
    });
    setAgentB({
      isProcessing: false,
      lastAnswer: '',
      querySource: 'cheat_sheet',
      processingTime: 0,
      cost: 0,
    });
    setMessages([]);
    setTextInput('');
  };

  // 处理滚动事件，实现虚拟滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      const itemHeight = 60; // 估算每个消息项的高度
      
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(clientHeight / itemHeight) + 10, // 额外渲染10个元素作为缓冲
        messages.length
      );
      
      setVisibleRange({ start: Math.max(0, startIndex - 5), end: endIndex });
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  return (
    <div
      style={{
        padding: '20px',
        background: '#f0fdf4',
        minHeight: '100vh',
        fontFamily: '"Noto Sans SC", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        🤖 Agent A + B 配合演示 (优化版)
      </div>

      {/* Agent状态面板 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Agent A状态 */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #4CAF50',
          }}
        >
          <h3 style={{ color: '#4CAF50', marginBottom: '16px' }}>
            👀 Agent A (眼睛+耳朵)
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <strong>模式：</strong>{' '}
            {agentA.mode === 'standby'
              ? '🔋 待机'
              : agentA.mode === 'eye_mode'
                ? '📝 眼睛模式'
                : '🎤 耳朵模式'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>监听状态：</strong>{' '}
            {agentA.isListening ? '🟢 活跃' : '🔴 静默'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>最后输入：</strong> {agentA.lastInput || '无'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>输入类型：</strong> {agentA.inputType || '未选择'}
          </div>
        </div>

        {/* Agent B状态 */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #FF9800',
          }}
        >
          <h3 style={{ color: '#FF9800', marginBottom: '16px' }}>
            ✋ Agent B (瞎子)
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <strong>处理状态：</strong>{' '}
            {agentB.isProcessing ? '🔄 处理中' : '✅ 空闲'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>查询来源：</strong>{' '}
            {agentB.querySource === 'cheat_sheet'
              ? '📚 小抄'
              : agentB.querySource === 'ai_model'
                ? '🤖 AI模型'
                : '🔍 MCP搜索'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>处理时间：</strong> {agentB.processingTime}ms
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>成本：</strong> ¥{agentB.cost.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 控制面板 */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>🎮 控制面板</h3>

        {/* 模式选择胶囊 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
            选择输入模式：
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={switchToEyeMode}
              disabled={agentA.mode === 'eye_mode'}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '25px',
                background: agentA.mode === 'eye_mode' ? '#11998e' : '#e3f2fd',
                color: agentA.mode === 'eye_mode' ? 'white' : '#1976d2',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              📝 文字输入
            </button>
            <button
              onClick={switchToEarMode}
              disabled={agentA.mode === 'ear_mode'}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '25px',
                background: agentA.mode === 'ear_mode' ? '#667eea' : '#f3e7e9',
                color: agentA.mode === 'ear_mode' ? 'white' : '#764ba2',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              🎤 语音输入
            </button>
          </div>
        </div>

        {/* 文字输入区 */}
        {agentA.mode === 'eye_mode' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              文字输入：
            </div>
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleTextInput(textInput);
                }
              }}
              placeholder="请输入您的问题..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
            />
            <button
              onClick={() => handleTextInput(textInput)}
              style={{
                marginTop: '8px',
                padding: '8px 16px',
                background: '#11998e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              发送
            </button>
          </div>
        )}

        {/* 语音输入区 */}
        {agentA.mode === 'ear_mode' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              语音输入：
            </div>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                padding: '16px 32px',
                border: 'none',
                borderRadius: '50%',
                background: isRecording ? '#f44336' : '#667eea',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
              }}
            >
              {isRecording ? '⏹️ 停止' : '🎤 开始录音'}
            </button>
            {isRecording && (
              <div
                style={{
                  marginTop: '8px',
                  color: '#f44336',
                  fontWeight: 'bold',
                }}
              >
                🎙️ 正在录音...
              </div>
            )}
          </div>
        )}

        {/* 重置按钮 */}
        <button
          onClick={resetSystem}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🔄 重置系统
        </button>
      </div>

      {/* 消息日志 - 使用虚拟滚动 */}
      <div
        ref={containerRef}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxHeight: '400px',
          overflow: 'auto',
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>📝 消息日志 (虚拟滚动优化)</h3>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {messages
            .slice(visibleRange.start, visibleRange.end)
            .map((msg, index) => (
              <MessageItem 
                key={`${msg.timestamp}-${index}`} 
                message={msg} 
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizedAgentManager;