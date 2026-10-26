import { Context, Universal } from 'koishi'
import { Config } from '../config'
import { BmclApiClient } from '../api/client'
import { formatDateTime } from '../utils/format'

export class MonitorService {
  private timer: any = null
  private lastOnlineState: boolean | null = null

  constructor(
    private ctx: Context,
    private config: Config,
    private api: BmclApiClient
  ) {}

  start() {
    if (!this.config.enableAlert || !this.config.myClusterId) return

    const intervalMs = Math.max(this.config.alertInterval || 5, 1) * 60 * 1000
    this.timer = this.ctx.setInterval(() => {
      this.checkNodeStatus().catch(err => {
        this.ctx.logger('openbmclapi').warn('节点心跳检测失败:', err.message)
      })
    }, intervalMs)

    // Run first check after 10s
    this.ctx.setTimeout(() => {
      this.checkNodeStatus().catch(() => {})
    }, 10000)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private async checkNodeStatus() {
    if (!this.config.enableAlert || !this.config.myClusterId) return

    const node = await this.api.getNode(this.config.myClusterId)
    const isOnline = !!(node && node.isEnabled)

    if (this.lastOnlineState === null) {
      this.lastOnlineState = isOnline
      return
    }

    if (this.lastOnlineState === true && isOnline === false) {
      // Transition: Online -> Offline
      this.lastOnlineState = false
      await this.broadcastAlert(
        `🚨【OpenBMCLAPI 节点离线告警】\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🖥️ 节点名称: ${this.config.myClusterName || node?.name || '私有边缘节点'}\n` +
        `🆔 节点 ID: ${this.config.myClusterId}\n` +
        `⚠️ 当前状态: 离线 / 未上报\n` +
        `🕒 发生时间: ${formatDateTime()}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💡 建议排查: 请检查 iMac 机器网络、Podman 容器或公网 FRP 穿透进程。`
      )
    } else if (this.lastOnlineState === false && isOnline === true) {
      // Transition: Offline -> Online
      this.lastOnlineState = true
      await this.broadcastAlert(
        `✅【OpenBMCLAPI 节点恢复上线】\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🖥️ 节点名称: ${this.config.myClusterName || node?.name || '私有边缘节点'}\n` +
        `🆔 节点 ID: ${this.config.myClusterId}\n` +
        `🟢 运行状态: 已重新加入全网分发\n` +
        `🕒 恢复时间: ${formatDateTime()}`
      )
    }
  }

  private async broadcastAlert(message: string) {
    const targets = this.config.alertTargets || []
    for (const target of targets) {
      if (!target.enabled || !target.targetId) continue

      try {
        if (target.type === 'channel') {
          // 群聊 / 频道：走 ctx.broadcast 广播至 channelId
          await this.ctx.broadcast([target.targetId], message)
        } else {
          // 私聊：寻找可用 online bot 实例发送私信
          let sent = false
          for (const bot of this.ctx.bots) {
            if (bot.status === Universal.Status.ONLINE) {
              await bot.sendPrivateMessage(target.targetId, message)
              sent = true
              break
            }
          }
          if (!sent) {
            this.ctx.logger('openbmclapi').warn(`未能找到在线 Bot 发送私聊告警至用户 ${target.targetId}`)
          }
        }
      } catch (err: any) {
        this.ctx.logger('openbmclapi').warn(`发送报警到目标 [${target.type}] ${target.targetId} 失败:`, err.message)
      }
    }
  }
}
