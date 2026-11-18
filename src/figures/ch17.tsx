import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Vel } from './common'

/*
 * 第17章の図の決まり：光（光の筋・光の合図）は黄色（LIGHT）で描き、必ず文字を添える。
 * 時計の進みは「光の速さに対する割合」から計算する（止まった時計を1としたときの進み）。
 */

const LIGHT = '#e0a000'

/** 光の速さに対する割合 b で動く時計の進み（止まった時計を1とする） */
const rate = (b: number) => Math.sqrt(1 - b * b)

/** 小数を n けたで丸め、末尾の 0 を消す */
const fmt = (v: number, n = 1) => v.toFixed(n).replace(/\.?0+$/, '')

/** 「8割」「9割5分」のような速さの言い方 */
function speedWords(b: number) {
  const t = Math.round(b * 100)
  if (t % 10 === 0) return `${t / 10}割`
  return `${Math.floor(t / 10)}割${t % 10}分`
}

/** 「10分の6」「約0.87倍」のような進みの言い方 */
function rateWords(r: number) {
  const ten = r * 10
  if (Math.abs(ten - Math.round(ten)) < 1e-9) return Math.round(ten) === 10 ? 'そのまま' : `10分の${Math.round(ten)}`
  return `約${r.toFixed(2)}倍`
}

/** 横向きのロケット。x は後ろの端、len は長さ、dir は向き（1 で右、-1 で左） */
function Rocket({ x, y, len = 34, h = 14, dir = 1 }: { x: number; y: number; len?: number; h?: number; dir?: 1 | -1 }) {
  const body = len * 0.72
  const p = (u: number, v: number) => `${(x + dir * u).toFixed(1)},${(y + v).toFixed(1)}`
  return (
    <polygon
      points={`${p(0, -h / 2)} ${p(body, -h / 2)} ${p(len, 0)} ${p(body, h / 2)} ${p(0, h / 2)}`}
      fill="var(--fig-box3)"
      stroke="var(--fig-line)"
      strokeWidth={1.5}
    />
  )
}

/** 星の印 */
function Star({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  return <polygon points={pts} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.2} />
}

/* ---------- 図17-1 磁石とコイル ---------- */

function MagnetCoil({ x0, move }: { x0: number; move: 'magnet' | 'coil' }) {
  const cy = 92
  return (
    <g>
      <T x={x0 + 170} y={22} anchor="middle" bold>
        {move === 'magnet' ? '磁石をコイルに近づける' : 'コイルを磁石に近づける'}
      </T>
      {/* 磁石（右の端がN極） */}
      <rect x={x0 + 60} y={cy - 12} width={40} height={24} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <rect x={x0 + 100} y={cy - 12} width={40} height={24} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={x0 + 80} y={cy} anchor="middle" fs={12}>
        S
      </T>
      <T x={x0 + 120} y={cy} anchor="middle" fs={12}>
        N
      </T>
      <T x={x0 + 100} y={cy + 28} anchor="middle" fs={12}>
        磁石
      </T>
      {/* コイル */}
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={k} cx={x0 + 205 + k * 10} cy={cy} rx={6} ry={24} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      ))}
      <T x={x0 + 262} y={cy} fs={12}>
        コイル
      </T>
      <path d={`M${x0 + 205},${cy + 24} V170 H${x0 + 214}`} fill="none" stroke="var(--fig-line)" />
      <path d={`M${x0 + 245},${cy + 24} V170 H${x0 + 236}`} fill="none" stroke="var(--fig-line)" />
      <circle cx={x0 + 225} cy={170} r={11} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <line x1={x0 + 225} y1={176} x2={x0 + 230} y2={163} stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={x0 + 256} y={170} fs={12}>
        電流が流れる
      </T>
      {move === 'magnet' ? (
        <>
          <Vel x1={x0 + 70} y1={58} x2={x0 + 130} y2={58} />
          <T x={x0 + 100} y={42} anchor="middle" fs={12} tone="muted">
            動く
          </T>
        </>
      ) : (
        <>
          <Vel x1={x0 + 255} y1={52} x2={x0 + 195} y2={52} />
          <T x={x0 + 225} y={38} anchor="middle" fs={12} tone="muted">
            動く
          </T>
        </>
      )}
      <T x={x0 + 170} y={204} anchor="middle" fs={12.5}>
        {move === 'magnet' ? '当時の説明：動く磁石のまわりに' : '当時の説明：動く導線の中の電気に'}
      </T>
      <T x={x0 + 170} y={223} anchor="middle" fs={12.5}>
        {move === 'magnet' ? '電場ができ、その力で電流が流れる' : '磁石から力がはたらき、電流が流れる'}
      </T>
    </g>
  )
}

export function FigMagnetCoil() {
  return (
    <Figure n="17-1" title="同じ電流が流れるのに、当時の理論は2通りの説明をしていた" caption="模式図です。近づく速さが同じなら、どちらを動かしても同じ電流が流れます。アインシュタインは1905年の論文をこの例から始めました。">
      <Svg id="17-1" w={720} h={240} label="左は磁石をコイルに近づける場合、右はコイルを磁石に近づける場合。どちらでも同じ電流が流れるが、当時の理論は、左では磁石のまわりにできる電場で、右では動く導線の中の電気にはたらく力で、別々に説明していた。">
        <MagnetCoil x0={0} move="magnet" />
        <line x1={360} y1={12} x2={360} y2={228} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <MagnetCoil x0={360} move="coil" />
      </Svg>
    </Figure>
  )
}

/* ---------- 図17-2 ボールと光（動） ---------- */

export function FigBallLight() {
  const t0 = 1 // 投げる・光らせる時刻
  const xs = 170 // 投げる・光らせる場所
  const vc = 30 // 台車の速さ
  const vb = 40 // 投げる速さ
  const cl = 150 // 光の速さ（図の中の値。実際の比とは違う）
  const rows = [
    { yb: 58, label: '走る台車から', kind: 'cartBall' },
    { yb: 110, label: '立ち止まって', kind: 'standBall' },
    { yb: 184, label: '走る台車のランプ', kind: 'cartLamp' },
    { yb: 236, label: '地面のランプ', kind: 'groundLamp' },
  ] as const
  return (
    <Anim
      n="17-2"
      title="投げたボールは台車の速さが加わるが、光の速さは光らせる物の速さによらない"
      still={3.6}
      period={6}
      caption="模式図です。ボールと光の速さの比は実際と違います。下の2段では、走る台車のランプと地面のランプが、すれ違う瞬間に光ります。"
    >
      {(t) => {
        const tt = Math.min(t, t0 + 4.4)
        const s = Math.max(0, tt - t0)
        const thrown = tt >= t0
        const cartX = 140 + vc * tt
        return (
          <Svg id="17-2" w={720} h={262} label="走る台車から投げたボールは、立ち止まって投げたボールより速く進む。走る台車のランプの光と地面のランプの光は、同じ速さで並んで進む。">
            <T x={16} y={18} bold fs={12.5}>
              ボールを前へ投げる（どちらも同じ強さ）
            </T>
            <T x={706} y={18} anchor="end" fs={12} tone="acc">
              台車から投げた方が速く進む
            </T>
            <T x={16} y={146} bold fs={12.5}>
              ランプを光らせる
            </T>
            <T x={706} y={146} anchor="end" fs={12} tone="acc">
              2つの光は並んだまま進む
            </T>
            {rows.map((r) => {
              const y = r.yb
              const onCart = r.kind === 'cartBall' || r.kind === 'cartLamp'
              const ballV = r.kind === 'cartBall' ? vc + vb : vb
              const lx = xs + cl * s
              return (
                <g key={r.kind}>
                  <T x={16} y={y - 6} fs={12}>
                    {r.label}
                  </T>
                  <line x1={120} y1={y + 12} x2={712} y2={y + 12} stroke="var(--fig-muted)" />
                  {onCart && (
                    <g>
                      <rect x={cartX - 22} y={y - 4} width={44} height={12} rx={2} fill="var(--fig-box3)" stroke="var(--fig-line)" />
                      <circle cx={cartX - 12} cy={y + 9} r={3} fill="var(--fig-bg)" stroke="var(--fig-line)" />
                      <circle cx={cartX + 12} cy={y + 9} r={3} fill="var(--fig-bg)" stroke="var(--fig-line)" />
                    </g>
                  )}
                  {r.kind === 'standBall' && (
                    <g stroke="var(--fig-line)" strokeWidth={1.5}>
                      <circle cx={xs - 14} cy={y - 18} r={5} fill="var(--fig-bg)" />
                      <line x1={xs - 14} y1={y - 13} x2={xs - 14} y2={y + 12} />
                    </g>
                  )}
                  {r.kind === 'groundLamp' && (
                    <g>
                      <line x1={xs} y1={y + 12} x2={xs} y2={y - 6} stroke="var(--fig-line)" strokeWidth={1.5} />
                      <circle cx={xs} cy={y - 12} r={5} fill={LIGHT} stroke="var(--fig-line)" />
                    </g>
                  )}
                  {r.kind === 'cartLamp' && <circle cx={cartX} cy={y - 12} r={5} fill={LIGHT} stroke="var(--fig-line)" />}
                  {(r.kind === 'cartBall' || r.kind === 'standBall') &&
                    (() => {
                      const bx = thrown ? xs + ballV * s : r.kind === 'cartBall' ? cartX : xs
                      return (
                        <g>
                          <Ball x={bx} y={y - 12} r={6} />
                          {thrown && <Vel x1={bx + 8} y1={y - 12} x2={bx + 8 + ballV * 0.5} y2={y - 12} />}
                        </g>
                      )
                    })()}
                  {(r.kind === 'cartLamp' || r.kind === 'groundLamp') && thrown && lx < 706 && (
                    <line x1={Math.max(xs, lx - 16)} y1={y - 12} x2={lx} y2={y - 12} stroke={LIGHT} strokeWidth={5} strokeLinecap="round" />
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

/* ---------- 図17-3 列車の中と外で「同時」が食い違う（動・切り替え） ---------- */

export function FigSimultaneity() {
  const [view, setView] = useState<'train' | 'ground'>('ground')
  const c = 120 // 光の速さ（図の中の値）
  const v = 60 // 列車の速さ（光の速さの5割）
  const half = 180 // 列車の長さの半分
  const tf = 0.6 // ランプが光る時刻
  const train = view === 'train'
  return (
    <Anim
      n="17-3"
      title="列車の中では同時に届く光が、地面から見ると後ろの壁に先に届く"
      still={4.2}
      period={4.8}
      controls={
        <Choice
          label="見る立場"
          options={[
            { value: 'train', label: '列車の中から' },
            { value: 'ground', label: '地面から' },
          ]}
          value={view}
          onChange={setView}
        />
      }
      caption="模式図です。列車は光の速さの5割で右へ進みます。「見る立場」を切り替えると、列車の中から見た様子と地面から見た様子を比べられます。地面から見た列車の縮み（この章の後の節）は省いています。"
    >
      {(t) => {
        const s = Math.max(0, t - tf)
        const lit = t >= tf
        // 列車の中から：列車は止まり、地面が左へ動く
        // 地面から：列車が右へ動き、光は光った場所から左右に同じ速さで広がる
        const xc = train ? 360 : 260 + v * s
        const xl = xc - half
        const xr = xc + half
        const emit = train ? 360 : 260
        const tBack = train ? half / c : half / (c + v)
        const tFront = train ? half / c : half / (c - v)
        const hitBack = lit && s >= tBack
        const hitFront = lit && s >= tFront
        const leftFront = hitBack ? xl : emit - c * s
        const rightFront = hitFront ? xr : emit + c * s
        const shift = train ? -((v * t) % 40) : 0
        return (
          <Svg id="17-3" w={720} h={224} label="列車の真ん中で光ったランプの光。列車の中から見ると前と後ろの壁に同時に届く。地面から見ると、列車が右へ動くので、後ろの壁に先に、前の壁にあとで届く。">
            <T x={16} y={20} bold fs={12.5}>
              {train ? '列車の中から見た様子' : '地面から見た様子'}
            </T>
            {/* 線路と地面の目盛り */}
            <line x1={0} y1={150} x2={720} y2={150} stroke="var(--fig-line)" strokeWidth={1.5} />
            {Array.from({ length: 20 }, (_, i) => {
              const gx = i * 40 + shift
              return <line key={i} x1={gx} y1={150} x2={gx} y2={158} stroke="var(--fig-muted)" />
            })}
            {train ? (
              <>
                <Vel x1={420} y1={182} x2={340} y2={182} />
                <T x={432} y={182} fs={12} tone="muted">
                  地面が左へ動いて見える
                </T>
              </>
            ) : (
              <>
                <Vel x1={xc - 40} y1={46} x2={xc + 40} y2={46} />
                <T x={xc + 50} y={46} fs={12} tone="muted">
                  列車の動く向き
                </T>
                <polygon points={`${emit},152 ${emit - 6},164 ${emit + 6},164`} fill="var(--fig-muted)" />
                <T x={emit} y={180} anchor="middle" fs={12} tone="muted">
                  光った場所
                </T>
              </>
            )}
            {/* 列車 */}
            <rect x={xl} y={80} width={half * 2} height={60} rx={4} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={xl + 8} y={90} fs={11.5} tone="muted">
              後ろの壁
            </T>
            <T x={xr - 8} y={90} anchor="end" fs={11.5} tone="muted">
              前の壁
            </T>
            {hitBack && <line x1={xl} y1={80} x2={xl} y2={140} stroke={LIGHT} strokeWidth={5} />}
            {hitFront && <line x1={xr} y1={80} x2={xr} y2={140} stroke={LIGHT} strokeWidth={5} />}
            <circle cx={xc} cy={92} r={6} fill={lit ? LIGHT : 'var(--fig-bg)'} stroke="var(--fig-line)" />
            {lit && (
              <>
                <line x1={leftFront} y1={118} x2={rightFront} y2={118} stroke={LIGHT} strokeWidth={1.5} strokeDasharray="4 3" />
                {!hitBack && <line x1={leftFront} y1={104} x2={leftFront} y2={132} stroke={LIGHT} strokeWidth={3} />}
                {!hitFront && <line x1={rightFront} y1={104} x2={rightFront} y2={132} stroke={LIGHT} strokeWidth={3} />}
              </>
            )}
            {train && hitBack && hitFront && (
              <T x={360} y={66} anchor="middle" fs={12.5} tone="acc">
                前と後ろの壁に同時に届く
              </T>
            )}
            {!train && hitBack && (
              <T x={xl} y={66} anchor="middle" fs={12.5} tone="acc">
                先に届く
              </T>
            )}
            {!train && hitFront && (
              <T x={xr} y={66} anchor="end" fs={12.5} tone="acc">
                あとで届く
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図17-4 光時計（動・スライダー） ---------- */

const SPEEDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99]

export function FigLightClock() {
  const [idx, setIdx] = useState(8)
  const b = SPEEDS[idx]
  const r = rate(b)
  const L = 60 // 鏡の間の距離
  const T0 = 1.6 // 止まった時計の1往復の時間
  const c = (2 * L) / T0 // 光の速さ（図の中の値）
  const Tm = T0 / r // 動く時計の1往復の時間（地面から見て）
  const D = 8 // 動かす時間
  const x0 = 80
  return (
    <Anim
      n="17-4"
      title="走る光時計では光の道が斜めに長くなり、1回刻むのに時間がかかる"
      still={D}
      period={D + 1.6}
      controls={<Range label="動く速さ（光の速さに対する割合）" min={0} max={SPEEDS.length - 1} value={idx} onChange={setIdx} format={(i) => (i === 0 ? '0（止まっている）' : speedWords(SPEEDS[i]))} />}
      caption="模式図です。上下とも地面から見た様子です。スライダーで速さを変えると、下の光の道の傾き、往復の回数、下の文の数値が変わります。"
    >
      {(t) => {
        const tt = Math.min(t, D)
        const ph = (tt % T0) / T0
        const yRest = ph < 0.5 ? 106 - 2 * L * ph : 46 + 2 * L * (ph - 0.5)
        const nRest = Math.floor(tt / T0 + 1e-6)
        const nMove = Math.floor(tt / Tm + 1e-6)
        const mx = x0 + b * c * tt
        // 動く時計の光の道（鏡で折り返す点を順につなぐ）
        const pts: [number, number][] = []
        const halfT = Tm / 2
        for (let k = 0; k * halfT <= tt + 1e-9; k++) pts.push([x0 + b * c * k * halfT, k % 2 ? 166 : 226])
        const pm = (tt % Tm) / Tm
        const yMove = pm < 0.5 ? 226 - 2 * L * pm : 166 + 2 * L * (pm - 0.5)
        pts.push([mx, yMove])
        const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
        const ten = fmt(r * 10)
        return (
          <Svg id="17-4" w={720} h={320} label="上の光時計では光がまっすぐ上下に往復する。下の光時計は右へ動いているので、地面から見ると光は斜めのジグザグの道を進み、1往復に時間がかかる。速さが光の速さの8割なら、動く時計の進みは10分の6になる。">
            <T x={16} y={22} bold fs={12.5}>
              地面に置いた光時計
            </T>
            <T x={704} y={22} anchor="end" fs={12.5}>
              {`往復した回数：${nRest}回`}
            </T>
            <line x1={x0 - 20} y1={46} x2={x0 + 20} y2={46} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={x0 - 20} y1={106} x2={x0 + 20} y2={106} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={x0} y1={46} x2={x0} y2={106} stroke={LIGHT} strokeWidth={2} strokeDasharray="4 3" />
            <circle cx={x0} cy={yRest} r={5} fill={LIGHT} stroke="var(--fig-line)" />
            <T x={x0 + 34} y={76} fs={12} tone="muted">
              光はまっすぐ上下に往復する
            </T>
            <T x={16} y={142} bold fs={12.5}>
              {b === 0 ? '動かさない光時計' : `光の速さの${speedWords(b)}で右へ動く光時計`}
            </T>
            <T x={704} y={142} anchor="end" fs={12.5}>
              {`往復した回数：${nMove}回`}
            </T>
            <path d={path} fill="none" stroke={LIGHT} strokeWidth={2} strokeDasharray="4 3" />
            <line x1={mx - 20} y1={166} x2={mx + 20} y2={166} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={mx - 20} y1={226} x2={mx + 20} y2={226} stroke="var(--fig-line)" strokeWidth={3} />
            <circle cx={mx} cy={yMove} r={5} fill={LIGHT} stroke="var(--fig-line)" />
            <T x={16} y={262} fs={13} tone="acc">
              {b === 0 ? '動かさなければ、2つの時計は同じように刻む' : `速さが光の速さの${speedWords(b)}のとき、動く時計の進みは${rateWords(r)}`}
            </T>
            <T x={16} y={286} fs={12.5}>
              {`地面の時計で10秒たつ間に、動く時計は${ten}秒進む`}
            </T>
            <T x={16} y={308} fs={12} tone="muted">
              光の速さはどちらの時計でも同じ。斜めの道は長いので、1往復に時間がかかる
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図17-5 速さと時計の進み ---------- */

export function FigRateCurve() {
  const gx = (b: number) => 90 + b * 480
  const gy = (r: number) => 260 - r * 200
  const curve = Array.from({ length: 401 }, (_, i) => {
    const b = i / 400
    return `${i ? 'L' : 'M'}${gx(b).toFixed(1)},${gy(rate(b)).toFixed(1)}`
  }).join(' ')
  const marks = [
    { b: 0.5, lx: -8, ly: 22 },
    { b: 0.8, lx: -8, ly: 20 },
    { b: 0.9, lx: -8, ly: 22 },
    { b: 0.99, lx: -8, ly: 8 },
  ]
  return (
    <Figure n="17-5" title="速さが光の速さに近づくと、動く時計の進みは急に小さくなる" caption="横軸は動く速さ、縦軸は止まった時計を基準にした、動く時計の進みです。点の横の数値は光の速さに対する割合から計算しました。">
      <Svg id="17-5" w={660} h={316} label="動く速さと時計の進みのグラフ。速さが光の速さの5割で約0.87倍、8割で10分の6、9割で約0.44倍、9割9分で約0.14倍になる。光の速さの1割でも、遅れは200分の1ほどである。">
        <line x1={gx(0)} y1={gy(0)} x2={gx(1) + 16} y2={gy(0)} stroke="var(--fig-line)" />
        <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(1) - 16} stroke="var(--fig-line)" />
        <line x1={gx(0)} y1={gy(1)} x2={gx(1)} y2={gy(1)} stroke="var(--fig-muted)" strokeDasharray="3 4" />
        <line x1={gx(1)} y1={gy(0)} x2={gx(1)} y2={gy(1)} stroke="var(--fig-muted)" strokeDasharray="3 4" />
        <T x={gx(0)} y={30} anchor="middle" fs={12.5}>
          動く時計の進み
        </T>
        <T x={gx(0) - 8} y={gy(1)} anchor="end" fs={12}>
          そのまま
        </T>
        <T x={gx(0) - 8} y={gy(0.5)} anchor="end" fs={12}>
          半分
        </T>
        <T x={gx(0) - 8} y={gy(0)} anchor="end" fs={12}>
          0
        </T>
        <T x={gx(0)} y={276} anchor="middle" fs={12}>
          0
        </T>
        <T x={gx(0.5)} y={276} anchor="middle" fs={12}>
          5割
        </T>
        <T x={gx(1)} y={276} anchor="middle" fs={12}>
          10割（光の速さ）
        </T>
        <T x={gx(0.5)} y={300} anchor="middle" fs={12.5}>
          動く速さ（光の速さに対する割合）
        </T>
        <path d={curve} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
        {marks.map((m) => {
          const r = rate(m.b)
          const x = gx(m.b)
          const y = gy(r)
          return (
            <g key={m.b}>
              <circle cx={x} cy={y} r={4.5} fill="var(--fig-accent)" />
              <T x={x + m.lx} y={y + m.ly} anchor="end" fs={12}>
                {`${speedWords(m.b)}：${rateWords(r)}`}
              </T>
            </g>
          )
        })}
        <T x={110} y={214} fs={12} tone="muted">
          光の速さの1割（1秒に約3万km）でも、
        </T>
        <T x={110} y={232} fs={12} tone="muted">
          時計の遅れは200分の1ほど
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図17-6 長さの縮み ---------- */

export function FigContraction() {
  const rowsB = [0, 0.5, 0.8, 0.9, 0.99]
  const LEN = 320
  return (
    <Figure n="17-6" title="動いている物は、動く向きにだけ縮んで測られる" caption="止まっている人から見たロケットの長さです（模式図）。縮む割合は時計の進みと同じです。ロケットの中の人から見ると、長さは変わりません。">
      <Svg id="17-6" w={720} h={290} label="止まっているロケットと、光の速さの5割、8割、9割、9割9分で動くロケット。動く向きの長さだけが、約0.87倍、10分の6、約0.44倍、約0.14倍に縮み、高さは変わらない。">
        {rowsB.map((b, i) => {
          const y = 36 + i * 50
          const r = rate(b)
          const len = LEN * r
          return (
            <g key={b}>
              <T x={16} y={y} fs={12.5}>
                {b === 0 ? '止まっているとき' : `${speedWords(b)}の速さ`}
              </T>
              <Rocket x={170} y={y} len={len} h={28} />
              {b > 0 && <Vel x1={170 + len + 10} y1={y} x2={170 + len + 40} y2={y} />}
              <T x={540} y={y} fs={12.5} tone={b === 0 ? undefined : 'acc'}>
                {b === 0 ? '長さはそのまま' : `長さは${rateWords(r)}`}
              </T>
            </g>
          )
        })}
        <T x={170} y={278} fs={12} tone="muted">
          高さ（動く向きと直角の長さ）は、どの速さでも変わらない
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図17-7 地球から見た旅とロケットから見た旅 ---------- */

export function FigTwoViews() {
  const PX = 130 // 1光年の長さ
  const E = 80
  return (
    <Figure n="17-7" title="地球から見ても、ロケットから見ても、星に着いたときのロケットの時計は3年" caption="4光年は、光が4年かけて進む距離です（模式図）。地球から見ると時計の遅れで、ロケットから見ると距離の縮みで、同じ結果が説明できます。">
      <Svg id="17-7" w={720} h={304} label="上は地球から見た様子。4光年先の星へ光の速さの8割で進むロケットは5年かかり、その間にロケットの時計は3年進む。下はロケットから見た様子。地球と星の間の距離は縮んで2.4光年になり、星は光の速さの8割で近づいて3年で着く。">
        <T x={16} y={20} bold fs={12.5}>
          地球から見る
        </T>
        <Ball x={E} y={60} r={13} fill="var(--fig-box4)" />
        <T x={E} y={88} anchor="middle" fs={12}>
          地球
        </T>
        <Star x={E + 4 * PX} y={60} />
        <T x={E + 4 * PX} y={88} anchor="middle" fs={12}>
          星
        </T>
        <Rocket x={300} y={60} />
        <Vel x1={340} y1={60} x2={390} y2={60} />
        <T x={398} y={60} fs={12} tone="muted">
          光の速さの8割
        </T>
        <Arrow x1={E} y1={104} x2={E + 4 * PX} y2={104} both />
        <T x={E + 2 * PX} y={120} anchor="middle" fs={12.5}>
          4光年
        </T>
        <T x={16} y={146} fs={12.5} tone="acc">
          4光年を光の速さの8割で進むので、5年かかる。その間にロケットの時計は3年だけ進む
        </T>
        <line x1={10} y1={164} x2={710} y2={164} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <T x={16} y={184} bold fs={12.5}>
          ロケットから見る（出発のとき）
        </T>
        <Ball x={E} y={222} r={13} fill="var(--fig-box4)" />
        <Vel x1={E - 18} y1={222} x2={E - 58} y2={222} />
        <T x={E} y={248} anchor="middle" fs={12}>
          地球
        </T>
        <Rocket x={E + 18} y={222} />
        <Star x={E + 2.4 * PX} y={222} />
        <Vel x1={E + 2.4 * PX - 16} y1={206} x2={E + 2.4 * PX - 56} y2={206} />
        <T x={E + 2.4 * PX + 18} y={222} fs={12} tone="muted">
          8割の速さで近づく
        </T>
        <circle cx={E + 4 * PX} cy={222} r={11} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 3" />
        <T x={E + 4 * PX} y={200} anchor="middle" fs={11.5} tone="muted">
          止まっていれば4光年先
        </T>
        <Arrow x1={E} y1={262} x2={E + 2.4 * PX} y2={262} both />
        <T x={E + 2.4 * PX + 12} y={262} fs={12.5}>
          縮んで2.4光年
        </T>
        <T x={16} y={290} fs={12.5} tone="acc">
          星が光の速さの8割で近づき、3年で着く。着いたときのロケットの時計は3年
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図17-8 双子の旅と1年ごとの光の合図（動） ---------- */

const SEC = 1.2 // 1年を何秒で見せるか
const TX0 = 70 // 地球の位置（図の中）
const PXY = 145 // 1光年の長さ
/** 地球の時計で T 年のときの、ロケットの地球からの距離（光年） */
const rocketAt = (T: number) => (T <= 5 ? 0.8 * T : Math.max(0, 4 - 0.8 * (T - 5)))
/** ロケットの時計 */
const rocketClock = (T: number) => (T <= 5 ? 0.6 * T : 3 + 0.6 * (Math.min(T, 10) - 5))
/** 地球が n 年目に送った合図がロケットに届く時刻（地球の時計）。行きの1回目は折り返しの瞬間に届く */
const EARTH_SIG = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1
  return { n, emit: n, arrive: (n + 8) / 1.8 }
})
/** ロケットが自分の時計で k 年目に送った合図。送った時刻・場所と、地球に届く時刻 */
const ROCKET_SIG = Array.from({ length: 6 }, (_, i) => {
  const k = i + 1
  const emit = k <= 3 ? k / 0.6 : 5 + (k - 3) / 0.6
  const x = rocketAt(emit)
  return { k, emit, x, arrive: emit + x }
})

export function FigTwins() {
  const BAR = 55
  const BX = 60
  return (
    <Anim
      n="17-8"
      title="1年ごとに光の合図を送り合うと、旅をした方が若いことを2人とも同じように数えられる"
      still={10 * SEC + 1}
      period={10 * SEC + 2.6}
      caption="光の速さの8割で4光年先の星へ行き、すぐ引き返す旅の模式図です。黄色の点は、2人がそれぞれ自分の時計で1年ごとに送る光の合図です。下の2本の帯は2人の時計の進みを同じ縮尺で表し、短い縦線は合図を受け取った時刻を表します。"
    >
      {(t) => {
        const yr = Math.min(t / SEC, 10)
        const tau = rocketClock(yr)
        const rx = TX0 + PXY * rocketAt(yr)
        const out = yr < 5
        const gotRocket = EARTH_SIG.filter((s) => s.arrive <= yr + 1e-9)
        const gotEarth = ROCKET_SIG.filter((s) => s.arrive <= yr + 1e-9)
        const phase =
          yr >= 10 - 1e-9
            ? '帰ってきたとき、地球では10年、ロケットでは6年がたっている'
            : yr < 5
              ? '行き：遠ざかる間は、どちらにも相手の合図が3年ごとに届く'
              : yr < 9
                ? '帰り：ロケットには4か月ごとに届く。地球にはまだ3年ごと'
                : '9年目から、向きを変えた後の合図が地球に4か月ごとに届く'
        return (
          <Svg id="17-8" w={720} h={300} label="地球と4光年先の星の間を、ロケットが光の速さの8割で往復する。2人は1年ごとに光の合図を送る。ロケットは旅の6年の間に地球の合図を10回受け取り、地球は10年の間にロケットの合図を6回受け取る。">
            <T x={16} y={22} fs={12.5}>
              {`地球の時計：${yr.toFixed(1)}年`}
            </T>
            <T x={250} y={22} fs={12.5}>
              {`ロケットの時計：${tau.toFixed(1)}年`}
            </T>
            <T x={16} y={46} fs={12.5} tone="acc">
              {phase}
            </T>
            {/* 地球・星・ロケット */}
            <line x1={TX0} y1={102} x2={TX0 + 4 * PXY} y2={102} stroke="var(--fig-muted)" strokeDasharray="2 4" />
            <Ball x={TX0 - 32} y={102} r={12} fill="var(--fig-box4)" />
            <T x={TX0 - 32} y={134} anchor="middle" fs={12}>
              地球
            </T>
            <Star x={TX0 + 4 * PXY + 34} y={102} />
            <T x={TX0 + 4 * PXY + 22} y={134} anchor="middle" fs={12}>
              星（4光年先）
            </T>
            <Rocket x={out ? rx - 17 : rx + 17} y={102} dir={out ? 1 : -1} />
            {EARTH_SIG.filter((s) => yr >= s.emit && yr < s.arrive).map((s) => (
              <circle key={`e${s.n}`} cx={TX0 + PXY * (yr - s.emit)} cy={88} r={4} fill={LIGHT} stroke="var(--fig-line)" strokeWidth={0.8} />
            ))}
            {ROCKET_SIG.filter((s) => yr >= s.emit && yr < s.arrive).map((s) => (
              <circle key={`r${s.k}`} cx={TX0 + PXY * (s.x - (yr - s.emit))} cy={116} r={4} fill={LIGHT} stroke="var(--fig-line)" strokeWidth={0.8} />
            ))}
            <T x={16} y={160} fs={11.5} tone="muted">
              上の列の点：地球が1年ごとに送る合図 ／ 下の列の点：ロケットが1年ごとに送る合図
            </T>
            {/* ロケットの時計の帯 */}
            <T x={BX} y={186} fs={12}>
              ロケットの時計と、地球の合図を受け取った時刻
            </T>
            <T x={704} y={186} anchor="end" fs={12} tone="acc">
              {`受け取った合図：${gotRocket.length}回`}
            </T>
            <line x1={BX} y1={206} x2={BX + BAR * 6} y2={206} stroke="var(--fig-muted)" strokeDasharray="2 3" />
            <line x1={BX} y1={206} x2={BX + BAR * tau} y2={206} stroke="var(--fig-line)" strokeWidth={4} />
            {gotRocket.map((s) => (
              <line key={s.n} x1={BX + BAR * rocketClock(s.arrive)} y1={196} x2={BX + BAR * rocketClock(s.arrive)} y2={216} stroke={LIGHT} strokeWidth={2.5} />
            ))}
            <T x={BX + BAR * 3} y={226} anchor="middle" fs={11.5} tone="muted">
              3年
            </T>
            <T x={BX + BAR * 6} y={226} anchor="middle" fs={11.5} tone="muted">
              6年
            </T>
            {/* 地球の時計の帯 */}
            <T x={BX} y={248} fs={12}>
              地球の時計と、ロケットの合図を受け取った時刻
            </T>
            <T x={704} y={248} anchor="end" fs={12} tone="acc">
              {`受け取った合図：${gotEarth.length}回`}
            </T>
            <line x1={BX} y1={268} x2={BX + BAR * 10} y2={268} stroke="var(--fig-muted)" strokeDasharray="2 3" />
            <line x1={BX} y1={268} x2={BX + BAR * yr} y2={268} stroke="var(--fig-line)" strokeWidth={4} />
            {gotEarth.map((s) => (
              <line key={s.k} x1={BX + BAR * s.arrive} y1={258} x2={BX + BAR * s.arrive} y2={278} stroke={LIGHT} strokeWidth={2.5} />
            ))}
            <T x={BX + BAR * 5} y={288} anchor="middle" fs={11.5} tone="muted">
              5年
            </T>
            <T x={BX + BAR * 10} y={288} anchor="middle" fs={11.5} tone="muted">
              10年
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図17-9 1905年からノーベル賞までの年表 ---------- */

const AFTER = [
  { y: '1905年6月30日', who: 'アインシュタイン', what: ['特殊相対性理論の', '論文が受け付けられる'] },
  { y: '1905年9月27日', who: 'アインシュタイン', what: ['質量とエネルギーの', '関係の論文（第18章）'] },
  { y: '1908年', who: 'ミンコフスキー', what: ['時間と空間をまとめて', '扱う見方（第18章）'] },
  { y: '1911年', who: 'ランジュバン', what: ['光に近い速さで', '往復する旅人の話'] },
  { y: '1915年', who: 'アインシュタイン', what: ['一般相対性理論を', '完成（第19章）'] },
  { y: '1922年', who: 'アインシュタイン', what: ['1921年のノーベル賞', '（理由は光電効果）'] },
]

export function FigAfterRoad() {
  return (
    <Figure n="17-9" title="1905年の論文のあとに続いた主な出来事" caption="上下に交互に並べています。点の間隔は年数に比例していません。1905年の2つの日付は、雑誌の編集部が論文を受け付けた日です。">
      <Svg id="17-9" w={720} h={250} label="1905年6月30日に特殊相対性理論の論文、9月27日に質量とエネルギーの関係の論文が受け付けられた。1908年にミンコフスキーが時間と空間をまとめて扱う見方を示し、1911年にランジュバンが往復する旅人の話を書いた。1915年に一般相対性理論が完成し、1922年にアインシュタインは1921年のノーベル物理学賞を受けたが、理由は光電効果だった。">
        <Arrow x1={20} y1={125} x2={705} y2={125} />
        {AFTER.map((r, i) => {
          const x = 85 + i * 110
          const up = i % 2 === 0
          const ty = up ? 30 : 152
          return (
            <g key={r.y}>
              <circle cx={x} cy={125} r={6} fill={i === 0 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
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

/* ---------- 図17-10 この章の考えのつながり ---------- */

export function FigFlow() {
  return (
    <Figure n="17-10" title="2つの原理から、時間と長さについての結論が順に導かれる" caption="矢印は「この考えから次の考えが導かれる」ことを表します。下の段は、この章の考えを引き継ぐ章です。">
      <Svg id="17-10" w={720} h={262} label="相対性原理と光速度不変の原理から同時性の相対性が導かれ、そこから時間の遅れと長さの縮みが導かれる。時間の遅れから双子の思考実験の結論が出る。2つの原理は第18章の時空と質量とエネルギーの関係へ、加速の問題は第19章の一般相対性理論へつながる。">
        <Box x={16} y={24} w={196} h={52} lines={['相対性原理', '法則はどの立場でも同じ']} subTone="muted" bold />
        <Box x={16} y={104} w={196} h={52} lines={['光速度不変の原理', '光の速さはだれにも同じ']} subTone="muted" bold />
        <Box x={268} y={64} w={176} h={52} lines={['同時性の相対性', '「同時」が立場で変わる']} subTone="muted" bold fill="box3" />
        <Box x={504} y={12} w={196} h={44} lines="時間の遅れ" fill="box3" />
        <Box x={504} y={68} w={196} h={44} lines="長さの縮み" fill="box3" />
        <Box x={504} y={124} w={196} h={44} lines="双子の思考実験" fill="box2" />
        <Arrow x1={212} y1={50} x2={266} y2={82} />
        <Arrow x1={212} y1={130} x2={266} y2={100} />
        <Arrow x1={444} y1={82} x2={502} y2={36} />
        <Arrow x1={444} y1={92} x2={502} y2={90} />
        <Arrow d="M700,34 C716,60 716,120 702,140" />
        <Box x={16} y={200} w={300} h={48} lines={['第18章', '時間と空間をまとめた見方、質量とエネルギー']} subTone="muted" bold dashed fs={12.5} />
        <Box x={400} y={200} w={300} h={48} lines={['第19章', '加速と重力を含めた理論']} subTone="muted" bold dashed fs={12.5} />
        <Arrow x1={114} y1={156} x2={150} y2={198} dashed />
        <Arrow x1={602} y1={168} x2={560} y2={198} dashed />
      </Svg>
    </Figure>
  )
}
