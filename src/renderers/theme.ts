export interface Theme {
  bg: string
  cardBg: string
  cardBorder: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  accent: string
  accentLight: string
  success: string
  warning: string
  danger: string
  barBg: string
}

export const themes: Record<'dark' | 'light', Theme> = {
  dark: {
    bg: '#0f172a',           // 深蓝黑
    cardBg: '#1e293b',       // 卡片背景
    cardBorder: '#334155',   // 边框
    textPrimary: '#f8fafc',  // 纯白主字
    textSecondary: '#cbd5e1',// 浅灰副字
    textMuted: '#64748b',    // 暗灰弱字
    accent: '#38bdf8',       // 亮天蓝
    accentLight: '#0284c7',  // 强调色
    success: '#4ade80',      // 亮绿
    warning: '#facc15',      // 亮黄
    danger: '#f87171',       // 鲜红
    barBg: '#1e293b',
  },
  light: {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#94a3b8',
    accent: '#0284c7',
    accentLight: '#38bdf8',
    success: '#16a34a',
    warning: '#ca8a04',
    danger: '#dc2626',
    barBg: '#f1f5f9',
  },
}
