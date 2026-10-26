import pytest
import httpx

def test_cluster_metric_for_active_node(client: httpx.Client):
    """测试活跃上榜节点的历史分发指标接口"""
    # 1. 先从天梯榜获取一个有效节点 ID
    rank_res = client.get("/openbmclapi/metric/rank")
    assert rank_res.status_code == 200
    rank_list = rank_res.json()
    assert len(rank_list) > 0
    active_node_id = rank_list[0]["_id"]

    # 2. 查询该节点的历史指标
    metric_res = client.get(f"/openbmclapi/metric/cluster/{active_node_id}")
    assert metric_res.status_code == 200
    metrics = metric_res.json()
    assert isinstance(metrics, list), "集群历史指标应为数组"

    if len(metrics) > 0:
        sample = metrics[0]
        assert "date" in sample, "缺少 date 日期字段"
        assert "bytes" in sample, "缺少 bytes 流量字段"
        assert "hits" in sample, "缺少 hits 请求数字段"
        assert "clusterId" in sample, "缺少 clusterId 字段"
        assert sample["clusterId"] == active_node_id

def test_cluster_metric_for_unranked_node(client: httpx.Client):
    """测试未上榜新节点或私有节点的指标接口（返回空数组而非 500）"""
    # 预设的私有 iMac 节点 ID
    my_cluster_id = "6adf0d69576aa033c38b0759"
    metric_res = client.get(f"/openbmclapi/metric/cluster/{my_cluster_id}")
    assert metric_res.status_code == 200, "对于未产生分发的节点，接口应返回 200 OK"
    metrics = metric_res.json()
    assert isinstance(metrics, list), "未产生分发时应返回空数组 []"
    assert len(metrics) == 0, "新节点指标应为空数组"

def test_cluster_metric_for_invalid_id(client: httpx.Client):
    """测试非法或不存在的 ID 容错性"""
    invalid_id = "000000000000000000000000"
    res = client.get(f"/openbmclapi/metric/cluster/{invalid_id}")
    assert res.status_code == 200
    assert res.json() == []
