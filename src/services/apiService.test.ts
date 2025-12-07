/**
 * API服务测试文件
 */

import { apiService } from './apiService';

// 测试API服务
async function testApiService() {
  console.log('开始测试API服务...');
  
  try {
    // 测试健康检查接口
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('健康检查响应:', healthData);
    
    // 测试获取景点列表
    const spotsResponse = await apiService.spots.getSpots();
    console.log('景点列表响应:', spotsResponse);
    
    // 测试获取公告列表
    const announcementsResponse = await apiService.announcements.getAnnouncements();
    console.log('公告列表响应:', announcementsResponse);
    
    console.log('API服务测试完成');
  } catch (error) {
    console.error('API服务测试失败:', error);
  }
}

// 运行测试
testApiService();