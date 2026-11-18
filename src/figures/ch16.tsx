import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Trail, Vel, wave } from './common'

type Pt = [number, number]

/** 図の中の「光」の色（実際の光の色に近い固定色。色だけで区別せず、文字を添える） */
const GLOW = '#f2c94c'
/** 光の道筋の線の色（白い背景でも見えるように少し濃くした黄色） */
const BEAM = '#d99a00'

/** 0 以上 m 未満に収める余り */
const mod = (v: number, m: number) => ((v % m) + m) % m

/** 折れ線の上で、始点から距離 s の位置 */
function along(pts: Pt[], s: number): Pt {
  let rest = Math.max(0, s)
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const len = Math.hypot(x1 - x0, y1 - y0)
    if (rest <= len) return [x0 + ((x1 - x0) * rest) / len, y0 + ((y1 - y0) * rest) / len]
    rest -= len
  }
  return pts[pts.length - 1]
}

/** 光の小さなかたまり（光の進み方を見せるための印） */
function Pulse({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={5.5} fill={GLOW} stroke={BEAM} strokeWidth={1.5} />
}

/** 鏡（太い線と、裏側の斜線） */
function Mirror({ x, y, ang, len = 34 }: { x: number; y: number; ang: number; len?: number }) {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const h = len / 2
  // 裏側の向き（ang の法線）
  const nx = -s
  const ny = c
  return (
    <g>
      <line x1={x - c * h} y1={y - s * h} x2={x + c * h} y2={y + s * h} stroke="var(--fig-line)" strokeWidth={4} strokeLinecap="round" />
      {[-0.6, -0.2, 0.2, 0.6].map((k) => (
        <line key={k} x1={x + c * h * k} y1={y + s * h * k} x2={x + c * h * k + nx * 7 + c * 4} y2={y + s * h * k + ny * 7 + s * 4} stroke="var(--fig-muted)" strokeWidth={1} />
      ))}
    </g>
  )
}

/** 光の一部を通し、一部を反射するガラス板（斜めに置いた薄い板） */
function Splitter({ x, y, len = 40 }: { x: number; y: number; len?: number }) {
  const h = len / 2 / Math.SQRT2
  return <line x1={x - h} y1={y + h} x2={x + h} y2={y - h} stroke="var(--fig-accent)" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
}

/** 縦縞の明るさ（中心からの位置 dx、縞の間隔 w） */
const fringe = (dx: number, w: number) => 0.5 + 0.5 * Math.cos((2 * Math.PI * dx) / w)

/** 望遠鏡で見た縞。x, y, 幅 w, 高さ h、縞の間隔 fw、ずれ shift（縞の間隔を1とした量） */
function Fringes({ x, y, w, h, fw, shift = 0 }: { x: number; y: number; w: number; h: number; fw: number; shift?: number }) {
  const n = Math.ceil(w / 3)
  const cx = x + w / 2 + shift * fw
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#1d1f23" />
      {Array.from({ length: n }, (_, i) => {
        const px = x + i * 3
        return <rect key={i} x={px} y={y} width={3.2} height={h} fill={GLOW} opacity={fringe(px + 1.5 - cx + fw / 2, fw)} />
      })}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="var(--fig-line)" />
    </g>
  )
}

/* ---------- 図16-1 波には揺れを伝えるものが要る ---------- */

export function FigMedium() {
  return (
    <Figure
      n="16-1"
      title="水の波も音も、揺れを伝えるものがあって伝わる。では光は？"
      caption="模式図です。水面の波は水が、音は空気が揺れて伝わります。空気を抜いた容器の中のベルの音は外に聞こえませんが、光は容器を通り抜けます。19世紀の物理学者は、空気のない宇宙空間を光が伝わるのは、空間がエーテルで満たされているからだと考えました。"
    >
      <Svg id="16-1" w={720} h={250} label="左：水面の波は水が揺れて伝わる。中：空気を抜いた容器の中のベルの音は外に伝わらないが、光は容器を通り抜ける。右：星の光は空気のない宇宙空間を越えて地球に届く。その空間を満たすものとしてエーテルが考えられた。">
        {/* 左：水面の波 */}
        <T x={115} y={22} anchor="middle" bold>
          水面の波
        </T>
        <rect x={20} y={130} width={190} height={70} fill="var(--fig-box3)" opacity={0.7} />
        <path d={wave(20, 130, 190, 10, 64)} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
        <Ball x={84} y={121} r={9} fill="var(--fig-box2)" />
        <Arrow x1={84} y1={104} x2={84} y2={78} both />
        <T x={98} y={90} fs={12} tone="muted">
          浮きは上下に揺れる
        </T>
        <T x={115} y={222} anchor="middle" fs={12.5}>
          水が揺れて伝わる
        </T>

        {/* 中：空気を抜いた容器 */}
        <T x={360} y={22} anchor="middle" bold>
          音と光
        </T>
        <path d="M300,200 L300,92 Q300,52 360,52 Q420,52 420,92 L420,200 Z" fill="var(--fig-box)" stroke="var(--fig-line)" />
        <line x1={286} y1={200} x2={434} y2={200} stroke="var(--fig-line)" strokeWidth={3} />
        {/* ベル */}
        <path d="M346,150 Q346,118 360,118 Q374,118 374,150 L378,156 L342,156 Z" fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <circle cx={360} cy={160} r={3.5} fill="var(--fig-line)" />
        <T x={360} y={182} anchor="middle" fs={11.5} tone="muted">
          中の空気を抜く
        </T>
        {/* 音（伝わらない） */}
        {[0, 1].map((i) => (
          <path key={i} d={`M${432 + i * 12},${120} Q${442 + i * 12},${138} ${432 + i * 12},${156}`} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} />
        ))}
        <Cross x={450} y={112} s={7} />
        <T x={360} y={222} anchor="middle" fs={12.5}>
          音は外に伝わらない
        </T>
        {/* 光（通り抜ける） */}
        <line x1={250} y1={80} x2={470} y2={80} stroke={BEAM} strokeWidth={3} />
        <Arrow x1={440} y1={80} x2={472} y2={80} />
        <T x={436} y={64} fs={12}>
          光は通る
        </T>

        {/* 右：宇宙空間 */}
        <T x={605} y={22} anchor="middle" bold>
          星の光
        </T>
        <rect x={520} y={48} width={180} height={150} rx={6} fill="var(--fig-box5)" opacity={0.5} stroke="var(--fig-muted)" strokeDasharray="5 4" />
        {Array.from({ length: 6 }, (_, i) =>
          Array.from({ length: 4 }, (_, j) => <circle key={`${i}-${j}`} cx={540 + i * 28} cy={70 + j * 34} r={1.8} fill="var(--fig-muted)" />),
        )}
        <circle cx={536} cy={124} r={9} fill={GLOW} stroke={BEAM} />
        <circle cx={684} cy={124} r={11} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <line x1={548} y1={124} x2={668} y2={124} stroke={BEAM} strokeWidth={3} />
        <Arrow x1={640} y1={124} x2={670} y2={124} />
        <T x={536} y={150} anchor="middle" fs={11.5}>
          星
        </T>
        <T x={684} y={152} anchor="middle" fs={11.5}>
          地球
        </T>
        <T x={610} y={222} anchor="middle" fs={12.5}>
          空気のない空間を何が伝える？
        </T>
        <T x={610} y={241} anchor="middle" fs={12} tone="acc">
          点：空間を満たすと考えたエーテル
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図16-2 止まったエーテルの中を進む地球（動） ---------- */

export function FigEtherWind() {
  const cx = 200
  const cy = 150
  const R = 105
  const P = 12
  return (
    <Anim
      n="16-2"
      title="エーテルが止まっていれば、地球の上ではエーテルが逆向きに流れていく"
      still={3}
      period={P}
      caption="模式図です（太陽と地球の大きさと距離の比は実際と違います）。点はその場に止まっていると考えたエーテル、黒の矢印は地球が進む向きと速さ、点線の矢印は地球から見たエーテルの流れの向きです。地球が軌道を回るにつれて、流れの向きも変わります。"
    >
      {(t) => {
        const a = (2 * Math.PI * t) / P
        const ex = cx + R * Math.cos(a)
        const ey = cy + R * Math.sin(a)
        const tx = -Math.sin(a)
        const ty = Math.cos(a)
        const nx = Math.cos(a)
        const ny = Math.sin(a)
        return (
          <Svg id="16-2" w={720} h={300} label="太陽のまわりを回る地球と、止まったエーテルを表す点。地球の進む向きの反対向きに、地球から見たエーテルの流れが生じる。">
            {Array.from({ length: 13 }, (_, i) =>
              Array.from({ length: 9 }, (_, j) => <circle key={`${i}-${j}`} cx={22 + i * 29} cy={22 + j * 32} r={1.8} fill="var(--fig-muted)" />),
            )}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <circle cx={cx} cy={cy} r={20} fill={GLOW} stroke={BEAM} />
            <T x={cx} y={cy} anchor="middle" fs={12}>
              太陽
            </T>
            {/* 地球から見たエーテルの流れ（進む向きと逆） */}
            {[-1, 0, 1].map((k) => {
              const bx = ex + nx * k * 16 - tx * 18
              const by = ey + ny * k * 16 - ty * 18
              return <Arrow key={k} x1={bx} y1={by} x2={bx - tx * 34} y2={by - ty * 34} dashed />
            })}
            <Vel x1={ex + tx * 14} y1={ey + ty * 14} x2={ex + tx * 62} y2={ey + ty * 62} />
            <Ball x={ex} y={ey} r={11} />
            <T x={440} y={50} fs={12.5}>
              点：止まっていると考えたエーテル
            </T>
            <T x={440} y={84} fs={12.5}>
              黒の矢印：地球が進む向き
            </T>
            <T x={440} y={104} fs={12} tone="muted">
              秒速約30km（光の速さの1万分の1）
            </T>
            <T x={440} y={138} fs={12.5}>
              点線の矢印：地球から見た
            </T>
            <T x={440} y={158} fs={12.5}>
              エーテルの流れ（進む向きと逆）
            </T>
            <T x={440} y={200} fs={12} tone="acc">
              半年たつと、流れの向きは逆になる
            </T>
            <Ball x={448} y={240} r={8} />
            <T x={464} y={240} fs={12.5}>
              地球
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図16-3 ガリレオの船（動） ---------- */

function Drip({ x, top }: { x: number; top: number }) {
  return <path d={`M${x - 12},${top} L${x + 12},${top} L${x + 7},${top + 16} L${x - 7},${top + 16} Z`} fill="var(--fig-box)" stroke="var(--fig-line)" />
}
function Bowl({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 18},${y - 14} Q${x - 18},${y} ${x},${y} Q${x + 18},${y} ${x + 18},${y - 14} Z`} fill="var(--fig-box3)" stroke="var(--fig-line)" />
}

export function FigShip() {
  const P = 3.2
  const t0 = 0.4 // しずくが離れる時刻
  const tf = 1.4 // 落ちきる時刻
  const fall = (u: number) => 84 + 114 * Math.min(1, Math.max(0, (u - t0) / (tf - t0))) ** 2
  const shipX = (u: number) => 440 + 52 * u
  return (
    <Anim
      n="16-3"
      title="一定の速さで進む船の中では、物は止まった船の中と同じように動く"
      still={1.15}
      period={P}
      caption="ガリレオが『天文対話』で挙げた例をもとにした模式図です。左は船の中から、右は岸から見た同じしずくです。船の中の人には、しずくは真下に落ちるように見えます。岸から見ると、しずくは船と一緒に前へ進みながら落ち、点線の道筋を描きます。"
    >
      {(t) => {
        const u = mod(t, P)
        const dy = fall(u)
        const sx = shipX(u)
        const trail: Pt[] = []
        for (let k = t0; k <= Math.min(u, tf); k += 0.05) trail.push([shipX(k), fall(k)])
        const dropOn = u >= t0 && u <= tf + 0.05
        return (
          <Svg id="16-3" w={720} h={260} label="左：船の中から見ると、しずくは真下の器に落ちる。右：岸から見ると、船は右へ進み、しずくは船と一緒に前へ進みながら曲線を描いて落ちる。">
            {/* 左：船の中 */}
            <T x={175} y={20} anchor="middle" bold>
              船の中から見る
            </T>
            <rect x={60} y={50} width={230} height={170} rx={4} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <Drip x={175} top={62} />
            <Bowl x={175} y={214} />
            {dropOn && <circle cx={175} cy={dy} r={5} fill="var(--fig-box3)" stroke="var(--fig-line)" />}
            <T x={175} y={244} anchor="middle" fs={12.5}>
              しずくは真下に落ちる
            </T>
            {/* 右：岸から */}
            <T x={560} y={20} anchor="middle" bold>
              岸から見る
            </T>
            <rect x={360} y={222} width={350} height={20} fill="var(--fig-box3)" opacity={0.6} />
            <path d={`M${sx - 70},206 L${sx + 70},206 L${sx + 56},226 L${sx - 56},226 Z`} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={sx - 55} y={50} width={110} height={156} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <Drip x={sx} top={62} />
            <Bowl x={sx} y={204} />
            {trail.length > 1 && <Trail points={trail} />}
            {dropOn && <circle cx={trail.length ? trail[trail.length - 1][0] : sx} cy={dy} r={5} fill="var(--fig-box3)" stroke="var(--fig-line)" />}
            <Vel x1={sx + 60} y1={186} x2={sx + 100} y2={186} />
            <T x={372} y={36} fs={12} tone="muted">
              船は一定の速さで右へ進む
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図16-4 流れのある川を往復する船（動・スライダー） ---------- */

const RV = { left: 30, right: 456, top: 80, bottom: 240 } // 川の範囲。川幅 400m が 160px
const KM = 0.4 // 1m あたりのピクセル
const BOAT = 5 // 水に対する船の速さ（秒速5m）
const DIST = 400 // 片道の距離（m）
const SIM = 70 // 図の1秒を何秒として進めるか

export function FigRiver() {
  const [u, setU] = useState(3)
  const tUp = DIST / (BOAT - u)
  const tDown = DIST / (BOAT + u)
  const tAlong = tUp + tDown
  const vAcross = Math.sqrt(BOAT * BOAT - u * u)
  const tAcross = (2 * DIST) / vAcross
  const tStill = (2 * DIST) / BOAT
  const P = tAlong / SIM + 1.6
  const bars = [
    { label: '流れのない水で往復', T: tStill },
    { label: '流れを横切って往復', T: tAcross },
    { label: '流れに沿って往復', T: tAlong },
  ]
  const bx = 478
  const scale = 0.44 // 1秒あたりのピクセル
  return (
    <Anim
      n="16-4"
      title="流れのある川では、流れに沿って往復するほうが、流れを横切って往復するより時間がかかる"
      still={P - 0.8}
      period={P}
      controls={<Range label="川の流れの速さ" min={0} max={4} step={1} value={u} onChange={setU} format={(v) => `秒速${v}m`} />}
      caption="水に対して秒速5mで進む2そうの船が、400m先まで行って戻ります（模式図）。流れを横切る船は流されないように少し上流へ向けて進むので、横切る向きの速さが落ちます。「川の流れの速さ」を0にすると、3つの時間は同じになります。流れが速いほど差が大きくなります。"
    >
      {(t) => {
        const s = Math.min(t * SIM, Math.max(tAlong, tAcross))
        // 流れに沿う船（上流＝左へ行って戻る）
        const ax0 = 330
        const ay = 205
        const aPos = s < tUp ? ax0 - (BOAT - u) * s * KM : s < tAlong ? ax0 - DIST * KM + (BOAT + u) * (s - tUp) * KM : ax0
        const aDir = s < tUp ? -1 : s < tAlong ? 1 : 0
        // 流れを横切る船（下の岸から上の岸へ行って戻る）
        const cxB = 385
        const half = tAcross / 2
        const cPos = s < half ? RV.bottom - vAcross * s * KM : s < tAcross ? RV.top + vAcross * (s - half) * KM : RV.bottom
        const cDir = s < half ? -1 : s < tAcross ? 1 : 0
        return (
          <Svg id="16-4" w={720} h={300} label="川を往復する2そうの船と、往復にかかる時間の棒グラフ。流れがあると、横切る往復も沿う往復も、流れのない水より時間がかかり、沿う往復がいちばん長い。">
            <T x={RV.left} y={20} fs={12.5} bold>
              {`経過した時間：${Math.round(s)}秒`}
            </T>
            <rect x={RV.left} y={RV.top} width={RV.right - RV.left} height={RV.bottom - RV.top} fill="var(--fig-box3)" opacity={0.55} />
            <line x1={RV.left} y1={RV.top} x2={RV.right} y2={RV.top} stroke="var(--fig-line)" strokeWidth={2} />
            <line x1={RV.left} y1={RV.bottom} x2={RV.right} y2={RV.bottom} stroke="var(--fig-line)" strokeWidth={2} />
            {u > 0 &&
              [0, 1, 2].map((i) => {
                const fx = RV.left + 30 + mod(t * 20 * u + i * 60, 180)
                return <Arrow key={i} x1={fx} y1={130 + i * 16 - 16} x2={fx + 26} y2={130 + i * 16 - 16} dashed />
              })}
            <T x={RV.left} y={56} fs={12} tone="muted">
              {u > 0 ? `川の流れ（右向き、秒速${u}m）` : '流れのない水'}
            </T>
            {/* 沿う船 */}
            <line x1={ax0 - DIST * KM} y1={ay + 18} x2={ax0} y2={ay + 18} stroke="var(--fig-muted)" strokeDasharray="2 3" />
            <T x={ax0 - DIST * KM} y={ay + 30} fs={11.5} tone="muted">
              400m
            </T>
            <ellipse cx={aPos} cy={ay} rx={15} ry={7} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            {aDir !== 0 && <Vel x1={aPos + aDir * 18} y1={ay} x2={aPos + aDir * (18 + (aDir < 0 ? BOAT - u : BOAT + u) * 6)} y2={ay} />}
            <T x={ax0 - 150} y={ay - 22} fs={12}>
              流れに沿って往復
            </T>
            {/* 横切る船 */}
            <line x1={cxB + 22} y1={RV.top} x2={cxB + 22} y2={RV.bottom} stroke="var(--fig-muted)" strokeDasharray="2 3" />
            <T x={cxB + 28} y={(RV.top + RV.bottom) / 2} fs={11.5} tone="muted">
              400m
            </T>
            <ellipse cx={cxB} cy={cPos} rx={7} ry={15} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            {cDir !== 0 && <Vel x1={cxB - 12} y1={cPos + cDir * 4} x2={cxB - 12} y2={cPos + cDir * (4 + vAcross * 4)} />}
            <T x={cxB - 4} y={RV.bottom + 18} anchor="middle" fs={12}>
              流れを横切って往復
            </T>
            {/* 棒グラフ */}
            <T x={bx} y={56} fs={12.5} bold>
              往復にかかる時間
            </T>
            {bars.map((b, i) => {
              const y = 92 + i * 62
              const w = Math.min(s, b.T) * scale
              const done = s >= b.T
              return (
                <g key={b.label}>
                  <T x={bx} y={y} fs={12}>
                    {b.label}
                  </T>
                  <rect x={bx} y={y + 12} width={b.T * scale} height={16} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 3" />
                  <rect x={bx} y={y + 12} width={w} height={16} fill={i === 0 ? 'var(--fig-box)' : 'var(--fig-box2)'} stroke="var(--fig-line)" />
                  {done && (
                    <T x={bx + b.T * scale + 6} y={y + 20} fs={12} tone="acc">
                      {`${Math.round(b.T)}秒`}
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

/* ---------- 図16-5 干渉計の光の道筋（動） ---------- */

const IF = { src: [50, 200] as Pt, bs: [250, 200] as Pt, mA: [430, 200] as Pt, mB: [250, 20] as Pt, eye: [250, 320] as Pt }

export function FigInterferometer() {
  const v = 190 // 光の印の速さ（ピクセル毎秒）
  const gap = 0.9 // 光の印を出す間隔（秒）
  const pathA: Pt[] = [IF.src, IF.bs, IF.mA, IF.bs, IF.eye]
  const pathB: Pt[] = [IF.src, IF.bs, IF.mB, IF.bs, IF.eye]
  const total = 200 + 180 * 2 + 120
  return (
    <Anim
      n="16-5"
      title="干渉計は、光を2つに分けて別の道を往復させ、もう一度重ねる"
      still={2.3}
      period={gap * 10}
      caption="マイケルソンの干渉計を上から見た模式図です（ガラス板の厚さを補う板などは省いています）。光源からの光は、斜めに置いたガラス板で2つに分かれ、鏡Aと鏡Bで跳ね返って再び重なり、望遠鏡に入ります。重なった光は干渉して、右のような明暗の縞をつくります。2つの道の長さがわずかに変わると、縞の位置がずれます。"
    >
      {(t) => {
        const pulses: Pt[] = []
        for (let k = -8; k <= 0; k++) {
          const te = Math.floor(t / gap) * gap + k * gap
          const s = (t - te) * v
          if (s < 0 || s > total) continue
          if (s <= 200) pulses.push(along(pathA, s))
          else {
            pulses.push(along(pathA, s))
            if (s < 200 + 360) pulses.push(along(pathB, s))
          }
        }
        return (
          <Svg id="16-5" w={720} h={360} label="光源からの光がガラス板で2つに分かれ、右の鏡Aと上の鏡Bで跳ね返って戻り、ガラス板で重なって下の望遠鏡に入る。望遠鏡では明るい縞と暗い縞が見える。">
            {/* 光の道筋 */}
            <line x1={IF.src[0]} y1={IF.src[1]} x2={IF.mA[0]} y2={IF.mA[1]} stroke={BEAM} strokeWidth={2} opacity={0.6} />
            <line x1={IF.bs[0]} y1={IF.mB[1]} x2={IF.eye[0]} y2={IF.eye[1]} stroke={BEAM} strokeWidth={2} opacity={0.6} />
            {/* 部品 */}
            <rect x={IF.src[0] - 30} y={IF.src[1] - 16} width={34} height={32} rx={4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={IF.src[0] - 13} y={IF.src[1] + 32} anchor="middle" fs={12}>
              光源
            </T>
            <Splitter x={IF.bs[0]} y={IF.bs[1]} />
            <Mirror x={IF.mA[0]} y={IF.mA[1]} ang={-Math.PI / 2} />
            <Mirror x={IF.mB[0]} y={IF.mB[1]} ang={Math.PI} />
            <T x={IF.mA[0] + 18} y={IF.mA[1] - 30} fs={12.5}>
              鏡A
            </T>
            <T x={IF.mB[0] + 26} y={IF.mB[1]} fs={12.5}>
              鏡B
            </T>
            <rect x={IF.eye[0] - 12} y={IF.eye[1]} width={24} height={30} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={IF.eye[0] + 22} y={IF.eye[1] + 16} fs={12}>
              望遠鏡（縞を見る）
            </T>
            <T x={IF.bs[0] + 26} y={IF.bs[1] + 30} fs={12}>
              光の一部を通し、
            </T>
            <T x={IF.bs[0] + 26} y={IF.bs[1] + 47} fs={12}>
              一部を反射するガラス板
            </T>
            <Arrow x1={IF.bs[0] + 40} y1={IF.bs[1] - 14} x2={IF.mA[0] - 40} y2={IF.mA[1] - 14} both />
            <T x={(IF.bs[0] + IF.mA[0]) / 2} y={IF.bs[1] - 28} anchor="middle" fs={11.5} tone="muted">
              腕（1881年は約1.2m）
            </T>
            {pulses.map(([x, y], i) => (
              <Pulse key={i} x={x} y={y} />
            ))}
            {/* 縞 */}
            <T x={600} y={70} anchor="middle" fs={12.5} bold>
              望遠鏡で見た縞
            </T>
            <Fringes x={510} y={90} w={180} h={110} fw={45} />
            <T x={600} y={222} anchor="middle" fs={12}>
              明るい縞と暗い縞
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図16-6 1887年の装置 ---------- */

export function FigApparatus() {
  // 上から見た図の、反射を繰り返す光の道筋（模式）
  const C: Pt = [545, 190]
  const right: Pt[] = [C, [680, 175], [600, 160], [680, 145], [600, 130], [680, 115]]
  const up: Pt[] = [C, [530, 55], [515, 140], [500, 55], [485, 140], [470, 55]]
  const line = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')
  return (
    <Figure
      n="16-6"
      title="1887年の装置は、水銀に浮かべた石の板の上に組まれた"
      caption="模式図です。左は横から見た断面、右は石の板を上から見た様子です。鏡で光を何度も反射させて、光の道を約11m（1881年の約10倍）にしました。右の図では反射の回数と鏡の並び方を簡単にしています。"
    >
      <Svg id="16-6" w={720} h={300} label="左：れんがの台の上の鉄の容器に水銀を入れ、輪の形の木の浮きを浮かべ、その上に石の板を載せる。右：石の板の上で、光が鏡で何度も反射して長い道を通る。">
        {/* 左：横から見た断面 */}
        <T x={175} y={20} anchor="middle" bold>
          横から見た断面
        </T>
        <rect x={40} y={92} width={270} height={34} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={175} y={109} anchor="middle" fs={12}>
          石の板（約1.5m四方、厚さ約30cm）
        </T>
        <rect x={52} y={52} width={30} height={40} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <rect x={268} y={52} width={30} height={40} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <T x={175} y={62} anchor="middle" fs={12}>
          鏡や光源は板の上に載る
        </T>
        <path d="M50,140 L50,176 L300,176 L300,140" fill="none" stroke="var(--fig-line)" strokeWidth={3} />
        <rect x={53} y={150} width={244} height={24} fill="var(--fig-muted)" opacity={0.45} />
        <rect x={70} y={128} width={66} height={30} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={214} y={128} width={66} height={30} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={110} y={182} width={130} height={60} fill="var(--fig-box2)" opacity={0.6} stroke="var(--fig-line)" />
        <T x={175} y={212} anchor="middle" fs={12}>
          れんがの台
        </T>
        <line x1={103} y1={150} x2={103} y2={256} stroke="var(--fig-muted)" />
        <T x={20} y={268} fs={12}>
          輪の形の木の浮き
        </T>
        <line x1={268} y1={164} x2={268} y2={256} stroke="var(--fig-muted)" />
        <T x={330} y={268} anchor="end" fs={12}>
          鉄の容器に入れた水銀
        </T>

        {/* 右：上から見た様子 */}
        <T x={545} y={20} anchor="middle" bold>
          上から見た様子
        </T>
        <rect x={400} y={38} width={300} height={248} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <path d={line(right)} fill="none" stroke={BEAM} strokeWidth={2} />
        <path d={line(up)} fill="none" stroke={BEAM} strokeWidth={2} />
        {[...right.slice(1), ...up.slice(1)].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} fill="var(--fig-line)" />
        ))}
        <line x1={430} y1={C[1]} x2={C[0]} y2={C[1]} stroke={BEAM} strokeWidth={2} />
        <line x1={C[0]} y1={C[1]} x2={C[0]} y2={246} stroke={BEAM} strokeWidth={2} />
        <Splitter x={C[0]} y={C[1]} len={30} />
        <rect x={408} y={181} width={22} height={18} rx={3} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <T x={419} y={214} anchor="middle" fs={12}>
          光源
        </T>
        <rect x={C[0] - 10} y={246} width={20} height={22} rx={3} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <T x={C[0] + 17} y={257} fs={12}>
          望遠鏡
        </T>
        <T x={630} y={208} anchor="middle" fs={12} tone="muted">
          点：鏡
        </T>
        <T x={560} y={60} fs={12}>
          反射を繰り返して
        </T>
        <T x={560} y={78} fs={12}>
          光の道を長くする
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図16-7 装置を回すと縞はずれるはずだった（動・切り替え） ---------- */

export function FigRotate() {
  const [mode, setMode] = useState<'expected' | 'actual'>('expected')
  const P = 8
  const amp = mode === 'expected' ? 0.2 : 0.004
  const fw = 60
  return (
    <Anim
      n="16-7"
      title="装置を回すと縞が動くはずだったが、実際にはほとんど動かなかった"
      still={P / 2}
      period={P}
      controls={
        <Choice
          label="表示"
          options={[
            { value: 'expected', label: '予想（エーテルの風がある）' },
            { value: 'actual', label: '実際の結果（1887年）' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="左は上から見た装置、右は望遠鏡で見た縞です（模式図）。装置をゆっくり90度回すと、予想では縞が縞の間隔の0.4だけずれるはずでした。実際のずれはその40分の1程度より小さいものでした。点線は回し始めたときの暗い縞の位置です。"
    >
      {(t) => {
        const ph = (1 - Math.cos((2 * Math.PI * t) / P)) / 2 // 0→1→0
        const ang = (ph * Math.PI) / 2
        const shift = amp * (1 - Math.cos(2 * ang)) // 0〜2amp
        const cx = 170
        const cy = 160
        const L = 90
        const arm = (a: number) => [cx + L * Math.cos(a), cy - L * Math.sin(a)] as Pt
        const a1 = arm(-ang)
        const a2 = arm(Math.PI / 2 - ang)
        const fx = 420
        const fy = 90
        const fwid = 260
        const zero = fx + fwid / 2
        return (
          <Svg id="16-7" w={720} h={300} label="上から見た干渉計の装置が90度回る。予想では右の縞が縞の間隔の0.4だけ横にずれるはずだが、実際の結果では縞はほとんど動かない。">
            <T x={cx} y={18} anchor="middle" bold>
              上から見た装置
            </T>
            <circle cx={cx} cy={cy} r={L + 12} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <line x1={cx} y1={cy} x2={a1[0]} y2={a1[1]} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={cx} y1={cy} x2={a2[0]} y2={a2[1]} stroke="var(--fig-line)" strokeWidth={3} />
            <circle cx={a1[0]} cy={a1[1]} r={6} fill="var(--fig-line)" />
            <circle cx={a2[0]} cy={a2[1]} r={6} fill="var(--fig-line)" />
            <circle cx={cx} cy={cy} r={5} fill="var(--fig-accent)" />
            <Vel x1={40} y1={284} x2={150} y2={284} />
            <T x={160} y={284} fs={12}>
              地球の進む向き
            </T>
            <T x={cx} y={39} anchor="middle" fs={12} tone="muted">
              {`回した角度：${Math.round((ang * 180) / Math.PI)}度`}
            </T>
            <T x={fx + fwid / 2} y={18} anchor="middle" bold>
              望遠鏡で見た縞
            </T>
            <Fringes x={fx} y={fy} w={fwid} h={110} fw={fw} shift={shift} />
            <line x1={zero} y1={fy - 10} x2={zero} y2={fy + 120} stroke="var(--fig-text)" strokeDasharray="4 3" strokeWidth={1.5} />
            <Arrow x1={zero + shift * fw} y1={fy + 136} x2={zero + shift * fw} y2={fy + 116} />
            <T x={fx + fwid / 2} y={fy + 158} anchor="middle" fs={12.5}>
              {mode === 'expected' ? `縞のずれ：縞の間隔の${shift.toFixed(2)}` : '縞はほとんど動かない'}
            </T>
            <T x={fx + fwid / 2} y={fy + 180} anchor="middle" fs={12} tone={mode === 'expected' ? 'muted' : 'acc'}>
              {mode === 'expected' ? '90度回すと0.4ずれるはず' : '予想の40分の1程度より小さい'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図16-8 予想されたずれと実際のずれ ---------- */

export function FigBars() {
  const x0 = 250
  const k = 1100 // 縞の間隔1あたりのピクセル
  const rows = [
    { label: ['1881年の装置で', '予想されたずれ'], v: 0.02, note: '0.02（計算を直した後）', kind: 'exp' },
    { label: ['1887年の装置で', '予想されたずれ'], v: 0.4, note: '0.4', kind: 'exp' },
    { label: ['1887年の実際のずれ', '（確実にこれより小さい）'], v: 0.02, note: '0.02未満（予想の20分の1）', kind: 'lim' },
    { label: ['1887年の実際のずれ', '（おそらくこれより小さい）'], v: 0.01, note: '0.01未満（予想の40分の1）', kind: 'lim' },
  ]
  return (
    <Figure
      n="16-8"
      title="1887年の実験で見られたずれは、予想の40分の1程度より小さかった"
      caption="縞の間隔を1として、装置を90度回したときの縞のずれを比べています。予想は地球の公転の速さだけを考えた値です。1881年の装置では、予想されるずれが小さく、実験の誤差と見分けにくいものでした。点線の棒は「これより小さい」という上限を表します。"
    >
      <Svg id="16-8" w={720} h={300} label="棒グラフ。1881年の装置で予想されたずれは0.02、1887年の装置で予想されたずれは0.4。1887年の実際のずれは確実に0.02未満、おそらく0.01未満で、予想の20分の1から40分の1より小さい。">
        <line x1={x0} y1={30} x2={x0} y2={276} stroke="var(--fig-line)" />
        {rows.map((r, i) => {
          const y = 52 + i * 62
          const w = r.v * k
          return (
            <g key={i}>
              <T x={x0 - 12} y={y - 8} anchor="end" fs={12}>
                {r.label[0]}
              </T>
              <T x={x0 - 12} y={y + 10} anchor="end" fs={12} tone="muted">
                {r.label[1]}
              </T>
              <rect
                x={x0}
                y={y - 11}
                width={w}
                height={22}
                fill={r.kind === 'exp' ? 'var(--fig-box2)' : 'none'}
                stroke={r.kind === 'exp' ? 'var(--fig-line)' : 'var(--fig-accent)'}
                strokeDasharray={r.kind === 'lim' ? '4 3' : undefined}
                strokeWidth={r.kind === 'lim' ? 2 : 1}
              />
              <T x={x0 + Math.max(w, 0) + 10} y={y} fs={12.5} tone={r.kind === 'lim' ? 'acc' : undefined}>
                {r.note}
              </T>
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図16-9 ローレンツの「縮み」の考え（動・切り替え） ---------- */

export function FigContraction() {
  const [mode, setMode] = useState<'none' | 'shrink'>('none')
  const c = 150 // 図の中の光の速さ（ピクセル毎秒）
  const w = 0.6 // エーテルの風の速さ（光の速さに対する割合。見やすくするため誇張）
  const L = 190
  const Lx = mode === 'shrink' ? L * Math.sqrt(1 - w * w) : L
  const tOut = Lx / (c * (1 - w))
  const tBack = Lx / (c * (1 + w))
  const tX = tOut + tBack
  const vY = c * Math.sqrt(1 - w * w)
  const tY = (2 * L) / vY
  const end = Math.max(tX, tY)
  const P = end + 2.2
  const bs: Pt = [130, 250]
  return (
    <Anim
      n="16-9"
      title="進む向きの腕がわずかに縮めば、2つの光は同時に戻る"
      still={P - 0.5}
      period={P}
      controls={
        <Choice
          label="腕の長さ"
          options={[
            { value: 'none', label: '変わらない（予想）' },
            { value: 'shrink', label: '進む向きに縮む（ローレンツ）' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="地球の上の装置から見た模式図です。見やすくするため、エーテルの流れの速さを光の速さの6割として描き、縮みも大きく描いています。実際の地球の速さでは、縮みは長さの2億分の1ほどです。「進む向きに縮む」を選ぶと、右へのびる腕が短くなり、2つの光が同時に戻ります。"
    >
      {(t) => {
        const tt = Math.min(t, end + 0.01)
        // 右の腕（地球の進む向き）：往きは遅く、帰りは速い
        const xPos = tt < tOut ? bs[0] + c * (1 - w) * tt : tt < tX ? bs[0] + Lx - c * (1 + w) * (tt - tOut) : bs[0]
        // 上の腕（横向き）
        const yPos = tt < tY / 2 ? bs[1] - vY * tt : tt < tY ? bs[1] - L + vY * (tt - tY / 2) : bs[1]
        const xDone = t >= tX
        const yDone = t >= tY
        const same = Math.abs(tX - tY) < 0.01
        return (
          <Svg id="16-9" w={720} h={300} label="2本の腕を持つ装置。右へのびる腕は地球の進む向きに向いている。腕の長さが変わらなければ横向きの腕の光が先に戻る。進む向きの腕が縮めば、2つの光は同時に戻る。">
            {/* エーテルの流れ */}
            {[0, 1, 2].map((i) => {
              const fx = 300 + mod(-t * 40 + i * 60, 180)
              return <Arrow key={i} x1={fx} y1={92 + i * 18} x2={fx - 26} y2={92 + i * 18} dashed />
            })}
            <T x={340} y={62} fs={12} tone="muted">
              地球から見たエーテルの流れ
            </T>
            <Vel x1={40} y1={286} x2={120} y2={286} />
            <T x={128} y={286} fs={12}>
              地球の進む向き
            </T>
            {/* 腕 */}
            <line x1={bs[0]} y1={bs[1]} x2={bs[0] + Lx} y2={bs[1]} stroke={BEAM} strokeWidth={2} opacity={0.5} />
            <line x1={bs[0]} y1={bs[1]} x2={bs[0]} y2={bs[1] - L} stroke={BEAM} strokeWidth={2} opacity={0.5} />
            {mode === 'shrink' && <line x1={bs[0] + Lx} y1={bs[1] + 14} x2={bs[0] + L} y2={bs[1] + 14} stroke="var(--fig-muted)" strokeDasharray="3 3" />}
            {mode === 'shrink' && (
              <T x={bs[0] + L + 6} y={bs[1] + 14} fs={11.5} tone="muted">
                元の長さ
              </T>
            )}
            <Mirror x={bs[0] + Lx} y={bs[1]} ang={-Math.PI / 2} len={30} />
            <Mirror x={bs[0]} y={bs[1] - L} ang={Math.PI} len={30} />
            <Splitter x={bs[0]} y={bs[1]} len={30} />
            <Pulse x={xPos} y={bs[1]} />
            <Pulse x={bs[0]} y={yPos} />
            <T x={bs[0] + 22} y={bs[1] - L} fs={12}>
              横向きの腕
            </T>
            <T x={bs[0] + 40} y={bs[1] - 18} fs={12}>
              進む向きの腕
            </T>
            {/* 結果 */}
            <T x={490} y={180} fs={12.5}>
              {`横向きの腕の光：${yDone ? '戻った' : '往復中'}`}
            </T>
            <T x={490} y={202} fs={12.5}>
              {`進む向きの腕の光：${xDone ? '戻った' : '往復中'}`}
            </T>
            {xDone && yDone && (
              <T x={490} y={236} fs={12.5} tone={same ? 'acc' : 'danger'}>
                {same ? '同時に戻る → 縞はずれない' : '横向きの光が先に戻る → 縞がずれる'}
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図16-10 エーテルの問題から1905年まで ---------- */

const ROAD = [
  { y: '1878〜79年', who: 'マクスウェル', what: ['往復の時間の差は', '小さすぎて測れない'] },
  { y: '1881年', who: 'マイケルソン', what: ['干渉計で実験', '（ポツダム）'] },
  { y: '1887年', who: 'マイケルソン、', who2: 'モーリー', what: ['精度を上げた実験', '縞はほぼ動かない'] },
  { y: '1889年', who: 'フィッツジェラルド', what: ['物体は進む向きに', '縮むと提案'] },
  { y: '1892年', who: 'ローレンツ', what: ['同じ考えを', '別に示す'] },
  { y: '1899年', who: 'ローレンツ', what: ['位置と時刻を', '書き換える規則'] },
  { y: '1904年', who: 'ローレンツ、', who2: 'ポアンカレ', what: ['規則の完成、', '相対性原理の講演'] },
  { y: '1905年', who: 'ポアンカレ、', who2: 'アインシュタイン', what: ['ローレンツ変換の命名、', '特殊相対性理論'] },
]

export function FigRoad16() {
  return (
    <Figure n="16-10" title="エーテルの実験から特殊相対性理論までの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。1905年のポアンカレの論文は6月5日に発表され、アインシュタインの論文は6月30日に雑誌に届きました。">
      <Svg id="16-10" w={720} h={300} label="1878〜79年マクスウェル、1881年マイケルソンの実験、1887年マイケルソンとモーリーの実験、1889年フィッツジェラルドの縮みの提案、1892年ローレンツ、1899年と1904年ローレンツの書き換えの規則、1904年ポアンカレの講演、1905年ポアンカレとアインシュタインの論文。">
        <Arrow x1={14} y1={150} x2={710} y2={150} />
        {ROAD.map((r, i) => {
          const x = 60 + i * 84
          const up = i % 2 === 0
          const ty = up ? 22 : 176
          const lines = [r.who, ...(r.who2 ? [r.who2] : [])]
          return (
            <g key={r.y + i}>
              <circle cx={x} cy={150} r={6} fill={i === 7 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 128 : 156} x2={x} y2={up ? 144 : 168} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold fs={12.5}>
                {r.y}
              </T>
              {lines.map((w, j) => (
                <T key={w} x={x} y={ty + 19 + j * 16} anchor="middle" fs={11.5}>
                  {w}
                </T>
              ))}
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + 21 + lines.length * 16 + j * 16} anchor="middle" fs={11} tone="muted">
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
