import pytest
import httpx

def test_rank_endpoint_status(client: httpx.Client):
    """测试 /openbmclapi/metric/rank 状态码与响应格式"""
    response = client.get("/openbmclapi/metric/rank")
    assert response.status_code == 200, f"Rank 接口返回异常状态码: {response.status_code}"
    assert "application/json" in response.headers.get("content-type", "")

def test_rank_schema_and_types(client: httpx.Client):
    """测试天梯榜节点列表的数据结构"""
    response = client.get("/openbmclapi/metric/rank")
    data = response.json()
    assert isinstance(data, list), "Rank 数据应为节点列表"
    assert len(data) > 0, "节点天梯榜不应为空"

    sample = data[0]
    assert "_id" in sample, "节点缺少 _id 字段"
    assert "name" in sample, "节点缺少 name 字段"
    assert "isEnabled" in sample, "节点缺少 isEnabled 字段"
    assert isinstance(sample["isEnabled"], bool), "isEnabled 应为布尔值"

    if "metric" in sample and sample["metric"]:
        metric = sample["metric"]
        assert "bytes" in metric, "metric 缺少 bytes"
        assert "hits" in metric, "metric 缺少 hits"
        assert isinstance(metric["bytes"], (int, float))
        assert isinstance(metric["hits"], int)

def test_rank_search_filter_simulation(client: httpx.Client):
    """测试客户端模糊搜索逻辑（ID 或名称匹配）"""
    response = client.get("/openbmclapi/metric/rank")
    data = response.json()

    # 选取榜首节点测试搜索
    target_node = data[0]
    node_id_part = target_node["_id"][:4]
    
    # 按照插件的 findNodes 逻辑过滤
    matched_by_id = [x for x in data if node_id_part.lower() in x["_id"].lower()]
    assert len(matched_by_id) >= 1
    assert any(x["_id"] == target_node["_id"] for x in matched_by_id)

    if target_node.get("name"):
        name_part = target_node["name"][:2]
        matched_by_name = [x for x in data if x.get("name") and name_part.lower() in x["name"].lower()]
        assert len(matched_by_name) >= 1
