export const ENDPOINTS = {
  DASHBOARD: '/openbmclapi/metric/dashboard',
  RANK: '/openbmclapi/metric/rank',
  VERSION: '/openbmclapi/metric/version',
  CLUSTER_METRIC: (id: string) => `/openbmclapi/metric/cluster/${encodeURIComponent(id)}`,
} as const
