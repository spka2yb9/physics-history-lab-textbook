import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { Ball, Cross, Trail, Vel } from './common'

/*
 * 第36章の図。光（レーザーの光、電波のパルス）は第16章・第20章と同じく黄色で描き、必ず文字を添える。
 * ブラックホールは黒い円、熱はだいだい色の波線で描く。伸び縮みや軌道の大きさは、どの図でも大きく誇張している。
 */

type Pt = [number, number]

/** 光のかたまりの色 */
const GLOW = '#f2c94c'
/** 光の道筋の線の色 */
const BEAM = '#d99a00'
/** 熱の印の色 */
const HEAT = '#e8862a'
/** ブラックホールの塗り（ライト・ダークとも同じ） */
const HOLE = '#1d1f23'

const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/** ブラックホール（黒い円） */
function Hole({ x, y, r }: { x: number; y: number; r: number }) {
  return <circle cx={x} cy={y} r={r} fill={HOLE} stroke="var(--fig-line)" strokeWidth={1.5} />
}

/* ---------- 合体までの重力波の形（図36-7と図36-8で使う） ---------- */

/**
 * 回り合う2つの天体が近づいて合体するまでの模式的な計算。u は 0〜1（1で合体）。
 * 間隔は合体の時刻までの残り時間の4分の1乗に比例して縮み、回る速さは間隔が縮むほど速くなる（一般相対性理論の近似の形）。
 */
const MERGE_SEP = 0.27 // 合体するときの間隔（初めの間隔を1とする）
const U_MERGE = 1 - MERGE_SEP ** 4 // 合体の時刻（全体の長さを1とした割合）
/** 初めの間隔のときの、全体の時間あたりの回転の角度（ラジアン） */
const OMEGA0 = 2 * Math.PI * 3.6

function inspiral(u: number) {
  const left = Math.max(1 - Math.min(u, U_MERGE), 0)
  const sep = left ** 0.25
  const phase = OMEGA0 * (8 / 5) * (1 - left ** (5 / 8))
  return { sep, phase }
}

/** 重力波の揺れ（-1〜1 程度）。u は 0〜1 が合体まで、その後は ring（合体からの経過）で収まる */
function strain(u: number) {
  if (u <= U_MERGE) {
    const { sep, phase } = inspiral(u)
    return (MERGE_SEP / sep) * Math.cos(2 * phase)
  }
  const m = inspiral(U_MERGE)
  const omegaM = OMEGA0 * MERGE_SEP ** -1.5
  const d = u - U_MERGE
  return Math.exp(-d / 0.012) * Math.cos(2 * m.phase + 2 * omegaM * d)
}

/** 重力波の形の path。u の範囲 [u0, u1] を x0〜x1 に、揺れを y0 ± amp に描く */
function strainPath(u0: number, u1: number, x0: number, x1: number, y0: number, amp: number, steps = 900) {
  const pts: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const u = u0 + ((u1 - u0) * i) / steps
    pts.push([x0 + ((x1 - x0) * i) / steps, y0 - amp * strain(u)])
  }
  return poly(pts)
}

/* ---------- 図36-1 重力波が通ると空間が縦と横に伸び縮みする（動） ---------- */

export function FigStretch() {
  const P = 2.4
  const A = 0.22
  const cx = 175
  const cy = 150
  const R = 78
  const G = 90
  const gx0 = 410
  const gx1 = 650
  const gy = 120
  const ga = 40
  const X = (u: number) => gx0 + (u / P) * (gx1 - gx0)
  const curve = (sign: number) => {
    const pts: Pt[] = []
    for (let i = 0; i <= 60; i++) {
      const u = (P * i) / 60
      pts.push([X(u), gy - sign * ga * Math.sin((2 * Math.PI * u) / P)])
    }
    return poly(pts)
  }
  return (
    <Anim
      n="36-1"
      title="重力波が通ると、空間は縦と横に交互に伸び縮みする"
      still={P / 4}
      period={P}
      caption="模式図です。伸び縮みは実際よりけた違いに大きく誇張しています。重力波は画面の奥から手前へ進むとしています。点線の円は、重力波が来る前の粒の位置です。右のグラフのように、横に伸びるときは縦に縮み、半周期後には逆になります。"
    >
      {(t) => {
        const s = Math.sin((2 * Math.PI * t) / P)
        const sx = 1 + A * s
        const sy = 1 - A * s
        const ticks = [-G, -G / 2, 0, G / 2, G]
        const state = s > 0.3 ? '横に伸び、縦に縮んでいる' : s < -0.3 ? '縦に伸び、横に縮んでいる' : '元の形を通り過ぎるところ'
        return (
          <Svg id="36-1" w={680} h={300} label="円く並べた粒の上を重力波が通ると、粒の並びは横に伸びて縦に縮んだ楕円になり、次に縦に伸びて横に縮んだ楕円になる。これを繰り返す。">
            <T x={cx} y={16} anchor="middle" fs={12.5} bold>
              円く並べた粒
            </T>
            {ticks.map((g) => (
              <g key={g}>
                <line x1={cx + g * sx} y1={cy - G * sy} x2={cx + g * sx} y2={cy + G * sy} stroke="var(--fig-muted)" strokeWidth={0.8} opacity={0.6} />
                <line x1={cx - G * sx} y1={cy + g * sy} x2={cx + G * sx} y2={cy + g * sy} stroke="var(--fig-muted)" strokeWidth={0.8} opacity={0.6} />
              </g>
            ))}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--fig-muted)" strokeWidth={1.2} strokeDasharray="4 4" />
            {Array.from({ length: 12 }, (_, k) => {
              const th = (k * Math.PI) / 6
              return <Ball key={k} x={cx + R * Math.cos(th) * sx} y={cy + R * Math.sin(th) * sy} r={6.5} />
            })}
            <T x={cx} y={284} anchor="middle" fs={11.5} tone="muted">
              点線の円：重力波が来る前の位置
            </T>
            {/* 長さの変化のグラフ */}
            <T x={(gx0 + gx1) / 2} y={30} anchor="middle" fs={12.5} bold>
              粒の並びの横と縦の長さ
            </T>
            <line x1={gx0} y1={gy} x2={gx1 + 10} y2={gy} stroke="var(--fig-muted)" strokeDasharray="3 3" />
            <T x={gx0 - 8} y={gy} anchor="end" fs={11.5} tone="muted">
              元の長さ
            </T>
            <path d={curve(1)} fill="none" stroke="var(--fig-line)" strokeWidth={2.2} />
            <path d={curve(-1)} fill="none" stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="7 4" />
            <T x={X(P / 4)} y={gy - ga - 14} anchor="middle" fs={12}>
              横の長さ（実線）
            </T>
            <T x={X((3 * P) / 4)} y={gy + ga + 15} anchor="middle" fs={12} tone="muted">
              縦の長さ（破線）
            </T>
            <line x1={X(t % P)} y1={gy - ga - 4} x2={X(t % P)} y2={gy + ga + 4} stroke="var(--fig-accent)" strokeWidth={1.5} />
            <T x={gx1 + 4} y={gy + 74} anchor="end" fs={11.5} tone="muted">
              時間 →
            </T>
            <T x={gx0 - 40} y={236} fs={12.5}>
              {`いまは：${state}`}
            </T>
            <T x={gx0 - 40} y={262} fs={12} tone="muted">
              重力波は画面の奥から手前へ進む
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図36-2 ファインマンのビーズの思考実験（動） ---------- */

export function FigBeads() {
  const P = 2.4
  const A = 0.15
  const x0 = 340
  const B = 160
  return (
    <Anim
      n="36-2"
      title="棒の上のビーズが滑ってこすれ、熱が出る"
      still={P / 8}
      period={P}
      caption="1957年にファインマンが示した思考実験の模式図です。伸び縮みは大きく誇張しています。空間の目盛りは重力波で伸び縮みしますが、棒は原子どうしの力で長さを保ちます。ビーズは空間と一緒に動こうとして棒の上を滑り、こすれて熱が出ます。熱が出るのは、重力波がエネルギーを運んできたからです。"
    >
      {(t) => {
        const w = (2 * Math.PI * t) / P
        const s = Math.sin(w)
        const sx = 1 + A * s
        const speed = Math.abs(Math.cos(w))
        const beads = [x0 - B * sx, x0 + B * sx]
        return (
          <Svg id="36-2" w={680} h={240} label="空間の目盛りは重力波で伸び縮みするが、棒の長さは変わらない。棒に通した2つのビーズは空間と一緒に動こうとして棒の上を行き来し、こすれた所から熱が出る。">
            <T x={x0} y={22} anchor="middle" fs={12.5} bold>
              空間の目盛り（重力波で伸び縮みする）
            </T>
            {Array.from({ length: 15 }, (_, i) => {
              const k = i - 7
              return <circle key={k} cx={x0 + k * 40 * sx} cy={50} r={3} fill="var(--fig-muted)" />
            })}
            {/* 棒 */}
            <rect x={x0 - 235} y={120} width={470} height={10} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
            {[-B, B].map((b) => (
              <line key={b} x1={x0 + b} y1={146} x2={x0 + b} y2={158} stroke="var(--fig-muted)" strokeWidth={1.5} />
            ))}
            <T x={x0 - B} y={172} anchor="middle" fs={11.5} tone="muted">
              ビーズの元の位置
            </T>
            <T x={x0 + B} y={172} anchor="middle" fs={11.5} tone="muted">
              ビーズの元の位置
            </T>
            {/* 熱の印 */}
            {beads.map((bx, i) => (
              <g key={i} opacity={0.15 + 0.85 * speed}>
                {[-9, 0, 9].map((dx) => (
                  <path key={dx} d={`M${bx + dx},100 q4,-5 0,-10 q-4,-5 0,-10`} fill="none" stroke={HEAT} strokeWidth={2} strokeLinecap="round" />
                ))}
              </g>
            ))}
            {beads.map((bx, i) => (
              <ellipse key={i} cx={bx} cy={125} rx={8} ry={17} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
            ))}
            <T x={x0} y={92} anchor="middle" fs={12} tone="muted">
              こすれた所から熱が出る
            </T>
            <T x={x0} y={202} anchor="middle" fs={12.5}>
              棒（原子どうしの力で長さを保つ）
            </T>
            <T x={x0} y={226} anchor="middle" fs={12.5}>
              ビーズは空間と一緒に動こうとして、棒の上を滑る
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図36-3 ウェーバーの装置 ---------- */

function Bar({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <ellipse cx={x} cy={y + h / 2} rx={h / 5} ry={h / 2} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <ellipse cx={x + w} cy={y + h / 2} rx={h / 5} ry={h / 2} fill="var(--fig-box)" stroke="var(--fig-line)" />
    </g>
  )
}

export function FigWeber() {
  return (
    <Figure
      n="36-3"
      title="ウェーバーの装置はアルミニウムの円柱の揺れで重力波をとらえようとした"
      caption="模式図です。重力波で円柱がわずかに伸び縮みすると、表面の結晶が電気の信号を出します。ウェーバーは約1000km離れた2台の円柱が同時に揺れたときを、重力波の候補としました。"
    >
      <Svg id="36-3" w={720} h={270} label="真空の容器の中に、重さ約1.5トンのアルミニウムの円柱が針金で吊るしてある。円柱の真ん中には揺れを電気の信号に変える結晶の帯がある。メリーランド大学とアルゴンヌ国立研究所に置いた2台の円柱が同時に揺れたかを比べた。">
        <rect x={20} y={36} width={410} height={208} rx={8} fill="none" stroke="var(--fig-muted)" strokeDasharray="6 4" />
        <T x={34} y={54} fs={12} tone="muted">
          真空の容器
        </T>
        <line x1={110} y1={74} x2={330} y2={74} stroke="var(--fig-line)" strokeWidth={4} />
        <path d="M200,74 L200,186 Q220,198 240,186 L240,74" fill="none" stroke="var(--fig-line)" strokeWidth={1.2} />
        <Bar x={95} y={124} w={250} h={58} />
        <rect x={205} y={124} width={30} height={58} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <T x={192} y={100} anchor="end" fs={12}>
          吊るす針金
        </T>
        <T x={220} y={212} anchor="middle" fs={12}>
          結晶の帯（揺れを電気の信号に変える）
        </T>
        <T x={220} y={232} anchor="middle" fs={11.5} tone="muted">
          アルミニウムの円柱（約1.5トン）
        </T>
        <Arrow x1={360} y1={153} x2={466} y2={153} />
        <T x={364} y={138} fs={11.5} tone="muted">
          電気の信号
        </T>
        {/* 2台を比べる */}
        <Bar x={490} y={70} w={70} h={24} />
        <Bar x={620} y={70} w={70} h={24} />
        <T x={525} y={112} anchor="middle" fs={11.5}>
          メリーランド大学
        </T>
        <T x={655} y={112} anchor="middle" fs={11.5}>
          アルゴンヌ国立研究所
        </T>
        <Arrow x1={574} y1={50} x2={606} y2={50} both />
        <T x={590} y={34} anchor="middle" fs={11.5} tone="muted">
          約1000km
        </T>
        <Box x={470} y={125} w={240} h={56} lines={['2台が同時に揺れたときだけを', '重力波の候補にする']} fs={12} />
        <T x={590} y={212} anchor="middle" fs={12}>
          円柱が共振する揺れ：1秒に1657回
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図36-4 連星パルサー（動） ---------- */

export function FigBinary() {
  const C: Pt = [170, 140]
  const R = 55
  const Torb = 4
  const dT = 0.25 // パルスの間隔（誇張）
  const c = 130 // 電波の印の速さ（ピクセル毎秒。軌道の速さとの比を誇張している）
  const xStart = 320
  const earthX = 670
  const pos = (tt: number): Pt => {
    const th = (2 * Math.PI * tt) / Torb
    return [C[0] + R * Math.cos(th), C[1] - R * Math.sin(th)]
  }
  return (
    <Anim
      n="36-4"
      title="連星パルサーの電波は、近づくときは詰まって、遠ざかるときは間をあけて届く"
      still={2}
      period={Torb}
      caption="模式図です。軌道は円で描き、星の大きさ、電波の間隔の変化、重力波の輪は誇張しています。実際の公転は8時間足らずで1周し、パルサーは1秒に約17回自転して、そのたびに電波を地球へ送ります。黒の矢印はパルサーの動く向きです。"
    >
      {(t) => {
        const [px, py] = pos(t)
        const [qx, qy] = [2 * C[0] - px, 2 * C[1] - py]
        const th = (2 * Math.PI * t) / Torb
        const vx = -Math.sin(th)
        const vy = -Math.cos(th)
        const pulses: number[] = []
        for (let k = 0; k < 40; k++) {
          const te = Math.floor(t / dT) * dT - k * dT
          const x = pos(te)[0] + c * (t - te)
          if (x > xStart && x < earthX - 18) pulses.push(x)
        }
        const rings: number[] = []
        for (let k = 0; k < 6; k++) {
          const te = Math.floor(t / (Torb / 2)) * (Torb / 2) - k * (Torb / 2)
          const r = 22 * (t - te) + R + 14
          if (r < 116) rings.push(r)
        }
        return (
          <Svg id="36-4" w={720} h={280} label="2つの星が互いのまわりを回り、片方のパルサーが規則正しく電波を送る。パルサーが地球へ近づく向きに動くと電波の間隔は詰まり、遠ざかる向きに動くと広がる。回り合う2つの星からは重力波が広がる。">
            {rings.map((r) => (
              <circle key={r.toFixed(2)} cx={C[0]} cy={C[1]} r={r} fill="none" stroke="var(--fig-muted)" strokeDasharray="5 5" opacity={1 - (r - R - 14) / 55} />
            ))}
            <circle cx={C[0]} cy={C[1]} r={R} fill="none" stroke="var(--fig-muted)" strokeWidth={1} strokeDasharray="3 4" />
            <Ball x={qx} y={qy} r={11} fill="var(--fig-box)" />
            <Ball x={px} y={py} r={7} />
            <Vel x1={px} y1={py} x2={px + vx * 34} y2={py + vy * 34} />
            <T x={330} y={250} fs={11.5}>
              小さい青い丸：パルサー　大きい灰色の丸：相手の星
            </T>
            <T x={330} y={270} fs={11.5} tone="muted">
              外へ広がる点線の輪：重力波
            </T>
            {/* 電波の列 */}
            <line x1={xStart} y1={C[1]} x2={earthX - 16} y2={C[1]} stroke="var(--fig-muted)" strokeWidth={1} />
            {pulses.map((x) => (
              <line key={x.toFixed(1)} x1={x} y1={C[1] - 13} x2={x} y2={C[1] + 13} stroke={BEAM} strokeWidth={3} />
            ))}
            <circle cx={earthX} cy={C[1]} r={15} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <T x={earthX} y={C[1] + 30} anchor="middle" fs={12}>
              地球
            </T>
            <T x={(xStart + earthX) / 2} y={70} anchor="middle" fs={12.5} bold>
              地球に届く電波のパルス（黄色の線）
            </T>
            <T x={(xStart + earthX) / 2} y={96} anchor="middle" fs={12}>
              パルサーが地球へ近づく向きに動くと詰まる
            </T>
            <T x={(xStart + earthX) / 2} y={192} anchor="middle" fs={12}>
              遠ざかる向きに動くと間があく
            </T>
            <T x={(xStart + earthX) / 2} y={216} anchor="middle" fs={11.5} tone="muted">
              この間隔の変化から、軌道と星の質量が分かる
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図36-5 近星点を通る時刻のずれ ---------- */

export function FigDecay() {
  const x0 = 110
  const x1 = 620
  const y0 = 70
  const y1 = 250
  const curve: Pt[] = []
  for (let i = 0; i <= 50; i++) {
    const f = i / 50
    curve.push([x0 + (x1 - x0) * f, y0 + (y1 - y0 - 10) * f * f])
  }
  return (
    <Figure
      n="36-5"
      title="公転の周期が短くなる分が積み重なり、近星点を通る時刻は予定より早くなっていく"
      caption="模式図です。縦の目盛りの値は省いています。近星点は、2つの星が最も近づく点です。軌道が縮まなければ、近星点を通る時刻は予定どおりのまま（赤の破線）です。実際の観測は、重力波でエネルギーを失うとした一般相対性理論の予言の曲線に沿いました。"
    >
      <Svg id="36-5" w={680} h={300} label="横は観測を始めてからの年数、縦は近星点を通る時刻が予定より早くなった量。一般相対性理論の予言は、年がたつほど急に大きくなる曲線になり、観測はこの曲線に沿った。軌道が縮まない場合は0のままの水平な線になる。">
        <line x1={x0} y1={y0} x2={x1 + 20} y2={y0} stroke="var(--fig-line)" />
        <line x1={x0} y1={y0} x2={x0} y2={y1 + 10} stroke="var(--fig-line)" />
        {[0, 10, 20, 30].map((yr) => {
          const x = x0 + ((x1 - x0) * yr) / 35
          return (
            <g key={yr}>
              <line x1={x} y1={y0} x2={x} y2={y0 - 6} stroke="var(--fig-line)" />
              <T x={x} y={y0 - 16} anchor="middle" fs={11.5}>
                {`${yr}年`}
              </T>
            </g>
          )
        })}
        <T x={(x0 + x1) / 2} y={22} anchor="middle" fs={11.5}>
          観測を始めてからの年数
        </T>
        <T x={x0 - 10} y={y0} anchor="end" fs={11.5}>
          0
        </T>
        <T x={x0 - 10} y={y0 + 70} anchor="end" fs={11.5}>
          早くなった
        </T>
        <T x={x0 - 10} y={y0 + 88} anchor="end" fs={11.5}>
          時間
        </T>
        <Arrow x1={x0 - 50} y1={y0 + 110} x2={x0 - 50} y2={y0 + 160} />
        <Arrow x1={x0 + 2} y1={y0 + 1} x2={x1} y2={y0 + 1} danger plain dashed />
        <Cross x={x1 - 20} y={y0 + 18} s={7} />
        <T x={x1 - 36} y={y0 + 22} anchor="end" fs={12} tone="danger">
          軌道が縮まなければ、ずれは0のまま
        </T>
        <path d={poly(curve)} fill="none" stroke="var(--fig-line)" strokeWidth={2.5} />
        <T x={x0 + 20} y={205} fs={12.5}>
          一般相対性理論の予言（重力波でエネルギーを失う）
        </T>
        <T x={x0 + 20} y={228} fs={12} tone="muted">
          観測はこの曲線に沿った（2016年の解析で違いは0.2%以内）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図36-6 LIGO の検出器（動・切り替え） ---------- */

function Mirror({ x, y, vertical }: { x: number; y: number; vertical?: boolean }) {
  return vertical ? (
    <rect x={x - 5} y={y - 18} width={10} height={36} rx={2} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
  ) : (
    <rect x={x - 18} y={y - 5} width={36} height={10} rx={2} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
  )
}

export function FigLigo() {
  const [gw, setGw] = useState<'on' | 'off'>('on')
  const P = 2.4
  const A = 0.07
  const O: Pt = [150, 240] // 光を分ける鏡（角）
  const LX = 310
  const LY = 180
  return (
    <Anim
      n="36-6"
      title="重力波が通ると、一方の腕が伸びてもう一方が縮み、検出器に届く光の明るさが変わる"
      still={P / 4}
      period={P}
      controls={
        <Choice
          label="重力波"
          options={[
            { value: 'on', label: '通る' },
            { value: 'off', label: '通らない' },
          ]}
          value={gw}
          onChange={setGw}
        />
      }
      caption="LIGO の検出器を上から見た模式図です。腕の長さの変化は大きく誇張しています。重力波がないときは、戻ってきた2つの光が打ち消し合い、検出器は暗いままです。重力波が通ると腕の長さに差ができ、光が打ち消し合わなくなって明るさが変わります。実際の LIGO では、光を腕の中で何度も往復させて変化を大きくしています。"
    >
      {(t) => {
        const s = gw === 'on' ? Math.sin((2 * Math.PI * t) / P) : 0
        const ex = O[0] + LX * (1 + A * s)
        const ey = O[1] - LY * (1 - A * s)
        const bright = Math.abs(s)
        const gx0 = 520
        const gx1 = 700
        const gyb = 230
        const trace: Pt[] = []
        for (let i = 0; i <= 60; i++) {
          const u = t - P + (P * i) / 60
          const v = gw === 'on' ? Math.abs(Math.sin((2 * Math.PI * u) / P)) : 0
          trace.push([gx0 + ((gx1 - gx0) * i) / 60, gyb - 46 * v])
        }
        return (
          <Svg id="36-6" w={720} h={320} label="L字形の干渉計。レーザーの光が角で2つに分かれ、右の腕と上の腕の先の鏡で跳ね返って戻り、重なって下の検出器に入る。重力波が通ると右の腕が伸びるときに上の腕が縮み、その逆も起こる。そのたびに検出器に届く光が明るくなる。">
            {/* 腕の管 */}
            <rect x={O[0] + 14} y={O[1] - 11} width={LX * (1 + A) + 6} height={22} fill="var(--fig-box)" stroke="var(--fig-muted)" opacity={0.7} />
            <rect x={O[0] - 11} y={O[1] - LY * (1 + A) - 20} width={22} height={LY * (1 + A) + 6} fill="var(--fig-box)" stroke="var(--fig-muted)" opacity={0.7} />
            {/* 光 */}
            <line x1={40} y1={O[1]} x2={ex} y2={O[1]} stroke={BEAM} strokeWidth={2.5} />
            <line x1={O[0]} y1={O[1]} x2={O[0]} y2={ey} stroke={BEAM} strokeWidth={2.5} />
            <line x1={O[0]} y1={O[1]} x2={O[0]} y2={286} stroke={BEAM} strokeWidth={2.5} opacity={gw === 'on' ? 0.3 + 0.7 * bright : 0.15} />
            {/* 元の鏡の位置 */}
            <line x1={O[0] + LX} y1={O[1] - 26} x2={O[0] + LX} y2={O[1] + 26} stroke="var(--fig-muted)" strokeDasharray="3 3" />
            <line x1={O[0] - 26} y1={O[1] - LY} x2={O[0] + 26} y2={O[1] - LY} stroke="var(--fig-muted)" strokeDasharray="3 3" />
            <Mirror x={ex} y={O[1]} vertical />
            <Mirror x={O[0]} y={ey} />
            <line x1={O[0] - 14} y1={O[1] + 14} x2={O[0] + 14} y2={O[1] - 14} stroke="var(--fig-accent)" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
            <rect x={14} y={O[1] - 15} width={30} height={30} rx={4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={29} y={O[1] + 30} anchor="middle" fs={12}>
              レーザー
            </T>
            <circle cx={O[0]} cy={296} r={12} fill={GLOW} opacity={gw === 'on' ? bright : 0} />
            <circle cx={O[0]} cy={296} r={12} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <T x={O[0] + 22} y={296} fs={12}>
              検出器（届く光の明るさを測る）
            </T>
            <T x={O[0] + 24} y={O[1] + 30} fs={11.5} tone="muted">
              光を2つに分ける鏡
            </T>
            <T x={O[0] + LX / 2} y={O[1] - 22} anchor="middle" fs={12}>
              腕（長さ4kmの真空の管）
            </T>
            <T x={O[0] + 36} y={O[1] - LY - 2} fs={12}>
              鏡（振り子のように吊るす）
            </T>
            <T x={O[0] + LX - 8} y={O[1] + 38} anchor="middle" fs={11.5} tone="muted">
              点線：元の鏡の位置
            </T>
            {/* 明るさのグラフ */}
            <T x={(gx0 + gx1) / 2} y={36} anchor="middle" fs={12.5} bold>
              {gw === 'on' ? '重力波が通るとき' : '重力波が通らないとき'}
            </T>
            <T x={gx0} y={60} fs={12}>
              {gw === 'on' ? '右の腕：' + (s > 0.15 ? '伸びている' : s < -0.15 ? '縮んでいる' : '元の長さ') : '右の腕：変わらない'}
            </T>
            <T x={gx0} y={82} fs={12}>
              {gw === 'on' ? '上の腕：' + (s > 0.15 ? '縮んでいる' : s < -0.15 ? '伸びている' : '元の長さ') : '上の腕：変わらない'}
            </T>
            <T x={gx0} y={150} fs={11.5} tone="muted">
              検出器に届く光の明るさ
            </T>
            <line x1={gx0} y1={gyb} x2={gx1} y2={gyb} stroke="var(--fig-line)" />
            <line x1={gx0} y1={gyb} x2={gx0} y2={gyb - 56} stroke="var(--fig-line)" />
            <path d={poly(trace)} fill="none" stroke={BEAM} strokeWidth={2.5} />
            <T x={gx1} y={gyb + 16} anchor="end" fs={11.5} tone="muted">
              時間 →（右端がいま）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図36-7 2つのブラックホールが近づいて合体する（動） ---------- */

export function FigMerger() {
  const T0 = 7 // 合体までの秒数（図の中の時間）
  const RING = 1.2 // 合体後に揺れが収まるまでを描く秒数
  const HOLD = 2.3
  const period = T0 + RING + HOLD
  const C: Pt = [250, 112]
  const A0 = 150 // 初めの間隔（ピクセル）
  const m1 = 0.55 // 重い方の質量の割合（36と29の比）
  const r1 = 15
  const r2 = 13
  const gx0 = 40
  const gx1 = 690
  const gy = 262
  const amp = 40
  const uEnd = U_MERGE + RING / T0
  const X = (u: number) => gx0 + ((gx1 - gx0) * u) / uEnd
  const posAt = (u: number) => {
    const { sep, phase } = inspiral(u)
    const a = A0 * sep
    const c = Math.cos(phase)
    const s = Math.sin(phase)
    const p1: Pt = [C[0] + (1 - m1) * a * c, C[1] + (1 - m1) * a * s * 0.62]
    const p2: Pt = [C[0] - m1 * a * c, C[1] - m1 * a * s * 0.62]
    return [p1, p2]
  }
  return (
    <Anim
      n="36-7"
      title="2つのブラックホールは回り合いながら近づいて合体し、重力波の揺れは速く大きくなってから収まる"
      still={T0 * U_MERGE - 0.25}
      period={period}
      caption="模式図です。上は回り合う2つのブラックホール（太陽の36倍と29倍の質量）を斜め上から見たもの、下は検出器がとらえる重力波の形です。近づくほど速く回り、波の揺れは速く大きくなります。合体すると1つのブラックホールになり、揺れはすぐに収まります。点線は少し前までの道筋です。2015年の信号では、検出器がとらえてから合体までが約0.2秒でした。大きさと速さの比は実際と違います。"
    >
      {(t) => {
        const tt = Math.min(t, T0 + RING)
        const u = tt / T0
        const merged = u > U_MERGE
        const [p1, p2] = posAt(Math.min(u, U_MERGE))
        const trail1: Pt[] = []
        const trail2: Pt[] = []
        if (!merged) {
          for (let i = 0; i <= 60; i++) {
            const uu = Math.max(0, u - 0.18 + (0.18 * i) / 60)
            const [a, b] = posAt(uu)
            trail1.push(a)
            trail2.push(b)
          }
        }
        const label = u < 0.8 ? '近づきながら回る' : !merged ? '速く回りながら急に近づく' : u < U_MERGE + 0.06 ? '合体して1つになり、揺れが収まる' : '合体後のブラックホール（太陽の約62倍）'
        return (
          <Svg id="36-7" w={720} h={330} label="2つのブラックホールが回り合いながら近づき、最後に合体して1つになる。下の重力波の形は、だんだん揺れが速く大きくなり、合体の後すぐに小さくなって消える。">
            {!merged && (
              <>
                <Trail points={trail1} />
                <Trail points={trail2} />
                <Hole x={p1[0]} y={p1[1]} r={r1} />
                <Hole x={p2[0]} y={p2[1]} r={r2} />
              </>
            )}
            {merged && <Hole x={C[0]} y={C[1]} r={19} />}
            <T x={470} y={60} fs={12.5} bold>
              いま：
            </T>
            <T x={470} y={84} fs={12.5}>
              {label}
            </T>
            <T x={470} y={130} fs={11.5} tone="muted">
              黒い円：ブラックホール
            </T>
            <T x={470} y={150} fs={11.5} tone="muted">
              点線：少し前までの道筋
            </T>
            {/* 重力波の形 */}
            <T x={gx0} y={196} fs={12.5} bold>
              検出器がとらえる重力波の形（横は時間）
            </T>
            <line x1={gx0} y1={gy} x2={gx1} y2={gy} stroke="var(--fig-muted)" strokeWidth={0.8} />
            <path d={strainPath(0, uEnd, gx0, gx1, gy, amp)} fill="none" stroke="var(--fig-muted)" strokeWidth={1} opacity={0.35} />
            <path d={strainPath(0, Math.max(u, 0.001), gx0, X(Math.max(u, 0.001)), gy, amp, Math.max(20, Math.round(900 * Math.min(1, u / uEnd))))} fill="none" stroke="var(--fig-line)" strokeWidth={1.8} />
            <line x1={X(u)} y1={gy - amp - 8} x2={X(u)} y2={gy + amp + 8} stroke="var(--fig-accent)" strokeWidth={1.5} />
            <T x={X(0.45)} y={gy + amp + 20} anchor="middle" fs={11.5} tone="muted">
              回り合う
            </T>
            <T x={X(U_MERGE)} y={gy + amp + 20} anchor="end" fs={11.5} tone="muted">
              合体 ↓
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図36-8 2015年と2017年の信号を比べる（切り替え） ---------- */

export function FigChirps() {
  const [scale, setScale] = useState<'own' | 'same'>('own')
  const x0 = 170
  const x1 = 690
  const rows = [
    { y: 70, name: 'ブラックホールどうし', date: '2015年9月14日', len: '約0.2秒', sec: 0.2 },
    { y: 190, name: '中性子星どうし', date: '2017年8月17日', len: '約100秒', sec: 100 },
  ]
  const band = (xa: number, xb: number, y: number, amp: number) => {
    const top: Pt[] = []
    const bottom: Pt[] = []
    for (let i = 0; i <= 80; i++) {
      const f = i / 80
      const a = amp * (0.12 + 0.88 * f ** 6)
      top.push([xa + (xb - xa) * f, y - a])
      bottom.unshift([xa + (xb - xa) * f, y + a])
    }
    return poly([...top, ...bottom]) + ' Z'
  }
  return (
    <Figure
      n="36-8"
      title="中性子星どうしの合体の信号は、ブラックホールどうしの信号より500倍ほど長く続いた"
      controls={
        <Choice
          label="時間の目盛り"
          options={[
            { value: 'own', label: 'それぞれの長さに合わせる' },
            { value: 'same', label: '同じ目盛り（100秒）' },
          ]}
          value={scale}
          onChange={setScale}
        />
      }
      caption="模式図です。「同じ目盛り」を選ぶと、2つの信号を同じ時間の幅で比べられます。中性子星どうしの信号は揺れが細かすぎて1本ずつ描けないので、揺れの大きさを帯で表しています。軽い天体ほど、検出器がとらえられる速さで回る期間が長く続きます。"
    >
      <Svg id="36-8" w={720} h={280} label="2015年のブラックホールどうしの合体の信号は約0.2秒で終わる。2017年の中性子星どうしの合体の信号は約100秒続く。同じ時間の目盛りで並べると、2015年の信号は右端の細い線にしか見えない。">
        {rows.map((r, i) => {
          const w = scale === 'own' ? x1 - x0 : ((x1 - x0) * r.sec) / 100
          const xa = x1 - Math.max(w, 2)
          return (
            <g key={r.name}>
              <T x={16} y={r.y - 12} fs={12.5} bold>
                {r.name}
              </T>
              <T x={16} y={r.y + 10} fs={11.5} tone="muted">
                {r.date}
              </T>
              <line x1={x0} y1={r.y} x2={x1} y2={r.y} stroke="var(--fig-muted)" strokeWidth={0.8} />
              {i === 0 && w > 50 && <path d={strainPath(0.55, U_MERGE + 0.012, xa, x1, r.y, 34, 500)} fill="none" stroke="var(--fig-line)" strokeWidth={1.8} />}
              {i === 0 && w <= 50 && <line x1={x1 - 1} y1={r.y - 34} x2={x1 - 1} y2={r.y + 34} stroke="var(--fig-line)" strokeWidth={2} />}
              {i === 1 && <path d={band(xa, x1, r.y, 34)} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1} />}
              <line x1={xa} y1={r.y + 46} x2={x1} y2={r.y + 46} stroke="var(--fig-line)" />
              <line x1={xa} y1={r.y + 41} x2={xa} y2={r.y + 51} stroke="var(--fig-line)" />
              <line x1={x1} y1={r.y + 41} x2={x1} y2={r.y + 51} stroke="var(--fig-line)" />
              <T x={i === 0 && w <= 50 ? x1 - 10 : (xa + x1) / 2} y={r.y + 64} anchor={i === 0 && w <= 50 ? 'end' : 'middle'} fs={12}>
                {i === 0 && w <= 50 ? `${r.len}（右端の細い線）` : r.len}
              </T>
            </g>
          )
        })}
        <T x={x1} y={22} anchor="end" fs={11.5} tone="muted">
          右端が合体の時刻
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図36-9 2017年8月17日の観測の流れ ---------- */

const MULTI = [
  { when: '合体の前の約100秒', what: ['重力波', 'LIGO 2台と Virgo'] },
  { when: '約1.7秒後', what: ['ガンマ線の閃光', '宇宙望遠鏡 Fermi'] },
  { when: '12時間以内', what: ['可視光で光る点', '銀河 NGC 4993'] },
  { when: '数日〜数週間', what: ['X線から電波まで', '約70の観測所'] },
]

export function FigMulti() {
  return (
    <Figure
      n="36-9"
      title="2017年8月17日の中性子星の合体は、重力波のあとにガンマ線や可視光などでも観測された"
      caption="箱の間隔は時間の長さに比例していません。重力波の検出器が方向を絞り込んだことで、世界の約70の観測所が同じ天体を調べられました。"
    >
      <Svg id="36-9" w={720} h={200} label="合体の前の約100秒に重力波が届き、合体の約1.7秒後にガンマ線、12時間以内に可視光で光る点が見つかり、数日から数週間の間にX線、紫外線、赤外線、電波でも観測された。">
        <Arrow x1={20} y1={150} x2={705} y2={150} />
        <T x={700} y={172} anchor="end" fs={11.5} tone="muted">
          時間の流れ
        </T>
        {MULTI.map((m, i) => {
          const x = 24 + i * 172
          return (
            <g key={m.when}>
              <Box x={x} y={50} w={156} h={64} lines={m.what} fs={12.5} bold fill={i === 0 ? 'box3' : 'box2'} subTone="muted" />
              <T x={x + 78} y={30} anchor="middle" fs={12} bold>
                {m.when}
              </T>
              <line x1={x + 78} y1={114} x2={x + 78} y2={144} stroke="var(--fig-line)" />
              <circle cx={x + 78} cy={150} r={5} fill={i === 0 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図36-10 揺れの速さで使い分ける観測方法 ---------- */

const BANDS = [
  { name: 'パルサーを使う観測', ex: 'NANOGrav など', speed: ['揺れの周期は', '数年〜数十年'], src: ['巨大なブラックホールの', '連星（有力な候補）'] },
  { name: '宇宙の干渉計 LISA', ex: '2035年に打ち上げ予定', speed: ['地上の検出器より', 'ゆっくりした揺れ'], src: ['巨大なブラックホール', 'どうしの合体など'] },
  { name: '地上の干渉計', ex: 'LIGO、Virgo、KAGRA', speed: ['1秒に数十回〜', '数千回の揺れ'], src: ['恒星ほどの質量の', 'ブラックホールや中性子星'] },
]

export function FigBands() {
  return (
    <Figure
      n="36-10"
      title="重力波は揺れの速さによって、とらえる方法が違う"
      caption="左ほどゆっくり揺れる重力波、右ほど速く揺れる重力波を表します。速く揺れる重力波ほど、軽い天体が狭い軌道で速く回るときに出ます。"
    >
      <Svg id="36-10" w={720} h={260} label="ゆっくり揺れる重力波から速く揺れる重力波の順に、パルサーを使う観測（周期が数年から数十年）、宇宙の干渉計 LISA、地上の干渉計（1秒に数十回から数千回）が並ぶ。それぞれの主な源も示す。">
        <Arrow x1={30} y1={34} x2={700} y2={34} />
        <T x={30} y={16} fs={11.5} tone="muted">
          ゆっくり揺れる
        </T>
        <T x={700} y={16} anchor="end" fs={11.5} tone="muted">
          速く揺れる
        </T>
        {BANDS.map((b, i) => {
          const x = 24 + i * 232
          return (
            <g key={b.name}>
              <Box x={x} y={52} w={212} h={52} lines={[b.name, b.ex]} fs={12.5} bold fill={i === 1 ? 'box5' : 'box3'} subTone="muted" dashed={i === 1} />
              <Box x={x} y={116} w={212} h={52} lines={b.speed} fs={12} fill="bg" />
              <T x={x + 106} y={190} anchor="middle" fs={11.5} tone="muted">
                主な源
              </T>
              <T x={x + 106} y={212} anchor="middle" fs={12}>
                {b.src[0]}
              </T>
              <T x={x + 106} y={232} anchor="middle" fs={12}>
                {b.src[1]}
              </T>
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}
