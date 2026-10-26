# 🚀 koishi-plugin-openbmclapi-status

[![npm](https://img.shields.io/npm/v/koishi-plugin-openbmclapi-status?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-openbmclapi-status)

🚀 **OpenBMCLAPI 状态查询与节点监控助手** —— 为 Koishi 打造的 Minecraft 镜像源集群监控与节点管家插件。

对标并超越原 QQ 群经典 Bot（“八蓝米公用崽子”），支持全网大盘监控、天梯排行榜、节点模糊搜索、单节点详情证书，以及私有边缘节点掉线告警巡检。

---

## ✨ 特性亮点

* ⚡ **三模一体自由组合**：
  * 📄 **【text 纯文本】**：精美 Emoji 结构化排版，秒级响应，兼容全平台协议。
  * 🖼️ **【takumi_image 高性能出图】**：基于 Rust/WASM 的 `@takumi-rs`，无需启动笨重的无头浏览器，50ms 极速生成精美科技风状态卡片与长图。
  * 🐧 **【qq_markdown QQ 原生 MD】**：原生适配 QQ 官方平台，支持 Markdown 表格与引用块排版。
* 🏆 **全网天梯排行榜**：实时拉取当日各节点的分发流量、请求命中数与全网占比。
* 🔍 **智能模糊搜索**：支持输入 Cluster ID 片段或节点名称进行快速检索。
* 🚨 **服主节点守护神**：配置您的私有节点后，支持定时心跳巡检，节点离线时自动向指定群/私聊推送报警。
* 🛡️ **内存级防刷缓存**：内置 60 秒数据缓存保护，防止群友刷屏频繁触发官方主控风控。

---

## 💻 常用指令

| 默认主指令 | 英文别名（全带 bmcl 前缀） | 功能说明 |
| :--- | :--- | :--- |
| `/bmcl` | 无 | 输出所有子指令说明卡片 |
| `/bmcl.大盘` | `/bmcl.dashboard` | 查询 OpenBMCLAPI 全网集群实时运行看板（实时带宽、今日流量、节点总数） |
| `/bmcl.排行 [数量]` | `/bmcl.top`, `/bmcl.rank` | 查询全网节点分发流量天梯排行榜（默认展示 Top 10） |
| `/bmcl.搜索 <关键词>` | `/bmcl.search`, `/bmcl.find` | 模糊搜索匹配的节点列表 |
| `/bmcl.状态 <节点ID或名称>` | `/bmcl.status`, `/bmcl.node` | 查询指定节点的详细运行指标与今日贡献度 |
| `/bmcl.我的` | `/bmcl.my`, `/bmcl.mine` | 快捷查询在配置项中预设的自建节点状态（免手打长 ID） |

---

## ⚙️ 配置说明

在 Koishi 控制台中进入插件配置：

* **输出模式多选 (`outputFormats`)**：可勾选 `text`（纯文本）、`takumi_image`（WASM出图）、`markdown`（Markdown格式），多选时按顺序依次分多条独立消息发送。
* **引用原消息 (`enableQuote`)**：指令回复时是否引用触发者的消息。
* **预设 Cluster ID (`myClusterId`)**：配置您自己的边缘节点 ID（如 `6adf0d69576aa033c38b0759`）。
* **节点别名 (`myClusterName`)**：自定义节点名称（如 `陆大四楼iMac`）。
* **缓存时长 (`cacheTtl`)**：接口数据本地缓存秒数（默认 60s）。
* **掉线巡检 (`enableAlert`)**：是否启用定时巡检与离线报警。
* **告警接收目标 (`alertTargets`)**：接收报警通知的目标 Channel/User ID 列表。
