// src/components/PerformanceMonitor.tsx
import React, { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  cacheHitRate: number;
  apiResponseTime: number;
  memoryUsage: number;
  fps: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    cacheHitRate: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    fps: 60,
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<number[]>([]);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  // 模拟性能数据更新
  useEffect(() => {
    if (!isVisible) return;
    
    const updateMetrics = () => {
      // 模拟性能指标
      const newMetrics: PerformanceMetrics = {
        renderTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
        cacheHitRate: Math.floor(Math.random() * 30) + 70, // 70-100%
        apiResponseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        memoryUsage: Math.floor(Math.random() * 100) + 50, // 50-150MB
        fps: Math.floor(Math.random() * 10) + 50, // 50-60 FPS
      };
      
      setMetrics(newMetrics);
      
      // 更新性能数据历史，用于图表
      setPerformanceData(prev => {
        const newData = [...prev, newMetrics.renderTime];
        return newData.length > 20 ? newData.slice(-20) : newData;
      });
      
      requestRef.current = requestAnimationFrame(updateMetrics);
    };
    
    requestRef.current = requestAnimationFrame(updateMetrics);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isVisible]);
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#1677ff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          zIndex: 10000,
          fontSize: '16px',
        }}
      >
        ⚡
      </button>
    );
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 10000,
        fontFamily: 'monospace',
        fontSize: '12px',
        minWidth: '250px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#1677ff' }}>性能监控</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>渲染时间:</span>
          <span style={{ 
            color: metrics.renderTime < 30 ? '#52c41a' : metrics.renderTime < 50 ? '#faad14' : '#ff4d4f' 
          }}>
            {metrics.renderTime}ms
          </span>
        </div>
        <div style={{ height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${Math.min(100, metrics.renderTime)}%`, 
              backgroundColor: metrics.renderTime < 30 ? '#52c41a' : metrics.renderTime < 50 ? '#faad14' : '#ff4d4f',
              transition: 'width 0.3s ease'
            }} 
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>缓存命中率:</span>
          <span style={{ color: metrics.cacheHitRate > 85 ? '#52c41a' : '#faad14' }}>
            {metrics.cacheHitRate}%
          </span>
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>API响应:</span>
          <span style={{ 
            color: metrics.apiResponseTime < 100 ? '#52c41a' : metrics.apiResponseTime < 200 ? '#faad14' : '#ff4d4f' 
          }}>
            {metrics.apiResponseTime}ms
          </span>
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>内存使用:</span>
          <span>{metrics.memoryUsage}MB</span>
        </div>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>FPS:</span>
          <span style={{ 
            color: metrics.fps > 55 ? '#52c41a' : metrics.fps > 30 ? '#faad14' : '#ff4d4f' 
          }}>
            {metrics.fps}
          </span>
        </div>
      </div>
      
      {/* 简单的性能图表 */}
      <div style={{ marginTop: '10px', height: '30px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: '1px' }}>
          {performanceData.map((value, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: `${Math.min(100, (value / 60) * 100)}%`,
                backgroundColor: value < 30 ? '#52c41a' : value < 50 ? '#faad14' : '#ff4d4f',
                minWidth: '2px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;