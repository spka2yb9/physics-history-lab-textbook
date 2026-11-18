import type { ReactNode } from 'react'

/** 7つの分野。部（PARTS）と1対1に対応する。色は index.css の --f-<id> と --f-<id>-bg。 */
export type FieldId = 'classical' | 'em' | 'thermo' | 'relativity' | 'quantum' | 'particle' | 'cosmo'

export interface Field {
  id: FieldId
  /** book.ts の PARTS の id */
  part: string
  name: string
  /** 2行に分けて表示するときの名前 */
  lines: string[]
  /** 主な時代 */
  period: string
  /** カードに出す説明（40字前後） */
  lead: string
}

export const FIELDS: Field[] = [
  { id: 'classical', part: 'p1', name: '古典力学', lines: ['古典力学'], period: '17世紀〜', lead: '物の運動と力の法則を扱い、物理学のほかの分野の出発点になった分野。' },
  { id: 'em', part: 'p2', name: '電磁気学', lines: ['電磁気学'], period: '19世紀', lead: '電気と磁気と光を、一つの理論で説明する分野。' },
  { id: 'thermo', part: 'p3', name: '熱力学・統計力学', lines: ['熱力学・', '統計力学'], period: '19世紀', lead: '熱とエネルギー、たくさんの分子のふるまいを扱う分野。' },
  { id: 'relativity', part: 'p4', name: '相対性理論', lines: ['相対性理論'], period: '1905〜1915年', lead: '時間と空間と重力の考え方を作り直した、20世紀初めの理論。' },
  { id: 'quantum', part: 'p5', name: '量子力学', lines: ['量子力学'], period: '1900〜1930年代', lead: '原子や電子など、とても小さなものの法則を扱う理論。' },
  { id: 'particle', part: 'p6', name: '量子場理論・素粒子物理学', lines: ['量子場理論・', '素粒子物理学'], period: '1930年代〜', lead: '物質をつくる最小の粒子と、粒子の間にはたらく力を扱う分野。' },
  { id: 'cosmo', part: 'p7', name: '宇宙論・重力理論', lines: ['宇宙論・', '重力理論'], period: '1910年代〜', lead: '宇宙の始まりと進化、重力の正体を探る分野。' },
]

export const fieldById = new Map(FIELDS.map((f) => [f.id, f]))
export const fieldByPart = new Map(FIELDS.map((f) => [f.part, f]))

/** 分野の小さな印（24×24）。色は currentColor。装飾なので読み上げない */
export function FieldIcon({ id, size = 24 }: { id: FieldId; size?: number }) {
  return (
    <svg className="field-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[id]}
    </svg>
  )
}

const ICONS: Record<FieldId, ReactNode> = {
  // りんご
  classical: (
    <>
      <path d="M12 7.5c-1.6-1.3-5.5-1.6-6.6 2-1 3.3 1.1 9.7 4.1 10.3 1 .2 1.6-.4 2.5-.4s1.5.6 2.5.4c3-.6 5.1-7 4.1-10.3-1.1-3.6-5-3.3-6.6-2Z" fill="currentColor" fillOpacity={0.15} />
      <path d="M12 7.5c0-2 .6-3.5 2-4.5" />
      <path d="M12.6 5.6c1.5-1.6 3.6-1.6 4.4-1.1-.6 1.6-2.4 2.3-4.4 1.1Z" />
    </>
  ),
  // U字の磁石
  em: (
    <>
      <path d="M5 4v8a7 7 0 0 0 14 0V4" />
      <path d="M9 4v8a3 3 0 0 0 6 0V4" />
      <path d="M5 4h4M15 4h4M5 7.5h4M15 7.5h4" />
    </>
  ),
  // 温度計
  thermo: (
    <>
      <path d="M10 14.2V4.5a2 2 0 0 1 4 0v9.7a4 4 0 1 1-4 0Z" />
      <circle cx="12" cy="17.5" r="1.8" fill="currentColor" />
      <path d="M12 15.7V8" />
    </>
  ),
  // くぼんだ時空の格子
  relativity: (
    <>
      <path d="M2 7c4 0 6 1 8 5 1 2 3 2 4 0 2-4 4-5 8-5" />
      <path d="M3 4.5c3.5 0 6 .6 8 3.5M21 4.5c-3.5 0-6 .6-8 3.5" />
      <path d="M12 13v7M8.5 10.5l1.5 6M15.5 10.5l-1.5 6" />
    </>
  ),
  // 原子
  quantum: (
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </>
  ),
  // 粒子の集まり
  particle: (
    <>
      <circle cx="8" cy="6" r="2" fill="currentColor" />
      <circle cx="15.5" cy="5.5" r="1.5" fill="currentColor" fillOpacity={0.5} />
      <circle cx="5" cy="13" r="1.5" fill="currentColor" fillOpacity={0.5} />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      <circle cx="19" cy="11.5" r="2" fill="currentColor" fillOpacity={0.7} />
      <circle cx="9" cy="19" r="2" fill="currentColor" fillOpacity={0.7} />
      <circle cx="16.5" cy="18" r="1.5" fill="currentColor" fillOpacity={0.5} />
    </>
  ),
  // 渦巻き銀河
  cosmo: (
    <>
      <path d="M12 12c1.2-.4 1.4-2 .2-2.6-1.8-.9-3.9.8-3.6 2.9.4 2.8 4 3.8 6.2 2 2.7-2.2 1.8-6.8-1.6-8-4.2-1.5-8.6 1.7-8.4 6.2" />
      <path d="M12 12c-1.2.4-1.4 2-.2 2.6 1.8.9 3.9-.8 3.6-2.9" opacity={0.6} />
      <path d="M4.8 12.5c.4 4.6 5 7.6 9.4 6.1 2.5-.9 4.3-3 4.9-5.5" />
    </>
  ),
}
