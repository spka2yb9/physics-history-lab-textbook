import { useMemo, useState, type ReactElement } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { Ball, Cross, Force, Trail, Vel, ease, rng } from './common'

/*
 * 第9章の図の決まり：電場は青（--fig-accent）の線、磁場は灰色（--fig-line）の線で描き、必ず文字を添える。
 */

const E_COLOR = 'var(--fig-accent)'
const B_COLOR = 'var(--fig-line)'

/* ---------- 共通の部品 ---------- */

/** 点の電荷（または磁石の極）。q は正なら正の電荷・N極、負なら負の電荷・S極 */
type Pole = { x: number; y: number; q: number }

/** 点の電荷がつくる場の向きと強さ（距離が2倍になると4分の1になる） */
function fieldAt(ps: Pole[], x: number, y: number): [number, number] {
  let ex = 0
  let ey = 0
  for (const p of ps) {
    const dx = x - p.x
    const dy = y - p.y
    const r2 = dx * dx + dy * dy
    const r3 = r2 * Math.sqrt(r2)
    ex += (p.q * dx) / r3
    ey += (p.q * dy) / r3
  }
  return [ex, ey]
}

/** 正の極から力線をたどった点の並び。box は [左, 上, 右, 下] */
function traceLine(ps: Pole[], x0: number, y0: number, box: [number, number, number, number]): [number, number][] {
  const pts: [number, number][] = [[x0, y0]]
  let x = x0
  let y = y0
  for (let i = 0; i < 600; i++) {
    const [ex, ey] = fieldAt(ps, x, y)
    const m = Math.hypot(ex, ey)
    if (!m) break
    x += (2.5 * ex) / m
    y += (2.5 * ey) / m
    if (x < box[0] || x > box[2] || y < box[1] || y > box[3]) break
    pts.push([x, y])
    if (ps.some((p) => p.q < 0 && Math.hypot(x - p.x, y - p.y) < 13)) break
  }
  return pts
}

const toPath = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/** 小さな三角の矢じり。ang はラジアン */
function Head({ x, y, ang, s = 5, color }: { x: number; y: number; ang: number; s?: number; color: string }) {
  const c = Math.cos(ang)
  const sn = Math.sin(ang)
  const p = (u: number, v: number) => `${(x + u * c - v * sn).toFixed(1)},${(y + u * sn + v * c).toFixed(1)}`
  return <polygon points={`${p(s, 0)} ${p(-s, s * 0.75)} ${p(-s, -s * 0.75)}`} fill={color} />
}

/** 短い矢印（場の矢印や力線の向き）。線の太さに合わせた小さな矢じりを付ける */
function MiniArrow({ x1, y1, x2, y2, color, w = 1.8 }: { x1: number; y1: number; x2: number; y2: number; color: string; w?: number }) {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const len = Math.hypot(x2 - x1, y2 - y1)
  const s = Math.min(4.5, len * 0.35)
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - s * Math.cos(ang)} y2={y2 - s * Math.sin(ang)} stroke={color} strokeWidth={w} />
      <Head x={x2 - s * Math.cos(ang)} y={y2 - s * Math.sin(ang)} ang={ang} s={s} color={color} />
    </g>
  )
}

/** 電荷の丸。正は「+」、負は「−」 */
function Charge({ x, y, q, r = 14 }: { x: number; y: number; q: number; r?: number }) {
  return (
    <Ball x={x} y={y} r={r} fill={q > 0 ? 'var(--fig-box2)' : 'var(--fig-box3)'}>
      <T x={x} y={y + 0.5} anchor="middle" fs={16} bold>
        {q > 0 ? '+' : '−'}
      </T>
    </Ball>
  )
}

/** 電荷の力線（青）と、線の途中の向きの矢じり */
function FieldLines({ ps, box, n, from = 17, at = 60 }: { ps: Pole[]; box: [number, number, number, number]; n: number; from?: number; at?: number }) {
  const lines = ps
    .filter((p) => p.q > 0)
    .flatMap((p) => Array.from({ length: n }, (_, k) => (2 * Math.PI * (k + 0.5)) / n).map((a) => traceLine(ps, p.x + from * Math.cos(a), p.y + from * Math.sin(a), box)))
  return (
    <g>
      {lines.map((pts, i) => {
        const j = Math.min(pts.length - 2, Math.round(at / 2.5))
        const [x1, y1] = pts[Math.max(0, j)]
        const [x2, y2] = pts[Math.max(1, j + 1)]
        return (
          <g key={i}>
            <path d={toPath(pts)} fill="none" stroke={E_COLOR} strokeWidth={1.5} />
            {pts.length > 3 && <Head x={x2} y={y2} ang={Math.atan2(y2 - y1, x2 - x1)} s={4.5} color={E_COLOR} />}
          </g>
        )
      })}
    </g>
  )
}

/* ---------- 図9-1 遠隔作用の考えと場の考え（動） ---------- */

export function FigFarField() {
  const bx = 560
  const ax0 = 110
  const shift = 130
  const tMove = 1
  const dur = 0.5
  const v = 120 // 図の中で変化が伝わる速さ（ピクセル毎秒）
  const src = ax0 + shift / 2
  const t0 = tMove + dur / 2
  const arrive = t0 + (bx - src) / v
  const len = (ax: number) => 34 * ((bx - ax0) / (bx - ax)) ** 2 // 距離が近いほど強い
  const rows = [
    { y: 100, title: '遠隔作用の考え：Aを動かすと、Bの受ける力もすぐに変わる', delay: false },
    { y: 262, title: '場の考え：Aの変化はまわりの空間を順に伝わり、遅れてBに届く', delay: true },
  ]
  return (
    <Anim
      n="9-1"
      title="遠隔作用の考えでは力がすぐに変わり、場の考えでは変化が空間を伝わって届く"
      still={2.8}
      period={7.5}
      caption="模式図です。正の電荷Aを電荷Bに近づけると、Bが受ける力（青の矢印）は強くなります。上の段では、Aを動かした瞬間にBの力が変わります。下の段では、点線の弧（Aの変化が伝わっている所）がBに届いてから、Bの力が変わります。"
    >
      {(t) => {
        const ax = ax0 + shift * ease((t - tMove) / dur)
        const r = Math.max(0, (t - t0) * v)
        const half = 28
        const th = r > half ? Math.asin(half / r) : Math.PI / 2
        return (
          <Svg id="9-1" w={720} h={340} label="上の段は遠隔作用の考えで、電荷Aを動かした瞬間に離れた電荷Bの力が変わる。下の段は場の考えで、Aの変化がまわりの空間を順に伝わり、届いてからBの力が変わる。">
            <line x1={10} y1={176} x2={710} y2={176} stroke="var(--fig-muted)" strokeDasharray="2 4" />
            {rows.map((row) => {
              const y = row.y
              const shownAx = row.delay ? (t < arrive ? ax0 : ax0 + shift) : ax
              const status = t < tMove ? 'Aを動かす前の力' : !row.delay ? '力がすぐに変わる' : t < arrive ? 'まだ前と同じ力' : '変化が届いて力が変わる'
              return (
                <g key={y}>
                  <T x={20} y={y - 72} fs={12.5} bold>
                    {row.title}
                  </T>
                  {ax - ax0 > 18 && <Trail points={[[ax0, y], [ax - 16, y]]} />}
                  {row.delay && r > 0 && r < bx - src + 20 && (
                    <path
                      d={`M${(src + r * Math.cos(th)).toFixed(1)},${(y - r * Math.sin(th)).toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${(src + r * Math.cos(th)).toFixed(1)},${(y + r * Math.sin(th)).toFixed(1)}`}
                      fill="none"
                      stroke={E_COLOR}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  )}
                  <Charge x={ax} y={y} q={1} />
                  <T x={ax} y={y + 42} anchor="middle" fs={12}>
                    電荷A
                  </T>
                  <Charge x={bx} y={y} q={-1} />
                  <T x={bx} y={y + 42} anchor="middle" fs={12}>
                    電荷B
                  </T>
                  <Force x1={bx - 16} y1={y} x2={bx - 16 - len(shownAx)} y2={y} />
                  <T x={bx + 8} y={y - 46} anchor="middle" fs={12.5} tone={t >= tMove && (!row.delay || t >= arrive) ? 'acc' : undefined}>
                    {status}
                  </T>
                </g>
              )
            })}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図9-2 鉄粉が描く磁石の力線（切り替え） ---------- */

type MagnetSet = 'one' | 'attract' | 'repel'

/** 棒磁石。left から長さ len、N極の側を nRight で決める */
const MAGNETS: Record<MagnetSet, { left: number; nRight: boolean }[]> = {
  one: [{ left: 245, nRight: true }],
  attract: [
    { left: 110, nRight: true },
    { left: 380, nRight: true },
  ],
  repel: [
    { left: 110, nRight: true },
    { left: 380, nRight: false },
  ],
}
const MAG_LEN = 150
const MAG_H = 34
const MAG_Y = 135

function magnetPoles(set: MagnetSet): Pole[] {
  return MAGNETS[set].flatMap((m) => [
    { x: m.left + 12, y: MAG_Y, q: m.nRight ? -1 : 1 },
    { x: m.left + MAG_LEN - 12, y: MAG_Y, q: m.nRight ? 1 : -1 },
  ])
}

function BarMagnet({ left, nRight, y = MAG_Y, len = MAG_LEN, h = MAG_H }: { left: number; nRight: boolean; y?: number; len?: number; h?: number }) {
  const half = len / 2
  return (
    <g>
      <rect x={left} y={y - h / 2} width={half} height={h} fill={nRight ? 'var(--fig-box3)' : 'var(--fig-box2)'} stroke="var(--fig-line)" />
      <rect x={left + half} y={y - h / 2} width={half} height={h} fill={nRight ? 'var(--fig-box2)' : 'var(--fig-box3)'} stroke="var(--fig-line)" />
      <T x={left + 14} y={y} anchor="middle" bold>
        {nRight ? 'S' : 'N'}
      </T>
      <T x={left + len - 14} y={y} anchor="middle" bold>
        {nRight ? 'N' : 'S'}
      </T>
    </g>
  )
}

export function FigFilings() {
  const [set, setSet] = useState<MagnetSet>('attract')
  const filings = useMemo(() => {
    const ps = magnetPoles(set)
    const rand = rng(set === 'one' ? 11 : set === 'attract' ? 23 : 37)
    const out: [number, number, number, number][] = []
    const inMagnet = (x: number, y: number) => MAGNETS[set].some((m) => x > m.left - 9 && x < m.left + MAG_LEN + 9 && Math.abs(y - MAG_Y) < MAG_H / 2 + 9)
    const bRef = 1 / 3600
    for (let i = 0; i < 12000 && out.length < 720; i++) {
      const x = 14 + rand() * 612
      const y = 12 + rand() * 246
      if (inMagnet(x, y)) continue
      const [ex, ey] = fieldAt(ps, x, y)
      const m = Math.hypot(ex, ey)
      if (rand() > Math.min(1, (m / bRef) ** 0.55)) continue
      const ux = (4.5 * ex) / m
      const uy = (4.5 * ey) / m
      out.push([x - ux, y - uy, x + ux, y + uy])
    }
    return out
  }, [set])
  return (
    <Figure
      n="9-2"
      title="鉄粉は磁石のまわりの力線に沿って並ぶ"
      controls={
        <Choice
          label="磁石の置き方"
          options={[
            { value: 'one', label: '1本' },
            { value: 'attract', label: 'N極とS極を向かい合わせる' },
            { value: 'repel', label: 'N極どうしを向かい合わせる' },
          ]}
          value={set}
          onChange={setSet}
        />
      }
      caption="棒磁石の上に紙を置いて鉄粉をまいたときの並び方を、計算で描いた模式図です。短い線の1本1本が鉄粉です。「N極とS極を向かい合わせる」では鉄粉の線が2つの磁石の間をつなぎ、「N極どうしを向かい合わせる」では線が互いに避けるように曲がります。"
    >
      <Svg id="9-2" w={640} h={270} label="棒磁石のまわりにまいた鉄粉が、N極からS極へ向かう曲線に沿って並ぶ。N極とS極を向かい合わせると線が磁石の間をつなぎ、N極どうしを向かい合わせると線が互いに避ける。">
        <g stroke="var(--fig-line)" strokeWidth={1.3} strokeLinecap="round">
          {filings.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} />
          ))}
        </g>
        {MAGNETS[set].map((m) => (
          <BarMagnet key={m.left} left={m.left} nRight={m.nRight} />
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図9-3 電場を矢印で表す・力線で表す（切り替え） ---------- */

type ChargeSet = 'one' | 'two'
type View = 'arrow' | 'line' | 'both'

export function FigEField() {
  const [cs, setCs] = useState<ChargeSet>('two')
  const [view, setView] = useState<View>('arrow')
  const ps: Pole[] =
    cs === 'one'
      ? [{ x: 300, y: 150, q: 1 }]
      : [
          { x: 205, y: 150, q: 1 },
          { x: 395, y: 150, q: -1 },
        ]
  const arrows: { x: number; y: number; ux: number; uy: number; L: number }[] = []
  for (let gx = 40; gx <= 560; gx += 40)
    for (let gy = 30; gy <= 270; gy += 40) {
      if (ps.some((p) => Math.hypot(gx - p.x, gy - p.y) < 34)) continue
      const [ex, ey] = fieldAt(ps, gx, gy)
      const m = Math.hypot(ex, ey)
      const L = Math.max(7, Math.min(30, 1500 * Math.sqrt(m)))
      arrows.push({ x: gx, y: gy, ux: ex / m, uy: ey / m, L })
    }
  return (
    <Figure
      n="9-3"
      title="同じ電場を矢印でも力線でも表せる"
      controls={
        <>
          <Choice
            label="電荷"
            options={[
              { value: 'one', label: '正の電荷1つ' },
              { value: 'two', label: '正と負の電荷' },
            ]}
            value={cs}
            onChange={setCs}
          />
          <Choice
            label="表し方"
            options={[
              { value: 'arrow', label: '矢印' },
              { value: 'line', label: '力線' },
              { value: 'both', label: '重ねる' },
            ]}
            value={view}
            onChange={setView}
          />
        </>
      }
      caption="矢印は、その場所に小さな正の電荷を置いたときに受ける力の向きと強さ（長いほど強い。長さは目安）です。「力線」を選ぶと、同じ電場を線で表します。「重ねる」を選ぶと、矢印がどの場所でも力線に沿っていることが分かります。"
    >
      <Svg id="9-3" w={600} h={300} label="電荷のまわりの電場。各点の矢印は小さな正の電荷が受ける力の向きと強さを表す。同じ電場を、正の電荷から出て負の電荷に入る力線で表すこともできる。">
        {view !== 'arrow' && <FieldLines ps={ps} box={[4, 4, 596, 296]} n={cs === 'one' ? 12 : 16} at={cs === 'one' ? 90 : 46} />}
        {view !== 'line' &&
          arrows.map((a) => (
            <MiniArrow key={`${a.x}-${a.y}`} x1={a.x - (a.ux * a.L) / 2} y1={a.y - (a.uy * a.L) / 2} x2={a.x + (a.ux * a.L) / 2} y2={a.y + (a.uy * a.L) / 2} color={E_COLOR} w={view === 'both' ? 1.6 : 2} />
          ))}
        {ps.map((p) => (
          <Charge key={p.x} x={p.x} y={p.y} q={p.q} />
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図9-4 マクスウェルの渦と小さな粒の模型（動） ---------- */

export function FigVortex() {
  const cols = [110, 190, 270, 350, 430]
  const R = 34
  const r = 7
  const yTop = 80
  const yBot = 164
  const yMid = (yTop + yBot) / 2
  /** 時刻 t までに回った角度。前半は上下とも同じ速さ、後半は上の渦が速い */
  const turned = (t: number, top: boolean) => {
    const w1 = 1.2
    const w2 = top ? 2.0 : 0.6
    return t < 4 ? w1 * t : w1 * 4 + w2 * (t - 4)
  }
  return (
    <Anim
      n="9-4"
      title="マクスウェルの模型：渦が磁気の力を、渦の間の粒が電気を表す"
      still={6}
      period={8}
      caption="1861年の論文「物理的な力線について」の考えを簡単にした模式図です（マクスウェルの図では渦は六角形）。上下の渦が同じ速さで回るとき、間の粒はその場で回るだけです。上の渦が下の渦より速く回ると、粒は横へ動きます。マクスウェルはこの粒の流れを電流と考えました。"
    >
      {(t) => {
        const phase2 = t >= 4
        const aTop = turned(t, true)
        const aBot = turned(t, false)
        const shift = phase2 ? (R * (2.0 - 0.6) * (t - 4)) / 2 : 0
        const spin = (R * (aTop + aBot)) / (2 * r)
        return (
          <Svg id="9-4" w={720} h={260} label="2列に並んだ渦と、その間に並んだ小さな粒の模型。上下の渦が同じ速さで回ると粒はその場で回り、上の渦が速く回ると粒は横へ動いて電流に当たる。">
            {[
              { y: yTop, a: aTop },
              { y: yBot, a: aBot },
            ].map((row) =>
              cols.map((cx) => (
                <g key={`${row.y}-${cx}`}>
                  <circle cx={cx} cy={row.y} r={R} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.2} />
                  <line x1={cx} y1={row.y} x2={cx + (R - 4) * Math.cos(row.a)} y2={row.y + (R - 4) * Math.sin(row.a)} stroke="var(--fig-line)" strokeWidth={1.5} />
                  <circle cx={cx + (R - 6) * Math.cos(row.a)} cy={row.y + (R - 6) * Math.sin(row.a)} r={3.5} fill="var(--fig-line)" />
                </g>
              )),
            )}
            {cols.map((x0) => {
              const x = 70 + ((((x0 - 70 - shift) % 400) + 400) % 400)
              return (
                <g key={x0}>
                  <Ball x={x} y={yMid} r={r} fill="var(--fig-box2)" />
                  <circle cx={x + (r - 2.5) * Math.cos(-spin)} cy={yMid + (r - 2.5) * Math.sin(-spin)} r={1.8} fill="var(--fig-line)" />
                  {phase2 && x > 104 && <Vel x1={x - r - 2} y1={yMid} x2={x - r - 28} y2={yMid} />}
                </g>
              )
            })}
            <T x={490} y={yTop} fs={12.5}>
              渦：磁気の力を表す（時計回り）
            </T>
            <T x={490} y={yMid} fs={12.5}>
              小さな粒：電気を表す
            </T>
            <T x={490} y={yBot} fs={12.5}>
              渦：磁気の力を表す（時計回り）
            </T>
            <T x={40} y={225} fs={12.5} tone={phase2 ? 'acc' : undefined}>
              {phase2 ? '上の渦が速く回るとき：粒は左へ動く（電流に当たる）' : '上下の渦が同じ速さで回るとき：粒はその場で回るだけ（電流はない）'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図9-5 マクスウェルの理論の4つの関係 ---------- */

/** ゆがんだ輪（斜めから見た円）。向きを示す矢じりを手前に1つ付ける */
function Loop({ cx, cy, rx, ry, color, dir = 1 }: { cx: number; cy: number; rx: number; ry: number; color: string; dir?: 1 | -1 }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={1.8} />
      <Head x={cx} y={cy + ry} ang={dir > 0 ? 0 : Math.PI} s={5} color={color} />
    </g>
  )
}

export function FigFour() {
  const q1: Pole[] = [
    { x: 110, y: 150, q: 1 },
    { x: 250, y: 150, q: -1 },
  ]
  const mx = 540
  const my = 145
  return (
    <Figure
      n="9-5"
      title="マクスウェルの理論を4つの関係にまとめる"
      caption="模式図です。電場を青、磁場を灰色の線で描いています。③は第8章の電磁誘導を場の言葉で言い直したものです。④の右側の「変わる電場が磁場を生む」が、マクスウェルが加えた部分です。"
    >
      <Svg id="9-5" w={720} h={500} label="4つの関係。1、電気の力線は正の電荷から出て負の電荷に入る。2、磁気の力線には始まりも終わりもなく輪になる。3、磁場が変わると、まわりに輪の形の電場が生まれる。4、電流や変わる電場は、まわりに輪の形の磁場を生む。">
        <line x1={360} y1={8} x2={360} y2={492} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        <line x1={8} y1={250} x2={712} y2={250} stroke="var(--fig-muted)" strokeDasharray="2 4" />

        {/* ① */}
        <T x={14} y={22} fs={12.5} bold>
          ① 電気の力線は、正の電荷から出て負の電荷に入る
        </T>
        <FieldLines ps={q1} box={[14, 46, 346, 240]} n={14} at={40} />
        {q1.map((p) => (
          <Charge key={p.x} x={p.x} y={p.y} q={p.q} />
        ))}

        {/* ② */}
        <T x={374} y={22} fs={12.5} bold>
          ② 磁気の力線には始まりも終わりもなく、輪になる
        </T>
        {[34, 58, 82].map((h, i) => (
          <g key={h}>
            {[-1, 1].map((s) => (
              <g key={s}>
                <path
                  d={`M${mx + 60},${my + s * 6} C${mx + 60 + 40 + i * 30},${my + s * (h + 14)} ${mx - 100 - i * 30},${my + s * (h + 14)} ${mx - 60},${my + s * 6}`}
                  fill="none"
                  stroke={B_COLOR}
                  strokeWidth={1.6}
                />
                <Head x={mx} y={my + s * (h * 0.75 + 12)} ang={Math.PI} s={4.5} color={B_COLOR} />
              </g>
            ))}
          </g>
        ))}
        <BarMagnet left={mx - 66} nRight y={my} len={132} h={30} />
        <line x1={mx - 40} y1={my + 9} x2={mx + 36} y2={my + 9} stroke={B_COLOR} strokeWidth={1.6} />
        <Head x={mx + 36} y={my + 9} ang={0} s={4.5} color={B_COLOR} />
        <T x={374} y={238} fs={12} tone="muted">
          N極だけ、S極だけの磁石はない
        </T>

        {/* ③ */}
        <T x={14} y={272} fs={12.5} bold>
          ③ 磁場が変わると、まわりに輪の形の電場が生まれる
        </T>
        {[150, 180, 210].map((x) => (
          <MiniArrow key={x} x1={x} y1={470} x2={x} y2={312} color={B_COLOR} w={2} />
        ))}
        <Loop cx={180} cy={392} rx={78} ry={20} color={E_COLOR} />
        <T x={226} y={322} fs={12.5}>
          磁場（強まる）
        </T>
        <T x={266} y={392} fs={12.5} tone="acc">
          電場（輪の形）
        </T>
        <T x={14} y={484} fs={12} tone="muted">
          電磁誘導（第8章）
        </T>

        {/* ④ */}
        <T x={374} y={272} fs={12.5} bold>
          ④ 電流や変わる電場は、まわりに輪の形の磁場を生む
        </T>
        <line x1={450} y1={440} x2={450} y2={302} stroke="var(--fig-line)" strokeWidth={4} />
        <Vel x1={462} y1={350} x2={462} y2={316} />
        <T x={470} y={322} fs={12.5}>
          電流
        </T>
        <Loop cx={450} cy={390} rx={48} ry={14} color={B_COLOR} />
        <T x={503} y={404} fs={12.5}>
          磁場
        </T>
        {[590, 615, 640].map((x) => (
          <MiniArrow key={x} x1={x} y1={440} x2={x} y2={302} color={E_COLOR} w={2} />
        ))}
        <T x={580} y={322} anchor="end" fs={12.5} tone="acc">
          変わる電場
        </T>
        <Loop cx={615} cy={390} rx={52} ry={14} color={B_COLOR} />
        <T x={672} y={404} fs={12.5}>
          磁場
        </T>
        <T x={374} y={466} fs={12} tone="muted">
          左：電流がつくる磁場（第8章）
        </T>
        <T x={374} y={486} fs={12} tone="acc">
          右：変わる電場がつくる磁場（マクスウェルが加えた）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図9-6 コンデンサーのすき間にできる磁場（動・切り替え） ---------- */

export function FigGap() {
  const [mode, setMode] = useState<'before' | 'after'>('after')
  const y = 150
  const pl = 330
  const pr = 390
  return (
    <Anim
      n="9-6"
      title="電場が変わっている間は、電流のないすき間にも磁場ができる"
      still={1.3}
      period={7}
      controls={
        <Choice
          label="磁場を生むもの"
          options={[
            { value: 'before', label: '電流だけ（マクスウェルの前）' },
            { value: 'after', label: '変わる電場も（マクスウェルが加えた）' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="電池につないだ直後のコンデンサー（2枚の金属板を向かい合わせて電気をためる部品）の模式図です。電気がたまるにつれて導線の電流は弱まり、板の間の電場は強くなります。「電流だけ」を選ぶと、すき間で磁場が途切れてしまいます。電気がたまりきると電場は変わらなくなり、すき間の磁場も消えます。"
    >
      {(t) => {
        const I = t < 0.5 ? 0 : Math.exp(-(t - 0.5) / 1.6)
        const Q = t < 0.5 ? 0 : 1 - I
        const signs = Math.round(Q * 4)
        return (
          <Svg id="9-6" w={720} h={290} label="コンデンサーにつないだ導線に電流が流れ、導線のまわりに輪の形の磁場ができる。板の間のすき間には電流が流れないが、電場が強くなっていく間は、すき間のまわりにも同じ磁場ができる。">
            <T x={30} y={26} fs={12.5}>
              電池につないだ直後のコンデンサー（左の導線から電気が流れ込む）
            </T>
            <line x1={30} y1={y} x2={pl} y2={y} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={pr} y1={y} x2={690} y2={y} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={pl} y1={88} x2={pl} y2={212} stroke="var(--fig-line)" strokeWidth={5} />
            <line x1={pr} y1={88} x2={pr} y2={212} stroke="var(--fig-line)" strokeWidth={5} />
            {[100, 120, 180, 200].slice(0, signs).map((sy) => (
              <g key={sy}>
                <T x={321} y={sy} anchor="middle" fs={14} bold>
                  +
                </T>
                <T x={399} y={sy} anchor="middle" fs={14} bold>
                  −
                </T>
              </g>
            ))}
            <g opacity={Q}>
              {[102, 126, 150, 174, 198].map((ey) => (
                <MiniArrow key={ey} x1={pl + 6} y1={ey} x2={pr - 6} y2={ey} color={E_COLOR} w={1.8} />
              ))}
            </g>
            <g opacity={0.25 + 0.75 * I}>
              <Vel x1={60} y1={y - 16} x2={120} y2={y - 16} />
              <Vel x1={600} y1={y - 16} x2={660} y2={y - 16} />
            </g>
            <T x={60} y={y - 34} fs={12.5}>
              電流
            </T>
            <T x={600} y={y - 34} fs={12.5}>
              電流
            </T>
            <g opacity={I}>
              <Loop cx={180} cy={y} rx={12} ry={46} color={B_COLOR} />
              <Loop cx={540} cy={y} rx={12} ry={46} color={B_COLOR} />
            </g>
            <T x={198} y={y - 52} fs={12.5}>
              磁場
            </T>
            <T x={558} y={y - 52} fs={12.5}>
              磁場
            </T>
            {mode === 'after' ? (
              <g opacity={I}>
                <ellipse cx={360} cy={y} rx={16} ry={82} fill="none" stroke={B_COLOR} strokeWidth={1.8} />
                <Head x={360} y={y + 82} ang={0} s={5} color={B_COLOR} />
              </g>
            ) : (
              <g>
                <ellipse cx={360} cy={y} rx={16} ry={82} fill="none" stroke="var(--fig-danger)" strokeWidth={1.5} strokeDasharray="5 4" />
                <Cross x={386} y={y - 74} s={7} />
              </g>
            )}
            <T x={360} y={244} anchor="middle" fs={12.5}>
              板の間の電場（青の矢印）はしだいに強くなる
            </T>
            <T x={360} y={270} anchor="middle" fs={12.5} tone={t > 0.5 && I < 0.1 ? 'muted' : mode === 'after' ? 'acc' : 'danger'}>
              {t > 0.5 && I < 0.1 ? '電気がたまりきると電場は変わらなくなり、磁場も消える' : mode === 'after' ? 'すき間のまわりにも、導線のまわりと同じ磁場ができる' : '電流だけを考えると、すき間のまわりには磁場がないことになる'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図9-7 ウェーバーとコールラウシュの測定から速さが出るまで ---------- */

export function FigWeber() {
  return (
    <Figure
      n="9-7"
      title="電気と磁気の測定だけから、速さの形をした数が出る"
      caption="ウェーバーとコールラウシュの測定（1856年）を、マクスウェルの1865年の論文の説明に沿ってまとめた図です。測定には光をまったく使っていません。"
    >
      <Svg id="9-7" w={720} h={270} label="1、コンデンサーにためた電気の量を、電気の力をもとにした単位で測る。2、同じ電気を検流計に流し、磁気のはたらきをもとにした単位で測る。3、2つの数を比べると速さの形の数になり、秒速31万740kmになる。マクスウェルの理論では、電気と磁気の波はこの速さで進む。">
        <Box x={14} y={30} w={232} h={84} fill="box3" fs={12.5} lines={['① コンデンサーにためた', '電気の量を、電気の力を', 'もとにした単位で測る']} />
        <Box x={14} y={140} w={232} h={84} fill="box3" fs={12.5} lines={['② 同じ電気を検流計に流し、', '方位磁針が振れる角度から', '磁気の単位で測る']} />
        <Box x={286} y={84} w={200} h={84} fill="box" fs={12.5} lines={['③ 2つの数を比べると', '速さの形の数になる：', '秒速31万740km']} />
        <Box x={526} y={84} w={182} h={84} fill="box4" fs={12.5} lines={['マクスウェルの理論：', '電気と磁気の波は', 'この速さで進む']} />
        <Arrow x1={246} y1={72} x2={284} y2={108} />
        <Arrow x1={246} y1={182} x2={284} y2={146} />
        <Arrow x1={486} y1={126} x2={524} y2={126} />
        <T x={14} y={252} fs={12} tone="muted">
          光は計器の目盛りを読むためにしか使っていない（マクスウェル、1865年の論文）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図9-8 計算した速さと、測った光の速さ ---------- */

const SPEEDS = [
  { label: '電気と磁気の測定から計算した速さ', sub: '（マクスウェル、1862年）', v: 310740, text: '31万740km', fill: 'var(--fig-box3)' },
  { label: 'フィゾーが測った光の速さ', sub: '（1849年）', v: 314858, text: '31万4858km', fill: 'var(--fig-box2)' },
  { label: 'フーコーが測った光の速さ', sub: '（1862年）', v: 298000, text: '29万8000km', fill: 'var(--fig-box2)' },
  { label: '今の光の速さ', sub: '（今は定義された値）', v: 299792.458, text: '29万9792km', fill: 'var(--fig-box4)' },
]

export function FigSpeeds() {
  const x0 = 300
  const sx = (v: number) => x0 + (v / 320000) * 300
  return (
    <Figure
      n="9-8"
      title="電気と磁気の測定から計算した速さは、光の速さとほぼ同じだった"
      caption="棒の長さは1秒に進む距離（km）です。棒は0から描いています。点線は今の光の速さの位置です。当時の値は今の値から最大で5％ほどずれていますが、電気の測定と光の測定という無関係な2種類の実験が同じくらいの速さを示しました。"
    >
      <Svg id="9-8" w={720} h={270} label="1秒に進む距離の比較。電気と磁気の測定から計算した速さは31万740km、フィゾーが測った光の速さは31万4858km、フーコーが測った光の速さは29万8000km、今の光の速さは29万9792km。">
        <T x={x0} y={18} fs={12} tone="muted">
          1秒に進む距離
        </T>
        <line x1={x0} y1={32} x2={x0} y2={256} stroke="var(--fig-line)" />
        {SPEEDS.map((s, i) => {
          const y = 60 + i * 56
          return (
            <g key={s.label}>
              <T x={x0 - 12} y={y - 8} anchor="end" fs={12.5}>
                {s.label}
              </T>
              <T x={x0 - 12} y={y + 11} anchor="end" fs={11.5} tone="muted">
                {s.sub}
              </T>
              <rect x={x0} y={y - 13} width={sx(s.v) - x0} height={26} fill={s.fill} stroke="var(--fig-line)" />
              <T x={sx(s.v) + 10} y={y} fs={12.5}>
                {s.text}
              </T>
            </g>
          )
        })}
        <line x1={sx(299792.458)} y1={32} x2={sx(299792.458)} y2={256} stroke="var(--fig-muted)" strokeDasharray="3 3" />
      </Svg>
    </Figure>
  )
}

/* ---------- 図9-9 電磁波（動） ---------- */

export function FigWave() {
  const ax = 60
  const ay = 165
  const L = 540
  const wl = 180
  const speed = 60
  const AE = 70
  const AB = 62
  const dz = { x: -0.55, y: 0.48 } // 手前の向き（斜めに描く）
  return (
    <Anim
      n="9-9"
      title="電場と磁場が互いを生みながら、光の速さで進む"
      still={0.4}
      period={3}
      caption="電磁波の模式図です。青の線は電場、灰色の線は磁場の強さと向きを表します。電場は上下に、磁場は手前と奥に振れ、どちらも波の進む向きと直角です。電場が強い所では磁場も強く、2つはそろって進みます。"
    >
      {(t) => {
        const ph = (2 * Math.PI * speed * t) / wl
        const val = (x: number) => Math.sin((2 * Math.PI * x) / wl - ph)
        let dE = ''
        let dB = ''
        const stemsE: ReactElement[] = []
        const stemsB: ReactElement[] = []
        for (let x = 0; x <= L; x += 4) {
          const s = val(x)
          dE += `${x ? 'L' : 'M'}${(ax + x).toFixed(1)},${(ay - AE * s).toFixed(1)}`
          dB += `${x ? 'L' : 'M'}${(ax + x + dz.x * AB * s).toFixed(1)},${(ay + dz.y * AB * s).toFixed(1)}`
          if (x % 16 === 0) {
            stemsE.push(<line key={`e${x}`} x1={ax + x} y1={ay} x2={ax + x} y2={ay - AE * s} stroke={E_COLOR} strokeOpacity={0.45} />)
            stemsB.push(<line key={`b${x}`} x1={ax + x} y1={ay} x2={ax + x + dz.x * AB * s} y2={ay + dz.y * AB * s} stroke={B_COLOR} strokeOpacity={0.4} />)
          }
        }
        return (
          <Svg id="9-9" w={720} h={300} label="電磁波。電場は上下に、磁場は手前と奥に振れ、どちらも進む向きと直角になっている。波は右へ進む。">
            <line x1={70} y1={26} x2={100} y2={26} stroke={E_COLOR} strokeWidth={2.5} />
            <T x={108} y={26} fs={12.5}>
              電場（上下に振れる）
            </T>
            <line x1={70} y1={50} x2={100} y2={50} stroke={B_COLOR} strokeWidth={2.5} />
            <T x={108} y={50} fs={12.5}>
              磁場（手前と奥に振れる）
            </T>
            {stemsB}
            {stemsE}
            <path d={dB} fill="none" stroke={B_COLOR} strokeWidth={2} />
            <path d={dE} fill="none" stroke={E_COLOR} strokeWidth={2.2} />
            <line x1={ax - 20} y1={ay} x2={ax + L} y2={ay} stroke="var(--fig-muted)" />
            <Vel x1={ax + L + 10} y1={ay} x2={ax + L + 80} y2={ay} />
            <T x={ax + L + 14} y={ay + 22} fs={12.5}>
              進む向き
            </T>
            <T x={ax + L + 14} y={ay + 42} fs={12} tone="muted">
              （光の速さ）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図9-10 電気・磁気・光が一つの理論にまとまる流れ ---------- */

export function FigUnify() {
  return (
    <Figure
      n="9-10"
      title="電気・磁気・光の研究がマクスウェルの理論にまとまり、次の研究につながった"
      caption="左の3つは別々に研究されていた分野、右の4つはマクスウェルの理論から始まった研究です。かっこの中はこの本で扱う章です。"
    >
      <Svg id="9-10" w={720} h={280} label="静電気と電気の力、電流と磁気と電磁誘導、光の波と光の速さの研究が、ファラデーの力線と場の考えを経て、マクスウェルの理論にまとまった。そこからヘルツの電磁波の実験、光を伝える媒質の問題、特殊相対性理論、光と電子を場として扱う理論へつながった。">
        <Box x={10} y={20} w={190} h={52} fill="box2" fs={12.5} lines={['静電気と電気の力', '（第6章）']} subTone="muted" />
        <Box x={10} y={92} w={190} h={52} fill="box2" fs={12.5} lines={['電流と磁気、電磁誘導', '（第8章）']} subTone="muted" />
        <Box x={10} y={196} w={190} h={52} fill="box2" fs={12.5} lines={['光の波と光の速さ', '（第7章）']} subTone="muted" />
        <Box x={244} y={56} w={176} h={52} fill="box3" fs={12.5} lines={['ファラデーの力線と場', '（1840〜1850年代）']} subTone="muted" />
        <Box x={244} y={150} w={176} h={70} fill="box3" fs={12.5} accent lines={['マクスウェルの理論', '（1861〜1873年）', '電気・磁気・光が一つに']} subTone="muted" />
        <Arrow x1={200} y1={46} x2={242} y2={74} />
        <Arrow x1={200} y1={118} x2={242} y2={92} />
        <Arrow x1={332} y1={108} x2={332} y2={148} />
        <Arrow x1={200} y1={214} x2={242} y2={196} />
        <Box x={470} y={14} w={238} h={50} fill="box4" fs={12.5} lines={['ヘルツが電磁波を確かめる', '（第10章）']} subTone="muted" />
        <Box x={470} y={78} w={238} h={50} fill="box4" fs={12.5} lines={['光を伝える媒質の問題', '（第16章）']} subTone="muted" />
        <Box x={470} y={142} w={238} h={50} fill="box4" fs={12.5} lines={['特殊相対性理論', '（第17章）']} subTone="muted" />
        <Box x={470} y={206} w={238} h={50} fill="box4" fs={12.5} lines={['光と電子を場として扱う理論', '（第29章）']} subTone="muted" />
        {[39, 103, 167, 231].map((ty) => (
          <Arrow key={ty} x1={420} y1={185} x2={468} y2={ty} />
        ))}
      </Svg>
    </Figure>
  )
}
