import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Force, Trail, Vel, clamp01, ease, rng } from './common'

/*
 * 第32章の図の決まり：
 *   光子・光（γ線、チェレンコフ光）：第29章と同じ黄色（LIGHT）
 *   ニュートリノ：見えないので点線
 *   ミュー型・タウ型のニュートリノ：緑（MU）と橙（TAU）。色だけで区別せず、必ず文字を添える
 */

const LIGHT = '#e0a000'
const MU = '#2f9a5f'
const TAU = '#d0661f'

/** 2点を結ぶ波線（光子・γ線） */
function wavy(x1: number, y1: number, x2: number, y2: number, amp = 3.5, wl = 11): string {
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 1) return `M${x1},${y1}`
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  let d = ''
  for (let s = 0; s <= len; s += 2) {
    const o = amp * Math.sin((2 * Math.PI * s) / wl)
    d += `${s ? 'L' : 'M'}${(x1 + ux * s - uy * o).toFixed(1)},${(y1 + uy * s + ux * o).toFixed(1)}`
  }
  return d
}

function Photon({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <path d={wavy(x1, y1, x2, y2)} fill="none" stroke={LIGHT} strokeWidth={2} />
}

/* ---------- 図32-1 2つの粒子の研究の年表 ---------- */

const YX = (y: number) => 50 + (y - 1910) * 6

const HIGGS_EV = [
  { y: 1964, lines: ['1964年', 'ヒッグスらの', '理論'] },
  { y: 1983, lines: ['1983年', 'Wボソン・Zボソン', 'の発見'] },
  { y: 2012, lines: ['2012年', 'LHCで発見', '（翌年ノーベル賞）'] },
]

const NU_EV = [
  { y: 1914, lv: 1, lines: ['1914年', 'β線のエネルギー', 'がばらつく'] },
  { y: 1930, lv: 2, lines: ['1930年', 'パウリの手紙'] },
  { y: 1956, lv: 1, lines: ['1956年', '原子炉で', '検出'] },
  { y: 1968, lv: 2, lines: ['1968年', '太陽ニュートリノ', 'が足りない'] },
  { y: 1987, lv: 1, lines: ['1987年', '超新星の', 'ニュートリノ'] },
  { y: 1998, lv: 2, lines: ['1998〜2002年', '振動の発見', '（SK・SNO）'] },
  { y: 2015, lv: 1, lines: ['2015年', 'ノーベル賞'] },
]

export function FigTimeline() {
  const ax = 150
  return (
    <Figure n="32-1" title="ヒッグス粒子とニュートリノの研究の年表" caption="横の位置は年に比例しています。軸の上がヒッグス粒子、下がニュートリノにかかわる出来事です。SKはスーパーカミオカンデです。">
      <Svg id="32-1" w={720} h={300} label="年表。ヒッグス粒子は1964年に理論で予言され、1983年にWボソンとZボソンが見つかり、2012年にLHCで発見された。ニュートリノは1914年にβ線のエネルギーのばらつきが示され、1930年にパウリが予言し、1956年に原子炉で検出された。1968年に太陽ニュートリノの不足が分かり、1987年に超新星のニュートリノがとらえられ、1998〜2002年に振動が見つかり、2015年にノーベル賞が贈られた。">
        <T x={14} y={22} fs={12} tone="muted">
          軸の上：ヒッグス粒子にかかわる出来事
        </T>
        <T x={14} y={42} fs={12} tone="muted">
          軸の下：ニュートリノにかかわる出来事
        </T>
        <Arrow x1={30} y1={ax} x2={712} y2={ax} />
        {Array.from({ length: 11 }, (_, i) => 1920 + i * 10).map((y) => (
          <line key={y} x1={YX(y)} y1={ax - 4} x2={YX(y)} y2={ax + 4} stroke="var(--fig-muted)" />
        ))}
        <T x={YX(1910)} y={ax - 14} fs={11.5} anchor="middle" tone="muted">
          1910年
        </T>
        {HIGGS_EV.map((e) => {
          const x = YX(e.y)
          return (
            <g key={e.y}>
              <line x1={x} y1={ax} x2={x} y2={98} stroke="var(--fig-line)" />
              <circle cx={x} cy={ax} r={5.5} fill="var(--fig-accent)" stroke="var(--fig-line)" />
              {e.lines.map((l, j) => (
                <T key={j} x={x} y={48 + j * 17} anchor="middle" fs={j ? 11.5 : 12} bold={j === 0}>
                  {l}
                </T>
              ))}
            </g>
          )
        })}
        {NU_EV.map((e) => {
          const x = YX(e.y)
          const top = e.lv === 1 ? 188 : 250
          return (
            <g key={e.y}>
              <line x1={x} y1={ax} x2={x} y2={top - 12} stroke="var(--fig-line)" />
              <circle cx={x} cy={ax} r={5.5} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
              {e.lines.map((l, j) => (
                <T key={j} x={x} y={top + j * 17} anchor="middle" fs={j ? 11.5 : 12} bold={j === 0}>
                  {l}
                </T>
              ))}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図32-2 同じ力で押したときの速さの変わり方（動） ---------- */

const PUSH_LANES = [
  { m: 1, label: 'ヒッグス場との結びつきが弱い粒子（質量が小さい）' },
  { m: 2, label: '結びつきが中くらいの粒子（質量が2倍）' },
  { m: 4, label: '結びつきが強い粒子（質量が4倍）' },
]

export function FigPush() {
  const TP = 1.5 // 押している時間（秒）
  const A = 100 // 質量1の粒子の加速度（図の上の値）
  const x0 = 84
  return (
    <Anim
      n="32-2"
      title="ヒッグス場との結びつきが強い粒子ほど、同じ力で押しても速さが変わりにくい"
      still={3.4}
      period={5.5}
      caption="模式図です。青の矢印は押す力、黒の矢印は速さです。3つの粒子を同じ大きさの力で1.5秒だけ押します。押すのをやめた後は、どの粒子も遅くならず、そのときの速さで進み続けます。ヒッグス場が変えるのは動かしにくさ（質量）で、摩擦のように速さを落とすわけではありません。"
    >
      {(t) => {
        const tt = Math.min(t, 4.3)
        const pushing = tt < TP
        return (
          <Svg id="32-2" w={720} h={290} label="ヒッグス場との結びつきの強さが違う3つの粒子を同じ力で押すと、結びつきが強い粒子ほど速さの増え方が小さい。押すのをやめると、どの粒子も同じ速さのまま進み続ける。">
            <rect x={6} y={58} width={708} height={226} rx={6} fill="var(--fig-box4)" opacity={0.45} />
            <T x={14} y={18} fs={12.5} bold>
              {pushing ? '同じ大きさの力で押している' : '押すのをやめた後'}
            </T>
            <T x={14} y={38} fs={12} tone={pushing ? 'muted' : 'acc'}>
              {pushing ? '結びつきが強いほど、速さが増えにくい' : 'どの粒子も遅くならず、そのときの速さで進み続ける'}
            </T>
            <T x={706} y={74} fs={11.5} anchor="end" tone="muted">
              緑の地：ヒッグス場（どこにでも同じようにある）
            </T>
            {PUSH_LANES.map((l, i) => {
              const y = 124 + i * 70
              const a = A / l.m
              const x = x0 + (tt < TP ? 0.5 * a * tt * tt : 0.5 * a * TP * TP + a * TP * (tt - TP))
              const v = a * Math.min(tt, TP)
              return (
                <g key={l.m}>
                  <T x={20} y={y - 28} fs={12}>
                    {l.label}
                  </T>
                  <line x1={20} y1={y + 16} x2={700} y2={y + 16} stroke="var(--fig-muted)" />
                  {pushing && <Force x1={x - 64} y1={y} x2={x - 15} y2={y} />}
                  <Ball x={x} y={y} r={12} />
                  {v > 4 && <Vel x1={x + 15} y1={y} x2={x + 15 + v * 0.3} y2={y} />}
                </g>
              )
            })}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図32-3 結びつきの強さと質量 ---------- */

const PARTS: { name: string; ratio: number; measured: boolean; side: 'l' | 'r' }[] = [
  { name: '電子', ratio: 1, measured: false, side: 'r' },
  { name: 'アップ', ratio: 4.2, measured: false, side: 'l' },
  { name: 'ダウン', ratio: 9.2, measured: false, side: 'r' },
  { name: 'ストレンジ', ratio: 183, measured: false, side: 'l' },
  { name: 'ミューオン', ratio: 207, measured: false, side: 'r' },
  { name: 'チャーム', ratio: 2491, measured: false, side: 'l' },
  { name: 'タウ', ratio: 3477, measured: true, side: 'r' },
  { name: 'ボトム', ratio: 8186, measured: true, side: 'r' },
  { name: 'Wボソン', ratio: 157280, measured: true, side: 'l' },
  { name: 'Zボソン', ratio: 178450, measured: true, side: 'r' },
  { name: 'トップ', ratio: 337710, measured: true, side: 'l' },
]

export function FigCouplings() {
  const X = (d: number) => 110 + d * 88
  const Y = (d: number) => 290 - d * 38
  const ticks = ['1倍', '10倍', '100倍', '1000倍', '1万倍', '10万倍', '100万倍']
  return (
    <Figure
      n="32-3"
      title="ヒッグス場との結びつきが強い粒子ほど、質量が大きい"
      caption="横軸は粒子の質量（電子の何倍か）、縦軸はヒッグス場との結びつきの強さの目安で、どちらも目盛りが1つ進むごとに10倍になります。点線は標準模型の予想で、塗った丸はLHCの実験で結びつきが測られた粒子です。アップ、ダウンなどはクォークの名前です。光子とグルーオンは結びつかないので質量0で、この図には入りません。"
    >
      <Svg id="32-3" w={720} h={350} label="横に質量、縦にヒッグス場との結びつきの強さをとると、電子からトップクォークまでの粒子が右上がりの1本の線に並ぶ。Wボソン、Zボソン、トップ、ボトム、タウでは結びつきが測られている。">
        <T x={96} y={24} fs={12} bold>
          ヒッグス場との結びつきの強さ
        </T>
        <line x1={96} y1={36} x2={96} y2={310} stroke="var(--fig-line)" />
        <line x1={96} y1={310} x2={680} y2={310} stroke="var(--fig-line)" />
        {ticks.map((s, i) => (
          <g key={s}>
            <line x1={X(i)} y1={306} x2={X(i)} y2={314} stroke="var(--fig-line)" />
            <T x={X(i)} y={326} fs={11.5} anchor="middle">
              {s}
            </T>
          </g>
        ))}
        <T x={680} y={344} fs={12} anchor="end" bold>
          質量（電子の何倍か）
        </T>
        <line x1={X(-0.1)} y1={Y(-0.1)} x2={X(6)} y2={Y(6)} stroke="var(--fig-muted)" strokeDasharray="5 4" />
        <T x={350} y={112} fs={12} anchor="middle" tone="muted">
          標準模型の予想
        </T>
        <circle cx={120} cy={56} r={5} fill="var(--fig-accent)" stroke="var(--fig-line)" />
        <T x={132} y={56} fs={12}>
          LHCで結びつきが測られた粒子
        </T>
        <circle cx={120} cy={78} r={5} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
        <T x={132} y={78} fs={12}>
          まだ十分に測られていない粒子
        </T>
        {PARTS.map((p) => {
          const d = Math.log10(p.ratio)
          const cx = X(d)
          const cy = Y(d)
          return (
            <g key={p.name}>
              <circle cx={cx} cy={cy} r={5} fill={p.measured ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              {p.side === 'l' ? (
                <T x={cx - 9} y={cy - 10} fs={11.5} anchor="end">
                  {p.name}
                </T>
              ) : (
                <T x={cx + 9} y={cy + 11} fs={11.5}>
                  {p.name}
                </T>
              )}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図32-4 陽子どうしの衝突と検出器（動・切り替え） ---------- */

const DC = { x: 300, y: 172 }
const LAYERS = {
  tracker: { hw: 80, hh: 48 },
  calo: { hw: 135, hh: 84 },
  muon: { hw: 190, hh: 118 },
}

/** 中心から角度 a（画面の座標、度）の向きに進んで、半幅 hw・半高 hh の長方形の縁に着くまでの距離 */
function toEdge(a: number, hw: number, hh: number) {
  const c = Math.abs(Math.cos((a * Math.PI) / 180))
  const s = Math.abs(Math.sin((a * Math.PI) / 180))
  return Math.min(c > 1e-6 ? hw / c : 1e9, s > 1e-6 ? hh / s : 1e9)
}

const at = (a: number, d: number) => ({ x: DC.x + d * Math.cos((a * Math.PI) / 180), y: DC.y + d * Math.sin((a * Math.PI) / 180) })

export function FigCollision() {
  const [mode, setMode] = useState<'gg' | 'mu'>('gg')
  const L = LAYERS
  return (
    <Anim
      n="32-4"
      title="陽子どうしの衝突でヒッグス粒子ができ、すぐに別の粒子に変わる"
      still={3}
      period={5}
      controls={
        <Choice
          label="変わってできる粒子"
          options={[
            { value: 'gg', label: '光子2個' },
            { value: 'mu', label: 'ミューオン4個' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="検出器を横から見た模式図で、大きさの比は実際と違います。光子はカロリメーターで止まり、エネルギーを残します（黄色の印）。ミューオン4個になる場合は、途中でZボソン2個を経ます。ミューオンはほかの層を通り抜け、いちばん外側の検出器に跡を残します（青の印）。"
    >
      {(t) => {
        const p = clamp01(t / 1)
        const showH = t >= 1 && t < 1.35
        const s = ease((t - 1.3) / 0.8)
        const dTr = (a: number) => toEdge(a, L.tracker.hw, L.tracker.hh)
        const dCa = (a: number) => toEdge(a, L.calo.hw, L.calo.hh)
        const dMu = (a: number) => toEdge(a, L.muon.hw, L.muon.hh)
        const status = t < 1 ? '① 陽子どうしが正面からぶつかる（左右から来る丸が陽子）' : t < 1.35 ? '② まれに、ヒッグス粒子ができる' : mode === 'gg' ? '③ すぐに光子2個に変わり、光子はカロリメーターで止まる' : '③ ミューオン4個に変わり、ミューオンはいちばん外側まで届く'
        return (
          <Svg id="32-4" w={720} h={310} label="陽子どうしが検出器の中心でぶつかり、ヒッグス粒子ができてすぐに光子2個またはミューオン4個に変わる。光子はカロリメーターで止まり、ミューオンはいちばん外側のミューオン検出器まで届く。">
            <T x={10} y={16} fs={12.5} bold>
              {status}
            </T>
            {(['muon', 'calo', 'tracker'] as const).map((k) => (
              <rect key={k} x={DC.x - L[k].hw} y={DC.y - L[k].hh} width={L[k].hw * 2} height={L[k].hh * 2} rx={8} fill={k === 'muon' ? 'var(--fig-box4)' : k === 'calo' ? 'var(--fig-box2)' : 'var(--fig-box3)'} stroke="var(--fig-line)" />
            ))}
            <line x1={20} y1={DC.y - 4} x2={580} y2={DC.y - 4} stroke="var(--fig-muted)" />
            <line x1={20} y1={DC.y + 4} x2={580} y2={DC.y + 4} stroke="var(--fig-muted)" />
            {p < 1 && (
              <>
                <Ball x={DC.x - 270 * (1 - p)} y={DC.y} r={6} fill="var(--fig-accent)" />
                <Ball x={DC.x + 270 * (1 - p)} y={DC.y} r={6} fill="var(--fig-accent)" />
              </>
            )}
            {showH && <Ball x={DC.x} y={DC.y} r={10} fill={LIGHT} />}
            {t >= 1.3 && mode === 'gg' &&
              [-140, 40].map((a) => {
                const stop = (dTr(a) + dCa(a)) / 2
                const e = at(a, 10 + (stop - 10) * s)
                return (
                  <g key={a}>
                    <Photon x1={DC.x} y1={DC.y} x2={e.x} y2={e.y} />
                    {s >= 1 && <rect x={e.x - 6} y={e.y - 6} width={12} height={12} fill={LIGHT} stroke="var(--fig-line)" />}
                  </g>
                )
              })}
            {t >= 1.3 && mode === 'mu' &&
              [-50, -150, 60, 160].map((a) => {
                const end = dMu(a) - 3
                const e = at(a, end * s)
                const hit = at(a, (dCa(a) + dMu(a)) / 2)
                return (
                  <g key={a}>
                    <line x1={DC.x} y1={DC.y} x2={e.x} y2={e.y} stroke="var(--fig-line)" strokeWidth={2} />
                    {s >= 1 && <rect x={hit.x - 5} y={hit.y - 5} width={10} height={10} fill="var(--fig-accent)" stroke="var(--fig-line)" />}
                  </g>
                )
              })}
            <line x1={372} y1={146} x2={506} y2={112} stroke="var(--fig-muted)" />
            <T x={512} y={104} fs={12.5} bold>
              飛跡検出器
            </T>
            <T x={512} y={121} fs={11.5} tone="muted">
              電気を持つ粒子の通り道を記録
            </T>
            <line x1={420} y1={190} x2={506} y2={190} stroke="var(--fig-muted)" />
            <T x={512} y={182} fs={12.5} bold>
              カロリメーター
            </T>
            <T x={512} y={199} fs={11.5} tone="muted">
              光子などを止めてエネルギーを測る
            </T>
            <line x1={474} y1={262} x2={506} y2={262} stroke="var(--fig-muted)" />
            <T x={512} y={254} fs={12.5} bold>
              ミューオン検出器
            </T>
            <T x={512} y={271} fs={11.5} tone="muted">
              いちばん外側まで届く
            </T>
            <T x={512} y={287} fs={11.5} tone="muted">
              ミューオンをとらえる
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図32-5 データを集めると山が見えてくる（スライダー） ---------- */

const BIN0 = 100
const BW = 2.5
const NBIN = 28
const PEAK = 133.5

/** データの量 k 倍のときの、各区間の予想（背景）と数（作り物の乱数入り） */
function bumpData(k: number) {
  const r = rng(3205 + k)
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-5, r()))) * Math.cos(2 * Math.PI * r())
  return Array.from({ length: NBIN }, (_, i) => {
    const x = BIN0 + BW * (i + 0.5)
    const b = k * 10 * Math.exp(-(x - PEAK) / 35)
    const sig = k * 9 * BW * Math.exp(-((x - PEAK) ** 2) / (2 * 1.8 * 1.8)) / (1.8 * Math.sqrt(2 * Math.PI))
    const mu = b + sig
    return { x, b, n: Math.max(0, Math.round(mu + Math.sqrt(mu) * gauss())) }
  })
}

export function FigBump() {
  const [v, setV] = useState(4)
  const k = 2 ** v
  const data = bumpData(k)
  const X = (m: number) => 100 + (m - BIN0) * 7.6
  const ymax = 1.25 * k * 10 * Math.exp(-(BIN0 - PEAK) / 35)
  const Y = (n: number) => 250 - (n / ymax) * 200
  const curve = Array.from({ length: 71 }, (_, i) => {
    const m = BIN0 + i
    return `${i ? 'L' : 'M'}${X(m).toFixed(1)},${Y(k * 10 * Math.exp(-(m - PEAK) / 35)).toFixed(1)}`
  }).join(' ')
  return (
    <Figure
      n="32-5"
      title="データを集めるほど、ヒッグス粒子の質量の所に山が見えてくる"
      controls={<Range label="集めたデータの量" min={0} max={4} value={v} onChange={setV} format={(x) => `${2 ** x}倍`} />}
      caption="模式図です。実際のデータではなく、考え方を示すために作った数を使っています。棒は、2個の光子から計算した元の粒子の質量ごとの数です。点線はヒッグス粒子がない場合の予想です。最初は16倍の量を表示しています。「集めたデータの量」を減らすと、陽子の約133倍の所の山は揺らぎに埋もれて見分けにくくなります。縦の目盛りはデータの量に合わせて変えています。"
    >
      <Svg id="32-5" w={720} h={300} label="2個の光子から計算した質量ごとの数の棒グラフ。データが少ないと揺らぎに埋もれて山が分からないが、データを増やすと、陽子の約133倍の所に山がはっきり現れる。">
        <line x1={96} y1={250} x2={640} y2={250} stroke="var(--fig-line)" />
        <line x1={96} y1={40} x2={96} y2={250} stroke="var(--fig-line)" />
        <T x={102} y={30} fs={12} bold>
          数
        </T>
        {data.map((d) => (
          <rect key={d.x} x={X(d.x - BW / 2) + 1} y={Y(d.n)} width={BW * 7.6 - 2} height={250 - Y(d.n)} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={0.8} />
        ))}
        <path d={curve} fill="none" stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="6 4" />
        {[100, 110, 120, 130, 140, 150, 160, 170].map((m) => (
          <g key={m}>
            <line x1={X(m)} y1={250} x2={X(m)} y2={256} stroke="var(--fig-line)" />
            <T x={X(m)} y={268} fs={11.5} anchor="middle">
              {`${m}倍`}
            </T>
          </g>
        ))}
        <T x={640} y={288} fs={12} anchor="end">
          2個の光子から計算した元の粒子の質量（陽子の何倍か）
        </T>
        <T x={480} y={50} fs={12.5}>
          {`データの量：${k}倍`}
        </T>
        <line x1={480} y1={70} x2={500} y2={70} stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="6 4" />
        <T x={506} y={70} fs={11.5} tone="muted">
          ヒッグス粒子がない場合の予想
        </T>
        {k >= 4 && (
          <>
            <Arrow x1={X(PEAK) + 60} y1={112} x2={X(PEAK) + 10} y2={Y(data[13].n) - 6} accent />
            <T x={X(PEAK) + 64} y={108} fs={12} tone="acc">
              陽子の約133倍の所の山
            </T>
          </>
        )}
      </Svg>
    </Figure>
  )
}

/* ---------- 図32-6 β崩壊で出る電子のエネルギー（動） ---------- */

const NDEC = 40
const DT = 0.35
const BETA = (() => {
  const r = rng(32062)
  const out: { e: number; a: number }[] = []
  while (out.length < NDEC) {
    const e = r()
    const y = r()
    if (y < (Math.sqrt(e) * (1 - e) ** 2) / 0.29) out.push({ e, a: r() * 2 * Math.PI })
  }
  return out
})()

export function FigBeta() {
  const NB = 10
  return (
    <Anim
      n="32-6"
      title="β崩壊で出る電子のエネルギーは、一つの値に決まらない"
      still={15.5}
      period={16.5}
      caption="模式図です。左では原子核が1個ずつβ崩壊し、電子（黒の矢印）と、見えないニュートリノ（点線の矢印）が出ます。2つでエネルギーを分け合うので、電子のエネルギーは毎回違います。右は電子のエネルギーごとの数です。電子だけが出るなら、すべて右端の「最大」の所に集まるはずです。"
    >
      {(t) => {
        const n = Math.min(NDEC, Math.floor(t / DT) + 1)
        const cur = BETA[n - 1]
        const counts = Array(NB).fill(0)
        for (let i = 0; i < n; i++) counts[Math.min(NB - 1, Math.floor(BETA[i].e * NB))]++
        const cx = 150
        const cy = 152
        const le = 26 + 78 * cur.e
        const ln = 26 + 78 * (1 - cur.e)
        const an = cur.a + Math.PI + 0.5
        return (
          <Svg id="32-6" w={720} h={290} label="原子核がβ崩壊するたびに、電子とニュートリノがエネルギーを分け合って出る。電子のエネルギーを数えると、0から最大までの広い分布になり、一つの値には集まらない。">
            <T x={14} y={18} fs={12}>
              黒の矢印：電子（エネルギーを測れる）
            </T>
            <T x={14} y={36} fs={12} tone="muted">
              点線の矢印：ニュートリノ（見えない）
            </T>
            <Ball x={cx} y={cy} r={24} fill="var(--fig-box2)">
              <T x={cx} y={cy} fs={11} anchor="middle">
                原子核
              </T>
            </Ball>
            <Vel x1={cx + 26 * Math.cos(cur.a)} y1={cy + 26 * Math.sin(cur.a)} x2={cx + le * Math.cos(cur.a)} y2={cy + le * Math.sin(cur.a)} />
            <Arrow x1={cx + 26 * Math.cos(an)} y1={cy + 26 * Math.sin(an)} x2={cx + ln * Math.cos(an)} y2={cy + ln * Math.sin(an)} dashed />
            <T x={14} y={276} fs={12}>
              {`崩壊の数：${n}`}
            </T>
            {/* 右：電子のエネルギーの分布 */}
            <line x1={370} y1={236} x2={690} y2={236} stroke="var(--fig-line)" />
            <line x1={370} y1={70} x2={370} y2={236} stroke="var(--fig-line)" />
            <T x={376} y={62} fs={12} bold>
              数
            </T>
            {counts.map((c, i) => (
              <rect key={i} x={372 + i * 30} y={236 - c * 15} width={28} height={c * 15} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={0.8} />
            ))}
            <rect x={662} y={84} width={28} height={152} fill="none" stroke="var(--fig-danger)" strokeWidth={1.5} strokeDasharray="5 4" />
            <T x={690} y={54} fs={12} anchor="end" tone="danger">
              電子だけが出るなら、すべて右端に
            </T>
            <T x={690} y={72} fs={12} anchor="end" tone="danger">
              集まるはず（点線の枠）
            </T>
            <T x={372} y={250} fs={11.5}>
              0
            </T>
            <T x={690} y={250} fs={11.5} anchor="end">
              最大
            </T>
            <T x={530} y={272} fs={12} anchor="middle">
              電子のエネルギー
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図32-7 コーワンとライネスの検出のしくみ ---------- */

export function FigReactor() {
  const P = { x: 290, y: 146 }
  const Q = { x: 306, y: 140 }
  const R = { x: 466, y: 150 }
  return (
    <Figure
      n="32-7"
      title="原子炉から来るニュートリノを、続けて来る2つの合図でとらえた"
      caption="コーワンとライネスの検出器の模式図です（大きさの比は実際と違います）。水には中性子を吸い込みやすいカドミウムを溶かしてあります。水の上下の光る液体は、γ線が当たると光り、その光を電気の信号に変えて記録します。"
    >
      <Svg id="32-7" w={720} h={300} label="原子炉から来た反ニュートリノが水の中の陽子に当たり、陽電子と中性子ができる。陽電子は電子と出会ってすぐにγ線2本を出し、中性子は少し遅れてカドミウムに吸い込まれてγ線を出す。上下の光る液体の検出器が2つの合図を続けてとらえる。">
        <Box x={16} y={112} w={110} h={68} lines={['原子炉']} fill="box2" bold />
        <Arrow x1={130} y1={P.y} x2={P.x - 6} y2={P.y} dashed />
        <T x={136} y={112} fs={12}>
          反ニュートリノ
        </T>
        <T x={136} y={129} fs={11.5} tone="muted">
          （見えない）
        </T>
        <Box x={250} y={40} w={270} h={56} lines={['光る液体（検出器）']} fill="box3" fs={12.5} />
        <rect x={250} y={104} width={270} height={84} rx={6} fill="var(--fig-box4)" stroke="var(--fig-line)" />
        <T x={380} y={180} fs={11.5} anchor="middle" tone="muted">
          水とカドミウム
        </T>
        <Box x={250} y={196} w={270} h={56} lines={['光る液体（検出器）']} fill="box3" fs={12.5} />
        <circle cx={P.x} cy={P.y} r={4} fill="var(--fig-line)" />
        <line x1={P.x} y1={P.y} x2={Q.x} y2={Q.y} stroke="var(--fig-line)" strokeWidth={1.5} />
        <Photon x1={Q.x} y1={Q.y - 4} x2={Q.x} y2={70} />
        <Photon x1={Q.x} y1={Q.y + 4} x2={Q.x} y2={224} />
        <T x={318} y={120} fs={13} bold>
          ①
        </T>
        <Trail points={[[P.x, P.y], [330, 162], [362, 128], [398, 166], [432, 134], [R.x, R.y]]} />
        <circle cx={R.x} cy={R.y} r={4} fill="var(--fig-line)" />
        <Photon x1={R.x} y1={R.y - 4} x2={R.x} y2={70} />
        <Photon x1={R.x} y1={R.y + 4} x2={R.x} y2={224} />
        <T x={480} y={124} fs={13} bold>
          ②
        </T>
        <T x={532} y={52} fs={11.5}>
          ① 陽電子が電子と出会って
        </T>
        <T x={532} y={69} fs={11.5}>
          消え、γ線2本がすぐ出る
        </T>
        <T x={532} y={102} fs={11.5}>
          ② 中性子は水の中を動き回り、
        </T>
        <T x={532} y={119} fs={11.5}>
          カドミウムに吸い込まれて
        </T>
        <T x={532} y={136} fs={11.5}>
          γ線を出す（少し遅れて）
        </T>
        <T x={532} y={174} fs={11.5} tone="acc">
          ①と②が続けて来たときだけ
        </T>
        <T x={532} y={191} fs={11.5} tone="acc">
          ニュートリノが来たと判定する
        </T>
        <T x={250} y={268} fs={11.5} tone="muted">
          点線：中性子の道筋　黄色の波線：γ線
        </T>
        <Arrow x1={532} y1={262} x2={700} y2={262} />
        <line x1={556} y1={262} x2={556} y2={240} stroke="var(--fig-line)" strokeWidth={2} />
        <line x1={620} y1={262} x2={620} y2={240} stroke="var(--fig-line)" strokeWidth={2} />
        <T x={556} y={230} fs={12} anchor="middle">
          ①
        </T>
        <T x={620} y={230} fs={12} anchor="middle">
          ②
        </T>
        <T x={700} y={280} fs={11.5} anchor="end" tone="muted">
          時間（間は100万分の数秒）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図32-8 カミオカンデで光の輪をとらえる（動） ---------- */

const TANK = { x0: 170, y0: 30, x1: 430, y1: 290 }
const KP = { x: 262, y: 232 } // ニュートリノが電子に当たる点
const KU = { x: Math.cos((-60 * Math.PI) / 180), y: Math.sin((-60 * Math.PI) / 180) } // 電子の向き
const KLEN = 60
const CH = (42 * Math.PI) / 180 // チェレンコフ光の角度

const rot = (v: { x: number; y: number }, a: number) => ({ x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) })

/** 点 p から向き d に進んで、タンクの内側の壁（光電子増倍管の並ぶ所）に着くまでの距離 */
function wallDist(p: { x: number; y: number }, d: { x: number; y: number }) {
  const ins = 8
  const cands = [d.x > 0 ? (TANK.x1 - ins - p.x) / d.x : Infinity, d.x < 0 ? (TANK.x0 + ins - p.x) / d.x : Infinity, d.y > 0 ? (TANK.y1 - ins - p.y) / d.y : Infinity, d.y < 0 ? (TANK.y0 + ins - p.y) / d.y : Infinity]
  return Math.min(...cands)
}

const PMTS = (() => {
  const out: { x: number; y: number }[] = []
  for (let x = 180; x <= 420; x += 20) out.push({ x, y: TANK.y0 + 8 }, { x, y: TANK.y1 - 8 })
  for (let y = 50; y <= 270; y += 20) out.push({ x: TANK.x0 + 8, y }, { x: TANK.x1 - 8, y })
  return out
})()

export function FigKamiokande() {
  const E = { x: KP.x + KU.x * KLEN, y: KP.y + KU.y * KLEN }
  const dirs = [rot(KU, -CH), rot(KU, CH)]
  // 光が当たる壁の範囲（P から出た光と E から出た光の間）
  const hitsOf = (d: { x: number; y: number }) => {
    const a = wallDist(KP, d)
    const b = wallDist(E, d)
    return [
      { x: KP.x + d.x * a, y: KP.y + d.y * a },
      { x: E.x + d.x * b, y: E.y + d.y * b },
    ]
  }
  const bands = dirs.map(hitsOf)
  const lit = (q: { x: number; y: number }) =>
    bands.some(([h1, h2]) => {
      const lo = { x: Math.min(h1.x, h2.x) - 6, y: Math.min(h1.y, h2.y) - 6 }
      const hi = { x: Math.max(h1.x, h2.x) + 6, y: Math.max(h1.y, h2.y) + 6 }
      return q.x >= lo.x && q.x <= hi.x && q.y >= lo.y && q.y <= hi.y
    })
  const N0 = { x: 20, y: 268 }
  return (
    <Anim
      n="32-8"
      title="はじき出された電子が出すチェレンコフ光を、壁の光電子増倍管がとらえる"
      still={3.2}
      period={5}
      caption="カミオカンデのタンクを横から切った模式図です。光は円錐の形に広がるので、壁には輪の形の模様ができます。この図はその断面なので、光った所が2か所に分かれて見えます。輪の位置と形から、ニュートリノの来た向きとエネルギーが分かります。"
    >
      {(t) => {
        const sIn = clamp01(t / 1)
        const sE = clamp01((t - 1) / 0.6)
        const front = Math.max(0, (t - 1) * 260)
        const Ecur = { x: KP.x + KU.x * KLEN * sE, y: KP.y + KU.y * KLEN * sE }
        const nuEnd = { x: N0.x + (KP.x - N0.x) * sIn, y: N0.y + (KP.y - N0.y) * sIn }
        return (
          <Svg id="32-8" w={720} h={320} label="水のタンクの中でニュートリノが電子に当たり、はじき出された電子が円錐の形の光を出す。光は壁に並んだ光電子増倍管に当たり、当たった所が光る。">
            <rect x={TANK.x0} y={TANK.y0} width={TANK.x1 - TANK.x0} height={TANK.y1 - TANK.y0} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
            {t >= 1 &&
              dirs.map((d, i) => {
                const a = Math.min(front, wallDist(KP, d))
                const b = Math.min(Math.max(0, front - KLEN * sE * 0.3), wallDist(Ecur, d))
                const pts = [KP, { x: KP.x + d.x * a, y: KP.y + d.y * a }, { x: Ecur.x + d.x * b, y: Ecur.y + d.y * b }, Ecur]
                return <path key={i} d={`M${pts.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' L')} Z`} fill={LIGHT} opacity={0.35} stroke={LIGHT} />
              })}
            {PMTS.map((q, i) => (
              <circle key={i} cx={q.x} cy={q.y} r={4.5} fill={t > 1.9 && lit(q) ? LIGHT : 'var(--fig-bg)'} stroke="var(--fig-line)" />
            ))}
            <Arrow x1={N0.x} y1={N0.y} x2={nuEnd.x} y2={nuEnd.y} dashed />
            <T x={16} y={292} fs={12}>
              ニュートリノ（見えない）
            </T>
            {t >= 1 && <Vel x1={KP.x} y1={KP.y} x2={Ecur.x} y2={Ecur.y} />}
            <T x={214} y={262} fs={12}>
              はじき出された電子
            </T>
            <T x={446} y={100} fs={12.5} bold>
              チェレンコフ光（黄色）
            </T>
            <T x={446} y={118} fs={11.5} tone="muted">
              円錐の形に広がる
            </T>
            <T x={446} y={160} fs={12.5} bold>
              光った光電子増倍管
            </T>
            <T x={446} y={178} fs={11.5} tone="muted">
              （実際は壁に輪の形に並ぶ）
            </T>
            <T x={446} y={228} fs={12}>
              水 3000トン
            </T>
            <T x={446} y={246} fs={12}>
              壁の光電子増倍管 約1000本
            </T>
            <T x={446} y={264} fs={12}>
              神岡鉱山の地下1000m
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図32-9 上から来るニュートリノと下から来るニュートリノ（動・切り替え） ---------- */

const EC = { x: 180, y: 182 }
const ER = 122
const AR = 138
const SK = { x: EC.x, y: EC.y - ER + 6 }

export function FigUpDown() {
  const [mass, setMass] = useState<'yes' | 'no'>('yes')
  const TB = 4 // 地球の反対側から来るものが届くまでの時間（図の上）
  const startA = { x: EC.x, y: EC.y - AR }
  const angB = (110 * Math.PI) / 180
  const startB = { x: EC.x + AR * Math.cos(angB), y: EC.y + AR * Math.sin(angB) }
  /** 飛んだ距離 km のときにタウ型として見つかる確率（模式図：1万2000km で2.25回入れ替わる） */
  const pTau = (km: number) => (mass === 'yes' ? Math.sin((Math.PI * 2.25 * km) / 12000) ** 2 : 0)
  return (
    <Anim
      n="32-9"
      title="地球を突き抜けて長く飛んだミュー型ニュートリノは、途中でタウ型に変わる"
      still={5}
      period={6.5}
      controls={
        <Choice
          label="ニュートリノの質量"
          options={[
            { value: 'yes', label: 'あり' },
            { value: 'no', label: 'なし' },
          ]}
          value={mass}
          onChange={setMass}
        />
      }
      caption="模式図です。宇宙線が大気にぶつかってできたミュー型のニュートリノが、真上（数十km）と地球の反対側（約1万3000km）からスーパーカミオカンデに届きます。丸の色と右の帯は、そのニュートリノがミュー型（緑）とタウ型（橙）のどちらとして見つかりやすいかを表します。入れ替わる回数は実際より少なく描いています。実際のニュートリノはエネルギーがさまざまなので、地球の反対側から来たものは平均して約半分がミュー型のまま届きます。「なし」にすると、種類は変わりません。"
    >
      {(t) => {
        const sA = clamp01(t / 0.4)
        const sB = clamp01(t / TB)
        const kmB = 12000 * sB
        const kmA = 20 * sA
        const posA = { x: startA.x + (SK.x - startA.x) * sA, y: startA.y + (SK.y - startA.y) * sA }
        const posB = { x: startB.x + (SK.x - startB.x) * sB, y: startB.y + (SK.y - startB.y) * sB }
        const rows = [
          { label: '真上から来たもの（数十km）', p: pTau(kmA), y: 108 },
          { label: '地球の反対側から来たもの（約1万3000km）', p: pTau(kmB), y: 176 },
        ]
        const arrived = sB >= 1
        const dot = (pos: { x: number; y: number }, p: number) => (
          <g>
            <circle cx={pos.x} cy={pos.y} r={7} fill={MU} stroke="var(--fig-line)" />
            <circle cx={pos.x} cy={pos.y} r={7} fill={TAU} opacity={p} />
          </g>
        )
        return (
          <Svg id="32-9" w={720} h={340} label="真上の大気でできたミュー型ニュートリノは数十km飛んでそのまま届くが、地球の反対側でできたものは地球を突き抜ける間にタウ型と入れ替わり、ミュー型として届く数が約半分になる。質量がなければ種類は変わらない。">
            <circle cx={EC.x} cy={EC.y} r={AR} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <circle cx={EC.x} cy={EC.y} r={ER} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <T x={EC.x} y={EC.y + 40} fs={13} anchor="middle" bold>
              地球
            </T>
            <T x={EC.x + 100} y={EC.y - 126} fs={11.5} tone="muted">
              大気
            </T>
            <line x1={SK.x} y1={SK.y} x2={startB.x} y2={startB.y} stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <line x1={SK.x} y1={SK.y} x2={startA.x} y2={startA.y} stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <line x1={128} y1={24} x2={startA.x - 4} y2={startA.y - 2} stroke="var(--fig-muted)" />
            <rect x={SK.x - 9} y={SK.y - 2} width={18} height={14} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <line x1={SK.x + 10} y1={SK.y + 4} x2={262} y2={24} stroke="var(--fig-muted)" />
            <T x={266} y={20} fs={12}>
              スーパーカミオカンデ
            </T>
            <T x={16} y={20} fs={11.5} tone="muted">
              真上の大気でできる
            </T>
            <T x={16} y={326} fs={11.5} tone="muted">
              地球の反対側の大気でできる
            </T>
            {dot(posB, rows[1].p)}
            {sA < 1 && dot(posA, rows[0].p)}
            <T x={380} y={64} fs={12.5} bold>
              ミュー型として見つかりやすいか
            </T>
            {rows.map((r) => (
              <g key={r.label}>
                <T x={380} y={r.y - 16} fs={12}>
                  {r.label}
                </T>
                <rect x={380} y={r.y} width={260} height={20} fill={TAU} stroke="var(--fig-line)" />
                <rect x={380} y={r.y} width={260 * (1 - r.p)} height={20} fill={MU} />
                <rect x={380} y={r.y} width={260} height={20} fill="none" stroke="var(--fig-line)" />
                <T x={648} y={r.y + 10} fs={11.5}>
                  {`${Math.round((1 - r.p) * 100)}%`}
                </T>
              </g>
            ))}
            <rect x={380} y={214} width={14} height={12} fill={MU} stroke="var(--fig-line)" />
            <T x={400} y={220} fs={11.5}>
              ミュー型
            </T>
            <rect x={470} y={214} width={14} height={12} fill={TAU} stroke="var(--fig-line)" />
            <T x={490} y={220} fs={11.5}>
              タウ型
            </T>
            {arrived ? (
              mass === 'yes' ? (
                <>
                  <T x={380} y={256} fs={12.5} bold>
                    届いたミュー型の数
                  </T>
                  <T x={380} y={276} fs={12}>
                    真上から：予想どおり
                  </T>
                  <T x={380} y={296} fs={12} tone="acc">
                    地球の反対側から：予想の約半分
                  </T>
                </>
              ) : (
                <>
                  <T x={380} y={256} fs={12.5} bold>
                    届いたミュー型の数
                  </T>
                  <T x={380} y={276} fs={12}>
                    どちらも予想どおり（種類は変わらない）
                  </T>
                </>
              )
            ) : (
              <T x={380} y={256} fs={12} tone="muted">
                地球の中を飛んでいる途中
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図32-10 太陽ニュートリノの予想と観測 ---------- */

const SOLAR = [
  { label: 'ホームステイク（デイヴィス）', v: 0.3, text: '約30%', fill: 'var(--fig-box2)' },
  { label: 'カミオカンデ', v: 0.5, text: '約50%', fill: 'var(--fig-box2)' },
  { label: 'SNO：電子型だけ', v: 0.34, text: '約3分の1', fill: 'var(--fig-box2)' },
  { label: 'SNO：3種類の合計', v: 0.94, text: '予想とほぼ同じ', fill: 'var(--fig-box4)' },
]

export function FigSolarDeficit() {
  const x0 = 250
  const W = 360
  return (
    <Figure
      n="32-10"
      title="電子型だけを数えると足りないが、3種類を合わせると予想どおりになる"
      caption="太陽の模型から計算した予想を100%として、観測された数の割合を並べています。実験ごとにとらえられるニュートリノのエネルギーの範囲が違うので、割合はそれぞれの実験の予想に対する値です。SNOの合計は2013年にまとめられた最終結果で、予想と誤差の範囲で一致しています。"
    >
      <Svg id="32-10" w={720} h={250} label="太陽ニュートリノの観測と予想の比。ホームステイクは約30%、カミオカンデは約50%、SNOの電子型だけは約3分の1だが、SNOの3種類の合計は予想とほぼ同じ。">
        <line x1={x0 + W} y1={36} x2={x0 + W} y2={228} stroke="var(--fig-muted)" strokeDasharray="5 4" />
        <T x={x0 + W} y={22} fs={12} anchor="end" tone="muted">
          太陽の模型からの予想（100%）
        </T>
        <line x1={x0} y1={36} x2={x0} y2={228} stroke="var(--fig-line)" />
        {SOLAR.map((s, i) => {
          const y = 52 + i * 46
          const w = W * s.v
          return (
            <g key={s.label}>
              <T x={x0 - 10} y={y + 13} fs={12.5} anchor="end">
                {s.label}
              </T>
              <rect x={x0} y={y} width={w} height={26} fill={s.fill} stroke="var(--fig-line)" />
              {s.v > 0.8 ? (
                <T x={x0 + w - 8} y={y + 13} fs={12} anchor="end" bold>
                  {s.text}
                </T>
              ) : (
                <T x={x0 + w + 8} y={y + 13} fs={12}>
                  {s.text}
                </T>
              )}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}
