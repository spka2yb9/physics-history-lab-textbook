import { useMemo, useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { Ball, Cross, Force, Trail, Vel, ease } from './common'

/* ---------- 共通：横向きの棒2本（図3-8・3-9） ---------- */

/** 左に名前、右に長さの変わる棒。value は 0〜1（棒の最大長に対する割合） */
function HBars({ x, y, rows }: { x: number; y: number; rows: { label: string; value: number; note: string }[] }) {
  const W = 200
  return (
    <g>
      {rows.map((r, i) => {
        const yy = y + i * 62
        return (
          <g key={r.label}>
            <T x={x} y={yy} fs={12.5} bold>
              {r.label}
            </T>
            <rect x={x} y={yy + 12} width={W} height={16} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 3" />
            <rect x={x} y={yy + 12} width={Math.max(2, W * r.value)} height={16} fill={i === 0 ? 'var(--fig-box2)' : 'var(--fig-box3)'} stroke="var(--fig-line)" />
            <T x={x} y={yy + 42} fs={12} tone="muted">
              {r.note}
            </T>
          </g>
        )
      })}
    </g>
  )
}

/* ---------- 図3-1 デカルトの第4規則と実際の衝突 ---------- */

export function FigDescartes() {
  const row = (y: number, after: { b: number; c: number }) => (
    <g>
      {/* ぶつかる前 */}
      <Ball x={240} y={y} r={12} />
      <T x={240} y={y} anchor="middle" fs={11.5}>
        B
      </T>
      <Vel x1={254} y1={y} x2={300} y2={y} />
      <Ball x={370} y={y} r={22} />
      <T x={370} y={y} anchor="middle" fs={12}>
        C
      </T>
      {/* ぶつかった後 */}
      <Ball x={520} y={y} r={12} />
      <T x={520} y={y} anchor="middle" fs={11.5}>
        B
      </T>
      <Vel x1={506} y1={y} x2={506 - after.b} y2={y} />
      <Ball x={610} y={y} r={22} />
      <T x={610} y={y} anchor="middle" fs={12}>
        C
      </T>
      {after.c > 0 && <Vel x1={634} y1={y} x2={634 + after.c} y2={y} />}
    </g>
  )
  return (
    <Figure
      n="3-1"
      title="デカルトの規則では、小さな球は大きな球を動かせない"
      caption="模式図です。黒の矢印は速さと向きです。Cの質量はBの3倍とし、下の段はホイヘンスらの規則（1669年）で求めた結果です。"
    >
      <Svg id="3-1" w={700} h={250} label="上の段はデカルトの第4規則で、静止した大きな球Cに小さな球Bがぶつかっても、Cは動かず、Bが同じ速さで跳ね返る。下の段は実際の衝突で、Cは動き出し、Bは遅くなって跳ね返る。">
        <T x={270} y={22} anchor="middle" bold>
          ぶつかる前
        </T>
        <T x={570} y={22} anchor="middle" bold>
          ぶつかった後
        </T>
        <line x1={430} y1={40} x2={430} y2={240} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <T x={16} y={72} bold>
          デカルトの規則
        </T>
        <T x={16} y={92} fs={12} tone="muted">
          （1644年）
        </T>
        {row(82, { b: 46, c: 0 })}
        <Cross x={662} y={124} s={7} />
        <T x={448} y={124} fs={12} tone="danger">
          Cは動かず、Bが同じ速さで跳ね返る
        </T>
        <T x={16} y={177} bold>
          実際の衝突
        </T>
        <T x={16} y={197} fs={12} tone="muted">
          （1669年の規則）
        </T>
        {row(187, { b: 23, c: 23 })}
        <T x={448} y={229} fs={12} tone="acc">
          Cは動き出し、Bは遅くなって跳ね返る
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図3-2 年表 ---------- */

const ROAD = [
  { y: '1644年', who: 'デカルト', what: ['『哲学原理』', '運動の量の保存'] },
  { y: '1668〜69年', who: 'ウォリス、レン、ホイヘンス', what: ['衝突の規則を', '王立協会に送る'] },
  { y: '1686年', who: 'ライプニッツ', what: ['デカルトを批判', '（活力）'] },
  { y: '1722年', who: 'スフラーフェサンデ', what: ['粘土に球を', '落とす実験'] },
  { y: '1740年', who: 'デュ・シャトレ', what: ['『物理学教程』', '活力を擁護'] },
  { y: '1743年', who: 'ダランベール', what: ['『動力学論』', '2つの量を整理'] },
  { y: '1807年', who: 'ヤング', what: ['「エネルギー」', 'という語を提案'] },
  { y: '1853年', who: 'ランキン', what: ['「位置エネルギー」', 'という語を提案'] },
]

export function FigTimeline() {
  return (
    <Figure n="3-2" title="運動の量をめぐる議論の年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="3-2" w={720} h={232} label="1644年デカルトの『哲学原理』、1668〜69年ウォリス・レン・ホイヘンスの衝突の規則、1686年ライプニッツのデカルト批判、1722年スフラーフェサンデの粘土の実験、1740年デュ・シャトレの『物理学教程』、1743年ダランベールの『動力学論』、1807年ヤングが「エネルギー」の語を提案、1853年ランキンが「位置エネルギー」の語を提案。">
        <Arrow x1={14} y1={130} x2={710} y2={130} />
        {ROAD.map((r, i) => {
          const x = 52 + i * 86
          const up = i % 2 === 0
          const ty = up ? 28 : 158
          return (
            <g key={r.y}>
              <circle cx={x} cy={130} r={6} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 104 : 136} x2={x} y2={up ? 124 : 150} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold fs={12.5}>
                {r.y}
              </T>
              <T x={x} y={ty + 19} anchor="middle" fs={12}>
                {r.who}
              </T>
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + 38 + j * 17} anchor="middle" fs={11.5} tone="muted">
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

/* ---------- 図3-3 球の衝突と運動量（動・切り替え） ---------- */

type Partner = 'same' | 'heavy' | 'stick'
const PARTNER: Record<Partner, { mB: number; rB: number; vA: number; vB: number; label: string }> = {
  same: { mB: 1, rB: 14, vA: 0, vB: 1, label: '球B（質量1）' },
  heavy: { mB: 3, rB: 20, vA: -0.5, vB: 0.5, label: '球B（質量3）' },
  stick: { mB: 1, rB: 14, vA: 0.5, vB: 0.5, label: '球B（質量1）' },
}

/** 運動量を向きつきの言葉で書く */
const dirText = (p: number) => (Math.abs(p) < 1e-6 ? '0' : `${p > 0 ? '右向き' : '左向き'} ${String(Math.abs(p))}`)

export function FigCollision() {
  const [who, setWho] = useState<Partner>('same')
  const P = PARTNER[who]
  const V = 120 // 球Aの最初の速さ（ピクセル毎秒）
  const xA0 = 80
  const xB0 = 380
  const tc = (xB0 - P.rB - 14 - xA0) / V
  const tEnd = tc + 2.4
  const period = tEnd + 1.2
  const Y = 84
  const zero = 330
  const S = 110 // 運動量1あたりの棒の長さ
  return (
    <Anim
      n="3-3"
      title="ぶつかる前と後で、運動量の合計は変わらない"
      still={tc + 1.6}
      period={period}
      controls={
        <Choice
          label="ぶつかる相手"
          options={[
            { value: 'same', label: '同じ質量の球' },
            { value: 'heavy', label: '3倍の質量の球' },
            { value: 'stick', label: 'くっつく球' },
          ]}
          value={who}
          onChange={setWho}
        />
      }
      caption="下の段の棒は、それぞれの球の運動量です。右向きを右へ、左向きを左へ伸ばし、球Aの最初の運動量を1としています。相手を切り替えても、合計の棒の長さは変わりません。"
    >
      {(t) => {
        const tt = Math.min(t, tEnd)
        const after = tt > tc
        const u = Math.max(0, tt - tc)
        const xA = after ? xA0 + V * tc + P.vA * V * u : xA0 + V * tt
        const xB = xB0 + P.vB * V * u
        const vA = after ? P.vA : 1
        const vB = after ? P.vB : 0
        const pA = vA
        const pB = P.mB * vB
        const bar = (y: number, label: string, p: number, total?: boolean) => (
          <g>
            <T x={zero - 150} y={y} fs={12.5} anchor="end" bold={total}>
              {label}
            </T>
            {Math.abs(p) > 1e-6 && (
              <rect x={p > 0 ? zero : zero + p * S} y={y - 9} width={Math.abs(p) * S} height={18} fill={total ? 'var(--fig-box4)' : 'var(--fig-box3)'} stroke="var(--fig-line)" />
            )}
            <T x={p >= 0 ? zero + Math.max(p, 0) * S + 8 : zero + 8} y={y} fs={12}>
              {dirText(p)}
            </T>
          </g>
        )
        return (
          <Svg id="3-3" w={700} h={270} label="球Aが静止した球Bにぶつかる。同じ質量ならAが止まりBが動き出す。Bの質量が3倍ならAは跳ね返りBはゆっくり進む。くっつく場合は2つが半分の速さで一緒に進む。どの場合も運動量の合計は変わらない。">
            <line x1={20} y1={Y + 22} x2={690} y2={Y + 22} stroke="var(--fig-line)" strokeWidth={1.5} />
            {Math.abs(vA) > 0.01 && <Vel x1={xA} y1={Y - 16} x2={xA + vA * 50} y2={Y - 16} />}
            {Math.abs(vB) > 0.01 && <Vel x1={xB} y1={Y + 12 - 2 * P.rB} x2={xB + vB * 50} y2={Y + 12 - 2 * P.rB} />}
            <Ball x={xA} y={Y + 8} r={14} />
            <T x={xA} y={Y + 8} anchor="middle" fs={12}>
              A
            </T>
            <Ball x={xB} y={Y + 22 - P.rB} r={P.rB} fill="var(--fig-box2)" />
            <T x={xB} y={Y + 22 - P.rB} anchor="middle" fs={12}>
              B
            </T>
            <T x={20} y={22} fs={12} tone="muted">
              {after ? 'ぶつかった後' : 'ぶつかる前'}
            </T>
            <line x1={zero} y1={140} x2={zero} y2={262} stroke="var(--fig-muted)" />
            <T x={zero} y={130} fs={11.5} anchor="middle" tone="muted">
              運動量0
            </T>
            {bar(160, '球A（質量1）', pA)}
            {bar(198, P.label, pB)}
            {bar(242, '合計', pA + pB, true)}
            <line x1={zero - 150} y1={220} x2={600} y2={220} stroke="var(--fig-muted)" strokeDasharray="3 3" />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図3-4 ライプニッツの議論 ---------- */

export function FigLeibniz() {
  const G = 250 // 地面
  const U = 44 // 1mの高さ
  return (
    <Figure
      n="3-4"
      title="1kgを4mから、4kgを1mから落とすと、等しくなるのはライプニッツの量のほう"
      caption="ライプニッツの議論を今の単位に置きかえた模式図です。速さは4kgの球を1とした比です。"
    >
      <Svg id="3-4" w={720} h={280} label="1kgの球を高さ4mから、4kgの球を高さ1mから落とす。地面での速さは2と1。質量と速さを掛けると2と4で違うが、質量と速さと速さを掛けると4と4で同じになる。">
        <line x1={20} y1={G} x2={290} y2={G} stroke="var(--fig-line)" strokeWidth={2} />
        {/* 1kg・4m */}
        <Ball x={80} y={G - 4 * U} r={11} />
        <T x={80} y={G - 4 * U} anchor="middle" fs={11}>
          1kg
        </T>
        <Trail points={[[80, G - 4 * U + 12], [80, G - 6]]} />
        <Vel x1={100} y1={G - 60} x2={100} y2={G - 60 + 52} />
        <line x1={40} y1={G - 4 * U} x2={40} y2={G} stroke="var(--fig-muted)" />
        <T x={34} y={G - 2 * U} anchor="end" fs={12} tone="muted">
          4m
        </T>
        <T x={80} y={G + 18} anchor="middle" fs={12}>
          速さ2
        </T>
        {/* 4kg・1m */}
        <Ball x={220} y={G - U} r={17} />
        <T x={220} y={G - U} anchor="middle" fs={11}>
          4kg
        </T>
        <Vel x1={248} y1={G - 30} x2={248} y2={G - 4} />
        <line x1={176} y1={G - U} x2={176} y2={G} stroke="var(--fig-muted)" />
        <T x={170} y={G - U / 2} anchor="end" fs={12} tone="muted">
          1m
        </T>
        <T x={220} y={G + 18} anchor="middle" fs={12}>
          速さ1
        </T>
        {/* 比べる表 */}
        <Box x={310} y={20} w={210} h={44} lines="比べる量" fill="box" bold />
        <Box x={524} y={20} w={78} h={44} lines={['1kg', '高さ4m']} fill="box" fs={12} />
        <Box x={606} y={20} w={78} h={44} lines={['4kg', '高さ1m']} fill="box" fs={12} />
        <Box x={310} y={68} w={210} h={44} lines="地面での速さ（比）" fill="bg" fs={12.5} />
        <Box x={524} y={68} w={78} h={44} lines="2" fill="bg" />
        <Box x={606} y={68} w={78} h={44} lines="1" fill="bg" />
        <Box x={310} y={116} w={210} h={56} lines={['デカルトの量', '質量と速さを掛ける']} fill="bg" fs={12.5} bold subTone="muted" />
        <Box x={524} y={116} w={78} h={56} lines="2" fill="bg" />
        <Box x={606} y={116} w={78} h={56} lines="4" fill="bg" />
        <Box x={310} y={176} w={210} h={56} lines={['ライプニッツの量（活力）', '質量と速さと速さを掛ける']} fill="bg" fs={12.5} bold subTone="muted" />
        <Box x={524} y={176} w={78} h={56} lines="4" fill="box4" />
        <Box x={606} y={176} w={78} h={56} lines="4" fill="box4" />
        <Cross x={698} y={144} s={7} />
        <T x={604} y={250} anchor="middle" fs={12} tone="danger">
          デカルトの量は2つで違う
        </T>
        <T x={604} y={270} anchor="middle" fs={12} tone="acc">
          活力は2つで同じ
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図3-5 粘土の実験（動） ---------- */

/** 等速で近づき、触れた後は深さ d だけめり込んで止まる。返り値は進んだ距離 */
function hitPath(t: number, v: number, arrive: number, d: number, stop = 0.5) {
  if (t <= arrive) return v * t
  return v * arrive + d * ease((t - arrive) / stop)
}

export function FigClay() {
  const u = 40 // 速さ1にあたる画面上の速さ
  const T0 = 1.5 // 粘土に届く時刻
  return (
    <Anim
      n="3-5"
      title="運動量が同じでも、速い球のほうが深くへこませる"
      still={3}
      period={4.5}
      caption="デュ・シャトレの『物理学教程』（1740年）に書かれた、スフラーフェサンデの実験の模式図です。質量と速さの数は比で、へこみの深さは目安です。下の段では、粘土の球は左右どちらにも動きません。"
    >
      {(t) => {
        const tt = Math.min(t, 4)
        const hit = tt > T0
        // ① 固定した粘土
        const aX = 440 - 15 - u * T0 + hitPath(tt, u, T0, 8)
        const bX = 440 - 10 - 3 * u * T0 + hitPath(tt, 3 * u, T0, 24)
        // ② つるした粘土の球
        const cX = 360
        const lX = cX - 24 - 15 - u * T0 + hitPath(tt, u, T0, 14)
        const rX = cX + 24 + 10 + 3 * u * T0 - hitPath(tt, 3 * u, T0, 14)
        return (
          <Svg id="3-5" w={720} h={320} label="上の段：固定した粘土に、質量3・速さ1の球と質量1・速さ3の球を別々に当てると、速い球のへこみがずっと深い。下の段：糸でつるした粘土の球に両側から同時に当てると、粘土の球は動かず、2つの球は同じ深さで止まる。">
            <T x={20} y={18} bold fs={12.5}>
              ① 固定した粘土に、別々に当てる
            </T>
            <T x={20} y={58} fs={12}>
              質量3・速さ1
            </T>
            <T x={20} y={110} fs={12}>
              質量1・速さ3
            </T>
            <rect x={440} y={38} width={60} height={42} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={440} y={96} width={60} height={30} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <Ball x={aX} y={59} r={15} />
            <T x={aX} y={59} anchor="middle" fs={11.5}>
              3
            </T>
            <Ball x={bX} y={110} r={10} />
            <T x={bX} y={110} anchor="middle" fs={11}>
              1
            </T>
            {tt < T0 - 0.35 && <Vel x1={aX - 10} y1={34} x2={aX + 10} y2={34} />}
            {tt < T0 - 0.35 && <Vel x1={bX - 30} y1={88} x2={bX + 30} y2={88} />}
            {hit && (
              <>
                <T x={512} y={59} fs={12}>
                  へこみは浅い
                </T>
                <T x={512} y={110} fs={12} tone="acc">
                  へこみはずっと深い
                </T>
              </>
            )}
            <line x1={20} y1={146} x2={700} y2={146} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <T x={20} y={166} bold fs={12.5}>
              ② つるした粘土の球に、両側から同時に当てる
            </T>
            <line x1={cX} y1={186} x2={cX} y2={216} stroke="var(--fig-line)" />
            <line x1={cX - 30} y1={186} x2={cX + 30} y2={186} stroke="var(--fig-line)" strokeWidth={2} />
            <Ball x={cX} y={240} r={24} fill="var(--fig-box2)" />
            <T x={150} y={212} anchor="middle" fs={12}>
              質量3・速さ1
            </T>
            <T x={600} y={212} anchor="middle" fs={12}>
              質量1・速さ3
            </T>
            <Ball x={lX} y={240} r={15} />
            <T x={lX} y={240} anchor="middle" fs={11.5}>
              3
            </T>
            <Ball x={rX} y={240} r={10} />
            <T x={rX} y={240} anchor="middle" fs={11}>
              1
            </T>
            {tt < T0 - 0.35 && <Vel x1={lX - 10} y1={264} x2={lX + 10} y2={264} />}
            {tt < T0 - 0.35 && <Vel x1={rX + 30} y1={264} x2={rX - 30} y2={264} />}
            {hit && (
              <T x={cX} y={298} anchor="middle" fs={12} tone="acc">
                粘土の球は動かず、2つの球は止まる。へこみは同じ深さ
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図3-6 同じ力で止める（動） ---------- */

export function FigBrake() {
  const X0 = 160 // ブレーキの区間の始まり
  const A = 60 // 減速の大きさ（ピクセル毎秒毎秒）
  const t0 = 0.4
  const carts = [
    { y: 100, v: 120, name: '台車A（速さ1）', result: '止まるまでの時間 1、進んだ距離 1' },
    { y: 228, v: 240, name: '台車B（速さ2）', result: '止まるまでの時間 2倍、進んだ距離 4倍' },
  ]
  return (
    <Anim
      n="3-6"
      title="同じ力で止めると、速さ2倍の台車は2倍の時間と4倍の距離で止まる"
      still={5}
      period={6.2}
      caption="模式図です。ブレーキの区間では、どちらの台車にも同じ大きさの力（青の矢印）が後ろ向きにはたらきます。止まるまでの時間は運動量に、進む距離は活力に比例します。"
    >
      {(t) => (
        <Svg id="3-6" w={720} h={280} label="同じ大きさのブレーキの力で2台の台車を止める。速さ1の台車は時間1で距離1進んで止まり、速さ2の台車は時間2倍で距離4倍進んで止まる。">
          <T x={X0} y={20} fs={12} tone="muted">
            ここから先はブレーキの区間（どちらも同じ力）
          </T>
          {carts.map((c) => {
            const tau = t - t0
            const stopT = c.v / A
            const done = tau >= stopT
            const s = tau < 0 ? c.v * tau : c.v * Math.min(tau, stopT) - 0.5 * A * Math.min(tau, stopT) ** 2
            const x = X0 + s // 台車の前の端
            const vNow = tau < 0 ? c.v : Math.max(0, c.v - A * tau)
            return (
              <g key={c.name}>
                <T x={20} y={c.y - 52} fs={12.5} bold>
                  {c.name}
                </T>
                <line x1={20} y1={c.y} x2={700} y2={c.y} stroke="var(--fig-line)" strokeWidth={2} />
                <rect x={X0} y={c.y} width={540} height={6} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={0.8} />
                {[1, 2, 3, 4].map((k) => (
                  <g key={k}>
                    <line x1={X0 + k * 120} y1={c.y} x2={X0 + k * 120} y2={c.y + 12} stroke="var(--fig-muted)" />
                    <T x={X0 + k * 120} y={c.y + 22} anchor="middle" fs={11.5} tone="muted">
                      {`距離${k}`}
                    </T>
                  </g>
                ))}
                <rect x={x - 44} y={c.y - 24} width={44} height={20} rx={3} fill="var(--fig-box3)" stroke="var(--fig-line)" />
                <circle cx={x - 34} cy={c.y - 3} r={3.5} fill="var(--fig-bg)" stroke="var(--fig-line)" />
                <circle cx={x - 10} cy={c.y - 3} r={3.5} fill="var(--fig-bg)" stroke="var(--fig-line)" />
                {vNow > 1 && <Vel x1={x + 4} y1={c.y - 32} x2={x + 4 + vNow * 0.18} y2={c.y - 32} />}
                {tau > 0 && !done && <Force x1={x - 46} y1={c.y - 14} x2={x - 82} y2={c.y - 14} />}
                {done && (
                  <T x={20} y={c.y + 40} fs={12.5} tone="acc">
                    {c.result}
                  </T>
                )}
              </g>
            )
          })}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図3-7 振り子と2つのエネルギー（動・切り替え） ---------- */

type Nail = 'none' | 'high' | 'low'
const PX = 200
const PY = 34
const LEN = 180
const TH0 = (55 * Math.PI) / 180
const GRAV = 1000
const BOTTOM = PY + LEN
const RISE = LEN * (1 - Math.cos(TH0))

interface PFrame {
  x: number
  y: number
  vx: number
  vy: number
  right: boolean
}

/** 釘のある振り子の1往復を、細かい時間刻みで計算して並べる（1/120秒ごと） */
function swing(nail: Nail): { frames: PFrame[]; turn: number } {
  const d = nail === 'high' ? 70 : nail === 'low' ? 96 : 0
  const R2 = LEN - d
  let th = -TH0
  let w = 0
  const dt = 1 / 2400
  const frames: PFrame[] = []
  let turn = 0
  let wasRight = false
  for (let i = 0; i < 2400 * 6; i++) {
    const right = th > 0 && d > 0
    const R = right ? R2 : LEN
    const cx = PX
    const cy = right ? PY + d : PY
    if (i % 20 === 0) {
      const sp = w * R
      frames.push({ x: cx + R * Math.sin(th), y: cy + R * Math.cos(th), vx: sp * Math.cos(th), vy: -sp * Math.sin(th), right })
    }
    const w2 = w - (GRAV / R) * Math.sin(th) * dt
    const th2 = th + w2 * dt
    // 糸が釘にかかる・外れる瞬間は、球の速さを保ったまま回る半径を替える
    if (d > 0 && th <= 0 && th2 > 0) w = (w2 * LEN) / R2
    else if (d > 0 && th > 0 && th2 <= 0) w = (w2 * R2) / LEN
    else w = w2
    th = th2
    if (th > 0) wasRight = true
    if (wasRight && turn === 0 && w <= 0) turn = frames.length / 120
    if (wasRight && th < 0 && w >= 0) break
  }
  return { frames, turn }
}

export function FigPendulum() {
  const [nail, setNail] = useState<Nail>('high')
  const { frames, turn } = useMemo(() => swing(nail), [nail])
  const period = frames.length / 120
  const d = nail === 'high' ? 70 : nail === 'low' ? 96 : 0
  const startY = PY + LEN * Math.cos(TH0)
  const path = frames.map((f) => [f.x, f.y] as [number, number])
  const BH = 170 // 合計の棒の高さ
  const base = 248
  return (
    <Anim
      n="3-7"
      title="振り子では位置エネルギーと運動エネルギーが入れ替わり、合計は変わらない"
      still={turn}
      period={period}
      controls={
        <Choice
          label="釘"
          options={[
            { value: 'none', label: 'なし' },
            { value: 'high', label: '高い位置' },
            { value: 'low', label: '低い位置' },
          ]}
          value={nail}
          onChange={setNail}
        />
      }
      caption="空気や糸の抵抗がないとした模式図です。「釘」を切り替えると通り道が変わりますが、玉は出発点と同じ高さ（点線）まで上ります。"
    >
      {(t) => {
        const f = frames[Math.min(frames.length - 1, Math.floor((t % period) * 120))]
        const pe = (BOTTOM - f.y) / RISE
        const ke = Math.max(0, 1 - pe)
        const bars = [
          { x: 455, v: pe, label: '位置エネルギー', sub: '（高さ）', fill: 'var(--fig-box2)' },
          { x: 545, v: ke, label: '運動エネルギー', sub: '（速さ）', fill: 'var(--fig-box3)' },
          { x: 635, v: 1, label: '合計', sub: '', fill: 'var(--fig-box4)' },
        ]
        return (
          <Svg id="3-7" w={720} h={300} label="糸でつるした玉が、出発点と同じ高さまで上る。釘を打っても同じ高さまで上る。位置エネルギーが減ると運動エネルギーが増え、合計は変わらない。">
            <line x1={PX - 40} y1={PY} x2={PX + 40} y2={PY} stroke="var(--fig-line)" strokeWidth={2} />
            <line x1={20} y1={startY} x2={420} y2={startY} stroke="var(--fig-muted)" strokeDasharray="6 5" />
            <T x={362} y={startY - 12} fs={11.5} tone="muted">
              出発点の高さ
            </T>
            <Trail points={path} />
            {d > 0 && (
              <>
                <circle cx={PX} cy={PY + d} r={4} fill="var(--fig-line)" />
                <T x={PX + 8} y={PY + d - 14} fs={12}>
                  釘
                </T>
              </>
            )}
            {f.right ? (
              <polyline points={`${PX},${PY} ${PX},${PY + d} ${f.x},${f.y}`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            ) : (
              <line x1={PX} y1={PY} x2={f.x} y2={f.y} stroke="var(--fig-line)" strokeWidth={1.5} />
            )}
            {Math.hypot(f.vx, f.vy) > 20 && <Vel x1={f.x} y1={f.y} x2={f.x + f.vx * 0.12} y2={f.y + f.vy * 0.12} />}
            <Ball x={f.x} y={f.y} r={11} />
            {bars.map((b) => (
              <g key={b.label}>
                <rect x={b.x} y={base - BH} width={44} height={BH} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 3" />
                <rect x={b.x} y={base - BH * b.v} width={44} height={BH * b.v} fill={b.fill} stroke="var(--fig-line)" />
                <T x={b.x + 22} y={base + 16} anchor="middle" fs={11.5}>
                  {b.label}
                </T>
                {b.sub && (
                  <T x={b.x + 22} y={base + 34} anchor="middle" fs={11.5} tone="muted">
                    {b.sub}
                  </T>
                )}
              </g>
            ))}
            <line x1={445} y1={base} x2={700} y2={base} stroke="var(--fig-line)" />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図3-8 ひもを引くと速く回る（動） ---------- */

const R0 = 110
const R1 = 55
// 区切りの時刻：広いまま → 引く → 狭いまま → 戻す → 広いまま
const PH = [2, 1.5, 2.5, 1.5, 0.5]
const KK = (R0 - R1) / 1.5
// 1周期でちょうど4周するように最初の回る速さを決める（区間ごとの回転角の合計が、最初の回る速さの18.5倍）
const W0 = (8 * Math.PI) / 18.5

function stringState(t: number) {
  const b = [0, 2, 3.5, 6, 7.5, 8]
  const k = W0 * R0 * R0
  if (t < b[1]) return { r: R0, th: W0 * t }
  if (t < b[2]) {
    const r = R0 - KK * (t - b[1])
    return { r, th: 2 * W0 + (k * (1 / r - 1 / R0)) / KK }
  }
  if (t < b[3]) return { r: R1, th: 5 * W0 + 4 * W0 * (t - b[2]) }
  if (t < b[4]) {
    const r = R1 + KK * (t - b[3])
    return { r, th: 15 * W0 + (k * (1 / R1 - 1 / r)) / KK }
  }
  return { r: R0, th: 18 * W0 + W0 * (t - b[4]) }
}

export function FigStringBall() {
  const cx = 190
  const cy = 153
  const period = PH.reduce((a, b) => a + b, 0)
  return (
    <Anim
      n="3-8"
      title="ひもを引いて中心に近づけると、球は速く回る"
      still={4.8}
      period={period}
      caption="机の穴に通したひもで球をつなぎ、真上から見た模式図です。中心からの距離が半分になると、速さは2倍になります。"
    >
      {(t) => {
        const s = stringState(t % period)
        const bx = cx + s.r * Math.cos(s.th)
        const by = cy - s.r * Math.sin(s.th)
        const v = (W0 * R0 * R0) / s.r // 球の速さ
        const tx = -Math.sin(s.th)
        const ty = -Math.cos(s.th)
        const trail: [number, number][] = []
        for (let i = 24; i >= 0; i--) {
          const p = stringState(Math.max(0, (t % period) - i * 0.03))
          trail.push([cx + p.r * Math.cos(p.th), cy - p.r * Math.sin(p.th)])
        }
        return (
          <Svg id="3-8" w={680} h={306} label="真上から見た机の上で、穴に通したひもにつないだ球が回る。ひもを引いて中心からの距離を半分にすると、速さは2倍になる。">
            <rect x={30} y={30} width={320} height={246} rx={6} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={30} y={15} fs={11.5} tone="muted">
              真上から見た机
            </T>
            <circle cx={cx} cy={cy} r={R0} fill="none" stroke="var(--fig-muted)" strokeDasharray="2 5" />
            <circle cx={cx} cy={cy} r={R1} fill="none" stroke="var(--fig-muted)" strokeDasharray="2 5" />
            <Trail points={trail} />
            <circle cx={cx} cy={cy} r={5} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <line x1={cx} y1={cy} x2={bx} y2={by} stroke="var(--fig-line)" strokeWidth={1.5} />
            <Vel x1={bx} y1={by} x2={bx + tx * v * 0.22} y2={by + ty * v * 0.22} />
            <Ball x={bx} y={by} r={10} />
            <T x={30} y={292} fs={11.5} tone="muted">
              中心の穴からひもを下へ引く
            </T>
            <HBars
              x={400}
              y={60}
              rows={[
                { label: '中心からの距離', value: s.r / R0, note: '最初の長さを棒いっぱいにしている' },
                { label: '球の速さ', value: v / ((W0 * R0 * R0) / R1), note: '距離が半分になると、速さは2倍' },
              ]}
            />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図3-9 腕を縮めると速く回る（動） ---------- */

const ARM_OUT = 110
const ARM_IN = 30
const armAt = (t: number) => {
  if (t < 2.5) return ARM_OUT
  if (t < 3.5) return ARM_OUT + (ARM_IN - ARM_OUT) * ease(t - 2.5)
  if (t < 6.5) return ARM_IN
  if (t < 7.5) return ARM_IN + (ARM_OUT - ARM_IN) * ease(t - 6.5)
  return ARM_OUT
}
/** 回りにくさ（腕を広げたときを3とする）。体の分1と、両腕の分 */
const inertia = (a: number) => 1 + 2 * (a / ARM_OUT) ** 2
const SK_PERIOD = 8
// 回転角の表を作り、1周期の回転角が半周の整数倍になるよう回る速さをそろえる
const SK_TABLE = (() => {
  const n = SK_PERIOD * 120
  const raw = [0]
  for (let i = 1; i <= n; i++) raw.push(raw[i - 1] + 3 / inertia(armAt((i - 0.5) / 120)) / 120)
  const halfTurns = Math.round(raw[n] / Math.PI)
  return raw.map((v) => (v * halfTurns * Math.PI) / raw[n])
})()
const W_OUT = SK_TABLE[1] * 120

export function FigSkater() {
  const cx = 190
  const cy = 150
  return (
    <Anim
      n="3-9"
      title="腕を体に引き寄せると、スケーターは速く回る"
      still={5}
      period={SK_PERIOD}
      caption="真上から見た模式図です。体と腕の重さの割合は目安です。腕を広げると、また遅くなります。"
    >
      {(t) => {
        const tt = t % SK_PERIOD
        const a = armAt(tt)
        const th = SK_TABLE[Math.min(SK_TABLE.length - 1, Math.floor(tt * 120))]
        const w = (W_OUT * 3) / inertia(a)
        const wMax = (W_OUT * 3) / inertia(ARM_IN)
        const c = Math.cos(th)
        const s = Math.sin(th)
        const hand = (sign: number) => ({ x: cx + sign * a * c, y: cy - sign * a * s })
        const sh = (sign: number) => ({ x: cx + sign * 24 * c, y: cy - sign * 24 * s })
        return (
          <Svg id="3-9" w={680} h={300} label="真上から見たスケーター。腕を広げているとゆっくり回り、腕を体に引き寄せると速く回る。">
            <circle cx={cx} cy={cy} r={128} fill="var(--fig-box3)" opacity={0.35} />
            <T x={20} y={20} fs={11.5} tone="muted">
              真上から見たスケーター
            </T>
            <Arrow d={`M ${cx + 132 * Math.cos(-0.5)} ${cy - 132 * Math.sin(-0.5)} A 132 132 0 0 0 ${cx + 132 * Math.cos(0.35)} ${cy - 132 * Math.sin(0.35)}`} />
            <T x={cx + 146} y={cy - 4} fs={11.5} tone="muted">
              回る向き
            </T>
            {[-1, 1].map((sg) => {
              const h = hand(sg)
              const p = sh(sg)
              return (
                <g key={sg}>
                  <line x1={p.x} y1={p.y} x2={h.x} y2={h.y} stroke="var(--fig-line)" strokeWidth={6} strokeLinecap="round" />
                  <circle cx={h.x} cy={h.y} r={6} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
                </g>
              )
            })}
            <ellipse cx={cx} cy={cy} rx={28} ry={14} transform={`rotate(${(-th * 180) / Math.PI} ${cx} ${cy})`} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={11} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <HBars
              x={410}
              y={60}
              rows={[
                { label: '腕の広がり', value: a / ARM_OUT, note: a > 100 ? '腕を広げている' : a < 40 ? '腕を体に引き寄せている' : '腕を動かしている' },
                { label: '回る速さ', value: w / wMax, note: w / W_OUT < 1.05 ? '腕を広げたときの速さ' : `腕を広げたときの約${(w / W_OUT).toFixed(1)}倍` },
              ]}
            />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図3-10 3つの保存則 ---------- */

const CONS = [
  { head: '運動量', rows: [['向きのある', '動きの勢い'], ['外から力が', 'はたらかなければ一定'], ['球の衝突', 'ボートの2人（第1章）'], ['場所をずらしても', '法則が変わらない']] },
  { head: 'エネルギー', rows: [['物を動かしたり', '持ち上げたりする能力'], ['熱まで含めれば', '常に一定（第12章）'], ['振り子', '粘土のへこみ'], ['時刻をずらしても', '法則が変わらない']] },
  { head: '角運動量', rows: [['回転の勢い'], ['外から回転を変える', 'はたらきがなければ一定'], ['ひもでつないだ球', 'スケーター'], ['向きを回しても', '法則が変わらない']] },
]
const CONS_ROWS = [['何を表すか'], ['変わらない条件'], ['この章の例'], ['もとになる性質', '（第31章）']]

export function FigConserve() {
  const X0 = 150
  const CW = 184
  const RH = 54
  return (
    <Figure n="3-10" title="この章で扱った3つの保存則と、そのもとになる性質" caption="いちばん下の段は、ネーターの定理（1918年）が示した対応です。くわしくは第31章で説明します。">
      <Svg id="3-10" w={720} h={300} label="運動量、エネルギー、角運動量の3つの保存則。運動量は向きのある動きの勢いで、場所をずらしても法則が変わらないことに対応する。エネルギーは物を動かしたり持ち上げたりする能力で、時刻をずらしても法則が変わらないことに対応する。角運動量は回転の勢いで、向きを回しても法則が変わらないことに対応する。">
        {CONS.map((c, j) => (
          <Box key={c.head} x={X0 + j * (CW + 6)} y={10} w={CW} h={36} lines={c.head} fill="box3" bold />
        ))}
        {CONS_ROWS.map((r, i) => (
          <g key={r[0]}>
            <Box x={10} y={52 + i * (RH + 6)} w={X0 - 16} h={RH} lines={r} fill="box" fs={12.5} subTone="muted" />
            {CONS.map((c, j) => (
              <Box key={c.head} x={X0 + j * (CW + 6)} y={52 + i * (RH + 6)} w={CW} h={RH} lines={c.rows[i]} fill={i === 3 ? 'box4' : 'bg'} fs={12} />
            ))}
          </g>
        ))}
      </Svg>
    </Figure>
  )
}
