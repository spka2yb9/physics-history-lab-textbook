import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Force, Trail, Vel, ease, rng, wave } from './common'

/* ---------- 共通：銀河の印と光の色の帯 ---------- */

/** 銀河の印（楕円）。大きさは描く場所によらず一定にする */
function Galaxy({ x, y, s = 1, accent, children }: { x: number; y: number; s?: number; accent?: boolean; children?: string }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={13 * s} ry={7.5 * s} fill="var(--fig-box3)" stroke={accent ? 'var(--fig-accent)' : 'var(--fig-line)'} strokeWidth={accent ? 2.6 : 1.2} />
      {children ? (
        <T x={x} y={y} anchor="middle" fs={11}>
          {children}
        </T>
      ) : (
        <circle cx={x} cy={y} r={2.2 * s} fill="var(--fig-line)" />
      )}
    </g>
  )
}

/** 波長（ナノメートル）と色の目安 */
const HUE: [number, number][] = [
  [400, 268],
  [450, 235],
  [480, 200],
  [500, 160],
  [530, 110],
  [570, 62],
  [590, 42],
  [620, 15],
  [700, 0],
]

function wlColor(nm: number): string {
  let h = 0
  for (let i = 0; i < HUE.length - 1; i++) {
    const [a, ha] = HUE[i]
    const [b, hb] = HUE[i + 1]
    if (nm >= a && nm <= b) h = ha + ((hb - ha) * (nm - a)) / (b - a)
  }
  return `hsl(${h.toFixed(0)} 85% 52%)`
}

const SP_LO = 400
const SP_HI = 700
/** 止まっている光源の暗い線の位置（水素とナトリウムの線を丸めた値） */
const SP_LINES = [434, 486, 589, 656]

/** 色の帯と暗い線。shift は線のずれ（ナノメートル）。marks を付けると、止まっているときの位置を帯の上に短い線で示す */
function Strip({ id, x, y, w, h, shift, marks }: { id: string; x: number; y: number; w: number; h: number; shift: number; marks?: boolean }) {
  const X = (nm: number) => x + ((nm - SP_LO) / (SP_HI - SP_LO)) * w
  const gid = `sp33-${id}`
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          {Array.from({ length: 16 }, (_, i) => {
            const nm = SP_LO + ((SP_HI - SP_LO) * i) / 15
            return <stop key={i} offset={i / 15} stopColor={wlColor(nm)} />
          })}
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${gid})`} stroke="var(--fig-line)" />
      {SP_LINES.map((nm) => (
        <g key={nm}>
          {marks && <line x1={X(nm)} x2={X(nm)} y1={y - 9} y2={y - 1} stroke="var(--fig-muted)" strokeWidth={1.5} />}
          <line x1={X(nm + shift)} x2={X(nm + shift)} y1={y + 1} y2={y + h - 1} stroke="#141418" strokeWidth={2.2} />
        </g>
      ))}
    </g>
  )
}

/* ---------- 図33-1 膨張する宇宙が分かるまでの年表 ---------- */

const ROAD = [
  { y: '1908年', who: 'リービット', what: ['1777個の', '変光星の一覧'] },
  { y: '1912年', who: 'リービット', what: ['周期と明るさの', '関係'] },
  { y: '1912年〜', who: 'スライファー', what: ['渦巻星雲の', '速さを測る'] },
  { y: '1917年', who: 'アインシュタイン', what: ['静止した宇宙と', '宇宙項'] },
  { y: '1920年', who: 'シャプレーとカーティス', what: ['宇宙の大きさの', '論争'] },
  { y: '1922年', who: 'フリードマン', what: ['大きさの変わる', '宇宙の解'] },
  { y: '1925年', who: 'ハッブル', what: ['アンドロメダは', '別の銀河'] },
  { y: '1927年', who: 'ルメートル', what: ['膨張する宇宙と', '速さと距離の比例'] },
  { y: '1929年', who: 'ハッブル', what: ['24個の銀河の', '速さと距離'] },
]

export function FigRoad() {
  return (
    <Figure n="33-1" title="宇宙が膨張していると分かるまでの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg
        id="33-1"
        w={760}
        h={250}
        label="1908年と1912年にリービットが変光星の性質を報告し、1912年からスライファーが渦巻星雲の速さを測った。1917年にアインシュタインが静止した宇宙を考え、1920年にシャプレーとカーティスが論争した。1922年にフリードマン、1927年にルメートルが大きさの変わる宇宙を示し、1925年と1929年にハッブルが観測の結果を発表した。"
      >
        <Arrow x1={14} y1={125} x2={748} y2={125} />
        {ROAD.map((r, i) => {
          const x = 44 + i * 84
          const up = i % 2 === 0
          const ty = up ? 30 : 152
          return (
            <g key={i}>
              <circle cx={x} cy={125} r={6} fill={i === 8 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
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

/* ---------- 図33-2 明るさが規則正しく変わる星（動） ---------- */

/** セファイド変光星の明るさの変わり方（0〜1）。急に明るくなり、ゆっくり暗くなる */
function lightCurve(phase: number): number {
  const p = phase - Math.floor(phase)
  if (p < 0.12) return ease(p / 0.12)
  return Math.pow(1 - (p - 0.12) / 0.88, 1.6)
}

const CEPH = [
  { name: '星A', period: 4, lo: 0.6, hi: 0.92, r: 22, sy: 80, note: '星A：明るく、周期が長い', ny: 48 },
  { name: '星B', period: 1.6, lo: 0.12, hi: 0.38, r: 12, sy: 185, note: '星B：暗く、周期が短い', ny: 146 },
]

export function FigCepheid() {
  const T_END = 8
  const gx = (t: number) => 250 + (t / T_END) * 440
  const gy = (b: number) => 228 - b * 175
  return (
    <Anim
      n="33-2"
      title="明るい星ほど、明るさがゆっくり変わる"
      still={7.9}
      period={9}
      caption="模式図です。実際の周期は数日から数十日で、ここでは数秒に縮めています。どちらの星も急に明るくなってから、ゆっくり暗くなります。2つの星は地球から同じ距離にあるとしているので、グラフの高さの違いは星そのものの明るさの違いを表します。"
    >
      {(t) => {
        const tt = Math.min(t, T_END)
        return (
          <Svg id="33-2" w={720} h={258} label="2つの変光星の明るさの変化。明るい星Aは周期が長く、暗い星Bは周期が短い。どちらも急に明るくなって、ゆっくり暗くなることを繰り返す。">
            {/* 星 */}
            {CEPH.map((c) => {
              const b = lightCurve(tt / c.period)
              return (
                <g key={c.name}>
                  <circle cx={95} cy={c.sy} r={c.r * 1.7} fill="#f5c542" opacity={0.12 + 0.3 * b} />
                  <circle cx={95} cy={c.sy} r={c.r} fill="#f5c542" opacity={0.35 + 0.65 * b} stroke="var(--fig-line)" />
                  <T x={95} y={c.sy + c.r * 1.7 + 12} anchor="middle" fs={12.5}>
                    {c.name}
                  </T>
                </g>
              )
            })}
            {/* グラフ */}
            <line x1={gx(0)} y1={gy(0) + 4} x2={gx(T_END) + 10} y2={gy(0) + 4} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0) + 4} x2={gx(0)} y2={26} stroke="var(--fig-line)" />
            <T x={gx(0) + 8} y={24} fs={12} tone="muted">
              明るさ
            </T>
            <T x={gx(T_END) + 10} y={gy(0) + 18} anchor="end" fs={12} tone="muted">
              時間 →
            </T>
            {CEPH.map((c) => {
              const n = Math.max(2, Math.round(tt * 30))
              const pts = Array.from({ length: n + 1 }, (_, i) => {
                const u = (tt * i) / n
                return `${i ? 'L' : 'M'}${gx(u).toFixed(1)},${gy(c.lo + (c.hi - c.lo) * lightCurve(u / c.period)).toFixed(1)}`
              }).join(' ')
              const cy = gy(c.lo + (c.hi - c.lo) * lightCurve(tt / c.period))
              return (
                <g key={c.name}>
                  <path d={pts} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
                  <circle cx={gx(tt)} cy={cy} r={4} fill="var(--fig-accent)" />
                  <T x={440} y={c.ny} fs={12.5}>
                    {c.note}
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

/* ---------- 図33-3 リービットの1912年の表から描いたグラフ ---------- */

/** ハーバード大学天文台回報173号（1912年）の表1。周期（日）、最も明るいとき、最も暗いときの明るさ（等） */
const LEAVITT: [number, number, number][] = [
  [1.25336, 14.8, 16.1], [1.6637, 14.8, 16.4], [1.762, 14.8, 16.4], [1.87502, 15.1, 16.3], [2.17352, 14.7, 15.6],
  [2.913, 14.4, 15.7], [3.501, 14.7, 15.9], [4.2897, 14.6, 16.1], [4.547, 14.3, 15.3], [4.9866, 14.3, 15.5],
  [5.311, 14.4, 15.4], [5.323, 14.3, 15.2], [6.2926, 13.8, 14.8], [6.65, 14.1, 14.8], [7.483, 14.0, 14.8],
  [8.397, 13.9, 15.2], [10.336, 13.6, 14.7], [11.645, 13.4, 14.6], [12.417, 13.8, 14.8], [13.08, 13.4, 14.4],
  [13.47, 13.4, 14.3], [16.75, 13.0, 14.6], [31.94, 12.2, 14.1], [65.8, 11.4, 12.8], [127.0, 11.2, 12.1],
]

/** 周期の対数に対する明るさの直線（最小二乗法）。[傾き, 切片] */
function fitLine(k: 1 | 2): [number, number] {
  const xs = LEAVITT.map((r) => Math.log10(r[0]))
  const ys = LEAVITT.map((r) => r[k])
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sxx = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
  }
  const slope = sxy / sxx
  return [slope, my - slope * mx]
}

export function FigLeavitt() {
  const X = (p: number) => 80 + (Math.log10(p) / 2.2) * 540
  const Y = (m: number) => 40 + ((m - 11) / 5.6) * 240
  const lines = ([1, 2] as const).map((k) => fitLine(k))
  return (
    <Figure
      n="33-3"
      title="小マゼラン雲の25個の変光星：周期が長いほど明るい"
      caption="リービットの1912年の報告の表から描いたグラフです。横の目盛りは、1日、10日、100日が等しい間隔になるように取っています。縦は地球から見た明るさで、「等」の数が小さいほど明るい星です。どちらの点の並びもほぼ直線に乗ります。"
    >
      <Svg id="33-3" w={680} h={330} label="横に明るさが変わる周期、縦に明るさをとったグラフ。25個の星の点が右上がりの直線に沿って並び、周期が長い星ほど明るい。">
        {/* 目盛り */}
        {[11, 12, 13, 14, 15, 16].map((m) => (
          <g key={m}>
            <line x1={75} x2={80} y1={Y(m)} y2={Y(m)} stroke="var(--fig-line)" />
            <T x={72} y={Y(m)} anchor="end" fs={11.5} tone="muted">{`${m}等`}</T>
          </g>
        ))}
        {[1, 2, 5, 10, 20, 50, 100].map((p) => (
          <g key={p}>
            <line x1={X(p)} x2={X(p)} y1={Y(16.6)} y2={Y(16.6) + 5} stroke="var(--fig-line)" />
            <T x={X(p)} y={Y(16.6) + 17} anchor="middle" fs={11.5} tone="muted">{`${p}日`}</T>
          </g>
        ))}
        <line x1={80} x2={625} y1={Y(16.6)} y2={Y(16.6)} stroke="var(--fig-line)" />
        <line x1={80} x2={80} y1={Y(16.6)} y2={30} stroke="var(--fig-line)" />
        <T x={20} y={18} fs={12}>
          見かけの明るさ（上ほど明るい）
        </T>
        <T x={620} y={318} anchor="end" fs={12}>
          明るさが変わる周期 →
        </T>
        {/* 直線 */}
        {lines.map(([a, b], i) => (
          <line key={i} x1={X(1.2)} y1={Y(b + a * Math.log10(1.2))} x2={X(135)} y2={Y(b + a * Math.log10(135))} stroke="var(--fig-muted)" strokeDasharray="5 4" />
        ))}
        {/* 点 */}
        {LEAVITT.map(([p, mx, mn], i) => (
          <g key={i}>
            <circle cx={X(p)} cy={Y(mn)} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.3} />
            <circle cx={X(p)} cy={Y(mx)} r={4} fill="var(--fig-accent)" />
          </g>
        ))}
        {/* 凡例 */}
        <circle cx={100} cy={60} r={4} fill="var(--fig-accent)" />
        <T x={112} y={60} fs={12}>
          最も明るいとき
        </T>
        <circle cx={100} cy={82} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.3} />
        <T x={112} y={82} fs={12}>
          最も暗いとき
        </T>
        <line x1={92} x2={110} y1={104} y2={104} stroke="var(--fig-muted)" strokeDasharray="5 4" />
        <T x={116} y={104} fs={12}>
          点の並びに沿う直線
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図33-4 変光星の周期から距離を出す流れ ---------- */

export function FigDistance() {
  const steps = [
    { x: 10, lines: ['① 明るさの変化を', '続けて観測し、', '周期を測る'] },
    { x: 190, lines: ['② 周期と明るさの', '関係から、星その', 'ものの明るさを知る'] },
    { x: 370, lines: ['③ 地球から見た', '見かけの明るさと', '比べる'] },
    { x: 550, lines: ['④ 星までの距離', '（星を含む銀河', 'までの距離）が出る'] },
  ]
  const sx = 456
  const pts = [
    { d: 1, x: 530, r: 11, txt: '1' },
    { d: 2, x: 590, r: 5.5, txt: '4分の1' },
    { d: 3, x: 650, r: 3.7, txt: '9分の1' },
  ]
  return (
    <Figure
      n="33-4"
      title="変光星の周期から距離を出す流れ"
      caption="②の関係の目盛り（ある周期の星が実際にどれだけ明るいか）は、ほかの方法で距離の分かった近くの変光星を使って決めます。右下は③の考え方で、同じ明るさの星でも、距離が2倍になると見かけの明るさは4分の1、3倍になると9分の1になります。"
    >
      <Svg id="33-4" w={720} h={270} label="①周期を測る、②周期と明るさの関係から星そのものの明るさを知る、③見かけの明るさと比べる、④距離が分かる、の4段階。②の目盛りは近くの変光星で決める。距離が2倍になると見かけの明るさは4分の1になる。">
        {steps.map((s, i) => (
          <g key={i}>
            <Box x={s.x} y={24} w={160} h={80} lines={s.lines} fs={12.5} fill={i === 3 ? 'box3' : 'box'} accent={i === 3} />
            {i < 3 && <Arrow x1={s.x + 162} y1={64} x2={s.x + 178} y2={64} />}
          </g>
        ))}
        <Box x={110} y={160} w={240} h={56} lines={['目盛り合わせ：距離の分かる', '近くの変光星で決める（1913年〜）']} fs={12} fill="box4" dashed />
        <Arrow x1={270} y1={158} x2={270} y2={106} />
        {/* 距離と見かけの明るさ */}
        <T x={455} y={192} anchor="end" fs={11.5} tone="muted">
          見かけの明るさ
        </T>
        <T x={455} y={244} anchor="end" fs={11.5} tone="muted">
          距離
        </T>
        <circle cx={sx + 14} cy={218} r={9} fill="#f5c542" stroke="var(--fig-line)" />
        {pts.map((p) => (
          <g key={p.d}>
            <circle cx={p.x} cy={218} r={p.r} fill="var(--fig-accent)" opacity={0.85} />
            <T x={p.x} y={192} anchor="middle" fs={11.5}>
              {p.txt}
            </T>
            <T x={p.x} y={244} anchor="middle" fs={11.5}>
              {`${p.d}倍`}
            </T>
          </g>
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図33-5 ドップラー効果（動） ---------- */

export function FigDoppler() {
  const V = 30 // 光源の速さ（ピクセル毎秒）
  const C = 75 // 波の進む速さ
  const DT = 0.6 // 波の山を出す間隔
  return (
    <Anim
      n="33-5"
      title="遠ざかる光源の光は波長が長く、近づく光源の光は短く届く"
      still={4.8}
      period={6.5}
      caption="模式図です。円は光源から出た波の山の位置で、それぞれ出たときの光源の位置を中心に広がります。光源の後ろでは山の間隔（波長）が伸び、前では縮みます。下の帯は、左右の人が見る光のスペクトルで、黒い線が赤い側か青い側へずれます（ずれは誇張しています）。"
    >
      {(t) => {
        const tt = Math.min(t, 6)
        const xs = (u: number) => 300 + V * u
        const n = Math.floor(tt / DT)
        return (
          <Svg id="33-5" w={720} h={290} label="右へ動く光源から出た波の山。後ろ側の左の人には波長が長く、前側の右の人には波長が短く届き、スペクトルの線は左の人には赤い側へ、右の人には青い側へずれる。">
            <defs>
              <clipPath id="clip33-5">
                <rect x={0} y={40} width={720} height={160} />
              </clipPath>
            </defs>
            <g clipPath="url(#clip33-5)">
              {Array.from({ length: n + 1 }, (_, i) => {
                const te = i * DT
                return <circle key={i} cx={xs(te)} cy={120} r={C * (tt - te)} fill="none" stroke="var(--fig-accent)" strokeWidth={1.4} opacity={0.75} />
              })}
            </g>
            <T x={360} y={24} anchor="middle" fs={12.5}>
              光を出す物（右へ動く）
            </T>
            <Ball x={xs(tt)} y={120} r={9} fill="#f5c542" />
            <Vel x1={xs(tt) + 12} y1={120} x2={xs(tt) + 52} y2={120} />
            {/* 見る人 */}
            {[28, 692].map((x) => (
              <g key={x}>
                <circle cx={x} cy={112} r={6} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
                <line x1={x} y1={118} x2={x} y2={136} stroke="var(--fig-line)" strokeWidth={2} />
              </g>
            ))}
            <T x={14} y={216} fs={12}>
              左の人（光源は遠ざかる）
            </T>
            <T x={706} y={216} anchor="end" fs={12}>
              右の人（光源は近づく）
            </T>
            <Strip id="l" x={14} y={238} w={310} h={20} shift={22} marks />
            <Strip id="r" x={396} y={238} w={310} h={20} shift={-22} marks />
            <T x={14} y={276} fs={11.5} tone="muted">
              線が赤い側（波長の長い側）へずれる
            </T>
            <T x={706} y={276} anchor="end" fs={11.5} tone="muted">
              線が青い側（波長の短い側）へずれる
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図33-6 1920年の論争と1925年の測定（切り替え） ---------- */

type View = 'shapley' | 'curtis' | 'hubble'

const VIEW_TEXT: Record<View, string[]> = {
  shapley: ['シャプレーの考え（1920年）', '銀河系の直径は約30万光年。太陽は中心から遠い。', '渦巻星雲は、銀河系とは比べられない小さな天体。'],
  curtis: ['カーティスの考え（1920年）', '銀河系の直径は3万光年ほど。太陽は中心の近く。', '渦巻星雲は銀河系と同じような別の銀河。アンドロメダ星雲は約50万光年。'],
  hubble: ['ハッブルの測定（1925年に発表）', 'アンドロメダ星雲までは約93万光年（現在の値は約250万光年）。', 'シャプレーの考えた大きな銀河系よりも外にあり、別の銀河だと分かった。'],
}

export function FigDebate() {
  const [view, setView] = useState<View>('shapley')
  const X = (ly: number) => 60 + (ly / 1000000) * 600
  const mwY = 180
  const big = view !== 'curtis'
  const D = big ? 300000 : 30000
  const sunOff = view === 'curtis' ? 0 : 60000
  const cx = X(sunOff)
  const rx = (X(D) - X(0)) / 2
  const andro = view === 'curtis' ? 500000 : view === 'hubble' ? 930000 : null
  const txt = VIEW_TEXT[view]
  return (
    <Figure
      n="33-6"
      title="宇宙の大きさをめぐる2つの考えと、ハッブルの測定"
      controls={
        <Choice
          label="表示"
          options={[
            { value: 'shapley', label: 'シャプレー' },
            { value: 'curtis', label: 'カーティス' },
            { value: 'hubble', label: '1925年の測定' },
          ]}
          value={view}
          onChange={setView}
        />
      }
      caption="模式図です。銀河系は円盤を真横から見た形で描き、横の長さだけを下の目盛りに合わせています。銀河とアンドロメダ星雲の印の大きさは実際の比と違います。「表示」を切り替えると、それぞれの考えと測定の結果が見られます。"
    >
      <Svg id="33-6" w={720} h={290} label="シャプレーは銀河系の直径を約30万光年、カーティスは3万光年ほどと考えた。カーティスは渦巻星雲を別の銀河と考え、アンドロメダ星雲までを約50万光年とした。1925年にハッブルが測った距離は約93万光年で、シャプレーの銀河系よりも外にあった。">
        {txt.map((s, i) => (
          <T key={i} x={20} y={24 + i * 22} fs={i === 0 ? 13.5 : 12.5} bold={i === 0}>
            {s}
          </T>
        ))}
        {/* 銀河系 */}
        {view === 'hubble' ? (
          <ellipse cx={cx} cy={mwY} rx={rx} ry={16} fill="none" stroke="var(--fig-muted)" strokeDasharray="5 4" />
        ) : (
          <ellipse cx={cx} cy={mwY} rx={Math.max(rx, 5)} ry={big ? 16 : 5} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        )}
        <circle cx={X(0)} cy={mwY} r={3.5} fill="var(--fig-accent)" />
        <T x={X(0)} y={mwY + 30} anchor="middle" fs={12} tone="acc">
          太陽
        </T>
        <T x={view === 'curtis' ? X(0) + 20 : cx + rx + 10} y={view === 'curtis' ? mwY - 22 : mwY} fs={12}>
          {view === 'hubble' ? '点線：シャプレーの銀河系' : '銀河系'}
        </T>
        {view === 'shapley' && (
          <>
            {[80000, 150000, 210000].map((d, i) => (
              <ellipse key={d} cx={X(d)} cy={mwY - 4 + (i % 2) * 8} rx={4} ry={2.2} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            ))}
            <T x={X(330000)} y={mwY - 34} fs={12} tone="muted">
              小さな渦巻星雲は銀河系の中か近く
            </T>
          </>
        )}
        {andro != null && (
          <g>
            <Galaxy x={X(andro)} y={mwY} />
            <T x={X(andro)} y={mwY - 24} anchor="middle" fs={12}>
              アンドロメダ星雲
            </T>
            <Arrow x1={X(0) + 8} y1={mwY + 44} x2={X(andro)} y2={mwY + 44} both />
            <T x={(X(0) + X(andro)) / 2} y={mwY + 30} anchor="middle" fs={12} tone="acc">
              {view === 'curtis' ? '約50万光年' : '約93万光年'}
            </T>
          </g>
        )}
        {/* 目盛り */}
        <line x1={X(0)} x2={X(1000000)} y1={262} y2={262} stroke="var(--fig-line)" />
        {[0, 200000, 400000, 600000, 800000, 1000000].map((d) => (
          <g key={d}>
            <line x1={X(d)} x2={X(d)} y1={258} y2={266} stroke="var(--fig-line)" />
            <T x={X(d)} y={280} anchor="middle" fs={11.5} tone="muted">
              {d === 0 ? '0' : `${d / 10000}万光年`}
            </T>
          </g>
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図33-7 アインシュタインの静止した宇宙（動・切り替え） ---------- */

type Uni = 'gravity' | 'balance' | 'unstable'

const UNI_POS: [number, number][] = (() => {
  const r = rng(33)
  const out: [number, number][] = [[88, 0]]
  while (out.length < 13) {
    const a = r() * Math.PI * 2
    const d = 22 + r() * 66
    const p: [number, number] = [d * Math.cos(a), d * Math.sin(a)]
    if (out.every(([x, y]) => Math.hypot(x - p[0], y - p[1]) > 30)) out.push(p)
  }
  return out
})()

const UNI_TEXT: Record<Uni, string[]> = {
  gravity: ['重力だけのとき', '銀河は互いに引き合い、', '宇宙は縮んでいく。'],
  balance: ['宇宙項を加えたとき', '引き合う重力と、押し広げる', 'はたらきがつり合い、', '宇宙の大きさは変わらない。'],
  unstable: ['つり合いから少しずれたとき', '少し広がると重力が弱まり、', '押し広げるはたらきが勝って', '広がり続ける。少し縮むと', '縮み続ける（1930年、', 'エディントンが指摘）。'],
}

export function FigStatic() {
  const [mode, setMode] = useState<Uni>('balance')
  const cx = 190
  const cy = 150
  const T_END = 3.5
  const scale = (t: number) => {
    const u = Math.min(t, T_END)
    if (mode === 'gravity') return 1 - 0.55 * (u / T_END) ** 2
    if (mode === 'unstable') return 1 + 0.02 * (Math.exp(0.9 * u) - 1)
    return 1
  }
  return (
    <Anim
      n="33-7"
      title="アインシュタインは宇宙項で重力とつり合わせ、大きさの変わらない宇宙を考えた"
      still={T_END}
      period={5}
      controls={
        <Choice
          label="宇宙の中身"
          options={[
            { value: 'gravity', label: '重力だけ' },
            { value: 'balance', label: '宇宙項でつり合う' },
            { value: 'unstable', label: '少しずれる' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="模式図です。楕円は銀河、点線の円ははじめの大きさを表します。右端の銀河に付けた青の矢印は、内向きが重力、外向きが宇宙項による押し広げるはたらきです。「宇宙の中身」を切り替えると、重力だけの場合、つり合う場合、つり合いから少しずれた場合を比べられます。"
    >
      {(t) => {
        const a = scale(t)
        const [gx0, gy0] = UNI_POS[0]
        const gx = cx + gx0 * a
        const gy = cy + gy0 * a
        const lg = Math.min(40, 34 / (a * a))
        const ll = mode === 'gravity' ? 0 : 34 * a
        return (
          <Svg id="33-7" w={680} h={300} label="銀河の集まりを描いた宇宙。重力だけでは縮んでいく。宇宙項を加えると重力とつり合って大きさが変わらない。つり合いから少しずれると、広がり続けるか縮み続ける。">
            <circle cx={cx} cy={cy} r={100} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 5" />
            {UNI_POS.map(([x, y], i) => (
              <Galaxy key={i} x={cx + x * a} y={cy + y * a} s={0.8} />
            ))}
            <Force x1={gx - 12} y1={gy - 8} x2={gx - 12 - lg} y2={gy - 8} />
            {ll > 0 && <Force x1={gx + 12} y1={gy + 8} x2={gx + 12 + ll} y2={gy + 8} />}
            {UNI_TEXT[mode].map((s, i) => (
              <T key={i} x={430} y={60 + i * 24} fs={i === 0 ? 13.5 : 12.5} bold={i === 0}>
                {s}
              </T>
            ))}
            <T x={430} y={250} fs={11.5} tone="muted">
              青の矢印：内向きは重力、
            </T>
            <T x={430} y={270} fs={11.5} tone="muted">
              外向きは宇宙項のはたらき
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図33-8 一様に広がると、遠い銀河ほど速く遠ざかる（動・スライダー） ---------- */

const GRID: [number, number][] = (() => {
  const r = rng(8)
  const out: [number, number][] = []
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++) out.push([(col - 1) * 56 + (r() - 0.5) * 14, (row - 1) * 56 + (r() - 0.5) * 14])
  return out
})()

export function FigHubbleFlow() {
  const [obs, setObs] = useState(5)
  const cx = 215
  const cy = 165
  const RATE = 0.1
  const T_END = 3.5
  const o = obs - 1
  const gxL = 470
  const gyB = 290
  return (
    <Anim
      n="33-8"
      title="宇宙全体が同じ割合で広がると、どの銀河から見ても遠い銀河ほど速く遠ざかる"
      still={T_END}
      period={5}
      controls={<Range label="見ている銀河" min={1} max={9} value={obs} onChange={setObs} format={(v) => `${v}番`} />}
      caption="模式図です。9個の銀河の間の距離が、すべて同じ割合で広がっていきます。点線は銀河が動いた道筋、黒の矢印は「見ている銀河」から見た遠ざかる速さです。「見ている銀河」を変えても、右のグラフの点は原点を通る1本の直線に乗ります。"
    >
      {(t) => {
        const a = 1 + RATE * Math.min(t, T_END)
        const [ox, oy] = GRID[o]
        const P0 = { x: cx + ox, y: cy + oy }
        const rel = GRID.map(([x, y]) => ({ x: x - ox, y: y - oy }))
        const dmax = 260
        const vmax = RATE * 190
        const GX = (d: number) => gxL + (d / dmax) * 220
        const GY = (v: number) => gyB - (v / vmax) * 220
        return (
          <Svg id="33-8" w={720} h={350} label="9個の銀河の間の距離が同じ割合で広がる。見ている銀河から遠い銀河ほど長い道筋を動き、速く遠ざかる。距離と遠ざかる速さのグラフは原点を通る直線になる。">
            {rel.map((p, i) => {
              if (i === o) return null
              const d0 = Math.hypot(p.x, p.y)
              const ux = p.x / d0
              const uy = p.y / d0
              const x = P0.x + p.x * a
              const y = P0.y + p.y * a
              const len = 0.28 * d0
              return (
                <g key={i}>
                  {d0 * (a - 1) > 16 && <Trail points={[[P0.x + p.x, P0.y + p.y], [x - ux * 15, y - uy * 15]]} />}
                  <Vel x1={x + ux * 15} y1={y + uy * 15} x2={x + ux * (15 + len)} y2={y + uy * (15 + len)} />
                </g>
              )
            })}
            {rel.map((p, i) => (
              <Galaxy key={i} x={P0.x + p.x * a} y={P0.y + p.y * a} accent={i === o}>
                {String(i + 1)}
              </Galaxy>
            ))}
            <T x={14} y={338} fs={11.5} tone="muted">
              太い枠：見ている銀河
            </T>
            {/* グラフ */}
            <line x1={gxL} y1={gyB} x2={gxL + 230} y2={gyB} stroke="var(--fig-line)" />
            <line x1={gxL} y1={gyB} x2={gxL} y2={56} stroke="var(--fig-line)" />
            <T x={gxL - 6} y={44} fs={12}>
              遠ざかる速さ
            </T>
            <T x={gxL + 230} y={gyB + 18} anchor="end" fs={12}>
              見ている銀河からの距離 →
            </T>
            <line x1={gxL} y1={gyB} x2={GX(Math.min(dmax, (vmax * a) / RATE))} y2={GY((RATE / a) * Math.min(dmax, (vmax * a) / RATE))} stroke="var(--fig-muted)" strokeDasharray="5 4" />
            {rel.map((p, i) => {
              if (i === o) return null
              const d0 = Math.hypot(p.x, p.y)
              return <circle key={i} cx={GX(d0 * a)} cy={GY(RATE * d0)} r={4.5} fill="var(--fig-accent)" />
            })}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図33-9 ハッブルの1929年の観測 ---------- */

/** ハッブル（1929年）の表1。距離（100万パーセク）と遠ざかる速さ（秒速km）。マイナスは近づく */
const HUBBLE29: [number, number][] = [
  [0.032, 170], [0.034, 290], [0.214, -130], [0.263, -70], [0.275, -185], [0.275, -220],
  [0.45, 200], [0.5, 290], [0.5, 270], [0.63, 200], [0.8, 300], [0.9, -30],
  [0.9, 650], [0.9, 150], [0.9, 500], [1.0, 920], [1.1, 450], [1.1, 500],
  [1.4, 500], [1.7, 960], [2.0, 500], [2.0, 850], [2.0, 800], [2.0, 1090],
]
const MPC_LY = 326 // 100万パーセクは約326万光年

export function FigHubble1929() {
  const X = (man: number) => 90 + (man / 700) * 550
  const Y = (v: number) => 290 - ((v + 300) / 1400) * 250
  return (
    <Figure
      n="33-9"
      title="ハッブルの1929年の観測：遠い銀河ほど速く遠ざかる"
      caption="ハッブルの1929年の論文の表から描いたグラフです（距離は100万パーセクを約326万光年として光年に直しています）。速さがマイナスの点は近づいている銀河です。当時の距離は現在の値よりかなり小さく見積もられていました。"
    >
      <Svg id="33-9" w={680} h={340} label="横に距離、縦に遠ざかる速さをとったグラフ。24個の銀河の点が右上がりに並び、遠い銀河ほど速く遠ざかっている。点線は約326万光年ごとに秒速約500kmの比例の線。">
        {[-200, 0, 200, 400, 600, 800, 1000].map((v) => (
          <g key={v}>
            {v === 0 ? <line x1={90} x2={640} y1={Y(v)} y2={Y(v)} stroke="var(--fig-muted)" strokeDasharray="2 3" /> : <line x1={85} x2={90} y1={Y(v)} y2={Y(v)} stroke="var(--fig-line)" />}
            <T x={84} y={Y(v)} anchor="end" fs={11.5} tone="muted">
              {String(v)}
            </T>
          </g>
        ))}
        {[0, 100, 200, 300, 400, 500, 600, 700].map((d) => (
          <g key={d}>
            <line x1={X(d)} x2={X(d)} y1={290} y2={295} stroke="var(--fig-line)" />
            <T x={X(d)} y={306} anchor="middle" fs={11.5} tone="muted">
              {d === 0 ? '0' : `${d}万`}
            </T>
          </g>
        ))}
        <line x1={90} x2={645} y1={290} y2={290} stroke="var(--fig-line)" />
        <line x1={90} x2={90} y1={290} y2={30} stroke="var(--fig-line)" />
        <T x={20} y={18} fs={12}>
          遠ざかる速さ（秒速km）
        </T>
        <T x={640} y={326} anchor="end" fs={12}>
          距離（光年）→
        </T>
        <line x1={X(0)} y1={Y(0)} x2={X(2 * MPC_LY)} y2={Y(1000)} stroke="var(--fig-muted)" strokeDasharray="6 4" strokeWidth={1.5} />
        {HUBBLE29.map(([r, v], i) => (
          <circle key={i} cx={X(r * MPC_LY)} cy={Y(v)} r={4.5} fill="var(--fig-accent)" />
        ))}
        <T x={175} y={266} fs={12}>
          アンドロメダ星雲など（近づいている）
        </T>
        <T x={596} y={180} anchor="end" fs={12}>
          おとめ座の銀河団の4個
        </T>
        <T x={104} y={50} fs={12}>
          点：銀河（24個）
        </T>
        <T x={104} y={72} fs={12}>
          点線：約326万光年ごとに秒速約500km
        </T>
        <T x={104} y={92} fs={11.5} tone="muted">
          （ハッブルが示した比例の割合）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図33-10 膨らむ空間と銀河の間の距離（動） ---------- */

const EXP_RATE = 0.12
const S0 = 50 // はじめの格子の間隔
const LIGHT_C = 70 // 光の進む速さ（その場の格子に対して）
const T_EMIT = 0.4
const WL0 = 20 // 出たときの波長

/** 時刻 t に、銀河Aを出た光がいる格子の位置（銀河Aが -3、銀河Bが 3） */
const chiAt = (t: number) => -3 + (LIGHT_C / (S0 * EXP_RATE)) * Math.log((1 + EXP_RATE * t) / (1 + EXP_RATE * T_EMIT))
const T_ARRIVE = ((1 + EXP_RATE * T_EMIT) * Math.exp((6 * S0 * EXP_RATE) / LIGHT_C) - 1) / EXP_RATE

export function FigExpansion() {
  const cx = 360
  const cy = 140
  return (
    <Anim
      n="33-10"
      title="空間が広がると、銀河の間の距離が広がり、進む光の波長も伸びる"
      still={T_ARRIVE + 0.4}
      period={T_ARRIVE + 2}
      caption="模式図です。格子は空間の目盛りで、全体が同じ割合で広がります。銀河そのものは自分の重力でまとまっているので膨らまず、楕円の大きさは変わりません。銀河Aを出た光の波長は銀河Bに届くまでの間に、空間が広がった割合だけ伸びます。"
    >
      {(t) => {
        const tt = Math.min(t, T_ARRIVE)
        const a = 1 + EXP_RATE * tt
        const s = S0 * a
        const px = (chi: number) => cx + chi * s
        const vlines = Array.from({ length: 15 }, (_, i) => i - 7 + 0.5).filter((c) => Math.abs(c * s) < 345)
        const hlines = [-1.5, -0.5, 0.5, 1.5].filter((c) => Math.abs(c * s) < 112)
        const emitted = t >= T_EMIT
        const wl = WL0 * (a / (1 + EXP_RATE * T_EMIT))
        const lx = px(Math.min(chiAt(tt), 3)) - 13
        const arrived = t >= T_ARRIVE
        return (
          <Svg id="33-10" w={720} h={320} label="空間の目盛りの格子が広がり、銀河の間の距離が広がる。銀河の大きさは変わらない。銀河Aを出た光が銀河Bへ進む間に、光の波長が伸びる。">
            {vlines.map((c) => (
              <line key={`v${c}`} x1={px(c)} x2={px(c)} y1={cy - 112} y2={cy + 112} stroke="var(--fig-muted)" strokeWidth={0.8} opacity={0.6} />
            ))}
            {hlines.map((c) => (
              <line key={`h${c}`} x1={15} x2={705} y1={cy + c * s} y2={cy + c * s} stroke="var(--fig-muted)" strokeWidth={0.8} opacity={0.6} />
            ))}
            {[
              { chi: -3, row: 0, name: '銀河A' },
              { chi: 3, row: 0, name: '銀河B' },
              { chi: -1, row: -1, name: '' },
              { chi: 1, row: 1, name: '' },
              { chi: 0, row: 0, name: '' },
            ].map((g) => (
              <g key={`${g.chi},${g.row}`}>
                <Galaxy x={px(g.chi)} y={cy + g.row * s} />
                {g.name && (
                  <T x={px(g.chi)} y={cy - 16} anchor="middle" fs={12}>
                    {g.name}
                  </T>
                )}
              </g>
            ))}
            {emitted && <path d={wave(lx - 2.2 * wl, cy + 14, 2.2 * wl, 6, wl, 0)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />}
            {/* 下：波長の比べ */}
            <T x={20} y={270} fs={12}>
              光が出たときの波長
            </T>
            <path d={wave(150, 270, WL0 * 3, 6, WL0)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
            <T x={380} y={270} fs={12}>
              {arrived ? '銀河Bに届いたときの波長' : '進んでいる光の今の波長'}
            </T>
            {emitted && <path d={wave(560, 270, wl * 3 > 140 ? 140 : wl * 3, 6, wl)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />}
            <T x={20} y={302} fs={11.5} tone="muted">
              格子：空間の目盛り　楕円：銀河（大きさは変わらない）　波線：銀河Aから銀河Bへ進む光
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

