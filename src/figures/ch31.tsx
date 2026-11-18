import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { Ball, Cross, Force, Vel, clamp01, ease, rng } from './common'

/*
 * 第31章の図の決まり：
 *   Wボソン      ：緑がかった色（WCOL）の波線
 *   電子・クォーク：線の色（--fig-line）の実線、反ニュートリノは破線
 *   ファインマン図（第29章と同じ）：時間は下から上へ進む
 * 色だけで区別せず、必ず文字を添える。
 */

const WCOL = '#1f9e89'

/** 色を指定した文字（CSS の文字色の指定より優先させるため style で塗る） */
function TC({ x, y, color, fs = 12.5, anchor = 'start', bold, children }: { x: number; y: number; color: string; fs?: number; anchor?: 'start' | 'middle' | 'end'; bold?: boolean; children: string }) {
  return (
    <text x={x} y={y} fontSize={fs} textAnchor={anchor} dominantBaseline="central" fontWeight={bold ? 600 : undefined} style={{ fill: color }}>
      {children}
    </text>
  )
}

/** 2点を結ぶ波線 */
function wavy(x1: number, y1: number, x2: number, y2: number, amp = 4, wl = 12): string {
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

/* ---------- 図31-1 ずらしても同じ実験（動・切り替え） ---------- */

const SHIFT = {
  place: { left: '地点Aで行う', right: '遠く離れた地点Bで行う', law: '法則が場所によって変わらない', keep: '運動量' },
  time: { left: '今日の正午に行う', right: '1年後の正午に行う', law: '法則が時刻によって変わらない', keep: 'エネルギー' },
  turn: { left: '左右の向きで行う', right: '向きを40度回して行う', law: '法則が向きによって変わらない', keep: '角運動量' },
} as const
type ShiftKind = keyof typeof SHIFT

const P1 = 4.4

/** 球の中心から衝突点までの距離（時刻 u の関数）と、動く向き（+1 は衝突点へ向かう） */
function collideS(u: number): { s: number; dir: number } {
  const v = 62
  if (u < 1.6) return { s: 112 - v * u, dir: 1 }
  if (u < 3.2) return { s: 12.8 + v * (u - 1.6), dir: -1 }
  return { s: 112, dir: 0 }
}

function Collision({ cx, cy, angle, u }: { cx: number; cy: number; angle: number; u: number }) {
  const { s, dir } = collideS(((u % P1) + P1) % P1)
  const c = Math.cos(angle)
  const sn = Math.sin(angle)
  const ax = cx - s * c
  const ay = cy - s * sn
  const bx = cx + s * c
  const by = cy + s * sn
  const px = sn * 24 // 矢印を球の上側へずらす量
  const py = -c * 24
  const showVel = dir !== 0 && s > 40
  return (
    <g>
      <line x1={cx - 130 * c} y1={cy - 130 * sn} x2={cx + 130 * c} y2={cy + 130 * sn} stroke="var(--fig-muted)" strokeDasharray="2 5" />
      <Ball x={ax} y={ay} r={12} />
      <Ball x={bx} y={by} r={12} fill="var(--fig-box2)" />
      {showVel && (
        <>
          <Vel x1={ax + px - 14 * c * dir} y1={ay + py - 14 * sn * dir} x2={ax + px + 18 * c * dir} y2={ay + py + 18 * sn * dir} />
          <Vel x1={bx + px + 14 * c * dir} y1={by + py + 14 * sn * dir} x2={bx + px - 18 * c * dir} y2={by + py - 18 * sn * dir} />
        </>
      )}
    </g>
  )
}

export function FigShift() {
  const [kind, setKind] = useState<ShiftKind>('time')
  const k = SHIFT[kind]
  return (
    <Anim
      n="31-1"
      title="同じ実験を場所・時刻・向きをずらして行っても、結果は変わらない"
      still={0.9}
      period={P1}
      controls={
        <Choice
          label="ずらし方"
          options={[
            { value: 'place', label: '場所' },
            { value: 'time', label: '時刻' },
            { value: 'turn', label: '向き' },
          ]}
          value={kind}
          onChange={setKind}
        />
      }
      caption="何もない空間で2つの球を正面からぶつける模式図です。「ずらし方」を切り替えると、右の実験の場所・時刻・向きが変わります。「時刻」では右の実験が少し遅れて始まりますが、ぶつかり方とはね返り方は左と同じです。下の段は、その対称性に対応してネーターの定理が導く保存量です。"
    >
      {(t) => (
        <Svg id="31-1" w={720} h={330} label="左右2つの枠で、2つの球が正面からぶつかってはね返る。右の枠では、場所、時刻、向きのどれかをずらしているが、ぶつかり方は左と同じ。場所によらないことは運動量の保存に、時刻によらないことはエネルギーの保存に、向きによらないことは角運動量の保存に対応する。">
          <rect x={10} y={10} width={340} height={220} rx={8} fill="none" stroke="var(--fig-line)" />
          <rect x={370} y={10} width={340} height={220} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray={kind === 'place' ? '6 4' : undefined} />
          <T x={180} y={32} anchor="middle" bold>
            もとの実験
          </T>
          <T x={180} y={52} anchor="middle" fs={12} tone="muted">
            {k.left}
          </T>
          <T x={540} y={32} anchor="middle" bold>
            ずらした実験
          </T>
          <T x={540} y={52} anchor="middle" fs={12} tone="muted">
            {k.right}
          </T>
          <Collision cx={180} cy={140} angle={0} u={t} />
          <Collision cx={540} cy={kind === 'place' ? 160 : 140} angle={kind === 'turn' ? (-40 * Math.PI) / 180 : 0} u={kind === 'time' ? t - 1.1 : t} />
          <Box x={110} y={250} w={250} h={60} lines={['対称性', k.law]} fill="box" fs={12.5} bold />
          <Arrow x1={366} y1={280} x2={402} y2={280} />
          <Box x={410} y={250} w={200} h={60} lines={['保存される量', k.keep]} fill="box4" fs={12.5} bold />
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図31-2 重力の強さが時刻で変わる世界（動） ---------- */

const P2 = 7.5

function Sky({ x, y, night }: { x: number; y: number; night: boolean }) {
  if (night)
    return (
      <g>
        <circle cx={x} cy={y} r={13} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <circle cx={x + 7} cy={y - 5} r={11} fill="var(--fig-bg)" />
      </g>
    )
  return (
    <g stroke="var(--fig-line)">
      <circle cx={x} cy={y} r={10} fill="var(--fig-box2)" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return <line key={i} x1={x + 13 * Math.cos(a)} y1={y + 13 * Math.sin(a)} x2={x + 19 * Math.cos(a)} y2={y + 19 * Math.sin(a)} />
      })}
    </g>
  )
}

function LiftPanel({ x0, tt, changing }: { x0: number; tt: number; changing: boolean }) {
  const night = tt < 3
  const low = 212
  const high = 96
  let wy = low
  if (tt >= 0.5 && tt < 2.5) wy = low + (high - low) * ease((tt - 0.5) / 2)
  else if (tt >= 2.5 && tt < 3.2) wy = high
  else if (tt >= 3.2 && tt < 4.4) wy = high + (low - high) * ((tt - 3.2) / 1.2) ** 2
  const g = changing ? (night ? 12 : 28) : 20
  const costMax = changing ? 50 : 100
  const gainMax = changing ? 140 : 100
  const cost = costMax * clamp01((tt - 0.5) / 2)
  const gain = gainMax * clamp01((tt - 3.2) / 1.2)
  const wx = x0 + 52
  const bx = x0 + 150
  return (
    <g>
      <line x1={wx + 15} y1={70} x2={wx + 15} y2={wy} stroke="var(--fig-line)" />
      <circle cx={wx + 15} cy={66} r={7} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <rect x={wx} y={wy} width={30} height={30} rx={3} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <Force x1={wx - 12} y1={wy + 2} x2={wx - 12} y2={wy + 2 + g} />
      <line x1={x0 + 10} y1={243} x2={x0 + 340} y2={243} stroke="var(--fig-line)" strokeWidth={2} />
      <Sky x={x0 + 140} y={80} night={night} />
      <T x={x0 + 166} y={80} fs={12.5}>
        {night ? (changing ? '夜：重力が弱い' : '夜：重力は昼と同じ') : changing ? '昼：重力が強い' : '昼：重力は夜と同じ'}
      </T>
      <T x={bx} y={120} fs={12}>
        持ち上げに使ったエネルギー
      </T>
      <rect x={bx} y={131} width={Math.max(cost, 0.5)} height={12} fill="var(--fig-box3)" stroke="var(--fig-line)" />
      <T x={bx} y={166} fs={12}>
        落として取り出したエネルギー
      </T>
      <rect x={bx} y={177} width={Math.max(gain, 0.5)} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      {tt > 4.5 && (
        <T x={bx} y={214} fs={12.5} tone={changing ? 'danger' : undefined} bold>
          {changing ? '差し引き：増える' : '差し引き：増えも減りもしない'}
        </T>
      )}
    </g>
  )
}

export function FigGravityDay() {
  return (
    <Anim
      n="31-2"
      title="法則が時刻によって変われば、エネルギーを増やせてしまう（思考実験）"
      still={5.5}
      period={P2}
      caption="思考実験の模式図です。青の矢印はおもりにはたらく重力です。左は、夜は重力が弱く昼は強いと仮定した世界で、夜に持ち上げて昼に落とすたびにエネルギーが増えます。実際の世界（右）では重力の強さが時刻によらないので、使ったエネルギーと取り出せるエネルギーが等しくなります。"
    >
      {(t) => (
        <Svg id="31-2" w={720} h={300} label="左：夜は重力が弱く昼は強いと仮定した世界で、夜におもりを持ち上げ、昼に落とすと、取り出したエネルギーが持ち上げに使ったエネルギーより多くなる。この世界は実際にはない。右：実際の世界では重力は昼も夜も同じで、2つのエネルギーは等しい。">
          <T x={180} y={22} anchor="middle" bold>
            重力が時刻で変わると仮定した世界
          </T>
          <Cross x={30} y={22} s={7} />
          <T x={180} y={42} anchor="middle" fs={12} tone="danger">
            実際には起こらない
          </T>
          <T x={540} y={22} anchor="middle" bold>
            実際の世界
          </T>
          <T x={540} y={42} anchor="middle" fs={12} tone="muted">
            重力は昼も夜も同じ
          </T>
          <line x1={360} y1={10} x2={360} y2={290} stroke="var(--fig-muted)" strokeDasharray="4 4" />
          <LiftPanel x0={10} tt={t % P2} changing />
          <LiftPanel x0={370} tt={t % P2} changing={false} />
          <T x={20} y={272} fs={12} tone="muted">
            夜に持ち上げ、昼に落とす（くり返す）
          </T>
          <T x={380} y={272} fs={12} tone="muted">
            夜に持ち上げ、昼に落とす（くり返す）
          </T>
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図31-3 鏡に映すと回る向きが逆になる ---------- */

/** 回りながら上へ進むこま。鏡の像は transform で左右を反転して描く */
function SpinningTop() {
  return (
    <g>
      <path d="M200,186 L176,152 Q200,136 224,152 Z" fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <line x1={200} y1={136} x2={200} y2={124} stroke="var(--fig-line)" strokeWidth={2} />
      <path d="M150,160 A50,13 0 0 0 250,160" fill="none" stroke="var(--fig-line)" strokeWidth={1.8} markerEnd="url(#ar-31-3)" />
      <path d="M250,160 A50,13 0 0 0 150,160" fill="none" stroke="var(--fig-muted)" strokeWidth={1.2} strokeDasharray="3 3" />
      <Vel x1={200} y1={118} x2={200} y2={66} />
    </g>
  )
}

export function FigMirror() {
  return (
    <Figure
      n="31-3"
      title="鏡に映すと、回る向きは逆になるが、上へ進む向きは変わらない"
      caption="模式図です。こまの横に、こまの進む向きと平行に鏡を立てています。鏡の像では左右が入れ替わるので、上から見た回る向きが逆になります。上へ進む向き（黒の矢印）は鏡に映しても上のままです。"
    >
      <Svg id="31-3" w={720} h={250} label="左に、上から見て左回りに回りながら上へ進むこま。中央に鏡。右の鏡の像では、こまは上から見て右回りに回り、進む向きは上のまま。">
        <T x={200} y={22} anchor="middle" bold>
          実際のこま
        </T>
        <T x={520} y={22} anchor="middle" bold>
          鏡に映った像
        </T>
        <rect x={354} y={40} width={12} height={180} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={360} y={234} anchor="middle" fs={12.5}>
          鏡
        </T>
        <SpinningTop />
        <g transform="translate(720,0) scale(-1,1)">
          <SpinningTop />
        </g>
        <T x={214} y={88} fs={12}>
          進む向き：上
        </T>
        <T x={534} y={88} fs={12}>
          進む向き：上
        </T>
        <T x={200} y={206} anchor="middle" fs={12.5}>
          上から見て左回り
        </T>
        <T x={520} y={206} anchor="middle" fs={12.5}>
          上から見て右回り
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図31-4 ウーの実験（動・切り替え） ---------- */

const P4 = 6
const ELEC = (() => {
  const r = rng(3157)
  return Array.from({ length: 56 }, () => ({
    t0: r() * (P4 - 1.3),
    down: r() < 0.7,
    ang: (r() - 0.5) * 1.0,
    x0: (r() - 0.5) * 40,
  }))
})()

export function FigWu() {
  const [world, setWorld] = useState<'real' | 'mirror'>('real')
  const mirror = world === 'mirror'
  const cx = 210
  const cy = 170
  return (
    <Anim
      n="31-4"
      title="ウーの実験：電子は原子核のN極と反対の向きに多く飛び出した"
      still={5.4}
      period={P4}
      controls={
        <Choice
          label="見る世界"
          options={[
            { value: 'real', label: '実際の実験' },
            { value: 'mirror', label: '鏡に映した世界' },
          ]}
          value={world}
          onChange={setWorld}
        />
      }
      caption="模式図で、偏りの大きさは実際の値ではありません。コイルの電流がつくる磁場でコバルト60の原子核のN極をそろえ、飛び出す電子を上と下で数えます。「鏡に映した世界」を選ぶと、電流の向きが逆になってN極が下を向きますが、電子の飛ぶ向きは下のままです。電子がN極の側に多く飛ぶことになり、実際の結果と合いません。"
    >
      {(t) => {
        const tt = t % P4
        let up = 0
        let down = 0
        const dots = ELEC.map((e, i) => {
          const a = tt - e.t0
          if (a < 0) return null
          if (e.down) down++
          else up++
          if (a > 1.2) return null
          const dist = 20 + a * 100
          const sy = e.down ? 1 : -1
          return <circle key={i} cx={cx + e.x0 + dist * Math.sin(e.ang)} cy={cy + sy * dist * Math.cos(e.ang)} r={3} fill="var(--fig-line)" />
        })
        const nUp = mirror ? -1 : 1
        const arrowFront = mirror ? -1 : 1
        return (
          <Svg id="31-4" w={720} h={340} label="コイルの中のコバルト60の原子核のN極がそろえられ、電子が上下に飛び出す。実際の実験では電子はN極と反対の下向きに多く飛ぶ。鏡に映した世界ではN極が下を向くが電子は下に多く飛び、N極の側に多く飛ぶことになるので、実際には起こらない。">
            <T x={cx} y={20} anchor="middle" fs={12} tone="muted">
              上
            </T>
            <T x={cx} y={326} anchor="middle" fs={12} tone="muted">
              下
            </T>
            {/* コイル（奥側は点線） */}
            <path d={`M${cx - 95},${cy} A95,20 0 0 1 ${cx + 95},${cy}`} fill="none" stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="4 4" />
            {dots}
            <rect x={cx - 34} y={cy - 7} width={68} height={14} rx={2} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            {[-22, 0, 22].map((dx) => (
              <g key={dx}>
                <Arrow x1={cx + dx} y1={cy + nUp * 2} x2={cx + dx} y2={cy - nUp * 26} accent={false} />
              </g>
            ))}
            <path d={`M${cx - 95},${cy} A95,20 0 0 0 ${cx + 95},${cy}`} fill="none" stroke="var(--fig-line)" strokeWidth={3} />
            <Arrow x1={cx - 60 - 10 * arrowFront} y1={cy + 16.3 - 1.6 * arrowFront} x2={cx - 60 + 10 * arrowFront} y2={cy + 16.3 + 1.6 * arrowFront} />
            <T x={cx + 102} y={cy + 6} fs={12}>
              コイル
            </T>
            <T x={cx + 102} y={cy + 24} fs={12} tone="muted">
              {mirror ? '電流の向きが逆' : '電流の向き'}
            </T>
            <T x={16} y={cy - 50} fs={12}>
              {mirror ? 'N極は下向き' : 'N極は上向き'}
            </T>
            <T x={16} y={cy - 26} fs={12} tone="muted">
              コバルト60
            </T>
            <line x1={84} y1={cy - 26} x2={cx - 36} y2={cy - 3} stroke="var(--fig-muted)" />
            {/* 数えた電子 */}
            <T x={430} y={60} bold>
              飛び出した電子の数
            </T>
            <T x={430} y={92} fs={12.5}>
              上へ
            </T>
            <rect x={480} y={84} width={Math.max(0.5, up * 4.5)} height={16} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={486 + up * 4.5} y={92} fs={12}>
              {String(up)}
            </T>
            <T x={430} y={124} fs={12.5}>
              下へ
            </T>
            <rect x={480} y={116} width={Math.max(0.5, down * 4.5)} height={16} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={486 + down * 4.5} y={124} fs={12}>
              {String(down)}
            </T>
            {mirror ? (
              <>
                <Cross x={440} y={196} s={8} />
                <T x={460} y={190} fs={12.5} tone="danger">
                  電子がN極の側に多く飛ぶ
                </T>
                <T x={460} y={212} fs={12.5} tone="danger">
                  実際の実験とは逆で、起こらない
                </T>
              </>
            ) : (
              <>
                <T x={430} y={190} fs={12.5}>
                  電子はN極と反対の向き
                </T>
                <T x={430} y={212} fs={12.5}>
                  （下）に多く飛ぶ
                </T>
              </>
            )}
            <T x={430} y={262} fs={12} tone="muted">
              鏡に映すと、電流と原子核の回る向きは
            </T>
            <T x={430} y={282} fs={12} tone="muted">
              逆になるが、電子の飛ぶ上下の向きは
            </T>
            <T x={430} y={302} fs={12} tone="muted">
              変わらない
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図31-5 山の頂上のボールが谷のどこかに転がる（動・切り替え） ---------- */

const P5 = 4.5
const SX = 200 // 断面図の中心
const SY = 236 // 断面図の谷の底の高さ
const TX = 560 // 上から見た図の中心
const TY = 168
/** 整数 seed から 0 以上 1 未満の値を作る（隣り合う seed で値が似ないように混ぜる） */
function pick(seed: number): number {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
const angleOf = (k: number) => 2 * Math.PI * pick(9000 + ((k % 997) + 997) * 13)

export function FigHat() {
  const [shape, setShape] = useState<'hat' | 'bowl'>('hat')
  const hat = shape === 'hat'
  /** 断面の高さ（u は中心からの距離、谷の位置が 1） */
  const height = (u: number) => (hat ? 46 * (u * u - 1) ** 2 : 32 * u * u)
  const curve = Array.from({ length: 61 }, (_, i) => {
    const u = -1.5 + (3 * i) / 60
    return `${i ? 'L' : 'M'}${(SX + u * 100).toFixed(1)},${(SY - height(u)).toFixed(1)}`
  }).join(' ')
  return (
    <Anim
      n="31-5"
      title="中央が盛り上がった面では、頂上のボールが谷のどこか1か所に転がり落ちる"
      still={3.6}
      controls={
        <Choice
          label="面の形"
          options={[
            { value: 'hat', label: '中央が盛り上がった形' },
            { value: 'bowl', label: 'おわん形' },
          ]}
          value={shape}
          onChange={setShape}
        />
      }
      caption="模式図です。面の形はどの向きにも同じ（対称）です。中央が盛り上がった形では、頂上のボールはわずかな揺れで谷へ転がり、止まる場所は毎回違います（右の図の白い丸は前回までに止まった場所）。「おわん形」に切り替えると、最も低い所が中央の1点になり、ボールは中央にとどまります。"
    >
      {(t) => {
        const cyc = Math.floor(t / P5)
        const u = t - cyc * P5
        const th = angleOf(cyc)
        let r = 0
        if (hat) {
          if (u < 1) r = 0.015 * Math.sin(u * 25)
          else if (u < 2.4) r = ease((u - 1) / 1.4)
          else r = 1 + 0.1 * Math.exp(-(u - 2.4) * 2.5) * Math.sin((u - 2.4) * 9)
        } else r = 0.04 * Math.sin(u * 6) * Math.exp(-u * 0.6)
        const bx = SX + r * 100
        const by = SY - height(r) - 11
        const ghosts = hat ? Array.from({ length: 6 }, (_, i) => angleOf(cyc - 1 - i)) : []
        return (
          <Svg id="31-5" w={720} h={300} label="左は面の断面、右は上から見た図。中央が盛り上がった面では、頂上のボールが輪の形の谷のどこかに転がり落ち、止まる場所は毎回違う。おわん形の面では、ボールは中央にとどまる。">
            <T x={SX} y={22} anchor="middle" bold>
              横から見た断面
            </T>
            <T x={SX} y={42} anchor="middle" fs={12} tone="muted">
              {hat ? 'ボールが転がった向きに沿って切った面' : '中央がいちばん低い'}
            </T>
            <path d={`${curve} L${SX + 150},${SY + 30} L${SX - 150},${SY + 30} Z`} fill="var(--fig-box)" stroke="none" />
            <path d={curve} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
            <Ball x={bx} y={by} r={11} />
            {hat && (
              <>
                <T x={SX - 100} y={SY + 18} anchor="middle" fs={12} tone="muted">
                  谷
                </T>
                <T x={SX + 100} y={SY + 18} anchor="middle" fs={12} tone="muted">
                  谷
                </T>
                <T x={SX - 48} y={SY - 60} anchor="end" fs={12} tone="muted">
                  頂上
                </T>
              </>
            )}
            <line x1={380} y1={14} x2={380} y2={290} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <T x={TX} y={22} anchor="middle" bold>
              上から見た図
            </T>
            <circle cx={TX} cy={TY} r={120} fill="var(--fig-box)" stroke="var(--fig-line)" />
            {hat ? (
              <>
                <circle cx={TX} cy={TY} r={80} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
                <circle cx={TX} cy={TY} r={4} fill="var(--fig-line)" />
                <T x={TX + 14} y={TY - 20} fs={12} tone="muted">
                  頂上
                </T>
                <T x={TX} y={TY + 98} anchor="middle" fs={12} tone="muted">
                  輪の形の谷
                </T>
                {ghosts.map((a, i) => (
                  <circle key={i} cx={TX + 80 * Math.cos(a)} cy={TY + 80 * Math.sin(a)} r={7} fill="var(--fig-bg)" stroke="var(--fig-line)" />
                ))}
              </>
            ) : (
              <T x={TX} y={TY + 40} anchor="middle" fs={12} tone="muted">
                中央にとどまる
              </T>
            )}
            <Ball x={TX + Math.max(r, 0) * 80 * Math.cos(th)} y={TY + Math.max(r, 0) * 80 * Math.sin(th)} r={10} />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図31-6 原子の小さな磁石の向きがそろう（動） ---------- */

const P6 = 6
const COLS = 11
const ROWS = 4
const START = (() => {
  const r = rng(616)
  return Array.from({ length: COLS * ROWS }, () => r() * 2 * Math.PI)
})()
const targetOf = (k: number) => 2 * Math.PI * pick(4400 + ((k % 991) + 991) * 7)

/** 小さな棒磁石。黒く塗った側がN極 */
function Magnet({ x, y, a }: { x: number; y: number; a: number }) {
  const deg = (a * 180) / Math.PI
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${deg.toFixed(1)})`}>
      <rect x={-13} y={-4} width={13} height={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <rect x={0} y={-4} width={13} height={8} fill="var(--fig-line)" stroke="var(--fig-line)" />
    </g>
  )
}

export function FigMagnet() {
  return (
    <Anim
      n="31-6"
      title="原子の小さな磁石は、エネルギーが最も低い状態では1つの向きにそろう"
      still={4.6}
      caption="模式図です。1つ1つの棒は原子の小さな磁石で、黒く塗った側がN極です。磁石の向きを決める法則はどの向きも区別しませんが、エネルギーが最も低い状態では向きが1つにそろいます。どの向きにそろうかは毎回違います。"
    >
      {(t) => {
        const cyc = Math.floor(t / P6)
        const u = t - cyc * P6
        const tgt = targetOf(cyc)
        const f = ease((u - 1.2) / 2)
        const stage = u < 1.2 ? '向きがばらばら' : u < 3.2 ? '向きがそろっていく' : '1つの向きにそろった'
        return (
          <Svg id="31-6" w={720} h={250} label="11列4行に並んだ原子の小さな磁石。はじめは向きがばらばらで、やがて全部が同じ向きにそろう。そろう向きは毎回違う。">
            <T x={20} y={22} bold>
              {stage}
            </T>
            {START.map((a0, i) => {
              const wig = u < 1.2 ? 0.5 * Math.sin(u * 7 + i) : 0
              let d = tgt - a0
              d = Math.atan2(Math.sin(d), Math.cos(d))
              const a = a0 + wig * (1 - f) + d * f
              return <Magnet key={i} x={45 + (i % COLS) * 44} y={70 + Math.floor(i / COLS) * 46} a={a} />
            })}
            <line x1={520} y1={14} x2={520} y2={236} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <T x={620} y={36} anchor="middle" fs={12.5}>
              今回そろった向き
            </T>
            <circle cx={620} cy={130} r={56} fill="none" stroke="var(--fig-muted)" />
            {u >= 3.2 ? (
              <Magnet x={620} y={130} a={tgt} />
            ) : (
              <T x={620} y={130} anchor="middle" fs={12} tone="muted">
                まだ決まらない
              </T>
            )}
            <T x={620} y={214} anchor="middle" fs={12} tone="muted">
              毎回違う向きにそろう
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図31-9 力の統一の流れ ---------- */

export function FigUnify() {
  return (
    <Figure
      n="31-9"
      title="別々に見えた力は、電磁気力、電弱理論、標準模型へとまとめられてきた"
      caption="実線の矢印は理論にまとめられ実験で確かめられた統一、点線の矢印はまだ完成していない統一です。年は理論が出された年です。"
    >
      <Svg id="31-9" w={720} h={320} label="電気の力と磁気の力は1860年代にマクスウェルが電磁気力にまとめた。電磁気力と弱い力は1961年から1968年の電弱理論にまとめられ、WとZは1983年に見つかった。電弱理論と強い力の理論（量子色力学、1973年）を合わせたものが1970年代前半の標準模型。重力を含めた統一は候補の段階。">
        <Box x={10} y={14} w={150} h={34} lines="電気の力" fill="box" />
        <Box x={10} y={62} w={150} h={34} lines="磁気の力" fill="box" />
        <Box x={10} y={128} w={150} h={34} lines="弱い力" fill="box" />
        <Box x={10} y={186} w={150} h={46} lines={['強い力', '量子色力学（1973年）']} fill="box" fs={12.5} subTone="muted" />
        <Box x={10} y={254} w={150} h={46} lines={['重力', '一般相対性理論（1915年）']} fill="box" fs={12.5} subTone="muted" />
        <Box x={195} y={32} w={145} h={46} lines={['電磁気力', '1860年代 マクスウェル']} fill="box3" fs={12.5} subTone="muted" />
        <Arrow x1={160} y1={31} x2={193} y2={48} />
        <Arrow x1={160} y1={79} x2={193} y2={62} />
        <Box x={380} y={70} w={155} h={62} lines={['電弱理論', '1961〜1968年', 'WとZの発見 1983年']} fill="box3" fs={12.5} subTone="muted" />
        <Arrow x1={340} y1={55} x2={378} y2={88} />
        <Arrow x1={160} y1={145} x2={378} y2={118} />
        <Box x={575} y={130} w={135} h={46} lines={['標準模型', '1970年代前半']} fill="box4" fs={12.5} subTone="muted" bold />
        <Arrow x1={535} y1={110} x2={573} y2={145} />
        <Arrow x1={160} y1={209} x2={573} y2={162} />
        <Box x={575} y={240} w={135} h={50} lines={['すべての力の統一', '候補の段階']} fill="bg" fs={12.5} subTone="muted" dashed />
        <Arrow x1={642} y1={176} x2={642} y2={238} dashed />
        <Arrow x1={160} y1={277} x2={573} y2={268} dashed />
      </Svg>
    </Figure>
  )
}

/* ---------- 図31-7 β崩壊で W ボソンが一瞬現れる（動） ---------- */

const P8 = 7
const V1 = { x: 200, y: 196 }
const V2 = { x: 300, y: 142 }

export function FigBeta() {
  return (
    <Anim
      n="31-7"
      title="β線を出す崩壊では、Wボソンが一瞬だけ現れて電子と反ニュートリノに変わる"
      still={6}
      period={P8}
      caption="第29章のファインマン図と同じく、下から上へ時間が進みます。点線の横線が今の時刻で、その下が起きたことです。中性子の中のダウンクォークの1つがアップクォークに変わると、中性子は陽子になります。そのとき現れたWボソンは、すぐに電子（β線）と反ニュートリノに変わります。"
    >
      {(t) => {
        const tt = t % P8
        const prog = clamp01(tt / 4.5)
        const yNow = 306 - prog * 280
        const step = yNow > V1.y ? 0 : yNow > V2.y ? 1 : yNow > 60 ? 2 : 3
        const level = [0, 2, 3, 4][step] // 右の説明のどこまで進んだか
        const clip = 'clip-31-7'
        const steps = ['ダウンクォークの1つが', 'アップクォークに変わる', 'Wボソンが一瞬だけ現れる', 'Wボソンが電子と', '反ニュートリノに変わる', '中性子が陽子になり、', 'β線（電子）が出る']
        const stepOf = [1, 1, 2, 3, 3, 4, 4]
        return (
          <Svg id="31-7" w={720} h={340} label="下から上へ時間が進む図。中性子をつくる3つのクォーク（アップ、ダウン、ダウン）のうちダウンの1つがアップに変わり、そこから出たWボソンが電子と反ニュートリノに変わる。上には陽子（アップ、ダウン、アップ）が残る。">
            <defs>
              <clipPath id={clip}>
                <rect x={0} y={yNow} width={440} height={340} />
              </clipPath>
            </defs>
            <Arrow x1={18} y1={318} x2={18} y2={70} />
            <T x={10} y={56} fs={12}>
              時間
            </T>
            <rect x={56} y={292} width={168} height={28} rx={6} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={140} y={306} anchor="middle" fs={12.5} bold>
              中性子
            </T>
            {[
              [80, 'アップ'],
              [140, 'ダウン'],
              [200, 'ダウン'],
            ].map(([x, s]) => (
              <T key={String(x)} x={Number(x)} y={278} anchor="middle" fs={12}>
                {String(s)}
              </T>
            ))}
            <g clipPath={`url(#${clip})`}>
              <line x1={80} y1={266} x2={80} y2={70} stroke="var(--fig-line)" strokeWidth={2} />
              <line x1={140} y1={266} x2={140} y2={70} stroke="var(--fig-line)" strokeWidth={2} />
              <line x1={200} y1={266} x2={200} y2={70} stroke="var(--fig-line)" strokeWidth={2} />
              <path d={wavy(V1.x, V1.y, V2.x, V2.y, 4, 11)} fill="none" stroke={WCOL} strokeWidth={2.2} />
              <line x1={V2.x} y1={V2.y} x2={350} y2={50} stroke="var(--fig-line)" strokeWidth={2} />
              <line x1={V2.x} y1={V2.y} x2={400} y2={112} stroke="var(--fig-line)" strokeWidth={2} strokeDasharray="6 4" />
              <circle cx={V1.x} cy={V1.y} r={4} fill="var(--fig-line)" />
              <circle cx={V2.x} cy={V2.y} r={4} fill="var(--fig-line)" />
              <TC x={262} y={186} color={WCOL} fs={12.5} bold>
                Wボソン
              </TC>
              <T x={210} y={210} fs={12}>
                ダウンがアップに変わる
              </T>
              <T x={356} y={40} fs={12.5}>
                電子
              </T>
              <T x={330} y={152} fs={12.5}>
                反ニュートリノ
              </T>
            </g>
            {step >= 3 && (
              <>
                <rect x={56} y={22} width={168} height={28} rx={6} fill="var(--fig-box4)" stroke="var(--fig-line)" />
                <T x={140} y={36} anchor="middle" fs={12.5} bold>
                  陽子
                </T>
                {[
                  [80, 'アップ'],
                  [140, 'ダウン'],
                  [200, 'アップ'],
                ].map(([x, s]) => (
                  <T key={String(x)} x={Number(x)} y={62} anchor="middle" fs={12}>
                    {String(s)}
                  </T>
                ))}
              </>
            )}
            {step < 3 && <line x1={30} y1={yNow} x2={430} y2={yNow} stroke="var(--fig-muted)" strokeDasharray="3 4" />}
            <line x1={460} y1={14} x2={460} y2={326} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            {steps.map((s, i) => (
              <T key={i} x={478} y={70 + i * 30 + (stepOf[i] - 1) * 14} fs={12.5} tone={stepOf[i] > level ? 'muted' : undefined} bold={stepOf[i] === level}>
                {s}
              </T>
            ))}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図31-8 クォークとレプトンの予言と発見 ---------- */

const yx = (y: number) => 40 + (y - 1960) * 14.4

const THEORY = [
  { year: 1964, x: 12, y: 92, w: 166, lines: ['1964年 クォーク模型', 'アップ・ダウン・ストレンジ'] },
  { year: 1970, x: 150, y: 22, w: 170, lines: ['1970年', '4番目（チャーム）の予想'] },
  { year: 1972, x: 205, y: 92, w: 218, lines: ['1972〜1973年 小林・益川理論', '6種類（3世代）を予言'] },
]
const EXPS = [
  { year: 1974, x: 130, y: 196, w: 132, lines: ['1974年', 'チャーム'] },
  { year: 1976, x: 200, y: 246, w: 140, lines: ['1975〜1977年', 'タウ（レプトン）'] },
  { year: 1977, x: 278, y: 196, w: 100, lines: ['1977年', 'ボトム'] },
  { year: 1989, x: 390, y: 196, w: 140, lines: ['1989年 CERN', 'ニュートリノは3種類'] },
  { year: 1995, x: 480, y: 246, w: 130, lines: ['1995年', 'トップ'] },
  { year: 2001, x: 560, y: 196, w: 150, lines: ['2001年 Belle・BaBar', 'CPの破れを確認'] },
]

export function FigQuarks() {
  return (
    <Figure
      n="31-8"
      title="小林・益川理論の予言のあと、3世代目までのクォークとレプトンが見つかった"
      caption="軸の上は理論の予言、下は実験の発見と確認です。箱の左右の位置は読みやすさのためにずらしてあり、年は細い線が軸と交わる位置で示しています。"
    >
      <Svg id="31-8" w={720} h={300} label="1964年のクォーク模型（アップ、ダウン、ストレンジ）、1970年のチャームの予想、1972〜1973年の小林・益川理論（6種類を予言）。そのあと、1974年にチャーム、1975〜1977年にタウ、1977年にボトムが見つかり、1989年にニュートリノが3種類と確かめられ、1995年にトップが見つかり、2001年にBelleとBaBarがCPの破れを確かめた。">
        <Arrow x1={30} y1={168} x2={706} y2={168} />
        {[1960, 1970, 1980, 1990, 2000].map((y) => (
          <g key={y}>
            <line x1={yx(y)} y1={163} x2={yx(y)} y2={173} stroke="var(--fig-line)" />
            {/* 1990年と2000年は、すぐ横を通る発見の線と重ならないよう左右にずらす */}
            <T x={yx(y) + (y === 1990 ? 4 : y === 2000 ? -4 : 0)} y={182} anchor={y === 1990 ? 'start' : y === 2000 ? 'end' : 'middle'} fs={11.5} tone="muted">
              {`${y}年`}
            </T>
          </g>
        ))}
        {THEORY.map((e) => (
          <g key={e.year}>
            <line x1={yx(e.year)} y1={e.y + 44} x2={yx(e.year)} y2={168} stroke="var(--fig-muted)" />
            <circle cx={yx(e.year)} cy={168} r={3.5} fill="var(--fig-line)" />
            <Box x={e.x} y={e.y} w={e.w} h={44} lines={e.lines} fill="box2" fs={12} />
          </g>
        ))}
        {EXPS.map((e) => (
          <g key={e.year}>
            <line x1={yx(e.year)} y1={168} x2={yx(e.year)} y2={e.y} stroke="var(--fig-muted)" />
            <circle cx={yx(e.year)} cy={168} r={3.5} fill="var(--fig-line)" />
            <Box x={e.x} y={e.y} w={e.w} h={44} lines={e.lines} fill="box4" fs={12} />
          </g>
        ))}
        <T x={712} y={146} anchor="end" fs={12} tone="muted">
          上：理論
        </T>
        <T x={712} y={290} anchor="end" fs={12} tone="muted">
          下：実験
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図31-10 標準模型の粒子 ---------- */

const GEN = ['第1世代', '第2世代', '第3世代']
const MATTER: { fill: 'box3' | 'box4'; cells: (string | string[])[] }[] = [
  { fill: 'box3', cells: ['アップ', 'チャーム', 'トップ'] },
  { fill: 'box3', cells: ['ダウン', 'ストレンジ', 'ボトム'] },
  { fill: 'box4', cells: ['電子', 'ミューオン', 'タウ'] },
  { fill: 'box4', cells: [['電子', 'ニュートリノ'], ['ミュー', 'ニュートリノ'], ['タウ', 'ニュートリノ']] },
]

export function FigStandardModel() {
  const rowY = [64, 120, 188, 244]
  return (
    <Figure
      n="31-10"
      title="標準模型の粒子：物質をつくる粒子、力を伝える粒子、ヒッグス粒子"
      caption="左が物質をつくる粒子で、上の2段がクォーク、下の2段がレプトンです。右へ行くほど重い世代です。右上が力を伝える粒子、右下がヒッグス粒子（第32章）です。重力は標準模型に含まれていません。"
    >
      <Svg id="31-10" w={720} h={380} label="物質をつくる粒子は3つの世代に分かれる。クォークは第1世代がアップとダウン、第2世代がチャームとストレンジ、第3世代がトップとボトム。レプトンは第1世代が電子と電子ニュートリノ、第2世代がミューオンとミューニュートリノ、第3世代がタウとタウニュートリノ。力を伝える粒子は、電磁気力の光子、強い力のグルーオン、弱い力のWボソンとZボソン。ほかにヒッグス粒子がある。重力は含まれない。">
        <T x={20} y={20} bold>
          物質をつくる粒子
        </T>
        {GEN.map((g, j) => (
          <T key={g} x={150 + j * 104} y={46} anchor="middle" fs={12.5} bold>
            {g}
          </T>
        ))}
        <Box x={10} y={64} w={80} h={108} lines="クォーク" fill="box3" fs={12.5} bold />
        <Box x={10} y={188} w={80} h={108} lines="レプトン" fill="box4" fs={12.5} bold />
        {MATTER.map((row, i) =>
          row.cells.map((c, j) => <Box key={`${i}-${j}`} x={100 + j * 104} y={rowY[i]} w={98} h={52} lines={c} fill={row.fill} fs={12.5} />),
        )}
        <Arrow x1={100} y1={322} x2={406} y2={322} />
        <T x={253} y={310} anchor="middle" fs={12} tone="muted">
          右の世代ほど重い
        </T>
        <T x={20} y={342} fs={12}>
          第1世代：身のまわりの物質をつくる
        </T>
        <T x={20} y={364} fs={12}>
          第2・第3世代：生まれてもすぐ軽い粒子に崩れる
        </T>
        <line x1={432} y1={14} x2={432} y2={366} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <T x={450} y={20} bold>
          力を伝える粒子
        </T>
        <Box x={450} y={36} w={260} h={46} lines={['光子', '電磁気力']} fill="box2" fs={12.5} subTone="muted" />
        <Box x={450} y={90} w={260} h={46} lines={['グルーオン', '強い力']} fill="box2" fs={12.5} subTone="muted" />
        <Box x={450} y={144} w={260} h={46} lines={['Wボソン・Zボソン', '弱い力']} fill="box2" fs={12.5} subTone="muted" />
        <T x={450} y={214} bold>
          ヒッグス粒子
        </T>
        <Box x={450} y={230} w={260} h={46} lines={['ヒッグス粒子', '2012年に発見（第32章）']} fill="box5" fs={12.5} subTone="muted" />
        <Box x={450} y={300} w={260} h={40} lines="重力は含まれない" fill="bg" fs={12.5} dashed />
      </Svg>
    </Figure>
  )
}
