import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { Ball, Force, Trail, Vel, clamp01, ease, rng } from './common'

/** 原子核（丸と中の文字） */
function Nucleus({ x, y, r, hit, label = '原子核' }: { x: number; y: number; r: number; hit?: boolean; label?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={hit ? 'var(--fig-box4)' : 'var(--fig-box3)'} stroke={hit ? 'var(--fig-accent)' : 'var(--fig-line)'} strokeWidth={hit ? 2 : 1.5} />
      <T x={x} y={y} anchor="middle" fs={11.5}>
        {label}
      </T>
    </g>
  )
}

/** 折れ線の上を、区間ごとの速さで進む点の位置と、通った点の並び */
function walk(pts: [number, number][], speeds: number[], t: number) {
  let left = t
  const passed: [number, number][] = [pts[0]]
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const len = Math.hypot(x1 - x0, y1 - y0)
    const dur = len / speeds[i]
    if (left < dur) {
      const f = left / dur
      const p: [number, number] = [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]
      return { p, seg: i, dir: [(x1 - x0) / len, (y1 - y0) / len] as [number, number], done: false, trail: [...passed, p] }
    }
    left -= dur
    passed.push(pts[i + 1])
  }
  const n = pts.length
  const [xa, ya] = pts[n - 2]
  const [xb, yb] = pts[n - 1]
  const len = Math.hypot(xb - xa, yb - ya)
  return { p: pts[n - 1], seg: n - 2, dir: [(xb - xa) / len, (yb - ya) / len] as [number, number], done: true, trail: passed, over: left }
}

/** 折れ線の各点に着く時刻 */
function arrivals(pts: [number, number][], speeds: number[]) {
  const out = [0]
  for (let i = 0; i < pts.length - 1; i++) out.push(out[i] + Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) / speeds[i])
  return out
}

/* ---------- 図28-1 α線の粒子と中性子（動） ---------- */

const N1X = 470
const N1R = 32
const V1 = 150
const K1 = (V1 * V1 * 70) / 2
/** α線の粒子の道筋（原子核の中心からの位置と速度）。0.02秒ごと */
const ALPHA_PATH = (() => {
  const out: { x: number; y: number; vx: number; vy: number }[] = []
  let x = 40 - N1X
  let y = -36
  let vx = V1
  let vy = 0
  const dt = 0.002
  for (let i = 0; i <= 3000; i++) {
    if (i % 10 === 0) out.push({ x, y, vx, vy })
    const r2 = x * x + y * y
    const r = Math.sqrt(r2)
    const a = K1 / r2
    vx += ((a * x) / r) * dt
    vy += ((a * y) / r) * dt
    x += vx * dt
    y += vy * dt
  }
  return out
})()

export function FigCharge() {
  const ya = 120
  const yn = 236
  return (
    <Anim n="28-1" title="電気を持たない中性子は、原子核に押し返されずに近づける" still={2.9} period={5}
      caption="模式図です。上はプラスの電気を持つα線の粒子で、同じくプラスの電気を持つ原子核から押し返される力（青の矢印）を受けて向きを変えます。下の中性子は電気を持たないので、押し返されずに原子核に入り込みます。">
      {(t) => {
        const i = Math.min(ALPHA_PATH.length - 1, Math.floor(t / 0.02))
        const a = ALPHA_PATH[i]
        const ax = N1X + a.x
        const ay = ya + a.y
        const r = Math.hypot(a.x, a.y)
        const f = Math.min(46, (K1 / (r * r)) * 0.28)
        const trail = ALPHA_PATH.slice(0, i + 1).filter((_, j) => j % 3 === 0).map((p) => [N1X + p.x, ya + p.y] as [number, number])
        const sp = Math.hypot(a.vx, a.vy)
        const nx = 40 + V1 * t
        const hitAt = (N1X - N1R - 46) / V1 + 0.25
        const hit = t >= hitAt
        return (
          <Svg id="28-1" w={720} h={290} label="上の段では、プラスの電気を持つα線の粒子が原子核に押し返されて大きく向きを変える。下の段では、電気を持たない中性子がまっすぐ原子核に入り込む。">
            <T x={20} y={22} fs={12.5} bold>
              α線の粒子（プラスの電気）を飛ばす
            </T>
            <Nucleus x={N1X} y={ya} r={N1R} />
            <T x={N1X + 46} y={ya + 6} fs={11.5} tone="muted">
              プラスの電気
            </T>
            <Trail points={trail} />
            {ay > -10 && (
              <>
                {f > 4 && <Force x1={ax} y1={ay} x2={ax + (a.x / r) * f} y2={ay + (a.y / r) * f} />}
                <Vel x1={ax} y1={ay} x2={ax + (a.vx / sp) * 34} y2={ay + (a.vy / sp) * 34} />
                <Ball x={ax} y={ay} r={7} fill="var(--fig-box2)" />
              </>
            )}
            {t > 2.4 && (
              <T x={560} y={66} fs={12.5} tone="acc">
                押し返されて向きを変える
              </T>
            )}
            <line x1={20} y1={176} x2={700} y2={176} stroke="var(--fig-muted)" strokeDasharray="2 5" />
            <T x={20} y={198} fs={12.5} bold>
              中性子（電気を持たない）を飛ばす
            </T>
            <Nucleus x={N1X} y={yn} r={N1R} hit={hit} />
            {!hit && (
              <>
                <Trail points={[[40, yn], [nx, yn]]} />
                <Vel x1={nx + 8} y1={yn} x2={nx + 42} y2={yn} />
                <Ball x={nx} y={yn} r={7} />
              </>
            )}
            {hit && (
              <>
                <Trail points={[[40, yn], [N1X - N1R, yn]]} />
                <T x={N1X + 46} y={yn} fs={12.5} tone="acc">
                  押し返されずに入り込む
                </T>
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図28-2 パラフィンで遅くなる中性子（動・切り替え） ---------- */

const N2 = { x: 636, y: 120, r: 19 }
const LANE2 = 92
const PAR_PTS: [number, number][] = [[60, LANE2], [205, 122], [262, 80], [318, 130], [380, 86], [470, LANE2], [580, LANE2], [617, 111]]
const PAR_V = [320, 200, 130, 85, 60, 60, 60]
const PAR_T = arrivals(PAR_PTS, PAR_V)
/** ぶつかる水素の原子核（中性子が向きを変える点） */
const HITS = [1, 2, 3, 4].map((k) => {
  const [x, y] = PAR_PTS[k]
  const [x0, y0] = PAR_PTS[k - 1]
  const [x1, y1] = PAR_PTS[k + 1]
  const lin = Math.hypot(x - x0, y - y0)
  const ux = (x - x0) / lin
  const uy = (y - y0) / lin
  const lout = Math.hypot(x1 - x, y1 - y)
  const wx = (x1 - x) / lout
  const wy = (y1 - y) / lout
  // 等しい質量の衝突では、ぶつかった後の2つの向きは直角になる。陽子は入ってきた勢いと出ていく勢いの差の向きに動く
  const vin = PAR_V[k - 1]
  const vout = PAR_V[k]
  const px = ux * vin - wx * vout
  const py = uy * vin - wy * vout
  const pv = Math.hypot(px, py)
  return { x: x + ux * 11, y: y + uy * 11, dx: px / pv, dy: py / pv, v: pv, t: PAR_T[k] }
})
const DECOR: [number, number][] = [[178, 150], [232, 162], [300, 165], [352, 160], [420, 150], [448, 128], [188, 78], [345, 108], [410, 128], [240, 112]]

export function FigParaffin() {
  const [mode, setMode] = useState<'with' | 'none'>('with')
  const withP = mode === 'with'
  const zone = withP ? 60 : 24
  const period = withP ? 7.6 : 3.2
  return (
    <Anim
      n="28-2"
      title="水素を多く含むパラフィンの中で遅くなった中性子は、原子核に取り込まれやすい"
      still={withP ? 6.6 : 1.9}
      period={period}
      controls={
        <Choice
          label="中性子の通り道"
          options={[
            { value: 'with', label: 'パラフィンあり' },
            { value: 'none', label: 'パラフィンなし' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="模式図です。黒の矢印は中性子の速さと向きです。中性子は水素の原子核（陽子）にぶつかるたびに勢いの一部を渡して遅くなります。点線の円は、中性子が取り込まれやすい範囲の目安で、遅い中性子ほど広くなります。「パラフィンなし」を選ぶと、速いままの中性子が原子核の近くを通り過ぎます。"
    >
      {(t) => {
        const tt = t % period
        if (!withP) {
          const x = 60 + 320 * tt
          return (
            <Svg id="28-2" w={720} h={232} label="パラフィンがないと、速い中性子は取り込まれやすい範囲の外側を素早く通り過ぎる。">
              <rect x={14} y={LANE2 - 14} width={36} height={28} rx={4} fill="var(--fig-box)" stroke="var(--fig-line)" />
              <T x={32} y={LANE2 - 26} anchor="middle" fs={11.5}>
                中性子の源
              </T>
              <circle cx={N2.x} cy={N2.y} r={zone} fill="none" stroke="var(--fig-accent)" strokeDasharray="4 4" />
              <Nucleus x={N2.x} y={N2.y} r={N2.r} />
              <T x={N2.x} y={N2.y + zone + 30} anchor="middle" fs={11.5} tone="acc">
                取り込まれやすい範囲
              </T>
              <Trail points={[[60, LANE2], [Math.min(x, 740), LANE2]]} />
              {x < 740 && (
                <>
                  <Vel x1={x + 8} y1={LANE2} x2={x + 46} y2={LANE2} />
                  <Ball x={x} y={LANE2} r={6} />
                </>
              )}
              <T x={360} y={214} anchor="middle" fs={12.5}>
                速い中性子は、原子核の近くを素早く通り過ぎやすい
              </T>
            </Svg>
          )
        }
        const w = walk(PAR_PTS, PAR_V, tt)
        const absorbed = w.done
        const v = PAR_V[Math.min(w.seg, PAR_V.length - 1)]
        return (
          <Svg id="28-2" w={720} h={232} label="中性子はパラフィンの中で水素の原子核に何度もぶつかって遅くなり、パラフィンを出たあと原子核に取り込まれる。">
            <rect x={14} y={LANE2 - 14} width={36} height={28} rx={4} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={32} y={LANE2 - 26} anchor="middle" fs={11.5}>
              中性子の源
            </T>
            <rect x={150} y={28} width={320} height={154} rx={6} fill="var(--fig-box2)" stroke="var(--fig-line)" opacity={0.85} />
            <T x={310} y={44} anchor="middle" fs={12}>
              パラフィン（水素を多く含む）
            </T>
            {DECOR.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={4.5} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            ))}
            {HITS.map((h, i) => {
              const u = clamp01((tt - h.t) / 0.7)
              const d = 6 * ease(u)
              const px = h.x + h.dx * d
              const py = h.y + h.dy * d
              return (
                <g key={i}>
                  <circle cx={px} cy={py} r={4.5} fill="var(--fig-bg)" stroke="var(--fig-line)" />
                  {tt > h.t && u < 1 && <Vel x1={px} y1={py} x2={px + h.dx * h.v * 0.1} y2={py + h.dy * h.v * 0.1} />}
                </g>
              )
            })}
            <T x={310} y={196} anchor="middle" fs={11.5} tone="muted">
              小さな丸：水素の原子核（陽子）
            </T>
            <circle cx={N2.x} cy={N2.y} r={zone} fill="none" stroke="var(--fig-accent)" strokeDasharray="4 4" />
            <Nucleus x={N2.x} y={N2.y} r={N2.r} hit={absorbed} />
            <T x={N2.x} y={N2.y + zone + 14} anchor="middle" fs={11.5} tone="acc">
              取り込まれやすい範囲
            </T>
            <Trail points={w.trail} />
            {!absorbed && (
              <>
                <Vel x1={w.p[0] + w.dir[0] * 8} y1={w.p[1] + w.dir[1] * 8} x2={w.p[0] + w.dir[0] * (10 + v * 0.11)} y2={w.p[1] + w.dir[1] * (10 + v * 0.11)} />
                <Ball x={w.p[0]} y={w.p[1]} r={6} />
              </>
            )}
            <T x={360} y={220} anchor="middle" fs={12.5}>
              {absorbed ? '遅くなった中性子が、原子核に取り込まれた' : 'ぶつかるたびに勢いを渡して遅くなる'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図28-3 陽子の数の数直線 ---------- */

const NX = (n: number) => 50 + n * 6.4

export function FigNumberLine() {
  const ay = 122
  return (
    <Figure n="28-3" title="ウランから見つかったのは、ウランよりずっと軽いバリウムだった"
      caption="横軸は原子核の中の陽子の数（原子番号）です。バリウムともう一方の破片（クリプトン）の陽子の数を合わせると、ウランの92になります。実際の破片の組み合わせは核分裂ごとに異なり、バリウムとクリプトンはその一例です。">
      <Svg id="28-3" w={720} h={236} label="陽子の数の数直線。当時はウランの92に近い元素ができると予想されていたが、見つかったのは56のバリウムだった。もう一方の破片は36のクリプトンで、合わせると92になる。">
        <rect x={NX(86)} y={ay - 16} width={NX(94) - NX(86)} height={32} rx={4} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 3" />
        <T x={700} y={24} anchor="end" fs={12}>
          1938年までの予想：ウランに近い元素
        </T>
        <T x={700} y={42} anchor="end" fs={11.5} tone="muted">
          （ラジウムの88、ウランより重い93・94など）
        </T>
        <line x1={NX(0)} y1={ay} x2={NX(100)} y2={ay} stroke="var(--fig-line)" strokeWidth={1.5} />
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => (
          <g key={n}>
            <line x1={NX(n)} y1={ay} x2={NX(n)} y2={ay + 6} stroke="var(--fig-line)" />
            <T x={NX(n)} y={ay + 18} anchor="middle" fs={11.5} tone="muted">
              {n}
            </T>
          </g>
        ))}
        <T x={50} y={ay + 40} fs={11.5} tone="muted">
          原子核の中の陽子の数（原子番号）
        </T>
        <circle cx={NX(92)} cy={ay} r={7} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
        <T x={NX(92)} y={ay - 46} anchor="middle" fs={11.5} tone="muted">
          中性子を当てた
        </T>
        <T x={NX(92)} y={ay - 28} anchor="middle" fs={12.5}>
          ウラン（92）
        </T>
        <circle cx={NX(56)} cy={ay} r={7} fill="var(--fig-accent)" stroke="var(--fig-line)" />
        <T x={NX(56)} y={ay - 46} anchor="middle" fs={11.5} tone="acc">
          見つかった
        </T>
        <T x={NX(56)} y={ay - 28} anchor="middle" fs={12.5} tone="acc">
          バリウム（56）
        </T>
        <circle cx={NX(36)} cy={ay} r={6} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="3 2" />
        <T x={NX(36)} y={ay - 46} anchor="middle" fs={11.5} tone="muted">
          もう一方の破片
        </T>
        <T x={NX(36)} y={ay - 28} anchor="middle" fs={12.5}>
          クリプトン（36）
        </T>
        <rect x={NX(0)} y={180} width={NX(56) - NX(0)} height={20} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <T x={(NX(0) + NX(56)) / 2} y={190} anchor="middle" fs={12}>
          バリウムの陽子 56個
        </T>
        <rect x={NX(56)} y={180} width={NX(92) - NX(56)} height={20} fill="var(--fig-box4)" stroke="var(--fig-line)" />
        <T x={(NX(56) + NX(92)) / 2} y={190} anchor="middle" fs={12}>
          クリプトンの陽子 36個
        </T>
        <T x={NX(92)} y={218} anchor="end" fs={12} tone="acc">
          2つを合わせると、ウランと同じ92個
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図28-4 中性子を受けて原子核が2つに割れる（動） ---------- */

/** カッシーニの卵形線。c が a に近づくと真ん中がくびれる */
function cassini(cx: number, cy: number, a: number, c: number) {
  let d = ''
  for (let i = 0; i <= 72; i++) {
    const th = (i / 72) * Math.PI * 2
    const c2 = Math.cos(2 * th)
    const r2 = c * c * c2 + Math.sqrt(Math.max(0, c ** 4 * c2 * c2 + a ** 4 - c ** 4))
    const r = Math.sqrt(Math.max(0, r2))
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(th)).toFixed(1)},${(cy + r * Math.sin(th)).toFixed(1)}`
  }
  return `${d}Z`
}

const SPLIT_N: [number, number][] = [[0.45, -0.89], [0, 1], [-0.6, -0.8]]

export function FigSplit() {
  const cx = 360
  const cy = 130
  const A = 48
  const T1 = 1.3
  const T2 = 2.1
  const T3 = 3.5
  return (
    <Anim n="28-4" title="中性子を取り込んだウランの原子核は、液体の滴のように伸びて2つに分かれる" still={4.1} period={7.5}
      caption="マイトナーとフリッシュの考えを表した模式図です。2つに分かれた原子核（破片）はどちらもプラスの電気を持つので、互いに押し合い（青の矢印）、大きな速さで飛び離れます（黒の矢印）。このとき新しい中性子も2〜3個飛び出します。">
      {(t) => {
        const stage = t < T1 ? 1 : t < T2 ? 2 : t < T3 ? 3 : 4
        const text = [
          '① 中性子が原子核に近づく',
          '② 中性子を取り込み、原子核が揺れ始める',
          '③ 細長く伸び、真ん中がくびれる',
          '④ 2つに分かれ、電気の反発で押し合って飛び離れる',
        ][stage - 1]
        const u = t - T3
        const d = Math.min(250, 38 + 0.5 * 80 * u * u)
        const sp = 80 * u
        let body = null
        if (stage === 1) body = <circle cx={cx} cy={cy} r={A} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
        else if (stage === 2) {
          const e = 0.1 * Math.sin(2 * Math.PI * 3 * (t - T1)) * clamp01((t - T1) / 0.3)
          body = <ellipse cx={cx} cy={cy} rx={A * (1 + e)} ry={A * (1 - e)} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
        } else if (stage === 3) body = <path d={cassini(cx, cy, A, A * 0.97 * ease((t - T2) / (T3 - T2)))} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
        return (
          <Svg id="28-4" w={720} h={256} label="中性子がウランの原子核に入ると、原子核は揺れて細長く伸び、真ん中がくびれて2つに分かれる。2つの破片は電気の反発で飛び離れ、新しい中性子が2〜3個出る。">
            <T x={cx} y={20} anchor="middle" fs={12.5} bold>
              {text}
            </T>
            {body}
            {stage === 1 && (
              <>
                <Trail points={[[40, cy], [Math.min(60 + 200 * t, cx - A - 6), cy]]} />
                <Ball x={Math.min(60 + 200 * t, cx - A - 6)} y={cy} r={6} />
                <T x={60} y={cy - 22} fs={12}>
                  中性子
                </T>
              </>
            )}
            {stage < 4 && (
              <T x={cx} y={cy + A + 26} anchor="middle" fs={12}>
                ウランの原子核
              </T>
            )}
            {stage === 4 && (
              <>
                {[-1, 1].map((s) => {
                  const fx = cx + s * d
                  return (
                    <g key={s}>
                      <circle cx={fx} cy={cy} r={35} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
                      {u < 0.7 ? (
                        <Force x1={fx + s * 37} y1={cy} x2={fx + s * 72} y2={cy} />
                      ) : (
                        <Vel x1={fx + s * 38} y1={cy} x2={fx + s * (40 + Math.min(52, sp * 0.3))} y2={cy} />
                      )}
                      <T x={cx + s * Math.max(d, 75)} y={cy + 54} anchor="middle" fs={12}>
                        {s < 0 ? '破片（バリウムなど）' : '破片（クリプトンなど）'}
                      </T>
                    </g>
                  )
                })}
                {SPLIT_N.map(([dx, dy], i) => {
                  const r = Math.min(95, 70 * u)
                  return <Ball key={i} x={cx + dx * r} y={cy + dy * r} r={5} />
                })}
                <Ball x={556} y={238} r={5} />
                <T x={568} y={238} fs={11.5}>
                  新しく出た中性子（2〜3個）
                </T>
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図28-5 割れる前と後の質量 ---------- */

export function FigMass() {
  const bar = (x: number, w: number, y: number, label: string, fill: string) => (
    <g>
      <rect x={x} y={y} width={w} height={30} fill={fill} stroke="var(--fig-line)" />
      {label && (
        <T x={x + w / 2} y={y + 15} anchor="middle" fs={12}>
          {label}
        </T>
      )}
    </g>
  )
  return (
    <Figure n="28-5" title="割れたあとの破片と中性子を合わせても、もとの原子核と中性子より少し軽い"
      caption="模式図です。横棒の長さは質量を表します。質量の差は実際には全体の約1000分の1で、図では大きく描いています。破片の組み合わせと出る中性子の数は、核分裂ごとに異なります。">
      <Svg id="28-5" w={720} h={214} label="分かれる前のウランの原子核と中性子の質量の合計と、分かれた後の2つの破片と中性子2個の質量の合計を横棒で比べる。後の方が陽子の約5分の1だけ軽く、その分が破片の運動のエネルギーになる。">
        <T x={40} y={22} fs={12.5} bold>
          分かれる前
        </T>
        {bar(40, 508, 36, 'ウランの原子核', 'var(--fig-box3)')}
        {bar(548, 12, 36, '', 'var(--fig-box2)')}
        <T x={568} y={51} fs={11.5} tone="muted">
          中性子
        </T>
        <T x={40} y={108} fs={12.5} bold>
          分かれた後
        </T>
        {bar(40, 222, 122, '破片（バリウムなど）', 'var(--fig-box3)')}
        {bar(262, 222, 122, '破片（クリプトンなど）', 'var(--fig-box3)')}
        {bar(484, 12, 122, '', 'var(--fig-box2)')}
        {bar(496, 12, 122, '', 'var(--fig-box2)')}
        <line x1={496} y1={154} x2={496} y2={166} stroke="var(--fig-muted)" />
        <T x={496} y={176} anchor="middle" fs={11.5} tone="muted">
          中性子2個
        </T>
        <rect x={508} y={122} width={52} height={30} fill="none" stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="5 3" />
        <line x1={560} y1={34} x2={560} y2={158} stroke="var(--fig-muted)" strokeDasharray="2 3" />
        <T x={572} y={116} fs={12.5} tone="acc" bold>
          減った質量
        </T>
        <T x={572} y={134} fs={12} tone="acc">
          （陽子の約5分の1）
        </T>
        <T x={572} y={160} fs={12}>
          → 飛び離れる破片の
        </T>
        <T x={572} y={178} fs={12}>
          運動のエネルギーに
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図28-6 連鎖反応の広がり方（動・切り替え） ---------- */

type ChainOpt = 'low' | 'one' | 'high'
const CHAIN_COUNTS: Record<ChainOpt, number[]> = {
  low: [3, 2, 1, 1, 0, 0],
  one: [3, 3, 3, 3, 3, 3],
  high: [3, 4, 6, 8, 11, 16],
}
const GX = (g: number) => 110 + g * 100
const GEN_T = 0.9

interface ChainNode {
  x: number
  y: number
  parent: number
  lost: number
}

/** 世代ごとの核分裂の位置と、親とのつながり、失われた中性子の数を作る */
function buildChain(opt: ChainOpt): ChainNode[][] {
  const counts = CHAIN_COUNTS[opt]
  const r = rng(opt === 'low' ? 7 : opt === 'one' ? 11 : 23)
  const gens: ChainNode[][] = []
  counts.forEach((n, g) => {
    const s = Math.min(26, 200 / Math.max(1, n))
    gens.push(Array.from({ length: n }, (_, i) => ({ x: GX(g), y: 150 + (i - (n - 1) / 2) * s, parent: -1, lost: 0 })))
  })
  for (let g = 0; g < counts.length - 1; g++) {
    const parents = gens[g]
    const kids = gens[g + 1]
    const n = parents.length
    const base = n ? Math.floor(kids.length / n) : 0
    const extra = n ? kids.length % n : 0
    // 1個多く子を持つ親を、上下に散らして選ぶ
    const more = new Set(Array.from({ length: extra }, (_, j) => Math.floor(((j + 0.5) * n) / extra)))
    let k = 0
    parents.forEach((p, i) => {
      const m = base + (more.has(i) ? 1 : 0)
      p.lost = Math.max(m, r() < 0.45 ? 3 : 2) - m
      for (let j = 0; j < m; j++) kids[k++].parent = i
    })
  }
  return gens
}

const CHAINS: Record<ChainOpt, ChainNode[][]> = { low: buildChain('low'), one: buildChain('one'), high: buildChain('high') }

export function FigChain() {
  const [opt, setOpt] = useState<ChainOpt>('high')
  const gens = CHAINS[opt]
  const counts = CHAIN_COUNTS[opt]
  const verdict = { low: '→ 世代ごとに数が減り、連鎖反応はやがて止まる', one: '→ 数は変わらない（臨界）', high: '→ 世代ごとに数が増え続ける' }[opt]
  return (
    <Anim
      n="28-6"
      title="次の核分裂を起こす中性子が平均1個より多いと、連鎖反応は広がっていく"
      still={7.4}
      period={8.4}
      controls={
        <Choice
          label="次の核分裂を起こす中性子（1回の核分裂あたりの平均）"
          options={[
            { value: 'low', label: '1個より少ない' },
            { value: 'one', label: 'ちょうど1個' },
            { value: 'high', label: '1個より多い' },
          ]}
          value={opt}
          onChange={setOpt}
        />
      }
      caption="模式図です。丸は1回の核分裂、矢印は次の核分裂を起こした中性子、短い点線は外へ逃げたり、割れない原子核に吸収されたりした中性子です。どの場合も、1回の核分裂からは2〜3個の中性子が出ています。切り替えると、世代ごとの核分裂の数の変わり方が変わります。"
    >
      {(t) => (
        <Svg id="28-6" w={720} h={322} label="核分裂から出た中性子が次の核分裂を起こす様子を世代ごとに並べた図。次の核分裂を起こす中性子が平均1個より多いと数は増え続け、ちょうど1個なら一定、1個より少ないと減って止まる。">
          {gens.map((nodes, g) => {
            const appear = g * GEN_T
            const show = t >= appear - 0.6
            const grow = clamp01((t - (appear - 0.6)) / 0.6)
            return (
              <g key={g}>
                <T x={GX(g)} y={22} anchor="middle" fs={12} tone="muted">
                  {`第${g + 1}世代`}
                </T>
                {show &&
                  g > 0 &&
                  nodes.map((n, i) => {
                    const p = gens[g - 1][n.parent]
                    if (!p) return null
                    const ex = p.x + (n.x - p.x) * grow
                    const ey = p.y + (n.y - p.y) * grow
                    const len = Math.hypot(ex - p.x, ey - p.y)
                    if (len < 14) return null
                    const sx = p.x + ((ex - p.x) / len) * 8
                    const sy = p.y + ((ey - p.y) / len) * 8
                    const tx = ex - ((ex - p.x) / len) * (grow < 1 ? 0 : 8)
                    const ty = ey - ((ey - p.y) / len) * (grow < 1 ? 0 : 8)
                    return <Arrow key={`e${i}`} x1={sx} y1={sy} x2={tx} y2={ty} />
                  })}
                {show &&
                  g > 0 &&
                  gens[g - 1].map((p, i) =>
                    Array.from({ length: p.lost }, (_, j) => {
                      const ang = ((j % 2 ? 1 : -1) * (55 + 22 * Math.floor(j / 2)) * Math.PI) / 180
                      return (
                        <line
                          key={`l${i}-${j}`}
                          x1={p.x + Math.cos(ang) * 8}
                          y1={p.y + Math.sin(ang) * 8}
                          x2={p.x + Math.cos(ang) * (8 + 12 * grow)}
                          y2={p.y + Math.sin(ang) * (8 + 12 * grow)}
                          stroke="var(--fig-muted)"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                        />
                      )
                    }),
                  )}
                {t >= appear && nodes.map((n, i) => <circle key={`n${i}`} cx={n.x} cy={n.y} r={nodes.length > 8 ? 4.5 : 6.5} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />)}
                {t >= appear && (
                  <T x={GX(g)} y={282} anchor="middle" fs={13} bold>
                    {String(counts[g])}
                  </T>
                )}
              </g>
            )
          })}
          <T x={12} y={282} fs={11.5} tone="muted">
            核分裂の数
          </T>
          {t >= GEN_T * 5 && (
            <T x={GX(0) - 20} y={306} fs={12.5} tone="acc">
              {verdict}
            </T>
          )}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図28-7 制御棒を引き抜いていくと（動） ---------- */

const PILE_PHASES = [
  { t0: 0, k: 0.8, rod: 1 },
  { t0: 1, k: 0.9, rod: 0.8 },
  { t0: 3, k: 0.95, rod: 0.64 },
  { t0: 5, k: 0.975, rod: 0.52 },
  { t0: 7.5, k: 1.04, rod: 0.4 },
  { t0: 10, k: 0.7, rod: 1 },
]
const PILE_END = 12.5
const phaseAt = (t: number) => [...PILE_PHASES].reverse().find((p) => t >= p.t0) ?? PILE_PHASES[0]
/** 中性子の数の時間変化（外から入る中性子が一定のときの模式的な計算）。0.05秒ごと */
const PILE_N = (() => {
  const out: number[] = []
  let n = 5
  const dt = 0.005
  const tau = 0.05
  for (let i = 0; i <= PILE_END / dt; i++) {
    if (i % 10 === 0) out.push(n)
    const k = phaseAt(i * dt).k
    n += (((k - 1) * n + 1) / tau) * dt
  }
  return out
})()
const PILE_MAX = Math.max(...PILE_N)

export function FigPile() {
  const gx = (t: number) => 330 + (t / PILE_END) * 350
  // 縦軸は、数が2倍になるごとに同じ幅だけ上がる目盛り
  const g0 = 228
  const gy = (n: number) => 228 - (Math.log(n / 3) / Math.log(PILE_MAX / 3)) * 172
  return (
    <Anim n="28-7" title="制御棒を引き抜き、次の核分裂につながる中性子が平均1個を超えると、中性子の数は増え続ける" still={9.6} period={PILE_END}
      caption="シカゴ・パイル1号の実験の流れを表した模式図です。グラフの線は実際の記録ではなく、縦軸は数が2倍になるごとに同じ幅だけ上がるように描いています。1より小さい間は、制御棒を引き抜くたびに中性子の数が増えて、ある数で落ち着きます。1を超えると増え続け、制御棒を戻すと減ります。">
      {(t) => {
        const ph = phaseAt(t)
        const tip = 72 + ph.rod * 146
        const i = Math.min(PILE_N.length - 1, Math.floor(t / 0.05))
        const pts = PILE_N.slice(0, i + 1).map((n, j) => `${j ? 'L' : 'M'}${gx(j * 0.05).toFixed(1)},${gy(n).toFixed(1)}`).join(' ')
        return (
          <Svg id="28-7" w={720} h={286} label="左は黒鉛のブロックとウランの塊と制御棒の模式図。右は中性子の数のグラフ。制御棒を少しずつ引き抜くと数は増えてはある値で落ち着き、1を超えると増え続け、制御棒を戻すと減る。">
            <rect x={40} y={72} width={200} height={150} fill="var(--fig-box)" stroke="var(--fig-line)" />
            {Array.from({ length: 5 }, (_, r) =>
              Array.from({ length: 6 }, (_, c) => <rect key={`${r}-${c}`} x={52 + c * 31} y={84 + r * 28} width={9} height={9} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeWidth={0.8} />),
            )}
            <rect x={134} y={tip - 190} width={12} height={190} fill="var(--fig-line)" />
            <T x={154} y={40} fs={11.5}>
              制御棒（カドミウム）
            </T>
            <T x={154} y={56} fs={11.5} tone="muted">
              中性子を吸い取る
            </T>
            <T x={140} y={240} anchor="middle" fs={11.5}>
              黒鉛のブロック（中性子を遅くする）
            </T>
            <rect x={60} y={256} width={9} height={9} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeWidth={0.8} />
            <T x={76} y={261} fs={11.5}>
              ウランの塊
            </T>
            <line x1={gx(0)} y1={g0} x2={gx(PILE_END)} y2={g0} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={g0} x2={gx(0)} y2={46} stroke="var(--fig-line)" />
            <T x={gx(0)} y={34} fs={12}>
              中性子の数
            </T>
            <T x={gx(PILE_END) + 6} y={g0} fs={12}>
              時間
            </T>
            <path d={pts} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            <T x={342} y={68} fs={11.5}>
              1より小さい間は、引き抜くたびに増えて
            </T>
            <T x={342} y={86} fs={11.5}>
              ある数で落ち着く
            </T>
            {t >= 8.2 && (
              <T x={548} y={110} anchor="end" fs={12} tone="acc">
                1を超えると増え続ける
              </T>
            )}
            {[
              { a: 0, b: 7.5, s: '制御棒を少しずつ引き抜く' },
              { a: 7.5, b: 10, s: '1を超える' },
              { a: 10, b: PILE_END, s: '戻す' },
            ].map((p) => (
              <g key={p.s}>
                <path d={`M${gx(p.a) + 2},${g0 + 12} L${gx(p.a) + 2},${g0 + 18} L${gx(p.b) - 2},${g0 + 18} L${gx(p.b) - 2},${g0 + 12}`} fill="none" stroke="var(--fig-muted)" />
                <T x={(gx(p.a) + gx(p.b)) / 2} y={g0 + 34} anchor="middle" fs={11.5}>
                  {p.s}
                </T>
              </g>
            ))}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図28-8 亡命した物理学者の移動と年表 ---------- */

const EX = (y: number) => 150 + (y - 1931) * 36
const COUNTRY_FILL: Record<string, string> = {
  ドイツ: 'var(--fig-box)',
  イタリア: 'var(--fig-box)',
  イギリス: 'var(--fig-box2)',
  デンマーク: 'var(--fig-box4)',
  スウェーデン: 'var(--fig-box5)',
  アメリカ: 'var(--fig-box3)',
}
interface ExileRow {
  name: string
  segs: [number, number, string][]
  moves: { y: number; text: string; below?: boolean; end?: boolean }[]
  notes: { y: number; text: string; end?: boolean }[]
}
const EXILES: ExileRow[] = [
  { name: 'アインシュタイン', segs: [[1931, 1933, 'ドイツ'], [1933, 1946, 'アメリカ']], moves: [{ y: 1933, text: '1933年 アメリカへ' }], notes: [{ y: 1939.6, text: '1939年8月 手紙に署名' }] },
  { name: 'シラード', segs: [[1931, 1933.3, 'ドイツ'], [1933.3, 1938, 'イギリス'], [1938, 1946, 'アメリカ']], moves: [{ y: 1933.3, text: '1933年 イギリスへ' }, { y: 1938, text: '1938年 アメリカへ' }], notes: [{ y: 1939.6, text: '1939年 手紙をまとめる' }] },
  {
    name: 'フリッシュ',
    segs: [[1931, 1933.58, 'ドイツ'], [1933.58, 1934.5, 'イギリス'], [1934.5, 1939.5, 'デンマーク'], [1939.5, 1943.9, 'イギリス'], [1943.9, 1946, 'アメリカ']],
    moves: [{ y: 1933.58, text: '1933年 イギリスへ' }, { y: 1934.5, text: '1934年 デンマークへ', below: true }, { y: 1939.5, text: '1939年 イギリスへ' }, { y: 1943.9, text: '1943年 アメリカへ', below: true }],
    notes: [],
  },
  { name: 'マイトナー', segs: [[1931, 1938.55, 'ドイツ'], [1938.55, 1946, 'スウェーデン']], moves: [{ y: 1938.55, text: '1938年7月 スウェーデンへ' }], notes: [{ y: 1938.95, text: '1938年12月 核分裂の解釈' }] },
  { name: 'フェルミ', segs: [[1931, 1938.95, 'イタリア'], [1938.95, 1946, 'アメリカ']], moves: [{ y: 1938.95, text: '1938年12月 アメリカへ' }], notes: [{ y: 1942.92, text: '1942年12月 最初の原子炉', end: true }] },
]

export function FigExile() {
  return (
    <Figure n="28-8" title="1933年から1938年にかけて、多くの物理学者がドイツとイタリアを離れた"
      caption="各人がいた国を、時間の順に帯で並べた模式図です。帯の区切りが国を移った時期で、上の文字が移った先、下の青い文字がこの章で扱う出来事です。フェルミはノーベル賞の授賞式のためスウェーデンに立ち寄ってから、アメリカへ渡りました。">
      <Svg id="28-8" w={720} h={352} label="アインシュタインは1933年にアメリカへ、シラードは1933年にイギリス、1938年にアメリカへ、フリッシュは1933年にイギリス、1934年にデンマーク、1939年にイギリス、1943年にアメリカへ、マイトナーは1938年7月にスウェーデンへ、フェルミは1938年12月にアメリカへ移った。">
        <line x1={EX(1931)} y1={80} x2={EX(1946)} y2={80} stroke="var(--fig-line)" />
        {Array.from({ length: 16 }, (_, k) => 1931 + k).map((y) => (
          <line key={y} x1={EX(y)} y1={80} x2={EX(y)} y2={y % 2 === 0 ? 87 : 84} stroke="var(--fig-line)" />
        ))}
        {[1932, 1934, 1936, 1938, 1940, 1942, 1944, 1946].map((y) => (
          <T key={y} x={EX(y)} y={98} anchor="middle" fs={11.5} tone="muted">
            {`${y}年`}
          </T>
        ))}
        {[
          { y: 1933.08, a: '1933年1月', b: 'ナチス政権ができる' },
          { y: 1938.2, a: '1938年', b: 'ドイツがオーストリアを併合' },
        ].map((e) => (
          <g key={e.a}>
            <path d={`M${EX(e.y)},74 L${EX(e.y) - 5},64 L${EX(e.y) + 5},64 Z`} fill="var(--fig-line)" />
            <T x={EX(e.y) + 8} y={26} fs={11.5}>
              {e.a}
            </T>
            <T x={EX(e.y) + 8} y={44} fs={11.5}>
              {e.b}
            </T>
          </g>
        ))}
        {EXILES.map((row, i) => {
          const y = 132 + i * 48
          return (
            <g key={row.name}>
              <T x={12} y={y} fs={12.5} bold>
                {row.name}
              </T>
              {row.segs.map(([a, b, c]) => (
                <rect key={`${a}`} x={EX(a)} y={y - 5} width={EX(b) - EX(a)} height={10} fill={COUNTRY_FILL[c]} stroke="var(--fig-line)" strokeWidth={0.8} />
              ))}
              <T x={EX(1931) + 2} y={y - 15} fs={11.5} tone="muted">
                {row.segs[0][2]}
              </T>
              {row.moves.map((m) => (
                <g key={m.text}>
                  <circle cx={EX(m.y)} cy={y} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
                  <T x={m.end ? EX(m.y) - 4 : EX(m.y) + 3} y={m.below ? y + 17 : y - 15} anchor={m.end ? 'end' : 'start'} fs={11.5}>
                    {m.text}
                  </T>
                </g>
              ))}
              {row.notes.map((m) => (
                <g key={m.text}>
                  <circle cx={EX(m.y)} cy={y} r={4} fill="var(--fig-accent)" />
                  <T x={m.end ? EX(m.y) + 60 : EX(m.y) + 3} y={y + 17} anchor={m.end ? 'end' : 'start'} fs={11.5} tone="acc">
                    {m.text}
                  </T>
                </g>
              ))}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図28-9 手紙から広島・長崎までの年表 ---------- */

const ROAD28 = [
  { y: '1939年1月', what: ['ボーアが核分裂の', '知らせをアメリカへ'] },
  { y: '1939年8月', what: ['アインシュタインの', '手紙'] },
  { y: '1939年10月', what: ['大統領に伝わり、', 'ウランの委員会'] },
  { y: '1942年秋', what: ['マンハッタン計画', 'が本格的に始まる'] },
  { y: '1942年12月', what: ['最初の原子炉', '（シカゴ・パイル1号）'] },
  { y: '1943年', what: ['ロスアラモス研究所', '（所長オッペンハイマー）'] },
  { y: '1945年7月16日', what: ['トリニティ実験'] },
  { y: '1945年8月', what: ['6日 広島', '9日 長崎'] },
]

export function FigRoad28() {
  return (
    <Figure n="28-9" title="核分裂の知らせがアメリカに届いてから、広島と長崎への原子爆弾の投下までは約6年半だった" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="28-9" w={720} h={224} label="1939年1月にボーアが核分裂の知らせをアメリカへ伝え、8月にアインシュタインの手紙、10月にウランの委員会。1942年秋にマンハッタン計画が本格的に始まり、12月に最初の原子炉。1943年にロスアラモス研究所。1945年7月16日にトリニティ実験、8月6日に広島、9日に長崎に原子爆弾が投下された。">
        <Arrow x1={14} y1={112} x2={710} y2={112} />
        {ROAD28.map((r, i) => {
          const x = 56 + i * 87
          const up = i % 2 === 0
          const ty = up ? 22 : 140
          const last = i === ROAD28.length - 1
          return (
            <g key={r.y}>
              <circle cx={x} cy={112} r={6} fill={last ? 'var(--fig-line)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 82 : 118} x2={x} y2={up ? 106 : 128} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold fs={12.5}>
                {r.y}
              </T>
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + 20 + j * 18} anchor="middle" fs={12}>
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

/* ---------- 図28-10 粒子1個あたりの結びつきの強さ ---------- */

/** 原子核を液体の滴と考えた式で計算した、粒子1個あたりの結びつきの強さ（単位は MeV、図の中には数字を出さない） */
function bindingPerNucleon(a: number) {
  const z = a / (2 + 0.015 * a ** (2 / 3))
  const b = 15.75 * a - 17.8 * a ** (2 / 3) - (0.711 * z * z) / a ** (1 / 3) - (23.7 * (a - 2 * z) ** 2) / a
  return b / a
}
const BX = (a: number) => 70 + a * 2.3
const BY = (b: number) => 220 - (b - 4) * 34

export function FigBinding() {
  const curve = Array.from({ length: 123 }, (_, i) => 6 + i * 2)
    .map((a, i) => `${i ? 'L' : 'M'}${BX(a).toFixed(1)},${BY(bindingPerNucleon(a)).toFixed(1)}`)
    .join(' ')
  const p = (a: number, up = 0) => [BX(a), BY(bindingPerNucleon(a)) - up] as const
  const [ux, uy] = p(236)
  const [f1x, f1y] = p(140, 16)
  const [f2x, f2y] = p(94, 16)
  const [lx, ly] = p(8)
  const [mx, my] = p(34, 16)
  const [px, py] = p(56)
  return (
    <Figure n="28-10" title="原子核の中の粒子1個あたりの結びつきは、鉄のあたりで最も強い"
      caption="模式図で、縦軸の目盛りは省いています。曲線は原子核を液体の滴と考えた式で計算した大まかな形です。重い原子核は割れると、軽い原子核はくっつくと、結びつきの強い中くらいの原子核に近づき、その差の分の質量がエネルギーとして出ます（青の矢印）。">
      <Svg id="28-10" w={720} h={268} label="横軸は原子核の中の陽子と中性子の数、縦軸は粒子1個あたりの結びつきの強さ。軽い原子核では弱く、鉄のあたりで最も強く、ウランのような重い原子核では少し弱くなる。重い原子核が割れる核分裂と、軽い原子核がくっつく核融合は、どちらも結びつきの強い方へ向かう。">
        <line x1={BX(0)} y1={BY(4)} x2={BX(250)} y2={BY(4)} stroke="var(--fig-line)" />
        <line x1={BX(0)} y1={BY(4)} x2={BX(0)} y2={34} stroke="var(--fig-line)" />
        {[0, 50, 100, 150, 200, 250].map((a) => (
          <g key={a}>
            <line x1={BX(a)} y1={BY(4)} x2={BX(a)} y2={BY(4) + 5} stroke="var(--fig-line)" />
            <T x={BX(a)} y={BY(4) + 16} anchor="middle" fs={11.5} tone="muted">
              {a}
            </T>
          </g>
        ))}
        <T x={BX(250)} y={BY(4) + 36} anchor="end" fs={11.5}>
          原子核の中の陽子と中性子の数
        </T>
        <T x={BX(0) + 8} y={22} fs={12}>
          粒子1個あたりの結びつきの強さ（強いほど上）
        </T>
        <path d={curve} fill="none" stroke="var(--fig-line)" strokeWidth={2.5} />
        <circle cx={px} cy={py} r={5} fill="var(--fig-line)" />
        <T x={px + 10} y={py + 22} fs={12}>
          鉄のあたりで最も強い
        </T>
        <circle cx={ux} cy={uy} r={5} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
        <T x={ux} y={uy + 18} anchor="middle" fs={12}>
          ウラン
        </T>
        <Arrow x1={ux - 4} y1={uy - 10} x2={f1x} y2={f1y} accent />
        <Arrow x1={ux - 4} y1={uy - 12} x2={f2x} y2={f2y} accent />
        <T x={ux} y={uy + 44} anchor="end" fs={12} tone="acc">
          核分裂（この章）：重い原子核が2つに割れる
        </T>
        <circle cx={lx} cy={ly} r={4} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
        <Arrow x1={lx + 3} y1={ly - 10} x2={mx} y2={my} accent />
        <T x={lx + 12} y={ly + 4} fs={12}>
          軽い原子核
        </T>
        <T x={lx + 12} y={ly + 30} fs={12} tone="acc">
          核融合（第35章）：
        </T>
        <T x={lx + 12} y={ly + 48} fs={12} tone="acc">
          軽い原子核がくっつく
        </T>
      </Svg>
    </Figure>
  )
}
