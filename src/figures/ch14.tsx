import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Force, Trail, Vel, rng } from './common'

/*
 * 第14章の図。分子の動きは乱数の種を決めて作り、開くたびに同じ動きにする。
 *   図14-3・14-4・14-7・14-9：分子どうしの衝突を省き、壁で跳ね返る動きを式で求める（時刻 t から位置を直接計算する）。
 *   図14-5：はじめに同じ速さを持たせた分子を、でたらめに選んだ2個ずつぶつけて、速さの分布の変化を1回だけ計算する。
 *   図14-10：仕切りの穴を通す・通さないを決めながら、時間を細かく刻んで1回だけ計算する。
 */

/** 計算を1回だけ行い、結果をとっておく */
function once<R>(make: () => R): () => R {
  let r: R | undefined
  return () => (r ??= make())
}

/** 平均0・ばらつき1の正規分布に従う乱数 */
function gauss(r: () => number): number {
  const u = Math.max(1e-6, r())
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

/** 壁で跳ね返る動き。まっすぐ進んだときの位置 X を 0〜L の範囲に折り返す */
function fold(X: number, L: number): number {
  const p = ((X % (2 * L)) + 2 * L) % (2 * L)
  return p <= L ? p : 2 * L - p
}

interface Mol {
  /** 0〜1 の位置（箱の幅・高さに対する割合） */
  x: number
  y: number
  /** 速さ（ピクセル毎秒） */
  vx: number
  vy: number
}

/** n 個の分子。位置は箱の中に一様に、速さの成分は正規分布で決める。xmax で横の置き場所を左側に限る */
function makeMols(seed: number, n: number, sigma: number, xmax = 1): Mol[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => ({ x: r() * xmax, y: r(), vx: gauss(r) * sigma, vy: gauss(r) * sigma }))
}

/** 箱（内側の幅 Lx・高さ Ly）の中で、時刻 t の分子の位置 */
const posAt = (m: Mol, t: number, Lx: number, Ly: number) => ({ x: fold(m.x * Lx + m.vx * t, Lx), y: fold(m.y * Ly + m.vy * t, Ly) })

/* ---------- 図14-1 研究の流れ ---------- */

const ROAD = [
  { y: '1738年', who: 'ベルヌーイ', what: ['気体の圧力を', '粒の衝突で説明'] },
  { y: '1857年', who: 'クラウジウス', what: ['分子の速さを', '計算'] },
  { y: '1858年', who: 'クラウジウス', what: ['分子がぶつかる', 'までの距離'] },
  { y: '1860年', who: 'マクスウェル', what: ['分子の速さの', '分布'] },
  { y: '1867年', who: 'マクスウェル', what: ['「悪魔」の', '思考実験'] },
  { y: '1876年', who: 'ロシュミット', what: ['動きを逆にする', '反論'] },
  { y: '1877年', who: 'ボルツマン', what: ['エントロピーと', '並び方の数'] },
]

export function FigRoad() {
  return (
    <Figure n="14-1" title="気体の分子の運動から熱を説明する研究の流れ" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="14-1" w={720} h={250} label="1738年にベルヌーイが気体の圧力を粒の衝突で説明した。1857年にクラウジウスが分子の速さを計算し、1858年に分子がぶつかるまでの距離を考えた。1860年にマクスウェルが速さの分布を示し、1867年に悪魔の思考実験を考えた。1876年にロシュミットが反論し、1877年にボルツマンがエントロピーと並び方の数を結びつけた。">
        <Arrow x1={20} y1={125} x2={705} y2={125} />
        {ROAD.map((r, i) => {
          const x = 60 + i * 100
          const up = i % 2 === 0
          const ty = up ? 30 : 152
          return (
            <g key={r.y}>
              <circle cx={x} cy={125} r={6} fill={i === 6 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
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

/* ---------- 図14-2 1個の衝突と、たくさんの衝突 ---------- */

/** 壁を押す力の時間変化（模式図）。n 回の衝突を細い縦線で、短い時間ごとの平均を太い線で描く */
function HitGraph({ x, y, w, h, n, seed, title }: { x: number; y: number; w: number; h: number; n: number; seed: number; title: string }) {
  const r = rng(seed)
  const hits = Array.from({ length: n }, () => ({ t: r(), s: 0.55 + 0.45 * r() }))
  const sig = 0.035
  const avg = (u: number) => hits.reduce((a, q) => a + q.s * Math.exp(-((u - q.t) ** 2) / (2 * sig * sig)), 0)
  const norm = (n * 0.775 * sig * Math.sqrt(2 * Math.PI)) / 0.3 // 長い時間の平均が高さの3割になるようにそろえる
  let d = ''
  for (let i = 0; i <= 60; i++) {
    const u = 0.04 + (i / 60) * 0.92
    d += `${i ? 'L' : 'M'}${(x + u * w).toFixed(1)},${(y + h - Math.min(0.92, avg(u) / norm) * h).toFixed(1)}`
  }
  return (
    <g>
      <T x={x} y={y - 12} fs={12.5}>
        {title}
      </T>
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke="var(--fig-line)" />
      {hits.map((q, i) => (
        <line key={i} x1={x + q.t * w} y1={y + h} x2={x + q.t * w} y2={y + h - q.s * h * 0.9} stroke="var(--fig-muted)" strokeWidth={1} />
      ))}
      <path d={d} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
    </g>
  )
}

export function FigWallHit() {
  return (
    <Figure
      n="14-2"
      title="分子が壁に当たると壁を押す。たくさん当たると、押す力はほぼ一定になる"
      caption="模式図です。右の2つのグラフの灰色の縦線は1回1回の衝突で壁を押す力、青の線は短い時間ごとに平均した力です。分子が多いほど、平均した力はほとんど変わらなくなります。これが気体の圧力です。"
    >
      <Svg id="14-2" w={720} h={260} label="左：分子が壁に向かって進み、当たって跳ね返る。そのとき壁は外向きに押される。右：分子が少ないと壁を押す力の平均は大きく揺れるが、分子がとても多いと平均した力はほぼ一定になる。">
        <T x={20} y={22} fs={12.5} bold>
          1個の分子が壁に当たる
        </T>
        <rect x={286} y={50} width={14} height={190} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={293} y={250} anchor="middle" fs={12} tone="muted">
          壁
        </T>
        <Trail points={[[60, 210], [272, 140], [70, 70]]} />
        <Ball x={110} y={193} r={11} />
        <Vel x1={124} y1={188} x2={176} y2={171} />
        <T x={60} y={232} fs={12}>
          当たる前
        </T>
        <Ball x={272} y={140} r={11} />
        <Ball x={120} y={87} r={11} />
        <Vel x1={106} y1={82} x2={56} y2={65} />
        <T x={130} y={58} fs={12}>
          跳ね返った後
        </T>
        <Force x1={302} y1={140} x2={344} y2={140} />
        <T x={312} y={115} fs={12} tone="acc">
          分子が壁を
        </T>
        <T x={312} y={165} fs={12} tone="acc">
          押す力
        </T>
        <HitGraph x={400} y={52} w={300} h={66} n={10} seed={3} title="分子が少ないとき" />
        <HitGraph x={400} y={170} w={300} h={66} n={260} seed={5} title="分子がとても多いとき" />
        <T x={700} y={252} anchor="end" fs={12} tone="muted">
          時間 →
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図14-3 箱の中の分子と圧力（動・スライダー） ---------- */

const BOX_MOLS = once(() => makeMols(14, 40, 100))
const T_BASE = 27 + 273.15

export function FigBox() {
  const [temp, setTemp] = useState(27)
  const [vol, setVol] = useState<'full' | 'half'>('full')
  const ratio = (temp + 273.15) / T_BASE
  const s = Math.sqrt(ratio)
  const half = vol === 'half'
  const p = ratio * (half ? 2 : 1)
  const X0 = 30
  const Y0 = 50
  const W = 340
  const H = 200
  const R = 6
  const w = half ? W / 2 : W
  const Lx = w - 2 * R
  const Ly = H - 2 * R
  const wallX = X0 + w
  const gy = (v: number) => 250 - (v / 6) * 200
  const fmt = (v: number) => v.toFixed(1)
  return (
    <Anim
      n="14-3"
      title="温度を上げても、体積を小さくしても、気体の圧力は大きくなる"
      still={1.8}
      controls={
        <>
          <Range label="温度" min={-123} max={627} step={150} value={temp} onChange={setTemp} format={(v) => `${v}℃`} />
          <Choice
            label="箱の体積"
            options={[
              { value: 'full', label: 'もとの大きさ' },
              { value: 'half', label: '半分' },
            ]}
            value={vol}
            onChange={setVol}
          />
        </>
      }
      caption="青の短い矢印は、分子が右の壁に当たって壁を押す力です。「温度」を上げると分子が速くなり、「箱の体積」を半分にすると右の壁に当たる回数が2倍になります。27℃から327℃のように、マイナス273.15℃を0度とする目盛り（絶対温度）で温度が2倍になると、圧力も2倍になります。分子どうしの衝突を省いた模式図です。"
    >
      {(t) => (
        <Svg id="14-3" w={720} h={290} label="箱の中を分子が飛び回り、右の壁に当たって壁を押す。温度を上げると分子が速くなり圧力が増える。箱の体積を半分にすると壁に当たる回数が増え、圧力が2倍になる。">
          <rect x={X0} y={Y0} width={W} height={H} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 4" />
          {half && (
            <T x={X0 + W * 0.75} y={Y0 + H + 16} anchor="middle" fs={12} tone="muted">
              （体積を半分にした）
            </T>
          )}
          <rect x={X0} y={Y0} width={w} height={H} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
          <line x1={wallX} y1={Y0} x2={wallX} y2={Y0 + H} stroke="var(--fig-line)" strokeWidth={4} />
          {BOX_MOLS().map((m, i) => {
            const vx = m.vx * s
            const X = m.x * Lx + vx * t
            const q = posAt({ ...m, vx, vy: m.vy * s }, t, Lx, Ly)
            // 最後に右の壁に当たってからの時間
            const k = vx > 0 ? Math.floor((X - Lx) / (2 * Lx)) : Math.ceil((X - Lx) / (2 * Lx))
            const Xc = Lx + 2 * Lx * k
            const since = vx !== 0 && (vx > 0 ? Xc >= m.x * Lx : Xc <= m.x * Lx) ? (X - Xc) / vx : Infinity
            const hy = since < 0.3 ? Y0 + R + fold(m.y * Ly + m.vy * s * (t - since), Ly) : 0 // 当たったときの高さ
            return (
              <g key={i}>
                <Ball x={X0 + R + q.x} y={Y0 + R + q.y} r={R} />
                {since < 0.3 && <Force x1={wallX + 3} y1={hy} x2={wallX + 16 + Math.abs(vx) * 0.12} y2={hy} />}
              </g>
            )
          })}
          <T x={X0} y={Y0 - 16} fs={12.5}>
            気体の分子が入った箱（右の壁が受ける力を見る）
          </T>
          {/* 圧力の目盛り */}
          <rect x={440} y={gy(6)} width={24} height={200} fill="var(--fig-bg)" stroke="var(--fig-line)" />
          <rect x={440} y={gy(p)} width={24} height={gy(0) - gy(p)} fill="var(--fig-accent)" opacity={0.75} />
          {[0, 1, 2, 3, 4, 5, 6].map((v) => (
            <g key={v}>
              <line x1={464} y1={gy(v)} x2={470} y2={gy(v)} stroke="var(--fig-line)" />
              <T x={474} y={gy(v)} fs={11.5} tone="muted">
                {v === 0 ? '0' : `${v}倍`}
              </T>
            </g>
          ))}
          <T x={452} y={Y0 - 16} anchor="middle" fs={12.5}>
            圧力
          </T>
          <T x={530} y={80} fs={12.5}>
            {`温度：${temp}℃`}
          </T>
          <T x={530} y={104} fs={12.5}>
            {`箱の体積：${half ? '半分' : 'もとの大きさ'}`}
          </T>
          <T x={530} y={128} fs={12.5}>
            {`分子の速さ：${fmt(s)}倍`}
          </T>
          <T x={530} y={158} fs={13} tone="acc" bold>
            {`圧力：${fmt(p)}倍`}
          </T>
          <T x={530} y={196} fs={11.5} tone="muted">
            27℃・もとの大きさの
          </T>
          <T x={530} y={214} fs={11.5} tone="muted">
            ときを1倍とする
          </T>
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図14-4 ジグザグに進む分子（動） ---------- */

const ZZ = { x0: 20, y0: 30, w: 680, h: 190, speed: 100, lambda: 18, T: 12 }

/** 出発点が中央の、でたらめな向きに折れ曲がる道筋。枠からはみ出さない種を探して使う */
const ZIGZAG = once(() => {
  for (let seed = 1; seed < 500; seed++) {
    const r = rng(seed * 7 + 3)
    const pts: [number, number][] = [[ZZ.x0 + ZZ.w / 2, ZZ.y0 + ZZ.h / 2]]
    let len = 0
    let ok = true
    while (len < ZZ.speed * ZZ.T + 40) {
      const a = 2 * Math.PI * r()
      const l = -ZZ.lambda * Math.log(Math.max(1e-4, r()))
      const [px, py] = pts[pts.length - 1]
      const q: [number, number] = [px + l * Math.cos(a), py + l * Math.sin(a)]
      if (q[0] < ZZ.x0 + 12 || q[0] > ZZ.x0 + ZZ.w - 12 || q[1] < ZZ.y0 + 12 || q[1] > ZZ.y0 + ZZ.h - 12) ok = false
      pts.push(q)
      len += l
    }
    const end = pts[pts.length - 1]
    const dist = Math.hypot(end[0] - pts[0][0], end[1] - pts[0][1])
    if (ok && dist > 110 && dist < 200) return pts
  }
  return [[ZZ.x0 + ZZ.w / 2, ZZ.y0 + ZZ.h / 2]] as [number, number][]
})

/** 道のり s のところまでの点の並び */
function walkUpTo(pts: [number, number][], s: number): [number, number][] {
  const out: [number, number][] = [pts[0]]
  let left = s
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]
    const [bx, by] = pts[i]
    const l = Math.hypot(bx - ax, by - ay)
    if (left <= l) {
      out.push([ax + ((bx - ax) * left) / l, ay + ((by - ay) * left) / l])
      return out
    }
    out.push(pts[i])
    left -= l
  }
  return out
}

const ZZ_CROWD = once(() => makeMols(41, 46, 40))

export function FigZigzag() {
  const scale = 0.4
  return (
    <Anim
      n="14-4"
      title="分子は速く動いているが、ぶつかるたびに向きが変わり、出発点からなかなか離れない"
      still={ZZ.T}
      period={ZZ.T + 2.5}
      caption="青の丸が注目している1個の分子で、点線は通った道筋です。下の2本の棒は、通った道のりと、出発点からまっすぐ測った距離を比べています。分子の大きさや、ぶつかるまでに進む距離は、実際の比とは違う模式図です。"
    >
      {(t) => {
        const tt = Math.min(t, ZZ.T)
        const path = walkUpTo(ZIGZAG(), ZZ.speed * tt)
        const [sx, sy] = path[0]
        const [cx, cy] = path[path.length - 1]
        const dist = Math.hypot(cx - sx, cy - sy)
        return (
          <Svg id="14-4" w={720} h={300} label="注目している分子が、ほかの分子とぶつかるたびに向きを変え、折れ曲がった道筋を進む。通った道のりは長いが、出発点からの距離は短い。">
            <rect x={ZZ.x0} y={ZZ.y0} width={ZZ.w} height={ZZ.h} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            {ZZ_CROWD().map((m, i) => {
              const q = posAt(m, t, ZZ.w - 8, ZZ.h - 8)
              return <circle key={i} cx={ZZ.x0 + 4 + q.x} cy={ZZ.y0 + 4 + q.y} r={4} fill="var(--fig-box2)" stroke="var(--fig-muted)" />
            })}
            <Trail points={path} />
            <line x1={sx} y1={sy} x2={cx} y2={cy} stroke="var(--fig-line)" strokeWidth={1.5} />
            <circle cx={sx} cy={sy} r={4} fill="var(--fig-line)" />
            <Ball x={cx} y={cy} r={6} fill="var(--fig-accent)" />
            <T x={ZZ.x0} y={16} fs={12.5}>
              ほかの分子とぶつかるたびに、向きが変わる
            </T>
            <T x={20} y={246} fs={12}>
              通った道のり
            </T>
            <rect x={150} y={238} width={ZZ.speed * tt * scale} height={16} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={20} y={276} fs={12}>
              出発点からの距離
            </T>
            <rect x={150} y={268} width={Math.max(1, dist * scale)} height={16} fill="var(--fig-accent)" opacity={0.75} />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図14-5 ぶつかり合ううちに速さがばらつく（動） ---------- */

const SP = { n: 2000, rounds: 12, bins: 30, binW: 0.1, step: 0.7 }

/** はじめはすべて速さ1。2個ずつでたらめに選んでぶつけ、1回ずつ（全体で n/2 回）ごとの速さの分布を返す */
const SPREAD = once(() => {
  const r = rng(1860)
  const unit = () => {
    const z = 2 * r() - 1
    const a = 2 * Math.PI * r()
    const s = Math.sqrt(1 - z * z)
    return [s * Math.cos(a), s * Math.sin(a), z]
  }
  const v = Array.from({ length: SP.n }, () => unit())
  const hist = () => {
    const h = new Array(SP.bins).fill(0)
    for (const u of v) {
      const b = Math.floor(Math.hypot(u[0], u[1], u[2]) / SP.binW + 1e-9)
      if (b < SP.bins) h[b] += 1 / SP.n
    }
    return h
  }
  const out = [hist()]
  for (let k = 0; k < SP.rounds; k++) {
    for (let c = 0; c < SP.n / 2; c++) {
      const i = Math.floor(r() * SP.n)
      let j = Math.floor(r() * SP.n)
      if (j === i) j = (j + 1) % SP.n
      // 重さの等しい2個の弾性衝突：重心の速さはそのまま、相対速度の大きさを保って向きだけを変える
      const a = v[i]
      const b = v[j]
      const g = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
      const half = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 2
      const e = unit()
      v[i] = [g[0] + half * e[0], g[1] + half * e[1], g[2] + half * e[2]]
      v[j] = [g[0] - half * e[0], g[1] - half * e[1], g[2] - half * e[2]]
    }
    out.push(hist())
  }
  return out
})

/** 速さの2乗の平均が1のときのマクスウェルの分布（幅 binW の区間に入る割合） */
const maxwell1 = (v: number) => Math.sqrt(2 / Math.PI) * v * v * 5.196152 * Math.exp(-1.5 * v * v) * SP.binW

export function FigSpread() {
  const gx = (v: number) => 70 + (v / 3) * 600
  const top = 0.22
  const gy = (f: number) => 240 - (Math.min(f, top) / top) * 170
  let curve = ''
  for (let i = 0; i <= 90; i++) {
    const v = (i / 90) * 3
    curve += `${i ? 'L' : 'M'}${gx(v).toFixed(1)},${gy(maxwell1(v + SP.binW / 2)).toFixed(1)}`
  }
  return (
    <Anim
      n="14-5"
      title="同じ速さで動き始めても、ぶつかり合ううちに速さはばらばらになり、決まった形に落ち着く"
      still={SP.rounds * SP.step + 0.5}
      period={SP.rounds * SP.step + 3}
      caption="2000個の分子を、はじめはすべて同じ速さにして、でたらめに選んだ2個ずつをぶつけた計算です。棒の高さは、その速さの分子が全体に占める割合です。灰色の枠は、はじめの状態（すべての分子がこの速さ）です。点線は、最後に落ち着く形として計算したマクスウェルの分布です。"
    >
      {(t) => {
        const H = SPREAD()
        const x = Math.min(t / SP.step, SP.rounds)
        const k = Math.min(Math.floor(x), SP.rounds - 1)
        const f = x - k
        const h = H[k].map((a, i) => a + (H[k + 1][i] - a) * f)
        return (
          <Svg id="14-5" w={720} h={290} label="はじめはすべての分子が同じ速さだが、ぶつかり合ううちに速さがばらつき、遅い分子と速い分子は少なく、中間の速さの分子が多い形に落ち着く。">
            <line x1={gx(0)} y1={gy(0)} x2={gx(3) + 10} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(top) - 10} stroke="var(--fig-line)" />
            <T x={gx(0) - 8} y={gy(top) - 18} anchor="end" fs={12}>
              分子の数
            </T>
            <T x={gx(0) - 8} y={gy(top) - 2} anchor="end" fs={12}>
              の割合
            </T>
            {h.map((a, i) => (
              <rect key={i} x={gx(i * SP.binW) + 1} y={gy(a)} width={gx(SP.binW) - gx(0) - 2} height={gy(0) - gy(a)} fill="var(--fig-accent)" opacity={0.7} />
            ))}
            <rect x={gx(1) + 1} y={gy(top)} width={gx(SP.binW) - gx(0) - 2} height={gy(0) - gy(top)} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} />
            <path d={curve} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="5 4" />
            {[0, 1, 2, 3].map((v) => (
              <g key={v}>
                <line x1={gx(v)} y1={gy(0)} x2={gx(v)} y2={gy(0) + 5} stroke="var(--fig-line)" />
                <T x={gx(v)} y={gy(0) + 16} anchor="middle" fs={12}>
                  {v === 0 ? '0' : v === 1 ? 'はじめの速さ' : `その${v}倍`}
                </T>
              </g>
            ))}
            <T x={gx(3) + 10} y={gy(0) + 36} anchor="end" fs={12} tone="muted">
              分子の速さ →
            </T>
            <T x={gx(1) + 32} y={gy(top) + 4} fs={12} tone="muted">
              はじめはすべてこの速さ
            </T>
            <T x={440} y={110} fs={12.5}>
              {`1個あたりのぶつかった回数：約${Math.round(x)}回`}
            </T>
            <T x={440} y={134} fs={12} tone="muted">
              点線：マクスウェルの分布
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図14-6 速さの分布と温度（スライダー） ---------- */

const K_B = 1.380649e-23
const AMU = 1.66053907e-27
const GASES = { n2: { name: '窒素', mass: 28.014 }, h2: { name: '水素', mass: 2.016 } } as const

/** マクスウェルの分布（速さ 1m/s あたりの割合） */
function maxwellPdf(v: number, tempC: number, mass: number): number {
  const vp = Math.sqrt((2 * K_B * (tempC + 273.15)) / (mass * AMU))
  const x = v / vp
  return (4 / Math.sqrt(Math.PI)) * x * x * Math.exp(-x * x) / vp
}

export function FigDist() {
  const [temp, setTemp] = useState(0)
  const [gas, setGas] = useState<'n2' | 'h2'>('n2')
  const g = GASES[gas]
  const vmax = 5000
  const ymax = 0.0032
  const gx = (v: number) => 70 + (v / vmax) * 600
  const gy = (f: number) => 250 - (f / ymax) * 190
  const path = (tc: number, m: number) => {
    let d = ''
    for (let i = 0; i <= 250; i++) {
      const v = (i / 250) * vmax
      d += `${i ? 'L' : 'M'}${gx(v).toFixed(1)},${gy(maxwellPdf(v, tc, m)).toFixed(1)}`
    }
    return d
  }
  const vp = Math.sqrt((2 * K_B * (temp + 273.15)) / (g.mass * AMU))
  const mean = (2 / Math.sqrt(Math.PI)) * vp
  const r10 = (v: number) => Math.round(v / 10) * 10
  const cur = path(temp, g.mass)
  return (
    <Figure
      n="14-6"
      title="分子の速さの分布。温度が高いほど、分子が軽いほど、速い側へ広がる"
      controls={
        <>
          <Range label="温度" min={-150} max={400} step={50} value={temp} onChange={setTemp} format={(v) => `${v}℃`} />
          <Choice
            label="気体の種類"
            options={[
              { value: 'n2', label: '窒素' },
              { value: 'h2', label: '水素' },
            ]}
            value={gas}
            onChange={setGas}
          />
        </>
      }
      caption="マクスウェルの分布の形をもとに計算したグラフです。曲線の下の面積が全部の分子に当たり、どの温度でも同じです。「温度」を上げると山は低く広くなって速い側へ移り、「気体の種類」を軽い水素にすると山はずっと速い側へ移ります。点線は比べるための窒素・0℃の分布です。"
    >
      <Svg id="14-6" w={720} h={300} label="分子の速さの分布の曲線。とても遅い分子と、とても速い分子は少なく、中間の速さの分子が多い。温度を上げたり軽い分子にしたりすると、山は速い側へ移って広がる。">
        <line x1={gx(0)} y1={gy(0)} x2={gx(vmax) + 10} y2={gy(0)} stroke="var(--fig-line)" />
        <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(ymax) - 10} stroke="var(--fig-line)" />
        <T x={gx(0) - 8} y={gy(ymax) - 4} anchor="end" fs={12}>
          分子の数
        </T>
        <T x={gx(0) - 8} y={gy(ymax) + 14} anchor="end" fs={12}>
          の割合
        </T>
        {[0, 1000, 2000, 3000, 4000, 5000].map((v) => (
          <g key={v}>
            <line x1={gx(v)} y1={gy(0)} x2={gx(v)} y2={gy(0) + 5} stroke="var(--fig-line)" />
            <T x={gx(v)} y={gy(0) + 16} anchor="middle" fs={12}>
              {String(v)}
            </T>
          </g>
        ))}
        <T x={gx(vmax) + 10} y={gy(0) + 36} anchor="end" fs={12} tone="muted">
          分子の速さ（メートル毎秒）
        </T>
        <path d={path(0, GASES.n2.mass)} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="5 4" />
        <path d={`${cur} L${gx(vmax)},${gy(0)} L${gx(0)},${gy(0)} Z`} fill="var(--fig-accent)" opacity={0.15} />
        <path d={cur} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
        <line x1={gx(vp)} y1={gy(0)} x2={gx(vp)} y2={gy(maxwellPdf(vp, temp, g.mass))} stroke="var(--fig-line)" strokeDasharray="2 3" />
        <T x={420} y={70} fs={13} bold>
          {`${g.name}・${temp}℃`}
        </T>
        <T x={420} y={94} fs={12.5}>
          {`いちばん多い速さ：毎秒約${r10(vp)}m`}
        </T>
        <T x={420} y={116} fs={12.5}>
          {`平均の速さ：毎秒約${r10(mean)}m`}
        </T>
        <T x={420} y={140} fs={12} tone="muted">
          点線：窒素・0℃（比べるための線）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図14-7 すべての分子の向きを逆にする（動） ---------- */

const REV = { n: 24, Lx: 288, Ly: 138, T: 4 }
const REV_MOLS = once(() => makeMols(1876, REV.n, 75, 0.5))

/** 左半分にある分子の数 */
const leftCount = (t: number) => REV_MOLS().filter((m) => posAt(m, t, REV.Lx, REV.Ly).x < REV.Lx / 2).length

/** 右の箱で見ている時刻（4秒で向きを逆にすると、そこから来た道を戻る） */
const revTime = (t: number) => (t <= REV.T ? t : Math.max(0, 2 * REV.T - t))

/** 左右の箱の「左半分にある分子の数」を、時刻ごとに1回だけ数える */
const REV_SERIES = once(() => {
  const a: [number, number][] = []
  const b: [number, number][] = []
  for (let i = 0; i <= 160; i++) {
    const s = (i / 160) * 2 * REV.T
    a.push([s, leftCount(s)])
    b.push([s, leftCount(revTime(s))])
  }
  return { a, b }
})

function RevBox({ x, t, title, sub }: { x: number; t: number; title: string; sub: string }) {
  return (
    <g>
      <T x={x} y={22} fs={12.5} bold>
        {title}
      </T>
      <T x={x} y={40} fs={12} tone="muted">
        {sub}
      </T>
      <rect x={x} y={52} width={REV.Lx + 12} height={REV.Ly + 12} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <line x1={x + 6 + REV.Lx / 2} y1={52} x2={x + 6 + REV.Lx / 2} y2={64 + REV.Ly} stroke="var(--fig-muted)" strokeDasharray="4 4" />
      {REV_MOLS().map((m, i) => {
        const q = posAt(m, t, REV.Lx, REV.Ly)
        return <Ball key={i} x={x + 6 + q.x} y={58 + q.y} r={6} />
      })}
    </g>
  )
}

export function FigReverse() {
  const end = 2 * REV.T
  const gx = (s: number) => 90 + (s / end) * 560
  const gy = (c: number) => 326 - (c / REV.n) * 80
  const series = REV_SERIES()
  const line = (pts: [number, number][], upTo: number) =>
    pts
      .filter(([s]) => s <= upTo + 1e-6)
      .map(([s, c], i) => `${i ? 'L' : 'M'}${gx(s).toFixed(1)},${gy(c).toFixed(1)}`)
      .join(' ')
  return (
    <Anim
      n="14-7"
      title="すべての分子の向きを逆にすると、広がった分子は来た道を戻り、片側に集まる"
      still={end + 1}
      period={end + 3}
      caption="2つの箱は同じ状態から始まります。右の箱だけ、4秒の時点ですべての分子の向きを逆にしています。力学の法則はこの逆向きの動きも許すので、右の箱の分子は8秒で左半分に戻ります。下のグラフは左半分にある分子の数です。分子どうしの衝突を省いた模式図です。"
    >
      {(t) => {
        const tt = Math.min(t, end)
        return (
          <Svg id="14-7" w={720} h={360} label="2つの箱で、左半分に集めた分子が広がる。左の箱ではそのまま広がり続ける。右の箱では4秒の時点ですべての分子の向きを逆にしたので、分子は来た道を戻り、8秒で左半分に集まる。">
            <RevBox x={30} t={tt} title="そのまま進める" sub="分子は箱全体に広がる" />
            <RevBox x={390} t={revTime(tt)} title="4秒の時点で、すべての向きを逆にする" sub={tt > REV.T ? '向きを逆にした後：来た道を戻る' : 'まだ向きを逆にしていない'} />
            <line x1={gx(0)} y1={gy(0)} x2={gx(end) + 10} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(REV.n) - 6} stroke="var(--fig-line)" />
            <T x={gx(0) - 8} y={gy(REV.n)} anchor="end" fs={11.5}>
              全部
            </T>
            <T x={gx(0) - 8} y={gy(REV.n / 2)} anchor="end" fs={11.5}>
              半分
            </T>
            <T x={gx(0) - 8} y={gy(0)} anchor="end" fs={11.5}>
              0
            </T>
            <line x1={gx(REV.T)} y1={gy(0)} x2={gx(REV.T)} y2={gy(REV.n)} stroke="var(--fig-muted)" strokeDasharray="2 3" />
            <T x={gx(REV.T) + 4} y={gy(0) + 14} fs={11.5} tone="muted">
              4秒：右の箱で向きを逆にする
            </T>
            <T x={gx(end) + 10} y={gy(0) + 14} anchor="end" fs={11.5} tone="muted">
              時間 →
            </T>
            <path d={line(series.a, tt)} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <path d={line(series.b, tt)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} strokeDasharray="6 3" />
            <T x={20} y={226} fs={12}>
              左半分にある分子の数（黒の実線：左の箱、青の破線：右の箱）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図14-8 4個の分子の並び方 ---------- */

const LETTERS = ['A', 'B', 'C', 'D']

export function FigCount4() {
  // 左にある分子の組み合わせを、左にある数ごとにまとめる
  const groups = [4, 3, 2, 1, 0].map((k) => {
    const sets: number[][] = []
    for (let mask = 0; mask < 16; mask++) {
      const left = [0, 1, 2, 3].filter((i) => mask & (1 << (3 - i)))
      if (left.length === k) sets.push(left)
    }
    return { k, sets: sets.reverse() }
  })
  return (
    <Figure
      n="14-8"
      title="4個の分子の並び方は16通り。左右に2個ずつ分かれる並び方がいちばん多い"
      caption="箱を左半分と右半分に分け、4個の分子 A〜D がそれぞれどちら側にあるかを数えています。どの並び方も同じ確率で現れるとすると、「2個ずつ」は16回に6回、「4個とも左」は16回に1回起こります。"
    >
      <Svg id="14-8" w={720} h={320} label="4個の分子A、B、C、Dの、箱の左右への並び方16通り。左に4個は1通り、3個は4通り、2個は6通り、1個は4通り、0個は1通り。">
        {groups.map((g, c) => {
          const cx = 76 + c * 142
          return (
            <g key={g.k}>
              <T x={cx} y={20} anchor="middle" fs={12.5} bold>
                {`左に${g.k}個`}
              </T>
              <T x={cx} y={40} anchor="middle" fs={12} tone={g.k === 2 ? 'acc' : undefined}>
                {`${g.sets.length}通り（16回に${g.sets.length}回）`}
              </T>
              {g.sets.map((left, r) => {
                const y = 58 + r * 42
                const right = [0, 1, 2, 3].filter((i) => !left.includes(i))
                return (
                  <g key={r}>
                    <rect x={cx - 56} y={y} width={112} height={32} rx={3} fill={g.k === 2 ? 'var(--fig-box2)' : 'var(--fig-bg)'} stroke="var(--fig-line)" />
                    <line x1={cx} y1={y} x2={cx} y2={y + 32} stroke="var(--fig-muted)" strokeDasharray="3 3" />
                    {left.map((i, j) => (
                      <T key={i} x={cx - 47 + j * 12} y={y + 16} fs={12}>
                        {LETTERS[i]}
                      </T>
                    ))}
                    {right.map((i, j) => (
                      <T key={i} x={cx + 9 + j * 12} y={y + 16} fs={12}>
                        {LETTERS[i]}
                      </T>
                    ))}
                  </g>
                )
              })}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図14-9 分子の数と並び方の数（動・スライダー） ---------- */

const NS = [4, 10, 20, 50, 100]
const ARR_MOLS = once(() => makeMols(1877, 100, 45))

/** n 個から k 個を選ぶ並び方の数 */
function choose(n: number, k: number): number {
  let c = 1
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i
  return c
}

/** 大きな数を「万」「兆」や「1のあとに0が○個並ぶ数」で書く */
function bigJa(x: number): string {
  const v = Math.round(x)
  if (v < 1e4) return String(v)
  if (v < 1e8) return `${Math.floor(v / 1e4)}万${v % 1e4 ? v % 1e4 : ''}`
  if (v < 1e12) return `約${Math.round(v / 1e8)}億`
  if (v < 1e16) return `約${Math.round(v / 1e12)}兆`
  const e = Math.floor(Math.log10(x))
  const m = x / 10 ** e
  return m < 1.05 ? `約1のあとに0が${e}個並ぶ数` : `1のあとに0が${e}個並ぶ数の約${m.toFixed(1)}倍`
}

export function FigArrange() {
  const [idx, setIdx] = useState(0)
  const n = NS[idx]
  const mols = ARR_MOLS().slice(0, n)
  const Lx = 252
  const Ly = 152
  const r = n > 30 ? 4 : 6
  const cmax = choose(n, Math.floor(n / 2))
  const all = 2 ** n
  const bx = (k: number) => 340 + (k / n) * 350
  const bw = Math.max(2, 350 / (n + 1) - 1.5)
  const by = (c: number) => 210 - (c / cmax) * 150
  const allText = bigJa(all)
  return (
    <Anim
      n="14-9"
      title="分子の数が増えると、半分ずつに近い並び方が圧倒的に多くなる"
      still={2}
      controls={<Range label="分子の数" min={0} max={NS.length - 1} step={1} value={idx} onChange={setIdx} format={(i) => `${NS[i]}個`} />}
      caption="右の棒グラフは、左半分にある分子の数ごとの並び方の数です（いちばん多いところの高さをそろえています）。青の棒は、左の箱でいま左半分にある分子の数です。「分子の数」を増やすと、全部が左に集まる並び方は1通りのままですが、半分ずつに近い並び方の数はけた違いに増え、青の棒は真ん中の近くから離れなくなります。"
    >
      {(t) => {
        const pos = mols.map((m) => posAt(m, t, Lx - 2 * r, Ly - 2 * r))
        const k = pos.filter((q) => q.x + r < Lx / 2).length
        return (
          <Svg id="14-9" w={720} h={320} label="箱の中を動く分子のうち左半分にある数と、左半分にある数ごとの並び方の数の棒グラフ。分子の数が多いほど、半分ずつに近い並び方が圧倒的に多くなる。">
            <rect x={20} y={50} width={Lx} height={Ly} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <line x1={20 + Lx / 2} y1={50} x2={20 + Lx / 2} y2={50 + Ly} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <T x={20 + Lx / 4} y={36} anchor="middle" fs={12} tone="muted">
              左半分
            </T>
            <T x={20 + (3 * Lx) / 4} y={36} anchor="middle" fs={12} tone="muted">
              右半分
            </T>
            {pos.map((q, i) => (
              <Ball key={i} x={20 + r + q.x} y={50 + r + q.y} r={r} />
            ))}
            <T x={20} y={224} fs={12.5}>
              {`いま左半分にある分子：${k}個（全部で${n}個）`}
            </T>
            {Array.from({ length: n + 1 }, (_, j) => {
              const c = choose(n, j)
              const h = Math.max(c / cmax > 0.002 ? 1 : 0, 210 - by(c))
              return <rect key={j} x={bx(j) - bw / 2} y={210 - h} width={bw} height={h} fill={j === k ? 'var(--fig-accent)' : 'var(--fig-box3)'} stroke={j === k ? 'var(--fig-accent)' : 'none'} />
            })}
            <line x1={330} y1={210} x2={700} y2={210} stroke="var(--fig-line)" />
            <T x={bx(0)} y={224} anchor="middle" fs={11.5}>
              0個
            </T>
            <T x={bx(n / 2)} y={224} anchor="middle" fs={11.5}>
              半分
            </T>
            <T x={bx(n)} y={224} anchor="end" fs={11.5}>
              {`${n}個`}
            </T>
            <T x={515} y={244} anchor="middle" fs={11.5} tone="muted">
              左半分にある分子の数
            </T>
            <T x={340} y={36} fs={12} tone="muted">
              並び方の数
            </T>
            <T x={20} y={262} fs={12.5}>
              {`全部が左半分に集まる並び方：1通り（起こるのは ${allText}${all >= 1e16 ? 'の回数' : '回'}に1回）`}
            </T>
            <T x={20} y={286} fs={12.5} tone="acc">
              {`左右に半分ずつ分かれる並び方：${bigJa(cmax)}通り`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図14-10 マクスウェルの悪魔（動） ---------- */

const DM = { W: 600, H: 190, R: 6, door: 100, n: 28, fast: 200, slow: 95, dur: 24, fps: 30 }
const DM_P = DM.W / 2
const DM_D0 = (DM.H - DM.door) / 2
const DM_D1 = (DM.H + DM.door) / 2

/** 悪魔が穴を開け閉めする箱の中の動きを計算する。fps ごとの位置と、穴が開いているかどうかを返す */
const DEMON = once(() => {
  const r = rng(21)
  const { W, H, R } = DM
  const m = Array.from({ length: DM.n }, (_, i) => {
    const fast = i % 2 === 0
    const a = 2 * Math.PI * r()
    const v = (fast ? DM.fast : DM.slow) * (0.85 + 0.3 * r())
    const left = i % 4 < 2
    return { x: left ? R + r() * (DM_P - 3 * R) : DM_P + 2 * R + r() * (DM_P - 3 * R), y: R + r() * (H - 2 * R), vx: v * Math.cos(a), vy: v * Math.sin(a), fast }
  })
  const dt = 1 / 60
  const per = 60 / DM.fps
  const frames: Float32Array[] = []
  const open: boolean[] = []
  let lastPass = -1
  for (let step = 0; step <= DM.dur * 60; step++) {
    if (step % per === 0) {
      const f = new Float32Array(DM.n * 2)
      m.forEach((q, i) => {
        f[2 * i] = q.x
        f[2 * i + 1] = q.y
      })
      frames.push(f)
      open.push(lastPass >= 0 && step - lastPass < 12)
    }
    for (const q of m) {
      const ox = q.x
      q.x += q.vx * dt
      q.y += q.vy * dt
      if (q.y < R) [q.y, q.vy] = [2 * R - q.y, -q.vy]
      if (q.y > H - R) [q.y, q.vy] = [2 * (H - R) - q.y, -q.vy]
      if (q.x < R) [q.x, q.vx] = [2 * R - q.x, -q.vx]
      if (q.x > W - R) [q.x, q.vx] = [2 * (W - R) - q.x, -q.vx]
      const inDoor = q.y > DM_D0 + R && q.y < DM_D1 - R
      // 仕切りに当たる分子：速い分子がAからBへ、遅い分子がBからAへ向かうときだけ通す
      if (ox < DM_P - R + 1e-9 && q.x >= DM_P - R && q.vx > 0) {
        if (inDoor && q.fast) lastPass = step
        else [q.x, q.vx] = [2 * (DM_P - R) - q.x, -q.vx]
      } else if (ox > DM_P + R - 1e-9 && q.x <= DM_P + R && q.vx < 0) {
        if (inDoor && !q.fast) lastPass = step
        else [q.x, q.vx] = [2 * (DM_P + R) - q.x, -q.vx]
      }
    }
  }
  return { frames, open, fast: m.map((q) => q.fast) }
})

export function FigDemon() {
  const X0 = 60
  const Y0 = 64
  return (
    <Anim
      n="14-10"
      title="マクスウェルの悪魔：速い分子をBへ、遅い分子をAへ通すと、Bは熱くなりAは冷える"
      still={DM.dur}
      period={DM.dur + 3}
      caption="仕切りの中央に穴があり、悪魔は速い分子がAからBへ、遅い分子がBからAへ向かうときだけ穴を開けます（穴が開いている間は仕切りの線が切れます）。塗った丸が速い分子、白い丸が遅い分子です。分子の速さを速い・遅いの2種類だけにし、分子どうしの衝突を省いた模式図です。"
    >
      {(t) => {
        const D = DEMON()
        const i = Math.min(D.frames.length - 1, Math.floor(Math.min(t, DM.dur) * DM.fps))
        const f = D.frames[i]
        let aF = 0
        let aS = 0
        let bF = 0
        let bS = 0
        D.fast.forEach((fast, j) => {
          const inA = f[2 * j] < DM_P
          if (inA && fast) aF++
          else if (inA) aS++
          else if (fast) bF++
          else bS++
        })
        const px = X0 + DM_P
        return (
          <Svg id="14-10" w={720} h={330} label="仕切りで分けた箱のAとB。悪魔が穴を開け閉めして、速い分子をAからBへ、遅い分子をBからAへだけ通す。時間がたつと、Bには速い分子が、Aには遅い分子が集まる。">
            <T x={X0} y={22} fs={12.5} bold>
              {`A：速い分子 ${aF}個・遅い分子 ${aS}個`}
            </T>
            <T x={px + 16} y={22} fs={12.5} bold>
              {`B：速い分子 ${bF}個・遅い分子 ${bS}個`}
            </T>
            <T x={X0} y={44} fs={12} tone="muted">
              遅い分子が集まる（温度が下がる）
            </T>
            <T x={px + 16} y={44} fs={12} tone="muted">
              速い分子が集まる（温度が上がる）
            </T>
            <rect x={X0} y={Y0} width={DM.W} height={DM.H} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <line x1={px} y1={Y0} x2={px} y2={Y0 + DM_D0} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={px} y1={Y0 + DM_D1} x2={px} y2={Y0 + DM.H} stroke="var(--fig-line)" strokeWidth={3} />
            {!D.open[i] && <line x1={px} y1={Y0 + DM_D0} x2={px} y2={Y0 + DM_D1} stroke="var(--fig-accent)" strokeWidth={3} />}
            {D.fast.map((fast, j) => (
              <Ball key={j} x={X0 + f[2 * j]} y={Y0 + f[2 * j + 1]} r={DM.R} fill={fast ? 'var(--fig-accent)' : 'var(--fig-bg)'} />
            ))}
            <T x={X0 + 10} y={Y0 + DM.H + 18} fs={12.5} bold>
              A
            </T>
            <T x={X0 + DM.W - 10} y={Y0 + DM.H + 18} anchor="end" fs={12.5} bold>
              B
            </T>
            <Arrow x1={px} y1={Y0 + DM.H + 30} x2={px} y2={Y0 + DM.H + 4} />
            <T x={px} y={Y0 + DM.H + 42} anchor="middle" fs={12}>
              仕切り（中央の穴を悪魔が開け閉めする）
            </T>
            <Ball x={X0 + 8} y={312} r={6} fill="var(--fig-accent)" />
            <T x={X0 + 20} y={312} fs={12}>
              速い分子
            </T>
            <Ball x={X0 + 108} y={312} r={6} fill="var(--fig-bg)" />
            <T x={X0 + 120} y={312} fs={12}>
              遅い分子
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}
