// src/components/AdminPanelRefactored/OptimizedTabs.tsx
import React, { memo } from 'react';
import { Card, Row, Col, Table, Tag, Button, Input, Select, Statistic } from 'antd';
import { UserOutlined, DatabaseOutlined, ApiOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

// 类型定义
interface AgentStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  lastHeartbeat: string;
  responseTime: number;
  requestCount: number;
  errorRate: number;
}

interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

interface UserStats {
  id: string;
  username: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  lastLogin: string;
  requestCount: number;
}

// 系统监控标签页组件
export const SystemMonitorTab = memo(({ agentStatus, knowledgeBase, userStats, anpMessages }: { 
  agentStatus: AgentStatus[]; 
  knowledgeBase: KnowledgeItem[]; 
  userStats: UserStats[]; 
  anpMessages: any[]; 
}) => {
  return (
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
          pagination={{ pageSize: 10 }}
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
              render: (time: string) new Date(time).toLocaleString(),
            },
          ]}
        />
      </Card>
    </div>
  );
});
SystemMonitorTab.displayName = 'SystemMonitorTab';

// Agent A标签页组件
export const AgentATab = memo(() => {
  return (
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

      {/* A哥工具分配统计 */}
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
  );
});
AgentATab.displayName = 'AgentATab';

// Agent B标签页组件
export const AgentBTab = memo(() => {
  return (
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
    </div>
  );
});
AgentBTab.displayName = 'AgentBTab';

// 知识库标签页组件
export const KnowledgeTab = memo(({ knowledgeBase, editKnowledge, deleteKnowledge }: { 
  knowledgeBase: KnowledgeItem[]; 
  editKnowledge: (item: KnowledgeItem) => void; 
  deleteKnowledge: (id: string) => void; 
}) => {
  return (
    <Card title="📖 知识库管理">
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
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'active' | 'inactive') => (
              <Tag color={status === 'active' ? 'green' : 'red'}>
                {status === 'active' ? '启用' : '禁用'}
              </Tag>
            ),
          },
          {
            title: '标签',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: string[]) => (
              <div>
                {tags.map(tag => (
                  <Tag key={tag} style={{ marginBottom: '4px' }}>
                    {tag}
                  </Tag>
                ))}
              </div>
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
            key: 'action',
            render: (_, record) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  size="small" 
                  onClick={() => editKnowledge(record)}
                >
                  编辑
                </Button>
                <Button 
                  size="small" 
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
  );
});
KnowledgeTab.displayName = 'KnowledgeTab';