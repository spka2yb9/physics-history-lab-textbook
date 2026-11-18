import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Vel, ease } from './common'

/** 中心 (cx, cy)、半径 r、角度 deg（上向きを0度、右回り）の点 */
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }
}

/* ---------- 図23-1 新しい力学ができるまでの年表 ---------- */

const ROAD = [
  { y: '1913年', who: 'ボーア', what: ['原子の模型', '（決まった軌道）'] },
  { y: '1923年', who: 'ド・ブロイ', what: ['電子にも波が', 'ともなうと考える'] },
  { y: '1924年', who: 'ド・ブロイ', what: ['博士論文に', 'まとめる'] },
  { y: '1925年', who: 'ハイゼンベルク', what: ['行列力学', '（ボルン、ヨルダン）'] },
  { y: '1926年', who: 'シュレーディンガー', what: ['波動力学', '2つが同じ内容と示す'] },
  { y: '1926年', who: 'ボルン', what: ['波を確率で読む', '（第24章）'] },
  { y: '1927年', who: 'デイヴィソンら', what: ['電子の回折を', '確かめる'] },
  { y: '1928年', who: '菊池正士', what: ['雲母の薄片で', '電子の回折'] },
]

export function FigRoad23() {
  return (
    <Figure n="23-1" title="ボーアの模型から、電子の回折の実験までの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。青い点はこの章で詳しく扱う出来事です。">
      <Svg id="23-1" w={760} h={230} label="1913年にボーアが原子の模型を発表した。1923年にド・ブロイが電子にも波がともなうと考え、1924年に博士論文にまとめた。1925年にハイゼンベルクらが行列力学を、1926年にシュレーディンガーが波動力学をつくり、2つが同じ内容だと示された。1926年にボルンが波を確率で解釈した。1927年にデイヴィソンらが、1928年に菊池正士が電子の回折を確かめた。">
        <Arrow x1={20} y1={124} x2={745} y2={124} />
        {ROAD.map((r, i) => {
          const x = 60 + i * 91
          const up = i % 2 === 0
          const ty = up ? 22 : 158
          const key = [2, 3, 4, 6].includes(i)
          return (
            <g key={`${r.y}-${r.who}`}>
              <circle cx={x} cy={124} r={6} fill={key ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 92 : 130} x2={x} y2={up ? 118 : 146} stroke="var(--fig-line)" />
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

/* ---------- 図23-2 光と電子の、波と粒の性質 ---------- */

export function FigDuality() {
  return (
    <Figure n="23-2" title="光で知られていた波と粒の2つの性質を、ド・ブロイは電子にも当てはめた" caption="灰色の欄は1924年までに確かめられていたこと、青い枠の欄はド・ブロイが予想し、1927年に実験で確かめられたことです。">
      <Svg id="23-2" w={680} h={250} label="表。光の波としての性質は干渉と回折、粒としての性質は光電効果で知られていた。電子の粒としての性質は1897年に知られていた。電子の波としての性質は、1924年にド・ブロイが予想し、1927年の回折の実験で確かめられた。">
        <T x={245} y={24} anchor="middle" bold>
          波としての性質
        </T>
        <T x={530} y={24} anchor="middle" bold>
          粒としての性質
        </T>
        <T x={55} y={90} anchor="middle" bold>
          光
        </T>
        <T x={55} y={190} anchor="middle" bold>
          電子
        </T>
        <Box x={110} y={45} w={270} h={90} lines={['干渉と回折を起こす', 'ヤング、フレネル（1801年〜）', '第7章']} subTone="muted" />
        <Box x={395} y={45} w={270} h={90} lines={['決まったエネルギーのつぶ', '光電効果の説明（1905年）', '第21章']} subTone="muted" />
        <Box x={110} y={145} w={270} h={90} lines={['電子にも波がともなう', 'ド・ブロイの予想（1924年）', '回折の実験で確認（1927年）']} fill="box3" accent subTone="muted" />
        <Box x={395} y={145} w={270} h={90} lines={['電気を帯びた小さな粒', 'J・J・トムソン（1897年）', '第22章']} subTone="muted" />
      </Svg>
    </Figure>
  )
}

/* ---------- 図23-3 速さと物質波の波長（動） ---------- */

const LANES3 = [
  { label: '遅い電子', v: 55, wl: 52 },
  { label: '速さが2倍の電子（波長は半分）', v: 110, wl: 26 },
]

export function FigSpeedWave() {
  const x0 = 40
  const x1 = 700
  const span = x1 - x0
  const period = span / 55
  return (
    <Anim
      n="23-3"
      title="電子の速さが2倍になると、物質波の波長は半分になる"
      still={4.2}
      period={period}
      caption="模式図です。青い線は電子にともなう波、黒の矢印は電子の速さを表します。波の山から次の山までが波長です。波の形や広がりの大きさは説明のために描いたもので、実際の波長は1mmの数百万分の1ほどです。"
    >
      {(t) => (
        <Svg id="23-3" w={720} h={260} label="遅い電子と、速さが2倍の電子が右へ進む。それぞれに波がともない、速い電子の波は山の間隔（波長）が半分になっている。">
          {LANES3.map((l, i) => {
            const y = 90 + i * 120
            const xc = x0 + ((l.v * t + 60) % span)
            let d = ''
            for (let x = Math.max(x0, xc - 150); x <= Math.min(x1, xc + 150); x += 2) {
              const u = x - xc
              const env = Math.exp(-((u / 70) ** 2))
              const yy = y - 22 * env * Math.cos((2 * Math.PI * u) / l.wl)
              d += `${d ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`
            }
            const showScale = xc + 2 * l.wl < x1 - 6
            const showVel = xc + l.v * 0.5 < x1
            return (
              <g key={l.label}>
                <T x={20} y={y - 66} fs={12.5} bold>
                  {l.label}
                </T>
                <line x1={x0} y1={y} x2={x1} y2={y} stroke="var(--fig-muted)" strokeDasharray="2 4" />
                <path d={d} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
                <Ball x={xc} y={y} r={7} />
                {showVel && <Vel x1={xc} y1={y + 40} x2={xc + l.v * 0.5} y2={y + 40} />}
                {showScale && (
                  <g>
                    <line x1={xc + l.wl} y1={y - 34} x2={xc + 2 * l.wl} y2={y - 34} stroke="var(--fig-line)" />
                    <line x1={xc + l.wl} y1={y - 38} x2={xc + l.wl} y2={y - 30} stroke="var(--fig-line)" />
                    <line x1={xc + 2 * l.wl} y1={y - 38} x2={xc + 2 * l.wl} y2={y - 30} stroke="var(--fig-line)" />
                    <T x={xc + 1.5 * l.wl} y={y - 47} fs={11.5} anchor="middle">
                      波長
                    </T>
                  </g>
                )}
              </g>
            )
          })}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図23-4 軌道に収まる電子の波（動・スライダー） ---------- */

export function FigOrbitWave() {
  const [n, setN] = useState(4)
  const cx = 190
  const cy = 165
  const R = 105
  const A = 13
  const whole = Math.abs(n - Math.round(n)) < 1e-6
  const LAPS = [
    { k: 0, dash: undefined, op: 1 },
    { k: 1, dash: '7 4', op: 0.85 },
    { k: 2, dash: '2 4', op: 0.85 },
  ]
  return (
    <Anim
      n="23-4"
      title="軌道1周に波がちょうど整数個入るときだけ、電子の波はつながって続く"
      still={0}
      period={2}
      controls={<Range label="1周に入る波の数" min={3} max={6} step={0.25} value={n} onChange={setN} format={(v) => `${v}個`} />}
      caption="模式図です。同じ大きさの軌道で電子の波長を変えたとき、1周に入る波の数がどう変わるかを表しています。実線は1周目、破線は2周目、点線は3周目の波です。「1周に入る波の数」を整数にすると3本の線が重なり、4.25のような半端な数にするとずれます。"
    >
      {(t) => {
        const c = Math.cos(Math.PI * t)
        const lap = (k: number) => {
          let d = ''
          for (let i = 0; i <= 240; i++) {
            const ph = (i / 240) * 2 * Math.PI
            const r = R + A * c * Math.sin(n * (ph + 2 * Math.PI * k))
            const p = polar(cx, cy, r, (ph * 180) / Math.PI)
            d += `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
          }
          return d
        }
        return (
          <Svg id="23-4" w={700} h={300} label="原子核のまわりの軌道に沿って電子の波を描いた図。1周に波がちょうど整数個入ると、2周目以降の波が1周目と重なってつながる。整数個でないと、周ごとに山の位置がずれて打ち消し合う。">
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--fig-muted)" strokeDasharray="2 5" />
            <circle cx={cx} cy={cy} r={5} fill="var(--fig-line)" />
            <T x={cx} y={cy + 20} anchor="middle" fs={12} tone="muted">
              原子核
            </T>
            {LAPS.map((l) => (
              <path key={l.k} d={lap(l.k)} fill="none" stroke="var(--fig-accent)" strokeWidth={l.k ? 1.6 : 2.4} strokeDasharray={l.dash} opacity={l.op} />
            ))}
            <line x1={cx} y1={cy - R - 18} x2={cx} y2={cy - R + 6} stroke="var(--fig-line)" strokeWidth={1.5} />
            <T x={cx} y={cy - R - 30} anchor="middle" fs={12}>
              1周の出発点
            </T>
            <T x={360} y={70} bold>
              {whole ? `1周に波がちょうど${n}個入る` : `1周に入る波は${n}個（整数でない）`}
            </T>
            <T x={360} y={100} fs={12.5}>
              {whole ? '2周目以降の波が1周目と重なる' : '周を重ねるごとに山の位置がずれる'}
            </T>
            <T x={360} y={124} fs={12.5}>
              {whole ? '→ 波はつながって同じ場所で揺れ続ける' : '→ 波は打ち消し合って続かない'}
            </T>
            {whole ? (
              <T x={360} y={160} tone="acc" bold>
                この軌道は許される
              </T>
            ) : (
              <g>
                <Cross x={370} y={160} s={7} />
                <T x={386} y={160} tone="danger" bold>
                  この軌道は許されない
                </T>
              </g>
            )}
            <T x={360} y={226} fs={12} tone="muted">
              実線：1周目　破線：2周目　点線：3周目
            </T>
            <T x={360} y={250} fs={12} tone="muted">
              ボーアの決めた軌道は、波の数が1、2、3…
            </T>
            <T x={360} y={270} fs={12} tone="muted">
              の軌道と同じになる
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図23-5 軌道の絵から、状態の組ごとの表へ ---------- */

const INTENSITY = [
  [0, 0.9, 0.45, 0.2],
  [0.9, 0, 0.7, 0.35],
  [0.45, 0.7, 0, 0.6],
  [0.2, 0.35, 0.6, 0],
]

export function FigTable() {
  const tx = 360
  const ty = 72
  const cs = 42
  return (
    <Figure n="23-5" title="ハイゼンベルクは観測できない軌道をやめ、状態の組ごとに数を並べた表で考えた" caption="模式図です。右の表の升の濃さは説明のためのもので、実際の値ではありません。斜めの升はそれぞれの状態に、ほかの升は2つの状態の間の移り変わりに対応します。">
      <Svg id="23-5" w={720} h={290} label="左はボーアの模型の、電子が回る軌道の絵で、軌道は観測できないので使わないことを赤い×で示す。右は状態1から4を縦と横に並べた表で、斜めの升は状態、ほかの升は状態の移り変わりを表し、それぞれが光の線の振動数や明るさに対応する。">
        <T x={130} y={24} anchor="middle" bold>
          ボーアの模型の絵
        </T>
        {[35, 65, 95].map((r) => (
          <circle key={r} cx={130} cy={150} r={r} fill="none" stroke="var(--fig-muted)" strokeDasharray="4 4" />
        ))}
        <circle cx={130} cy={150} r={6} fill="var(--fig-line)" />
        <Ball x={130 + 65 * Math.cos(-0.7)} y={150 + 65 * Math.sin(-0.7)} r={7} />
        <Cross x={232} y={62} s={10} />
        <T x={130} y={264} anchor="middle" fs={12.5}>
          軌道の形や回る速さは観測できない
        </T>
        <Arrow x1={255} y1={150} x2={300} y2={150} />
        <T x={470} y={24} anchor="middle" bold>
          状態の組ごとに数を並べた表
        </T>
        <T x={tx + 2 * cs} y={46} anchor="middle" fs={12} tone="muted">
          移った後の状態
        </T>
        <T x={tx - 8} y={60} anchor="end" fs={12} tone="muted">
          移る前↓
        </T>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <T x={tx + i * cs + cs / 2} y={62} anchor="middle" fs={12}>
              {`状態${i + 1}`}
            </T>
            <T x={tx - 8} y={ty + i * cs + cs / 2 + 8} anchor="end" fs={12}>
              {`状態${i + 1}`}
            </T>
          </g>
        ))}
        {INTENSITY.map((row, i) =>
          row.map((v, j) => (
            <rect
              key={`${i}-${j}`}
              x={tx + j * cs}
              y={ty + 8 + i * cs}
              width={cs}
              height={cs}
              fill={i === j ? 'var(--fig-box)' : 'var(--fig-accent)'}
              fillOpacity={i === j ? 1 : 0.15 + 0.7 * v}
              stroke="var(--fig-line)"
            />
          )),
        )}
        <rect x={tx} y={ty + 8 + 2 * cs} width={cs} height={cs} fill="none" stroke="var(--fig-line)" strokeWidth={3.5} />
        <T x={560} y={98} fs={12}>
          灰色の升：それぞれの状態
        </T>
        <T x={560} y={128} fs={12}>
          青い升：状態の移り変わり
        </T>
        <T x={560} y={146} fs={12} tone="muted">
          濃いほど光の線が明るい
        </T>
        <T x={560} y={184} fs={12}>
          太い枠の升：状態3から
        </T>
        <T x={560} y={202} fs={12}>
          状態1へ移るときに出る
        </T>
        <T x={560} y={220} fs={12}>
          光の線に対応する
        </T>
        <Arrow x1={555} y1={202} x2={tx + cs + 6} y2={ty + 8 + 2.5 * cs} />
      </Svg>
    </Figure>
  )
}

/* ---------- 図23-6 順番で結果が変わる操作（動） ---------- */

const F_PATH = 'M-14,-28 L18,-28 L18,-19 L-5,-19 L-5,-5 L12,-5 L12,4 L-5,4 L-5,28 L-14,28 Z'

function Letter({ x, y, tf, faint }: { x: number; y: number; tf: string; faint?: boolean }) {
  return (
    <g transform={`translate(${x},${y}) ${tf}`}>
      <path d={F_PATH} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} opacity={faint ? 0.45 : 1} />
    </g>
  )
}

const ORDER_ROWS = [
  { title: 'A：回してから裏返す', steps: ['右に90度回す', '左右を裏返す'], rotFirst: true },
  { title: 'B：裏返してから回す', steps: ['左右を裏返す', '右に90度回す'], rotFirst: false },
]

export function FigOrder() {
  const slots = [90, 330, 570]
  return (
    <Anim
      n="23-6"
      title="2つの操作の順番を入れ替えると、結果が変わることがある"
      still={6}
      period={7}
      caption="文字の向きを変える2つの操作を、違う順番で行った例です。行列の掛け算でも、掛ける順番を入れ替えると結果が変わることがあります。ボルンは、位置の表と運動量の表がこの性質を持つことに気づきました。"
    >
      {(t) => {
        const p1 = ease((t - 0.5) / 1.5)
        const p2 = ease((t - 2.8) / 1.5)
        return (
          <Svg id="23-6" w={680} h={285} label="Fの文字を、Aでは右に90度回してから左右を裏返し、Bでは左右を裏返してから右に90度回す。最後の文字の向きはAとBで違う。">
            {ORDER_ROWS.map((r, i) => {
              const y = 80 + i * 125
              const rot = (p: number) => `rotate(${90 * p})`
              const flip = (p: number) => `scale(${1 - 2 * p},1)`
              const tf1 = r.rotFirst ? rot(p1) : flip(p1)
              const tf2 = r.rotFirst ? `${flip(p2)} ${rot(1)}` : `${rot(p2)} ${flip(1)}`
              return (
                <g key={r.title}>
                  <T x={20} y={y - 62} fs={13} bold>
                    {r.title}
                  </T>
                  <Arrow x1={150} y1={y} x2={268} y2={y} />
                  <Arrow x1={390} y1={y} x2={508} y2={y} />
                  <T x={209} y={y - 40} anchor="middle" fs={12} tone={t > 0.4 && t < 2.2 ? 'acc' : undefined}>
                    {`1回目：${r.steps[0]}`}
                  </T>
                  <T x={449} y={y - 40} anchor="middle" fs={12} tone={t > 2.7 && t < 4.5 ? 'acc' : undefined}>
                    {`2回目：${r.steps[1]}`}
                  </T>
                  <Letter x={slots[0]} y={y} tf="" />
                  {t > 0.4 && <Letter x={slots[1]} y={y} tf={tf1} />}
                  {t > 2.7 && <Letter x={slots[2]} y={y} tf={tf2} />}
                  <T x={slots[0]} y={y + 46} anchor="middle" fs={12} tone="muted">
                    はじめ
                  </T>
                  <T x={slots[1]} y={y + 46} anchor="middle" fs={12} tone="muted">
                    1回目のあと
                  </T>
                  <T x={slots[2]} y={y + 46} anchor="middle" fs={12} tone="muted">
                    2回目のあと
                  </T>
                </g>
              )
            })}
            {t > 4.4 && (
              <T x={570} y={272} anchor="middle" fs={12.5} tone="acc" bold>
                AとBで最後の向きが違う
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図23-7 弦の振動と原子の中の電子の波（動・切り替え） ---------- */

/** 水素原子の s 状態の動径関数に半径を掛けたもの（距離はボーア半径を単位にする） */
const radial = (k: number, r: number) => {
  if (k === 1) return r * Math.exp(-r)
  if (k === 2) return r * (2 - r) * Math.exp(-r / 2)
  return r * (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3)
}
const NODES: Record<number, number[]> = { 1: [], 2: [2], 3: [(18 - Math.sqrt(108)) / 4, (18 + Math.sqrt(108)) / 4] }
const RINGS = 60
const RMAX = 20

export function FigString() {
  const [mode, setMode] = useState<'1' | '2' | '3'>('1')
  const k = Number(mode)
  const L0 = 40
  const L = 300
  const sy = 130
  const amp = 40
  const vals = Array.from({ length: RINGS }, (_, i) => radial(k, ((i + 0.5) / RINGS) * RMAX))
  const vmax = Math.max(...vals.map(Math.abs))
  const acx = 545
  const acy = 140
  const scale = 100 / RMAX
  const ORDER = ['最も低い', '2番目に低い', '3番目に低い']
  return (
    <Anim
      n="23-7"
      title="両端を留めた弦も原子の中の電子の波も、決まった形でしか振動できない"
      still={0}
      period={2}
      controls={
        <Choice
          label="振動の形"
          options={[
            { value: '1', label: '1番目' },
            { value: '2', label: '2番目' },
            { value: '3', label: '3番目' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="模式図です。左は両端を留めた弦、右は水素原子の中で電子の波がつくる形の断面です。右の青と灰色は、波の山の側と谷の側を表します。「振動の形」を切り替えると、波の高さが0になる所（節）が1つずつ増えます。右の図で、状態どうしの広がりの比はおおよそ実際に合わせてあります。"
    >
      {(t) => {
        const c = Math.cos(Math.PI * k * t)
        let d = ''
        let env = ''
        let env2 = ''
        for (let i = 0; i <= 150; i++) {
          const x = L0 + (i / 150) * L
          const s = Math.sin((k * Math.PI * i) / 150)
          d += `${i ? 'L' : 'M'}${x.toFixed(1)},${(sy - amp * s * c).toFixed(1)}`
          env += `${i ? 'L' : 'M'}${x.toFixed(1)},${(sy - amp * s).toFixed(1)}`
          env2 += `${i ? 'L' : 'M'}${x.toFixed(1)},${(sy + amp * s).toFixed(1)}`
        }
        const nodes = Array.from({ length: k - 1 }, (_, j) => L0 + (L * (j + 1)) / k)
        return (
          <Svg id="23-7" w={720} h={300} label="左は両端を留めた弦の振動で、1番目は山が1つ、2番目は2つ、3番目は3つで、途中に動かない点（節）ができる。右は水素原子の中の電子の波の断面で、エネルギーが高い状態ほど広がり、波が0になる円が増える。">
            <T x={190} y={24} anchor="middle" bold>
              両端を留めた弦
            </T>
            <rect x={L0 - 8} y={sy - 30} width={8} height={60} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={L0 + L} y={sy - 30} width={8} height={60} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <path d={env} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <path d={env2} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <path d={d} fill="none" stroke="var(--fig-accent)" strokeWidth={2.4} />
            {nodes.map((x) => (
              <g key={x}>
                <circle cx={x} cy={sy} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
                <T x={x} y={sy + 58} anchor="middle" fs={12}>
                  節
                </T>
              </g>
            ))}
            <T x={190} y={232} anchor="middle" fs={12.5}>
              {k === 1 ? '山が1つ。振動数は最も少ない' : `山が${k}つ。振動数は1番目の${k}倍`}
            </T>
            <T x={190} y={256} anchor="middle" fs={12} tone="muted">
              1番目と2番目の間のような形は続かない
            </T>
            <T x={acx} y={24} anchor="middle" bold>
              水素原子の中の電子の波
            </T>
            {vals.map((v, i) => {
              const m = Math.abs(v / vmax)
              if (m < 0.03) return null
              return (
                <circle
                  key={i}
                  cx={acx}
                  cy={acy}
                  r={((i + 0.5) / RINGS) * 100}
                  fill="none"
                  stroke={v * c >= 0 ? 'var(--fig-accent)' : 'var(--fig-line)'}
                  strokeWidth={100 / RINGS + 0.4}
                  opacity={m * (0.3 + 0.6 * Math.abs(c))}
                />
              )
            })}
            {NODES[k].map((r) => (
              <circle key={r} cx={acx} cy={acy} r={r * scale} fill="none" stroke="var(--fig-line)" strokeWidth={1.2} strokeDasharray="3 3" />
            ))}
            <circle cx={acx} cy={acy} r={2.5} fill="var(--fig-line)" />
            <T x={acx} y={262} anchor="middle" fs={12.5}>
              {`エネルギーが${ORDER[k - 1]}状態`}
            </T>
            <T x={acx} y={284} anchor="middle" fs={12} tone="muted">
              点線の円：波の高さが0の所（節）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図23-8 行列力学と波動力学の比較 ---------- */

const CMP_ROWS: { label: string; a: string[]; b: string[] }[] = [
  { label: 'つくった人', a: ['ハイゼンベルク、ボルン、ヨルダン', '（1925年）'], b: ['シュレーディンガー', '（1926年）'] },
  { label: '出発点', a: ['観測できる光の線の', '振動数と明るさ'], b: ['ド・ブロイの物質波'] },
  { label: '計算に使うもの', a: ['状態の組ごとに数を並べた表', '（行列）'], b: ['空間に広がる波（波動関数）と', '波が従う方程式'] },
  { label: '思い描ける絵', a: ['電子の動きの絵はない'], b: ['原子のまわりの波の形を描ける'] },
  { label: '水素原子の', a: ['パウリが計算（1925〜1926年）', 'ボーアの模型の値と一致'], b: ['シュレーディンガーが計算（1926年）', 'ボーアの模型の値と一致'] },
]

export function FigCompare() {
  const ax = 165
  const bx = 445
  const cw = 270
  return (
    <Figure n="23-8" title="行列力学と波動力学は、出発点も道具も違うのに、同じ答えを出した" caption="2つの理論の違いと、1926年に分かったことをまとめた表です。">
      <Svg id="23-8" w={720} h={372} label="表。行列力学は1925年にハイゼンベルク、ボルン、ヨルダンがつくり、観測できる光の線から出発して状態の組ごとの表を使い、電子の動きの絵はない。波動力学は1926年にシュレーディンガーがつくり、ド・ブロイの物質波から出発して空間に広がる波と方程式を使い、波の形を描ける。どちらも水素原子のエネルギーがボーアの模型の値と一致した。1926年、2つは同じ内容の別の書き方だと示された。">
        <Box x={ax} y={14} w={cw} h={36} lines="行列力学" fill="box3" bold />
        <Box x={bx} y={14} w={cw} h={36} lines="波動力学" fill="box4" bold />
        {CMP_ROWS.map((r, i) => {
          const y = 58 + i * 50
          return (
            <g key={r.label}>
              <T x={150} y={y + 23 - (i === 4 ? 9 : 0)} anchor="end" fs={12.5} bold>
                {r.label}
              </T>
              {i === 4 && (
                <T x={150} y={y + 32} anchor="end" fs={12.5} bold>
                  エネルギー
                </T>
              )}
              <Box x={ax} y={y} w={cw} h={46} lines={r.a} fs={12.5} />
              <Box x={bx} y={y} w={cw} h={46} lines={r.b} fs={12.5} />
            </g>
          )
        })}
        <Box x={ax} y={316} w={bx + cw - ax} h={48} lines={['1926年、シュレーディンガーらが、2つは同じ内容の', '別の書き方であることを示した']} fill="box3" accent fs={12.5} />
      </Svg>
    </Figure>
  )
}

/* ---------- 図23-9 ニッケルの結晶で跳ね返る電子（スライダー） ---------- */

export function FigNickel() {
  const [volt, setVolt] = useState(54)
  const ox = 230
  const oy = 286
  const peak = volt <= 54 ? 60 - ((volt - 40) * 10) / 14 : 50 - ((volt - 54) * 5) / 12
  const strength = Math.exp(-(((volt - 54) / 7) ** 2))
  const rAt = (deg: number) => 100 * ((90 - deg) / 70) + 115 * strength * Math.exp(-(((deg - peak) / 5) ** 2))
  let d = `M${ox},${oy}`
  for (let deg = 20; deg <= 90; deg += 1) {
    const p = polar(ox, oy, rAt(deg), deg)
    d += ` L${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }
  d += ' Z'
  const g50 = polar(ox, oy, 205, 50)
  const g20 = polar(ox, oy, 150, 20)
  const wave = Math.round(Math.sqrt(volt) / 1.225e-6 / 1e5) * 10
  return (
    <Figure
      n="23-9"
      title="54ボルトで加速した電子は、ニッケルの結晶で50度の向きに特に多く跳ね返る"
      controls={<Range label="電子を加速する電圧" min={40} max={68} step={2} value={volt} onChange={setVolt} format={(v) => `${v}ボルト`} />}
      caption="デイヴィソンとジャーマーの1927年の報告をもとにした模式図です。電子は結晶の面に垂直に当たります。中心から青い曲線までの距離が、その向きに跳ね返った電子の数を表します。「電子を加速する電圧」を40ボルトから上げると、60度付近に小さなふくらみが現れ、54ボルトで50度の向きに最も強くなり、66ボルトほどで消えます。大きさの比は実際と違います。"
    >
      <Svg id="23-9" w={720} h={330} label="上から電子をニッケルの結晶に垂直に当て、跳ね返った電子の数を向きごとに測る装置の模式図。54ボルトのとき、入ってきた向きから50度ずれた向きに、跳ね返る電子が特に多くなる。">
        <Box x={175} y={14} w={110} h={30} lines="電子を出す装置" fs={12} />
        <Vel x1={ox} y1={46} x2={ox} y2={oy - 6} />
        <T x={ox - 10} y={120} anchor="end" fs={12}>
          入ってくる電子
        </T>
        <rect x={130} y={oy} width={200} height={30} fill="var(--fig-box)" stroke="var(--fig-line)" />
        {Array.from({ length: 3 }, (_, r) =>
          Array.from({ length: 12 }, (_, i) => <circle key={`${r}-${i}`} cx={140 + i * 16.5 + (r % 2) * 8} cy={oy + 7 + r * 8} r={2.4} fill="var(--fig-line)" />),
        )}
        <T x={120} y={oy + 15} anchor="end" fs={12}>
          ニッケルの結晶
        </T>
        <line x1={ox} y1={oy} x2={g50.x} y2={g50.y} stroke="var(--fig-muted)" strokeDasharray="5 4" />
        <T x={g50.x + 8} y={g50.y - 4} fs={12} tone="muted">
          50度
        </T>
        <line x1={ox} y1={oy} x2={g20.x} y2={g20.y} stroke="var(--fig-muted)" strokeDasharray="1 4" />
        <T x={g20.x + 8} y={g20.y - 4} fs={12} tone="muted">
          20度
        </T>
        <path d={d} fill="var(--fig-accent)" fillOpacity={0.15} stroke="var(--fig-accent)" strokeWidth={2} />
        <T x={460} y={56} bold>
          {`電圧：${volt}ボルト`}
        </T>
        <T x={460} y={82} fs={12.5}>
          {volt === 54
            ? '50度の向きに最も多く跳ね返る'
            : strength > 0.15
              ? `ふくらみは弱く、50度より${volt < 54 ? '大きい' : '小さい'}角度`
              : '特に多く跳ね返る向きはない'}
        </T>
        <T x={460} y={106} fs={12.5}>
          {`電子の波長の予想：約${wave}万分の1mm`}
        </T>
        <T x={460} y={150} fs={12} tone="muted">
          1927年の報告（54ボルト）：
        </T>
        <T x={460} y={170} fs={12} tone="muted">
          50度の向きで最も強い。この角度と
        </T>
        <T x={460} y={190} fs={12} tone="muted">
          原子の並ぶ間隔から求めた波長は、
        </T>
        <T x={460} y={210} fs={12} tone="muted">
          ド・ブロイの考えによる予想と
        </T>
        <T x={460} y={230} fs={12} tone="muted">
          約1％の差で一致した
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図23-10 薄い膜と雲母の薄片でできる模様 ---------- */

const PLATE = '#d9dbe0'
const DARK = '#2a2c31'
const LIGHT = '#ffffff'
const PW = 170

function Plate({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={PW} height={PW} fill={PLATE} stroke="var(--fig-line)" />
      {children}
    </g>
  )
}


/** 角度 deg の向きに、中心から距離 off だけずらした直線を、乾板の四角 (px, py, PW) の内側だけに切り取る */
const lineIn = (px: number, py: number, cx: number, cy: number, deg: number, off: number) => {
  const a = (deg * Math.PI) / 180
  const ux = Math.cos(a)
  const uy = Math.sin(a)
  const ox = cx - uy * off
  const oy = cy + ux * off
  let t0 = -1000
  let t1 = 1000
  const clip = (p: number, q: number) => {
    if (Math.abs(p) < 1e-9) return q >= 0
    const r = q / p
    if (p < 0) t0 = Math.max(t0, r)
    else t1 = Math.min(t1, r)
    return true
  }
  const ok = clip(-ux, ox - (px + 1)) && clip(ux, px + PW - 1 - ox) && clip(-uy, oy - (py + 1)) && clip(uy, py + PW - 1 - oy)
  if (!ok || t0 >= t1) return null
  return { x1: ox + ux * t0, y1: oy + uy * t0, x2: ox + ux * t1, y2: oy + uy * t1 }
}

export function FigRings() {
  const P = [12, 248, 484].map((x) => ({ x: x + 33, y: 50, cx: x + 118, cy: 135 }))
  const net: { x: number; y: number }[] = []
  const s = 26
  for (let i = -5; i <= 5; i++)
    for (let j = -5; j <= 5; j++) {
      const p = { x: P[1].cx + s * (i + j / 2), y: P[1].cy + s * j * (Math.sqrt(3) / 2) }
      if (Math.abs(p.x - P[1].cx) < PW / 2 - 4 && Math.abs(p.y - P[1].cy) < PW / 2 - 4) net.push(p)
    }
  return (
    <Figure n="23-10" title="細かい結晶の集まりでは輪が、1つの結晶の薄片では点や線が現れる" caption="模式図です。写真の乾板で電子が多く当たった所を濃く描いています。トムソンの膜は向きのばらばらな小さな結晶の集まりなので輪になり、菊池が使った雲母は1つの結晶なので、点や線が決まった向きに並びます。実際の写真は出典に挙げた論文で見られます。">
      <Svg id="23-10" w={720} h={285} label="3つの写真の模式図。左はトムソンの薄い膜で、同心円の輪が写る。中央は菊池のとても薄い雲母で、点が三角形の網の目に並ぶ。右はやや厚い雲母で、点と輪に加えて、黒と白の線が対になって横切る。">
        {['G・P・トムソン（1927年）', '菊池正士（1928年）', '菊池正士（1928年）'].map((ttl, i) => (
          <g key={i}>
            <T x={P[i].cx} y={18} anchor="middle" fs={12.5} bold>
              {ttl}
            </T>
            <T x={P[i].cx} y={37} anchor="middle" fs={12} tone="muted">
              {['細かい結晶が集まった薄い膜', 'とても薄い雲母の薄片', 'やや厚い雲母の薄片'][i]}
            </T>
          </g>
        ))}
        <Plate x={P[0].x} y={P[0].y}>
          <circle cx={P[0].cx} cy={P[0].cy} r={5} fill={DARK} />
          {[
            { r: 30, w: 3 },
            { r: 40, w: 2 },
            { r: 56, w: 2.5 },
            { r: 66, w: 1.5 },
            { r: 76, w: 1.5 },
          ].map((c) => (
            <circle key={c.r} cx={P[0].cx} cy={P[0].cy} r={c.r} fill="none" stroke={DARK} strokeWidth={c.w} opacity={0.8} />
          ))}
        </Plate>
        <Plate x={P[1].x} y={P[1].y}>
          {[0, 60, 120].map((deg) =>
            [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((m) => {
              const l = lineIn(P[1].x, P[1].y, P[1].cx, P[1].cy, deg, m * s * (Math.sqrt(3) / 2))
              return l && <line key={`${deg}-${m}`} {...l} stroke={DARK} strokeWidth={4} opacity={0.22} />
            }),
          )}
          {net.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.6} fill={DARK} />
          ))}
          <circle cx={P[1].cx} cy={P[1].cy} r={5} fill={DARK} />
        </Plate>
        <Plate x={P[2].x} y={P[2].y}>
          {[48, 68].map((r) => (
            <circle key={r} cx={P[2].cx + 6} cy={P[2].cy + 4} r={r} fill="none" stroke={DARK} strokeWidth={1.8} opacity={0.6} />
          ))}
          {[
            { deg: 0, off: -40 },
            { deg: 60, off: 30 },
            { deg: 120, off: -22 },
            { deg: 90, off: 52 },
          ].map((k) => {
            const b = lineIn(P[2].x, P[2].y, P[2].cx, P[2].cy, k.deg, k.off)
            const w = lineIn(P[2].x, P[2].y, P[2].cx, P[2].cy, k.deg, k.off + (k.off > 0 ? 9 : -9))
            return (
              <g key={k.deg}>
                {b && <line {...b} stroke={DARK} strokeWidth={2.4} />}
                {w && <line {...w} stroke={LIGHT} strokeWidth={3} />}
              </g>
            )
          })}
          {[
            [0, 0],
            [14, -9],
            [-12, 10],
            [20, 16],
            [-22, -14],
            [5, 24],
          ].map(([dx, dy], i) => (
            <circle key={i} cx={P[2].cx + dx} cy={P[2].cy + dy} r={i ? 3 : 5} fill={DARK} />
          ))}
        </Plate>
        {[
          ['同心円の輪が写る', 'X線の輪と同じ種類の模様'],
          ['点が三角形の網の目に並ぶ', '電圧を上げると間隔が狭まる'],
          ['点と輪に加え、黒と白の線が', '対になって横切る（菊池線）'],
        ].map((lines, i) =>
          lines.map((ln, j) => (
            <T key={`${i}-${j}`} x={P[i].cx} y={242 + j * 19} anchor="middle" fs={12}>
              {ln}
            </T>
          )),
        )}
      </Svg>
    </Figure>
  )
}
