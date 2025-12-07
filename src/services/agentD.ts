/**
 * 🔒 CRITICAL_DO_NOT_DELETE - Agent D: 心脏服务（后台监控）
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

// === Agent D 实现 ===

class AgentD {
  private bOutputs: AgentBOutput[] = [];
  private btoDPushes: BtoDPush[] = [];
  private chatHistory: Map<string, ChatMessage[]> = new Map();
  private userStats: Map<string, UserStats> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  // === B Output 记录 ===

  logBOutput(output: Omit<AgentBOutput, 'id' | 'timestamp'>): AgentBOutput {
    const record: AgentBOutput = {
      id: `bout_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      ...output,
    };

    this.bOutputs.push(record);

    // 只保留最近100条
    if (this.bOutputs.length > 100) {
      this.bOutputs = this.bOutputs.slice(-100);
    }

    this.saveToStorage(STORAGE_KEYS.B_OUTPUTS, this.bOutputs);
    this.notifyListeners();

    // 🎯 鸡贼设计：B输出成功后，代码直推到D
    if (output.success) {
      this.pushToD(record);
    }

    return record;
  }

  // === B→D 代码直推（鸡贼模式）===

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

    // 只保留最近50条推送记录
    if (this.btoDPushes.length > 50) {
      this.btoDPushes = this.btoDPushes.slice(-50);
    }

    // 更新用户统计
    this.updateUserStats(bOutput.uid, bOutput);

    this.saveToStorage(STORAGE_KEYS.B_TO_D_PUSHES, this.btoDPushes);
    this.notifyListeners();

    console.log(
      `[D心脏] uid=${bOutput.uid} tool=${bOutput.toolName} success=${bOutput.success}`
    );
  }

  // === 用户统计更新 ===

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

  // === 聊天记录（按uid存储）===

  addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const record: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      ...message,
    };

    const uid = message.uid;
    const history = this.chatHistory.get(uid) || [];
    history.push(record);

    // 每个用户保留最近50条消息
    if (history.length > 50) {
      this.chatHistory.set(uid, history.slice(-50));
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

  // === 获取数据（供后台监控使用）===

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

  // === 统计数据 ===

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

  // === 订阅机制 ===

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l());
  }

  // === 持久化 ===

  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
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
}

// 单例导出
export const agentLogService = new AgentD();
export const AgentD_Instance = agentLogService;

export default AgentD;
