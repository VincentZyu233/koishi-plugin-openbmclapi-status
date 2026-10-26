import { DashboardMetric, ClusterRankItem, NodeMetric, VersionInfo } from '../types'
import { formatBytes, formatBandwidth, formatNumber, formatDateTime } from '../utils/format'

export function renderDashboardText(data: DashboardMetric, version?: VersionInfo): string {
  const currentHour = data.hourly && data.hourly.length > 0 ? data.hourly[data.hourly.length - 1] : null
  const onlineNodes = currentHour ? currentHour.nodes : 0
  const bandwidth = currentHour ? formatBandwidth(currentHour.bandwidth) : '0 Mbps'

  const lines = [
    '🌐【OpenBMCLAPI 集群运行大盘】',
    `🕒 统计时间: ${formatDateTime()}`,
    '━━━━━━━━━━━━━━━━━━',
    `📦 当日分发总量: ${formatBytes(data.bytes)}`,
    `🎯 当日命中请求: ${formatNumber(data.hits)} 次`,
    `⚡ 全网实时带宽: ${bandwidth}`,
    `🖥️ 在线边缘节点: ${onlineNodes} 个`,
  ]

  if (data.hourly && data.hourly.length > 1) {
    const recent = data.hourly.slice(-4)
    lines.push('━━━━━━━━━━━━━━━━━━')
    lines.push('📈 近期时段吞吐走势:')
    for (const h of recent) {
      lines.push(` • ${String(h._id).padStart(2, '0')}:00 时段 | 带宽: ${formatBandwidth(h.bandwidth)} | 节点: ${h.nodes}`)
    }
  }

  if (version) {
    lines.push('━━━━━━━━━━━━━━━━━━')
    lines.push(`ℹ️ 主控程序版本: v${version.version}`)
  }

  return lines.join('\n')
}

export function renderRankText(list: ClusterRankItem[], maxCount: number = 10): string {
  const sorted = [...list].sort((a, b) => (b.metric?.bytes || 0) - (a.metric?.bytes || 0))
  const totalBytes = sorted.reduce((sum, item) => sum + (item.metric?.bytes || 0), 0)
  const sliced = sorted.slice(0, maxCount)

  const medals = ['🥇', '🥈', '🥉']
  const lines = [
    `🏆【OpenBMCLAPI 节点天梯榜 Top ${sliced.length}】`,
    `🕒 统计时间: ${formatDateTime()}`,
    `🌐 全网纳管节点: ${list.length} 个 (活跃分发: ${sorted.filter(x => (x.metric?.bytes || 0) > 0).length} 个)`,
    '━━━━━━━━━━━━━━━━━━',
  ]

  sliced.forEach((item, index) => {
    const rankBadge = medals[index] || `${index + 1}.`
    const bytes = item.metric?.bytes || 0
    const hits = item.metric?.hits || 0
    const percent = totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : '0.0'
    const status = item.isEnabled ? '🟢' : '🔴'

    lines.push(`${rankBadge} ${status} ${item.name || '未命名节点'}`)
    lines.push(`   └ 流量: ${formatBytes(bytes)} (${percent}%) | 命中: ${formatNumber(hits)} 次`)
  })

  lines.push('━━━━━━━━━━━━━━━━━━')
  lines.push('💡 提示: 输入 /bmcl.状态 <节点ID> 或 /bmcl.搜索 <关键词> 查看详情')
  return lines.join('\n')
}

export function renderNodeSearchText(list: ClusterRankItem[]): string {
  if (list.length === 0) {
    return '🔍 未搜索到匹配的 OpenBMCLAPI 节点，请检查关键词或节点 ID。'
  }

  const lines = [
    `🔍 匹配到 ${list.length} 个节点:`,
    '━━━━━━━━━━━━━━━━━━',
  ]

  list.slice(0, 15).forEach((item, idx) => {
    const status = item.isEnabled ? '🟢 在线' : '🔴 停用'
    const bytes = item.metric ? formatBytes(item.metric.bytes) : '无数据'
    lines.push(`${idx + 1}. [${status}] ${item.name || '未命名'}`)
    lines.push(`   ID: ${item._id}`)
    lines.push(`   今日分发: ${bytes}`)
  })

  if (list.length > 15) {
    lines.push(`... 仅展示前 15 个，更多请精确搜索。`)
  }

  return lines.join('\n')
}

export function renderNodeDetailText(item: ClusterRankItem, metrics?: NodeMetric[], rankPosition?: number): string {
  const statusStr = item.isEnabled ? '🟢 正常运行 (Online)' : '🔴 已停用或离线 (Disabled)'
  const todayBytes = item.metric?.bytes || 0
  const todayHits = item.metric?.hits || 0

  const lines = [
    '🖥️【OpenBMCLAPI 边缘节点状态卡】',
    '━━━━━━━━━━━━━━━━━━',
    `🏷️ 节点名称: ${item.name || '未命名'}`,
    `🆔 节点 ID: ${item._id}`,
    `📊 运行状态: ${statusStr}`,
  ]

  if (rankPosition) {
    lines.push(`🏆 当前全网排名: 第 ${rankPosition} 名`)
  }

  lines.push(`📦 今日累计分发: ${formatBytes(todayBytes)}`)
  lines.push(`🎯 今日命中请求: ${formatNumber(todayHits)} 次`)

  if (metrics && metrics.length > 1) {
    lines.push('━━━━━━━━━━━━━━━━━━')
    lines.push('📅 历史分发走势 (近3天):')
    metrics.slice(-3).forEach(m => {
      const d = m.date ? m.date.slice(0, 10) : '未知日期'
      lines.push(` • ${d}: ${formatBytes(m.bytes)} (${formatNumber(m.hits)} 请求)`)
    })
  }

  return lines.join('\n')
}
