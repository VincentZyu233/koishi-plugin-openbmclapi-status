import { Session, h } from 'koishi'
import { Config } from '../config'
import { OUTPUT_FORMAT, OutputFormat, DashboardMetric, ClusterRankItem, NodeMetric, VersionInfo } from '../types'
import { renderDashboardText, renderRankText, renderNodeDetailText, renderNodeSearchText } from '../renderers/text'
import { renderDashboardTakumi, renderRankTakumi, renderNodeTakumi } from '../renderers/takumi'
import { renderDashboardMarkdown, renderRankMarkdown, renderNodeMarkdown } from '../renderers/qq-markdown'

export class OutputService {
  constructor(private config: Config) {}

  private async sendMultiple(session: Session, messageList: (string | h)[]) {
    let isFirst = true
    for (const msg of messageList) {
      if (!msg) continue
      const payload = (this.config.enableQuote && isFirst && session.messageId)
        ? [h.quote(session.messageId), msg]
        : [msg]

      await session.send(payload)
      isFirst = false
    }
  }

  private wrapMarkdown(session: Session, mdContent: string): string | h {
    if (session.platform === 'qq' || session.platform === 'qqguild') {
      return h('markdown', { content: mdContent })
    }
    return mdContent
  }

  async sendDashboard(session: Session, data: DashboardMetric, version?: VersionInfo) {
    const formats = this.config.outputFormats || [OUTPUT_FORMAT.TEXT]
    const messages: (string | h)[] = []

    for (const fmt of formats) {
      if (fmt === OUTPUT_FORMAT.TEXT) {
        messages.push(renderDashboardText(data, version))
      } else if (fmt === OUTPUT_FORMAT.TAKUMI_IMAGE) {
        try {
          const imgBuf = await renderDashboardTakumi(data, version, {
            width: this.config.takumiWidth,
            darkMode: this.config.takumiDarkMode,
            fontPath: this.config.takumiFontPath,
          })
          messages.push(h.image(imgBuf, 'image/png'))
        } catch (e: any) {
          if (!formats.includes(OUTPUT_FORMAT.TEXT)) {
            messages.push(renderDashboardText(data, version))
          }
        }
      } else if (fmt === OUTPUT_FORMAT.MARKDOWN || (fmt as string) === 'qq_markdown') {
        const md = renderDashboardMarkdown(data, version)
        messages.push(this.wrapMarkdown(session, md))
      }
    }

    await this.sendMultiple(session, messages)
  }

  async sendRank(session: Session, list: ClusterRankItem[], maxCount: number = 10) {
    const formats = this.config.outputFormats || [OUTPUT_FORMAT.TEXT]
    const messages: (string | h)[] = []

    for (const fmt of formats) {
      if (fmt === OUTPUT_FORMAT.TEXT) {
        messages.push(renderRankText(list, maxCount))
      } else if (fmt === OUTPUT_FORMAT.TAKUMI_IMAGE) {
        try {
          const imgBuf = await renderRankTakumi(list, maxCount, {
            width: this.config.takumiWidth,
            darkMode: this.config.takumiDarkMode,
            fontPath: this.config.takumiFontPath,
          })
          messages.push(h.image(imgBuf, 'image/png'))
        } catch (e: any) {
          if (!formats.includes(OUTPUT_FORMAT.TEXT)) {
            messages.push(renderRankText(list, maxCount))
          }
        }
      } else if (fmt === OUTPUT_FORMAT.MARKDOWN || (fmt as string) === 'qq_markdown') {
        const md = renderRankMarkdown(list, maxCount)
        messages.push(this.wrapMarkdown(session, md))
      }
    }

    await this.sendMultiple(session, messages)
  }

  async sendNodeDetail(session: Session, item: ClusterRankItem, metrics?: NodeMetric[], rankPosition?: number) {
    const formats = this.config.outputFormats || [OUTPUT_FORMAT.TEXT]
    const messages: (string | h)[] = []

    for (const fmt of formats) {
      if (fmt === OUTPUT_FORMAT.TEXT) {
        messages.push(renderNodeDetailText(item, metrics, rankPosition))
      } else if (fmt === OUTPUT_FORMAT.TAKUMI_IMAGE) {
        try {
          const imgBuf = await renderNodeTakumi(item, metrics, rankPosition, {
            width: this.config.takumiWidth,
            darkMode: this.config.takumiDarkMode,
            fontPath: this.config.takumiFontPath,
          })
          messages.push(h.image(imgBuf, 'image/png'))
        } catch (e: any) {
          if (!formats.includes(OUTPUT_FORMAT.TEXT)) {
            messages.push(renderNodeDetailText(item, metrics, rankPosition))
          }
        }
      } else if (fmt === OUTPUT_FORMAT.MARKDOWN || (fmt as string) === 'qq_markdown') {
        const md = renderNodeMarkdown(item, metrics, rankPosition)
        messages.push(this.wrapMarkdown(session, md))
      }
    }

    await this.sendMultiple(session, messages)
  }

  async sendSearchResults(session: Session, list: ClusterRankItem[]) {
    // 搜索结果为结构化文本，单条发送
    const text = renderNodeSearchText(list)
    await this.sendMultiple(session, [text])
  }
}
