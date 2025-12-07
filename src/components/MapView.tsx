/**
 * MapView - 高德地图组件（独立封装，多页面复用）
 * 
 * 白嫖策略：
 * - 地图渲染：高德SDK
 * - 导航功能：跳转支付宝/微信
 * - 定位：写死中心坐标（实际导航时外部APP定位）
 * 
 * 功能：
 * - 1/3屏动态高度（移动端优先）
 * - 景点标记 + 分类颜色
 * - 点击气泡 + 导航/详情按钮
 * - 支持缩放
 */

import { useEffect, useRef, useCallback } from 'react';
import { Spot } from '../../types';
import { openMapNavigation } from '../utils/mapUtils';

// 分类颜色配置
const CATEGORY_COLORS: Record<string, string> = {
  red: '#dc2626',      // 红色文旅
  nature: '#16a34a',   // 自然风光
  culture: '#ca8a04',  // 文化民俗
  people: '#2563eb',   // 东里人物
  media: '#9333ea',    // 自媒体
  event: '#ea580c',    // 活动公告
  default: '#64748b',  // 默认灰色
};

interface MapViewProps {
  spots: Spot[];                          // 景点数据
  center?: [number, number];              // 地图中心 [lng, lat]
  zoom?: number;                          // 缩放级别
  heightRatio?: number;                   // 高度占比，默认0.333（1/3屏）
  onSelectSpot?: (spot: Spot) => void;    // 点击景点回调
  onNavigate?: (spot: Spot) => void;      // 点击导航回调
}

const MapView: React.FC<MapViewProps> = ({
  spots,
  center = [118.205, 25.235],  // 东里村中心坐标
  zoom = 16.5,
  heightRatio = 0.333,
  onSelectSpot,
  onNavigate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<AMap.Map | null>(null);
  const markersRef = useRef<AMap.Marker[]>([]);
  const infoWindowRef = useRef<AMap.InfoWindow | null>(null);

  // 动态设置地图高度为视口高度的指定比例（移动端优先）
  useEffect(() => {
    const updateMapHeight = () => {
      if (mapContainerRef.current) {
        const viewportHeight = window.innerHeight;
        mapContainerRef.current.style.height = `${viewportHeight * heightRatio}px`;
      }
    };

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    return () => window.removeEventListener('resize', updateMapHeight);
  }, [heightRatio]);

  // 显示气泡窗口
  const showInfoWindow = useCallback((map: AMap.Map, spot: Spot, position: [number, number]) => {
    const color = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.default;
    
    // 关闭之前的气泡
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // 精致气泡卡片
    const infoContent = document.createElement('div');
    infoContent.style.cssText = 'animation: fadeIn 0.2s ease-out;';
    infoContent.innerHTML = `
      <div style="
        width: 90vw;
        max-width: 280px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1);
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.8);
      ">
        <!-- 顶部彩条 -->
        <div style="height: 4px; background: ${color};"></div>
        
        <!-- 内容区 -->
        <div style="padding: 16px;">
          <h4 style="
            font-size: clamp(14px, 4vw, 18px);
            font-weight: 700;
            color: ${color};
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span style="
              width: clamp(20px, 5vw, 28px);
              height: clamp(20px, 5vw, 28px);
              background: ${color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: clamp(10px, 2.5vw, 14px);
            ">${spot.name.substring(0, 1)}</span>
            ${spot.name}
          </h4>
          
          <p style="
            font-size: clamp(11px, 3vw, 13px);
            color: #64748b;
            line-height: 1.6;
            margin: 0 0 16px 0;
          ">
            ${spot.intro_short.length > 60 ? spot.intro_short.substring(0, 60) + '...' : spot.intro_short}
          </p>
          
          <!-- 按钮区 -->
          <div style="display: flex; gap: 10px;">
            <button id="detail-btn" style="
              flex: 1;
              padding: clamp(6px, 2vw, 10px) clamp(10px, 3vw, 16px);
              background: ${color};
              color: white;
              border: none;
              border-radius: 25px;
              font-size: clamp(12px, 3vw, 14px);
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            ">📖 查看详情</button>
            <button id="nav-btn" style="
              flex: 1;
              padding: clamp(6px, 2vw, 10px) clamp(10px, 3vw, 16px);
              background: #f1f5f9;
              color: #475569;
              border: 1px solid #e2e8f0;
              border-radius: 25px;
              font-size: clamp(12px, 3vw, 14px);
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            ">🧭 导航去</button>
          </div>
        </div>
      </div>
    `;

    const infoWindow = new window.AMap.InfoWindow({
      content: infoContent,
      offset: new window.AMap.Pixel(0, -30),
      isCustom: true,
    });

    infoWindowRef.current = infoWindow;
    infoWindow.open(map, position);

    // 绑定按钮事件
    setTimeout(() => {
      const navBtn = infoContent.querySelector('#nav-btn');
      const detailBtn = infoContent.querySelector('#detail-btn');
      
      if (navBtn) {
        navBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const [lng, lat] = spot.coord.split(',').map(Number);
          if (onNavigate) {
            onNavigate(spot);
          } else {
            // 默认调用高德导航
            openMapNavigation(lat, lng, spot.name);
          }
        });
      }
      
      if (detailBtn) {
        detailBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectSpot?.(spot);
        });
      }
    }, 0);
  }, [onSelectSpot, onNavigate]);

  // 渲染景点标记
  const renderMarkers = useCallback((map: AMap.Map) => {
    // 清除旧标记
    markersRef.current.forEach(marker => map.remove(marker));
    markersRef.current = [];

    spots.forEach(spot => {
      if (!spot.coord) return;
      
      const [lng, lat] = spot.coord.split(',').map(Number);
      if (isNaN(lng) || isNaN(lat)) return;

      const color = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.default;

      // 美化标记点
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          <!-- 圆形标记 -->
          <div style="
            width: 36px;
            height: 36px;
            background: ${color};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">${spot.name.substring(0, 1)}</div>
          <!-- 名称标签 -->
          <div style="
            margin-top: 4px;
            padding: 3px 8px;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(4px);
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            color: #374151;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid rgba(0,0,0,0.05);
            white-space: nowrap;
          ">${spot.name}</div>
          <!-- 小三角指示器 -->
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${color};
            margin-top: -2px;
          "></div>
        </div>
      `;

      const marker = new window.AMap.Marker({
        position: [lng, lat],
        content: markerElement,
        title: spot.name,
        extData: spot,
      });

      marker.on('click', () => {
        showInfoWindow(map, spot, [lng, lat]);
      });

      map.add(marker);
      markersRef.current.push(marker);
    });
  }, [spots, showInfoWindow]);

  // 地图初始化
  useEffect(() => {
    if (!window.AMap || !mapContainerRef.current) {
      console.warn('高德地图SDK未加载或容器不存在');
      return;
    }

    // 避免重复初始化
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current);
      return;
    }

    const map = new window.AMap.Map(mapContainerRef.current, {
      zoom,
      center,
      viewMode: '3D',
      pitch: 35,
      // 支持缩放和拖拽
      scrollWheel: true,
      dragEnable: true,
      zoomEnable: true,
      // 地图样式（清爽风格）
      mapStyle: 'amap://styles/fresh',
    });

    // 添加缩放控件（右下角）
    map.addControl?.(new window.AMap.Scale());
    map.addControl?.(new window.AMap.ToolBar({ position: 'RB' }));

    mapInstanceRef.current = map;
    renderMarkers(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, renderMarkers]);

  // spots变化时重新渲染标记
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current);
    }
  }, [spots, renderMarkers]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        minHeight: '200px',
        backgroundColor: '#e8f5e9',
      }}
    >
      {/* 地图加载中的占位 */}
      {!window.AMap && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <span>🗺️ 地图加载中...</span>
        </div>
      )}
    </div>
  );
};

export default MapView;
