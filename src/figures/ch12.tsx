import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Cross, Force, Vel, clamp01, ease, rng } from './common'

/* ---------- 共通 ---------- */

const RED = '#d0453a' // 温度計の液と鮮やかな血の色（ライト・ダークとも同じ）

/** 縦の温度計。level は 0〜1 */
function Thermo({ x, top, bottom, level }: { x: number; top: number; bottom: number; level: number }) {
  const h = (bottom - top - 6) * clamp01(level)
  return (
    <g>
      <rect x={x - 4} y={top} width={8} height={bottom - top} rx={4} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <rect x={x - 2} y={bottom - h} width={4} height={h} fill={RED} />
      <circle cx={x} cy={bottom + 4} r={7} fill={RED} stroke="var(--fig-line)" />
    </g>
  )
}

/** 炎（模式図） */
function Flame({ x, y, t = 0 }: { x: number; y: number; t?: number }) {
  const k = 1 + 0.08 * Math.sin(t * 9)
  return (
    <g>
      {[-30, 0, 30].map((dx) => (
        <path
          key={dx}
          d={`M${x + dx - 9},${y} Q${x + dx - 10},${y - 14 * k} ${x + dx},${y - 26 * k} Q${x + dx + 10},${y - 14 * k} ${x + dx + 9},${y} Z`}
          fill="#f0a23a"
          stroke="#b5651d"
        />
      ))}
    </g>
  )
}

/** 気体の粒（決まった並び。energy が大きいほど大きく揺れる） */
const GAS = (() => {
  const r = rng(12)
  return Array.from({ length: 22 }, () => ({ u: r(), v: r(), p: r() * 6.28, q: r() * 6.28 }))
})()

function GasDots({ x, y, w, h, t, energy }: { x: number; y: number; w: number; h: number; t: number; energy: number }) {
  const amp = 3 + 6 * energy
  const sp = 2 + 5 * energy
  return (
    <g>
      {GAS.map((g, i) => (
        <circle
          key={i}
          cx={x + 10 + g.u * (w - 20) + amp * Math.sin(t * sp + g.p)}
          cy={y + 10 + g.v * (h - 20) + amp * Math.cos(t * sp * 1.3 + g.q)}
          r={3.5}
          fill="var(--fig-box3)"
          stroke="var(--fig-line)"
        />
      ))}
    </g>
  )
}

/* ---------- 図12-1 ランフォードの大砲の穴あけ（動） ---------- */

// [経過時間（時間）, 水の温度（℃）]。ランフォードの論文の華氏の値を摂氏に直したもの
const RUMFORD: [number, number][] = [
  [0, 15.6],
  [1, 41.7],
  [1.5, 61.1],
  [2, 81.1],
  [2 + 1 / 3, 93.3],
  [2.5, 98.9],
]
const tempAt = (h: number) => {
  for (let i = 1; i < RUMFORD.length; i++) {
    const [h0, c0] = RUMFORD[i - 1]
    const [h1, c1] = RUMFORD[i]
    if (h <= h1) return c0 + ((c1 - c0) * (h - h0)) / (h1 - h0)
  }
  return RUMFORD[RUMFORD.length - 1][1]
}
const hm = (h: number) => {
  const m = Math.round(h * 60)
  return `${Math.floor(m / 60)}時間${String(m % 60).padStart(2, '0')}分`
}
const BUBBLES = (() => {
  const r = rng(7)
  return Array.from({ length: 14 }, () => ({ x: 222 + r() * 186, p: r() }))
})()

export function FigRumford() {
  const gx = (h: number) => 520 + (h / 2.5) * 175
  const gy = (c: number) => 210 - (c / 100) * 160
  return (
    <Anim
      n="12-1"
      title="馬が筒を回し続けると、まわりの水が温まり、2時間30分で沸騰した"
      still={12}
      period={13}
      caption="ランフォードの1798年の論文の実験3をもとにした模式図です（大きさの比は実際と違います）。右のグラフの点は論文に書かれた水の温度で、華氏を摂氏に直しています。動きは実際の時間よりずっと速くしています。"
    >
      {(t) => {
        const h = Math.min(t, 10) / 4
        const c = tempAt(h)
        const boil = h >= 2.5
        const ang = t * 3.4
        const pts = RUMFORD.filter((p) => p[0] <= h + 1e-6)
        return (
          <Svg id="12-1" w={720} h={280} label="馬が回す装置で大砲から削り出した黄銅の筒を回し、先の丸い鋼の刃を押しつける。筒を沈めた木の箱の水は、約16℃から1時間で約42℃、2時間で約81℃になり、2時間30分で沸騰した。">
            <T x={20} y={24} fs={12.5}>
              {`経過時間：${hm(h)}`}
            </T>
            <T x={20} y={46} fs={12.5}>
              {`水の温度：約${Math.round(c)}℃`}
            </T>
            {boil && (
              <T x={20} y={68} fs={12.5} tone="acc">
                沸騰した（火は使っていない）
              </T>
            )}
            {/* 馬が回す装置 */}
            <rect x={20} y={120} width={60} height={60} rx={4} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <circle cx={50} cy={150} r={18} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <line x1={50} y1={150} x2={50 + 16 * Math.cos(ang)} y2={150 + 16 * Math.sin(ang)} stroke="var(--fig-line)" strokeWidth={2.5} />
            <line x1={80} y1={150} x2={90} y2={150} stroke="var(--fig-line)" strokeWidth={4} />
            {/* 大砲の本体 */}
            <rect x={90} y={120} width={100} height={60} rx={6} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={190} y={141} width={25} height={18} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            {/* 水の箱 */}
            <rect x={215} y={95} width={200} height={110} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={2} />
            {/* 黄銅の筒（回る） */}
            <rect x={225} y={125} width={100} height={50} rx={4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            {[0, 1, 2].map((k) => {
              const y = 125 + ((k * 17 + t * 30) % 50)
              return <line key={`c${k}`} x1={228} y1={y} x2={272} y2={y} stroke="var(--fig-muted)" />
            })}
            {[0, 1, 2].map((k) => {
              const y = 120 + ((k * 20 + t * 30) % 60)
              return <line key={`g${k}`} x1={100} y1={y} x2={180} y2={y} stroke="var(--fig-muted)" />
            })}
            <rect x={275} y={140} width={50} height={20} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            {/* 先の丸い鋼の刃と鉄の棒 */}
            <rect x={283} y={144} width={190} height={12} fill="var(--fig-line)" />
            <circle cx={284} cy={150} r={8} fill="var(--fig-line)" />
            <Force x1={480} y1={132} x2={428} y2={132} />
            <T x={430} y={114} fs={12}>
              押しつける力
            </T>
            {/* 温度計 */}
            <Thermo x={380} top={55} bottom={122} level={c / 100} />
            <T x={392} y={64} fs={11.5} tone="muted">
              温度計
            </T>
            {boil &&
              BUBBLES.map((b, i) => {
                const yy = 200 - ((t * 40 + b.p * 100) % 100)
                return yy > 100 && (yy < 122 || yy > 182) ? <circle key={i} cx={b.x} cy={yy} r={3} fill="none" stroke="var(--fig-line)" /> : null
              })}
            {/* 下の名前 */}
            <T x={50} y={226} anchor="middle" fs={12}>
              馬が引いて回す
            </T>
            <T x={140} y={226} anchor="middle" fs={12}>
              大砲の本体
            </T>
            <T x={300} y={226} anchor="middle" fs={12}>
              黄銅の筒と水（約8.5kg）
            </T>
            <T x={300} y={246} anchor="middle" fs={11.5} tone="muted">
              筒は大砲と一緒に回る
            </T>
            <T x={445} y={226} anchor="middle" fs={12}>
              先の丸い鋼の刃
            </T>
            {/* グラフ */}
            <line x1={gx(0)} y1={gy(0)} x2={gx(2.5) + 10} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(100) - 8} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(100)} x2={gx(2.5)} y2={gy(100)} stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <T x={gx(0)} y={gy(100) - 22} anchor="middle" fs={12}>
              水の温度
            </T>
            <T x={gx(0) - 6} y={gy(100)} anchor="end" fs={11.5} tone="muted">
              100℃
            </T>
            <T x={gx(0) - 6} y={gy(50)} anchor="end" fs={11.5} tone="muted">
              50℃
            </T>
            {[1, 2].map((k) => (
              <T key={k} x={gx(k)} y={gy(0) + 14} anchor="middle" fs={11.5} tone="muted">
                {`${k}時間`}
              </T>
            ))}
            <T x={gx(1.25)} y={gy(0) + 34} anchor="middle" fs={12}>
              経過時間
            </T>
            <polyline
              points={[...pts.map(([a, b]) => `${gx(a)},${gy(b)}`), `${gx(h)},${gy(c)}`].join(' ')}
              fill="none"
              stroke="var(--fig-accent)"
              strokeWidth={2}
            />
            {pts.map(([a, b]) => (
              <circle key={a} cx={gx(a)} cy={gy(b)} r={3.5} fill="var(--fig-bg)" stroke="var(--fig-accent)" strokeWidth={1.5} />
            ))}
            <circle cx={gx(h)} cy={gy(c)} r={5} fill="var(--fig-accent)" />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図12-2 年表 ---------- */

const ROAD = [
  { y: '1798年', who: 'ランフォード', what: ['大砲の穴あけで', '水を沸かす'] },
  { y: '1824年', who: 'カルノー', what: ['熱素説で', '熱機関の理論'] },
  { y: '1842年', who: 'マイヤー', what: ['熱と仕事の', '換算の値を出す'] },
  { y: '1845年', who: 'ジュール', what: ['羽根車の', '実験を始める'] },
  { y: '1847年', who: 'ヘルムホルツ', what: ['「力の保存に', 'ついて」'] },
  { y: '1850年', who: 'ジュール', what: ['羽根車の実験の', '最終の値'] },
  { y: '1850年', who: 'クラウジウス', what: ['熱と仕事が', '移り変わる原理'] },
]

export function FigTimeline() {
  return (
    <Figure n="12-2" title="熱の正体から、エネルギー保存の法則までの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="12-2" w={720} h={250} label="1798年にランフォードが大砲の穴あけで水を沸かし、1824年にカルノーが熱素説で熱機関の理論を書いた。1842年にマイヤーが熱と仕事の換算の値を出し、1845年にジュールが羽根車の実験を始めた。1847年にヘルムホルツが「力の保存について」を発表し、1850年にジュールが最終の値を、クラウジウスが熱と仕事が移り変わる原理を示した。">
        <Arrow x1={15} y1={125} x2={710} y2={125} />
        {ROAD.map((r, i) => {
          const x = 60 + i * 100
          const up = i % 2 === 0
          const ty = up ? 30 : 152
          return (
            <g key={`${r.y}${r.who}`}>
              <circle cx={x} cy={125} r={6} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 104 : 131} x2={x} y2={up ? 119 : 146} stroke="var(--fig-line)" />
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

/* ---------- 図12-3 マイヤーの血の色の考え ---------- */

function BloodPanel({ x, cold }: { x: number; cold: boolean }) {
  const rows = cold
    ? ['体から逃げる熱：多い', '体温を保つための燃焼：多い', '静脈の血に残る酸素：少ない']
    : ['体から逃げる熱：少ない', '体温を保つための燃焼：少ない', '静脈の血に残る酸素：多い']
  const arrows = cold ? [78, 108, 138] : [108]
  return (
    <g>
      <T x={x + 10} y={22} bold>
        {cold ? '寒い土地（ヨーロッパ）' : '暑い土地（ジャワ島）'}
      </T>
      <circle cx={x + 80} cy={66} r={13} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <rect x={x + 64} y={82} width={32} height={66} rx={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
      {arrows.map((y) => (
        <Arrow key={y} d={`M${x + 60},${y} q-8,-6 -16,0 q-8,6 -16,0 q-6,-4 -12,0`} />
      ))}
      <T x={x + 40} y={168} anchor="middle" fs={11.5} tone="muted">
        逃げる熱
      </T>
      {rows.map((r, i) => (
        <T key={r} x={x + 120} y={66 + i * 26} fs={12}>
          {r}
        </T>
      ))}
      <rect x={x + 120} y={150} width={56} height={34} rx={6} fill={cold ? '#5e1717' : RED} stroke="var(--fig-line)" />
      <T x={x + 186} y={167} fs={12.5}>
        {cold ? '暗い赤' : '鮮やかな赤'}
      </T>
      <T x={x + 120} y={202} fs={11.5} tone="muted">
        静脈の血の色
      </T>
    </g>
  )
}

export function FigMayerBlood() {
  return (
    <Figure
      n="12-3"
      title="マイヤーの考え：暑い土地では体温を保つための燃焼が少なく、静脈の血が赤く見える"
      caption="マイヤーの説明を図にした模式図です。波線の矢印は体から逃げる熱を表します。マイヤーは、体温を保つために体の中で燃やす量が、まわりの温度によって変わると考えました。"
    >
      <Svg id="12-3" w={720} h={215} label="寒い土地では体から逃げる熱が多く、体温を保つための燃焼が多いので、静脈の血に残る酸素が少なく暗い赤になる。暑い土地では逃げる熱が少なく燃焼も少ないので、静脈の血に酸素が多く残り、鮮やかな赤になる。">
        <BloodPanel x={0} cold />
        <line x1={360} y1={10} x2={360} y2={205} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <BloodPanel x={370} cold={false} />
      </Svg>
    </Figure>
  )
}

/* ---------- 図12-4 マイヤーの空気の計算 ---------- */

function GasPanel({ x, piston }: { x: number; piston: boolean }) {
  const top = piston ? 80 : 110
  const BX = x + 90
  const W = 130
  return (
    <g>
      <T x={x + 10} y={20} bold>
        {piston ? 'ピストンを押し上げながら温める' : '体積を変えずに温める'}
      </T>
      {/* 容器 */}
      <path d={`M${BX},${piston ? 60 : 104} L${BX},220 L${BX + W},220 L${BX + W},${piston ? 60 : 104}`} fill="none" stroke="var(--fig-line)" strokeWidth={2.5} />
      <rect x={BX + 1} y={top + 6} width={W - 2} height={220 - top - 7} fill="var(--fig-box3)" opacity={0.5} />
      <GasDots x={BX} y={top + 6} w={W} h={214 - top} t={0.6} energy={0.4} />
      {piston ? (
        <>
          <line x1={BX + 4} y1={110} x2={BX + W - 4} y2={110} stroke="var(--fig-muted)" strokeDasharray="4 4" />
          <T x={BX + W + 8} y={110} fs={11.5} tone="muted">
            初めの位置
          </T>
          <rect x={BX + 3} y={top - 4} width={W - 6} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
          <rect x={BX + 35} y={top - 30} width={60} height={26} rx={3} fill="var(--fig-box2)" stroke="var(--fig-line)" />
          <T x={BX + 65} y={top - 17} anchor="middle" fs={12}>
            おもり
          </T>
          <Vel x1={BX + W + 20} y1={top + 2} x2={BX + W + 20} y2={top - 34} />
          <T x={BX + W + 30} y={top - 18} fs={11.5} tone="muted">
            持ち上がる
          </T>
        </>
      ) : (
        <>
          <rect x={BX - 6} y={top - 4} width={W + 12} height={10} fill="var(--fig-line)" />
          <T x={BX + W / 2} y={top - 20} anchor="middle" fs={11.5} tone="muted">
            ふたを固定
          </T>
        </>
      )}
      <Flame x={BX + W / 2} y={250} />
      {/* 必要な熱の棒 */}
      <T x={x + 10} y={270} fs={12}>
        必要な熱
      </T>
      <rect x={x + 10} y={280} width={200} height={22} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={x + 110} y={291} anchor="middle" fs={12}>
        温度を上げる分
      </T>
      {piston && (
        <>
          <rect x={x + 210} y={280} width={84} height={22} fill="var(--fig-box4)" stroke="var(--fig-line)" />
          <T x={x + 252} y={316} anchor="middle" fs={12} tone="acc">
            仕事になった分
          </T>
        </>
      )}
    </g>
  )
}

export function FigMayerGas() {
  return (
    <Figure
      n="12-4"
      title="ピストンを押し上げながら温めると、余分に熱が要る。その差がおもりを持ち上げる仕事に当たる"
      caption="模式図です。左右とも空気の温度は同じだけ上げます。右のように膨らませながら温めると、左より約1.4倍の熱が要ることが当時すでに測られていました。マイヤーは、増えた分（「仕事になった分」）がおもりを持ち上げる仕事に変わったと考えました。"
    >
      <Svg id="12-4" w={720} h={325} label="左は体積を変えずに空気を温める。右はおもりをのせたピストンを押し上げながら同じ温度だけ温める。右の方が必要な熱が多く、増えた分がおもりを持ち上げる仕事になる。">
        <GasPanel x={0} piston={false} />
        <line x1={360} y1={10} x2={360} y2={318} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <GasPanel x={370} piston />
      </Svg>
    </Figure>
  )
}

/* ---------- 図12-5 ジュールの羽根車（動・スライダー） ---------- */

const FALL = 1.0 // 1回の落下にかける秒数（図の中）
const WIND = 0.25 // 巻き上げにかける秒数
const PER_FALL_F = 0.563 / 20 // 1回の落下で上がる水の温度（華氏）。1850年の論文の第1の実験系列から

export function FigPaddle() {
  const [n, setN] = useState(20)
  const period = n * (FALL + WIND) + 2
  const L = { x: 150, y: 95 }
  const R = { x: 570, y: 95 }
  return (
    <Anim
      n="12-5"
      title="おもりが落ちて羽根車が水をかき混ぜると、落ちた回数に比例して水の温度が上がる"
      still={period - 1}
      period={period}
      controls={<Range label="おもりを落とす回数" min={1} max={20} step={1} value={n} onChange={setN} format={(v) => `${v}回`} />}
      caption="ジュールの1850年の論文の装置をもとにした模式図です（大きさの比は実際と違います）。ジュールは約13kgのおもり2つを約1.6m落とす操作を20回くり返しました。「おもりを落とす回数」を変えると、おもりがした仕事と水が得た熱が、同じ割合で増えたり減ったりします。"
    >
      {(t) => {
        const cyc = FALL + WIND
        const run = Math.min(t, n * cyc)
        const k = Math.min(n, Math.floor(run / cyc))
        const in1 = run - k * cyc
        const f = k >= n ? 0 : Math.min(1, in1 / FALL)
        const winding = k < n - 1 && in1 > FALL // 最後の1回のあとは巻き上げない
        const done = k + f // 落ちた回数（途中を含む）
        const wy = 135 + (k >= n ? 1 : winding ? 1 - (in1 - FALL) / WIND : f) * 150
        const th = done * 6
        const dF = PER_FALL_F * done
        const BH = 170
        return (
          <Svg id="12-5" w={720} h={340} label="2つのおもりが滑車を通したひもで中央の軸を回し、水の入った容器の中の羽根車が水をかき混ぜる。落とした回数に比例して、おもりがした仕事と水が得た熱が増える。">
            <T x={20} y={24} fs={12.5}>
              {`おもりを落とした回数：${Math.floor(done + 1e-6)}回`}
            </T>
            <T x={20} y={46} fs={12.5} tone="acc">
              {`水の温度の上がり：華氏 約${dF.toFixed(2)}度（摂氏 約${((dF * 5) / 9).toFixed(2)}度）`}
            </T>
            {/* 床 */}
            <line x1={90} y1={312} x2={630} y2={312} stroke="var(--fig-line)" strokeWidth={2} />
            {/* 滑車とひも */}
            {[L, R].map((p, i) => {
              const side = i === 0 ? -1 : 1
              const hx = p.x + side * 20
              return (
                <g key={i}>
                  <line x1={360 + side * 15} y1={110} x2={p.x} y2={p.y - 20} stroke="var(--fig-line)" />
                  <circle cx={p.x} cy={p.y} r={20} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
                  <line x1={p.x} y1={p.y} x2={p.x + 16 * Math.cos(th * side)} y2={p.y + 16 * Math.sin(th * side)} stroke="var(--fig-line)" />
                  <line x1={hx} y1={p.y} x2={hx} y2={wy} stroke="var(--fig-line)" />
                  <rect x={hx - 16} y={wy} width={32} height={26} rx={3} fill="var(--fig-box2)" stroke="var(--fig-line)" />
                  {!winding && f > 0.05 && f < 0.95 && <Vel x1={hx + side * 26} y1={wy} x2={hx + side * 26} y2={wy + 26} />}
                </g>
              )
            })}
            <T x={130} y={328} anchor="middle" fs={12}>
              おもり（約13kg）
            </T>
            <T x={590} y={328} anchor="middle" fs={12}>
              おもり（約13kg）
            </T>
            <line x1={98} y1={135} x2={98} y2={311} stroke="var(--fig-muted)" strokeDasharray="3 3" />
            <T x={92} y={222} anchor="end" fs={11.5} tone="muted">
              約1.6m
            </T>
            {/* 軸と巻き胴 */}
            <line x1={360} y1={90} x2={360} y2={292} stroke="var(--fig-line)" strokeWidth={3} />
            <rect x={345} y={100} width={30} height={20} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
            {/* 容器 */}
            <rect x={290} y={180} width={140} height={120} rx={4} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={2} />
            <rect x={296} y={192} width={128} height={102} fill="var(--fig-box3)" />
            {[210, 240, 270].map((y) => {
              const w = 52 * Math.cos(th + y / 30)
              return <rect key={y} x={360 - Math.abs(w)} y={y - 5} width={2 * Math.abs(w)} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
            })}
            {[225, 255].map((y) => (
              <g key={y}>
                <rect x={297} y={y - 4} width={18} height={8} fill="var(--fig-line)" />
                <rect x={405} y={y - 4} width={18} height={8} fill="var(--fig-line)" />
              </g>
            ))}
            <line x1={280} y1={255} x2={297} y2={255} stroke="var(--fig-muted)" />
            <T x={276} y={255} anchor="end" fs={11.5} tone="muted">
              動かない仕切り
            </T>
            <line x1={440} y1={210} x2={412} y2={210} stroke="var(--fig-muted)" />
            <T x={444} y={210} fs={11.5} tone="muted">
              回る羽根
            </T>
            <Thermo x={414} top={140} bottom={186} level={0.15 + 0.8 * (done / 20)} />
            <T x={426} y={150} fs={11.5} tone="muted">
              温度計
            </T>
            <T x={284} y={190} anchor="end" fs={11.5} tone="muted">
              水の入った銅の容器
            </T>
            {/* 棒グラフ */}
            {[
              { x: 642, label: ['おもり', 'の仕事'], fill: 'var(--fig-box2)' },
              { x: 682, label: ['水が', '得た熱'], fill: 'var(--fig-box4)' },
            ].map((b) => (
              <g key={b.x}>
                <rect x={b.x} y={290 - BH} width={26} height={BH} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 3" />
                <rect x={b.x} y={290 - (BH * done) / 20} width={26} height={(BH * done) / 20} fill={b.fill} stroke="var(--fig-line)" />
                {b.label.map((s, j) => (
                  <T key={s} x={b.x + 13} y={304 + j * 16} anchor="middle" fs={11.5}>
                    {s}
                  </T>
                ))}
              </g>
            ))}
            <T x={675} y={106} anchor="middle" fs={11.5} tone="muted">
              20回分
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図12-6 熱の仕事当量の値の移り変わり ---------- */

const VALUES = [
  { label: 'ランフォード（1798年）', v: 1034, now: false },
  { label: 'マイヤー（1842年）', v: 665, now: false },
  { label: 'ジュール・発電機（1843年）', v: 838, now: false },
  { label: 'ジュール・羽根車（1845年）', v: 890, now: false },
  { label: 'ジュール・羽根車（1847年）', v: 781.5, now: false },
  { label: 'ジュール・羽根車（1850年）', v: 772, now: false },
  { label: '今の値', v: 778, now: true },
]

export function FigValues() {
  const X0 = 240
  const sc = 0.38
  return (
    <Figure
      n="12-6"
      title="熱の仕事当量の測定値は、実験の改良とともに今の値に近づいた"
      caption="1ポンドの水の温度を華氏1度上げる熱に当たる仕事を、フィート・ポンドで表しています。ランフォードの値は、1850年にジュールがランフォードの記録から計算したものです。マイヤーの値は、約365mという値をこの単位に換算したもので、約665です。点線は今の値（約778）です。"
    >
      <Svg id="12-6" w={720} h={300} label="熱の仕事当量の値。ランフォードの記録から1034、マイヤーは換算して約665、ジュールは1843年に838、1845年に890、1847年に781.5、1850年に772。今の値は約778。">
        {VALUES.map((r, i) => {
          const y = 40 + i * 32
          return (
            <g key={r.label}>
              <T x={X0 - 8} y={y} anchor="end" fs={12}>
                {r.label}
              </T>
              <rect x={X0} y={y - 10} width={r.v * sc} height={20} fill={r.now ? 'var(--fig-box4)' : 'var(--fig-box3)'} stroke="var(--fig-line)" />
              {r.v === 665 ? (
                <T x={X0 + r.v * sc - 6} y={y} anchor="end" fs={12}>
                  約665
                </T>
              ) : (
                <T x={X0 + r.v * sc + 6} y={y} fs={12}>
                  {String(r.v)}
                </T>
              )}
            </g>
          )
        })}
        <line x1={X0 + 778 * sc} y1={22} x2={X0 + 778 * sc} y2={262} stroke="var(--fig-accent)" strokeDasharray="5 4" strokeWidth={1.5} />
        <line x1={X0} y1={22} x2={X0} y2={262} stroke="var(--fig-line)" />
        <line x1={X0} y1={262} x2={X0 + 1100 * sc} y2={262} stroke="var(--fig-line)" />
        {[0, 500, 1000].map((v) => (
          <T key={v} x={X0 + v * sc} y={276} anchor="middle" fs={11.5} tone="muted">
            {String(v)}
          </T>
        ))}
        <T x={X0 + 550 * sc} y={293} anchor="middle" fs={12}>
          フィート・ポンド
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図12-7 永久機関の例 ---------- */

export function FigPerpetual() {
  const cx = 170
  const cy = 145
  const balls = [
    ...[-60, 0, 60].map((a) => ({ a, r: 128 })),
    ...[120, 150, 180, 210, 240].map((a) => ({ a, r: 62 })),
  ]
  return (
    <Figure n="12-7" title="おもりの位置を工夫した車輪は、回り続けない（永久機関の例）" caption="模式図です。赤の×は、実際には起こらないことを表します。おもりの並べ方をどう工夫しても、車輪はつり合う位置で止まります。">
      <Svg id="12-7" w={720} h={290} label="腕の先におもりを付けた車輪。右側のおもりは中心から遠いので右回りに回り続けると考えられたが、左側には多くのおもりが中心の近くに並ぶため、つり合って止まる。">
        <circle cx={cx} cy={cy} r={95} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={6} fill="var(--fig-line)" />
        {balls.map((b) => {
          const r = (b.a * Math.PI) / 180
          const bx = cx + b.r * Math.cos(r)
          const by = cy + b.r * Math.sin(r)
          return (
            <g key={b.a}>
              <line x1={cx} y1={cy} x2={bx} y2={by} stroke="var(--fig-line)" strokeWidth={1.5} />
              <circle cx={bx} cy={by} r={11} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
            </g>
          )
        })}
        <Arrow d={`M${cx - 75},${cy - 110} A130,130 0 0 1 ${cx + 15},${cy - 128}`} danger />
        <Cross x={cx + 42} y={cy - 128} />
        <T x={340} y={50} bold>
          考えられた仕組み
        </T>
        <T x={340} y={76} fs={12.5}>
          右側のおもりは中心から遠いので、右側が重くなり、
        </T>
        <T x={340} y={98} fs={12.5}>
          車輪は右回りに回り続けるはずだ。
        </T>
        <T x={340} y={160} bold>
          実際
        </T>
        <T x={340} y={186} fs={12.5}>
          左側には多くのおもりが中心の近くに並び、
        </T>
        <T x={340} y={208} fs={12.5}>
          右側の少ないおもりとつり合って止まる。
        </T>
        <T x={340} y={230} fs={12.5}>
          止まった車輪は、外から仕事をしてもらわない限り
        </T>
        <T x={340} y={252} fs={12.5}>
          動き出さない。
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図12-8 エネルギーの形の移り変わり（動・切り替え） ---------- */

type Chain = 'hydro' | 'body'
const CHAINS: Record<Chain, { name: string; form: string }[]> = {
  hydro: [
    { name: '高い所の水', form: '位置エネルギー' },
    { name: '流れ落ちる水', form: '運動エネルギー' },
    { name: '発電機と電線', form: '電気のエネルギー' },
    { name: '電灯', form: '光' },
  ],
  body: [
    { name: '太陽', form: '光' },
    { name: '植物・食べ物', form: '化学変化のエネルギー' },
    { name: '筋肉', form: '運動エネルギー' },
    { name: '持ち上げた荷物', form: '位置エネルギー' },
  ],
}
const LOSS = [0.15, 0.25, 0.35] // 移り変わるたびに熱になる割合（目安）
const STEP = 2

export function FigForms() {
  const [chain, setChain] = useState<Chain>('hydro')
  const boxes = CHAINS[chain]
  return (
    <Anim
      n="12-8"
      title="エネルギーは形を変えるたびに一部が熱になるが、合計は変わらない"
      still={7}
      period={8}
      controls={
        <Choice
          label="例"
          options={[
            { value: 'hydro', label: '水力発電' },
            { value: 'body', label: '人の体' },
          ]}
          value={chain}
          onChange={setChain}
        />
      }
      caption="模式図です。熱になる割合は説明のための目安で、実際の値ではありません。下の帯の長さは、エネルギーの合計がどの時点でも同じであることを表しています。「例」を切り替えると、別の移り変わりの例を見られます。"
    >
      {(t) => {
        const tt = Math.min(t, 3 * STEP + 0.5)
        const step = Math.min(3, Math.floor(tt / STEP))
        const frac = step < 3 ? ease((tt - step * STEP) / 1.2) : 0
        // 熱になった分の合計
        let left = 1
        let heat = 0
        for (let i = 0; i < 3; i++) {
          const part = i < step ? 1 : i === step ? frac : 0
          const lost = left * LOSS[i] * part
          heat += lost
          if (part === 1) left -= left * LOSS[i]
          else left -= lost
        }
        const bx = (i: number) => 20 + i * 180
        const px = step < 3 ? bx(step) + 70 + frac * 180 : bx(3) + 70
        return (
          <Svg id="12-8" w={720} h={300} label="エネルギーが、ある形から次の形へ移り変わる。移り変わるたびに一部が熱になってまわりへ逃げるが、逃げた熱まで含めると合計は変わらない。">
            {boxes.map((b, i) => (
              <g key={b.name}>
                <Box x={bx(i)} y={40} w={140} h={60} lines={[b.name, b.form]} fill={i === Math.min(3, step + (frac > 0.5 ? 1 : 0)) ? 'box3' : 'bg'} fs={12.5} bold subTone="muted" accent={i === Math.min(3, step + (frac > 0.5 ? 1 : 0))} />
                {i < 3 && <Arrow x1={bx(i) + 142} y1={70} x2={bx(i + 1) - 2} y2={70} />}
                {i < 3 && (step > i || (step === i && frac > 0.3)) && <Arrow d={`M${bx(i) + 160},${76} q8,14 0,28 q-8,14 0,28 q8,14 0,24`} dashed />}
              </g>
            ))}
            <circle cx={px} cy={120} r={7} fill="var(--fig-accent)" />
            <rect x={20} y={160} width={680} height={36} rx={4} fill="var(--fig-box2)" opacity={0.6} stroke="var(--fig-line)" strokeDasharray="4 3" />
            <T x={360} y={178} anchor="middle" fs={12.5}>
              熱になってまわりへ逃げた分
            </T>
            {/* 合計の帯 */}
            <T x={20} y={224} fs={12.5} bold>
              エネルギーの合計（変わらない）
            </T>
            <rect x={20} y={236} width={680 * left} height={26} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <rect x={20 + 680 * left} y={236} width={680 * heat} height={26} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={24} y={278} fs={11.5} tone="muted">
              いまの形のエネルギー（青）
            </T>
            <T x={696} y={278} anchor="end" fs={11.5} tone="muted">
              熱になった分（だいだい）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図12-9 熱力学第一法則（動・切り替え） ---------- */

type Mode = 'heat' | 'work' | 'expand'
const MODES: Record<Mode, { heat: number; work: number; out: number; text: string }> = {
  heat: { heat: 10, work: 0, out: 0, text: '加えた熱は、すべて内部エネルギーになる' },
  work: { heat: 0, work: 10, out: 0, text: '外からした仕事が、すべて内部エネルギーになる' },
  expand: { heat: 10, work: 0, out: 3, text: '加えた熱の一部が、おもりを持ち上げる仕事になる' },
}

export function FigFirstLaw() {
  const [mode, setMode] = useState<Mode>('heat')
  const m = MODES[mode]
  return (
    <Anim
      n="12-9"
      title="熱を加えても仕事をしても、内部エネルギーは同じように増える"
      still={6}
      period={7.5}
      controls={
        <Choice
          label="入れ方"
          options={[
            { value: 'heat', label: '火で温める' },
            { value: 'work', label: '羽根車で回す' },
            { value: 'expand', label: '温めて膨らませる' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="容器の中の空気を表す模式図です。右の2本の帯は、入ったエネルギーと、その行き先です。2本の高さはいつも等しくなります。「入れ方」を切り替えると、温度計の上がり方と帯の分かれ方が変わります。"
    >
      {(t) => {
        const p = ease(Math.min(t, 5) / 5)
        const inside = (m.heat + m.work - m.out) * p
        const top = mode === 'expand' ? 110 - 30 * p : 110
        const CX = 60
        const CW = 160
        const U = 17 // 帯の1単位の高さ
        const base = 270
        const wy = 100 + 90 * p
        const seg = (x: number, y0: number, v: number, fill: string) => (v > 0.01 ? <rect x={x} y={y0 - v * U * p} width={40} height={v * U * p} fill={fill} stroke="var(--fig-line)" /> : null)
        return (
          <Svg id="12-9" w={720} h={320} label="容器の中の空気に、火で熱を加える、羽根車で仕事をする、温めて膨らませる、の3つの場合。入ったエネルギーは、内部エネルギーの増えと、外にした仕事に分かれ、合計は等しい。">
            <T x={20} y={24} fs={12.5} tone="acc">
              {m.text}
            </T>
            {/* 容器 */}
            <path d={`M${CX},70 L${CX},260 L${CX + CW},260 L${CX + CW},70`} fill="none" stroke="var(--fig-line)" strokeWidth={2.5} />
            <rect x={CX + 1} y={top + 6} width={CW - 2} height={253 - top} fill="var(--fig-box3)" opacity={0.5} />
            <GasDots x={CX} y={top + 6} w={CW} h={254 - top} t={t} energy={inside / 10} />
            <rect x={CX + 3} y={top - 4} width={CW - 6} height={10} fill={mode === 'expand' ? 'var(--fig-box)' : 'var(--fig-line)'} stroke="var(--fig-line)" />
            {mode === 'expand' && (
              <>
                <rect x={CX + 50} y={top - 30} width={60} height={26} rx={3} fill="var(--fig-box2)" stroke="var(--fig-line)" />
                <T x={CX + 80} y={top - 17} anchor="middle" fs={12}>
                  おもり
                </T>
                {p > 0.05 && p < 0.97 && <Vel x1={CX + 125} y1={top} x2={CX + 125} y2={top - 30} />}
              </>
            )}
            {mode !== 'work' && <Flame x={CX + CW / 2} y={292} t={t} />}
            {mode === 'work' && (
              <>
                <line x1={CX + CW / 2} y1={60} x2={CX + CW / 2} y2={230} stroke="var(--fig-line)" strokeWidth={3} />
                {[150, 200].map((y) => {
                  const w = 55 * Math.cos(t * 4 + y)
                  return <rect key={y} x={CX + CW / 2 - Math.abs(w)} y={y - 5} width={2 * Math.abs(w)} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
                })}
                <rect x={CX + CW / 2 - 12} y={52} width={24} height={14} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
                <line x1={CX + CW / 2 + 12} y1={58} x2={262} y2={58} stroke="var(--fig-line)" />
                <circle cx={262} cy={72} r={14} fill="var(--fig-bg)" stroke="var(--fig-line)" />
                <line x1={276} y1={72} x2={276} y2={wy} stroke="var(--fig-line)" />
                <rect x={262} y={wy} width={28} height={24} rx={3} fill="var(--fig-box2)" stroke="var(--fig-line)" />
                <T x={276} y={wy + 40} anchor="middle" fs={11.5} tone="muted">
                  落ちるおもり
                </T>
              </>
            )}
            {/* 温度計 */}
            <Thermo x={mode === 'work' ? 320 : 270} top={110} bottom={240} level={0.15 + 0.07 * inside} />
            <T x={mode === 'work' ? 320 : 270} y={290} anchor="middle" fs={11.5} tone="muted">
              温度計
            </T>
            {/* 帯 */}
            <line x1={370} y1={base} x2={700} y2={base} stroke="var(--fig-line)" />
            {seg(380, base, m.heat, 'var(--fig-box2)')}
            {seg(380, base - m.heat * U * p, m.work, 'var(--fig-box5)')}
            {seg(560, base, m.heat + m.work - m.out, 'var(--fig-box3)')}
            {seg(560, base - (m.heat + m.work - m.out) * U * p, m.out, 'var(--fig-box4)')}
            {m.heat > 0 && (
              <T x={426} y={base - 20} fs={12}>
                加えた熱
              </T>
            )}
            {m.work > 0 && (
              <T x={426} y={base - 20} fs={12}>
                外からした仕事
              </T>
            )}
            <T x={606} y={base - 28} fs={12}>
              内部エネルギー
            </T>
            <T x={606} y={base - 12} fs={12}>
              の増え
            </T>
            {m.out > 0 && (
              <T x={606} y={base - (m.heat - m.out) * U * p - 18} fs={12}>
                外にした仕事
              </T>
            )}
            <T x={400} y={base + 18} anchor="middle" fs={12} bold>
              入ったもの
            </T>
            <T x={580} y={base + 18} anchor="middle" fs={12} bold>
              行き先
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図12-10 熱素説とエネルギーの考えの比較 ---------- */

const CMP: { head: string[]; a: string[]; b: string[]; bad?: boolean }[] = [
  { head: ['熱の正体'], a: ['目に見えず重さのない流体', '（熱素）'], b: ['エネルギーの一つの形', '（物をつくる分子の運動など）'] },
  { head: ['熱の量'], a: ['増えも減りもしない'], b: ['仕事から生まれ、', '仕事に変わると減る'] },
  { head: ['摩擦で出る熱'], a: ['金属の中の熱素が出てくる。', 'いつか尽きるはず'], b: ['仕事を続ける限り', '出続ける'] },
  { head: ['熱機関'], a: ['熱素が高温から低温へ流れるとき', '仕事をする。熱の量は減らない'], b: ['熱の一部が仕事に変わり、', '残りが低温の側へ流れる'] },
  { head: ['ランフォードと', 'ジュールの実験'], a: ['説明できない'], b: ['説明できる'], bad: true },
]

export function FigCompare() {
  const X0 = 150
  const CW = 274
  const RH = 50
  return (
    <Figure n="12-10" title="熱素説とエネルギーの考えの比較" caption="右の列は、1850年ごろにクラウジウスがまとめた考えです。左の列の考えは、ランフォードとジュールの実験の結果と合いませんでした（赤の×）。">
      <Svg id="12-10" w={720} h={340} label="熱素説とエネルギーの考えの比較表。熱の正体、熱の量、摩擦で出る熱、熱機関、ランフォードとジュールの実験の5項目。熱素説では熱は増えも減りもしない流体だが、エネルギーの考えでは熱は仕事から生まれ、仕事に変わると減る。">
        <Box x={X0} y={10} w={CW} h={36} lines="熱素説" fill="box2" bold />
        <Box x={X0 + CW + 6} y={10} w={CW} h={36} lines="エネルギーの考え" fill="box3" bold />
        {CMP.map((r, i) => {
          const y = 52 + i * (RH + 6)
          return (
            <g key={r.head[0]}>
              <Box x={10} y={y} w={X0 - 16} h={RH} lines={r.head} fill="box" fs={12.5} />
              <Box x={X0} y={y} w={CW} h={RH} lines={r.a} fill="bg" fs={12} />
              <Box x={X0 + CW + 6} y={y} w={CW} h={RH} lines={r.b} fill="bg" fs={12} />
              {r.bad && <Cross x={X0 + 60} y={y + RH / 2} s={8} />}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}
