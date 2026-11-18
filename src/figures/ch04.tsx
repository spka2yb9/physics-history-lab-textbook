import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Range } from '../components/controls'
import { Ball, Cross, Force, Trail, Vel, ease } from './common'

type Pt = [number, number]

/** 折れ線の path の d */
const line = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1])
/** a から b へ割合 f の位置 */
const lerp = (a: Pt, b: Pt, f: number): Pt => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]

const G = 9.8 // 重力の強さ（m/s²）

/* ---------- 図4-1 この章の年表 ---------- */

const ROAD = [
  { y: '1世紀', lines: ['ヘロン', '反射する光は', '最も短い道を通る'] },
  { y: '1662年', lines: ['フェルマー', '光はかかる時間が', '最も短い道を通る'] },
  { y: '1744年', lines: ['モーペルテュイ', 'オイラー', '最小作用の原理'] },
  { y: '1788年', lines: ['ラグランジュ', '『解析力学』', 'を出版'] },
  { y: '1834年', lines: ['ハミルトン', '光と物体の運動を', '同じ方法で扱う'] },
  { y: '1940年代', lines: ['ファインマン', '量子力学を', '作用で書き直す'] },
]

export function FigRoad4() {
  return (
    <Figure n="4-1" title="光の道筋から力学の書き直しへ：この章で扱う出来事" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="4-1" w={720} h={250} label="1世紀にヘロンが反射の道は最も短いと示し、1662年にフェルマーが光はかかる時間が最も短い道を通ると考えた。1744年にモーペルテュイとオイラーが最小作用の原理を示し、1788年にラグランジュが『解析力学』を出版した。1834年にハミルトンが光と物体の運動を同じ方法で扱い、1940年代にファインマンが量子力学を作用で書き直した。">
        <Arrow x1={20} y1={125} x2={705} y2={125} />
        {ROAD.map((r, i) => {
          const x = 70 + i * 116
          const up = i % 2 === 0
          const ty = up ? 26 : 152
          return (
            <g key={r.y}>
              <circle cx={x} cy={125} r={6} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 104 : 131} x2={x} y2={up ? 119 : 146} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold>
                {r.y}
              </T>
              {r.lines.map((w, j) => (
                <T key={j} x={x} y={ty + 19 + j * 17} anchor="middle" fs={j === 0 ? 12.5 : 12} tone={j === 0 ? undefined : 'muted'}>
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

/* ---------- 図4-2 鏡で反射する光の道 ---------- */

const RA: Pt = [100, 60]
const RB: Pt = [460, 100]
const MIRROR = 200
const RB2: Pt = [RB[0], 2 * MIRROR - RB[1]] // 鏡に映った B の位置
const RP: Pt = lerp(RA, RB2, (MIRROR - RA[1]) / (RB2[1] - RA[1])) // 実際の反射点
const REFLECT = [
  { no: '①', p: [180, MIRROR] as Pt },
  { no: '②', p: RP },
  { no: '③', p: [420, MIRROR] as Pt },
]
const cm = (p: Pt) => ((dist(RA, p) + dist(p, RB)) / 30).toFixed(1)

export function FigReflect() {
  const angA = Math.atan2(RA[1] - RP[1], RA[0] - RP[0])
  const angB = Math.atan2(RB[1] - RP[1], RB[0] - RP[0])
  const arc = (a0: number, a1: number) => {
    const r = 30
    return `M${RP[0] + r * Math.cos(a0)},${RP[1] + r * Math.sin(a0)} A${r},${r} 0 0 ${a1 > a0 ? 1 : 0} ${RP[0] + r * Math.cos(a1)},${RP[1] + r * Math.sin(a1)}`
  }
  return (
    <Figure n="4-2" title="鏡で反射する光は、道の長さが最も短くなる点ではね返る" caption="点Aから出た光が鏡ではね返って目Bに届く道を3通り比べた模式図です。長さの数値は図の上での目安です。②は、鏡に映ったBの位置とAを結ぶ直線が鏡と交わる点で、ここではね返る道が最も短くなります。">
      <Svg id="4-2" w={700} h={330} label="点Aから鏡を通って目Bへ行く3つの道。②の道が最も短く、②では鏡に入る角度とはね返る角度が等しい。②はAと鏡に映ったBの位置を結ぶ直線の上にある。">
        <rect x={40} y={MIRROR} width={540} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={44} y={226} fs={12} tone="muted">
          鏡
        </T>
        {REFLECT.map((c) =>
          c.p === RP ? null : <path key={c.no} d={line([RA, c.p, RB])} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} />,
        )}
        <path d={line([RP, RB2])} fill="none" stroke="var(--fig-accent)" strokeWidth={1.5} strokeDasharray="5 4" />
        <path d={line([RA, RP, RB])} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
        <path d={arc(Math.PI, angA + 2 * Math.PI)} fill="none" stroke="var(--fig-line)" />
        <path d={arc(0, angB)} fill="none" stroke="var(--fig-line)" />
        {REFLECT.map((c) => (
          <T key={c.no} x={c.p[0]} y={226} anchor="middle" fs={12.5} tone={c.p === RP ? 'acc' : undefined}>
            {c.no}
          </T>
        ))}
        <Ball x={RA[0]} y={RA[1]} r={6} />
        <T x={RA[0]} y={RA[1] - 20} anchor="middle" fs={12.5}>
          A（光が出る点）
        </T>
        <Ball x={RB[0]} y={RB[1]} r={6} />
        <T x={RB[0]} y={RB[1] - 20} anchor="middle" fs={12.5}>
          B（目）
        </T>
        <circle cx={RB2[0]} cy={RB2[1]} r={6} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 3" />
        <T x={RB2[0] + 14} y={RB2[1]} fs={12} tone="muted">
          鏡に映ったBの位置
        </T>
        <T x={540} y={40} fs={12.5} bold>
          A→鏡→Bの道の長さ
        </T>
        {REFLECT.map((c, i) => (
          <T key={c.no} x={540} y={64 + i * 22} fs={12.5} tone={c.p === RP ? 'acc' : undefined}>
            {`${c.no} ${cm(c.p)}cm${c.p === RP ? '（最も短い）' : ''}`}
          </T>
        ))}
        <T x={540} y={142} fs={12}>
          ②では、鏡に入る角度と
        </T>
        <T x={540} y={160} fs={12}>
          はね返る角度が等しい
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図4-3 水と空気の境で光が曲がる道（動・スライダー） ---------- */

const LS: Pt = [50, 40] // 出発点
const LG: Pt = [440, 270] // 到着点
const SURF = 150 // 水面
const V_AIR = 150 // 空気の中の速さ（ピクセル毎秒）
const V_WATER = V_AIR * 0.75 // 水の中は空気の約4分の3
const lightTime = (x: number) => dist(LS, [x, SURF]) / V_AIR + dist([x, SURF], LG) / V_WATER
/** かかる時間が最も短い横切り位置（黄金分割で探す） */
const X_BEST = (() => {
  let a = LS[0]
  let b = LG[0]
  for (let i = 0; i < 60; i++) {
    const m1 = b - (b - a) / 1.618
    const m2 = a + (b - a) / 1.618
    if (lightTime(m1) < lightTime(m2)) b = m2
    else a = m1
  }
  return (a + b) / 2
})()
const X_STRAIGHT = LS[0] + ((LG[0] - LS[0]) * (SURF - LS[1])) / (LG[1] - LS[1])
const STEP = (X_BEST - X_STRAIGHT) / 2
/** 横切る位置の候補0〜10。4がまっすぐの道、6が実際の光の道 */
const CROSS = Array.from({ length: 11 }, (_, k) => X_STRAIGHT + (k - 4) * STEP)
const REL = CROSS.map((x) => Math.round((100 * lightTime(x)) / lightTime(X_BEST)))

export function FigRefract() {
  const [k, setK] = useState(6)
  const X: Pt = [CROSS[k], SURF]
  const t1 = dist(LS, X) / V_AIR
  const t2 = dist(X, LG) / V_WATER
  const base = 470
  return (
    <Anim
      n="4-3"
      title="光は、かかる時間が最も短い道を通るので、水面で曲がる"
      still={5}
      period={5.5}
      controls={<Range label="水面を横切る位置" min={0} max={10} value={k} onChange={setK} format={(v) => `位置${v}`} />}
      caption="水の中では光の速さが空気の中の約4分の3になるとした模式図です。「水面を横切る位置」を変えると、光の道（青の線）と、下の棒グラフで強調される棒が変わります。位置4はまっすぐの道、位置6が実際の光の道で、かかる時間が最も短くなります。"
    >
      {(t) => {
        const tt = Math.min(t, t1 + t2)
        const p = tt < t1 ? lerp(LS, X, tt / t1) : lerp(X, LG, (tt - t1) / t2)
        return (
          <Svg id="4-3" w={520} h={510} label="空気の中の出発点から水の中の到着点へ進む光の道の候補。水面を横切る位置ごとに、かかる時間を棒グラフで比べると、まっすぐの道より少し右で横切る道が最も短い。">
            <rect x={20} y={SURF} width={480} height={160} fill="var(--fig-box3)" opacity={0.7} />
            <line x1={20} y1={SURF} x2={500} y2={SURF} stroke="var(--fig-line)" strokeWidth={1.5} />
            <T x={300} y={24} fs={12} tone="muted">
              空気（光は速く進む）
            </T>
            <T x={28} y={276} fs={12} tone="muted">
              水（光は遅く進む）
            </T>
            {CROSS.map((x, i) => (
              <line key={i} x1={x} y1={SURF - 5} x2={x} y2={SURF + 5} stroke="var(--fig-line)" />
            ))}
            <path d={line([LS, LG])} fill="none" stroke="var(--fig-muted)" strokeWidth={1.2} strokeDasharray="4 4" />
            <path d={line([LS, X, LG])} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            <Ball x={LS[0]} y={LS[1]} r={5} />
            <T x={LS[0] + 12} y={LS[1] - 4} fs={12}>
              出発点
            </T>
            <Ball x={LG[0]} y={LG[1]} r={5} />
            <T x={LG[0]} y={LG[1] + 18} anchor="middle" fs={12}>
              到着点
            </T>
            <circle cx={p[0]} cy={p[1]} r={7} fill="var(--fig-accent)" stroke="var(--fig-bg)" strokeWidth={1.5} />
            {/* かかる時間の棒グラフ（横切る位置の真下に並べる） */}
            <T x={20} y={330} fs={12.5} bold>
              かかる時間（実際の光の道を100とした値）
            </T>
            <line x1={20} y1={base} x2={500} y2={base} stroke="var(--fig-line)" />
            {CROSS.map((x, i) => {
              const h = REL[i] * 0.9
              return (
                <g key={i}>
                  <rect x={x - 11} y={base - h} width={22} height={h} fill={i === k ? 'var(--fig-accent)' : 'var(--fig-box)'} stroke="var(--fig-line)" />
                  <T x={x} y={base - h - 10} anchor="middle" fs={11}>
                    {REL[i]}
                  </T>
                  <T x={x} y={base + 13} anchor="middle" fs={11.5} tone={i === k ? 'acc' : undefined}>
                    {i}
                  </T>
                </g>
              )
            })}
            <T x={CROSS[4]} y={base + 31} anchor="middle" fs={11.5} tone="muted">
              まっすぐ
            </T>
            <T x={CROSS[6]} y={base + 31} anchor="middle" fs={11.5} tone="acc">
              実際の道
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図4-4 屈折を説明した3つの考え ---------- */

const VIEWS = [
  { cx: 120, who: 'デカルト', year: '1637年', assume: '水の中の光は速い', ok: false, rule: ['そう仮定して', '屈折の決まりを導いた'] },
  { cx: 360, who: 'フェルマー', year: '1662年', assume: '水の中の光は遅い', ok: true, rule: ['かかる時間が', '最も短い道を通る'] },
  { cx: 600, who: 'モーペルテュイ', year: '1744年', assume: '水の中の光は速い', ok: false, rule: ['速さと距離を掛けた値の', '合計が最も小さい道を通る'] },
]

export function FigThreeViews() {
  const bend = Math.asin(Math.sin(Math.atan2(70, 65)) / 1.333)
  return (
    <Figure n="4-4" title="屈折の同じ決まりを、違う仮定から導いた3つの説明" caption="3人とも、光の曲がり方そのものは同じ決まりで説明しました。違うのは、水の中の光の速さについての仮定です。1850年の測定で、水の中の光は空気の中より遅いと分かり、フェルマーの仮定が正しいと確かめられました。">
      <Svg id="4-4" w={720} h={300} label="デカルトは水の中の光は速いと仮定し、フェルマーは遅いと仮定して時間が最も短い道を考え、モーペルテュイは速いと仮定して速さと距離を掛けた値の合計が最も小さい道を考えた。1850年の測定で水の中の光は遅いと分かった。">
        <line x1={240} y1={10} x2={240} y2={262} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        <line x1={480} y1={10} x2={480} y2={262} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        {VIEWS.map((v) => (
          <g key={v.who}>
            <T x={v.cx} y={20} anchor="middle" bold>
              {v.who}
            </T>
            <T x={v.cx} y={38} anchor="middle" fs={12} tone="muted">
              {v.year}
            </T>
            <rect x={v.cx - 100} y={120} width={200} height={70} fill="var(--fig-box3)" opacity={0.7} />
            <line x1={v.cx - 100} y1={120} x2={v.cx + 100} y2={120} stroke="var(--fig-line)" />
            <T x={v.cx - 96} y={104} fs={11} tone="muted">
              空気
            </T>
            <T x={v.cx - 96} y={176} fs={11} tone="muted">
              水
            </T>
            <path d={line([[v.cx - 70, 55], [v.cx, 120], [v.cx + 70 * Math.tan(bend), 190]])} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
            <T x={v.cx} y={212} anchor="middle" fs={12.5} tone={v.ok ? 'acc' : 'danger'}>
              {v.assume}
            </T>
            {v.ok ? (
              <T x={v.cx} y={230} anchor="middle" fs={11} tone="acc">
                （正しい）
              </T>
            ) : (
              <>
                <Cross x={v.cx + 66} y={212} s={5} />
                <T x={v.cx} y={230} anchor="middle" fs={11} tone="danger">
                  （のちに誤りと分かる）
                </T>
              </>
            )}
            {v.rule.map((r, j) => (
              <T key={j} x={v.cx} y={250 + j * 17} anchor="middle" fs={12}>
                {r}
              </T>
            ))}
          </g>
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図4-5 オイラーの数え方の作用を足し合わせる（動） ---------- */

const E_VX = 7.5 // 横向きの速さ（m/s）
const E_VY = G // 投げ上げる速さ。2秒で戻る
const E_T = 2
const E_SC = 24 // 1mのピクセル数
const E0: Pt = [60, 220]
const E_N = 8
const ePos = (s: number): Pt => [E0[0] + E_VX * s * E_SC, E0[1] - (E_VY * s - 0.5 * G * s * s) * E_SC]
/** 0秒から s 秒までの「速さと距離を掛けた値」の合計（速さの2乗を時間で足したもの） */
const eSum = (s: number) => E_VX * E_VX * s + (E_VY * E_VY * s - E_VY * G * s * s + (G * G * s * s * s) / 3)
const E_TOTAL = eSum(E_T)
const E_BAR = 600 / E_TOTAL
const E_LABELS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧']

export function FigEulerSum() {
  const pathPts = Array.from({ length: 41 }, (_, i) => ePos((E_T * i) / 40))
  return (
    <Anim
      n="4-5"
      title="作用は、道筋に沿って少しずつ足し合わせた量"
      still={5.5}
      period={6.5}
      caption="オイラーの数え方を、投げたボールで示した模式図です。道筋を同じ時間ごとに8つの区間に分け、区間ごとに「速さ」と「区間の長さ」を掛けた値を出して、下の棒に積み重ねます。頂上の近くではボールが遅く、区間も短いので、積み重なる値は小さくなります。"
    >
      {(t) => {
        const s = Math.min(t / 2, E_T) // 実際の2秒を4秒かけて見せる
        const b = ePos(s)
        const vy = E_VY - G * s
        const sp = Math.hypot(E_VX, vy)
        return (
          <Svg id="4-5" w={720} h={310} label="投げたボールの道筋を8つの区間に分け、区間ごとの速さと長さを掛けた値を棒に積み重ねる。頂上の近くの区間は値が小さい。積み重ねた合計がオイラーの数え方の作用になる。">
            <line x1={30} y1={E0[1]} x2={440} y2={E0[1]} stroke="var(--fig-line)" strokeWidth={1.5} />
            <Trail points={pathPts} />
            {E_LABELS.map((no, i) => {
              const a = ePos((E_T * i) / E_N)
              const m = ePos((E_T * (i + 0.5)) / E_N)
              return (
                <g key={no}>
                  <line x1={a[0]} y1={a[1] - 5} x2={a[0]} y2={a[1] + 5} stroke="var(--fig-line)" />
                  <T x={m[0]} y={m[1] - 22} anchor="middle" fs={11.5} tone="muted">
                    {no}
                  </T>
                </g>
              )
            })}
            <Vel x1={b[0]} y1={b[1]} x2={b[0] + E_VX * 3} y2={b[1] - vy * 3} />
            <Ball x={b[0]} y={b[1]} r={8} />
            <T x={470} y={70} fs={12.5}>
              区間ごとに、
            </T>
            <T x={470} y={92} fs={12.5}>
              速さと区間の長さを掛けた値を出し、
            </T>
            <T x={470} y={114} fs={12.5}>
              下の棒に積み重ねる
            </T>
            <T x={470} y={150} fs={12} tone="muted">
              {`いまの速さ：毎秒${sp.toFixed(1)}m`}
            </T>
            <T x={60} y={252} fs={12.5} bold>
              合計（オイラーの数え方の作用）
            </T>
            <rect x={60} y={266} width={600} height={26} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 3" />
            {E_LABELS.map((no, i) => {
              const s0 = (E_T * i) / E_N
              if (s <= s0) return null
              const s1 = Math.min(s, (E_T * (i + 1)) / E_N)
              const x = 60 + eSum(s0) * E_BAR
              const w = (eSum(s1) - eSum(s0)) * E_BAR
              return (
                <g key={no}>
                  <rect x={x} y={266} width={w} height={26} fill={i % 2 ? 'var(--fig-box4)' : 'var(--fig-box3)'} stroke="var(--fig-line)" />
                  {w > 20 && (
                    <T x={x + w / 2} y={279} anchor="middle" fs={11.5}>
                      {no}
                    </T>
                  )}
                </g>
              )
            })}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図4-6 ニュートンの方法とラグランジュの方法 ---------- */

function Pendulum({ px, force }: { px: number; force: boolean }) {
  const L = 140
  const a = Math.PI / 6
  const bob: Pt = [px + L * Math.sin(a), 50 + L * Math.cos(a)]
  return (
    <g>
      <line x1={px - 40} y1={50} x2={px + 40} y2={50} stroke="var(--fig-line)" strokeWidth={3} />
      <line x1={px} y1={50} x2={bob[0]} y2={bob[1]} stroke="var(--fig-line)" strokeWidth={1.5} />
      {force ? (
        <>
          <Force x1={bob[0]} y1={bob[1] + 14} x2={bob[0]} y2={bob[1] + 64} />
          <T x={bob[0] + 10} y={bob[1] + 48} fs={12}>
            重力
          </T>
          <Force x1={bob[0] - 14 * Math.sin(a)} y1={bob[1] - 14 * Math.cos(a)} x2={bob[0] - 66 * Math.sin(a)} y2={bob[1] - 66 * Math.cos(a)} />
          <T x={bob[0] - 46} y={bob[1] - 52} anchor="end" fs={12}>
            糸が引く力
          </T>
        </>
      ) : (
        <>
          <line x1={px} y1={50} x2={px} y2={206} stroke="var(--fig-muted)" strokeDasharray="4 4" />
          <path d={`M${px},${50 + 44} A44,44 0 0 0 ${px + 44 * Math.sin(a)},${50 + 44 * Math.cos(a)}`} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
          <T x={px - 8} y={100} anchor="end" fs={12} tone="acc">
            振れの角度
          </T>
          <path
            d={`M${px + L * Math.sin(-0.7)},${50 + L * Math.cos(-0.7)} A${L},${L} 0 0 0 ${px + L * Math.sin(0.7)},${50 + L * Math.cos(0.7)}`}
            fill="none"
            stroke="var(--fig-muted)"
            strokeDasharray="3 4"
          />
          <T x={px} y={218} anchor="middle" fs={11.5} tone="muted">
            おもりが動ける円
          </T>
          <Vel x1={bob[0]} y1={bob[1]} x2={bob[0] - 40 * Math.cos(a)} y2={bob[1] + 40 * Math.sin(a)} />
        </>
      )}
      <Ball x={bob[0]} y={bob[1]} r={12} />
    </g>
  )
}

export function FigNewtonLagrange() {
  return (
    <Figure n="4-6" title="振り子の運動を求める2つの方法" caption="左はニュートンの方法で、おもりにはたらく力（青の矢印）をすべて求めます。右はラグランジュの方法で、おもりの位置を振れの角度だけで表し、運動エネルギーと位置エネルギーから計算します。糸が引く力は右の方法の計算には出てきません（模式図）。">
      <Svg id="4-6" w={720} h={340} label="振り子の運動の求め方の比較。ニュートンの方法では重力と糸が引く力をすべて求める。ラグランジュの方法では位置を振れの角度だけで表し、エネルギーから計算するので、糸が引く力は出てこない。">
        <line x1={360} y1={10} x2={360} y2={330} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        <T x={180} y={20} anchor="middle" bold>
          ニュートンの方法
        </T>
        <T x={540} y={20} anchor="middle" bold>
          ラグランジュの方法
        </T>
        <Pendulum px={150} force />
        <Pendulum px={510} force={false} />
        {['・おもりにはたらく力をすべて求める', '　（糸が引く力も求める）', '・短い時間ごとに速さと位置の', '　変化をたどる'].map((s, i) => (
          <T key={i} x={30} y={260 + i * 20} fs={12.5}>
            {s}
          </T>
        ))}
        {['・位置は振れの角度だけで表す', '・運動エネルギーと位置エネルギー', '　から、決まった手順で計算する', '・糸が引く力は計算に出てこない'].map((s, i) => (
          <T key={i} x={390} y={260 + i * 20} fs={12.5}>
            {s}
          </T>
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図4-7・4-8 共通：2秒で20m先に落ちるボールの道筋 ---------- */

const B_T = 2 // 飛んでいる時間（秒）
const B_VX = 10 // 横向きの速さ（20mを2秒）
const B_H = (G * B_T * B_T) / 8 // 実際の頂上の高さ（約4.9m）
/** 頂上の高さ h の放物線の道筋の作用（1kgあたり）。速さによる分と高さによる分 */
const kinPart = (h: number, s: number) => 0.5 * B_VX * B_VX * s + ((4 * h * h) / (3 * B_T)) * (1 - (1 - (2 * s) / B_T) ** 3)
const potPart = (h: number, s: number) => {
  const u = s / B_T
  return 4 * G * h * B_T * (u * u / 2 - (u * u * u) / 3)
}
const actionOf = (h: number) => kinPart(h, B_T) - potPart(h, B_T)
const S_TRUE = actionOf(B_H)

/* ---------- 図4-7 候補を少しずつ変え、実際の道筋が選ばれる（動） ---------- */

/** 実際の道筋に重ねるゆがみ（半波・1波・1.5波の大きさ、m） */
const CANDS: [number, number, number][] = [
  [-2.8, 1.6, 1.2],
  [3.0, -1.6, 0.8],
  [-1.8, 1.0, -0.6],
  [1.2, 0.5, 0.3],
  [-0.5, -0.25, 0.12],
  [0, 0, 0],
]
/** ゆがみを足した道筋の作用。一様な重力では、増える分はゆがみの速さだけで決まる */
const candAction = (c: number[]) => S_TRUE + (Math.PI ** 2 / (4 * B_T)) * c.reduce((sum, a, i) => sum + a * a * (i + 1) ** 2, 0)
const CAND_REL = CANDS.map((c) => Math.round((100 * candAction(c)) / S_TRUE))
const STAGE = 1.5

function candPath(c: number[], x0: number, y0: number, sc: number): string {
  const pts: Pt[] = []
  for (let i = 0; i <= 60; i++) {
    const u = i / 60
    const y = 4 * B_H * u * (1 - u) + c.reduce((sum, a, k) => sum + a * Math.sin((k + 1) * Math.PI * u), 0)
    pts.push([x0 + B_VX * B_T * u * sc, y0 - y * sc])
  }
  return line(pts)
}

export function FigCandidates() {
  const x0 = 40
  const y0 = 250
  const sc = 20
  return (
    <Anim
      n="4-7"
      title="道筋の候補を少しずつ変えていくと、作用が最も小さい道筋が実際の道筋になる"
      still={9.5}
      period={10.5}
      caption="出発点から20m先の到着点まで、ちょうど2秒で飛ぶ道筋の候補を順に描いた模式図です。右の棒は各候補の作用で、実際の道筋を100としています。自然が候補を順に試しているわけではなく、候補どうしを比べると実際の道筋の作用が最も小さいということです。"
    >
      {(t) => {
        const stage = Math.min(CANDS.length - 1, Math.floor(t / STAGE))
        const f = ease((t - stage * STAGE) / 0.7)
        const prev = CANDS[Math.max(0, stage - 1)]
        const cur = CANDS[stage].map((a, i) => prev[i] + (a - prev[i]) * (stage === 0 ? 1 : f))
        const shown = f >= 1 ? stage : stage - 1
        return (
          <Svg id="4-7" w={720} h={290} label="地面の上の出発点から到着点まで2秒で飛ぶボールの道筋の候補。波打った道や高すぎる道、低すぎる道は作用が大きく、実際の放物線の道筋で作用が最も小さい。">
            <line x1={20} y1={y0} x2={470} y2={y0} stroke="var(--fig-line)" strokeWidth={1.5} />
            {CANDS.slice(0, Math.max(0, stage)).map((c, i) => (
              <path key={i} d={candPath(c, x0, y0, sc)} fill="none" stroke="var(--fig-muted)" strokeWidth={1} opacity={0.6} />
            ))}
            <path d={candPath(cur, x0, y0, sc)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            <Ball x={x0} y={y0} r={6} />
            <Ball x={x0 + B_VX * B_T * sc} y={y0} r={6} />
            <T x={x0 - 10} y={y0 + 20} fs={12}>
              出発点（0秒）
            </T>
            <T x={x0 + B_VX * B_T * sc + 10} y={y0 + 20} anchor="end" fs={12}>
              到着点（2秒後）
            </T>
            <line x1={24} y1={22} x2={54} y2={22} stroke="var(--fig-accent)" strokeWidth={2.5} />
            <T x={62} y={22} fs={12}>
              いま比べている道筋
            </T>
            <line x1={24} y1={42} x2={54} y2={42} stroke="var(--fig-muted)" strokeWidth={1} />
            <T x={62} y={42} fs={12}>
              前に比べた道筋
            </T>
            <T x={490} y={26} fs={12.5} bold>
              作用の大きさ
            </T>
            <T x={490} y={44} fs={11.5} tone="muted">
              （実際の道筋を100とした値）
            </T>
            {CANDS.map((_, i) => {
              if (i > shown) return null
              const last = i === CANDS.length - 1
              const w = CAND_REL[i] * 0.7
              const y = 76 + i * 32
              return (
                <g key={i}>
                  <T x={490} y={y} fs={12} tone={last ? 'acc' : undefined}>
                    {last ? '実際の道筋' : `候補${i + 1}`}
                  </T>
                  <rect x={566} y={y - 8} width={w} height={16} fill={last ? 'var(--fig-accent)' : 'var(--fig-box)'} stroke="var(--fig-line)" />
                  <T x={572 + w} y={y} fs={11.5}>
                    {CAND_REL[i]}
                  </T>
                </g>
              )
            })}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図4-8 道筋の高さを変えると作用が変わる（動・スライダー） ---------- */

export function FigHeight() {
  const [h, setH] = useState(8)
  const x0 = 40
  const y0 = 250
  const sc = 16
  const pathOf = (hh: number) =>
    Array.from({ length: 41 }, (_, i) => {
      const u = i / 40
      return [x0 + B_VX * B_T * u * sc, y0 - 4 * hh * u * (1 - u) * sc] as Pt
    })
  const bx = 520
  const bs = 0.75 // 棒の長さ（1あたりのピクセル）
  const gx = (hh: number) => 440 + hh * 25
  const gy = (s: number) => 322 - s * 1.1
  const curve = Array.from({ length: 51 }, (_, i) => [gx(i / 5), gy(actionOf(i / 5))] as Pt)
  return (
    <Anim
      n="4-8"
      title="高すぎても低すぎても、作用は大きくなる"
      still={3.4}
      period={4.5}
      controls={<Range label="候補の道筋の頂上の高さ" min={0} max={10} value={h} onChange={setH} format={(v) => `${v}m`} />}
      caption="出発点から20m先まで、ちょうど2秒で飛ぶ放物線の道筋を比べた模式図です。「頂上の高さ」を変えると、右上の3本の棒と、右下のグラフの点が変わります。作用は速さによる分から高さによる分を引いた値で、頂上が約5mの道筋（実際の道筋）で最も小さくなります。"
    >
      {(t) => {
        const s = Math.min(t / 1.5, B_T) // 2秒の飛行を3秒かけて見せる
        const u = s / B_T
        const kin = kinPart(h, s)
        const pot = potPart(h, s)
        const ball: Pt = [x0 + B_VX * s * sc, y0 - 4 * h * u * (1 - u) * sc]
        return (
          <Svg id="4-8" w={720} h={340} label="2秒で20m先に落ちる道筋の頂上の高さを変えたときの、速さによる分、高さによる分、作用の大きさ。作用は頂上が約5mの実際の道筋で最も小さい。">
            <line x1={20} y1={y0} x2={380} y2={y0} stroke="var(--fig-line)" strokeWidth={1.5} />
            <Trail points={pathOf(B_H)} />
            <path d={line(pathOf(h))} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            <Ball x={ball[0]} y={ball[1]} r={8} />
            <T x={x0} y={y0 + 20} fs={12}>
              出発点
            </T>
            <T x={x0 + B_VX * B_T * sc} y={y0 + 20} anchor="end" fs={12}>
              到着点（2秒後）
            </T>
            <Trail points={[[24, 22], [54, 22]]} />
            <T x={62} y={22} fs={12}>
              実際の道筋（頂上 約5m）
            </T>
            <line x1={24} y1={44} x2={54} y2={44} stroke="var(--fig-accent)" strokeWidth={2.5} />
            <T x={62} y={44} fs={12}>
              {`候補の道筋（頂上 ${h}m）`}
            </T>
            {/* 足し合わせの棒 */}
            <T x={400} y={24} fs={12.5} bold>
              道筋に沿って足し合わせた量
            </T>
            {[
              { label: '速さによる分', sub: '（運動エネルギーの合計）', v: kin, fill: 'var(--fig-box2)' },
              { label: '高さによる分', sub: '（位置エネルギーの合計）', v: pot, fill: 'var(--fig-box4)' },
              { label: '作用', sub: '（上から下を引いた値）', v: kin - pot, fill: 'var(--fig-accent)' },
            ].map((r, i) => (
              <g key={r.label}>
                <T x={400} y={54 + i * 44} fs={12} tone={i === 2 ? 'acc' : undefined} bold={i === 2}>
                  {r.label}
                </T>
                <T x={400} y={71 + i * 44} fs={11} tone="muted">
                  {r.sub}
                </T>
                <rect x={bx} y={47 + i * 44} width={Math.max(0, r.v * bs)} height={16} fill={r.fill} stroke="var(--fig-line)" />
              </g>
            ))}
            {/* 頂上の高さと作用のグラフ */}
            <line x1={gx(0)} y1={gy(0)} x2={gx(10) + 8} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={190} stroke="var(--fig-line)" />
            <T x={gx(0) + 6} y={192} fs={12}>
              作用
            </T>
            <T x={gx(10)} y={gy(0) - 12} anchor="end" fs={12}>
              頂上の高さ
            </T>
            {[0, 5, 10].map((v) => (
              <T key={v} x={gx(v)} y={gy(0) + 13} anchor="middle" fs={11}>
                {`${v}m`}
              </T>
            ))}
            <path d={line(curve)} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <T x={gx(B_H)} y={gy(S_TRUE) + 16} anchor="middle" fs={11.5} tone="muted">
              最も小さい
            </T>
            <circle cx={gx(h)} cy={gy(actionOf(h))} r={6} fill="var(--fig-accent)" stroke="var(--fig-bg)" strokeWidth={1.5} />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図4-9 光の道筋とボールの道筋の対応（ハミルトン） ---------- */

const L0: Pt = [50, 50]
const L_SURF = 130
/** 光の道筋：真下からの角度 a で出た光の、時間 tau（空気の中で進む距離で表す）の位置 */
function rayAt(a: number, tau: number): Pt {
  const dAir = (L_SURF - L0[1]) / Math.cos(a)
  if (tau <= dAir) return [L0[0] + tau * Math.sin(a), L0[1] + tau * Math.cos(a)]
  const b = Math.asin(Math.sin(a) / 1.333)
  const w = (tau - dAir) * 0.75
  return [L0[0] + dAir * Math.sin(a) + w * Math.sin(b), L_SURF + w * Math.cos(b)]
}
const B0: Pt = [380, 255]
const B_SC = 30
/** 同じ速さ（毎秒10m）で角度 a に投げたボールの、s 秒後の位置と、それまでの作用（モーペルテュイの数え方） */
const throwAt = (a: number, s: number): Pt => [B0[0] + 10 * Math.cos(a) * s * B_SC, B0[1] - (10 * Math.sin(a) * s - 0.5 * G * s * s) * B_SC]
const throwW = (a: number, s: number) => 100 * s - G * 10 * Math.sin(a) * s * s + (G * G * s * s * s) / 3
function timeForW(a: number, w: number): number {
  let lo = 0
  let hi = (10 * Math.sin(a)) / G // 頂上までに収める
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2
    if (throwW(a, m) < w) lo = m
    else hi = m
  }
  return (lo + hi) / 2
}

export function FigAnalogy() {
  const rays = Array.from({ length: 8 }, (_, i) => ((5 + i * 9) * Math.PI) / 180)
  const fine = Array.from({ length: 41 }, (_, i) => ((5 + (i * 63) / 40) * Math.PI) / 180)
  const throws = Array.from({ length: 8 }, (_, i) => ((25 + i * 8) * Math.PI) / 180)
  const fineT = Array.from({ length: 41 }, (_, i) => ((25 + (i * 56) / 40) * Math.PI) / 180)
  return (
    <Figure n="4-9" title="光の道筋とボールの道筋は、同じ形の計算で求められる" caption="左は1点から出た光が水に入って曲がる様子、右は1点から同じ速さでいろいろな向きに投げたボールの道筋です（模式図）。破線は、左では出発してから同じ時間で届く点を、右では作用（モーペルテュイの数え方）が同じ値になる点を結んだ線です。どちらも破線は道筋と直角に交わります。">
      <Svg id="4-9" w={720} h={330} label="左：1点から出た光の道筋と、同じ時間で届く点を結んだ線。右：1点から同じ速さで投げたボールの道筋と、作用が同じ値になる点を結んだ線。どちらも線は道筋と直角に交わる。">
        <line x1={360} y1={10} x2={360} y2={320} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        <T x={180} y={18} anchor="middle" bold>
          光（フェルマーの原理）
        </T>
        <T x={540} y={18} anchor="middle" bold>
          ボール（ハミルトンの原理）
        </T>
        {/* 左：光 */}
        <rect x={20} y={L_SURF} width={320} height={140} fill="var(--fig-box3)" opacity={0.7} />
        <line x1={20} y1={L_SURF} x2={340} y2={L_SURF} stroke="var(--fig-line)" />
        <T x={330} y={L_SURF - 12} anchor="end" fs={11.5} tone="muted">
          空気
        </T>
        <T x={330} y={258} anchor="end" fs={11.5} tone="muted">
          水
        </T>
        {rays.map((a, i) => (
          <path key={i} d={line(Array.from({ length: 81 }, (_, j) => rayAt(a, j * 5)).filter((p) => p[0] < 340 && p[1] < 270))} fill="none" stroke="var(--fig-line)" strokeWidth={1.2} />
        ))}
        {[60, 140, 220].map((tau) => (
          <path
            key={tau}
            d={line(fine.map((a) => rayAt(a, tau)).filter((p) => p[0] < 340 && p[1] < 270))}
            fill="none"
            stroke="var(--fig-accent)"
            strokeWidth={1.8}
            strokeDasharray="6 4"
          />
        ))}
        <Ball x={L0[0]} y={L0[1]} r={5} />
        <T x={L0[0] - 8} y={L0[1] - 16} fs={12}>
          光が出る点
        </T>
        {/* 右：ボール */}
        <line x1={370} y1={B0[1]} x2={710} y2={B0[1]} stroke="var(--fig-line)" strokeWidth={1.5} />
        {throws.map((a, i) => {
          const tl = (2 * 10 * Math.sin(a)) / G
          const pts = Array.from({ length: 41 }, (_, j) => throwAt(a, (tl * j) / 40)).filter((p) => p[0] < 712)
          return <path key={i} d={line(pts)} fill="none" stroke="var(--fig-line)" strokeWidth={1.2} />
        })}
        {[10, 20, 30].map((w) => (
          <path key={w} d={line(fineT.map((a) => throwAt(a, timeForW(a, w))))} fill="none" stroke="var(--fig-accent)" strokeWidth={1.8} strokeDasharray="6 4" />
        ))}
        <Ball x={B0[0]} y={B0[1]} r={5} />
        <T x={B0[0] - 6} y={B0[1] + 18} fs={12}>
          投げる点
        </T>
        <T x={20} y={292} fs={11.5}>
          実線：光の道筋
        </T>
        <T x={20} y={310} fs={11.5} tone="acc">
          破線：出発してから同じ時間で届く点
        </T>
        <T x={380} y={292} fs={11.5}>
          実線：ボールの道筋
        </T>
        <T x={380} y={310} fs={11.5} tone="acc">
          破線：作用が同じ値になる点
        </T>
      </Svg>
    </Figure>
  )
}
