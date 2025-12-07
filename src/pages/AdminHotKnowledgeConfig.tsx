// Admin后台热门知识配置页面
// 军工品质，极简高效

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Typography,
  Alert,
} from 'antd';
import {
  notifyKnowledgeUpdate,
  CacheUpdateType,
} from '../services/CacheNotificationService';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// 热门知识配置接口
interface HotKnowledge {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: number;
  keywords: string[];
  isActive: boolean;
  queryCount: number;
  lastUpdated: number;
}

// 配置分类
const KNOWLEDGE_CATEGORIES = [
  '景点介绍',
  '交通指南',
  '门票信息',
  '住宿推荐',
  '美食特色',
  '文化历史',
  '游玩攻略',
  '其他信息',
];

const AdminHotKnowledgeConfig: React.FC = () => {
  const [hotKnowledgeList, setHotKnowledgeList] = useState<HotKnowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<HotKnowledge | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('全部');

  // 初始化数据
  useEffect(() => {
    loadHotKnowledge();
  }, []);

  // 加载热门知识配置
  const loadHotKnowledge = async () => {
    setLoading(true);
    try {
      // 模拟从API加载数据
      const mockData: HotKnowledge[] = [
        {
          id: '1',
          question: '东里村在哪里？',
          answer:
            '东里村位于浙江省丽水市龙泉市，是一个历史悠久的古村落，以其保存完好的明清建筑和淳朴的民风而闻名。',
          category: '景点介绍',
          priority: 1,
          keywords: ['东里村', '位置', '在哪', '地址'],
          isActive: true,
          queryCount: 156,
          lastUpdated: Date.now() - 86400000,
        },
        {
          id: '2',
          question: '东里村门票多少钱？',
          answer:
            '东里村免费开放，无需购买门票。游客可以自由参观古村落，体验当地的文化和生活。',
          category: '门票信息',
          priority: 2,
          keywords: ['门票', '价格', '收费', '多少钱'],
          isActive: true,
          queryCount: 142,
          lastUpdated: Date.now() - 172800000,
        },
        {
          id: '3',
          question: '怎么去东里村？',
          answer:
            '前往东里村可以乘坐高铁到丽水站，然后转乘巴士或打车前往，车程约1小时。也可以自驾导航至东里村停车场。',
          category: '交通指南',
          priority: 3,
          keywords: ['交通', '怎么去', '路线', '乘车'],
          isActive: true,
          queryCount: 128,
          lastUpdated: Date.now() - 259200000,
        },
      ];

      setHotKnowledgeList(mockData);
    } catch (error) {
      console.error('加载热门知识配置失败:', error);
      message.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存配置到后端
  const saveHotKnowledge = async (data: HotKnowledge[]) => {
    try {
      // 模拟API调用
      console.log('保存热门知识配置:', data);
      message.success('配置保存成功');

      // 实际项目中这里应该调用API
      // await fetch('/api/admin/hot-knowledge', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败');
    }
  };

  // 添加/编辑热门知识
  const handleSave = async (values: any) => {
    try {
      const newItem: HotKnowledge = {
        id: editingItem?.id || Date.now().toString(),
        question: values.question,
        answer: values.answer,
        category: values.category,
        priority: values.priority,
        keywords: values.keywords
          .split(',')
          .map((k: string) => k.trim())
          .filter((k: string) => k),
        isActive: values.isActive,
        queryCount: editingItem?.queryCount || 0,
        lastUpdated: Date.now(),
      };

      if (editingItem) {
        // 编辑
        setHotKnowledgeList(prev =>
          prev.map(item => (item.id === editingItem.id ? newItem : item))
        );
        message.success('更新成功');

        // 通知缓存更新
        await notifyKnowledgeUpdate(
          CacheUpdateType.UPDATE,
          [editingItem.id],
          newItem,
          'admin'
        );
      } else {
        // 添加
        setHotKnowledgeList(prev => [...prev, newItem]);
        message.success('添加成功');

        // 通知缓存更新
        await notifyKnowledgeUpdate(
          CacheUpdateType.CREATE,
          [newItem.id],
          newItem,
          'admin'
        );
      }

      setModalVisible(false);
      setEditingItem(null);
      form.resetFields();

      await saveHotKnowledge([...hotKnowledgeList, newItem]);
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 删除热门知识
  const handleDelete = async (id: string) => {
    try {
      const newList = hotKnowledgeList.filter(item => item.id !== id);
      setHotKnowledgeList(newList);
      message.success('删除成功');

      // 通知缓存更新
      await notifyKnowledgeUpdate(
        CacheUpdateType.DELETE,
        [id],
        undefined,
        'admin'
      );

      await saveHotKnowledge(newList);
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 切换启用状态
  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const newList = hotKnowledgeList.map(item =>
        item.id === id ? { ...item, isActive } : item
      );
      setHotKnowledgeList(newList);
      message.success(`${isActive ? '启用' : '禁用'}成功`);

      // 通知缓存更新
      await notifyKnowledgeUpdate(
        CacheUpdateType.UPDATE,
        [id],
        { id, isActive },
        'admin'
      );

      await saveHotKnowledge(newList);
    } catch (error) {
      console.error('状态切换失败:', error);
      message.error('状态切换失败');
    }
  };

  // 打开编辑模态框
  const openEditModal = (item?: HotKnowledge) => {
    setEditingItem(item || null);
    if (item) {
      form.setFieldsValue({
        ...item,
        keywords: item.keywords.join(', '),
      });
    }
    setModalVisible(true);
  };

  // 过滤数据
  const filteredData = hotKnowledgeList
    .filter(item => {
      const matchSearch =
        !searchText ||
        item.question.toLowerCase().includes(searchText.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchText.toLowerCase()) ||
        item.keywords.some(k =>
          k.toLowerCase().includes(searchText.toLowerCase())
        );

      const matchCategory =
        filterCategory === '全部' || item.category === filterCategory;

      return matchSearch && matchCategory;
    })
    .sort((a, b) => a.priority - b.priority);

  // 表格列配置
  const columns = [
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: number) => (
        <Tag color={priority <= 3 ? 'red' : priority <= 6 ? 'orange' : 'blue'}>
          {priority}
        </Tag>
      ),
    },
    {
      title: '问题',
      dataIndex: 'question',
      key: 'question',
      width: 200,
      ellipsis: true,
    },
    {
      title: '答案',
      dataIndex: 'answer',
      key: 'answer',
      width: 300,
      ellipsis: true,
      render: (answer: string) => (
        <Text ellipsis style={{ maxWidth: '280px' }}>
          {answer}
        </Text>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '关键词',
      dataIndex: 'keywords',
      key: 'keywords',
      width: 150,
      render: (keywords: string[]) => (
        <Space wrap>
          {keywords.slice(0, 3).map(keyword => (
            <Tag key={keyword}>{keyword}</Tag>
          ))}
          {keywords.length > 3 && <Tag>+{keywords.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: '查询次数',
      dataIndex: 'queryCount',
      key: 'queryCount',
      width: 100,
      render: (count: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FireOutlined style={{ color: '#fa8c16' }} />
          <span>{count}</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean, record: HotKnowledge) => (
        <Tag
          color={isActive ? 'green' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => toggleActive(record.id, !isActive)}
        >
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: HotKnowledge) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个热门知识吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: '24px',
        background: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* 页面标题 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            🔥 热门知识配置管理
          </Title>
          <Text style={{ color: '#666' }}>
            配置热门问答知识，提升Agent响应速度和用户体验
          </Text>
        </div>

        {/* 操作提示 */}
        <Alert
          message="💡 配置说明"
          description={
            <ul>
              <li>优先级数字越小，匹配优先级越高</li>
              <li>关键词用于相似度匹配，多个关键词用逗号分隔</li>
              <li>查询次数统计帮助了解用户关注热点</li>
              <li>配置的热门知识将被优先缓存和推荐</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* 搜索和筛选 */}
        <Card style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <Text strong>搜索：</Text>
              <Input
                placeholder="搜索问题、答案或关键词..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 'clamp(200px, 50vw, 250px)', marginLeft: '2vw' }}
                allowClear
              />
            </div>

            <div>
              <Text strong>分类：</Text>
              <Select
                value={filterCategory}
                onChange={setFilterCategory}
                style={{ width: 'clamp(120px, 30vw, 150px)', marginLeft: '2vw' }}
              >
                <Option value="全部">全部分类</Option>
                {KNOWLEDGE_CATEGORIES.map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openEditModal()}
                size="large"
              >
                添加热门知识
              </Button>
            </div>
          </div>
        </Card>

        {/* 数据表格 */}
        <Card title={`📋 热门知识列表 (${filteredData.length}条)`}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* 添加/编辑模态框 */}
        <Modal
          title={editingItem ? '编辑热门知识' : '添加热门知识'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingItem(null);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              priority: hotKnowledgeList.length + 1,
              isActive: true,
            }}
          >
            <Form.Item
              label="问题"
              name="question"
              rules={[{ required: true, message: '请输入问题' }]}
            >
              <Input placeholder="请输入常见问题..." />
            </Form.Item>

            <Form.Item
              label="答案"
              name="answer"
              rules={[{ required: true, message: '请输入答案' }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入详细答案..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
                label="分类"
                name="category"
                rules={[{ required: true, message: '请选择分类' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="选择知识分类">
                  {KNOWLEDGE_CATEGORIES.map(category => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="优先级"
                name="priority"
                rules={[{ required: true, message: '请输入优先级' }]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="数字越小优先级越高"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="关键词"
              name="keywords"
              rules={[{ required: true, message: '请输入关键词' }]}
              extra="多个关键词用逗号分隔，用于相似度匹配"
            >
              <Input placeholder="如：东里村,位置,地址" />
            </Form.Item>

            <Form.Item label="状态" name="isActive" valuePropName="checked">
              <Select defaultValue={true}>
                <Option value={true}>启用</Option>
                <Option value={false}>禁用</Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    setEditingItem(null);
                    form.resetFields();
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  {editingItem ? '更新' : '添加'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminHotKnowledgeConfig;
