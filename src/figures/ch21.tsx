import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Trail, Vel, ease, rng, wave } from './common'

type Pt = [number, number]

/** 折れ線の path の d */
const line = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
/** 0 以上 m 未満に収める余り */
const mod = (v: number, m: number) => ((v % m) + m) % m

/** 黒体放射の強さ（波長 nm、絶対温度 K）。形だけを使うので比例の定数は省く */
const C2 = 1.4388e7 // nm・K
const planck = (nm: number, k: number) => Math.pow(nm, -5) / (Math.exp(C2 / (nm * k)) - 1)
/** いちばん強い波長（nm）。ヴィーンの変位則 */
const peakNm = (k: number) => 2.898e6 / k

/** 目に見える光の波長（nm）からおよその色。見えない範囲は null */
function lamColor(nm: number): string | null {
  if (nm < 380 || nm > 700) return null
  let r = 0
  let g = 0
  let b = 0
  if (nm < 440) [r, g, b] = [(440 - nm) / 60, 0, 1]
  else if (nm < 490) [r, g, b] = [0, (nm - 440) / 50, 1]
  else if (nm < 510) [r, g, b] = [0, 1, (510 - nm) / 20]
  else if (nm < 580) [r, g, b] = [(nm - 510) / 70, 1, 0]
  else if (nm < 645) [r, g, b] = [1, (645 - nm) / 65, 0]
  else [r, g, b] = [1, 0, 0]
  const f = (v: number) => Math.round(255 * Math.pow(v * 0.85, 0.8))
  return `rgb(${f(r)},${f(g)},${f(b)})`
}

/** 熱した物のおよその色（絶対温度 K から） */
function glowColor(k: number): string {
  const t = k / 100
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332)
  const g = t <= 66 ? 99.47 * Math.log(t) - 161.12 : 288.12 * Math.pow(t - 60, -0.0755)
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04
  return `rgb(${c(r)},${c(g)},${c(b)})`
}

/** 短い波の束（光のつぶ）。中心 (x, y)、進む向き deg（度、右が0で下向きが正）、波長 wl（px） */
function Packet({ x, y, deg, wl, color, cycles = 3 }: { x: number; y: number; deg: number; wl: number; color: string; cycles?: number }) {
  const len = wl * cycles
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${deg})`}>
      <path d={wave(-len / 2, 0, len, 5, wl, 0, 1)} fill="none" stroke={color} strokeWidth={2.2} />
    </g>
  )
}

/* ---------- 図21-1 この章の年表 ---------- */

const ROAD = [
  { y: '1860年', who: 'キルヒホフ', what: ['黒体の光は', '温度で決まる'] },
  { y: '1887年', who: 'ヘルツ', what: ['紫外線を当てると', '火花が飛びやすい'] },
  { y: '1896年', who: 'ヴィーン', what: ['黒体放射の', '強さを表す式'] },
  { y: '1899〜1900年', who: 'ルンマーら', what: ['長い波長で', '測定が式と合わない'] },
  { y: '1900年', who: 'プランク', what: ['エネルギーの', 'つぶを導入'] },
  { y: '1902年', who: 'レーナルト', what: ['電子の勢いは', '光の強さによらない'] },
  { y: '1905年', who: 'アインシュタイン', what: ['光そのものが', 'つぶからなる'] },
  { y: '1916年', who: 'ミリカン', what: ['光電効果の', '予言を確かめる'] },
  { y: '1923年', who: 'コンプトン', what: ['X線のつぶが', '電子をはね飛ばす'] },
]

export function FigRoad21() {
  return (
    <Figure n="21-1" title="エネルギーのつぶ：この章で扱う出来事" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="21-1" w={720} h={262} label="1860年にキルヒホフが黒体の光は温度だけで決まると示し、1887年にヘルツが紫外線で火花が飛びやすくなることに気づいた。1896年にヴィーンが黒体放射の式を示したが、1899年から1900年の測定で長い波長では合わないと分かった。1900年にプランクがエネルギーのつぶを導入し、1902年にレーナルトが電子の勢いは光の強さによらないことを示した。1905年にアインシュタインが光はつぶからなると考え、1916年にミリカンがその予言を確かめ、1923年にコンプトンがX線のつぶが電子をはね飛ばすことを示した。">
        <Arrow x1={10} y1={128} x2={712} y2={128} />
        {ROAD.map((r, i) => {
          const x = 40 + i * 78
          const up = i % 2 === 0
          const ty = up ? 24 : 156
          return (
            <g key={r.y}>
              <circle cx={x} cy={128} r={6} fill={r.who === 'プランク' || r.who === 'アインシュタイン' ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 104 : 135} x2={x} y2={up ? 121 : 150} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold fs={12.5}>
                {r.y}
              </T>
              <T x={x} y={ty + 19} anchor="middle" fs={12.5}>
                {r.who}
              </T>
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + 37 + j * 17} anchor="middle" fs={11.5} tone="muted">
                  {w}
                </T>
              ))}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図21-2 温度を上げると色の分布が変わる（動・スライダー） ---------- */

const GX0 = 250
const GX1 = 690
const GY0 = 262 // 横軸の高さ
const GH = 170 // 曲線の最大の高さ
const NM_MAX = 4000
const gx = (nm: number) => GX0 + (nm / NM_MAX) * (GX1 - GX0)

/** 温度 k の曲線（いちばん高い所を同じ高さにそろえる）の path */
function curvePath(k: number) {
  const top = planck(peakNm(k), k)
  const pts: Pt[] = []
  for (let nm = 60; nm <= NM_MAX; nm += 30) pts.push([gx(nm), GY0 - (GH * planck(nm, k)) / top])
  return line(pts)
}

/** 小さな数の mm 表記（0.0023mm のように有効数字2けた） */
const mmText = (nm: number) => {
  const mm = nm / 1e6
  const digits = Math.max(0, -Math.floor(Math.log10(mm)) + 1)
  return `約${mm.toFixed(digits)}mm`
}

export function FigGlow() {
  const [target, setTarget] = useState(5500)
  const startC = 600
  const rise = 3.5
  return (
    <Anim
      n="21-3"
      title="温度を上げると、いちばん強い光の波長が短い側へ移る"
      still={5}
      period={6.5}
      controls={<Range label="熱する温度" min={1000} max={6000} step={500} value={target} onChange={setTarget} format={(v) => `${v}℃`} />}
      caption="黒体が出す光の強さを、波長ごとにプランクの法則で計算した図です。曲線はどの温度でもいちばん高い所を同じ高さにそろえています（実際には温度が高いほどずっと強くなります）。点線は1000℃の曲線です。「熱する温度」を変えると、600℃から熱していく様子が動きます。左の四角の色は見え方の目安です。"
    >
      {(t) => {
        const c = startC + (target - startC) * ease(Math.min(t, rise) / rise)
        const k = c + 273
        const pk = peakNm(k)
        const ratio = Math.pow(k / 1273, 4)
        const bright = Math.max(0.35, Math.min(1, 0.35 + (k - 873) / 1500))
        const pkLabelX = Math.min(Math.max(gx(pk), GX0 + 70), GX1 - 70)
        return (
          <Svg id="21-3" w={720} h={330} label="熱した物の温度を上げると、出す光の強さの分布の山が、赤外線の側から目に見える光の側へ移り、色が赤から白っぽく変わる。">
            {/* 熱した物 */}
            <T x={90} y={36} anchor="middle" fs={12.5} bold>
              熱した物
            </T>
            <rect x={40} y={60} width={100} height={110} rx={8} fill="#2b2522" stroke="var(--fig-line)" />
            <rect x={40} y={60} width={100} height={110} rx={8} fill={glowColor(k)} opacity={bright} />
            <T x={90} y={192} anchor="middle" fs={13} bold>
              {`約${Math.round(c / 10) * 10}℃`}
            </T>
            <T x={90} y={222} anchor="middle" fs={12} tone="muted">
              出す光の量は
            </T>
            <T x={90} y={240} anchor="middle" fs={12} tone="muted">
              {Math.abs(ratio - 1) < 0.05 ? '1000℃と同じくらい' : `1000℃の約${ratio < 10 ? ratio.toFixed(1).replace('.0', '') : Math.round(ratio)}倍`}
            </T>
            {/* グラフの背景：目に見える光の範囲 */}
            <rect x={gx(380)} y={GY0 - GH - 14} width={gx(700) - gx(380)} height={GH + 14} fill="var(--fig-box4)" opacity={0.7} />
            {Array.from({ length: 32 }, (_, i) => {
              const nm = 380 + i * 10
              return <rect key={nm} x={gx(nm)} y={GY0 + 2} width={gx(10) - gx(0) + 0.4} height={10} fill={lamColor(nm + 5) ?? 'none'} />
            })}
            <line x1={GX0} y1={GY0} x2={GX1 + 6} y2={GY0} stroke="var(--fig-line)" />
            <line x1={GX0} y1={GY0} x2={GX0} y2={GY0 - GH - 22} stroke="var(--fig-line)" />
            <T x={GX0 - 8} y={GY0 - GH - 8} anchor="end" fs={12}>
              強さ
            </T>
            {[1000, 2000, 3000, 4000].map((nm) => (
              <g key={nm}>
                <line x1={gx(nm)} y1={GY0} x2={gx(nm)} y2={GY0 + 5} stroke="var(--fig-line)" />
                <T x={gx(nm)} y={GY0 + 22} anchor="middle" fs={11.5} tone="muted">
                  {`${nm / 1e6}mm`}
                </T>
              </g>
            ))}
            <T x={GX0 - 6} y={GY0 + 44} anchor="end" fs={12}>
              紫外線
            </T>
            <T x={gx(540)} y={GY0 + 44} anchor="middle" fs={12}>
              目に見える光
            </T>
            <T x={gx(1550)} y={GY0 + 44} anchor="middle" fs={12}>
              赤外線
            </T>
            <T x={GX1} y={GY0 + 44} anchor="end" fs={12}>
              波長（長い →）
            </T>
            {/* 1000℃の曲線（くらべる用） */}
            <path d={curvePath(1273)} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="4 4" />
            <T x={gx(peakNm(1273))} y={GY0 - GH - 15} anchor="middle" fs={11.5} tone="muted">
              1000℃
            </T>
            {/* 今の温度の曲線 */}
            <path d={curvePath(k)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.6} />
            <line x1={gx(pk)} y1={GY0 - GH} x2={gx(pk)} y2={GY0} stroke="var(--fig-accent)" strokeDasharray="3 3" />
            <T x={pkLabelX} y={GY0 - GH - 56} anchor="middle" fs={12} tone="acc">
              いちばん強い波長
            </T>
            <T x={pkLabelX} y={GY0 - GH - 39} anchor="middle" fs={12} tone="acc">
              {mmText(pk)}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図21-3 穴の開いた箱は光を吸い込む（動） ---------- */

const RAY: Pt[] = [
  [14, 116],
  [62, 126],
  [318, 176],
  [210, 208],
  [62, 164],
  [318, 88],
  [196, 52],
  [62, 92],
]
const RAY_OPACITY = [1, 1, 0.7, 0.48, 0.32, 0.2, 0.12]
const SEG_LEN = RAY.slice(1).map((p, i) => Math.hypot(p[0] - RAY[i][0], p[1] - RAY[i][1]))
const RAY_TOTAL = SEG_LEN.reduce((a, b) => a + b, 0)
/** 光の線の色（明るい黄色） */
const LIGHT = '#e0a400'

export function FigCavity() {
  const speed = 300
  return (
    <Anim
      n="21-2"
      title="小さな穴の開いた箱は、入った光をほとんど吸い込み、熱すると黒体放射を出す"
      still={2.6}
      period={6}
      caption="模式図です。左：穴から入った光は、内側の壁ではね返るたびに一部が吸い込まれ、穴から出てくる前に弱まって消えます（線の濃さが光の強さ）。そのため、穴はすべての光を吸い込む黒い面と同じはたらきをします。右：箱全体を熱すると、穴から出る光は、壁の材料によらず温度だけで決まる黒体放射になります。"
    >
      {(t) => {
        const d = Math.min(t * speed, RAY_TOTAL)
        // 今いる区間と、区間の中の位置
        let acc = 0
        let seg = 0
        while (seg < SEG_LEN.length - 1 && acc + SEG_LEN[seg] < d) acc += SEG_LEN[seg++]
        const f = Math.min(1, (d - acc) / SEG_LEN[seg])
        const a = RAY[seg]
        const b = RAY[seg + 1]
        const cur: Pt = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
        const done = d >= RAY_TOTAL
        const out = Array.from({ length: 3 }, (_, i) => mod(t * 30 + i * 18, 54))
        return (
          <Svg id="21-2" w={720} h={290} label="左は、小さな穴から箱に入った光が、内側の壁で何度もはね返るうちに弱まり、外へ出てこない様子。右は、熱した箱の穴から黒体放射が出ていく様子。">
            {/* 左：光を吸い込む */}
            <T x={190} y={22} anchor="middle" fs={12.5} bold>
              穴から入った光は出てこない
            </T>
            <path d="M62,40 L330,40 L330,220 L50,220 L50,134 L62,134 L62,208 L318,208 L318,52 L62,52 L62,118 L50,118 L50,40 Z" fill="var(--fig-box)" stroke="var(--fig-line)" />
            {RAY.slice(1).map((p, i) => {
              if (i > seg) return null
              const q = RAY[i]
              const end: Pt = i === seg ? cur : p
              return <line key={i} x1={q[0]} y1={q[1]} x2={end[0]} y2={end[1]} stroke={LIGHT} strokeWidth={2.4} opacity={RAY_OPACITY[i]} />
            })}
            {!done && <circle cx={cur[0]} cy={cur[1]} r={4} fill={LIGHT} opacity={RAY_OPACITY[seg]} />}
            <T x={8} y={82} fs={12}>
              入って
            </T>
            <T x={8} y={99} fs={12}>
              くる光
            </T>
            <T x={190} y={246} anchor="middle" fs={12}>
              壁ではね返るたびに吸い込まれて弱まる
            </T>
            <T x={190} y={266} anchor="middle" fs={12} tone="muted">
              （穴は、光をすべて吸い込む黒い面と同じ）
            </T>
            {/* 右：熱した箱。穴は右の壁にある */}
            <T x={516} y={22} anchor="middle" fs={12.5} bold>
              熱すると、穴から黒体放射が出る
            </T>
            <path d="M380,40 L652,40 L652,118 L640,118 L640,52 L392,52 L392,208 L640,208 L640,134 L652,134 L652,220 L380,220 Z" fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={392} y={52} width={248} height={156} fill={glowColor(1800)} opacity={0.75} />
            <T x={516} y={130} anchor="middle" fs={12.5}>
              熱した箱の内側
            </T>
            {out.map((s, i) => (
              <Packet key={i} x={668 + s} y={120 + i * 8} deg={0} wl={7 + i * 2} color="#d86a1f" cycles={2} />
            ))}
            <T x={706} y={246} anchor="end" fs={12}>
              出てくる光の色ごとの強さは温度だけで決まる
            </T>
            <T x={706} y={266} anchor="end" fs={12} tone="muted">
              （壁の材料にはよらない）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図21-4 測定と2つの式 ---------- */

const MK = 1873 // 1600℃
const MPK = planck(peakNm(MK), MK)
const measured = (nm: number) => planck(nm, MK) / MPK
const wien = (nm: number) => (Math.pow(nm, -5) * Math.exp(-C2 / (nm * MK))) / MPK
const rayleigh = (nm: number) => (Math.pow(nm, -4) * MK) / C2 / MPK

interface GraphProps {
  x0: number
  y0: number
  w: number
  h: number
  nm0: number
  nm1: number
  /** 縦軸のいちばん上に当たる値（いちばん強い所を1とする） */
  scale: number
  ticks: number[]
  title: string
}

/** 測定・ヴィーンの式・レイリーの式の3本を描くグラフ。上にはみ出す所は描かない */
function Graph({ x0, y0, w, h, nm0, nm1, scale, ticks, title }: GraphProps) {
  const X = (nm: number) => x0 + ((nm - nm0) / (nm1 - nm0)) * w
  const Y = (v: number) => y0 - (v / scale) * h
  const path = (fn: (nm: number) => number) => {
    const pts: Pt[] = []
    for (let nm = Math.max(nm0, 300); nm <= nm1; nm += (nm1 - nm0) / 160) {
      const v = fn(nm)
      if (v > scale) {
        pts.length = 0
        pts.push([X(nm), y0 - h])
        continue
      }
      pts.push([X(nm), Y(v)])
    }
    return line(pts)
  }
  return (
    <g>
      <T x={x0 + w / 2} y={y0 - h - 34} anchor="middle" fs={12.5} bold>
        {title}
      </T>
      <line x1={x0} y1={y0} x2={x0 + w + 6} y2={y0} stroke="var(--fig-line)" />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - h - 8} stroke="var(--fig-line)" />
      {ticks.map((nm) => (
        <g key={nm}>
          <line x1={X(nm)} y1={y0} x2={X(nm)} y2={y0 + 5} stroke="var(--fig-line)" />
          <T x={X(nm)} y={y0 + 18} anchor="middle" fs={11.5} tone="muted">
            {`${nm / 1e6}mm`}
          </T>
        </g>
      ))}
      <path d={path(rayleigh)} fill="none" stroke="var(--fig-danger)" strokeWidth={2} />
      <path d={path(wien)} fill="none" stroke="var(--fig-line)" strokeWidth={1.8} strokeDasharray="6 4" />
      <path d={path(measured)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.6} />
    </g>
  )
}

/** 凡例の1項目 */
function Key({ x, y, kind, text }: { x: number; y: number; kind: 'measured' | 'wien' | 'rayleigh'; text: string }) {
  const stroke = kind === 'measured' ? 'var(--fig-accent)' : kind === 'wien' ? 'var(--fig-line)' : 'var(--fig-danger)'
  return (
    <g>
      <line x1={x} y1={y} x2={x + 30} y2={y} stroke={stroke} strokeWidth={kind === 'measured' ? 2.6 : 2} strokeDasharray={kind === 'wien' ? '6 4' : undefined} />
      <T x={x + 38} y={y} fs={12}>
        {text}
      </T>
    </g>
  )
}

export function FigMismatch() {
  // レイリーの式が左のグラフの上端に届く波長（約0.0034mm）の位置
  const topX = 50 + (3360 / 6000) * 280
  return (
    <Figure
      n="21-4"
      title="ヴィーンの式は長い波長で測定より小さく、レイリーの式は短い波長でどこまでも大きくなる"
      caption="約1600℃の黒体について計算した図です。測定の曲線には、のちに測定とよく合うと分かったプランクの法則を使っています。右のグラフは、左の右端より長い波長の側を、縦に約15倍に拡大したものです。横軸は波長で、右へ行くほど長くなります。"
    >
      <Svg id="21-4" w={720} h={310} label="左のグラフでは、レイリーの式が短い波長の側でどこまでも大きくなり、測定と大きく食い違う。ヴィーンの式は左のグラフでは測定とほぼ重なる。右の拡大したグラフでは、長い波長の側でヴィーンの式が測定より小さく、レイリーの式は測定より大きい。">
        <Graph x0={50} y0={230} w={280} h={150} nm0={0} nm1={6000} scale={1.25} ticks={[2000, 4000, 6000]} title="波長の全体" />
        <Graph x0={410} y0={230} w={280} h={150} nm0={6000} nm1={16000} scale={0.08} ticks={[6000, 10000, 14000]} title="長い波長の側を縦に拡大" />
        <T x={44} y={74} anchor="end" fs={12}>
          強さ
        </T>
        <Cross x={topX} y={64} s={7} />
        <T x={topX + 14} y={64} fs={12} tone="danger">
          どこまでも大きくなる
        </T>
        <T x={528} y={84} fs={11.5}>
          ヴィーンの式は測定より小さい
        </T>
        <T x={528} y={102} fs={11.5}>
          レイリーの式は測定より大きいが、
        </T>
        <T x={528} y={120} fs={11.5}>
          波長が長いほど測定に近づく
        </T>
        <Key x={40} y={286} kind="measured" text="測定" />
        <Key x={170} y={286} kind="wien" text="ヴィーンの式（1896年）" />
        <Key x={420} y={286} kind="rayleigh" text="レイリーの式（1900年）" />
      </Svg>
    </Figure>
  )
}

/* ---------- 図21-5 振動数が高いほど、エネルギーのつぶは大きい ---------- */

const STEP_COLS = [
  { x: 120, title: '振動数が低い', sub: '（長い波長）', step: 13, note: ['細かい段を', 'いくつも上れる'] },
  { x: 360, title: '振動数が中くらい', sub: '', step: 46, note: ['1段目には', '上れることがある'] },
  { x: 600, title: '振動数が高い', sub: '（短い波長）', step: 130, note: ['1段目にも', 'ほとんど届かない'] },
]

export function FigSteps() {
  const base = 236
  const band = 72
  return (
    <Figure
      n="21-5"
      title="エネルギーのつぶの大きさは振動数に比例するので、振動数の高い光はほとんど出ない"
      caption="プランクの考えを表した模式図です。青の横線の1段が、エネルギーのつぶ1個分です。熱で受け渡されるエネルギーのおよその大きさは温度で決まり、色の帯の高さで表しています。振動数の高い振動は1段目に上がることもまれなので、短い波長の光はほとんど出ません。"
    >
      <Svg id="21-5" w={720} h={340} label="3つの振動の、エネルギーのつぶの段。振動数が低いと段が細かく、熱で受け渡されるエネルギーの範囲にいくつも段がある。振動数が高いと段が大きく、1段目にも届かない。">
        <rect x={20} y={base - band} width={690} height={band} fill="var(--fig-box2)" opacity={0.9} />
        <line x1={20} y1={base} x2={710} y2={base} stroke="var(--fig-line)" strokeWidth={1.5} />
        {STEP_COLS.map((c) => {
          const n = Math.floor(170 / c.step)
          return (
            <g key={c.title}>
              <T x={c.x} y={22} anchor="middle" fs={12.5} bold>
                {c.title}
              </T>
              {c.sub && (
                <T x={c.x} y={40} anchor="middle" fs={12} tone="muted">
                  {c.sub}
                </T>
              )}
              <line x1={c.x - 50} y1={base - 172} x2={c.x - 50} y2={base} stroke="var(--fig-line)" />
              {Array.from({ length: n }, (_, i) => {
                const y = base - c.step * (i + 1)
                return <line key={i} x1={c.x - 50} y1={y} x2={c.x + 50} y2={y} stroke="var(--fig-accent)" strokeWidth={1.8} />
              })}
              {c.step < band && <Ball x={c.x + 26} y={base - c.step * Math.floor((band - 4) / c.step) - 6} r={5} />}
              {c.step >= band && <Cross x={c.x + 26} y={base - c.step - 14} s={7} />}
              {c.step >= 40 && (
                <T x={c.x + 58} y={base - c.step / 2} fs={11.5} tone="acc">
                  つぶ1個
                </T>
              )}
              {c.note.map((s, i) => (
                <T key={i} x={c.x} y={base + 22 + i * 18} anchor="middle" fs={12}>
                  {s}
                </T>
              ))}
            </g>
          )
        })}
        <rect x={60} y={292} width={26} height={14} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <T x={94} y={299} fs={12}>
          熱で受け渡されるエネルギーのおよその大きさ（温度が高いほど高い）
        </T>
        <circle cx={73} cy={324} r={6} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
        <T x={94} y={324} fs={12}>
          熱でエネルギーを受け取って上がった段の例（×は上がれない段）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図21-6 光の色を変えると電子が飛び出すか（動・スライダー） ---------- */

const PE_WL = [700, 650, 600, 550, 500, 450, 400, 350, 300, 250]
const PE_NAME = ['赤', '橙', '黄', '黄緑', '緑', '青', '紫', '紫外線', '紫外線', '紫外線']
const PE_TH = 525 // この金属から電子が出る、いちばん長い波長（模式）
const PLATE_Y = 236
const PERIOD = 8

export function FigPhotoelectric() {
  const [s, setS] = useState(6)
  const [bright, setBright] = useState<'weak' | 'strong'>('strong')
  const nm = PE_WL[s]
  const color = lamColor(nm) ?? '#7a4fc0'
  const rate = bright === 'strong' ? 5 : 1.5
  const n = Math.round(rate * PERIOD)
  const excess = PE_TH / nm - 1 // 余ったエネルギー（必要なエネルギーを1とした割合）
  const out = excess > 0
  // 光のつぶが板に当たる場所と、電子の飛ぶ向き（開くたびに同じ）
  const r = rng(21)
  const hits = Array.from({ length: 40 }, () => ({ x: 110 + r() * 260, ang: -90 + (r() - 0.5) * 70 }))
  // 右の棒グラフ
  const BX = 540
  const BY = 250
  const unit = 70 // 必要なエネルギーの高さ
  const barH = unit * (PE_TH / nm)
  return (
    <Anim
      n="21-7"
      title="光の振動数が足りないと、どれだけ明るくしても電子は飛び出さない"
      still={3}
      period={PERIOD}
      controls={
        <>
          <Range label="光の色（振動数）" min={0} max={9} step={1} value={s} onChange={setS} format={(v) => `${PE_NAME[v]}（波長 約${(PE_WL[v] / 1e6).toFixed(5)}mm）`} />
          <Choice
            label="光の明るさ"
            options={[
              { value: 'weak', label: '弱い' },
              { value: 'strong', label: '強い' },
            ]}
            value={bright}
            onChange={setBright}
          />
        </>
      }
      caption="模式図です。この金属では、緑の光と、それより振動数の高い光（波長の短い光）を当てたときだけ電子が飛び出すとしています。「光の色」を赤の側へ動かすと、電子は出なくなります。「光の明るさ」を変えると、光のつぶと電子の数が変わりますが、電子の速さ（黒の矢印の長さ）は変わりません。右の棒は、光のつぶ1個のエネルギーです。"
    >
      {(t) => (
        <Svg id="21-7" w={720} h={300} label="金属の板に光のつぶが当たり、振動数が高い光では電子が飛び出す。振動数が低い光では、明るくしても電子は出ない。右の棒グラフは、光のつぶ1個のエネルギーと、電子を取り出すのに必要なエネルギーを比べたもの。">
          <rect x={90} y={PLATE_Y} width={300} height={26} fill="var(--fig-box)" stroke="var(--fig-line)" />
          <T x={240} y={PLATE_Y + 13} anchor="middle" fs={12}>
            金属の板
          </T>
          <T x={20} y={24} fs={12}>
            光のつぶ（左上から当たる）
          </T>
          {Array.from({ length: n }, (_, i) => {
            const h = hits[i % hits.length]
            const age = mod(t - (i * PERIOD) / n, PERIOD)
            const fly = 1.1
            if (age < fly) {
              const p = age / fly
              const x = h.x - 170 * (1 - p)
              const y = PLATE_Y - 4 - 170 * (1 - p)
              return <Packet key={i} x={x} y={y} deg={45} wl={Math.max(5, nm / 45)} color={color} cycles={2.5} />
            }
            if (!out || age > fly + 2.2) return null
            const u = age - fly
            const v = 75 * Math.sqrt(excess)
            const al = 6 + v * 0.45
            const a = (h.ang * Math.PI) / 180
            const ex = h.x + Math.cos(a) * v * u
            const ey = PLATE_Y - 6 + Math.sin(a) * v * u
            if (ey < 75 || ex > 440) return null
            return (
              <g key={i}>
                <Ball x={ex} y={ey} r={5} fill="var(--fig-box3)" />
                <Vel x1={ex + Math.cos(a) * 7} y1={ey + Math.sin(a) * 7} x2={ex + Math.cos(a) * (7 + al)} y2={ey + Math.sin(a) * (7 + al)} />
              </g>
            )
          })}
          {!out && (
            <T x={240} y={PLATE_Y + 48} anchor="middle" fs={12.5} tone="danger">
              電子は飛び出さない
            </T>
          )}
          {out && (
            <>
              <Ball x={140} y={PLATE_Y + 48} r={5} fill="var(--fig-box3)" />
              <T x={152} y={PLATE_Y + 48} fs={12}>
                飛び出した電子（矢印は速さ）
              </T>
            </>
          )}
          {/* 右：つぶ1個のエネルギー */}
          <T x={BX + 40} y={24} anchor="middle" fs={12.5} bold>
            光のつぶ1個のエネルギー
          </T>
          <line x1={BX - 20} y1={BY} x2={BX + 110} y2={BY} stroke="var(--fig-line)" />
          <rect x={BX} y={BY - Math.min(barH, unit)} width={46} height={Math.min(barH, unit)} fill={color} opacity={0.75} stroke="var(--fig-line)" />
          {out && <rect x={BX} y={BY - barH} width={46} height={barH - unit} fill="var(--fig-accent)" opacity={0.85} stroke="var(--fig-line)" />}
          <line x1={BX - 20} y1={BY - unit} x2={BX + 110} y2={BY - unit} stroke="var(--fig-danger)" strokeDasharray="5 4" strokeWidth={1.5} />
          <T x={BX + 54} y={BY - unit + 14} fs={11.5} tone="danger">
            電子を取り出すのに
          </T>
          <T x={BX + 54} y={BY - unit + 30} fs={11.5} tone="danger">
            必要なエネルギー
          </T>
          {out ? (
            <>
              <T x={BX + 54} y={BY - barH - 24} fs={11.5} tone="acc">
                余りが電子の
              </T>
              <T x={BX + 54} y={BY - barH - 8} fs={11.5} tone="acc">
                運動エネルギーになる
              </T>
            </>
          ) : (
            <T x={BX + 54} y={BY - unit - 16} fs={11.5} tone="danger">
              足りない
            </T>
          )}
          <T x={BX + 23} y={BY + 18} anchor="middle" fs={11.5} tone="muted">
            振動数が高いほど高い
          </T>
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図21-7 波の考えの予想と実際 ---------- */

export function FigPredict() {
  const rows = [
    { what: ['光を明るくする'], wave: ['飛び出す電子の', '勢いが増す'], real: ['電子の数が増える。', '1個1個の勢いは変わらない'] },
    { what: ['光の振動数を高くする', '（紫の側へ変える）'], wave: ['電子の勢いは', '変わらない'], real: ['電子の勢いが増す。振動数が', '低すぎると、電子は出ない'] },
  ]
  return (
    <Figure n="21-6" title="光電効果は光を波と考えたときの予想と合わなかった" caption="レーナルトの1902年の実験などで分かったことをまとめた図です。電子の勢いは明るさを1000倍に変えても変わりませんでした。">
      <Svg id="21-6" w={720} h={250} label="光を明るくすると、波の考えでは電子の勢いが増すはずだったが、実際には電子の数が増えるだけだった。光の振動数を高くすると、波の考えでは勢いは変わらないはずだったが、実際には勢いが増し、振動数が低すぎると電子は出なかった。">
        <T x={100} y={22} anchor="middle" fs={12.5} bold>
          変えたこと
        </T>
        <T x={340} y={22} anchor="middle" fs={12.5} bold>
          光を波と考えたときの予想
        </T>
        <T x={590} y={22} anchor="middle" fs={12.5} bold>
          実際の結果
        </T>
        {rows.map((r, i) => {
          const y = 42 + i * 102
          return (
            <g key={i}>
              <Box x={14} y={y} w={172} h={84} lines={r.what} fill="box" fs={12.5} />
              <Box x={230} y={y} w={220} h={84} lines={r.wave} fill="bg" fs={12.5} dashed />
              <Cross x={440} y={y + 14} s={7} />
              <Arrow x1={188} y1={y + 42} x2={228} y2={y + 42} />
              <Box x={480} y={y} w={226} h={84} lines={r.real} fill="box3" fs={12.5} accent />
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図21-8 ミリカンの測定のグラフ ---------- */

export function FigMillikan() {
  const X = (f: number) => 80 + f * 52 // f は振動数（目盛りの数）
  const Y = (e: number) => 250 - e * 44
  const metals = [
    { name: '金属A', f0: 4.2, dots: [5.2, 6.1, 7.4, 8.5, 9.6] },
    { name: '金属B', f0: 6.6, dots: [] as number[] },
  ]
  const k = 0.45 // 傾き（どの金属でも同じ）
  return (
    <Figure
      n="21-8"
      title="電子のエネルギーは振動数とともに一定の割合で増え、直線の傾きはどの金属でも同じになる"
      caption="アインシュタインの予言をグラフにした模式図です。点は測定のようすを表したもので、実際の値ではありません。直線が横軸と交わる振動数より低い光では、電子は出ません。その振動数は金属によって違いますが、直線の傾きはどの金属でも同じで、その値からプランク定数が求まります。"
    >
      <Svg id="21-8" w={680} h={300} label="横軸に光の振動数、縦軸に飛び出す電子のエネルギーの最大値をとったグラフ。金属Aと金属Bの直線は平行で、横軸と交わる振動数だけが違う。">
        <line x1={X(0)} y1={Y(0)} x2={X(11)} y2={Y(0)} stroke="var(--fig-line)" />
        <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(4.4)} stroke="var(--fig-line)" />
        <T x={X(11)} y={Y(0) + 20} anchor="end" fs={12}>
          光の振動数（高い →）
        </T>
        <T x={X(0) + 8} y={Y(4.6)} fs={12}>
          飛び出す電子のエネルギー（いちばん大きいもの）
        </T>
        {metals.map((m) => (
          <g key={m.name}>
            <line x1={X(m.f0)} y1={Y(0)} x2={X(10.6)} y2={Y(k * (10.6 - m.f0))} stroke="var(--fig-accent)" strokeWidth={2.4} />
            <line x1={X(m.f0)} y1={Y(0)} x2={X(m.f0)} y2={Y(0) + 8} stroke="var(--fig-line)" />
            <T x={X(10.6) + 6} y={Y(k * (10.6 - m.f0))} fs={12.5} tone="acc">
              {m.name}
            </T>
            {m.dots.map((f) => (
              <circle key={f} cx={X(f)} cy={Y(k * (f - m.f0)) + (f % 2 > 1 ? 2 : -2)} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            ))}
          </g>
        ))}
        <T x={X(4.2)} y={Y(0) + 22} anchor="middle" fs={11.5}>
          Aで電子が
        </T>
        <T x={X(4.2)} y={Y(0) + 38} anchor="middle" fs={11.5}>
          出始める振動数
        </T>
        <T x={X(6.6)} y={Y(0) + 22} anchor="middle" fs={11.5}>
          Bで電子が
        </T>
        <T x={X(6.6)} y={Y(0) + 38} anchor="middle" fs={11.5}>
          出始める振動数
        </T>
        <T x={X(1.0)} y={Y(2.5)} fs={12} tone="muted">
          低い振動数では
        </T>
        <T x={X(1.0)} y={Y(2.5) + 17} fs={12} tone="muted">
          電子は出ない
        </T>
        <T x={X(5.6)} y={Y(3.4)} fs={12} tone="acc">
          2本の直線は平行
        </T>
        <T x={X(5.6)} y={Y(3.4) + 17} fs={12} tone="acc">
          （傾きからプランク定数が求まる）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図21-9 光のつぶが電子をはね飛ばす（動・切り替え） ---------- */

export function FigCompton() {
  const [angle, setAngle] = useState<'45' | '90' | '135'>('90')
  const th = (Number(angle) * Math.PI) / 180
  const phi = Math.PI / 2 - th / 2 // 電子がはね飛ばされる向き（下向き。およその向き）
  const grow = 1 - Math.cos(th) // 90度のときを1とした波長の伸び
  const cx = 300
  const cy = 190
  const wl0 = 16
  const wl1 = wl0 + 9 * grow
  const hit = 1.6
  const endP: Pt = [cx + Math.cos(-th) * 165, cy + Math.sin(-th) * 165]
  const endE: Pt = [cx + Math.cos(phi) * 120, cy + Math.sin(phi) * 120]
  const left = th > 2 // 135度のときは、曲がった光の説明を左側に置く
  return (
    <Anim
      n="21-9"
      title="X線の光のつぶは、電子とぶつかると、波長が長くなって曲がる"
      still={3.4}
      period={5.5}
      controls={
        <Choice
          label="光のつぶが曲がる角度"
          options={[
            { value: '45', label: '45度' },
            { value: '90', label: '90度' },
            { value: '135', label: '135度' },
          ]}
          value={angle}
          onChange={setAngle}
        />
      }
      caption="模式図です。波長の伸びは、実際よりずっと大きく描いています。「光のつぶが曲がる角度」を大きくするほど、電子に渡すエネルギーと運動量が大きくなり、波長の伸びも大きくなります。伸びの大きさは、元のX線の波長によりません。"
    >
      {(t) => {
        const tt = Math.min(t, 4.6)
        const u = Math.max(0, tt - hit)
        const inX = cx - 230 + (Math.min(tt, hit) / hit) * 200
        const dp = Math.min(95 * u, 157 - (wl1 * 3) / 2)
        const de = Math.min(45 * u, 70)
        const px = cx + Math.cos(-th) * dp
        const py = cy + Math.sin(-th) * dp
        const ex = cx + Math.cos(phi) * de
        const ey = cy + Math.sin(phi) * de
        return (
          <Svg id="21-9" w={720} h={340} label="左から来たX線の光のつぶが電子にぶつかり、選んだ角度に曲がって進む。曲がった光のつぶは波長が長くなり、電子は斜め下へはね飛ばされる。">
            <Trail points={[[cx - 230, cy], [cx, cy]]} />
            <Trail points={[[cx, cy], endP]} />
            <Trail points={[[cx, cy], endE]} />
            <T x={40} y={cy - 28} fs={12}>
              入ってくるX線の光のつぶ
            </T>
            {tt < hit && <Packet x={inX} y={cy} deg={0} wl={wl0} color="var(--fig-accent)" />}
            {tt >= hit && <Packet x={px} y={py} deg={-Number(angle)} wl={wl1} color="var(--fig-accent)" />}
            <Ball x={tt < hit ? cx : ex} y={tt < hit ? cy : ey} r={9} fill="var(--fig-box2)" />
            {tt >= hit && <Vel x1={ex + Math.cos(phi) * 12} y1={ey + Math.sin(phi) * 12} x2={ex + Math.cos(phi) * 40} y2={ey + Math.sin(phi) * 40} />}
            <T x={cx - 16} y={cy + 24} anchor="end" fs={12}>
              止まっていた電子
            </T>
            <T x={endE[0] + 12} y={endE[1] + 4} fs={12}>
              はね飛ばされた電子
            </T>
            <T x={left ? endP[0] - 10 : endP[0] + 12} y={endP[1] - 6} anchor={left ? 'end' : 'start'} fs={12}>
              曲がった光のつぶ
            </T>
            <T x={left ? endP[0] - 10 : endP[0] + 12} y={endP[1] + 11} anchor={left ? 'end' : 'start'} fs={12} tone="muted">
              （波長が長い）
            </T>
            <path d={`M${cx + 34},${cy} A34,34 0 0 0 ${(cx + 34 * Math.cos(-th)).toFixed(1)},${(cy + 34 * Math.sin(-th)).toFixed(1)}`} fill="none" stroke="var(--fig-muted)" />
            <T x={cx + 42} y={cy - 12} fs={11.5} tone="muted">
              {`${angle}度`}
            </T>
            <Box x={14} y={246} w={210} h={80} lines={['波長の伸び（90度を1とする）', `${angle}度のとき：${grow.toFixed(1).replace('1.0', '1')}倍`, '大きく曲がるほど伸びる']} fill="box3" fs={12} subTone="muted" bold />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図21-10 この章の発見とつながり ---------- */

export function FigLinks() {
  const top = [
    { x: 14, lines: ['黒体放射の測定', '（1899〜1900年）'] },
    { x: 192, lines: ['プランクの', 'エネルギー量子', '（1900年）'] },
    { x: 370, lines: ['アインシュタインの', '光量子', '（1905年）'] },
    { x: 548, lines: ['ミリカン（1916年）', 'コンプトン（1923年）', 'の実験'] },
  ]
  const mid = [
    { x: 14, lines: ['ボーアの原子模型', '（1913年、第22章）'] },
    { x: 251, lines: ['ド・ブロイの物質波', '（1924年、第23章）'] },
    { x: 488, lines: ['光は波と粒の両方の', '性質を示す（第24章）'] },
  ]
  const low = [
    { x: 14, lines: ['宇宙マイクロ波背景放射', 'も黒体放射（第34章）'] },
    { x: 251, lines: ['デジタルカメラの撮像素子', '（光電効果を使う）'] },
    { x: 488, lines: ['キログラムの定義', '（プランク定数、2019年）'] },
  ]
  return (
    <Figure n="21-10" title="エネルギーのつぶの考えは、原子の理論や身近な技術につながった" caption="上の段がこの章で扱った流れ、中の段がこのあとの章で扱う理論です。下の段は、左から黒体放射、光電効果、プランク定数が使われている例です。">
      <Svg id="21-10" w={720} h={312} label="黒体放射の測定から、プランクのエネルギー量子、アインシュタインの光量子、ミリカンとコンプトンの実験へと進んだ。そこからボーアの原子模型、ド・ブロイの物質波、光の波と粒の性質の理論につながった。黒体放射は宇宙マイクロ波背景放射の観測に、光電効果はデジタルカメラの撮像素子に、プランク定数はキログラムの定義に使われている。">
        {top.map((b, i) => (
          <g key={b.x}>
            <Box x={b.x} y={14} w={158} h={64} lines={b.lines} fill={i === 1 || i === 2 ? 'box3' : 'box'} fs={12} accent={i === 1 || i === 2} />
            {i < 3 && <Arrow x1={b.x + 160} y1={46} x2={b.x + 176} y2={46} />}
          </g>
        ))}
        <T x={14} y={106} fs={12} tone="muted">
          このあとの章で扱う理論
        </T>
        <Arrow x1={250} y1={80} x2={150} y2={126} />
        <Arrow x1={430} y1={80} x2={380} y2={126} />
        <Arrow x1={610} y1={80} x2={610} y2={126} />
        {mid.map((b) => (
          <Box key={b.x} x={b.x} y={128} w={218} h={58} lines={b.lines} fill="box4" fs={12} />
        ))}
        <T x={14} y={214} fs={12} tone="muted">
          応用と測定の例
        </T>
        {low.map((b) => (
          <Box key={b.x} x={b.x} y={228} w={218} h={58} lines={b.lines} fill="box2" fs={12} />
        ))}
      </Svg>
    </Figure>
  )
}
