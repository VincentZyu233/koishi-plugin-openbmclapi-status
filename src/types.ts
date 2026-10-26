export const OUTPUT_FORMAT = {
  TEXT: 'text',
  TAKUMI_IMAGE: 'takumi_image',
  MARKDOWN: 'markdown',
} as const

export type OutputFormat = typeof OUTPUT_FORMAT[keyof typeof OUTPUT_FORMAT]

export interface HourlyMetric {
  _id: number
  bytes: number
  hits: number
  bandwidth: number
  nodes: number
}

export interface DashboardMetric {
  bytes: number
  hits: number
  hourly: HourlyMetric[]
}

export interface NodeMetric {
  _id: string
  clusterId: string
  date: string
  bytes: number
  hits: number
}

export interface ClusterRankItem {
  _id: string
  name: string
  isEnabled: boolean
  metric?: NodeMetric
}

export interface VersionInfo {
  name: string
  version: string
  description?: string
}

export interface FormattedRankItem {
  rank: number
  id: string
  name: string
  isEnabled: boolean
  bytesFormatted: string
  hitsFormatted: string
  bytesRaw: number
  hitsRaw: number
  percentage: string
}

export interface AlertTarget {
  enabled: boolean
  type: 'channel' | 'user'
  targetId: string
  remark?: string
}

