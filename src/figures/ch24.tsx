import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Vel, rng, wave } from './common'

/** 中心 (cx, cy)、半径 r、角度 a（ラジアン、右向きが0、下向きが正）の点 */
const at = (cx: number, cy: number, r: number, a: number) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })

/** 中心 (cx, cy)、半径 r の円弧（角度 a0 から a1 まで）の path の d */
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = at(cx, cy, r, a0)
  const q = at(cx, cy, r, a1)
  return `M${p.x.toFixed(1)},${p.y.toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${q.x.toFixed(1)},${q.y.toFixed(1)}`
}

/** 重みの関数 f に従う値を rng で n 個選ぶ（-1〜1 の範囲。f の最大値は 1 以下にする） */
const sample = (seed: number, n: number, f: (u: number) => number) => {
  const r = rng(seed)
  const out: number[] = []
  while (out.length < n) {
    const u = r() * 2 - 1
    if (r() < f(u)) out.push(u)
  }
  return out
}

/* ---------- 図24-1 この章の年表 ---------- */

const ROAD = [
  { y: '1926年', who: 'ボルン', what: ['波を確率として', '読む'], key: true },
  { y: '1927年3月', who: 'ハイゼンベルク', what: ['不確定性原理', 'の論文'], key: true },
  { y: '1927年9月', who: 'ボーア', what: ['相補性を', 'コモで講演'], key: true },
  { y: '1927年10月', who: 'ソルベー会議', what: ['第5回', '（ブリュッセル）'], key: true },
  { y: '1961年', who: 'ヨンソン', what: ['電子の', '二重スリット'], key: false },
  { y: '1974年', who: 'メルリら', what: ['電子1個ずつの', '干渉を撮影'], key: false },
  { y: '1989年', who: '外村彰ら', what: ['縞ができる', '過程を記録'], key: true },
  { y: '1998年', who: 'デュルら', what: ['通った道を記録', 'すると縞が消える'], key: false },
]

export function FigRoad24() {
  return (
    <Figure n="24-1" title="確率の解釈から、電子1個ずつの干渉の実験までの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。青い点はこの章で詳しく扱う出来事です。">
      <Svg id="24-1" w={760} h={230} label="1926年にボルンが波を確率として読む考えを示した。1927年3月にハイゼンベルクが不確定性原理の論文を、9月にボーアが相補性の講演をし、10月に第5回ソルベー会議が開かれた。1961年にヨンソンが電子の二重スリットの実験を、1974年にメルリらが電子1個ずつの干渉の撮影を、1989年に外村彰らが縞ができる過程の記録をした。1998年にデュルらが、通った道を記録すると縞が消えることを原子で確かめた。">
        <Arrow x1={20} y1={124} x2={745} y2={124} />
        {ROAD.map((r, i) => {
          const x = 60 + i * 91
          const up = i % 2 === 0
          const ty = up ? 22 : 158
          return (
            <g key={`${r.y}-${r.who}`}>
              <circle cx={x} cy={124} r={6} fill={r.key ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 92 : 130} x2={x} y2={up ? 118 : 146} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold>
                {r.y}
              </T>
              <T x={x} y={ty + 19} anchor="middle" fs={12.5}>
                {r.who}
              </T>
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + 38 + j * 17} anchor="middle" fs={12} tone="muted">
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

/* ---------- 図24-2 広がった波と、1か所で見つかる電子（動） ---------- */

const DET_Y = Array.from({ length: 9 }, (_, i) => 50 + i * 24)
const PICKS = (() => {
  const r = rng(24)
  return Array.from({ length: 24 }, () => Math.floor(r() * 9))
})()

export function FigSpread() {
  const src = { x: 70, y: 146 }
  const detX = 548
  const speed = 210
  const cycle = 3.6
  const hitAt = (detX - src.x) / speed + 0.2
  const half = 0.22 // 円弧の角度の半分（ラジアン）
  return (
    <Anim
      n="24-2"
      title="1個の電子の波は検出器の列全体に届くが、反応する検出器は毎回1つだけ"
      still={2.6}
      caption="模式図です。電子を1個出すたびに、その波（線は波の山）は広がって9個の検出器すべてに届きます。それでも反応するのは毎回1個だけで、どれが反応するかは回ごとに違います。右の点はこれまでに反応した回数です。"
    >
      {(t) => {
        const c = Math.floor(t / cycle)
        const u = t - c * cycle
        const n = c % PICKS.length
        const fired = u >= hitAt
        const counts = Array<number>(9).fill(0)
        for (let k = 0; k < n + (fired ? 1 : 0); k++) counts[PICKS[k]]++
        const lead = speed * (u - 0.2)
        const fade = fired ? Math.max(0, 1 - (u - hitAt) / 0.8) : 1
        return (
          <Svg id="24-2" w={720} h={280} label="左の電子源から出た1個の電子の波が、円弧の形に広がって右の9個の検出器の列全体に届く。反応するのは毎回1個の検出器だけで、どれが反応するかは回ごとに変わる。">
            <T x={src.x} y={src.y - 26} anchor="middle" fs={12}>
              電子源
            </T>
            <Ball x={src.x} y={src.y} r={7} />
            {[0, 1, 2, 3].map((j) => {
              const R = lead - j * 22
              if (R < 10 || R > detX - src.x - 4) return null
              return <path key={j} d={arc(src.x, src.y, R, -half, half)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} opacity={fade * (1 - j * 0.2)} />
            })}
            <T x={detX + 11} y={22} anchor="middle" fs={12}>
              検出器
            </T>
            <T x={600} y={22} fs={12} tone="muted">
              反応した回数
            </T>
            {DET_Y.map((y, i) => {
              const on = fired && PICKS[n] === i
              return (
                <g key={i}>
                  <rect x={detX} y={y - 9} width={22} height={18} rx={3} fill={on ? 'var(--fig-accent)' : 'var(--fig-box)'} stroke="var(--fig-line)" />
                  {Array.from({ length: counts[i] }, (_, k) => (
                    <circle key={k} cx={604 + k * 9} cy={y} r={3} fill="var(--fig-line)" />
                  ))}
                </g>
              )
            })}
            <T x={20} y={262} fs={12.5}>
              波は広がって、検出器の列全体に届く
            </T>
            <T x={700} y={262} anchor="end" fs={12.5} tone="acc">
              反応するのは1か所だけ
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図24-3 波の揺れと、電子が見つかる確率 ---------- */

export function FigProb() {
  const env = (x: number) => Math.exp(-(((x - 340) / 140) ** 2))
  const f = (x: number) => env(x) * Math.cos((2 * Math.PI * (x - 340)) / 72)
  const top = 92
  const base = 262
  let dw = ''
  let dp = `M30,${base}`
  for (let x = 30; x <= 650; x += 2) {
    dw += `${x === 30 ? 'M' : 'L'}${x},${(top - 50 * f(x)).toFixed(1)}`
    dp += ` L${x},${(base - 72 * f(x) ** 2).toFixed(1)}`
  }
  dp += ` L650,${base} Z`
  return (
    <Figure
      n="24-3"
      title="波の揺れが大きい所ほど、電子は見つかりやすい"
      caption="模式図です。上は電子の波の揺れ、下はそこから求めた、電子が見つかる確率です。確率は揺れの大きさの2乗に比例するので、揺れが2倍の所では4倍になります。山でも谷でも確率は大きく、揺れのない所では0になります。"
    >
      <Svg id="24-3" w={680} h={300} label="上に、中央で大きく揺れる電子の波を描く。下に、そこから求めた電子が見つかる確率を描く。確率は波の山の所でも谷の所でも大きく、揺れが0の所では0になる。">
        <T x={20} y={22} fs={12.5} bold>
          電子の波の揺れ
        </T>
        <line x1={30} y1={top} x2={650} y2={top} stroke="var(--fig-muted)" strokeDasharray="3 4" />
        <path d={dw} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
        <T x={340} y={30} anchor="middle" fs={12}>
          山
        </T>
        <T x={376} y={156} anchor="middle" fs={12}>
          谷
        </T>
        <T x={20} y={176} fs={12.5} bold>
          電子が見つかる確率
        </T>
        <path d={dp} fill="var(--fig-accent)" fillOpacity={0.35} stroke="var(--fig-accent)" strokeWidth={1.5} />
        <line x1={30} y1={base} x2={650} y2={base} stroke="var(--fig-line)" />
        <T x={358} y={282} anchor="middle" fs={12} tone="muted">
          確率0
        </T>
        <T x={500} y={176} fs={12}>
          山でも谷でも、揺れが大きい
        </T>
        <T x={500} y={194} fs={12}>
          所ほど見つかりやすい
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図24-4 ハイゼンベルクの顕微鏡（動・切り替え） ---------- */

const MIC_ANG = [0.55, -0.35, 0.85, -0.75, 0.15]

export function FigMicroscope() {
  const [wl, setWl] = useState<'short' | 'long'>('short')
  const short = wl === 'short'
  const e = { x: 300, y: 210 }
  const lens = { x: 300, y: 92, rx: 92 }
  const alpha = Math.atan(lens.rx / (e.y - lens.y))
  const p = short ? 70 : 22
  const blur = short ? 26 : 120
  const lam = short ? 9 : 34
  const kick = (th: number) => ({ x: p * (1 - Math.sin(th)), y: p * Math.cos(th) })
  let img = `M${lens.x - blur * 1.2},52`
  for (let dx = -blur * 1.2; dx <= blur * 1.2; dx += 3) img += ` L${(lens.x + dx).toFixed(1)},${(52 - 22 * Math.exp(-((dx / (blur / 2)) ** 2))).toFixed(1)}`
  img += ` L${lens.x + blur * 1.2},52 Z`
  const lines = short
    ? ['γ線（波長が短い光）で照らすと', '・像はくっきりする', '・電子は強く押される', '・押される向きの幅も広い']
    : ['波長が長い光で照らすと', '・像は大きくぼやける', '・電子は弱くしか押されない', '・押される向きの幅は狭い']
  return (
    <Anim
      n="24-4"
      title="照らす光の波長を短くすると、位置ははっきりするが、運動量は不確かになる"
      still={1.8}
      controls={
        <Choice
          label="照らす光の波長"
          options={[
            { value: 'short', label: '短い（γ線）' },
            { value: 'long', label: '長い' },
          ]}
          value={wl}
          onChange={setWl}
        />
      }
      caption="ハイゼンベルクの思考実験の模式図です。左から来た光が電子に当たって跳ね返り、レンズに入って像をつくります。上の青い山の幅が位置の不確かさです。光はレンズのどこから入るか分からないので、電子が押される向き（黒の矢印）にも幅が出ます（点線）。「照らす光の波長」を切り替えると、2つの幅が逆向きに変わります。"
    >
      {(t) => {
        const cyc = 4
        const c = Math.floor(t / cyc)
        const u = t - c * cyc
        const th = MIC_ANG[c % MIC_ANG.length] * alpha
        const hit = 1.2
        const L = 110
        const front = 20 + L + (e.x - 20 - L) * Math.min(1, u / hit)
        const after = Math.max(0, u - hit)
        const dist = (e.y - lens.y - 8) / Math.cos(th)
        const s = Math.min(1, after / 1.0) * dist
        const ph = { x: e.x + Math.sin(th) * s, y: e.y - Math.cos(th) * s }
        const k = kick(th)
        const m = Math.min(1, after / 1.5) * 0.3
        const ex = e.x + k.x * m
        const ey = e.y + k.y * m
        const deg = (Math.atan2(-Math.cos(th), Math.sin(th)) * 180) / Math.PI
        return (
          <Svg id="24-4" w={720} h={300} label="左から来た光が電子に当たり、跳ね返った光がレンズに入る。波長の短い光では像はくっきりするが、電子は強く押され、押される向きの幅も広い。波長の長い光では像はぼやけるが、電子は弱くしか押されない。">
            <path d={img} fill="var(--fig-accent)" fillOpacity={0.35} stroke="var(--fig-accent)" strokeWidth={1.5} />
            <T x={20} y={30} fs={12} tone="muted">
              像（位置の見え方）
            </T>
            <line x1={e.x} y1={e.y} x2={lens.x - lens.rx} y2={lens.y} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <line x1={e.x} y1={e.y} x2={lens.x + lens.rx} y2={lens.y} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <ellipse cx={lens.x} cy={lens.y} rx={lens.rx} ry={11} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={lens.x + lens.rx + 10} y={lens.y} fs={12}>
              レンズ
            </T>
            <T x={236} y={150} anchor="end" fs={12} tone="muted">
              光が入れる範囲
            </T>
            <T x={30} y={e.y - 24} fs={12}>
              照らす光
            </T>
            <Arrow x1={20} y1={e.y} x2={e.x - 12} y2={e.y} dashed />
            {u < hit && <path d={wave(front - L, e.y, L, 7, lam, 0, 1)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />}
            {after > 0 && s < dist && (
              <g transform={`translate(${ph.x.toFixed(1)},${ph.y.toFixed(1)}) rotate(${deg.toFixed(1)})`}>
                <path d={wave(-30, 0, 30, 5, lam, 0, 1)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
              </g>
            )}
            {Array.from({ length: 9 }, (_, i) => {
              const q = kick(-alpha + (i * 2 * alpha) / 8)
              return <line key={i} x1={e.x} y1={e.y} x2={e.x + q.x} y2={e.y + q.y} stroke="var(--fig-muted)" strokeDasharray="2 4" />
            })}
            {after > 0 && <Vel x1={e.x} y1={e.y} x2={e.x + k.x} y2={e.y + k.y} />}
            <Ball x={ex} y={ey} r={8} />
            <T x={e.x - 18} y={e.y + 24} anchor="end" fs={12}>
              電子
            </T>
            <T x={e.x + p * 1.6 + 10} y={e.y + p * 0.7 + 6} fs={12} tone="muted">
              押される向きの範囲
            </T>
            {lines.map((l, i) => (
              <T key={i} x={470} y={40 + i * 22} fs={12.5} bold={i === 0}>
                {l}
              </T>
            ))}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図24-5 位置をしぼると運動量の幅が広がる（動・スライダー） ---------- */

const WIDTH_LABEL = ['とても狭い', '狭い', '中くらい', '広い', 'とても広い']

export function FigPacket() {
  const [w, setW] = useState(2)
  const sx = [22, 34, 52, 80, 120][w - 1]
  const sk = 2600 / sx
  const cx = 360
  const top = 82
  const base = 252
  const k0 = (2 * Math.PI) / 26
  return (
    <Anim
      n="24-5"
      title="狭い範囲に収まった波は、波長の違う多くの波を重ねてできている"
      still={0.4}
      period={1.3}
      controls={<Range label="波の束の幅（位置の広がり）" min={1} max={5} step={1} value={w} onChange={setW} format={(v) => WIDTH_LABEL[v - 1]} />}
      caption="模式図です。上は電子の波の束、下はその束をつくるのに重ねた波の運動量の分布です。物質波は波長が短いほど運動量が大きいので、運動量の分布は波長の分布でもあります。「波の束の幅」を狭くすると、下の分布が広がります。"
    >
      {(t) => {
        const ph = (2 * Math.PI * t) / 1.3
        let d = ''
        for (let x = 30; x <= 690; x += 2) {
          const y = top - 46 * Math.exp(-((x - cx) ** 2) / (2 * sx * sx)) * Math.cos(k0 * (x - cx) - ph)
          d += `${x === 30 ? 'M' : 'L'}${x},${y.toFixed(1)}`
        }
        const bars = Array.from({ length: 25 }, (_, i) => 168 + i * 16)
        return (
          <Svg id="24-5" w={720} h={290} label="上に電子の波の束、下にその束に含まれる波の運動量の分布を描く。波の束の幅を狭くすると、運動量の分布の幅が広がる。">
            <T x={20} y={22} fs={12.5} bold>
              電子の波の束
            </T>
            <line x1={30} y1={top} x2={690} y2={top} stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <path d={d} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
            <Arrow x1={cx - 1.6 * sx} y1={146} x2={cx + 1.6 * sx} y2={146} both />
            <T x={cx + 1.6 * sx + 10} y={146} fs={12} tone="acc">
              位置の幅
            </T>
            <T x={20} y={170} fs={12.5} bold>
              重ねた波の運動量
            </T>
            {bars.map((x) => {
              const h = 62 * Math.exp(-((x - cx) ** 2) / (2 * sk * sk))
              return h > 0.5 ? <rect key={x} x={x - 5} y={base - h} width={10} height={h} fill="var(--fig-box3)" stroke="var(--fig-accent)" /> : null
            })}
            <line x1={150} y1={base} x2={570} y2={base} stroke="var(--fig-line)" />
            <Arrow x1={cx - 1.6 * Math.min(sk, 118)} y1={180} x2={cx + 1.6 * Math.min(sk, 118)} y2={180} both />
            <T x={cx + 1.6 * Math.min(sk, 118) + 10} y={180} fs={12} tone="acc">
              運動量の幅
            </T>
            <T x={160} y={270} fs={12} tone="muted">
              運動量が小さい
            </T>
            <T x={560} y={270} anchor="end" fs={12} tone="muted">
              運動量が大きい
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図24-6 すき間の幅と、電子の広がり（動） ---------- */

/** すき間を出たあとの曲がり方（-1〜1。中央ほど多い） */
const SLIT_U = sample(2406, 60, (u) => Math.cos((Math.PI * u) / 2) ** 2)
/** すき間の中のどこを通ったか（-1〜1） */
const SLIT_S = sample(77, 60, () => 1)
/** spread は、すき間を出たあとの広がりが画面の上でいちばん大きくなる幅（片側） */
const LANES6 = [
  { label: 'すき間が広い（位置の幅が大きい）', gap: 30, spread: 10 },
  { label: 'すき間が狭い（位置の幅が小さい）', gap: 8, spread: 56 },
]

export function FigSlit() {
  const sx = 40
  const bx = 250
  const scr = 610
  const v = 330
  const dt = 0.13
  return (
    <Anim
      n="24-6"
      title="すき間を狭くして電子の位置をしぼると、電子はすき間を出たあと大きく広がる"
      still={10.2}
      period={11}
      caption="模式図です（広がる角度は大きく描いています）。上下とも、左から同じ速さの電子を1個ずつ送っています。右の縦線は電子が当たる画面で、当たった所に点を残します。すき間が狭いほど、当たる範囲（右の両向きの矢印）が広がります。"
    >
      {(t) => (
        <Svg id="24-6" w={720} h={300} label="上の段は広いすき間、下の段は狭いすき間に電子を1個ずつ通す。広いすき間では電子は画面の狭い範囲に当たり、狭いすき間では広い範囲に散らばる。">
          {LANES6.map((ln, li) => {
            const cy = 80 + li * 148
            const reach = ln.gap / 2 + ln.spread
            return (
              <g key={li}>
                <T x={20} y={cy - 54} fs={12.5} bold>
                  {ln.label}
                </T>
                <rect x={bx - 4} y={cy - 62} width={8} height={62 - ln.gap / 2} fill="var(--fig-line)" />
                <rect x={bx - 4} y={cy + ln.gap / 2} width={8} height={62 - ln.gap / 2} fill="var(--fig-line)" />
                <line x1={scr} y1={cy - 62} x2={scr} y2={cy + 62} stroke="var(--fig-line)" strokeWidth={2} />
                <Arrow x1={650} y1={cy - reach} x2={650} y2={cy + reach} both />
                <T x={662} y={cy} fs={12} tone="acc">
                  広がり
                </T>
                {SLIT_U.map((u, i) => {
                  const t0 = i * dt
                  const yb = cy + ((SLIT_S[i] * ln.gap) / 2) * 0.8
                  const ys = yb + u * ln.spread
                  const t1 = t0 + (bx - sx) / v
                  const t2 = t1 + (scr - bx) / v
                  if (t < t0) return null
                  if (t >= t2) return <circle key={i} cx={scr + 4 + (i % 5) * 3} cy={ys} r={2.2} fill="var(--fig-accent)" />
                  if (t < t1) {
                    const a = (t - t0) / (t1 - t0)
                    return <circle key={i} cx={sx + (bx - sx) * a} cy={cy + (yb - cy) * a} r={3} fill="var(--fig-line)" />
                  }
                  const b = (t - t1) / (t2 - t1)
                  return <circle key={i} cx={bx + (scr - bx) * b} cy={yb + (ys - yb) * b} r={3} fill="var(--fig-line)" />
                })}
              </g>
            )
          })}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図24-7 波と粒の2つの見え方（切り替え） ---------- */

export function FigTwoViews() {
  const [mode, setMode] = useState<'none' | 'check'>('none')
  const check = mode === 'check'
  const cy = 140
  const s1 = 112
  const s2 = 168
  const bx = 230
  const scr = 450
  const I = (y: number) => {
    if (check) return 0.55 * (Math.exp(-(((y - s1 + 6) / 62) ** 2)) + Math.exp(-(((y - s2 - 6) / 62) ** 2)))
    return Math.exp(-(((y - cy) / 85) ** 2)) * Math.cos((Math.PI * (y - cy)) / 26) ** 2
  }
  let curve = ''
  const stripes: { y: number; v: number }[] = []
  for (let y = 22; y <= 258; y += 2) {
    curve += `${y === 22 ? 'M' : 'L'}${(scr + 26 + 100 * I(y)).toFixed(1)},${y}`
    stripes.push({ y, v: I(y) })
  }
  return (
    <Figure
      n="24-7"
      title="通ったすき間を調べなければ縞ができ、調べると縞が消える"
      controls={
        <Choice
          label="どちらのすき間を通ったかを"
          options={[
            { value: 'none', label: '調べない' },
            { value: 'check', label: '調べる' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="模式図です。中央の画面の濃い所ほど電子が多く当たり、右の線はその数の分布です。「調べない」では2つのすき間を通った波が重なって縞ができます（波としての見え方）。「調べる」では電子はどちらか一方を通ったことになり、縞は消えます（粒としての見え方）。"
    >
      <Svg id="24-7" w={730} h={290} label={check ? 'すき間の後ろに、電子がどちらを通ったかを記録する装置を置くと、画面の縞は消え、なだらかな分布になる。' : '2つのすき間を通った電子の波が重なり、画面に明るい所と暗い所の縞ができる。'}>
        <Ball x={40} y={cy} r={6} />
        <T x={40} y={cy + 24} anchor="middle" fs={12}>
          電子
        </T>
        <rect x={bx - 4} y={20} width={8} height={s1 - 6 - 20} fill="var(--fig-line)" />
        <rect x={bx - 4} y={s1 + 6} width={8} height={s2 - s1 - 12} fill="var(--fig-line)" />
        <rect x={bx - 4} y={s2 + 6} width={8} height={260 - s2 - 6} fill="var(--fig-line)" />
        {!check &&
          [s1, s2].map((sy) =>
            [30, 55, 80, 105, 130].map((r) => <path key={`${sy}-${r}`} d={arc(bx, sy, r, -0.6, 0.6)} fill="none" stroke="var(--fig-accent)" strokeWidth={1.5} opacity={0.75} />),
          )}
        {check && (
          <>
            <Box x={bx + 14} y={s1 - 12} w={60} h={24} lines="記録" fs={12} fill="box2" />
            <Box x={bx + 14} y={s2 - 12} w={60} h={24} lines="記録" fs={12} fill="box2" />
          </>
        )}
        {stripes.map((s) => (
          <rect key={s.y} x={scr - 10} y={s.y - 1} width={20} height={2} fill="var(--fig-accent)" opacity={Math.min(1, s.v)} />
        ))}
        <line x1={scr - 10} y1={20} x2={scr - 10} y2={260} stroke="var(--fig-line)" />
        <path d={curve} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
        <T x={scr} y={12} anchor="middle" fs={12} tone="muted">
          画面
        </T>
        <T x={600} y={120} fs={13} bold tone="acc">
          {check ? '縞が消える' : '縞ができる'}
        </T>
        <T x={600} y={142} fs={12}>
          {check ? '（粒としての見え方）' : '（波としての見え方）'}
        </T>
        <T x={bx} y={280} anchor="middle" fs={12} tone="muted">
          {check ? 'どちらか一方を通ったことが記録される' : '2つのすき間を通った波が重なる'}
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図24-8 外村らの実験の装置 ---------- */

export function FigBiprism() {
  return (
    <Figure
      n="24-8"
      title="外村らの実験では細い糸の両側を通った電子の波を重ね、1個ずつ数えた"
      caption="模式図です。大きさの比は実際と違います。実際の装置は、電子が上から下へ進む縦長の電子顕微鏡です。糸にはプラスの電圧がかかっていて、両側を通った電子の波を内側へ曲げて重ねます。"
    >
      <Svg id="24-8" w={740} h={260} label="左の電子源から出た電子が、電子線バイプリズムの細い糸の両側を通って内側へ曲がり、重なる。重なった所の模様を拡大レンズで大きくし、検出器で電子を1個ずつ記録して画面に映す。">
        <Box x={20} y={95} w={120} h={56} lines={['電子源', '5万ボルトで加速']} fs={12.5} bold subTone="muted" />
        <T x={300} y={36} anchor="middle" fs={12.5} bold>
          電子線バイプリズム
        </T>
        <line x1={262} y1={60} x2={338} y2={60} stroke="var(--fig-line)" strokeWidth={4} />
        <line x1={262} y1={186} x2={338} y2={186} stroke="var(--fig-line)" strokeWidth={4} />
        <circle cx={300} cy={123} r={4} fill="var(--fig-accent)" />
        <T x={300} y={206} anchor="middle" fs={12} tone="muted">
          中央に細い糸、両側に板
        </T>
        <Arrow d="M140,121 L296,104 L470,128" plain />
        <Arrow d="M140,125 L296,142 L470,118" plain />
        <T x={400} y={166} anchor="middle" fs={12} tone="acc">
          重なって縞ができる
        </T>
        <ellipse cx={500} cy={123} rx={9} ry={40} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <T x={500} y={180} anchor="middle" fs={12}>
          拡大レンズ
        </T>
        <Arrow x1={512} y1={123} x2={556} y2={123} />
        <Box x={560} y={93} w={92} h={60} lines={['検出器', '1個ずつ記録']} fs={12.5} bold subTone="muted" />
        <Arrow x1={652} y1={123} x2={672} y2={123} />
        <Box x={676} y={100} w={54} h={46} lines="画面" fs={12.5} />
        <T x={20} y={228} fs={12}>
          糸の太さは1000分の1mm以下。電子源から検出器までは約1.5m。
        </T>
        <T x={20} y={248} fs={12}>
          電子は1秒に約1000個で、装置の中にはほとんどいつも1個しかない。
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図24-9 電子が1個ずつ当たり、縞が浮かび上がる（動） ---------- */

const BUILD_N = 500
const BUILD = (() => {
  const xs = sample(1989, BUILD_N, (u) => Math.cos((Math.PI * u * 200) / 40) ** 2 * Math.exp(-(((u * 200) / 150) ** 2)))
  const r = rng(4242)
  return xs.map((u) => ({ x: 240 + u * 200, y: 34 + r() * 148 }))
})()
/** 棒グラフの区切り。棒の中心を縞の明るい所と暗い所に合わせる（幅 20、縞の間隔 40） */
const BINS = 21
const BIN_W = 20

export function FigBuildup() {
  const sx = 40
  const sw = 400
  const hb = 272
  const pdf = (x: number) => Math.cos((Math.PI * (x - 240)) / 40) ** 2 * Math.exp(-(((x - 240) / 150) ** 2))
  let total = 0
  for (let x = sx; x < sx + sw; x += 1) total += pdf(x)
  // 明るい所の中心の棒に入る数の見込み（棒の中の平均は最大の約0.82倍）に、ゆらぎの分の余裕を持たせる
  const expect = (BUILD_N * BIN_W * 0.82) / total
  const scale = 62 / (expect * 1.25)
  let curve = ''
  for (let x = sx; x <= sx + sw; x += 2) curve += `${x === sx ? 'M' : 'L'}${x},${(hb - expect * pdf(x) * scale).toFixed(1)}`
  return (
    <Anim
      n="24-9"
      title="電子が1個ずつ当たり、たくさん集まると縞模様が浮かび上がる"
      still={15}
      period={17}
      caption="外村らの実験をもとにした模式図です。実験では約7万個の電子で縞がはっきり見えましたが、ここでは点を500個に減らしています。下の棒は画面の場所ごとに数えた電子の数、点線は波から計算した確率の形です。"
    >
      {(t) => {
        const n = Math.min(BUILD_N, Math.floor(BUILD_N * Math.min(1, t / 14) ** 2))
        const counts = Array<number>(BINS).fill(0)
        for (let i = 0; i < n; i++) counts[Math.min(BINS - 1, Math.round((BUILD[i].x - sx) / BIN_W))]++
        const stage = n < 40 ? 'ばらばらに当たっているように見える' : n < 250 ? '縞がうっすら見え始める' : '縞がはっきり見える'
        return (
          <Svg id="24-9" w={720} h={290} label="検出器の画面に電子が1個ずつ点として当たる。はじめはばらばらに見えるが、数が増えると縦の縞模様が現れる。下のグラフでは、場所ごとの数が、波から計算した確率の形に近づいていく。">
            <T x={sx} y={16} fs={12} tone="muted">
              検出器の画面
            </T>
            <rect x={sx} y={28} width={sw} height={160} fill="var(--fig-box)" stroke="var(--fig-line)" />
            {BUILD.slice(0, n).map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={1.8} fill="var(--fig-accent)" />
            ))}
            {counts.map((c, i) => {
              if (c === 0) return null
              const x0 = Math.max(sx, sx + i * BIN_W - BIN_W / 2 + 2)
              const x1 = Math.min(sx + sw, sx + i * BIN_W + BIN_W / 2 - 2)
              return <rect key={i} x={x0} y={hb - c * scale} width={x1 - x0} height={c * scale} fill="var(--fig-box3)" stroke="var(--fig-accent)" />
            })}
            <line x1={sx} y1={hb} x2={sx + sw} y2={hb} stroke="var(--fig-line)" />
            <path d={curve} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />
            <T x={470} y={44} fs={12.5}>
              電子の数（図の点）
            </T>
            <T x={470} y={70} fs={18} bold tone="acc">
              {`${n}個`}
            </T>
            <T x={470} y={98} fs={12.5}>
              {stage}
            </T>
            <T x={470} y={140} fs={12} tone="muted">
              1個ずつ：どこに当たるかは予言できない
            </T>
            <T x={470} y={160} fs={12} tone="muted">
              たくさん：波から計算した確率のとおり
            </T>
            <T x={470} y={226} fs={12} tone="muted">
              棒：場所ごとに数えた数
            </T>
            <T x={470} y={246} fs={12} tone="muted">
              点線：波から計算した確率の形
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図24-10 第5回ソルベー会議での考え ---------- */

const SOLVAY = [
  { who: 'ド・ブロイ（報告）', idea: '波が粒子の動きを導く。粒子はいつも決まった道筋を進む', cph: false },
  { who: 'ボルンとハイゼンベルク（報告）', idea: '波は確率を表す。量子力学は完結した理論である', cph: true },
  { who: 'シュレーディンガー（報告）', idea: '波そのものが実在する', cph: false },
  { who: 'ボーア（一般討論）', idea: '相補性。波と粒子の両方の見方が必要', cph: true },
  { who: 'アインシュタイン（一般討論）', idea: '小さな穴を通る電子の例を挙げ、確率の解釈に疑問を述べた', cph: false },
]

export function FigSolvay() {
  return (
    <Figure
      n="24-10"
      title="第5回ソルベー会議では、電子の波について違う考えが並んだ"
      caption="それぞれの立場を短くまとめたものです。青い枠はのちにコペンハーゲン解釈と呼ばれる考えです。ボーアは報告をせず、一般討論で発言しました。アインシュタインの疑問は第25章で扱います。"
    >
      <Svg id="24-10" w={720} h={300} label="表。ド・ブロイは波が粒子の動きを導くと報告した。ボルンとハイゼンベルクは波は確率を表し量子力学は完結した理論だと報告した。シュレーディンガーは波そのものが実在すると報告した。ボーアは一般討論で相補性を述べ、アインシュタインは小さな穴を通る電子の例を挙げて確率の解釈に疑問を述べた。">
        <T x={125} y={20} anchor="middle" fs={12.5} bold>
          報告・発言した人
        </T>
        <T x={477} y={20} anchor="middle" fs={12.5} bold>
          電子の波についての考え
        </T>
        {SOLVAY.map((r, i) => {
          const y = 36 + i * 52
          return (
            <g key={r.who}>
              <Box x={20} y={y} w={210} h={44} lines={r.who} fs={12.5} fill={r.cph ? 'box3' : 'box'} accent={r.cph} />
              <Box x={244} y={y} w={466} h={44} lines={r.idea} fs={12.5} fill={r.cph ? 'box3' : 'box'} accent={r.cph} />
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}
