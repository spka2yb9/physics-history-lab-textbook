import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Force, Trail, Vel, ease, rng, wave } from './common'

/* ---------- 共通：光の波長と色 ---------- */

/** 波長（ナノメートル）と色相の対応。目で見た色に近づけるための目安 */
const HUE: [number, number][] = [
  [380, 275],
  [420, 265],
  [450, 235],
  [480, 200],
  [500, 160],
  [530, 110],
  [570, 62],
  [590, 42],
  [620, 15],
  [700, 0],
  [720, 0],
]

function wlColor(nm: number): string {
  let h = HUE[HUE.length - 1][1]
  for (let i = 0; i < HUE.length - 1; i++) {
    const [a, ha] = HUE[i]
    const [b, hb] = HUE[i + 1]
    if (nm >= a && nm <= b) {
      h = ha + ((hb - ha) * (nm - a)) / (b - a)
      break
    }
  }
  return `hsl(${h.toFixed(0)} 85% 52%)`
}

/** 線の波長（ナノメートル、NIST の値を丸めたもの） */
const H_LINES = [656.28, 486.13, 434.05, 410.17]
const NA_LINES = [589.0, 589.59]
const HG_LINES = [404.66, 435.83, 546.07, 576.96, 579.07]
const HE_LINES = [447.15, 471.31, 492.19, 501.57, 587.56, 667.82, 706.52]

const LO = 400
const HI = 710

/**
 * 色の帯。kind が cont は切れ目のない色の帯、emit は黒地に明るい線、abs は色の帯に暗い線。
 * 帯の左端が波長 LO、右端が HI。
 */
function Strip({ id, x, y, w, h, kind, lines = [] }: { id: string; x: number; y: number; w: number; h: number; kind: 'cont' | 'emit' | 'abs'; lines?: number[] }) {
  const X = (nm: number) => x + ((nm - LO) / (HI - LO)) * w
  const gid = `sp-${id}`
  return (
    <g>
      {kind !== 'emit' && (
        <defs>
          <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
            {Array.from({ length: 32 }, (_, i) => {
              const nm = LO + ((HI - LO) * i) / 31
              return <stop key={i} offset={i / 31} stopColor={wlColor(nm)} />
            })}
          </linearGradient>
        </defs>
      )}
      <rect x={x} y={y} width={w} height={h} fill={kind === 'emit' ? '#141418' : `url(#${gid})`} stroke="var(--fig-line)" />
      {lines.map((nm) => (
        <line key={nm} x1={X(nm)} x2={X(nm)} y1={y + 1} y2={y + h - 1} stroke={kind === 'abs' ? '#141418' : wlColor(nm)} strokeWidth={kind === 'abs' ? 2.2 : 2.6} />
      ))}
    </g>
  )
}

/** 帯の下の目盛り（波長） */
function Scale({ x, y, w }: { x: number; y: number; w: number }) {
  const X = (nm: number) => x + ((nm - LO) / (HI - LO)) * w
  return (
    <g>
      {[400, 500, 600, 700].map((nm) => (
        <g key={nm}>
          <line x1={X(nm)} x2={X(nm)} y1={y} y2={y + 6} stroke="var(--fig-line)" />
          <T x={X(nm)} y={y + 18} anchor="middle" fs={11.5} tone="muted">
            {`1万分の${nm / 100}mm`}
          </T>
        </g>
      ))}
    </g>
  )
}

/* ---------- 図22-1 原子の中が分かるまでの年表 ---------- */

const ROAD = [
  { y: '1814年', who: 'フラウンホーファー', what: ['太陽の光に', '暗い線'] },
  { y: '1859年', who: 'キルヒホッフら', what: ['元素ごとに', '決まった線'] },
  { y: '1885年', who: 'バルマー', what: ['水素の線の', '並び方の規則'] },
  { y: '1897年', who: 'J・J・トムソン', what: ['電子の発見', '（陰極線）'] },
  { y: '1903年', who: '長岡半太郎', what: ['土星型の', '原子模型'] },
  { y: '1904年', who: 'J・J・トムソン', what: ['正の電気の球に', '電子が並ぶ模型'] },
  { y: '1909年', who: 'ガイガーら', what: ['α粒子が', 'はね返る'] },
  { y: '1911年', who: 'ラザフォード', what: ['中心に小さく', '重い部分'] },
  { y: '1913年', who: 'ボーア', what: ['とびとびの', '軌道の模型'] },
  { y: '1914年', who: 'フランクら', what: ['エネルギーの', 'とびとびを確認'] },
]

export function FigRoad() {
  return (
    <Figure n="22-1" title="原子の中のつくりが分かるまでの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。「ら」は共同研究者がいることを表します。">
      <Svg
        id="22-1"
        w={720}
        h={262}
        label="1814年にフラウンホーファーが太陽の光の暗い線を見つけ、1859年にキルヒホッフとブンゼンが元素ごとに決まった線を示した。1885年にバルマーが水素の線の規則を見つけ、1897年にJ・J・トムソンが電子を見つけた。1903年に長岡半太郎が土星型の原子模型、1904年にトムソンが正の電気の球に電子が並ぶ模型を発表した。1909年にガイガーとマースデンがα粒子のはね返りを見つけ、1911年にラザフォードが中心に小さく重い部分のある模型を発表した。1913年にボーアがとびとびの軌道の模型を発表し、1914年にフランクとヘルツがとびとびのエネルギーを確かめた。"
      >
        <Arrow x1={14} y1={131} x2={710} y2={131} />
        {ROAD.map((r, i) => {
          const x = 58 + i * 68
          const up = i % 2 === 0
          const ty = up ? 22 : 160
          return (
            <g key={r.y + r.who}>
              <circle cx={x} cy={131} r={6} fill={i === 8 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 104 : 138} x2={x} y2={up ? 125 : 150} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold fs={12.5}>
                {r.y}
              </T>
              <T x={x} y={ty + 19} anchor="middle" fs={12}>
                {r.who}
              </T>
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + 37 + j * 17} anchor="middle" fs={11.5} tone="muted">
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

/* ---------- 図22-2 元素ごとに決まった線（切り替え） ---------- */

type Src = 'hot' | 'H' | 'Na' | 'Hg' | 'He'

const SOURCES: Record<Src, { lines: number[]; text: string[] }> = {
  hot: { lines: [], text: ['熱した固体（電球のフィラメントなど）：', 'すべての色が切れ目なく並ぶ'] },
  H: { lines: H_LINES, text: ['水素：4本の線', '（赤・青緑・青紫・紫）'] },
  Na: { lines: NA_LINES, text: ['ナトリウム：黄色の2本の線', '（近すぎて1本に見える）'] },
  Hg: { lines: HG_LINES, text: ['水銀：紫・青・緑・黄の線', '（黄は2本が近く並ぶ）'] },
  He: { lines: HE_LINES, text: ['ヘリウム：7本の線', '（紫から赤まで）'] },
}

const COLOR_NAMES: [number, string][] = [
  [415, '紫'],
  [470, '青'],
  [525, '緑'],
  [580, '黄'],
  [610, '橙'],
  [665, '赤'],
]

export function FigElements() {
  const [src, setSrc] = useState<Src>('H')
  const s = SOURCES[src]
  const x = 60
  const w = 600
  const X = (nm: number) => x + ((nm - LO) / (HI - LO)) * w
  return (
    <Figure
      n="22-2"
      title="気体にした元素は、元素ごとに決まった色の線だけを出す"
      controls={
        <Choice
          label="光らせる物"
          options={[
            { value: 'hot', label: '熱した固体' },
            { value: 'H', label: '水素' },
            { value: 'Na', label: 'ナトリウム' },
            { value: 'Hg', label: '水銀' },
            { value: 'He', label: 'ヘリウム' },
          ]}
          value={src}
          onChange={setSrc}
        />
      }
      caption="光をプリズムなどで分けて、波長の順に並べた模式図です。「光らせる物」を切り替えると、線の位置が元素ごとに違うことが分かります。線の位置はアメリカ国立標準技術研究所（NIST）の値に合わせ、明るさの違いは省いています。"
    >
      <Svg id="22-2" w={720} h={200} label="熱した固体の光はすべての色が切れ目なく並ぶ。水素は赤・青緑・青紫・紫の4本、ナトリウムは黄色の2本、水銀は紫・青・緑・黄の線、ヘリウムは紫から赤まで7本の線を出す。線の位置は元素ごとに決まっている。">
        {COLOR_NAMES.map(([nm, name]) => (
          <T key={name} x={X(nm)} y={22} anchor="middle" fs={12} tone="muted">
            {name}
          </T>
        ))}
        <Strip id="22-2" x={x} y={36} w={w} h={56} kind={src === 'hot' ? 'cont' : 'emit'} lines={s.lines} />
        <Scale x={x} y={92} w={w} />
        <T x={x} y={150} fs={13} bold>
          {s.text[0]}
        </T>
        <T x={x} y={172} fs={12.5} tone="muted">
          {s.text[1]}
        </T>
        <T x={680} y={150} anchor="end" fs={12} tone="muted">
          ← 波長が短い　　波長が長い →
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図22-3 太陽の光の暗い線 ---------- */

export function FigSunLines() {
  const x = 170
  const w = 520
  const X = (nm: number) => x + ((nm - LO) / (HI - LO)) * w
  const rows: { label: string[]; kind: 'abs' | 'emit'; lines: number[] }[] = [
    { label: ['太陽の光'], kind: 'abs', lines: [...H_LINES, ...NA_LINES] },
    { label: ['ナトリウムを', '炎に入れた光'], kind: 'emit', lines: NA_LINES },
    { label: ['水素を', '光らせた光'], kind: 'emit', lines: H_LINES },
  ]
  const top = 54
  const rowH = 40
  const gap = 26
  return (
    <Figure
      n="22-3"
      title="太陽の光の暗い線は、元素が出す明るい線と同じ位置にある"
      caption="模式図です。実際の太陽の光には数百本以上の暗い線がありますが、ここでは水素とナトリウムの線だけを描いています。上の文字は、フラウンホーファーが目立つ線に付けた記号です。"
    >
      <Svg id="22-3" w={720} h={260} label="太陽の光の色の帯に暗い線がある。ナトリウムを炎に入れたときの黄色の明るい線は、太陽の光のD線と呼ばれる暗い線と同じ位置にある。水素を光らせたときの4本の明るい線も、太陽の光の暗い線と同じ位置にある。">
        {[
          { nm: 656.28, s: 'C線' },
          { nm: 589.3, s: 'D線' },
          { nm: 486.13, s: 'F線' },
        ].map((m) => (
          <T key={m.s} x={X(m.nm)} y={top - 14} anchor="middle" fs={12} bold>
            {m.s}
          </T>
        ))}
        {[...H_LINES, 589.3].map((nm) => (
          <line key={nm} x1={X(nm)} x2={X(nm)} y1={top} y2={top + 3 * rowH + 2 * gap} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        ))}
        {rows.map((r, i) => {
          const y = top + i * (rowH + gap)
          return (
            <g key={i}>
              {r.label.map((l, j) => (
                <T key={j} x={20} y={y + rowH / 2 + (j - (r.label.length - 1) / 2) * 17} fs={12.5}>
                  {l}
                </T>
              ))}
              <Strip id={`22-3-${i}`} x={x} y={y} w={w} h={rowH} kind={r.kind} lines={r.lines} />
            </g>
          )
        })}
        <Scale x={x} y={top + 3 * rowH + 2 * gap} w={w} />
      </Svg>
    </Figure>
  )
}

/* ---------- 図22-4 陰極線が電場で曲がる（動） ---------- */

const CY = 112 // 管の中心の高さ
const PL0 = 300 // 板の左端
const PL1 = 430 // 板の右端
const SCREEN = 620
const KDEF = 35 / 66300 // 画面で 35 ずれる曲がり方

function beamY(x: number, on: boolean) {
  if (!on || x <= PL0) return CY
  if (x <= PL1) return CY - KDEF * (x - PL0) ** 2
  const L = PL1 - PL0
  return CY - KDEF * L * L - 2 * KDEF * L * (x - PL1)
}

export function FigCathode() {
  const period = 8
  return (
    <Anim
      n="22-4"
      title="陰極線は、＋の電気を帯びた板の方へ曲がる"
      still={6.2}
      period={period}
      caption="模式図です。前半は板に電圧をかけず、後半は上の板を＋、下の板を−にします。小さな丸は陰極線の粒を表し、実際には目に見えません。粒が当たった所のガラスが光ります。"
    >
      {(t) => {
        const on = t % period >= 4
        const u = t % 4
        const dots = Array.from({ length: 12 }, (_, i) => {
          const x = 160 + (((u * 240 + i * 40) % 460) + 460) % 460
          return { x, y: beamY(x, on) }
        })
        const hitY = beamY(SCREEN, on)
        const tag = dots.find((d) => d.x > 340 && d.x < 420)
        return (
          <Svg id="22-4" w={720} h={236} label="ガラス管の中で、陰極から出た陰極線が陽極のすき間を通り、2枚の板の間を進んで右端のガラスに当たる。板に電圧をかけないとまっすぐ進み、上の板を＋、下の板を−にすると、陰極線は上の＋の板の方へ曲がる。">
            <rect x={40} y={56} width={600} height={112} rx={40} fill="var(--fig-box)" stroke="var(--fig-line)" />
            {/* 陰極と陽極 */}
            <rect x={70} y={86} width={8} height={52} fill="var(--fig-line)" />
            <T x={74} y={36} anchor="middle" fs={12}>
              陰極（−）
            </T>
            <line x1={74} y1={44} x2={74} y2={84} stroke="var(--fig-muted)" />
            <rect x={150} y={80} width={6} height={26} fill="var(--fig-line)" />
            <rect x={150} y={118} width={6} height={26} fill="var(--fig-line)" />
            <T x={153} y={36} anchor="middle" fs={12}>
              陽極（＋）
            </T>
            <line x1={153} y1={44} x2={153} y2={78} stroke="var(--fig-muted)" />
            {/* 曲げる板 */}
            <rect x={PL0} y={80} width={PL1 - PL0} height={6} fill={on ? 'var(--fig-box2)' : 'var(--fig-bg)'} stroke="var(--fig-line)" />
            <rect x={PL0} y={138} width={PL1 - PL0} height={6} fill={on ? 'var(--fig-box3)' : 'var(--fig-bg)'} stroke="var(--fig-line)" />
            {on && (
              <>
                <T x={PL0 - 10} y={83} anchor="end" fs={13} bold>
                  ＋
                </T>
                <T x={PL0 - 10} y={141} anchor="end" fs={13} bold>
                  −
                </T>
              </>
            )}
            <T x={(PL0 + PL1) / 2} y={36} anchor="middle" fs={12}>
              電圧をかける2枚の板
            </T>
            <line x1={(PL0 + PL1) / 2} y1={44} x2={(PL0 + PL1) / 2} y2={78} stroke="var(--fig-muted)" />
            {/* 道筋 */}
            <Trail points={Array.from({ length: 24 }, (_, i) => [156 + (i * (SCREEN - 156)) / 23, beamY(156 + (i * (SCREEN - 156)) / 23, on)] as [number, number])} />
            {dots.map((d, i) => (
              <Ball key={i} x={d.x} y={d.y} r={3.5} fill="var(--fig-line)" />
            ))}
            {on && tag && <Force x1={tag.x} y1={tag.y - 5} x2={tag.x} y2={tag.y - 24} />}
            {/* 光る所 */}
            <circle cx={SCREEN + 6} cy={hitY} r={8} fill="var(--fig-accent)" opacity={0.75} />
            <T x={SCREEN + 6} y={190} anchor="middle" fs={12}>
              光る所
            </T>
            <line x1={SCREEN + 6} y1={180} x2={SCREEN + 6} y2={hitY + 10} stroke="var(--fig-muted)" />
            <T x={40} y={194} fs={12.5} bold>
              {on ? '後半：上の板を＋、下の板を−にした' : '前半：板に電圧をかけていない'}
            </T>
            <T x={40} y={216} fs={12} tone="muted">
              {on ? '負の電気を持つ粒が＋の板に引かれて（青の矢印）、上へ曲がる' : '陰極線はまっすぐ進む'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図22-5 トムソンの模型と長岡の模型 ---------- */

function Electron({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={7} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.2} />
      <text x={x} y={y + 0.5} fontSize={11} textAnchor="middle" dominantBaseline="central">
        −
      </text>
    </g>
  )
}

export function FigModels() {
  const thomson = [
    ...Array.from({ length: 3 }, (_, i) => [180 + 22 * Math.cos((i * 2 * Math.PI) / 3 - Math.PI / 2), 150 + 22 * Math.sin((i * 2 * Math.PI) / 3 - Math.PI / 2)]),
    ...Array.from({ length: 8 }, (_, i) => [180 + 58 * Math.cos((i * 2 * Math.PI) / 8), 150 + 58 * Math.sin((i * 2 * Math.PI) / 8)]),
  ]
  const ring = Array.from({ length: 14 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 14
    return [540 + 128 * Math.cos(a), 150 + 34 * Math.sin(a)]
  })
  return (
    <Figure
      n="22-5"
      title="J・J・トムソンの模型と長岡半太郎の模型"
      caption="どちらも模式図で、電子の数は少なく描いています。トムソンの模型では、正の電気は原子の全体に広がり、質量の大部分は電子が受け持つと考えられていました。長岡の模型では、正の電気を持つ重い中心のまわりを、たくさんの電子が輪になって回ります。"
    >
      <Svg id="22-5" w={720} h={300} label="左はJ・J・トムソンの1904年の模型で、正の電気が一様に広がった球の中に、電子が輪をつくって並ぶ。右は長岡半太郎の1903年の土星型の模型で、正の電気を持つ重い中心のまわりを、多くの電子が土星の輪のように回る。">
        <T x={180} y={22} anchor="middle" bold>
          J・J・トムソン（1904年）
        </T>
        <circle cx={180} cy={150} r={96} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        {thomson.map(([x, y], i) => (
          <Electron key={i} x={x} y={y} />
        ))}
        <T x={180} y={266} anchor="middle" fs={12.5}>
          正の電気が球の全体に広がる
        </T>
        <T x={180} y={286} anchor="middle" fs={12} tone="muted">
          その中に電子が輪をつくって並ぶ
        </T>

        <T x={540} y={22} anchor="middle" bold>
          長岡半太郎（1903年）
        </T>
        <ellipse cx={540} cy={150} rx={128} ry={34} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <Ball x={540} y={150} r={20} fill="var(--fig-box2)">
          <text x={540} y={150.5} fontSize={15} textAnchor="middle" dominantBaseline="central">
            ＋
          </text>
        </Ball>
        {ring.map(([x, y], i) => (
          <Electron key={i} x={x} y={y} />
        ))}
        <T x={540} y={70} anchor="middle" fs={12.5}>
          正の電気を持つ重い中心
        </T>
        <line x1={540} y1={80} x2={540} y2={126} stroke="var(--fig-muted)" />
        <T x={540} y={266} anchor="middle" fs={12.5}>
          電子の輪が中心のまわりを回る
        </T>
        <T x={540} y={286} anchor="middle" fs={12} tone="muted">
          （土星とその輪に似た形）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図22-6 金箔に当てたα粒子の散らばり方（動・切り替え） ---------- */

const FOIL = { x: 380, y: 170 }
const SCR = 150 // 蛍光板の円の半径
const SPEED = 220
const SRC_X = 110

type Model = 'thomson' | 'nucleus'

const ALPHAS = (() => {
  const r = rng(2209)
  const med = new Set([6, 14, 22, 31, 40, 49])
  const big = new Set([11, 35, 54])
  return Array.from({ length: 60 }, (_, i) => {
    const s = r() < 0.5 ? -1 : 1
    const u = r()
    const u2 = r()
    const dy = (r() - 0.5) * 12
    const nuc = big.has(i) ? 125 + u * 35 : med.has(i) ? 15 + u * 45 : u * 4
    return { t0: i * 0.1, dy, deg: { nucleus: s * nuc, thomson: s * u2 * 2 } }
  })
})()

const TF = (FOIL.x - SRC_X) / SPEED // 箔に着くまでの時間
const TS = SCR / SPEED // 箔から幕までの時間

export function FigGoldFoil() {
  const [model, setModel] = useState<Model>('nucleus')
  const period = 9
  const gap = (10 * Math.PI) / 180
  const arcA = { x: FOIL.x + SCR * Math.cos(Math.PI + gap), y: FOIL.y + SCR * Math.sin(Math.PI + gap) }
  const arcB = { x: FOIL.x + SCR * Math.cos(Math.PI - gap), y: FOIL.y + SCR * Math.sin(Math.PI - gap) }
  return (
    <Anim
      n="22-6"
      title="金箔に当てたα粒子の大部分は通り抜け、ごく一部が大きく曲がる"
      still={8.3}
      period={period}
      controls={
        <Choice
          label="原子の模型"
          options={[
            { value: 'nucleus', label: '中心に小さく重い部分がある' },
            { value: 'thomson', label: 'トムソンの模型' },
          ]}
          value={model}
          onChange={setModel}
        />
      }
      caption="模式図です。外側の点線の円は、α粒子が当たると光る幕を表します。大きく曲がる粒子とはね返る粒子は、見やすいように実際よりずっと多く描いています（白金の板では、はね返ったのは約8000個に1個でした）。「原子の模型」をトムソンの模型に切り替えると、どの粒子もほとんど曲がりません。"
    >
      {(t) => {
        const tt = t % period
        const counts = [0, 0, 0]
        const items = ALPHAS.map((a, i) => {
          const th = (a.deg[model] * Math.PI) / 180
          const y0 = FOIL.y + a.dy
          const end = { x: FOIL.x + SCR * Math.cos(th), y: y0 + SCR * Math.sin(th) }
          const k = Math.abs(a.deg[model]) < 10 ? 0 : Math.abs(a.deg[model]) < 90 ? 1 : 2
          if (tt < a.t0) return null
          if (tt < a.t0 + TF) return <Ball key={i} x={SRC_X + SPEED * (tt - a.t0)} y={y0} r={4} />
          if (tt < a.t0 + TF + TS) {
            const s = SPEED * (tt - a.t0 - TF)
            return (
              <g key={i}>
                {k > 0 && <Trail points={[[FOIL.x, y0], [FOIL.x + s * Math.cos(th), y0 + s * Math.sin(th)]]} />}
                <Ball x={FOIL.x + s * Math.cos(th)} y={y0 + s * Math.sin(th)} r={4} />
              </g>
            )
          }
          counts[k]++
          return (
            <g key={i}>
              {k > 0 && <Trail points={[[FOIL.x, y0], [end.x, end.y]]} />}
              <circle cx={end.x} cy={end.y} r={4} fill="var(--fig-accent)" opacity={0.8} />
            </g>
          )
        })
        return (
          <Svg id="22-6" w={720} h={340} label="左の物質から出たα粒子が金箔に当たる。中心に小さく重い部分がある模型では、大部分はまっすぐ通り抜け、少しが大きく曲がり、ごく一部が来た方へはね返る。トムソンの模型では、どの粒子もほとんど曲がらずに通り抜ける。">
            <path d={`M${arcA.x.toFixed(1)},${arcA.y.toFixed(1)} A${SCR},${SCR} 0 1 1 ${arcB.x.toFixed(1)},${arcB.y.toFixed(1)}`} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="5 4" />
            <Trail points={[[SRC_X, FOIL.y], [FOIL.x, FOIL.y]]} />
            <rect x={40} y={154} width={SRC_X - 40} height={32} rx={3} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={75} y={206} anchor="middle" fs={11.5}>
              α粒子を出す物質
            </T>
            <T x={170} y={146} anchor="middle" fs={12} tone="muted">
              α粒子
            </T>
            <rect x={FOIL.x - 2} y={110} width={4} height={120} fill="#c9a227" stroke="var(--fig-line)" strokeWidth={0.6} />
            <T x={FOIL.x} y={96} anchor="middle" fs={12} bold>
              金箔
            </T>
            {items}
            <T x={560} y={40} fs={12.5} bold>
              幕に当たった数
            </T>
            {[
              ['ほぼまっすぐ', counts[0]],
              ['大きく曲がる', counts[1]],
              ['はね返る', counts[2]],
            ].map(([l, c], i) => (
              <g key={l}>
                <T x={560} y={66 + i * 22} fs={12.5}>
                  {l}
                </T>
                <T x={700} y={66 + i * 22} anchor="end" fs={12.5} bold>
                  {`${c}個`}
                </T>
              </g>
            ))}
            <T x={560} y={296} fs={12} tone="muted">
              点線の円：当たると光る幕
            </T>
            <T x={560} y={316} fs={12} tone="muted">
              青の点：当たった所
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図22-7 原子核の近くを通るα粒子（動・スライダー） ---------- */

const NUC = { x: 360, y: 182 }
const OFFSETS = [0, 8, 15, 30, 60, 110]
const OFFSET_NAMES = ['0（真正面）', 'とても小さい', '小さい', '中くらい', '大きい', 'とても大きい']
const D0 = 30 // 真正面から来たときに近づける距離
const V0 = 120
const KC = 0.5 * V0 * V0 * D0
const STEP = 0.02 // 記録の間隔（秒）

type Pt = { x: number; y: number; vx: number; vy: number; ax: number; ay: number }

/** 原子核に押し返されながら進む道筋（原子核からの位置）。小さな時間刻みで少しずつ進めて求める */
function scatterPath(b: number): Pt[] {
  let x = -320
  let y = -b
  let vx = V0
  let vy = 0
  const dt = 0.002
  const pts: Pt[] = []
  for (let i = 0; i < 6000; i++) {
    const r2 = x * x + y * y
    const r = Math.sqrt(r2)
    const ax = (KC * x) / (r2 * r)
    const ay = (KC * y) / (r2 * r)
    vx += ax * dt
    vy += ay * dt
    x += vx * dt
    y += vy * dt
    if (i % 10 === 0) pts.push({ x, y, vx, vy, ax, ay })
    if (i > 500 && r > 345) break
  }
  return pts
}

const PATHS = OFFSETS.map(scatterPath)
const ANGLES = OFFSETS.map((b) => (b === 0 ? 180 : (2 * Math.atan(D0 / (2 * b)) * 180) / Math.PI))

export function FigNearNucleus() {
  const [k, setK] = useState(2)
  const pts = PATHS[k]
  const dur = pts.length * STEP
  const deg = Math.round(ANGLES[k] / 5) * 5
  return (
    <Anim
      n="22-7"
      title="原子核の真正面に近いほど、α粒子は大きく曲がる"
      still={3}
      period={dur + 1}
      controls={<Range label="原子核からのずれ" min={0} max={5} value={k} onChange={setK} format={(v) => OFFSET_NAMES[v]} />}
      caption="正の電気を持つ原子核が、正の電気を持つα粒子を押し返します（青の矢印）。黒の矢印はα粒子の速さと向きです。「原子核からのずれ」を小さくするほど、粒子は大きく曲がり、真正面では来た方へはね返ります。薄い点線はほかのずれのときの道筋です。"
    >
      {(t) => {
        const i = Math.min(Math.floor(t / STEP), pts.length - 1)
        const p = pts[i]
        const px = NUC.x + p.x
        const py = NUC.y + p.y
        const a = Math.hypot(p.ax, p.ay)
        const fl = Math.min(64, a * 0.26)
        const v = Math.hypot(p.vx, p.vy)
        const toSvg = (q: Pt) => [NUC.x + q.x, NUC.y + q.y] as [number, number]
        return (
          <Svg id="22-7" w={720} h={300} label="左から進んできたα粒子が、正の電気を持つ原子核に押し返されて曲がる。原子核の真正面に近い粒子ほど大きく曲がり、真正面の粒子は来た方へはね返る。">
            {PATHS.map((q, j) =>
              j === k ? null : (
                <g key={j} opacity={0.35}>
                  <Trail points={q.filter((_, m) => m % 3 === 0).map(toSvg)} />
                </g>
              ),
            )}
            <Trail points={pts.slice(0, i + 1).filter((_, m) => m % 2 === 0).map(toSvg)} />
            <Ball x={NUC.x} y={NUC.y} r={7} fill="var(--fig-box2)" />
            <T x={NUC.x} y={NUC.y + 22} anchor="middle" fs={12}>
              原子核（＋）
            </T>
            {fl > 5 && <Force x1={px} y1={py} x2={px + (p.ax / a) * fl} y2={py + (p.ay / a) * fl} />}
            <Vel x1={px} y1={py} x2={px + (p.vx / v) * 30} y2={py + (p.vy / v) * 30} />
            <Ball x={px} y={py} r={5} />
            <T x={430} y={250} fs={13} bold>
              {`曲がる角度：約${deg}度`}
            </T>
            <T x={430} y={274} fs={12} tone="muted">
              {deg > 90 ? '（来た方へはね返る）' : deg >= 45 ? '（大きく曲がる）' : '（少し曲がる）'}
            </T>
            <T x={20} y={274} fs={12} tone="muted">
              α粒子（＋）は左から進む
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図22-8 当時の電磁気学で考えた原子（動） ---------- */

const SPIRAL = (() => {
  const pts: { r: number; a: number }[] = []
  let a = -Math.PI / 2
  for (let i = 0; i <= 400; i++) {
    const t = i * 0.01
    const r = 92 * Math.cbrt(Math.max(0, 1 - t / 4.05))
    pts.push({ r: Math.max(r, 7), a })
    a += Math.min(((2 * Math.PI) / 1.6) * (92 / Math.max(r, 7)) ** 1.5, 28) * 0.01
  }
  return pts
})()

export function FigCollapse() {
  const L = { x: 180, y: 148 }
  const R = { x: 540, y: 148 }
  return (
    <Anim
      n="22-8"
      title="当時の電磁気学では、回る電子は光を出しながら原子核に落ちてしまう"
      still={5}
      period={6}
      caption="模式図です。左は、電子が回り続けると光を出してエネルギーを失い、渦を巻いて原子核に落ちるという、当時の電磁気学からの予想です。実際の原子は壊れないので、この予想は起こりません（赤の×）。右は、決まった軌道を回る間は光を出さないというボーアの考えです。"
    >
      {(t) => {
        const tt = t % 6
        const i = Math.min(Math.floor(tt / 0.01), SPIRAL.length - 1)
        const s = SPIRAL[i]
        const ex = L.x + s.r * Math.cos(s.a)
        const ey = L.y + s.r * Math.sin(s.a)
        const done = tt >= 4
        const trail = SPIRAL.slice(0, i + 1)
          .filter((_, m) => m % 2 === 0)
          .map((q) => [L.x + q.r * Math.cos(q.a), L.y + q.r * Math.sin(q.a)] as [number, number])
        const ra = -Math.PI / 2 + tt * ((2 * Math.PI) / 1.6)
        return (
          <Svg id="22-8" w={720} h={304} label="左では、原子核のまわりを回る電子が光を出しながら渦を巻いて原子核に落ちる。これは当時の電磁気学からの予想で、実際には起こらない。右では、電子が決まった軌道を回り続け、その間は光を出さない。">
            <T x={L.x} y={20} anchor="middle" bold>
              当時の電磁気学で考えると
            </T>
            <Trail points={trail} />
            {!done &&
              [0, 1, 2].map((j) => {
                const age = (tt * 1.5 + j / 3) % 1
                return <circle key={j} cx={L.x} cy={L.y} r={96 + age * 16} fill="none" stroke="var(--fig-accent)" strokeWidth={1.2} opacity={0.6 * (1 - age)} />
              })}
            <Ball x={L.x} y={L.y} r={6} fill="var(--fig-box2)" />
            {!done && <Ball x={ex} y={ey} r={5} fill="var(--fig-line)" />}
            {!done && (
              <T x={278} y={56} fs={12} tone="acc">
                出ていく光
              </T>
            )}
            {done && <Cross x={L.x} y={L.y} s={14} />}
            <T x={L.x} y={274} anchor="middle" fs={12} tone="muted">
              光を出してエネルギーを失い、原子核に落ちる
            </T>
            <T x={L.x} y={294} anchor="middle" fs={12} tone="danger">
              実際の原子は壊れない（こうはならない）
            </T>

            <line x1={360} y1={36} x2={360} y2={258} stroke="var(--fig-line)" strokeOpacity={0.3} />

            <T x={R.x} y={20} anchor="middle" bold>
              ボーアの考え（1913年）
            </T>
            <circle cx={R.x} cy={R.y} r={70} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <Ball x={R.x} y={R.y} r={6} fill="var(--fig-box2)" />
            <Ball x={R.x + 70 * Math.cos(ra)} y={R.y + 70 * Math.sin(ra)} r={5} fill="var(--fig-line)" />
            <T x={R.x} y={274} anchor="middle" fs={12} tone="muted">
              決まった軌道を回る間は光を出さない
            </T>
            <T x={R.x} y={294} anchor="middle" fs={12} tone="muted">
              （理由はこの時点では説明されていない）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図22-9 電子が軌道を移るときに出る光（動） ---------- */

const ORB = [0, 16, 38, 62, 88, 112, 134]
const JUMPS = [
  { from: 3, nm: 656.28, name: '赤' },
  { from: 4, nm: 486.13, name: '青緑' },
  { from: 5, nm: 434.05, name: '青紫' },
  { from: 6, nm: 410.17, name: '紫' },
]

export function FigJump() {
  const C = { x: 190, y: 150 }
  const deg = Math.PI / 180
  return (
    <Anim
      n="22-9"
      title="電子が外側の軌道から内側の軌道へ移るとき、決まった色の光が出る"
      still={2.2}
      period={12}
      caption="水素の原子の模式図です。数字は内側から数えた軌道の番号で、軌道の大きさの比は実際と違います（実際は内側から1倍、4倍、9倍、16倍と広がります）。中心の点は原子核です。3〜6番目の軌道から2番目の軌道へ移るときに、目に見える4色の光が出ます。光の波の長さの違いも比を合わせて描いています。"
    >
      {(t) => {
        const c = Math.floor((t % 12) / 3)
        const u = t % 3
        const j = JUMPS[c]
        const jumpA = -20 * deg
        let r: number
        let a: number
        if (u < 1) {
          r = ORB[j.from]
          a = (-110 + 90 * u) * deg
        } else if (u < 1.4) {
          r = ORB[j.from] + (ORB[2] - ORB[j.from]) * ease((u - 1) / 0.4)
          a = jumpA
        } else {
          r = ORB[2]
          a = jumpA + (u - 1.4) * 106 * deg
        }
        const ex = C.x + r * Math.cos(a)
        const ey = C.y + r * Math.sin(a)
        const sx = C.x + ORB[2] * Math.cos(jumpA)
        const sy = C.y + ORB[2] * Math.sin(jumpA)
        const head = sx + ((u - 1.4) / 1.6) * 200
        const x0 = Math.max(sx, head - 54)
        return (
          <Svg id="22-9" w={720} h={300} label="水素の原子で、電子が3番目から6番目の軌道から2番目の軌道へ移るとき、それぞれ赤、青緑、青紫、紫の光が出る。外側の軌道から移るほど、波長の短い光が出る。">
            {ORB.slice(1).map((rr, n) => (
              <g key={n}>
                <circle cx={C.x} cy={C.y} r={rr} fill="none" stroke={n + 1 === 2 || n + 1 === j.from ? 'var(--fig-line)' : 'var(--fig-muted)'} strokeWidth={n + 1 === 2 || n + 1 === j.from ? 1.4 : 1} strokeDasharray={n + 1 === 2 || n + 1 === j.from ? undefined : '3 4'} />
                <T x={C.x + (rr + 8) * Math.cos(-135 * deg)} y={C.y + (rr + 8) * Math.sin(-135 * deg)} anchor="end" fs={11.5} tone="muted">
                  {String(n + 1)}
                </T>
              </g>
            ))}
            <Ball x={C.x} y={C.y} r={4} fill="var(--fig-box2)" />
            {u >= 1.4 && head > x0 + 2 && <path d={wave(x0, sy, head - x0, 6, j.nm / 25)} fill="none" stroke={wlColor(j.nm)} strokeWidth={2.4} />}
            <Ball x={ex} y={ey} r={5} fill="var(--fig-line)" />
            <T x={20} y={22} fs={12} tone="muted">
              水素の原子（模式図）
            </T>
            <T x={450} y={40} fs={12.5} bold>
              電子が移る軌道と、出る光の色
            </T>
            {JUMPS.map((q, m) => (
              <g key={q.from}>
                <rect x={450} y={66 + m * 34} width={24} height={18} rx={3} fill={wlColor(q.nm)} />
                <T x={484} y={75 + m * 34} fs={12.5} bold={m === c} tone={m === c ? 'acc' : undefined}>
                  {`${q.from}番目 → 2番目：${q.name}`}
                </T>
              </g>
            ))}
            <T x={450} y={226} fs={12} tone="muted">
              外側の軌道から移るほど、
            </T>
            <T x={450} y={246} fs={12} tone="muted">
              波長の短い光が出る
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図22-10 水素のエネルギー準位と光の線 ---------- */

/** n 番目の準位の高さ。2番目から上はエネルギーの差の比を合わせ、1番目は途中を省いて下に置く */
const levelY = (n: number) => (n === 1 ? 430 : 40 + (1 / (n * n) / 0.25) * 300)

export function FigLevels() {
  const xL = 120
  const xR = 520
  const balmer = JUMPS.map((q, i) => ({ ...q, x: 250 + i * 30 }))
  const sx = 560
  const sw = 150
  const X = (nm: number) => sx + ((nm - LO) / (HI - LO)) * sw
  return (
    <Figure
      n="22-10"
      title="水素の光の線は、エネルギー準位の差に対応している"
      caption="横線は電子のエネルギー準位で、上ほどエネルギーが大きく、上へ行くほど間隔が狭くなります。2番目より上の間隔の比は実際に合わせ、1番目との間は途中を省いています（波線）。矢印は電子が移る向きです。2番目へ移るときの光は目に見え（バルマーが規則を見つけた線）、1番目へ移るときは紫外線、3番目へ移るときは赤外線になります。"
    >
      <Svg id="22-10" w={720} h={470} label="水素のエネルギー準位の図。上ほどエネルギーが大きく、間隔は上へ行くほど狭い。3番目から6番目の準位から2番目へ移ると赤・青緑・青紫・紫の目に見える光が出る。1番目へ移ると紫外線、3番目へ移ると赤外線が出る。">
        <T x={20} y={22} fs={12} tone="muted">
          上ほどエネルギーが大きい
        </T>
        <line x1={xL} y1={levelY(99)} x2={xR} y2={levelY(99)} stroke="var(--fig-muted)" strokeDasharray="5 4" />
        <T x={xL - 8} y={levelY(99)} anchor="end" fs={11.5} tone="muted">
          電子が離れる
        </T>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <g key={n}>
            <line x1={xL} y1={levelY(n)} x2={xR} y2={levelY(n)} stroke="var(--fig-line)" strokeWidth={1.6} />
            <T x={xL - 8} y={levelY(n)} anchor="end" fs={11.5}>
              {`${n}番目`}
            </T>
          </g>
        ))}
        {/* 省略の波線 */}
        {[372, 386].map((y) => (
          <path key={y} d={`M136,${y} q10,-6 20,0 t20,0 t20,0 t20,0`} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} />
        ))}
        {/* 1番目へ（紫外線） */}
        {[2, 3, 4].map((n, i) => (
          <Arrow key={n} x1={150 + i * 26} y1={levelY(n)} x2={150 + i * 26} y2={levelY(1) - 2} />
        ))}
        <T x={176} y={452} anchor="middle" fs={12}>
          紫外線
        </T>
        {/* 2番目へ（目に見える光） */}
        {balmer.map((q) => (
          <line key={q.from} x1={q.x} y1={levelY(q.from)} x2={q.x} y2={levelY(2) - 8} stroke={wlColor(q.nm)} strokeWidth={3} />
        ))}
        {balmer.map((q) => (
          <path key={`h${q.from}`} d={`M${q.x - 5},${levelY(2) - 10} L${q.x},${levelY(2) - 1} L${q.x + 5},${levelY(2) - 10} Z`} fill={wlColor(q.nm)} />
        ))}
        <T x={295} y={360} anchor="middle" fs={12}>
          目に見える光
        </T>
        {/* 3番目へ（赤外線） */}
        {[4, 5, 6].map((n, i) => (
          <Arrow key={n} x1={410 + i * 26} y1={levelY(n)} x2={410 + i * 26} y2={levelY(3) - 2} />
        ))}
        <T x={436} y={194} anchor="middle" fs={12}>
          赤外線
        </T>
        {/* 目に見える光の線 */}
        <T x={sx} y={262} fs={12} bold>
          水素の目に見える線
        </T>
        <Strip id="22-10" x={sx} y={276} w={sw} h={34} kind="emit" lines={H_LINES} />
        {balmer.map((q, i) => (
          <g key={`l${q.from}`}>
            <line x1={X(q.nm)} y1={310} x2={X(q.nm)} y2={318} stroke="var(--fig-muted)" />
            <rect x={sx} y={330 + i * 22} width={14} height={12} rx={2} fill={wlColor(q.nm)} />
            <T x={sx + 22} y={336 + i * 22} fs={11.5}>
              {`${q.name}：${q.from}番目 → 2番目`}
            </T>
          </g>
        ))}
      </Svg>
    </Figure>
  )
}
