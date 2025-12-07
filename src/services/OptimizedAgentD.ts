/**
 * 🔒 CRITICAL_DO_NOT_DELETE - Agent D: 心脏服务（后台监控）- 优化版
 * 
 * 职责：记录 + 统计 + 预警
 * - 接收B的输出记录
 * - 维护用户统计（查询次数、成本、活跃度）
 * - 存储聊天历史
 * - 提供后台监控数据
 * 
 * 不做什么：
 * - 不参与用户交互
 * - 不调用AI
 * - 不做业务逻辑判断
 * 
 * 通信：
 * - 输入：B的输出记录（代码直推）
 * - 输出：统计数据、监控报表
 * 
 * 鸡贼设计：代码直推，不走AI
 */

// === 类型定义 ===

export interface AgentBOutput {
  id: string;
  timestamp: number;
  uid: string; // 用户ID
  toolName: string; // 调用的工具
  success: boolean; // 是否成功
  responseTime: number; // 响应时间(ms)
  result?: any; // 输出结果
  error?: string; // 错误信息
}

export interface BtoDPush {
  id: string;
  timestamp: number;
  uid: string; // 用户ID
  outputId: string; // 对应的B output ID
  pushType: 'cost' | 'usage' | 'session' | 'alert';
  data: any; // 推送的数据
  success: boolean;
}

export interface ChatMessage {
  id: string;
  uid: string;
  timestamp: number;
  role: 'user' | 'assistant';
  content: string;
  source?: 'C小抄' | 'AI' | 'MCP'; // 数据来源
  cost?: number; // 本次成本
}

export interface UserStats {
  uid: string;
  totalQueries: number;
  totalCost: number;
  lastActive: number;
  sessionCount: number;
}

// === 存储键 ===

const STORAGE_KEYS = {
  B_OUTPUTS: 'agent_b_outputs',
  B_TO_D_PUSHES: 'agent_b_to_d_pushes',
  CHAT_HISTORY: 'chat_history',
  USER_STATS: 'user_stats',
};

// === 优化的 Agent D 实现 ===

class OptimizedAgentD {
  private bOutputs: AgentBOutput[] = [];
  private btoDPushes: BtoDPush[] = [];
  private chatHistory: Map<string, ChatMessage[]> = new Map();
  private userStats: Map<string, UserStats> = new Map();
  private listeners: Set<() => void> = new Set();
  
  // 性能优化配置
  private readonly MAX_B_OUTPUTS = 1000; // 最大B输出记录数
  private readonly MAX_B_TO_D_PUSHES = 500; // 最大推送记录数
  private readonly MAX_CHAT_HISTORY_PER_USER = 50; // 每个用户最大聊天记录数
  private readonly LOG_CLEANUP_INTERVAL = 300000; // 5分钟清理间隔
  private readonly LOG_CLEANUP_TIMER: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();
    this.setupLogCleanup();
  }

  // === B Output 记录 - 优化版 ===

  logBOutput(output: Omit<AgentBOutput, 'id' | 'timestamp'>): AgentBOutput {
    const record: AgentBOutput = {
      id: `bout_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      ...output,
    };

    this.bOutputs.push(record);

    // 限制记录数量以提高性能
    if (this.bOutputs.length > this.MAX_B_OUTPUTS) {
      this.bOutputs = this.bOutputs.slice(-this.MAX_B_OUTPUTS);
    }

    this.saveToStorage(STORAGE_KEYS.B_OUTPUTS, this.bOutputs);
    this.notifyListeners();

    // 🎯 鸡贼设计：B输出成功后，代码直推到D
    if (output.success) {
      this.pushToD(record);
    }

    return record;
  }

  // === B→D 代码直推（鸡贼模式）- 优化版 ===

  private pushToD(bOutput: AgentBOutput): void {
    const pushRecord: BtoDPush = {
      id: `push_${Date.now()}`,
      timestamp: Date.now(),
      uid: bOutput.uid,
      outputId: bOutput.id,
      pushType: 'usage',
      data: {
        toolName: bOutput.toolName,
        responseTime: bOutput.responseTime,
        success: bOutput.success,
      },
      success: true,
    };

    this.btoDPushes.push(pushRecord);

    // 限制推送记录数量
    if (this.btoDPushes.length > this.MAX_B_TO_D_PUSHES) {
      this.btoDPushes = this.btoDPushes.slice(-this.MAX_B_TO_D_PUSHES);
    }

    // 更新用户统计
    this.updateUserStats(bOutput.uid, bOutput);

    this.saveToStorage(STORAGE_KEYS.B_TO_D_PUSHES, this.btoDPushes);
    this.notifyListeners();

    console.log(
      `[D心脏] uid=${bOutput.uid} tool=${bOutput.toolName} success=${bOutput.success}`
    );
  }

  // === 用户统计更新 - 优化版 ===

  private updateUserStats(uid: string, bOutput: AgentBOutput): void {
    const existing = this.userStats.get(uid) || {
      uid,
      totalQueries: 0,
      totalCost: 0,
      lastActive: Date.now(),
      sessionCount: 1,
    };

    existing.totalQueries += 1;
    existing.lastActive = Date.now();

    // 计算成本（AI调用才计费）
    if (
      bOutput.toolName === 'voice_interaction' ||
      bOutput.toolName === 'get_related_knowledge'
    ) {
      existing.totalCost += 0.1; // 估算每次AI调用0.1元
    }

    this.userStats.set(uid, existing);
    this.saveToStorage(
      STORAGE_KEYS.USER_STATS,
      Object.fromEntries(this.userStats)
    );
  }

  // === 聊天记录（按uid存储）- 优化版 ===

  addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const record: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      ...message,
    };

    const uid = message.uid;
    const history = this.chatHistory.get(uid) || [];
    history.push(record);

    // 限制每个用户的聊天记录数量
    if (history.length > this.MAX_CHAT_HISTORY_PER_USER) {
      this.chatHistory.set(uid, history.slice(-this.MAX_CHAT_HISTORY_PER_USER));
    } else {
      this.chatHistory.set(uid, history);
    }

    this.saveToStorage(
      STORAGE_KEYS.CHAT_HISTORY,
      Object.fromEntries(this.chatHistory)
    );
    this.notifyListeners();

    return record;
  }

  getChatHistory(uid: string): ChatMessage[] {
    return this.chatHistory.get(uid) || [];
  }

  // === 获取数据（供后台监控使用）- 优化版 ===

  getBOutputs(): AgentBOutput[] {
    return [...this.bOutputs];
  }

  getBtoDPushes(): BtoDPush[] {
    return [...this.btoDPushes];
  }

  getUserStats(uid?: string): UserStats | UserStats[] {
    if (uid) {
      return (
        this.userStats.get(uid) || {
          uid,
          totalQueries: 0,
          totalCost: 0,
          lastActive: 0,
          sessionCount: 0,
        }
      );
    }
    return Array.from(this.userStats.values());
  }

  // === 统计数据 - 优化版 ===

  getStats() {
    const outputs = this.bOutputs;
    const successCount = outputs.filter(o => o.success).length;
    const totalCount = outputs.length;

    return {
      totalOutputs: totalCount,
      successRate:
        totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0',
      avgResponseTime:
        totalCount > 0
          ? Math.round(
              outputs.reduce((sum, o) => sum + o.responseTime, 0) / totalCount
            )
          : 0,
      btoDPushCount: this.btoDPushes.length,
      recentOutputs: outputs.slice(-10).reverse(),
      recentPushes: this.btoDPushes.slice(-10).reverse(),
    };
  }

  // === 性能优化：日志清理机制 ===
  
  private setupLogCleanup(): void {
    // 定期清理旧日志
    this.LOG_CLEANUP_TIMER = setInterval(() => {
      this.cleanupOldLogs();
    }, this.LOG_CLEANUP_INTERVAL);
  }

  private cleanupOldLogs(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000; // 1小时前的时间戳

    // 清理超过1小时的B输出记录
    this.bOutputs = this.bOutputs.filter(output => output.timestamp > oneHourAgo);
    
    // 清理超过1小时的推送记录
    this.btoDPushes = this.btoDPushes.filter(push => push.timestamp > oneHourAgo);
    
    // 清理超过1小时的聊天记录
    for (const [uid, history] of this.chatHistory.entries()) {
      const filteredHistory = history.filter(msg => msg.timestamp > oneHourAgo);
      if (filteredHistory.length === 0) {
        this.chatHistory.delete(uid);
      } else {
        this.chatHistory.set(uid, filteredHistory);
      }
    }
    
    // 清理超过1天未活跃的用户统计
    for (const [uid, stats] of this.userStats.entries()) {
      if (stats.lastActive < now - 24 * 60 * 60 * 1000) {
        this.userStats.delete(uid);
      }
    }

    // 保存清理后的数据
    this.saveToStorage(STORAGE_KEYS.B_OUTPUTS, this.bOutputs);
    this.saveToStorage(STORAGE_KEYS.B_TO_D_PUSHES, this.btoDPushes);
    this.saveToStorage(
      STORAGE_KEYS.CHAT_HISTORY,
      Object.fromEntries(this.chatHistory)
    );
    this.saveToStorage(
      STORAGE_KEYS.USER_STATS,
      Object.fromEntries(this.userStats)
    );

    console.log(`[D心脏] 日志清理完成: B输出${this.bOutputs.length}, 推送${this.btoDPushes.length}`);
  }

  // === 订阅机制 - 优化版 ===

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    // 使用setTimeout避免同步调用导致的性能问题
    setTimeout(() => {
      this.listeners.forEach(l => {
        try {
          l();
        } catch (error) {
          console.error('Error in listener:', error);
        }
      });
    }, 0);
  }

  // === 持久化 - 优化版 ===

  private saveToStorage(key: string, data: any): void {
    try {
      // 实现防抖存储，避免频繁写入
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const outputs = localStorage.getItem(STORAGE_KEYS.B_OUTPUTS);
      if (outputs) this.bOutputs = JSON.parse(outputs);

      const pushes = localStorage.getItem(STORAGE_KEYS.B_TO_D_PUSHES);
      if (pushes) this.btoDPushes = JSON.parse(pushes);

      const history = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (history)
        this.chatHistory = new Map(Object.entries(JSON.parse(history)));

      const stats = localStorage.getItem(STORAGE_KEYS.USER_STATS);
      if (stats) this.userStats = new Map(Object.entries(JSON.parse(stats)));
    } catch (e) {
      console.warn('Storage load failed:', e);
    }
  }

  // 清除数据
  clear(): void {
    this.bOutputs = [];
    this.btoDPushes = [];
    this.chatHistory.clear();
    this.userStats.clear();
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this.notifyListeners();
  }
  
  // 销毁资源
  destroy(): void {
    if (this.LOG_CLEANUP_TIMER) {
      clearInterval(this.LOG_CLEANUP_TIMER);
    }
  }
}

// 单例导出
export const optimizedAgentLogService = new OptimizedAgentD();

export default OptimizedAgentD;