import { Schema } from 'koishi'
import { OUTPUT_FORMAT, OutputFormat, type AlertTarget } from './types'

export interface Config {
  // ===== 消息输出模式 =====
  outputFormats: OutputFormat[]
  enableQuote: boolean

  // ===== 核心接口与节点 =====
  apiBase: string
  cacheTtl: number
  myClusterId: string
  myClusterName: string

  // ===== Takumi 渲染设置 =====
  takumiWidth: number
  takumiDarkMode: boolean
  takumiFontPath: string

  // ===== 私有节点心跳巡检与告警 =====
  enableAlert: boolean
  alertInterval: number
  alertTargets: AlertTarget[]
}

export const Config: Schema<Config> = Schema.intersect([
  // 1. 消息输出模式
  Schema.object({
    outputFormats: Schema
      .array(Schema.union([
        Schema.const(OUTPUT_FORMAT.TEXT).description('📄【text】纯文本模式：发送带 Emoji 结构化排版文本（轻量秒回，兼容全平台）'),
        Schema.const(OUTPUT_FORMAT.TAKUMI_IMAGE).description('🖼️【takumi_image】Takumi 图片模式：WASM 极速渲染精美状态大图（毫秒级、免无头浏览器）'),
        Schema.const(OUTPUT_FORMAT.MARKDOWN).description('📝【markdown】Markdown 模式：QQ/Discord/TG 原生渲染，其他平台发标准 MD 源码（方便复制到编辑器）'),
      ]))
      .role('checkbox')
      .default([OUTPUT_FORMAT.TEXT, OUTPUT_FORMAT.TAKUMI_IMAGE, OUTPUT_FORMAT.MARKDOWN])
      .description('📤 选择指令回复（被动响应）与掉线告警的输出格式（可多选，多选时按顺序组合发送）'),
    enableQuote: Schema
      .boolean()
      .default(true)
      .description('💬 指令查询回复时是否引用触发消息'),
  }).description('💬 消息输出设置'),

  // 2. 核心接口与节点配置
  Schema.object({
    apiBase: Schema
      .string()
      .default('https://bd.bangbang93.com')
      .description('🌐 OpenBMCLAPI 监控后端基地址（默认指向官方 bd.bangbang93.com）'),
    cacheTtl: Schema
      .number()
      .default(60)
      .description('⏱️ 接口数据本地内存缓存时长（秒），避免群友刷屏频繁触发官方风控'),
    myClusterId: Schema
      .string()
      .default('6adf0d69576aa033c38b0759')
      .description('🖥️ 服主预设的 Cluster ID（用于 /bmcl-my 快捷直查与心跳监控）'),
    myClusterName: Schema
      .string()
      .default('陆大四楼iMac')
      .description('🏷️ 服主预设节点的自定义别名'),
  }).description('⚙️ 核心参数与节点预设'),

  // 3. Takumi WASM 渲染参数
  Schema.object({
    takumiDarkMode: Schema
      .boolean()
      .default(true)
      .description('🌙 默认启用暗黑科技风主题（关则为明亮现代风）'),
    takumiWidth: Schema
      .number()
      .default(880)
      .description('📐 Takumi 渲染图片的画布宽度（像素）'),
    takumiFontPath: Schema
      .string()
      .default('data/fonts/LXGWWenKaiMono-Medium.ttf')
      .description('🔤 字体文件路径（默认使用项目预置的霞鹜文楷等宽中文字体）'),
  }).description('🎨 Takumi 图片渲染设置'),

  // 4. 节点掉线巡检与告警推送
  Schema.object({
    enableAlert: Schema
      .boolean()
      .default(false)
      .description('🚨 是否启用私有节点（myClusterId）掉线巡检定时任务'),
    alertInterval: Schema
      .number()
      .default(5)
      .description('⏰ 巡检间隔时间（分钟，范围建议 2~30 分钟）'),
    alertTargets: Schema
      .array(Schema.object({
        enabled: Schema.boolean().default(true).description('是否启用'),
        type: Schema.union([
          Schema.const('channel' as const).description('👥 群聊 / 频道'),
          Schema.const('user' as const).description('👤 私聊 / 用户'),
        ]).default('channel' as const).description('目标类型'),
        targetId: Schema.string().required().description('目标 ID（群号或用户 QQ 号）'),
        remark: Schema.string().description('备注说明（可选，例如：陆大四楼运维群）'),
      }))
      .role('table')
      .default([])
      .description('📢 告警接收列表（支持多目标表格、群聊/私聊分流及独立开关）'),
  }).description('🚨 私有节点掉线巡检与告警'),
])
