export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  if (i < 0) return `${bytes} B`
  const clampedIndex = Math.min(i, sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, clampedIndex)).toFixed(dm))} ${sizes[clampedIndex]}`
}

export function formatBandwidth(bps: number, decimals: number = 2): string {
  if (!bps || bps === 0) return '0 Mbps'
  // In OpenBMCLAPI metric, bandwidth is in bytes/second or bits/second?
  // In dashboard: bandwidth 238274690.57083333 -> ~238 MB/s or ~1.9 Gbps.
  // We treat input as bytes/s * 8 or bits/s based on magnitude:
  // Usually bandwidth in dashboard is bits/s. Let's convert:
  const bits = bps * 8 // If dashboard bandwidth is bytes/s
  const mbps = bits / 1_000_000
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(decimals)} Gbps`
  }
  return `${mbps.toFixed(decimals)} Mbps`
}

export function formatNumber(num: number): string {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString('en-US')
}

export function formatDateTime(dateInput?: string | number | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
