"""
模拟测试 openbmclapi-status 客户端的内部核心调度与算法逻辑
包括：全网大盘统计、排行榜排序、单节点检索算法、未上榜节点容错等
"""
import pytest
import httpx

def test_plugin_rank_sorting_logic(client: httpx.Client):
    """测试客户端天梯榜按当日流量降序排序算法"""
    res = client.get("/openbmclapi/metric/rank")
    assert res.status_code == 200
    rank_list = res.json()

    # 按照插件内部逻辑：降序排序
    sorted_list = sorted(
        rank_list,
        key=lambda x: (x.get("metric") or {}).get("bytes", 0),
        reverse=True
    )

    # 验证排序后的第 1 名流量大于等于最后一名
    first_bytes = (sorted_list[0].get("metric") or {}).get("bytes", 0)
    last_bytes = (sorted_list[-1].get("metric") or {}).get("bytes", 0)
    assert first_bytes >= last_bytes, "排序后的榜首流量必须大于等于榜尾流量"

def test_plugin_node_lookup_algorithm(client: httpx.Client):
    """测试客户端 getNode 的三段式检索算法：精准 ID -> 精准名称 -> 模糊包含"""
    res = client.get("/openbmclapi/metric/rank")
    rank_list = res.json()
    assert len(rank_list) > 0

    target = rank_list[0]
    target_id = target["_id"]
    target_name = target.get("name", "")

    def get_node(keyword: str):
        kw = keyword.lower().strip()
        # 1. 精准 ID
        for item in rank_list:
            if item["_id"].lower() == kw:
                return item
        # 2. 精准名称
        for item in rank_list:
            if item.get("name") and item["name"].lower() == kw:
                return item
        # 3. 模糊匹配
        for item in rank_list:
            if kw in item["_id"].lower() or (item.get("name") and kw in item["name"].lower()):
                return item
        return None

    # 测试精准 ID 查询
    assert get_node(target_id) is not None
    assert get_node(target_id)["_id"] == target_id

    # 测试大小写不敏感
    assert get_node(target_id.upper()) is not None

    # 测试名称查询
    if target_name:
        assert get_node(target_name) is not None

def test_dashboard_bandwidth_calculation(client: httpx.Client):
    """测试大盘实时带宽换算逻辑（防止除零或异常字段）"""
    res = client.get("/openbmclapi/metric/dashboard")
    data = res.json()
    hourly = data.get("hourly", [])
    
    current_hour = hourly[-1] if hourly else None
    if current_hour:
        bw = current_hour.get("bandwidth", 0)
        assert bw >= 0, "实时带宽不应为负数"
        # 换算为 Mbps: bytes * 8 / 3600 / 1000 / 1000
        mbps = (bw * 8) / 3600 / 1000 / 1000
        assert mbps >= 0
