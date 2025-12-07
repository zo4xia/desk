/**
 * 🔒 CRITICAL_DO_NOT_DELETE - Agent A: 门面服务（眼睛）
 * 
 * 职责：接客 + 鸡贼胶囊过滤
 * - 接收用户输入（文字/语音/图片）
 * - 判断用什么工具（A动脑子）
 * - 打包发给B（B不动脑子）
 * 
 * 不做什么：
 * - 不直接调用AI
 * - 不直接返回给用户
 * - 不存储数据
 * 
 * 通信：
 * - 输入：用户请求
 * - 输出：打包给B（uid + 问题 + 工具）
 * - 回调：成功/失败都通知D
 */

import { agentLogService } from './agentD';

// 🎯 A哥输出记录类型
export interface AgentAOutput {
  id: string;
  timestamp: number;
  uid: string;
  inputType: 'text' | 'voice' | 'photo';
  question: string;
  tool: string;
  needsAI: boolean;
  success: boolean;
  error?: string;
}

// 意图解析函数 - 鸡贼胶囊过滤（A动脑子，B不动脑子）
function parseIntent(text: string): {
  tool: string;
  needsAI: boolean;
  category: string;
} {
  // 红色文化/历史类 - 优先查C小抄
  if (
    text.includes('历史') ||
    text.includes('知识') ||
    text.includes('故事') ||
    text.includes('革命') ||
    text.includes('红色') ||
    text.includes('纪念')
  ) {
    return {
      tool: 'get_related_knowledge',
      needsAI: false,
      category: '红色文化',
    };
  }
  // 购物/美食类 - 查附近商家
  if (
    text.includes('买') ||
    text.includes('吃') ||
    text.includes('特色') ||
    text.includes('美食') ||
    text.includes('商店')
  ) {
    return { tool: 'get_shopping_info', needsAI: false, category: '美食购物' };
  }
  // 地图/导航类
  if (
    text.includes('地图') ||
    text.includes('导航') ||
    text.includes('怎么走') ||
    text.includes('在哪')
  ) {
    return { tool: 'get_map', needsAI: false, category: '地图导航' };
  }
  // 其他 - 需要AI兜底
  return { tool: 'voice_interaction', needsAI: true, category: '智能对话' };
}

// Agent A: 门面服务 - 鸡贼胶囊设计
export const AgentA = {
  /**
   * 处理用户请求 - 鸡贼胶囊过滤
   * @param uid 用户ID（必须）
   * @param text 用户输入文本
   * @param contextSpot 当前景点
   * @param inputType 输入类型：text/voice/photo
   * @param options 可选配置
   */
  processUserRequest: async (
    uid: string,
    text: string,
    contextSpot: string = '东里村',
    inputType: 'text' | 'voice' | 'photo' = 'text',
    options?: { signal?: AbortSignal }
  ): Promise<{
    tool: string;
    needsAI: boolean;
    category: string;
    uid: string;
    question: string;
    params: any[];
  }> => {
    const startTime = Date.now();

    // 检查取消信号
    if (options?.signal?.aborted) {
      throw new Error('Request was cancelled');
    }

    // 🎯 鸡贼胶囊过滤：A动脑子判断用什么工具
    let toolName = 'voice_interaction';
    let params: any[] = [contextSpot, text];
    let needsAI = true;
    let category = '智能对话';

    if (inputType === 'photo') {
      toolName = 'object_recognition';
      params = [contextSpot];
      needsAI = true;
      category = '图片识别';
    } else {
      const intent = parseIntent(text);
      toolName = intent.tool;
      needsAI = intent.needsAI;
      category = intent.category;

      if (toolName === 'get_shopping_info') {
        params = ['118.205,25.235', contextSpot];
      } else if (toolName === 'get_related_knowledge') {
        params = [contextSpot];
      }
    }

    // 🎯 记录A的处理日志
    console.log(
      `[A哥鸡贼胶囊] uid=${uid} 输入=${inputType} 工具=${toolName} 需要AI=${needsAI}`
    );

    // 🎯 通知D：A处理完成
    agentLogService.logBOutput({
      uid,
      toolName: `A_PROCESS_${toolName}`,
      success: true,
      responseTime: Date.now() - startTime,
      result: { category, needsAI, inputType },
    });

    // 🎯 返回打包结果给B
    return {
      tool: toolName,
      needsAI,
      category,
      uid,
      question: text,
      params,
    };
  },

  // 快捷方法：解析意图（供外部调用）
  parseIntent,
};

export default AgentA;
