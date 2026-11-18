import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Force, Trail, rng, wave, ease } from './common'

/* ---------- 共通の部品 ---------- */

/** スピンの向きを矢印で示した電子 */
function SpinElectron({ x, y, up, r = 8 }: { x: number; y: number; up: boolean; r?: number }) {
  const s = up ? -1 : 1
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.3} />
      <line x1={x} y1={y - s * (r - 3)} x2={x} y2={y + s * (r - 3)} stroke="var(--fig-line)" strokeWidth={1.6} />
      <path d={`M${x - 3},${y + s * (r - 6)} L${x},${y + s * (r - 2.5)} L${x + 3},${y + s * (r - 6)}`} fill="none" stroke="var(--fig-line)" strokeWidth={1.6} />
    </g>
  )
}

/** 電子（ch22 と同じ描き方：白い丸に −） */
function Electron({ x, y, r = 6 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.2} />
      <text x={x} y={y + 0.5} fontSize={13} textAnchor="middle" dominantBaseline="central">
        −
      </text>
    </g>
  )
}

/* ---------- 図26-1 この章の年表 ---------- */

const ROAD = [
  { y: '1922年', who: ['シュテルン', 'ゲルラッハ'], what: ['銀原子の流れが', '2つに分かれる'] },
  { y: '1925年', who: ['パウリ'], what: ['排他原理'] },
  { y: '1925年', who: ['ウーレンベック', 'ハウトスミット'], what: ['電子のスピン'] },
  { y: '1928年', who: ['ガモフ'], what: ['トンネル効果で', '原子核の崩壊を説明'] },
  { y: '1947年', who: ['バーディーン', 'ブラッテン'], what: ['トランジスタ'] },
  { y: '1957年', who: ['江崎玲於奈'], what: ['トンネルダイオード'] },
  { y: '1960年', who: ['メイマン'], what: ['最初のレーザー'] },
  { y: '1981年', who: ['ファインマン'], what: ['量子コンピューター', 'の考えを講演'] },
  { y: '1994年', who: ['ショア'], what: ['素因数分解の', '計算の方法'] },
  { y: '2019年', who: ['Google'], what: ['53個の', '量子ビットの実験'] },
]

export function FigRoad26() {
  const AX = 140
  return (
    <Figure n="26-1" title="スピンの発見から量子コンピューターまでの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。点線より左の4つはこの章の前半で、右の6つは後半で扱う出来事です。">
      <Svg id="26-1" w={760} h={268} label="1922年にシュテルンとゲルラッハが銀原子の流れを2つに分け、1925年にパウリが排他原理を、ウーレンベックとハウトスミットが電子のスピンを発表した。1928年にガモフがトンネル効果で原子核の崩壊を説明した。1947年にトランジスタ、1957年に江崎玲於奈のトンネルダイオード、1960年にメイマンの最初のレーザーが生まれた。1981年にファインマンが量子コンピューターの考えを講演し、1994年にショアが素因数分解の方法を示し、2019年にGoogleが53個の量子ビットで実験した。">
        <Arrow x1={14} y1={AX} x2={748} y2={AX} />
        <line x1={299} y1={AX - 26} x2={299} y2={AX + 26} stroke="var(--fig-muted)" strokeDasharray="3 3" />
        {ROAD.map((r, i) => {
          const x = 40 + i * 74
          const up = i % 2 === 0
          const lines = [...r.who, ...r.what]
          const n = lines.length
          const top = up ? AX - 30 - n * 16 - 18 : AX + 30
          return (
            <g key={i}>
              <circle cx={x} cy={AX} r={5.5} fill={i < 4 ? 'var(--fig-bg)' : 'var(--fig-accent)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? AX - 24 : AX + 6} x2={x} y2={up ? AX - 6 : AX + 22} stroke="var(--fig-line)" />
              <T x={x} y={top} anchor="middle" bold fs={12.5}>
                {r.y}
              </T>
              {lines.map((w, j) => (
                <T key={j} x={x} y={top + 18 + j * 16} anchor="middle" fs={j < r.who.length ? 12 : 11.5} tone={j < r.who.length ? undefined : 'muted'}>
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

/* ---------- 図26-2 強さのそろわない磁場の中の小さな磁石 ---------- */

/** 小さな磁石。topN が true なら上が N 極 */
function SmallMagnet({ x, y, topN, horizontal }: { x: number; y: number; topN?: boolean; horizontal?: boolean }) {
  if (horizontal) {
    return (
      <g>
        <rect x={x - 26} y={y - 9} width={26} height={18} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={x} y={y - 9} width={26} height={18} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <T x={x - 13} y={y} anchor="middle" fs={12} bold>
          N
        </T>
        <T x={x + 13} y={y} anchor="middle" fs={12} bold>
          S
        </T>
      </g>
    )
  }
  return (
    <g>
      <rect x={x - 9} y={y - 26} width={18} height={26} fill={topN ? 'var(--fig-box2)' : 'var(--fig-box3)'} stroke="var(--fig-line)" />
      <rect x={x - 9} y={y} width={18} height={26} fill={topN ? 'var(--fig-box3)' : 'var(--fig-box2)'} stroke="var(--fig-line)" />
      <T x={x} y={y - 13} anchor="middle" fs={12} bold>
        {topN ? 'N' : 'S'}
      </T>
      <T x={x} y={y + 13} anchor="middle" fs={12} bold>
        {topN ? 'S' : 'N'}
      </T>
    </g>
  )
}

export function FigGradient() {
  const panels = [
    { title: '上がN極の向き', kind: 'n' as const, result: '全体として下へ押される' },
    { title: '横向き', kind: 'h' as const, result: '上下には押されない' },
    { title: '上がS極の向き', kind: 's' as const, result: '全体として上へ引かれる' },
  ]
  return (
    <Figure
      n="26-2"
      title="強さのそろわない磁場では、小さな磁石は向きによって上か下へ押される"
      caption="模式図です。上の極をとがらせた磁石のすき間では、上ほど磁場が強くなります。小さな磁石の両端にはたらく力（青の矢印）は、磁場の強い上の端のほうが大きくなるので、2つの力の差の分だけ上か下へ動きます。向きがばらばらなら、押される量もばらばらになるはずです。"
    >
      <Svg id="26-2" w={720} h={300} label="上がとがったN極、下がS極の磁石のすき間に、小さな磁石を3つの向きで置いた図。上をN極に向けた磁石は全体として下へ押され、横向きの磁石は上下に押されず、上をS極に向けた磁石は全体として上へ引かれる。">
        {panels.map((p, i) => {
          const L = i * 240
          const cx = L + 120
          const cy = 160
          return (
            <g key={p.kind}>
              <path d={`M${L + 30},18 L${L + 210},18 L${L + 210},46 L${cx},92 L${L + 30},46 Z`} fill="var(--fig-box)" stroke="var(--fig-line)" />
              <T x={cx} y={36} anchor="middle" fs={12}>
                N極
              </T>
              <path d={`M${L + 30},228 L${cx - 22},228 L${cx - 22},240 L${cx + 22},240 L${cx + 22},228 L${L + 210},228 L${L + 210},258 L${L + 30},258 Z`} fill="var(--fig-box)" stroke="var(--fig-line)" />
              <T x={cx} y={250} anchor="middle" fs={12}>
                S極
              </T>
              <T x={L + 36} y={106} fs={11.5} tone="muted">
                磁場が強い
              </T>
              <T x={L + 36} y={214} fs={11.5} tone="muted">
                磁場が弱い
              </T>
              <T x={L + 150} y={124} fs={12} bold>
                {p.title}
              </T>
              {p.kind === 'h' ? (
                <>
                  <SmallMagnet x={cx} y={cy} horizontal />
                  <Force x1={cx - 13} y1={cy + 12} x2={cx - 13} y2={cy + 40} />
                  <Force x1={cx + 13} y1={cy - 12} x2={cx + 13} y2={cy - 40} />
                </>
              ) : (
                <>
                  <SmallMagnet x={cx} y={cy} topN={p.kind === 'n'} />
                  {/* 上の端（磁場が強い）の力は大きく、下の端の力は小さい */}
                  <Force x1={cx + 16} y1={cy - 13} x2={cx + 16} y2={p.kind === 'n' ? cy + 24 : cy - 50} />
                  <Force x1={cx - 16} y1={cy + 13} x2={cx - 16} y2={p.kind === 'n' ? cy - 5 : cy + 31} />
                </>
              )}
              <T x={cx} y={284} anchor="middle" fs={12.5} tone="acc">
                {p.result}
              </T>
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図26-3 シュテルン・ゲルラッハの実験（動） ---------- */

const SG = { ovenX: 80, magL: 200, magR: 440, plateX: 560, y0: 160, v: 170, k: 0.00026 }
const SG_N = 50
const SG_ATOMS = (() => {
  const r = rng(26)
  return Array.from({ length: SG_N }, (_, i) => ({ t0: 0.3 + i * 0.12, s: r() < 0.5 ? -1 : 1, jy: (r() - 0.5) * 6, jx: (r() - 0.5) * 2 }))
})()

/** 原子が x にあるときの上下のずれ（磁石の中で曲がり、出たあとはまっすぐ進む） */
function sgDy(x: number) {
  const { magL, magR, k } = SG
  if (x <= magL) return 0
  if (x <= magR) return k * (x - magL) ** 2
  const L = magR - magL
  return k * L * L + 2 * k * L * (x - magR)
}

export function FigSG() {
  const travel = (SG.plateX - SG.ovenX) / SG.v
  const period = 11
  return (
    <Anim
      n="26-3"
      title="磁石のすき間を通った銀の原子の流れは、上下の2か所に分かれた"
      still={10}
      period={period}
      caption="1922年の実験の模式図です（大きさの比は実際と違います）。炉で熱した銀の原子が細いすき間を通って流れになり、磁石のすき間を通ってガラス板に付きます。右は板を正面から見た模様です。古典物理学では原子の磁石の向きがばらばらなので、点線の枠のように1つの帯に広がると予想されました。実際には、上下の2か所に分かれました。"
    >
      {(t) => {
        const tt = t % period
        const flying = SG_ATOMS.filter((a) => tt > a.t0 && tt < a.t0 + travel)
        const landed = SG_ATOMS.filter((a) => tt >= a.t0 + travel)
        return (
          <Svg id="26-3" w={760} h={330} label="炉から出た銀の原子が、細いすき間と磁石のすき間を通ってガラス板に付く。磁石の中で原子は上か下に曲がり、板の上では上下2か所に分かれて付く。古典物理学の予想は1つの帯に広がる模様だった。">
            <Box x={20} y={132} w={60} h={56} lines="炉" fill="box2" />
            <T x={50} y={204} anchor="middle" fs={11.5} tone="muted">
              銀を熱する
            </T>
            {[110, 150].map((x) => (
              <g key={x}>
                <rect x={x} y={114} width={6} height={42} fill="var(--fig-line)" />
                <rect x={x} y={164} width={6} height={42} fill="var(--fig-line)" />
              </g>
            ))}
            <T x={133} y={100} anchor="middle" fs={11.5} tone="muted">
              細いすき間
            </T>
            <Box x={SG.magL} y={90} w={SG.magR - SG.magL} h={46} lines="磁石のN極（すき間側をとがらせた形）" fill="box3" fs={12} />
            <Box x={SG.magL} y={184} w={SG.magR - SG.magL} h={46} lines="磁石のS極" fill="box3" fs={12} />
            <T x={320} y={248} anchor="middle" fs={11.5} tone="muted">
              すき間の中では、上ほど磁場が強い
            </T>
            <rect x={SG.plateX - 4} y={70} width={8} height={180} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={SG.plateX} y={56} anchor="middle" fs={12}>
              ガラス板
            </T>
            {/* 板を正面から見た模様 */}
            <T x={680} y={56} anchor="middle" fs={12}>
              板を正面から見ると
            </T>
            <rect x={612} y={74} width={136} height={172} rx={4} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={640} y={118} width={80} height={84} rx={10} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="5 4" />
            {[-1, 1].map((s) => (
              <Trail key={s} points={Array.from({ length: 49 }, (_, j) => [SG.ovenX + j * 10, SG.y0 + s * sgDy(SG.ovenX + j * 10)] as [number, number])} />
            ))}
            {flying.map((a, i) => {
              const x = SG.ovenX + SG.v * (tt - a.t0)
              const y = SG.y0 + a.s * sgDy(x) + a.jy * Math.min(1, (x - SG.ovenX) / 500)
              return <circle key={i} cx={x} cy={y} r={3} fill="var(--fig-accent)" />
            })}
            {landed.map((a, i) => {
              const dy = a.s * sgDy(SG.plateX) + a.jy
              return (
                <g key={i}>
                  <circle cx={SG.plateX + a.jx} cy={SG.y0 + dy} r={2.4} fill="var(--fig-line)" />
                  <circle cx={680 + a.jx * 16} cy={SG.y0 + dy} r={2.6} fill="var(--fig-line)" />
                </g>
              )
            })}
            <T x={20} y={286} fs={12}>
              右の図の点線の枠：古典物理学で予想された広がり（1つの帯）
            </T>
            <T x={20} y={308} fs={12}>
              黒い点：実際にガラス板に付いた銀の原子（上下の2か所に分かれた）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図26-4 排他原理と電子の席（動・切り替え） ---------- */

/** 席の位置。lv は殻（1か2）、b は箱の番号、up はスピンの向き */
const SEATS: { lv: 1 | 2; b: number; up: boolean }[] = [
  { lv: 1, b: 0, up: true },
  { lv: 1, b: 0, up: false },
  { lv: 2, b: 0, up: true },
  { lv: 2, b: 0, up: false },
  { lv: 2, b: 1, up: true },
  { lv: 2, b: 2, up: true },
  { lv: 2, b: 3, up: true },
  { lv: 2, b: 1, up: false },
  { lv: 2, b: 2, up: false },
  { lv: 2, b: 3, up: false },
]
const LV_Y = { 1: 236, 2: 150 } as const
const BOX_X = { 1: [150], 2: [96, 170, 222, 274] } as const

export function FigExclusion() {
  const [mode, setMode] = useState<'on' | 'off'>('on')
  const step = 0.6
  const period = 0.4 + SEATS.length * step + 2
  const seatPos = (k: number) => {
    if (mode === 'off') {
      const col = k % 5
      const row = Math.floor(k / 5)
      return { x: 112 + col * 19, y: LV_Y[1] - 10 - row * 19 }
    }
    const s = SEATS[k]
    const bx = BOX_X[s.lv][s.b]
    return { x: bx + (s.up ? -11 : 11), y: LV_Y[s.lv] - 17 }
  }
  return (
    <Anim
      n="26-4"
      title="1つの状態に入れる電子は1個までなので、電子は下の段から順に埋まっていく"
      still={period - 0.8}
      period={period}
      controls={
        <Choice
          label="排他原理"
          options={[
            { value: 'on', label: 'ある（実際）' },
            { value: 'off', label: 'なかったら' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="電子10個（ネオンの原子）の模式図です。四角は電子が入る状態の組で、上向きと下向きのスピンの電子が1個ずつ、合わせて2個まで入れます（矢印はスピンの向き）。「なかったら」を選ぶと、電子がみなエネルギーの最も低い段に集まります。実際にはこうはなりません（赤の×）。"
    >
      {(t) => {
        const tt = t % period
        return (
          <Svg id="26-4" w={720} h={270} label="電子10個が、エネルギーの低い段から順に入っていく。1番目の殻の1組に2個、2番目の殻の4組に8個入る。排他原理がなかったら、10個すべてが最も低い段に集まるが、実際にはそうならない。">
            <Arrow x1={40} y1={256} x2={40} y2={40} />
            <T x={50} y={36} fs={12} tone="muted">
              エネルギー
            </T>
            {([1, 2] as const).map((lv) => (
              <g key={lv}>
                <line x1={70} y1={LV_Y[lv]} x2={310} y2={LV_Y[lv]} stroke="var(--fig-line)" strokeWidth={1.5} />
                {mode === 'on' &&
                  BOX_X[lv].map((bx) => <rect key={bx} x={bx - 23} y={LV_Y[lv] - 34} width={46} height={34} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 3" />)}
                <T x={324} y={LV_Y[lv] - 12} fs={12}>
                  {mode === 'off' ? (lv === 1 ? '最も低い段' : '2番目の段') : lv === 1 ? '1番目の殻（2個まで）' : '2番目の殻（8個まで）'}
                </T>
              </g>
            ))}
            <T x={74} y={86} fs={11.5} tone="muted">
              （この上にも段が続く）
            </T>
            {SEATS.map((s, k) => {
              const t0 = 0.4 + k * step
              if (tt < t0) return null
              const p = seatPos(k)
              const u = ease((tt - t0) / 0.45)
              const y = 20 + (p.y - 20) * u
              return <SpinElectron key={k} x={p.x} y={y} up={mode === 'off' ? k % 2 === 0 : s.up} />
            })}
            {mode === 'off' && tt > 0.4 + SEATS.length * step && <Cross x={222} y={206} s={11} />}
            <T x={470} y={60} fs={12.5} bold tone={mode === 'off' ? 'danger' : undefined}>
              {mode === 'on' ? '排他原理がある（実際の原子）' : '排他原理がなかったら（起こらない）'}
            </T>
            {(mode === 'on'
              ? ['1つの状態には電子が1個まで。', 'スピンの向きが2つあるので、', '1組の四角に2個まで入る。', '下の段が埋まると、次の段に入る。']
              : ['電子はみなエネルギーの', '最も低い段に集まる。', '殻が順に埋まらないので、', '周期表のような繰り返しは', '生まれない。']
            ).map((s, i) => (
              <T key={i} x={470} y={92 + i * 22} fs={12}>
                {s}
              </T>
            ))}
            <T x={470} y={232} fs={12} tone="muted">
              {`入った電子の数：${Math.max(0, Math.min(SEATS.length, Math.floor((tt - 0.4) / step) + 1))}個`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図26-5 電子が殻を順に埋めていく（動・スライダー） ---------- */

const ELEMENTS = [
  ['水素', 'H'], ['ヘリウム', 'He'], ['リチウム', 'Li'], ['ベリリウム', 'Be'], ['ホウ素', 'B'],
  ['炭素', 'C'], ['窒素', 'N'], ['酸素', 'O'], ['フッ素', 'F'], ['ネオン', 'Ne'],
  ['ナトリウム', 'Na'], ['マグネシウム', 'Mg'], ['アルミニウム', 'Al'], ['ケイ素', 'Si'], ['リン', 'P'],
  ['硫黄', 'S'], ['塩素', 'Cl'], ['アルゴン', 'Ar'], ['カリウム', 'K'], ['カルシウム', 'Ca'],
] as const

/** 原子番号 z の原子の、殻ごとの電子の数（20番まで） */
function shellsOf(z: number): number[] {
  const caps = [2, 8, 8, 2]
  const out: number[] = []
  let rest = z
  for (const c of caps) {
    out.push(Math.min(rest, c))
    rest -= Math.min(rest, c)
  }
  return out
}

function noteOf(z: number): string[] {
  if (z === 2 || z === 10 || z === 18) return ['外側の殻に電子がそろっている。', 'ほかの原子と反応しにくい（貴ガス）。']
  if (z === 3 || z === 11 || z === 19) return ['外側の殻の電子が1個。', 'リチウム、ナトリウム、カリウムは', '性質がよく似ている。']
  if (z === 9 || z === 17) return ['外側の殻の電子が7個。', 'フッ素と塩素は性質がよく似ている。']
  return []
}

export function FigShells() {
  const [z, setZ] = useState(11)
  const C = { x: 180, y: 168 }
  const R = [40, 72, 104, 136]
  const sh = shellsOf(z)
  const last = z <= 2 ? 0 : z <= 10 ? 1 : z <= 18 ? 2 : 3
  const [name, sym] = ELEMENTS[z - 1]
  const outer = sh[last]
  return (
    <Anim
      n="26-5"
      title="原子番号が1つ増えるごとに、電子が1個ずつ内側の殻から入っていく"
      still={2.6}
      period={3}
      controls={<Range label="原子番号（電子の数）" min={1} max={20} value={z} onChange={setZ} format={(v) => `${v}番 ${ELEMENTS[v - 1][0]}`} />}
      caption="模式図です。円は電子の殻を表し、電子が円の上を回っているという意味ではありません。スライダーで原子番号を変えると、最後に入る電子が外から入ってくる様子が繰り返されます。3番目の殻は18個まで入れますが、カリウム（19番）とカルシウム（20番）では、8個入ったところで4番目の殻に入ります。そのほうがエネルギーが低いからです。"
    >
      {(t) => {
        const u = ease(Math.min(1, t / 0.9))
        return (
          <Svg id="26-5" w={720} h={330} label={`原子番号${z}の${name}の原子。殻ごとの電子の数は内側から${sh.filter((c, i) => c > 0 || i <= last).join('個、')}個。いちばん外側の殻の電子は${outer}個。`}>
            {R.map((r, i) => (
              <g key={r}>
                <circle cx={C.x} cy={C.y} r={r} fill="none" stroke={i <= last ? 'var(--fig-line)' : 'var(--fig-muted)'} strokeDasharray={i <= last ? undefined : '3 4'} />
                <T x={C.x + (r + 10) * Math.cos(-0.375 * Math.PI)} y={C.y + (r + 10) * Math.sin(-0.375 * Math.PI)} anchor="middle" fs={11.5} tone="muted">
                  {String(i + 1)}
                </T>
              </g>
            ))}
            <Ball x={C.x} y={C.y} r={14} fill="var(--fig-box2)" />
            <T x={C.x} y={C.y + 1} anchor="middle" fs={11}>
              核
            </T>
            {sh.map((c, i) =>
              Array.from({ length: c }, (_, k) => {
                const a = -Math.PI / 2 + (k * 2 * Math.PI) / Math.max(c, 1)
                const newest = i === last && k === c - 1
                const r = newest ? 160 + (R[i] - 160) * u : R[i]
                return <Electron key={`${i}-${k}`} x={C.x + r * Math.cos(a)} y={C.y + r * Math.sin(a)} />
              }),
            )}
            <T x={400} y={40} fs={16} bold>
              {`${z}番　${name}（${sym}）`}
            </T>
            {sh.map((c, i) => (
              <T key={i} x={400} y={78 + i * 24} fs={12.5} tone={i === last ? 'acc' : undefined}>
                {`${i + 1}番目の殻：${c}個${i === 0 ? '（2個まで）' : i === 1 ? '（8個まで）' : i === 2 ? '（18個まで）' : ''}`}
              </T>
            ))}
            <T x={400} y={186} fs={12.5} bold>
              {`いちばん外側の殻の電子：${outer}個`}
            </T>
            {noteOf(z).map((s, i) => (
              <T key={i} x={400} y={216 + i * 22} fs={12}>
                {s}
              </T>
            ))}
            {z >= 19 && (
              <T x={400} y={300} fs={11.5} tone="muted">
                3番目の殻に空きがあるが、4番目の殻に入る
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図26-6 周期表（20番まで） ---------- */

const TABLE_COLS = ['1', '2', '3', '4', '5', '6', '7', '8']

export function FigTable() {
  const cx = (c: number) => 74 + c * 80
  const ry = (r: number) => 64 + r * 62
  const pos = (z: number): [number, number] => {
    if (z === 1) return [0, 0]
    if (z === 2) return [0, 7]
    if (z <= 10) return [1, z - 3]
    if (z <= 18) return [2, z - 11]
    return [3, z - 19]
  }
  return (
    <Figure
      n="26-6"
      title="同じ列の元素は、外側の殻の電子の数が同じで、性質も似ている"
      caption="周期表の初めの20個の元素を、外側の殻の電子の数で列に分けて並べた図です（中ほどの列を省いた短い形）。左端の列（水素を除く）は性質のよく似た金属、右端の列は反応しにくい気体です。4段目ではカルシウムのあとに、3番目の殻の残りの席に電子が入る元素が10個続きます。"
    >
      <Svg id="26-6" w={720} h={330} label="周期表の1番の水素から20番のカルシウムまで。左端の列はリチウム、ナトリウム、カリウムで外側の電子が1個。右端の列はヘリウム、ネオン、アルゴンで外側の殻がそろっている。">
        <T x={20} y={22} fs={12} tone="muted">
          外側の殻の電子の数
        </T>
        {TABLE_COLS.map((s, c) => (
          <T key={s} x={cx(c) + 37} y={44} anchor="middle" fs={12.5} bold>
            {c === 7 ? '8（Heは2）' : s}
          </T>
        ))}
        {[0, 1, 2, 3].map((r) => (
          <T key={r} x={20} y={ry(r) + 28} fs={12} tone="muted">
            {`${r + 1}段目`}
          </T>
        ))}
        {ELEMENTS.map(([name, sym], i) => {
          const z = i + 1
          const [r, c] = pos(z)
          const fill = c === 7 ? 'box4' : c === 0 && z > 1 ? 'box2' : 'box'
          return (
            <g key={sym}>
              <rect x={cx(c)} y={ry(r)} width={74} height={56} rx={4} fill={`var(--fig-${fill})`} stroke="var(--fig-line)" />
              <T x={cx(c) + 6} y={ry(r) + 11} fs={11} tone="muted">
                {String(z)}
              </T>
              <T x={cx(c) + 37} y={ry(r) + 25} anchor="middle" fs={15} bold>
                {sym}
              </T>
              <T x={cx(c) + 37} y={ry(r) + 45} anchor="middle" fs={11}>
                {name}
              </T>
            </g>
          )
        })}
        <rect x={cx(2)} y={ry(3)} width={474} height={56} rx={4} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 3" />
        <T x={cx(2) + 12} y={ry(3) + 19} fs={11.5} tone="muted">
          カルシウムのあと、3番目の殻の残り10個の席に電子が入る
        </T>
        <T x={cx(2) + 12} y={ry(3) + 39} fs={11.5} tone="muted">
          元素が10個続く（この図では省略）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図26-7 壁をすり抜ける電子の波（動・切り替え） ---------- */

export function FigTunnel() {
  const [thick, setThick] = useState<'thin' | 'thick'>('thin')
  const XB = 360
  const W = thick === 'thin' ? 18 : 50
  const TR = thick === 'thin' ? 0.5 : 0.12
  const RF = Math.sqrt(1 - TR * TR)
  const K = (2 * Math.PI) / 24
  const SIG = 38
  const AMP = 38
  const Y = 228
  const g = (d: number) => Math.exp(-(d * d) / (2 * SIG * SIG))
  const period = 7
  return (
    <Anim
      n="26-7"
      title="エネルギーが足りなくても、電子の波の一部は壁の向こうへ抜ける"
      still={4.2}
      period={period}
      controls={
        <Choice
          label="壁の厚さ"
          options={[
            { value: 'thin', label: '薄い' },
            { value: 'thick', label: '厚い' },
          ]}
          value={thick}
          onChange={setThick}
        />
      }
      caption="模式図です。上は山を越えるだけのエネルギーがないボールで、必ずはね返ります。下は同じだけのエネルギーを持つ電子の波です。波は壁の中で急に小さくなりますが、0にはならず、壁が薄ければ一部が向こう側へ抜けます。「壁の厚さ」を厚いにすると、抜ける波はずっと小さくなります。"
    >
      {(t) => {
        const tt = t % period
        // 上：ボール
        const tb = Math.min(tt, 4.8)
        const bx = tb < 2.4 ? 60 + 280 * Math.sin((Math.PI / 2) * (tb / 2.4)) : 60 + 280 * Math.sin((Math.PI / 2) * ((4.8 - tb) / 2.4))
        const hill = (x: number) => (x < 300 ? 110 : x < 370 ? 110 - 60 * ease((x - 300) / 70) : x < 420 ? 50 : x < 490 ? 50 + 60 * ease((x - 420) / 70) : 110)
        // 下：電子の波
        const xi = 120 + 100 * tt
        let d = ''
        for (let x = 20; x <= 700; x += 2) {
          let y: number
          if (x < XB) y = g(x - xi) * Math.sin(K * (x - xi)) + RF * g(x - (2 * XB - xi)) * Math.sin(K * (2 * XB - xi - x))
          else if (x <= XB + W) y = g(XB - xi) * Math.sin(K * (XB - xi)) * (1 + RF) * Math.pow(TR / (1 + RF), (x - XB) / W)
          else y = TR * g(x - W - xi) * Math.sin(K * (x - W - xi))
          d += `${x === 20 ? 'M' : 'L'}${x},${(Y - AMP * y).toFixed(1)}`
        }
        return (
          <Svg id="26-7" w={720} h={300} label="上では、エネルギーの足りないボールが山を上りきれずにはね返る。下では、電子の波が壁に当たり、大部分ははね返るが、一部は壁を抜けて向こう側へ進む。壁が厚いと抜ける波は小さい。">
            <T x={20} y={20} fs={12.5} bold>
              ボール（古典物理学）
            </T>
            <path d={`M20,110 L300,110 ${[310, 330, 350, 370].map((x) => `L${x},${hill(x).toFixed(1)}`).join(' ')} L420,50 ${[440, 460, 480, 490].map((x) => `L${x},${hill(x).toFixed(1)}`).join(' ')} L700,110`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <Ball x={bx} y={hill(bx) - 10} r={10} />
            <Cross x={560} y={92} s={8} />
            <T x={576} y={92} fs={12}>
              向こう側には出ない
            </T>
            <T x={20} y={150} fs={12.5} bold>
              電子の波（量子力学）
            </T>
            <rect x={XB} y={172} width={W} height={100} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={XB + W + 8} y={164} fs={12}>
              壁（エネルギーの山）
            </T>
            <line x1={20} y1={Y} x2={700} y2={Y} stroke="var(--fig-muted)" strokeDasharray="2 4" />
            <path d={d} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
            <T x={40} y={288} fs={12}>
              はね返る波
            </T>
            <T x={560} y={288} fs={12}>
              壁を抜けた波
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図26-8 原子の準位と結晶の帯 ---------- */

/** 帯。filled は下から埋まっている割合（0〜1） */
function Band({ x, y, w, h, filled, label }: { x: number; y: number; w: number; h: number; filled: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      {filled > 0 && <rect x={x} y={y + h * (1 - filled)} width={w} height={h * filled} fill="var(--fig-box3)" stroke="var(--fig-line)" />}
      <T x={x + w / 2} y={y + h / 2} anchor="middle" fs={11.5}>
        {label}
      </T>
    </g>
  )
}

export function FigBands() {
  const mats = [
    { x: 20, title: '導体（金属）', note: ['帯の途中まで埋まっていて、', '電子が動ける'] },
    { x: 260, title: '絶縁体', note: ['すき間が大きく、電子が', '上の帯へ移れない'] },
    { x: 500, title: '半導体', note: ['すき間が小さく、熱や光で', '一部の電子が上の帯へ移る'] },
  ]
  return (
    <Figure
      n="26-8"
      title="原子がたくさん並ぶと、とびとびの準位は帯になり、帯の埋まり方で電気の通しやすさが決まる"
      caption="模式図です。上の段：原子1個の電子のエネルギー準位はとびとびですが、原子がたくさん並んだ結晶では、近い準位が集まって帯になります。下の段：青い部分は電子で埋まった状態です。電子は排他原理に従って下から埋まり、埋まりきった帯の電子は電流を運べません。半導体の点線の丸は、電子が上の帯へ移ったあとの空いた席です。"
    >
      <Svg id="26-8" w={720} h={440} label="上の段では、原子1個のとびとびの準位が、原子がたくさん並ぶと帯になる。下の段では、導体は帯が途中まで埋まり電子が動ける。絶縁体は埋まった帯と空いた帯のすき間が大きい。半導体はすき間が小さく、一部の電子が上の帯に移る。">
        <T x={20} y={20} fs={12.5} bold>
          原子1個
        </T>
        {[60, 110, 150].map((y) => (
          <line key={y} x1={40} y1={y} x2={180} y2={y} stroke="var(--fig-line)" strokeWidth={2} />
        ))}
        <T x={190} y={150} fs={11.5} tone="muted">
          とびとびの準位
        </T>
        <Arrow x1={300} y1={105} x2={400} y2={105} />
        <T x={350} y={88} anchor="middle" fs={11.5} tone="muted">
          たくさん並ぶ
        </T>
        <T x={430} y={20} fs={12.5} bold>
          原子がたくさん並んだ結晶
        </T>
        {[60, 110, 150].map((y) =>
          Array.from({ length: 7 }, (_, j) => <line key={`${y}-${j}`} x1={440} y1={y - 9 + j * 3} x2={580} y2={y - 9 + j * 3} stroke="var(--fig-line)" strokeWidth={1} />),
        )}
        <T x={590} y={150} fs={11.5} tone="muted">
          近い準位が集まった帯
        </T>
        <line x1={20} y1={184} x2={700} y2={184} stroke="var(--fig-muted)" strokeDasharray="3 4" />
        {mats.map((m, i) => (
          <g key={m.title}>
            <T x={m.x + 100} y={208} anchor="middle" fs={12.5} bold>
              {m.title}
            </T>
            {i === 0 ? (
              <Band x={m.x + 40} y={250} w={120} h={110} filled={0.5} label="" />
            ) : (
              <>
                <Band x={m.x + 40} y={i === 1 ? 228 : 236} w={120} h={i === 1 ? 46 : 50} filled={0} label="空いている帯" />
                <Band x={m.x + 40} y={i === 1 ? 324 : 314} w={120} h={i === 1 ? 46 : 54} filled={1} label="埋まった帯" />
                <Arrow x1={m.x + 176} y1={i === 1 ? 278 : 289} x2={m.x + 176} y2={i === 1 ? 320 : 311} both />
                <T x={m.x + 184} y={i === 1 ? 299 : 300} fs={11.5} tone="muted">
                  すき間
                </T>
              </>
            )}
            {i === 0 && (
              <>
                <T x={m.x + 100} y={276} anchor="middle" fs={11.5}>
                  空いている状態
                </T>
                <T x={m.x + 100} y={334} anchor="middle" fs={11.5}>
                  埋まった状態
                </T>
              </>
            )}
            {i === 2 &&
              [0, 1, 2].map((j) => (
                <g key={j}>
                  <Electron x={m.x + 68 + j * 32} y={245} r={5} />
                  <circle cx={m.x + 68 + j * 32} cy={324} r={5} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="2 2" />
                </g>
              ))}
            {m.note.map((s, j) => (
              <T key={j} x={m.x + 100} y={396 + j * 20} anchor="middle" fs={12}>
                {s}
              </T>
            ))}
          </g>
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図26-9 誘導放出とレーザー（動） ---------- */

const ROD = { l: 120, r: 600 }
const LASER_COLS = Array.from({ length: 8 }, (_, i) => 150 + i * 60)
const PASS_T0 = 0.5
const PASS_DT = 2

/** 光子の群れの先頭の位置と向き */
function laserFront(t: number) {
  const p = Math.floor((t - PASS_T0) / PASS_DT)
  const u = (t - PASS_T0 - p * PASS_DT) / PASS_DT
  const right = p % 2 === 0
  return { x: right ? ROD.l + (ROD.r - ROD.l) * u : ROD.r - (ROD.r - ROD.l) * u, right, p }
}

/** 列 c の原子が、時刻 t までに光子に何回出会って光子を出したか（ランプで1.2秒後にまた高い状態に戻る）。返り値は [今高い状態か, 出した光子の数] */
function laserAtom(c: number, t: number): [boolean, number] {
  const x = LASER_COLS[c]
  let readyAt = 0
  let emitted = 0
  for (let p = 0; p < 4; p++) {
    const tc = PASS_T0 + p * PASS_DT + (p % 2 === 0 ? x - ROD.l : ROD.r - x) / ((ROD.r - ROD.l) / PASS_DT)
    if (tc > t) break
    if (tc >= readyAt) {
      emitted++
      readyAt = tc + 1.2
    }
  }
  return [t >= readyAt, emitted]
}

export function FigLaser() {
  const period = 9
  return (
    <Anim
      n="26-9"
      title="光子が原子に同じ光子を出させ、鏡の間を往復するたびに光が強まる"
      still={6.9}
      period={period}
      caption="模式図です。上：エネルギーの高い状態の原子に、その差に当たる色の光子が来ると、同じ色・同じ向きで波の山の位置もそろった光子がもう1個出ます（誘導放出）。下：塗った丸はエネルギーの高い状態の原子、白い丸は低い状態の原子です。ランプの光が原子を高い状態に戻し、光子は鏡の間を往復しながら増えて、一部が右の鏡を通って外に出ます。実際の光子の数はこの図よりはるかに多くなります。"
    >
      {(t) => {
        const tt = t % period
        // 上：誘導放出1回分
        const u = tt % 4.5
        const head = 60 + 160 * u
        const drop = ease((u - 1.5) / 0.3)
        const outX = 380 + 160 * (u - 1.5)
        // 下：鏡の間の光
        const f = tt >= PASS_T0 ? laserFront(Math.min(tt, PASS_T0 + 4 * PASS_DT - 0.001)) : null
        const states = LASER_COLS.map((_, c) => laserAtom(c, tt))
        const n = 1 + 2 * states.reduce((s, [, e]) => s + e, 0)
        const rows = Math.min(6, 1 + Math.floor(Math.log2(n)))
        const hits = [PASS_T0 + PASS_DT, PASS_T0 + 3 * PASS_DT]
        return (
          <Svg id="26-9" w={720} h={340} label="上では、エネルギーの高い状態の原子に光子が来て、原子が低い状態に移り、同じ光子が2個になって出ていく。下では、ルビーの棒の中の原子が光子に出会うたびに光子が増え、鏡の間を往復して強くなった光の一部が右の鏡から外へ出る。">
            <T x={20} y={20} fs={12.5} bold>
              誘導放出（1917年、アインシュタインが理論で示した）
            </T>
            <line x1={300} y1={52} x2={380} y2={52} stroke="var(--fig-line)" strokeWidth={2} />
            <line x1={300} y1={112} x2={380} y2={112} stroke="var(--fig-line)" strokeWidth={2} />
            <T x={292} y={52} anchor="end" fs={11.5} tone="muted">
              高い状態
            </T>
            <T x={292} y={112} anchor="end" fs={11.5} tone="muted">
              低い状態
            </T>
            <Ball x={340} y={52 + 60 * drop} r={5} fill="var(--fig-accent)" />
            {u < 1.5 && <path d={wave(Math.max(40, head - 60), 82, Math.min(60, head - 40), 5, 20, (2 * Math.PI * (Math.max(40, head - 60) - head)) / 20)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />}
            <T x={40} y={56} fs={12}>
              光子が1個来る
            </T>
            <Arrow x1={130} y1={56} x2={180} y2={56} />
            {u >= 1.5 && outX < 700 && (
              <>
                <path d={wave(Math.max(390, outX - 60), 74, Math.min(60, outX - 390), 5, 20, (2 * Math.PI * (Math.max(390, outX - 60) - outX)) / 20)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
                <path d={wave(Math.max(390, outX - 60), 92, Math.min(60, outX - 390), 5, 20, (2 * Math.PI * (Math.max(390, outX - 60) - outX)) / 20)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
              </>
            )}
            <T x={420} y={124} fs={12}>
              同じ色・同じ向きの光子が2個になる
            </T>
            {/* 下：ルビーの棒 */}
            <rect x={150} y={160} width={420} height={12} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={360} y={150} anchor="middle" fs={11.5} tone="muted">
              ランプ：光を当てて、原子をエネルギーの高い状態に戻す
            </T>
            <rect x={ROD.l} y={196} width={ROD.r - ROD.l} height={78} rx={4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={ROD.l - 10} y={186} width={7} height={98} fill="var(--fig-line)" />
            <rect x={ROD.r + 3} y={186} width={7} height={98} fill="var(--fig-muted)" stroke="var(--fig-line)" />
            {LASER_COLS.map((x, c) =>
              [216, 254].map((y) => <circle key={`${c}-${y}`} cx={x} cy={y} r={6} fill={states[c][0] ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" />),
            )}
            {f &&
              Array.from({ length: rows }, (_, j) => {
                const y = 235 + (j - (rows - 1) / 2) * 9
                const x0 = f.right ? Math.max(ROD.l, f.x - 40) : f.x
                const len = f.right ? f.x - x0 : Math.min(40, ROD.r - f.x)
                return len > 2 ? <path key={j} d={wave(x0, y, len, 3, 14, 0)} fill="none" stroke="var(--fig-line)" strokeWidth={1.6} /> : null
              })}
            {hits.map((th, i) => {
              if (tt < th) return null
              const x1 = ROD.r + 12 + (tt - th) * 240
              const x0 = Math.max(ROD.r + 12, x1 - 70)
              if (x0 > 716) return null
              return <line key={th} x1={x0} y1={235} x2={Math.min(716, x1)} y2={235} stroke="var(--fig-accent)" strokeWidth={i === 0 ? 3 : 6} />
            })}
            <T x={660} y={212} anchor="middle" fs={12} tone="acc">
              レーザー光
            </T>
            <T x={ROD.l - 6} y={298} anchor="middle" fs={11.5} tone="muted">
              鏡
            </T>
            <T x={ROD.r + 6} y={298} anchor="middle" fs={11.5} tone="muted">
              一部を通す鏡
            </T>
            <T x={360} y={290} anchor="middle" fs={11.5} tone="muted">
              ルビーの棒
            </T>
            <T x={20} y={326} fs={12}>
              {`鏡の間を往復するたびに光子が増える（この図の光子の数：${n}個）`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図26-10 ビットと量子ビット ---------- */

const QB_ROWS = [
  { n: '1個', v: '2個' },
  { n: '2個', v: '4個' },
  { n: '3個', v: '8個' },
  { n: '10個', v: '1024個' },
  { n: '53個', v: '約9000兆個' },
]

export function FigQubit() {
  const cell = (x: number, y: number, label: string, fillPart: number) => (
    <g>
      <rect x={x} y={y} width={56} height={44} rx={4} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      {fillPart > 0 && <rect x={x} y={y + 44 * (1 - fillPart)} width={56} height={44 * fillPart} rx={4} fill="var(--fig-box3)" stroke="var(--fig-line)" />}
      <T x={x - 12} y={y + 22} anchor="middle" fs={16} bold>
        {label}
      </T>
    </g>
  )
  return (
    <Figure
      n="26-10"
      title="量子ビットは0と1の重ね合わせの状態をとれるが、測ると0か1のどちらかが出る"
      caption="模式図です。左上はふつうのビットで、0か1のどちらか一方の状態です。右上の量子ビットでは0と1の重ね合わせの状態の割合を、塗った高さで表しています。下の表は量子ビットの数と、その状態を書き表すのに必要な数の関係です。量子ビットが1個増えるごとに2倍になります。"
    >
      <Svg id="26-10" w={720} h={330} label="ふつうのビットは0か1のどちらか一方。量子ビットは0と1の重ね合わせの状態をとれ、測ると0か1のどちらかが出る。量子ビットが1個、2個、3個、10個、53個のとき、状態を書き表すのに必要な数は2個、4個、8個、1024個、約9000兆個。">
        <T x={20} y={22} fs={12.5} bold>
          ふつうのビット
        </T>
        {cell(56, 48, '0', 0)}
        {cell(146, 48, '1', 1)}
        <T x={40} y={116} fs={12}>
          0か1のどちらか一方
        </T>
        <T x={380} y={22} fs={12.5} bold>
          量子ビット
        </T>
        {cell(396, 48, '0', 0.7)}
        {cell(486, 48, '1', 0.3)}
        <T x={380} y={116} fs={12}>
          0と1の重ね合わせ
        </T>
        <Arrow x1={550} y1={70} x2={592} y2={70} />
        <T x={571} y={56} anchor="middle" fs={11.5} tone="muted">
          測る
        </T>
        <T x={600} y={64} fs={12}>
          0か1の
        </T>
        <T x={600} y={82} fs={12}>
          どちらかが出る
        </T>
        <T x={600} y={104} fs={11.5} tone="muted">
          （出やすさは塗った
        </T>
        <T x={600} y={120} fs={11.5} tone="muted">
          割合で決まる）
        </T>
        <line x1={20} y1={148} x2={700} y2={148} stroke="var(--fig-muted)" strokeDasharray="3 4" />
        <T x={20} y={174} fs={12.5} bold>
          量子ビットの数と、状態を書き表すのに必要な数
        </T>
        {QB_ROWS.map((r, i) => (
          <g key={r.n}>
            <rect x={20 + i * 136} y={196} width={128} height={104} rx={4} fill={i === 4 ? 'var(--fig-box3)' : 'var(--fig-box)'} stroke="var(--fig-line)" />
            <T x={84 + i * 136} y={222} anchor="middle" fs={12}>
              {`量子ビット ${r.n}`}
            </T>
            <Arrow x1={84 + i * 136} y1={236} x2={84 + i * 136} y2={258} />
            <T x={84 + i * 136} y={278} anchor="middle" fs={12.5} bold>
              {r.v}
            </T>
          </g>
        ))}
        <T x={20} y={318} fs={11.5} tone="muted">
          53個は、2019年にGoogleが実験に使った量子ビットの数
        </T>
      </Svg>
    </Figure>
  )
}
