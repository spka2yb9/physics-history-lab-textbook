import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Trail, rng } from './common'

/* ---------- この章の部品 ---------- */

const HEAT = 'var(--fig-box2)' // 熱の流れ（帯）
const WORK = 'var(--fig-box4)' // 仕事の流れ（帯）

/** 熱や仕事の流れを表す幅のある矢印。幅が量を表す（力の矢印とは別のもの） */
function Band({ x1, y1, x2, y2, w, fill }: { x1: number; y1: number; x2: number; y2: number; w: number; fill: string }) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 1 || w < 0.5) return null
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const nx = -uy
  const ny = ux
  const head = Math.min(len * 0.45, Math.max(10, w * 0.5))
  const hw = w / 2
  const hh = w / 2 + Math.max(5, w * 0.2)
  const bx = x2 - ux * head
  const by = y2 - uy * head
  const pts = [
    [x1 + nx * hw, y1 + ny * hw],
    [bx + nx * hw, by + ny * hw],
    [bx + nx * hh, by + ny * hh],
    [x2, y2],
    [bx - nx * hh, by - ny * hh],
    [bx - nx * hw, by - ny * hw],
    [x1 - nx * hw, y1 - ny * hw],
  ]
  return <polygon points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} fill={fill} stroke="var(--fig-line)" strokeWidth={1} />
}

/** 熱い物（上）と冷たい物（下）の箱 */
function Reservoir({ x, y, w, hot, lines }: { x: number; y: number; w: number; hot: boolean; lines: string[] }) {
  return <Box x={x} y={y} w={w} h={lines.length > 1 ? 46 : 36} lines={lines} fill={hot ? 'box2' : 'box3'} fs={12.5} />
}

/** 熱機関（丸） */
function Engine({ x, y, r = 28, label = '熱機関' }: { x: number; y: number; r?: number; label?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={x} y={y} anchor="middle" fs={12}>
        {label}
      </T>
    </g>
  )
}

/* ---------- 図13-1 ひとりでは逆向きに起こらない変化（動・切り替え） ---------- */

const BG = 300 // 図の中の重力の強さ（ピクセル毎秒毎秒）
const BH0 = 130 // 最初の高さ
const BOUNCES = (() => {
  // [始まりの時刻, 長さ, 高さ, 落ちるだけか]
  const segs: { t0: number; d: number; h: number; drop: boolean }[] = []
  let t = 0
  const d0 = Math.sqrt((2 * BH0) / BG)
  segs.push({ t0: 0, d: d0, h: BH0, drop: true })
  t += d0
  for (let h = BH0 * 0.55; h > 2; h *= 0.55) {
    const d = 2 * Math.sqrt((2 * h) / BG)
    segs.push({ t0: t, d, h, drop: false })
    t += d
  }
  return { segs, end: t }
})()

/** 時刻 τ のボールの位置（左から右へ進みながら、はずむ高さが低くなる） */
function ballAt(tau: number) {
  const u = Math.max(0, Math.min(tau, BOUNCES.end))
  const x = 70 + 40 * u
  let h = 0
  for (const s of BOUNCES.segs) {
    if (u >= s.t0 && u <= s.t0 + s.d) {
      const v = u - s.t0
      h = s.drop ? s.h - 0.5 * BG * v * v : Math.sqrt(2 * BG * s.h) * v - 0.5 * BG * v * v
      break
    }
  }
  return { x, y: 200 - Math.max(0, h) }
}

const teaAt = (tau: number) => 20 + 60 * Math.exp(-tau / 1.5)

export function FigOneWay() {
  const [dir, setDir] = useState<'fwd' | 'rev'>('fwd')
  const FULL = 6.5
  return (
    <Anim
      n="13-1"
      title="はずむボールは止まり、お茶は冷める。逆向きの変化はひとりでには起こらない"
      still={6.5}
      period={8}
      controls={
        <Choice
          label="再生の向き"
          options={[
            { value: 'fwd', label: '実際の向き' },
            { value: 'rev', label: '逆向き' },
          ]}
          value={dir}
          onChange={setDir}
        />
      }
      caption="模式図です。「逆向き」は映像を逆に再生した動きで、エネルギーの合計は変わりませんが、実際には観察されません（赤の×）。"
    >
      {(t) => {
        const rev = dir === 'rev'
        const tau = rev ? Math.max(0, FULL - t) : Math.min(t, FULL)
        const b = ballAt(tau)
        // 通った道筋：実際の向きでは 0〜τ、逆向きでは τ〜最後（映像で見えてきた部分）
        const from = rev ? tau : 0
        const to = rev ? BOUNCES.end : Math.min(tau, BOUNCES.end)
        const pts: [number, number][] = []
        for (let s = from; s <= to; s += 0.04) {
          const p = ballAt(s)
          pts.push([p.x, p.y - 10])
        }
        const temp = teaAt(tau)
        const steam = Math.max(0, Math.min(1, (temp - 22) / 50))
        const fillH = (temp / 100) * 110
        return (
          <Svg id="13-1" w={720} h={260} label="左は床ではずむボールで、はずむ高さがしだいに低くなって止まる。右は部屋に置いた80℃のお茶で、やがて20℃まで冷める。逆向きに再生すると、止まっていたボールがはね上がり、お茶がひとりでに熱くなるが、このような変化は観察されない。">
            <T x={40} y={22} bold>
              はずむボール
            </T>
            <line x1={40} y1={210} x2={340} y2={210} stroke="var(--fig-line)" strokeWidth={2} />
            {pts.length > 1 && <Trail points={pts} />}
            <Ball x={b.x} y={b.y} r={10} />
            <T x={400} y={22} bold>
              部屋に置いたお茶
            </T>
            {/* 湯のみ */}
            <path d="M440,120 L520,120 L512,196 L448,196 Z" fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <line x1={420} y1={200} x2={540} y2={200} stroke="var(--fig-line)" strokeWidth={2} />
            {[455, 480, 505].map((sx, i) => (
              <path
                key={sx}
                d={`M${sx},112 q-8,-12 0,-24 q8,-12 0,-24`}
                fill="none"
                stroke="var(--fig-muted)"
                strokeWidth={1.5}
                opacity={steam * (i === 1 ? 1 : 0.8)}
              />
            ))}
            {/* 温度計 */}
            <rect x={590} y={70} width={14} height={120} rx={7} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <rect x={593} y={190 - fillH} width={8} height={fillH} fill="var(--fig-danger)" opacity={0.75} />
            <circle cx={597} cy={198} r={11} fill="var(--fig-danger)" opacity={0.75} stroke="var(--fig-line)" />
            <T x={618} y={100} fs={12.5}>
              お茶の温度
            </T>
            <T x={618} y={122} fs={15} bold>
              {`${Math.round(temp)}℃`}
            </T>
            <T x={618} y={160} fs={12} tone="muted">
              まわりの空気
            </T>
            <T x={618} y={178} fs={12} tone="muted">
              20℃
            </T>
            {!rev && tau > 4 && (
              <T x={190} y={234} anchor="middle" fs={12} tone="muted">
                床とボールがわずかに温まる
              </T>
            )}
            {!rev && tau > 4 && (
              <T x={480} y={234} anchor="middle" fs={12} tone="muted">
                熱が空気へ移る
              </T>
            )}
            {rev && (
              <>
                <Cross x={322} y={40} />
                <Cross x={690} y={40} />
                <T x={360} y={240} anchor="middle" fs={12.5} tone="danger">
                  このような逆向きの変化は、ひとりでには起こらない
                </T>
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図13-2 年表 ---------- */

const ROAD = [
  { y: '1824年', who: 'カルノー', what: ['熱機関の理論', 'を出版'] },
  { y: '1848年', who: 'トムソン', what: ['絶対温度の', '目盛りを提案'] },
  { y: '1850年', who: 'クラウジウス', what: ['第二法則の', 'もとの原理'] },
  { y: '1851年', who: 'トムソン', what: ['第二法則の', '別の言い表し方'] },
  { y: '1852年', who: 'トムソン', what: ['使えるエネルギー', 'が失われる傾向'] },
  { y: '1865年', who: 'クラウジウス', what: ['エントロピーと', '名付ける'] },
  { y: '1908年', who: 'オネス', what: ['ヘリウムを', '液体にする'] },
  { y: '1911年', who: 'オネス', what: ['超伝導の', '発見'] },
]

export function FigRoad() {
  return (
    <Figure n="13-2" title="熱の移る向きの法則と低温物理の年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="13-2" w={720} h={250} label="1824年にカルノーが熱機関の理論を出版し、1848年にトムソンが絶対温度の目盛りを提案した。1850年にクラウジウス、1851年にトムソンが第二法則を示し、1852年にトムソンが使えるエネルギーが失われる傾向を論じた。1865年にクラウジウスがエントロピーと名付けた。1908年にオネスがヘリウムを液体にし、1911年に超伝導を発見した。">
        <Arrow x1={14} y1={125} x2={710} y2={125} />
        {ROAD.map((r, i) => {
          const x = 52 + i * 88
          const up = i % 2 === 0
          const ty = up ? 30 : 152
          return (
            <g key={r.y}>
              <circle cx={x} cy={125} r={6} fill={i === 5 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
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

/* ---------- 図13-3 第二法則の2つの言い表し方 ---------- */

function StatementPanel({ x0, kind }: { x0: number; kind: 'real' | 'kelvin' | 'clausius' }) {
  const cx = x0 + 120
  const titles = { real: '実際の熱機関', kelvin: 'トムソンが否定した機関', clausius: 'クラウジウスが否定した機械' }
  const notes = {
    real: ['熱の一部を仕事に変え、', '残りを冷たい物へ捨てる'],
    kelvin: ['受け取った熱を', 'すべて仕事に変える'],
    clausius: ['仕事を使わずに、冷たい物', 'から熱い物へ熱を運ぶ'],
  }
  return (
    <g>
      <T x={cx} y={20} anchor="middle" bold fs={12.5}>
        {titles[kind]}
      </T>
      <Reservoir x={x0 + 40} y={40} w={160} hot lines={['熱い物']} />
      <Reservoir x={x0 + 40} y={214} w={160} hot={false} lines={['冷たい物']} />
      {kind === 'real' && (
        <>
          <Band x1={cx} y1={76} x2={cx} y2={122} w={30} fill={HEAT} />
          <Band x1={cx + 28} y1={150} x2={x0 + 222} y2={150} w={12} fill={WORK} />
          <Band x1={cx} y1={178} x2={cx} y2={214} w={18} fill={HEAT} />
          <T x={cx + 22} y={98} fs={12}>
            熱
          </T>
          <T x={x0 + 186} y={130} anchor="middle" fs={12}>
            仕事
          </T>
          <T x={cx + 16} y={196} fs={12}>
            捨てる熱
          </T>
        </>
      )}
      {kind === 'kelvin' && (
        <>
          <Band x1={cx} y1={76} x2={cx} y2={122} w={30} fill={HEAT} />
          <Band x1={cx + 28} y1={150} x2={x0 + 226} y2={150} w={30} fill={WORK} />
          <T x={cx + 22} y={98} fs={12}>
            熱
          </T>
          <T x={x0 + 190} y={124} anchor="middle" fs={12}>
            仕事
          </T>
          <Cross x={x0 + 52} y={150} />
          <T x={x0 + 30} y={186} fs={12} tone="danger">
            作れない
          </T>
        </>
      )}
      {kind === 'clausius' && (
        <>
          <Band x1={cx} y1={214} x2={cx} y2={178} w={22} fill={HEAT} />
          <Band x1={cx} y1={122} x2={cx} y2={76} w={22} fill={HEAT} />
          <T x={cx + 18} y={196} fs={12}>
            熱
          </T>
          <T x={cx + 18} y={100} fs={12}>
            熱
          </T>
          <Cross x={x0 + 52} y={150} />
          <T x={x0 + 160} y={150} fs={12} tone="danger">
            作れない
          </T>
        </>
      )}
      <Engine x={cx} y={150} label={kind === 'clausius' ? '機械' : '熱機関'} />
      {notes[kind].map((s, i) => (
        <T key={i} x={cx} y={268 + i * 17} anchor="middle" fs={12} tone="muted">
          {s}
        </T>
      ))}
    </g>
  )
}

export function FigStatements() {
  return (
    <Figure
      n="13-3"
      title="第二法則は、作れない機関を2通りに言い表す"
      caption="模式図です。帯の幅は熱（茶色）や仕事（緑）の量を表します。中央と右のどちらか一方を作れれば、もう一方も作れます。"
    >
      <Svg id="13-3" w={720} h={300} label="左は実際の熱機関で、熱い物から受け取った熱の一部を仕事に変え、残りを冷たい物へ捨てる。中央は受け取った熱をすべて仕事に変える機関で、トムソンの言い表し方により作れない。右は仕事を使わずに冷たい物から熱い物へ熱を運ぶ機械で、クラウジウスの言い表し方により作れない。">
        <StatementPanel x0={0} kind="real" />
        <line x1={240} y1={10} x2={240} y2={290} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        <StatementPanel x0={240} kind="kelvin" />
        <line x1={480} y1={10} x2={480} y2={290} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        <StatementPanel x0={480} kind="clausius" />
      </Svg>
    </Figure>
  )
}

/* ---------- 図13-4 冷やすと縮む気体の体積（動） ---------- */

export function FigGasVolume() {
  const gx = (c: number) => 230 + (c + 300) * 1.15 // セルシウス温度 → x
  const gy = (v: number) => 250 - v * 100 // 0℃のときの体積を1とした体積 → y
  const lines = [1.4, 1, 0.6]
  const vol = (v0: number, c: number) => v0 * (1 + c / 273.15)
  return (
    <Anim
      n="13-4"
      title="気体の体積と温度の線をのばすと、どの線もマイナス273℃で0になる"
      still={7}
      period={9}
      caption="模式図です。3本の線は量の違う気体で、点線は測った範囲の線を低い温度へのばしたものです。実際の気体は、その前に液体になります。"
    >
      {(t) => {
        const c = t < 3 ? 100 - (100 * t) / 3 : 0 // 測る温度
        const ext = t < 3 ? 0 : Math.min(1, (t - 3) / 3) // のばした線の進み具合
        const cEnd = -273.15 * ext
        const v = vol(1, c)
        const pistonY = 210 - v * 100
        return (
          <Svg id="13-4" w={720} h={300} label="気体を冷やすと体積が一定の割合で小さくなる。温度と体積のグラフの線を低い温度へのばすと、量の違う3つの気体の線は、どれもマイナス273℃で体積が0になる。">
            {/* 筒とピストン */}
            <T x={40} y={22} fs={12.5} bold>
              おもりをのせたピストン
            </T>
            <rect x={60} y={50} width={90} height={160} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <rect x={61} y={pistonY} width={88} height={210 - pistonY} fill="var(--fig-box3)" />
            <rect x={58} y={pistonY - 10} width={94} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={90} y={pistonY - 28} width={30} height={18} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={105} y={240} anchor="middle" fs={12.5}>
              {`温度 ${Math.round(c)}℃`}
            </T>
            <T x={105} y={258} anchor="middle" fs={12} tone="muted">
              {t < 3 ? '冷やしていく' : '測れる範囲の端'}
            </T>
            {/* グラフ */}
            <line x1={gx(-300)} y1={gy(0)} x2={gx(110) + 10} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(-300)} y1={gy(0)} x2={gx(-300)} y2={gy(2)} stroke="var(--fig-line)" />
            <T x={gx(-300) + 6} y={gy(2) - 10} fs={12}>
              体積
            </T>
            <T x={gx(110) + 6} y={gy(0) + 38} fs={12} anchor="end">
              温度（℃）
            </T>
            {[-200, -100, 0, 100].map((tc) => (
              <g key={tc}>
                <line x1={gx(tc)} y1={gy(0)} x2={gx(tc)} y2={gy(0) + 5} stroke="var(--fig-line)" />
                <T x={gx(tc)} y={gy(0) + 18} anchor="middle" fs={11.5} tone="muted">
                  {tc}
                </T>
              </g>
            ))}
            {lines.map((v0) => (
              <g key={v0}>
                <line x1={gx(100)} y1={gy(vol(v0, 100))} x2={gx(c)} y2={gy(vol(v0, c))} stroke="var(--fig-accent)" strokeWidth={2.5} />
                {ext > 0 && <line x1={gx(0)} y1={gy(v0)} x2={gx(cEnd)} y2={gy(vol(v0, cEnd))} stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="5 4" />}
                <circle cx={gx(c)} cy={gy(vol(v0, c))} r={4} fill="var(--fig-accent)" />
              </g>
            ))}
            {ext >= 1 && (
              <>
                <circle cx={gx(-273.15)} cy={gy(0)} r={6} fill="none" stroke="var(--fig-danger)" strokeWidth={2} />
                <T x={gx(-273.15) - 4} y={gy(0) + 38} fs={12.5} tone="danger">
                  マイナス273℃で体積が0
                </T>
              </>
            )}
            <T x={gx(-230)} y={gy(2) - 10} fs={12} tone="acc">
              実線：測れる範囲
            </T>
            {ext > 0 && (
              <T x={gx(-110)} y={gy(2) - 10} fs={12} tone="muted">
                点線：その線をのばしたもの
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図13-5 温度の目盛りの比較 ---------- */

const MAIN_MARKS = [
  { name: '水が沸く', k: '373', c: '100', f: '212', kv: 373.15 },
  { name: '体温', k: '310', c: '37', f: '約99', kv: 310 },
  { name: '水がこおる', k: '273', c: '0', f: '32', kv: 273.15 },
  { name: '絶対零度', k: '0', c: '−273', f: '−460', kv: 0 },
]

const LOW_MARKS = [
  { k: 14, text: '14K　1908年より前に得られた最低の温度' },
  { k: 4.2, text: '4.2K　ヘリウムが沸く。水銀が超伝導になる' },
  { k: 1.9, text: '1.9K　LHC の電磁石を冷やす温度' },
  { k: 0, text: '0K　絶対零度（マイナス273.15℃）' },
]

export function FigScales() {
  const my = (k: number) => 300 - k * 0.6
  const iy = (k: number) => 300 - k * 10
  const cols = [
    { x: 120, head: ['絶対温度', '（K）'], key: 'k' as const },
    { x: 210, head: ['セルシウス', '温度（℃）'], key: 'c' as const },
    { x: 300, head: ['ファーレン', 'ハイト（°F）'], key: 'f' as const },
  ]
  return (
    <Figure
      n="13-5"
      title="絶対温度は、セルシウス温度と同じ幅の目盛りを、絶対零度から数えたもの"
      caption="左の3本の目盛りは、同じ高さが同じ温度です（数値は四捨五入）。右は0Kから20Kまでの拡大で、縮尺が違います。"
    >
      <Svg id="13-5" w={720} h={330} label="絶対温度、セルシウス温度、ファーレンハイト温度の目盛りの比較。水が沸く温度は373K、100℃、212°F。水がこおる温度は273K、0℃、32°F。絶対零度は0K、マイナス273℃、マイナス460°F。拡大図では、14Kが1908年より前に得られた最低の温度、4.2Kがヘリウムの沸く温度で水銀が超伝導になる温度、1.9KがLHCの電磁石を冷やす温度。">
        {cols.map((col) => (
          <g key={col.key}>
            <T x={col.x} y={18} anchor="middle" fs={12} bold>
              {col.head[0]}
            </T>
            <T x={col.x} y={34} anchor="middle" fs={12} bold>
              {col.head[1]}
            </T>
            <line x1={col.x} y1={50} x2={col.x} y2={my(0)} stroke="var(--fig-line)" strokeWidth={2} />
          </g>
        ))}
        {MAIN_MARKS.map((m) => (
          <g key={m.name}>
            <line x1={84} y1={my(m.kv)} x2={350} y2={my(m.kv)} stroke="var(--fig-muted)" strokeDasharray="2 4" />
            <T x={10} y={my(m.kv) - 9} fs={12}>
              {m.name}
            </T>
            {cols.map((col) => (
              <g key={col.key}>
                <circle cx={col.x} cy={my(m.kv)} r={3.5} fill="var(--fig-line)" />
                <T x={col.x + 8} y={my(m.kv) - 9} fs={12}>
                  {m[col.key]}
                </T>
              </g>
            ))}
          </g>
        ))}
        {/* 拡大図 */}
        <rect x={392} y={52} width={322} height={262} rx={6} fill="none" stroke="var(--fig-muted)" />
        <T x={404} y={74} fs={12} bold>
          0Kから20Kまでを拡大
        </T>
        <line x1={350} y1={my(0)} x2={392} y2={iy(0)} stroke="var(--fig-muted)" />
        <line x1={420} y1={iy(20)} x2={420} y2={iy(0)} stroke="var(--fig-line)" strokeWidth={2} />
        {[0, 10, 20].map((k) => (
          <T key={k} x={412} y={iy(k)} anchor="end" fs={11.5} tone="muted">
            {k}
          </T>
        ))}
        {LOW_MARKS.map((m) => (
          <g key={m.k}>
            <circle cx={420} cy={iy(m.k)} r={3.5} fill={m.k === 4.2 ? 'var(--fig-accent)' : 'var(--fig-line)'} />
            <T x={432} y={iy(m.k)} fs={12}>
              {m.text}
            </T>
          </g>
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図13-6 熱が移るときのエントロピーの増減（切り替え） ---------- */

export function FigEntropyFlow() {
  const [dir, setDir] = useState<'down' | 'up'>('down')
  const down = dir === 'down'
  const zx = 500
  const unit = 32
  const rows = [
    { label: '熱い物（600K）のエントロピー', v: down ? -2 : 2 },
    { label: '冷たい物（300K）のエントロピー', v: down ? 4 : -4 },
    { label: '2つを合わせたエントロピー', v: down ? 2 : -2 },
  ]
  return (
    <Figure
      n="13-6"
      title="熱い物から冷たい物へ熱が移ると、エントロピーの合計は増える"
      controls={
        <Choice
          label="熱の向き"
          options={[
            { value: 'down', label: '熱い物から冷たい物へ' },
            { value: 'up', label: '冷たい物から熱い物へ' },
          ]}
          value={dir}
          onChange={setDir}
        />
      }
      caption="棒の長さはエントロピーの変化の大きさです（単位は省略）。「熱の向き」を切り替えると、逆向きでは合計が減ります。"
    >
      <Svg id="13-6" w={720} h={250} label="600Kの熱い物から300Kの冷たい物へ熱が移ると、熱い物のエントロピーは2減り、冷たい物は4増え、合計は2増える。逆向きに熱が移るとすると合計は2減り、このようなことは起こらない。">
        <Reservoir x={40} y={40} w={170} hot lines={['熱い物', '600K（約327℃）']} />
        <Reservoir x={40} y={170} w={170} hot={false} lines={['冷たい物', '300K（約27℃）']} />
        <Band x1={125} y1={down ? 88 : 168} x2={125} y2={down ? 168 : 88} w={26} fill={HEAT} />
        <T x={146} y={128} fs={12}>
          熱
        </T>
        <T x={146} y={146} fs={11.5} tone="muted">
          （同じ量）
        </T>
        <line x1={zx} y1={34} x2={zx} y2={226} stroke="var(--fig-line)" />
        <T x={zx} y={240} anchor="middle" fs={11.5} tone="muted">
          変化なし
        </T>
        <T x={zx - 10} y={20} anchor="end" fs={11.5} tone="muted">
          ← 減る
        </T>
        <T x={zx + 10} y={20} fs={11.5} tone="muted">
          増える →
        </T>
        {rows.map((r, i) => {
          const y = 66 + i * 62
          const len = Math.abs(r.v) * unit
          const right = r.v > 0
          const total = i === 2
          const word = `${Math.abs(r.v)} ${right ? '増える' : '減る'}`
          return (
            <g key={r.label}>
              <T x={260} y={y - 18} fs={12} bold={total}>
                {r.label}
              </T>
              <rect
                x={right ? zx : zx - len}
                y={y - 8}
                width={len}
                height={16}
                fill={total ? (right ? 'var(--fig-box4)' : 'var(--fig-danger)') : 'var(--fig-box)'}
                opacity={total && !right ? 0.35 : 1}
                stroke="var(--fig-line)"
              />
              <T x={right ? zx + len + 8 : zx - len - 8} y={y} anchor={right ? 'start' : 'end'} fs={12.5} tone={total && !right ? 'danger' : undefined} bold={total}>
                {word}
              </T>
            </g>
          )
        })}
        {!down && (
          <>
            <Cross x={262} y={214} />
            <T x={280} y={214} fs={12.5} tone="danger">
              ひとりでには起こらない
            </T>
          </>
        )}
      </Svg>
    </Figure>
  )
}

/* ---------- 図13-7 仕切りを外すと混ざる2種類の気体（動） ---------- */

const MIX = (() => {
  const r = rng(1311)
  return Array.from({ length: 72 }, (_, i) => {
    const a = i < 36
    const ang = r() * Math.PI * 2
    const sp = 50 + r() * 60
    return {
      a,
      x0: a ? 70 + r() * 280 : 370 + r() * 280,
      y0: 50 + r() * 160,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
    }
  })
})()

/** 壁で跳ね返る1次元の運動。lo〜hi の間を往復する位置と、その時の速さの向き */
function bounce(p: number, lo: number, hi: number): [number, number] {
  const L = hi - lo
  const m = (((p - lo) % (2 * L)) + 2 * L) % (2 * L)
  return m < L ? [lo + m, 1] : [hi - (m - L), -1]
}

export function FigMix() {
  const TR = 1.5 // 仕切りを外す時刻
  const BX0 = 60
  const BX1 = 660
  const MID = 360
  const R = 5
  return (
    <Anim
      n="13-7"
      title="仕切りを外すと2種類の気体は混ざり、ひとりでは元に戻らない"
      still={8}
      period={14}
      caption="模式図です。黒い丸と白い丸は種類の違う気体の分子で、1.5秒で仕切りを外します。右上は左半分にある黒い丸の数です。"
    >
      {(t) => {
        const removed = t >= TR
        let countA = 0
        const mol = MIX.map((m) => {
          const lo = m.a ? BX0 + R : MID + R
          const hi = m.a ? MID - R : BX1 - R
          let x: number
          if (!removed) x = bounce(m.x0 + m.vx * t, lo, hi)[0]
          else {
            const [xr, s] = bounce(m.x0 + m.vx * TR, lo, hi)
            x = bounce(xr + s * m.vx * (t - TR), BX0 + R, BX1 - R)[0]
          }
          const y = bounce(m.y0 + m.vy * t, 40 + R, 220 - R)[0]
          if (m.a && x < MID) countA++
          return { a: m.a, x, y }
        })
        const state = !removed ? '仕切りで左右に分けてある' : t < 7 ? '仕切りを外すと、混ざっていく' : '混ざったまま、ひとりでは分かれない'
        return (
          <Svg id="13-7" w={720} h={270} label="箱の左に黒い丸の気体、右に白い丸の気体が入っている。仕切りを外すと2種類の分子は動き回って混ざり、その後、ひとりでに左右に分かれ直すことはない。">
            <T x={60} y={22} fs={12.5}>
              {state}
            </T>
            <T x={660} y={22} anchor="end" fs={12.5}>
              {`左半分にある黒い丸：${countA}個／36個`}
            </T>
            <rect x={BX0} y={40} width={BX1 - BX0} height={180} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
            {!removed && <line x1={MID} y1={40} x2={MID} y2={220} stroke="var(--fig-line)" strokeWidth={4} />}
            {removed && <line x1={MID} y1={40} x2={MID} y2={220} stroke="var(--fig-muted)" strokeDasharray="2 5" />}
            {mol.map((m, i) => (
              <circle key={i} cx={m.x} cy={m.y} r={R} fill={m.a ? 'var(--fig-line)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.2} />
            ))}
            <circle cx={70} cy={246} r={R} fill="var(--fig-line)" stroke="var(--fig-line)" />
            <T x={82} y={246} fs={12}>
              気体A（黒い丸）
            </T>
            <circle cx={230} cy={246} r={R} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <T x={242} y={246} fs={12}>
              気体B（白い丸）
            </T>
            <T x={660} y={246} anchor="end" fs={12} tone="muted">
              点線は仕切りがあった位置
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図13-8 熱機関で使える熱と捨てる熱（動・スライダー） ---------- */

export function FigEngine() {
  const [hot, setHot] = useState(600)
  const [cold, setCold] = useState(300)
  const eff = Math.max(0, 1 - cold / hot)
  const pct = Math.round(eff * 100)
  const W = 44
  const N = 10
  const P = 5
  const ex = 210
  const ey = 150
  return (
    <Anim
      n="13-8"
      title="熱機関が仕事にできる熱の割合には、2つの温度で決まる上限がある"
      still={2.2}
      period={P}
      controls={
        <>
          <Range label="熱い側の温度" min={400} max={900} step={50} value={hot} onChange={setHot} format={(v) => `${v}K（約${v - 273}℃）`} />
          <Range label="冷たい側の温度" min={250} max={350} step={10} value={cold} onChange={setCold} format={(v) => `${v}K（約${v - 273}℃）`} />
        </>
      }
      caption="摩擦などの損失がない理想的な熱機関の模式図です。帯の幅と粒の数が熱と仕事の割合を表します。2つのスライダーで温度を変えられます。"
    >
      {(t) => {
        const work = (i: number) => Math.floor((i + 1) * eff) > Math.floor(i * eff)
        const dots = Array.from({ length: N }, (_, i) => {
          const u = (((t - (i * P) / N) % P) + P) % P // この粒の出発からの時間
          const s1 = 1.2
          const s2 = 1.4
          if (u < s1) return { x: ex, y: 66 + ((ey - 32 - 66) * u) / s1 }
          if (u < s1 + s2) {
            const f = (u - s1) / s2
            return work(i) ? { x: ex + 32 + (430 - ex - 32) * f, y: ey } : { x: ex, y: ey + 32 + (234 - ey - 32) * f }
          }
          return null
        })
        return (
          <Svg id="13-8" w={720} h={290} label={`熱い側が${hot}K、冷たい側が${cold}Kのとき、理想的な熱機関が受け取った熱のうち仕事にできるのは最大で${pct}%で、残りは冷たい側へ捨てる。`}>
            <Reservoir x={60} y={20} w={300} hot lines={['熱い側', `${hot}K（約${hot - 273}℃）`]} />
            <Reservoir x={60} y={234} w={300} hot={false} lines={['冷たい側', `${cold}K（約${cold - 273}℃）`]} />
            <Band x1={ex} y1={66} x2={ex} y2={ey - 30} w={W} fill={HEAT} />
            <Band x1={ex} y1={ey + 30} x2={ex} y2={234} w={W * (1 - eff)} fill={HEAT} />
            <Band x1={ex + 30} y1={ey} x2={430} y2={ey} w={W * eff} fill={WORK} />
            <Engine x={ex} y={ey} r={32} />
            <T x={ex + 34} y={92} fs={12}>
              受け取る熱
            </T>
            <T x={ex + 34} y={208} fs={12}>
              捨てる熱
            </T>
            <T x={330} y={ey - Math.max(10, (W * eff) / 2 + 8) - 8} anchor="middle" fs={12}>
              仕事
            </T>
            <Box x={432} y={ey - 24} w={96} h={48} lines={['仕事として', '取り出す']} fill="box4" fs={12} />
            {dots.map((d, i) => d && <circle key={i} cx={d.x} cy={d.y} r={4} fill="var(--fig-line)" />)}
            <T x={548} y={92} fs={12}>
              仕事にできる割合
            </T>
            <T x={548} y={116} fs={18} bold tone="acc">
              {`最大 ${pct}%`}
            </T>
            <T x={548} y={184} fs={12}>
              捨てる熱の割合
            </T>
            <T x={548} y={208} fs={18} bold>
              {`最低 ${100 - pct}%`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図13-9 水銀の電気抵抗が急に0になる（動） ---------- */

export function FigSuper() {
  const gx = (k: number) => 90 + k * 90
  const gy = (r: number) => 240 - r * 170
  const actual = (k: number) => (k > 4.2 ? 0.4 + 0.04 * (k - 4.2) : 0)
  const guess = (k: number) => (k >= 4.2 ? actual(k) : k <= 1.5 ? 0 : 0.4 * Math.pow((k - 1.5) / 2.7, 1.6))
  const path = (f: (k: number) => number, from: number, to: number) => {
    let d = ''
    for (let k = from; k >= to - 1e-9; k -= 0.05) d += `${d ? 'L' : 'M'}${gx(k).toFixed(1)},${gy(f(k)).toFixed(1)}`
    return d
  }
  return (
    <Anim
      n="13-9"
      title="水銀を冷やしていくと、4.2Kで電気抵抗が急に0になる"
      still={4.5}
      period={7.5}
      caption="オネスの測定をもとにした模式図で、縦の大きさは実際の比と違います。点線は、抵抗がなめらかに小さくなるというオネスのはじめの予想です。"
    >
      {(t) => {
        const k = 6 - 0.9 * Math.min(t, 5)
        const below = k <= 4.2
        const solid = below ? `${path(actual, 6, 4.2)} L${gx(4.2)},${gy(0)} L${gx(k).toFixed(1)},${gy(0)}` : path(actual, 6, k)
        return (
          <Svg id="13-9" w={720} h={290} label="横軸は温度、縦軸は水銀の電気抵抗。温度を下げていくと、抵抗は4.2Kまではほぼ一定だが、4.2Kで急に0になる。なめらかに小さくなるという予想とは違っていた。">
            <line x1={gx(0)} y1={gy(0)} x2={gx(6) + 16} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={50} stroke="var(--fig-line)" />
            <T x={gx(0) + 8} y={52} fs={12}>
              電気抵抗
            </T>
            <T x={gx(0) - 8} y={gy(0)} anchor="end" fs={11.5} tone="muted">
              0
            </T>
            {[0, 1, 2, 3, 4, 5, 6].map((v) => (
              <g key={v}>
                <line x1={gx(v)} y1={gy(0)} x2={gx(v)} y2={gy(0) + 5} stroke="var(--fig-line)" />
                <T x={gx(v)} y={gy(0) + 18} anchor="middle" fs={11.5} tone="muted">
                  {v}
                </T>
              </g>
            ))}
            <T x={gx(6) + 16} y={gy(0) + 38} anchor="end" fs={12}>
              温度（K）
            </T>
            <line x1={gx(4.2)} y1={gy(0) + 4} x2={gx(4.2)} y2={70} stroke="var(--fig-muted)" strokeDasharray="2 4" />
            <T x={gx(4.2)} y={62} anchor="middle" fs={12} tone="muted">
              4.2K
            </T>
            <path d={path(guess, 4.2, 1.5)} fill="none" stroke="var(--fig-muted)" strokeWidth={1.8} strokeDasharray="6 4" />
            <T x={170} y={150} fs={12} tone="muted">
              オネスのはじめの予想
            </T>
            <T x={170} y={168} fs={12} tone="muted">
              （なめらかに小さくなる）
            </T>
            <path d={solid} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            <circle cx={gx(k)} cy={gy(actual(k))} r={5} fill="var(--fig-accent)" />
            <T x={480} y={110} fs={12.5} tone="acc">
              実際の水銀
            </T>
            {below && (
              <T x={gx(4.2) + 12} y={205} fs={12} tone="acc">
                ここで急に0になる
              </T>
            )}
            <T x={700} y={24} anchor="end" fs={13} bold>
              {`温度 ${k.toFixed(1)}K`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}
