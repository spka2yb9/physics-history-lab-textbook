import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { FIELDS, FieldIcon, fieldById, type FieldId } from '../content/fields'
import { Ball, Vel, clamp01, ease, rng, wave } from './common'

/*
 * 第37章の図。光（γ線）は第16・17・20章と同じく黄色で描き、必ず文字を添える。
 * 確かさの3段階は、本文の印（Level）と同じ形で描く：塗った丸＝確かめられている、半分の丸＝有力な仮説、点線の丸＝検証されていない候補。
 */

type Pt = [number, number]

/** 光の線の色（第20章と同じ） */
const BEAM = '#d99a00'

const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/** 銀河（小さな楕円） */
function Galaxy({ x, y, rot = 0, s = 1, opacity = 1 }: { x: number; y: number; rot?: number; s?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot})`} opacity={opacity}>
      <ellipse rx={8 * s} ry={4 * s} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1} />
      <circle r={1.8 * s} fill="var(--fig-line)" />
    </g>
  )
}

/* ---------- 図37-1 銀河団の銀河の速さ（動） ---------- */

const CLUSTER = (() => {
  const r = rng(3701)
  return Array.from({ length: 10 }, () => ({ r: 22 + r() * 70, a: r() * Math.PI * 2, dir: r() < 0.5 ? -1 : 1, rot: r() * 180 }))
})()
const CL_SPEED = 42 // 図の中の銀河の速さ（ピクセル毎秒）

function ClusterPanel({ cx, t, bound, clip }: { cx: number; t: number; bound: boolean; clip: string }) {
  const cy = 165
  return (
    <g clipPath={`url(#${clip})`}>
      <circle cx={cx} cy={cy} r={98} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 5" />
      {CLUSTER.map((g, i) => {
        const w = (g.dir * CL_SPEED) / g.r
        let x: number
        let y: number
        let tx: number
        let ty: number
        if (bound) {
          const a = g.a + w * t
          x = cx + g.r * Math.cos(a)
          y = cy + g.r * Math.sin(a)
          tx = -Math.sin(a) * g.dir
          ty = Math.cos(a) * g.dir
        } else {
          tx = -Math.sin(g.a) * g.dir
          ty = Math.cos(g.a) * g.dir
          // 見える物質の重力は弱いので、ほぼまっすぐ外へ飛んでいく（少しだけ外向きにずらして描く）
          x = cx + g.r * Math.cos(g.a) + tx * CL_SPEED * t + Math.cos(g.a) * 6 * t
          y = cy + g.r * Math.sin(g.a) + ty * CL_SPEED * t + Math.sin(g.a) * 6 * t
        }
        const d = Math.hypot(x - cx, y - cy)
        const op = bound ? 1 : clamp01((175 - d) / 40)
        const inside = (px: number, py: number) => Math.abs(px - cx) < 165 && py > 62 && py < 258
        if (!inside(x, y) || !inside(x + tx * 30, y + ty * 30)) return null
        return (
          <g key={i} opacity={op}>
            <Galaxy x={x} y={y} rot={g.rot} />
            <Vel x1={x + tx * 10} y1={y + ty * 10} x2={x + tx * 30} y2={y + ty * 30} />
          </g>
        )
      })}
    </g>
  )
}

export function FigCluster() {
  return (
    <Anim
      n="37-1"
      title="見えている物質の重力だけでは、銀河団は速い銀河を引き留められない"
      still={1.3}
      period={6}
      caption="模式図です。黒の矢印は銀河の速さと向きを表します。左は光で見える星の質量だけから重力を計算した場合で、速く動く銀河は銀河団から飛び出していきます。右の実際の銀河団では、銀河は速く動きながらもまとまっています。ツビッキーはこの差から光らない質量があると考えました。"
    >
      {(t) => (
        <Svg id="37-1" w={720} h={300} label="左：見える物質の重力だけなら、速く動く銀河は銀河団から飛び出していく。右：実際の銀河団では、銀河は速く動いてもまとまったままである。">
          <defs>
            <clipPath id="c37-1a">
              <rect x={10} y={56} width={340} height={206} />
            </clipPath>
            <clipPath id="c37-1b">
              <rect x={370} y={56} width={340} height={206} />
            </clipPath>
          </defs>
          <line x1={360} y1={14} x2={360} y2={290} stroke="var(--fig-muted)" strokeDasharray="2 4" />
          <T x={180} y={24} anchor="middle" bold>
            見える物質の重力だけなら
          </T>
          <T x={180} y={44} anchor="middle" fs={12} tone="muted">
            （ツビッキーの計算）
          </T>
          <T x={540} y={24} anchor="middle" bold>
            実際の銀河団
          </T>
          <T x={540} y={44} anchor="middle" fs={12} tone="muted">
            （観測された姿）
          </T>
          <ClusterPanel cx={180} t={t} bound={false} clip="c37-1a" />
          <ClusterPanel cx={540} t={t} bound clip="c37-1b" />
          <T x={180} y={282} anchor="middle" fs={12.5} tone="danger">
            引き留められず、散らばっていくはず
          </T>
          <T x={540} y={282} anchor="middle" fs={12.5} tone="acc">
            速く動いても、まとまったまま
          </T>
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図37-2 銀河の回転の速さ（動・切り替え） ---------- */

const RINGS = [34, 62, 90, 118]
const R_OUT = 118
/** 見える物質だけで予想した速さ（中心からの距離は外側の星を1とした値） */
function vPred(x: number) {
  const s = 0.12
  const m = 1 - (1 + x / s) * Math.exp(-x / s)
  return Math.sqrt(m / Math.max(x, 1e-3))
}
/** 観測に合う速さ（見えない質量の分を足す） */
function vObs(x: number) {
  const c = 0.25
  const halo = 1.35 * 1.35 * (1 - (c / Math.max(x, 1e-3)) * Math.atan(x / c))
  return Math.sqrt(vPred(x) ** 2 + halo)
}

export function FigRotation() {
  const [mode, setMode] = useState<'obs' | 'pred'>('obs')
  const v = mode === 'obs' ? vObs : vPred
  const cx = 165
  const cy = 150
  // グラフ
  const gx = (x: number) => 380 + (x / 1.15) * 290
  const gy = (u: number) => 250 - (u / 1.8) * 190
  const curve = (f: (x: number) => number) => poly(Array.from({ length: 70 }, (_, i) => 0.02 + (i / 69) * 1.13).map((x) => [gx(x), gy(f(x))] as Pt))
  return (
    <Anim
      n="37-2"
      title="銀河の外側の星は、見える物質から予想したより速く回っている"
      still={3}
      period={40}
      controls={
        <Choice
          label="左の図の星の速さ"
          options={[
            { value: 'obs', label: '実際の観測' },
            { value: 'pred', label: '見える物質だけで予想' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="模式図です。左は渦巻銀河を真上から見た図で、黒の矢印は星やガスの雲の速さを表します。「見える物質だけで予想」を選ぶと、外側の星ほどゆっくり回ります。右のグラフの点線が予想、実線が観測で、外側でも速さがほとんど落ちません。"
    >
      {(t) => (
        <Svg id="37-2" w={720} h={300} label="渦巻銀河の星が回る速さ。見える物質だけで予想すると外側ほど遅くなるが、実際の観測では外側でも速さがほとんど変わらない。">
          {/* 銀河の明るい部分 */}
          <circle cx={cx} cy={cy} r={128} fill="var(--fig-box3)" opacity={0.35} />
          <circle cx={cx} cy={cy} r={75} fill="var(--fig-box3)" opacity={0.6} />
          <circle cx={cx} cy={cy} r={38} fill="var(--fig-box2)" opacity={0.9} />
          {RINGS.map((r, i) => {
            const x = r / R_OUT
            const w = (0.11 * v(x)) / x
            const len = 22 * v(x)
            return (
              <g key={r}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--fig-muted)" strokeDasharray="2 4" />
                {[0, Math.PI].map((ph) => {
                  const a = -Math.PI / 2 + i * 1.3 + ph + w * t
                  const sx = cx + r * Math.cos(a)
                  const sy = cy + r * Math.sin(a)
                  return (
                    <g key={ph}>
                      <Vel x1={sx} y1={sy} x2={sx - Math.sin(a) * len} y2={sy + Math.cos(a) * len} />
                      <Ball x={sx} y={sy} r={5} />
                    </g>
                  )
                })}
              </g>
            )
          })}
          <T x={cx} y={290} anchor="middle" fs={12} tone="muted">
            渦巻銀河を真上から見た図
          </T>
          {/* グラフ */}
          <rect x={gx(0)} y={gy(1.8)} width={gx(0.4) - gx(0)} height={gy(0) - gy(1.8)} fill="var(--fig-box2)" opacity={0.45} />
          <T x={gx(0.2)} y={gy(0) - 12} anchor="middle" fs={11.5} tone="muted">
            明るく光る範囲
          </T>
          <Arrow x1={gx(0)} y1={gy(0)} x2={gx(1.15) + 16} y2={gy(0)} />
          <Arrow x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(1.8) - 12} />
          <T x={gx(1.15) + 4} y={gy(0) + 18} anchor="end" fs={12}>
            中心からの距離
          </T>
          <T x={gx(0) + 8} y={gy(1.8) - 14} fs={12}>
            回る速さ
          </T>
          <path d={curve(vObs)} fill="none" stroke="var(--fig-accent)" strokeWidth={mode === 'obs' ? 3 : 1.8} />
          <path d={curve(vPred)} fill="none" stroke="var(--fig-line)" strokeWidth={mode === 'pred' ? 2.6 : 1.5} strokeDasharray="6 4" />
          <T x={gx(1.15)} y={gy(1.8) + 4} anchor="end" fs={12} tone="acc">
            実際の観測（ほぼ一定）
          </T>
          <T x={gx(1.15)} y={gy(vPred(1.15)) + 20} anchor="end" fs={12}>
            見える物質だけで予想
          </T>
          {RINGS.map((r) => {
            const x = r / R_OUT
            return <circle key={r} cx={gx(x)} cy={gy(v(x))} r={4.5} fill={mode === 'obs' ? 'var(--fig-accent)' : 'var(--fig-line)'} />
          })}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図37-3 弾丸銀河団（動） ---------- */

const DOTS_A = (() => {
  const r = rng(3731)
  return Array.from({ length: 11 }, () => [(r() - 0.5) * 100, (r() - 0.5) * 70] as Pt)
})()
const DOTS_B = (() => {
  const r = rng(3732)
  return Array.from({ length: 6 }, () => [(r() - 0.5) * 60, (r() - 0.5) * 44] as Pt)
})()

export function FigBullet() {
  const cy = 165
  return (
    <Anim
      n="37-3"
      title="衝突した銀河団では、質量の中心とガスの位置が分かれた"
      still={6}
      period={8.5}
      caption="弾丸銀河団（1E 0657-56）の衝突を簡単にした模式図です。大きさと位置は目安です。通常の物質の大部分を占める高温のガスは、ぶつかり合って速さが落ち、真ん中に残ります。重力レンズで求めた質量（点線の楕円）は、銀河と一緒にすれ違って先へ進みました。"
    >
      {(t) => {
        const u = clamp01(t / 5)
        const mA = 500 - 290 * u
        const mB = 140 + 405 * u
        const lag = ease((u - 0.32) / 0.68)
        const gA = mA + 110 * lag
        const gB = mB - 125 * lag
        const done = t >= 5.2
        const start = t < 1.4
        return (
          <Svg id="37-3" w={720} h={300} label="2つの銀河団が衝突する。高温のガスは真ん中に取り残され、重力レンズで求めた質量の中心は銀河と一緒に外側へ進む。">
            {/* 凡例 */}
            <ellipse cx={34} cy={24} rx={16} ry={10} fill="none" stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="5 4" />
            <T x={58} y={24} fs={12}>
              重力レンズで求めた質量
            </T>
            <ellipse cx={252} cy={24} rx={16} ry={10} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={276} y={24} fs={12}>
              高温のガス（X線で見える）
            </T>
            <Galaxy x={502} y={24} />
            <T x={518} y={24} fs={12}>
              銀河
            </T>
            {/* ガス */}
            <ellipse cx={gA} cy={cy} rx={56} ry={42} fill="var(--fig-box2)" stroke="var(--fig-line)" opacity={0.9} />
            <ellipse cx={gB} cy={cy + 4} rx={36} ry={27} fill="var(--fig-box2)" stroke="var(--fig-line)" opacity={0.9} />
            {/* 銀河 */}
            {DOTS_A.map(([dx, dy], i) => (
              <Galaxy key={`a${i}`} x={mA + dx} y={cy + dy} s={0.8} rot={i * 37} />
            ))}
            {DOTS_B.map(([dx, dy], i) => (
              <Galaxy key={`b${i}`} x={mB + dx} y={cy + 4 + dy} s={0.8} rot={i * 53} />
            ))}
            {/* 質量 */}
            <ellipse cx={mA} cy={cy} rx={72} ry={56} fill="none" stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="6 4" />
            <ellipse cx={mB} cy={cy + 4} rx={46} ry={36} fill="none" stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="6 4" />
            {start && (
              <>
                <T x={mA} y={92} anchor="middle" fs={12}>
                  大きい銀河団
                </T>
                <T x={mB} y={110} anchor="middle" fs={12}>
                  小さい銀河団
                </T>
                <Vel x1={mA - 20} y1={250} x2={mA - 60} y2={250} />
                <Vel x1={mB + 20} y1={250} x2={mB + 60} y2={250} />
              </>
            )}
            {done && (
              <>
                <T x={mA} y={92} anchor="middle" fs={12} tone="acc">
                  質量の中心
                </T>
                <T x={mB} y={110} anchor="middle" fs={12} tone="acc">
                  質量の中心
                </T>
                <T x={(gA + gB) / 2} y={238} anchor="middle" fs={12}>
                  ガスは真ん中に取り残される
                </T>
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 宇宙の大きさの計算（図37-4、図37-6） ---------- */

const OM = 0.315
const OL = 0.685
const HUB = 14.507 // ハッブル定数（Planck 2018 の 67.4）の逆数。時間は10億年単位
const A0 = Math.cbrt(OM / OL)
/** 宇宙項のある宇宙の大きさ（今を1）。時間は10億年単位 */
const aL = (t: number) => A0 * Math.pow(Math.sinh(1.5 * Math.sqrt(OL) * (t / HUB)), 2 / 3)
/** 大きさから時間へ */
const tOfA = (a: number) => (HUB / (1.5 * Math.sqrt(OL))) * Math.asinh(Math.pow(a / A0, 1.5))
const AGE = tOfA(1)
/** 物質だけの宇宙（今の大きさと今の膨張の速さをそろえたもの） */
const T_EDS = (2 / 3) * HUB
const aM = (t: number) => (t <= AGE - T_EDS ? 0 : Math.pow((t - (AGE - T_EDS)) / T_EDS, 2 / 3))
/** 減速から加速に変わるときの大きさと時間 */
const A_TURN = Math.cbrt(OM / (2 * OL))
const T_TURN = tOfA(A_TURN)

/* ---------- 図37-4 減速から加速へ（動） ---------- */

export function FigExpansion() {
  const TMAX = 20
  const gx = (t: number) => 70 + (t / TMAX) * 400
  const gy = (a: number) => 250 - (a / 1.6) * 205
  const path = (f: (t: number) => number, t0: number, t1: number) =>
    poly(Array.from({ length: 80 }, (_, i) => t0 + ((t1 - t0) * i) / 79).map((t) => [gx(t), gy(f(t))] as Pt))
  return (
    <Anim
      n="37-4"
      title="宇宙の膨張は、途中で減速から加速に変わった"
      still={6}
      period={9}
      caption="模式図です。縦は2つの銀河の間の距離（宇宙の大きさ）で、今の距離を1としています。実線は Planck 衛星の2018年の値を使った、暗黒エネルギーのある宇宙です。点線は物質の重力だけの宇宙で、今の大きさと今の膨張の速さを実線とそろえています。現在より右は今の考えにもとづく見通しです。"
    >
      {(t) => {
        const tc = Math.min(t / 5, 1) * AGE
        const a = aL(tc)
        const sep = 150 * a
        return (
          <Svg id="37-4" w={700} h={300} label="宇宙の大きさの時間変化。暗黒エネルギーのある宇宙では、はじめ減速していた膨張が途中から加速に変わる。物質の重力だけの宇宙では減速し続ける。">
            <Arrow x1={gx(0)} y1={gy(0)} x2={gx(TMAX) + 12} y2={gy(0)} />
            <Arrow x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(1.6) - 8} />
            <T x={gx(0) + 8} y={gy(1.6) - 10} fs={12}>
              銀河の間の距離（今を1とする）
            </T>
            <T x={gx(TMAX) + 10} y={gy(0) + 20} anchor="end" fs={12}>
              時間
            </T>
            <T x={gx(0)} y={gy(0) + 20} anchor="middle" fs={12}>
              ビッグバン
            </T>
            <line x1={gx(AGE)} y1={gy(0)} x2={gx(AGE)} y2={gy(1.45)} stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <T x={gx(AGE)} y={gy(0) + 20} anchor="middle" fs={12}>
              現在
            </T>
            <line x1={gx(0) - 4} y1={gy(1)} x2={gx(0) + 4} y2={gy(1)} stroke="var(--fig-line)" />
            <T x={gx(0) - 8} y={gy(1)} anchor="end" fs={12}>
              1
            </T>
            <path d={path(aM, AGE - T_EDS, TMAX)} fill="none" stroke="var(--fig-line)" strokeWidth={1.6} strokeDasharray="6 4" />
            <path d={path(aL, 0.05, TMAX)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.6} />
            <circle cx={gx(T_TURN)} cy={gy(A_TURN)} r={5} fill="var(--fig-bg)" stroke="var(--fig-accent)" strokeWidth={2} />
            <T x={gx(T_TURN) - 10} y={gy(A_TURN) - 16} anchor="end" fs={12} tone="acc">
              ここで減速から加速へ
            </T>
            <T x={gx(TMAX)} y={gy(aL(TMAX)) - 16} anchor="end" fs={12} tone="acc">
              暗黒エネルギーあり
            </T>
            <line x1={440} y1={128} x2={440} y2={gy(aM(18.5)) + 6} stroke="var(--fig-muted)" />
            <T x={gx(TMAX)} y={140} anchor="end" fs={12}>
              物質の重力だけ
            </T>
            <T x={gx(TMAX)} y={157} anchor="end" fs={12}>
              （減速し続ける）
            </T>
            <circle cx={gx(tc)} cy={gy(a)} r={6} fill="var(--fig-accent)" />
            {/* 右：2つの銀河 */}
            <T x={600} y={70} anchor="middle" fs={12.5} bold>
              {`ビッグバンから${Math.round(tc * 10)}億年`}
            </T>
            <Galaxy x={600 - sep / 2} y={140} s={1.5} />
            <Galaxy x={600 + sep / 2} y={140} s={1.5} rot={30} />
            {sep > 30 && <Arrow x1={600 - sep / 2 + 14} y1={170} x2={600 + sep / 2 - 14} y2={170} both />}
            <T x={600} y={196} anchor="middle" fs={12} tone="muted">
              2つの銀河の間の距離
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図37-5 宇宙の中身の割合 ---------- */

const SHARES = [
  { name: '通常の物質', pct: '約4.9%', note: '原子でできた星・ガス・惑星など', n: 5, fill: 'var(--fig-box4)', mark: 'dot' },
  { name: '暗黒物質', pct: '約26.4%', note: '光を出さず、重力で存在が分かる', n: 26, fill: 'var(--fig-box5)', mark: 'slash' },
  { name: '暗黒エネルギー', pct: '約68.5%', note: '膨張を加速させているもの', n: 69, fill: 'var(--fig-box3)', mark: 'none' },
] as const

function Cell({ x, y, s, kind }: { x: number; y: number; s: number; kind: (typeof SHARES)[number] }) {
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx={2} fill={kind.fill} stroke="var(--fig-line)" strokeWidth={0.8} />
      {kind.mark === 'dot' && <circle cx={x + s / 2} cy={y + s / 2} r={3} fill="var(--fig-line)" />}
      {kind.mark === 'slash' && <line x1={x + 4} y1={y + s - 4} x2={x + s - 4} y2={y + 4} stroke="var(--fig-line)" strokeWidth={1.2} />}
    </g>
  )
}

export function FigContents() {
  const s = 20
  const gap = 2
  const kinds = SHARES.flatMap((p) => Array.from({ length: p.n }, () => p))
  return (
    <Figure n="37-5" title="今の宇宙の中身の割合（Planck 衛星、2018年）" caption="1マスが全体の約1%です。マスの数は四捨五入した値で、合計が100%に足りない分（約0.2%）はニュートリノなどです。光で見える星やガスは、左下の「通常の物質」の中に含まれます。">
      <Svg id="37-5" w={640} h={260} label="今の宇宙の中身。通常の物質は約4.9%、暗黒物質は約26.4%、暗黒エネルギーは約68.5%。">
        {kinds.map((k, i) => {
          const col = i % 10
          const row = 9 - Math.floor(i / 10)
          return <Cell key={i} x={24 + col * (s + gap)} y={20 + row * (s + gap)} s={s} kind={k} />
        })}
        {SHARES.map((p, i) => {
          const y = 52 + i * 66
          return (
            <g key={p.name}>
              <Cell x={290} y={y - 10} s={s} kind={p} />
              <T x={322} y={y} bold>
                {`${p.name}  ${p.pct}`}
              </T>
              <T x={322} y={y + 22} fs={12} tone="muted">
                {p.note}
              </T>
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図37-6 暗黒エネルギーの強さの変わり方 ---------- */

/** DESI の2025年の解析（DESI＋宇宙背景放射＋DES の超新星）で最もよく合う値 */
const W0 = -0.752
const WA = -0.86
const rhoDE = (a: number) => Math.pow(a, -3 * (1 + W0 + WA)) * Math.exp(-3 * WA * (1 - a))

export function FigDarkEnergy() {
  const LB = 11.5 // 図の左端（10億年前の単位）
  const gx = (lookback: number) => 640 - (lookback / LB) * 520
  const gy = (r: number) => 240 - ((r - 0.4) / 0.85) * 180
  const pts: Pt[] = Array.from({ length: 90 }, (_, i) => 0.24 + (0.76 * i) / 89)
    .map((a) => [AGE - tOfA(a), rhoDE(a)] as Pt)
    .filter(([lb]) => lb <= LB)
    .map(([lb, r]) => [gx(lb), gy(r)] as Pt)
  // 最も強い時期
  let peak: Pt = pts[0]
  for (const p of pts) if (p[1] < peak[1]) peak = p
  return (
    <Figure
      n="37-6"
      title="DESI の解析が示した、暗黒エネルギーが弱まっている可能性"
      caption="模式図です。縦は同じ体積あたりの暗黒エネルギーの強さを、今の強さを基準にして表します。宇宙項なら強さは変わりません（点線）。実線は DESI の2025年の解析で、宇宙背景放射と超新星の観測を合わせたときに最もよく合った形の一つです。形は使うデータと解析の方法で変わり、誤差の幅も大きく、確かめられてはいません。"
    >
      <Svg id="37-6" w={680} h={290} label="暗黒エネルギーの強さの時間変化。宇宙項なら一定。DESI の解析で最もよく合った形では、数十億年前に最も強く、その後少しずつ弱まっている。">
        <Arrow x1={gx(LB)} y1={gy(0.4)} x2={gx(0) + 20} y2={gy(0.4)} />
        <Arrow x1={gx(LB)} y1={gy(0.4)} x2={gx(LB)} y2={gy(1.25) - 6} />
        <T x={gx(LB) + 8} y={gy(1.25) - 8} fs={12}>
          暗黒エネルギーの強さ（同じ体積あたり）
        </T>
        {[10, 5, 0].map((lb) => (
          <g key={lb}>
            <line x1={gx(lb)} y1={gy(0.4)} x2={gx(lb)} y2={gy(0.4) + 5} stroke="var(--fig-line)" />
            <T x={gx(lb)} y={gy(0.4) + 18} anchor="middle" fs={12}>
              {lb === 0 ? '現在' : `${lb * 10}億年前`}
            </T>
          </g>
        ))}
        <line x1={gx(LB)} y1={gy(1)} x2={gx(0)} y2={gy(1)} stroke="var(--fig-line)" strokeWidth={1.6} strokeDasharray="6 4" />
        <T x={gx(LB) + 10} y={gy(1) - 14} fs={12}>
          宇宙項（強さは変わらない）
        </T>
        <path d={poly(pts)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.6} />
        <circle cx={peak[0]} cy={peak[1]} r={4.5} fill="var(--fig-accent)" />
        <T x={peak[0]} y={peak[1] - 16} anchor="middle" fs={12} tone="acc">
          最も強い時期
        </T>
        <T x={gx(0) - 6} y={gy(1) + 22} anchor="end" fs={12} tone="acc">
          今は弱まりつつある
        </T>
        <T x={gx(8.6)} y={gy(rhoDE(0.36)) + 24} fs={12} tone="acc">
          DESI の解析で最もよく合った形
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図37-7 ハッブル定数の食い違い ---------- */

const H0S = [
  { lines: ['宇宙背景放射から計算', '（Planck、2018年）'], v: 67.4, lo: 0.5, hi: 0.5, tone: 'early' },
  { lines: ['赤色巨星で距離を測る', '（CCHP、2025年）'], v: 70.39, lo: 1.94, hi: 1.94, tone: 'mid' },
  { lines: ['セファイド変光星で距離を測る', '（SH0ES、2022年）'], v: 73.04, lo: 1.04, hi: 1.04, tone: 'late' },
]

export function FigHubble() {
  const gx = (v: number) => 260 + ((v - 64) / 12) * 390
  return (
    <Figure
      n="37-7"
      title="ハッブル定数は、測り方によって値が食い違っている"
      caption="点が測定の値、横の線が誤差の範囲（3回に2回ほどはこの範囲に入るという幅）です。縦の帯は Planck と SH0ES の誤差の範囲を上下に伸ばしたものです。CCHP の値は別々の誤差をまとめた幅で描いています。"
    >
      <Svg id="37-7" w={680} h={250} label="ハッブル定数の測定値。宇宙背景放射からの計算は約67.4、赤色巨星を使った測定は約70.4、セファイド変光星を使った測定は約73.0で、最初と最後は誤差の範囲が重ならない。">
        <rect x={gx(66.9)} y={34} width={gx(67.9) - gx(66.9)} height={156} fill="var(--fig-box3)" opacity={0.8} />
        <rect x={gx(72.0)} y={34} width={gx(74.08) - gx(72.0)} height={156} fill="var(--fig-box2)" opacity={0.8} />
        <T x={gx(67.4)} y={20} anchor="middle" fs={12} tone="muted">
          Planck の範囲
        </T>
        <T x={gx(73.04)} y={20} anchor="middle" fs={12} tone="muted">
          SH0ES の範囲
        </T>
        {H0S.map((h, i) => {
          const y = 62 + i * 50
          return (
            <g key={h.v}>
              <T x={14} y={y - 8} fs={12.5}>
                {h.lines[0]}
              </T>
              <T x={14} y={y + 10} fs={12} tone="muted">
                {h.lines[1]}
              </T>
              <line x1={gx(h.v - h.lo)} y1={y} x2={gx(h.v + h.hi)} y2={y} stroke="var(--fig-line)" strokeWidth={2} />
              <line x1={gx(h.v - h.lo)} y1={y - 6} x2={gx(h.v - h.lo)} y2={y + 6} stroke="var(--fig-line)" strokeWidth={2} />
              <line x1={gx(h.v + h.hi)} y1={y - 6} x2={gx(h.v + h.hi)} y2={y + 6} stroke="var(--fig-line)" strokeWidth={2} />
              <Ball x={gx(h.v)} y={y} r={6} fill={h.tone === 'early' ? 'var(--fig-accent)' : h.tone === 'late' ? 'var(--fig-line)' : 'var(--fig-bg)'} />
              <T x={gx(h.v + h.hi) + 10} y={y} fs={12.5} bold>
                {h.v.toFixed(1)}
              </T>
            </g>
          )
        })}
        <line x1={gx(64)} y1={190} x2={gx(76)} y2={190} stroke="var(--fig-line)" />
        {[64, 66, 68, 70, 72, 74, 76].map((v) => (
          <g key={v}>
            <line x1={gx(v)} y1={190} x2={gx(v)} y2={196} stroke="var(--fig-line)" />
            <T x={gx(v)} y={208} anchor="middle" fs={12}>
              {v}
            </T>
          </g>
        ))}
        <T x={gx(70)} y={232} anchor="middle" fs={12}>
          326万光年離れるごとに増える、遠ざかる速さ（毎秒km）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図37-8 粒子と反粒子が消え、わずかな物質が残る（動） ---------- */

const PAIRS = (() => {
  const r = rng(3781)
  const out: { p: Pt; q: Pt; ang: number; t0: number }[] = []
  const cells: Pt[] = [
    [90, 110], [210, 100], [330, 112], [450, 104],
    [130, 178], [250, 184], [370, 174], [480, 180],
  ]
  cells.forEach(([x, y], i) => {
    const a = r() * Math.PI
    const d = 22 + r() * 14
    out.push({
      p: [x + Math.cos(a) * d, y + Math.sin(a) * d * 0.5],
      q: [x - Math.cos(a) * d, y - Math.sin(a) * d * 0.5],
      ang: r() * Math.PI,
      t0: 0.4 + i * 0.32,
    })
  })
  return out
})()
const EXTRA: Pt = [590, 140]

function Photon({ x, y, ang, op }: { x: number; y: number; ang: number; op: number }) {
  return (
    <path
      d={wave(-12, 0, 24, 3.5, 8)}
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((ang * 180) / Math.PI).toFixed(1)})`}
      fill="none"
      stroke={BEAM}
      strokeWidth={2}
      opacity={op}
    />
  )
}

export function FigAnnihilation() {
  return (
    <Anim
      n="37-8"
      title="粒子と反粒子は出会うと消えて光になり、わずかに多かった物質だけが残った"
      still={5.6}
      period={8}
      caption="模式図です。粒子と反粒子が1組ずつ出会って消え（対消滅）、反対向きに飛ぶ2つの光になります。粒子が1個だけ多いと、その1個が残ります。実際の差は、反粒子10億個に対して粒子が1個多い程度だったと考えられています。"
    >
      {(t) => (
        <Svg id="37-8" w={680} h={260} label="粒子と反粒子が組になって消え、光になる。反粒子より1個多かった粒子だけが物質として残る。">
          <Ball x={30} y={22} r={7} fill="var(--fig-line)" />
          <T x={44} y={22} fs={12}>
            粒子（物質）
          </T>
          <Ball x={170} y={22} r={7} fill="var(--fig-bg)" />
          <T x={184} y={22} fs={12}>
            反粒子（反物質）
          </T>
          <Photon x={330} y={22} ang={0} op={1} />
          <T x={350} y={22} fs={12}>
            光（γ線）
          </T>
          <rect x={14} y={44} width={652} height={196} rx={8} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
          {PAIRS.map((pr, i) => {
            const m: Pt = [(pr.p[0] + pr.q[0]) / 2, (pr.p[1] + pr.q[1]) / 2]
            const k = ease((t - pr.t0) / 0.8)
            const met = t >= pr.t0 + 0.8
            const fly = clamp01((t - pr.t0 - 0.8) / 1.4)
            if (!met) {
              const px = pr.p[0] + (m[0] - pr.p[0]) * k
              const py = pr.p[1] + (m[1] - pr.p[1]) * k
              const qx = pr.q[0] + (m[0] - pr.q[0]) * k
              const qy = pr.q[1] + (m[1] - pr.q[1]) * k
              return (
                <g key={i}>
                  <Ball x={px} y={py} r={7} fill="var(--fig-line)" />
                  <Ball x={qx} y={qy} r={7} fill="var(--fig-bg)" />
                </g>
              )
            }
            const d = 10 + fly * 24
            const flash = t < pr.t0 + 1.05
            const op = 1 - fly * 0.55
            return (
              <g key={i}>
                {flash && <circle cx={m[0]} cy={m[1]} r={11} fill="#f2c94c" opacity={0.7} />}
                <Photon x={m[0] + Math.cos(pr.ang) * d} y={m[1] + Math.sin(pr.ang) * d} ang={pr.ang} op={op} />
                <Photon x={m[0] - Math.cos(pr.ang) * d} y={m[1] - Math.sin(pr.ang) * d} ang={pr.ang} op={op} />
              </g>
            )
          })}
          <Ball x={EXTRA[0]} y={EXTRA[1]} r={7} fill="var(--fig-line)" />
          {t > 3.6 && (
            <T x={EXTRA[0]} y={EXTRA[1] + 26} anchor="middle" fs={12} tone="acc">
              残った物質
            </T>
          )}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図37-9 確かさの一覧 ---------- */

type LevelId = 'confirmed' | 'hypothesis' | 'candidate'

/** 確かさの印（本文の Level と同じ形） */
function LevelMark({ x, y, of, r = 7 }: { x: number; y: number; of: LevelId; r?: number }) {
  if (of === 'confirmed') return <circle cx={x} cy={y} r={r} fill="var(--fig-line)" />
  if (of === 'hypothesis')
    return (
      <g>
        <circle cx={x} cy={y} r={r} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
        <path d={`M${x},${y - r} A${r},${r} 0 0 1 ${x},${y + r} Z`} fill="var(--fig-line)" />
      </g>
    )
  return <circle cx={x} cy={y} r={r} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="2.6 2.2" />
}

const LEVEL_COLS: { of: LevelId; label: string }[] = [
  { of: 'confirmed', label: '確かめられている' },
  { of: 'hypothesis', label: '有力な仮説' },
  { of: 'candidate', label: '検証されていない候補' },
]

const ROWS: { topic: string; cells: [string[], string[], string[]] }[] = [
  { topic: '暗黒物質', cells: [['見えない質量がある', '（通常の物質の5倍あまり）'], ['正体は、未知の', '粒子である'], ['正体は WIMP という', '粒子（LZ の1回の反応）']] },
  { topic: '暗黒エネルギー', cells: [['宇宙の膨張が', '加速している'], ['空間そのものが持つ', '一定のエネルギー（宇宙項）'], ['強さが時間とともに', '変わる（DESI）']] },
  { topic: 'ハッブル定数', cells: [['測り方によって', '値が食い違う'], [], ['原因は、標準の宇宙の', '模型に足りないもの']] },
  { topic: '物質と反物質', cells: [['反物質がほとんど', '見つからない'], ['初めに物質が', 'わずかに多くできた'], ['差を生んだのは', 'ニュートリノ（T2K）']] },
  { topic: 'ニュートリノ', cells: [['質量がある（電子の', '100万分の1より軽い）'], [], []] },
  { topic: '量子重力', cells: [['相対性理論と量子力学は', 'それぞれ実験と合う'], [], ['超弦理論、ループ量子重力', 'ホーキング放射（未観測）']] },
]

export function FigLevels() {
  const colX = [130, 326, 522]
  const top = 58
  const rowH = 56
  return (
    <Figure
      n="37-9"
      title="この章の問題を、確かさの3段階に分けた一覧（2026年11月時点）"
      caption="印の形は本文の確かさの印と同じです（塗った丸は確かめられている、半分の丸は有力な仮説、点線の丸は検証されていない候補）。「—」は、この章で取り上げた主張がないことを表します。"
    >
      <Svg id="37-9" w={720} h={top + rowH * ROWS.length + 8} label="確かさの一覧。暗黒物質は存在が確かめられ、正体が未知の粒子であることは有力な仮説、WIMP は候補。宇宙の加速膨張は確かめられ、宇宙項は有力な仮説、強さの変化は候補。ハッブル定数の食い違いは確かめられている。反物質がほとんどないことは確かめられ、初めに物質がわずかに多くできたことは有力な仮説、ニュートリノが差を生んだことは候補。ニュートリノの質量は確かめられている。量子重力の理論とホーキング放射は候補。">
        {LEVEL_COLS.map((c, i) => (
          <g key={c.of}>
            <LevelMark x={colX[i] + 16} y={28} of={c.of} />
            <T x={colX[i] + 30} y={28} fs={12.5} bold>
              {c.label}
            </T>
          </g>
        ))}
        {ROWS.map((r, i) => {
          const y = top + i * rowH
          return (
            <g key={r.topic}>
              {i % 2 === 0 && <rect x={6} y={y} width={708} height={rowH} fill="var(--fig-box)" />}
              <T x={14} y={y + rowH / 2} fs={12.5} bold>
                {r.topic}
              </T>
              {r.cells.map((lines, j) =>
                lines.length === 0 ? (
                  <T key={j} x={colX[j] + 16} y={y + rowH / 2} fs={12} tone="muted">
                    —
                  </T>
                ) : (
                  <g key={j}>
                    <LevelMark x={colX[j] + 16} y={y + rowH / 2} of={LEVEL_COLS[j].of} r={5} />
                    {lines.map((l, k) => (
                      <T key={k} x={colX[j] + 28} y={y + rowH / 2 + (k - (lines.length - 1) / 2) * 17} fs={11.5}>
                        {l}
                      </T>
                    ))}
                  </g>
                ),
              )}
            </g>
          )
        })}
        {colX.map((x) => (
          <line key={x} x1={x} y1={top} x2={x} y2={top + rowH * ROWS.length} stroke="var(--fig-muted)" strokeWidth={0.8} />
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図37-10 7つの分野と、つないだ発見 ---------- */

const NODE: Record<FieldId, Pt> = {
  classical: [360, 46],
  em: [160, 160],
  thermo: [560, 160],
  relativity: [160, 300],
  quantum: [560, 300],
  cosmo: [160, 440],
  particle: [560, 440],
}
const NW = 214
const NH = 46

function FieldNode({ id }: { id: FieldId }) {
  const f = fieldById.get(id)!
  const [x, y] = NODE[id]
  const name = f.name
  return (
    <g>
      <rect x={x - NW / 2} y={y - NH / 2} width={NW} height={NH} rx={8} fill={`var(--f-${id}-bg)`} stroke={`var(--f-${id})`} strokeWidth={2} />
      <g transform={`translate(${x - NW / 2 + 10} ${y - 11})`} style={{ color: `var(--f-${id})` }}>
        <FieldIcon id={id} size={22} />
      </g>
      <T x={x - NW / 2 + 40} y={y} fs={name.length > 10 ? 12.5 : 14} bold>
        {name}
      </T>
    </g>
  )
}

function Lines({ x, y, lines, anchor = 'start' }: { x: number; y: number; lines: string[]; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <>
      {lines.map((l, i) => (
        <T key={i} x={x} y={y + i * 16} fs={11.5} anchor={anchor}>
          {l}
        </T>
      ))}
    </>
  )
}

export function FigFields() {
  const b = (id: FieldId) => NODE[id][1] + NH / 2
  const tp = (id: FieldId) => NODE[id][1] - NH / 2
  return (
    <Figure
      n="37-10"
      title="物理学の7つの分野と、分野をつないだ主な発見"
      caption="矢印は、ある分野の考えや発見が次の分野を生んだり支えたりした流れを表します。かっこの中はこの本で扱った章です。点線の箱と矢印は、まだ完成していない理論を表します。"
    >
      <Svg id="37-10" w={720} h={600} label="7分野のつながり。古典力学から電磁気学（クーロンの測定）と熱力学・統計力学（気体の分子の運動）へ。電磁気学から相対性理論（光の速さはだれから見ても同じ）、熱力学・統計力学から量子力学（熱した物が出す光とエネルギーのつぶ）へ。相対性理論から宇宙論（膨張する宇宙）、量子力学と特殊相対性理論から量子場理論・素粒子物理学（反粒子）へ。素粒子物理学は星の一生や元素の合成の説明で宇宙論とつながる。宇宙論と素粒子物理学をまとめる量子重力はまだ完成していない。">
        {/* 矢印 */}
        <Arrow x1={325} y1={b('classical')} x2={200} y2={tp('em')} />
        <Arrow x1={395} y1={b('classical')} x2={520} y2={tp('thermo')} />
        <Arrow x1={160} y1={b('em')} x2={160} y2={tp('relativity')} />
        <Arrow x1={560} y1={b('thermo')} x2={560} y2={tp('quantum')} />
        <Arrow x1={160} y1={b('relativity')} x2={160} y2={tp('cosmo')} />
        <Arrow x1={560} y1={b('quantum')} x2={560} y2={tp('particle')} />
        <Arrow x1={267} y1={318} x2={453} y2={420} />
        <Arrow x1={NODE.particle[0] - NW / 2} y1={448} x2={NODE.cosmo[0] + NW / 2} y2={448} />
        <Arrow x1={190} y1={b('cosmo')} x2={300} y2={538} dashed />
        <Arrow x1={530} y1={b('particle')} x2={420} y2={538} dashed />
        {/* 矢印の説明 */}
        <Lines x={250} y={86} anchor="end" lines={['クーロンの測定', '（第6章）']} />
        <Lines x={470} y={86} lines={['気体の分子の運動', '（第14章）']} />
        <Lines x={172} y={222} lines={['光の速さは', 'だれから見ても同じ', '（第16〜17章）']} />
        <Lines x={572} y={222} lines={['熱した物が出す光と', 'エネルギーのつぶ', '（第21章）']} />
        <Lines x={172} y={362} lines={['一般相対性理論で', '膨張する宇宙を計算', '（第33章）']} />
        <Lines x={572} y={358} lines={['反粒子の予言', '（第29章）']} />
        <Lines x={300} y={302} anchor="start" lines={['特殊相対性理論も使う']} />
        <Lines x={360} y={480} anchor="middle" lines={['星の一生、元素の合成、ニュートリノ', '（第32・34・35章）']} />
        {/* 未完成の理論 */}
        <rect x={250} y={538} width={220} height={50} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="6 4" />
        <T x={360} y={555} anchor="middle" fs={13} bold>
          量子重力（未完成）
        </T>
        <T x={360} y={574} anchor="middle" fs={11.5} tone="muted">
          この章
        </T>
        {FIELDS.map((f) => (
          <FieldNode key={f.id} id={f.id} />
        ))}
      </Svg>
    </Figure>
  )
}
