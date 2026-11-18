import type { ReactNode } from 'react'
import { Arrow } from '../components/diagram'

/*
 * 全章で共通の図の部品と決まり（凡例は第1章の図1-2）。
 *   力           ：青の太い矢印（Force）
 *   速さと向き   ：黒の矢印（Vel）
 *   通った道筋   ：点線（Trail）
 *   誤り・否定された考え：赤の線と ×（Arrow danger、Cross）
 * 物体は Ball（丸）で描く。色だけで区別せず、必ず文字のラベルを添える。
 */

/** 力の矢印（青・太） */
export function Force(p: { x1: number; y1: number; x2: number; y2: number }) {
  return <Arrow {...p} accent />
}

/** 速さと向きの矢印（黒） */
export function Vel(p: { x1: number; y1: number; x2: number; y2: number }) {
  return <Arrow {...p} />
}

/** 通った道筋（点線）。points は [x, y] の並び、または path の d */
export function Trail({ points, d }: { points?: [number, number][]; d?: string }) {
  const path = d ?? (points ?? []).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return <path d={path} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="3 4" />
}

/** 物体（丸）。fill は塗りの種類（diagram.tsx の Fill と同じ名前）か CSS の色 */
export function Ball({ x, y, r = 10, fill = 'var(--fig-box3)', stroke = 'var(--fig-line)', children }: { x: number; y: number; r?: number; fill?: string; stroke?: string; children?: ReactNode }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {children}
    </g>
  )
}

/** 否定された考えや起こらないことの印（赤の ×） */
export function Cross({ x, y, s = 9 }: { x: number; y: number; s?: number }) {
  return (
    <g stroke="var(--fig-danger)" strokeWidth={3} strokeLinecap="round">
      <line x1={x - s} y1={y - s} x2={x + s} y2={y + s} />
      <line x1={x - s} y1={y + s} x2={x + s} y2={y - s} />
    </g>
  )
}

/** 正弦波の path の d。x0 から長さ len、振幅 amp、波長 wl、位相 phase（ラジアン） */
export function wave(x0: number, y0: number, len: number, amp: number, wl: number, phase = 0, step = 2): string {
  let d = ''
  for (let x = 0; x <= len; x += step) d += `${x ? 'L' : 'M'}${(x0 + x).toFixed(1)},${(y0 - amp * Math.sin((2 * Math.PI * x) / wl + phase)).toFixed(1)}`
  return d
}

/** 決まった種から作る乱数（図を開くたびに同じ並びになる）。0 以上 1 未満を返す関数 */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

/** 0〜1 の範囲に収める */
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** 0→1 をなめらかにつなぐ（動きの始めと終わりを緩やかにする） */
export const ease = (v: number) => {
  const c = clamp01(v)
  return c * c * (3 - 2 * c)
}
