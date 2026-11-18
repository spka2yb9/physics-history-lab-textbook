import { useMemo, useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Force, Trail, Vel, ease } from './common'

/* ---------- この章で何度も使う部品 ---------- */

/** 地球（緑の丸と名前） */
function Earth({ x, y, r, label = '地球' }: { x: number; y: number; r: number; label?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeWidth={1.5} />
      {label && (
        <T x={x} y={y} anchor="middle" fs={12.5}>
          {label}
        </T>
      )}
    </g>
  )
}

/** 太陽（だいだい色の丸） */
function Sun({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
}

/** 円の道筋（点線） */
function Orbit({ x, y, r }: { x: number; y: number; r: number }) {
  return <circle cx={x} cy={y} r={r} fill="none" stroke="var(--fig-muted)" strokeWidth={1.2} strokeDasharray="3 4" />
}

/** 凡例の1行。左に小さな見本、右に文字 */
function LegendRow({ x, y, kind, children }: { x: number; y: number; kind: 'force' | 'vel' | 'trail' | 'ghost' | 'ball' | 'ball2'; children: string }) {
  return (
    <g>
      {kind === 'force' && <Force x1={x} y1={y} x2={x + 30} y2={y} />}
      {kind === 'vel' && <Vel x1={x} y1={y} x2={x + 30} y2={y} />}
      {kind === 'trail' && <Trail points={[[x, y], [x + 30, y]]} />}
      {kind === 'ghost' && <circle cx={x + 15} cy={y} r={8} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />}
      {kind === 'ball' && <Ball x={x + 15} y={y} r={8} />}
      {kind === 'ball2' && <Ball x={x + 15} y={y} r={8} fill="var(--fig-box5)" />}
      <T x={x + 40} y={y} fs={12.5}>
        {children}
      </T>
    </g>
  )
}

/* ---------- 図2-1 月は地球の側へ落ち続けている（動） ---------- */

export function FigMoonFall() {
  const cx = 200
  const cy = 165
  const R = 125
  const STEP = (40 * Math.PI) / 180 // 1回に進む角度
  const MOVE = 1.6 // 動く時間（秒）
  const HOLD = 0.8 // 止めて差を見せる時間（秒）
  const A0 = (110 * Math.PI) / 180
  const pos = (a: number) => ({ x: cx + R * Math.cos(a), y: cy - R * Math.sin(a) })
  return (
    <Anim
      n="2-1"
      title="月は、まっすぐの道から地球の側へ落ち続けている"
      still={1.9}
      period={9 * (MOVE + HOLD)}
      caption="点線の丸は、地球が月を引かなかった場合に月が進む位置です。実際の月はそこから地球の側へずれた所にあります。このずれが、月が地球に向かって落ちた分です。地球と月の大きさ、距離、ずれの大きさは実際と違う模式図です。"
    >
      {(t) => {
        const k = Math.floor(t / (MOVE + HOLD))
        const u = Math.min((t - k * (MOVE + HOLD)) / MOVE, 1)
        const a0 = A0 + k * STEP
        const a = a0 + u * STEP
        const p0 = pos(a0)
        const m = pos(a)
        // まっすぐ進んだ場合の位置（出発点での接線の向きに、同じ距離だけ進む）
        const tx = -Math.sin(a0)
        const ty = -Math.cos(a0)
        const s = R * u * STEP
        const g = { x: p0.x + tx * s, y: p0.y + ty * s }
        const far = { x: p0.x + tx * R * STEP * 1.25, y: p0.y + ty * R * STEP * 1.25 }
        const toE = { x: (cx - m.x) / R, y: (cy - m.y) / R }
        return (
          <Svg id="2-1" w={720} h={330} label="地球のまわりを回る月。地球が引かなければ月は接線の向きにまっすぐ進むが、実際の月はそこから地球の側へずれた位置にあり、円に近い軌道を回り続ける。">
            <Orbit x={cx} y={cy} r={R} />
            <Earth x={cx} y={cy} r={34} />
            <line x1={p0.x} y1={p0.y} x2={far.x} y2={far.y} stroke="var(--fig-muted)" strokeWidth={1.2} strokeDasharray="6 4" />
            {u > 0.05 && <circle cx={g.x} cy={g.y} r={10} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />}
            {u > 0.3 && <Arrow x1={g.x} y1={g.y} x2={m.x + (g.x - m.x) * 0.25} y2={m.y + (g.y - m.y) * 0.25} />}
            <Force x1={m.x} y1={m.y} x2={m.x + toE.x * 42} y2={m.y + toE.y * 42} />
            <Ball x={m.x} y={m.y} r={10} />
            <LegendRow x={400} y={50} kind="ghost">
              地球が引かなければ月が進む位置
            </LegendRow>
            <LegendRow x={400} y={80} kind="ball">
              実際の月
            </LegendRow>
            <g>
              <Arrow x1={400} y1={110} x2={430} y2={110} />
              <T x={440} y={110} fs={12.5}>
                2つの位置の差（地球の側へ落ちた分）
              </T>
            </g>
            <LegendRow x={400} y={140} kind="force">
              地球が月を引く力
            </LegendRow>
            <g>
              <line x1={400} y1={170} x2={430} y2={170} stroke="var(--fig-muted)" strokeWidth={1.2} strokeDasharray="6 4" />
              <T x={440} y={170} fs={12.5}>
                その時の向きにまっすぐ進む道
              </T>
            </g>
            <T x={400} y={220} fs={12.5}>
              月は落ち続けているが、横向きにも速く
            </T>
            <T x={400} y={240} fs={12.5}>
              進んでいるので、地球に近づかずに回り続ける。
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図2-2 山の上から投げる速さを変える（動・スライダー） ---------- */

const VU = 7.9055 // 地表すれすれの円軌道の速さ（km/s）。NASA の地球の値（重力の強さと半径）から計算
const R0 = 1.2523 // 投げる高さ。ニュートンが例に挙げた1000マイル（約1600km）。地球の中心から、地球の半径の約1.25倍

interface Shot {
  /** [時刻, x, y]。単位は地球の半径と、地表すれすれを回る速さ */
  pts: [number, number, number][]
  landed: boolean
  dur: number
  rmin: number
  rmax: number
}

/** 水平に投げた物の道筋を計算する（空気の抵抗なし）。落ちるか、1周した所で止める */
function shoot(vkm: number): Shot {
  const dt = 0.002
  let x = 0
  let y = R0
  let vx = vkm / VU
  let vy = 0
  let ax = 0
  let ay = -1 / (R0 * R0)
  let t = 0
  let swept = 0
  let pa = Math.PI / 2
  let rmin = R0
  let rmax = R0
  const pts: [number, number, number][] = [[0, x, y]]
  for (let i = 1; i < 20000; i++) {
    vx += (ax * dt) / 2
    vy += (ay * dt) / 2
    x += vx * dt
    y += vy * dt
    const r = Math.hypot(x, y)
    ax = -x / r ** 3
    ay = -y / r ** 3
    vx += (ax * dt) / 2
    vy += (ay * dt) / 2
    t += dt
    rmin = Math.min(rmin, r)
    rmax = Math.max(rmax, r)
    const a = Math.atan2(y, x)
    let d = a - pa
    if (d > Math.PI) d -= 2 * Math.PI
    if (d < -Math.PI) d += 2 * Math.PI
    swept += d
    pa = a
    if (i % 10 === 0) pts.push([t, x, y])
    if (r < 1) {
      const k = 1 / r
      pts.push([t, x * k, y * k])
      return { pts, landed: true, dur: t, rmin, rmax }
    }
    if (Math.abs(swept) >= 2 * Math.PI) {
      pts.push([t, 0, R0])
      return { pts, landed: false, dur: t, rmin, rmax }
    }
  }
  return { pts, landed: false, dur: t, rmin, rmax }
}

const REF_SHOTS = [4, 5, 6, 6.5].map((v) => ({ v, s: shoot(v) }))

/** 計算した点の並びから、時刻 tm の位置を補間して返す */
function at(s: Shot, tm: number) {
  const p = s.pts
  if (tm >= s.dur) return { x: p[p.length - 1][1], y: p[p.length - 1][2], i: p.length - 1 }
  let lo = 0
  let hi = p.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (p[mid][0] <= tm) lo = mid
    else hi = mid
  }
  const f = (tm - p[lo][0]) / (p[hi][0] - p[lo][0] || 1)
  return { x: p[lo][1] + (p[hi][1] - p[lo][1]) * f, y: p[lo][2] + (p[hi][2] - p[lo][2]) * f, i: lo }
}

export function FigCannon() {
  const [v, setV] = useState(7.1)
  const shot = useMemo(() => shoot(v), [v])
  const cx = 200
  const cy = 108
  const S = 70
  // 円に近い道筋は実時間で約7秒で1周。短い飛行は2.5秒かけて見せる
  const rate = shot.landed ? Math.min(1.2, shot.dur / 2.5) : 1.2
  const flight = shot.dur / rate
  const period = shot.landed ? flight + 1.2 : flight
  const sx = (x: number) => cx + x * S
  const sy = (y: number) => cy - y * S
  const outcome = shot.landed ? '地面に落ちる' : shot.rmax - shot.rmin < 0.06 ? '地球のまわりを回り続ける（円に近い軌道）' : '楕円の軌道を回り、山の高さに戻ってくる'
  return (
    <Anim
      n="2-2"
      title="投げる速さを上げると、物は地面に落ちずに地球を回り始める"
      still={5}
      period={period}
      controls={<Range label="投げる速さ" min={3} max={8} step={0.1} value={v} onChange={setV} format={(x) => `秒速${x.toFixed(1)}km`} />}
      caption="ニュートンが『世界の体系』で描いた思考実験を、空気の抵抗がないとして計算した模式図です。山の高さは、ニュートンが例に挙げた1000マイル（約1600km）としました。「投げる速さ」を上げると落ちる所が遠くなり、秒速約7.1km（この高さで円を描く速さ）に達すると地球を回り続けます。"
    >
      {(t) => {
        const tm = Math.min(t, flight) * rate
        const p = at(shot, tm)
        const path = shot.pts.slice(0, p.i + 1).map(([, x, y]) => [sx(x), sy(y)] as [number, number])
        path.push([sx(p.x), sy(p.y)])
        const r = Math.hypot(p.x, p.y)
        const ux = -p.x / r
        const uy = -p.y / r
        // 速さの向き：直前の点との差から
        const q = shot.pts[Math.max(0, p.i - 1)]
        let vx = p.x - q[1]
        let vy = p.y - q[2]
        const vn = Math.hypot(vx, vy) || 1
        vx /= vn
        vy /= vn
        if (p.i === 0) {
          vx = 1
          vy = 0
        }
        const done = shot.landed && tm >= shot.dur
        const vlen = 4 * v
        return (
          <Svg id="2-2" w={720} h={290} label="高い山の頂上から水平に物を投げる。遅いとすぐ近くに落ち、速くするほど遠くに落ちる。秒速約7.1kmに達すると地面に落ちずに地球を回り続ける。">
            <Earth x={cx} y={cy} r={S} />
            <path d={`M${sx(-0.2)},${sy(0.98)} L${sx(0)},${sy(R0)} L${sx(0.2)},${sy(0.98)} Z`} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={sx(0) - 16} y={sy(R0) + 2} anchor="end" fs={12}>
              高い山の頂上
            </T>
            {REF_SHOTS.map(({ v: rv, s }) => {
              const end = s.pts[s.pts.length - 1]
              const a = Math.atan2(end[2], end[1])
              // 上の方は落ちた所の真上、右の方は落ちた所の右に文字を置き、円の道筋と重ねない
              const steep = a > Math.PI / 3
              const lr = steep ? 1.5 : 1.45
              return (
                <g key={rv}>
                  <path d={s.pts.map(([, x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')} fill="none" stroke="var(--fig-muted)" strokeWidth={1} strokeDasharray="2 4" />
                  <T x={sx(lr * Math.cos(a))} y={sy(lr * Math.sin(a))} anchor={steep ? 'middle' : 'start'} fs={11.5} tone="muted">
                    {`秒速${rv}km`}
                  </T>
                </g>
              )
            })}
            <Trail points={path} />
            {!done && <Force x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x) + ux * 26} y2={sy(p.y) - uy * 26} />}
            {!done && <Vel x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x) + vx * vlen} y2={sy(p.y) - vy * vlen} />}
            <Ball x={sx(p.x)} y={sy(p.y)} r={6} />
            <T x={430} y={36} fs={13} bold>
              {`秒速${v.toFixed(1)}kmで投げた場合`}
            </T>
            <T x={430} y={58} fs={12.5} tone="acc">
              {outcome}
            </T>
            <LegendRow x={430} y={100} kind="trail">
              投げた物が通った道筋
            </LegendRow>
            <T x={470} y={122} fs={12} tone="muted">
              （細い点線は比べるための道筋）
            </T>
            <LegendRow x={430} y={150} kind="force">
              地球が引く力
            </LegendRow>
            <LegendRow x={430} y={178} kind="vel">
              速さと向き
            </LegendRow>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図2-3 りんごと月の落ち方を比べる ---------- */

export function FigMoonTest() {
  return (
    <Figure
      n="2-3"
      title="月が1分間に落ちる距離は、りんごが1秒間に落ちる距離とほぼ同じ"
      caption="ニュートンが『プリンキピア』第3巻で行った比べ方を、現在の値で示した模式図です。月までの距離は地球の半径の約60倍なので、地球が引く力は60に60を掛けた3600分の1になります。落ちる距離は、時間が60倍になると3600倍になります。"
    >
      <Svg id="2-3" w={720} h={270} label="地上のりんごは1秒間に約4.9m落ちる。地球の半径の約60倍の所にある月は、地球が引く力が3600分の1なので、1秒間では約1.4mm、1分間で約4.9m落ちる。">
        {/* りんご */}
        <T x={30} y={24} bold>
          地上のりんご
        </T>
        <path d="M20,236 Q180,222 340,236" fill="none" stroke="var(--fig-line)" strokeWidth={2} />
        <T x={30} y={256} fs={12} tone="muted">
          地面（地球の中心から地球の半径1つ分）
        </T>
        <Ball x={110} y={64} r={11} fill="var(--fig-box2)" />
        <circle cx={110} cy={210} r={11} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />
        <Trail points={[[110, 78], [110, 196]]} />
        <Force x1={86} y1={64} x2={86} y2={108} />
        <T x={44} y={88} fs={12} anchor="end" tone="acc">
          地球が
        </T>
        <T x={44} y={104} fs={12} anchor="end" tone="acc">
          引く力
        </T>
        <line x1={150} y1={64} x2={150} y2={210} stroke="var(--fig-line)" />
        <line x1={144} y1={64} x2={156} y2={64} stroke="var(--fig-line)" />
        <line x1={144} y1={210} x2={156} y2={210} stroke="var(--fig-line)" />
        <T x={164} y={124} fs={12.5}>
          1秒間に
        </T>
        <T x={164} y={144} fs={12.5} bold>
          約4.9m
        </T>
        <T x={164} y={164} fs={12.5}>
          落ちる
        </T>
        <line x1={360} y1={20} x2={360} y2={250} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        {/* 月 */}
        <T x={385} y={24} bold>
          月
        </T>
        <Ball x={470} y={80} r={16} />
        <Force x1={470} y1={98} x2={470} y2={110} />
        <circle cx={470} cy={128} r={16} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />
        <T x={500} y={68} fs={12.5}>
          地球の中心からの距離：
        </T>
        <T x={500} y={88} fs={12.5}>
          地球の半径の約60倍
        </T>
        <T x={500} y={116} fs={12.5}>
          地球が引く力：
        </T>
        <T x={500} y={136} fs={12.5} tone="acc">
          地上の3600分の1
        </T>
        <T x={385} y={176} fs={12.5}>
          地球の側へ落ちる距離
        </T>
        <T x={400} y={198} fs={12.5}>
          1秒間に約1.4mm
        </T>
        <T x={400} y={220} fs={12.5} bold>
          1分間に約4.9m（りんごの1秒間とほぼ同じ）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図2-4 距離と引く力の強さ（スライダー） ---------- */

const FRAC = ['1', '4分の1', '9分の1', '16分の1']

export function FigDistance() {
  const [d, setD] = useState(2)
  const ex = 70
  const ey = 140
  const er = 40
  const ox = ex + er * d
  const len = 64 / (d * d)
  const gx = (x: number) => 430 + (x - 1) * 80
  const gy = (f: number) => 220 - f * 160
  const curve = Array.from({ length: 61 }, (_, i) => {
    const x = 1 + i * 0.05
    return `${i ? 'L' : 'M'}${gx(x).toFixed(1)},${gy(1 / (x * x)).toFixed(1)}`
  }).join(' ')
  return (
    <Figure
      n="2-4"
      title="地球の中心からの距離が2倍になると、引く力は4分の1になる"
      controls={<Range label="地球の中心からの距離" min={1} max={4} step={1} value={d} onChange={setD} format={(x) => `地球の半径の${x}倍`} />}
      caption="「地球の中心からの距離」を変えると、左の物を引く力（青の矢印）と、右のグラフの点が動きます。距離が3倍なら9分の1、4倍なら16分の1です。月の距離（約60倍）では3600分の1になります。"
    >
      <Svg id="2-4" w={720} h={270} label={`地球の中心から地球の半径の${d}倍の所にある物を、地球は地表の${FRAC[d - 1]}の力で引く。距離が2倍で4分の1、3倍で9分の1、4倍で16分の1になる。`}>
        <Earth x={ex} y={ey} r={er} label="" />
        <T x={ex} y={ey - er - 12} anchor="middle" fs={12.5}>
          地球
        </T>
        {[1, 2, 3, 4].map((k) => (
          <g key={k}>
            <line x1={ex + er * k} y1={ey + 46} x2={ex + er * k} y2={ey + 54} stroke="var(--fig-line)" />
            <T x={ex + er * k} y={ey + 68} anchor="middle" fs={11.5} tone="muted">
              {`${k}倍`}
            </T>
          </g>
        ))}
        <line x1={ex} y1={ey + 50} x2={ex + er * 4 + 10} y2={ey + 50} stroke="var(--fig-line)" />
        <T x={ex} y={ey + 92} fs={12} tone="muted">
          地球の中心からの距離（地球の半径を1とする）
        </T>
        <Force x1={ox} y1={ey} x2={ox - len} y2={ey} />
        <Ball x={ox} y={ey} r={8} fill="var(--fig-box2)" />
        <T x={ex - 30} y={40} fs={13}>
          {`距離が地球の半径の${d}倍のとき、`}
        </T>
        <T x={ex - 30} y={62} fs={13} tone="acc">
          {`地球が引く力は地表の${FRAC[d - 1]}`}
        </T>
        {/* グラフ */}
        <line x1={gx(1) - 20} y1={gy(0)} x2={gx(4) + 20} y2={gy(0)} stroke="var(--fig-line)" />
        <line x1={gx(1) - 20} y1={gy(0)} x2={gx(1) - 20} y2={gy(1) - 16} stroke="var(--fig-line)" />
        <T x={gx(1) - 12} y={gy(1) - 36} fs={12}>
          引く力（地表を1とする）
        </T>
        <path d={curve} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} />
        {[1, 2, 3, 4].map((k) => (
          <g key={k}>
            <circle cx={gx(k)} cy={gy(1 / (k * k))} r={k === d ? 7 : 4} fill={k === d ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" />
            <T x={gx(k)} y={gy(0) + 16} anchor="middle" fs={11.5} tone="muted">
              {`${k}倍`}
            </T>
            <T x={k === 1 ? gx(k) + 14 : gx(k)} y={k === 1 ? gy(1) : gy(1 / (k * k)) - 16} anchor={k === 1 ? 'start' : 'middle'} fs={12} tone={k === d ? 'acc' : undefined}>
              {FRAC[k - 1]}
            </T>
          </g>
        ))}
        <T x={gx(4) + 20} y={gy(0) + 36} anchor="end" fs={12} tone="muted">
          地球の中心からの距離
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図2-5 楕円の軌道を回る惑星（動・切り替え） ---------- */

const ORBIT_SHAPES = {
  wide: { e: 0.6, label: '細長い楕円（説明用）' },
  earth: { e: 0.0167, label: '地球の軌道（実際の形）' },
} as const

export function FigEllipse() {
  const [shape, setShape] = useState<keyof typeof ORBIT_SHAPES>('wide')
  const e = ORBIT_SHAPES[shape].e
  const a = 140
  const b = a * Math.sqrt(1 - e * e)
  const ox = 330
  const oy = 150
  const sunX = ox + a * e
  const T0 = 8 // 1周の秒数
  const N = 12
  /** 時刻から楕円の上の位置を求める（ケプラーの方程式を数回の反復で解く） */
  const place = (tt: number) => {
    const M = (2 * Math.PI * tt) / T0
    let E = M + e * Math.sin(M)
    for (let i = 0; i < 6; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
    return { x: ox + a * Math.cos(E), y: oy - b * Math.sin(E), E }
  }
  const sectors = Array.from({ length: N }, (_, k) => {
    const pts = Array.from({ length: 13 }, (_, j) => place(((k + j / 12) * T0) / N))
    return `M${sunX},${oy} ${pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} Z`
  })
  const rp = a * (1 - e)
  return (
    <Anim
      n="2-5"
      title="惑星は太陽に近い所では速く、遠い所では遅く動く"
      still={0.55}
      period={T0}
      controls={
        <Choice
          label="軌道の形"
          options={(Object.keys(ORBIT_SHAPES) as (keyof typeof ORBIT_SHAPES)[]).map((k) => ({ value: k, label: ORBIT_SHAPES[k].label }))}
          value={shape}
          onChange={setShape}
        />
      }
      caption="色を付けた扇形と白い扇形は、どれも同じ時間に太陽と惑星を結ぶ線が通った部分で、面積が等しくなっています。「地球の軌道」に切り替えると、実際の地球の軌道がほとんど円であることが分かります。矢印の長さは目安です。"
    >
      {(t) => {
        const p = place(t % T0)
        const dx = sunX - p.x
        const dy = oy - p.y
        const r = Math.hypot(dx, dy)
        const speed = Math.sqrt(2 / r - 1 / a) / Math.sqrt(2 / rp - 1 / a)
        // 速さの向き：楕円の接線
        let tx = -a * Math.sin(p.E)
        let ty = -b * Math.cos(p.E)
        const tn = Math.hypot(tx, ty)
        tx /= tn
        ty /= tn
        const flen = Math.max(6, 46 * (rp / r) ** 2)
        return (
          <Svg id="2-5" w={720} h={300} label="楕円の軌道を回る惑星。太陽に近い所では太陽が引く力が強く、惑星は速く動く。遠い所では遅く動く。同じ時間に太陽と惑星を結ぶ線が通る面積は等しい。">
            {sectors.map((d, k) => (
              <path key={k} d={d} fill={k % 2 ? 'var(--fig-bg)' : 'var(--fig-box3)'} stroke="var(--fig-muted)" strokeWidth={0.6} />
            ))}
            <ellipse cx={ox} cy={oy} rx={a} ry={b} fill="none" stroke="var(--fig-line)" strokeWidth={1.2} />
            <Sun x={sunX} y={oy} r={11} />
            <line x1={sunX + 8} y1={oy - 8} x2={572} y2={42} stroke="var(--fig-muted)" />
            <T x={578} y={38} fs={12}>
              太陽
            </T>
            <Force x1={p.x} y1={p.y} x2={p.x + (dx / r) * flen} y2={p.y + (dy / r) * flen} />
            <Vel x1={p.x} y1={p.y} x2={p.x + tx * 70 * speed} y2={p.y + ty * 70 * speed} />
            <Ball x={p.x} y={p.y} r={8} />
            {shape === 'wide' ? (
              <>
                <T x={ox + a + 14} y={oy - 10} fs={12.5}>
                  太陽に近い所
                </T>
                <T x={ox + a + 14} y={oy + 10} fs={12.5} tone="acc">
                  速く動く
                </T>
                <T x={ox - a - 14} y={oy - 10} fs={12.5} anchor="end">
                  太陽から遠い所
                </T>
                <T x={ox - a - 14} y={oy + 10} fs={12.5} anchor="end" tone="acc">
                  遅く動く
                </T>
              </>
            ) : (
              <>
                <T x={ox + a + 14} y={oy - 10} fs={12.5}>
                  最も近い時
                </T>
                <T x={ox + a + 14} y={oy + 10} fs={12.5}>
                  約1億4710万km
                </T>
                <T x={ox - a - 14} y={oy - 10} fs={12.5} anchor="end">
                  最も遠い時
                </T>
                <T x={ox - a - 14} y={oy + 10} fs={12.5} anchor="end">
                  約1億5210万km
                </T>
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図2-6 惑星の距離と公転周期 ---------- */

// NASA Planetary Fact Sheet の値を、地球を1として割ったもの
const PLANETS = [
  { name: '水星', d: 0.387, dl: '0.39倍', p: 0.241, pl: '0.24年' },
  { name: '金星', d: 0.723, dl: '0.72倍', p: 0.615, pl: '0.62年' },
  { name: '地球', d: 1, dl: '1倍', p: 1, pl: '1年' },
  { name: '火星', d: 1.524, dl: '1.52倍', p: 1.881, pl: '1.88年' },
  { name: '木星', d: 5.204, dl: '5.2倍', p: 11.86, pl: '11.9年' },
  { name: '土星', d: 9.572, dl: '9.57倍', p: 29.42, pl: '29.4年' },
]

export function FigPeriods() {
  const dx = (d: number) => (d / 9.572) * 230
  const px = (p: number) => (p / 29.42) * 230
  return (
    <Figure
      n="2-6"
      title="太陽から遠い惑星ほど、公転周期は距離の割合以上に長くなる"
      caption="ケプラーとニュートンの時代に知られていた6つの惑星について、左に太陽からの平均の距離（地球を1とする）、右に公転周期を示しました。土星は距離が地球の約10倍ですが、公転周期は約29倍です。"
    >
      <Svg id="2-6" w={720} h={290} label="水星0.39倍0.24年、金星0.72倍0.62年、地球1倍1年、火星1.52倍1.88年、木星5.2倍11.9年、土星9.57倍29.4年。距離が大きいほど公転周期は距離の割合以上に長い。">
        <T x={90} y={20} fs={12.5} bold>
          太陽からの距離（地球を1とする）
        </T>
        <T x={410} y={20} fs={12.5} bold>
          公転周期（1周にかかる年数）
        </T>
        {PLANETS.map((p, i) => {
          const y = 52 + i * 34
          const hi = p.name === '地球'
          return (
            <g key={p.name}>
              <T x={20} y={y} fs={12.5} bold={hi}>
                {p.name}
              </T>
              <rect x={90} y={y - 9} width={Math.max(2, dx(p.d))} height={18} fill="var(--fig-box3)" stroke="var(--fig-line)" />
              <T x={96 + dx(p.d)} y={y} fs={12}>
                {p.dl}
              </T>
              <rect x={410} y={y - 9} width={Math.max(2, px(p.p))} height={18} fill="var(--fig-box2)" stroke="var(--fig-line)" />
              <T x={416 + px(p.p)} y={y} fs={12}>
                {p.pl}
              </T>
            </g>
          )
        })}
        <T x={20} y={270} fs={12.5} tone="acc">
          ケプラーの第3法則：距離が4倍になると公転周期は8倍、距離が9倍になると27倍になる
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図2-7 ハレー彗星の軌道と、予言までの記録 ---------- */

const AU = 17 // 1天文単位（太陽と地球の平均の距離）の長さ（ピクセル）

const HALLEY_EVENTS = [
  { y: 1531, top: ['1531年', '明るい彗星'] },
  { y: 1607, top: ['1607年', '明るい彗星'] },
  { y: 1682, top: ['1682年', '明るい彗星'] },
  { y: 1705, top: ['1705年', 'ハレーが予言'] },
  { y: 1758, top: ['1758年12月', '予言どおり現れる'] },
]

export function FigHalley() {
  const sx = 90
  const sy = 110
  const rp = 0.587 * AU
  const ra = 35.25 * AU
  const a = (rp + ra) / 2
  const c = a - rp
  const b = Math.sqrt(a * a - c * c)
  const tx = (y: number) => 70 + (y - 1531) * 2.6
  const planets = [
    { n: '地球', r: 1 },
    { n: '木星', r: 5.2 },
    { n: '土星', r: 9.57 },
    { n: '天王星', r: 19.2 },
    { n: '海王星', r: 30.2 },
  ]
  return (
    <Figure
      n="2-7"
      title="ハレー彗星は、太陽の近くから海王星の軌道の外まで、細長い楕円を回る"
      caption="上は太陽と惑星の軌道とハレー彗星の軌道を、距離の比を合わせて描いたものです（彗星の軌道の傾きは無視しています）。下はハレーの予言までの記録です。点の間隔は年数に比例しています。"
    >
      <Svg id="2-7" w={720} h={360} label="ハレー彗星の軌道は、太陽に最も近い所が金星の軌道より内側、最も遠い所が海王星の軌道の外にある細長い楕円。1531年、1607年、1682年の彗星を同じ彗星とみて、ハレーは1705年に1758年ごろの回帰を予言し、1758年12月に彗星が現れた。">
        <defs>
          <clipPath id="halley-clip">
            <rect x={0} y={0} width={720} height={222} />
          </clipPath>
        </defs>
        <g clipPath="url(#halley-clip)">
          {planets.map((p) => (
            <Orbit key={p.n} x={sx} y={sy} r={p.r * AU} />
          ))}
          <ellipse cx={sx - rp + a} cy={sy} rx={a} ry={b} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
        </g>
        <Sun x={sx} y={sy} r={6} />
        <T x={sx} y={sy + 40} anchor="middle" fs={12}>
          太陽
        </T>
        <T x={sx} y={212} anchor="middle" fs={11.5} tone="muted">
          木星
        </T>
        <T x={228} y={208} fs={11.5} tone="muted">
          土星
        </T>
        <T x={408} y={208} fs={11.5} tone="muted">
          天王星
        </T>
        <T x={600} y={208} fs={11.5} tone="muted">
          海王星
        </T>
        <T x={440} y={18} fs={12.5} tone="acc">
          ハレー彗星の軌道
        </T>
        {/* 年表 */}
        <line x1={40} y1={300} x2={700} y2={300} stroke="var(--fig-line)" />
        {HALLEY_EVENTS.map((ev, i) => {
          const x = tx(ev.y)
          const up = i % 2 === 0
          return (
            <g key={ev.y}>
              <circle cx={x} cy={300} r={5} fill={i === 4 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              {ev.top.map((s, j) => (
                <T key={j} x={x} y={(up ? 252 : 318) + j * 17} anchor="middle" fs={12} bold={j === 0}>
                  {s}
                </T>
              ))}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図2-8 キャベンディッシュのねじれ秤（動） ---------- */

export function FigCavendish() {
  const cx = 330
  const cy = 160
  const L = 150
  const near = Math.atan2(-58, L) // 大球が小球の近くにあるときの、大球を支える腕の角度
  const farA = (-52 * Math.PI) / 180
  const rho = Math.hypot(L, 58)
  const defl = (-6 * Math.PI) / 180 // 棒が回る角度（実際より大きく描く）
  return (
    <Anim
      n="2-8"
      title="大きな鉛の球に引かれて、細い針金でつるした棒がわずかに回る"
      still={11}
      period={13}
      caption="ねじれ秤を上から見た模式図です。大きな球を小さな球の近くに動かすと、引き合う力（青の矢印）で針金がわずかにねじれ、棒が回って、しばらく往復してから止まります。回る角度は実際よりずっと大きく描いています。"
    >
      {(t) => {
        const m = ease(t - 1)
        const phi = farA + (near - farA) * m
        const big = [
          { x: cx + rho * Math.cos(phi), y: cy + rho * Math.sin(phi) },
          { x: cx - rho * Math.cos(phi), y: cy - rho * Math.sin(phi) },
        ]
        const tt = t - 2
        const th = tt > 0 ? defl * (1 - Math.exp(-0.35 * tt) * Math.cos(((2 * Math.PI) / 3) * tt)) : 0
        const ends = [
          { x: cx + L * Math.cos(th), y: cy + L * Math.sin(th) },
          { x: cx - L * Math.cos(th), y: cy - L * Math.sin(th) },
        ]
        return (
          <Svg id="2-8" w={720} h={320} label="上から見たねじれ秤。中央を細い針金でつるした長さ約1.8mの棒の両端に小さな鉛の球があり、近くに置いた約160kgの大きな鉛の球に引かれて、棒がわずかに回る。">
            <line x1={ends[1].x} y1={ends[1].y} x2={ends[0].x} y2={ends[0].y} stroke="var(--fig-line)" strokeWidth={4} />
            <circle cx={cx} cy={cy} r={5} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            {big.map((p, i) => (
              <Ball key={i} x={p.x} y={p.y} r={24} fill="var(--fig-box)" />
            ))}
            {ends.map((p, i) => (
              <Ball key={i} x={p.x} y={p.y} r={8} />
            ))}
            {m > 0.95 &&
              ends.map((p, i) => {
                const q = big[i]
                const d = Math.hypot(q.x - p.x, q.y - p.y)
                return <Force key={i} x1={p.x} y1={p.y} x2={p.x + ((q.x - p.x) / d) * 22} y2={p.y + ((q.y - p.y) / d) * 22} />
              })}
            <T x={cx} y={cy - 22} anchor="middle" fs={12}>
              細い針金でつるす
            </T>
            <T x={cx - 70} y={cy + 26} anchor="middle" fs={12} tone="muted">
              木の棒（長さ約1.8m）
            </T>
            <T x={512} y={92} fs={12.5}>
              大きな鉛の球（1個約160kg）
            </T>
            <T x={512} y={172} fs={12.5}>
              小さな鉛の球（直径約5cm）
            </T>
            <T x={420} y={270} fs={12.5}>
              青の矢印：大きな球と小さな球が引き合う力
            </T>
            <T x={420} y={292} fs={12} tone="muted">
              （小さな球の重さの5000万分の1以下）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図2-9 外側の惑星に引かれて進み方が変わる天王星（動） ---------- */

export function FigUranus() {
  const sx = 210
  const sy = 160
  const ru = 80
  const rn = 125
  const TU = 6 // 天王星が1周する秒数。海王星はその2倍（実際は約84年と約165年）
  return (
    <Anim
      n="2-9"
      title="外側の惑星が前にあると天王星は速くなり、後ろにあると遅くなる"
      still={4.7}
      period={2 * TU}
      caption="内側の天王星は外側の海王星より速く回って海王星を追い越し、追い越す前は前へ引かれて少し速くなり、追い越した後は後ろへ引かれて少し遅くなります。軌道の大きさの比は実際に合わせ、引く力の大きさは実際よりずっと大きく描いた模式図です。"
    >
      {(t) => {
        const au = Math.PI + ((2 * Math.PI) / TU) * t
        const an = (Math.PI / TU) * t
        const u = { x: sx + ru * Math.cos(au), y: sy - ru * Math.sin(au) }
        const nn = { x: sx + rn * Math.cos(an), y: sy - rn * Math.sin(an) }
        const dx = nn.x - u.x
        const dy = nn.y - u.y
        const d = Math.hypot(dx, dy)
        const f = Math.min(50, 60 * (45 / d) ** 2)
        // 進む向き（反時計回り）の成分。正なら前へ引かれる
        const vx = -Math.sin(au)
        const vy = -Math.cos(au)
        const along = ((dx * vx + dy * vy) / d) * (45 / d) ** 2
        const g = Math.max(-1, Math.min(1, along / 0.4))
        const state = g > 0.15 ? ['海王星が前にある', '前へ引かれて速くなる'] : g < -0.15 ? ['海王星が後ろにある', '後ろへ引かれて遅くなる'] : ['海王星が遠い、または真横にある', '進み方はほとんど変わらない']
        return (
          <Svg id="2-9" w={720} h={320} label="太陽のまわりを回る天王星と海王星。天王星が海王星に追いつく前は前へ引かれて速くなり、追い越した後は後ろへ引かれて遅くなる。">
            <Orbit x={sx} y={sy} r={ru} />
            <Orbit x={sx} y={sy} r={rn} />
            <Sun x={sx} y={sy} r={9} />
            <T x={sx} y={sy + 22} anchor="middle" fs={12}>
              太陽
            </T>
            <Force x1={u.x} y1={u.y} x2={u.x + (dx / d) * f} y2={u.y + (dy / d) * f} />
            <Ball x={u.x} y={u.y} r={8} />
            <Ball x={nn.x} y={nn.y} r={8} fill="var(--fig-box5)" />
            <LegendRow x={400} y={34} kind="ball">
              天王星（内側。約84年で1周）
            </LegendRow>
            <LegendRow x={400} y={62} kind="ball2">
              海王星（外側。約165年で1周）
            </LegendRow>
            <LegendRow x={400} y={90} kind="force">
              海王星が天王星を引く力
            </LegendRow>
            <Arrow d={`M${sx + ru * Math.cos((250 * Math.PI) / 180)},${sy - ru * Math.sin((250 * Math.PI) / 180)} A${ru},${ru} 0 0 0 ${sx + ru * Math.cos((290 * Math.PI) / 180)},${sy - ru * Math.sin((290 * Math.PI) / 180)}`} />
            <T x={sx} y={sy + ru + 18} anchor="middle" fs={12} tone="muted">
              回る向き
            </T>
            <T x={400} y={162} fs={13}>
              {state[0]}
            </T>
            <T x={400} y={184} fs={13} tone="acc">
              {`→ ${state[1]}`}
            </T>
            <line x1={420} y1={240} x2={680} y2={240} stroke="var(--fig-line)" />
            <line x1={550} y1={232} x2={550} y2={248} stroke="var(--fig-line)" />
            <circle cx={550 + g * 120} cy={240} r={7} fill="var(--fig-accent)" />
            <T x={420} y={264} fs={12}>
              遅くなる
            </T>
            <T x={680} y={264} anchor="end" fs={12}>
              速くなる
            </T>
            <T x={550} y={222} anchor="middle" fs={12} tone="muted">
              天王星の進み方の変化
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図2-10 万有引力の理論が確かめられた出来事と、残った問題 ---------- */

const CHECKS = [
  { y: 1687, lines: ['1687年', '『プリンキピア』', '万有引力を発表'], kind: 'start' },
  { y: 1759, lines: ['1758〜1759年', 'ハレー彗星が', '予言どおり戻る'], kind: 'ok' },
  { y: 1798, lines: ['1798年', 'キャベンディッシュが', '地上で引力を測る'], kind: 'ok' },
  { y: 1846, lines: ['1846年', '計算した位置の', '近くで海王星を発見'], kind: 'ok' },
  { y: 1859, lines: ['1859年', '水星の軌道のずれが', '説明できない'], kind: 'ng' },
  { y: 1915, lines: ['1915年', '一般相対性理論が', '水星のずれを説明'], kind: 'next' },
] as const

export function FigChecks() {
  const x = (y: number) => 58 + (y - 1680) * 2.55
  return (
    <Figure
      n="2-10"
      title="万有引力の理論は予言を次々に当てたが、水星のずれは説明できなかった"
      caption="青で塗った点は、万有引力の計算が観測と合った出来事です。赤の×は、ルヴェリエが水星のずれの原因と考えた未知の惑星バルカンで、見つかりませんでした。点の間隔は年数に比例しています。"
    >
      <Svg id="2-10" w={720} h={270} label="1687年『プリンキピア』、1758〜1759年ハレー彗星の回帰、1798年キャベンディッシュの実験、1846年海王星の発見は万有引力の計算と合った。1859年に見つかった水星の軌道のずれは説明できず、1915年に一般相対性理論が説明した。">
        <Arrow x1={30} y1={135} x2={710} y2={135} />
        {CHECKS.map((c, i) => {
          const cxp = x(c.y)
          const up = i % 2 === 0
          const ty = up ? 42 : 168
          return (
            <g key={c.y}>
              <circle
                cx={cxp}
                cy={135}
                r={6}
                fill={c.kind === 'ok' ? 'var(--fig-accent)' : 'var(--fig-bg)'}
                stroke={c.kind === 'ng' ? 'var(--fig-danger)' : 'var(--fig-line)'}
                strokeWidth={1.5}
              />
              <line x1={cxp} y1={up ? 104 : 142} x2={cxp} y2={up ? 128 : 156} stroke="var(--fig-line)" />
              {c.lines.map((s, j) => (
                <T key={j} x={cxp} y={ty + j * 18} anchor="middle" fs={12} bold={j === 0} tone={c.kind === 'ng' && j > 0 ? 'danger' : undefined}>
                  {s}
                </T>
              ))}
            </g>
          )
        })}
        <Cross x={x(1859) - 52} y={240} s={7} />
        <T x={x(1859) - 38} y={240} fs={12} tone="danger">
          未知の惑星バルカン（見つからず）
        </T>
      </Svg>
    </Figure>
  )
}
