/**
 * 系统配置服务 - 统一管理所有配置
 * 包括：MCP配置、Agent配置、兜底回复、Webhook等
 */

export interface MCPConfig {
  enabled: boolean;
  serverUrl: string;
  timeout: number; // 超时时间(ms)
  retryCount: number; // 重试次数
  tools: {
    id: string;
    name: string;
    enabled: boolean;
    provider: string;
  }[];
}

export interface AgentConfig {
  // A哥配置
  agentA: {
    voiceToTextEnabled: boolean; // 语音转文字
    photoRecognitionEnabled: boolean; // 图片识别
  };
  // B哥配置 - 嘴替担当
  agentB: {
    timeout: number; // 响应超时(ms) - D监控用
    webhookAlertDelay: number; // 超时多久后通知Webhook(ms)
    maxRetries: number; // 最大重试次数
  };
  // C哥配置 - 小抄
  agentC: {
    cacheEnabled: boolean; // 是否启用缓存
    cacheTTL: number; // 缓存过期时间(ms)
    autoRefresh: boolean; // 自动刷新
    refreshInterval: number; // 刷新间隔(ms)
  };
  // D哥配置 - 监控
  agentD: {
    monitorInterval: number; // 监控间隔(ms)
    alertThreshold: number; // 告警阈值(响应时间ms)
    webhookEnabled: boolean; // Webhook通知开关
    webhookUrl: string; // Webhook地址
  };
}

export interface FallbackConfig {
  // 兜底回复配置
  fallbackReplies: {
    category: string; // 分类
    keywords: string[]; // 关键词
    reply: string; // 找不到时的回复
  }[];
  // 全局后缀（广告）
  globalSuffix: {
    enabled: boolean;
    content: string; // 后缀内容
  };
  // 默认兜底回复
  defaultReply: string;
}

export interface SystemConfig {
  mcp: MCPConfig;
  agents: AgentConfig;
  fallback: FallbackConfig;
  version: string;
  lastUpdated: number;
}

const STORAGE_KEY = 'system_config';

// 默认配置
const DEFAULT_CONFIG: SystemConfig = {
  mcp: {
    enabled: true,
    serverUrl: 'http://localhost:3001',
    timeout: 10000, // 10秒
    retryCount: 2,
    tools: [
      {
        id: 'voice_interaction',
        name: '智能对话',
        enabled: true,
        provider: '硅基流动',
      },
      {
        id: 'get_related_knowledge',
        name: '知识查询',
        enabled: true,
        provider: '本地',
      },
      {
        id: 'get_shopping_info',
        name: '附近商家',
        enabled: true,
        provider: '高德地图',
      },
      { id: 'get_map', name: '地图导航', enabled: true, provider: '高德地图' },
      {
        id: 'object_recognition',
        name: '图片识别',
        enabled: true,
        provider: '硅基流动',
      },
      { id: 'mcp_search', name: 'MCP搜索', enabled: false, provider: '多引擎' },
    ],
  },
  agents: {
    agentA: {
      voiceToTextEnabled: true,
      photoRecognitionEnabled: true,
    },
    agentB: {
      timeout: 10000, // 🎯 B哥超时10秒
      webhookAlertDelay: 10000, // 🎯 超过10秒再通知Webhook
      maxRetries: 3,
    },
    agentC: {
      cacheEnabled: true,
      cacheTTL: 3600000, // 1小时
      autoRefresh: true,
      refreshInterval: 1800000, // 30分钟刷新一次
    },
    agentD: {
      monitorInterval: 5000, // 5秒监控一次
      alertThreshold: 10000, // 🎯 10秒告警阈值
      webhookEnabled: true,
      webhookUrl: 'https://api.day.app/p2CPtgzAMNGQCqQYEz86AV',
    },
  },
  fallback: {
    fallbackReplies: [
      {
        category: '红色文化',
        keywords: ['历史', '革命', '红色', '纪念'],
        reply:
          '抱歉，暂时没有找到相关的红色文化资料。您可以前往东里村革命纪念馆了解更多历史故事。',
      },
      {
        category: '景点介绍',
        keywords: ['景点', '风景', '参观', '游览'],
        reply: '这个景点的详细信息正在整理中，请稍后再试或咨询现场工作人员。',
      },
      {
        category: '美食购物',
        keywords: ['吃', '买', '特产', '美食'],
        reply: '附近商家信息加载中，您可以先逛逛周边，或者询问当地村民推荐。',
      },
      {
        category: '地图导航',
        keywords: ['怎么走', '在哪', '导航', '路线'],
        reply: '导航服务暂时不可用，建议您查看景区指示牌或询问工作人员。',
      },
    ],
    globalSuffix: {
      enabled: true,
      content: '\n\n🏡 东里村欢迎您！更多精彩请关注公众号"东里村旅游"',
    },
    defaultReply:
      '抱歉，我暂时无法回答这个问题。请尝试换个方式提问，或联系景区工作人员获取帮助。',
  },
  version: '1.0.0',
  lastUpdated: Date.now(),
};

class ConfigService {
  private config: SystemConfig;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.config = this.loadFromStorage();
  }

  private loadFromStorage(): SystemConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 合并默认配置，确保新字段存在
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load config from storage:', e);
    }
    return { ...DEFAULT_CONFIG };
  }

  private saveToStorage(): void {
    try {
      this.config.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn());
  }

  // 订阅配置变化
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // === 获取配置 ===

  getConfig(): SystemConfig {
    return { ...this.config };
  }

  getMCPConfig(): MCPConfig {
    return { ...this.config.mcp };
  }

  getAgentConfig(): AgentConfig {
    return { ...this.config.agents };
  }

  getFallbackConfig(): FallbackConfig {
    return { ...this.config.fallback };
  }

  // === 更新配置 ===

  updateMCPConfig(updates: Partial<MCPConfig>): void {
    this.config.mcp = { ...this.config.mcp, ...updates };
    this.saveToStorage();
    this.notifyListeners();
    console.log('[ConfigService] MCP配置已更新:', updates);
  }

  updateAgentConfig(agentKey: keyof AgentConfig, updates: any): void {
    this.config.agents[agentKey] = {
      ...this.config.agents[agentKey],
      ...updates,
    };
    this.saveToStorage();
    this.notifyListeners();
    console.log(`[ConfigService] ${agentKey}配置已更新:`, updates);
  }

  updateFallbackConfig(updates: Partial<FallbackConfig>): void {
    this.config.fallback = { ...this.config.fallback, ...updates };
    this.saveToStorage();
    this.notifyListeners();
    console.log('[ConfigService] 兜底回复配置已更新');
  }

  // 更新单个兜底回复
  updateFallbackReply(category: string, reply: string): void {
    const idx = this.config.fallback.fallbackReplies.findIndex(
      r => r.category === category
    );
    if (idx >= 0) {
      this.config.fallback.fallbackReplies[idx].reply = reply;
    } else {
      this.config.fallback.fallbackReplies.push({
        category,
        keywords: [],
        reply,
      });
    }
    this.saveToStorage();
    this.notifyListeners();
  }

  // 更新全局后缀（广告）
  updateGlobalSuffix(enabled: boolean, content: string): void {
    this.config.fallback.globalSuffix = { enabled, content };
    this.saveToStorage();
    this.notifyListeners();
  }

  // 切换MCP工具开关
  toggleMCPTool(toolId: string): void {
    const tool = this.config.mcp.tools.find(t => t.id === toolId);
    if (tool) {
      tool.enabled = !tool.enabled;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // === 工具方法 ===

  // 获取兜底回复（B哥用）
  getFallbackReply(text: string): string {
    const fallback = this.config.fallback;

    // 根据关键词匹配分类
    for (const rule of fallback.fallbackReplies) {
      if (rule.keywords.some(kw => text.includes(kw))) {
        let reply = rule.reply;
        // 添加全局后缀
        if (fallback.globalSuffix.enabled) {
          reply += fallback.globalSuffix.content;
        }
        return reply;
      }
    }

    // 默认回复 + 后缀
    let reply = fallback.defaultReply;
    if (fallback.globalSuffix.enabled) {
      reply += fallback.globalSuffix.content;
    }
    return reply;
  }

  // 检查工具是否可用（A哥判断用）
  isToolEnabled(toolId: string): boolean {
    const tool = this.config.mcp.tools.find(t => t.id === toolId);
    return tool?.enabled ?? false;
  }

  // 获取B哥超时配置（D监控用）
  getBTimeout(): number {
    return this.config.agents.agentB.timeout;
  }

  // 获取Webhook配置（D通知用）
  getWebhookConfig(): { enabled: boolean; url: string; delay: number } {
    return {
      enabled: this.config.agents.agentD.webhookEnabled,
      url: this.config.agents.agentD.webhookUrl,
      delay: this.config.agents.agentB.webhookAlertDelay,
    };
  }

  // 重置为默认配置
  resetToDefault(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveToStorage();
    this.notifyListeners();
    console.log('[ConfigService] 已重置为默认配置');
  }
}

export const configService = new ConfigService();
