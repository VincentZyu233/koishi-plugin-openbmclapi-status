import { DashboardMetric, ClusterRankItem, NodeMetric, VersionInfo } from '../types'
import { formatBytes, formatBandwidth, formatNumber, formatDateTime } from '../utils/format'

export function renderDashboardMarkdown(data: DashboardMetric, version?: VersionInfo): string {
  const currentHour = data.hourly && data.hourly.length > 0 ? data.hourly[data.hourly.length - 1] : null
  const onlineNodes = currentHour ? currentHour.nodes : 0
  const bandwidth = currentHour ? formatBandwidth(currentHour.bandwidth) : '0 Mbps'

  const lines = [
    `# 🚀 OpenBMCLAPI 集群运行大盘`,
    `> 统计时间：${formatDateTime()}`,
    ``,
    `| 指标项目 | 运行数值 | 说明 |`,
    `| :--- | :--- | :--- |`,
    `| 📦 **当日分发总量** | **${formatBytes(data.bytes)}** | 当日累计出网流量 |`,
    `| 🎯 **当日命中请求** | **${formatNumber(data.hits)} 次** | 全网下载分发命中数 |`,
    `| ⚡ **全网实时带宽** | **${bandwidth}** | 当前时段平均吞吐 |`,
    `| 🖥️ **在线边缘节点** | **${onlineNodes} 个** | 正常提供分发的节点数 |`,
    ``,
  ]

  if (version) {
    lines.push(`---\n*主控版本：v${version.version}*`)
  }

  return lines.join('\n')
}

export function renderRankMarkdown(list: ClusterRankItem[], maxCount: number = 10): string {
  const sorted = [...list].sort((a, b) => (b.metric?.bytes || 0) - (a.metric?.bytes || 0))
  const totalBytes = sorted.reduce((sum, item) => sum + (item.metric?.bytes || 0), 0)
  const sliced = sorted.slice(0, maxCount)

  const lines = [
    `# 🏆 OpenBMCLAPI 节点天梯榜 Top ${sliced.length}`,
    `> 统计时间：${formatDateTime()} ｜ 在线节点总数：${list.length} 个`,
    ``,
    `| 排名 | 状态 | 节点名称 | 当日流量 | 流量占比 | 当日请求 |`,
    `| :---: | :---: | :--- | :---: | :---: | :---: |`,
  ]

  const medals = ['🥇', '🥈', '🥉']
  sliced.forEach((item, index) => {
    const rankBadge = medals[index] || String(index + 1)
    const bytes = item.metric?.bytes || 0
    const hits = item.metric?.hits || 0
    const percent = totalBytes > 0 ? `${((bytes / totalBytes) * 100).toFixed(1)}%` : '0%'
    const status = item.isEnabled ? '🟢 在线' : '🔴 停用'
    const name = (item.name || '未命名').replace(/\|/g, '/')

    lines.push(`| ${rankBadge} | ${status} | **${name}** | ${formatBytes(bytes)} | ${percent} | ${formatNumber(hits)} |`)
  })

  lines.push('')
  lines.push(`> 💡 输入 \`/bmcl.状态 <节点ID>\` 可查询指定节点完整历史`)
  return lines.join('\n')
}

export function renderNodeMarkdown(item: ClusterRankItem, metrics?: NodeMetric[], rankPosition?: number): string {
  const statusStr = item.isEnabled ? '🟢 在线分发中 (Online)' : '🔴 已停用或离线 (Disabled)'
  const todayBytes = item.metric?.bytes || 0
  const todayHits = item.metric?.hits || 0

  const lines = [
    `# 🖥️ 边缘节点状态卡：${item.name || '未命名'}`,
    `> 节点 ID：\`${item._id}\``,
    ``,
    `- **运行状态**：${statusStr}`,
  ]

  if (rankPosition) {
    lines.push(`- **全网天梯排名**：第 **${rankPosition}** 名`)
  }

  lines.push(`- **今日累计分发**：**${formatBytes(todayBytes)}**`)
  lines.push(`- **今日命中请求**：**${formatNumber(todayHits)}** 次`)

  if (metrics && metrics.length > 1) {
    lines.push(``)
    lines.push(`### 📅 近 3 日历史分发走势`)
    metrics.slice(-3).forEach(m => {
      const d = m.date ? m.date.slice(0, 10) : '未知'
      lines.push(`* **${d}**：分发 ${formatBytes(m.bytes)} (${formatNumber(m.hits)} 请求)`)
    })
  }

  return lines.join('\n')
}
