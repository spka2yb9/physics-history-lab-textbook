import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Trail, clamp01, ease, rng } from './common'

/*
 * 第29章の図の決まり：
 *   光（γ線・光子）：第17・18章と同じ黄色（LIGHT）の波線
 *   電子          ：線の色（--fig-line）
 *   陽電子        ：紫（POS）
 * 色だけで区別せず、必ず文字を添える。
 */

const LIGHT = '#e0a000'
const POS = '#a855c8'

/** 色を指定した文字（CSS の文字色の指定より優先させるため style で塗る） */
function TC({ x, y, color, fs = 12.5, anchor = 'start', children }: { x: number; y: number; color: string; fs?: number; anchor?: 'start' | 'middle' | 'end'; children: string }) {
  return (
    <text x={x} y={y} fontSize={fs} textAnchor={anchor} dominantBaseline="central" style={{ fill: color }}>
      {children}
    </text>
  )
}

/** 2点を結ぶ波線（光子・γ線） */
function wavy(x1: number, y1: number, x2: number, y2: number, amp = 4, wl = 12, phase = 0): string {
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 1) return `M${x1},${y1}`
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  let d = ''
  for (let s = 0; s <= len; s += 2) {
    const o = amp * Math.sin((2 * Math.PI * s) / wl + phase)
    d += `${s ? 'L' : 'M'}${(x1 + ux * s - uy * o).toFixed(1)},${(y1 + uy * s + ux * o).toFixed(1)}`
  }
  return d
}

function Photon({ x1, y1, x2, y2, phase = 0 }: { x1: number; y1: number; x2: number; y2: number; phase?: number }) {
  return <path d={wavy(x1, y1, x2, y2, 4, 12, phase)} fill="none" stroke={LIGHT} strokeWidth={2} />
}

/** 中心 (cx, cy)、半径 r、角度 a0 から a1 までの円弧の点の並び（画面の座標で、角度は下向きが正） */
function arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 40): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number]
  })
}

const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/* ---------- 図29-1 ディラックの考えた負のエネルギーの海（動） ---------- */

export function FigDiracSea() {
  const cols = Array.from({ length: 14 }, (_, i) => 120 + i * 30)
  const rows = [185, 210, 235, 260]
  const tx = 360
  const ty = 185
  const upY = 80
  return (
    <Anim
      n="29-1"
      title="下の帯の電子が上に移ると、電子と「穴」が1組できる"
      still={4.5}
      period={10}
      caption="ディラックが1930〜1931年に考えた様子の模式図です。上下はエネルギーの大きさを表し、横の位置には意味がありません。下の帯は負のエネルギーの状態で、すべて電子で埋まっています。光（γ線）を受け取った電子が上に移ると穴が残り、穴は正の電気を持つ粒子として見えます。"
    >
      {(t) => {
        const up = ease((t - 2) / 1.2)
        const down = ease((t - 6) / 1.2)
        const ey = t < 6 ? ty + (upY - ty) * up : upY + (ty - upY) * down
        const holeOpen = t >= 2 && t < 7.2
        const step = t < 2 ? 0 : t < 6 ? 1 : 2
        const steps = [
          '光（γ線）が、下の帯の電子の1個に当たる',
          '電子が上の帯に移り、穴が残る（電子と陽電子が生まれる）',
          '電子が穴に戻り、光が出る（電子と陽電子が消える）',
        ]
        const inX = 100 + 250 * clamp01(t / 2)
        const outX = 360 + 160 * clamp01((t - 7.2) / 1.5)
        return (
          <Svg id="29-1" w={720} h={320} label="縦にエネルギーをとった模式図。上の帯は正のエネルギー、下の帯は電子で埋まった負のエネルギーの状態。光を受け取った下の電子が上へ移ると、下に穴が残る。電子が穴に戻ると光が出る。">
            <Arrow x1={40} y1={280} x2={40} y2={24} />
            <T x={52} y={20} fs={12}>
              エネルギー（上ほど大きい）
            </T>
            <rect x={100} y={40} width={420} height={80} fill="var(--fig-box3)" stroke="var(--fig-line)" opacity={0.8} />
            <rect x={100} y={170} width={420} height={100} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={535} y={62} fs={12.5} bold>
              正のエネルギー
            </T>
            <T x={535} y={82} fs={12} tone="muted">
              （ふつうの電子）
            </T>
            <T x={535} y={200} fs={12.5} bold>
              負のエネルギー
            </T>
            <T x={535} y={220} fs={12} tone="muted">
              （すべて電子で埋まっている）
            </T>
            <Arrow x1={112} y1={124} x2={112} y2={166} both />
            <T x={124} y={136} fs={11.5} tone="muted">
              すき間：電子2個分の
            </T>
            <T x={124} y={154} fs={11.5} tone="muted">
              質量に当たるエネルギー
            </T>
            {rows.map((y) =>
              cols.map((x) => (x === tx && y === ty ? null : <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill="var(--fig-line)" />)),
            )}
            {holeOpen && (
              <>
                <circle cx={tx} cy={ty} r={6.5} fill="var(--fig-bg)" stroke={POS} strokeWidth={2} strokeDasharray="3 2" />
                <TC x={tx + 14} y={158} color={POS}>
                  穴（陽電子として見える）
                </TC>
              </>
            )}
            <circle cx={tx} cy={ey} r={6} fill="var(--fig-line)" />
            {t >= 2 && t < 7.2 && (
              <T x={tx + 14} y={ey} fs={12.5}>
                電子
              </T>
            )}
            {t < 2 && (
              <>
                <Photon x1={200} y1={45} x2={200 + (inX - 100) * 0.62} y2={45 + (inX - 100) * 0.53} phase={-t * 8} />
                <TC x={140} y={70} color={LIGHT} fs={12.5}>
                  光（γ線）
                </TC>
              </>
            )}
            {t >= 7.2 && t < 9.5 && (
              <>
                <Photon x1={360} y1={150} x2={outX} y2={150} phase={-t * 8} />
                <TC x={535} y={148} color={LIGHT}>
                  光（γ線）が出る
                </TC>
              </>
            )}
            <T x={100} y={300} fs={13} tone="acc">
              {steps[step]}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図29-2 アンダーソンの霧箱の跡（動・切り替え） ---------- */

// 霧箱は縦横17cm を 300px で描く（1cm は約17.6px）。磁場は紙面の奥向き。
// 上へ進む正の粒子は左へ曲がる。板の下は半径約14cm、板の上は半径約5.1cm（エネルギー 63 と 23 の比から）。
const CM = 300 / 17
const R1 = 14 * CM
const R2 = 5.1 * CM
const PX = 270
const C1 = { x: PX - R1, y: 185 }
const C2 = { x: PX - R2, y: 175 }
const A1 = Math.asin((330 - 185) / R1) // 板の下で箱の下端に届く角度
const LOW = arc(C1.x, C1.y, R1, A1, 0, 60)
const HIGH = arc(C2.x, C2.y, R2, 0, -(59 / 10) * (CM / R2), 50) // 板の上で約59mm 進む
const HIGH_P = arc(C2.x, C2.y, R2, 0, -(5 / 10) * (CM / R2), 6) // 陽子なら約5mm で止まる
const JIT = (() => {
  const r = rng(29)
  return Array.from({ length: 200 }, () => [r() - 0.5, r() - 0.5])
})()

/** 道筋を、時刻に応じて途中まで滴の並びで描く */
function Drops({ pts, upto, color }: { pts: [number, number][]; upto: number; color: string }) {
  const out = []
  let acc = 0
  let k = 0
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const seg = Math.hypot(x1 - x0, y1 - y0)
    for (let s = 0; s < seg; s += 4) {
      if (acc + s > upto) return <g>{out}</g>
      const f = s / seg
      const [jx, jy] = JIT[k++ % JIT.length]
      out.push(<circle key={`${i}-${s}`} cx={x0 + (x1 - x0) * f + jx * 1.6} cy={y0 + (y1 - y0) * f + jy * 1.6} r={1.6} fill={color} />)
    }
    acc += seg
  }
  return <g>{out}</g>
}

const lengthOf = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)

export function FigChamber() {
  const [kind, setKind] = useState<'pos' | 'proton'>('pos')
  const lowLen = lengthOf(LOW)
  const high = kind === 'pos' ? HIGH : HIGH_P
  const highLen = lengthOf(high)
  return (
    <Anim
      n="29-2"
      title="鉛の板の上で強く曲がる跡から、上へ進む正の粒子だと分かる"
      still={6}
      period={8}
      controls={
        <Choice
          label="粒子の種類"
          options={[
            { value: 'pos', label: '観測された跡（陽電子）' },
            { value: 'proton', label: '同じ曲がり方の陽子なら' },
          ]}
          value={kind}
          onChange={setKind}
        />
      }
      caption="アンダーソンの1932年の写真をもとにした模式図で、写真の転載ではありません。曲がり方は、アンダーソンが示したエネルギーと磁場の強さから計算しています。磁場は紙面の奥へ向かう向きで、この向きでは、上へ進む正の粒子は左へ曲がります。「同じ曲がり方の陽子なら」を選ぶと、陽子は約5mmで止まり、実際の跡と合わないことが分かります。"
    >
      {(t) => {
        const lowUpto = (lowLen * clamp01(t / 2.6)) | 0
        const highUpto = highLen * clamp01((t - 2.8) / (kind === 'pos' ? 2 : 0.4))
        const head = (() => {
          if (t < 2.6) {
            const f = clamp01(t / 2.6) * (LOW.length - 1)
            return LOW[Math.floor(f)]
          }
          if (t < 2.8) return [PX, 180] as [number, number]
          const f = clamp01((t - 2.8) / (kind === 'pos' ? 2 : 0.4)) * (high.length - 1)
          return high[Math.floor(f)]
        })()
        const done = kind === 'proton' && t > 3.2
        return (
          <Svg id="29-2" w={720} h={370} label="縦横17cmの霧箱の中央に厚さ6mmの鉛の板がある。下から入った粒子の跡は板の下でゆるやかに、板の上で強く左へ曲がる。陽子なら板の上で約5mmで止まるはずだが、実際の跡は50mm以上続いた。">
            <rect x={100} y={30} width={300} height={300} rx={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={100} y={16} fs={12} tone="muted">
              霧箱（縦横17cm）
            </T>
            {[
              [140, 70],
              [140, 270],
              [350, 70],
              [355, 270],
              [330, 140],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`} stroke="var(--fig-muted)" strokeWidth={1.2}>
                <circle cx={x} cy={y} r={7} fill="none" />
                <line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} />
                <line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} />
              </g>
            ))}
            <rect x={100} y={175} width={300} height={10} fill="var(--fig-line)" opacity={0.55} />
            <line x1={400} y1={180} x2={418} y2={180} stroke="var(--fig-muted)" />
            <T x={424} y={180} fs={12.5}>
              鉛の板（厚さ6mm）
            </T>
            <Drops pts={LOW} upto={lowUpto} color="var(--fig-line)" />
            {t > 2.6 && <line x1={PX} y1={185} x2={PX} y2={175} stroke="var(--fig-line)" strokeWidth={1} strokeDasharray="2 2" />}
            {t > 2.8 && <Drops pts={high} upto={highUpto} color={kind === 'pos' ? POS : 'var(--fig-danger)'} />}
            {kind === 'proton' && <Trail points={HIGH} />}
            {!done && <Ball x={head[0]} y={head[1]} r={4} fill={kind === 'pos' ? POS : 'var(--fig-danger)'} stroke="none" />}
            {done && <Cross x={HIGH_P[HIGH_P.length - 1][0]} y={HIGH_P[HIGH_P.length - 1][1]} s={6} />}
            <T x={424} y={262} fs={12.5}>
              板の下：ゆるやかに曲がる
            </T>
            <T x={424} y={282} fs={12} tone="muted">
              → エネルギーが大きい
            </T>
            {kind === 'pos' ? (
              <>
                <T x={424} y={60} fs={12.5}>
                  板の上：強く曲がる
                </T>
                <T x={424} y={80} fs={12} tone="muted">
                  → 板を通ってエネルギーが減った
                </T>
                <T x={424} y={108} fs={12.5} tone="acc">
                  下から上へ進んだと分かる
                </T>
                <T x={424} y={130} fs={12.5} tone="acc">
                  上へ進んで左へ曲がる → 正の電気
                </T>
              </>
            ) : (
              <>
                <T x={424} y={60} fs={12.5} tone="danger">
                  陽子なら、約5mmで止まる
                </T>
                <T x={424} y={82} fs={12} tone="muted">
                  点線：実際の跡（50mm以上続いた）
                </T>
                <T x={424} y={108} fs={12.5} tone="danger">
                  → 陽子ではない
                </T>
              </>
            )}
            <g stroke="var(--fig-muted)" strokeWidth={1.2}>
              <circle cx={107} cy={352} r={7} fill="none" />
              <line x1={102} y1={347} x2={112} y2={357} />
              <line x1={102} y1={357} x2={112} y2={347} />
            </g>
            <T x={122} y={352} fs={12}>
              磁場（紙面の奥へ向かう向き）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図29-3 対生成と対消滅（動） ---------- */

export function FigPair() {
  return (
    <Anim
      n="29-3"
      title="γ線から電子と陽電子が生まれ、電子と陽電子は出会うと2本のγ線になる"
      still={3.6}
      period={7}
      caption="模式図です。左は磁場（紙面の奥へ向かう向き）の中で生まれた電子と陽電子で、電気が反対なので逆向きに曲がります。右の2本のγ線は反対向きに飛び、病院の PET 検査はこの2本を測ります。"
    >
      {(t) => {
        const a = clamp01(t / 1.4)
        const b = clamp01((t - 1.4) / 2)
        // 左：対生成
        const vx = 150
        const vy = 150
        const R = 70
        const eArc = arc(vx, vy + R, R, -Math.PI / 2, -Math.PI / 2 + 2.2 * b, 30) // 下へ曲がる（電子）
        const pArc = arc(vx, vy - R, R, Math.PI / 2, Math.PI / 2 - 2.2 * b, 30) // 上へ曲がる（陽電子）
        // 右：対消滅
        const mx = 545
        const my = 150
        const c = clamp01(t / 1.4)
        const d = clamp01((t - 1.4) / 1.6)
        return (
          <Svg id="29-3" w={720} h={300} label="左：γ線が物質の中で電子と陽電子の1組になり、磁場の中で逆向きに曲がる。右：陽電子と電子が出会って消え、反対向きに飛ぶ2本のγ線になる。">
            <T x={20} y={22} bold>
              対生成
            </T>
            <T x={80} y={22} fs={12} tone="muted">
              γ線 → 電子と陽電子
            </T>
            <T x={380} y={22} bold>
              対消滅
            </T>
            <T x={440} y={22} fs={12} tone="muted">
              電子と陽電子 → 2本のγ線
            </T>
            <line x1={360} y1={10} x2={360} y2={290} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            {/* 左 */}
            <Photon x1={20} y1={vy} x2={20 + (vx - 20) * a} y2={vy} phase={-t * 8} />
            <TC x={24} y={vy - 22} color={LIGHT}>
              γ線
            </TC>
            <circle cx={vx} cy={vy} r={5} fill="var(--fig-muted)" />
            <T x={vx - 8} y={vy + 22} fs={11.5} tone="muted" anchor="end">
              物質の中の原子核
            </T>
            {b > 0 && (
              <>
                <path d={poly(eArc)} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
                <path d={poly(pArc)} fill="none" stroke={POS} strokeWidth={2} />
                <Ball x={eArc[eArc.length - 1][0]} y={eArc[eArc.length - 1][1]} r={4} fill="var(--fig-line)" stroke="none" />
                <Ball x={pArc[pArc.length - 1][0]} y={pArc[pArc.length - 1][1]} r={4} fill={POS} stroke="none" />
              </>
            )}
            {b > 0.5 && (
              <>
                <T x={250} y={238} fs={12.5}>
                  電子（負）
                </T>
                <TC x={250} y={62} color={POS}>
                  陽電子（正）
                </TC>
              </>
            )}
            {/* 右 */}
            {d === 0 && (
              <>
                <line x1={400} y1={my} x2={400 + (mx - 6 - 400) * c} y2={my} stroke={POS} strokeWidth={2} />
                <Ball x={400 + (mx - 6 - 400) * c} y={my} r={4} fill={POS} stroke="none" />
                <line x1={690} y1={my} x2={690 - (690 - mx - 6) * c} y2={my} stroke="var(--fig-line)" strokeWidth={2} />
                <Ball x={690 - (690 - mx - 6) * c} y={my} r={4} fill="var(--fig-line)" stroke="none" />
                <TC x={400} y={my - 20} color={POS}>
                  陽電子
                </TC>
                <T x={690} y={my - 20} fs={12.5} anchor="end">
                  電子
                </T>
              </>
            )}
            {d > 0 && (
              <>
                <Photon x1={mx} y1={my} x2={mx - 72 * d} y2={my - 90 * d} phase={-t * 8} />
                <Photon x1={mx} y1={my} x2={mx + 72 * d} y2={my + 90 * d} phase={-t * 8} />
                <TC x={mx - 72 * d - 8} y={my - 90 * d - 10} color={LIGHT} anchor="end">
                  γ線
                </TC>
                <TC x={mx + 72 * d + 8} y={my + 90 * d + 10} color={LIGHT}>
                  γ線
                </TC>
                <T x={mx + 18} y={my - 30} fs={12} tone="muted">
                  反対向きに2本
                </T>
              </>
            )}
            <circle cx={mx} cy={my} r={3} fill="var(--fig-muted)" />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図29-4 場の揺れが粒子として検出される（動・切り替え） ---------- */

const NPT = 72
const FX = (i: number) => 30 + i * 9
const NOISE = (() => {
  const r = rng(2929)
  return Array.from({ length: NPT }, () => ({ w: 3 + r() * 5, p: r() * 6.28, w2: 5 + r() * 6, p2: r() * 6.28 }))
})()
const DET = 520

export function FigFieldRipple() {
  const [mode, setMode] = useState<'one' | 'two' | 'none'>('one')
  const speed = 80
  const sigma = 50
  return (
    <Anim
      n="29-4"
      title="場の揺れが通る所で、粒子1個が検出される"
      still={7.25}
      period={10.5}
      controls={
        <Choice
          label="場の状態"
          options={[
            { value: 'one', label: '粒子1個' },
            { value: 'two', label: '粒子2個' },
            { value: 'none', label: '粒子なし（真空）' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="模式図です。点の高さは空間の各点での場の値を表し、ひもの揺れそのものではありません。揺れが広がっている範囲のどこで粒子が見つかるかは確率で決まります（第24章）。この図では検出器の所で見つかる場合を描いています。"
    >
      {(t) => {
        const centers = mode === 'one' ? [-60 + speed * t] : mode === 'two' ? [-60 + speed * t, -360 + speed * t] : []
        const val = (x: number, i: number) => {
          const n = NOISE[i]
          let v = 2.2 * Math.sin(n.w * t + n.p) + 1.5 * Math.sin(n.w2 * t + n.p2)
          for (const c of centers) {
            const u = (x - c) / sigma
            v += 36 * Math.exp(-u * u) * Math.sin((2 * Math.PI * (x - c)) / 44 - 9 * t)
          }
          return v
        }
        const hit = centers.some((c) => Math.abs(c - DET) < sigma * 0.5)
        const count = mode === 'one' ? '電子1個分' : mode === 'two' ? '電子2個分' : '0個分（真空）'
        return (
          <Svg id="29-4" w={720} h={260} label="横一列の点が空間の各点の場の値を表す。揺れのかたまりが右へ進み、検出器の所を通ると電子1個が検出される。粒子がない真空でも、場の値は小さく揺らいでいる。">
            <T x={30} y={20} fs={12.5} bold>
              電子の場（空間の各点での値）
            </T>
            <T x={690} y={20} fs={12.5} anchor="end" tone="acc">
              {`場の揺れ：${count}`}
            </T>
            <line x1={24} y1={115} x2={672} y2={115} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            {Array.from({ length: NPT }, (_, i) => {
              const x = FX(i)
              const y = 115 - val(x, i)
              return (
                <g key={i}>
                  <line x1={x} y1={115} x2={x} y2={y} stroke="var(--fig-muted)" strokeWidth={1} />
                  <circle cx={x} cy={y} r={2.6} fill="var(--fig-line)" />
                </g>
              )
            })}
            <rect x={DET - 24} y={180} width={48} height={30} rx={4} fill={hit ? 'var(--fig-accent)' : 'var(--fig-box)'} stroke="var(--fig-line)" />
            <line x1={DET} y1={168} x2={DET} y2={180} stroke="var(--fig-line)" />
            <T x={DET} y={226} fs={12} anchor="middle">
              検出器
            </T>
            {hit && (
              <T x={DET + 34} y={195} fs={12.5} tone="acc">
                ここで電子1個を検出
              </T>
            )}
            {mode === 'none' && (
              <T x={30} y={195} fs={12.5}>
                小さな揺らぎはあるが、粒子は検出されない
              </T>
            )}
            {mode !== 'none' && (
              <T x={30} y={195} fs={12.5}>
                揺れのかたまりが右へ進む
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図29-5 自分の場のエネルギーが限りなく増える（動） ---------- */

export function FigSelfEnergy() {
  const radii = [120, 60, 30, 15, 7.5, 3.75]
  const cx = 200
  const cy = 152
  return (
    <Anim
      n="29-5"
      title="電子に近い所まで数えるほど、自分の場のエネルギーは限りなく増える"
      still={8}
      period={10}
      caption="古い電磁気学（ローレンツ）の考えによる模式図です。電子を大きさのない点とすると、半径を半分にするたびに、新しく加わる殻のエネルギーは1つ外側の殻の2倍になります。量子論の計算では増え方がゆるやかになりますが、限りなく増えることは変わりません。"
    >
      {(t) => {
        const k = Math.min(radii.length, Math.floor(t / 1.1) + 1)
        const unit = 7
        let top = 250
        const blocks = radii.slice(0, k).map((_, i) => {
          const h = unit * 2 ** i
          const y = top - h
          top = y
          return { y, h, i }
        })
        const over = top < 40
        return (
          <Svg id="29-5" w={720} h={280} label="点の電子のまわりに、半径が半分ずつ小さくなる殻を描く。内側の殻を数えるほど、右の棒で表したエネルギーの合計が増え、限りなく大きくなる。">
            {radii.map((r, i) => (
              <circle key={r} cx={cx} cy={cy} r={r} fill={i < k ? 'var(--fig-box3)' : 'none'} fillOpacity={0.35} stroke={i === k - 1 ? 'var(--fig-accent)' : 'var(--fig-muted)'} strokeWidth={i === k - 1 ? 2 : 1} strokeDasharray={i < k ? undefined : '3 3'} />
            ))}
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * Math.PI) / 6
              return <line key={i} x1={cx + 6 * Math.cos(a)} y1={cy + 6 * Math.sin(a)} x2={cx + 120 * Math.cos(a)} y2={cy + 120 * Math.sin(a)} stroke="var(--fig-muted)" strokeWidth={0.8} opacity={0.6} />
            })}
            <Ball x={cx} y={cy} r={4} fill="var(--fig-line)" stroke="none" />
            <T x={cx} y={16} fs={12.5} anchor="middle">
              電子とそのまわりの電場（中心が電子）
            </T>
            <line x1={430} y1={250} x2={620} y2={250} stroke="var(--fig-line)" />
            {blocks.map((b) =>
              b.y >= 40 ? (
                <rect key={b.i} x={480} y={b.y} width={60} height={b.h} fill={b.i === k - 1 ? 'var(--fig-accent)' : 'var(--fig-box3)'} stroke="var(--fig-line)" />
              ) : (
                <rect key={b.i} x={480} y={40} width={60} height={Math.max(0, b.y + b.h - 40)} fill="var(--fig-accent)" stroke="var(--fig-line)" />
              ),
            )}
            <T x={430} y={266} fs={12} tone="muted">
              場にたくわえられるエネルギーの合計
            </T>
            <T x={560} y={200} fs={12.5}>
              {`数えた殻：${k}個`}
            </T>
            {over && (
              <>
                <Arrow x1={510} y1={40} x2={510} y2={12} danger />
                <T x={528} y={22} fs={12.5} tone="danger">
                  限りなく大きくなる
                </T>
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図29-6 ラムシフト ---------- */

export function FigLambShift() {
  // 間隔の比は測定値（約1000メガヘルツと約1万1000メガヘルツ）に合わせる
  const p12 = 200
  const p32 = 70
  const s12 = p12 - (130 * 1059) / 10972
  const lvl = (x: number, y: number, label: string) => (
    <g>
      <line x1={x} y1={y} x2={x + 120} y2={y} stroke="var(--fig-line)" strokeWidth={2.5} />
      <T x={x + 130} y={y} fs={12.5}>
        {label}
      </T>
    </g>
  )
  return (
    <Figure
      n="29-6"
      title="ディラックの理論では同じ高さの2つの準位が、実際にはわずかにずれていた"
      caption="水素原子の、下から2番目のエネルギーの段にある3つの状態です。縦の間隔の比はおおよそ実際どおりです。2Sの準位が2P（低い方）より少し高く、その差は1秒に約10億回振動するマイクロ波のエネルギーに当たります。"
    >
      <Svg id="29-6" w={680} h={250} label="左はディラックの理論で、2Sと2P（低い方）が同じ高さにある。右はラムとレザフォードの測定で、2Sが2P（低い方）よりわずかに高い。">
        <T x={40} y={24} bold>
          ディラックの理論（1928年）
        </T>
        <T x={380} y={24} bold>
          ラムとレザフォードの測定（1947年）
        </T>
        {lvl(40, p32, '2P（高い方）')}
        {lvl(40, p12, '2Sと2P（低い方）が同じ高さ')}
        {lvl(380, p32, '2P（高い方）')}
        <line x1={380} y1={s12} x2={500} y2={s12} stroke="var(--fig-accent)" strokeWidth={2.5} />
        <T x={540} y={s12 - 10} fs={12.5} tone="acc">
          2S
        </T>
        <line x1={380} y1={p12} x2={500} y2={p12} stroke="var(--fig-line)" strokeWidth={2.5} />
        <T x={540} y={p12 + 10} fs={12.5}>
          2P（低い方）
        </T>
        <line x1={500} y1={s12} x2={528} y2={s12} stroke="var(--fig-muted)" strokeDasharray="3 3" />
        <line x1={500} y1={p12} x2={528} y2={p12} stroke="var(--fig-muted)" strokeDasharray="3 3" />
        <Arrow x1={520} y1={s12 - 28} x2={520} y2={s12 - 1} />
        <Arrow x1={520} y1={p12 + 28} x2={520} y2={p12 + 1} />
        <T x={380} y={240} fs={12} tone="acc">
          2Sと2P（低い方）のずれ：約1000メガヘルツ
        </T>
        <line x1={355} y1={40} x2={355} y2={240} stroke="var(--fig-muted)" strokeDasharray="4 4" />
      </Svg>
    </Figure>
  )
}

/* ---------- 図29-7 繰り込みの手順 ---------- */

export function FigRenorm() {
  return (
    <Figure
      n="29-7"
      title="無限大を質量と電荷の中にまとめ、測った値に置き換える"
      caption="繰り込みの手順を、電子の質量の例で描いた模式図です。電荷についても同じことをします。上の2つの量はどちらも単独では測れず、測れるのは合わさった値だけです。"
    >
      <Svg id="29-7" w={720} h={290} label="電子のもとの質量と、自分の場がつくる無限大の分は、合わさって測られる電子の質量になる。計算の中でこの組み合わせを測った値に置き換えると、残りの部分は有限になり、ラムシフトや電子の磁石としての強さが計算できる。">
        <Box x={20} y={20} w={250} h={56} lines={['電子のもとの質量', '（理論の中の量。測れない）']} subTone="muted" fs={12.5} />
        <Box x={20} y={96} w={250} h={56} lines={['自分の場がつくる分', '（計算すると無限大）']} subTone="danger" fs={12.5} />
        <Arrow x1={272} y1={48} x2={348} y2={78} />
        <Arrow x1={272} y1={124} x2={348} y2={96} />
        <Box x={350} y={58} w={250} h={56} lines={['実際に測られる電子の質量', '（有限の値）']} subTone="muted" fs={12.5} accent />
        <Arrow d="M475,116 L475,174 L125,174 L125,198" />
        <Box x={20} y={200} w={210} h={70} lines={['計算の中のこの組み合わせを', '測った値に置き換える']} fs={12.5} />
        <Arrow x1={232} y1={235} x2={256} y2={235} />
        <Box x={258} y={200} w={200} h={70} lines={['残りの部分を計算すると', '有限の値になる']} fs={12.5} />
        <Arrow x1={460} y1={235} x2={484} y2={235} />
        <Box x={486} y={200} w={220} h={70} lines={['ラムシフトや電子の', '磁石としての強さを予言', '→ 実験と一致']} fs={12.5} fill="box4" />
      </Svg>
    </Figure>
  )
}

/* ---------- 図29-8 道筋の足し合わせ（動・スライダー） ---------- */

const NP = 21
const MID = 10
const PA = { x: 40, y: 250 }
const PB = { x: 330, y: 250 }
const X0 = 430
const Y0 = 235

export function FigPathSum() {
  const [mass, setMass] = useState(3)
  const names = ['', 'とても軽い', '軽い', '中くらい', '重い', 'とても重い']
  const phase = (i: number) => mass * 0.022 * (i - MID) ** 2
  const lit = (i: number) => phase(i) < 1.4
  const L = 16
  return (
    <Anim
      n="29-8"
      title="実際の道筋に近い道筋の矢印だけが同じ向きにそろい、足し合わせた結果を決める"
      still={7}
      period={8.5}
      controls={<Range label="物体の質量" min={1} max={5} value={mass} onChange={setMass} format={(v) => names[v]} />}
      caption="模式図です。左の青い線は、矢印の向きが実際の道筋の矢印とほぼそろう道筋です。質量を大きくすると、そろう道筋は実際の道筋の近くに限られ、遠い道筋の矢印は向きを変えながら丸まり、打ち消し合います。"
    >
      {(t) => {
        const shown = Math.min(NP, Math.floor(t / 0.25) + 1)
        let x = X0
        let y = Y0
        const segs = Array.from({ length: shown }, (_, i) => {
          const a = -phase(i)
          const x2 = x + L * Math.cos(a)
          const y2 = y + L * Math.sin(a)
          const s = { x1: x, y1: y, x2, y2, i }
          x = x2
          y = y2
          return s
        })
        const pathD = (i: number) => {
          const h = 110 + (i - MID) * 8
          return `M${PA.x},${PA.y} Q${(PA.x + PB.x) / 2},${PA.y - 2 * h} ${PB.x},${PB.y}`
        }
        const now = shown < NP ? shown - 1 : -1
        return (
          <Svg id="29-8" w={720} h={300} label="左に点Aから点Bへの21本の道筋の候補。右に、道筋ごとの小さな矢印を順につないだ線と、全体を足し合わせた矢印。質量が大きいと、実際の道筋の近くの矢印だけがそろう。">
            <T x={20} y={18} fs={12.5} bold>
              AからBへの道筋の候補
            </T>
            <T x={400} y={18} fs={12.5} bold>
              道筋ごとの矢印を順につなぐ
            </T>
            {Array.from({ length: NP }, (_, i) => (
              <path
                key={i}
                d={pathD(i)}
                fill="none"
                stroke={i === MID ? 'var(--fig-line)' : lit(i) ? 'var(--fig-accent)' : 'var(--fig-muted)'}
                strokeWidth={i === MID ? 2.5 : i === now ? 2 : 1}
                opacity={i === MID || lit(i) || i === now ? 1 : 0.45}
              />
            ))}
            <Ball x={PA.x} y={PA.y} r={5} fill="var(--fig-line)" stroke="none" />
            <Ball x={PB.x} y={PB.y} r={5} fill="var(--fig-line)" stroke="none" />
            <T x={PA.x - 6} y={PA.y + 18} fs={12.5}>
              A
            </T>
            <T x={PB.x - 4} y={PB.y + 18} fs={12.5}>
              B
            </T>
            <T x={120} y={275} fs={12} tone="muted">
              太い線：実際の道筋
            </T>
            {segs.map((s) => {
              const c = s.i === MID ? 'var(--fig-line)' : lit(s.i) ? 'var(--fig-accent)' : 'var(--fig-muted)'
              const a = Math.atan2(s.y2 - s.y1, s.x2 - s.x1)
              const h = (d: number) => `${(s.x2 - 5 * Math.cos(a + d)).toFixed(1)},${(s.y2 - 5 * Math.sin(a + d)).toFixed(1)}`
              return (
                <g key={s.i} stroke={c} strokeWidth={2} strokeLinecap="round" fill="none">
                  <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
                  <path d={`M${h(0.5)} L${s.x2.toFixed(1)},${s.y2.toFixed(1)} L${h(-0.5)}`} strokeWidth={1.5} />
                </g>
              )
            })}
            {shown === NP && (
              <>
                <Arrow x1={X0} y1={Y0} x2={x} y2={y} dashed />
                <T x={400} y={276} fs={12.5}>
                  点線の矢印：足し合わせた結果
                </T>
              </>
            )}
            <circle cx={X0} cy={Y0} r={3} fill="var(--fig-line)" />
            <T x={400} y={42} fs={12} tone="muted">
              {mass <= 2 ? '軽いとき：多くの道筋の矢印がそろう' : mass >= 4 ? '重いとき：遠い道筋の矢印は丸まって打ち消し合う' : '実際の道筋の近くの矢印がそろう'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図29-9 ファインマン図の読み方 ---------- */

/** 電子の線（矢印は線の途中に付ける。陽電子は矢印を逆向きにする） */
function ELine({ x1, y1, x2, y2, back }: { x1: number; y1: number; x2: number; y2: number; back?: boolean }) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const len = Math.hypot(x2 - x1, y2 - y1)
  const ux = ((x2 - x1) / len) * 7 * (back ? -1 : 1)
  const uy = ((y2 - y1) / len) * 7 * (back ? -1 : 1)
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={back ? POS : 'var(--fig-line)'} strokeWidth={2} />
      <path d={`M${mx - ux - uy * 0.7},${my - uy + ux * 0.7} L${mx + ux},${my + uy} L${mx - ux + uy * 0.7},${my - uy - ux * 0.7}`} fill="none" stroke={back ? POS : 'var(--fig-line)'} strokeWidth={2} />
    </g>
  )
}

/** 電子の線の2点 (x, y0) と (x, y1) を右へふくらんだ弧で結ぶ波線（自分で出して吸い込む光子） */
function loopPhoton(x: number, y0: number, y1: number): string {
  let d = ''
  for (let k = 0; k <= 60; k++) {
    const f = k / 60
    const y = y0 + (y1 - y0) * f
    const bulge = 46 * Math.sin(Math.PI * f) + 4 * Math.sin(2 * Math.PI * f * 7)
    d += `${k ? 'L' : 'M'}${(x + bulge).toFixed(1)},${y.toFixed(1)}`
  }
  return d
}

export function FigFeynman() {
  const dot = (x: number, y: number) => <circle cx={x} cy={y} r={3.5} fill="var(--fig-line)" />
  return (
    <Figure
      n="29-9"
      title="ファインマン図：直線は電子、波線は光子、下から上へ時間が進む"
      caption="この本では時間を下から上へとって描きます。横の位置は場所を表しますが、図の形は計算の項を区別するためのもので、粒子が実際にその道筋を通るという意味ではありません。陽電子は矢印を時間と逆向きにした電子の線で描きます。"
    >
      <Svg id="29-9" w={720} h={330} label="3つのファインマン図。左：2つの電子が光子を1個やり取りして反発する。中：電子と陽電子が出会って消え、2個の光子になる。右：電子が光子を出して自分で吸い込む図で、計算すると無限大が出る。">
        <Arrow x1={14} y1={300} x2={14} y2={110} />
        <T x={6} y={96} fs={12}>
          時間
        </T>
        {/* 左 */}
        <T x={130} y={22} fs={12.5} anchor="middle" bold>
          電子どうしの反発
        </T>
        <T x={130} y={42} fs={12} anchor="middle" tone="muted">
          光子を1個やり取りする
        </T>
        <ELine x1={70} y1={300} x2={90} y2={200} />
        <ELine x1={90} y1={200} x2={60} y2={100} />
        <ELine x1={200} y1={300} x2={175} y2={180} />
        <ELine x1={175} y1={180} x2={205} y2={100} />
        <Photon x1={90} y1={200} x2={175} y2={180} />
        {dot(90, 200)}
        {dot(175, 180)}
        <T x={44} y={318} fs={12}>
          電子
        </T>
        <T x={186} y={318} fs={12}>
          電子
        </T>
        <TC x={118} y={168} color={LIGHT} fs={12}>
          光子
        </TC>
        {/* 中 */}
        <line x1={250} y1={60} x2={250} y2={320} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <T x={370} y={22} fs={12.5} anchor="middle" bold>
          電子と陽電子の対消滅
        </T>
        <T x={370} y={42} fs={12} anchor="middle" tone="muted">
          2個の光子になる
        </T>
        <ELine x1={300} y1={300} x2={330} y2={220} />
        <ELine x1={330} y1={220} x2={410} y2={220} />
        <ELine x1={440} y1={300} x2={410} y2={220} back />
        <Photon x1={330} y1={220} x2={300} y2={110} />
        <Photon x1={410} y1={220} x2={440} y2={110} />
        {dot(330, 220)}
        {dot(410, 220)}
        <T x={286} y={318} fs={12}>
          電子
        </T>
        <TC x={424} y={318} color={POS} fs={12}>
          陽電子
        </TC>
        <TC x={276} y={96} color={LIGHT} fs={12}>
          光子
        </TC>
        <TC x={428} y={96} color={LIGHT} fs={12}>
          光子
        </TC>
        {/* 右 */}
        <line x1={490} y1={60} x2={490} y2={320} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <T x={605} y={22} fs={12.5} anchor="middle" bold>
          自分の光子を吸い込む
        </T>
        <T x={605} y={42} fs={12} anchor="middle" tone="danger">
          計算すると無限大が出る
        </T>
        <ELine x1={580} y1={300} x2={580} y2={240} />
        <ELine x1={580} y1={240} x2={580} y2={160} />
        <ELine x1={580} y1={160} x2={580} y2={100} />
        <path d={loopPhoton(580, 240, 160)} fill="none" stroke={LIGHT} strokeWidth={2} />
        {dot(580, 240)}
        {dot(580, 160)}
        <T x={568} y={318} fs={12}>
          電子
        </T>
        <TC x={636} y={200} color={LIGHT} fs={12}>
          光子
        </TC>
      </Svg>
    </Figure>
  )
}

/* ---------- 図29-10 理論と測定の一致 ---------- */

const MEAS = '1.00115965218059'
const THEO = '1.00115965218203'
const MATCH = 13 // 「1.00115965218」の文字数（数字12桁と小数点）

function Digits({ x, y, s, match }: { x: number; y: number; s: string; match: number }) {
  return (
    <g>
      {s.split('').map((c, i) => (
        <g key={i}>
          {i < match && c !== '.' && <rect x={x + i * 17 - 1} y={y - 13} width={16} height={26} fill="var(--fig-box3)" />}
          <text x={x + i * 17 + 7} y={y} fontSize={17} textAnchor="middle" dominantBaseline="central" className="mono">
            {c}
          </text>
        </g>
      ))}
    </g>
  )
}

export function FigDigits() {
  const x0 = 300
  return (
    <Figure
      n="29-10"
      title="電子の磁石としての強さは、理論と測定が12桁ほど一致している"
      caption="ディラックの理論の値を1とした割合で表しています。測定値はファンとガブリエルスらの2023年の論文、理論値は青山・木下・仁尾の2018年の計算です。理論値の終わりの数桁は計算に使う別の測定値（電子と光の結びつきの強さ）によって変わり、その測定どうしが食い違っています。"
    >
      <Svg id="29-10" w={720} h={230} label="ディラックの理論の値は1。2023年の測定値は1.00115965218059、2018年の量子電磁力学の計算は1.00115965218203で、先頭から12桁が一致している。">
        <T x={20} y={40} fs={12.5}>
          ディラックの理論（1928年）
        </T>
        <Digits x={x0} y={40} s="1" match={0} />
        <T x={20} y={100} fs={12.5}>
          測定（2023年）
        </T>
        <Digits x={x0} y={100} s={MEAS} match={MATCH} />
        <T x={20} y={150} fs={12.5}>
          量子電磁力学の計算（2018年）
        </T>
        <Digits x={x0} y={150} s={THEO} match={MATCH} />
        <path d={`M${x0},180 L${x0},188 L${x0 + MATCH * 17 - 2},188 L${x0 + MATCH * 17 - 2},180`} fill="none" stroke="var(--fig-accent)" strokeWidth={1.5} />
        <T x={x0} y={206} fs={12.5} tone="acc">
          色を付けた12桁が一致
        </T>
      </Svg>
    </Figure>
  )
}
