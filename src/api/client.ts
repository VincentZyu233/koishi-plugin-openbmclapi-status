import { Context } from 'koishi'
import { Config } from '../config'
import { ENDPOINTS } from './endpoints'
import { DashboardMetric, ClusterRankItem, NodeMetric, VersionInfo } from '../types'

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class BmclApiClient {
  private cache = new Map<string, CacheEntry<any>>()

  constructor(private ctx: Context, private config: Config) {}

  private async fetchWithCache<T>(key: string, url: string, ttlSeconds: number = this.config.cacheTtl): Promise<T> {
    const now = Date.now()
    const cached = this.cache.get(key)
    if (cached && cached.expiresAt > now) {
      return cached.data
    }

    const fullUrl = `${this.config.apiBase.replace(/\/+$/, '')}${url}`
    const response = await this.ctx.http.get<T>(fullUrl, {
      timeout: 10000,
    })

    this.cache.set(key, {
      data: response,
      expiresAt: now + ttlSeconds * 1000,
    })

    return response
  }

  async getDashboard(): Promise<DashboardMetric> {
    return this.fetchWithCache<DashboardMetric>('dashboard', ENDPOINTS.DASHBOARD)
  }

  async getRank(): Promise<ClusterRankItem[]> {
    return this.fetchWithCache<ClusterRankItem[]>('rank', ENDPOINTS.RANK)
  }

  async getVersion(): Promise<VersionInfo> {
    return this.fetchWithCache<VersionInfo>('version', ENDPOINTS.VERSION, 3600)
  }

  async getClusterMetric(id: string): Promise<NodeMetric[]> {
    return this.fetchWithCache<NodeMetric[]>(`cluster_${id}`, ENDPOINTS.CLUSTER_METRIC(id), 30)
  }

  async findNodes(keyword: string): Promise<ClusterRankItem[]> {
    const list = await this.getRank()
    const kw = keyword.toLowerCase().trim()
    if (!kw) return list
    return list.filter(item => 
      item._id.toLowerCase().includes(kw) || 
      (item.name && item.name.toLowerCase().includes(kw))
    )
  }

  async getNode(idOrKeyword: string): Promise<ClusterRankItem | null> {
    const list = await this.getRank()
    const kw = idOrKeyword.toLowerCase().trim()
    // First try exact match on ID
    const exact = list.find(item => item._id.toLowerCase() === kw)
    if (exact) return exact
    // Then exact match on Name
    const nameMatch = list.find(item => item.name && item.name.toLowerCase() === kw)
    if (nameMatch) return nameMatch
    // Then partial match
    return list.find(item => item._id.toLowerCase().includes(kw) || (item.name && item.name.toLowerCase().includes(kw))) || null
  }
}
