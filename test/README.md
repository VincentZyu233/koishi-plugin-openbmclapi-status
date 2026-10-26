# 🧪 OpenBMCLAPI 接口全套自动化测试套件

本测试套件采用 **Python + pytest + httpx** 构建，直接针对 OpenBMCLAPI 官方后端接口（`https://bd.bangbang93.com`）及其返回的数据结构进行全方位契约测试与逻辑模拟。

免去任何复杂的虚拟环境配置，直接通过 **`uv run`** 一键并行运行。

---

## 📋 包含的测试用例清单

| 测试文件 | 测试目标与覆盖场景 |
| :--- | :--- |
| **`test_dashboard.py`** | 测试全网大盘接口（`/openbmclapi/metric/dashboard`）：当日分发流量、全网请求命中数、小时级吞吐带宽、边缘节点数统计。 |
| **`test_rank.py`** | 测试天梯排行榜接口（`/openbmclapi/metric/rank`）：节点列表结构、上线状态、当日节点分发指标以及客户端模糊搜索匹配过滤算法。 |
| **`test_version.py`** | 测试主控版本接口（`/openbmclapi/metric/version`）：响应格式与版本号字符串提取。 |
| **`test_cluster.py`** | 测试单节点历史指标接口（`/openbmclapi/metric/cluster/:id`）：活跃节点的历史多日数据、未上榜/未分发节点的容错（返回空数组）、非法 ID 容错。 |
| **`test_client_simulation.py`** | 模拟测试 `openbmclapi-status` 插件内部核心算法：天梯榜降序排序、三段式节点检索（精准ID/精准名称/模糊匹配）、实时带宽换算逻辑。 |

---

## ⚡ 一键执行测试

在当前 `test` 目录或插件根目录下，直接使用 `uv` 运行：

```bash
# 1. 运行全部测试套件
uv run --with pytest --with httpx pytest test/ -v

# 2. 若直连网络不稳定，可通过代理运行
HTTP_PROXY=http://127.0.0.1:7890 HTTPS_PROXY=http://127.0.0.1:7890 uv run --with pytest --with httpx pytest test/ -v

# 3. 指定单个文件测试
uv run --with pytest --with httpx pytest test/test_dashboard.py -v
```
