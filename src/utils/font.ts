import { existsSync } from 'fs'
import { resolve } from 'path'

const CANDIDATE_FONTS = [
  'data/fonts/LXGWWenKaiMono-Medium.ttf',
  'data/fonts/LXGWWenKaiMono-Regular.ttf',
  'data/fonts/SourceHanSerifSC-Medium.otf',
  'C:/Windows/Fonts/msyh.ttc',
  'C:/Windows/Fonts/simhei.ttf',
]

export function resolveFontPath(configuredPath?: string): string | null {
  if (configuredPath) {
    const direct = resolve(process.cwd(), configuredPath)
    if (existsSync(direct)) return direct
    if (existsSync(configuredPath)) return configuredPath
  }

  for (const cand of CANDIDATE_FONTS) {
    const abs = resolve(process.cwd(), cand)
    if (existsSync(abs)) return abs
    if (existsSync(cand)) return cand
  }

  return null
}
