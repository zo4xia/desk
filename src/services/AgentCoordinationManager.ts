/**
 * 🔒 CRITICAL_DO_NOT_DELETE - Agent统筹管理器
 * 
 * 解决过耦合问题，优化B Agent负载
 * 实现「鸡贼胶囊」交互设计 - 用户主动选择语音/文字模式
 * 
 * 查询优先级:
 * 1. 📚 小抄命中 (12ms, ¥0.00)
 * 2. 🔥 热点缓存 (50ms, ¥0.00)
 * 3. 🧠 AI调用 (4s, ¥0.10)
 * 
 * @see 251207-1857-AGENTS.md - 战略详细提示
 * @see docs/鸡贼胶囊交互设计.md
 */
// Agent统筹管理器 - 解决过耦合问题，优化B Agent负载
// 军工品质，极简高效

import { agentB_Enhanced } from './agentB_Enhanced';
import { sharedCache } from './highPerformanceDataAccess';

// 用户输入类型枚举
export enum InputType {
  VOICE = 'voice',
  TEXT = 'text',
}

// 输入上下文接口
export interface InputContext {
  type: InputType;
  content: string;
  outputFormat: 'voice' | 'text';
  userId?: string;
  sessionId: string;
  timestamp: number;
}

// 智能缓存键生成
class CacheKeyGenerator {
  // 生成标准化缓存键
  static generate(query: string, context?: any): string {
    // 标准化查询：去除多余空格，统一大小写
    const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');

    // 生成内容哈希
    const contentHash = this.simpleHash(normalizedQuery);

    // 包含上下文信息
    const contextHash = context ? this.simpleHash(JSON.stringify(context)) : '';

    return `query:${contentHash}:${contextHash}`;
  }

  // 简单哈希函数
  static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  // 生成热点问题标识
  static generateHotKey(pattern: string): string {
    return `hot:${pattern}`;
  }
}

// 问题相似度计算器
class QuestionSimilarityMatcher {
  private questionCache: Map<string, any> = new Map();
  private similarityThreshold = 0.7; // 70%相似度阈值

  // 计算两个问题的相似度（基于编辑距离和关键词）
  static calculateSimilarity(query1: string, query2: string): number {
    const q1 = query1.toLowerCase().trim();
    const q2 = query2.toLowerCase().trim();

    // 完全相同
    if (q1 === q2) return 1.0;

    // 计算编辑距离相似度
    const editDistance = this.calculateEditDistance(q1, q2);
    const maxLength = Math.max(q1.length, q2.length);
    const editSimilarity = 1 - editDistance / maxLength;

    // 计算关键词相似度
    const keywords1 = this.extractKeywords(q1);
    const keywords2 = this.extractKeywords(q2);
    const keywordSimilarity = this.calculateKeywordSimilarity(
      keywords1,
      keywords2
    );

    // 综合相似度：编辑距离40% + 关键词60%
    return editSimilarity * 0.4 + keywordSimilarity * 0.6;
  }

  // 计算编辑距离（Levenshtein距离）
  private static calculateEditDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // 提取关键词
  private static extractKeywords(text: string): Set<string> {
    // 移除标点符号和空格，提取关键词
    const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ');
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);

    // 过滤停用词
    const stopWords = new Set([
      '的',
      '了',
      '在',
      '是',
      '我',
      '有',
      '和',
      '就',
      '不',
      '人',
      '都',
      '一',
      '个',
      '上',
      '也',
      '很',
      '到',
      '说',
      '要',
      '去',
      '你',
      '会',
      '着',
      '没有',
      '看',
      '好',
      '自己',
      '这',
    ]);

    return new Set(
      words.filter(word => word.length > 1 && !stopWords.has(word))
    );
  }

  // 计算关键词相似度（Jaccard相似度）
  private static calculateKeywordSimilarity(
    keywords1: Set<string>,
    keywords2: Set<string>
  ): number {
    if (keywords1.size === 0 && keywords2.size === 0) return 1.0;
    if (keywords1.size === 0 || keywords2.size === 0) return 0.0;

    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);

    return intersection.size / union.size;
  }

  // 查找相似问题的缓存
  findSimilarQuestion(query: string): any | null {
    const cachedQuestions = Array.from(this.questionCache.entries());

    for (const [cachedQuery, cachedResult] of cachedQuestions) {
      const similarity = QuestionSimilarityMatcher.calculateSimilarity(
        query,
        cachedQuery
      );

      if (similarity >= this.similarityThreshold) {
        console.log(
          `Found similar question: "${cachedQuery}" (similarity: ${(similarity * 100).toFixed(1)}%)`
        );
        return {
          ...cachedResult,
          similarity,
          originalQuery: cachedQuery,
          strategy: 'similarity_cache',
        };
      }
    }

    return null;
  }

  // 缓存问题结果
  cacheQuestion(query: string, result: any): void {
    this.questionCache.set(query, result);

    // 限制缓存大小，保持最近的100个问题
    if (this.questionCache.size > 100) {
      const entries = Array.from(this.questionCache.entries());
      entries.sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));

      // 删除最旧的50个
      for (let i = 0; i < 50; i++) {
        this.questionCache.delete(entries[i][0]);
      }
    }
  }

  // 获取缓存统计
  getCacheStats(): { size: number; similarityThreshold: number } {
    return {
      size: this.questionCache.size,
      similarityThreshold: this.similarityThreshold,
    };
  }
}

// 热点问题检测器
export class HotQuestionDetector {
  private hotPatterns: Map<string, number> = new Map();
  private threshold = 5; // 5次以上认为是热点

  // 记录查询
  recordQuery(query: string): void {
    const normalized = query.toLowerCase().trim();
    const count = this.hotPatterns.get(normalized) || 0;
    this.hotPatterns.set(normalized, count + 1);
  }

  // 检查是否为热点问题
  isHotQuestion(query: string): boolean {
    const normalized = query.toLowerCase().trim();
    const count = this.hotPatterns.get(normalized) || 0;
    return count >= this.threshold;
  }

  // 获取热点问题列表
  getHotQuestions(): Array<{ query: string; count: number }> {
    return Array.from(this.hotPatterns.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // 前20个热点问题
  }
}

// Agent统筹管理器
export class AgentCoordinationManager {
  private inputQueue: InputContext[] = [];
  private processingMap: Map<string, boolean> = new Map();
  private hotDetector: HotQuestionDetector;
  private similarityMatcher = new QuestionSimilarityMatcher();
  private cacheHits = 0;
  private totalQueries = 0;

  constructor() {
    this.hotDetector = new HotQuestionDetector();
    this.setupHotCachePreloading();
  }

  // 处理用户输入 - 统一入口
  async processInput(input: InputContext): Promise<any> {
    const startTime = Date.now();
    this.totalQueries++;

    try {
      // 1. 记录查询用于热点检测
      this.hotDetector.recordQuery(input.content);

      // 2. 检查相似问题缓存（新增功能）
      const similarResult = this.similarityMatcher.findSimilarQuestion(
        input.content
      );
      if (similarResult) {
        this.cacheHits++;
        return {
          ...similarResult,
          cached: true,
          responseTime: Date.now() - startTime,
        };
      }

      // 3. 生成缓存键
      const cacheKey = CacheKeyGenerator.generate(input.content, {
        type: input.type,
        outputFormat: input.outputFormat,
      });

      // 4. 检查缓存（热点问题优先）
      const cachedResult = await this.checkCache(cacheKey, input);
      if (cachedResult) {
        this.cacheHits++;
        return {
          ...cachedResult,
          cached: true,
          responseTime: Date.now() - startTime,
        };
      }

      // 5. 防重复处理
      const processKey = `${input.sessionId}:${input.content}`;
      if (this.processingMap.has(processKey)) {
        return this.waitForProcessing(processKey);
      }

      this.processingMap.set(processKey, true);

      // 6. 智能路由到合适的处理策略
      const result = await this.routeToIntelligentProcessor(input);

      // 7. 缓存结果
      await this.cacheResult(cacheKey, result, input);

      // 8. 缓存到相似度匹配器
      this.similarityMatcher.cacheQuestion(input.content, result);

      this.processingMap.delete(processKey);

      return {
        ...result,
        cached: false,
        responseTime: Date.now() - startTime,
      };
    } catch (error: any) {
      this.processingMap.clear();
      console.error('Input processing error:', error);
      return {
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  // 智能路由处理器
  private async routeToIntelligentProcessor(input: InputContext): Promise<any> {
    const queryComplexity = this.analyzeComplexity(input.content);
    const isHot = this.hotDetector.isHotQuestion(input.content);

    // 策略1：热点问题直接返回缓存答案
    if (isHot) {
      const hotAnswer = await this.getHotAnswer(input.content);
      if (hotAnswer) {
        return {
          ...hotAnswer,
          strategy: 'hot_cache',
          inputType: input.type,
          outputFormat: input.outputFormat,
        };
      }
    }

    // 策略2：简单查询使用快速路径
    if (queryComplexity === 'simple') {
      return await this.processSimpleQuery(input);
    }

    // 策略3：复杂查询使用完整Agent B处理
    return await this.processComplexQuery(input);
  }

  // 分析查询复杂度
  private analyzeComplexity(query: string): 'simple' | 'medium' | 'complex' {
    // 简单查询特征
    if (query.length < 20 && !/[？?！!]/.test(query)) {
      return 'simple';
    }

    // 复杂查询特征
    if (
      query.length > 100 ||
      /比较|对比|推荐|哪个好|怎么办|如何/.test(query) ||
      query.split(/[，。！？]/).length > 3
    ) {
      return 'complex';
    }

    return 'medium';
  }

  // 处理简单查询
  private async processSimpleQuery(input: InputContext): Promise<any> {
    // 使用预定义答案或快速数据库查询
    const quickAnswers = {
      东里村在哪: '东里村位于浙江省丽水市龙泉市，是一个美丽的古村落。',
      门票价格: '东里村免费开放，无需门票。',
      开放时间: '东里村全天开放，建议游览时间为2-3小时。',
      怎么去: '可以乘坐高铁到丽水站，然后转乘巴士到东里村。',
    };

    const normalizedQuery = input.content.toLowerCase().trim();

    // 检查快速答案
    for (const [question, answer] of Object.entries(quickAnswers)) {
      if (normalizedQuery.includes(question)) {
        return {
          content: answer,
          strategy: 'quick_answer',
          inputType: input.type,
          outputFormat: input.outputFormat,
        };
      }
    }

    // 使用Agent B的快速查询
    return await this.agentBFastQuery(input);
  }

  // Agent B快速查询
  private async agentBFastQuery(input: InputContext): Promise<any> {
    // 针对简单查询优化Agent B调用
    if (input.content.includes('景点') || input.content.includes('推荐')) {
      const spotResults = await agentB_Enhanced.getSpotsByCategory('scenic');
      return {
        content: this.formatSpotResults(spotResults.slice(0, 3)),
        strategy: 'agent_b_fast',
        inputType: input.type,
        outputFormat: input.outputFormat,
      };
    }

    // 默认Agent B处理
    return {
      content: '正在为您查询相关信息...',
      strategy: 'agent_b_default',
      inputType: input.type,
      outputFormat: input.outputFormat,
    };
  }

  // 处理复杂查询
  private async processComplexQuery(input: InputContext): Promise<any> {
    // 使用完整的Agent B处理流程
    try {
      // 根据输入类型调整查询策略
      let enhancedInput = { ...input };

      // 语音输入特殊处理
      if (input.type === InputType.VOICE) {
        enhancedInput.content = this.preprocessVoiceInput(input.content);
      }

      // 调用Agent B增强版
      const searchResults = await agentB_Enhanced.searchKnowledge(
        enhancedInput.content
      );

      return {
        content: this.formatComplexResults(searchResults, input),
        strategy: 'agent_b_complex',
        inputType: input.type,
        outputFormat: input.outputFormat,
      };
    } catch (error) {
      return {
        content: '抱歉，查询过程中出现了问题，请稍后重试。',
        strategy: 'fallback',
        inputType: input.type,
        outputFormat: input.outputFormat,
      };
    }
  }

  // 语音输入预处理
  private preprocessVoiceInput(content: string): string {
    // 语音识别结果通常包含口语化表达，需要标准化
    return content
      .replace(/嗯|啊|呃|那个|这个/g, '') // 移除语气词
      .replace(/说一下|告诉我|介绍一下/g, '') // 移除引导词
      .trim();
  }

  // 格式化景点结果
  private formatSpotResults(spots: any[]): string {
    if (spots.length === 0) {
      return '暂未找到相关景点信息。';
    }

    return spots
      .map(
        (spot, index) =>
          `${index + 1}. ${spot.name}\n   ${spot.description || '暂无描述'}\n`
      )
      .join('\n');
  }

  // 格式化复杂结果
  private formatComplexResults(results: any[], input: InputContext): string {
    if (results.length === 0) {
      return '抱歉，没有找到相关信息。';
    }

    // 根据输出格式调整
    if (input.outputFormat === 'voice') {
      // 语音输出需要更简洁
      return results
        .slice(0, 3)
        .map(r => r.name || r.title)
        .join('、');
    } else {
      // 文字输出可以更详细
      return results
        .map(r => `• ${r.name || r.title}: ${r.description || r.content || ''}`)
        .join('\n');
    }
  }

  // 检查缓存
  private async checkCache(
    cacheKey: string,
    input: InputContext
  ): Promise<any | null> {
    try {
      const cached = await sharedCache.get(cacheKey);
      if (cached && typeof cached === 'object' && cached !== null) {
        // 类型断言确保安全访问
        const cachedObj = cached as any;
        // 检查是否需要根据输入类型调整格式
        if (cachedObj.outputFormat !== input.outputFormat) {
          cachedObj.content = this.reformatContent(
            cachedObj.content,
            input.outputFormat
          );
        }
        return cachedObj;
      }
    } catch (error) {
      console.error('Cache check error:', error);
    }
    return null;
  }

  // 缓存结果
  private async cacheResult(
    cacheKey: string,
    result: any,
    input: InputContext
  ): Promise<void> {
    try {
      // 根据查询类型设置不同的TTL
      let ttl = 1800; // 默认30分钟

      if (this.hotDetector.isHotQuestion(input.content)) {
        ttl = 7200; // 热点问题缓存2小时
      } else if (this.analyzeComplexity(input.content) === 'simple') {
        ttl = 3600; // 简单查询缓存1小时
      }

      await sharedCache.set(cacheKey, result, { ttl });
    } catch (error) {
      console.error('Cache result error:', error);
    }
  }

  // 获取热点答案
  private async getHotAnswer(query: string): Promise<any | null> {
    const hotKey = CacheKeyGenerator.generateHotKey(query);
    const result = await sharedCache.get(hotKey);
    if (result && typeof result === 'object' && result !== null) {
      return result;
    }
    return null;
  }

  // 内容格式转换
  private reformatContent(
    content: string,
    targetFormat: 'voice' | 'text'
  ): string {
    if (targetFormat === 'voice') {
      // 语音格式：更简洁，适合朗读
      return content
        .replace(/[•·]/g, '，') // 替换符号
        .replace(/\n+/g, '。') // 合并换行
        .slice(0, 200); // 限制长度
    } else {
      // 文本格式：保持原样
      return content;
    }
  }

  // 等待处理完成
  private async waitForProcessing(processKey: string): Promise<any> {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!this.processingMap.has(processKey)) {
          clearInterval(checkInterval);
          resolve({
            content: '处理完成，请稍等...',
            strategy: 'wait_completion',
            outputFormat: 'text' as const,
          });
        }
      }, 100);
    });
  }

  // 设置热点缓存预加载
  private setupHotCachePreloading(): void {
    // 每小时预热热点缓存
    setInterval(async () => {
      const hotQuestions = this.hotDetector.getHotQuestions();

      for (const { query } of hotQuestions.slice(0, 10)) {
        // 预加载热点问题的答案
        await this.processInput({
          type: InputType.TEXT,
          content: query,
          outputFormat: 'text',
          sessionId: 'preload',
          timestamp: Date.now(),
        });
      }
    }, 3600000); // 1小时
  }

  // 获取性能指标
  getPerformanceMetrics(): {
    totalQueries: number;
    cacheHits: number;
    cacheHitRate: number;
    hotQuestions: number;
  } {
    return {
      totalQueries: this.totalQueries,
      cacheHits: this.cacheHits,
      cacheHitRate:
        this.totalQueries > 0 ? this.cacheHits / this.totalQueries : 0,
      hotQuestions: this.hotDetector.getHotQuestions().length,
    };
  }

  // 清理缓存
  async clearCache(): Promise<void> {
    // 假设sharedCache有clear方法
    if (typeof (sharedCache as any).clear === 'function') {
      await (sharedCache as any).clear();
    }
    this.hotDetector = new HotQuestionDetector();
  }
}

// 全局单例
export const agentCoordinator = new AgentCoordinationManager();
