import pytest
import httpx

def test_version_endpoint(client: httpx.Client):
    """测试 /openbmclapi/metric/version 主控版本接口"""
    response = client.get("/openbmclapi/metric/version")
    assert response.status_code == 200, f"Version 接口返回异常状态码: {response.status_code}"
    
    data = response.json()
    assert isinstance(data, dict), "Version 数据应为字典/对象"
    assert "version" in data, "缺少 version 字段"
    assert isinstance(data["version"], str), "version 应为字符串"
    assert len(data["version"]) > 0, "version 字符串不应为空"
