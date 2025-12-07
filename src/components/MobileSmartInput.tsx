import React, { useState, useEffect } from 'react';
import { Input, Button, Space, Tabs, Toast } from 'antd-mobile';
import { SendOutline, RobotOutline, UserOutline, AudioOutlined } from 'antd-mobile-icons';
import { agentCoordinator, InputType } from '../services/AgentCoordinationManager';

interface MobileSmartInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

interface InputDetectionConfig {
  minVoiceLength: number;
  voiceKeywords: string[];
  textIndicators: string[];
  confidenceThreshold: number;
}

const MobileSmartInput: React.FC<MobileSmartInputProps> = ({ 
  value, 
  onChange, 
  onSend, 
  disabled = false 
}) => {
  const [inputMode, setInputMode] = useState<InputType>(InputType.TEXT);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  // 输入检测配置
  const detectionConfig: InputDetectionConfig = {
    minVoiceLength: 3,
    voiceKeywords: ['帮我', '请问', '想要', '需要', '告诉', '我想知道'],
    textIndicators: ['?', '？', '!', '！', '。', '怎么', '什么', '哪里', '何时', '为何'],
    confidenceThreshold: 0.7,
  };

  // 检查浏览器是否支持语音识别
  useEffect(() => {
    const isSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;
    setRecognitionSupported(isSupported);
  }, []);

  // 智能输入模式检测
  const detectInputMode = (input: string): { mode: InputType; confidence: number } => {
    // 计算语音特征分数
    const voiceScore = calculateVoiceScore(input);
    // 计算文字特征分数
    const textScore = calculateTextScore(input);

    // 综合判断
    if (voiceScore > textScore && voiceScore > detectionConfig.confidenceThreshold) {
      return { mode: InputType.VOICE, confidence: voiceScore };
    } else {
      return { mode: InputType.TEXT, confidence: textScore };
    }
  };

  // 计算语音特征分数
  const calculateVoiceScore = (input: string): number => {
    let score = 0;

    // 包含语音关键词
    detectionConfig.voiceKeywords.forEach(keyword => {
      if (input.includes(keyword)) {
        score += 0.3;
      }
    });

    // 长度适中（语音通常较长）
    if (input.length >= detectionConfig.minVoiceLength && input.length <= 50) {
      score += 0.2;
    }

    // 口语化特征
    if (/[嗯啊呃哦额呣嗯]/.test(input)) {
      score += 0.3;
    }

    // 句式特征（语音常用句式）
    if (/(帮我|请问|我想|能不能|可不可以)/.test(input)) {
      score += 0.2;
    }

    return Math.min(score, 1);
  };

  // 计算文字特征分数
  const calculateTextScore = (input: string): number => {
    let score = 0.3; // 基础分

    // 包含疑问词
    detectionConfig.textIndicators.forEach(indicator => {
      if (input.includes(indicator)) {
        score += 0.2;
      }
    });

    // 简短直接
    if (input.length < 20) {
      score += 0.2;
    }

    // 关键词密集
    const keywords = input.split(/[，。！？]/).filter(word => word.length > 0);
    if (keywords.length <= 3) {
      score += 0.3;
    }

    return Math.min(score, 1);
  };

  // 处理输入变化
  const handleInputChange = (val: string) => {
    onChange(val);

    // 实时检测输入模式
    const { mode, confidence } = detectInputMode(val);
    setInputMode(mode);
    setConfidence(confidence);
  };

  // 开始语音识别
  const startVoiceRecognition = () => {
    if (!recognitionSupported) {
      Toast.show({
        icon: 'fail',
        content: '您的浏览器不支持语音识别',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-CN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        setIsProcessing(false);
        
        // 检测识别后的模式
        const { mode, confidence } = detectInputMode(transcript);
        setInputMode(mode);
        setConfidence(confidence);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        Toast.show({
          icon: 'fail',
          content: '语音识别失败，请使用文字输入',
        });
        setIsProcessing(false);
      };

      recognition.onend = () => {
        setIsProcessing(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Start recognition error:', error);
      Toast.show({
        icon: 'fail',
        content: '语音识别启动失败',
      });
      setIsProcessing(false);
    }
  };

  // 切换输入模式
  const switchMode = (mode: InputType) => {
    setInputMode(mode);
    if (mode === InputType.VOICE) {
      startVoiceRecognition();
    }
  };

  // 获取模式标签
  const getModeLabel = () => {
    switch (inputMode) {
      case InputType.VOICE:
        return `🎤 语音 ${confidence > 0.7 ? '高置信' : '检测中'}`;
      case InputType.TEXT:
        return `⌨️ 文字 ${confidence > 0.7 ? '高置信' : '模式'}`;
      default:
        return '🔍 检测中';
    }
  };

  // 获取模式颜色
  const getModeColor = () => {
    switch (inputMode) {
      case InputType.VOICE:
        return confidence > 0.7 ? '#52c41a' : '#faad14';
      case InputType.TEXT:
        return confidence > 0.7 ? '#1890ff' : '#d9d9d9';
      default:
        return '#f5222d';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 模式指示器 */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 12px',
          background: '#f5f5f5',
          borderRadius: '12px 12px 0 0',
          border: `2px solid ${getModeColor()}`,
          borderBottom: 'none'
        }}
      >
        <span style={{ color: getModeColor(), fontWeight: '500', fontSize: '14px' }}>
          {getModeLabel()}
        </span>
        <div style={{ fontSize: '12px', color: '#666' }}>
          置信度: {(confidence * 100).toFixed(0)}%
        </div>
      </div>

      {/* 输入框和按钮区域 */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'white', borderRadius: '0 0 12px 12px' }}>
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={inputMode === InputType.VOICE 
            ? '🎤 点击下方按钮开始说话...' 
            : '⌨️ 请输入消息...'}
          clearable
          style={{ 
            flex: 1, 
            borderRadius: '8px',
            border: `1px solid ${getModeColor()}`,
            padding: '12px'
          }}
          disabled={disabled || isProcessing}
          rows={2}
          autoSize={{ minRows: 2, maxRows: 4 }}
          showCount
          maxLength={500}
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Button
            fill="solid"
            color="primary"
            size="small"
            onClick={() => switchMode(InputType.VOICE)}
            disabled={!recognitionSupported || disabled || isProcessing}
            style={{ minWidth: 'auto', padding: '8px' }}
          >
            <AudioOutlined />
          </Button>
          
          <Button
            fill="solid"
            color="primary"
            size="small"
            onClick={onSend}
            disabled={!value.trim() || disabled || isProcessing}
            loading={isProcessing}
            style={{ minWidth: 'auto', padding: '8px' }}
          >
            <SendOutline />
          </Button>
        </div>
      </div>

      {/* 使用提示 */}
      <div 
        style={{ 
          padding: '12px', 
          background: '#f0f9ff', 
          borderRadius: '8px', 
          fontSize: '12px', 
          color: '#666', 
          lineHeight: '1.5',
          marginTop: '8px'
        }}
      >
        <strong>💡 提示：</strong>
        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
          <li>语音模式适合复杂问题和长内容</li>
          <li>文字模式适合精确查询</li>
          <li>系统自动识别输入类型</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileSmartInput;