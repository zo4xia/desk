import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Statistic,
  Switch,
} from 'antd';
import {
  UserOutlined,
  DatabaseOutlined,
  ApiOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  agentLogService,
  AgentBOutput,
  BtoDPush,
} from '../services/agentLogService';
import {
  configService,
  SystemConfig,
  FallbackConfig,
} from '../services/configService';

// 使用Ant Design组件 - 公开稳定版本

// 统一的数据类型定义
interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  lastHeartbeat: string;
  responseTime: number;
  requestCount: number;
  errorRate: number;
}

interface UserStats {
  id: string;
  username: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  lastLogin: string;
  requestCount: number;
}

// ANP消息类型定义
interface ANPMessage {
  protocol_version: string;
  message_id: string;
  timestamp: string;
  from_agent: string;
  to_agent: string;
  message_type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  payload: {
    action: string;
    data: any;
    metadata: {
      request_id: string;
      session_id: string;
      user_id: string;
      correlation_id: string;
    };
  };
}

const AdminPanelRefactored: React.FC = () => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [loading, setLoading] = useState(false);

  // 状态数据 - 统一管理
  const [, setDashboardStats] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);

  // 知识库编辑状态
  const [knowledgeModalVisible, setKnowledgeModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    tags: [] as string[],
    status: 'active' as 'active' | 'inactive',
  });

  // ANP通信日志
  const [anpMessages, setAnpMessages] = useState<ANPMessage[]>([]);

  // 🎯 B输出监控 + B→D推送日志（实时数据）
  const [bOutputs, setBOutputs] = useState<AgentBOutput[]>([]);
  const [btoDPushes, setBtoDPushes] = useState<BtoDPush[]>([]);
  const [bStats, setBStats] = useState({
    totalOutputs: 0,
    successRate: '0',
    avgResponseTime: 0,
    btoDPushCount: 0,
  });

  // 组件化数据加载 - 遵循剃刀原则，单一职责
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'http://localhost:3001/api/admin/analytics/dashboard'
      );
      const result = await response.json();
      if (result.success) {
        setDashboardStats(result.data);
        // 记录ANP通信日志
        logANPMessage('SYSTEM', 'DATA_MANAGER', 'DATA_QUERY_RESPONSE', 'HIGH', {
          action: 'dashboard_data_loaded',
          data: result.data,
          metadata: {
            request_id: `req_${Date.now()}`,
            session_id: 'session_admin',
            user_id: 'user_admin',
            correlation_id: `corr_${Date.now()}`,
          },
        });
      }
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentStatus = async () => {
    try {
      // 模拟Agent状态数据 - 体现ANP多智能体协作
      const mockAgentStatus: AgentStatus[] = [
        {
          id: 'input_manager',
          name: '输入管理器 (Agent A)',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 50,
          requestCount: 156,
          errorRate: 0.01,
        },
        {
          id: 'query_processor',
          name: '查询处理器 (Agent B)',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 200,
          requestCount: 89,
          errorRate: 0.02,
        },
        {
          id: 'data_manager',
          name: '数据管理器 (Agent C)',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 12,
          requestCount: 234,
          errorRate: 0.0,
        },
        {
          id: 'user_monitor',
          name: '用户监控器 (Agent D)',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 100,
          requestCount: 67,
          errorRate: 0.01,
        },
      ];
      setAgentStatus(mockAgentStatus);

      // 记录ANP Agent状态查询
      logANPMessage('SYSTEM', 'ALL_AGENTS', 'STATUS_REPORT', 'MEDIUM', {
        action: 'agent_status_query_completed',
        data: { agents: mockAgentStatus },
        metadata: {
          request_id: `req_${Date.now()}`,
          session_id: 'session_admin',
          user_id: 'user_admin',
          correlation_id: `corr_${Date.now()}`,
        },
      });
    } catch (error) {
      console.error('加载Agent状态失败:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      // 模拟用户统计数据 - D哥心系统职责
      const mockUserStats: UserStats[] = [
        {
          id: '1',
          username: 'admin',
          phone: '13800138000',
          status: 'active',
          lastLogin: new Date().toISOString(),
          requestCount: 45,
        },
        {
          id: '2',
          username: 'user001',
          phone: '13800138001',
          status: 'active',
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          requestCount: 23,
        },
      ];
      setUserStats(mockUserStats);

      // 记录ANP用户监控数据
      logANPMessage('SYSTEM', 'USER_MONITOR', 'DATA_QUERY_RESPONSE', 'MEDIUM', {
        action: 'user_stats_loaded',
        data: { users: mockUserStats },
        metadata: {
          request_id: `req_${Date.now()}`,
          session_id: 'session_admin',
          user_id: 'user_admin',
          correlation_id: `corr_${Date.now()}`,
        },
      });
    } catch (error) {
      console.error('加载用户统计失败:', error);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      // 模拟知识库数据 - C数据小抄职责
      const mockKnowledge: KnowledgeItem[] = [
        {
          id: '1',
          category: 'red_culture',
          title: '东里村红色历史',
          content: '东里村有着丰富的红色文化历史...',
          tags: ['红色文化', '历史', '革命'],
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          category: 'ecology',
          title: '生态农业介绍',
          content: '东里村生态农业发展情况...',
          tags: ['生态', '农业', '绿色'],
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ];
      setKnowledgeBase(mockKnowledge);

      // 记录ANP数据管理器操作
      logANPMessage('SYSTEM', 'DATA_MANAGER', 'DATA_QUERY_RESPONSE', 'LOW', {
        action: 'knowledge_base_loaded',
        data: { knowledge_items: mockKnowledge },
        metadata: {
          request_id: `req_${Date.now()}`,
          session_id: 'session_admin',
          user_id: 'user_admin',
          correlation_id: `corr_${Date.now()}`,
        },
      });
    } catch (error) {
      console.error('加载知识库失败:', error);
    }
  };

  // ANP消息记录函数 - 核心通信日志
  const logANPMessage = (
    from_agent: string,
    to_agent: string,
    message_type: string,
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    payload: any
  ) => {
    const message: ANPMessage = {
      protocol_version: '1.0',
      message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      from_agent,
      to_agent,
      message_type,
      priority,
      payload,
    };

    setAnpMessages(prev => [...prev.slice(-20), message]);
  };

  // 知识库操作函数 - 组件化事件处理
  const handleAddKnowledge = () => {
    setEditingItem(null);
    setFormData({
      category: '',
      title: '',
      content: '',
      tags: [],
      status: 'active',
    });
    setKnowledgeModalVisible(true);

    // 记录ANP操作日志
    logANPMessage('ADMIN', 'DATA_MANAGER', 'DATA_STORE_REQUEST', 'MEDIUM', {
      action: 'add_knowledge_initiated',
      data: { mode: 'create' },
      metadata: {
        request_id: `req_${Date.now()}`,
        session_id: 'session_admin',
        user_id: 'user_admin',
        correlation_id: `corr_${Date.now()}`,
      },
    });
  };

  const editKnowledge = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      title: item.title,
      content: item.content,
      tags: item.tags,
      status: item.status,
    });
    setKnowledgeModalVisible(true);

    // 记录ANP操作日志
    logANPMessage('ADMIN', 'DATA_MANAGER', 'DATA_STORE_REQUEST', 'MEDIUM', {
      action: 'edit_knowledge_initiated',
      data: { item_id: item.id, mode: 'edit' },
      metadata: {
        request_id: `req_${Date.now()}`,
        session_id: 'session_admin',
        user_id: 'user_admin',
        correlation_id: `corr_${Date.now()}`,
      },
    });
  };

  const deleteKnowledge = (id: string) => {
    if (confirm('确定要删除这条知识库记录吗？')) {
      setKnowledgeBase(knowledgeBase.filter(item => item.id !== id));

      // 记录ANP删除操作
      logANPMessage('ADMIN', 'DATA_MANAGER', 'DATA_STORE_REQUEST', 'HIGH', {
        action: 'delete_knowledge_completed',
        data: { deleted_id: id },
        metadata: {
          request_id: `req_${Date.now()}`,
          session_id: 'session_admin',
          user_id: 'user_admin',
          correlation_id: `corr_${Date.now()}`,
        },
      });
    }
  };

  const handleKnowledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // 编辑操作
        setKnowledgeBase(
          knowledgeBase.map(item =>
            item.id === editingItem.id ? { ...item, ...formData } : item
          )
        );

        logANPMessage(
          'ADMIN',
          'DATA_MANAGER',
          'DATA_STORE_RESPONSE',
          'MEDIUM',
          {
            action: 'edit_knowledge_completed',
            data: { updated_item: { ...editingItem, ...formData } },
            metadata: {
              request_id: `req_${Date.now()}`,
              session_id: 'session_admin',
              user_id: 'user_admin',
              correlation_id: `corr_${Date.now()}`,
            },
          }
        );
      } else {
        // 新增操作
        const newItem: KnowledgeItem = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setKnowledgeBase([...knowledgeBase, newItem]);

        logANPMessage(
          'ADMIN',
          'DATA_MANAGER',
          'DATA_STORE_RESPONSE',
          'MEDIUM',
          {
            action: 'add_knowledge_completed',
            data: { new_item: newItem },
            metadata: {
              request_id: `req_${Date.now()}`,
              session_id: 'session_admin',
              user_id: 'user_admin',
              correlation_id: `corr_${Date.now()}`,
            },
          }
        );
      }
      setKnowledgeModalVisible(false);
    } catch (error) {
      console.error('保存知识库失败:', error);
    }
  };

  // 初始化数据加载
  useEffect(() => {
    loadDashboardData();
    loadAgentStatus();
    loadUserStats();
    loadKnowledgeBase();

    // 🎯 订阅B输出日志服务（实时更新）
    const loadBLogs = () => {
      const stats = agentLogService.getStats();
      setBOutputs(stats.recentOutputs);
      setBtoDPushes(stats.recentPushes);
      setBStats({
        totalOutputs: stats.totalOutputs,
        successRate: stats.successRate,
        avgResponseTime: stats.avgResponseTime,
        btoDPushCount: stats.btoDPushCount,
      });
    };

    loadBLogs();
    const unsubscribe = agentLogService.subscribe(loadBLogs);

    return () => unsubscribe();
  }, []);

  // API配置状态
  const [apiConfig, setApiConfig] = useState({
    siliconFlow: {
      keys: 'sk-key1,sk-key2,sk-key3',
      rotationMode: 'random',
      dailyLimit: 1000,
      currentUsage: 567,
    },
    minimax: {
      keys: 'eyJhbGciOiJSUzI1NiIs...',
      rotationMode: 'sequential',
      dailyLimit: 500,
      currentUsage: 234,
    },
    zhipuai: {
      keys: 'a049afdafb1b41a0862cdc1d73d5d6eb...',
      rotationMode: 'none',
      dailyLimit: 100,
      currentUsage: 12,
    },
  });

  // 告警数据
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      time: '14:25:30',
      level: 'warning',
      agent: 'Agent B',
      message: '响应时间超过3秒 (当前: 3.2s)',
      status: '已处理',
    },
    {
      id: '2',
      time: '14:20:15',
      level: 'info',
      agent: 'MCP搜索',
      message: '失败率超过10% (当前: 12%)',
      status: '监控中',
    },
    {
      id: '3',
      time: '14:15:08',
      level: 'warning',
      agent: '成本监控',
      message: '今日成本已达预算85% (¥8.50/¥10)',
      status: '已通知',
    },
  ]);

  // 🎯 MCP工具配置
  const [mcpTools, setMcpTools] = useState([
    {
      id: 'voice_interaction',
      name: '智能对话',
      desc: 'AI对话处理',
      enabled: true,
      provider: '硅基流动',
      cost: '¥0.1/次',
    },
    {
      id: 'get_related_knowledge',
      name: '知识查询',
      desc: '查询C小抄',
      enabled: true,
      provider: '本地',
      cost: '¥0',
    },
    {
      id: 'get_shopping_info',
      name: '附近商家',
      desc: '查询周边商家',
      enabled: true,
      provider: '高德地图',
      cost: '¥0',
    },
    {
      id: 'get_map',
      name: '地图导航',
      desc: '获取静态地图',
      enabled: true,
      provider: '高德地图',
      cost: '¥0',
    },
    {
      id: 'object_recognition',
      name: '图片识别',
      desc: '识别图片内容',
      enabled: true,
      provider: '硅基流动',
      cost: '¥0.15/次',
    },
    {
      id: 'mcp_search',
      name: 'MCP搜索',
      desc: '多引擎网络搜索',
      enabled: false,
      provider: '多引擎',
      cost: '¥0.03/次',
    },
  ]);

  // 🎯 功能开关
  const [featureSwitches, setFeatureSwitches] = useState({
    voiceInput: true, // 语音输入
    photoInput: true, // 图片输入
    aiChat: true, // AI对话
    costControl: true, // 成本控制
    webhookNotify: true, // Webhook通知
    autoFailover: true, // 自动故障切换
    cacheFirst: true, // C小抄优先
    debugMode: false, // 调试模式
  });

  // 切换MCP工具开关
  const toggleMcpTool = (toolId: string) => {
    setMcpTools(tools =>
      tools.map(t => (t.id === toolId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  // 切换功能开关
  const toggleFeature = (key: keyof typeof featureSwitches) => {
    setFeatureSwitches(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 🎯 系统配置状态
  const [sysConfig, setSysConfig] = useState<SystemConfig>(
    configService.getConfig()
  );
  const [fallbackConfig, setFallbackConfig] = useState<FallbackConfig>(
    configService.getFallbackConfig()
  );

  // 订阅配置变化
  useEffect(() => {
    const unsubscribe = configService.subscribe(() => {
      setSysConfig(configService.getConfig());
      setFallbackConfig(configService.getFallbackConfig());
    });
    return () => unsubscribe();
  }, []);

  // 更新MCP配置
  const updateMCPSetting = (key: string, value: any) => {
    configService.updateMCPConfig({ [key]: value });
  };

  // 更新Agent配置
  const updateAgentSetting = (
    agent: 'agentA' | 'agentB' | 'agentC' | 'agentD',
    key: string,
    value: any
  ) => {
    configService.updateAgentConfig(agent, { [key]: value });
  };

  // 更新兆底回复
  const updateFallbackReply = (category: string, reply: string) => {
    configService.updateFallbackReply(category, reply);
  };

  // Tab导航配置 - 组件化配置（四人组设计）
  const tabs = [
    { key: 'monitor', label: '📊 系统总览' },
    { key: 'agent-a', label: '👀 A哥(眼睛)' },
    { key: 'agent-b', label: '🧠 B哥(嘴替)' },
    { key: 'agent-c', label: '📚 C哥(小抄)' },
    { key: 'agent-d', label: '❤️ D哥(心)' },
    { key: 'api-config', label: '🔧 API配置' },
    { key: 'mcp-config', label: '🛠️ MCP配置' },
    { key: 'fallback-config', label: '💬 兆底回复' },
    { key: 'alerts', label: '🚨 告警中心' },
    { key: 'knowledge', label: '📖 知识库' },
  ];

  return (
    <div
      style={{
        padding: '24px',
        background: '#f0fdf4',
        minHeight: '100vh',
        fontFamily: '"Noto Sans SC", system-ui, sans-serif',
      }}
    >
      {/* 页面标题 */}
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        🏛️ 东里村智能导游系统 - ANP多智能体协作管理后台
      </div>

      {/* Tab导航 - 组件化 */}
      <div
        style={{
          display: 'flex',
          background: 'white',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: activeTab === tab.key ? '#1677ff' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 系统监控 - 使用Ant Design组件 */}
      {activeTab === 'monitor' && (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="在线Agent"
                  value={agentStatus.filter(a => a.status === 'online').length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="知识库条目"
                  value={knowledgeBase.length}
                  prefix={<DatabaseOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="用户总数"
                  value={userStats.length}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="ANP消息"
                  value={anpMessages.length}
                  prefix={<ApiOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Agent健康状态" style={{ marginBottom: '16px' }}>
            <Table
              dataSource={agentStatus}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Agent名称',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag
                      color={
                        status === 'online'
                          ? 'green'
                          : status === 'offline'
                            ? 'orange'
                            : 'red'
                      }
                    >
                      {status === 'online'
                        ? '在线'
                        : status === 'offline'
                          ? '离线'
                          : '错误'}
                    </Tag>
                  ),
                },
                {
                  title: '响应时间',
                  dataIndex: 'responseTime',
                  key: 'responseTime',
                  render: (time: number) => (time > 0 ? `${time}ms` : '-'),
                },
                {
                  title: '请求次数',
                  dataIndex: 'requestCount',
                  key: 'requestCount',
                },
                {
                  title: '错误率',
                  dataIndex: 'errorRate',
                  key: 'errorRate',
                  render: (rate: number) => `${(rate * 100).toFixed(2)}%`,
                },
                {
                  title: '最后心跳',
                  dataIndex: 'lastHeartbeat',
                  key: 'lastHeartbeat',
                  render: (time: string) => new Date(time).toLocaleString(),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {/* A哥-输入管理器(眼睛) */}
      {activeTab === 'agent-a' && (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} md={12}>
              <Card title="🎤 语音服务状态">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <span>在线状态:</span>
                  <Tag color="green">● 运行中</Tag>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <span>今日处理:</span>
                  <span style={{ fontWeight: 'bold' }}>1,234 次请求</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <span>识别准确率:</span>
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    95.2%
                  </span>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>响应时间:</span>
                  <span>45ms</span>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="⚙️ 配置管理">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    MiniMax API Keys:
                  </label>
                  <Input.TextArea
                    rows={2}
                    defaultValue="eyJhbGciOiJSUzI1NiIs..."
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    轮询模式:
                  </label>
                  <Select defaultValue="random" style={{ width: '100%' }}>
                    <Select.Option value="random">随机</Select.Option>
                    <Select.Option value="sequential">顺序</Select.Option>
                    <Select.Option value="none">关闭</Select.Option>
                  </Select>
                </div>
                <Button type="primary" style={{ width: '100%' }}>
                  保存配置
                </Button>
              </Card>
            </Col>
          </Row>
          <Card title="📊 鸡贼胶囊交互统计">
            <div
              style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>鸡贼设计：</strong>A动脑子判断用什么工具，打包(uid + 问题
              + 工具)发给B，B不用动脑子直接执行
            </div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={8}>
                <Statistic title="文字输入" value={623} suffix="次" />
              </Col>
              <Col span={8}>
                <Statistic title="语音输入" value={412} suffix="次" />
              </Col>
              <Col span={8}>
                <Statistic title="图片输入" value={89} suffix="次" />
              </Col>
            </Row>
          </Card>

          {/* 🎯 A哥工具分配统计 */}
          <Card
            title="🧠 A哥工具分配（鸡贼胶囊过滤）"
            style={{ marginTop: '16px' }}
          >
            <div
              style={{
                background: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>工作流程：</strong>输入 → A判断意图 → 选择工具 → 打包发B →
              成功/失败都代码通知D
            </div>
            <Table
              dataSource={[
                {
                  key: '1',
                  category: '红色文化',
                  tool: 'get_related_knowledge',
                  needsAI: '否（查C小抄）',
                  count: 312,
                  cost: '¥0',
                },
                {
                  key: '2',
                  category: '美食购物',
                  tool: 'get_shopping_info',
                  needsAI: '否（查附近）',
                  count: 156,
                  cost: '¥0',
                },
                {
                  key: '3',
                  category: '地图导航',
                  tool: 'get_map',
                  needsAI: '否（调用地图）',
                  count: 89,
                  cost: '¥0',
                },
                {
                  key: '4',
                  category: '图片识别',
                  tool: 'object_recognition',
                  needsAI: '是',
                  count: 45,
                  cost: '¥4.50',
                },
                {
                  key: '5',
                  category: '智能对话',
                  tool: 'voice_interaction',
                  needsAI: '是',
                  count: 234,
                  cost: '¥23.40',
                },
              ]}
              columns={[
                { title: '分类', dataIndex: 'category', key: 'category' },
                {
                  title: '工具',
                  dataIndex: 'tool',
                  key: 'tool',
                  render: (t: string) => <Tag color="blue">{t}</Tag>,
                },
                {
                  title: '需要AI',
                  dataIndex: 'needsAI',
                  key: 'needsAI',
                  render: (n: string) =>
                    n.startsWith('否') ? (
                      <Tag color="green">{n}</Tag>
                    ) : (
                      <Tag color="orange">{n}</Tag>
                    ),
                },
                { title: '调用次数', dataIndex: 'count', key: 'count' },
                { title: '成本', dataIndex: 'cost', key: 'cost' },
              ]}
              pagination={false}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <strong>合计</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Tag color="green">零AI占比66.2%</Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <strong>836</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>
                      <strong>¥27.90</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </div>
      )}

      {/* B哥-查询处理器(瞎子) */}
      {activeTab === 'agent-b' && (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="AI查询成功率"
                  value={97.2}
                  suffix="%"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="平均响应时间"
                  value={2.3}
                  suffix="s"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="今日成本"
                  value={8.5}
                  prefix="¥"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
          <Card title="🧠 B直出设计" style={{ marginBottom: '16px' }}>
            <div
              style={{
                background: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>核心策略：</strong>
              C数据小抄优先（80%查询零成本），只有查不到才调用AI
            </div>
            <Table
              dataSource={[
                {
                  key: '1',
                  source: 'C数据小抄',
                  count: 412,
                  rate: '80.2%',
                  cost: '¥0',
                },
                {
                  key: '2',
                  source: 'AI调用',
                  count: 89,
                  rate: '17.3%',
                  cost: '¥8.50',
                },
                {
                  key: '3',
                  source: 'MCP搜索',
                  count: 13,
                  rate: '2.5%',
                  cost: '¥0.39',
                },
              ]}
              columns={[
                { title: '数据来源', dataIndex: 'source', key: 'source' },
                { title: '调用次数', dataIndex: 'count', key: 'count' },
                { title: '占比', dataIndex: 'rate', key: 'rate' },
                { title: '成本', dataIndex: 'cost', key: 'cost' },
              ]}
              pagination={false}
            />
          </Card>

          {/* 🎯 B输出实时监控 */}
          <Card title="📊 B输出实时监控" style={{ marginBottom: '16px' }}>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={6}>
                <Statistic title="总输出次数" value={bStats.totalOutputs} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="成功率"
                  value={bStats.successRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均响应"
                  value={bStats.avgResponseTime}
                  suffix="ms"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="B→D推送"
                  value={bStats.btoDPushCount}
                  suffix="次"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
            <Table
              dataSource={bOutputs}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: '时间',
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                  width: 100,
                  render: (t: number) => new Date(t).toLocaleTimeString(),
                },
                {
                  title: 'UID',
                  dataIndex: 'uid',
                  key: 'uid',
                  width: 100,
                  render: (uid: string) => <Tag>{uid.substring(0, 8)}...</Tag>,
                },
                {
                  title: '工具',
                  dataIndex: 'toolName',
                  key: 'toolName',
                  width: 120,
                },
                {
                  title: '状态',
                  dataIndex: 'success',
                  key: 'success',
                  width: 80,
                  render: (s: boolean) =>
                    s ? (
                      <Tag color="green">
                        <CheckCircleOutlined /> 成功
                      </Tag>
                    ) : (
                      <Tag color="red">
                        <CloseCircleOutlined /> 失败
                      </Tag>
                    ),
                },
                {
                  title: '耗时',
                  dataIndex: 'responseTime',
                  key: 'responseTime',
                  width: 80,
                  render: (t: number) => `${t}ms`,
                },
                {
                  title: '错误',
                  dataIndex: 'error',
                  key: 'error',
                  render: (e: string) =>
                    e ? <span style={{ color: '#f5222d' }}>{e}</span> : '-',
                },
              ]}
            />
          </Card>

          {/* 🎯 B→D直推记录 */}
          <Card title="🚀 B→D代码直推记录（鸡贼模式）">
            <div
              style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>鸡贼设计：</strong>
              B输出成功后，代码直接推送到D，不走AI，减少B负载
            </div>
            <Table
              dataSource={btoDPushes}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: '时间',
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                  width: 100,
                  render: (t: number) => new Date(t).toLocaleTimeString(),
                },
                {
                  title: 'UID',
                  dataIndex: 'uid',
                  key: 'uid',
                  width: 100,
                  render: (uid: string) => (
                    <Tag color="blue">{uid.substring(0, 8)}...</Tag>
                  ),
                },
                {
                  title: '推送类型',
                  dataIndex: 'pushType',
                  key: 'pushType',
                  width: 100,
                },
                {
                  title: '数据',
                  dataIndex: 'data',
                  key: 'data',
                  render: (d: any) => (
                    <span style={{ fontSize: '12px' }}>
                      {JSON.stringify(d).substring(0, 50)}...
                    </span>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'success',
                  key: 'success',
                  width: 80,
                  render: (s: boolean) => <Tag color="green">✓ 已推送</Tag>,
                },
              ]}
            />
          </Card>
          <Card title="🔧 模型配置">
            <Row gutter={16}>
              <Col span={12}>
                <div
                  style={{
                    background: '#f0f5ff',
                    padding: '16px',
                    borderRadius: '8px',
                  }}
                >
                  <h4>主模型 - 硅基流动</h4>
                  <p>模型: Qwen2.5-7B</p>
                  <p>
                    状态: <Tag color="green">在线</Tag>
                  </p>
                  <p>日用量: 567/1000</p>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    background: '#fff0f6',
                    padding: '16px',
                    borderRadius: '8px',
                  }}
                >
                  <h4>备用模型 - 智谱AI</h4>
                  <p>模型: GLM-4</p>
                  <p>
                    状态: <Tag color="blue">待命</Tag>
                  </p>
                  <p>触发条件: 主模型失败</p>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {/* C哥-数据管理器(小抄) */}
      {activeTab === 'agent-c' && (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="小抄命中率"
                  value={85.3}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="知识库条目"
                  value={knowledgeBase.length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="查询响应"
                  value={12}
                  suffix="ms"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
          <Card
            title="📚 C数据小抄 - 零AI成本策略"
            style={{ marginBottom: '16px' }}
          >
            <div
              style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>核心价值：</strong>
              结构化知识库，一个萝卜一个坑填充。80%问题直接从小抄获取，零AI成本！
            </div>
            <Table
              dataSource={[
                {
                  key: '1',
                  category: '红色文化',
                  records: 156,
                  queries: 89,
                  hitRate: '87.6%',
                },
                {
                  key: '2',
                  category: '风景名胜',
                  records: 234,
                  queries: 156,
                  hitRate: '89.1%',
                },
                {
                  key: '3',
                  category: '村镇人物',
                  records: 89,
                  queries: 67,
                  hitRate: '79.1%',
                },
                {
                  key: '4',
                  category: '活动公告',
                  records: 45,
                  queries: 23,
                  hitRate: '82.6%',
                },
                {
                  key: '5',
                  category: '特色美食',
                  records: 67,
                  queries: 34,
                  hitRate: '85.3%',
                },
              ]}
              columns={[
                { title: '分类', dataIndex: 'category', key: 'category' },
                { title: '记录数', dataIndex: 'records', key: 'records' },
                { title: '查询次数', dataIndex: 'queries', key: 'queries' },
                { title: '命中率', dataIndex: 'hitRate', key: 'hitRate' },
              ]}
              pagination={false}
            />
          </Card>
        </div>
      )}

      {/* D哥-用户监控器(心) */}
      {activeTab === 'agent-d' && (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="在线用户"
                  value={userStats.length}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="今日互动"
                  value={1247}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="成本告警"
                  value={3}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="用户满意度"
                  value={4.6}
                  suffix="/5.0"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
          <Card title="👥 用户管理" style={{ marginBottom: '16px' }}>
            <Table
              dataSource={userStats}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: '用户名', dataIndex: 'username', key: 'username' },
                { title: '手机号', dataIndex: 'phone', key: 'phone' },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'active' ? 'green' : 'orange'}>
                      {status === 'active' ? '活跃' : '非活跃'}
                    </Tag>
                  ),
                },
                {
                  title: '最后登录',
                  dataIndex: 'lastLogin',
                  key: 'lastLogin',
                  render: (time: string) => new Date(time).toLocaleString(),
                },
                {
                  title: '请求次数',
                  dataIndex: 'requestCount',
                  key: 'requestCount',
                },
              ]}
            />
          </Card>
          <Card title="💰 成本监控">
            <div
              style={{
                background: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>预算管理：</strong>日预算 ¥50 | 异常阈值 ¥20 |
              Webhook通知已启用
            </div>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="今日成本" value={8.5} prefix="¥" />
              </Col>
              <Col span={8}>
                <Statistic
                  title="预算剩余"
                  value={41.5}
                  prefix="¥"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic title="使用率" value={17} suffix="%" />
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {/* API配置管理中心 */}
      {activeTab === 'api-config' && (
        <div>
          <Card title="🔧 API配置管理中心" style={{ marginBottom: '16px' }}>
            <div
              style={{
                background: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>核心功能：</strong>API Key管理 | MCP工具开关 | 功能开关 |
              轮询策略 | 故障切换
            </div>
          </Card>

          {/* API Key 配置 */}
          <Card title="🔑 API Key 配置" style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <strong>硅基流动</strong>
                    <Tag color="green">在线</Tag>
                  </div>
                  <Input.TextArea
                    rows={2}
                    value={apiConfig.siliconFlow.keys}
                    onChange={e =>
                      setApiConfig(prev => ({
                        ...prev,
                        siliconFlow: {
                          ...prev.siliconFlow,
                          keys: e.target.value,
                        },
                      }))
                    }
                    placeholder="多Key用逗号分隔"
                    style={{ marginBottom: '8px' }}
                  />
                  <Select
                    value={apiConfig.siliconFlow.rotationMode}
                    onChange={v =>
                      setApiConfig(prev => ({
                        ...prev,
                        siliconFlow: { ...prev.siliconFlow, rotationMode: v },
                      }))
                    }
                    style={{ width: '100%', marginBottom: '8px' }}
                  >
                    <Select.Option value="random">轮询: 随机</Select.Option>
                    <Select.Option value="sequential">轮询: 顺序</Select.Option>
                    <Select.Option value="none">轮询: 关闭</Select.Option>
                  </Select>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    <span>日限额: {apiConfig.siliconFlow.dailyLimit}</span>
                    <span>已用: {apiConfig.siliconFlow.currentUsage}</span>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <strong>MiniMax</strong>
                    <Tag color="green">在线</Tag>
                  </div>
                  <Input.TextArea
                    rows={2}
                    value={apiConfig.minimax.keys}
                    onChange={e =>
                      setApiConfig(prev => ({
                        ...prev,
                        minimax: { ...prev.minimax, keys: e.target.value },
                      }))
                    }
                    placeholder="API Key"
                    style={{ marginBottom: '8px' }}
                  />
                  <Select
                    value={apiConfig.minimax.rotationMode}
                    onChange={v =>
                      setApiConfig(prev => ({
                        ...prev,
                        minimax: { ...prev.minimax, rotationMode: v },
                      }))
                    }
                    style={{ width: '100%', marginBottom: '8px' }}
                  >
                    <Select.Option value="random">轮询: 随机</Select.Option>
                    <Select.Option value="sequential">轮询: 顺序</Select.Option>
                    <Select.Option value="none">轮询: 关闭</Select.Option>
                  </Select>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    <span>日限额: {apiConfig.minimax.dailyLimit}</span>
                    <span>已用: {apiConfig.minimax.currentUsage}</span>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <strong>智谱AI</strong>
                    <Tag color="blue">待命</Tag>
                  </div>
                  <Input.TextArea
                    rows={2}
                    value={apiConfig.zhipuai.keys}
                    onChange={e =>
                      setApiConfig(prev => ({
                        ...prev,
                        zhipuai: { ...prev.zhipuai, keys: e.target.value },
                      }))
                    }
                    placeholder="API Key"
                    style={{ marginBottom: '8px' }}
                  />
                  <Select
                    value={apiConfig.zhipuai.rotationMode}
                    onChange={v =>
                      setApiConfig(prev => ({
                        ...prev,
                        zhipuai: { ...prev.zhipuai, rotationMode: v },
                      }))
                    }
                    style={{ width: '100%', marginBottom: '8px' }}
                  >
                    <Select.Option value="random">轮询: 随机</Select.Option>
                    <Select.Option value="sequential">轮询: 顺序</Select.Option>
                    <Select.Option value="none">轮询: 关闭</Select.Option>
                  </Select>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    <span>日限额: {apiConfig.zhipuai.dailyLimit}</span>
                    <span>已用: {apiConfig.zhipuai.currentUsage}</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* MCP工具配置 */}
          <Card title="🛠️ MCP可用工具配置" style={{ marginBottom: '16px' }}>
            <Table
              dataSource={mcpTools}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '工具名称',
                  dataIndex: 'name',
                  key: 'name',
                  render: (n: string, r: any) => (
                    <span>
                      <Tag color="blue">{r.id}</Tag> {n}
                    </span>
                  ),
                },
                { title: '描述', dataIndex: 'desc', key: 'desc' },
                { title: '提供方', dataIndex: 'provider', key: 'provider' },
                {
                  title: '成本',
                  dataIndex: 'cost',
                  key: 'cost',
                  render: (c: string) =>
                    c === '¥0' ? (
                      <Tag color="green">免费</Tag>
                    ) : (
                      <Tag color="orange">{c}</Tag>
                    ),
                },
                {
                  title: '开关',
                  key: 'enabled',
                  render: (_: any, r: any) => (
                    <Switch
                      checked={r.enabled}
                      onChange={() => toggleMcpTool(r.id)}
                    />
                  ),
                },
              ]}
            />
          </Card>

          {/* 功能开关 */}
          <Card title="⚙️ 功能开关">
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}>
                <div
                  style={{
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>语音输入</div>
                  <Switch
                    checked={featureSwitches.voiceInput}
                    onChange={() => toggleFeature('voiceInput')}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div
                  style={{
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>图片输入</div>
                  <Switch
                    checked={featureSwitches.photoInput}
                    onChange={() => toggleFeature('photoInput')}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div
                  style={{
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>AI对话</div>
                  <Switch
                    checked={featureSwitches.aiChat}
                    onChange={() => toggleFeature('aiChat')}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div
                  style={{
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>成本控制</div>
                  <Switch
                    checked={featureSwitches.costControl}
                    onChange={() => toggleFeature('costControl')}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div
                  style={{
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>Webhook通知</div>
                  <Switch
                    checked={featureSwitches.webhookNotify}
                    onChange={() => toggleFeature('webhookNotify')}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div
                  style={{
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>自动故障切换</div>
                  <Switch
                    checked={featureSwitches.autoFailover}
                    onChange={() => toggleFeature('autoFailover')}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div
                  style={{
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>C小抄优先</div>
                  <Switch
                    checked={featureSwitches.cacheFirst}
                    onChange={() => toggleFeature('cacheFirst')}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div
                  style={{
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>调试模式</div>
                  <Switch
                    checked={featureSwitches.debugMode}
                    onChange={() => toggleFeature('debugMode')}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {/* MCP配置 */}
      {activeTab === 'mcp-config' && (
        <div>
          <Card title="🛠️ MCP服务配置" style={{ marginBottom: '16px' }}>
            <div
              style={{
                background: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>MCP配置：</strong>服务地址 | 超时设置 | 重试策略 |
              工具开关
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    服务地址:
                  </label>
                  <Input
                    value={sysConfig.mcp.serverUrl}
                    onChange={e =>
                      updateMCPSetting('serverUrl', e.target.value)
                    }
                    placeholder="http://localhost:3001"
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    超时时间(ms):
                  </label>
                  <Input
                    type="number"
                    value={sysConfig.mcp.timeout}
                    onChange={e =>
                      updateMCPSetting('timeout', parseInt(e.target.value))
                    }
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    重试次数:
                  </label>
                  <Input
                    type="number"
                    value={sysConfig.mcp.retryCount}
                    onChange={e =>
                      updateMCPSetting('retryCount', parseInt(e.target.value))
                    }
                  />
                </div>
              </Col>
            </Row>
          </Card>

          <Card title="🧠 B哥配置（嘴替担当）" style={{ marginBottom: '16px' }}>
            <div
              style={{
                background: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>🎯 核心原则：</strong>
              B哥负责执行工具和输出回复，D哥监控不逗太紧（10秒超时再告警）
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    B哥超时(ms):
                  </label>
                  <Input
                    type="number"
                    value={sysConfig.agents.agentB.timeout}
                    onChange={e =>
                      updateAgentSetting(
                        'agentB',
                        'timeout',
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
                  >
                    建议10000ms（10秒）
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Webhook告警延迟(ms):
                  </label>
                  <Input
                    type="number"
                    value={sysConfig.agents.agentB.webhookAlertDelay}
                    onChange={e =>
                      updateAgentSetting(
                        'agentB',
                        'webhookAlertDelay',
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
                  >
                    超时后多久通知Webhook
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    最大重试次数:
                  </label>
                  <Input
                    type="number"
                    value={sysConfig.agents.agentB.maxRetries}
                    onChange={e =>
                      updateAgentSetting(
                        'agentB',
                        'maxRetries',
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </Col>
            </Row>
          </Card>

          <Card title="❤️ D哥监控配置" style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    监控间隔(ms):
                  </label>
                  <Input
                    type="number"
                    value={sysConfig.agents.agentD.monitorInterval}
                    onChange={e =>
                      updateAgentSetting(
                        'agentD',
                        'monitorInterval',
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    告警阈值(ms):
                  </label>
                  <Input
                    type="number"
                    value={sysConfig.agents.agentD.alertThreshold}
                    onChange={e =>
                      updateAgentSetting(
                        'agentD',
                        'alertThreshold',
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
                  >
                    响应超过此时间触发告警
                  </div>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Webhook开关:
                  </label>
                  <Switch
                    checked={sysConfig.agents.agentD.webhookEnabled}
                    onChange={v =>
                      updateAgentSetting('agentD', 'webhookEnabled', v)
                    }
                  />
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Webhook地址:
                  </label>
                  <Input
                    value={sysConfig.agents.agentD.webhookUrl}
                    onChange={e =>
                      updateAgentSetting('agentD', 'webhookUrl', e.target.value)
                    }
                    placeholder="https://api.day.app/xxx"
                  />
                </div>
              </Col>
            </Row>
          </Card>

          <Card title="📚 C哥缓存配置（小抄）">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    缓存开关:
                  </label>
                  <Switch
                    checked={sysConfig.agents.agentC.cacheEnabled}
                    onChange={v =>
                      updateAgentSetting('agentC', 'cacheEnabled', v)
                    }
                  />
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    缓存过期(ms):
                  </label>
                  <Input
                    type="number"
                    value={sysConfig.agents.agentC.cacheTTL}
                    onChange={e =>
                      updateAgentSetting(
                        'agentC',
                        'cacheTTL',
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
                  >
                    3600000 = 1小时
                  </div>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    自动刷新:
                  </label>
                  <Switch
                    checked={sysConfig.agents.agentC.autoRefresh}
                    onChange={v =>
                      updateAgentSetting('agentC', 'autoRefresh', v)
                    }
                  />
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    刷新间隔(ms):
                  </label>
                  <Input
                    type="number"
                    value={sysConfig.agents.agentC.refreshInterval}
                    onChange={e =>
                      updateAgentSetting(
                        'agentC',
                        'refreshInterval',
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
                  >
                    1800000 = 30分钟
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {/* 兆底回复配置 */}
      {activeTab === 'fallback-config' && (
        <div>
          <Card title="💬 兆底回复配置" style={{ marginBottom: '16px' }}>
            <div
              style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>B哥嘴替担当：</strong>
              当找不到知识时，根据分类返回对应的兆底回复，可配置全局后缀（广告）
            </div>
          </Card>

          {/* 各分类兆底回复 */}
          <Card title="📝 各分类兆底回复" style={{ marginBottom: '16px' }}>
            {fallbackConfig.fallbackReplies.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '16px',
                  padding: '12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <Tag color="blue">{rule.category}</Tag>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    关键词: {rule.keywords.join(', ')}
                  </span>
                </div>
                <Input.TextArea
                  rows={2}
                  value={rule.reply}
                  onChange={e =>
                    updateFallbackReply(rule.category, e.target.value)
                  }
                  placeholder="找不到时的回复内容"
                />
              </div>
            ))}
          </Card>

          {/* 默认兆底回复 */}
          <Card title="⚠️ 默认兆底回复" style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px', color: '#666' }}>
              当所有分类都不匹配时使用:
            </div>
            <Input.TextArea
              rows={2}
              value={fallbackConfig.defaultReply}
              onChange={e =>
                configService.updateFallbackConfig({
                  defaultReply: e.target.value,
                })
              }
              placeholder="默认回复内容"
            />
          </Card>

          {/* 全局后缀（广告） */}
          <Card title="📰 全局后缀（广告）">
            <Row gutter={16}>
              <Col span={4}>
                <div style={{ marginBottom: '8px' }}>启用后缀:</div>
                <Switch
                  checked={fallbackConfig.globalSuffix.enabled}
                  onChange={v =>
                    configService.updateGlobalSuffix(
                      v,
                      fallbackConfig.globalSuffix.content
                    )
                  }
                />
              </Col>
              <Col span={20}>
                <div style={{ marginBottom: '8px' }}>
                  后缀内容（所有回复都会加上）:
                </div>
                <Input.TextArea
                  rows={2}
                  value={fallbackConfig.globalSuffix.content}
                  onChange={e =>
                    configService.updateGlobalSuffix(
                      fallbackConfig.globalSuffix.enabled,
                      e.target.value
                    )
                  }
                  placeholder="例如: \n\n🏡 东里村欢迎您！更多精彩请关注公众号"
                />
              </Col>
            </Row>
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: '#fafafa',
                borderRadius: '8px',
              }}
            >
              <strong>预览效果:</strong>
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  background: 'white',
                  borderRadius: '4px',
                  border: '1px solid #e8e8e8',
                }}
              >
                兆底回复内容...
                {fallbackConfig.globalSuffix.enabled && (
                  <span style={{ color: '#1890ff' }}>
                    {fallbackConfig.globalSuffix.content}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 告警中心 */}
      {activeTab === 'alerts' && (
        <div>
          <Card title="🚨 告警中心" style={{ marginBottom: '16px' }}>
            <div
              style={{
                background: '#fff1f0',
                border: '1px solid #ffa39e',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <strong>告警规则：</strong>Agent异常 | API成本超限 | 系统资源告警
              | 自动Webhook通知
            </div>
            <Table
              dataSource={alerts}
              rowKey="id"
              columns={[
                { title: '时间', dataIndex: 'time', key: 'time' },
                {
                  title: '级别',
                  dataIndex: 'level',
                  key: 'level',
                  render: (level: string) => (
                    <Tag
                      color={
                        level === 'warning'
                          ? 'orange'
                          : level === 'info'
                            ? 'blue'
                            : 'red'
                      }
                    >
                      {level}
                    </Tag>
                  ),
                },
                { title: 'Agent', dataIndex: 'agent', key: 'agent' },
                { title: '告警内容', dataIndex: 'message', key: 'message' },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={status === '已处理' ? 'green' : 'blue'}>
                      {status}
                    </Tag>
                  ),
                },
              ]}
              pagination={false}
            />
          </Card>
          <Card title="📡 Webhook配置">
            <p>
              <strong>主通知:</strong>{' '}
              https://api.day.app/p2CPtgzAMNGQCqQYEz86AV
            </p>
            <p>
              <strong>状态:</strong> <Tag color="green">已启用</Tag>
            </p>
            <p>
              <strong>频率限制:</strong> 10条/分钟, 100条/小时
            </p>
          </Card>
        </div>
      )}

      {/* 知识库管理 - 使用Ant Design组件 */}
      {activeTab === 'knowledge' && (
        <div>
          <Card
            title="📚 C数据知识库管理"
            style={{ marginBottom: '16px' }}
            extra={
              <Button type="primary" onClick={handleAddKnowledge}>
                + 添加知识
              </Button>
            }
          >
            <div
              style={{
                background: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              <strong>结构化知识库：</strong>
              一个萝卜一个坑填充，便于管理和维护。每个知识条目包含分类、标题、内容、标签等结构化信息。
            </div>
          </Card>

          <Card>
            <Table
              dataSource={knowledgeBase}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: '分类',
                  dataIndex: 'category',
                  key: 'category',
                },
                {
                  title: '标题',
                  dataIndex: 'title',
                  key: 'title',
                },
                {
                  title: '标签',
                  dataIndex: 'tags',
                  key: 'tags',
                  render: (tags: string[]) => (
                    <>
                      {tags.map(tag => (
                        <Tag key={tag} style={{ margin: '2px' }}>
                          {tag}
                        </Tag>
                      ))}
                    </>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'active' ? 'green' : 'orange'}>
                      {status === 'active' ? '启用' : '禁用'}
                    </Tag>
                  ),
                },
                {
                  title: '创建时间',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (time: string) => new Date(time).toLocaleString(),
                },
                {
                  title: '操作',
                  key: 'actions',
                  render: (_, record) => (
                    <div>
                      <Button
                        type="link"
                        onClick={() => editKnowledge(record)}
                        style={{ marginRight: '8px' }}
                      >
                        编辑
                      </Button>
                      <Button
                        type="link"
                        danger
                        onClick={() => deleteKnowledge(record.id)}
                      >
                        删除
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {/* 知识库编辑模态框 - 组件化 */}
      {knowledgeModalVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <h3 style={{ marginBottom: '16px' }}>
              {editingItem ? '编辑知识库' : '添加知识库'}
            </h3>

            <form onSubmit={handleKnowledgeSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                  }}
                >
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                  }}
                  required
                >
                  <option value="">选择分类</option>
                  <option value="red_culture">红色文化</option>
                  <option value="ecology">生态农业</option>
                  <option value="folk">民俗文化</option>
                  <option value="food">特色美食</option>
                  <option value="celebrity">乡贤名人</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                  }}
                >
                  标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="输入知识库标题"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                  }}
                >
                  内容
                </label>
                <textarea
                  value={formData.content}
                  onChange={e =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="输入详细内容"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    resize: 'vertical',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                  }}
                >
                  状态
                </label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                  }}
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setKnowledgeModalVisible(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#1677ff',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelRefactored;
