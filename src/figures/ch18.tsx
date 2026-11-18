import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Vel, rng } from './common'

/*
 * 第18章の図の決まり：光（光の世界線・光の輪・光のかたまり）は第17章と同じ黄色（LIGHT）で描き、必ず文字を添える。
 * 時空図は、横に場所、縦に時刻（上ほど後）をとり、光の世界線が45度になるように目盛りをとる。
 */

const LIGHT = '#e0a000'

/** 光の速さに対する割合 b で動く時計の進みの逆数（時間の遅れの倍率） */
const gamma = (b: number) => 1 / Math.sqrt(1 - b * b)

/** 時空図の縦と横の軸。ox, oy は原点、up と right は軸の長さ */
function StAxes({ ox, oy, up, right, tLabel, xLabel }: { ox: number; oy: number; up: number; right: number; tLabel: string; xLabel: string }) {
  return (
    <g>
      <Arrow x1={ox} y1={oy} x2={ox + right} y2={oy} />
      <Arrow x1={ox} y1={oy} x2={ox} y2={oy - up} />
      <T x={ox - 8} y={oy - up + 4} anchor="end" fs={12}>
        {tLabel}
      </T>
      <T x={ox + right + 6} y={oy} fs={12}>
        {xLabel}
      </T>
    </g>
  )
}

/* ---------- 図18-1 熱を出し続けるラジウム ---------- */

function Vial({ x, label, sub, warm }: { x: number; label: string; sub: string; warm: boolean }) {
  return (
    <g>
      <rect x={x - 26} y={96} width={52} height={86} rx={10} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <rect x={x - 22} y={128} width={44} height={50} rx={7} fill={warm ? 'var(--fig-box2)' : 'var(--fig-box)'} stroke="none" />
      {warm &&
        [-12, 0, 12].map((dx) => (
          <path key={dx} d={`M${x + dx},86 q5,-8 0,-16 q-5,-8 0,-16`} fill="none" stroke="var(--fig-danger)" strokeWidth={1.5} />
        ))}
      {/* 温度計 */}
      <rect x={x + 36} y={70} width={10} height={110} rx={5} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <circle cx={x + 41} cy={184} r={8} fill="var(--fig-danger)" stroke="var(--fig-line)" />
      <rect x={x + 38} y={warm ? 92 : 140} width={6} height={warm ? 90 : 42} fill="var(--fig-danger)" />
      <T x={x + 10} y={210} anchor="middle" fs={12.5} bold>
        {label}
      </T>
      <T x={x + 10} y={228} anchor="middle" fs={12} tone="muted">
        {sub}
      </T>
    </g>
  )
}

export function FigRadiumHeat() {
  return (
    <Figure
      n="18-1"
      title="ラジウムを含む塩は、見た目が変わらないまま熱を出し続ける"
      caption="1903年にピエール・キュリーとラボルドが報告した測定の模式図です。2人はラジウムを含む塩と含まない塩の温度の差を測り、ラジウム1グラムあたりの熱の量を見積もりました。"
    >
      <Svg id="18-1" w={720} h={244} label="ラジウムを含む塩は、ラジウムを含まない塩より温度が高いまま保たれる。1グラムのラジウムは1時間に約100カロリーの熱を出し、数年たっても性質が目立って変わらない。このエネルギーの出どころは、原子そのものの変化か、外から来る未知のエネルギーかが分からなかった。">
        <Vial x={80} label="ラジウムを含む塩" sub="まわりより温かいまま" warm />
        <Vial x={240} label="ラジウムを含まない塩" sub="まわりと同じ温度" warm={false} />
        <T x={56} y={44} fs={12} tone="danger">
          熱が出続ける
        </T>
        <Box x={360} y={14} w={344} h={58} lines={['1グラムのラジウムが1時間に出す熱：約100カロリー', '（100グラムの水を1℃温める熱）']} subTone="muted" fs={12.5} />
        <Box x={360} y={84} w={344} h={44} lines="数年たっても、ラジウムの性質は目立って変わらない" fs={12.5} />
        <Box x={360} y={140} w={344} h={92} fill="box2" lines={['このエネルギーはどこから来るのか', '・ラジウムの原子そのものが少しずつ変わる？', '・外から未知のエネルギーを受け取る？']} bold fs={12.5} />
      </Svg>
    </Figure>
  )
}

/* ---------- 図18-2 時空図に描いた世界線（動） ---------- */

export function FigWorldLines() {
  const ox = 110
  const oy = 340
  const S = 100 // 1秒（縦）と、光が1秒に進む距離（横）の長さ
  const TMAX = 2.4
  const RATE = 0.6 // 1秒の再生で進む図の中の時間
  return (
    <Anim
      n="18-2"
      title="時空図では、止まっている物は縦の線、動いている物は傾いた線、光は45度の線になる"
      still={TMAX / RATE}
      period={TMAX / RATE + 1.6}
      caption="上の段はその時刻の様子、下の段はそれを時刻ごとに積み重ねた時空図です（模式図）。縦の1目盛りは1秒、横の1目盛りは光が1秒に進む約30万kmです。点線の横線は、上の段に描いている時刻を表します。"
    >
      {(t) => {
        const T0 = Math.min(t * RATE, TMAX)
        const y = oy - S * T0
        const xs = { stay: ox, rocket: ox + 0.5 * S * T0, light: ox + S * T0 }
        return (
          <Svg id="18-2" w={720} h={370} label="止まっている人、光の速さの5割で進むロケット、光の3つを、上の段では横一列の動きとして、下の段では時空図の上の線として描く。止まっている人は縦の線、ロケットは傾いた線、光は45度の線になる。">
            {/* 上の段：その時刻の様子 */}
            <T x={16} y={18} fs={12} tone="muted">
              {`その時刻の様子（${T0.toFixed(1)}秒）`}
            </T>
            <line x1={ox - 8} y1={52} x2={ox + 3.1 * S} y2={52} stroke="var(--fig-muted)" strokeDasharray="2 4" />
            <Ball x={xs.stay} y={52} r={8} fill="var(--fig-box4)" />
            <polygon points={`${xs.rocket - 12},46 ${xs.rocket + 4},46 ${xs.rocket + 12},52 ${xs.rocket + 4},58 ${xs.rocket - 12},58`} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.2} />
            <circle cx={xs.light} cy={52} r={6} fill={LIGHT} stroke="var(--fig-line)" strokeWidth={0.8} />
            <T x={ox - 16} y={52} anchor="end" fs={11.5}>
              止まっている人
            </T>
            {T0 > 0.5 && (
              <T x={xs.rocket} y={74} anchor="middle" fs={11.5}>
                ロケット
              </T>
            )}
            {T0 > 0.8 && (
              <T x={xs.light} y={74} anchor="middle" fs={11.5}>
                光
              </T>
            )}
            {/* 下の段：時空図 */}
            {[1, 2].map((k) => (
              <line key={`h${k}`} x1={ox} y1={oy - S * k} x2={ox + 3 * S} y2={oy - S * k} stroke="var(--fig-box)" strokeWidth={1.5} />
            ))}
            {[1, 2, 3].map((k) => (
              <line key={`v${k}`} x1={ox + S * k} y1={oy} x2={ox + S * k} y2={oy - S * 2.5} stroke="var(--fig-box)" strokeWidth={1.5} />
            ))}
            <StAxes ox={ox} oy={oy} up={S * 2.62} right={S * 3.3} tLabel="時刻（上ほど後）" xLabel="場所" />
            {[1, 2].map((k) => (
              <T key={k} x={ox - 8} y={oy - S * k} anchor="end" fs={11.5} tone="muted">
                {`${k}秒`}
              </T>
            ))}
            {[1, 2, 3].map((k) => (
              <T key={k} x={ox + S * k} y={oy + 16} anchor="middle" fs={11.5} tone="muted">
                {`${k * 30}万km`}
              </T>
            ))}
            <line x1={ox} y1={y} x2={ox + 3.1 * S} y2={y} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <line x1={ox} y1={oy} x2={xs.stay} y2={y} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={ox} y1={oy} x2={xs.rocket} y2={y} stroke="var(--fig-line)" strokeWidth={3} strokeDasharray="8 5" />
            <line x1={ox} y1={oy} x2={xs.light} y2={y} stroke={LIGHT} strokeWidth={3} />
            <circle cx={xs.stay} cy={y} r={4} fill="var(--fig-line)" />
            <circle cx={xs.rocket} cy={y} r={4} fill="var(--fig-line)" />
            <circle cx={xs.light} cy={y} r={4} fill={LIGHT} />
            {/* 凡例 */}
            <line x1={470} y1={120} x2={510} y2={120} stroke="var(--fig-line)" strokeWidth={3} />
            <T x={520} y={120} fs={12.5}>
              止まっている人（縦の線）
            </T>
            <line x1={470} y1={150} x2={510} y2={150} stroke="var(--fig-line)" strokeWidth={3} strokeDasharray="8 5" />
            <T x={520} y={150} fs={12.5}>
              光の速さの5割のロケット
            </T>
            <line x1={470} y1={180} x2={510} y2={180} stroke={LIGHT} strokeWidth={3} />
            <T x={520} y={180} fs={12.5}>
              光（45度の線）
            </T>
            <T x={470} y={226} fs={12.5} tone="acc">
              光より遅い物の線は、
            </T>
            <T x={470} y={246} fs={12.5} tone="acc">
              いつも45度の線より縦に近い
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図18-3 ロケットから見た「同時」の線（スライダー） ---------- */

export function FigTiltedAxes() {
  const [b, setB] = useState(0.5)
  const cx = 220
  const cy = 196
  const S = 100
  const g = gamma(b)
  const L = Math.max(1.55, g + 0.12) // 1年の印とA・Bが線の上に乗る長さ
  const P = (x: number, t: number) => [cx + S * x, cy - S * t] as const
  const [rx2, ry2] = P(L * b, L)
  const [rx1, ry1] = P(-L * b, -L)
  const [sx2, sy2] = P(L, L * b)
  const [sx1, sy1] = P(-L, -L * b)
  const [kx, ky] = P(g * b, g)
  const [ax, ay] = P(g, g * b)
  const [bx, by] = P(-g, -g * b)
  return (
    <Figure
      n="18-3"
      title="ロケットに乗った人の「時間の軸」と「同時」の線は、どちらも光の線に近づくように傾く"
      controls={<Range label="ロケットの速さ（光の速さに対して）" min={0} max={0.8} step={0.1} value={b} onChange={setB} format={(v) => (v === 0 ? '止まっている' : `${Math.round(v * 10)}割`)} />}
      caption="地面の人が描いた時空図の上に、右へ進むロケットの人にとっての線を青で重ねた模式図です。速さを上げると、青の2本の線が黄色の光の線に近づきます。光の線の傾きは変わりません。AとBはロケットの人にとって同時に起きる2つの出来事です。"
    >
      <Svg id="18-3" w={720} h={392} label="地面の人の時空図に、ロケットの人の時間の軸と同時の線を重ねる。ロケットの速さを上げると、2本の線は光の45度の線に近づくように傾き、光の線は動かない。ロケットにとって同時の出来事AとBは、地面の人にとってはBが先に起きる。">
        {/* 光の線 */}
        <line x1={cx - S * 1.75} y1={cy + S * 1.75} x2={cx + S * 1.75} y2={cy - S * 1.75} stroke={LIGHT} strokeWidth={2.5} />
        <line x1={cx - S * 1.75} y1={cy - S * 1.75} x2={cx + S * 1.75} y2={cy + S * 1.75} stroke={LIGHT} strokeWidth={2.5} />
        <T x={cx + S * 1.75 + 4} y={cy - S * 1.75 + 2} fs={12}>
          光
        </T>
        {/* 地面の人の軸 */}
        <Arrow x1={cx - S * 1.8} y1={cy} x2={cx + S * 1.85} y2={cy} />
        <Arrow x1={cx} y1={cy + S * 1.8} x2={cx} y2={cy - S * 1.85} />
        <T x={cx - 8} y={cy - S * 1.85 + 2} anchor="end" fs={12}>
          地面の人の時間の軸
        </T>
        <T x={cx - S * 1.8} y={cy + 16} fs={12}>
          地面の人にとって同時
        </T>
        <line x1={cx - 5} y1={cy - S} x2={cx + 5} y2={cy - S} stroke="var(--fig-line)" strokeWidth={2} />
        <T x={cx - 8} y={cy - S} anchor="end" fs={11.5} tone="muted">
          1年
        </T>
        {/* ロケットの人の線 */}
        <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="var(--fig-accent)" strokeWidth={2.5} />
        <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="var(--fig-accent)" strokeWidth={2.5} strokeDasharray="7 5" />
        <circle cx={kx} cy={ky} r={5} fill="var(--fig-accent)" />
        <Ball x={ax} y={ay} r={7} fill="var(--fig-box2)" />
        <T x={ax} y={ay - 16} anchor="middle" fs={12} bold>
          A
        </T>
        <Ball x={bx} y={by} r={7} fill="var(--fig-box2)" />
        <T x={bx} y={by + 18} anchor="middle" fs={12} bold>
          B
        </T>
        {/* 説明 */}
        <T x={432} y={36} fs={12.5} bold>
          {b === 0 ? 'ロケットは止まっている' : `ロケットの速さ：光の速さの${Math.round(b * 10)}割`}
        </T>
        <line x1={432} y1={66} x2={462} y2={66} stroke="var(--fig-accent)" strokeWidth={2.5} />
        <T x={470} y={66} fs={12.5}>
          ロケットの世界線（時間の軸）
        </T>
        <line x1={432} y1={90} x2={462} y2={90} stroke="var(--fig-accent)" strokeWidth={2.5} strokeDasharray="7 5" />
        <T x={470} y={90} fs={12.5}>
          ロケットにとって同時の線
        </T>
        <circle cx={447} cy={114} r={5} fill="var(--fig-accent)" />
        <T x={470} y={114} fs={12.5}>
          ロケットの時計で1年の位置
        </T>
        <T x={432} y={146} fs={12.5}>
          青の2本の線は、同じ角度だけ光の線に近づく。
        </T>
        <T x={432} y={168} fs={12.5}>
          光の線（45度）は傾かない。
        </T>
        <T x={432} y={200} fs={12.5} tone="acc">
          ロケットの時計の1年は、
        </T>
        <T x={432} y={222} fs={12.5} tone="acc">
          {`地面の時計では${b === 0 ? '1' : g.toFixed(2)}年に当たる`}
        </T>
        <T x={432} y={256} fs={12.5}>
          {b === 0 ? 'AとBは、地面の人にとっても同時' : 'AとBは、ロケットの人にとっては同時。'}
        </T>
        {b > 0 && (
          <T x={432} y={278} fs={12.5}>
            地面の人にとっては、Bが先に起きる
          </T>
        )}
      </Svg>
    </Figure>
  )
}

/* ---------- 図18-4 双子の旅の世界線 ---------- */

export function FigTwinPaths() {
  const ox = 120
  const oy = 372
  const Y = 33 // 1年（縦）と1光年（横）の長さ
  const P = (x: number, t: number) => [ox + Y * x, oy - Y * t] as const
  const rocketTicks = [1, 2, 3, 4, 5, 6].map((k) => {
    const tc = k <= 3 ? k / 0.6 : 5 + (k - 3) / 0.6
    const x = tc <= 5 ? 0.8 * tc : 4 - 0.8 * (tc - 5)
    return { k, tc, x }
  })
  const [tx, ty] = P(4, 5)
  return (
    <Figure
      n="18-4"
      title="時空図の上で折れ曲がった世界線ほど、その線に沿って運ばれた時計は進まない"
      caption="第17章の双子の旅（光の速さの8割で4光年先の星まで往復する）を時空図に描いた模式図です。縦の1目盛りを1年、横の1目盛りを1光年にしています。縦の線の短い横線と青の破線の上の点は、それぞれの時計で1年ごとの位置を表します。"
    >
      <Svg id="18-4" w={720} h={400} label="地球に残った人の世界線は縦のまっすぐな線で、時計は10年進む。旅をした人の世界線は4光年先で折れ曲がる線で、時計は6年しか進まない。図の上では折れ線の方が長く見えるが、時計の進みは少ない。">
        <StAxes ox={ox} oy={oy} up={Y * 10.9} right={Y * 5.6} tLabel="時刻（年）" xLabel="場所（光年）" />
        <line x1={ox + Y * 4} y1={oy} x2={ox + Y * 4} y2={oy - Y * 10.4} stroke="var(--fig-muted)" strokeDasharray="3 4" />
        <T x={ox + Y * 4 + 6} y={oy - Y * 10.4} fs={11.5} tone="muted">
          星（4光年先）
        </T>
        <line x1={ox} y1={oy} x2={ox + Y * 5.3} y2={oy - Y * 5.3} stroke={LIGHT} strokeWidth={2} />
        <T x={ox + Y * 5.3 + 4} y={oy - Y * 5.3} fs={11.5}>
          光
        </T>
        {/* 地球の世界線 */}
        <line x1={ox} y1={oy} x2={ox} y2={oy - Y * 10} stroke="var(--fig-line)" strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={ox - 6} y1={oy - Y * (i + 1)} x2={ox} y2={oy - Y * (i + 1)} stroke="var(--fig-line)" strokeWidth={1.5} />
        ))}
        <T x={ox - 10} y={oy - Y * 5} anchor="end" fs={11.5}>
          5年
        </T>
        <T x={ox - 10} y={oy - Y * 10} anchor="end" fs={11.5}>
          10年
        </T>
        {/* ロケットの世界線 */}
        <polyline points={`${ox},${oy} ${tx},${ty} ${ox},${oy - Y * 10}`} fill="none" stroke="var(--fig-accent)" strokeWidth={3} strokeDasharray="9 5" />
        {rocketTicks.map(({ k, tc, x }) => {
          const [px, py] = P(x, tc)
          return <circle key={k} cx={px} cy={py} r={4} fill="var(--fig-accent)" />
        })}
        <T x={tx - 10} y={ty} anchor="end" fs={11.5} tone="acc">
          ロケットで3年
        </T>
        <T x={ox + 12} y={oy - Y * 10 + 2} fs={11.5} tone="acc">
          ロケットで6年
        </T>
        {/* 説明 */}
        <T x={410} y={60} fs={12.5} bold>
          地球に残った人：まっすぐな縦の線
        </T>
        <T x={410} y={82} fs={12.5}>
          地球の時計は10年進む
        </T>
        <T x={410} y={122} fs={12.5} bold tone="acc">
          旅をした人：折れ曲がった線（青の破線）
        </T>
        <T x={410} y={144} fs={12.5} tone="acc">
          ロケットの時計は6年しか進まない
        </T>
        <T x={410} y={192} fs={12.5}>
          図の上では折れ線の方が長く見えるが、
        </T>
        <T x={410} y={214} fs={12.5}>
          その線に沿って運ばれた時計の進みは少ない。
        </T>
        <T x={410} y={254} fs={12.5}>
          どの立場で時空図を描き直しても、
        </T>
        <T x={410} y={276} fs={12.5}>
          10年と6年という値は変わらない。
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図18-5 光の輪を積み重ねると円錐になる（動） ---------- */

export function FigConeGrow() {
  const ax = 230
  const ay = 196
  const K = 92 // 図の中の時間1あたりの高さと、光の輪の半径
  const SQ = 0.3 // 輪を斜めから見たときのつぶれ方
  const TMAX = 1.5
  const ring = (tau: number, key: string, strong: boolean) => {
    const r = K * Math.abs(tau)
    return (
      <ellipse
        key={key}
        cx={ax}
        cy={ay - K * tau}
        rx={Math.max(r, 0.5)}
        ry={Math.max(r * SQ, 0.5)}
        fill="none"
        stroke={LIGHT}
        strokeWidth={strong ? 3 : 1.2}
        opacity={strong ? 1 : 0.55}
      />
    )
  }
  return (
    <Anim
      n="18-5"
      title="光の輪の広がりを時刻ごとに積み重ねると、時空の中に円錐ができる"
      still={8}
      period={9.5}
      caption="空間の3つの方向のうち2つだけを横と奥行きに、時刻を縦にとった模式図です。前半は「ここ・今」で光ったフラッシュの光が広がる様子、後半は「ここ・今」に向かってまわりから光が集まってくる様子です。右には、同じ光を真上から見た様子を描いています。"
    >
      {(t) => {
        const fut = Math.min(Math.max((t - 0.6) / 2, 0), TMAX)
        const pastPhase = t >= 3.8
        const past = pastPhase ? Math.min((t - 3.8) / 2, TMAX) : 0
        const pastTau = -(TMAX - past) // 集まってくる光の輪の時刻（負は過去）
        const flash = t < 0.9
        const futSteps = [0.25, 0.5, 0.75, 1, 1.25, 1.5].filter((s) => s < fut - 0.01)
        const pastSteps = pastPhase ? [-1.5, -1.25, -1, -0.75, -0.5, -0.25].filter((s) => s < pastTau - 0.01) : []
        const done = t >= 7.8
        const topR = K * (pastPhase ? (done ? 0 : Math.abs(pastTau)) : fut)
        return (
          <Svg id="18-5" w={720} h={392} label="ここ・今で光ったフラッシュの光の輪が広がっていく様子を時刻ごとに積み重ねると、上向きの円錐（未来の光円錐）になる。ここ・今に向かって集まってくる光の輪を積み重ねると、下向きの円錐（過去の光円錐）になる。">
            <Arrow x1={40} y1={372} x2={40} y2={20} />
            <T x={50} y={24} fs={12}>
              時刻（上ほど後）
            </T>
            {/* 円錐の側面 */}
            <line x1={ax} y1={ay} x2={ax - K * fut} y2={ay - K * fut} stroke={LIGHT} strokeWidth={1.5} />
            <line x1={ax} y1={ay} x2={ax + K * fut} y2={ay - K * fut} stroke={LIGHT} strokeWidth={1.5} />
            {futSteps.map((s) => ring(s, `f${s}`, false))}
            {fut > 0.01 && ring(fut, 'fnow', !pastPhase)}
            {pastPhase && (
              <>
                <line x1={ax} y1={ay} x2={ax - K * TMAX} y2={ay + K * TMAX} stroke={LIGHT} strokeWidth={1.5} />
                <line x1={ax} y1={ay} x2={ax + K * TMAX} y2={ay + K * TMAX} stroke={LIGHT} strokeWidth={1.5} />
                {pastSteps.map((s) => ring(s, `p${s}`, false))}
                {!done && ring(pastTau, 'pnow', true)}
              </>
            )}
            <circle cx={ax} cy={ay} r={flash ? 11 : 5} fill={flash ? LIGHT : 'var(--fig-line)'} stroke="var(--fig-line)" strokeWidth={1} />
            <T x={ax - 16} y={ay + 2} anchor="end" fs={12.5} bold>
              ここ・今
            </T>
            {fut > 1.2 && (
              <>
                <T x={ax + K * 1.5 + 12} y={ay - K * 1.5 - 10} fs={12}>
                  未来の光円錐
                </T>
                <T x={ax + K * 1.5 + 12} y={ay - K * 1.5 + 8} fs={11.5} tone="muted">
                  （ここ・今から出た光）
                </T>
              </>
            )}
            {pastPhase && past > 1.2 && (
              <>
                <T x={ax + K * 1.5 + 12} y={ay + K * 1.5 - 8} fs={12}>
                  過去の光円錐
                </T>
                <T x={ax + K * 1.5 + 12} y={ay + K * 1.5 + 10} fs={11.5} tone="muted">
                  （ここ・今に届く光）
                </T>
              </>
            )}
            {/* 真上から見た図 */}
            <T x={600} y={86} anchor="middle" fs={12} tone="muted">
              真上から見ると
            </T>
            <rect x={520} y={100} width={160} height={160} rx={6} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <circle cx={600} cy={180} r={Math.max((topR / (K * TMAX)) * 72, 0.5)} fill="none" stroke={LIGHT} strokeWidth={3} />
            <circle cx={600} cy={180} r={3} fill="var(--fig-line)" />
            <T x={600} y={284} anchor="middle" fs={12.5}>
              {pastPhase ? (done ? '光が「ここ」に集まった' : '光の輪が縮んで集まってくる') : '光の輪が広がっていく'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図18-6 光円錐が分ける3つの領域 ---------- */

export function FigConeRegions() {
  const ox = 230
  const oy = 192
  const R = 168
  return (
    <Figure
      n="18-6"
      title="光円錐が、時空を「未来」「過去」「それ以外」の3つに分ける"
      caption="空間を1方向だけにした模式図です。黄色の2本の線は出来事Oを通る光の世界線です。円錐の内側の出来事とOの前後の順番は、どの立場から見ても変わりません。"
    >
      <Svg id="18-6" w={720} h={384} label="出来事Oを通る2本の光の線が、時空を3つに分ける。上の円錐の内側（未来）の出来事Aには、Oから合図を届けられる。下の円錐の内側（過去）の出来事Bからは、Oに合図を届けられる。外側の出来事Cには光でも届かず、Cは立場によってOより前にも後にも同時にもなる。">
        <polygon points={`${ox},${oy} ${ox - R},${oy - R} ${ox + R},${oy - R}`} fill="var(--fig-box3)" />
        <polygon points={`${ox},${oy} ${ox - R},${oy + R} ${ox + R},${oy + R}`} fill="var(--fig-box2)" />
        <line x1={ox - R} y1={oy - R} x2={ox + R} y2={oy + R} stroke={LIGHT} strokeWidth={2.5} />
        <line x1={ox - R} y1={oy + R} x2={ox + R} y2={oy - R} stroke={LIGHT} strokeWidth={2.5} />
        <T x={ox + R + 4} y={oy - R} fs={12}>
          光
        </T>
        <T x={ox} y={oy - R + 18} anchor="middle" fs={13} bold>
          未来
        </T>
        <T x={ox} y={oy + R - 14} anchor="middle" fs={13} bold>
          過去
        </T>
        <T x={ox - R + 6} y={oy - 40} fs={13} bold>
          それ以外
        </T>
        <T x={ox + R - 6} y={oy + 44} anchor="end" fs={13} bold>
          それ以外
        </T>
        <Ball x={ox} y={oy} r={6} fill="var(--fig-line)" />
        <T x={ox - 12} y={oy + 2} anchor="end" fs={12.5} bold>
          O（ここ・今）
        </T>
        {/* A：未来 */}
        <Arrow x1={ox + 4} y1={oy - 10} x2={ox + 36} y2={oy - 96} />
        <Ball x={ox + 40} y={oy - 106} r={7} fill="var(--fig-bg)" />
        <T x={ox + 54} y={oy - 106} fs={12.5} bold>
          A
        </T>
        {/* B：過去 */}
        <Arrow x1={ox - 52} y1={oy + 98} x2={ox - 6} y2={oy + 12} />
        <Ball x={ox - 56} y={oy + 108} r={7} fill="var(--fig-bg)" />
        <T x={ox - 70} y={oy + 108} anchor="end" fs={12.5} bold>
          B
        </T>
        {/* C：それ以外 */}
        <Arrow x1={ox + 10} y1={oy - 4} x2={ox + 132} y2={oy - 30} danger dashed />
        <Cross x={ox + 74} y={oy - 18} s={7} />
        <Ball x={ox + 142} y={oy - 32} r={7} fill="var(--fig-bg)" />
        <T x={ox + 142} y={oy - 50} anchor="middle" fs={12.5} bold>
          C
        </T>
        <T x={ox + 30} y={oy + 20} fs={11.5} tone="danger">
          光より速い合図が必要
        </T>
        {/* 説明 */}
        <T x={452} y={48} fs={12.5} bold>
          A（未来の円錐の内側）
        </T>
        <T x={452} y={70} fs={12.5}>
          Oから合図を届けられる
        </T>
        <T x={452} y={118} fs={12.5} bold>
          B（過去の円錐の内側）
        </T>
        <T x={452} y={140} fs={12.5}>
          Oに合図を届けられた
        </T>
        <T x={452} y={188} fs={12.5} bold>
          C（円錐の外側）
        </T>
        <T x={452} y={210} fs={12.5}>
          Oとの間では、光でも合図が届かない。
        </T>
        <T x={452} y={232} fs={12.5}>
          立場によって、Oより前にも、
        </T>
        <T x={452} y={254} fs={12.5}>
          後にも、同時にもなる
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図18-7 電子の速さと加速の電圧（スライダー） ---------- */

const VOLTS = [10, 25, 50, 100, 200, 500, 1000, 1500] // 万ボルト
const ME = 51.099895 // 電子の質量に当たるエネルギー（万電子ボルト）

/** 電圧 v 万ボルトで加速した電子の速さ（光の速さに対する割合） */
const relSpeed = (v: number) => Math.sqrt(1 - 1 / (1 + v / ME) ** 2)
/** ニュートンの力学で計算した速さ（光の速さに対する割合） */
const newtonSpeed = (v: number) => Math.sqrt((2 * v) / ME)

function pctWords(b: number) {
  const p = b * 100
  return p >= 99 ? `${p.toFixed(2)}%` : `${p.toFixed(1)}%`
}

export function FigElectronSpeed() {
  const [i, setI] = useState(2)
  const v = VOLTS[i]
  const X0 = 90
  const W = 400
  const lo = Math.log10(5)
  const hi = Math.log10(2000)
  const gx = (vv: number) => X0 + ((Math.log10(vv) - lo) / (hi - lo)) * W
  const Y0 = 330
  const H = 130 // 光の速さ1つ分の高さ
  const gy = (b: number) => Y0 - H * b
  const curve = (f: (vv: number) => number, cap: number) => {
    const pts: string[] = []
    for (let k = 0; k <= 200; k++) {
      const vv = 10 ** (lo + ((hi - lo) * k) / 200)
      const b = f(vv)
      if (b > cap) break
      pts.push(`${gx(vv).toFixed(1)},${gy(b).toFixed(1)}`)
    }
    return pts.join(' ')
  }
  const rb = relSpeed(v)
  const nb = newtonSpeed(v)
  const vc = ME / 2 // ニュートンの力学で光の速さに届く電圧
  return (
    <Figure
      n="18-7"
      title="電子を加速する電圧をいくら上げても、電子の速さは光の速さを超えない"
      controls={<Range label="電子を加速する電圧" min={0} max={VOLTS.length - 1} step={1} value={i} onChange={setI} format={(k) => `${VOLTS[k]}万ボルト`} />}
      caption="電子が受け取るエネルギーを、電子を加速する電圧で表しています。横軸は目盛りが10倍ごとに等しい間隔です。青の線は相対性理論で計算した速さ、赤の破線はニュートンの力学で計算した速さです。スライダーで電圧を変えると、2つの計算の値が右に出ます。"
    >
      <Svg id="18-7" w={720} h={372} label="電子を加速する電圧と電子の速さのグラフ。ニュートンの力学では約26万ボルトで光の速さに届き、さらに速くなる。相対性理論では速さは光の速さに近づくだけで超えない。ベルトッツィは1964年に、50万ボルトから1500万ボルトに当たる範囲で電子の速さを測った。">
        <rect x={gx(50)} y={gy(2.05)} width={gx(1500) - gx(50)} height={H * 2.05} fill="var(--fig-box4)" opacity={0.7} />
        <T x={(gx(50) + gx(1500)) / 2} y={Y0 - 14} anchor="middle" fs={11.5} tone="muted">
          ベルトッツィが測った範囲（1964年）
        </T>
        <Arrow x1={X0} y1={Y0} x2={X0 + W + 16} y2={Y0} />
        <Arrow x1={X0} y1={Y0} x2={X0} y2={gy(2.2)} />
        <T x={X0 - 6} y={gy(2.2) + 2} anchor="end" fs={12}>
          速さ
        </T>
        {[10, 100, 1000].map((vv) => (
          <g key={vv}>
            <line x1={gx(vv)} y1={Y0} x2={gx(vv)} y2={Y0 + 5} stroke="var(--fig-line)" />
            <T x={gx(vv)} y={Y0 + 16} anchor="middle" fs={11.5} tone="muted">
              {`${vv}万`}
            </T>
          </g>
        ))}
        <T x={X0 + W + 16} y={Y0 + 34} anchor="end" fs={12}>
          電子を加速する電圧（ボルト）
        </T>
        <line x1={X0} y1={gy(1)} x2={X0 + W} y2={gy(1)} stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="2 3" />
        <T x={X0 - 6} y={gy(1)} anchor="end" fs={11.5}>
          光の速さ
        </T>
        <T x={X0 - 6} y={gy(0.5)} anchor="end" fs={11.5} tone="muted">
          半分
        </T>
        <T x={X0 - 6} y={gy(2)} anchor="end" fs={11.5} tone="muted">
          2倍
        </T>
        <polyline points={curve(newtonSpeed, 2)} fill="none" stroke="var(--fig-danger)" strokeWidth={2} strokeDasharray="6 4" />
        <Cross x={gx(vc)} y={gy(1)} s={7} />
        <polyline points={curve(relSpeed, 2)} fill="none" stroke="var(--fig-accent)" strokeWidth={3} />
        <T x={X0 + 12} y={gy(1.75)} fs={11.5} tone="danger">
          ニュートンの力学の計算
        </T>
        <T x={gx(220)} y={gy(0.86)} fs={11.5} tone="acc">
          相対性理論の計算
        </T>
        <circle cx={gx(v)} cy={gy(rb)} r={6} fill="var(--fig-accent)" stroke="var(--fig-bg)" strokeWidth={1.5} />
        {nb <= 2 ? (
          <circle cx={gx(v)} cy={gy(nb)} r={6} fill="var(--fig-danger)" stroke="var(--fig-bg)" strokeWidth={1.5} />
        ) : (
          <Arrow x1={gx(v)} y1={gy(1.8)} x2={gx(v)} y2={gy(2.12)} danger />
        )}
        {/* 数値 */}
        <T x={530} y={60} fs={12.5} bold>
          {`電圧：${v}万ボルト`}
        </T>
        <T x={530} y={96} fs={12.5} tone="acc">
          相対性理論の計算
        </T>
        <T x={530} y={118} fs={12.5} tone="acc">
          {`光の速さの${pctWords(rb)}`}
        </T>
        <T x={530} y={154} fs={12.5} tone="danger">
          ニュートンの力学の計算
        </T>
        <T x={530} y={176} fs={12.5} tone="danger">
          {nb < 1 ? `光の速さの${pctWords(nb)}` : `光の速さの${nb.toFixed(1)}倍`}
        </T>
        <T x={530} y={226} fs={12} tone="muted">
          測った速さは、相対性理論の
        </T>
        <T x={530} y={246} fs={12} tone="muted">
          計算と合った
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図18-8 光を出すと質量が減る（動） ---------- */

function Pulse({ x, y, w }: { x: number; y: number; w: number }) {
  return <line x1={x - 14} y1={y} x2={x + 14} y2={y} stroke={LIGHT} strokeWidth={w} strokeLinecap="round" />
}

export function FigEmitLight() {
  const EMIT = 1
  const C = 150 // 図の中の光の速さ（ピクセル毎秒）
  const U = 50 // 下の段の物体の速さ
  return (
    <Anim
      n="18-8"
      title="物体が光を出すと、出した光のエネルギーに当たる分だけ質量が減る"
      still={2.3}
      period={4.6}
      caption="1905年9月の論文の考え方を描いた模式図です。物体が左右に同じ量の光を同時に出します。光を出したあとの物体の小ささは、変化を大げさに描いたものです。実際の質量の変化は、はかりで量れないほど小さな量です。"
    >
      {(t) => {
        const after = t >= EMIT
        const d = Math.max(0, t - EMIT) * C
        const r = after ? 17 : 21
        const x2 = 150 + U * t
        const e2 = 150 + U * EMIT
        return (
          <Svg id="18-8" w={720} h={336} label="上の段では、止まっている物体が左右に同じ量の光を出し、止まったまま少し質量が減る。下の段では、同じ出来事を横を動く人から見る。物体は光を出したあとも同じ速さで進むが、運動のエネルギーが減っているので、質量が減ったと分かる。">
            {/* 上の段 */}
            <T x={16} y={20} fs={12.5} bold>
              物体と一緒に止まっている人から見る
            </T>
            <line x1={20} y1={96} x2={700} y2={96} stroke="var(--fig-box)" strokeWidth={1.5} />
            {after && d < 360 && (
              <>
                <Pulse x={360 - 26 - d} y={96} w={5} />
                <Pulse x={360 + 26 + d} y={96} w={5} />
              </>
            )}
            <Ball x={360} y={96} r={r} />
            <T x={360} y={48} anchor="middle" fs={12}>
              {after ? '止まったまま' : '止まっている物体'}
            </T>
            <T x={360} y={138} anchor="middle" fs={12} tone="muted">
              {after ? '出した光のエネルギーの分だけ、物体のエネルギーが減る' : 'これから左右に同じ量の光を出す'}
            </T>
            {/* 下の段 */}
            <T x={16} y={176} fs={12.5} bold>
              横を一定の速さで動く人から見る
            </T>
            <line x1={20} y1={246} x2={700} y2={246} stroke="var(--fig-box)" strokeWidth={1.5} />
            {after && (
              <>
                {e2 - 26 - d > 20 && <Pulse x={e2 - 26 - d} y={246} w={3} />}
                {e2 + 26 + d < 700 && <Pulse x={e2 + 26 + d} y={246} w={8} />}
              </>
            )}
            <Ball x={x2} y={246} r={r} />
            <Vel x1={x2 + 24} y1={214} x2={x2 + 74} y2={214} />
            <T x={x2 + 24} y={200} fs={11.5} tone="muted">
              速さ
            </T>
            {after && (
              <T x={16} y={296} fs={12} tone="muted">
                光は前向きの方がエネルギーが多く、後ろ向きの方が少なく測られる（線の太さ）。合計は上の段より多い
              </T>
            )}
            <T x={16} y={320} fs={12.5} tone="acc">
              {after ? '光を出したあとも速さは同じなのに、運動のエネルギーが減った → 減ったのは質量' : '物体は一定の速さで右へ進んでいる'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図18-9 1グラムの質量に当たるエネルギー ---------- */

function House({ x, y }: { x: number; y: number }) {
  return <path d={`M${x},${y + 5} L${x + 6},${y} L${x + 12},${y + 5} L${x + 12},${y + 13} L${x},${y + 13} Z`} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeWidth={0.8} />
}

export function Fig1Gram() {
  return (
    <Figure
      n="18-9"
      title="1グラムの質量に当たるエネルギーは、日本の家庭約6400世帯が1年間に使う電気の量になる"
      caption="上の段は、1グラムの質量がすべてエネルギーに変わったとして計算した値です。下の段は逆向きの計算で、ふだん使うエネルギーを質量に直すと、はかりでは量れないほど小さくなります。家庭の電気は2023年度の全国平均（1世帯あたり1年に3911キロワット時）です。"
    >
      <Svg id="18-9" w={720} h={330} label="1円玉1枚の質量1グラムに当たるエネルギーは約90兆ジュールで、約2500万キロワット時になる。これは日本の家庭約6400世帯が1年間に使う電気の量である。逆に、1世帯が1年間に使う電気を質量にすると約0.16ミリグラム、ラジウム1グラムが1年間に出す熱を質量にすると約1億分の4グラムになる。">
        <circle cx={70} cy={88} r={38} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
        <circle cx={70} cy={88} r={31} fill="none" stroke="var(--fig-line)" strokeWidth={0.8} />
        <T x={70} y={88} anchor="middle" fs={14} bold>
          1円
        </T>
        <T x={70} y={144} anchor="middle" fs={12}>
          1円玉1枚
        </T>
        <T x={70} y={162} anchor="middle" fs={12} tone="muted">
          （質量1グラム）
        </T>
        <Arrow x1={116} y1={88} x2={150} y2={88} />
        <Box x={152} y={46} w={200} h={84} fill="box3" lines={['質量に当たるエネルギー', '約90兆ジュール', '（約2500万キロワット時）']} bold fs={12.5} />
        <Arrow x1={354} y1={88} x2={388} y2={88} />
        {Array.from({ length: 64 }, (_, k) => (
          <House key={k} x={396 + (k % 16) * 19} y={34 + Math.floor(k / 16) * 20} />
        ))}
        <T x={396} y={130} fs={12.5}>
          日本の家庭 約6400世帯が1年間に使う電気
        </T>
        <T x={396} y={150} fs={11.5} tone="muted">
          （家1軒の絵が100世帯）
        </T>
        <line x1={16} y1={184} x2={704} y2={184} stroke="var(--fig-box)" strokeWidth={1.5} />
        <T x={16} y={204} fs={12} tone="muted">
          逆向きの計算：ふだんのエネルギーを質量に直す
        </T>
        <Box x={16} y={222} w={300} h={44} lines={['1世帯が1年間に使う電気', '（3911キロワット時）']} subTone="muted" fs={12.5} />
        <Arrow x1={318} y1={244} x2={388} y2={244} />
        <T x={396} y={244} fs={12.5} tone="acc">
          質量にすると 約0.16ミリグラム
        </T>
        <Box x={16} y={276} w={300} h={44} lines={['ラジウム1グラムが1年間に出す熱', '（約88万カロリー）']} subTone="muted" fs={12.5} />
        <Arrow x1={318} y1={298} x2={388} y2={298} />
        <T x={396} y={298} fs={12.5} tone="acc">
          質量にすると 約1億分の4グラム
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図18-10 山の上から海面まで届くミューオン（動・切り替え） ---------- */

const N_MU = 100
const TAU = 2.197 // 止まったミューオンの平均寿命（100万分の1秒）
const FALL = 6.43 // 高さ約1917mを光の速さの99.5%で降りる時間（100万分の1秒）
const GAMMA_MU = 10 // 光の速さの99.5%での時間の遅れの倍率（約10倍）

/** 各ミューオンが自分の時計で崩壊する時刻と、横の位置。指数分布の分位点を決まった順に並べ替える */
const MUONS = (() => {
  const r = rng(18)
  const life = Array.from({ length: N_MU }, (_, k) => -TAU * Math.log(1 - (k + 0.5) / N_MU))
  for (let k = life.length - 1; k > 0; k--) {
    const j = Math.floor(r() * (k + 1))
    ;[life[k], life[j]] = [life[j], life[k]]
  }
  return life.map((l) => ({ life: l, x: 150 + r() * 250, dy: r() * 26 }))
})()

export function FigMuonMountain() {
  const [mode, setMode] = useState<'yes' | 'no'>('yes')
  const PLAY = 4 // 降りる様子を見せる秒数
  const TOP = 64
  const BOTTOM = 330
  return (
    <Anim
      n="18-10"
      title="時間の遅れがあるので、山の上を通ったミューオンの多くが海面まで届く"
      still={PLAY + 0.2}
      period={PLAY + 2.4}
      controls={
        <Choice
          label="ミューオンの時計の遅れ"
          options={[
            { value: 'yes', label: 'あり（相対性理論）' },
            { value: 'no', label: 'なし（ニュートンの考え）' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="フリッシュとスミスの実験（1962〜1963年）の条件をもとに計算した模式図です。ミューオンは光の速さの99.5%で一定の速さで降りるとし、空気の中で遅くなることは無視しています。「なし」に切り替えると、時間の遅れがない場合の計算になります。"
    >
      {(t) => {
        const T0 = (Math.min(t, PLAY) / PLAY) * FALL // 地上の時計
        const own = mode === 'yes' ? T0 / GAMMA_MU : T0 // ミューオンの時計
        const alive = MUONS.filter((m) => m.life > own).length
        const yNow = TOP + ((BOTTOM - TOP - 30) * T0) / FALL
        const end = t >= PLAY
        return (
          <Svg id="18-10" w={720} h={360} label="山頂を通った100個のミューオンが海面へ降りる。時間の遅れがあると約75個が海面まで届き、時間の遅れがないとすると約5個しか届かない。">
            <path d={`M20,${BOTTOM} L70,${TOP + 40} L106,${TOP} L132,${TOP + 26} L150,${BOTTOM}`} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <line x1={100} y1={TOP} x2={420} y2={TOP} stroke="var(--fig-muted)" strokeDasharray="5 4" />
            <T x={150} y={TOP - 14} fs={12}>
              山頂（高さ約1900m、ワシントン山）
            </T>
            <rect x={20} y={BOTTOM} width={400} height={14} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={150} y={BOTTOM + 24} fs={12}>
              海面（ケンブリッジ）
            </T>
            {MUONS.map((m, k) => {
              const dead = m.life <= own
              if (dead) {
                const dt = mode === 'yes' ? m.life * GAMMA_MU : m.life
                const yd = TOP + ((BOTTOM - TOP - 30) * dt) / FALL + m.dy
                return <circle key={k} cx={m.x} cy={yd} r={1.8} fill="var(--fig-muted)" />
              }
              return <circle key={k} cx={m.x} cy={yNow + m.dy} r={3.6} fill="var(--fig-accent)" />
            })}
            {/* 数値 */}
            <T x={450} y={56} fs={12.5}>
              山頂を通ったミューオン：100個
            </T>
            <T x={450} y={92} fs={12.5}>
              {`地上の時計：100万分の${T0.toFixed(1)}秒`}
            </T>
            <T x={450} y={116} fs={12.5}>
              {`ミューオンの時計：100万分の${own.toFixed(mode === 'yes' ? 2 : 1)}秒`}
            </T>
            <T x={450} y={156} fs={13} bold tone="acc">
              {`${end ? '海面に届いた数' : '残っている数'}：${alive}個`}
            </T>
            <T x={450} y={206} fs={12} tone="muted">
              青の点：まだ崩壊していないミューオン
            </T>
            <T x={450} y={226} fs={12} tone="muted">
              小さな灰色の点：崩壊した場所
            </T>
            <T x={450} y={266} fs={12} tone="muted">
              止まったミューオンの平均寿命：
            </T>
            <T x={450} y={286} fs={12} tone="muted">
              100万分の2.2秒
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}
