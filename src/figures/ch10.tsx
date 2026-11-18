import { useState, type ReactElement } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Vel, ease } from './common'

/** 光の色（実際の光の色に近い固定色。色だけで区別せず、文字を添える） */
const RED = '#d64545'
const ORANGE = '#e8862a'
const YELLOW = '#d4b81f'
const GREEN = '#3f9e4a'
const BLUE = '#3b6fd1'
const VIOLET = '#8a4fc9'
const RAINBOW = [RED, ORANGE, YELLOW, GREEN, BLUE, VIOLET]
/** 火花・日光・光るスクリーンの色 */
const GLOW = '#f2c94c'
const GLOW_DARK = '#c99a1a'

/** 火花のジグザグ（x1,y1 から x2,y2 まで） */
function Spark({ x1, y1, x2, y2, opacity = 1 }: { x1: number; y1: number; x2: number; y2: number; opacity?: number }) {
  const n = 4
  let d = `M${x1},${y1}`
  for (let i = 1; i < n; i++) {
    const f = i / n
    const off = i % 2 ? 4 : -4
    const nx = -(y2 - y1)
    const ny = x2 - x1
    const len = Math.hypot(nx, ny) || 1
    d += ` L${(x1 + (x2 - x1) * f + (nx / len) * off).toFixed(1)},${(y1 + (y2 - y1) * f + (ny / len) * off).toFixed(1)}`
  }
  d += ` L${x2},${y2}`
  return <path d={d} fill="none" stroke={GLOW_DARK} strokeWidth={2.5} strokeLinejoin="round" opacity={opacity} />
}

/** 送信機（真ん中で切った金属の棒と、すき間の両側の球）。cx, cy はすき間の中心 */
function Dipole({ cx, cy, half = 70, spark = 0 }: { cx: number; cy: number; half?: number; spark?: number }) {
  return (
    <g>
      <rect x={cx - 4} y={cy - 8 - half} width={8} height={half} rx={2} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <rect x={cx - 4} y={cy + 8} width={8} height={half} rx={2} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <circle cx={cx} cy={cy - 7} r={5} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <circle cx={cx} cy={cy + 7} r={5} fill="var(--fig-box)" stroke="var(--fig-line)" />
      {spark > 0 && <Spark x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} opacity={spark} />}
    </g>
  )
}

/* ---------- 図10-1 赤の外側と紫の外側（動・切り替え） ---------- */

const SLOTS = [
  { name: '赤の外側', color: null, heat: 1, chem: 0 },
  { name: '赤', color: RED, heat: 0.76, chem: 0.05 },
  { name: '緑', color: GREEN, heat: 0.36, chem: 0.25 },
  { name: '紫', color: VIOLET, heat: 0.22, chem: 0.65 },
  { name: '紫の外側', color: null, heat: 0, chem: 0.95 },
]

export function FigInvisible() {
  const [tool, setTool] = useState<'thermo' | 'silver'>('thermo')
  const thermo = tool === 'thermo'
  const best = thermo ? 0 : 4
  return (
    <Anim
      n="10-1"
      title="温度計は赤の外側で、塩化銀は紫の外側で、最も大きく変わる"
      still={6}
      period={8}
      controls={
        <Choice
          label="調べる道具"
          options={[
            { value: 'thermo', label: '温度計（ハーシェル）' },
            { value: 'silver', label: '塩化銀（リッター）' },
          ]}
          value={tool}
          onChange={setTool}
        />
      }
      caption="模式図です。プリズムで分けた日光の色の中と、その外側に、温度計（左）または塩化銀（右）を置いています。温度計の上がり方の比は、ハーシェルの1800年の記録をもとにした目安です。色の帯の幅や並びの間隔は実際と違います。"
    >
      {(t) => {
        const f = ease(Math.min(t, 5) / 5)
        return (
          <Svg id="10-1" w={720} h={310} label="プリズムで分けた日光の色の帯の中と外に、温度計または塩化銀を置いた図。温度計は赤の外側の見えない所で最も大きく上がり、紫の外側では上がらない。塩化銀は紫の外側で最も強く黒くなり、赤の外側では変わらない。">
            <line x1={20} y1={58} x2={124} y2={74} stroke={GLOW_DARK} strokeWidth={4} />
            <T x={20} y={40} fs={12.5}>
              日光
            </T>
            <path d="M100,112 L164,112 L132,52 Z" fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={132} y={128} anchor="middle" fs={12}>
              プリズム
            </T>
            <T x={700} y={24} anchor="end" fs={12.5} tone="muted">
              {thermo ? '温度の上がり方（ハーシェル、1800年）' : '塩化銀の黒くなり方（リッター、1801年）'}
            </T>
            {SLOTS.map((s, i) => {
              const cx = 250 + i * 100
              return (
                <g key={s.name}>
                  {s.color ? (
                    <line x1={150} y1={92} x2={cx} y2={150} stroke={s.color} strokeWidth={2} />
                  ) : (
                    <line x1={150} y1={92} x2={cx} y2={150} stroke="var(--fig-muted)" strokeWidth={1.2} strokeDasharray="4 4" />
                  )}
                  <rect
                    x={cx - 50}
                    y={150}
                    width={100}
                    height={20}
                    fill={s.color ?? 'none'}
                    opacity={s.color ? 0.85 : 1}
                    stroke={s.color ? 'none' : 'var(--fig-muted)'}
                    strokeDasharray={s.color ? undefined : '4 3'}
                  />
                  {!s.color && (
                    <T x={cx} y={160} anchor="middle" fs={11} tone="muted">
                      （見えない）
                    </T>
                  )}
                  {thermo ? (
                    <g>
                      <rect x={cx - 5} y={192} width={10} height={76} rx={5} fill="var(--fig-bg)" stroke="var(--fig-line)" />
                      <circle cx={cx} cy={274} r={9} fill="var(--fig-line)" stroke="var(--fig-line)" />
                      <rect x={cx - 2.5} y={262 - f * s.heat * 64} width={5} height={8 + f * s.heat * 64} fill="var(--fig-line)" />
                    </g>
                  ) : (
                    <g>
                      <rect x={cx - 26} y={204} width={52} height={52} fill="#fbfbf8" stroke="var(--fig-line)" />
                      <rect x={cx - 26} y={204} width={52} height={52} fill="#2b2b2b" opacity={f * s.chem * 0.9} />
                    </g>
                  )}
                  <T x={cx} y={297} anchor="middle" fs={12.5}>
                    {s.name}
                  </T>
                  {i === best && f > 0.6 && (
                    <T x={cx} y={184} anchor="middle" fs={12} tone="acc">
                      {thermo ? '最も上がる' : '最も強く黒くなる'}
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

/* ---------- 図10-2 ヘルツの送信機と受信機（動） ---------- */

const HZ = { cx: 210, cy: 140, rx: 570, rr: 38, v: 110, S: 1.8, lam: 34 }

export function FigHertz() {
  const dist = HZ.rx + HZ.rr - HZ.cx // 送信機から受信機のすき間までの距離
  return (
    <Anim
      n="10-2"
      title="送信機で火花が飛ぶと、離れた受信機の輪のすき間にも火花が飛ぶ"
      still={0.02}
      period={HZ.S}
      caption="模式図です。誘導コイルで送信機の球の間に火花を飛ばすと、棒の中を電気がとても速く往復し、電磁波が広がります（青の弧）。電磁波が届くと、受信機の輪のすき間に小さな火花が飛びます。距離や波の間隔は実際と違います。"
    >
      {(t) => {
        const arcs: ReactElement[] = []
        let recv = 0
        for (let m = 0; m < 4; m++) {
          for (let j = 0; j < 3; j++) {
            const r = HZ.v * (t + m * HZ.S) - j * HZ.lam
            if (r <= 44 || r > dist + 6) continue // 送信機のそばの「火花」の文字にかからないように少し離れてから描く
            const a = Math.min((Math.PI / 180) * 48, Math.asin(Math.min(1, 78 / r))) // 上下の文字にかからない高さまで
            const op = (1 - j * 0.3) * Math.max(0.15, 1 - r / 460)
            arcs.push(
              <path
                key={`${m}-${j}`}
                d={`M${(HZ.cx + r * Math.cos(-a)).toFixed(1)},${(HZ.cy + r * Math.sin(-a)).toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${(HZ.cx + r * Math.cos(a)).toFixed(1)},${(HZ.cy + r * Math.sin(a)).toFixed(1)}`}
                fill="none"
                stroke="var(--fig-accent)"
                strokeWidth={2}
                opacity={op}
              />,
            )
            if (Math.abs(r - dist) < 14) recv = Math.max(recv, 1 - j * 0.3)
          }
        }
        const sparkOn = t < 0.25
        const ga = (10 * Math.PI) / 180
        const gx = HZ.rx + HZ.rr * Math.cos(ga)
        return (
          <Svg id="10-2" w={720} h={290} label="左に誘導コイルにつないだ送信機、右に数m離して置いた、すき間のある針金の輪の受信機。送信機で火花が飛ぶと電磁波が広がり、届いたときに受信機のすき間にも小さな火花が飛ぶ。">
            {arcs}
            <Box x={20} y={196} w={112} h={44} lines="誘導コイル" fill="box2" fs={12.5} />
            <path d={`M56,196 L56,${HZ.cy - 22} L${HZ.cx - 4},${HZ.cy - 22}`} fill="none" stroke="var(--fig-line)" />
            <path d={`M96,196 L96,${HZ.cy + 22} L${HZ.cx - 4},${HZ.cy + 22}`} fill="none" stroke="var(--fig-line)" />
            <Dipole cx={HZ.cx} cy={HZ.cy} spark={sparkOn ? 1 : 0} />
            <T x={HZ.cx} y={34} anchor="middle" fs={12.5} bold>
              送信機
            </T>
            <T x={HZ.cx} y={52} anchor="middle" fs={11.5} tone="muted">
              （切った棒と2つの球）
            </T>
            {sparkOn && (
              <T x={HZ.cx + 14} y={HZ.cy} fs={12} tone="acc">
                火花
              </T>
            )}
            <path
              d={`M${gx.toFixed(1)},${(HZ.cy - HZ.rr * Math.sin(ga)).toFixed(1)} A${HZ.rr},${HZ.rr} 0 1 0 ${gx.toFixed(1)},${(HZ.cy + HZ.rr * Math.sin(ga)).toFixed(1)}`}
              fill="none"
              stroke="var(--fig-line)"
              strokeWidth={2.5}
            />
            {recv > 0 && <Spark x1={gx} y1={HZ.cy - 6} x2={gx} y2={HZ.cy + 6} opacity={recv} />}
            {recv > 0 && (
              <T x={gx + 10} y={HZ.cy} fs={12} tone="acc">
                小さな火花
              </T>
            )}
            <T x={HZ.rx} y={34} anchor="middle" fs={12.5} bold>
              受信機
            </T>
            <T x={HZ.rx} y={52} anchor="middle" fs={11.5} tone="muted">
              （すき間のある針金の輪）
            </T>
            <Arrow x1={HZ.cx + 14} y1={256} x2={HZ.rx - 4} y2={256} both />
            <T x={(HZ.cx + HZ.rx) / 2} y={274} anchor="middle" fs={12}>
              数mから十数m
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図10-3 はね返った波と重なってできる定在波（動・スライダー） ---------- */

const ST = { wall: 660, axis: 120, amp: 52, perM: 50, lamM: 4.8, ringY: 226 }

export function FigStanding() {
  const [d, setD] = useState(3.6)
  const k = (2 * Math.PI) / (ST.lamM * ST.perM)
  const env = (x: number) => Math.abs(Math.sin(k * (ST.wall - x)))
  const rx = ST.wall - d * ST.perM
  const a = env(rx)
  const status = a > 0.8 ? '火花が強い' : a > 0.3 ? '火花が弱い' : '火花が飛ばない'
  const nodes = [540, 420, 300, 180]
  return (
    <Anim
      n="10-3"
      title="はね返った波と重なると、火花が強い所と飛ばない所が交互に並ぶ"
      still={0}
      period={1.2}
      controls={<Range label="受信機の位置（板からの距離）" min={0} max={9.6} step={0.2} value={d} onChange={setD} format={(v) => `${v.toFixed(1)}m`} />}
      caption="模式図です。板が波を完全にはね返すとして、波長4.8mの波を描いています。青の線は、ある瞬間の電場の強さと向き、点線はその場所で揺れる幅です。「受信機の位置」を2.4mや4.8mにすると火花は飛ばず、1.2mや3.6mにすると最も強く飛びます。"
    >
      {(t) => {
        const c = Math.cos((2 * Math.PI * t) / 1.2)
        let dw = ''
        let up = ''
        let lo = ''
        for (let x = 60; x <= ST.wall; x += 3) {
          const s = Math.sin(k * (ST.wall - x))
          const p = x === 60 ? 'M' : 'L'
          dw += `${p}${x},${(ST.axis - ST.amp * s * c).toFixed(1)}`
          up += `${p}${x},${(ST.axis - ST.amp * Math.abs(s)).toFixed(1)}`
          lo += `${p}${x},${(ST.axis + ST.amp * Math.abs(s)).toFixed(1)}`
        }
        const sparkOp = a * Math.abs(c)
        return (
          <Svg id="10-3" w={720} h={252} label="左の送信機から出た波が、右の亜鉛の板ではね返り、進む波と重なって、その場で揺れるだけの波になる。揺れない所（節）は板から波長の半分ごとに並び、受信機を節に置くと火花は飛ばず、節と節の真ん中では最も強く飛ぶ。">
            <T x={20} y={26} fs={12.5}>
              送信機
            </T>
            <Dipole cx={36} cy={ST.axis} half={34} />
            <T x={ST.wall + 12} y={26} anchor="end" fs={12.5}>
              亜鉛の板（波をはね返す）
            </T>
            <rect x={ST.wall} y={50} width={12} height={150} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <line x1={60} y1={ST.axis} x2={ST.wall} y2={ST.axis} stroke="var(--fig-muted)" />
            <path d={up} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <path d={lo} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <path d={dw} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            {nodes.map((x) => (
              <g key={x}>
                <circle cx={x} cy={ST.axis} r={3.5} fill="var(--fig-line)" />
                <T x={x} y={ST.axis - 22} anchor="middle" fs={12}>
                  節
                </T>
              </g>
            ))}
            <Arrow x1={302} y1={50} x2={418} y2={50} both />
            <T x={360} y={34} anchor="middle" fs={12}>
              節と節の間は波長の半分
            </T>
            <line x1={rx} y1={ST.axis} x2={rx} y2={ST.ringY - 13} stroke="var(--fig-muted)" strokeDasharray="2 3" />
            <circle cx={rx} cy={ST.ringY} r={11} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
            {sparkOp > 0.15 && <Spark x1={rx + 11} y1={ST.ringY - 5} x2={rx + 11} y2={ST.ringY + 5} opacity={sparkOp} />}
            <T x={rx - 18} y={ST.ringY} anchor="end" fs={12.5} tone={a > 0.3 ? 'acc' : undefined}>
              {`受信機：${status}`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図10-4 1888年12月の実験：反射・屈折・格子 ---------- */

/** 放物面の鏡を横から見た形（開いた側が ang の向き）。cx, cy は焦点のあたり */
function Mirror({ cx, cy, ang }: { cx: number; cy: number; ang: number }) {
  const pts: string[] = []
  for (let i = -6; i <= 6; i++) {
    const u = i * 3.2
    const back = -14 + (u * u) / 60
    const x = cx + back * Math.cos(ang) - u * Math.sin(ang)
    const y = cy + back * Math.sin(ang) + u * Math.cos(ang)
    pts.push(`${i === -6 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return <path d={pts.join(' ')} fill="none" stroke="var(--fig-line)" strokeWidth={3} />
}

export function FigRays() {
  return (
    <Figure
      n="10-4"
      title="ヘルツの波は、光と同じように、はね返り、曲がり、揺れの向きで通り方が変わった"
      caption="1888年12月に発表された実験の模式図です。送る鏡と受ける鏡は、亜鉛の板を曲げて作った高さ2mの鏡です。黒の矢印は波の進む向きを表します。格子は、平行に張った金属線の枠です。大きさや角度は実際と違います。"
    >
      <Svg id="10-4" w={720} h={250} label="3つの実験。左：金属の板に斜めに当てると、入る角度と同じ角度ではね返る。中：ピッチで作ったプリズムを通ると、進む向きが曲がり、まっすぐの向きには届かない。右：金属線の格子は、線が電場の振れる向きと平行なら電波を止め、直角なら通す。">
        <line x1={240} y1={20} x2={240} y2={236} stroke="var(--fig-box)" strokeWidth={2} />
        <line x1={480} y1={20} x2={480} y2={236} stroke="var(--fig-box)" strokeWidth={2} />
        {/* 反射 */}
        <T x={12} y={22} fs={12.5} bold>
          はね返る
        </T>
        <rect x={70} y={56} width={100} height={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={120} y={44} anchor="middle" fs={12}>
          金属の板
        </T>
        <Mirror cx={64} cy={176} ang={-1.13} />
        <Mirror cx={176} cy={176} ang={-2.01} />
        <Vel x1={66} y1={170} x2={118} y2={68} />
        <Vel x1={122} y1={68} x2={174} y2={170} />
        <line x1={120} y1={68} x2={120} y2={150} stroke="var(--fig-muted)" strokeDasharray="3 4" />
        <T x={120} y={164} anchor="middle" fs={11.5} tone="muted">
          同じ角度
        </T>
        <T x={64} y={214} anchor="middle" fs={12}>
          送る鏡
        </T>
        <T x={176} y={214} anchor="middle" fs={12}>
          受ける鏡
        </T>
        {/* 屈折 */}
        <T x={252} y={22} fs={12.5} bold>
          プリズムで曲がる
        </T>
        <Mirror cx={268} cy={92} ang={0} />
        <path d="M326,58 L326,168 L384,113 Z" fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <Vel x1={272} y1={92} x2={325} y2={92} />
        <line x1={326} y1={92} x2={357} y2={110} stroke="var(--fig-line)" strokeWidth={1.5} />
        <Vel x1={357} y1={110} x2={420} y2={170} />
        <line x1={357} y1={92} x2={440} y2={92} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <Cross x={452} y={92} s={7} />
        <T x={430} y={58} anchor="middle" fs={11.5} tone="muted">
          まっすぐの向き
        </T>
        <T x={430} y={74} anchor="middle" fs={11.5} tone="muted">
          には届かない
        </T>
        <Mirror cx={428} cy={180} ang={-2.4} />
        <T x={330} y={196} anchor="middle" fs={12}>
          ピッチのプリズム
        </T>
        <T x={330} y={214} anchor="middle" fs={11.5} tone="muted">
          （高さ1.5m）
        </T>
        <T x={428} y={222} anchor="middle" fs={12}>
          受ける鏡
        </T>
        {/* 格子 */}
        <T x={492} y={22} fs={12.5} bold>
          金属線の格子
        </T>
        {[0, 1].map((row) => {
          const y = 76 + row * 100
          const vertical = row === 0
          return (
            <g key={row}>
              <Arrow x1={504} y1={y - 16} x2={504} y2={y + 16} both />
              <T x={492} y={y - 36} fs={11} tone="muted">
                電場の振れる向き
              </T>
              <Vel x1={516} y1={y} x2={568} y2={y} />
              <rect x={574} y={y - 26} width={36} height={52} fill="none" stroke="var(--fig-muted)" />
              {[0, 1, 2, 3].map((i) =>
                vertical ? (
                  <line key={i} x1={580 + i * 8} y1={y - 26} x2={580 + i * 8} y2={y + 26} stroke="var(--fig-line)" strokeWidth={2} />
                ) : (
                  <line key={i} x1={574} y1={y - 20 + i * 13} x2={610} y2={y - 20 + i * 13} stroke="var(--fig-line)" strokeWidth={2} />
                ),
              )}
              {vertical ? (
                <>
                  <Cross x={630} y={y} s={7} />
                  <T x={646} y={y} fs={12}>
                    止まる
                  </T>
                </>
              ) : (
                <>
                  <Vel x1={616} y1={y} x2={660} y2={y} />
                  <T x={666} y={y} fs={12}>
                    通る
                  </T>
                </>
              )}
              <T x={592} y={y + 40} anchor="middle" fs={11.5} tone="muted">
                {vertical ? '線が振れる向きと平行' : '線が振れる向きと直角'}
              </T>
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図10-5 波長で並べた電磁波の一覧 ---------- */

const BANDS = [
  { name: '電波', x0: 30, x1: 230, fill: 'var(--fig-box3)', ex: ['ラジオ、テレビ', '携帯電話'], who: ['1886〜1888年', 'ヘルツ'] },
  { name: '赤外線', x0: 230, x1: 360, fill: 'var(--fig-box2)', ex: ['リモコン', '物を温める'], who: ['1800年', 'ハーシェル'] },
  { name: '可視光', x0: 360, x1: 400, fill: 'none', ex: ['虹の色'], who: [] },
  { name: '紫外線', x0: 400, x1: 510, fill: 'var(--fig-box5)', ex: ['日焼け'], who: ['1801年', 'リッター'] },
  { name: 'X線', x0: 510, x1: 610, fill: 'var(--fig-box4)', ex: ['レントゲン', '写真'], who: ['1895年', 'レントゲン'] },
  { name: 'γ線', x0: 610, x1: 700, fill: 'var(--fig-box)', ex: ['原子核', 'から出る'], who: ['1900年', 'ヴィラール'] },
]

const EDGES = [
  { x: 230, label: '約1mm', row: 0 },
  { x: 360, label: '約1万分の7mm', row: 1 },
  { x: 400, label: '約1万分の4mm', row: 0 },
  { x: 510, label: '約10万分の1mm', row: 1 },
  { x: 610, label: '約1億分の1mm', row: 0 },
]

export function FigSpectrum() {
  return (
    <Figure
      n="10-5"
      title="電波からγ線まで、電磁波を波長の順に並べると"
      caption="帯の下の数は、となりの範囲との境目のおよその波長です。境目ははっきり決まっておらず、資料によって少し違います。それぞれの範囲の幅は模式的なもので、実際の比とは違います。下の段は、それぞれが見つかった年と見つけた人です。"
    >
      <Svg id="10-5" w={720} h={296} label="電磁波を波長の長い順に左から並べた一覧。電波、赤外線、可視光、紫外線、X線、γ線の順で、可視光はごく狭い範囲である。赤外線は1800年にハーシェル、紫外線は1801年にリッター、電波は1886〜1888年にヘルツ、X線は1895年にレントゲン、γ線は1900年にヴィラールが見つけた。">
        <T x={30} y={30} fs={12.5}>
          波長が長い（振動数が少ない）
        </T>
        <T x={700} y={30} anchor="end" fs={12.5}>
          波長が短い（振動数が多い）
        </T>
        <Arrow x1={32} y1={50} x2={698} y2={50} both />
        <T x={380} y={92} anchor="middle" fs={12.5} bold>
          可視光
        </T>
        {BANDS.map((b) => {
          const cx = (b.x0 + b.x1) / 2
          return (
            <g key={b.name}>
              {b.fill !== 'none' && <rect x={b.x0} y={104} width={b.x1 - b.x0} height={40} fill={b.fill} stroke="var(--fig-line)" />}
              {b.name !== '可視光' && (
                <T x={cx} y={124} anchor="middle" fs={13} bold>
                  {b.name}
                </T>
              )}
              {b.ex.map((e, i) => (
                <T key={e} x={cx} y={206 + i * 17} anchor="middle" fs={12}>
                  {e}
                </T>
              ))}
              {b.who.map((w, i) => (
                <T key={w} x={cx} y={258 + i * 17} anchor="middle" fs={12} tone={i === 0 ? 'acc' : 'muted'}>
                  {w}
                </T>
              ))}
            </g>
          )
        })}
        {RAINBOW.map((c, i) => (
          <rect key={c} x={360 + (i * 40) / 6} y={104} width={40 / 6 + 0.3} height={40} fill={c} />
        ))}
        <rect x={360} y={104} width={40} height={40} fill="none" stroke="var(--fig-line)" />
        {EDGES.map((e) => (
          <g key={e.x}>
            <line x1={e.x} y1={144} x2={e.x} y2={152 + e.row * 18} stroke="var(--fig-line)" />
            <T x={e.x} y={162 + e.row * 18} anchor="middle" fs={11.5} tone="muted">
              {e.label}
            </T>
          </g>
        ))}
      </Svg>
    </Figure>
  )
}

/* ---------- 図10-6 波長を変えると名前と性質が変わる（動・スライダー） ---------- */

/** スライダーの値 s（0〜150）から波長の常用対数（メートル）へ。0 で 1km、150 で 10億分の1mm */
const logLam = (s: number) => 3 - s * 0.1

/** 1けたに丸める（2345 → 2000） */
const round1 = (v: number) => {
  const e = Math.pow(10, Math.floor(Math.log10(v)))
  return Math.round(v / e) * e
}

/** 大きな数を「2000」「5万」「30億」のように書く */
const jpNum = (n: number) => (n >= 1e8 ? `${round1(n) / 1e8}億` : n >= 1e4 ? `${round1(n) / 1e4}万` : `${round1(n)}`)

/** 波長（メートル）を日本語で書く */
function lamText(m: number): string {
  if (m >= 1000) return `約${round1(m / 1000)}km`
  if (m >= 1) return `約${round1(m)}m`
  if (m >= 0.01) return `約${round1(m * 100)}cm`
  if (m >= 0.001) return `約${round1(m * 1000)}mm`
  return `約${jpNum(1 / (m * 1000))}分の1mm`
}

function visibleColor(m: number): { name: string; color: string } {
  if (m >= 6.2e-7) return { name: '赤', color: RED }
  if (m >= 5.9e-7) return { name: '橙', color: ORANGE }
  if (m >= 5.7e-7) return { name: '黄', color: YELLOW }
  if (m >= 4.95e-7) return { name: '緑', color: GREEN }
  if (m >= 4.5e-7) return { name: '青', color: BLUE }
  return { name: '紫', color: VIOLET }
}

function bandOf(m: number): { name: string; lines: string[]; color: string } {
  if (m > 1e-3) return { name: '電波', lines: ['建物や山の陰にも回り込んで届く', 'ラジオ、テレビ、携帯電話に使う'], color: 'var(--fig-accent)' }
  if (m >= 7e-7) return { name: '赤外線', lines: ['目に見えないが、当たった物を温める', 'テレビのリモコンにも使う'], color: 'var(--fig-accent)' }
  if (m >= 3.8e-7) {
    const v = visibleColor(m)
    return { name: '可視光', lines: ['人の目に見える。波長で色が変わる', `この波長は${v.name}に見える`], color: v.color }
  }
  if (m >= 1e-8) return { name: '紫外線', lines: ['目に見えないが、日焼けを起こす', '物に化学変化を起こしやすい'], color: 'var(--fig-accent)' }
  if (m >= 1e-11) return { name: 'X線', lines: ['体を通り抜け、骨や金属の影を写す', '1895年にレントゲンが見つけた'], color: 'var(--fig-accent)' }
  return { name: 'γ線', lines: ['原子核から出る（第27章）', 'X線よりもさらに波長が短い'], color: 'var(--fig-accent)' }
}

/** 下の目盛りの帯（スライダーの値 s の範囲） */
const STRIP = [
  { name: '電波', s0: 0, s1: 60, fill: 'var(--fig-box3)' },
  { name: '赤外線', s0: 60, s1: 91.5, fill: 'var(--fig-box2)' },
  { name: '可視光', s0: 91.5, s1: 94.2, fill: GREEN },
  { name: '紫外線', s0: 94.2, s1: 110, fill: 'var(--fig-box5)' },
  { name: 'X線', s0: 110, s1: 140, fill: 'var(--fig-box4)' },
  { name: 'γ線', s0: 140, s1: 150, fill: 'var(--fig-box)' },
]
const SX = (s: number) => 110 + (s / 150) * 580

export function FigWavelength() {
  const [s, setS] = useState(93)
  const m = Math.pow(10, logLam(s))
  const band = bandOf(m)
  const wl = 560 * Math.pow(14 / 560, s / 150) // 図の中の波長（模式的。実際の比ではない）
  const v = 70
  const AXIS = 150
  const AMP = 38
  return (
    <Anim
      n="10-6"
      title="波長を変えると、電磁波の名前と性質が変わる"
      still={0.3}
      controls={<Range label="波長" min={0} max={150} step={1} value={s} onChange={setS} format={() => lamText(m)} />}
      caption="「波長」を左へ動かすと波長が長く、右へ動かすと短くなります。図の中の波の長さは模式的なもので、実際の比とは違います。どの波長でも進む速さは同じなので、波長が短いほど、真ん中の点が1秒間に揺れる回数（振動数）が多くなります。下の帯は、いまの波長が一覧のどこに当たるかを示します。"
    >
      {(t) => {
        const step = Math.min(2, wl / 10)
        let d = ''
        for (let x = 30; x <= 690; x += step) d += `${x === 30 ? 'M' : 'L'}${x.toFixed(1)},${(AXIS - AMP * Math.sin((2 * Math.PI * (x - v * t)) / wl)).toFixed(1)}`
        const by = AXIS - AMP * Math.sin((2 * Math.PI * (360 - v * t)) / wl)
        const mx = SX(s)
        return (
          <Svg id="10-6" w={720} h={300} label={`いま選んでいる波長は${lamText(m)}で、${band.name}に当たる。${band.lines.join('。')}。`}>
            <T x={30} y={30} fs={17} bold>
              {band.name}
            </T>
            <T x={30} y={56} fs={12.5}>
              {`波長 ${lamText(m)}`}
            </T>
            {band.lines.map((l, i) => (
              <T key={l} x={320} y={30 + i * 22} fs={12.5}>
                {l}
              </T>
            ))}
            <T x={548} y={88} anchor="end" fs={12} tone="muted">
              進む速さはどれも同じ
            </T>
            <Vel x1={556} y1={88} x2={636} y2={88} />
            <line x1={30} y1={AXIS} x2={690} y2={AXIS} stroke="var(--fig-muted)" />
            <path d={d} fill="none" stroke={band.color} strokeWidth={2.2} />
            <Ball x={360} y={by} r={7} />
            <T x={360} y={208} anchor="middle" fs={12}>
              この点の揺れ
            </T>
            <T x={690} y={208} anchor="end" fs={11.5} tone="muted">
              波長が短いほど速く揺れる
            </T>
            <T x={30} y={262} fs={12}>
              一覧の
            </T>
            <T x={30} y={278} fs={12}>
              どこか
            </T>
            {STRIP.map((b) => (
              <g key={b.name}>
                <rect x={SX(b.s0)} y={254} width={SX(b.s1) - SX(b.s0)} height={16} fill={b.fill} stroke="var(--fig-line)" strokeWidth={0.8} />
                <T x={b.name === '可視光' ? SX(b.s1) - 1 : b.name === '紫外線' ? SX(b.s0) + 7 : (SX(b.s0) + SX(b.s1)) / 2} y={286} anchor={b.name === '可視光' ? 'end' : b.name === '紫外線' ? 'start' : 'middle'} fs={11.5}>
                  {b.name}
                </T>
              </g>
            ))}
            <path d={`M${mx - 6},${238} L${mx + 6},${238} L${mx},${250} Z`} fill="var(--fig-text)" />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図10-7 マルコーニの無線通信の距離 ---------- */

const MARCONI = [
  { y: '1895年', a: '父の屋敷で実験', b: '約2.4km' },
  { y: '1896年', a: 'イギリスで', b: '無線電信の特許' },
  { y: '1897年', a: 'イタリアで', b: '約19km' },
  { y: '1899年', a: 'イギリス海峡を', b: '越える' },
  { y: '1901年', a: '大西洋を越える', b: '約3400km' },
  { y: '1907年', a: '大西洋を越える', b: '商用の通信' },
]

export function FigMarconi() {
  return (
    <Figure
      n="10-7"
      title="マルコーニの無線通信は6年で数kmから大西洋の向こうまで届くようになった"
      caption="上下に交互に並べています。点の間隔は年数に比例していません。距離はノーベル財団の経歴にあるマイルの値を換算したものです。"
    >
      <Svg id="10-7" w={720} h={236} label="1895年に約2.4km、1896年にイギリスで特許、1897年にイタリアで約19km、1899年にイギリス海峡を越え、1901年に大西洋を越えて約3400km、1907年に大西洋を越える商用の通信が始まった。">
        <Arrow x1={20} y1={118} x2={705} y2={118} />
        {MARCONI.map((r, i) => {
          const x = 72 + i * 116
          const up = i % 2 === 0
          const ty = up ? 28 : 150
          return (
            <g key={r.y}>
              <circle cx={x} cy={118} r={6} fill={i === 4 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 90 : 125} x2={x} y2={up ? 111 : 140} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold>
                {r.y}
              </T>
              <T x={x} y={ty + 20} anchor="middle" fs={12}>
                {r.a}
              </T>
              <T x={x} y={ty + 40} anchor="middle" fs={12.5} tone={r.b.startsWith('約') ? 'acc' : 'muted'}>
                {r.b}
              </T>
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図10-8 レントゲンの実験 ---------- */

/** 手の形。x, y は左上。shadow のときは骨を濃く描く */
function Hand({ x, y, s = 1, skin, bone }: { x: number; y: number; s?: number; skin: string; bone?: string }) {
  const fingers = [
    { fx: 4, len: 44 },
    { fx: 16, len: 52 },
    { fx: 28, len: 50 },
    { fx: 40, len: 42 },
  ]
  const base = 54
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={0} y={base - 4} width={52} height={58} rx={10} fill={skin} />
      {fingers.map((f) => (
        <rect key={f.fx} x={f.fx} y={base - f.len} width={10} height={f.len + 6} rx={5} fill={skin} />
      ))}
      <line x1={6} y1={base + 34} x2={-14} y2={base + 8} stroke={skin} strokeWidth={11} strokeLinecap="round" />
      <rect x={8} y={base + 50} width={36} height={24} fill={skin} />
      {bone && (
        <g stroke={bone} strokeWidth={3.2} strokeLinecap="round">
          {fingers.map((f) => (
            <g key={f.fx}>
              <line x1={f.fx + 5} y1={base - f.len + 5} x2={f.fx + 5} y2={base - f.len * 0.62} />
              <line x1={f.fx + 5} y1={base - f.len * 0.55} x2={f.fx + 5} y2={base - f.len * 0.2} />
              <line x1={f.fx + 5} y1={base - f.len * 0.12} x2={f.fx + 5} y2={base + 8} />
              <line x1={f.fx + 5} y1={base + 14} x2={20 + f.fx * 0.3} y2={base + 44} />
            </g>
          ))}
          <line x1={-12} y1={base + 11} x2={-5} y2={base + 20} />
          <line x1={-2} y1={base + 24} x2={6} y2={base + 36} />
          <line x1={16} y1={base + 52} x2={16} y2={base + 72} />
          <line x1={34} y1={base + 52} x2={34} y2={base + 72} />
        </g>
      )}
      {bone && <rect x={26} y={base - 16} width={14} height={6} rx={3} fill="none" stroke={bone} strokeWidth={2.4} />}
    </g>
  )
}

export function FigXray() {
  return (
    <Figure
      n="10-8"
      title="黒い紙で覆った管から出た見えない光線が、手を通り抜けて蛍光板を光らせる"
      caption="レントゲンの1895年の実験の模式図です。蛍光板は当たると光る物質を塗った紙です。光線は肉を通り抜けやすく、骨は通り抜けにくいので、骨の濃い影が映ります。大きさは実際と違います。"
    >
      <Svg id="10-8" w={720} h={270} label="誘導コイルにつないだ放電管を黒い厚紙で覆っても、管から出た見えない光線が、間に置いた手を通り抜けて蛍光板を光らせる。蛍光板には、手の影の中に骨と指輪の濃い影が映る。">
        <Box x={20} y={204} w={112} h={40} lines="誘導コイル" fill="box2" fs={12.5} />
        <path d="M60,204 L60,150 L104,150" fill="none" stroke="var(--fig-line)" />
        <path d="M96,204 L96,186 L196,186 L196,150" fill="none" stroke="var(--fig-line)" />
        <rect x={100} y={84} width={100} height={64} rx={6} fill="#2e2e33" stroke="var(--fig-line)" />
        <ellipse cx={150} cy={116} rx={36} ry={20} fill="none" stroke="#9aa0aa" strokeDasharray="3 3" />
        <T x={150} y={56} anchor="middle" fs={12.5}>
          放電管を黒い厚紙で覆う
        </T>
        <T x={150} y={72} anchor="middle" fs={11.5} tone="muted">
          （中の空気をほとんど抜いた管）
        </T>
        {[-48, -24, 0, 24, 48].map((dy) => (
          <line key={dy} x1={202} y1={116} x2={520} y2={116 + dy * 1.9} stroke="var(--fig-muted)" strokeDasharray="5 5" />
        ))}
        <T x={226} y={30} fs={12.5}>
          見えない光線（X線）
        </T>
        <Hand x={370} y={50} s={0.92} skin="var(--fig-box2)" />
        <T x={394} y={186} anchor="middle" fs={12}>
          手
        </T>
        <rect x={520} y={20} width={10} height={200} fill={GLOW} stroke="var(--fig-line)" />
        <T x={525} y={236} anchor="middle" fs={12}>
          蛍光板
        </T>
        <T x={630} y={28} anchor="middle" fs={12.5}>
          蛍光板に映る影
        </T>
        <rect x={560} y={42} width={140} height={190} rx={4} fill={GLOW} opacity={0.75} stroke="var(--fig-line)" />
        <Hand x={612} y={62} s={0.95} skin="#b9b39a" bone="#3d3a32" />
        <T x={630} y={252} anchor="middle" fs={11.5} tone="muted">
          骨と指輪が濃く映る
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図10-9 19世紀末に残った2つの問題 ---------- */

export function FigProblems() {
  return (
    <Figure
      n="10-9"
      title="電磁波の理論のまわりに残った2つの問題と、それがつながる章"
      caption="左の理論から、19世紀の終わりに説明できなかった2つの問題が出てきました。右の章で、その答えになった新しい理論を扱います。"
    >
      <Svg id="10-9" w={720} h={250} label="電磁波の理論から2つの問題が出た。1つは、電磁波の速さは何に対しての速さかという、エーテルと地球の運動の問題で、第16章と第17章の相対性理論につながる。もう1つは、熱した物が出す光の波長ごとの強さが理論で説明できない問題で、第21章の量子論の始まりにつながる。">
        <Box x={16} y={96} w={180} h={60} lines={['電磁波の理論', '（マクスウェル、ヘルツ）']} fill="box3" bold subTone="muted" />
        <Box x={244} y={20} w={260} h={84} lines={['問題1：電磁波の速さは', '何に対しての速さか', '（エーテルと地球の運動）']} fill="box" />
        <Box x={244} y={146} w={260} h={84} lines={['問題2：熱した物が出す光の', '波長ごとの強さが', '理論と合わない']} fill="box" />
        <Box x={544} y={37} w={160} h={50} lines={['第16章・第17章', '相対性理論']} fill="box4" accent />
        <Box x={544} y={163} w={160} h={50} lines={['第21章', '量子論の始まり']} fill="box4" accent />
        <Arrow x1={196} y1={116} x2={240} y2={70} />
        <Arrow x1={196} y1={136} x2={240} y2={182} />
        <Arrow x1={504} y1={62} x2={540} y2={62} />
        <Arrow x1={504} y1={188} x2={540} y2={188} />
      </Svg>
    </Figure>
  )
}
