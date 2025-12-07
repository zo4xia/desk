import { useState, useEffect } from 'react';
import { NavBar, Card, Tag, Empty, PullToRefresh, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import './global.css';

/**
 * 公告板页 - 自媒体动态/村务通知
 */

interface Announcement {
  id: string;
  type: 'video' | 'activity' | 'notice';
  title: string;
  summary: string;
  date: string;
  source: string;
  cover?: string;
}

const AnnouncementPage = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      type: 'video',
      title: '东里村春节民俗活动精彩回顾',
      summary: '记录了今年春节期间的舞龙舞狮、庙会等传统民俗活动...',
      date: '2025-02-15',
      source: '东里村官方号',
    },
    {
      id: '2',
      type: 'activity',
      title: '清明祭英烈活动报名通知',
      summary: '组织村民前往烈士陵园祭扫，缅怀革命先烈...',
      date: '2025-03-20',
      source: '村委会',
    },
    {
      id: '3',
      type: 'notice',
      title: '农村环境整治工作安排',
      summary: '关于开展春季农村人居环境整治工作的通知...',
      date: '2025-03-01',
      source: '村委会',
    },
    {
      id: '4',
      type: 'video',
      title: '东里古樟探秘｜300年树龄的故事',
      summary: '带你走进东里村最古老的樟树，聆听它见证的历史...',
      date: '2025-02-28',
      source: '文旅小助手',
    },
    {
      id: '5',
      type: 'activity',
      title: '乡村振兴志愿者招募',
      summary: '诚邀热心乡村振兴事业的朋友加入我们...',
      date: '2025-03-10',
      source: '村委会',
    },
  ];

  useEffect(() => {
    setAnnouncements(mockAnnouncements);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnnouncements(mockAnnouncements);
    setLoading(false);
    Toast.show({ content: '刷新成功', position: 'bottom' });
  };

  const getTypeTag = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <Tag color="primary" fill="outline">
            📹 视频
          </Tag>
        );
      case 'activity':
        return (
          <Tag color="success" fill="outline">
            🎉 活动
          </Tag>
        );
      case 'notice':
        return (
          <Tag color="warning" fill="outline">
            📢 通知
          </Tag>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: '0 auto',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* 顶部导航 */}
      <NavBar
        onBack={handleBack}
        style={
          {
            '--height': '50px',
            backgroundColor: '#f3e5f5',
            borderBottom: '1px solid #e8e8e8',
          } as any
        }
      >
        公告动态
      </NavBar>

      {/* 公告列表 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            minHeight: '700px',
          }}
        >
          {announcements.length > 0 ? (
            announcements.map(item => (
              <Card
                key={item.id}
                className="cute-bounce"
                style={{
                  borderRadius: '16px',
                  marginBottom: '12px',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 0 0 2px #fff inset',
                }}
                onClick={() => {
                  Toast.show({ content: `查看: ${item.title}`, position: 'bottom' });
                }}
              >
                {/* 标签和日期 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  {getTypeTag(item.type)}
                  <span style={{ fontSize: '12px', color: '#a0aec0' }}>
                    {item.date}
                  </span>
                </div>

                {/* 标题 */}
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#2d3748',
                    marginBottom: '6px',
                    lineHeight: '1.4',
                  }}
                >
                  {item.title}
                </div>

                {/* 摘要 */}
                <div
                  style={{
                    fontSize: '13px',
                    color: '#718096',
                    lineHeight: '1.5',
                    marginBottom: '8px',
                  }}
                >
                  {item.summary}
                </div>

                {/* 来源 */}
                <div style={{ fontSize: '11px', color: '#a0aec0' }}>
                  来源: {item.source}
                </div>
              </Card>
            ))
          ) : (
            <Empty description="暂无公告动态" />
          )}
        </div>
      </PullToRefresh>
    </div>
  );
};

export default AnnouncementPage;
