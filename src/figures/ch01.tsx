import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Force, Trail, Vel } from './common'

/* ---------- 図1-1 『プリンキピア』までの年表 ---------- */

const ROAD = [
  { y: '1609年', who: 'ケプラー', what: ['惑星の楕円軌道と', '速さの法則'] },
  { y: '1619年', who: 'ケプラー', what: ['周期と距離の', '関係の法則'] },
  { y: '1638年', who: 'ガリレオ', what: ['『新科学対話』', '（落下と運動）'] },
  { y: '1644年', who: 'デカルト', what: ['『哲学原理』', '（まっすぐ動き続ける）'] },
  { y: '1684年', who: 'ハレー', what: ['ニュートンを訪ね', '軌道の問いを出す'] },
  { y: '1687年', who: 'ニュートン', what: ['『プリンキピア』', 'を出版'] },
]

export function FigRoad() {
  return (
    <Figure n="1-1" title="『プリンキピア』が出版されるまでの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="1-1" w={720} h={250} label="1609年と1619年にケプラーが惑星の法則を発表し、1638年にガリレオが『新科学対話』、1644年にデカルトが『哲学原理』を出版した。1684年にハレーがニュートンを訪ね、1687年に『プリンキピア』が出版された。">
        <Arrow x1={20} y1={125} x2={705} y2={125} />
        {ROAD.map((r, i) => {
          const x = 70 + i * 116
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

/* ---------- 図1-2 図の見方（全章の凡例） ---------- */

export function FigLegend() {
  return (
    <Figure n="1-2" title="この本の図の見方（全章で共通）" caption="動く図には「一時停止」と「最初から」のボタンが付いています。図が画面に入っている間だけ動きます。">
      <Svg id="1-2" w={600} h={228} label="凡例。青の太い矢印は力、黒の矢印は速さと向き、点線は通った道筋、赤の×は誤りや否定された考え、丸は物体を表す。">
        <Force x1={30} y1={30} x2={130} y2={30} />
        <T x={150} y={30}>力（押す・引く）。長いほど強い</T>
        <Vel x1={30} y1={72} x2={130} y2={72} />
        <T x={150} y={72}>速さと向き。長いほど速い</T>
        <Trail points={[[30, 114], [130, 114]]} />
        <T x={150} y={114}>物体が通った道筋</T>
        <Cross x={80} y={156} />
        <T x={150} y={156}>誤りと分かった考え、起こらないこと</T>
        <Ball x={80} y={198} r={12} />
        <T x={150} y={198}>物体（球や車など）</T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図1-3 斜面を転がる球（動） ---------- */

const G = 300 // 図の中の重力の強さ（ピクセル毎秒毎秒）
const H = 100 // 出発の高さ
const LEFT = { x0: 40, y0: 50, x1: 300, y1: 150 }

export function FigSlopes() {
  const [angle, setAngle] = useState<'35' | '15' | '0'>('15')
  const th = (Number(angle) * Math.PI) / 180
  const L1 = Math.hypot(LEFT.x1 - LEFT.x0, LEFT.y1 - LEFT.y0)
  const a1 = (G * H) / L1
  const t1 = Math.sqrt((2 * L1) / a1)
  const v0 = Math.sqrt(2 * G * H)
  const flat = angle === '0'
  const a2 = G * Math.sin(th)
  const t2 = flat ? (700 - LEFT.x1) / v0 : v0 / a2
  const period = flat ? t1 + t2 + 0.6 : 2 * (t1 + t2)
  const L2 = flat ? 0 : H / Math.sin(th)
  const end = { x: LEFT.x1 + L2 * Math.cos(th), y: LEFT.y1 - L2 * Math.sin(th) }

  /** 時刻 t の球の位置（坂に沿った距離から計算） */
  const pos = (t: number) => {
    const ux = (LEFT.x1 - LEFT.x0) / L1
    const uy = (LEFT.y1 - LEFT.y0) / L1
    const onLeft = (s: number) => ({ x: LEFT.x0 + ux * s, y: LEFT.y0 + uy * s })
    const onRight = (s: number) => ({ x: LEFT.x1 + s * Math.cos(th), y: LEFT.y1 - s * Math.sin(th) })
    if (flat) {
      if (t < t1) return onLeft(0.5 * a1 * t * t)
      return { x: Math.min(LEFT.x1 + v0 * (t - t1), 700), y: LEFT.y1 }
    }
    if (t < t1) return onLeft(0.5 * a1 * t * t)
    if (t < t1 + t2) {
      const u = t - t1
      return onRight(v0 * u - 0.5 * a2 * u * u)
    }
    if (t < t1 + 2 * t2) {
      const u = t - t1 - t2
      return onRight(L2 - 0.5 * a2 * u * u)
    }
    const u = t - t1 - 2 * t2
    return onLeft(L1 - (v0 * u - 0.5 * a1 * u * u))
  }

  return (
    <Anim
      n="1-3"
      title="坂を下りた球は、反対側の坂を同じ高さまで上る"
      still={flat ? t1 + 0.6 : t1 + t2}
      period={period}
      controls={
        <Choice
          label="右の坂の傾き"
          options={[
            { value: '35', label: '急' },
            { value: '15', label: 'ゆるい' },
            { value: '0', label: '水平' },
          ]}
          value={angle}
          onChange={setAngle}
        />
      }
      caption="坂と球の間に、動きをじゃまする力がまったくないとした模式図です。右の坂をゆるくするほど、球は遠くまで転がって同じ高さに戻ります。右を水平にすると、戻るための高さがないので、球は同じ速さで進み続けます。"
    >
      {(t) => {
        const p = pos(t % period)
        return (
          <Svg id="1-3" w={720} h={200} label="左の坂を下りた球が、右の坂を出発点と同じ高さまで上る。右の坂を水平にすると、球は止まらずに進み続ける。">
            <line x1={20} y1={LEFT.y0} x2={710} y2={LEFT.y0} stroke="var(--fig-muted)" strokeDasharray="6 5" />
            <T x={430} y={34} tone="muted" fs={12}>
              出発点と同じ高さ
            </T>
            <path
              d={`M${LEFT.x0},${LEFT.y0} L${LEFT.x1},${LEFT.y1} ${flat ? `L710,${LEFT.y1}` : `L${end.x},${end.y} L${end.x + 20},${end.y}`} L${flat ? 710 : end.x + 20},${LEFT.y1 + 20} L${LEFT.x0},${LEFT.y1 + 20} Z`}
              fill="var(--fig-box)"
              stroke="var(--fig-line)"
            />
            <T x={44} y={34} fs={12}>
              出発点
            </T>
            {flat && (
              <T x={560} y={182} fs={12} tone="acc">
                どこまでも進む
              </T>
            )}
            <Ball x={p.x} y={p.y - 11} r={11} />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図1-4 床の上と氷の上（動） ---------- */

const LANES = [
  { label: '床の上（摩擦が大きい）', dec: 100 },
  { label: '氷の上（摩擦が小さい）', dec: 20 },
  { label: '摩擦がまったくない面', dec: 0 },
]

export function FigFriction() {
  const v0 = 100
  return (
    <Anim n="1-4" title="同じ速さで滑り出しても、摩擦が小さいほど遠くまで進む" still={4.5} period={7} caption="青の矢印は摩擦の力、黒の矢印は速さです。摩擦がまったくなければ、物体は同じ速さで進み続けます。">
      {(t) => (
        <Svg id="1-4" w={720} h={250} label="同じ速さで滑り出した3つの物体。床の上はすぐ止まり、氷の上は遠くまで進み、摩擦のない面では同じ速さで進み続ける。">
          {LANES.map((l, i) => {
            const y = 70 + i * 74
            const tt = Math.min(t, 6)
            const stop = l.dec ? v0 / l.dec : Infinity
            const u = Math.min(tt, stop)
            const x = 60 + v0 * u - 0.5 * l.dec * u * u
            const v = l.dec ? Math.max(0, v0 - l.dec * tt) : v0
            return (
              <g key={l.label}>
                <T x={20} y={y - 42} fs={12.5} bold>
                  {l.label}
                </T>
                <line x1={20} y1={y} x2={700} y2={y} stroke="var(--fig-line)" strokeWidth={2} />
                <rect x={x - 18} y={y - 24} width={36} height={24} rx={3} fill="var(--fig-box3)" stroke="var(--fig-line)" />
                {v > 1 && <Vel x1={x + 20} y1={y - 12} x2={x + 20 + v * 0.6} y2={y - 12} />}
                {v > 1 && l.dec > 0 && <Force x1={x - 20} y1={y - 6} x2={x - 20 - l.dec * 0.35} y2={y - 6} />}
              </g>
            )
          })}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図1-5 押す力と質量を変える（動・スライダー） ---------- */

export function FigPush() {
  const [force, setForce] = useState(2)
  const [mass, setMass] = useState<'1' | '2'>('1')
  const k = 38
  const a = (force / Number(mass)) * k
  const vmax = 3 * k * 3
  const gx = (t: number) => 90 + (t / 3) * 300
  const gy = (v: number) => 280 - (v / vmax) * 110
  return (
    <Anim
      n="1-5"
      title="押す力が大きいほど、質量が小さいほど、速さは早く増える"
      still={2}
      period={3.6}
      controls={
        <>
          <Range label="押す力" min={1} max={3} step={1} value={force} onChange={setForce} format={(v) => `${v}倍`} />
          <Choice
            label="台車の質量"
            options={[
              { value: '1', label: '1倍' },
              { value: '2', label: '2倍' },
            ]}
            value={mass}
            onChange={setMass}
          />
        </>
      }
      caption="押す力を2倍にすると、下のグラフの線の傾き（速さの増え方）も2倍になります。質量を2倍にすると、傾きは半分になります。点線は「力1倍・質量1倍」の線です。"
    >
      {(t) => {
        const tt = Math.min(t, 3)
        const x = 60 + 0.5 * a * tt * tt
        const v = a * tt
        return (
          <Svg id="1-5" w={680} h={300} label="一定の力で押し続けた台車の速さが、時間とともに一定の割合で増える。力を大きくすると増え方が大きくなり、質量を大きくすると小さくなる。">
            <line x1={20} y1={86} x2={670} y2={86} stroke="var(--fig-line)" strokeWidth={2} />
            <rect x={x - 22} y={56} width={44 + (mass === '2' ? 12 : 0)} height={24} rx={3} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <circle cx={x - 10} cy={82} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <circle cx={x + 14 + (mass === '2' ? 12 : 0)} cy={82} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <Force x1={x - 26 - force * 22} y1={68} x2={x - 24} y2={68} />
            {v > 2 && <Vel x1={x + 26 + (mass === '2' ? 12 : 0)} y1={46} x2={x + 26 + (mass === '2' ? 12 : 0) + v * 0.18} y2={46} />}
            <T x={20} y={22} fs={12} tone="muted">
              一定の力で押し続ける台車
            </T>
            {/* 速さのグラフ */}
            <line x1={gx(0)} y1={gy(0)} x2={gx(3) + 20} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(vmax) - 12} stroke="var(--fig-line)" />
            <T x={gx(3) + 26} y={gy(0)} fs={12}>
              時間
            </T>
            <T x={gx(0) - 8} y={gy(vmax) - 18} fs={12} anchor="end">
              速さ
            </T>
            <line x1={gx(0)} y1={gy(0)} x2={gx(3)} y2={gy(k * 3)} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(tt)} y2={gy(v)} stroke="var(--fig-accent)" strokeWidth={2.5} />
            <circle cx={gx(tt)} cy={gy(v)} r={5} fill="var(--fig-accent)" />
            <T x={450} y={190} fs={12.5}>
              {`押す力 ${force}倍、質量 ${mass}倍のとき`}
            </T>
            <T x={450} y={212} fs={12.5} tone="acc">
              {`速さの増え方は ${(force / Number(mass)).toFixed(1).replace('.0', '')}倍`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図1-6 質量と重さ ---------- */

export function FigMassWeight() {
  const panel = (x: number, place: string, len: number, note: string) => (
    <g>
      <T x={x + 140} y={22} anchor="middle" bold>
        {place}
      </T>
      <rect x={x + 20} y={170} width={240} height={18} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <Ball x={x + 140} y={100} r={22} />
      <T x={x + 140} y={100} anchor="middle" fs={12}>
        10kg
      </T>
      <Force x1={x + 140} y1={124} x2={x + 140} y2={124 + len} />
      <T x={x + 172} y={58} fs={12}>
        質量 10kg
      </T>
      <T x={x + 172} y={76} fs={12} tone="muted">
        （どこでも同じ）
      </T>
      <T x={x + 160} y={142} fs={12} tone="acc">
        {note}
      </T>
    </g>
  )
  return (
    <Figure n="1-6" title="質量はどこでも同じだが、重さは場所で変わる" caption="青の矢印は、天体が球を引く力（重さ）です。月の表面の重力は地球の約6分の1です（模式図。矢印の長さの比は目安）。">
      <Svg id="1-6" w={620} h={200} label="地球の上と月の上に置いた質量10kgの球。質量は同じだが、月の上で天体が引く力（重さ）は地球の約6分の1になる。">
        {panel(0, '地球の上', 42, '重さ（地球が引く力）')}
        {panel(320, '月の上', 7, '重さは約6分の1')}
      </Svg>
    </Figure>
  )
}

/* ---------- 図1-7 糸につないで回す球（動） ---------- */

export function FigCircle() {
  const [cut, setCut] = useState<'no' | 'yes'>('no')
  const cx = 230
  const cy = 130
  const R = 90
  const w = Math.PI / 2 // 1秒に4分の1周
  return (
    <Anim
      n="1-7"
      title="向きが変わるだけでも、力が必要になる"
      still={0.6}
      period={4}
      controls={
        <Choice
          label="糸"
          options={[
            { value: 'no', label: 'つないだまま' },
            { value: 'yes', label: '途中で切る' },
          ]}
          value={cut}
          onChange={setCut}
        />
      }
      caption="糸は球を中心の向きに引いています（青の矢印）。糸を切ると中心に向かう力がなくなり、球はその瞬間の向きにまっすぐ飛んでいきます。"
    >
      {(t) => {
        const cutAt = 2
        const ang = (u: number) => -Math.PI / 2 + w * u
        const free = cut === 'yes' && t > cutAt
        const a = ang(free ? cutAt : t)
        const bx0 = cx + R * Math.cos(a)
        const by0 = cy + R * Math.sin(a)
        const tx = -Math.sin(a)
        const ty = Math.cos(a)
        const s = free ? (t - cutAt) * w * R : 0
        const bx = bx0 + tx * s
        const by = by0 + ty * s
        return (
          <Svg id="1-7" w={620} h={260} label="糸につないで回す球。速さの向きは円の接線の向きで、糸は球を中心に向けて引く。糸を切ると、球はその瞬間の向きにまっすぐ進む。">
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <circle cx={cx} cy={cy} r={4} fill="var(--fig-line)" />
            <T x={cx - 12} y={cy + 4} anchor="end" fs={12} tone="muted">
              中心
            </T>
            {!free && <line x1={cx} y1={cy} x2={bx} y2={by} stroke="var(--fig-line)" strokeWidth={1.5} />}
            {free && <Trail points={[[bx0, by0], [bx, by]]} />}
            {!free && <Force x1={bx} y1={by} x2={bx + (cx - bx) * 0.45} y2={by + (cy - by) * 0.45} />}
            <Vel x1={bx} y1={by} x2={bx + tx * 60} y2={by + ty * 60} />
            <Ball x={bx} y={by} r={11} />
            <T x={420} y={70} fs={12.5}>
              {free ? '糸が切れた後：' : '糸でつないでいる間：'}
            </T>
            <T x={420} y={92} fs={12.5}>
              {free ? '中心へ引く力がない' : '中心へ引く力（糸）'}
            </T>
            <T x={420} y={114} fs={12.5}>
              {free ? '→ まっすぐ進む' : '→ 向きが変わり続ける'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図1-8 ボートの上で押し合う2人（動） ---------- */

function Boat({ x, mass, name }: { x: number; mass: number; name: string }) {
  const big = mass > 60
  return (
    <g>
      <path d={`M${x - 34},120 Q${x},150 ${x + 34},120 Z`} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <circle cx={x} cy={big ? 74 : 80} r={big ? 9 : 7.5} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <line x1={x} y1={big ? 83 : 88} x2={x} y2={118} stroke="var(--fig-line)" strokeWidth={big ? 5 : 3} />
      <T x={x} y={40} anchor="middle" fs={12}>
        {name}
      </T>
      <T x={x} y={56} anchor="middle" fs={11.5} tone="muted">
        {`${mass}kg`}
      </T>
    </g>
  )
}

export function FigBoats() {
  const u = 35
  return (
    <Anim n="1-8" title="押した人も、同じ大きさの力で押し返される" still={2.6} period={5}
      caption="押している一瞬だけ、2人の手の間に向きが逆で大きさの等しい力がはたらきます（青の矢印）。質量が半分のAさんは、Bさんの2倍の速さで動きます。">
      {(t) => {
        const push = t >= 0.5 && t < 0.9
        const after = Math.max(0, t - 0.7)
        const ax = 330 - 2 * u * after
        const bx = 390 + u * after
        return (
          <Svg id="1-8" w={720} h={170} label="ボートに乗った2人が押し合うと、2人とも反対向きに動き出す。質量の小さい人ほど速く動く。">
            <rect x={0} y={128} width={720} height={42} fill="var(--fig-box3)" opacity={0.6} />
            <Boat x={ax} mass={50} name="Aさん" />
            <Boat x={bx} mass={100} name="Bさん" />
            {after < 0.25 && (
              <>
                <line x1={ax} y1={96} x2={359} y2={96} stroke="var(--fig-line)" strokeWidth={2.5} />
                <line x1={bx} y1={96} x2={361} y2={96} stroke="var(--fig-line)" strokeWidth={3.5} />
              </>
            )}
            {push && (
              <>
                <Force x1={360} y1={100} x2={ax - 36} y2={100} />
                <Force x1={360} y1={100} x2={bx + 36} y2={100} />
              </>
            )}
            {after > 0.2 && (
              <>
                <Vel x1={ax - 40} y1={112} x2={ax - 40 - 2 * u * 0.9} y2={112} />
                <Vel x1={bx + 40} y1={112} x2={bx + 40 + u * 0.9} y2={112} />
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図1-9 ロケットが進むしくみ ---------- */

export function FigRocket() {
  return (
    <Figure n="1-9" title="ロケットはガスを押し出し、ガスに押し返されて進む" caption="ロケットはまわりの空気を押して進むのではありません。空気のない宇宙でも、同じしくみで加速できます。">
      <Svg id="1-9" w={680} h={170} label="ロケットがガスを後ろへ押す力と、ガスがロケットを前へ押し返す力。2つの力は向きが逆で大きさが等しい。">
        <path d="M300,60 L470,60 Q530,85 470,110 L300,110 Z" fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <path d="M300,60 L280,48 L280,122 L300,110 Z" fill="var(--fig-box)" stroke="var(--fig-line)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={250 - i * 34} cy={85 + (i % 2 ? 9 : -7)} r={9 - i} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        ))}
        <Force x1={290} y1={85} x2={170} y2={85} />
        <T x={60} y={30} fs={12.5}>
          ロケットがガスを後ろへ押す力
        </T>
        <line x1={170} y1={40} x2={210} y2={78} stroke="var(--fig-muted)" />
        <Force x1={480} y1={85} x2={600} y2={85} />
        <T x={480} y={130} fs={12.5}>
          ガスがロケットを前へ押す力
        </T>
        <T x={480} y={150} fs={12} tone="muted">
          （向きは逆、大きさは同じ）
        </T>
      </Svg>
    </Figure>
  )
}
