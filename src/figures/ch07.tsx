import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Force, Trail, Vel, wave } from './common'

type Pt = [number, number]

/** 折れ線の path の d */
const line = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
/** 中心 (cx, cy)、半径 r の円弧。角度 a0 から a1 まで（ラジアン、右が0で下向きが正。差は半周以内） */
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) =>
  `M${(cx + r * Math.cos(a0)).toFixed(1)},${(cy + r * Math.sin(a0)).toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0 ${a1 > a0 ? 1 : 0} ${(cx + r * Math.cos(a1)).toFixed(1)},${(cy + r * Math.sin(a1)).toFixed(1)}`
/** 0 以上 m 未満に収める余り */
const mod = (v: number, m: number) => ((v % m) + m) % m

/** 光の色（実際の光の色に近い固定色。色だけで区別せず、文字を添える） */
const SPECTRUM = ['#d64545', '#e8862a', '#d4b81f', '#3f9e4a', '#3b6fd1', '#8a4fc9']
/** 図の中の「光」の明るい色 */
const GLOW = '#f2c94c'

/* ---------- 図7-1 この章の年表 ---------- */

const ROAD = [
  { y: '1665年', lines: ['グリマルディ', '光の回折の記録', '（死後に出版）'] },
  { y: '1672年', lines: ['ニュートン', 'プリズムで', '白い光を分ける'] },
  { y: '1690年', lines: ['ホイヘンス', '光は波だとする', '本を出版'] },
  { y: '1704年', lines: ['ニュートン', '『光学』を出版', '（光は粒の流れ）'] },
  { y: '1801〜1807年', lines: ['ヤング', '光の干渉を示し', '波長を求める'] },
  { y: '1818〜1819年', lines: ['フレネル、アラゴ', '回折の理論と', '影の中の明るい点'] },
  { y: '1849年', lines: ['フィゾー', '光の速さを', '地上で測る'] },
  { y: '1850年', lines: ['フーコー', '水の中の光は', '空気の中より遅い'] },
]

export function FigRoad7() {
  return (
    <Figure n="7-1" title="光は粒か波か：この章で扱う出来事" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="7-1" w={720} h={250} label="1665年にグリマルディの回折の記録が出版され、1672年にニュートンがプリズムで白い光を分ける研究を発表した。1690年にホイヘンスが光の波の説を、1704年にニュートンが『光学』を出版した。1801年から1807年にヤングが光の干渉を示し、1818年から1819年にフレネルの回折の理論とアラゴの明るい点の確認があった。1849年にフィゾーが光の速さを地上で測り、1850年にフーコーが水の中の光が遅いことを確かめた。">
        <Arrow x1={14} y1={125} x2={710} y2={125} />
        {ROAD.map((r, i) => {
          const x = 62 + i * 86
          const up = i % 2 === 0
          const ty = up ? 26 : 152
          return (
            <g key={r.y}>
              <circle cx={x} cy={125} r={6} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 104 : 131} x2={x} y2={up ? 119 : 146} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold fs={12.5}>
                {r.y}
              </T>
              {r.lines.map((w, j) => (
                <T key={j} x={x} y={ty + 19 + j * 17} anchor="middle" fs={j === 0 ? 12.5 : 12} tone={j === 0 ? undefined : 'muted'}>
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

/* ---------- 図7-2 ニュートンのプリズムの実験 ---------- */

export function FigPrism() {
  const fanY = SPECTRUM.map((_, i) => 134 + i * 16) // 板に当たる位置（どの色も下へ曲がり、赤が最も小さく紫が最も大きく曲がる）
  const hole = fanY[3] // 緑の光だけ通す
  return (
    <Figure
      n="7-2"
      title="白い日光は色に分かれるが、1色だけ取り出した光はそれ以上分かれない"
      caption="ニュートンが1672年に発表した実験の模式図です。色ごとに曲がる角度が違うので、日光は色の帯に広がります。板の穴から緑の光だけを通すと、2つ目のプリズムで曲がっても緑のままです。角度や大きさは実際と違います。"
    >
      <Svg id="7-2" w={720} h={272} label="窓の小さな穴から入った日光が1つ目のプリズムで赤から紫までの色の帯に分かれる。穴をあけた板で緑の光だけを通すと、2つ目のプリズムで曲がっても、ほかの色には分かれない。">
        {/* 雨戸と穴 */}
        <rect x={20} y={30} width={10} height={80} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={20} y={128} width={10} height={112} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <T x={25} y={258} anchor="middle" fs={12}>
          雨戸の穴
        </T>
        <line x1={30} y1={119} x2={136} y2={119} stroke="var(--fig-line)" strokeWidth={3} />
        <T x={40} y={100} fs={12}>
          日光（白い光）
        </T>
        {/* 1つ目のプリズム */}
        <path d="M112,172 L188,172 L150,86 Z" fill="var(--fig-box3)" stroke="var(--fig-line)" opacity={0.9} />
        <T x={150} y={190} anchor="middle" fs={12}>
          プリズム
        </T>
        {fanY.map((y, i) => (
          <line key={i} x1={166} y1={128} x2={340} y2={y} stroke={SPECTRUM[i]} strokeWidth={2} />
        ))}
        {/* 穴をあけた板 */}
        <rect x={340} y={40} width={8} height={hole - 4 - 40} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <rect x={340} y={hole + 4} width={8} height={240 - hole - 4} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={344} y={26} anchor="middle" fs={12}>
          穴をあけた板
        </T>
        <T x={356} y={fanY[0] - 2} fs={12}>
          赤
        </T>
        <T x={356} y={fanY[5] + 2} fs={12}>
          紫
        </T>
        <T x={150} y={250} anchor="middle" fs={12} tone="muted">
          色ごとに曲がる角度が違う
        </T>
        {/* 緑だけが進む */}
        <line x1={348} y1={hole} x2={458} y2={hole} stroke={SPECTRUM[3]} strokeWidth={2.5} />
        <T x={392} y={hole - 14} anchor="middle" fs={12}>
          緑だけ
        </T>
        {/* 2つ目のプリズム */}
        <path d="M430,246 L506,246 L468,160 Z" fill="var(--fig-box3)" stroke="var(--fig-line)" opacity={0.9} />
        <T x={468} y={262} anchor="middle" fs={12}>
          2つ目のプリズム
        </T>
        <line x1={484} y1={196} x2={680} y2={232} stroke={SPECTRUM[3]} strokeWidth={2.5} />
        <rect x={684} y={40} width={10} height={210} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={676} y={104} anchor="end" fs={12.5}>
          曲がるが、緑のまま
        </T>
        <T x={676} y={124} anchor="end" fs={12} tone="muted">
          （ほかの色には分かれない）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図7-3 粒の説と波の説による屈折の説明（動） ---------- */

const N_WATER = 1.33 // 水の屈折率（空気の中の光は水の中の約1.33倍の速さ）
const TH1 = Math.PI / 4 // 空気の中で水面の垂線となす角
const TH2 = Math.asin(Math.sin(TH1) / N_WATER) // 水の中で垂線となす角（どちらの説でも同じ）
const SURF = 160 // 水面の高さ
const DEPTH = 110 // 空気・水それぞれの高さ
const V1 = 45 // 空気の中の速さ（ピクセル毎秒）
const WL1 = 45 // 波の説の空気の中の波長（1秒に1回揺れる）
const BEAM = 34 // 波の説で描く光の筋の半分の幅

/** 方向 th（垂線からの角）の単位ベクトル。y は下向き */
const dir = (th: number): Pt => [Math.sin(th), Math.cos(th)]

export function FigRefractViews() {
  const panels = [
    { ox: 10, key: 'p' as const, title: '粒の説（ニュートン）' },
    { ox: 370, key: 'w' as const, title: '波の説（ホイヘンス）' },
  ]
  const u1 = dir(TH1)
  const u2 = dir(TH2)
  const a = BEAM / Math.cos(TH1) // 光の筋が水面を横切る幅の半分
  const tan1 = Math.tan(TH1)
  const tan2 = Math.tan(TH2)
  const w2 = (BEAM * Math.cos(TH2)) / Math.cos(TH1) // 水の中の筋の半分の幅
  return (
    <Anim
      n="7-3"
      title="2つの説は水の中の光の速さについて逆の予測をした"
      still={3.2}
      period={6}
      caption="模式図です。黒の矢印は光の進む速さと向き、青の矢印は粒の説で水が光の粒を引く力です。どちらの説でも光は同じ向きに曲がりますが、粒の説では水の中で速くなり（矢印が長い）、波の説では遅くなります（矢印が短く、波の山の間隔がせまい）。"
    >
      {(t) => (
        <Svg id="7-3" w={720} h={320} label="左は粒の説。光の粒が水面で水に引かれて速くなり、向きを変える。右は波の説。波は水の中で遅くなり、山の間隔がせまくなって向きを変える。どちらも同じ向きに曲がるが、水の中の速さの予測は逆。1850年の測定では水の中の光が遅く、波の説と一致した。">
          {panels.map(({ ox, key, title }) => {
            const cx = ox + 170
            return (
              <g key={key}>
                <T x={ox + 170} y={22} anchor="middle" bold>
                  {title}
                </T>
                <rect x={ox} y={SURF} width={340} height={DEPTH} fill="var(--fig-box3)" opacity={0.7} />
                <rect x={ox} y={SURF - DEPTH} width={340} height={DEPTH * 2} fill="none" stroke="var(--fig-line)" />
                <line x1={ox} y1={SURF} x2={ox + 340} y2={SURF} stroke="var(--fig-line)" strokeWidth={1.5} />
                <line x1={cx} y1={SURF - 60} x2={cx} y2={SURF + 60} stroke="var(--fig-muted)" strokeDasharray="2 4" />
                <T x={ox + 10} y={SURF - 14} fs={12}>
                  空気
                </T>
                <T x={ox + 10} y={SURF + 16} fs={12}>
                  水
                </T>
              </g>
            )
          })}

          {/* 粒の説 */}
          {(() => {
            const cx = 10 + 170
            const v2 = V1 * N_WATER
            const L1 = DEPTH / Math.cos(TH1)
            const L2 = DEPTH / Math.cos(TH2)
            const life = L1 / V1 + L2 / v2
            const start: Pt = [cx - u1[0] * L1, SURF - u1[1] * L1]
            const pos = (age: number): Pt => {
              if (age < L1 / V1) return [start[0] + u1[0] * V1 * age, start[1] + u1[1] * V1 * age]
              const s = v2 * (age - L1 / V1)
              return [cx + u2[0] * s, SURF + u2[1] * s]
            }
            const balls = Array.from({ length: 10 }, (_, j) => mod(t - j * 0.6, 6)).filter((age) => age < life)
            return (
              <g>
                <Trail points={[start, [cx, SURF], [cx + u2[0] * L2, SURF + u2[1] * L2]]} />
                <Force x1={cx + 70} y1={SURF - 16} x2={cx + 70} y2={SURF + 18} />
                <T x={cx + 80} y={SURF - 26} fs={12}>
                  水が粒を引く
                </T>
                <Vel x1={cx - 92 + 14} y1={SURF - 92 - 14} x2={cx - 92 + 14 + u1[0] * 40} y2={SURF - 92 - 14 + u1[1] * 40} />
                <Vel x1={cx + 26 + 16} y1={SURF + 42 - 10} x2={cx + 26 + 16 + u2[0] * 40 * N_WATER} y2={SURF + 42 - 10 + u2[1] * 40 * N_WATER} />
                {balls.map((age, i) => {
                  const [x, y] = pos(age)
                  return <Ball key={i} x={x} y={y} r={5} fill={GLOW} />
                })}
                <T x={cx} y={SURF + DEPTH + 20} anchor="middle" fs={12.5}>
                  水の中で速くなる
                </T>
                <Cross x={cx - 86} y={SURF + DEPTH + 39} s={6} />
                <T x={cx - 74} y={SURF + DEPTH + 39} fs={12} tone="danger">
                  1850年の測定で否定された
                </T>
              </g>
            )
          })()}

          {/* 波の説 */}
          {(() => {
            const cx = 370 + 170
            const wl2 = WL1 / N_WATER
            const ph = (V1 / WL1) * t // 1秒に1回揺れる
            // 波の山の線を、光の筋（幅 half×2）と空気・水の範囲の中だけ描く
            const fronts = (u: Pt, wl: number, half: number, ylo: number, yhi: number, kmin: number, kmax: number) =>
              Array.from({ length: kmax - kmin + 1 }, (_, i) => {
                const s = wl * (kmin + i + mod(ph, 1))
                const c: Pt = [cx + u[0] * s, SURF + u[1] * s]
                const py = -u[0] // 山の線の向き (u[1], -u[0]) の y 成分（負）
                const q0 = Math.max(-half, (yhi - c[1]) / py)
                const q1 = Math.min(half, (ylo - c[1]) / py)
                if (q0 >= q1) return ''
                return line([
                  [c[0] + u[1] * q0, c[1] + py * q0],
                  [c[0] + u[1] * q1, c[1] + py * q1],
                ])
              }).filter(Boolean)
            const airBand = line([[cx - a - DEPTH * tan1, SURF - DEPTH], [cx + a - DEPTH * tan1, SURF - DEPTH], [cx + a, SURF], [cx - a, SURF]]) + ' Z'
            const waterBand = line([[cx - a, SURF], [cx + a, SURF], [cx + a + DEPTH * tan2, SURF + DEPTH], [cx - a + DEPTH * tan2, SURF + DEPTH]]) + ' Z'
            return (
              <g>
                <path d={airBand} fill={GLOW} opacity={0.18} />
                <path d={waterBand} fill={GLOW} opacity={0.18} />
                {fronts(u1, WL1, BEAM, SURF - DEPTH, SURF, -6, 1).map((d, i) => (
                  <path key={`a${i}`} d={d} stroke="var(--fig-line)" strokeWidth={1.6} fill="none" />
                ))}
                {fronts(u2, wl2, w2, SURF, SURF + DEPTH, -2, 7).map((d, i) => (
                  <path key={`w${i}`} d={d} stroke="var(--fig-line)" strokeWidth={1.6} fill="none" />
                ))}
                <Vel x1={cx - 92 + 2 * BEAM} y1={SURF - 92 - 6} x2={cx - 92 + 2 * BEAM + u1[0] * 40} y2={SURF - 92 - 6 + u1[1] * 40} />
                <Vel
                  x1={cx + u2[0] * 30 + w2 + 22}
                  y1={SURF + u2[1] * 30 - 4}
                  x2={cx + u2[0] * 30 + w2 + 22 + (u2[0] * 40) / N_WATER}
                  y2={SURF + u2[1] * 30 - 4 + (u2[1] * 40) / N_WATER}
                />
                <T x={cx + 70} y={SURF - 84} fs={12} tone="muted">
                  線は波の山
                </T>
                <T x={370 + 10} y={SURF + 42} fs={12} tone="muted">
                  山の間隔が
                </T>
                <T x={370 + 10} y={SURF + 58} fs={12} tone="muted">
                  せまくなる
                </T>
                <T x={cx} y={SURF + DEPTH + 20} anchor="middle" fs={12.5}>
                  水の中で遅くなる
                </T>
                <T x={cx} y={SURF + DEPTH + 39} anchor="middle" fs={12} tone="acc">
                  1850年の測定と一致した
                </T>
              </g>
            )
          })()}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図7-4 波長と振動数（動） ---------- */

const WAVE_X0 = 60
const WAVE_LEN = 600
const WAVE_V = 100 // 波の進む速さ（ピクセル毎秒）。2つの波で同じ

export function FigWaveBasics() {
  const rows = [
    { cy: 92, wl: 200, label: '振動数：1秒に0.5回揺れる波' },
    { cy: 238, wl: 100, label: '振動数：1秒に1回揺れる波（2倍）' },
  ]
  const A = 26
  const bx = 210 // 浮きの位置
  return (
    <Anim
      n="7-4"
      title="同じ速さで進む波では、振動数が2倍になると波長は半分になる"
      still={0.6}
      period={2}
      caption="模式図です。2つの波は同じ速さで右へ進みます。丸い浮きは上下に揺れるだけで、右へは運ばれません（点線は浮きが動く範囲）。下の波は浮きが2倍の速さで揺れ、山から次の山までの長さ（波長）は半分です。"
    >
      {(t) => (
        <Svg id="7-4" w={720} h={320} label="上下2つの波が同じ速さで右へ進む。上の波は1秒に0.5回、下の波は1秒に1回揺れる。下の波の波長は上の波の半分。浮きは上下に揺れるだけで右へは運ばれない。">
          {rows.map((r) => {
            const ph = (-2 * Math.PI * WAVE_V * t) / r.wl
            const yAt = (x: number) => r.cy - A * Math.sin((2 * Math.PI * (x - WAVE_X0)) / r.wl + ph)
            // 山の位置：x − 60 − vt が「4分の1波長＋波長の整数倍」になる所
            const crest = WAVE_X0 + mod(WAVE_V * t + r.wl / 4, r.wl)
            const by = r.cy + 44
            return (
              <g key={r.wl}>
                <T x={WAVE_X0} y={r.cy - 58} fs={12.5} bold>
                  {r.label}
                </T>
                <T x={556} y={r.cy - 58} fs={12} anchor="end" tone="muted">
                  進む向き
                </T>
                <Vel x1={566} y1={r.cy - 58} x2={650} y2={r.cy - 58} />
                <line x1={WAVE_X0} y1={r.cy} x2={WAVE_X0 + WAVE_LEN} y2={r.cy} stroke="var(--fig-muted)" strokeDasharray="2 4" />
                <path d={wave(WAVE_X0, r.cy, WAVE_LEN, A, r.wl, ph)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
                {/* 波長の目盛り */}
                <line x1={crest} y1={r.cy - A} x2={crest} y2={by} stroke="var(--fig-muted)" strokeDasharray="3 3" />
                <line x1={crest + r.wl} y1={r.cy - A} x2={crest + r.wl} y2={by} stroke="var(--fig-muted)" strokeDasharray="3 3" />
                <Arrow x1={crest + 2} y1={by} x2={crest + r.wl - 2} y2={by} both />
                <T x={crest + r.wl / 2} y={by + 16} anchor="middle" fs={12.5}>
                  波長
                </T>
                {/* 浮き */}
                <Trail points={[[bx, r.cy - A - 8], [bx, r.cy + A + 8]]} />
                <Ball x={bx} y={yAt(bx)} r={8} fill="var(--fig-box2)" />
              </g>
            )
          })}
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図7-5 2つの波の重ね合わせ（動・スライダー） ---------- */

const SHIFT_LABEL = ['ずれなし', '波長の8分の1', '波長の4分の1', '波長の8分の3', '波長の半分', '波長の8分の5', '波長の4分の3', '波長の8分の7', '1波長（ずれなしと同じ）']

export function FigSuperpose() {
  const [shift, setShift] = useState(0)
  const A = 22
  const wl = 145
  const x0 = 120
  const len = 580
  const delta = (2 * Math.PI * shift) / 8
  const ratio = Math.abs(2 * Math.cos(delta / 2))
  const result =
    shift % 8 === 0
      ? '山と山が重なり、揺れは2倍になる（強め合う）'
      : shift === 4
        ? '山と谷が重なり、揺れは消える（弱め合う）'
        : `揺れの大きさは1つの波の約${ratio.toFixed(1)}倍`
  return (
    <Anim
      n="7-5"
      title="2つの波は、山と山が重なると強め合い、山と谷が重なると打ち消し合う"
      still={0.4}
      period={2}
      controls={<Range label="波Bのずれ" min={0} max={8} step={1} value={shift} onChange={setShift} format={(v) => SHIFT_LABEL[v]} />}
      caption="模式図です。いちばん下の線は波Aと波Bの揺れを各点で足し合わせたものです。「波Bのずれ」を波長の半分にすると、波Aの山と波Bの谷が重なり、揺れは打ち消し合って平らになります。"
    >
      {(t) => {
        const ph = (-2 * Math.PI * t) / 2
        const rows = [
          { cy: 58, name: '波A', d: wave(x0, 58, len, A, wl, ph) },
          { cy: 140, name: '波B', d: wave(x0, 140, len, A, wl, ph - delta) },
        ]
        const sumCy = 248
        let sum = ''
        for (let x = 0; x <= len; x += 2) {
          const th = (2 * Math.PI * x) / wl + ph
          const y = sumCy - A * (Math.sin(th) + Math.sin(th - delta))
          sum += `${x ? 'L' : 'M'}${(x0 + x).toFixed(1)},${y.toFixed(1)}`
        }
        return (
          <Svg id="7-5" w={720} h={330} label="上に波Aと波B、下に2つを重ねた結果。ずれがないと揺れは2倍になり、波長の半分ずれると山と谷が重なって揺れが消える。">
            {rows.map((r) => (
              <g key={r.name}>
                <T x={16} y={r.cy} fs={12.5} bold>
                  {r.name}
                </T>
                <line x1={x0} y1={r.cy} x2={x0 + len} y2={r.cy} stroke="var(--fig-muted)" strokeDasharray="2 4" />
                <path d={r.d} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
              </g>
            ))}
            <T x={16} y={sumCy - 8} fs={12.5} bold>
              重ねた
            </T>
            <T x={16} y={sumCy + 10} fs={12.5} bold>
              結果
            </T>
            <line x1={x0} y1={sumCy - 2 * A} x2={x0 + len} y2={sumCy - 2 * A} stroke="var(--fig-muted)" strokeDasharray="1 5" />
            <line x1={x0} y1={sumCy + 2 * A} x2={x0 + len} y2={sumCy + 2 * A} stroke="var(--fig-muted)" strokeDasharray="1 5" />
            <line x1={x0} y1={sumCy} x2={x0 + len} y2={sumCy} stroke="var(--fig-muted)" strokeDasharray="2 4" />
            <path d={sum} fill="none" stroke="var(--fig-accent)" strokeWidth={2.8} />
            <T x={x0 - 8} y={sumCy - 2 * A} anchor="end" fs={11.5} tone="muted">
              2倍
            </T>
            <line x1={x0} y1={194} x2={x0 + len} y2={194} stroke="var(--fig-line)" strokeWidth={0.8} />
            <T x={x0} y={316} fs={12.5} tone="acc">
              {result}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図7-6 すき間を通る波（動・切り替え） ---------- */

const GAP_WALL = 300
const GAP_CY = 150
const GAP_WL = 30

export function FigGap() {
  const [gap, setGap] = useState<'narrow' | 'wide'>('narrow')
  const half = gap === 'narrow' ? 12 : 80
  return (
    <Anim
      n="7-6"
      title="すき間が狭いほど、波はすき間を通ったあと大きく広がる（回折）"
      still={0.5}
      period={4}
      controls={
        <Choice
          label="すき間の幅"
          options={[
            { value: 'narrow', label: '狭い（波長と同じくらい）' },
            { value: 'wide', label: '広い（波長の5倍以上）' },
          ]}
          value={gap}
          onChange={setGap}
        />
      }
      caption="水面の波を上から見た模式図です。線は波の山を表します。すき間が狭いと、波はすき間から丸く広がり、壁の後ろにも回り込みます。すき間が広いと、波はほぼまっすぐ進み、壁の後ろの両側は影になります。"
    >
      {(t) => {
        const off = mod(GAP_WL * t, GAP_WL)
        const fronts: number[] = []
        for (let p = 30 + off; p < 720; p += GAP_WL) fronts.push(p)
        return (
          <Svg id="7-6" w={720} h={316} label="左から来た波が壁のすき間を通る。すき間が狭いと丸く広がり、広いとほぼまっすぐ進んで両側に影ができる。">
            {fronts
              .filter((p) => p < GAP_WALL)
              .map((p) => (
                <line key={p} x1={p} y1={20} x2={p} y2={280} stroke="var(--fig-line)" strokeWidth={1.6} />
              ))}
            {fronts
              .filter((p) => p >= GAP_WALL && p < 700)
              .map((p) => {
                const d = p - GAP_WALL
                const op = Math.max(0.25, 1 - d / 520)
                if (gap === 'narrow') {
                  // 上下の端（y が 20〜280）を越えない角度の範囲だけ描く
                  const lim = Math.asin(Math.min(1, (GAP_CY - 20) / Math.max(d, 1)))
                  return <path key={p} d={arc(GAP_WALL, GAP_CY, d, -lim, lim)} fill="none" stroke="var(--fig-line)" strokeWidth={1.6} opacity={op} />
                }
                // 広いすき間：まっすぐな部分と、両端で少しだけ回り込む部分（最大25度）
                const top = GAP_CY - half
                const bottom = GAP_CY + half
                const upLim = Math.min((25 * Math.PI) / 180, Math.asin(Math.min(1, (top - 20) / Math.max(d, 1))))
                const downLim = Math.min((25 * Math.PI) / 180, Math.asin(Math.min(1, (280 - bottom) / Math.max(d, 1))))
                return (
                  <g key={p}>
                    <line x1={GAP_WALL + d} y1={top} x2={GAP_WALL + d} y2={bottom} stroke="var(--fig-line)" strokeWidth={1.6} opacity={op} />
                    <path d={arc(GAP_WALL, top, d, 0, -upLim)} fill="none" stroke="var(--fig-line)" strokeWidth={1.2} opacity={op * 0.4} />
                    <path d={arc(GAP_WALL, bottom, d, 0, downLim)} fill="none" stroke="var(--fig-line)" strokeWidth={1.2} opacity={op * 0.4} />
                  </g>
                )
              })}
            {/* 壁 */}
            <rect x={GAP_WALL - 6} y={20} width={12} height={GAP_CY - half - 20} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={GAP_WALL - 6} y={GAP_CY + half} width={12} height={280 - GAP_CY - half} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <line x1={0} y1={286} x2={720} y2={286} stroke="var(--fig-line)" strokeWidth={0.6} />
            <T x={40} y={302} fs={12}>
              やって来る波
            </T>
            <T x={GAP_WALL} y={302} anchor="middle" fs={12}>
              壁
            </T>
            <T x={GAP_WALL + 40} y={302} fs={12} tone="acc">
              {gap === 'narrow' ? 'すき間から丸く広がり、壁の後ろにも回り込む' : 'ほぼまっすぐ進み、上下の壁の後ろは影になる'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図7-7 2つのすき間から広がる波（動） ---------- */

const TS = { x: 110, y: 160, c: 60, wl: 30, screen: 620, top: 20, bottom: 300 }
const S1: Pt = [TS.x, TS.y - TS.c]
const S2: Pt = [TS.x, TS.y + TS.c]
/** 2つのすき間からの距離の差（上のすき間からの距離 − 下のすき間からの距離） */
const pathDiff = (x: number, y: number) => Math.hypot(x - S1[0], y - S1[1]) - Math.hypot(x - S2[0], y - S2[1])

/** 2つのすき間からの距離の差が delta になる点を結んだ線（双曲線の右半分） */
function diffLine(delta: number): string {
  if (Math.abs(delta) < 1e-6) return line([[TS.x, TS.y], [TS.screen, TS.y]])
  const a = delta / 2
  const b = Math.sqrt(TS.c * TS.c - a * a)
  // スクリーンに届くか、上下の端（top・bottom）に届くところで止める
  const edge = a > 0 ? TS.bottom - TS.y : TS.y - TS.top
  const umax = Math.min(Math.asinh((TS.screen - TS.x) / b), Math.acosh(edge / Math.abs(a)))
  const pts: Pt[] = []
  for (let i = 0; i <= 40; i++) {
    const u = (umax * i) / 40
    pts.push([TS.x + b * Math.sinh(u), TS.y + a * Math.cosh(u)])
  }
  return line(pts)
}

const BRIGHT = [-3, -2, -1, 0, 1, 2, 3].map((m) => diffLine(m * TS.wl))
const DARK = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((m) => diffLine(m * TS.wl))
/** スクリーンで最初に暗くなる位置 */
const FIRST_DARK_Y = (() => {
  for (let y = TS.y; y < TS.bottom; y += 0.5) if (Math.abs(pathDiff(TS.screen, y)) >= TS.wl / 2) return y
  return TS.y
})()
const SCREEN_BANDS = Array.from({ length: 70 }, (_, i) => {
  const y = TS.top + i * 4
  const d = pathDiff(TS.screen, y + 2)
  return { y, op: Math.cos((Math.PI * d) / TS.wl) ** 2 }
})

export function FigTwoSources() {
  return (
    <Anim
      n="7-7"
      title="2つのすき間から広がる波が重なり、強め合う所と弱め合う所が線のように並ぶ"
      still={0.3}
      period={4}
      caption="上から見た模式図です。円は、それぞれのすき間から広がる波の山です。青の太い線の上では山と山（谷と谷）が重なって強め合い、灰色の点線の上では山と谷が重なって弱め合います。右端のスクリーンには、明るい所と暗い所が交互に並びます。"
    >
      {(t) => {
        const off = mod(TS.wl * t, TS.wl)
        const radii: number[] = []
        for (let r = off; r < TS.screen - TS.x - 6; r += TS.wl) radii.push(r)
        const incoming: number[] = []
        for (let x = TS.x - TS.wl + off; x > 12; x -= TS.wl) incoming.push(x)
        return (
          <Svg id="7-7" w={720} h={336} label="左から来た波が2つのすき間を通り、それぞれのすき間から円の形に広がる。2つの波が重なり、強め合う線と弱め合う線が交互に放射状に並ぶ。右のスクリーンには明るい縞と暗い縞が交互に並ぶ。">
            {BRIGHT.map((d, i) => (
              <path key={`b${i}`} d={d} fill="none" stroke="var(--fig-accent)" strokeWidth={7} opacity={0.35} />
            ))}
            {DARK.map((d, i) => (
              <path key={`d${i}`} d={d} fill="none" stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="6 5" />
            ))}
            {[S1, S2].map(([sx, sy], j) =>
              radii.map((r) => {
                // 上下の端を越えない角度の範囲だけ描く
                const a0 = -Math.asin(Math.min(1, (sy - TS.top) / Math.max(r, 1)))
                const a1 = Math.asin(Math.min(1, (TS.bottom - sy) / Math.max(r, 1)))
                return <path key={`${j}-${r}`} d={arc(sx, sy, r, a0, a1)} fill="none" stroke="var(--fig-line)" strokeWidth={1.1} opacity={0.7} />
              }),
            )}
            {/* 壁と2つのすき間 */}
            <rect x={TS.x - 4} y={TS.top} width={8} height={S1[1] - 5 - TS.top} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={TS.x - 4} y={S1[1] + 5} width={8} height={S2[1] - S1[1] - 10} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={TS.x - 4} y={S2[1] + 5} width={8} height={TS.bottom - S2[1] - 5} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={TS.x} y={10} anchor="middle" fs={12}>
              2つのすき間がある壁
            </T>
            {/* スクリーン */}
            <rect x={TS.screen} y={TS.top} width={14} height={TS.bottom - TS.top} fill="#1d1f23" />
            {SCREEN_BANDS.map((b) => (
              <rect key={b.y} x={TS.screen} y={b.y} width={14} height={4} fill={GLOW} opacity={b.op} />
            ))}
            <T x={TS.screen + 7} y={10} anchor="middle" fs={12}>
              スクリーン
            </T>
            <T x={TS.screen + 22} y={TS.y} fs={12}>
              明るい
            </T>
            <T x={TS.screen + 22} y={FIRST_DARK_Y} fs={12} tone="muted">
              暗い
            </T>
            {/* 凡例 */}
            <line x1={30} y1={322} x2={64} y2={322} stroke="var(--fig-accent)" strokeWidth={7} opacity={0.35} />
            <T x={72} y={322} fs={12}>
              強め合う所（山と山が重なる）
            </T>
            <line x1={330} y1={322} x2={364} y2={322} stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="6 5" />
            <T x={372} y={322} fs={12}>
              弱め合う所（山と谷が重なる）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図7-8 ヤングの実験の装置とスクリーンの縞（切り替え） ---------- */

const YG = { cy: 135, src: 40, single: 110, double: 210, screen: 400, top: 30, bottom: 240, slits: [115, 155] }
/** スクリーンの明るさ（0〜1）。both は2つのすき間、one は1つのすき間（模式的な形） */
function youngBright(y: number, both: boolean): number {
  const u = (y - YG.cy) / 118
  const env = u === 0 ? 1 : (Math.sin(Math.PI * u) / (Math.PI * u)) ** 2
  return both ? env * Math.cos((Math.PI * (y - YG.cy)) / 32) ** 2 : env
}

export function FigYoung() {
  const [mode, setMode] = useState<'both' | 'one'>('both')
  const both = mode === 'both'
  const open = both ? YG.slits : [YG.slits[0]]
  const bands = Array.from({ length: (YG.bottom - YG.top) / 3 }, (_, i) => YG.top + i * 3)
  return (
    <Figure
      n="7-8"
      title="2つのすき間を通った光は、スクリーンに明るい縞と暗い縞をつくる"
      controls={
        <Choice
          label="すき間"
          options={[
            { value: 'both', label: '2つとも開ける' },
            { value: 'one', label: '片方をふさぐ' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
      caption="1807年の講義録でヤングが説明した形の模式図です（大きさと距離は実際と違います）。左は横から見た装置、右はスクリーンを正面から見た様子です。「片方をふさぐ」を選ぶと縞が消えます。1803年の実験ではすき間の代わりに細いカードの両側を通る光を使いました。"
    >
      <Svg id="7-8" w={720} h={268} label="光源からの光が小さな穴を通り、2つのすき間を通ってスクリーンに届く。2つとも開けると明るい縞と暗い縞が交互に並び、片方をふさぐと縞が消えてなだらかな明るさになる。">
        {/* 光源 */}
        <circle cx={YG.src} cy={YG.cy} r={12} fill={GLOW} stroke="var(--fig-line)" />
        <T x={YG.src} y={YG.cy - 26} anchor="middle" fs={12}>
          1つの色の光
        </T>
        <line x1={YG.src + 12} y1={YG.cy} x2={YG.single} y2={YG.cy} stroke="var(--fig-line)" strokeWidth={2} />
        {/* 小さな穴の板 */}
        <rect x={YG.single - 3} y={YG.top} width={6} height={YG.cy - 4 - YG.top} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={YG.single - 3} y={YG.cy + 4} width={6} height={YG.bottom - YG.cy - 4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <T x={YG.single} y={YG.bottom + 14} anchor="middle" fs={12}>
          小さな穴
        </T>
        {/* 穴から2つのすき間へ */}
        {YG.slits.map((sy) => (
          <line key={sy} x1={YG.single} y1={YG.cy} x2={YG.double} y2={sy} stroke="var(--fig-muted)" strokeWidth={1.2} />
        ))}
        {/* すき間からスクリーンへ広がる光 */}
        {open.map((sy) =>
          [40, 80, 135, 190, 230].map((ty) => <line key={`${sy}-${ty}`} x1={YG.double} y1={sy} x2={YG.screen - 4} y2={ty} stroke="var(--fig-muted)" strokeWidth={0.9} opacity={0.7} />),
        )}
        {/* 2つのすき間の板 */}
        <rect x={YG.double - 3} y={YG.top} width={6} height={YG.slits[0] - 4 - YG.top} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={YG.double - 3} y={YG.slits[0] + 4} width={6} height={YG.slits[1] - YG.slits[0] - 8} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={YG.double - 3} y={YG.slits[1] + 4} width={6} height={YG.bottom - YG.slits[1] - 4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        {!both && (
          <>
            <rect x={YG.double - 10} y={YG.slits[1] - 9} width={20} height={18} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={YG.double + 16} y={YG.slits[1] + 22} fs={12}>
              ふさぐ
            </T>
          </>
        )}
        <T x={YG.double} y={YG.bottom + 14} anchor="middle" fs={12}>
          2つのすき間
        </T>
        {/* スクリーン（横から） */}
        {bands.map((y) => (
          <rect key={y} x={YG.screen - 4} y={y} width={12} height={3} fill={GLOW} opacity={youngBright(y + 1.5, both)} />
        ))}
        <rect x={YG.screen - 4} y={YG.top} width={12} height={YG.bottom - YG.top} fill="none" stroke="var(--fig-line)" />
        <T x={YG.screen + 2} y={YG.bottom + 14} anchor="middle" fs={12}>
          スクリーン
        </T>
        {/* スクリーン（正面から） */}
        <T x={590} y={16} anchor="middle" fs={12.5} bold>
          スクリーンを正面から見ると
        </T>
        <rect x={490} y={YG.top} width={200} height={YG.bottom - YG.top} fill="#1d1f23" />
        {bands.map((y) => (
          <rect key={y} x={490} y={y} width={200} height={3} fill={GLOW} opacity={youngBright(y + 1.5, both)} />
        ))}
        <rect x={490} y={YG.top} width={200} height={YG.bottom - YG.top} fill="none" stroke="var(--fig-line)" />
        {both ? (
          <>
            <T x={480} y={YG.cy} anchor="end" fs={12}>
              明るい
            </T>
            <T x={480} y={YG.cy + 16} anchor="end" fs={12} tone="muted">
              暗い
            </T>
          </>
        ) : (
          <T x={590} y={YG.bottom + 14} anchor="middle" fs={12} tone="acc">
            縞が消え、なだらかな明るさになる
          </T>
        )}
      </Svg>
    </Figure>
  )
}

/* ---------- 図7-9 丸い板の影の中心に現れる明るい点 ---------- */

export function FigSpot() {
  const P: Pt = [470, 130]
  return (
    <Figure
      n="7-9"
      title="丸い板の影の中心では、縁を回り込んだ光がそろって強め合う"
      caption="模式図で、大きさは誇張しています。左は横から見た様子です。丸い板の縁のどこからでも、影の中心までの距離は同じなので、縁を回り込んだ光は中心で山と山がそろいます。右はスクリーンを正面から見た様子です。"
    >
      <Svg id="7-9" w={720} h={256} label="平行な光が丸い板に当たる。板の縁から影の中心までの距離はどこも同じなので、回り込んだ光が中心で強め合い、影の中心に明るい点ができる。右の正面図では、丸い影の中心に明るい点があり、影の外側に輪が並ぶ。">
        {[60, 100, 160, 200].map((y) => (
          <Arrow key={y} x1={24} y1={y} x2={140} y2={y} />
        ))}
        <T x={24} y={130} fs={12}>
          平行な光
        </T>
        {/* 影 */}
        <path d={line([[200, 80], [P[0], 80], [P[0], 180], [200, 180]])} fill="var(--fig-box)" opacity={0.8} />
        <rect x={194} y={80} width={12} height={100} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <T x={208} y={200} anchor="middle" fs={12}>
          丸い板（横から）
        </T>
        <line x1={206} y1={80} x2={P[0]} y2={P[1]} stroke="var(--fig-accent)" strokeWidth={1.8} strokeDasharray="6 4" />
        <line x1={206} y1={180} x2={P[0]} y2={P[1]} stroke="var(--fig-accent)" strokeWidth={1.8} strokeDasharray="6 4" />
        <T x={230} y={60} fs={12}>
          縁から中心までの距離はどこも同じ
        </T>
        <T x={330} y={130} anchor="middle" fs={12} tone="muted">
          影
        </T>
        <line x1={P[0]} y1={30} x2={P[0]} y2={230} stroke="var(--fig-line)" strokeWidth={2} />
        <circle cx={P[0]} cy={P[1]} r={5} fill={GLOW} stroke="var(--fig-line)" />
        <T x={P[0]} y={244} anchor="middle" fs={12}>
          スクリーン
        </T>
        {/* 正面から */}
        <T x={620} y={16} anchor="middle" fs={12.5} bold>
          正面から見ると
        </T>
        <rect x={530} y={34} width={180} height={192} fill="#f3e7b0" stroke="var(--fig-line)" />
        {[76, 70, 64].map((r) => (
          <circle key={r} cx={620} cy={130} r={r} fill="none" stroke="#b9a35e" strokeWidth={2} />
        ))}
        <circle cx={620} cy={130} r={56} fill="#2b2b2b" />
        <circle cx={620} cy={130} r={4} fill="#fff6c2" />
        <T x={620} y={244} anchor="middle" fs={12} tone="acc">
          影の中心に明るい点
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図7-10 フィゾーの歯車の実験（動） ---------- */

const FZ = { wheel: 138, mirror: 660, half: 74, eye: 26, P: 32, out: 0.16, back: 2.85 }
const FZ_V = (FZ.mirror - FZ.wheel) / ((FZ.back - FZ.out) / 2) // 図の中の光の速さ

/** 時刻 t の光の位置。null は表示しない */
function fizeauPulse(t: number, passes: boolean): number | null {
  if (t < FZ.out) return FZ.half + ((FZ.wheel - FZ.half) * t) / FZ.out
  const mid = (FZ.out + FZ.back) / 2
  if (t < mid) return FZ.wheel + FZ_V * (t - FZ.out)
  if (t < FZ.back) return FZ.mirror - FZ_V * (t - mid)
  if (!passes) return FZ.wheel + 9 // 歯に当たって止まる
  return Math.max(FZ.eye + 12, FZ.wheel - FZ_V * (t - FZ.back))
}

export function FigFizeau() {
  const rows = [
    { cy: 105, label: '円盤をゆっくり回すとき', move: 0.12, passes: true, result: 'すき間を通って目に届く（光が見える）' },
    { cy: 255, label: '1秒に約12.6回転で回すとき', move: 1, passes: false, result: '隣の歯にさえぎられる（光が見えない）' },
  ]
  return (
    <Anim
      n="7-10"
      title="光が往復する間に円盤が歯1枚分回ると、戻った光はさえぎられる"
      still={3.4}
      period={4.2}
      caption="フィゾーの1849年の実験の模式図です。光（黄色の短い線）は円盤の縁の歯のすき間を通って鏡まで行き、はね返って戻ります。円盤を速く回すと、戻ってきたときにはすき間の位置に隣の歯が来ています。光の速さや距離の比は実際と違います。"
    >
      {(t) => (
        <Svg id="7-10" w={720} h={326} label="上の段：円盤をゆっくり回すと、鏡で戻った光は同じすき間を通って目に届く。下の段：1秒に約12.6回転で回すと、光が往復する間にすき間の位置に隣の歯が来て、光はさえぎられる。">
          {rows.map((r) => {
            const speed = ((FZ.P / 2) / (FZ.back - FZ.out)) * r.move
            const y0 = r.cy - (3 * FZ.P) / 4 + speed * (t - FZ.out)
            const teeth: number[] = []
            for (let k = 0; k < 5; k++) teeth.push(r.cy - 2 * FZ.P + mod(y0 - (r.cy - 2 * FZ.P) + k * FZ.P, 5 * FZ.P))
            const x = fizeauPulse(t, r.passes)
            const done = t >= FZ.back
            return (
              <g key={r.cy}>
                <T x={20} y={r.cy - 74} fs={12.5} bold>
                  {r.label}
                </T>
                {/* 光の通り道 */}
                <line x1={FZ.eye + 10} y1={r.cy} x2={FZ.mirror} y2={r.cy} stroke="var(--fig-muted)" strokeWidth={1} />
                <path d={`M386,${r.cy - 8} L394,${r.cy + 8} M398,${r.cy - 8} L406,${r.cy + 8}`} stroke="var(--fig-line)" strokeWidth={1.4} />
                <T x={396} y={r.cy - 20} anchor="middle" fs={12} tone="muted">
                  約8.6km（途中を省略）
                </T>
                {/* 目、半透明の鏡、ランプ */}
                <path d={`M${FZ.eye - 10},${r.cy} Q${FZ.eye},${r.cy - 9} ${FZ.eye + 10},${r.cy} Q${FZ.eye},${r.cy + 9} ${FZ.eye - 10},${r.cy} Z`} fill="var(--fig-bg)" stroke="var(--fig-line)" />
                <circle cx={FZ.eye} cy={r.cy} r={3} fill="var(--fig-line)" />
                <T x={FZ.eye} y={r.cy - 22} anchor="middle" fs={12}>
                  目
                </T>
                <line x1={FZ.half - 12} y1={r.cy + 12} x2={FZ.half + 12} y2={r.cy - 12} stroke="var(--fig-accent)" strokeWidth={2} />
                <circle cx={FZ.half} cy={r.cy + 34} r={8} fill={GLOW} stroke="var(--fig-line)" />
                <line x1={FZ.half} y1={r.cy + 26} x2={FZ.half} y2={r.cy + 4} stroke="var(--fig-muted)" strokeWidth={1} />
                <T x={FZ.half} y={r.cy + 56} anchor="middle" fs={12}>
                  ランプ
                </T>
                {/* 円盤の縁（歯が下へ動く） */}
                <rect x={FZ.wheel - 9} y={r.cy - 34} width={18} height={68} fill="var(--fig-bg)" />
                {teeth.map((ty, i) => {
                  // 窓（上下34ピクセル）の中に見える部分だけ描く
                  const y1 = Math.max(ty, r.cy - 34)
                  const y2 = Math.min(ty + FZ.P / 2, r.cy + 34)
                  return y2 > y1 ? <rect key={i} x={FZ.wheel - 8} y={y1} width={16} height={y2 - y1} fill="var(--fig-box3)" stroke="var(--fig-line)" /> : null
                })}
                <rect x={FZ.wheel - 9} y={r.cy - 34} width={18} height={68} fill="none" stroke="var(--fig-muted)" strokeDasharray="2 3" />
                <T x={FZ.wheel} y={r.cy - 46} anchor="middle" fs={12}>
                  円盤の歯
                </T>
                {/* 鏡 */}
                <rect x={FZ.mirror} y={r.cy - 26} width={6} height={52} fill="var(--fig-box3)" stroke="var(--fig-line)" />
                <T x={FZ.mirror + 14} y={r.cy} fs={12}>
                  鏡
                </T>
                {/* 光 */}
                {x != null && <line x1={x - 12} y1={r.cy} x2={x + 12} y2={r.cy} stroke={GLOW} strokeWidth={5} strokeLinecap="round" />}
                {done && !r.passes && <Cross x={FZ.wheel + 24} y={r.cy - 18} s={6} />}
                {done && (
                  <T x={180} y={r.cy + 44} fs={12.5} tone={r.passes ? 'acc' : 'danger'}>
                    {r.result}
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
