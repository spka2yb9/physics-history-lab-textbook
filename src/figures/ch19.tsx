import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Force, Trail, Vel, wave } from './common'

/*
 * 第19章の図の決まり：光（光の筋・光の合図）は第17章と同じ黄色（LIGHT）で描き、必ず文字を添える。
 * 重力や加速の大きさ、光の速さ、時計の進みの差は、見えるように大きく誇張している（各図の caption で断る）。
 */

const LIGHT = '#e0a000'

/** 光のかたまり（光の進み方を見せる印） */
function Pulse({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={5.5} fill={LIGHT} stroke="var(--fig-line)" strokeWidth={1} />
}

/** 光が通った道筋（黄色の点線） */
function LightTrail({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={LIGHT} strokeWidth={2} strokeDasharray="4 4" />
}

/** 時計の文字盤。frac は針の回転（1 で1周）。 */
function Clock({ x, y, r, frac }: { x: number; y: number; r: number; frac: number }) {
  const a = 2 * Math.PI * frac - Math.PI / 2
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
      {[0, 1, 2, 3].map((k) => {
        const b = (k * Math.PI) / 2
        return <line key={k} x1={x + (r - 4) * Math.cos(b)} y1={y + (r - 4) * Math.sin(b)} x2={x + r * Math.cos(b)} y2={y + r * Math.sin(b)} stroke="var(--fig-line)" />
      })}
      <line x1={x} y1={y} x2={x + (r - 6) * Math.cos(a)} y2={y + (r - 6) * Math.sin(a)} stroke="var(--fig-line)" strokeWidth={2} strokeLinecap="round" />
      <circle cx={x} cy={y} r={2} fill="var(--fig-line)" />
    </g>
  )
}

/** 棒人間。footY は足の位置。右手を前に出している */
function Person({ x, footY }: { x: number; footY: number }) {
  const hip = footY - 34
  const neck = footY - 66
  return (
    <g stroke="var(--fig-line)" strokeWidth={2} strokeLinecap="round" fill="none">
      <circle cx={x} cy={neck - 9} r={8} fill="var(--fig-bg)" />
      <line x1={x} y1={neck} x2={x} y2={hip} />
      <line x1={x} y1={hip} x2={x - 8} y2={footY} />
      <line x1={x} y1={hip} x2={x + 8} y2={footY} />
      <line x1={x} y1={neck + 8} x2={x + 22} y2={neck + 12} />
      <line x1={x} y1={neck + 8} x2={x - 10} y2={neck + 28} />
    </g>
  )
}

/** ロケットの炎（部屋の下に付ける） */
function Flame({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x + w * 0.3} y={y} width={w * 0.4} height={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <polygon points={`${x + w * 0.34},${y + 8} ${x + w * 0.5},${y + 26} ${x + w * 0.66},${y + 8}`} fill="var(--fig-box2)" stroke="var(--fig-line)" />
    </g>
  )
}

/** 宇宙空間の印（小さな点）。pts は (x0, y0) からのずれ */
function SpaceDots({ x0, y0, pts }: { x0: number; y0: number; pts: [number, number][] }) {
  return (
    <g>
      {pts.map(([u, v], i) => (
        <circle key={i} cx={x0 + u} cy={y0 + v} r={1.8} fill="var(--fig-muted)" />
      ))}
    </g>
  )
}

/* ---------- 図19-1 ニュートンの重力と光の速さ ---------- */

export function FigInstant() {
  const sun = (y: number) => (
    <g>
      <circle cx={100} cy={y} r={26} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={100} y={y} anchor="middle" fs={12}>
        太陽
      </T>
    </g>
  )
  const earth = (y: number) => (
    <g>
      <circle cx={620} cy={y} r={13} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={642} y={y} fs={12}>
        地球
      </T>
    </g>
  )
  return (
    <Figure
      n="19-1"
      title="ニュートンの重力は一瞬で伝わるとされたが、光は太陽から地球まで約8分20秒かかる"
      caption="模式図です。太陽と地球の大きさと距離の比は実際と違います。特殊相対性理論では、離れた2つの場所で「同じ瞬間」かどうかが見る人によって変わるので（第17章）、「同じ瞬間に伝わる」という決まりをそのまま使えません。"
    >
      <Svg id="19-1" w={720} h={250} label="上の段：ニュートンの理論では、太陽の位置が変わると、同じ瞬間に地球を引く力が変わる。下の段：光は太陽から地球まで約8分20秒かかり、特殊相対性理論ではこれより速く伝わるものはない。">
        <T x={20} y={22} bold fs={12.5}>
          ニュートンの重力
        </T>
        {sun(78)}
        <Arrow x1={130} y1={78} x2={602} y2={78} />
        <T x={366} y={58} anchor="middle" fs={12.5}>
          太陽が動くと、同じ瞬間に地球を引く力が変わる
        </T>
        <T x={366} y={98} anchor="middle" fs={12.5} tone="acc">
          伝わるのにかかる時間 0秒
        </T>
        {earth(78)}
        <line x1={20} y1={128} x2={700} y2={128} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        <T x={20} y={152} bold fs={12.5}>
          光（特殊相対性理論では、光より速く伝わるものはない）
        </T>
        {sun(200)}
        <path d={wave(132, 200, 452, 6, 28)} fill="none" stroke={LIGHT} strokeWidth={2.5} />
        <Arrow x1={584} y1={200} x2={603} y2={200} />
        <T x={366} y={178} anchor="middle" fs={12.5}>
          太陽を出た光が地球に届くまで
        </T>
        <T x={366} y={226} anchor="middle" fs={12.5} tone="acc">
          約8分20秒
        </T>
        {earth(200)}
      </Svg>
    </Figure>
  )
}

/* ---------- 図19-2 エレベーターの思考実験（動・切り替え） ---------- */

const ROOM = { dx: 20, w: 190, top: 76, floor: 232 }

export function FigElevator() {
  const [pair, setPair] = useState<'weight' | 'float'>('weight')
  const weight = pair === 'weight'
  const panels = weight
    ? [
        { title: '地上に止まっている部屋', kind: 'ground' },
        { title: '宇宙で加速するロケットの部屋', kind: 'rocket' },
      ]
    : [
        { title: '地上で落下しているエレベーター', kind: 'falling' },
        { title: '宇宙に浮かんでいる部屋', kind: 'space' },
      ]
  const g = 120 // 図の中の重力の強さ
  const vx = 55 // 球を投げ出す横の速さ
  return (
    <Anim
      n="19-2"
      title="窓のない部屋の中の人には、重力と加速を区別できない"
      still={0.9}
      period={2.8}
      controls={
        <Choice
          label="比べる組"
          options={[
            { value: 'weight', label: '重さを感じる場合' },
            { value: 'float', label: '重さを感じない場合' },
          ]}
          value={pair}
          onChange={setPair}
        />
      }
      caption="模式図です。部屋の中の人が、手に持った球を横向きに放します。「重さを感じる場合」では、左右どちらの部屋でも球は同じ形の道筋で床へ落ちます。「重さを感じない場合」では、人も球も浮かび、球はまっすぐ進みます。どちらの組でも、左右の部屋の中で起こることは同じです。"
    >
      {(t) => {
        const tt = Math.min(t, 2.4)
        const footY = weight ? ROOM.floor : ROOM.floor - 14
        const handX = 44 + 30 // 手の先（部屋の左端から）
        const handY = footY - 58
        const fallT = Math.sqrt((2 * (ROOM.floor - 8 - handY)) / g)
        const ballAt = (u: number) => (weight ? { x: handX + vx * Math.min(u, fallT), y: handY + 0.5 * g * Math.min(u, fallT) ** 2 } : { x: Math.min(handX + vx * u, ROOM.w - 10), y: handY })
        const pts: [number, number][] = []
        for (let u = 0; u <= tt + 1e-9; u += 0.05) {
          const p = ballAt(u)
          pts.push([p.x, p.y])
        }
        const b = ballAt(tt)
        return (
          <Svg
            id="19-2"
            w={720}
            h={300}
            label={
              weight
                ? '左は地上に止まっている部屋、右は宇宙で上向きに加速するロケットの部屋。どちらでも、手から放した球は同じ道筋で床へ落ちる。'
                : '左は地上で落下しているエレベーター、右は宇宙に浮かんでいる部屋。どちらでも、人と球は浮かび、放した球はまっすぐ進む。'
            }
          >
            {panels.map((p, i) => {
              const x0 = i * 360 + 10
              const rx = x0 + ROOM.dx
              return (
                <g key={p.kind}>
                  <T x={x0 + 170} y={22} anchor="middle" bold fs={12.5}>
                    {p.title}
                  </T>
                  {(p.kind === 'rocket' || p.kind === 'space') && <SpaceDots x0={x0} y0={0} pts={[[6, 60], [300, 66], [6, 190], [326, 196], [250, 262], [8, 262]]} />}
                  <rect x={rx} y={ROOM.top} width={ROOM.w} height={ROOM.floor - ROOM.top} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={1.5} />
                  {p.kind === 'ground' && (
                    <g>
                      <rect x={x0 + 4} y={ROOM.floor + 1} width={300} height={22} fill="var(--fig-box4)" stroke="var(--fig-line)" />
                      <T x={x0 + 154} y={ROOM.floor + 12} anchor="middle" fs={11.5}>
                        地面（地球）
                      </T>
                      <Force x1={x0 + 238} y1={112} x2={x0 + 238} y2={176} />
                      <T x={x0 + 250} y={124} fs={12}>
                        地球が
                      </T>
                      <T x={x0 + 250} y={142} fs={12}>
                        下へ引く
                      </T>
                    </g>
                  )}
                  {p.kind === 'rocket' && (
                    <g>
                      <Flame x={rx} y={ROOM.floor} w={ROOM.w} />
                      <Force x1={x0 + 238} y1={176} x2={x0 + 238} y2={112} />
                      <T x={x0 + 250} y={124} fs={12}>
                        エンジンで
                      </T>
                      <T x={x0 + 250} y={142} fs={12}>
                        上へ加速
                      </T>
                    </g>
                  )}
                  {p.kind === 'falling' && (
                    <g>
                      <line x1={rx + ROOM.w / 2} y1={40} x2={rx + ROOM.w / 2} y2={54} stroke="var(--fig-line)" strokeWidth={2} />
                      <line x1={rx + ROOM.w / 2} y1={62} x2={rx + ROOM.w / 2} y2={ROOM.top} stroke="var(--fig-line)" strokeWidth={2} />
                      <T x={rx + ROOM.w / 2 + 10} y={50} fs={11.5} tone="muted">
                        切れた綱
                      </T>
                      <rect x={x0 + 4} y={ROOM.floor + 26} width={300} height={18} fill="var(--fig-box4)" stroke="var(--fig-line)" />
                      <T x={x0 + 154} y={ROOM.floor + 35} anchor="middle" fs={11.5}>
                        地面（地球）
                      </T>
                      <Vel x1={x0 + 238} y1={112} x2={x0 + 238} y2={176} />
                      <T x={x0 + 250} y={124} fs={12}>
                        部屋ごと
                      </T>
                      <T x={x0 + 250} y={142} fs={12}>
                        落下中
                      </T>
                    </g>
                  )}
                  {p.kind === 'space' && (
                    <g>
                      <T x={x0 + 250} y={124} fs={12}>
                        エンジンは
                      </T>
                      <T x={x0 + 250} y={142} fs={12}>
                        止めている
                      </T>
                    </g>
                  )}
                  <Person x={rx + 44} footY={footY} />
                  <Trail points={pts.map(([x, y]) => [rx + x, y] as [number, number])} />
                  <Ball x={rx + b.x} y={b.y} r={8} />
                </g>
              )
            })}
            <T x={360} y={288} anchor="middle" fs={12.5} tone="acc">
              {weight ? '左右の部屋の中で、球は同じ道筋で床へ落ちる。中の人には区別できない' : '左右の部屋の中で、人も球も浮かび、球はまっすぐ進む。中の人には区別できない'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図19-3 加速するロケットの中の光（動） ---------- */

export function FigElevatorLight() {
  const c = 110 // 光の速さ（図の中の値。実際よりずっと遅い）
  const a = 20 // ロケットの加速（図の中の値）
  const W = 220
  const H = 150
  const top0 = 100
  const enter = 50 // 光が入る高さ（部屋の上端から）
  return (
    <Anim
      n="19-3"
      title="加速するロケットの中では、横へ進む光が下へ曲がって見える"
      still={2}
      period={3.2}
      caption="模式図です。光の速さは実際よりずっと遅く、ロケットの加速はずっと大きく描いています。光は左の壁の穴から水平に入ります。左は外から見た様子で、光はまっすぐ進みますが、その間に部屋が上へ動くので、光は入った高さより低い所に当たります。右は部屋の中から見た同じ出来事で、光の道筋は下へ曲がります。"
    >
      {(t) => {
        const tt = Math.min(t, 2)
        const rise = 0.5 * a * tt * tt
        const views = [
          { x0: 10, title: '外（宇宙に止まっている人）から見る', top: top0 - rise, inside: false },
          { x0: 370, title: 'ロケットの中の人から見る', top: top0, inside: true },
        ]
        return (
          <Svg id="19-3" w={720} h={320} label="左：外から見ると、光はまっすぐ進み、上へ動く部屋の向かいの壁の、入った高さより低い所に当たる。右：部屋の中から見ると、光の道筋は下へ曲がる。">
            <T x={360} y={42} anchor="middle" fs={12} tone="muted">
              黄色の点は光、黄色の点線は光が通った道筋
            </T>
            {views.map((v) => {
              const rx = v.x0 + 40
              const yIn = v.inside ? v.top + enter : top0 + enter
              const n = Math.max(1, Math.round(tt / 0.05))
              const pts: [number, number][] = Array.from({ length: n + 1 }, (_, k) => {
                const u = (k / n) * tt
                return [rx + c * u, v.inside ? yIn + 0.5 * a * u * u : yIn]
              })
              const last = pts[pts.length - 1]
              return (
                <g key={v.title}>
                  <T x={v.x0 + 170} y={20} anchor="middle" bold fs={12.5}>
                    {v.title}
                  </T>
                  <SpaceDots x0={v.x0} y0={0} pts={[[10, 70], [318, 76], [14, 200], [326, 236], [300, 140]]} />
                  <rect x={rx} y={v.top} width={W} height={H} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={1.5} />
                  <Flame x={rx} y={v.top + H} w={W} />
                  <line x1={rx + 6} y1={v.top + enter} x2={rx + W - 6} y2={v.top + enter} stroke="var(--fig-muted)" strokeDasharray="2 4" />
                  <T x={rx + W - 8} y={v.top + enter - 11} anchor="end" fs={11.5} tone="muted">
                    光が入った高さ
                  </T>
                  <rect x={rx - 2} y={v.top + enter - 5} width={4} height={10} fill="var(--fig-bg)" />
                  <LightTrail d={pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} />
                  <Pulse x={last[0]} y={last[1]} />
                </g>
              )
            })}
            <T x={180} y={292} anchor="middle" fs={12} tone="acc">
              光はまっすぐ進む。部屋が上へ動くので、
            </T>
            <T x={180} y={310} anchor="middle" fs={12} tone="acc">
              光は入った高さより低い所に当たる
            </T>
            <T x={540} y={292} anchor="middle" fs={12} tone="acc">
              光は下へ曲がって進むように見える
            </T>
            <T x={540} y={310} anchor="middle" fs={12} tone="acc">
              （等価原理から、重力のある所でも同じ）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図19-4 高さで変わる時計の進み（動） ---------- */

export function FigClocks() {
  const Tb = 1.2 // 下の時計が1回刻む時間（図の中）
  const Tt = Tb / 1.25 // 上の時計は1.25倍速く進む（誇張）
  const travel = 0.9 // 光の合図が下から上へ届くまでの時間（図の中）
  const end = 7.2
  const gx = (u: number) => 455 + u * 33
  const yTop = 110
  const yBot = 210
  return (
    <Anim
      n="19-4"
      title="下の時計は上の時計よりゆっくり進む"
      still={4.9}
      period={8}
      caption="模式図です。上と下の時計の進みの差は、実際よりずっと大きく描いています（上の時計が下の時計の1.25倍の速さで進むとしています）。下の時計は1回りするごとに光の合図を上へ送ります。右のグラフの黄色の線は、合図が下から上へ届くまでを表します。合図と合図の間に、上の時計は1回りより多く進みます。"
    >
      {(t) => {
        const tt = Math.min(t, end)
        const nb = Math.floor(tt / Tb + 1e-9)
        const nt = Math.floor(tt / Tt + 1e-9)
        const sent = Array.from({ length: Math.floor(end / Tb) + 1 }, (_, k) => k * Tb).filter((s) => s > 0 && s <= tt + 1e-9)
        return (
          <Svg id="19-4" w={720} h={300} label="上向きに加速するロケットの床と天井に時計がある。下の時計が1回りするたびに光の合図を上へ送る。同じ時間の間に、上の時計は下の時計より多く回る。">
            <T x={190} y={20} anchor="middle" bold fs={12.5}>
              上向きに加速するロケット
            </T>
            <T x={190} y={38} anchor="middle" fs={12} tone="muted">
              （地上の建物でも同じ）
            </T>
            <rect x={130} y={52} width={120} height={202} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <Flame x={130} y={254} w={120} />
            <Clock x={190} y={84} r={22} frac={tt / Tt} />
            <Clock x={190} y={222} r={22} frac={tt / Tb} />
            <T x={262} y={78} fs={12}>
              上の時計
            </T>
            <T x={262} y={96} fs={12} tone="acc">
              {`${nt}回り`}
            </T>
            <T x={262} y={216} fs={12}>
              下の時計
            </T>
            <T x={262} y={234} fs={12} tone="acc">
              {`${nb}回り`}
            </T>
            {sent.map((s) => {
              const u = (tt - s) / travel
              if (u < 0 || u > 1) return null
              const y = 196 - u * 86
              return <line key={s} x1={176} y1={y} x2={204} y2={y} stroke={LIGHT} strokeWidth={4} strokeLinecap="round" />
            })}
            <T x={122} y={154} anchor="end" fs={11.5} tone="muted">
              光の合図
            </T>
            {/* 右：時間に沿って刻みを並べる */}
            <T x={575} y={20} anchor="middle" bold fs={12.5}>
              時計が1回りした時刻の印
            </T>
            <T x={445} y={yTop} anchor="end" fs={12}>
              上の時計
            </T>
            <T x={445} y={yBot} anchor="end" fs={12}>
              下の時計
            </T>
            <line x1={gx(0)} y1={yTop} x2={gx(end) + 8} y2={yTop} stroke="var(--fig-muted)" />
            <line x1={gx(0)} y1={yBot} x2={gx(end) + 8} y2={yBot} stroke="var(--fig-muted)" />
            <Arrow x1={gx(0)} y1={250} x2={gx(end) + 14} y2={250} />
            <T x={gx(end) + 14} y={268} anchor="end" fs={12}>
              時間
            </T>
            {Array.from({ length: nt }, (_, k) => (
              <line key={`t${k}`} x1={gx((k + 1) * Tt)} y1={yTop - 9} x2={gx((k + 1) * Tt)} y2={yTop + 9} stroke="var(--fig-line)" strokeWidth={2} />
            ))}
            {Array.from({ length: nb }, (_, k) => (
              <line key={`b${k}`} x1={gx((k + 1) * Tb)} y1={yBot - 9} x2={gx((k + 1) * Tb)} y2={yBot + 9} stroke="var(--fig-line)" strokeWidth={2} />
            ))}
            {sent.map((s) => {
              const u = Math.min(1, (tt - s) / travel)
              return <line key={`s${s}`} x1={gx(s)} y1={yBot - 10} x2={gx(s + travel * u)} y2={yBot - 10 - u * (yBot - yTop - 20)} stroke={LIGHT} strokeWidth={2} />
            })}
            <T x={575} y={44} anchor="middle" fs={11.5} tone="muted">
              黄色の線：下から上へ送った光の合図
            </T>
            <T x={575} y={290} anchor="middle" fs={12} tone="acc">
              合図の間に、上の時計は1回りより多く進む
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図19-5 まっすぐ進む2つの物の間隔が縮む（動） ---------- */

export function FigConverge() {
  const cx = 180
  const cy = 190
  const R = 112
  const tilt = (22 * Math.PI) / 180
  const lon0 = (28 * Math.PI) / 180
  /** 緯度 lat、経度 lon の点を図の上の位置へ（北極を手前に少し傾けた見た目） */
  const proj = (lat: number, lon: number) => {
    const X = Math.cos(lat) * Math.sin(lon)
    const Y = Math.sin(lat)
    const Z = Math.cos(lat) * Math.cos(lon)
    return { x: cx + R * X, y: cy - R * (Y * Math.cos(tilt) - Z * Math.sin(tilt)), front: Y * Math.sin(tilt) + Z * Math.cos(tilt) >= 0 }
  }
  const walk = 4 // 赤道から北極まで歩く時間（図の中）
  const earthC = { x: 540, y: 560 }
  const drop = 118
  const balls0 = [
    { x: 470, y: 126 },
    { x: 610, y: 126 },
  ]
  const unit = (p: { x: number; y: number }) => {
    const dx = earthC.x - p.x
    const dy = earthC.y - p.y
    const l = Math.hypot(dx, dy)
    return { x: dx / l, y: dy / l }
  }
  const equator = Array.from({ length: 73 }, (_, k) => proj(0, (k * 5 * Math.PI) / 180))
  return (
    <Anim
      n="19-5"
      title="まっすぐ進む2つの物の間隔が縮むことから、面や時空の曲がりが分かる"
      still={2.6}
      period={5.2}
      caption="模式図です。左：赤道から北へまっすぐ歩き出した2人は、間の距離がだんだん縮み、北極で出会います。右：大きな部屋ごと落ちる2つの球は、どちらも地球の中心へ向かって落ちるので、部屋の中で見ると少しずつ近づきます。右の図の部屋の大きさと球の近づき方は、実際よりずっと大きく描いています。"
    >
      {(t) => {
        const u = Math.min(t, walk) / walk
        const lat = (u * Math.PI) / 2
        const pA = proj(lat, -lon0)
        const pB = proj(lat, lon0)
        const merid = (lon: number) =>
          Array.from({ length: 31 }, (_, k) => {
            const p = proj((k / 30) * (Math.PI / 2), lon)
            return [p.x, p.y] as [number, number]
          })
        const s = drop * (Math.min(t, walk) / walk) ** 2
        const bs = balls0.map((b) => {
          const e = unit(b)
          return { x: b.x + e.x * s, y: b.y + e.y * s }
        })
        const gap = Math.cos(lat)
        const gapR = (bs[1].x - bs[0].x) / (balls0[1].x - balls0[0].x)
        return (
          <Svg id="19-5" w={720} h={360} label="左：地球儀の赤道から北へまっすぐ歩く2人の間の距離が縮み、北極で出会う。右：落ちる大きな部屋の中の2つの球は、どちらも地球の中心へ向かうので、少しずつ近づく。">
            <T x={180} y={20} anchor="middle" bold fs={12.5}>
              丸い面の上を北へまっすぐ歩く2人
            </T>
            <circle cx={cx} cy={cy} r={R} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <path d={equator.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke="var(--fig-muted)" strokeDasharray="5 4" />
            <T x={cx + R + 6} y={cy + 30} fs={11.5} tone="muted">
              赤道
            </T>
            <Trail points={merid(-lon0)} />
            <Trail points={merid(lon0)} />
            <circle cx={proj(Math.PI / 2, 0).x} cy={proj(Math.PI / 2, 0).y} r={3} fill="var(--fig-line)" />
            <T x={proj(Math.PI / 2, 0).x} y={proj(Math.PI / 2, 0).y - 16} anchor="middle" fs={12}>
              北極
            </T>
            {u < 0.7 && <Vel x1={pA.x} y1={pA.y - 9} x2={pA.x + 3 * (1 - u)} y2={pA.y - 30} />}
            {u < 0.7 && <Vel x1={pB.x} y1={pB.y - 9} x2={pB.x - 3 * (1 - u)} y2={pB.y - 30} />}
            <Ball x={pA.x} y={pA.y} r={7} />
            <Ball x={pB.x} y={pB.y} r={7} />
            <T x={180} y={320} anchor="middle" fs={12} tone="acc">
              {u >= 1 ? '2人は北極で出会う' : `2人の間の距離：出発したときの約${Math.round(gap * 100)}%`}
            </T>
            {/* 右：落ちる部屋 */}
            <T x={540} y={20} anchor="middle" bold fs={12.5}>
              大きな部屋ごと落ちる2つの球
            </T>
            <T x={540} y={42} anchor="middle" fs={12} tone="muted">
              どちらの球も地球の中心へ向かって落ちる
            </T>
            <path d="M448.4,360 A220,220 0 0 1 631.6,360 Z" fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <T x={540} y={351} anchor="middle" fs={11.5}>
              地球
            </T>
            {balls0.map((b, i) => (
              <line key={i} x1={b.x} y1={b.y} x2={b.x + unit(b).x * 190} y2={b.y + unit(b).y * 190} stroke="var(--fig-muted)" strokeDasharray="2 4" />
            ))}
            <rect x={440} y={80 + s} width={200} height={92} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <Ball x={bs[0].x} y={bs[0].y} r={9} />
            <Ball x={bs[1].x} y={bs[1].y} r={9} />
            <T x={540} y={64} anchor="middle" fs={12} tone="acc">
              {`2つの球の間の距離：出発したときの約${Math.round(gapR * 100)}%`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図19-6 天体のまわりの格子と時計（スライダー） ---------- */

const MASS_WORDS = ['なし', '小', '中', '大']
const GRID = { cx: 225, cy: 165, x0: 25, x1: 425, y0: 30, y1: 300, step: 25 }
const CLOCKS = [
  { id: 'A', r: 52, label: '天体の近く' },
  { id: 'B', r: 110, label: '少し離れた所' },
  { id: 'C', r: 190, label: '遠く' },
]

export function FigGrid() {
  const [m, setM] = useState(2)
  /** 天体の方へ寄せた位置。寄せ方は中心に近いほど大きい（模式的） */
  const warp = (x: number, y: number) => {
    const dx = x - GRID.cx
    const dy = y - GRID.cy
    const r = Math.hypot(dx, dy)
    const k = 1 - (m * 0.18) / (1 + (r / 70) ** 2)
    return { x: GRID.cx + dx * k, y: GRID.cy + dy * k }
  }
  const rate = (r: number) => 1 - (m * 7.5) / r
  const rateC = rate(CLOCKS[2].r)
  const hole = m > 0 ? 16 + m * 5 : 0 // 天体の円とその縁の内側には線を引かない
  /** 格子の線1本。天体の円に入る所で線を切る */
  const gridLine = (pts: { x: number; y: number }[]) => {
    let d = ''
    let pen = false
    for (const p of pts) {
      if (Math.hypot(p.x - GRID.cx, p.y - GRID.cy) < hole) {
        pen = false
        continue
      }
      d += `${pen ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
      pen = true
    }
    return d
  }
  const lines: string[] = []
  for (let x = GRID.x0; x <= GRID.x1; x += GRID.step) {
    const pts = []
    for (let y = GRID.y0; y <= GRID.y1; y += 5) pts.push(warp(x, y))
    lines.push(gridLine(pts))
  }
  for (let y = GRID.y0 + 10; y <= GRID.y1; y += GRID.step) {
    const pts = []
    for (let x = GRID.x0; x <= GRID.x1; x += 5) pts.push(warp(x, y))
    lines.push(gridLine(pts))
  }
  return (
    <Figure
      n="19-6"
      title="重い天体の近くでは、空間の長さの測り方と時計の進み方が変わる"
      controls={<Range label="天体の質量" min={0} max={3} step={1} value={m} onChange={setM} format={(v) => MASS_WORDS[v]} />}
      caption="模式図です。曲がった空間は平らな紙の上に正しく描けないので、格子の線を天体の方へ寄せて、曲がりがあることだけを表しています。右の時計は、同じ時間がたったときの A〜C の時計の針です。格子の曲がりも時計の遅れも、実際よりずっと大きく描いています。「天体の質量」を大きくすると、格子の曲がりと、天体の近くの時計の遅れが大きくなります。「なし」にすると、格子はまっすぐになり、3つの時計はそろいます。"
    >
      <Svg id="19-6" w={720} h={330} label="天体のまわりの空間を表す格子が天体の方へ寄って曲がり、天体に近い時計ほどゆっくり進む。天体の質量を大きくすると、曲がりと遅れが大きくなる。">
        {lines.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--fig-muted)" strokeWidth={1} />
        ))}
        {m > 0 && (
          <g>
            <circle cx={GRID.cx} cy={GRID.cy} r={12 + m * 5} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <T x={GRID.cx} y={GRID.cy} anchor="middle" fs={11.5}>
              天体
            </T>
          </g>
        )}
        {CLOCKS.map((c) => {
          const p = warp(GRID.cx + c.r, GRID.cy)
          return (
            <g key={c.id}>
              <circle cx={p.x} cy={p.y} r={5} fill="var(--fig-accent)" stroke="var(--fig-bg)" strokeWidth={1.5} />
              <rect x={p.x - 8} y={p.y - 29} width={16} height={16} rx={3} fill="var(--fig-bg)" />
              <T x={p.x} y={p.y - 21} anchor="middle" fs={12} bold>
                {c.id}
              </T>
            </g>
          )
        })}
        <T x={580} y={26} anchor="middle" bold fs={12.5}>
          同じ時間がたったときの時計
        </T>
        {CLOCKS.map((c, i) => {
          const y = 82 + i * 86
          const rel = rate(c.r) / rateC
          return (
            <g key={c.id}>
              <Clock x={480} y={y} r={26} frac={0.25 * rel} />
              <T x={520} y={y - 10} fs={12.5}>
                {`${c.id}：${c.label}`}
              </T>
              <T x={520} y={y + 10} fs={12} tone={rel < 0.999 ? 'acc' : undefined}>
                {c.id === 'C' ? '針は4分の1周（基準）' : rel > 0.999 ? 'C と同じだけ進む' : `C の約${Math.round(rel * 100)}%しか進まない`}
              </T>
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図19-7 1907年から1916年までの年表 ---------- */

const ROAD = [
  { y: '1907年', who: 'ベルン', what: ['等価原理を', '思いつく'] },
  { y: '1911年', who: 'プラハ', what: ['太陽の近くで', '光が曲がると予言'] },
  { y: '1912年', who: 'チューリヒ', what: ['グロスマンと', '共同研究を始める'] },
  { y: '1913年', who: 'チューリヒ', what: ['2人で', '草案の論文を出す'] },
  { y: '1914年', who: 'ベルリン', what: ['日食の観測隊が', '戦争で抑留される'] },
  { y: '1915年11月', who: 'ベルリン', what: ['一般相対性理論の', '方程式を発表'] },
  { y: '1916年3月', who: 'ベルリン', what: ['理論の全体を', 'まとめた論文'] },
]

export function FigRoad19() {
  return (
    <Figure n="19-7" title="1907年から1916年まで、アインシュタインがいた町と主な出来事" caption="上下に交互に並べています。点の間隔は年数に比例していません。2段目の名前は、そのときアインシュタインが住んでいた町です。">
      <Svg id="19-7" w={720} h={260} label="1907年ベルンで等価原理、1911年プラハで光の曲がりを予言、1912年チューリヒでグロスマンと共同研究を始め、1913年に草案の論文。1914年ベルリンへ移り、日食の観測隊が戦争で抑留された。1915年11月に一般相対性理論の方程式を発表し、1916年3月に理論の全体をまとめた論文を出した。">
        <Arrow x1={14} y1={130} x2={708} y2={130} />
        {ROAD.map((r, i) => {
          const x = 60 + i * 100
          const up = i % 2 === 0
          const ty = up ? 30 : 158
          return (
            <g key={r.y}>
              <circle cx={x} cy={130} r={6} fill={i === 5 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 107 : 136} x2={x} y2={up ? 124 : 150} stroke="var(--fig-line)" />
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

/* ---------- 図19-8 1915年11月前後の日付 ---------- */

const NOV = [
  { d: '6月末〜7月初め', e: 'ゲッティンゲンで6回の講義をする', h: 'クラインとともに講義を聞く' },
  { d: '11月4日', e: '第1の論文：新しい方程式' },
  { d: '11月7日〜19日', e: 'ヒルベルトへはがき（7・12・15・18日）', h: 'アインシュタインへ返事（14・19日）' },
  { d: '11月11日', e: '第2の論文：方程式を直す' },
  { d: '11月18日', e: '第3の論文：水星のずれ43秒角を計算' },
  { d: '11月20日', h: 'ゲッティンゲン科学協会で発表' },
  { d: '11月25日', e: '第4の論文：最終の方程式', acc: true },
  { d: '12月6日', h: '校正刷りに印刷所の日付印' },
  { d: '12月20日', e: 'ヒルベルトへ関係を修復する手紙' },
  { d: '1916年3月20日', e: '理論をまとめた論文を雑誌が受け付け' },
  { d: '1916年3月31日', h: '論文が発行される（11月25日の論文に触れる）' },
]

export function FigNovember() {
  const y0 = 66
  const dy = 27
  return (
    <Figure
      n="19-8"
      title="1915年の夏から1916年3月までの、アインシュタインとヒルベルトの主な日付"
      caption="日付の欄で年を書いていない行は1915年です。アインシュタインの4つの論文の日付は、ベルリンのプロイセン科学アカデミーで発表した日です。ヒルベルトの校正刷りの日付は、印刷所が押した日付印によります。この図は日付を並べたもので、どちらが先に方程式にたどり着いたかを示すものではありません。"
    >
      <Svg id="19-8" w={720} h={370} label="1915年6月末から7月初め、アインシュタインがゲッティンゲンで講義。11月4日、11日、18日、25日にアインシュタインが論文を発表し、18日に水星のずれを計算した。11月7日から19日にかけて2人ははがきと手紙をやりとりした。ヒルベルトは11月20日に発表し、校正刷りの日付印は12月6日。12月20日にアインシュタインが関係を修復する手紙を書いた。1916年3月20日にアインシュタインの論文が受け付けられ、3月31日にヒルベルトの論文が発行された。">
        <T x={300} y={22} anchor="end" bold fs={12.5}>
          アインシュタイン（ベルリン）
        </T>
        <T x={420} y={22} bold fs={12.5}>
          ヒルベルト（ゲッティンゲン）
        </T>
        <line x1={360} y1={38} x2={360} y2={y0 + (NOV.length - 1) * dy + 12} stroke="var(--fig-line)" />
        {NOV.map((r, i) => {
          const y = y0 + i * dy
          return (
            <g key={r.d}>
              <rect x={304} y={y - 10} width={112} height={20} rx={4} fill="var(--fig-bg)" stroke="var(--fig-line)" />
              <T x={360} y={y} anchor="middle" fs={11.5}>
                {r.d}
              </T>
              {r.e && (
                <T x={294} y={y} anchor="end" fs={12} tone={r.acc ? 'acc' : undefined}>
                  {r.e}
                </T>
              )}
              {r.h && (
                <T x={426} y={y} fs={12}>
                  {r.h}
                </T>
              )}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図19-9 回っていく水星の楕円軌道（動・切り替え） ---------- */

export function FigMercury() {
  const [mode, setMode] = useState<'turn' | 'fixed'>('turn')
  const P = 2.2 // 1周の時間（図の中）
  const N = 6 // 回る周回数
  const step = mode === 'turn' ? (18 * Math.PI) / 180 : 0 // 1周ごとに回す角度（誇張）
  const a = 110
  const e = 0.45
  const sun = { x: 240, y: 175 }
  /** 時刻 u の水星の位置（ケプラーの方程式を数回の反復で解く） */
  const pos = (u: number) => {
    const M = (2 * Math.PI * u) / P
    let E = M
    for (let k = 0; k < 6; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
    const nu = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(E), Math.cos(E) - e)
    const r = a * (1 - e * Math.cos(E))
    const w = Math.PI + step * (u / P)
    return { x: sun.x + r * Math.cos(w + nu), y: sun.y - r * Math.sin(w + nu) }
  }
  return (
    <Anim
      n="19-9"
      title="水星の楕円軌道は1周ごとに少しずつ向きを変える"
      still={7.7}
      period={P * N + 1.2}
      controls={
        <Choice
          label="軌道"
          options={[
            { value: 'turn', label: '向きが回る（実際の水星）' },
            { value: 'fixed', label: '回らない（太陽と水星だけ）' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="模式図です。楕円のつぶれ方と回る速さは、実際よりずっと大きく描いています（図では1周ごとに18度回しています）。番号は、1周ごとに水星が太陽に最も近づいた点（近日点）です。「回らない」を選ぶと、ニュートンの理論で太陽と水星だけを考えたときの動きになり、水星は同じ楕円を回り続けます。"
    >
      {(t) => {
        const tt = Math.min(t, P * N)
        const n = Math.max(2, Math.round((tt / P) * 80))
        const pts: [number, number][] = Array.from({ length: n + 1 }, (_, k) => {
          const p = pos((k / n) * tt)
          return [p.x, p.y]
        })
        const now = pos(tt)
        const done = Math.floor(tt / P + 1e-9)
        return (
          <Svg id="19-9" w={720} h={330} label="太陽を焦点とする水星の楕円軌道が、1周ごとに少しずつ向きを変え、近日点の位置が太陽のまわりを回っていく。">
            <Trail points={pts} />
            {Array.from({ length: done + 1 }, (_, k) => {
              const w = Math.PI + step * k
              const r = a * (1 - e)
              const lr = r + 16 + (mode === 'fixed' ? k * 13 : 0)
              return (
                <g key={k}>
                  <circle cx={sun.x + r * Math.cos(w)} cy={sun.y - r * Math.sin(w)} r={3.5} fill="var(--fig-accent)" />
                  <T x={sun.x + lr * Math.cos(w)} y={sun.y - lr * Math.sin(w)} anchor="middle" fs={11.5}>
                    {String(k + 1)}
                  </T>
                </g>
              )
            })}
            <circle cx={sun.x} cy={sun.y} r={17} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <T x={sun.x} y={sun.y} anchor="middle" fs={11.5}>
              太陽
            </T>
            <Ball x={now.x} y={now.y} r={7} />
            <T x={470} y={50} bold fs={12.5}>
              図の見方
            </T>
            <T x={470} y={76} fs={12}>
              点線：水星が通った道筋
            </T>
            <T x={470} y={98} fs={12}>
              番号：1周ごとの近日点
            </T>
            <T x={470} y={120} fs={12} tone="muted">
              （太陽に最も近い点）
            </T>
            <T x={470} y={160} bold fs={12.5}>
              実際の水星
            </T>
            <T x={470} y={186} fs={12}>
              近日点は100年で約575秒角回る
            </T>
            <T x={470} y={208} fs={12}>
              そのうち43秒角は、ほかの惑星の
            </T>
            <T x={470} y={230} fs={12}>
              引力では説明できない
            </T>
            <T x={470} y={262} fs={12} tone="muted">
              1秒角は1度の3600分の1
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図19-10 水星の近日点の回転の内訳 ---------- */

const BUDGET = [
  { name: '金星の引力', v: 277.4 },
  { name: '木星の引力', v: 154.0 },
  { name: '地球と月の引力', v: 90.9 },
  { name: '土星の引力', v: 7.3 },
  { name: '火星の引力', v: 2.5 },
  { name: 'そのほかの天体など', v: 0.2 },
]

export function FigBudget() {
  const x0 = 170
  const k = 0.92 // 1秒角あたりのピクセル
  const planets = 532.3
  const gr = 43.0
  const bar = (y: number, w: number, fill: string) => <rect x={x0} y={y - 7} width={Math.max(1.5, w)} height={14} rx={3} fill={fill} stroke="var(--fig-line)" strokeWidth={0.8} />
  return (
    <Figure
      n="19-10"
      title="水星の近日点の回転のうち、100年あたり43秒角はほかの惑星の引力では説明できない"
      caption="2017年に発表された、探査機メッセンジャーの観測にもとづく値です（単位は100年あたりの秒角）。合計の575.3秒角は、遠くの星を基準にした回転です。ルヴェリエが調べた1859年には、説明できない分は38秒角とされていました（第2章）。"
    >
      <Svg id="19-10" w={720} h={320} label="水星の近日点は100年で575.3秒角回る。金星の引力で277.4、木星で154.0、地球と月で90.9、土星で7.3、火星で2.5、そのほかで0.2、合わせて532.3秒角。残りの43.0秒角は一般相対性理論で説明される。">
        <T x={x0} y={18} fs={12} tone="muted">
          100年あたりの回転（秒角）
        </T>
        <line x1={x0} y1={30} x2={x0} y2={302} stroke="var(--fig-line)" />
        {BUDGET.map((b, i) => {
          const y = 46 + i * 28
          return (
            <g key={b.name}>
              <T x={x0 - 10} y={y} anchor="end" fs={12}>
                {b.name}
              </T>
              {bar(y, b.v * k, 'var(--fig-box)')}
              <T x={x0 + Math.max(1.5, b.v * k) + 8} y={y} fs={12}>
                {b.v.toFixed(1)}
              </T>
            </g>
          )
        })}
        <T x={x0 - 10} y={222} anchor="end" fs={12} tone="acc">
          一般相対性理論
        </T>
        {bar(222, gr * k, 'var(--fig-accent)')}
        <T x={x0 + gr * k + 8} y={222} fs={12} tone="acc">
          43.0（ニュートンの理論では説明できない分）
        </T>
        <line x1={x0 - 150} y1={248} x2={706} y2={248} stroke="var(--fig-muted)" strokeDasharray="2 4" />
        <T x={x0 - 10} y={276} anchor="end" fs={12} bold>
          合計（観測と一致）
        </T>
        <rect x={x0} y={269} width={planets * k} height={14} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={0.8} />
        <rect x={x0 + planets * k + 2} y={269} width={gr * k - 2} height={14} rx={3} fill="var(--fig-accent)" stroke="var(--fig-line)" strokeWidth={0.8} />
        <T x={x0 + (planets * k) / 2} y={298} anchor="middle" fs={12}>
          天体の引力の分 532.3
        </T>
        <T x={706} y={298} anchor="end" fs={12} tone="acc">
          合計 575.3
        </T>
      </Svg>
    </Figure>
  )
}
