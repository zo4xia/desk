/**
 * API连通性测试脚本
 * 用于验证前后端API接口的连通性
 */

import { apiService } from './src/services/apiService';

async function testApiConnectivity() {
  console.log('🧪 开始测试API连通性...\n');

  // 测试认证API
  console.log('🔐 测试认证API...');
  try {
    // 测试发送验证码
    const sendCodeResult = await apiService.auth.sendCode('13800138000');
    console.log('✅ sendCode API调用成功:', sendCodeResult);
  } catch (error) {
    console.log('❌ sendCode API调用失败:', error);
  }

  try {
    // 测试登录
    const loginResult = await apiService.auth.login('13800138000', '123456');
    console.log('✅ login API调用成功:', loginResult);
  } catch (error) {
    console.log('❌ login API调用失败:', error);
  }

  // 测试景点API
  console.log('\n🏞️ 测试景点API...');
  try {
    const spotsResult = await apiService.spots.getSpots({ page: 1, limit: 10 });
    console.log('✅ getSpots API调用成功:', spotsResult);
  } catch (error) {
    console.log('❌ getSpots API调用失败:', error);
  }

  try {
    const spotDetailResult = await apiService.spots.getSpotById('1');
    console.log('✅ getSpotById API调用成功:', spotDetailResult);
  } catch (error) {
    console.log('❌ getSpotById API调用失败:', error);
  }

  // 测试人物API
  console.log('\n👥 测试人物API...');
  try {
    const figuresResult = await apiService.figures.getFigures({ page: 1, limit: 10 });
    console.log('✅ getFigures API调用成功:', figuresResult);
  } catch (error) {
    console.log('❌ getFigures API调用失败:', error);
  }

  try {
    const figureDetailResult = await apiService.figures.getFigureById('1');
    console.log('✅ getFigureById API调用成功:', figureDetailResult);
  } catch (error) {
    console.log('❌ getFigureById API调用失败:', error);
  }

  // 测试公告API
  console.log('\n📢 测试公告API...');
  try {
    const announcementsResult = await apiService.announcements.getAnnouncements({ page: 1, limit: 10 });
    console.log('✅ getAnnouncements API调用成功:', announcementsResult);
  } catch (error) {
    console.log('❌ getAnnouncements API调用失败:', error);
  }

  console.log('\n🎉 API连通性测试完成！');
}

// 运行测试
testApiConnectivity().catch(console.error);