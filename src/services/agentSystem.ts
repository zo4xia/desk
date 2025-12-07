/**
 * 🔒 CRITICAL_DO_NOT_DELETE - Agent核心系统
 * 
 * 本文件是「考试作弊四人组」架构的核心实现
 * - Agent A (眼睛): 监听用户输入，传递给B
 * - Agent B (瘩子): 调用API，直接输出给用户 (B直出版)
 * - Agent C (小抄): 本地数据查询
 * - Agent D (心): 系统监控和日志
 * 
 * @see 251207-1857-AGENTS.md - 战略详细提示
 * @see docs/考试作弊版Agent设计.md
 */
import { AgentID, ANPMessage, SharedContext } from '../../types';
import * as geminiService from './geminiService';
import { agentLogService } from './agentD';

type MessageHandler = (msg: ANPMessage) => Promise<void>;

// 改进的请求管理器
class RequestManager {
  private timeouts = new Map<string, NodeJS.Timeout>();
  private pendingRequests = new Set<string>();

  createRequest(
    requestId: string,
    timeoutMs: number = 10000
  ): Promise<boolean> {
    if (this.pendingRequests.has(requestId)) {
      console.warn(`Request ${requestId} already pending`);
      return Promise.resolve(false);
    }

    this.pendingRequests.add(requestId);

    const timeout = setTimeout(() => {
      this.cancelRequest(requestId);
      console.error(`Request ${requestId} timed out after ${timeoutMs}ms`);
    }, timeoutMs);

    this.timeouts.set(requestId, timeout);
    return Promise.resolve(true);
  }

  cancelRequest(requestId: string) {
    if (this.timeouts.has(requestId)) {
      clearTimeout(this.timeouts.get(requestId)!);
      this.timeouts.delete(requestId);
    }
    this.pendingRequests.delete(requestId);
  }

  cleanup() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.pendingRequests.clear();
  }

  isRequestPending(requestId: string): boolean {
    return this.pendingRequests.has(requestId);
  }

  getPendingRequests(): string[] {
    return Array.from(this.pendingRequests);
  }
}

// 改进的Agent网络系统
class AgentNetwork {
  private listeners: Record<string, MessageHandler> = {};
  private sharedContext: SharedContext = {
    userSession: { history: [], litSpots: [] },
    systemStatus: { agentHealth: {}, pendingTasks: 0 },
  };

  public requestManager = new RequestManager();
  private retryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    backoffMultiplier: 2,
  };
  private circuitBreakerConfig = {
    threshold: 5,
    timeout: 30000,
    failureCount: new Map<string, number>(),
    lastFailureTime: new Map<string, number>(),
    isOpen: new Map<string, boolean>(),
  };

  register(agentId: AgentID, handler: MessageHandler) {
    this.listeners[agentId] = handler;
    this.sharedContext.systemStatus.agentHealth[agentId] = 'online';
  }

  unregister(agentId: AgentID) {
    delete this.listeners[agentId];
    delete this.sharedContext.systemStatus.agentHealth[agentId];
  }

  async dispatchWithRetry(msg: ANPMessage, retries: number = 0): Promise<void> {
    const requestId = msg.id;

    try {
      // 检查熔断器状态
      const serviceName = this.getServiceName(msg);
      if (this.isCircuitBreakerOpen(serviceName)) {
        if (
          Date.now() -
            (this.circuitBreakerConfig.lastFailureTime.get(serviceName) || 0) <
          this.circuitBreakerConfig.timeout
        ) {
          throw new Error(`Circuit breaker is open for ${serviceName}`);
        } else {
          this.resetCircuitBreaker(serviceName);
        }
      }

      // 创建请求和超时控制
      const canProceed = await this.requestManager.createRequest(
        requestId,
        15000
      );
      if (!canProceed) return;

      await this.dispatch(msg);
      this.requestManager.cancelRequest(requestId);

      // 记录成功
      this.recordSuccess(serviceName);
    } catch (error) {
      this.requestManager.cancelRequest(requestId);

      const serviceName = this.getServiceName(msg);
      this.recordFailure(serviceName);

      if (retries < this.retryConfig.maxRetries) {
        const delay =
          this.retryConfig.baseDelay *
          Math.pow(this.retryConfig.backoffMultiplier, retries);
        console.log(
          `Retrying request ${requestId} in ${delay}ms (attempt ${retries + 1}/${this.retryConfig.maxRetries})`
        );

        setTimeout(() => {
          this.dispatchWithRetry(msg, retries + 1);
        }, delay);
      } else {
        console.error(
          `Request ${requestId} failed after ${this.retryConfig.maxRetries} retries:`,
          error
        );

        // 发送错误响应
        this.dispatch({
          id: `err_${Date.now()}`,
          timestamp: Date.now(),
          source: 'SYSTEM' as AgentID,
          target: msg.source,
          type: 'ERROR',
          action: 'request_failed',
          payload: {
            message: '请求失败，请稍后重试',
            originalRequest: msg,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }
  }

  public async dispatch(msg: ANPMessage): Promise<void> {
    this.monitor(msg);

    if (msg.target === 'BROADCAST') {
      const dispatchPromises = Object.values(this.listeners).map(handler =>
        handler(msg).catch(error => {
          console.error('Broadcast handler error:', error);
        })
      );
      await Promise.allSettled(dispatchPromises);
    } else if (this.listeners[msg.target]) {
      await this.listeners[msg.target](msg);
    }
  }

  private monitor(msg: ANPMessage) {
    if (msg.type === 'EVENT' && msg.action === 'context_update') {
      this.sharedContext = { ...this.sharedContext, ...msg.payload };
    }
    if (msg.source === 'USER' && msg.action === 'query') {
      this.sharedContext.userSession.history.push(msg.payload.text);
    }
  }

  private getServiceName(msg: ANPMessage): string {
    if (msg.action === 'call_tool') {
      const toolName = msg.payload?.toolName;
      return `tool:${toolName || 'unknown'}`;
    }
    return `agent:${msg.target}`;
  }

  private isCircuitBreakerOpen(serviceName: string): boolean {
    const failureCount =
      this.circuitBreakerConfig.failureCount.get(serviceName) || 0;
    const isOpen = this.circuitBreakerConfig.isOpen.get(serviceName) || false;

    return isOpen || failureCount >= this.circuitBreakerConfig.threshold;
  }

  private recordFailure(serviceName: string) {
    const failures =
      (this.circuitBreakerConfig.failureCount.get(serviceName) || 0) + 1;
    this.circuitBreakerConfig.failureCount.set(serviceName, failures);
    this.circuitBreakerConfig.lastFailureTime.set(serviceName, Date.now());

    if (failures >= this.circuitBreakerConfig.threshold) {
      this.circuitBreakerConfig.isOpen.set(serviceName, true);
      console.warn(
        `Circuit breaker opened for ${serviceName} due to ${failures} failures`
      );
    }
  }

  private recordSuccess(serviceName: string) {
    this.circuitBreakerConfig.failureCount.set(serviceName, 0);
    this.circuitBreakerConfig.isOpen.set(serviceName, false);
  }

  private resetCircuitBreaker(serviceName: string) {
    this.circuitBreakerConfig.failureCount.set(serviceName, 0);
    this.circuitBreakerConfig.isOpen.set(serviceName, false);
    this.circuitBreakerConfig.lastFailureTime.delete(serviceName);
  }

  cancelPendingRequests(agentId?: string) {
    if (agentId) {
      this.unregister(agentId as AgentID);
    }
    this.requestManager.cleanup();
  }

  getSystemHealth() {
    const agentHealth = Object.entries(
      this.sharedContext.systemStatus.agentHealth
    ).map(([agentId, status]) => ({
      agentId,
      status,
      pendingRequests: this.requestManager
        .getPendingRequests()
        .filter(req => req.includes(agentId)).length,
    }));

    const circuitBreakerStatus = Object.fromEntries(
      Array.from(this.circuitBreakerConfig.failureCount.entries()).map(
        ([service, count]) => [
          service,
          {
            failures: count,
            isOpen: this.circuitBreakerConfig.isOpen.get(service) || false,
            lastFailure:
              this.circuitBreakerConfig.lastFailureTime.get(service) || null,
          },
        ]
      )
    );

    return {
      agentsOnline: agentHealth,
      totalPendingRequests: this.requestManager.getPendingRequests().length,
      circuitBreakers: circuitBreakerStatus,
      timestamp: Date.now(),
    };
  }

  getContext() {
    return this.sharedContext;
  }
}

export const Network = new AgentNetwork();

// 工具注册
const tools = {
  voice_interaction: geminiService.voiceInteraction,
  object_recognition: geminiService.objectRecognition,
  get_shopping_info: geminiService.getShoppingInfo,
  get_related_knowledge: geminiService.getRelatedKnowledge,
  get_map: geminiService.getStaticMapImage,
};

// Agent B: 工具执行器 + 日志记录 + B→D直推
Network.register('B', async (msg: ANPMessage) => {
  if (msg.type === 'REQUEST' && msg.action === 'call_tool') {
    const { toolName, params, uid = 'anonymous' } = msg.payload;
    const startTime = Date.now();

    try {
      const tool = tools[toolName as keyof typeof tools];
      if (!tool) throw new Error(`Tool ${toolName} not found`);

      // 添加超时控制
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tool execution timeout')), 30000)
      );

      const result = await Promise.race([
        (tool as any)(...params),
        timeoutPromise,
      ]);
      const responseTime = Date.now() - startTime;

      // 🎯 记录B的输出（成功）+ 自动推送到D
      agentLogService.logBOutput({
        uid,
        toolName,
        success: true,
        responseTime,
        result: typeof result === 'string' ? result.substring(0, 200) : result,
      });

      Network.dispatch({
        id: `resp_${Date.now()}`,
        timestamp: Date.now(),
        source: 'B',
        target: msg.source,
        type: 'RESPONSE',
        action: 'tool_result',
        payload: { ...result, uid },
      });

      // 发送上下文更新事件
      if (params[0] && typeof params[0] === 'string') {
        Network.dispatch({
          id: `evt_${Date.now()}`,
          timestamp: Date.now(),
          source: 'B',
          target: 'A',
          type: 'EVENT',
          action: 'context_update',
          payload: { userSession: { currentSpot: params[0], uid } },
        });
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('Tool execution failed:', error);

      // 🎯 记录B的输出（失败）
      agentLogService.logBOutput({
        uid,
        toolName,
        success: false,
        responseTime,
        error: error.message || 'Unknown error',
      });

      Network.dispatch({
        id: `err_${Date.now()}`,
        timestamp: Date.now(),
        source: 'B',
        target: msg.source,
        type: 'ERROR',
        action: 'tool_failed',
        payload: {
          message: error.message || '工具执行失败',
          toolName,
          uid,
          error: error.stack,
        },
      });
    }
  }
});

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
  // 其他 - 需要AI啴唰
  return { tool: 'voice_interaction', needsAI: true, category: '智能对话' };
}

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
    contextSpot: string,
    inputType: 'text' | 'voice' | 'photo' = 'text',
    options?: { signal?: AbortSignal }
  ): Promise<any> => {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${uid.substring(0, 6)}`;

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

    return new Promise((resolve, reject) => {
      // 设置请求取消监听
      if (options?.signal) {
        options.signal.addEventListener('abort', () => {
          Network.requestManager.cancelRequest(requestId);

          // 🎯 A失败也代码通知D
          agentLogService.logBOutput({
            uid,
            toolName: `A_CANCELLED_${toolName}`,
            success: false,
            responseTime: Date.now() - startTime,
            error: 'Request was cancelled',
          });

          reject(new Error('Request was cancelled'));
        });
      }

      const responseHandler = async (msg: ANPMessage) => {
        try {
          if (msg.type === 'RESPONSE' || msg.type === 'ERROR') {
            const responseTime = Date.now() - startTime;

            if (msg.type === 'ERROR') {
              // 🎯 A→B失败，代码通知D
              agentLogService.logBOutput({
                uid,
                toolName: `A_ERROR_${toolName}`,
                success: false,
                responseTime,
                error: msg.payload.message || '服务失败',
              });

              reject(new Error(msg.payload.message || '服务暂时不可用'));
            } else {
              // 🎯 A→B成功，代码通知D
              agentLogService.logBOutput({
                uid,
                toolName: `A_OK_${toolName}`,
                success: true,
                responseTime,
                result: { category, needsAI },
              });

              // 🎯 记录聊天历史
              agentLogService.addChatMessage({
                uid,
                role: 'user',
                content: text,
              });
              agentLogService.addChatMessage({
                uid,
                role: 'assistant',
                content:
                  typeof msg.payload === 'string'
                    ? msg.payload
                    : JSON.stringify(msg.payload).substring(0, 200),
                source: needsAI ? 'AI' : 'C小抄',
                cost: needsAI ? 0.1 : 0,
              });

              resolve(msg.payload);
            }
          }
        } catch (error) {
          reject(error);
        }
      };

      Network.register('A', responseHandler);

      try {
        // 🎯 打包发给B：uid + 问题 + 工具（B不用动脑子）
        Network.dispatchWithRetry({
          id: requestId,
          timestamp: Date.now(),
          source: 'A',
          target: 'B',
          type: 'REQUEST',
          action: 'call_tool',
          payload: {
            uid, // 用户ID
            toolName, // A已经决定用什么工具
            params, // 工具参数
            question: text, // 原始问题
            needsAI, // 是否需要AI
            category, // 分类
          },
        });
      } catch (error) {
        Network.unregister('A');

        // 🎯 A异常也通知D
        agentLogService.logBOutput({
          uid,
          toolName: `A_EXCEPTION_${toolName}`,
          success: false,
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        reject(error);
      }
    });
  },
};

// 导出网络监控功能
export const NetworkMonitor = {
  getHealth: () => Network.getSystemHealth(),
  cancelAllRequests: () => Network.cancelPendingRequests(),
  getContext: () => Network.getContext(),
};
