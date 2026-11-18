import { useState } from 'react'
import { Compare, Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { Ball, Cross, Force, Trail, clamp01, ease, rng } from './common'

/*
 * 第30章の図の決まり：
 *   陽子：青みの塗り（box3）、中性子：灰色の塗り（box）、中間子：橙（MESON）
 *   クォークの色荷：赤・緑・青の塗りに「赤」などの文字を添える
 * 色だけで区別せず、必ず文字を添える。
 */

const MESON = '#d9822b'
const PURPLE = '#a855c8'
const RED = '#e0564b'

/** 正負の記号（文字ではなく線で描く。力線と重なっても読めるように） */
function Sign({ x, y, minus, s = 4.5 }: { x: number; y: number; minus?: boolean; s?: number }) {
  return <path d={minus ? `M${x - s},${y} H${x + s}` : `M${x - s},${y} H${x + s} M${x},${y - s} V${y + s}`} stroke="var(--fig-text)" strokeWidth={1.8} />
}

/** 陽子か中性子の丸。中に名前を書く */
function Nucleon({ x, y, r = 24, proton, strong }: { x: number; y: number; r?: number; proton: boolean; strong?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={proton ? 'var(--fig-box3)' : 'var(--fig-box)'} stroke={strong ? 'var(--fig-accent)' : 'var(--fig-line)'} strokeWidth={strong ? 2.5 : 1.5} />
      {r >= 20 && (
        <T x={x} y={y} anchor="middle" fs={11.5}>
          {proton ? '陽子' : '中性子'}
        </T>
      )}
    </g>
  )
}

/** 名前を書いた粒子の丸（クォークや八道説の粒子） */
function Dot({ x, y, r = 18, label, fill = 'var(--fig-bg)', dashed, accent, fs = 13 }: { x: number; y: number; r?: number; label: string; fill?: string; dashed?: boolean; accent?: boolean; fs?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={accent ? 'var(--fig-accent)' : 'var(--fig-line)'} strokeWidth={accent ? 2.2 : 1.4} strokeDasharray={dashed ? '4 3' : undefined} />
      <T x={x} y={y} anchor="middle" fs={fs}>
        {label}
      </T>
    </g>
  )
}

const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/* ---------- 図30-1 原子核の中で核力が届く範囲 ---------- */

const NUC = { x: 200, y: 172, step: 29 }
// 六角形に並べた19個の粒。true が陽子
const NUC_PTS = (() => {
  const pts: { x: number; y: number; proton: boolean; c: boolean }[] = []
  const protons = new Set(['0,0', '1,0', '-1,1', '0,-1', '2,-1', '-2,0', '1,1', '-1,-1', '0,2'])
  for (let q = -2; q <= 2; q++)
    for (let r = -2; r <= 2; r++) {
      if (Math.abs(q + r) > 2) continue
      pts.push({ x: NUC.x + NUC.step * (q + r / 2), y: NUC.y + NUC.step * r * 0.866, proton: protons.has(`${q},${r}`), c: q === 0 && r === 0 })
    }
  return pts
})()

const PX_PER_UNIT = 16.5 // 1mmの1兆分の1 を 16.5px で描く

export function FigReach() {
  const [mass, setMass] = useState<'0' | '100' | '200' | '400'>('200')
  const m = Number(mass)
  const reach = m === 0 ? 0 : 386 / m // 届く距離（1mmの1兆分の1を単位とする）
  const R = m === 0 ? 128 : reach * PX_PER_UNIT
  const reachText = m === 0 ? 'どこまでも届く' : `1mmの1兆分の約${Math.round(reach)}`
  const note = { '0': '原子核全体に届く', '100': '原子核の大部分に届く', '200': 'となりの粒までに届く', '400': '接している粒にしか届かない' }[mass]
  return (
    <Figure
      n="30-1"
      title="電気の力は原子核全体に届くが、核力はとなりの粒までしか届かない"
      controls={
        <Choice
          label="核力を伝える粒子の質量（湯川の考え）"
          options={[
            { value: '0', label: '0（光子と同じ）' },
            { value: '100', label: '電子の100倍' },
            { value: '200', label: '電子の200倍' },
            { value: '400', label: '電子の400倍' },
          ]}
          value={mass}
          onChange={setMass}
        />
      }
      caption="模式図です。粒の並び方は実際の原子核と同じではありません。粒の大きさと間隔の比はおおよそです。中央の太い枠の陽子から見て、点線は電気の力（陽子どうしの押し合い）がはたらく相手を、青い円は核力が届く範囲を表します。「核力を伝える粒子の質量」を変えると、青い円の大きさが変わります。粒子が重いほど、核力の届く範囲は狭くなります。"
    >
      <Svg id="30-1" w={720} h={330} label="原子核の中の陽子と中性子。中央の陽子から見ると、電気の力はほかのすべての陽子との間にはたらく。核力が届く範囲は、力を伝える粒子の質量が電子の200倍のとき、となりの粒までになる。質量が大きいほど範囲は狭く、質量が0なら原子核全体に届く。">
        {NUC_PTS.filter((p) => p.proton && !p.c).map((p, i) => (
          <line key={i} x1={NUC.x} y1={NUC.y} x2={p.x} y2={p.y} stroke="var(--fig-muted)" strokeWidth={1.3} strokeDasharray="2 3" />
        ))}
        {NUC_PTS.map((p, i) => (
          <g key={i}>
            <Nucleon x={p.x} y={p.y} r={12.5} proton={p.proton} strong={p.c} />
            {p.proton && <Sign x={p.x} y={p.y} />}
          </g>
        ))}
        <circle cx={NUC.x} cy={NUC.y} r={R} fill="var(--fig-accent)" fillOpacity={0.12} stroke="var(--fig-accent)" strokeWidth={2.2} strokeDasharray="6 4" />
        {/* 目盛り */}
        <line x1={20} y1={312} x2={20 + 2 * PX_PER_UNIT} y2={312} stroke="var(--fig-line)" strokeWidth={2} />
        <T x={62} y={312} fs={11.5} tone="muted">
          1mmの1兆分の2
        </T>
        {/* 凡例と読み取り */}
        <Ball x={432} y={34} r={9} fill="var(--fig-box3)" />
        <T x={450} y={34} fs={12.5}>
          陽子（＋の電気）
        </T>
        <Ball x={432} y={60} r={9} fill="var(--fig-box)" />
        <T x={450} y={60} fs={12.5}>
          中性子（電気なし）
        </T>
        <line x1={420} y1={90} x2={446} y2={90} stroke="var(--fig-muted)" strokeWidth={1.3} strokeDasharray="2 3" />
        <T x={456} y={90} fs={12.5}>
          電気の力（陽子どうしが押し合う）
        </T>
        <T x={456} y={110} fs={12} tone="muted">
          原子核の中のすべての陽子に届く
        </T>
        <circle cx={433} cy={140} r={9} fill="var(--fig-accent)" fillOpacity={0.1} stroke="var(--fig-accent)" strokeWidth={1.6} strokeDasharray="4 3" />
        <T x={456} y={140} fs={12.5}>
          核力が届く範囲（目安）
        </T>
        <T x={420} y={186} fs={12.5} bold>
          核力を伝える粒子の質量
        </T>
        <T x={420} y={208} fs={12.5} tone="acc">
          {m === 0 ? '0（光子と同じ）' : `電子の${m}倍`}
        </T>
        <T x={420} y={240} fs={12.5} bold>
          核力が届く距離
        </T>
        <T x={420} y={262} fs={12.5} tone="acc">
          {reachText}
        </T>
        <T x={420} y={290} fs={12} tone="muted">
          {note}
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図30-2 陽子と中性子が中間子をやり取りする（動） ---------- */

const EX = { L: 170, R: 550, y: 130 }

export function FigExchange() {
  const period = 6.4
  const arc = (u: number, fromLeft: boolean) => {
    const a = fromLeft ? EX.L + 22 : EX.R - 22
    const b = fromLeft ? EX.R - 22 : EX.L + 22
    const s = clamp01(u)
    const x = (1 - s) * (1 - s) * a + 2 * (1 - s) * s * 360 + s * s * b
    const y = (1 - s) * (1 - s) * (EX.y - 20) + 2 * (1 - s) * s * 30 + s * s * (EX.y - 20)
    return { x, y }
  }
  const pathD = (() => {
    const pts: [number, number][] = []
    for (let i = 0; i <= 40; i++) {
      const p = arc(i / 40, true)
      pts.push([p.x, p.y])
    }
    return poly(pts)
  })()
  return (
    <Anim
      n="30-2"
      title="陽子と中性子は、中間子をやり取りしながら入れ替わり、引き合う"
      still={1.5}
      period={period}
      caption="湯川が1935年の論文で考えた様子の模式図です。陽子が正の電気を持つ中間子を出すと、電気を失って中性子になります。その中間子を吸い込んだ中性子は陽子になります。このやり取りをくり返すことで、2つの粒は引き合います（青の矢印）。実際には、電気を持たない中間子のやり取りもあります。"
    >
      {(t) => {
        const leftP = t < 0.6 || t >= 5.4
        const rightP = t >= 2.4 && t < 3.6
        const flyA = t >= 0.6 && t < 2.4
        const flyB = t >= 3.6 && t < 5.4
        const mp = flyA ? arc((t - 0.6) / 1.8, true) : flyB ? arc((t - 3.6) / 1.8, false) : null
        const step =
          t < 0.6
            ? '左に陽子、右に中性子がある'
            : t < 2.4
              ? '陽子が正の電気の中間子を出して、中性子に変わる'
              : t < 3.6
                ? '中性子が中間子を吸い込んで、陽子に変わる'
                : t < 5.4
                  ? '今度は右の陽子が中間子を出し、左の中性子が吸い込む'
                  : 'このやり取りをくり返して、2つの粒は引き合う'
        return (
          <Svg id="30-2" w={720} h={250} label="左の陽子が正の電気を持つ中間子を出して中性子に変わり、右の中性子がその中間子を吸い込んで陽子に変わる。次は逆向きに同じことが起こる。このやり取りで2つは引き合う。">
            <Trail d={pathD} />
            <T x={360} y={18} anchor="middle" fs={12.5}>
              やり取りされる中間子（正の電気を持つ）
            </T>
            <Nucleon x={EX.L} y={EX.y} r={26} proton={leftP} />
            <Nucleon x={EX.R} y={EX.y} r={26} proton={rightP} />
            <T x={EX.L} y={EX.y + 44} anchor="middle" fs={12} tone="muted">
              {leftP ? '正の電気を持つ' : '電気を持たない'}
            </T>
            <T x={EX.R} y={EX.y + 44} anchor="middle" fs={12} tone="muted">
              {rightP ? '正の電気を持つ' : '電気を持たない'}
            </T>
            <Force x1={EX.L + 30} y1={EX.y + 6} x2={EX.L + 92} y2={EX.y + 6} />
            <Force x1={EX.R - 30} y1={EX.y + 6} x2={EX.R - 92} y2={EX.y + 6} />
            <T x={360} y={EX.y + 6} anchor="middle" fs={12.5} tone="acc">
              引き合う（核力）
            </T>
            {mp && <Ball x={mp.x} y={mp.y} r={8} fill={MESON} />}
            <T x={360} y={222} anchor="middle" fs={13}>
              {step}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図30-4 取り違えと区別の年表 ---------- */

const MIX_X = [16, 152, 288, 424, 560]
const MIX_W = 128

function MixBox({ slot, top, lines, accent }: { slot: number; top: boolean; lines: string[]; accent?: boolean }) {
  return <Box x={MIX_X[slot]} y={top ? 34 : 206} w={MIX_W} h={80} lines={lines} fs={12} bold fill={top ? 'box2' : 'box3'} accent={accent} />
}

export function FigMixup() {
  return (
    <Figure
      n="30-4"
      title="宇宙線の中の粒子は、はじめ湯川の中間子と取り違えられた"
      caption="上の段は湯川が予言した粒子（のちのパイ中間子）、下の段は宇宙線の中に見つかった粒子（のちのミューオン）についての出来事です。左から右へ時代が進みます。箱の間隔は年数に比例していません。赤の点線と×は、のちに誤りと分かった考えです。"
    >
      <Svg id="30-4" w={720} h={330} label="1934年から1935年に湯川が中間子を予言した。1937年に宇宙線の中に質量が電子の約200倍の粒子が見つかり、湯川の粒子と同じと考えられたが、これは誤りだった。1941年から1942年に寿命や原子核との反応が予言と合わないことが分かり、二中間子論が出た。1947年、イタリアの実験で宇宙線の粒子が原子核とほとんど反応しないことが分かり、パウエルらが写真乾板でパイ中間子を見つけた。パイ中間子は崩壊して宇宙線の粒子（ミューオン）になる。1948年に加速器でパイ中間子がつくられ、1949年に湯川がノーベル賞を受けた。">
        <T x={16} y={18} fs={12.5} bold>
          湯川が予言した粒子（のちのパイ中間子）
        </T>
        <MixBox slot={0} top lines={['1934〜1935年', '湯川が予言', '質量は電子の', '約200倍']} />
        <MixBox slot={3} top accent lines={['1947年', 'パウエルらが', '写真乾板で発見']} />
        <MixBox slot={4} top lines={['1948年 加速器で', 'つくられる', '1949年 湯川に', 'ノーベル賞']} />
        <MixBox slot={1} top={false} lines={['1937年', '宇宙線の中に', '質量が電子の', '約200倍の粒子']} />
        <MixBox slot={2} top={false} lines={['1941〜1942年', '寿命や反応が', '予言と合わない', '二中間子論が出る']} />
        <MixBox slot={3} top={false} lines={['1947年', 'イタリアの実験：', '原子核とほとんど', '反応しない']} />
        <Arrow x1={MIX_X[1] + 50} y1={204} x2={MIX_X[0] + 80} y2={116} dashed danger />
        <Cross x={MIX_X[1] + 13} y={160} s={7} />
        <T x={MIX_X[1] + 36} y={150} fs={12.5} tone="danger">
          同じ粒子と考えた（誤り）
        </T>
        <Arrow x1={MIX_X[3] + 40} y1={116} x2={MIX_X[3] + 40} y2={204} />
        <T x={MIX_X[3] + 52} y={150} fs={12.5}>
          崩壊すると下の段の粒子になる
        </T>
        <T x={16} y={308} fs={12.5} bold>
          宇宙線の中に見つかった粒子（のちのミューオン）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図30-3 写真乾板に残ったパイ中間子とミューオンの跡（動） ---------- */

interface Seg {
  pts: [number, number][]
  t0: number
  t1: number
  dense: boolean
  faint?: boolean
}

/** 折れ線に沿って粒を並べる。dense なら終わりに向かって間隔が詰まる（遅くなるほど粒が詰まる） */
function grains(seg: Seg, seed: number) {
  const r = rng(seed)
  const lens = seg.pts.slice(1).map((p, i) => Math.hypot(p[0] - seg.pts[i][0], p[1] - seg.pts[i][1]))
  const total = lens.reduce((a, b) => a + b, 0)
  const at = (s: number): [number, number] => {
    let d = s
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i] || i === lens.length - 1) {
        const u = Math.min(1, d / lens[i])
        const [x0, y0] = seg.pts[i]
        const [x1, y1] = seg.pts[i + 1]
        return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]
      }
      d -= lens[i]
    }
    return seg.pts[seg.pts.length - 1]
  }
  const out: { x: number; y: number; f: number }[] = []
  let s = 0
  while (s <= total) {
    const f = s / total
    const [x, y] = at(s)
    out.push({ x: x + (r() - 0.5) * 2.2, y: y + (r() - 0.5) * 2.2, f })
    s += seg.faint ? 11 : seg.dense ? 9 - 6 * f : 6
  }
  return out
}

const EMU_A: Seg[] = [
  { pts: [[34, 40], [90, 70], [150, 108], [222, 150]], t0: 0, t1: 2.4, dense: true },
  { pts: [[222, 150], [282, 108], [345, 64]], t0: 2.4, t1: 3.9, dense: true },
  { pts: [[345, 64], [362, 115], [381, 168]], t0: 3.9, t1: 4.8, dense: false, faint: true },
]
const EMU_B: Seg[] = [
  { pts: [[690, 236], [640, 214], [580, 194], [520, 172]], t0: 0.8, t1: 3.2, dense: true },
  { pts: [[520, 172], [494, 100], [470, 29]], t0: 3.2, t1: 4.7, dense: true },
  { pts: [[470, 29], [520, 52], [570, 76]], t0: 4.7, t1: 5.6, dense: false, faint: true },
]
const EMU_GRAINS = [...EMU_A, ...EMU_B].map((s, i) => ({ s, g: grains(s, 30 + i * 7) }))

export function FigEmulsion() {
  return (
    <Anim
      n="30-3"
      title="止まったパイ中間子からミューオンが飛び出し、いつもほぼ同じ長さの跡を残す"
      still={7}
      period={8.5}
      caption="写真乾板を顕微鏡で見た様子の模式図です。電気を帯びた粒子が通った所に、現像すると黒い粒が並びます。粒子が遅くなるほど粒の間隔が詰まります。止まったパイ中間子からミューオンが出て、ミューオンも止まると電子が出ます。ミューオンの跡の長さは、左の例と右の例でほぼ同じです。"
    >
      {(t) => (
        <Svg id="30-3" w={720} h={300} label="写真乾板の中の2つの例。どちらも、左上や右下から来たパイ中間子が止まり、そこからミューオンが別の向きに飛び出して、ほぼ同じ長さ進んで止まる。ミューオンが止まった所から、粒の間隔が広い電子の跡が出る。">
          <rect x={10} y={10} width={700} height={252} rx={6} fill="var(--fig-box)" stroke="var(--fig-line)" />
          {EMU_GRAINS.map(({ s, g }, i) => {
            const p = clamp01((t - s.t0) / (s.t1 - s.t0))
            return (
              <g key={i}>
                {g
                  .filter((q) => t >= s.t0 && q.f <= p)
                  .map((q, j) => (
                    <circle key={j} cx={q.x} cy={q.y} r={s.faint ? 1.3 : 1.9} fill="var(--fig-line)" opacity={s.faint ? 0.7 : 1} />
                  ))}
              </g>
            )
          })}
          {t > 2.4 && <circle cx={222} cy={150} r={7} fill="none" stroke="var(--fig-accent)" strokeWidth={1.6} />}
          {t > 3.2 && <circle cx={520} cy={172} r={7} fill="none" stroke="var(--fig-accent)" strokeWidth={1.6} />}
          <T x={70} y={28} fs={12.5}>
            パイ中間子
          </T>
          {t > 2.4 && (
            <T x={110} y={176} fs={12} tone="acc">
              止まって崩壊
            </T>
          )}
          {t > 3 && (
            <T x={296} y={124} fs={12.5}>
              ミューオン
            </T>
          )}
          {t > 4.3 && (
            <T x={392} y={176} fs={12.5}>
              電子
            </T>
          )}
          <T x={600} y={248} fs={12.5}>
            パイ中間子
          </T>
          {t > 3.2 && (
            <T x={446} y={198} fs={12} tone="acc">
              止まって崩壊
            </T>
          )}
          {t > 3.8 && (
            <T x={418} y={100} fs={12.5}>
              ミューオン
            </T>
          )}
          {t > 5.2 && (
            <T x={584} y={84} fs={12.5}>
              電子
            </T>
          )}
          <T x={360} y={284} anchor="middle" fs={12.5} tone="muted">
            ミューオンの跡の長さは、どちらの例でもほぼ同じ
          </T>
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図30-5 加速器で粒子を回して速くし、ぶつける（動） ---------- */

const ACC = { cx: 210, cy: 170, r: 115, Tc: 7, gmax: 20, laps: 5 }
// 時刻ごとの回った角度（エネルギーを一定の割合で増やしたときの速さを足し合わせる）
const ACC_TABLE = (() => {
  const dt = 0.01
  const raw: number[] = [0]
  for (let i = 1; i <= ACC.Tc / dt; i++) {
    const g = 1 + (ACC.gmax - 1) * ((i * dt) / ACC.Tc)
    raw.push(raw[i - 1] + Math.sqrt(1 - 1 / (g * g)) * dt)
  }
  const k = ((2 * ACC.laps + 1) * Math.PI) / raw[raw.length - 1]
  return raw.map((v) => v * k)
})()
const accAngle = (t: number) => ACC_TABLE[Math.min(ACC_TABLE.length - 1, Math.round(Math.max(0, t) / 0.01))]
const ACC_BURST = (() => {
  const r = rng(305)
  return Array.from({ length: 11 }, (_, i) => ({ a: (i / 11) * 2 * Math.PI + r() * 0.4, len: 18 + r() * 16 }))
})()

export function FigAccelerator() {
  const period = ACC.Tc + 2.6
  return (
    <Anim
      n="30-5"
      title="円形の加速器は、粒子を何周も回しながら少しずつ速くし、最後にぶつける"
      still={ACC.Tc + 0.9}
      period={period}
      caption="模式図です。粒子の束は、加速する所を通るたびに電場で押されてエネルギーが増え、磁石で向きを曲げられて同じ円を回ります。速さは光の速さに近づくとほとんど増えなくなりますが、エネルギーは増え続けます。実際の加速器では、2本のビームは別々の管の中を回り、ぶつける所でだけ交わります。LHCの1周は約27kmで、陽子は1秒に1万1245周します。図の周回の数や回る速さは実際とは違います。"
    >
      {(t) => {
        const tt = Math.min(t, ACC.Tc)
        const th = accAngle(tt)
        const g = 1 + (ACC.gmax - 1) * (tt / ACC.Tc)
        const beta = Math.sqrt(1 - 1 / (g * g))
        const hit = t >= ACC.Tc
        const ax = ACC.cx + ACC.r * Math.sin(th)
        const ay = ACC.cy - ACC.r * Math.cos(th)
        const bx = ACC.cx - ACC.r * Math.sin(th)
        const lap = Math.floor(th / (2 * Math.PI)) + 1
        const burst = clamp01((t - ACC.Tc) / 0.6)
        const mag = [45, 135, 225, 315].map((d) => (d * Math.PI) / 180)
        return (
          <Svg id="30-5" w={720} h={330} label="円形の加速器の模式図。右回りと左回りの陽子の束が、上の加速する所を通るたびに速くなり、磁石で曲げられて円を回る。速さは光の速さに近づくとほとんど増えないが、エネルギーは増え続ける。最後に下の検出器の所で2つの束がぶつかり、新しい粒子が飛び出す。">
            <circle cx={ACC.cx} cy={ACC.cy} r={ACC.r} fill="none" stroke="var(--fig-line)" strokeWidth={6} strokeOpacity={0.25} />
            <circle cx={ACC.cx} cy={ACC.cy} r={ACC.r} fill="none" stroke="var(--fig-line)" strokeWidth={1.2} />
            {!hit && (
              <>
                <Ball x={ax} y={ay} r={6.5} fill={MESON} />
                <Ball x={bx} y={ay} r={6.5} fill={PURPLE} />
              </>
            )}
            <rect x={ACC.cx - 16} y={ACC.cy - ACC.r - 13} width={32} height={26} rx={3} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={ACC.cx + 26} y={ACC.cy - ACC.r - 22} fs={12}>
              加速する所（電場で押す）
            </T>
            {mag.map((a, i) => (
              <rect key={i} x={ACC.cx + ACC.r * Math.sin(a) - 9} y={ACC.cy - ACC.r * Math.cos(a) - 9} width={18} height={18} rx={2} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            ))}
            <T x={20} y={290} fs={12}>
              磁石（向きを曲げる）
            </T>
            <rect x={ACC.cx - 22} y={ACC.cy + ACC.r - 14} width={44} height={28} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={254} y={318} fs={12}>
              検出器（ぶつける所）
            </T>
            {hit &&
              ACC_BURST.map((b, i) => (
                <line
                  key={i}
                  x1={ACC.cx}
                  y1={ACC.cy + ACC.r}
                  x2={ACC.cx + Math.cos(b.a) * b.len * burst}
                  y2={ACC.cy + ACC.r + Math.sin(b.a) * b.len * burst}
                  stroke="var(--fig-accent)"
                  strokeWidth={1.8}
                />
              ))}
            {/* 右の読み取り */}
            <Ball x={412} y={30} r={6.5} fill={MESON} />
            <T x={426} y={30} fs={12.5}>
              右回りの陽子の束
            </T>
            <Ball x={412} y={54} r={6.5} fill={PURPLE} />
            <T x={426} y={54} fs={12.5}>
              左回りの陽子の束
            </T>
            <T x={404} y={90} fs={13} bold>
              {hit ? '2つの束をぶつけた' : `${lap}周目`}
            </T>
            <T x={404} y={122} fs={12.5}>
              速さ（右端が光の速さ）
            </T>
            <rect x={404} y={134} width={280} height={14} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <rect x={404} y={134} width={280 * beta} height={14} fill="var(--fig-accent)" opacity={0.75} />
            <T x={404} y={164} fs={12.5} tone="acc">
              {`光の速さの${(beta * 100).toFixed(1)}%`}
            </T>
            <T x={404} y={198} fs={12.5}>
              エネルギー
            </T>
            <rect x={404} y={210} width={280} height={14} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <rect x={404} y={210} width={280 * (g / ACC.gmax)} height={14} fill={MESON} opacity={0.8} />
            <T x={404} y={240} fs={12.5} tone="acc">
              {`止まっているときの約${Math.round(g)}倍`}
            </T>
            <T x={404} y={276} fs={12} tone="muted">
              {hit ? 'ぶつかった所から新しい粒子が飛び出す' : '速さはすぐに頭打ちになるが'}
            </T>
            <T x={404} y={296} fs={12} tone="muted">
              {hit ? '（青の線）' : 'エネルギーは増え続ける'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図30-6 八道説の粒子の組とオメガ・マイナス ---------- */

const EW = { cx: 300, dx: 70, rows: [62, 126, 190, 254] }
const OCTET: { row: number; col: number; label: string }[] = [
  { row: 0, col: -0.5, label: 'n⁰' },
  { row: 0, col: 0.5, label: 'p⁺' },
  { row: 1, col: -1.5, label: 'Σ⁻' },
  { row: 1, col: -0.5, label: 'Λ⁰' },
  { row: 1, col: 0.5, label: 'Σ⁰' },
  { row: 1, col: 1.5, label: 'Σ⁺' },
  { row: 2, col: -0.5, label: 'Ξ⁻' },
  { row: 2, col: 0.5, label: 'Ξ⁰' },
]
const DECUPLET: { row: number; col: number; label: string }[] = [
  { row: 0, col: -1.5, label: 'Δ⁻' },
  { row: 0, col: -0.5, label: 'Δ⁰' },
  { row: 0, col: 0.5, label: 'Δ⁺' },
  { row: 0, col: 1.5, label: 'Δ⁺⁺' },
  { row: 1, col: -1, label: 'Σ*⁻' },
  { row: 1, col: 0, label: 'Σ*⁰' },
  { row: 1, col: 1, label: 'Σ*⁺' },
  { row: 2, col: -0.5, label: 'Ξ*⁻' },
  { row: 2, col: 0.5, label: 'Ξ*⁰' },
]

export function FigEightfold() {
  const [mode, setMode] = useState<'8' | '1962' | '1964'>('1962')
  const ten = mode !== '8'
  const list = ten ? DECUPLET : OCTET
  const rows = ten ? 4 : 3
  const right = ten
    ? ['陽子の約1.31倍', '陽子の約1.48倍', '陽子の約1.63倍', mode === '1962' ? '？（約1.8倍と予想）' : '約1.78倍（1964年に発見）']
    : ['中性子と陽子', 'ラムダ粒子とシグマ粒子', 'グザイ粒子']
  return (
    <Figure
      n="30-6"
      title="ハドロンを8個や10個の組に並べると、10個の組には1つ空いた場所があった"
      controls={
        <Choice
          label="表示する組"
          options={[
            { value: '8', label: '8個の組' },
            { value: '1962', label: '10個の組（1962年）' },
            { value: '1964', label: '10個の組（1964年）' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="記号の右上の＋、−、0は電気の正、負、なしを表します。ストレンジネスは、強い作用では変わらない量で、1953年にゲルマンらが考えました。同じ段の粒子はストレンジネスが同じで、質量もほぼ同じです。10個の組では、段が1つ下がるごとに質量がほぼ同じ間隔で増えます。「10個の組（1962年）」では、いちばん下の場所が空いていました。「10個の組（1964年）」に切り替えると、見つかったオメガ・マイナス（Ω⁻）が入ります。質量は現在の測定値です。"
    >
      <Svg id="30-6" w={720} h={300} label="八道説の粒子の組。8個の組には中性子と陽子、ラムダ粒子、3つのシグマ粒子、2つのグザイ粒子が入る。10個の組は4段で、上から4つのデルタ粒子、3つのシグマ粒子、2つのグザイ粒子が並び、質量は陽子の約1.31倍、1.48倍、1.63倍とほぼ同じ間隔で増える。1962年にはいちばん下の場所が空いていて、質量が陽子の約1.8倍の粒子が予想され、1964年にオメガ・マイナスが見つかった。">
        {Array.from({ length: rows }, (_, i) => (
          <T key={i} x={16} y={EW.rows[i]} fs={12.5} tone="muted">
            {`ストレンジネス ${i === 0 ? '0' : `−${i}`}`}
          </T>
        ))}
        {list.map((p) => (
          <Dot key={p.label} x={EW.cx + p.col * EW.dx} y={EW.rows[p.row]} r={21} label={p.label} fill={p.label.startsWith('p') || p.label.startsWith('n') ? 'var(--fig-box3)' : 'var(--fig-box)'} />
        ))}
        {ten && <Dot x={EW.cx} y={EW.rows[3]} r={21} label={mode === '1962' ? '？' : 'Ω⁻'} dashed={mode === '1962'} accent fill={mode === '1962' ? 'var(--fig-bg)' : 'var(--fig-box2)'} />}
        <T x={470} y={22} fs={12.5} bold>
          {ten ? '質量（陽子と比べて）' : 'この段の粒子'}
        </T>
        {ten && <Arrow x1={458} y1={50} x2={458} y2={266} />}
        {right.map((s, i) => (
          <T key={i} x={470} y={EW.rows[i]} fs={12.5} tone={ten && i === 3 ? 'acc' : undefined}>
            {s}
          </T>
        ))}
        <T x={16} y={290} fs={12} tone="muted">
          {ten ? '段が下がるごとに、質量はほぼ同じ間隔で増える' : '陽子と中性子は、この8個の組に入る'}
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図30-7 坂田模型とクォーク模型 ---------- */

function BuildRow({ y, name, parts }: { y: number; name: string; parts: { label: string; anti?: boolean }[] }) {
  return (
    <g>
      <T x={14} y={y} fs={12.5}>
        {name}
      </T>
      {parts.map((p, i) => (
        <Dot key={i} x={176 + i * 46} y={y} r={17} label={p.label} fs={p.label.length > 1 ? 11.5 : 13} dashed={p.anti} fill={p.anti ? 'var(--fig-bg)' : 'var(--fig-box3)'} />
      ))}
    </g>
  )
}

function BuildPanel({ id, quark }: { id: string; quark: boolean }) {
  const base = quark
    ? [
        { s: 'u', n: 'アップ', c: '＋3分の2' },
        { s: 'd', n: 'ダウン', c: '−3分の1' },
        { s: 's', n: 'ストレンジ', c: '−3分の1' },
      ]
    : [
        { s: 'p', n: '陽子', c: '＋1' },
        { s: 'n', n: '中性子', c: '0' },
        { s: 'Λ', n: 'ラムダ粒子', c: '0' },
      ]
  const rows = quark
    ? [
        { name: '陽子', parts: [{ label: 'u' }, { label: 'u' }, { label: 'd' }] },
        { name: '中性子', parts: [{ label: 'u' }, { label: 'd' }, { label: 'd' }] },
        { name: '正のパイ中間子', parts: [{ label: 'u' }, { label: '反d', anti: true }] },
      ]
    : [
        { name: '陽子', parts: [{ label: 'p' }] },
        { name: '中性子', parts: [{ label: 'n' }] },
        { name: '正のパイ中間子', parts: [{ label: 'p' }, { label: '反n', anti: true }] },
      ]
  return (
    <Svg id={id} w={340} h={290} label={quark ? 'クォーク模型。基本の粒子はアップ、ダウン、ストレンジの3種類のクォーク。陽子はアップ2個とダウン1個、中性子はアップ1個とダウン2個、正のパイ中間子はアップ1個とダウンの反粒子1個でできている。' : '坂田模型。基本の粒子は陽子、中性子、ラムダ粒子の3つ。陽子と中性子はそれ自身が基本の粒子で、正のパイ中間子は陽子1個と中性子の反粒子1個でできている。'}>
      <T x={14} y={18} fs={12} tone="muted">
        基本の粒子（3種類）と電気
      </T>
      {base.map((b, i) => (
        <g key={b.s}>
          <Dot x={70 + i * 100} y={54} r={19} label={b.s} fill="var(--fig-box3)" />
          <T x={70 + i * 100} y={88} anchor="middle" fs={12}>
            {b.n}
          </T>
          <T x={70 + i * 100} y={106} anchor="middle" fs={12} tone="acc">
            {b.c}
          </T>
        </g>
      ))}
      <T x={14} y={140} fs={12} tone="muted">
        組み立て方の例
      </T>
      {rows.map((r, i) => (
        <BuildRow key={r.name} y={176 + i * 44} name={r.name} parts={r.parts} />
      ))}
    </Svg>
  )
}

export function FigBuild() {
  return (
    <Figure
      n="30-7"
      title="坂田模型は陽子・中性子・ラムダ粒子を、クォーク模型は3種類のクォークを基本の粒子とした"
      caption="点線の丸は反粒子です。電気は陽子の電気を1とした大きさで書いています。坂田模型では陽子と中性子はそれ自身が基本の粒子ですが、クォーク模型では陽子と中性子もクォーク3個からできています。クォークの電気は、陽子の電気を3つに分けた大きさになります。"
    >
      <Compare
        panels={[
          { label: '坂田模型（1956年）', children: <BuildPanel id="30-7a" quark={false} />, note: 'ほかのハドロンは、3つの基本の粒子とその反粒子を組み合わせてつくる。' },
          { label: 'クォーク模型（1964年）', children: <BuildPanel id="30-7b" quark />, note: 'クォーク3個でできた粒子と、クォークと反クォーク1個ずつでできた粒子（中間子）がある。' },
        ]}
      />
    </Figure>
  )
}

/* ---------- 図30-8 電子を陽子に当てて中を調べる（動・切り替え） ---------- */

const SL = { px: 330, py: 150, R: 86, speed: 260, x0: 24 }
const SL_YS = [96, 112, 126, 146, 166, 176, 196, 212]
const SL_GRAINS = [
  { x: 300, y: 126, out: (-130 * Math.PI) / 180, len: 116 },
  { x: 356, y: 176, out: (70 * Math.PI) / 180, len: 108 },
  { x: 282, y: 156, out: 0, len: 0 },
]

/** 電子の道筋（折れ線） */
function slPath(y: number, grain: boolean): [number, number][] {
  const g = grain ? SL_GRAINS.find((q) => q.len > 0 && Math.abs(q.y - y) < 5) : undefined
  if (g) return [[SL.x0, y], [g.x, y], [g.x + Math.cos(g.out) * g.len, y + Math.sin(g.out) * g.len]]
  const dy = y - SL.py
  const inside = Math.abs(dy) < SL.R
  const ang = inside ? (dy / SL.R) * 0.06 : 0
  return [[SL.x0, y], [SL.px, y], [640, y + Math.tan(ang) * (640 - SL.px)]]
}

function along(pts: [number, number][], s: number): { done: [number, number][]; at: [number, number] } {
  const done: [number, number][] = [pts[0]]
  let d = s
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const L = Math.hypot(x1 - x0, y1 - y0)
    if (d <= L) {
      const p: [number, number] = [x0 + ((x1 - x0) * d) / L, y0 + ((y1 - y0) * d) / L]
      done.push(p)
      return { done, at: p }
    }
    d -= L
    done.push(pts[i])
  }
  return { done, at: pts[pts.length - 1] }
}

export function FigSlac() {
  const [inner, setInner] = useState<'grain' | 'soft'>('grain')
  const grain = inner === 'grain'
  return (
    <Anim
      n="30-8"
      title="陽子に電子を当てると、大きな角度に跳ね返る電子が予想より多かった"
      still={7.2}
      period={8}
      controls={
        <Choice
          label="陽子の中身"
          options={[
            { value: 'grain', label: '小さな硬い粒がある（実験の結果）' },
            { value: 'soft', label: '中身が一様（当時の予想）' },
          ]}
          value={inner}
          onChange={setInner}
        />
      }
      caption="模式図です。実際の実験では、電子はまっすぐな加速器で光の速さ近くまで速くされ、液体の水素（陽子）に当てられました。「中身が一様（当時の予想）」に切り替えると、どの電子も少ししか曲がりません。陽子の中に小さな硬い粒があると、粒の近くを通った電子が大きく跳ね返ります。跳ね返る電子の割合は、実際より多く描いています。"
    >
      {(t) => (
        <Svg id="30-8" w={720} h={300} label="左から飛んできた電子が陽子を通り抜ける。陽子の中に小さな硬い粒があると、その近くを通った電子が大きな角度で跳ね返る。中身が一様な球なら、どの電子も少ししか曲がらない。">
          <circle cx={SL.px} cy={SL.py} r={SL.R} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
          {grain && SL_GRAINS.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={7} fill="var(--fig-accent)" opacity={0.85} />)}
          <T x={SL.px} y={256} anchor="middle" fs={12.5}>
            陽子
          </T>
          {SL_YS.map((y, i) => {
            const pts = slPath(y, grain)
            const s = (t - i * 0.42) * SL.speed
            if (s <= 0) return null
            const { done, at } = along(pts, s)
            return (
              <g key={i}>
                <Trail points={done} />
                <Ball x={at[0]} y={at[1]} r={4} fill="var(--fig-line)" />
              </g>
            )
          })}
          <T x={20} y={22} fs={12.5}>
            電子（左から当てる）
          </T>
          <T x={470} y={24} fs={12.5} bold>
            {grain ? '大きく跳ね返る電子がある' : 'どの電子も少ししか曲がらない'}
          </T>
          <T x={470} y={46} fs={12} tone="muted">
            {grain ? '→ 陽子の中に小さな硬い粒がある' : '→ 中身が一様な球ならこうなる'}
          </T>
          {grain && (
            <>
              <circle cx={478} cy={276} r={6} fill="var(--fig-accent)" opacity={0.85} />
              <T x={492} y={276} fs={12}>
                陽子の中の小さな硬い粒（クォーク）
              </T>
            </>
          )}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図30-9 クォークを引き離しても力が弱まらない（動） ---------- */

const CF = { mid: 255, top: 80, bot: 222, Tpull: 4, Tbreak: 4.3 }
const G0 = { x: 510, y: 290, w: 190, h: 190 }

export function FigConfine() {
  return (
    <Anim
      n="30-9"
      title="クォークと反クォークは、引き離しても引き戻す力が弱まらない"
      still={5.8}
      period={8}
      caption="模式図です。上の段の正と負の電気は、離れるほど力線が広がり、引き合う力（青の矢印）は弱くなります。下の段のクォークと反クォークの間では、グルーオンの場がひも状にまとまり、離しても引き戻す力はほぼ変わりません。引き離すのに使ったエネルギーがたまると、そこから新しいクォークと反クォークの組が生まれ、2つの中間子に分かれます。クォークを1個だけ取り出すことはできません。"
    >
      {(t) => {
        const d = 50 + 250 * ease(Math.min(t, CF.Tpull) / CF.Tpull)
        const lx = CF.mid - d / 2
        const rx = CF.mid + d / 2
        const broken = t >= CF.Tbreak
        const drift = ease((t - CF.Tbreak) / 1.4)
        const nAnti = CF.mid - 12 - (CF.mid - 12 - (lx + 52)) * drift
        const nQuark = CF.mid + 12 + (rx - 52 - CF.mid - 12) * drift
        const fe = Math.min(36, 36 * (50 / d) ** 2)
        const bulge = Math.min(34, 8 + d * 0.1)
        const tube = (x1: number, x2: number) => (
          <g>
            <rect x={x1} y={CF.bot - 9} width={Math.max(0, x2 - x1)} height={18} fill="var(--fig-accent)" opacity={0.14} />
            {[-5, 0, 5].map((o) => (
              <line key={o} x1={x1} y1={CF.bot + o} x2={x2} y2={CF.bot + o} stroke="var(--fig-accent)" strokeWidth={1.2} />
            ))}
          </g>
        )
        const gx = (dd: number) => G0.x + ((dd - 50) / 250) * G0.w
        const ge = (dd: number) => G0.y - G0.h * 0.95 * (50 / dd) ** 2
        const gs = (dd: number) => G0.y - G0.h * (0.42 + 0.3 * (50 / dd) ** 3)
        const curve = (f: (dd: number) => number) =>
          poly(Array.from({ length: 41 }, (_, i) => 50 + (250 * i) / 40).map((dd) => [gx(dd), f(dd)] as [number, number]))
        return (
          <Svg id="30-9" w={720} h={330} label="上の段：正と負の電気を引き離すと力線が広がり、引き合う力は弱くなる。下の段：クォークと反クォークを引き離すと、間のグルーオンの場がひも状にのび、引き戻す力はほぼ一定のまま。ひもが切れると新しいクォークと反クォークの組が生まれ、2つの中間子になる。右のグラフは、引き離した距離と引き戻す力の関係で、電気の力は下がり、クォークの間の力はほぼ一定になる。">
            <T x={20} y={22} fs={12.5} bold>
              電気の力（正と負の電気）
            </T>
            {[-1, 1].map((s) => (
              <path key={s} d={`M${lx},${CF.top} Q${CF.mid},${CF.top + s * bulge * 2} ${rx},${CF.top}`} fill="none" stroke="var(--fig-muted)" strokeWidth={1.2} />
            ))}
            <line x1={lx} y1={CF.top} x2={rx} y2={CF.top} stroke="var(--fig-muted)" strokeWidth={1.2} />
            <Ball x={lx} y={CF.top} r={13} fill="var(--fig-box3)" />
            <Sign x={lx} y={CF.top} s={5.5} />
            <Ball x={rx} y={CF.top} r={13} fill="var(--fig-box)" />
            <Sign x={rx} y={CF.top} s={5.5} minus />
            {fe > 5 && (
              <>
                <Force x1={lx + 15} y1={CF.top + 22} x2={lx + 15 + fe} y2={CF.top + 22} />
                <Force x1={rx - 15} y1={CF.top + 22} x2={rx - 15 - fe} y2={CF.top + 22} />
              </>
            )}
            <T x={20} y={132} fs={12} tone="muted">
              離れるほど、引き合う力は弱くなる
            </T>
            <T x={20} y={166} fs={12.5} bold>
              クォークと反クォークの間の強い力
            </T>
            {!broken ? (
              tube(lx + 14, rx - 14)
            ) : (
              <>
                {tube(lx + 14, nAnti - 14)}
                {tube(nQuark + 14, rx - 14)}
              </>
            )}
            <Ball x={lx} y={CF.bot} r={14} fill={RED} />
            <T x={lx} y={CF.bot} anchor="middle" fs={12}>
              赤
            </T>
            <Ball x={rx} y={CF.bot} r={14} fill="var(--fig-bg)" stroke={RED} />
            <T x={rx} y={CF.bot} anchor="middle" fs={11}>
              反赤
            </T>
            {broken && (
              <>
                <Ball x={nAnti} y={CF.bot} r={14} fill="var(--fig-bg)" stroke={RED} />
                <T x={nAnti} y={CF.bot} anchor="middle" fs={11}>
                  反赤
                </T>
                <Ball x={nQuark} y={CF.bot} r={14} fill={RED} />
                <T x={nQuark} y={CF.bot} anchor="middle" fs={12}>
                  赤
                </T>
              </>
            )}
            {!broken && (
              <>
                <Force x1={lx + 4} y1={CF.bot + 26} x2={lx + 40} y2={CF.bot + 26} />
                <Force x1={rx - 4} y1={CF.bot + 26} x2={rx - 40} y2={CF.bot + 26} />
              </>
            )}
            <T x={20} y={276} fs={12} tone="muted">
              {broken ? '新しいクォークと反クォークの組が生まれ、中間子が2つになる' : '離しても、引き戻す力はほぼ変わらない'}
            </T>
            <T x={20} y={298} fs={12} tone="muted">
              {broken ? '（クォークは1個だけでは取り出せない）' : '引き離すほど、間にエネルギーがたまる'}
            </T>
            {/* グラフ */}
            <line x1={G0.x} y1={G0.y} x2={G0.x + G0.w + 8} y2={G0.y} stroke="var(--fig-line)" />
            <line x1={G0.x} y1={G0.y} x2={G0.x} y2={G0.y - G0.h - 8} stroke="var(--fig-line)" />
            <T x={G0.x} y={G0.y - G0.h - 22} fs={12}>
              引き戻す力
            </T>
            <T x={G0.x + G0.w + 8} y={G0.y + 18} anchor="end" fs={12}>
              引き離した距離
            </T>
            <path d={curve(ge)} fill="none" stroke="var(--fig-muted)" strokeWidth={2} />
            <path d={curve(gs)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.4} />
            <T x={G0.x + 64} y={gs(300) - 16} fs={12} tone="acc">
              強い力（ほぼ一定）
            </T>
            <T x={G0.x + 112} y={G0.y - 22} fs={12} tone="muted">
              電気の力
            </T>
            {!broken && (
              <>
                <circle cx={gx(d)} cy={ge(d)} r={4.5} fill="var(--fig-muted)" />
                <circle cx={gx(d)} cy={gs(d)} r={4.5} fill="var(--fig-accent)" />
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図30-10 電子と陽電子の衝突でできる2本と3本のジェット ---------- */

function Jet({ cx, cy, deg, seed, label, lx, ly, anchor = 'start', gluon }: { cx: number; cy: number; deg: number; seed: number; label: string; lx: number; ly: number; anchor?: 'start' | 'end'; gluon?: boolean }) {
  const r = rng(seed)
  const a = (deg * Math.PI) / 180
  const fan = Array.from({ length: 7 }, () => ({ a: a + (r() - 0.5) * 0.32, len: 70 + r() * 28 }))
  const col = gluon ? 'var(--fig-accent)' : 'var(--fig-line)'
  return (
    <g>
      {fan.map((f, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(f.a) * f.len} y2={cy + Math.sin(f.a) * f.len} stroke={col} strokeWidth={1} />
      ))}
      <line x1={cx} y1={cy} x2={cx + Math.cos(a) * 40} y2={cy + Math.sin(a) * 40} stroke={col} strokeWidth={3.2} />
      <T x={lx} y={ly} fs={12.5} anchor={anchor} tone={gluon ? 'acc' : undefined}>
        {label}
      </T>
    </g>
  )
}

function Beams({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <Arrow x1={cx - 140} y1={cy} x2={cx - 12} y2={cy} />
      <Arrow x1={cx + 140} y1={cy} x2={cx + 12} y2={cy} />
      <T x={cx - 140} y={cy - 16} fs={12}>
        電子
      </T>
      <T x={cx + 140} y={cy - 16} anchor="end" fs={12}>
        陽電子
      </T>
      <circle cx={cx} cy={cy} r={4} fill="var(--fig-line)" />
    </g>
  )
}

export function FigJets() {
  return (
    <Figure
      n="30-10"
      title="クォークがグルーオンを出すと、粒子の束（ジェット）が3本になる"
      caption="模式図です。電子と陽電子がぶつかると、クォークと反クォークの組が反対向きに飛び出し、それぞれが多くのハドロンの束（ジェット）になります（左）。クォークがグルーオンを出すと、グルーオンも束になり、3本目のジェットができます（右）。1979年、DESYの加速器PETRAで3本のジェットが見つかりました。"
    >
      <Svg id="30-10" w={720} h={280} label="左：電子と陽電子がぶつかり、クォークと反クォークが反対向きに飛び出して2本の粒子の束になる。右：クォークがグルーオンを出し、粒子の束が3本になる。">
        <T x={180} y={18} anchor="middle" fs={12.5} bold>
          2本のジェット
        </T>
        <Beams cx={180} cy={145} />
        <Jet cx={180} cy={145} deg={-60} seed={11} label="クォーク" lx={240} ly={46} />
        <Jet cx={180} cy={145} deg={120} seed={12} label="反クォーク" lx={116} ly={252} anchor="end" />
        <line x1={360} y1={30} x2={360} y2={265} stroke="var(--fig-muted)" strokeDasharray="3 4" />
        <T x={540} y={18} anchor="middle" fs={12.5} bold>
          3本のジェット（グルーオンを出したとき）
        </T>
        <Beams cx={540} cy={145} />
        <Jet cx={540} cy={145} deg={-78} seed={21} label="クォーク" lx={570} ly={42} />
        <Jet cx={540} cy={145} deg={158} seed={22} label="反クォーク" lx={440} ly={196} anchor="end" />
        <Jet cx={540} cy={145} deg={42} seed={23} label="グルーオン" lx={622} ly={226} gluon />
      </Svg>
    </Figure>
  )
}
