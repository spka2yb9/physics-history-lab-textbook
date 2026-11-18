import { useMemo, useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Trail, rng } from './common'

/*
 * 第5章の図。動く図の軌道は、決まった式を小さな時間刻みで数値計算して描く（乱数は使わず、開くたびに同じ絵になる）。
 *   天体（万有引力）：leapfrog 法（刻み 0.0005）。近づきすぎたときに計算が乱れないよう、引力をわずかにやわらげる。
 *   ローレンツの模型・二重振り子：4次のルンゲ・クッタ法（刻み 0.005 と 0.002）。
 * 計算は図を開いたときに1回だけ行い、各時刻の位置を配列にためて、時刻 t で読み出す。
 */

type Vec = number[]

/** 4次のルンゲ・クッタ法。every 刻みごとの状態を返す */
function rk4(f: (s: Vec) => Vec, s0: Vec, T: number, dt: number, every: number): Vec[] {
  let s = [...s0]
  const out = [s]
  const n = Math.round(T / dt)
  for (let i = 1; i <= n; i++) {
    const k1 = f(s)
    const k2 = f(s.map((v, j) => v + 0.5 * dt * k1[j]))
    const k3 = f(s.map((v, j) => v + 0.5 * dt * k2[j]))
    const k4 = f(s.map((v, j) => v + dt * k3[j]))
    s = s.map((v, j) => v + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]))
    if (i % every === 0) out.push(s)
  }
  return out
}

/** 天体の位置（x, y の組）を 0.01 ごとに返す。G は 1 */
function gravity(p0: number[][], v0: number[][], m: number[], T: number): number[][][] {
  const dt = 0.0005
  const eps2 = 0.0004
  const n = m.length
  const p = p0.map((q) => [...q])
  const v = v0.map((q) => [...q])
  const acc = () => {
    const a = p.map(() => [0, 0])
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const dx = p[j][0] - p[i][0]
        const dy = p[j][1] - p[i][1]
        const r2 = dx * dx + dy * dy + eps2
        const inv = 1 / (r2 * Math.sqrt(r2))
        a[i][0] += m[j] * dx * inv
        a[i][1] += m[j] * dy * inv
        a[j][0] -= m[i] * dx * inv
        a[j][1] -= m[i] * dy * inv
      }
    return a
  }
  let a = acc()
  const out = [p.map((q) => [...q])]
  const steps = Math.round(T / dt)
  for (let s = 1; s <= steps; s++) {
    for (let i = 0; i < n; i++) {
      v[i][0] += 0.5 * dt * a[i][0]
      v[i][1] += 0.5 * dt * a[i][1]
      p[i][0] += dt * v[i][0]
      p[i][1] += dt * v[i][1]
    }
    a = acc()
    for (let i = 0; i < n; i++) {
      v[i][0] += 0.5 * dt * a[i][0]
      v[i][1] += 0.5 * dt * a[i][1]
    }
    if (s % 20 === 0) out.push(p.map((q) => [...q]))
  }
  return out
}

/** 計算を1回だけ行い、結果をとっておく */
function once<R>(make: () => R): () => R {
  let r: R | undefined
  return () => (r ??= make())
}

/** 配列の k 番目（時刻 t、間隔 step）。範囲の外は端に止める */
const at = <X,>(arr: X[], t: number, step: number) => arr[Math.max(0, Math.min(arr.length - 1, Math.round(t / step)))]

/** 点の並びを折れ線の d にする */
const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/* ---------- 図5-1 年表 ---------- */

const ROAD = [
  { y: '1687年', who: 'ニュートン', what: ['『プリンキピア』', '2つの天体の軌道'] },
  { y: '1772年', who: 'ラグランジュ', what: ['三体問題の', '特別な場合'] },
  { y: '1814年', who: 'ラプラス', what: ['未来を見通す', '「知性」の文章'] },
  { y: '1890年', who: 'ポアンカレ', what: ['三体問題の論文', '複雑な軌道'] },
  { y: '1908年', who: 'ポアンカレ', what: ['『科学と方法』', '天気の予測の例'] },
  { y: '1963年', who: 'ローレンツ', what: ['気象の模型で', 'カオスを示す'] },
  { y: '1989年', who: 'ラスカー', what: ['惑星の軌道も', 'カオスと計算'] },
]

export function FigRoad() {
  return (
    <Figure n="5-1" title="ラプラスからラスカーまでの主な出来事" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="5-1" w={720} h={250} label="1687年のニュートンの『プリンキピア』から、1772年のラグランジュ、1814年のラプラス、1890年と1908年のポアンカレ、1963年のローレンツ、1989年のラスカーまでの年表。">
        <Arrow x1={15} y1={125} x2={708} y2={125} />
        {ROAD.map((r, i) => {
          const x = 60 + i * 100
          const up = i % 2 === 0
          const ty = up ? 30 : 152
          return (
            <g key={r.y}>
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

/* ---------- 三体の計算（図5-2、図5-4） ---------- */

const MASS3 = [1, 0.4, 0.4] // 太陽と2つの惑星（惑星は実際よりずっと重くしてある）
const P3 = [
  [-0.1069, -0.1538],
  [0.9114, 0.1959],
  [-0.6442, 0.1886],
]
const V3 = [
  [0.1957, -0.029],
  [-0.1419, 0.9541],
  [-0.3475, -0.8815],
]
const T3 = 24
const SHIFT = 0.001 // 計算2で惑星1の初めの位置をずらす量（軌道の半径のおよそ1000分の1）

const threeRuns = once(() => {
  const shifted = P3.map((q) => [...q])
  shifted[1][0] += SHIFT
  const a = gravity(P3, V3, MASS3, T3)
  const b = gravity(shifted, V3, MASS3, T3)
  let split = T3
  for (let k = 0; k < a.length; k++) {
    const d = Math.max(...[0, 1, 2].map((i) => Math.hypot(a[k][i][0] - b[k][i][0], a[k][i][1] - b[k][i][1])))
    if (d > 0.15) {
      split = k * 0.01
      break
    }
  }
  return { a, b, split }
})

/** 太陽と惑星の2つの天体。period は惑星が1周する時間 */
const twoRun = once(() => {
  const run = gravity([[0, 0], [1, 0]], [[0, 0], [0, 0.75]], [1, 0.000001], 4)
  const k = run.findIndex((f, i) => i > 50 && run[i - 1][1][1] < 0 && f[1][1] >= 0)
  return { run, period: k * 0.01 }
})

/** 時刻 t までの直近 len 秒の道筋（点の並び） */
function recent(run: number[][][], i: number, t: number, len: number, map: (q: number[]) => [number, number]): [number, number][] {
  const k1 = Math.max(0, Math.min(run.length - 1, Math.round(t / 0.01)))
  const k0 = Math.max(0, k1 - Math.round(len / 0.01))
  const pts: [number, number][] = []
  for (let k = k0; k <= k1; k += 2) pts.push(map(run[k][i]))
  return pts
}

/* ---------- 図5-2 2つの天体と3つの天体（動） ---------- */

export function FigTwoThree() {
  const L = { cx: 150, cy: 185, s: 120 }
  const R = { cx: 551, cy: 166, s: 115 }
  const mapL = (q: number[]): [number, number] => [L.cx + q[0] * L.s, L.cy - q[1] * L.s]
  const mapR = (q: number[]): [number, number] => [R.cx + q[0] * R.s, R.cy - q[1] * R.s]
  return (
    <Anim
      n="5-2"
      title="天体が2つなら同じ軌道を繰り返すが、3つになると軌道は毎回変わる"
      still={12}
      period={T3}
      caption="万有引力の法則で計算した模式図です。右の2つの惑星は、動きの違いが見えるように、実際の惑星よりずっと重くしてあります。点線は、左は1周分の道筋、右は惑星が直前の6秒間に通った道筋です。"
    >
      {(t) => {
        const { run: two, period } = twoRun()
        const { a } = threeRuns()
        const pl = mapL(at(two, t % period, 0.01)[1])
        const st = mapL(at(two, t % period, 0.01)[0])
        const ellipse = two.slice(0, Math.round(period / 0.01) + 1).map((f) => mapL(f[1]))
        const now = at(a, t, 0.01)
        return (
          <Svg id="5-2" w={720} h={340} label="左は太陽と惑星の2つの天体で、惑星は同じ楕円の軌道を繰り返し回る。右は太陽と2つの惑星の3つの天体で、引き合ううちに軌道が毎回変わり、同じ道をたどらない。">
            <T x={20} y={20} bold>
              2つの天体（太陽と惑星）
            </T>
            <T x={380} y={20} bold>
              3つの天体（太陽と2つの惑星）
            </T>
            <line x1={360} y1={8} x2={360} y2={330} stroke="var(--fig-box)" strokeWidth={2} />
            <Trail points={ellipse} />
            <Ball x={st[0]} y={st[1]} r={10} fill="var(--fig-box2)" />
            <Ball x={pl[0]} y={pl[1]} r={6} />
            {[1, 2].map((i) => (
              <Trail key={i} points={recent(a, i, t, 6, mapR)} />
            ))}
            {[0, 1, 2].map((i) => {
              const [x, y] = mapR(now[i])
              return <Ball key={i} x={x} y={y} r={i === 0 ? 10 : 6} fill={i === 0 ? 'var(--fig-box2)' : 'var(--fig-box3)'} />
            })}
            <T x={20} y={318} fs={12} tone="muted">
              大きな丸：太陽　小さな丸：惑星
            </T>
            <T x={380} y={318} fs={12} tone="muted">
              同じ道を二度たどらない
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図5-3 ラプラスの知性 ---------- */

export function FigIntelligence() {
  return (
    <Figure
      n="5-3"
      title="ラプラスの「知性」：今の状態をすべて知れば、未来も過去も計算できる"
      caption="ラプラスの文章（1814年）の内容を図にした模式図です。ニュートンの力学で実際に計算するには、位置に加えて、それぞれの物の速さと向きも必要です。"
    >
      <Svg id="5-3" w={720} h={250} label="ある瞬間のすべての物の位置と、自然を動かすすべての力を知る十分に大きな知性があれば、法則を使った計算で、未来も過去もどの時刻のことでも分かる、というラプラスの考え。">
        <Box x={20} y={34} w={200} h={64} lines={['ある瞬間の', 'すべての物の位置']} fill="box3" />
        <Box x={20} y={134} w={200} h={64} lines={['自然を動かしている', 'すべての力']} fill="box3" />
        <Arrow x1={222} y1={66} x2={288} y2={104} />
        <Arrow x1={222} y1={166} x2={288} y2={128} />
        <Box x={292} y={76} w={170} h={80} lines={['十分に大きな知性', '（運動の法則で計算する）']} fill="box" bold accent />
        <Arrow x1={464} y1={104} x2={526} y2={66} />
        <Arrow x1={464} y1={128} x2={526} y2={166} />
        <Box x={530} y={34} w={170} h={64} lines={['未来', 'どの時刻のことも分かる']} fill="box4" bold />
        <Box x={530} y={134} w={170} h={64} lines={['過去', 'どの時刻のことも分かる']} fill="box4" bold />
        <T x={360} y={228} anchor="middle" fs={12} tone="muted">
          ラプラス：人間の知性は、この知性から限りなく遠いままである
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図5-4 ほぼ同じ所から出発した2組の三体（動） ---------- */

export function FigThreeSplit() {
  const C = { cx: 262, cy: 142, s: 115 }
  const map = (q: number[]): [number, number] => [C.cx + q[0] * C.s, C.cy - q[1] * C.s]
  return (
    <Anim
      n="5-4"
      title="ほとんど同じ状態から出発した2つの計算が、途中から別々の動きになる"
      still={19}
      period={T3}
      caption="図5-2の右と同じ3つの天体を、2回計算した模式図です。計算2では惑星の一つの初めの位置を、軌道の半径のおよそ1000分の1だけずらしました。しばらくは重なって動きますが、ある時刻から急に離れていきます。"
    >
      {(t) => {
        const { a, b, split } = threeRuns()
        const na = at(a, t, 0.01)
        const nb = at(b, t, 0.01)
        const apart = t >= split
        return (
          <Svg id="5-4" w={720} h={340} label="太陽と2つの惑星の運動を、初めの位置をごくわずかに変えて2回計算した。初めは2つの計算の天体が重なって動くが、途中から離れ、まったく別の道筋をたどる。">
            {[1, 2].map((i) => (
              <g key={i}>
                <Trail points={recent(a, i, t, 5, map)} />
                <path d={poly(recent(b, i, t, 5, map))} fill="none" stroke="var(--fig-accent)" strokeWidth={1} opacity={0.75} />
              </g>
            ))}
            {[0, 1, 2].map((i) => {
              const [x, y] = map(na[i])
              return <Ball key={`a${i}`} x={x} y={y} r={i === 0 ? 10 : 6} fill={i === 0 ? 'var(--fig-box2)' : 'var(--fig-box3)'} />
            })}
            {[0, 1, 2].map((i) => {
              const [x, y] = map(nb[i])
              return <circle key={`b${i}`} cx={x} cy={y} r={i === 0 ? 12 : 8} fill="none" stroke="var(--fig-accent)" strokeWidth={1.5} />
            })}
            <T x={470} y={60} fs={12.5} bold>
              計算1
            </T>
            <T x={470} y={80} fs={12}>
              塗った丸と点線（通った道筋）
            </T>
            <T x={470} y={112} fs={12.5} bold>
              計算2（初めの位置をわずかにずらす）
            </T>
            <T x={470} y={132} fs={12}>
              青の輪と青の細い線（通った道筋）
            </T>
            <T x={470} y={176} fs={12.5} tone={apart ? 'acc' : undefined}>
              {apart ? '2つの計算が離れた' : '2つの計算は重なっている'}
            </T>
            <T x={470} y={198} fs={12} tone="muted">
              {`離れ始めた時刻：約${Math.round(split)}秒`}
            </T>
            <T x={470} y={300} fs={12} tone="muted">
              大きな丸：太陽　小さな丸：惑星
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- ローレンツの模型（図5-5、図5-6、図5-9） ---------- */

const lorenzF = ([x, y, z]: Vec): Vec => [10 * (y - x), x * (28 - z) - y, x * y - (8 / 3) * z]
/** 模型の計算の途中のある時刻の状態（ここから計算をやり直す） */
const S0 = [4.483989696671604, 4.119840610387664, 22.973893495299603]
const LT = 20
/** 0.05 ごとの状態 */
const lorenz = (s0: Vec, T = LT) => rk4(lorenzF, s0, T, 0.005, 10)
const roundTo = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d

/** 時系列のグラフの枠と軸（図5-5、図5-9） */
const GX = (t: number) => 70 + (t / LT) * 620
const GY = (v: number) => 160 - v * 4.4
function TimeAxes() {
  return (
    <g>
      <line x1={GX(0)} y1={GY(0)} x2={GX(LT) + 6} y2={GY(0)} stroke="var(--fig-muted)" strokeDasharray="2 3" />
      <line x1={GX(0)} y1={66} x2={GX(0)} y2={254} stroke="var(--fig-line)" />
      <T x={GX(LT)} y={270} anchor="end" fs={12} tone="muted">
        時間（計算の上の時間）→
      </T>
      <T x={GX(0) - 6} y={74} anchor="end" fs={12} tone="muted">
        変数の
      </T>
      <T x={GX(0) - 6} y={90} anchor="end" fs={12} tone="muted">
        値
      </T>
    </g>
  )
}

const series = (run: Vec[], upto = LT) => poly(run.filter((_, k) => k * 0.05 <= upto).map((s, k) => [GX(k * 0.05), GY(s[0])]))

/* ---------- 図5-5 丸めた数から計算をやり直す（動・切り替え） ---------- */

export function FigRound() {
  const [digits, setDigits] = useState<'3' | '4' | '5' | '6'>('3')
  const d = Number(digits)
  const base = useMemo(() => lorenz(S0), [])
  const { redo, split } = useMemo(() => {
    const r = lorenz(S0.map((v) => roundTo(v, d)))
    const k = base.findIndex((s, i) => Math.abs(s[0] - r[i][0]) > 3)
    return { redo: r, split: k < 0 ? LT : k * 0.05 }
  }, [base, d])
  const speed = 2
  return (
    <Anim
      n="5-5"
      title="丸めた数で計算をやり直すと、しばらくは同じでも、やがて別の結果になる"
      still={11}
      period={13}
      controls={
        <Choice
          label="打ち込む数"
          options={[
            { value: '3', label: '小数第3位まで' },
            { value: '4', label: '第4位まで' },
            { value: '5', label: '第5位まで' },
            { value: '6', label: '第6位まで' },
          ]}
          value={digits}
          onChange={setDigits}
        />
      }
      caption="ローレンツが1963年に発表した3つの変数の模型で、1961年の出来事をまねて計算した図です（ローレンツが1961年に使ったのは12の変数の模型です）。「打ち込む数」の桁を増やすと、2本の線が離れ始める時刻は後ろへずれますが、離れることは変わりません。"
    >
      {(t) => {
        const upto = Math.min(LT, t * speed)
        return (
          <Svg id="5-5" w={720} h={300} label="元の計算と、途中の数を丸めて打ち込んで計算し直したものを、同じグラフに描いた。初めは2本の線が重なっているが、ある時刻から離れて、まったく違う動きになる。">
            <TimeAxes />
            <path d={series(base, upto)} fill="none" stroke="var(--fig-line)" strokeWidth={1.6} />
            <path d={series(redo, upto)} fill="none" stroke="var(--fig-accent)" strokeWidth={1.6} strokeDasharray="5 3" />
            <line x1={70} y1={22} x2={100} y2={22} stroke="var(--fig-line)" strokeWidth={1.6} />
            <T x={108} y={22} fs={12}>
              元の計算
            </T>
            <line x1={70} y1={42} x2={100} y2={42} stroke="var(--fig-accent)" strokeWidth={1.6} strokeDasharray="5 3" />
            <T x={108} y={42} fs={12}>
              丸めた数から計算し直したもの
            </T>
            {upto >= split && (
              <>
                <line x1={GX(split)} y1={64} x2={GX(split)} y2={254} stroke="var(--fig-muted)" strokeDasharray="4 3" />
                <T x={GX(split)} y={56} anchor="middle" fs={12} tone="acc">
                  ここから離れる
                </T>
              </>
            )}
            <T x={70} y={290} fs={12} tone="muted">
              {`打ち込んだ数の例：4.48398969… を ${S0[0].toFixed(d)} として打ち込む`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図5-6 ローレンツの模型の軌道（動） ---------- */

/** 図5-6：3つの変数のうち1つ目を横、3つ目を縦にとる */
const ax = (s: Vec): [number, number] => [360 + s[0] * 8.5, 318 - s[2] * 5.7]
const MT = 16

export function FigAttractor() {
  const k = 0.7 // 1秒あたりに進める計算の上の時間
  const data = useMemo(() => {
    const bg = rk4(lorenzF, S0, 30, 0.005, 4).map(ax)
    const A = rk4(lorenzF, S0, MT, 0.005, 4)
    const B = rk4(lorenzF, [S0[0] + 0.001, S0[1], S0[2]], MT, 0.005, 4)
    const kk = A.findIndex((s, i) => Math.hypot(s[0] - B[i][0], s[2] - B[i][2]) > 4)
    return { bg: poly(bg), A, B, split: kk < 0 ? MT : kk * 0.02 }
  }, [])
  const trail = (run: Vec[], u: number): [number, number][] => {
    const k1 = Math.min(run.length - 1, Math.round(u / 0.02))
    return run.slice(Math.max(0, k1 - 60), k1 + 1).map(ax)
  }
  return (
    <Anim
      n="5-6"
      title="ローレンツの模型では、点が2つの渦の間を不規則に行き来する"
      still={20}
      period={MT / k + 1.5}
      caption="ローレンツの1963年の模型の計算で、3つの変数のうち2つを横と縦にとって描いた図です。薄い線は長い時間をかけて点が通った道筋です。初めの差が1000分の1の2つの点（AとB）は、しばらく一緒に動きますが、やがて別々の渦を回るようになります。"
    >
      {(t) => {
        const u = Math.min(MT, t * k)
        const [xa, ya] = ax(at(data.A, u, 0.02))
        const [xb, yb] = ax(at(data.B, u, 0.02))
        const apart = u >= data.split
        return (
          <Svg id="5-6" w={720} h={330} label="ローレンツの模型の点の動き。点は左右2つの渦巻きの形の上を動き、いつ左右を移るかは決まった形をとらない。わずかに違う所から出発した2つの点は、やがて別々の渦を回る。">
            <path d={data.bg} fill="none" stroke="var(--fig-muted)" strokeWidth={0.6} opacity={0.45} />
            <Trail points={trail(data.A, u)} />
            <path d={poly(trail(data.B, u))} fill="none" stroke="var(--fig-accent)" strokeWidth={1} />
            <Ball x={xa} y={ya} r={6} />
            <circle cx={xb} cy={yb} r={8} fill="none" stroke="var(--fig-accent)" strokeWidth={1.8} />
            <T x={560} y={40} fs={12}>
              A：塗った丸と点線
            </T>
            <T x={560} y={60} fs={12}>
              B：青の輪と細い線
            </T>
            <T x={560} y={80} fs={12} tone="muted">
              初めの差は1000分の1
            </T>
            <T x={560} y={112} fs={12.5} tone={apart ? 'acc' : undefined}>
              {apart ? 'AとBは離れた' : 'AとBは一緒に動いている'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図5-7 二重振り子（動・スライダー） ---------- */

const G = 9.8
/** 二重振り子（棒の長さ1m、おもり1kg、棒の重さは考えない）。状態は [上の角度, 下の角度, 上の角速度, 下の角速度] */
const pendF = ([a, b, p, q]: Vec): Vec => {
  const d = a - b
  const den = 3 - Math.cos(2 * d)
  return [p, q, (-3 * G * Math.sin(a) - G * Math.sin(a - 2 * b) - 2 * Math.sin(d) * (q * q + p * p * Math.cos(d))) / den, (2 * Math.sin(d) * (2 * p * p + 2 * G * Math.cos(a) + q * q * Math.cos(d))) / den]
}
const DELTAS = [1, 0.1, 0.01, 0.001]
const DELTA_LABEL = ['1度', '10分の1度', '100分の1度', '1000分の1度']
const PT = 14
const DEG = Math.PI / 180

export function FigDouble() {
  const [di, setDi] = useState(1)
  const [amp, setAmp] = useState<'120' | '10'>('120')
  const sim = useMemo(() => {
    const a0 = Number(amp) * DEG
    const A = rk4(pendF, [a0, a0, 0, 0], PT, 0.002, 10)
    const B = rk4(pendF, [a0, a0 + DELTAS[di] * DEG, 0, 0], PT, 0.002, 10)
    const tip = (s: Vec) => [Math.sin(s[0]) + Math.sin(s[1]), Math.cos(s[0]) + Math.cos(s[1])]
    const gap = A.map((s, i) => {
      const [x1, y1] = tip(s)
      const [x2, y2] = tip(B[i])
      return Math.hypot(x1 - x2, y1 - y2)
    })
    const k = gap.findIndex((g) => g > 0.3)
    return { A, B, gap, split: k < 0 ? -1 : k * 0.02 }
  }, [di, amp])
  const O = { x: 190, y: 172 }
  const S = 74
  const arms = (s: Vec) => {
    const x1 = O.x + S * Math.sin(s[0])
    const y1 = O.y + S * Math.cos(s[0])
    return { x1, y1, x2: x1 + S * Math.sin(s[1]), y2: y1 + S * Math.cos(s[1]) }
  }
  const gx = (t: number) => 420 + (t / PT) * 270
  const gy = (g: number) => 190 - Math.min(g, 2) * 60
  return (
    <Anim
      n="5-7"
      title="二重振り子は、初めの角度がほんの少し違うだけで、やがてまったく別の動きになる"
      still={10}
      period={PT}
      controls={
        <>
          <Range label="初めの角度の差" min={0} max={3} step={1} value={di} onChange={setDi} format={(v) => DELTA_LABEL[v]} />
          <Choice
            label="振り始め"
            options={[
              { value: '120', label: '大きく（120度）' },
              { value: '10', label: '小さく（10度）' },
            ]}
            value={amp}
            onChange={setAmp}
          />
        </>
      }
      caption="2つの二重振り子A、Bを同時に放します。Bは下の棒の初めの角度だけを少し変えてあります。「初めの角度の差」を小さくするほどずれ始める時刻は遅くなりますが、差を1000分の1度にしても数秒延びるだけです。「振り始め」を小さくすると、2つはずっとそろって動きます。摩擦のない場合の計算です。"
    >
      {(t) => {
        const ka = at(sim.A, t, 0.02)
        const kb = at(sim.B, t, 0.02)
        const pa = arms(ka)
        const pb = arms(kb)
        const k1 = Math.min(sim.gap.length - 1, Math.round(t / 0.02))
        const graph = poly(sim.gap.slice(0, k1 + 1).map((g, i) => [gx(i * 0.02), gy(g)]))
        return (
          <Svg id="5-7" w={720} h={360} label="同じ形の2つの二重振り子を、下の棒の角度をわずかに変えて同時に放す。初めはそろって動くが、数秒たつとまったく別の動きになる。右のグラフは2つの下のおもりの間の距離で、ある時刻から急に大きくなる。">
            <rect x={O.x - 26} y={O.y - 4} width={52} height={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <line x1={O.x} y1={O.y} x2={pa.x1} y2={pa.y1} stroke="var(--fig-line)" strokeWidth={2.5} />
            <line x1={pa.x1} y1={pa.y1} x2={pa.x2} y2={pa.y2} stroke="var(--fig-line)" strokeWidth={2.5} />
            <Ball x={pa.x1} y={pa.y1} r={8} />
            <Ball x={pa.x2} y={pa.y2} r={8} />
            <line x1={O.x} y1={O.y} x2={pb.x1} y2={pb.y1} stroke="var(--fig-accent)" strokeWidth={1.6} strokeDasharray="5 3" />
            <line x1={pb.x1} y1={pb.y1} x2={pb.x2} y2={pb.y2} stroke="var(--fig-accent)" strokeWidth={1.6} strokeDasharray="5 3" />
            <circle cx={pb.x1} cy={pb.y1} r={10} fill="none" stroke="var(--fig-accent)" strokeWidth={1.6} />
            <circle cx={pb.x2} cy={pb.y2} r={10} fill="none" stroke="var(--fig-accent)" strokeWidth={1.6} />
            <T x={420} y={324} fs={12}>
              A：黒の実線と塗った丸
            </T>
            <T x={420} y={344} fs={12}>
              B：青の破線と青の輪
            </T>
            {/* 2つの下のおもりの距離のグラフ */}
            <T x={420} y={30} fs={12.5} bold>
              2つの下のおもりの間の距離
            </T>
            <line x1={gx(0)} y1={gy(0)} x2={gx(PT) + 8} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(2) - 6} stroke="var(--fig-line)" />
            <T x={gx(PT)} y={gy(0) + 16} anchor="end" fs={12} tone="muted">
              {`時間（${PT}秒まで）→`}
            </T>
            <path d={graph} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
            <T x={420} y={250} fs={12.5}>
              {`経過時間：${t.toFixed(1)}秒`}
            </T>
            <T x={420} y={274} fs={12.5} tone="acc">
              {sim.split < 0 ? `${PT}秒まで、ずれは30cmより小さい` : `ずれが30cmを超えた時刻：約${sim.split.toFixed(1)}秒`}
            </T>
            <T x={420} y={298} fs={12} tone="muted">
              {`初めの角度の差：${DELTA_LABEL[di]}`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図5-8 差が一定の時間ごとに2倍になる ---------- */

export function FigDoubling() {
  const days = [0, 8, 16, 24, 32, 40]
  const base = 250
  return (
    <Figure
      n="5-8"
      title="差が4日ごとに2倍になると、40日で約1000倍になる"
      caption="ローレンツの12の変数の模型で、2つの計算の差がおよそ4日ごとに2倍になったことをもとにした模式図です。棒の高さは差の大きさです。初めの数十日は差がほとんど見えないのに、あるときから急に大きくなります。"
    >
      <Svg id="5-8" w={720} h={300} label="2つの計算の差の大きさの棒グラフ。0日で1倍、8日で4倍、16日で16倍、24日で64倍、32日で256倍、40日で約1000倍になる。初めの差を10分の1にしても、同じ大きさになるのが約13日遅れるだけである。">
        <line x1={60} y1={base} x2={700} y2={base} stroke="var(--fig-line)" />
        {days.map((dd, i) => {
          const f = 2 ** (dd / 4)
          const h = Math.max(1, (f / 1024) * 190)
          const x = 120 + i * 108
          return (
            <g key={dd}>
              <rect x={x - 22} y={base - h} width={44} height={h} fill="var(--fig-box3)" stroke="var(--fig-line)" />
              <T x={x} y={base - h - 12} anchor="middle" fs={12.5}>
                {i === 5 ? '約1000倍' : `${f}倍`}
              </T>
              <T x={x} y={base + 16} anchor="middle" fs={12} tone="muted">
                {`${dd}日`}
              </T>
            </g>
          )
        })}
        <T x={60} y={30} fs={12.5}>
          初めの差を10分の1にしても、
        </T>
        <T x={60} y={50} fs={12.5}>
          同じ大きさになるのが約13日遅れるだけ
        </T>
        <T x={700} y={290} anchor="end" fs={12} tone="muted">
          経過した日数（模型の上の日数）→
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図5-9 アンサンブル予報の考え方 ---------- */

const ensemble = once(() => {
  const r = rng(5)
  const members = Array.from({ length: 20 }, () => lorenz(S0.map((v) => v + (r() - 0.5) * 0.002)))
  return { members: members.map((m) => series(m)), main: series(lorenz(S0)) }
})

export function FigEnsemble() {
  const { members, main } = ensemble()
  return (
    <Figure
      n="5-9"
      title="初めの状態を少しずつ変えた多数の計算を並べると、予報の確かさが分かる"
      caption="ローレンツの1963年の模型を使った模式図です。初めの状態を1000分の1ほどずつ変えた20通りの計算を重ねています。線がそろっている間は予報の確かさが高く、線が散らばったあとは確かさが低いと分かります。"
    >
      <Svg id="5-9" w={720} h={310} label="初めの状態をわずかに変えた20通りの計算の線。初めは束になっているが、時間がたつと広がり、ばらばらになる。">
        <TimeAxes />
        {members.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--fig-muted)" strokeWidth={0.8} opacity={0.75} />
        ))}
        <path d={main} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
        <T x={80} y={30} fs={12.5}>
          線がそろっている：予報の確かさが高い
        </T>
        <T x={690} y={30} anchor="end" fs={12.5}>
          線が散らばる：確かさが低い
        </T>
        <line x1={80} y1={290} x2={110} y2={290} stroke="var(--fig-muted)" strokeWidth={0.8} />
        <T x={116} y={290} fs={12}>
          初めの状態を少しずつ変えた20通りの計算
        </T>
        <line x1={420} y1={290} x2={450} y2={290} stroke="var(--fig-accent)" strokeWidth={2} />
        <T x={456} y={290} fs={12}>
          変えない元の計算
        </T>
      </Svg>
    </Figure>
  )
}
