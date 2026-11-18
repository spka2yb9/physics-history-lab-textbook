import { FIELDS, FieldIcon, fieldById, type FieldId } from '../content/fields'

/*
 * 物理学の歴史マップの全体像（トップページと歴史マップのページの冒頭）。
 * 分野の箱を押すと「分野から学ぶ」のその部へ移動する。広い画面は横長、狭い画面は縦長の図にする。
 */

const ERAS = [
  { x: 8, w: 222, name: '17世紀', sub: '近代科学の成立' },
  { x: 230, w: 240, name: '18〜19世紀', sub: '古典物理学の発展' },
  { x: 470, w: 262, name: '20世紀前半', sub: '物理学の大転換' },
  { x: 732, w: 262, name: '20世紀後半〜現在', sub: '現代物理学の展開' },
]

/** 横長の図での分野の箱の位置 */
const WIDE: Record<FieldId, { x: number; y: number; w: number; h: number }> = {
  classical: { x: 22, y: 126, w: 176, h: 70 },
  em: { x: 262, y: 78, w: 172, h: 62 },
  thermo: { x: 262, y: 168, w: 172, h: 76 },
  relativity: { x: 500, y: 78, w: 200, h: 62 },
  quantum: { x: 500, y: 170, w: 200, h: 62 },
  cosmo: { x: 780, y: 70, w: 196, h: 76 },
  particle: { x: 762, y: 162, w: 214, h: 80 },
}

const MILESTONES = [
  ['1687年', '『プリンキピア』', '（ニュートン）'],
  ['1860年代', '電磁気学の完成', '（マクスウェル）'],
  ['1860〜1900年', '統計力学の基礎', '（ボルツマン）'],
  ['1900年', '量子論の出発', '（プランク）'],
  ['1905年', '特殊相対性理論', '（アインシュタイン）'],
  ['1920年代', '量子力学の確立', '（ハイゼンベルク、', 'シュレーディンガーら）'],
  ['1930年代〜', '場の量子論と素粒子', '（ディラックら）'],
  ['1940年代〜', 'ビッグバン宇宙論', '（ガモフら）'],
]

function Node({ id, x, y, w, h, fs = 15 }: { id: FieldId; x: number; y: number; w: number; h: number; fs?: number }) {
  const f = fieldById.get(id)!
  const lines = f.lines
  const lh = fs * 1.25
  const textX = x + 46
  const top = y + h / 2 - ((lines.length - 1) * lh + 18) / 2
  return (
    <a href={`#/fields/${f.part}`} className={`ov-node f-${id}`} aria-label={`${f.name}（${f.period}）の部へ`}>
      <rect x={x} y={y} width={w} height={h} rx={8} className="ov-box" />
      <g transform={`translate(${x + 12} ${y + h / 2 - 13})`}>
        <FieldIcon id={id} size={26} />
      </g>
      {lines.map((l, i) => (
        <text key={i} x={textX} y={top + i * lh} fontSize={fs} fontWeight={700} dominantBaseline="central" className="ov-name">
          {l}
        </text>
      ))}
      <text x={textX} y={top + (lines.length - 1) * lh + 19} fontSize={12} dominantBaseline="central" className="ov-period">
        （{f.period}）
      </text>
    </a>
  )
}

export function OverviewMap({ timeline = true }: { timeline?: boolean }) {
  const H = timeline ? 372 : 262
  const n = (id: FieldId) => WIDE[id]
  const right = (id: FieldId) => n(id).x + n(id).w
  const midY = (id: FieldId) => n(id).y + n(id).h / 2
  return (
    <div className="overview-map">
      <svg className="ov-wide" viewBox={`0 0 1000 ${H}`} role="img" aria-label="物理学の7分野のつながり。古典力学から電磁気学と熱力学・統計力学が分かれ、その二つから相対性理論と量子力学が生まれた。相対性理論は宇宙論・重力理論へ、量子力学は量子場理論・素粒子物理学へ発展した。">
        <defs>
          <marker id="ov-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="ov-arrowhead" />
          </marker>
        </defs>
        {ERAS.map((e, i) => (
          <g key={i}>
            <path d={`M${e.x},8 h${e.w - 14} l14,20 l-14,20 h${-(e.w - 14)} ${i === 0 ? '' : 'l14,-20'} z`} className={`ov-era ov-era-${i}`} />
            <text x={e.x + e.w / 2 + 4} y={21} fontSize={13} fontWeight={700} textAnchor="middle" dominantBaseline="central">
              {e.name}
            </text>
            <text x={e.x + e.w / 2 + 4} y={38} fontSize={11} textAnchor="middle" dominantBaseline="central" className="ov-period">
              （{e.sub}）
            </text>
          </g>
        ))}
        {/* 古典力学 → 電磁気学・熱力学 */}
        <path d={`M${right('classical')},${midY('classical')} H230 V${midY('em')} H${n('em').x}`} className="ov-line" markerEnd="url(#ov-ar)" />
        <path d={`M230,${midY('classical')} V${midY('thermo')} H${n('thermo').x}`} className="ov-line" markerEnd="url(#ov-ar)" />
        {/* 電磁気学・熱力学 → 相対性理論・量子力学 */}
        <path d={`M${right('em')},${midY('em')} H466 V${midY('quantum')}`} className="ov-line" />
        <path d={`M${right('thermo')},${midY('thermo')} H466 V${midY('relativity')} H${n('relativity').x}`} className="ov-line" markerEnd="url(#ov-ar)" />
        <path d={`M466,${midY('quantum')} H${n('quantum').x}`} className="ov-line" markerEnd="url(#ov-ar)" />
        {/* 相対性理論 → 宇宙論、量子力学 → 素粒子 */}
        <path d={`M${right('relativity')},${midY('relativity')} H${n('cosmo').x}`} className="ov-line" markerEnd="url(#ov-ar)" />
        <path d={`M${right('quantum')},${midY('quantum')} H${n('particle').x}`} className="ov-line" markerEnd="url(#ov-ar)" />
        {FIELDS.map((f) => (
          <Node key={f.id} id={f.id} {...WIDE[f.id]} />
        ))}
        {timeline && (
          <g className="ov-timeline">
            <line x1={20} y1={272} x2={985} y2={272} className="ov-axis" markerEnd="url(#ov-ar)" />
            {MILESTONES.map((m, i) => {
              const x = 66 + i * 122
              return (
                <g key={i}>
                  <circle cx={x} cy={272} r={4} className="ov-dot" />
                  {m.map((t, j) => (
                    <text key={j} x={x} y={292 + j * 17} fontSize={j === 0 ? 12.5 : 11.5} fontWeight={j === 0 ? 700 : undefined} textAnchor="middle" dominantBaseline="central" className={j >= 2 ? 'ov-period' : undefined}>
                      {t}
                    </text>
                  ))}
                </g>
              )
            })}
          </g>
        )}
      </svg>
      <NarrowMap />
    </div>
  )
}

/** 狭い画面用の縦長の図 */
function NarrowMap() {
  const W = 340
  const box = { w: 158, h: 64 }
  const rows: FieldId[][] = [['classical'], ['em', 'thermo'], ['relativity', 'quantum'], ['cosmo', 'particle']]
  const y0 = 8
  const gap = 46
  const pos = new Map<FieldId, { x: number; y: number; w: number; h: number }>()
  rows.forEach((r, i) =>
    r.forEach((id, j) => {
      const x = r.length === 1 ? (W - 200) / 2 : j === 0 ? 4 : W - 4 - box.w
      pos.set(id, { x, y: y0 + i * (box.h + gap), w: r.length === 1 ? 200 : box.w, h: box.h })
    }),
  )
  const H = y0 + rows.length * (box.h + gap) - gap + 8
  const p = (id: FieldId) => pos.get(id)!
  const bottom = (id: FieldId) => p(id).y + p(id).h
  const cx = (id: FieldId) => p(id).x + p(id).w / 2
  return (
    <svg className="ov-narrow" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="物理学の7分野のつながり（縦長の図）。古典力学から電磁気学と熱力学・統計力学へ、そこから相対性理論と量子力学へ、さらに宇宙論・重力理論と量子場理論・素粒子物理学へ発展した。">
      <defs>
        <marker id="ovn-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="ov-arrowhead" />
        </marker>
      </defs>
      <path d={`M${W / 2},${bottom('classical')} V${bottom('classical') + gap / 2} H${cx('em')} V${p('em').y}`} className="ov-line" markerEnd="url(#ovn-ar)" />
      <path d={`M${W / 2},${bottom('classical') + gap / 2} H${cx('thermo')} V${p('thermo').y}`} className="ov-line" markerEnd="url(#ovn-ar)" />
      <path d={`M${cx('em')},${bottom('em')} V${bottom('em') + gap / 2} H${cx('thermo')} V${bottom('thermo')}`} className="ov-line" />
      <path d={`M${cx('relativity')},${bottom('em') + gap / 2} V${p('relativity').y}`} className="ov-line" markerEnd="url(#ovn-ar)" />
      <path d={`M${cx('quantum')},${bottom('em') + gap / 2} V${p('quantum').y}`} className="ov-line" markerEnd="url(#ovn-ar)" />
      <path d={`M${cx('relativity')},${bottom('relativity')} V${p('cosmo').y}`} className="ov-line" markerEnd="url(#ovn-ar)" />
      <path d={`M${cx('quantum')},${bottom('quantum')} V${p('particle').y}`} className="ov-line" markerEnd="url(#ovn-ar)" />
      {FIELDS.map((f) => (
        <Node key={f.id} id={f.id} {...pos.get(f.id)!} fs={13} />
      ))}
    </svg>
  )
}
