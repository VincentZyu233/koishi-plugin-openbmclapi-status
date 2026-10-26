import pytest
import httpx

def test_dashboard_endpoint_status(client: httpx.Client):
    """测试 /openbmclapi/metric/dashboard 状态码与响应头"""
    response = client.get("/openbmclapi/metric/dashboard")
    assert response.status_code == 200, f"Dashboard 接口返回异常状态码: {response.status_code}"
    assert "application/json" in response.headers.get("content-type", "")

def test_dashboard_schema_and_types(client: httpx.Client):
    """测试大盘指标 JSON 结构与字段类型"""
    response = client.get("/openbmclapi/metric/dashboard")
    data = response.json()
    assert isinstance(data, dict), "Dashboard 数据应为字典/对象"

    # 核心字段校验
    assert "bytes" in data, "缺少 bytes 字段"
    assert "hits" in data, "缺少 hits 字段"
    assert "hourly" in data, "缺少 hourly 字段"

    assert isinstance(data["bytes"], (int, float)) and data["bytes"] >= 0
    assert isinstance(data["hits"], int) and data["hits"] >= 0
    assert isinstance(data["hourly"], list)

def test_dashboard_hourly_metrics(client: httpx.Client):
    """测试 hourly 小时级吞吐与节点数结构"""
    response = client.get("/openbmclapi/metric/dashboard")
    data = response.json()
    hourly_list = data.get("hourly", [])
    
    if hourly_list:
        sample = hourly_list[-1]
        assert "_id" in sample, "hourly 条目缺少 _id (小时索引)"
        assert "bandwidth" in sample, "hourly 条目缺少 bandwidth"
        assert "nodes" in sample, "hourly 条目缺少 nodes (在线边缘节点数)"
        assert isinstance(sample["bandwidth"], (int, float))
        assert isinstance(sample["nodes"], int)
        assert sample["nodes"] >= 0
