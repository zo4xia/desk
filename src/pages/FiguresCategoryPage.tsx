import { NavBar, List, Badge, Empty } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import './global.css';

/**
 * 东里人物子分类页 - 烈士/乡贤/大学生分类
 */

interface FigureCategory {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  count: number;
  color: string;
  path: string;
}

const FiguresCategoryPage = () => {
  const navigate = useNavigate();

  const figureCategories: FigureCategory[] = [
    {
      id: 'martyrs',
      icon: '🎖️',
      title: '革命烈士',
      subtitle: '英雄事迹·红色记忆',
      count: 12,
      color: '#ffebee',
      path: '/spotlist/martyrs',
    },
    {
      id: 'sages',
      icon: '📜',
      title: '历史乡贤',
      subtitle: '先贤典范·文化传承',
      count: 8,
      color: '#fff3e0',
      path: '/spotlist/sages',
    },
    {
      id: 'students',
      icon: '🎓',
      title: '大学生花名册',
      subtitle: '东里骄子·人才榜样',
      count: 45,
      color: '#e3f2fd',
      path: '/figures/students',
    },
    {
      id: 'contemporary',
      icon: '⭐',
      title: '当代乡贤',
      subtitle: '时代先锋·乡村振兴',
      count: 6,
      color: '#e8f5e9',
      path: '/spotlist/contemporary',
    },
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleCategoryClick = (path: string) => {
    navigate(path);
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
            backgroundColor: '#e3f2fd',
            borderBottom: '1px solid #e8e8e8',
          } as any
        }
      >
        东里人物
      </NavBar>

      {/* 分类列表 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {figureCategories.length > 0 ? (
          figureCategories.map(category => (
            <div
              key={category.id}
              className="cute-bounce"
              onClick={() => handleCategoryClick(category.path)}
              style={{
                backgroundColor: category.color,
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                border: '1px solid #e8e8e8',
                boxShadow: '0 0 0 2px #fff inset',
              }}
            >
              {/* 图标 */}
              <div
                style={{
                  width: 'clamp(40px, 12vw, 50px)',
                  height: 'clamp(40px, 12vw, 50px)',
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginRight: '14px',
                }}
              >
                {category.icon}
              </div>

              {/* 内容 */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#2d3748',
                    marginBottom: '4px',
                  }}
                >
                  {category.title}
                  <Badge
                    content={category.count}
                    style={{
                      '--right': '-12px',
                      '--top': '-2px',
                      marginLeft: '8px',
                    }}
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#718096' }}>
                  {category.subtitle}
                </div>
              </div>

              {/* 箭头 */}
              <RightOutline style={{ fontSize: '16px', color: '#a0aec0' }} />
            </div>
          ))
        ) : (
          <Empty description="暂无人物分类" />
        )}
      </div>

      {/* 底部提示 */}
      <div
        style={{
          padding: '12px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#a0aec0',
          borderTop: '1px solid #e8e8e8',
          backgroundColor: '#fff',
        }}
      >
        点击分类查看详细名单
      </div>
    </div>
  );
};

export default FiguresCategoryPage;
