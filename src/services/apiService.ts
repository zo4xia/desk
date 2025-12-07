/**
 * 前台API服务
 * 处理移动端页面与后端API的对接
 */

// API基础配置
const API_BASE_URL = 'http://localhost:3001/api';

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`API请求失败:`, error);
    throw error;
  }
}

// 景点API
export const spotsApi = {
  // 获取景点列表
  getSpots: async (params?: {
    category?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request<any[]>(`/spots${queryString}`);
  },

  // 获取景点详情
  getSpotById: async (id: string) => {
    return request<any>(`/spots/${id}`);
  }
};

// 人物API
export const figuresApi = {
  // 获取人物列表
  getFigures: async (params?: {
    category?: string;
    type?: string;
    year?: number;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request<any[]>(`/figures${queryString}`);
  },

  // 获取人物详情
  getFigureById: async (id: string) => {
    return request<any>(`/figures/${id}`);
  }
};

// 公告API
export const announcementsApi = {
  // 获取公告列表
  getAnnouncements: async (params?: {
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request<any[]>(`/announcements${queryString}`);
  }
};

// 认证API
export const authApi = {
  // 发送验证码
  sendCode: async (phone: string) => {
    return request<{ message: string }>(`/auth/send-code`, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  // 用户登录
  login: async (phone: string, code: string) => {
    return request<{ user: any; token: string; message: string }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  }
};

// 用户API
export const userApi = {
  // 获取用户资料
  getProfile: async (token: string) => {
    return request<any>(`/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
};

// 打卡API
export const checkinApi = {
  // 提交打卡
  submitCheckin: async (token: string, spotId: string, spotName?: string) => {
    return request<any>(`/checkin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ spotId, spotName }),
    });
  },

  // 获取打卡记录
  getCheckinRecords: async (token: string) => {
    return request<any[]>(`/checkin/records`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
};

// 导出所有API服务
export const apiService = {
  spots: spotsApi,
  figures: figuresApi,
  announcements: announcementsApi,
  auth: authApi,
  user: userApi,
  checkin: checkinApi,
};