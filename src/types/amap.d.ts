/**
 * 高德地图 AMap 类型声明
 */

declare namespace AMap {
  class Map {
    constructor(container: HTMLElement | string, options?: MapOptions);
    add(overlays: Marker | Marker[]): void;
    remove(overlays: Marker | Marker[]): void;
    destroy(): void;
    setCenter(center: [number, number]): void;
    setZoom(zoom: number): void;
    getCenter(): LngLat;
    getZoom(): number;
    addControl(control: Scale | ToolBar): void;
  }

  interface MapOptions {
    zoom?: number;
    center?: [number, number];
    viewMode?: '2D' | '3D';
    pitch?: number;
    rotation?: number;
    mapStyle?: string;
    scrollWheel?: boolean;
    dragEnable?: boolean;
    zoomEnable?: boolean;
  }

  class Marker {
    constructor(options?: MarkerOptions);
    setPosition(position: [number, number]): void;
    getPosition(): LngLat;
    setContent(content: string | HTMLElement): void;
    on(event: string, handler: (e: any) => void): void;
    getExtData(): any;
  }

  interface MarkerOptions {
    position?: [number, number];
    content?: string | HTMLElement;
    title?: string;
    offset?: Pixel;
    extData?: any;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    open(map: Map, position: [number, number]): void;
    close(): void;
    setContent(content: string | HTMLElement): void;
    getContent(): HTMLElement | null;
    on(event: string, handler: (e: any) => void): void;
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement;
    offset?: Pixel;
    anchor?: string;
    isCustom?: boolean;
  }

  class Pixel {
    constructor(x: number, y: number);
  }

  class LngLat {
    constructor(lng: number, lat: number);
    getLng(): number;
    getLat(): number;
  }

  // 控件类
  class Scale {
    constructor(options?: { position?: string });
  }

  class ToolBar {
    constructor(options?: { position?: string });
  }
}

interface Window {
  AMap: typeof AMap;
}
