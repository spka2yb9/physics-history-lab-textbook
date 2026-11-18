import { useMemo, useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Check, Choice } from '../components/controls'
import { Ball, Cross, Force, Trail, Vel, rng } from './common'

/* ---------- この章で使う道具 ---------- */

/** 平均0、ばらつき1の乱数（正規分布） */
function gauss(r: () => number): number {
  const u = Math.max(1e-6, r())
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

/** n 歩のでたらめな歩み。最後に出発点へ戻るように少しずつずらすので、くり返しても位置が飛ばない */
function loopWalk(r: () => number, n: number, s: number): [number, number][] {
  const p: [number, number][] = [[0, 0]]
  for (let i = 0; i < n; i++) {
    const [x, y] = p[i]
    p.push([x + gauss(r) * s, y + gauss(r) * s])
  }
  const [ex, ey] = p[n]
  return p.map(([x, y], i) => [x - (ex * i) / n, y - (ey * i) / n])
}

/** 歩みの途中（u は 0〜1）の位置を、前後の点の間でなめらかにつないで返す */
function walkAt(w: [number, number][], u: number): [number, number] {
  const f = (((u % 1) + 1) % 1) * (w.length - 1)
  const i = Math.floor(f)
  const k = f - i
  const a = w[i]
  const b = w[Math.min(i + 1, w.length - 1)]
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
}

const pathOf = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/* ---------- 図15-1 原子をめぐる3つの立場 ---------- */

export function FigCamps() {
  return (
    <Figure
      n="15-1"
      title="19世紀の終わり、原子が実在するかどうかで研究者の立場が分かれていた"
      caption="3人の主張を短くまとめた図です。ボルツマンも、原子の像を現実そのものではなく、実験と合う結果を生む有用なモデルとして扱っていました。"
    >
      <Svg id="15-1" w={720} h={290} label="ボルツマンは原子と分子の運動から熱を説明する立場、マッハは見ることのできない原子を理論に入れる必要はないという立場、オストヴァルトは自然をエネルギーの移り変わりだけで説明する立場をとった。3人の議論は、目に見えない原子は本当にあるのかという問いに集まり、原子の数と大きさを実験で決めることが求められた。">
        <Box x={10} y={14} w={220} h={146} fill="box2" bold lines={['ボルツマン', '（原子論の立場）', '原子と分子の運動から', '熱の性質を説明する', '原子の像は、実験と合う', '結果を生む有用なモデル']} fs={12.5} />
        <Box x={250} y={14} w={220} h={146} fill="box" bold lines={['マッハ', '（原子論に反対）', '見ることのできない原子を', '理論に入れる必要はない', '法則は、経験を短く', 'まとめたものにすぎない']} fs={12.5} />
        <Box x={490} y={14} w={220} h={146} fill="box" bold lines={['オストヴァルト', '（原子論に反対）', '自然のできごとは、すべて', 'エネルギーの形の', '移り変わりで説明できる', '（エネルギー論）']} fs={12.5} />
        <Arrow x1={120} y1={162} x2={250} y2={200} />
        <Arrow x1={360} y1={162} x2={360} y2={198} />
        <Arrow x1={600} y1={162} x2={470} y2={200} />
        <Box x={160} y={202} w={400} h={40} fill="box3" accent lines="共通の問い：目に見えない原子は、本当にあるのか" fs={13} />
        <T x={360} y={268} anchor="middle" fs={12} tone="muted">
          答えるには、原子や分子の数と大きさを、実験ではっきり決める必要があった
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図15-2 ブラウンが見たもの（動） ---------- */

const POLLEN = { x: 150, y: 150 }
/** 花粉の形（丸みのある三角形。3つの角に穴がある） */
const pollenPath = (() => {
  const pts = [0, 1, 2].map((k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / 3
    return [POLLEN.x + 62 * Math.cos(a), POLLEN.y + 62 * Math.sin(a)]
  })
  const mid = (i: number, j: number, s: number) => [POLLEN.x + ((pts[i][0] + pts[j][0]) / 2 - POLLEN.x) * s, POLLEN.y + ((pts[i][1] + pts[j][1]) / 2 - POLLEN.y) * s]
  let d = ''
  for (let k = 0; k < 3; k++) {
    const a = pts[k]
    const b = pts[(k + 1) % 3]
    const c = mid(k, (k + 1) % 3, 2.3)
    d += `${k ? '' : `M${a[0].toFixed(1)},${a[1].toFixed(1)}`} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`
  }
  return d + ' Z'
})()

const BROWN_PERIOD = 12
const BROWN_GRAINS = (() => {
  const r = rng(1827)
  return Array.from({ length: 16 }, (_, i) => {
    const oblong = i < 7
    // 花粉の右下あたり（花粉からこぼれ出た所）に集めて置く
    const a = -0.6 + r() * 2.4
    const d = 78 + r() * 48
    return {
      oblong,
      x0: POLLEN.x + 10 + d * Math.cos(a),
      y0: POLLEN.y + d * Math.sin(a),
      rot0: r() * 180,
      walk: loopWalk(r, 240, oblong ? 1.1 : 1.7),
      turn: loopWalk(r, 240, 6),
    }
  })
})()

export function FigBrownSaw() {
  return (
    <Anim
      n="15-2"
      title="花粉から出た小さな粒が、水の中で不規則に動き続ける"
      still={6}
      period={BROWN_PERIOD}
      caption="ブラウンが1827年に見た様子の模式図です。動いていたのは花粉そのものではなく、花粉の中から出た小さな粒でした。粒は見やすいように実際より大きく描いています。"
    >
      {(t) => {
        const u = t / BROWN_PERIOD
        const hi = BROWN_GRAINS[9]
        const trail: [number, number][] = []
        for (let k = 0; k <= 30; k++) {
          const [x, y] = walkAt(hi.walk, u - (k * 3) / 30 / BROWN_PERIOD)
          trail.push([hi.x0 + x, hi.y0 + y])
        }
        return (
          <Svg id="15-2" w={720} h={300} label="顕微鏡の視野に、三角形に近い形の花粉と、花粉から出た細長い粒や丸い粒が見える。花粉はほとんど動かないが、小さな粒は止まることなく不規則に動き続ける。">
            <defs>
              <clipPath id="clip-15-2">
                <circle cx={170} cy={145} r={128} />
              </clipPath>
            </defs>
            <circle cx={170} cy={145} r={128} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={2} />
            <g clipPath="url(#clip-15-2)">
              <path d={pollenPath} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
              <Trail points={trail} />
              {BROWN_GRAINS.map((g, i) => {
                const [dx, dy] = walkAt(g.walk, u)
                const x = g.x0 + dx
                const y = g.y0 + dy
                if (g.oblong) {
                  const rot = g.rot0 + walkAt(g.turn, u)[0]
                  return <ellipse key={i} cx={x} cy={y} rx={7} ry={3.2} transform={`rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`} fill="var(--fig-box3)" stroke="var(--fig-line)" />
                }
                return <circle key={i} cx={x} cy={y} r={3.2} fill="var(--fig-box3)" stroke="var(--fig-line)" />
              })}
            </g>
            <T x={170} y={290} anchor="middle" fs={12} tone="muted">
              顕微鏡の視野（ブラウンのレンズで約370倍）
            </T>
            {/* 右の説明（動くものには文字を付けず、見本を添える） */}
            <path d="M342,40 Q352,22 362,40 Q352,46 342,40 Z" fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={378} y={36} fs={12.5}>
              花粉（大きさ約0.1mm）
            </T>
            <T x={378} y={56} fs={12} tone="muted">
              大きすぎて、ほとんど動かない
            </T>
            <ellipse cx={346} cy={100} rx={7} ry={3.2} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <circle cx={362} cy={100} r={3.2} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={378} y={100} fs={12.5}>
              花粉の中から出た粒
            </T>
            <T x={378} y={120} fs={12} tone="muted">
              細長い粒は長さ1000分の4mmほど、
            </T>
            <T x={378} y={138} fs={12} tone="muted">
              丸い粒は1000分の1mmほど
            </T>
            <T x={378} y={158} fs={12} tone="acc">
              止まることなく、不規則に動き続ける
            </T>
            <Trail points={[[338, 200], [350, 194], [356, 206], [368, 198]]} />
            <T x={378} y={200} fs={12.5}>
              1つの丸い粒が直前の3秒間に通った道筋
            </T>
            <T x={340} y={244} fs={12} tone="muted">
              大きさの比は実際と違う（粒を大きく描いている）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図15-3 ブラウンが確かめたこと ---------- */

export function FigBrownTests() {
  return (
    <Figure
      n="15-3"
      title="ブラウンは生き物と関係のない粉でも同じ動きが起こることを確かめた"
      caption="ブラウンの1828年の論文の流れをまとめた図です。赤の × は途中で退けられた考えを表します。"
    >
      <Svg id="15-3" w={720} h={240} label="1827年6月、花粉を水に入れると中から出た粒が動いた。ブラウンははじめ生き物をつくる粒ではないかと考えたが、植物のどの部分をすりつぶした粉も動き、ガラスや岩石、鉱物、スフィンクスのかけらの粉も動いた。そこで、十分に小さな粒は生命と関係なく動くと結論した。">
        <Box x={10} y={20} w={160} h={86} fill="box2" bold lines={['1827年6月', '花粉を水に入れると', '中から出た粒が動く']} fs={12.5} />
        <Box x={190} y={20} w={160} h={86} fill="box" bold lines={['はじめの考え', '生き物をつくる', '「生命の粒」では？']} fs={12.5} />
        <Box x={370} y={20} w={160} h={86} fill="box" lines={['植物のどの部分を', 'すりつぶした粉も', '同じように動く']} fs={12.5} />
        <Box x={550} y={20} w={160} h={86} fill="box" lines={['ガラス・岩石・鉱物、', 'スフィンクスの', 'かけらの粉も動く']} fs={12.5} />
        <Arrow x1={172} y1={63} x2={188} y2={63} />
        <Arrow x1={352} y1={63} x2={368} y2={63} />
        <Arrow x1={532} y1={63} x2={548} y2={63} />
        <Cross x={212} y={134} s={8} />
        <T x={228} y={134} fs={12} tone="danger">
          この考えは退けられた
        </T>
        <Arrow x1={630} y1={108} x2={630} y2={166} />
        <Box x={250} y={168} w={460} h={52} fill="box3" accent bold lines={['結論（1828年の論文）', '十分に小さな粒は、生命と関係なく動く']} fs={13} />
      </Svg>
    </Figure>
  )
}

/* ---------- 図15-4 見えない分子がぶつかって粒を動かす（動・切り替え） ---------- */

const KB = { x: 20, y: 24, w: 380, h: 250 }
const K_FPS = 30
const K_SEC = 10

interface KickSim {
  frames: Float32Array[]
  hits: { f: number; a: number }[][]
  n: number
}

/** 分子（質量1）と1つの粒（半径 R、質量 M）の弾性衝突を計算し、1秒30コマで記録する */
function kicks(R: number, M: number): KickSim {
  const r = rng(1905)
  const n = 70
  const mr = 3
  const mol = Array.from({ length: n }, () => {
    let x = 0
    let y = 0
    do {
      x = mr + r() * (KB.w - 2 * mr)
      y = mr + r() * (KB.h - 2 * mr)
    } while (Math.hypot(x - KB.w / 2, y - KB.h / 2) < R + 8)
    return { x, y, vx: gauss(r) * 110, vy: gauss(r) * 110 }
  })
  const p = { x: KB.w / 2, y: KB.h / 2, vx: 0, vy: 0 }
  const sub = 8
  const dt = 1 / K_FPS / sub
  const frames: Float32Array[] = []
  const hits: { f: number; a: number }[][] = []
  for (let f = 0; f < K_FPS * K_SEC; f++) {
    const hf: { f: number; a: number }[] = []
    for (let s = 0; s < sub; s++) {
      for (const m of mol) {
        m.x += m.vx * dt
        m.y += m.vy * dt
        if (m.x < mr || m.x > KB.w - mr) {
          m.vx = -m.vx
          m.x = Math.min(Math.max(m.x, mr), KB.w - mr)
        }
        if (m.y < mr || m.y > KB.h - mr) {
          m.vy = -m.vy
          m.y = Math.min(Math.max(m.y, mr), KB.h - mr)
        }
        const dx = m.x - p.x
        const dy = m.y - p.y
        const d = Math.hypot(dx, dy)
        if (d < R + mr && d > 0) {
          const nx = dx / d
          const ny = dy / d
          const rel = (m.vx - p.vx) * nx + (m.vy - p.vy) * ny
          if (rel < 0) {
            const j = (2 * rel) / (1 + 1 / M)
            m.vx -= j * nx
            m.vy -= j * ny
            p.vx += (j * nx) / M
            p.vy += (j * ny) / M
            hf.push({ f, a: Math.atan2(ny, nx) })
          }
        }
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.x < R || p.x > KB.w - R) p.vx = -p.vx
      if (p.y < R || p.y > KB.h - R) p.vy = -p.vy
      p.x = Math.min(Math.max(p.x, R), KB.w - R)
      p.y = Math.min(Math.max(p.y, R), KB.h - R)
    }
    const fr = new Float32Array(2 * n + 2)
    mol.forEach((m, i) => {
      fr[2 * i] = m.x
      fr[2 * i + 1] = m.y
    })
    fr[2 * n] = p.x
    fr[2 * n + 1] = p.y
    frames.push(fr)
    hits.push(hf)
  }
  return { frames, hits, n }
}

const KICK_SIZE = {
  small: { R: 12, M: 20 },
  large: { R: 36, M: 300 },
} as const

export function FigKicks() {
  const [size, setSize] = useState<'small' | 'large'>('small')
  const [show, setShow] = useState(true)
  const { R, M } = KICK_SIZE[size]
  const sim = useMemo(() => kicks(R, M), [R, M])
  return (
    <Anim
      n="15-4"
      title="まわりの分子が不規則にぶつかり、浮かんでいる粒を押し動かす"
      still={6}
      period={K_SEC}
      controls={
        <>
          <Choice
            label="粒の大きさ"
            options={[
              { value: 'small', label: '小さい' },
              { value: 'large', label: '大きい' },
            ]}
            value={size}
            onChange={setSize}
          />
          <Check label="分子を表示する" checked={show} onChange={setShow} />
        </>
      }
      caption="模式図です。実際の分子は粒よりはるかに小さく、数もはるかに多くあります。「粒の大きさ」を切り替えると、大きい粒ほど動きが小さくなることが分かります。「分子を表示する」を外すと、顕微鏡で見える様子（粒だけ）になります。"
    >
      {(t) => {
        const f = Math.min(sim.frames.length - 1, Math.floor((t % K_SEC) * K_FPS))
        const fr = sim.frames[f]
        const px = KB.x + fr[2 * sim.n]
        const py = KB.y + fr[2 * sim.n + 1]
        const trail: [number, number][] = []
        for (let k = Math.max(0, f - 120); k <= f; k += 3) trail.push([KB.x + sim.frames[k][2 * sim.n], KB.y + sim.frames[k][2 * sim.n + 1]])
        const recent = sim.hits.slice(Math.max(0, f - 3), f + 1).flat()
        return (
          <Svg id="15-4" w={720} h={290} label="箱の中を分子が飛び回り、浮かんでいる粒にでたらめな向きからぶつかる。ぶつかるたびに粒は押され、不規則に動く。大きい粒は多くの分子に押されて押し方の差が打ち消し合い、あまり動かない。">
            <rect x={KB.x} y={KB.y} width={KB.w} height={KB.h} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            {show &&
              Array.from({ length: sim.n }, (_, i) => <circle key={i} cx={KB.x + fr[2 * i]} cy={KB.y + fr[2 * i + 1]} r={3} fill="var(--fig-box3)" stroke="var(--fig-muted)" />)}
            {trail.length > 1 && <Trail points={trail} />}
            <Ball x={px} y={py} r={R} fill="var(--fig-box2)" />
            {show &&
              recent.map((h, i) => {
                const c = Math.cos(h.a)
                const s = Math.sin(h.a)
                return <Force key={i} x1={px + c * (R + 20)} y1={py + s * (R + 20)} x2={px + c * (R + 2)} y2={py + s * (R + 2)} />
              })}
            <T x={KB.x} y={12} fs={12} tone="muted">
              {show ? '液体の中（分子を大きく描いた模式図）' : '顕微鏡で見える様子：分子は見えず、粒だけが動く'}
            </T>
            <T x={424} y={40} fs={12.5} bold>
              {size === 'small' ? '小さい粒' : '大きい粒'}
            </T>
            <T x={424} y={64} fs={12.5}>
              {size === 'small' ? '一度に当たる分子が少なく、' : '一度にたくさんの分子が当たり、'}
            </T>
            <T x={424} y={84} fs={12.5}>
              {size === 'small' ? '押される向きの偏りが大きい。' : '押す力がほぼ打ち消し合う。'}
            </T>
            <T x={424} y={104} fs={12.5} tone="acc">
              {size === 'small' ? 'そのため、大きく不規則に動く' : 'そのため、わずかしか動かない'}
            </T>
            <Force x1={424} y1={150} x2={470} y2={150} />
            <T x={480} y={150} fs={12}>
              分子が粒を押す力（ぶつかった瞬間）
            </T>
            <Trail points={[[424, 182], [470, 182]]} />
            <T x={480} y={182} fs={12}>
              粒が直前の4秒間に通った道筋
            </T>
            <circle cx={447} cy={214} r={3} fill="var(--fig-box3)" stroke="var(--fig-muted)" />
            <T x={480} y={214} fs={12}>
              液体の分子（実際には見えない）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図15-5 記録の間隔を変えても、道筋はなめらかにならない（動・切り替え） ---------- */

const FINE_N = 2500 // 0.3秒ごとに、750秒分
const FINE = (() => {
  const r = rng(1908)
  const p: [number, number][] = [[0, 0]]
  for (let i = 0; i < FINE_N; i++) p.push([p[i][0] + gauss(r), p[i][1] + gauss(r)])
  const xs = p.map((q) => q[0])
  const ys = p.map((q) => q[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const k = Math.min(310 / (x1 - x0), 220 / (y1 - y0))
  return p.map(([x, y]) => [30 + (x - x0) * k + (310 - (x1 - x0) * k) / 2, 34 + (y - y0) * k + (220 - (y1 - y0) * k) / 2] as [number, number])
})()
const STEP_OF = { '30': 100, '3': 10, '0.3': 1 } as const
type Interval = keyof typeof STEP_OF
const lengthOf = (step: number) => {
  let s = 0
  for (let i = step; i <= FINE_N; i += step) s += Math.hypot(FINE[i][0] - FINE[i - step][0], FINE[i][1] - FINE[i - step][1])
  return s
}
const LEN_RATIO = { '30': 1, '3': lengthOf(10) / lengthOf(100), '0.3': lengthOf(1) / lengthOf(100) }

export function FigInterval() {
  const [iv, setIv] = useState<Interval>('30')
  const step = STEP_OF[iv]
  const drawEnd = 8
  return (
    <Anim
      n="15-5"
      title="記録の間隔を短くしても、粒の道筋はなめらかにならない"
      still={9.5}
      period={11}
      controls={
        <Choice
          label="位置を記録する間隔"
          options={[
            { value: '30', label: '30秒ごと' },
            { value: '3', label: '3秒ごと' },
            { value: '0.3', label: '0.3秒ごと' },
          ]}
          value={iv}
          onChange={setIv}
        />
      }
      caption="同じ1つの粒の動き（12分30秒間）を、間隔を変えて記録したときの模式図です。間隔を短くすると、1本の線分がそれぞれ細かい折れ線に置き換わり、折れ線の全長は長くなります。出発点から終点までの移動距離（破線の矢印）は、間隔を変えても同じです。"
    >
      {(t) => {
        const upto = Math.round(Math.min(1, t / drawEnd) * FINE_N)
        const pts: [number, number][] = []
        for (let i = 0; i <= upto; i += step) pts.push(FINE[i])
        const last = pts[pts.length - 1]
        return (
          <Svg id="15-5" w={720} h={290} label="1つの粒の位置を一定の間隔で記録し、直線で結んだ折れ線。間隔を短くするほど折れ線は細かく複雑になり、全長が長くなるが、出発点から終点までの移動距離は変わらない。">
            <rect x={20} y={24} width={330} height={240} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <path d={pathOf(pts)} fill="none" stroke="var(--fig-line)" strokeWidth={iv === '0.3' ? 0.7 : 1.2} />
            {iv === '30' && pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.5} fill="var(--fig-line)" />)}
            {pts.length > 1 && Math.hypot(last[0] - FINE[0][0], last[1] - FINE[0][1]) > 12 && <Arrow x1={FINE[0][0]} y1={FINE[0][1]} x2={last[0]} y2={last[1]} dashed />}
            <circle cx={FINE[0][0]} cy={FINE[0][1]} r={5} fill="var(--fig-accent)" />
            <T x={20} y={12} fs={12} tone="muted">
              {`${iv}秒ごとの位置を直線で結んだ折れ線（模式図）`}
            </T>
            <circle cx={384} cy={50} r={5} fill="var(--fig-accent)" />
            <T x={396} y={50} fs={12.5}>
              出発点
            </T>
            <Arrow x1={374} y1={80} x2={414} y2={80} dashed />
            <T x={424} y={80} fs={12.5}>
              出発点から今の位置までの移動距離
            </T>
            <T x={374} y={124} fs={12.5} bold>
              折れ線の全長（30秒ごとの記録を1として）
            </T>
            <T x={374} y={148} fs={13} tone="acc">
              {iv === '30' ? '1' : `約${LEN_RATIO[iv].toFixed(1)}倍`}
            </T>
            <T x={374} y={180} fs={12.5}>
              間隔を10分の1にすると、全長は約3倍になる。
            </T>
            <T x={374} y={200} fs={12.5}>
              全長を時間で割った「速さ」は、決まった値にならない。
            </T>
            <T x={374} y={236} fs={12.5} tone="acc">
              移動距離は、間隔によらず同じ値になる
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図15-6 時間とともに広がる粒の位置（動・切り替え） ---------- */

const SP_N = 70
const SP_STEPS = 90 // 0.1ずつ、時間 9 まで
const SP_UNIT = 24 // 半径1倍の粒の、時間1のときの平均的な距離（ピクセル）
const SP_WALKS = (() => {
  const r = rng(1905_05)
  const s = (SP_UNIT / Math.SQRT2) * Math.sqrt(0.1)
  return Array.from({ length: SP_N }, () => {
    const p: [number, number][] = [[0, 0]]
    for (let i = 0; i < SP_STEPS; i++) p.push([p[i][0] + gauss(r) * s, p[i][1] + gauss(r) * s])
    return p
  })
})()

export function FigSpread() {
  const [size, setSize] = useState<'1' | '4'>('1')
  const k = size === '1' ? 1 : 0.5
  const cx = 170
  const cy = 150
  const gx = (tm: number) => 395 + tm * 30
  const gy = (d: number) => 246 - d * 56
  const curve = (kk: number) => pathOf(Array.from({ length: 91 }, (_, i) => [gx(i / 10), gy(kk * Math.sqrt(i / 10))]))
  return (
    <Anim
      n="15-6"
      title="粒の広がりは、時間が4倍で2倍、9倍で3倍になる"
      still={9.5}
      period={11}
      controls={
        <Choice
          label="粒の半径"
          options={[
            { value: '1', label: '1倍' },
            { value: '4', label: '4倍' },
          ]}
          value={size}
          onChange={setSize}
        />
      }
      caption="同じ点から動き出した70個の粒の位置の模式図です。円の半径は出発点から粒までの平均的な距離を表します。「粒の半径」を4倍にすると、同じ時間に広がる距離は半分になります（右のグラフの点線は1倍のとき）。"
    >
      {(t) => {
        const tm = Math.min(t, 9)
        const i = Math.min(SP_STEPS, Math.round(tm * 10))
        const rad = SP_UNIT * k * Math.sqrt(tm)
        return (
          <Svg id="15-6" w={720} h={290} label="同じ点から動き出した粒は、時間とともに広がっていく。平均的な距離は、時間が4倍になると2倍、9倍になると3倍になる。粒の半径を4倍にすると、広がる距離は半分になる。">
            <defs>
              <clipPath id="clip-15-6">
                <rect x={20} y={24} width={300} height={252} />
              </clipPath>
            </defs>
            <rect x={20} y={24} width={300} height={252} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <g clipPath="url(#clip-15-6)">
              <circle cx={cx} cy={cy} r={Math.max(rad, 0.1)} fill="none" stroke="var(--fig-muted)" strokeWidth={2} />
              {SP_WALKS.map((w, j) => (
                <circle key={j} cx={cx + w[i][0] * k} cy={cy + w[i][1] * k} r={3} fill="var(--fig-box3)" stroke="var(--fig-line)" />
              ))}
              <circle cx={cx} cy={cy} r={3} fill="var(--fig-accent)" />
            </g>
            <T x={20} y={12} fs={12} tone="muted">
              {`同じ点から動き出した粒（時間 ${tm.toFixed(1)}）`}
            </T>
            {/* 右のグラフ */}
            <line x1={gx(0)} y1={gy(0)} x2={gx(9) + 16} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(3) - 18} stroke="var(--fig-line)" />
            <T x={gx(9) + 20} y={gy(0)} fs={12}>
              時間
            </T>
            <T x={gx(0) - 6} y={gy(3) - 26} fs={12}>
              平均的な距離
            </T>
            {[1, 4, 9].map((m) => (
              <g key={m}>
                <line x1={gx(m)} y1={gy(0)} x2={gx(m)} y2={gy(Math.sqrt(m))} stroke="var(--fig-muted)" strokeDasharray="3 3" />
                <line x1={gx(0)} y1={gy(Math.sqrt(m))} x2={gx(m)} y2={gy(Math.sqrt(m))} stroke="var(--fig-muted)" strokeDasharray="3 3" />
                <T x={gx(m)} y={gy(0) + 14} anchor="middle" fs={12}>
                  {m}
                </T>
                <T x={gx(0) - 8} y={gy(Math.sqrt(m))} anchor="end" fs={12}>
                  {Math.sqrt(m)}
                </T>
              </g>
            ))}
            {size === '4' && <path d={curve(1)} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="5 4" />}
            <path d={curve(k)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            <circle cx={gx(tm)} cy={gy(k * Math.sqrt(tm))} r={5} fill="var(--fig-accent)" />
            <T x={500} y={30} fs={12.5} tone="acc">
              {size === '1' ? '時間が4倍で距離は2倍、9倍で3倍' : '半径4倍の粒：距離は半分になる'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図15-7 乳濁液の粒が下にたまり、高さとともに減っていく（動） ---------- */

const CELL = { x: 40, y: 34, w: 160, h: 220 }
const SET_N = 300
const SET_FPS = 25
const SET_SEC = 20
const HALF = 50 // 粒の数が半分になる高さ（ピクセル）
const SETTLE = (() => {
  const r = rng(1909)
  const vs = CELL.h / 11 // 沈む速さ（約11秒で容器の高さだけ沈む）
  const D = (HALF * vs) / Math.LN2
  const dt = 1 / SET_FPS
  const sd = Math.sqrt(2 * D * dt)
  const pos = Array.from({ length: SET_N }, () => [4 + r() * (CELL.w - 8), 4 + r() * (CELL.h - 8)])
  const frames: Float32Array[] = []
  for (let f = 0; f < SET_FPS * SET_SEC; f++) {
    const fr = new Float32Array(2 * SET_N)
    pos.forEach((p, i) => {
      fr[2 * i] = p[0]
      fr[2 * i + 1] = p[1]
      p[0] += gauss(r) * sd
      p[1] += -vs * dt + gauss(r) * sd
      if (p[0] < 4) p[0] = 8 - p[0]
      if (p[0] > CELL.w - 4) p[0] = 2 * (CELL.w - 4) - p[0]
      if (p[1] < 4) p[1] = 8 - p[1]
      if (p[1] > CELL.h - 4) p[1] = 2 * (CELL.h - 4) - p[1]
    })
    frames.push(fr)
  }
  return frames
})()

/** ペランの『原子』（英訳1916年）の値。マスチックの粒（半径1000分の0.52mm）、1000分の6mmずつ高さを変えて撮影した粒の数 */
const PERRIN_COUNTS = [
  { h: '高さ 18', n: 305 },
  { h: '高さ 12', n: 530 },
  { h: '高さ 6', n: 940 },
  { h: '高さ 0', n: 1880 },
]

export function FigSettle() {
  return (
    <Anim
      n="15-7"
      title="乳濁液の粒は下にたまり、高さが上がるごとに同じ割合で減っていく"
      still={18}
      period={SET_SEC}
      caption="左は、よく混ぜた乳濁液を密閉した容器に入れて置いた様子の模式図です。粒は沈みながらも動き続け、下ほど多く上ほど少ない分布で落ち着きます。実際の実験では高さ1mmほどの容器で落ち着くまでに数日かかりました。右はペランが写真で数えた実際の粒の数です。"
    >
      {(t) => {
        const f = Math.min(SETTLE.length - 1, Math.floor((t % SET_SEC) * SET_FPS))
        const fr = SETTLE[f]
        const early = t % SET_SEC < 2.5
        return (
          <Svg id="15-7" w={720} h={300} label="容器の中で一様に混ざっていた粒が下にたまり、下ほど多く上ほど少ない分布で落ち着く。ペランが数えた粒の数は、高さが1000分の6mm上がるごとに1880、940、530、305と、ほぼ半分ずつ減った。空気では高さ約6kmごとに半分になる。">
            <rect x={CELL.x} y={CELL.y} width={CELL.w} height={CELL.h} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            {[1, 2, 3].map((m) => (
              <line key={m} x1={CELL.x} y1={CELL.y + CELL.h - m * HALF} x2={CELL.x + CELL.w} y2={CELL.y + CELL.h - m * HALF} stroke="var(--fig-muted)" strokeDasharray="3 4" />
            ))}
            {Array.from({ length: SET_N }, (_, i) => (
              <circle key={i} cx={CELL.x + fr[2 * i]} cy={CELL.y + CELL.h - fr[2 * i + 1]} r={2.4} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={0.8} />
            ))}
            <T x={CELL.x} y={18} fs={12} tone="muted">
              密閉した容器の乳濁液（模式図）
            </T>
            <T x={CELL.x + CELL.w / 2} y={CELL.y + CELL.h + 20} anchor="middle" fs={12.5} tone={early ? undefined : 'acc'}>
              {early ? '混ぜた直後：どの高さも同じ' : '時間がたった後：下ほど多い'}
            </T>
            {/* ペランの数えた値 */}
            <T x={300} y={30} fs={12.5} bold>
              ペランが写真で数えた粒の数
            </T>
            <T x={300} y={50} fs={12} tone="muted">
              高さの単位は1000分の1mm
            </T>
            {PERRIN_COUNTS.map((c, i) => {
              const y = 80 + i * 40
              const len = (c.n / 1880) * 270
              return (
                <g key={c.h}>
                  <T x={300} y={y} fs={12.5}>
                    {c.h}
                  </T>
                  <rect x={370} y={y - 10} width={len} height={20} fill="var(--fig-box2)" stroke="var(--fig-line)" />
                  <T x={376 + len} y={y} fs={12.5}>
                    {`${c.n}個`}
                  </T>
                </g>
              )
            })}
            <T x={300} y={250} fs={12.5} tone="acc">
              高さが1000分の6mm上がるごとに、粒の数はほぼ半分
            </T>
            <T x={300} y={274} fs={12.5} tone="muted">
              空気の分子の数は、高さが約6km上がるごとに半分
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図15-8 いろいろな方法で求めたアボガドロ数 ---------- */

/** ペランのノーベル賞講演（1926年）に挙げられた値。単位は「1000億の1兆倍」の10分の1（講演の表記の 10 の 22 乗） */
const AVO = [
  { label: '気体分子運動論の見積もり（19世紀後半）', lo: 40, hi: 120 },
  { label: '乳濁液の高さによる粒の数（ペラン）', lo: 68 },
  { label: '粒の移動距離（ペランら）', lo: 64 },
  { label: '粒の回転（ペラン、1910年）', lo: 65 },
  { label: '空が青く見える光の散らばり方', lo: 65 },
  { label: '熱した物が出す光（プランクの理論）', lo: 64 },
  { label: '電気の最小単位の測定（ミリカン）', lo: 61 },
  { label: '放射能（ヘリウム原子を数える）', lo: 62, hi: 70 },
]

export function FigAvogadroValues() {
  const x = (v: number) => 300 + (v - 40) * 4.75
  const top = 50
  const row = 27
  const bottom = top + AVO.length * row
  return (
    <Figure
      n="15-8"
      title="まったく違う方法で求めたアボガドロ数が、ほぼ同じ値にそろった"
      caption="ペランが1926年のノーベル賞講演で挙げた値です。横棒は値の幅を、丸は求めた値を表します。破線は現在の値（約6022億の1兆倍）です。気体分子運動論の見積もりは幅が3倍もありましたが、20世紀の測定は6000億の1兆倍から7000億の1兆倍あたりに集まりました。"
    >
      <Svg id="15-8" w={720} h={bottom + 64} label="アボガドロ数を、気体分子運動論、乳濁液の粒の数、粒の移動距離と回転、空の青さ、熱した物が出す光、電気の最小単位、放射能から求めた値の比較。気体分子運動論の見積もりは4000億の1兆倍から1兆2000億の1兆倍まで幅があったが、ほかの方法の値はおよそ6100億の1兆倍から7000億の1兆倍に集まり、現在の値の約6022億の1兆倍に近い。">
        <line x1={x(60.22)} y1={top - 18} x2={x(60.22)} y2={bottom} stroke="var(--fig-accent)" strokeWidth={1.5} strokeDasharray="5 4" />
        <T x={x(60.22) - 6} y={top - 30} anchor="end" fs={12} tone="acc">
          現在の値
        </T>
        {AVO.map((a, i) => {
          const y = top + i * row + row / 2
          return (
            <g key={a.label}>
              <T x={290} y={y} anchor="end" fs={12}>
                {a.label}
              </T>
              <line x1={300} y1={y} x2={x(120)} y2={y} stroke="var(--fig-muted)" strokeWidth={0.5} />
              {a.hi != null && (
                <g stroke="var(--fig-line)" strokeWidth={3}>
                  <line x1={x(a.lo)} y1={y} x2={x(a.hi)} y2={y} />
                  <line x1={x(a.lo)} y1={y - 6} x2={x(a.lo)} y2={y + 6} strokeWidth={1.5} />
                  <line x1={x(a.hi)} y1={y - 6} x2={x(a.hi)} y2={y + 6} strokeWidth={1.5} />
                </g>
              )}
              {a.hi == null && <circle cx={x(a.lo)} cy={y} r={5} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />}
            </g>
          )
        })}
        <line x1={300} y1={bottom + 4} x2={x(120)} y2={bottom + 4} stroke="var(--fig-line)" />
        {[
          [40, '4000億'],
          [60, '6000億'],
          [80, '8000億'],
          [100, '1兆'],
          [120, '1兆2000億'],
        ].map(([v, s]) => (
          <g key={v}>
            <line x1={x(Number(v))} y1={bottom + 4} x2={x(Number(v))} y2={bottom + 9} stroke="var(--fig-line)" />
            <T x={x(Number(v))} y={bottom + 20} anchor="middle" fs={12}>
              {s}
            </T>
          </g>
        ))}
        <T x={x(80)} y={bottom + 44} anchor="middle" fs={12} tone="muted">
          求めた値（目盛りの数の1兆倍）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図15-9 ギブズの考え：同じ条件の箱をたくさん思い浮かべる ---------- */

const ENS = (() => {
  const r = rng(1902)
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [6 + r() * 78, 6 + r() * 44]))
})()
const ONE_BOX = (() => {
  const r = rng(1871)
  return Array.from({ length: 10 }, () => ({ x: 20 + r() * 170, y: 20 + r() * 110, a: r() * 2 * Math.PI, v: 14 + r() * 16 }))
})()

export function FigEnsemble() {
  return (
    <Figure
      n="15-9"
      title="ギブズは同じ条件の箱をたくさん思い浮かべ、その平均として温度や圧力を考えた"
      caption="模式図です。右の9つの箱は、温度と体積が同じで、分子の並び方と速さだけが違う写しを表します。実際の気体では分子の数がとても多いため、ほとんどの写しがほぼ同じエネルギーを持ちます。"
    >
      <Svg id="15-9" w={720} h={300} label="左は1つの箱の中の分子を時間を追って調べる、それまでの力学の見方。右は温度と体積が同じで分子の並び方と速さだけが違う箱を多数思い浮かべ、その分布と平均から温度や圧力を求める、ギブズの統計力学の見方。">
        <T x={20} y={20} fs={13} bold>
          1つの箱を、時間を追って調べる
        </T>
        <T x={20} y={40} fs={12} tone="muted">
          （それまでの力学の見方）
        </T>
        <rect x={20} y={56} width={210} height={150} fill="var(--fig-bg)" stroke="var(--fig-line)" />
        {ONE_BOX.map((m, i) => (
          <g key={i}>
            <Ball x={20 + m.x} y={56 + m.y} r={4} />
            <Vel x1={20 + m.x} y1={56 + m.y} x2={20 + m.x + Math.cos(m.a) * m.v} y2={56 + m.y + Math.sin(m.a) * m.v} />
          </g>
        ))}
        <Arrow x1={20} y1={226} x2={230} y2={226} />
        <T x={125} y={244} anchor="middle" fs={12}>
          時間
        </T>
        <T x={20} y={276} fs={12} tone="muted">
          分子の数が多すぎて、1個ずつは追えない
        </T>
        <T x={290} y={20} fs={13} bold>
          同じ条件の箱を、たくさん思い浮かべる
        </T>
        <T x={290} y={40} fs={12} tone="muted">
          （ギブズの統計力学の見方）
        </T>
        {ENS.map((box, b) => {
          const bx = 290 + (b % 3) * 100
          const by = 56 + Math.floor(b / 3) * 64
          return (
            <g key={b}>
              <rect x={bx} y={by} width={90} height={56} fill="var(--fig-bg)" stroke="var(--fig-line)" />
              {box.map(([x, y], i) => (
                <circle key={i} cx={bx + x} cy={by + y} r={2.6} fill="var(--fig-box3)" stroke="var(--fig-line)" />
              ))}
            </g>
          )
        })}
        <T x={600} y={84} fs={12}>
          温度と体積は
        </T>
        <T x={600} y={102} fs={12}>
          どの箱も同じ
        </T>
        <T x={600} y={140} fs={12}>
          分子の並び方と
        </T>
        <T x={600} y={158} fs={12}>
          速さは箱ごとに
        </T>
        <T x={600} y={176} fs={12}>
          違う
        </T>
        <Arrow x1={430} y1={250} x2={430} y2={262} />
        <T x={290} y={280} fs={12.5} tone="acc">
          たくさんの箱の分布と平均から、温度や圧力が決まる
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図15-10 原子の実在が認められるまでの年表 ---------- */

const ROAD15 = [
  { y: '1827年', what: 'ブラウン：花粉から出た粒の不規則な動きを調べる' },
  { y: '1863年', what: 'ウィーナー：動きの原因を液体の内部の運動に求める' },
  { y: '1888年', what: 'グイ：分子の衝突による説明を詳しく論じる' },
  { y: '1895年', what: 'リューベックの学会で、ボルツマンとオストヴァルトが論争' },
  { y: '1900年', what: 'エクスナー：粒の速さを測るが、理論の値と合わない' },
  { y: '1902年', what: 'ギブズ：『統計力学の基本原理』を出版' },
  { y: '1905年', what: 'アインシュタイン：ブラウン運動の理論' },
  { y: '1906年', what: 'スモルコフスキーの理論。ボルツマンが死去' },
  { y: '1908年', what: 'ペラン：乳濁液の高さ分布と粒の移動距離を測る（〜1909年）' },
  { y: '1913年', what: 'ペラン『原子』：アボガドロ数を求める13の方法をまとめる' },
  { y: '1926年', what: 'ペランにノーベル物理学賞' },
]

export function FigRoad15() {
  const row = 26
  return (
    <Figure n="15-10" title="原子と分子の実在が認められるまでの年表" caption="上から古い順に並べています。行の間隔は年数に比例していません。">
      <Svg id="15-10" w={520} h={ROAD15.length * row + 30} label="1827年のブラウンの観察から、1863年のウィーナー、1888年のグイ、1895年のリューベックの論争、1900年のエクスナーの測定、1902年のギブズの本、1905年のアインシュタインの理論、1906年のスモルコフスキーの理論とボルツマンの死、1908年からのペランの実験、1913年の『原子』、1926年のペランのノーベル賞までの年表。">
        <line x1={92} y1={14} x2={92} y2={ROAD15.length * row + 6} stroke="var(--fig-line)" />
        {ROAD15.map((r, i) => {
          const y = 22 + i * row
          const key = r.y === '1905年' || r.y === '1908年'
          return (
            <g key={r.y}>
              <T x={80} y={y} anchor="end" fs={12.5} bold>
                {r.y}
              </T>
              <circle cx={92} cy={y} r={5} fill={key ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <T x={106} y={y} fs={12.5}>
                {r.what}
              </T>
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}
