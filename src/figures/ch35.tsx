import { useState } from 'react'
import { Compare, Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Range } from '../components/controls'
import { Ball, Cross, Force, Trail, Vel, clamp01, wave } from './common'

/** ブラックホールの黒（ダークモードでも黒く見せる） */
const HOLE = '#0b0c0f'
/** 光るガスの色 */
const GLOW = '#e9a23b'

/* ---------- 図35-1 地球を縮めると、抜け出すのに必要な速さが増える（スライダー） ---------- */

const SHRINK = [
  { r: '約6400km（実際の地球）', v: 11.2, label: '秒速約11.2km', px: 88 },
  { r: '約3200km（半分）', v: 15.8, label: '秒速約15.8km', px: 64 },
  { r: '約64km', v: 112, label: '秒速約110km', px: 42 },
  { r: '約640m', v: 1120, label: '秒速約1100km', px: 28 },
  { r: '約6.4m', v: 11200, label: '秒速約1万1000km', px: 17 },
  { r: '約6.4cm', v: 112000, label: '秒速約11万km', px: 9 },
  { r: '約9mm', v: 299792, label: '秒速約30万km（光の速さ）', px: 4 },
]
const EX = (v: number) => 300 + (Math.log10(v) / 5.5) * 350

export function FigEscape() {
  const [i, setI] = useState(0)
  const s = SHRINK[i]
  const last = i === SHRINK.length - 1
  return (
    <Figure
      n="35-1"
      title="地球を同じ質量のまま縮めると、抜け出すのに必要な速さが大きくなる"
      controls={<Range label="地球の半径" min={0} max={SHRINK.length - 1} value={i} onChange={setI} format={(k) => SHRINK[k].r} />}
      caption="「地球の半径」を動かすと、地表から投げ上げた物が二度と戻ってこないために必要な速さが変わります。半径約9mmまで縮めると、その速さは光の速さに等しくなります。左の球の大きさは実際の比ではありません。右の棒の目盛りは1つ進むごとに10倍になります。"
    >
      <Svg id="35-1" w={680} h={250} label="同じ質量のまま地球を縮めると、地表から抜け出すのに必要な速さが大きくなる。実際の地球では秒速約11.2km、半径を半分にすると秒速約15.8km、半径約9mmまで縮めると光の速さに等しくなる。">
        <T x={130} y={16} anchor="middle" fs={12} tone="muted">
          質量はそのまま
        </T>
        <circle cx={130} cy={120} r={s.px} fill={last ? HOLE : 'var(--fig-box3)'} stroke="var(--fig-line)" strokeWidth={1.5} />
        <T x={130} y={226} anchor="middle" fs={12.5}>
          {`半径 ${s.r}`}
        </T>
        <T x={300} y={40} bold>
          抜け出すのに必要な速さ
        </T>
        <T x={EX(299792)} y={40} anchor="end" fs={12} tone="muted">
          光の速さ
        </T>
        <line x1={EX(299792)} y1={52} x2={EX(299792)} y2={150} stroke="var(--fig-line)" strokeDasharray="4 4" />
        <T x={300} y={72} tone="acc">
          {s.label}
        </T>
        <rect x={300} y={95} width={Math.max(4, EX(s.v) - 300)} height={26} rx={3} fill="var(--fig-box3)" stroke="var(--fig-accent)" strokeWidth={1.5} />
        <line x1={300} y1={150} x2={655} y2={150} stroke="var(--fig-line)" />
        {[
          [1, '1'],
          [10, '10'],
          [100, '100'],
          [1000, '1000'],
          [10000, '1万'],
          [100000, '10万'],
        ].map(([v, l]) => (
          <g key={l}>
            <line x1={EX(Number(v))} y1={150} x2={EX(Number(v))} y2={156} stroke="var(--fig-line)" />
            <T x={EX(Number(v))} y={168} anchor="middle" fs={11.5} tone="muted">
              {l}
            </T>
          </g>
        ))}
        <T x={300} y={192} fs={12} tone="muted">
          秒速（km）。目盛りが1つ進むと10倍
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図35-2 陽子4個からヘリウムの原子核ができる（動） ---------- */

/** 陽子（陽）と中性子（中）の丸 */
function Nucleon({ x, y, n }: { x: number; y: number; n?: boolean }) {
  return (
    <Ball x={x} y={y} r={12} fill={n ? 'var(--fig-box4)' : 'var(--fig-box2)'}>
      <T x={x} y={y} anchor="middle" fs={11.5} bold>
        {n ? '中' : '陽'}
      </T>
    </Ball>
  )
}

export function FigFusion() {
  const cx = 200
  const cy = 120
  const corners = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]
  return (
    <Anim
      n="35-2"
      title="水素の原子核（陽子）4個から、ヘリウムの原子核1個ができる"
      still={5}
      period={7}
      caption="途中の反応を省き、始めと終わりだけを示した模式図です。実際は何段階かの反応を経て、その途中で陽子2個が中性子に変わります。できたヘリウムの原子核は陽子4個の合計より軽く、減った質量の分がエネルギーとして出ます。減る質量は1%に満たない量で、右の棒では大きく描いています。"
    >
      {(t) => {
        const tt = t % 7
        const k = clamp01(tt / 2)
        const near = 90 - 77 * k * k
        const formed = tt >= 2.4
        const glow = tt >= 3 ? Math.min(1, (tt - 3) / 2) : 0
        const msg = tt < 2 ? '4個の陽子が近づく' : tt < 3 ? '途中で陽子2個が中性子に変わる' : 'ヘリウムの原子核ができ、エネルギーが出る'
        return (
          <Svg id="35-2" w={700} h={260} label="4個の陽子が近づき、途中で2個が中性子に変わって、陽子2個と中性子2個のヘリウムの原子核ができる。ヘリウムの原子核は陽子4個の合計より少し軽く、減った質量の分のエネルギーが光などとして出る。">
            {glow > 0 &&
              [-35, 180, 90].map((deg) => (
                <g key={deg} transform={`rotate(${deg} ${cx} ${cy})`}>
                  <path d={wave(cx + 32, cy, 18 + 50 * glow, 5, 14, -tt * 8)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
                </g>
              ))}
            {corners.map(([dx, dy], j) => (
              <Nucleon key={j} x={cx + dx * near} y={cy + dy * near} n={formed && j >= 2} />
            ))}
            {glow > 0 && (
              <T x={330} y={44} fs={12} tone="acc">
                エネルギー（光など）
              </T>
            )}
            <T x={cx} y={240} anchor="middle" fs={12.5}>
              {msg}
            </T>
            <T x={460} y={40} bold>
              質量をくらべる
            </T>
            <T x={460} y={78} fs={12.5}>
              陽子4個の合計
            </T>
            <rect x={460} y={90} width={200} height={22} rx={3} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={460} y={138} fs={12.5}>
              ヘリウムの原子核
            </T>
            {formed && (
              <>
                <rect x={460} y={150} width={180} height={22} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" />
                <rect x={640} y={150} width={20} height={22} fill="none" stroke="var(--fig-accent)" strokeDasharray="4 3" />
                <T x={660} y={196} anchor="end" fs={12} tone="acc">
                  減った質量
                </T>
                <T x={660} y={214} anchor="end" fs={12} tone="acc">
                  → エネルギーになる
                </T>
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図35-3 恒星の中の力のつり合い ---------- */

export function FigBalance() {
  const cx = 175
  const cy = 140
  const at = (deg: number, r: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)] as const
  return (
    <Figure n="35-3" title="恒星は内向きの重力と、中から外へ押す力がつり合って大きさを保つ" caption="恒星の断面の模式図です。青の矢印は力を表し、外側から内向きの矢印が重力、内側から外向きの矢印が中から押す力です。大きさや温度の分布は実際の比ではありません。">
      <Svg id="35-3" w={680} h={280} label="恒星の断面。外側から中心へ向かう重力と、中心の核融合で熱せられたガスと光が外へ押す力がつり合っている。燃料の水素が尽きると、押す力が弱まり、中心が縮み始める。">
        <circle cx={cx} cy={cy} r={105} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={34} fill="var(--fig-bg)" stroke="var(--fig-line)" />
        <T x={cx} y={cy - 8} anchor="middle" fs={12}>
          中心
        </T>
        <T x={cx} y={cy + 9} anchor="middle" fs={12}>
          核融合
        </T>
        {[45, 135, 225, 315].map((d) => {
          const [x1, y1] = at(d, 136)
          const [x2, y2] = at(d, 108)
          return <Force key={d} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
        {[0, 90, 180, 270].map((d) => {
          const [x1, y1] = at(d, 42)
          const [x2, y2] = at(d, 92)
          return <Force key={d} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
        <T x={340} y={36} bold>
          今の太陽：2つの力がつり合う
        </T>
        <Force x1={378} y1={72} x2={342} y2={72} />
        <T x={390} y={72}>
          重力：星を中心へ引き縮める
        </T>
        <Force x1={342} y1={106} x2={378} y2={106} />
        <T x={390} y={106}>
          中から外へ押す力
        </T>
        <T x={390} y={126} fs={12} tone="muted">
          核融合で熱せられたガスと光による
        </T>
        <T x={340} y={164}>
          中心の温度：約1500万度
        </T>
        <T x={340} y={184} fs={12} tone="muted">
          水素の原子核がくっついてヘリウムになる
        </T>
        <T x={340} y={222} bold>
          燃料の水素が尽きると
        </T>
        <T x={340} y={244}>
          押す力が弱まり、中心が縮み始める
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図35-4 白色矮星の質量と大きさ（スライダー） ---------- */

/** チャンドラセカールの限界（太陽の質量を1とする） */
const MCH = 1.44
/** 相対性理論を入れない計算の半径（地球の半径を1とする目安） */
const rNonRel = (m: number) => 1.2285 / Math.cbrt(m / MCH)
/** 相対性理論を入れた計算の半径（近似の式。限界で0になる） */
const rRel = (m: number) => (m >= MCH ? 0 : rNonRel(m) * Math.sqrt(1 - (m / MCH) ** (4 / 3)))
const WX = (m: number) => 70 + m * 200
const WY = (r: number) => 230 - r * 60

export function FigWhiteDwarf() {
  const [m, setM] = useState(0.6)
  const mm = Math.round(m * 10) / 10
  const ok = mm < MCH
  const r = rRel(mm)
  const curve = (f: (m: number) => number, to: number) =>
    Array.from({ length: 80 }, (_, k) => 0.16 + ((to - 0.16) * k) / 79)
      .map((v, k) => `${k ? 'L' : 'M'}${WX(v).toFixed(1)},${WY(f(v)).toFixed(1)}`)
      .join(' ')
  return (
    <Figure
      n="35-4"
      title="重い白色矮星ほど小さく、太陽の約1.4倍を超えると重力を支えきれない"
      controls={<Range label="白色矮星の質量" min={0.2} max={1.6} step={0.1} value={m} onChange={setM} format={(v) => `太陽の${(Math.round(v * 10) / 10).toFixed(1)}倍`} />}
      caption="「白色矮星の質量」を動かすと、グラフの点と右の球の大きさが変わります。相対性理論を入れた計算（実線）では、太陽の約1.4倍で半径が0になり、それより重い星はつり合う大きさを持てません。相対性理論を入れない計算（点線）には、この限界が現れません。曲線は近似の式で描いた目安です。"
    >
      <Svg id="35-4" w={700} h={290} label="横軸は白色矮星の質量、縦軸は半径。重いほど半径は小さくなる。相対性理論を入れた計算では、太陽の約1.4倍で半径が0になり、それより重い白色矮星はない。相対性理論を入れない計算には限界がない。">
        <T x={20} y={26} fs={12}>
          半径（地球の半径を1とする）
        </T>
        <line x1={WX(0)} y1={WY(0)} x2={WX(0)} y2={WY(3)} stroke="var(--fig-line)" />
        <line x1={WX(0)} y1={WY(0)} x2={WX(1.65)} y2={WY(0)} stroke="var(--fig-line)" />
        {[1, 2, 3].map((v) => (
          <T key={v} x={WX(0) - 8} y={WY(v)} anchor="end" fs={11.5} tone="muted">
            {v}
          </T>
        ))}
        {[0.5, 1, 1.5].map((v) => (
          <g key={v}>
            <line x1={WX(v)} y1={WY(0)} x2={WX(v)} y2={WY(0) + 5} stroke="var(--fig-line)" />
            <T x={WX(v)} y={WY(0) + 17} anchor="middle" fs={11.5} tone="muted">
              {v}
            </T>
          </g>
        ))}
        <T x={WX(1.65)} y={WY(0) + 40} anchor="end" fs={12}>
          質量（太陽の質量を1とする）
        </T>
        <line x1={WX(MCH)} y1={WY(0)} x2={WX(MCH)} y2={WY(2.1)} stroke="var(--fig-line)" strokeDasharray="4 4" />
        <T x={WX(MCH) + 6} y={WY(2.1)} fs={12}>
          限界：太陽の
        </T>
        <T x={WX(MCH) + 6} y={WY(2.1) + 17} fs={12}>
          約1.4倍
        </T>
        <path d={curve(rNonRel, 1.62)} fill="none" stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="5 4" />
        <path d={curve(rRel, MCH)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
        <line x1={200} y1={48} x2={226} y2={48} stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="5 4" />
        <T x={232} y={48} fs={12}>
          相対性理論なし（1926年）
        </T>
        <line x1={200} y1={70} x2={226} y2={70} stroke="var(--fig-accent)" strokeWidth={2.5} />
        <T x={232} y={70} fs={12}>
          相対性理論あり（1930年）
        </T>
        {ok ? <circle cx={WX(mm)} cy={WY(r)} r={5.5} fill="var(--fig-accent)" /> : <Cross x={WX(mm)} y={WY(0) - 14} s={7} />}
        {/* 右：大きさの比較 */}
        <T x={570} y={20} anchor="middle" bold>
          {`質量 太陽の${mm.toFixed(1)}倍`}
        </T>
        <circle cx={570} cy={135} r={40} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 4" />
        {ok && <circle cx={570} cy={135} r={Math.max(2, r * 40)} fill="var(--fig-box3)" fillOpacity={0.85} stroke="var(--fig-accent)" strokeWidth={1.5} />}
        {!ok && <Cross x={570} y={135} />}
        <T x={570} y={250} anchor="middle" fs={12.5} tone={ok ? undefined : 'danger'}>
          {ok ? `半径 地球の約${r.toFixed(1)}倍` : 'つり合う大きさがなく、つぶれていく'}
        </T>
        <T x={570} y={272} anchor="middle" fs={12} tone="muted">
          点線の円：地球の大きさ
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図35-5 パルサー：回る電波の束（動） ---------- */

export function FigPulsar() {
  const sx = 120
  const sy = 200
  const tilt = (60 * Math.PI) / 180
  const P = 2
  const ex = sx + Math.sin(tilt) * 300
  const ey = sy - Math.cos(tilt) * 300
  /** 時刻 τ に地球に届く電波の強さ（0〜1） */
  const signal = (tau: number) => {
    const ph = (((2 * Math.PI * tau) / P) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
    const d = Math.min(ph, 2 * Math.PI - ph)
    return Math.exp(-(d * d) / (2 * 0.16 * 0.16))
  }
  const GX0 = 340
  const GX1 = 700
  const GB = 285
  const win = 6
  return (
    <Anim
      n="35-5"
      title="自転する中性子星の電波の束が地球の方向を通るたびに、信号が届く"
      still={4}
      period={60}
      caption="中性子星の自転の軸（縦の点線）と、電波の束を出す極の向き（斜めの点線）はずれています。星が1回転するたびに電波の束が地球の方向を通り、右下のグラフのように短い信号が規則正しく届きます（模式図）。最初に見つかったパルサーでは、約1.3秒ごとに信号が届きました。"
    >
      {(t) => {
        const phi = (2 * Math.PI * t) / P
        const bx = Math.sin(tilt) * Math.cos(phi)
        const by = -Math.cos(tilt)
        const len = Math.hypot(bx, by)
        const ux = bx / len
        const uy = by / len
        const beam = (sgn: number, L: number) => {
          const w = 0.13
          const ax = sgn * ux
          const ay = sgn * uy
          const p1 = [sx + L * (ax * Math.cos(w) - ay * Math.sin(w)), sy + L * (ax * Math.sin(w) + ay * Math.cos(w))]
          const p2 = [sx + L * (ax * Math.cos(-w) - ay * Math.sin(-w)), sy + L * (ax * Math.sin(-w) + ay * Math.cos(-w))]
          return `M${sx},${sy} L${p1[0].toFixed(1)},${p1[1].toFixed(1)} L${p2[0].toFixed(1)},${p2[1].toFixed(1)} Z`
        }
        const pts: string[] = []
        for (let k = 0; k <= 200; k++) {
          const tau = t - win + (win * k) / 200
          if (tau < 0) continue
          const x = GX0 + ((tau - (t - win)) / win) * (GX1 - GX0)
          pts.push(`${pts.length ? 'L' : 'M'}${x.toFixed(1)},${(GB - 60 * signal(tau)).toFixed(1)}`)
        }
        const hit = signal(t) > 0.5
        return (
          <Svg id="35-5" w={720} h={320} label="縦の自転の軸のまわりを、斜めに傾いた電波の束が回る。束が右上の地球の方向を通るたびに、地球に短い電波の信号が届き、グラフには一定の間隔でとがった山が並ぶ。">
            <path d={beam(1, 272 * len)} fill="var(--fig-accent)" fillOpacity={hit ? 0.35 : 0.2} stroke="none" />
            <path d={beam(-1, 150 * len)} fill="var(--fig-accent)" fillOpacity={0.2} stroke="none" />
            <line x1={sx} y1={60} x2={sx} y2={300} stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <line x1={sx - ux * 40} y1={sy - uy * 40} x2={sx + ux * 40} y2={sy + uy * 40} stroke="var(--fig-line)" strokeDasharray="5 3" />
            <Ball x={sx} y={sy} r={13} fill="var(--fig-box3)" />
            <T x={sx + 8} y={48} fs={12} tone="muted">
              自転の軸
            </T>
            <T x={sx - 22} y={sy} anchor="end" fs={12.5}>
              中性子星
            </T>
            <Ball x={ex} y={ey} r={11} fill={hit ? 'var(--fig-accent)' : 'var(--fig-box4)'} />
            <T x={ex + 18} y={ey} fs={12.5}>
              地球
            </T>
            <T x={GX0} y={150} fs={12} tone="muted">
              青い扇形：電波の束
            </T>
            <T x={GX0} y={196} fs={12.5} bold>
              地球に届く電波の強さ
            </T>
            <line x1={GX0} y1={GB} x2={GX1} y2={GB} stroke="var(--fig-line)" />
            <T x={GX1} y={GB + 18} anchor="end" fs={12} tone="muted">
              時間 →
            </T>
            <path d={pts.join(' ')} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図35-6 縮み続ける星を遠くから見る（動） ---------- */

const C_R0 = 92
const C_RS = 34
const C_TAU = 3
const C_V = 200
/** 星の表面で同じ間隔で出した光が、遠くの観測者の時計で星を出る時刻 */
const EMITS = Array.from({ length: 14 }, (_, k) => {
  const s = k * 0.34
  return { e: -C_TAU * Math.log(1 - s / 5), f: 1 - s / 5 }
})

export function FigCollapse() {
  const cx = 130
  const cy = 120
  const obs = 640
  return (
    <Anim
      n="35-6"
      title="縮み続ける星を遠くから見ると、縮み方が遅くなり、届く光の間隔が延びて弱くなる"
      still={4.5}
      period={13}
      caption="星の表面から同じ間隔で出した光の波を、遠くの観測者が受け取るようすの模式図です。星がシュヴァルツシルトの半径（点線の円）に近づくほど、光が届く間隔は長くなり、波長は伸びて（赤い側へずれて）、光は弱くなります。星と一緒に落ちていく人の時計では、縮みきるまでの時間は1日ほどです。"
    >
      {(t) => {
        const tt = t % 13
        const R = C_RS + (C_R0 - C_RS) * Math.exp(-tt / C_TAU)
        const fade = clamp01((R - C_RS) / (C_R0 - C_RS))
        const arrive = EMITS.map((p) => p.e + (obs - 20 - (cx + C_RS + (C_R0 - C_RS) * Math.exp(-p.e / C_TAU))) / C_V)
        return (
          <Svg id="35-6" w={720} h={260} label="縮んでいく星から一定の間隔で出た光の波が、右の遠くの観測者へ進む。星がシュヴァルツシルトの半径に近づくほど、波の間隔が広がり、波長が伸び、波が弱くなる。下の時間の線では、光が届く時刻の間隔がしだいに長くなる。">
            <T x={cx} y={16} anchor="middle" fs={12.5}>
              縮んでいく星
            </T>
            <circle cx={cx} cy={cy} r={R} fill="var(--fig-box2)" fillOpacity={0.25 + 0.75 * fade} stroke="var(--fig-line)" strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={C_RS} fill="none" stroke="var(--fig-line)" strokeDasharray="4 4" />
            {EMITS.map((p, k) => {
              if (tt < p.e) return null
              const x0 = cx + C_RS + (C_R0 - C_RS) * Math.exp(-p.e / C_TAU) + 4 + C_V * (tt - p.e)
              if (x0 > obs - 30) return null
              const wl = Math.min(60, 9 / p.f)
              const len = Math.min(obs - 30 - x0, Math.min(66, 2.2 * wl))
              return <path key={k} d={wave(x0, cy, len, Math.max(2, 9 * Math.sqrt(p.f)), wl)} fill="none" stroke="var(--fig-line)" strokeWidth={1.8} />
            })}
            <Ball x={obs + 20} y={cy} r={10} fill="var(--fig-box3)" />
            <T x={obs + 20} y={cy - 26} anchor="middle" fs={12.5}>
              遠くの観測者
            </T>
            <T x={220} y={196} fs={12}>
              観測者に光が届く時刻
            </T>
            <line x1={220} y1={225} x2={690} y2={225} stroke="var(--fig-line)" />
            {arrive.map((a, k) =>
              a <= tt && a < 13 ? <line key={k} x1={220 + a * 36} y1={219} x2={220 + a * 36} y2={231} stroke="var(--fig-accent)" strokeWidth={2} /> : null,
            )}
            <T x={690} y={246} anchor="end" fs={12} tone="muted">
              時刻 →
            </T>
            <T x={cx} y={246} anchor="middle" fs={12} tone="muted">
              点線：シュヴァルツシルトの半径
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図35-7 星の質量で変わる一生の終わり方 ---------- */

const FATES = [
  { start: ['太陽の約8倍より', '軽い星（太陽など）'], mid: ['赤色巨星になり、', '外側のガスが広がる'], end: ['白色矮星', '地球ほどの大きさ'], fill: 'box3' as const },
  { start: ['太陽の約8倍より', '重い星'], mid: ['大きく膨らみ、', '最後に超新星'], end: ['中性子星', '直径約20km'], fill: 'box4' as const },
  { start: ['太陽の約20倍', '以上の星'], mid: ['大きく膨らみ、', '最後に超新星'], end: ['ブラックホール', '光も出てこない'], fill: 'box5' as const },
]

export function FigFates() {
  return (
    <Figure n="35-7" title="生まれたときの質量によって、恒星の最期と、あとに残る天体が変わる" caption="境目の質量はおおよその値です。重い恒星ほど燃料を速く使い、短い時間で一生を終えます。残る天体の大きさは実際の比ではありません（模式図）。">
      <Svg id="35-7" w={720} h={330} label="太陽の約8倍より軽い星は赤色巨星になって外側のガスが広がり、白色矮星が残る。約8倍より重い星は最後に超新星を起こし、中性子星が残る。約20倍以上の星では、超新星のあとにブラックホールが残る。">
        {['生まれたときの質量', 'その後', '残る天体'].map((h, k) => (
          <T key={h} x={[100, 360, 620][k]} y={22} anchor="middle" fs={12.5} bold>
            {h}
          </T>
        ))}
        {FATES.map((f, k) => {
          const y = 48 + k * 96
          return (
            <g key={k}>
              <Box x={20} y={y} w={160} h={64} lines={f.start} fs={12.5} />
              <Arrow x1={184} y1={y + 32} x2={276} y2={y + 32} />
              <Box x={280} y={y} w={160} h={64} lines={f.mid} fs={12.5} fill="box2" />
              <Arrow x1={444} y1={y + 32} x2={536} y2={y + 32} />
              <Box x={540} y={y} w={160} h={64} lines={f.end} fs={12.5} fill={f.fill} bold subTone="muted" />
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図35-8 銀河の中心を回る星 S2（動） ---------- */

const S2 = { a: 1000, e: 0.88, scale: 0.2, fx: 214, fy: 150 }
const S2B = S2.a * Math.sqrt(1 - S2.e * S2.e)
/** 離心近点角 E のときの図の上の位置 */
const s2pos = (E: number) => ({
  x: S2.fx - S2.scale * S2.a * (Math.cos(E) - S2.e),
  y: S2.fy - S2.scale * S2B * Math.sin(E),
})
const S2_ORBIT = Array.from({ length: 121 }, (_, k) => {
  const p = s2pos((2 * Math.PI * k) / 120)
  return [p.x, p.y] as [number, number]
})

export function FigS2() {
  const P = 9
  return (
    <Anim
      n="35-8"
      title="天の川銀河の中心を、星S2が16年足らずで1周する"
      still={8.85}
      period={P}
      caption="軌道を真上から見た形に直した模式図で、星の速さの変化は実際の軌道の計算に合わせています。黒の矢印は星の速さと向きです。いて座A*に最も近づくときの距離は、太陽から海王星までの約4倍で、そこでは星が光の速さの約3%で動きます。"
    >
      {(t) => {
        const M = (2 * Math.PI * (t % P)) / P
        let E = M
        for (let k = 0; k < 8; k++) E -= (E - S2.e * Math.sin(E) - M) / (1 - S2.e * Math.cos(E))
        const p = s2pos(E)
        const rr = 1 - S2.e * Math.cos(E)
        const speed = Math.sqrt((1 + S2.e * Math.cos(E)) / rr) / Math.sqrt((1 + S2.e) / (1 - S2.e))
        const dx = S2.a * Math.sin(E)
        const dy = -S2B * Math.cos(E)
        const dl = Math.hypot(dx, dy)
        const L = 6 + 58 * speed
        const year = 2002 + (16 * (t % P)) / P
        return (
          <Svg id="35-8" w={680} h={300} label="いて座A*のまわりを、星S2が細長い楕円の軌道で回る。いて座A*に近い所では速く、遠い所ではゆっくり動く。最も近づいたのは2002年と2018年。">
            <Trail points={S2_ORBIT} />
            <circle cx={S2.fx} cy={S2.fy} r={5} fill={HOLE} stroke="var(--fig-line)" />
            <T x={160} y={150} anchor="end" fs={12.5}>
              いて座A*
            </T>
            <T x={160} y={170} anchor="end" fs={12} tone="muted">
              太陽の約400万倍の質量
            </T>
            <line x1={172} y1={122} x2={S2.fx - S2.scale * S2.a * (1 - S2.e) + 2} y2={S2.fy - 6} stroke="var(--fig-muted)" />
            <T x={170} y={98} anchor="end" fs={12}>
              最も近づく点
            </T>
            <T x={170} y={116} anchor="end" fs={12} tone="muted">
              2002年、2018年
            </T>
            <Vel x1={p.x} y1={p.y} x2={p.x + (dx / dl) * L} y2={p.y + (dy / dl) * L} />
            <Ball x={p.x} y={p.y} r={7} fill="var(--fig-box2)" />
            <T x={660} y={30} anchor="end" bold>
              {`${Math.floor(year)}年`}
            </T>
            <T x={660} y={50} anchor="end" fs={12} tone="muted">
              星S2の位置
            </T>
            <line x1={440} y1={275} x2={640} y2={275} stroke="var(--fig-line)" />
            <line x1={440} y1={269} x2={440} y2={281} stroke="var(--fig-line)" />
            <line x1={640} y1={269} x2={640} y2={281} stroke="var(--fig-line)" />
            <T x={540} y={258} anchor="middle" fs={12} tone="muted">
              太陽と地球の距離の1000倍
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図35-9 ブラックホールの近くで曲がる光（動） ---------- */

const LB = { cx: 350, cy: 150, rs: 20, xmax: 560 }
/** 回転しないブラックホールのまわりの光の道筋（事象の地平面の半径を1とする単位で計算し、図の座標に直す） */
function lightPath(b: number) {
  let phi = Math.atan2(b, 16)
  let u = 1 / Math.hypot(16, b)
  let du = Math.cos(phi) / b
  const f = (u0: number, d0: number) => [d0, -u0 + 1.5 * u0 * u0]
  const pts: [number, number][] = []
  const h = 0.004
  let captured = false
  for (let k = 0; k < 6000; k++) {
    const r = 1 / u
    const x = LB.cx + LB.rs * -r * Math.cos(phi)
    const y = LB.cy - LB.rs * r * Math.sin(phi)
    if (k % 3 === 0) pts.push([x, y])
    if (u >= 1) {
      captured = true
      break
    }
    if (x > LB.xmax || x < 0 || y < 0 || y > 300 || (u < 1 / 18 && du < 0)) break
    const [a1, b1] = f(u, du)
    const [a2, b2] = f(u + (h / 2) * a1, du + (h / 2) * b1)
    const [a3, b3] = f(u + (h / 2) * a2, du + (h / 2) * b2)
    const [a4, b4] = f(u + h * a3, du + h * b3)
    u += (h / 6) * (a1 + 2 * a2 + 2 * a3 + a4)
    du += (h / 6) * (b1 + 2 * b2 + 2 * b3 + b4)
    phi += h
  }
  const cum = [0]
  for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]))
  return { pts, cum, captured }
}
const RAYS = [1.5, 2.3, 2.75, 3.3, 5.5].map(lightPath)

export function FigLightBend() {
  const v = 160
  return (
    <Anim
      n="35-9"
      title="ブラックホールの近くを通る光は大きく曲がり、近すぎる光は吸い込まれる"
      still={4.5}
      period={6}
      caption="回転していないブラックホールのまわりの光の道筋を、一般相対性理論の式で計算して描いた模式図です。光はすべて左から、高さを変えて同じ向きに進みます。事象の地平面の半径の2倍半ほどより内側をねらって進んだ光は、地平面に吸い込まれます。そのため、光るガスを背景にすると、ブラックホールは地平面より大きな黒い影に見えます。"
    >
      {(t) => {
        const s = v * (t % 6)
        return (
          <Svg id="35-9" w={720} h={300} label="左から高さを変えて進む5本の光。ブラックホールから遠い光は少し曲がり、近い光は大きく曲がって後ろ向きに進む。さらに近い2本は事象の地平面に吸い込まれる。外から見た影は事象の地平面より大きい。">
            <circle cx={LB.cx} cy={LB.cy} r={LB.rs * 2.6} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <circle cx={LB.cx} cy={LB.cy} r={LB.rs} fill={HOLE} stroke="var(--fig-line)" />
            {RAYS.map((ray, k) => {
              let n = ray.cum.findIndex((c) => c > s)
              if (n < 0) n = ray.pts.length
              const shown = ray.pts.slice(0, Math.max(1, n))
              const head = shown[shown.length - 1]
              const done = n >= ray.pts.length
              return (
                <g key={k}>
                  {shown.length > 1 && <Trail points={shown} />}
                  {!done && <Ball x={head[0]} y={head[1]} r={4} fill="var(--fig-accent)" stroke="var(--fig-accent)" />}
                </g>
              )
            })}
            <circle cx={36} cy={196} r={8} fill={HOLE} stroke="var(--fig-line)" />
            <T x={52} y={196} fs={12}>
              事象の地平面
            </T>
            <circle cx={36} cy={222} r={8} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 3" />
            <T x={52} y={222} fs={12}>
              外から見た影
            </T>
            <line x1={26} y1={248} x2={46} y2={248} stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="3 4" />
            <T x={52} y={248} fs={12}>
              光の道筋
            </T>
            <line x1={292} y1={170} x2={334} y2={146} stroke="var(--fig-muted)" />
            <T x={288} y={176} anchor="end" fs={12} tone="acc">
              吸い込まれる
            </T>
            <T x={566} y={150} fs={12} tone="acc">
              わずかに曲がる
            </T>
            <T x={470} y={282} fs={12} tone="acc">
              大きく曲がる
            </T>
            <T x={226} y={284} anchor="end" fs={12} tone="acc">
              後ろ向きに進む
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図35-10 撮影された2つのブラックホールの特徴（模式図） ---------- */

function Shadow({ id, label, lines }: { id: string; label: string; lines: string[] }) {
  return (
    <Svg id={id} w={300} h={230} label={label}>
      <circle cx={150} cy={82} r={58} fill="none" stroke={GLOW} strokeWidth={20} strokeOpacity={0.85} />
      <circle cx={150} cy={82} r={48} fill={HOLE} />
      <circle cx={150} cy={82} r={19} fill="none" stroke="#9aa0aa" strokeDasharray="3 3" />
      {lines.map((l, k) => (
        <T key={l} x={150} y={170 + k * 20} anchor="middle" fs={12.5}>
          {l}
        </T>
      ))}
    </Svg>
  )
}

export function FigShadow() {
  return (
    <Figure
      n="35-10"
      title="撮影された2つのブラックホールは、どちらも明るいリングに囲まれた暗い影として写った"
      caption="観測画像を転載せず、特徴だけを描いた模式図です。明るいリングはブラックホールのまわりの光るガスから来た光で、内側の暗い部分が影です。中の点線の円は事象の地平面の大きさの目安で、画像には写りません。影の大きさは事象の地平面の2倍半ほどです。"
    >
      <Compare
        panels={[
          {
            label: 'M87の中心のブラックホール（2019年発表）',
            children: <Shadow id="35-10a" label="M87の中心のブラックホールの模式図。明るいリングの内側に暗い影があり、影の中に、より小さな事象の地平面がある。" lines={['距離：約5500万光年', '質量：太陽の約65億倍']} />,
          },
          {
            label: 'いて座A*（2022年発表）',
            children: <Shadow id="35-10b" label="天の川銀河の中心のいて座A*の模式図。M87のブラックホールと同じように、明るいリングの内側に暗い影がある。" lines={['距離：約2万7000光年', '質量：太陽の約400万倍']} />,
          },
        ]}
      />
    </Figure>
  )
}
