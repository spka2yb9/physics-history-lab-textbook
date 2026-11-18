import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { Ball, Vel, clamp01 } from './common'

/*
 * 第20章の図。光（光の筋・光のかたまり・電波）は第16章・第17章と同じく黄色で描き、必ず文字を添える。
 */

type Pt = [number, number]

/** 光のかたまりの色 */
const GLOW = '#f2c94c'
/** 光の道筋の線の色（白い背景でも見えるように少し濃くした黄色） */
const BEAM = '#d99a00'

/** 折れ線の長さ */
const lengthOf = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)

/** 折れ線の上で、始点から距離 s の位置 */
function along(pts: Pt[], s: number): Pt {
  let rest = Math.max(0, s)
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const len = Math.hypot(x1 - x0, y1 - y0)
    if (rest <= len) return [x0 + ((x1 - x0) * rest) / len, y0 + ((y1 - y0) * rest) / len]
    rest -= len
  }
  return pts[pts.length - 1]
}

const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/** 光の小さなかたまり */
function Pulse({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={5.5} fill={GLOW} stroke={BEAM} strokeWidth={1.5} />
}

/** 光の道筋（黄色の線） */
function Beam({ pts, w = 2.5, opacity = 1 }: { pts: Pt[]; w?: number; opacity?: number }) {
  return <path d={poly(pts)} fill="none" stroke={BEAM} strokeWidth={w} opacity={opacity} strokeLinejoin="round" />
}

/** 太陽（塗った丸と文字） */
function Sun({ x, y, r, label = true }: { x: number; y: number; r: number; label?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={GLOW} opacity={0.55} stroke={BEAM} strokeWidth={1.5} />
      {label && (
        <T x={x} y={y} anchor="middle" fs={12}>
          太陽
        </T>
      )}
    </g>
  )
}

/** 星の印（四方に光る小さな星） */
function Star({ x, y, filled = true }: { x: number; y: number; filled?: boolean }) {
  const d = `M${x},${y - 8} L${x + 2.4},${y - 2.4} L${x + 8},${y} L${x + 2.4},${y + 2.4} L${x},${y + 8} L${x - 2.4},${y + 2.4} L${x - 8},${y} L${x - 2.4},${y - 2.4} Z`
  return <path d={d} fill={filled ? GLOW : 'var(--fig-bg)'} stroke={filled ? BEAM : 'var(--fig-line)'} strokeWidth={1.3} strokeDasharray={filled ? undefined : '2 1.5'} />
}

/* ---------- 図20-1 アインシュタインが挙げた3つの確かめ方 ---------- */

/** 縦に進みながら、上へ行くほど波長が長くなる波 */
function stretchWave(x: number, yBottom: number, yTop: number, amp: number, wl0: number, wl1: number): string {
  let d = ''
  let phase = 0
  const n = 160
  for (let i = 0; i <= n; i++) {
    const y = yBottom - ((yBottom - yTop) * i) / n
    const wl = wl0 + ((wl1 - wl0) * i) / n
    if (i) phase += ((2 * Math.PI) / wl) * ((yBottom - yTop) / n)
    d += `${i ? 'L' : 'M'}${(x + amp * Math.sin(phase)).toFixed(1)},${y.toFixed(1)}`
  }
  return d
}

export function FigThreeTests() {
  const ell = (cx: number, cy: number, deg: number, faint: boolean) => {
    // 太陽を焦点に置いた楕円（a=60, b=42）
    const a = 60
    const b = 42
    const c = Math.sqrt(a * a - b * b)
    const r = (deg * Math.PI) / 180
    return (
      <ellipse
        key={deg}
        cx={cx + c * Math.cos(r)}
        cy={cy + c * Math.sin(r)}
        rx={a}
        ry={b}
        transform={`rotate(${deg} ${cx + c * Math.cos(r)} ${cy + c * Math.sin(r)})`}
        fill="none"
        stroke={faint ? 'var(--fig-muted)' : 'var(--fig-line)'}
        strokeDasharray={faint ? '3 4' : undefined}
        strokeWidth={1.5}
      />
    )
  }
  return (
    <Figure
      n="20-1"
      title="アインシュタインが挙げた3つの確かめ方と、確かめられた年"
      caption="模式図です。左の軌道の向きの回り方、中の光の曲がり、右の波長の伸びは、どれも実際よりはるかに大きく描いています。"
    >
      <Svg id="20-1" w={720} h={280} label="左：水星の楕円軌道の向きが少しずつ回る現象。1915年、前から知られていた観測を説明した。中：太陽の近くを通る星の光が曲がる。1919年の日食で観測された。右：下で出た光が上に届くと波長が長くなる。1960年に塔の上と下で測られた。">
        {/* 左 */}
        <T x={120} y={20} anchor="middle" bold>
          水星の近日点移動
        </T>
        {ell(70, 112, -10, true)}
        {ell(70, 112, 8, true)}
        {ell(70, 112, 26, false)}
        <Sun x={70} y={112} r={11} label={false} />
        <T x={120} y={186} anchor="middle" fs={12} tone="muted">
          軌道の向きが少しずつ回る
        </T>
        <Box x={25} y={208} w={190} h={52} lines={['1915年', '前から知られていた観測を説明']} fs={12.5} bold fill="box4" />

        {/* 中 */}
        <T x={360} y={20} anchor="middle" bold>
          太陽の近くでの光の曲がり
        </T>
        <Ball x={268} y={140} r={10} fill="var(--fig-box3)" />
        <T x={268} y={166} anchor="middle" fs={12}>
          地球
        </T>
        <Sun x={372} y={140} r={22} />
        <Beam pts={[[455, 100], [372, 106], [279, 136]]} />
        <Star x={455} y={100} />
        <T x={455} y={78} anchor="middle" fs={12}>
          星
        </T>
        <T x={360} y={186} anchor="middle" fs={12} tone="muted">
          星の光が太陽に引かれて曲がる
        </T>
        <Box x={265} y={208} w={190} h={52} lines={['1919年', '日食のときの観測']} fs={12.5} bold fill="box4" />

        {/* 右 */}
        <T x={600} y={20} anchor="middle" bold>
          重力による光の波長の変化
        </T>
        <rect x={505} y={160} width={190} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <path d={stretchWave(560, 156, 46, 7, 9, 26)} fill="none" stroke={BEAM} strokeWidth={2} />
        <T x={584} y={140} fs={12}>
          下で出た光
        </T>
        <T x={584} y={56} fs={12}>
          上では波長が長い
        </T>
        <T x={600} y={186} anchor="middle" fs={12} tone="muted">
          地面（重力の強い側）
        </T>
        <Box x={505} y={208} w={190} h={52} lines={['1960年', '塔の上と下で測定']} fs={12.5} bold fill="box4" />
      </Svg>
    </Figure>
  )
}

/* ---------- 図20-2 太陽の近くで曲がる星の光（動） ---------- */

const B_STAR: Pt = [680, 116]
const B_NEAR: Pt = [372, 120]
const B_EARTH: Pt = [70, 168]
/** 地球から見た光の向きを延長した先（見かけの星の位置） */
const B_SEEN: Pt = (() => {
  const k = (B_STAR[0] - B_EARTH[0]) / (B_NEAR[0] - B_EARTH[0])
  return [B_EARTH[0] + (B_NEAR[0] - B_EARTH[0]) * k, B_EARTH[1] + (B_NEAR[1] - B_EARTH[1]) * k]
})()

export function FigBend() {
  const path: Pt[] = [B_STAR, B_NEAR, B_EARTH]
  const L = lengthOf(path)
  const v = 220
  const arrive = L / v
  return (
    <Anim
      n="20-2"
      title="太陽の近くを通る星の光は曲がり、星は太陽から離れた位置に見える"
      still={arrive + 1.6}
      period={arrive + 2.6}
      caption="模式図です。曲がりの角度は実際よりはるかに大きく描いています。地球の人は届いた光の向きをまっすぐ延長した方向（点線の先）に星を見ます。そのため星は本当の方向より太陽から離れた所に見えます。"
    >
      {(t) => {
        const p = along(path, t * v)
        const seen = clamp01((t - arrive) / 0.8)
        const tip: Pt = [B_NEAR[0] + (B_SEEN[0] - B_NEAR[0]) * seen, B_NEAR[1] + (B_SEEN[1] - B_NEAR[1]) * seen]
        return (
          <Svg id="20-2" w={720} h={270} label="右の星から出た光が、太陽のすぐ上を通るときに太陽の側へ曲がり、左の地球に届く。地球から光の向きを延長すると、星は本当の位置より上、つまり太陽から離れた位置に見える。">
            <Sun x={372} y={172} r={40} />
            <Ball x={B_EARTH[0]} y={B_EARTH[1]} r={13} fill="var(--fig-box3)" />
            <T x={B_EARTH[0]} y={B_EARTH[1] + 30} anchor="middle" fs={12}>
              地球
            </T>
            <circle cx={170} cy={176} r={9} fill="var(--fig-line)" />
            <T x={170} y={204} anchor="middle" fs={12} tone="muted">
              月（太陽を隠す）
            </T>
            <Beam pts={path} w={2} opacity={0.45} />
            {seen > 0 && <line x1={B_NEAR[0]} y1={B_NEAR[1]} x2={tip[0]} y2={tip[1]} stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="5 4" />}
            <Star x={B_STAR[0]} y={B_STAR[1]} filled={false} />
            <T x={B_STAR[0] + 14} y={B_STAR[1] + 22} anchor="end" fs={12}>
              星の本当の方向
            </T>
            {seen >= 1 && (
              <>
                <Star x={B_SEEN[0]} y={B_SEEN[1]} />
                <T x={B_SEEN[0] + 14} y={B_SEEN[1] - 20} anchor="end" fs={12} tone="acc">
                  地球から見た星の位置
                </T>
              </>
            )}
            {t < arrive && <Pulse x={p[0]} y={p[1]} />}
            <line x1={430} y1={236} x2={466} y2={236} stroke={BEAM} strokeWidth={2.5} />
            <T x={474} y={236} fs={12}>
              星の光の道筋
            </T>
            <line x1={430} y1={258} x2={466} y2={258} stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="5 4" />
            <T x={474} y={258} fs={12}>
              届いた光の向きを延長した線
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図20-3 写真の上での星のずれ方 ---------- */

const SKY = { x: 190, y: 168, sun: 34 }
/** 星の位置（太陽の中心からの距離、角度） */
const SKY_STARS: [number, number][] = [
  [60, -150],
  [110, -95],
  [75, -40],
  [100, 15],
  [55, 70],
  [112, 125],
  [86, 180],
  [96, 235],
]
/** 月に隠された太陽の色（明るい画面でも暗い画面でも暗い円に見せる固定色） */
const ECLIPSED = '#33363d'

export function FigSkyShift() {
  const k = 1000 // ずれの大きさ（図の中で大きく拡大した値）
  const gx = (r: number) => 430 + (r - 1) * 62
  const gy = (d: number) => 230 - d * 90
  const curve = Array.from({ length: 41 }, (_, i) => 1 + i * 0.1).map((r) => [gx(r), gy(1.75 / r)] as Pt)
  return (
    <Figure
      n="20-3"
      title="日食の写真では、どの星も太陽から外向きにずれ、太陽に近い星ほど大きくずれる"
      caption="左は模式図で、ずれは実際よりはるかに大きく描いています。右のグラフは一般相対性理論の予言で、太陽の中心からの距離が2倍になると、ずれは半分になります。"
    >
      <Svg id="20-3" w={720} h={330} label="左：月に隠された太陽のまわりの星。白抜きの丸は夜に撮った写真での位置、塗った丸は日食のときの位置で、どれも太陽から外向きにずれ、太陽に近いほどずれが大きい。右：太陽の縁で1.75秒角、半径の2倍の所で約0.87秒角と、距離が離れるほど小さくなるずれのグラフ。">
        <circle cx={SKY.x} cy={SKY.y} r={SKY.sun + 6} fill="none" stroke={GLOW} strokeWidth={6} opacity={0.6} />
        <circle cx={SKY.x} cy={SKY.y} r={SKY.sun} fill={ECLIPSED} />
        {SKY_STARS.map(([r, deg]) => {
          const a = (deg * Math.PI) / 180
          const d = k / r
          const x0 = SKY.x + r * Math.cos(a)
          const y0 = SKY.y + r * Math.sin(a)
          const x1 = SKY.x + (r + d) * Math.cos(a)
          const y1 = SKY.y + (r + d) * Math.sin(a)
          return (
            <g key={deg}>
              <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="var(--fig-muted)" strokeWidth={1.2} />
              <circle cx={x0} cy={y0} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.3} />
              <circle cx={x1} cy={y1} r={4} fill={BEAM} stroke={BEAM} />
            </g>
          )
        })}
        <T x={SKY.x} y={20} anchor="middle" fs={12} tone="muted">
          中央の黒い円は月に隠された太陽
        </T>
        <circle cx={436} cy={298} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.3} />
        <T x={446} y={298} fs={12}>
          夜の写真での位置
        </T>
        <circle cx={436} cy={318} r={4} fill={BEAM} stroke={BEAM} />
        <T x={446} y={318} fs={12}>
          日食のときの位置
        </T>

        {/* 右：ずれと距離のグラフ */}
        <line x1={gx(1)} y1={gy(0)} x2={gx(5) + 10} y2={gy(0)} stroke="var(--fig-line)" />
        <line x1={gx(1)} y1={gy(0)} x2={gx(1)} y2={gy(2.05)} stroke="var(--fig-line)" />
        {[1, 2, 3, 4, 5].map((r) => (
          <g key={r}>
            <line x1={gx(r)} y1={gy(0)} x2={gx(r)} y2={gy(0) + 5} stroke="var(--fig-line)" />
            <T x={gx(r)} y={gy(0) + 16} anchor="middle" fs={11.5}>
              {`${r}倍`}
            </T>
          </g>
        ))}
        <T x={gx(3)} y={gy(0) + 38} anchor="middle" fs={12}>
          太陽の中心からの距離（太陽の半径の何倍か）
        </T>
        <T x={gx(1) - 8} y={gy(2.05)} anchor="end" fs={12}>
          ずれ
        </T>
        <path d={poly(curve)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
        <circle cx={gx(1)} cy={gy(1.75)} r={4.5} fill="var(--fig-accent)" />
        <T x={gx(1) + 12} y={gy(1.75) - 4} fs={12}>
          太陽の縁で1.75秒角
        </T>
        <circle cx={gx(2)} cy={gy(0.875)} r={4.5} fill="var(--fig-accent)" />
        <T x={gx(2) + 12} y={gy(0.875) - 14} fs={12}>
          半径の2倍の所で約0.87秒角
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図20-4 1919年の測定値と2つの理論の値 ---------- */

type Row = { name: string; v: number; e?: number; note?: string; faint?: boolean }

const RESULTS: Record<'1919' | '1979', Row[]> = {
  '1919': [
    { name: 'ソブラル（10cm望遠鏡）', v: 1.98, e: 0.18 },
    { name: 'プリンシペ島', v: 1.61, e: 0.45 },
    { name: 'ソブラル（写真用望遠鏡）', v: 0.93, note: '（採られなかった値）', faint: true },
  ],
  '1979': [
    { name: 'ソブラル（10cm望遠鏡）', v: 1.9, e: 0.11 },
    { name: 'プリンシペ島', v: 1.61, e: 0.45, note: '（1919年の値。測り直しなし）', faint: true },
    { name: 'ソブラル（写真用望遠鏡）', v: 1.55, e: 0.34 },
  ],
}

export function FigResults() {
  const [mode, setMode] = useState<'1919' | '1979'>('1919')
  const x = (v: number) => 230 + v * 184
  const rows = RESULTS[mode]
  return (
    <Figure
      n="20-4"
      title="1919年の測定値は、ニュートンの理論の値より一般相対性理論の値に近かった"
      controls={
        <Choice
          label="表示する値"
          options={[
            { value: '1919', label: '1919年の報告' },
            { value: '1979', label: '1979年の測り直し' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="丸は測った値、横の線は誤差の目安（標準偏差）です。採られなかった値には誤差が示されていません。「1979年の測り直し」に切り替えると、王立グリニッジ天文台がソブラルの写真を測り直した値が出ます。採られなかった写真用望遠鏡の値も、ニュートンの理論の値より大きくなりました。"
    >
      <Svg id="20-4" w={720} h={290} label="太陽の縁での光の曲がりの測定値。1919年の報告では、ソブラルの10cm望遠鏡が1.98秒角、プリンシペ島が1.61秒角、採られなかったソブラルの写真用望遠鏡が0.93秒角。1979年の測り直しでは、10cm望遠鏡が1.90秒角、写真用望遠鏡が1.55秒角。ニュートンの理論の値は約0.87秒角、一般相対性理論の値は1.75秒角。">
        <line x1={x(0.875)} y1={56} x2={x(0.875)} y2={222} stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="6 4" />
        <line x1={x(1.75)} y1={56} x2={x(1.75)} y2={222} stroke="var(--fig-accent)" strokeWidth={2} />
        <T x={x(0.875)} y={22} anchor="middle" fs={12}>
          ニュートンの理論の値
        </T>
        <T x={x(0.875)} y={40} anchor="middle" fs={12} tone="muted">
          約0.87秒角
        </T>
        <T x={x(1.75)} y={22} anchor="middle" fs={12} tone="acc">
          一般相対性理論の値
        </T>
        <T x={x(1.75)} y={40} anchor="middle" fs={12} tone="acc">
          1.75秒角
        </T>
        {rows.map((r, i) => {
          const y = 82 + i * 52
          const col = r.faint ? 'var(--fig-muted)' : 'var(--fig-line)'
          return (
            <g key={r.name}>
              <T x={10} y={y} fs={12.5}>
                {r.name}
              </T>
              {r.e != null && (
                <g stroke={col} strokeWidth={1.8} strokeDasharray={r.faint ? '3 3' : undefined}>
                  <line x1={x(r.v - r.e)} y1={y} x2={x(r.v + r.e)} y2={y} />
                  <line x1={x(r.v - r.e)} y1={y - 6} x2={x(r.v - r.e)} y2={y + 6} />
                  <line x1={x(r.v + r.e)} y1={y - 6} x2={x(r.v + r.e)} y2={y + 6} />
                </g>
              )}
              <circle cx={x(r.v)} cy={y} r={6} fill={r.faint ? 'var(--fig-bg)' : 'var(--fig-line)'} stroke={col} strokeWidth={1.5} />
              {Math.abs(x(r.v) - x(0.875)) < 45 ? (
                <T x={x(r.v) + 12} y={y} fs={12} tone={r.faint ? 'muted' : undefined}>
                  {`${r.v.toFixed(2)}秒角`}
                </T>
              ) : (
                <T x={x(r.v)} y={y - 16} anchor="middle" fs={12} tone={r.faint ? 'muted' : undefined}>
                  {`${r.v.toFixed(2)}秒角`}
                </T>
              )}
              {r.note && (
                <T x={10} y={y + 19} fs={11.5} tone="muted">
                  {r.note}
                </T>
              )}
            </g>
          )
        })}
        <line x1={x(0)} y1={236} x2={x(2.5)} y2={236} stroke="var(--fig-line)" />
        {[0, 0.5, 1, 1.5, 2, 2.5].map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={236} x2={x(v)} y2={242} stroke="var(--fig-line)" />
            <T x={x(v)} y={254} anchor="middle" fs={11.5}>
              {String(v)}
            </T>
          </g>
        ))}
        <T x={x(1.25)} y={276} anchor="middle" fs={12}>
          太陽の縁での光の曲がり（秒角）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図20-5 パウンドとレブカの塔の実験（動） ---------- */

export function FigTower() {
  const top = 78
  const bottom = 258
  const travel = 2.6
  return (
    <Anim
      n="20-5"
      title="塔の上から落ちてきたγ線は、振動数がわずかに大きくなる"
      still={1.4}
      period={travel + 0.8}
      caption="模式図です。波長の変化は実際（約1000兆分の2.5）よりはるかに大きく描いています。実験では上と下の装置を何度も入れ替えて、上向きに進むγ線も測りました。上向きでは振動数が小さく（波長が長く）なります。"
    >
      {(t) => {
        const u = clamp01(t / travel)
        const yc = top + (bottom - top) * u
        const wl = 22 - 10 * u
        const seg = 64
        let d = ''
        for (let i = 0; i <= 40; i++) {
          const y = yc - seg / 2 + (seg * i) / 40
          d += `${i ? 'L' : 'M'}${(290 + 9 * Math.sin((2 * Math.PI * (y - yc)) / wl)).toFixed(1)},${y.toFixed(1)}`
        }
        const bob = 3 * Math.sin(t * 2 * Math.PI * 1.5)
        return (
          <Svg id="20-5" w={720} h={320} label="高さ約22.5mの塔の上に、γ線を出す鉄を置き、下に吸い込む鉄と検出器を置く。上から落ちてきたγ線は、下に着くまでに振動数がわずかに大きくなり、波長が短くなる。">
            <rect x={250} y={30} width={80} height={262} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={268} y={44 + bob} width={44} height={18} rx={3} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={268} y={266} width={44} height={18} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            {u < 1 && <path d={d} fill="none" stroke={BEAM} strokeWidth={2.2} />}
            <Arrow x1={215} y1={56} x2={215} y2={272} both />
            <T x={204} y={150} anchor="end" fs={12.5}>
              高さの差
            </T>
            <T x={204} y={170} anchor="end" fs={12.5}>
              約22.5m
            </T>
            <T x={350} y={46} fs={12.5}>
              上：γ線を出す鉄
            </T>
            <T x={350} y={66} fs={12} tone="muted">
              （上下に少し動かして振動数をずらす）
            </T>
            <T x={350} y={266} fs={12.5}>
              下：γ線を吸い込む鉄と検出器
            </T>
            <T x={350} y={286} fs={12} tone="muted">
              （吸い込まれた量を数える）
            </T>
            <T x={350} y={140} fs={12.5}>
              落ちてくる間に、振動数が大きくなり
            </T>
            <T x={350} y={160} fs={12.5}>
              波長が短くなる
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図20-6 東回りと西回りの飛行機（動） ---------- */

const EARTH = { x: 165, y: 172, r: 92 }

/** 地球のまわりを回る印。ang は画面上の角度（ラジアン）、rr は中心からの距離 */
function Rider({ ang, rr, speed, label, square }: { ang: number; rr: number; speed: number; label: string; square?: boolean }) {
  const x = EARTH.x + rr * Math.cos(ang)
  const y = EARTH.y + rr * Math.sin(ang)
  // 北極の上から見て反時計回り（画面上で角度が減る向き）の接線
  const tx = Math.sin(ang)
  const ty = -Math.cos(ang)
  return (
    <g>
      <Vel x1={x + tx * 13} y1={y + ty * 13} x2={x + tx * (13 + speed)} y2={y + ty * (13 + speed)} />
      {square ? <rect x={x - 10} y={y - 10} width={20} height={20} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeWidth={1.5} /> : <Ball x={x} y={y} r={11} fill="var(--fig-box2)" />}
      <T x={x} y={y} anchor="middle" fs={11.5}>
        {label}
      </T>
    </g>
  )
}

export function FigFlights() {
  const w = (2 * Math.PI) / 14 // 地球の自転（図の中で14秒に1回転）
  const plane = 0.7 * w // 飛行機が地面に対して回る速さ（目安）
  const start = -Math.PI / 2
  return (
    <Anim
      n="20-6"
      title="地球の中心から見ると、東回りの飛行機は地上より速く、西回りの飛行機は地上より遅く動く"
      still={1.2}
      period={28}
      caption="北極の上から見た模式図です。黒の矢印は地球の中心から見た速さと向きです（長さの比は目安）。地球は西から東へ、図では反時計回りに自転しています。地上の時計を基準にすると、東回りの時計は速く動くので遅れ、西回りの時計はゆっくり動くので遅れが小さくなります。"
    >
      {(t) => (
        <Svg id="20-6" w={720} h={345} label="北極の上から見た地球。地上の時計は自転とともに東へ動く。東回りの飛行機は自転の速さに飛行機の速さが加わって速く動き、西回りの飛行機は自転と逆向きに飛ぶので、地球の中心から見るとゆっくり動く。">
          <circle cx={EARTH.x} cy={EARTH.y} r={EARTH.r + 23} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
          <circle cx={EARTH.x} cy={EARTH.y} r={EARTH.r + 46} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
          <circle cx={EARTH.x} cy={EARTH.y} r={EARTH.r} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
          <circle cx={EARTH.x} cy={EARTH.y} r={3} fill="var(--fig-line)" />
          <T x={EARTH.x} y={EARTH.y + 18} anchor="middle" fs={12}>
            北極
          </T>
          <Arrow d={`M${EARTH.x - 50},${EARTH.y + 30} A58,58 0 0,0 ${EARTH.x + 50},${EARTH.y + 30}`} />
          <T x={EARTH.x} y={EARTH.y + 70} anchor="middle" fs={12} tone="muted">
            自転の向き
          </T>
          <Rider ang={start - w * t} rr={EARTH.r} speed={34} label="地" square />
          <Rider ang={start - (w + plane) * t + 0.9} rr={EARTH.r + 23} speed={58} label="東" />
          <Rider ang={start - (w - plane) * t - 0.9} rr={EARTH.r + 46} speed={11} label="西" />

          <T x={360} y={30} bold>
            地球の中心から見た速さ
          </T>
          <Ball x={372} y={74} r={11} fill="var(--fig-box2)" />
          <T x={372} y={74} anchor="middle" fs={11.5}>
            東
          </T>
          <T x={394} y={66} fs={12.5}>
            東回りの飛行機：自転の速さに飛行機の速さが加わる
          </T>
          <T x={394} y={86} fs={12.5} tone="acc">
            → 地上より速く動くので、時計が遅れる
          </T>
          <rect x={362} y={124} width={20} height={20} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeWidth={1.5} />
          <T x={372} y={134} anchor="middle" fs={11.5}>
            地
          </T>
          <T x={394} y={126} fs={12.5}>
            地上の時計（ワシントンの天文台）
          </T>
          <T x={394} y={146} fs={12.5}>
            ：自転とともに東へ動く
          </T>
          <Ball x={372} y={194} r={11} fill="var(--fig-box2)" />
          <T x={372} y={194} anchor="middle" fs={11.5}>
            西
          </T>
          <T x={394} y={186} fs={12.5}>
            西回りの飛行機：自転と逆向きに飛ぶ
          </T>
          <T x={394} y={206} fs={12.5} tone="acc">
            → 地上よりゆっくり動くので、時計の遅れが小さい
          </T>
          <T x={360} y={260} fs={12.5}>
            このほか、どちらの飛行機も高い所を飛ぶので、
          </T>
          <T x={360} y={280} fs={12.5}>
            重力の効果で時計が進む
          </T>
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図20-7 ハーフェルとキーティングの結果 ---------- */

const HK = [
  { dir: '東回り', vals: [144, -184, -40, -59] },
  { dir: '西回り', vals: [179, 96, 275, 273] },
]
const HK_KIND = [
  { name: '重力の効果（予言）', fill: 'var(--fig-box4)' },
  { name: '速さの効果（予言）', fill: 'var(--fig-box3)' },
  { name: '合計（予言）', fill: 'var(--fig-box2)' },
  { name: '観測', fill: 'var(--fig-line)' },
]

export function FigHKResults() {
  const zero = 196
  const s = 0.44
  return (
    <Figure
      n="20-7"
      title="飛行機に載せた時計の予言と観測（1971年）"
      caption="上向きの棒は地上の時計より進んだ時間、下向きの棒は遅れた時間です（単位はナノ秒、1ナノ秒は10億分の1秒）。観測の誤差は東回りで10ナノ秒、西回りで7ナノ秒ほどです。"
    >
      <Svg id="20-7" w={720} h={340} label="東回りの予言は、重力の効果で144ナノ秒進み、速さの効果で184ナノ秒遅れ、合計40ナノ秒の遅れ。観測は59ナノ秒の遅れ。西回りの予言は、重力の効果で179ナノ秒、速さの効果で96ナノ秒進み、合計275ナノ秒の進み。観測は273ナノ秒の進み。">
        {HK_KIND.map((k, i) => (
          <g key={k.name}>
            <rect x={110 + i * 150} y={14} width={16} height={14} fill={k.fill} stroke="var(--fig-line)" />
            <T x={132 + i * 150} y={21} fs={12}>
              {k.name}
            </T>
          </g>
        ))}
        <line x1={90} y1={zero} x2={700} y2={zero} stroke="var(--fig-line)" strokeWidth={1.5} />
        <T x={80} y={zero - 60} anchor="end" fs={12}>
          進む
        </T>
        <Arrow x1={70} y1={zero - 30} x2={70} y2={zero - 50} />
        <T x={80} y={zero + 60} anchor="end" fs={12}>
          遅れる
        </T>
        <Arrow x1={70} y1={zero + 30} x2={70} y2={zero + 50} />
        {HK.map((g, gi) => {
          const gx0 = 130 + gi * 300
          return (
            <g key={g.dir}>
              {g.vals.map((v, i) => {
                const x = gx0 + i * 56
                const h = Math.abs(v) * s
                const up = v > 0
                return (
                  <g key={i}>
                    <rect x={x} y={up ? zero - h : zero} width={40} height={h} fill={HK_KIND[i].fill} stroke="var(--fig-line)" />
                    <T x={x + 20} y={up ? zero - h - 11 : zero + h + 12} anchor="middle" fs={12}>
                      {String(Math.abs(v))}
                    </T>
                  </g>
                )
              })}
              <T x={gx0 + 104} y={326} anchor="middle" bold>
                {g.dir}
              </T>
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図20-8 GPS の衛星の時計 ---------- */

function Satellite({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 20} y={y - 4} width={12} height={8} fill="var(--fig-box3)" stroke="var(--fig-line)" />
      <rect x={x + 8} y={y - 4} width={12} height={8} fill="var(--fig-box3)" stroke="var(--fig-line)" />
      <rect x={x - 7} y={y - 7} width={14} height={14} rx={2} fill="var(--fig-box2)" stroke="var(--fig-line)" />
    </g>
  )
}

export function FigGPS() {
  const sats: Pt[] = [
    [44, 92],
    [124, 52],
    [214, 52],
    [294, 92],
  ]
  const rx: Pt = [170, 262]
  const zero = 200
  const s = 2.6
  const bars = [
    { name: '重力の効果', v: 46, txt: '約46進む', fill: 'var(--fig-box4)' },
    { name: '速さの効果', v: -7, txt: '約7遅れる', fill: 'var(--fig-box3)' },
    { name: '合計', v: 39, txt: '約39進む', fill: 'var(--fig-box2)' },
  ]
  return (
    <Figure
      n="20-8"
      title="GPS の衛星の時計は、地上の時計より1日に約39マイクロ秒進む"
      caption="左は模式図です。受信機は4機以上の衛星から届く時刻をもとに、衛星までの距離と自分の位置を求めます。右の棒は、衛星の時計が地上の時計より1日に進む時間です（単位はマイクロ秒、1マイクロ秒は100万分の1秒）。"
    >
      <Svg id="20-8" w={720} h={330} label="左：4機の衛星から電波が受信機に届く。光の速さで進む電波は10億分の1秒に約30cm進む。右：衛星の時計は、重力が弱いことで1日に約46マイクロ秒進み、速く動くことで約7マイクロ秒遅れ、合わせて約39マイクロ秒進む。">
        <path d="M10,300 Q170,232 330,300" fill="var(--fig-box3)" stroke="var(--fig-line)" />
        {sats.map(([x, y], i) => (
          <g key={i}>
            <line x1={x} y1={y + 8} x2={rx[0]} y2={rx[1] - 9} stroke={BEAM} strokeWidth={1.5} strokeDasharray="5 4" />
            <Satellite x={x} y={y} />
          </g>
        ))}
        <rect x={rx[0] - 9} y={rx[1] - 9} width={18} height={14} rx={2} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={170} y={22} anchor="middle" fs={12.5}>
          衛星（原子時計を積む。高さ約2万200km）
        </T>
        <T x={186} y={246} fs={12}>
          受信機
        </T>
        <T x={20} y={314} fs={12} tone="muted">
          電波は10億分の1秒に約30cm進む
        </T>

        <T x={380} y={22} fs={12.5} bold>
          衛星の時計が1日に進む時間
        </T>
        <T x={380} y={42} fs={12} tone="muted">
          （地上の時計と比べて。マイクロ秒）
        </T>
        <line x1={380} y1={zero} x2={700} y2={zero} stroke="var(--fig-line)" strokeWidth={1.5} />
        {bars.map((b, i) => {
          const x = 410 + i * 100
          const h = Math.abs(b.v) * s
          const up = b.v > 0
          return (
            <g key={b.name}>
              <rect x={x} y={up ? zero - h : zero} width={46} height={h} fill={b.fill} stroke="var(--fig-line)" />
              <T x={x + 23} y={up ? zero - h - 12 : zero + h + 14} anchor="middle" fs={12}>
                {b.txt}
              </T>
              <T x={x + 23} y={up ? zero + 16 : zero - 14} anchor="middle" fs={12}>
                {b.name}
              </T>
            </g>
          )
        })}
        <T x={380} y={270} fs={12}>
          そのままでは、電波が約12km進む時間に当たるずれ。
        </T>
        <T x={380} y={290} fs={12}>
          打ち上げ前に、地上で1秒あたり100億分の4.5ほど
        </T>
        <T x={380} y={310} fs={12}>
          ゆっくり進むように合わせておく。
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図20-9 重力レンズ（動） ---------- */

const LENS = { x: 300, y: 150 }
const OBS: Pt = [520, 150]

export function FigLens() {
  const [align, setAlign] = useState<'off' | 'on'>('off')
  const on = align === 'on'
  const src: Pt = on ? [50, 150] : [50, 128]
  const paths: Pt[][] = on
    ? [
        [src, [LENS.x, 92], OBS],
        [src, [LENS.x, 208], OBS],
      ]
    : [
        [src, [LENS.x, 78], OBS],
        [src, [LENS.x, 196], OBS],
      ]
  const v = 170
  const longest = Math.max(...paths.map(lengthOf))
  return (
    <Anim
      n="20-9"
      title="手前の銀河の重力で光の道筋が分かれ、後ろの天体の像が2つや輪になる"
      still={longest / v + 0.6}
      period={longest / v + 1.6}
      controls={
        <Choice
          label="並び方"
          options={[
            { value: 'off', label: '少しずれている' },
            { value: 'on', label: '一直線に並ぶ' },
          ]}
          value={align}
          onChange={setAlign}
        />
      }
      caption="横から見た模式図で、曲がりの角度と距離の比は実際とは違います。右の枠は地球から見た空です。後ろの天体が少しずれていると像は2つに分かれ、ちょうど一直線に並ぶと、光は手前の銀河のまわりを囲むように届き、像は輪になります。"
    >
      {(t) => (
        <Svg id="20-9" w={720} h={290} label="左の遠い天体から出た光が、中央の手前の銀河の上と下を通って曲げられ、右の地球に届く。地球から見ると、後ろの天体の像は2つに分かれる。一直線に並ぶと像は輪になる。">
          {paths.map((p, i) => (
            <Beam key={i} pts={p} w={2} opacity={0.5} />
          ))}
          {paths.map((p, i) => {
            const L = lengthOf(p)
            if (t * v > L) return null
            const [x, y] = along(p, t * v)
            return <Pulse key={i} x={x} y={y} />
          })}
          <circle cx={src[0]} cy={src[1]} r={10} fill={GLOW} stroke={BEAM} strokeWidth={1.5} />
          <ellipse cx={LENS.x} cy={LENS.y} rx={26} ry={40} fill="var(--fig-box5)" stroke="var(--fig-line)" strokeWidth={1.5} />
          <Ball x={OBS[0]} y={OBS[1]} r={11} fill="var(--fig-box3)" />
          <T x={50} y={240} anchor="middle" fs={12}>
            遠くの天体
          </T>
          <T x={LENS.x} y={240} anchor="middle" fs={12}>
            手前の銀河や銀河団
          </T>
          <T x={LENS.x} y={258} anchor="middle" fs={12} tone="muted">
            （重力で光を曲げる）
          </T>
          <T x={OBS[0]} y={240} anchor="middle" fs={12}>
            地球
          </T>

          <rect x={580} y={60} width={130} height={180} rx={6} fill="var(--fig-box)" stroke="var(--fig-line)" />
          <T x={645} y={44} anchor="middle" fs={12}>
            地球から見た空
          </T>
          <ellipse cx={645} cy={150} rx={12} ry={16} fill="var(--fig-box5)" stroke="var(--fig-line)" />
          {on ? (
            <circle cx={645} cy={150} r={44} fill="none" stroke={BEAM} strokeWidth={5} opacity={0.85} />
          ) : (
            <>
              <path d="M612,104 Q645,84 678,104" fill="none" stroke={BEAM} strokeWidth={6} strokeLinecap="round" />
              <path d="M633,192 Q645,198 657,192" fill="none" stroke={BEAM} strokeWidth={4} strokeLinecap="round" />
            </>
          )}
          <T x={645} y={224} anchor="middle" fs={11.5}>
            {on ? '像は輪になる' : '像が2つに分かれる'}
          </T>
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図20-10 高さで変わる時計の進み（動・切り替え） ---------- */

type HeightId = 'nist' | 'tower' | 'tree' | 'gps'

const HEIGHTS: Record<HeightId, { h: string; ex: string; perDay: string; oneSec: string; deg: number }> = {
  nist: { h: '約33cm', ex: 'NIST の実験（2010年）', perDay: '約3ピコ秒（1兆分の3秒）', oneSec: '約9億年', deg: 1.5 },
  tower: { h: '約22.5m', ex: 'ハーバード大学の塔（1960年）', perDay: '約0.2ナノ秒（100億分の2秒）', oneSec: '約1300万年', deg: 4 },
  tree: { h: '約450m', ex: '東京スカイツリー（2020年）', perDay: '約4ナノ秒（10億分の4秒）', oneSec: '約64万年', deg: 8 },
  gps: { h: '約2万200km', ex: 'GPS の衛星（重力の効果だけ）', perDay: '約46マイクロ秒（100万分の46秒）', oneSec: '約60年', deg: 16 },
}

function Clock({ x, y, ang, label }: { x: number; y: number; ang: number; label: string }) {
  const r = 32
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={2} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6
        return <line key={i} x1={x + (r - 6) * Math.sin(a)} y1={y - (r - 6) * Math.cos(a)} x2={x + (r - 2) * Math.sin(a)} y2={y - (r - 2) * Math.cos(a)} stroke="var(--fig-line)" />
      })}
      <line x1={x} y1={y} x2={x + (r - 9) * Math.sin(ang)} y2={y - (r - 9) * Math.cos(ang)} stroke="var(--fig-line)" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={x} cy={y} r={3} fill="var(--fig-line)" />
      <T x={x + r + 14} y={y} fs={12.5}>
        {label}
      </T>
    </g>
  )
}

export function FigHeights() {
  const [hid, setHid] = useState<HeightId>('tree')
  const H = HEIGHTS[hid]
  const dayLen = 1.2 // 図の中の1日の長さ（秒）
  const days = 10
  return (
    <Anim
      n="20-10"
      title="高い所の時計ほど速く進む。高さの差が大きいほど、ずれは大きい"
      still={days * dayLen}
      period={days * dayLen + 1.5}
      controls={
        <Choice
          label="高さの差"
          options={[
            { value: 'nist', label: '約33cm' },
            { value: 'tower', label: '約22.5m' },
            { value: 'tree', label: '約450m' },
            { value: 'gps', label: '約2万km' },
          ]}
          value={hid}
          onChange={setHid}
        />
      }
      caption="時計の針は1日で1周します。上の時計の針が下の時計より先へ進んでいく様子は、実際よりはるかに大きく描いています（高さの差による針のずれの比も実際とは違います）。地上近くの値は高さの差と重力の強さから計算した値、450mの値はスカイツリーでの測定値、2万kmの値はウィルのまとめによる値です。"
    >
      {(t) => {
        const d = Math.min(t / dayLen, days)
        const base = 2 * Math.PI * d
        const ahead = (H.deg * Math.PI * d) / 180
        return (
          <Svg id="20-10" w={720} h={290} label={`高さの差${H.h}の2つの時計。上の時計は下の時計より速く進み、1日あたり${H.perDay}進む。このずれが1秒になるまで${H.oneSec}かかる。`}>
            <rect x={20} y={250} width={260} height={14} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={150} y={278} anchor="middle" fs={12} tone="muted">
              地面
            </T>
            <Clock x={110} y={64} ang={base + ahead} label="高い所" />
            <Clock x={110} y={206} ang={base} label="低い所" />
            <Arrow x1={44} y1={74} x2={44} y2={196} both />
            <T x={52} y={135} fs={12}>
              {H.h}
            </T>
            <T x={330} y={40} fs={12.5} bold>
              {H.ex}
            </T>
            <T x={330} y={78} fs={12.5}>
              高い所の時計が1日に進む分
            </T>
            <T x={330} y={100} fs={13} tone="acc">
              {H.perDay}
            </T>
            <T x={330} y={138} fs={12.5}>
              このずれが1秒になるまで
            </T>
            <T x={330} y={160} fs={13} tone="acc">
              {H.oneSec}
            </T>
            <T x={330} y={210} fs={12.5}>
              {`経過した日数：${Math.floor(d)}日`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}
