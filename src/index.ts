import { Context } from 'koishi'
import { Config } from './config'
import { BmclApiClient } from './api/client'
import { OutputService } from './services/output'
import { MonitorService } from './services/monitor'

export const name = 'openbmclapi-status'
export { Config } from './config'

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('openbmclapi')
  const api = new BmclApiClient(ctx, config)
  const output = new OutputService(config)
  const monitor = new MonitorService(ctx, config, api)

  // Start heartbeat monitor
  monitor.start()
  ctx.on('dispose', () => monitor.stop())

  // ==========================================
  // 父级入口: bmcl (提供帮助与路由)
  // ==========================================
  ctx.command('bmcl', 'OpenBMCLAPI 集群监控与节点管理助手')
    .action(() => {
      return [
        '🚀【OpenBMCLAPI 监控助手 指令列表】',
        '━━━━━━━━━━━━━━━━━━',
        '• bmcl.大盘 (bmcl.dashboard) - 全网实时吞吐大盘',
        '• bmcl.排行 [数量] (bmcl.top / bmcl.rank) - 节点流量天梯榜',
        '• bmcl.搜索 <关键词> (bmcl.search / bmcl.find) - 模糊搜索节点',
        '• bmcl.状态 <ID或名称> (bmcl.status / bmcl.node) - 单节点详情状态',
        '• bmcl.我的 (bmcl.my / bmcl.mine) - 服主自建节点直查',
        '━━━━━━━━━━━━━━━━━━',
        '💡 提示: 点号与空格等效，例如 "/bmcl.大盘" 或 "/bmcl 大盘"',
      ].join('\n')
    })

  // ==========================================
  // 子指令 1: bmcl.大盘 (全网运行大盘)
  // ==========================================
  ctx.command('bmcl.大盘', '查询 OpenBMCLAPI 全网集群实时运行状态')
    .alias('bmcl.dashboard')
    .action(async ({ session }) => {
      if (!session) return
      try {
        const [dashboard, version] = await Promise.all([
          api.getDashboard(),
          api.getVersion().catch(() => undefined),
        ])
        await output.sendDashboard(session, dashboard, version)
      } catch (err: any) {
        logger.error('获取集群大盘数据失败:', err)
        return `❌ 获取 OpenBMCLAPI 大盘数据失败: ${err.message}`
      }
    })

  // ==========================================
  // 子指令 2: bmcl.排行 [数量] (节点分发天梯榜)
  // ==========================================
  ctx.command('bmcl.排行 [count:number]', '查询 OpenBMCLAPI 节点分发流量天梯排行榜')
    .alias('bmcl.top')
    .alias('bmcl.rank')
    .action(async ({ session }, count = 10) => {
      if (!session) return
      const safeCount = Math.max(1, Math.min(Math.floor(count || 10), 50))
      try {
        const list = await api.getRank()
        if (!list || list.length === 0) {
          return '⚠️ 暂未获取到有效的节点排行榜数据。'
        }
        await output.sendRank(session, list, safeCount)
      } catch (err: any) {
        logger.error('获取节点天梯榜失败:', err)
        return `❌ 获取天梯榜失败: ${err.message}`
      }
    })

  // ==========================================
  // 子指令 3: bmcl.搜索 <关键词> (模糊搜索节点)
  // ==========================================
  ctx.command('bmcl.搜索 <keyword:string>', '模糊搜索 OpenBMCLAPI 节点 ID 或名称')
    .alias('bmcl.search')
    .alias('bmcl.find')
    .action(async ({ session }, keyword) => {
      if (!session) return
      if (!keyword || !keyword.trim()) {
        return '💡 请提供要搜索的节点关键词，例如: /bmcl.搜索 陆大 或 /bmcl.search 6adf'
      }
      try {
        const results = await api.findNodes(keyword)
        await output.sendSearchResults(session, results)
      } catch (err: any) {
        logger.error('搜索节点失败:', err)
        return `❌ 搜索节点失败: ${err.message}`
      }
    })

  // ==========================================
  // 子指令 4: bmcl.状态 <节点ID或名称> (查询指定节点状态)
  // ==========================================
  ctx.command('bmcl.状态 <target:string>', '查询指定 OpenBMCLAPI 节点的运行状态与指标')
    .alias('bmcl.status')
    .alias('bmcl.node')
    .action(async ({ session }, target) => {
      if (!session) return
      if (!target || !target.trim()) {
        return '💡 请指定节点 ID 或名称，例如: /bmcl.状态 6adf0d69576aa033c38b0759'
      }

      try {
        const node = await api.getNode(target)
        if (!node) {
          return `🔍 未找到节点 [${target}]，可先通过 /bmcl.搜索 <关键词> 查询是否存在。`
        }

        const [metrics, allRank] = await Promise.all([
          api.getClusterMetric(node._id).catch(() => []),
          api.getRank().catch(() => []),
        ])

        const sorted = [...allRank].sort((a, b) => (b.metric?.bytes || 0) - (a.metric?.bytes || 0))
        const rankIdx = sorted.findIndex(x => x._id === node._id)
        const rankPos = rankIdx >= 0 ? rankIdx + 1 : undefined

        await output.sendNodeDetail(session, node, metrics, rankPos)
      } catch (err: any) {
        logger.error('查询单节点详情失败:', err)
        return `❌ 查询节点状态失败: ${err.message}`
      }
    })

  // ==========================================
  // 子指令 5: bmcl.我的 (服主私有节点快捷直查)
  // ==========================================
  ctx.command('bmcl.我的', '快捷查询预设的服主自建节点状态')
    .alias('bmcl.my')
    .alias('bmcl.mine')
    .action(async ({ session }) => {
      if (!session) return
      const myId = config.myClusterId
      if (!myId) {
        return '⚙️ 尚未在控制台配置 myClusterId，请先前往插件配置填写您的 Cluster ID。'
      }

      try {
        const node = await api.getNode(myId)
        if (!node) {
          return `🔍 节点池中暂未收录您的 Cluster ID [${myId}]，可能是刚接入尚未产生分发或被过滤。`
        }

        const [metrics, allRank] = await Promise.all([
          api.getClusterMetric(node._id).catch(() => []),
          api.getRank().catch(() => []),
        ])

        const sorted = [...allRank].sort((a, b) => (b.metric?.bytes || 0) - (a.metric?.bytes || 0))
        const rankIdx = sorted.findIndex(x => x._id === node._id)
        const rankPos = rankIdx >= 0 ? rankIdx + 1 : undefined

        await output.sendNodeDetail(session, node, metrics, rankPos)
      } catch (err: any) {
        logger.error('查询我的节点失败:', err)
        return `❌ 查询我的节点状态失败: ${err.message}`
      }
    })
}
