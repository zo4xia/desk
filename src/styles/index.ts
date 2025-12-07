/**
 * ============================================================================
 * 🎖️ 东里村智能导游系统 - 样式统一管理中心
 * ============================================================================
 * 
 * 【军工级规范】
 * - 统一管理：所有样式变量、主题配置集中于此
 * - 权责明确：颜色、间距、字体、阴影各司其职
 * - 严谨有序：命名规范、层级清晰、可追溯
 * - 务实第一：只保留必要样式，杜绝冗余
 * 
 * 【使用方式】
 * import { colors, spacing, fonts, shadows, theme } from '@/styles';
 * 
 * 【维护规则】
 * 1. 新增样式必须在此文件登记
 * 2. 禁止在组件中硬编码颜色/间距
 * 3. 修改前必须评估影响范围
 * 
 * ============================================================================
 */

// ============================================================================
// 🎨 颜色系统 - Color System
// ============================================================================
export const colors = {
  // 主色调 - 东里村绿色主题
  primary: {
    main: '#52c41a',      // 主绿色
    light: '#73d13d',     // 浅绿
    dark: '#389e0d',      // 深绿
    bg: '#f6ffed',        // 绿色背景
    border: '#b7eb8f',    // 绿色边框
  },
  
  // 辅助色
  secondary: {
    blue: '#1890ff',      // 信息蓝
    orange: '#fa8c16',    // 警告橙
    red: '#ff4d4f',       // 错误红
    purple: '#722ed1',    // 紫色强调
    cyan: '#13c2c2',      // 青色
  },
  
  // 中性色
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray100: '#fafafa',   // 最浅灰
    gray200: '#f5f5f5',   // 背景灰
    gray300: '#e8e8e8',   // 边框灰
    gray400: '#d9d9d9',   // 禁用灰
    gray500: '#bfbfbf',   // 占位符
    gray600: '#8c8c8c',   // 次要文字
    gray700: '#595959',   // 正文
    gray800: '#262626',   // 标题
    gray900: '#141414',   // 最深
  },
  
  // 语义化颜色
  semantic: {
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    link: '#1890ff',
  },
  
  // Agent专属色
  agent: {
    A: '#1890ff',         // A哥-眼睛-蓝色
    B: '#52c41a',         // B哥-嘴替-绿色
    C: '#fa8c16',         // C哥-小抄-橙色
    D: '#722ed1',         // D哥-心-紫色
  },
} as const;

// ============================================================================
// 📏 间距系统 - Spacing System (基于8px网格)
// ============================================================================
export const spacing = {
  none: '0',
  xs: '4px',     // 超小间距
  sm: '8px',     // 小间距
  md: '16px',    // 中间距
  lg: '24px',    // 大间距
  xl: '32px',    // 超大间距
  xxl: '48px',   // 特大间距
  
  // 页面级间距
  page: {
    padding: '24px',
    margin: '16px',
  },
  
  // 卡片间距
  card: {
    padding: '16px',
    gap: '16px',
  },
  
  // 表单间距
  form: {
    gap: '16px',
    labelGap: '8px',
  },
} as const;

// ============================================================================
// 🔤 字体系统 - Typography System
// ============================================================================
export const fonts = {
  // 字体家族
  family: {
    primary: '"Noto Sans SC", system-ui, -apple-system, sans-serif',
    mono: '"Fira Code", "SF Mono", Consolas, monospace',
  },
  
  // 字体大小
  size: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    title: '28px',
    hero: '36px',
  },
  
  // 字重
  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // 行高
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// 🌑 阴影系统 - Shadow System
// ============================================================================
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.15)',
  
  // 特殊阴影
  card: '0 2px 8px rgba(0, 0, 0, 0.1)',
  modal: '0 4px 24px rgba(0, 0, 0, 0.2)',
  floating: '0 8px 32px rgba(0, 0, 0, 0.15)',
} as const;

// ============================================================================
// 📐 圆角系统 - Border Radius System
// ============================================================================
export const radius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
  
  // 组件级
  card: '12px',
  button: '8px',
  input: '6px',
  tag: '4px',
} as const;

// ============================================================================
// ⏱️ 动画系统 - Animation System
// ============================================================================
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ============================================================================
// 📱 响应式断点 - Breakpoints
// ============================================================================
export const breakpoints = {
  xs: '320px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
} as const;

// ============================================================================
// 🎯 Z-Index 层级系统
// ============================================================================
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
} as const;

// ============================================================================
// 🎨 主题配置 - Theme Configuration
// ============================================================================
export const theme = {
  colors,
  spacing,
  fonts,
  shadows,
  radius,
  animations,
  breakpoints,
  zIndex,
} as const;

// ============================================================================
// 🛠️ 常用样式对象 - Common Style Objects
// ============================================================================
export const commonStyles = {
  // 页面容器
  pageContainer: {
    padding: spacing.page.padding,
    background: colors.primary.bg,
    minHeight: '100vh',
    fontFamily: fonts.family.primary,
  },
  
  // 卡片样式
  card: {
    background: colors.neutral.white,
    borderRadius: radius.card,
    boxShadow: shadows.card,
    padding: spacing.card.padding,
  },
  
  // 成功提示背景
  successBg: {
    background: colors.primary.bg,
    border: `1px solid ${colors.primary.border}`,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  
  // 警告提示背景
  warningBg: {
    background: '#fff7e6',
    border: '1px solid #ffd591',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  
  // 错误提示背景
  errorBg: {
    background: '#fff1f0',
    border: '1px solid #ffa39e',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  
  // 信息提示背景
  infoBg: {
    background: '#e6f7ff',
    border: '1px solid #91d5ff',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  
  // Flex居中
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Flex两端对齐
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
} as const;

// ============================================================================
// 📋 导出类型
// ============================================================================
export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;
export type ThemeFonts = typeof fonts;
export type ThemeShadows = typeof shadows;
export type ThemeRadius = typeof radius;
export type Theme = typeof theme;
