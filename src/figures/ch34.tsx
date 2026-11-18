import { useMemo, useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { Ball, Cross, Trail, clamp01, ease, rng, wave } from './common'

/* ---------- この章の図で使う部品 ---------- */

/** 0〜1 を行き来する三角波。粒を箱の中で跳ね返らせるのに使う */
const tri = (v: number) => {
  const m = ((v % 2) + 2) % 2
  return m < 1 ? m : 2 - m
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k

/** 銀河（横長の楕円） */
function Galaxy({ x, y, a, op = 1 }: { x: number; y: number; a: number; op?: number }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx={5.5}
      ry={3}
      transform={`rotate(${a.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`}
      fill="var(--fig-box3)"
      stroke="var(--fig-line)"
      strokeWidth={1}
      opacity={op}
    />
  )
}

/** 光（短い波）。a は向き（度） */
function Photon({ x, y, a = 0, len = 14, wl = 6, amp = 2.5 }: { x: number; y: number; a?: number; len?: number; wl?: number; amp?: number }) {
  return (
    <path
      d={wave(x - len / 2, y, len, amp, wl, 0, 1)}
      fill="none"
      stroke="var(--fig-accent)"
      strokeWidth={1.5}
      transform={a ? `rotate(${a.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})` : undefined}
    />
  )
}

/** 陽子（塗った丸）と中性子（白抜きの丸） */
const Proton = ({ x, y, r = 4 }: { x: number; y: number; r?: number }) => <circle cx={x} cy={y} r={r} fill="var(--fig-line)" />
const Neutron = ({ x, y, r = 4 }: { x: number; y: number; r?: number }) => <circle cx={x} cy={y} r={r} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.3} />
const Electron = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={1.8} fill="var(--fig-text)" />

/** ヘリウムの原子核（陽子2個と中性子2個） */
function Helium({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Proton x={x - 3.2} y={y - 3.2} r={3.4} />
      <Neutron x={x + 3.2} y={y - 3.2} r={3.4} />
      <Neutron x={x - 3.2} y={y + 3.2} r={3.4} />
      <Proton x={x + 3.2} y={y + 3.2} r={3.4} />
    </g>
  )
}

/** 原子（原子核と、そのまわりを回る電子） */
function Atom({ x, y, ph, he }: { x: number; y: number; ph: number; he?: boolean }) {
  const R = he ? 10 : 7
  return (
    <g>
      <circle cx={x} cy={y} r={R} fill="none" stroke="var(--fig-muted)" strokeDasharray="2 2" />
      {he ? <Helium x={x} y={y} /> : <Proton x={x} y={y} r={3} />}
      <Electron x={x + R * Math.cos(ph)} y={y + R * Math.sin(ph)} />
      {he && <Electron x={x - R * Math.cos(ph)} y={y - R * Math.sin(ph)} />}
    </g>
  )
}

/* ---------- 図34-1 膨張を逆にたどる ---------- */

const REWIND_GAL = (() => {
  const r = rng(341)
  const out: { x: number; y: number; a: number }[] = []
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) out.push({ x: (i - 1.5) * 34 + (r() - 0.5) * 14, y: (j - 1.5) * 27 + (r() - 0.5) * 10, a: r() * 180 })
  return out
})()

const REWIND = [
  { title: '今', s: 1, heat: 0, lines: ['銀河の間は広い', '温度は低い'] },
  { title: '昔', s: 0.6, heat: 0.1, lines: ['銀河の間が狭い', '温度は高い'] },
  { title: 'さらに昔', s: 0.3, heat: 0.2, lines: ['もっと狭く', 'もっと熱い'] },
  { title: '始まり', s: 0, heat: 0.3, lines: ['1つの「原始の原子」', '（ルメートルの考え）'] },
]

export function FigRewind() {
  return (
    <Figure
      n="34-1"
      title="膨張を逆にたどると、宇宙は小さく、熱くなっていく"
      caption="模式図です。銀河の大きさは変えずに、銀河どうしの間の距離だけを縮めて描いています。実際には、宇宙がずっと小さかったころには、銀河も星もまだありません。"
    >
      <Svg id="34-1" w={720} h={234} label="今、昔、さらに昔、始まりの4つの場面。時間をさかのぼるほど銀河どうしの間が狭くなり、温度が高くなる。ルメートルは、始まりは1つの原始の原子だったと考えた。">
        <T x={360} y={12} anchor="middle" fs={12.5} tone="muted">
          時間をさかのぼる
        </T>
        <Arrow x1={40} y1={26} x2={690} y2={26} />
        {REWIND.map((p, k) => {
          const x = 15 + k * 175
          const cx = x + 80
          const cy = 119
          return (
            <g key={p.title}>
              <T x={cx} y={44} anchor="middle" bold>
                {p.title}
              </T>
              <rect x={x} y={54} width={160} height={130} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
              <rect x={x} y={54} width={160} height={130} rx={6} fill="var(--fig-danger)" opacity={p.heat} />
              {p.s > 0 ? REWIND_GAL.map((g, i) => <Galaxy key={i} x={cx + g.x * p.s} y={cy + g.y * p.s} a={g.a} />) : <Ball x={cx} y={cy} r={8} fill="var(--fig-box2)" />}
              {p.lines.map((l, i) => (
                <T key={i} x={cx} y={202 + i * 19} anchor="middle" fs={12}>
                  {l}
                </T>
              ))}
            </g>
          )
        })}
      </Svg>
    </Figure>
  )
}

/* ---------- 図34-2 宇宙が膨らみ冷えて原子ができる年表（動） ---------- */

const STAGES = [
  { time: '約1秒後', temp: '温度 約100億K', lines: ['陽子、中性子、電子、光が', 'ばらばらに飛び回る'] },
  { time: '約3分後', temp: '温度 約10億K', lines: ['陽子と中性子がくっつき、', 'ヘリウムの原子核ができる'] },
  { time: '約38万年後', temp: '温度 約3000K', lines: ['電子が原子核に捕まって', '原子になり、光が直進する'] },
  { time: '数億年後', temp: '', lines: ['原子のガスが集まり、', '最初の星と銀河ができる'] },
  { time: '約138億年後（今）', temp: '背景放射の温度 約2.7K', lines: ['銀河どうしは遠く離れ、', '宇宙は冷えている'] },
]
const TL_SIZE: [number, number][] = [
  [150, 100],
  [190, 120],
  [250, 140],
  [330, 160],
  [410, 170],
]
const TL_TICK = [70, 215, 360, 505, 650]
const TL_TICK_LABEL = ['約1秒', '約3分', '約38万年', '数億年', '約138億年']
const TL_LEN = 3.2
const TL_TRANS = 0.8
const TL_CX = 235
const TL_CY = 112

const TL_PTS = (() => {
  const r = rng(342)
  const mk = (n: number, sp: number) => Array.from({ length: n }, () => ({ u: r() * 2, v: r() * 2, vx: (r() - 0.5) * sp, vy: (r() - 0.5) * sp, a: r() * 180, ph: r() * 6.28 }))
  return { p: mk(12, 0.5), n: mk(2, 0.5), e: mk(12, 0.9), g: mk(14, 1.5), atom: mk(11, 0.12) }
})()

const TL_GAL = [
  [0.22, 0.32],
  [0.55, 0.7],
  [0.8, 0.28],
  [0.38, 0.62],
  [0.66, 0.3],
]

export function FigTimeline() {
  return (
    <Anim
      n="34-2"
      title="宇宙が膨らみ冷えて、原子ができるまで"
      still={2 * TL_LEN + 1.6}
      period={5 * TL_LEN + 1}
      caption="模式図です。左の枠は宇宙の一部分を切り取ったもので、時間とともに広がります。粒の数の比や大きさは実際と違います。下の目盛りは等間隔ではなく、始まりの数分間と、その後の138億年を同じ図に並べています。"
    >
      {(t) => {
        const k = Math.min(4, Math.floor(t / TL_LEN))
        const local = t - k * TL_LEN
        const tr = k < 4 ? ease((local - (TL_LEN - TL_TRANS)) / TL_TRANS) : 0
        const k2 = Math.min(4, k + 1)
        const bw = lerp(TL_SIZE[k][0], TL_SIZE[k2][0], tr)
        const bh = lerp(TL_SIZE[k][1], TL_SIZE[k2][1], tr)
        const bx = TL_CX - bw / 2
        const by = TL_CY - bh / 2
        const mx = lerp(TL_TICK[k], TL_TICK[k2], tr)
        const m = 9
        const at = (p: { u: number; v: number; vx: number; vy: number }) => ({ x: bx + m + tri(p.u + p.vx * t) * (bw - 2 * m), y: by + m + tri(p.v + p.vy * t) * (bh - 2 * m) })
        const st = STAGES[k]
        /** 直進する光（左から右へ流れる）。wl は波長 */
        const flow = (wl: number, amp: number, n: number) =>
          TL_PTS.g.slice(0, n).map((p, i) => {
            const x = bx + 12 + (((p.u / 2 + 0.12 * t) % 1) * (bw - 24))
            const y = by + 10 + (p.v / 2) * (bh - 20)
            return <Photon key={`f${i}`} x={x} y={y} len={wl * 2} wl={wl} amp={amp} />
          })
        return (
          <Svg id="34-2" w={720} h={320} label="宇宙の始まりから約1秒、約3分、約38万年、数億年、約138億年の5つの場面。宇宙は広がりながら冷え、陽子と中性子からヘリウムの原子核ができ、約38万年後に原子ができて光がまっすぐ進むようになり、数億年後に星と銀河ができた。">
            <T x={TL_CX} y={13} anchor="middle" fs={12} tone="muted">
              宇宙の一部分を切り取った様子
            </T>
            <rect x={bx} y={by} width={bw} height={bh} rx={4} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
            {k <= 1 && (
              <>
                {TL_PTS.g.map((p, i) => {
                  const q = at(p)
                  return <Photon key={`g${i}`} x={q.x} y={q.y} a={p.a} />
                })}
                {TL_PTS.e.map((p, i) => {
                  const q = at(p)
                  return <Electron key={`e${i}`} x={q.x} y={q.y} />
                })}
                {TL_PTS.p.slice(0, k === 0 ? 12 : 10).map((p, i) => {
                  const q = at(p)
                  return <Proton key={`p${i}`} x={q.x} y={q.y} />
                })}
                {k === 0 &&
                  TL_PTS.n.map((p, i) => {
                    const q = at(p)
                    return <Neutron key={`n${i}`} x={q.x} y={q.y} />
                  })}
                {k === 1 && <Helium {...at(TL_PTS.n[0])} />}
              </>
            )}
            {k === 2 && (
              <>
                {flow(5, 2.2, 8)}
                {TL_PTS.atom.map((p, i) => {
                  const q = { x: bx + 14 + tri(p.u + p.vx * t) * (bw - 28), y: by + 14 + tri(p.v + p.vy * t) * (bh - 28) }
                  return <Atom key={`a${i}`} x={q.x} y={q.y} ph={p.ph + 2.5 * t} he={i === 0} />
                })}
              </>
            )}
            {k === 3 && (
              <>
                {flow(9, 2.6, 6)}
                {TL_GAL.slice(0, 3).map(([u, v], i) => {
                  const gx = bx + u * bw
                  const gy = by + v * bh
                  return (
                    <g key={`c${i}`}>
                      <Galaxy x={gx} y={gy} a={20 + i * 50} />
                      {[0, 1, 2, 3].map((j) => (
                        <circle key={j} cx={gx + 12 * Math.cos(j * 1.6 + i)} cy={gy + 9 * Math.sin(j * 1.6 + i)} r={1.6} fill="var(--fig-text)" />
                      ))}
                    </g>
                  )
                })}
              </>
            )}
            {k === 4 && (
              <>
                {flow(16, 3, 5)}
                {TL_GAL.map(([u, v], i) => (
                  <Galaxy key={`g${i}`} x={bx + u * bw} y={by + v * bh} a={20 + i * 40} />
                ))}
              </>
            )}
            {/* 右の説明 */}
            <T x={470} y={44} bold fs={15}>
              {st.time}
            </T>
            {st.temp && (
              <T x={470} y={70} fs={12.5} tone="acc">
                {st.temp}
              </T>
            )}
            {st.lines.map((l, i) => (
              <T key={i} x={470} y={98 + i * 20} fs={12.5}>
                {l}
              </T>
            ))}
            {/* 凡例 */}
            <Proton x={480} y={160} />
            <T x={490} y={160} fs={12}>
              陽子
            </T>
            <Neutron x={546} y={160} />
            <T x={556} y={160} fs={12}>
              中性子
            </T>
            <Electron x={628} y={160} />
            <T x={636} y={160} fs={12}>
              電子
            </T>
            <Photon x={482} y={184} />
            <T x={496} y={184} fs={12}>
              光
            </T>
            <Helium x={548} y={184} />
            <T x={560} y={184} fs={12}>
              ヘリウムの原子核
            </T>
            <Atom x={482} y={208} ph={0.6} />
            <T x={496} y={208} fs={12}>
              原子
            </T>
            <Galaxy x={548} y={208} a={20} />
            <T x={560} y={208} fs={12}>
              銀河
            </T>
            {/* 時間の目盛り */}
            <Arrow x1={30} y1={262} x2={700} y2={262} />
            {TL_TICK.map((x, i) => (
              <g key={x}>
                <line x1={x} y1={256} x2={x} y2={268} stroke="var(--fig-line)" />
                <T x={x} y={284} anchor="middle" fs={12} bold={i === k} tone={i === k ? 'acc' : undefined}>
                  {TL_TICK_LABEL[i]}
                </T>
              </g>
            ))}
            <circle cx={mx} cy={262} r={7} fill="var(--fig-accent)" />
            <T x={30} y={308} fs={11.5} tone="muted">
              始まりからの時間（目盛りは等間隔ではない）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図34-3 ビッグバン理論と定常宇宙論（動・切り替え） ---------- */

const SS = { cx: 180, cy: 140, W: 160, H: 110, T: 6 }
const SS_SEED = (() => {
  const r = rng(343)
  return Array.from({ length: 36 }, () => ({ x: (r() * 2 - 1) * SS.W, y: (r() * 2 - 1) * SS.H, a: r() * 180 }))
})()

export function FigSteady() {
  const [model, setModel] = useState<'bb' | 'ss'>('bb')
  const bb = model === 'bb'
  return (
    <Anim
      n="34-3"
      title="ビッグバン理論では銀河がまばらになり、定常宇宙論では混み具合が変わらない"
      still={4.5}
      period={SS.T + 0.6}
      controls={
        <Choice
          label="宇宙の考え"
          options={[
            { value: 'bb', label: 'ビッグバン理論' },
            { value: 'ss', label: '定常宇宙論' },
          ]}
          value={model}
          onChange={setModel}
        />
      }
      caption="模式図です。どちらの考えでも、銀河どうしの間は時間とともに広がります。定常宇宙論では、広がったすきまに新しい物質が生まれて新しい銀河ができるので、窓の中の銀河の数はほぼ変わりません。「宇宙の考え」を切り替えると、右のグラフの形が変わります。"
    >
      {(t) => {
        const tt = Math.min(t, SS.T)
        const s = 2 ** (tt / SS.T)
        const gals: { x: number; y: number; a: number; op: number }[] = []
        for (const k of bb ? [-1, 0] : [-1, 0, 1]) {
          const op = k === 1 ? clamp01(tt / SS.T) : 1
          const f = s * 2 ** -k
          for (const g of SS_SEED) {
            const x = g.x * f
            const y = g.y * f
            if (Math.abs(x) > SS.W - 8 || Math.abs(y) > SS.H - 6) continue
            gals.push({ x: SS.cx + x, y: SS.cy + y, a: g.a + k * 40, op })
          }
        }
        const count = gals.filter((g) => g.op > 0.5).length
        const dens = (u: number) => (bb ? 1 / 4 ** (u / SS.T) : 1)
        const gx = (u: number) => 400 + (u / SS.T) * 240
        const gy = (d: number) => 238 - d * 80
        const curve = (u1: number) => {
          let d = ''
          for (let u = 0; u <= u1 + 1e-6; u += SS.T / 40) d += `${d ? 'L' : 'M'}${gx(u).toFixed(1)},${gy(dens(u)).toFixed(1)}`
          return d
        }
        return (
          <Svg id="34-3" w={680} h={262} label="宇宙の一部分をのぞく窓の中の銀河。ビッグバン理論では銀河どうしが離れて窓の中の銀河が減っていく。定常宇宙論では、すきまに新しい銀河が生まれ、銀河の数はほぼ変わらない。">
            <T x={22} y={16} fs={12} tone="muted">
              宇宙の一部分をのぞく窓
            </T>
            <rect x={SS.cx - SS.W} y={SS.cy - SS.H} width={SS.W * 2} height={SS.H * 2} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            {gals.map((g, i) => (
              <Galaxy key={i} x={g.x} y={g.y} a={g.a} op={g.op} />
            ))}
            <T x={370} y={44} bold fs={15}>
              {bb ? 'ビッグバン理論' : '定常宇宙論'}
            </T>
            <T x={370} y={70} fs={12.5}>
              {bb ? '銀河はみな同じころに生まれ、' : '広がったすきまに新しい銀河が'}
            </T>
            <T x={370} y={90} fs={12.5}>
              {bb ? '離れるにつれてまばらになる' : '生まれ、混み具合は変わらない'}
            </T>
            <T x={370} y={118} fs={12.5} tone="acc">
              {`窓の中の銀河：${count}個`}
            </T>
            <T x={408} y={144} fs={12}>
              混み具合
            </T>
            <Arrow x1={400} y1={238} x2={400} y2={154} />
            <Arrow x1={400} y1={238} x2={644} y2={238} />
            <T x={650} y={238} fs={12}>
              時間
            </T>
            <path d={curve(SS.T)} fill="none" stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <path d={curve(tt)} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            <circle cx={gx(tt)} cy={gy(dens(tt))} r={5} fill="var(--fig-accent)" />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図34-4 ヘリウムの先で止まる ---------- */

const GAP_BOX: { x: number; lines: string[]; none?: boolean }[] = [
  { x: 16, lines: ['1個', '陽子', '（水素）'] },
  { x: 90, lines: ['2個', '重水素'] },
  { x: 164, lines: ['3個', 'ヘリウム3'] },
  { x: 238, lines: ['4個', 'ヘリウム'] },
  { x: 312, lines: ['5個', '安定な', 'ものはない'], none: true },
  { x: 386, lines: ['6個', 'リチウム'] },
  { x: 460, lines: ['7個', 'リチウム', '（わずか）'] },
  { x: 534, lines: ['8個', '安定な', 'ものはない'], none: true },
  { x: 640, lines: ['12個', '炭素'] },
]

export function FigGap() {
  const top = (i: number) => GAP_BOX[i].x + 33
  return (
    <Figure
      n="34-4"
      title="陽子と中性子を合わせて5個と8個の原子核は安定しないので、ビッグバンではヘリウムの先へ進みにくい"
      caption="箱の上の数は、原子核の中の陽子と中性子を合わせた数です。点線の箱は、安定な原子核がない数を表します。星の中では、ヘリウムの原子核3個がくっついて、この「すき間」を飛び越えます。"
    >
      <Svg id="34-4" w={720} h={232} label="陽子と中性子の数が1個、2個、3個、4個の原子核は、ビッグバンの数分間で次々にできる。5個と8個の安定な原子核はないので、ヘリウムの先へ進みにくい。星の中では、ヘリウムの原子核3個がくっついて12個の炭素ができる。">
        <T x={160} y={28} anchor="middle" fs={12.5}>
          ビッグバンの数分間で進む
        </T>
        {[0, 1, 2].map((i) => (
          <Arrow key={i} d={`M${top(i)},70 Q${(top(i) + top(i + 1)) / 2},44 ${top(i + 1)},70`} accent />
        ))}
        <T x={312} y={28} anchor="middle" fs={12.5} tone="danger">
          先へ進めない
        </T>
        <Arrow d={`M${top(3)},70 Q${(top(3) + top(4)) / 2},44 ${top(4)},70`} danger />
        <Cross x={(top(3) + top(4)) / 2} y={57} s={6} />
        <Cross x={top(7)} y={56} s={6} />
        {GAP_BOX.map((b) => (
          <Box key={b.x} x={b.x} y={72} w={66} h={66} lines={b.lines} fs={12} bold fill={b.none ? 'bg' : b.x === 640 ? 'box3' : 'box2'} dashed={b.none} />
        ))}
        <T x={625} y={105} anchor="middle" fs={13}>
          …
        </T>
        <Arrow d={`M${top(3)},142 Q456,236 ${GAP_BOX[8].x + 33},142`} accent />
        <T x={472} y={214} anchor="middle" fs={12.5} tone="acc">
          星の中：ヘリウムの原子核3個がくっついて炭素になる
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図34-5 元素ができた場所の周期表 ---------- */

type Zone = 'bb' | 'cr' | 'star' | 'ncap'
const ZONE: Record<Zone, { fill: string; dash?: string; label: string }> = {
  bb: { fill: 'var(--fig-box2)', label: 'ビッグバン（始まりの数分間）' },
  cr: { fill: 'var(--fig-box5)', dash: '5 3', label: '宇宙線が原子核を壊してできる' },
  star: { fill: 'var(--fig-box3)', label: '星の中の核融合と、星の爆発' },
  ncap: { fill: 'var(--fig-box4)', dash: '2 2', label: '中性子を取り込む反応' },
}
const P4 = ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr']
const JA: Record<string, string> = { H: '水素', C: '炭素', N: '窒素', O: '酸素', Fe: '鉄', Ag: '銀', Au: '金', Pb: '鉛', U: 'ウラン' }
const PT: { s: string; row: number; col: number; z: Zone }[] = [
  { s: 'H', row: 1, col: 1, z: 'bb' },
  { s: 'He', row: 1, col: 18, z: 'bb' },
  ...['Li', 'Be'].map((s, i) => ({ s, row: 2, col: i + 1, z: 'cr' as Zone })),
  ...['B', 'C', 'N', 'O', 'F', 'Ne'].map((s, i) => ({ s, row: 2, col: i + 13, z: (i === 0 ? 'cr' : 'star') as Zone })),
  ...['Na', 'Mg'].map((s, i) => ({ s, row: 3, col: i + 1, z: 'star' as Zone })),
  ...['Al', 'Si', 'P', 'S', 'Cl', 'Ar'].map((s, i) => ({ s, row: 3, col: i + 13, z: 'star' as Zone })),
  ...P4.map((s, i) => ({ s, row: 4, col: i + 1, z: (i < 10 ? 'star' : 'ncap') as Zone })),
]

function Cell({ x, y, s, z }: { x: number; y: number; s: string; z: Zone }) {
  const ja = JA[s]
  return (
    <g>
      <rect x={x} y={y} width={36} height={36} rx={3} fill={ZONE[z].fill} stroke="var(--fig-line)" strokeDasharray={ZONE[z].dash} />
      <T x={x + 18} y={y + (ja ? 13 : 18)} anchor="middle" fs={13} bold>
        {s}
      </T>
      {ja && (
        <T x={x + 18} y={y + 28} anchor="middle" fs={11}>
          {ja}
        </T>
      )}
    </g>
  )
}

export function FigPeriodic() {
  return (
    <Figure
      n="34-5"
      title="元素ができた場所は、元素によって違う"
      caption="模式図です。周期表の最初の4段（原子番号1〜36）と、重い元素の例について、主なでき方を4つに分けて色と枠線で示しました。実際には1つの元素が何か所かでつくられ、ヘリウムやリチウムの一部は星の中でもつくられます。境目は目安です。"
    >
      <Svg id="34-5" w={720} h={250} label="周期表の第1〜第4周期の元素を、主なでき方で4つに分けた図。水素とヘリウムはビッグバン、リチウム、ベリリウム、ホウ素は宇宙線、炭素からニッケルまでは星の中の核融合と星の爆発、銅より重い元素と銀、金、鉛、ウランは中性子を取り込む反応でできた。">
        <T x={360} y={52} anchor="middle" fs={12.5} tone="muted">
          原子番号1〜36の元素（周期表の第1〜第4段）
        </T>
        {PT.map((e) => (
          <Cell key={e.s} x={18 + (e.col - 1) * 38} y={34 + (e.row - 1) * 38} s={e.s} z={e.z} />
        ))}
        {(Object.keys(ZONE) as Zone[]).map((z, i) => (
          <g key={z}>
            <rect x={104} y={80 + i * 18} width={14} height={12} fill={ZONE[z].fill} stroke="var(--fig-line)" strokeDasharray={ZONE[z].dash} />
            <T x={124} y={86 + i * 18} fs={12}>
              {ZONE[z].label}
            </T>
          </g>
        ))}
        <T x={18} y={218} fs={12.5}>
          重い元素の例：
        </T>
        {['Ag', 'Au', 'Pb', 'U'].map((s, i) => (
          <Cell key={s} x={120 + i * 42} y={200} s={s} z="ncap" />
        ))}
        <T x={300} y={210} fs={12}>
          鉄より重い元素の多くは、中性子を取り込む反応でできる
        </T>
        <T x={300} y={228} fs={12} tone="muted">
          （金は中性子星の合体でできたという説が有力）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図34-6 宇宙の晴れ上がり（動） ---------- */

const CL = { x: 20, y: 50, w: 380, h: 140, speed: 160, yOut: 140 }
const CL_NUC = (() => {
  const r = rng(346)
  const out: { x: number; y: number }[] = []
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) out.push({ x: 52 + i * 60 + (r() - 0.5) * 16, y: 86 + j * 64 + (r() - 0.5) * 14 })
  return out
})()
const CL_E = (() => {
  const r = rng(3461)
  return CL_NUC.map(() => ({ u: r() * 2, v: r() * 2, vx: (r() - 0.5) * 0.9, vy: (r() - 0.5) * 0.9, ph: r() * 6.28 }))
})()
/** ぶつかりながら進む光の道筋（折れ線）。最後は右寄りの決まった点で終わる */
const CL_ZIG = (() => {
  const r = rng(3462)
  const pts: [number, number][] = [[32, 118]]
  for (let i = 0; i < 8; i++) {
    const [x0, y0] = pts[pts.length - 1]
    const a = (r() * 2 - 1) * Math.PI * 0.85
    const len = 36 + r() * 26
    pts.push([Math.min(330, Math.max(34, x0 + len * Math.cos(a) + 14)), Math.min(172, Math.max(66, y0 + len * Math.sin(a)))])
  }
  pts.push([340, CL.yOut])
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  return { pts, cum, tEnd: cum[cum.length - 1] / CL.speed }
})()

/** 右へ進むほど波長が伸びる波（宇宙の膨張で引き伸ばされた光） */
function chirp(x0: number, x1: number, y: number) {
  let d = `M${x0},${y}`
  let ph = 0
  for (let x = x0 + 1; x <= x1; x += 1) {
    const wl = 6 + ((x - x0) / 300) * 30
    ph += (2 * Math.PI) / wl
    d += ` L${x},${(y - 6 * Math.sin(ph)).toFixed(1)}`
  }
  return d
}

export function FigClear() {
  return (
    <Anim
      n="34-6"
      title="約38万年後に原子ができると、光はまっすぐ進めるようになった"
      still={7}
      period={8.5}
      caption="模式図です。点線は、光が電子にぶつかって向きを変えながら進んだ道筋です。電子が原子核に捕まると、光はぶつかる相手がなくなり、まっすぐ進みます。その光が宇宙の膨張で波長を引き伸ばされて、今の宇宙マイクロ波背景放射として届きます。"
    >
      {(t) => {
        const tZ = CL_ZIG.tEnd
        const cap = clamp01((t - (tZ - 0.9)) / 0.8)
        const clear = t > tZ - 0.4
        // 光の位置
        const dist = Math.min(t, tZ) * CL.speed
        let i = 1
        while (i < CL_ZIG.cum.length - 1 && CL_ZIG.cum[i] < dist) i++
        const seg = CL_ZIG.cum[i] - CL_ZIG.cum[i - 1]
        const k = seg ? clamp01((dist - CL_ZIG.cum[i - 1]) / seg) : 1
        const zx = lerp(CL_ZIG.pts[i - 1][0], CL_ZIG.pts[i][0], k)
        const zy = lerp(CL_ZIG.pts[i - 1][1], CL_ZIG.pts[i][1], k)
        const trail: [number, number][] = [...CL_ZIG.pts.slice(0, i), [zx, zy]]
        const px = t > tZ ? Math.min(700, 340 + (t - tZ) * CL.speed) : zx
        const py = t > tZ ? CL.yOut : zy
        return (
          <Svg id="34-6" w={720} h={226} label="左の箱の中で、光は飛び回る電子にぶつかって向きを変えながら進む。約38万年後に電子が原子核に捕まって原子になると、光はまっすぐ進み、宇宙の膨張で波長が伸びて今の背景放射になる。">
            <T x={20} y={22} fs={12.5}>
              {clear ? '約38万年後：電子が原子核に捕まって原子になり、光はまっすぐ進む' : '約38万年より前：光は電子にぶつかって向きを変え、まっすぐ進めない'}
            </T>
            <rect x={CL.x} y={CL.y} width={CL.w} height={CL.h} rx={4} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <rect x={CL.x} y={CL.y} width={CL.w} height={CL.h} rx={4} fill="var(--fig-box2)" opacity={0.7 * (1 - cap)} />
            {CL_NUC.map((n, j) => {
              const e = CL_E[j]
              const fx = CL.x + 10 + tri(e.u + e.vx * t) * (CL.w - 20)
              const fy = CL.y + 10 + tri(e.v + e.vy * t) * (CL.h - 20)
              const ang = e.ph + 3 * t
              const ox = n.x + 9 * Math.cos(ang)
              const oy = n.y + 9 * Math.sin(ang)
              const c = ease(cap)
              return (
                <g key={j}>
                  {cap > 0.9 && <circle cx={n.x} cy={n.y} r={9} fill="none" stroke="var(--fig-muted)" strokeDasharray="2 2" />}
                  <Proton x={n.x} y={n.y} r={4.5} />
                  <Electron x={lerp(fx, ox, c)} y={lerp(fy, oy, c)} />
                </g>
              )
            })}
            <Trail points={trail} />
            {t > tZ && <line x1={340} y1={CL.yOut} x2={Math.min(px, 400)} y2={CL.yOut} stroke="var(--fig-accent)" strokeWidth={2} />}
            {px > 400 && <path d={chirp(400, px, CL.yOut)} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />}
            {px < 700 && <circle cx={px} cy={py} r={4.5} fill="var(--fig-accent)" />}
            <T x={420} y={62} fs={12.5}>
              その後の宇宙の膨張で、
            </T>
            <T x={420} y={82} fs={12.5}>
              光の波長は約1100倍に伸びた。
            </T>
            <T x={420} y={102} fs={12.5}>
              今は電波（マイクロ波）として届く
            </T>
            <T x={700} y={172} anchor="end" fs={12} tone="muted">
              地球へ
            </T>
            {/* 凡例 */}
            <Proton x={30} y={210} r={4.5} />
            <T x={40} y={210} fs={12}>
              原子核
            </T>
            <Electron x={104} y={210} />
            <T x={112} y={210} fs={12}>
              電子
            </T>
            <circle cx={164} cy={210} r={4.5} fill="var(--fig-accent)" />
            <T x={174} y={210} fs={12}>
              光
            </T>
            <Trail points={[[210, 210], [244, 210]]} />
            <T x={252} y={210} fs={12}>
              光が通った道筋
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図34-7 宇宙背景放射のスペクトル ---------- */

/** 温度 T（K）の黒体放射の、波長 lam（mm）での強さ（形だけを比べるので定数は省く） */
const planckL = (lam: number, T = 2.725) => 1 / (lam ** 5 * (Math.exp(14.388 / (lam * T)) - 1))
const SP_PEAK = planckL(14.388 / (4.965 * 2.725))
const spX = (lam: number) => 80 + lam * 105
const spY = (v: number) => 250 - (v / SP_PEAK) * 190

export function FigSpectrum() {
  let d = ''
  for (let lam = 0.25; lam <= 5.3; lam += 0.02) d += `${d ? 'L' : 'M'}${spX(lam).toFixed(1)},${spY(planckL(lam)).toFixed(1)}`
  const pts = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2, 2.4, 2.8, 3.3, 3.8, 4.4, 5]
  return (
    <Figure
      n="34-7"
      title="宇宙背景放射の強さは、温度約2.725Kの黒体放射の曲線にぴったり重なる"
      caption="曲線は、温度2.725Kの黒体放射について計算したものです。COBE は波長0.5〜5mm の範囲でこの形を確かめました。点の位置は模式で、実際の測定のずれは点の大きさよりはるかに小さく、最終的な結果では山の高さの1万分の3以下でした。"
    >
      <Svg id="34-7" w={680} h={300} label="横軸は波長（mm）、縦軸は強さ。温度約2.725Kの黒体放射の曲線は波長約1mmで最も強くなり、COBEの測定点が曲線の上に並ぶ。ペンジアスとウィルソンが測った波長7.35cmは、この図のずっと右にある。">
        <Arrow x1={80} y1={250} x2={650} y2={250} />
        <Arrow x1={80} y1={250} x2={80} y2={40} />
        <T x={72} y={44} anchor="end" fs={12}>
          強さ
        </T>
        {[1, 2, 3, 4, 5].map((l) => (
          <g key={l}>
            <line x1={spX(l)} y1={250} x2={spX(l)} y2={256} stroke="var(--fig-line)" />
            <T x={spX(l)} y={268} anchor="middle" fs={12}>
              {String(l)}
            </T>
          </g>
        ))}
        <T x={650} y={290} anchor="end" fs={12}>
          波長（mm）
        </T>
        <path d={d} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
        {pts.map((l) => (
          <rect key={l} x={spX(l) - 3.5} y={spY(planckL(l)) - 3.5} width={7} height={7} fill="var(--fig-accent)" />
        ))}
        <T x={212} y={44} fs={12.5}>
          いちばん強いのは波長約1mm
        </T>
        <T x={396} y={176} fs={12.5}>
          温度約2.725Kの黒体放射の形
        </T>
        <rect x={440} y={64} width={7} height={7} fill="var(--fig-accent)" />
        <T x={454} y={68} fs={12}>
          COBE の測定（位置は模式）
        </T>
        <T x={440} y={100} fs={12} tone="muted">
          ペンジアスとウィルソンが測った
        </T>
        <T x={440} y={118} fs={12} tone="muted">
          波長7.35cmは、図のずっと右
        </T>
        <Arrow x1={560} y1={136} x2={650} y2={136} dashed />
      </Svg>
    </Figure>
  )
}

/* ---------- 図34-8 温度のむらの模式図（切り替え） ---------- */

const MAP = { x: 30, y: 16, w: 640, h: 320, step: 5 }
type Sat = 'cobe' | 'wmap' | 'planck'
const SAT: Record<Sat, { k: number; label: string; note: string }> = {
  cobe: { k: 10, label: 'COBE（1989年打ち上げ）', note: '見分けられる細かさ：約7度' },
  wmap: { k: 3, label: 'WMAP（2001年打ち上げ）', note: '見分けられる細かさ：約0.2度' },
  planck: { k: 1, label: 'Planck（2009年打ち上げ）', note: 'WMAP よりさらに細かい' },
}

/** 乱数で作った温度のむら（細かい格子の値）。大きなむらから小さなむらまでを重ねる */
function skyField() {
  const r = rng(348)
  const blobs: { x: number; y: number; s: number; a: number }[] = []
  for (const [n, s, amp] of [
    [8, 70, 0.2],
    [70, 26, 0.6],
    [520, 10, 0.75],
  ])
    for (let i = 0; i < n; i++) blobs.push({ x: r() * MAP.w, y: r() * MAP.h, s, a: (r() * 2 - 1) * amp })
  const nx = MAP.w / MAP.step
  const ny = Math.ceil(MAP.h / MAP.step)
  const f = new Float32Array(nx * ny)
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const x = (i + 0.5) * MAP.step
      const y = (j + 0.5) * MAP.step
      let v = 0
      for (const b of blobs) {
        const dx = x - b.x
        const dy = y - b.y
        if (Math.abs(dx) > 3 * b.s || Math.abs(dy) > 3 * b.s) continue
        v += b.a * Math.exp(-(dx * dx + dy * dy) / (2 * b.s * b.s))
      }
      f[j * nx + i] = v
    }
  return { f, nx, ny }
}

export function FigMap() {
  const [sat, setSat] = useState<Sat>('planck')
  const field = useMemo(() => skyField(), [])
  const cells = useMemo(() => {
    const { f, nx, ny } = field
    const k = SAT[sat].k
    const out: { x: number; y: number; s: number; v: number }[] = []
    const cx = MAP.w / 2
    const cy = MAP.h / 2
    for (let j = 0; j < ny; j += k)
      for (let i = 0; i < nx; i += k) {
        const s = MAP.step * k
        const mx = i * MAP.step + s / 2
        const my = j * MAP.step + s / 2
        if (((mx - cx) / (cx + s / 2)) ** 2 + ((my - cy) / (cy + s / 2)) ** 2 > 1) continue
        let sum = 0
        let n = 0
        for (let b = j; b < Math.min(ny, j + k); b++)
          for (let a = i; a < Math.min(nx, i + k); a++) {
            sum += f[b * nx + a]
            n++
          }
        out.push({ x: MAP.x + i * MAP.step, y: MAP.y + j * MAP.step, s, v: sum / n })
      }
    // 平均からのばらつきの大きさで割り、濃さをそろえる
    const rms = Math.sqrt(out.reduce((a, c) => a + c.v * c.v, 0) / out.length)
    return out.map((c) => ({ ...c, v: Math.max(-1, Math.min(1, c.v / (2.2 * rms))) }))
  }, [field, sat])
  return (
    <Figure
      n="34-8"
      title="宇宙背景放射の温度のむら（模式図）"
      controls={
        <Choice
          label="衛星"
          options={[
            { value: 'cobe', label: 'COBE' },
            { value: 'wmap', label: 'WMAP' },
            { value: 'planck', label: 'Planck' },
          ]}
          value={sat}
          onChange={setSat}
        />
      }
      caption="本物の観測画像ではなく、乱数で作った模式図です。空全体を楕円の形に広げて描いています。赤い所は平均より少し温度が高く、青い所は少し低い所で、差は平均の温度の10万分の1ほどです。「衛星」を切り替えると、見分けられるむらの細かさが変わります（細かさの比は実際と違います）。"
    >
      <Svg id="34-8" w={700} h={392} label="空全体を楕円に広げた温度のむらの模式図。赤は平均より少し温度が高い所、青は少し低い所。COBEでは大きなむらだけが見え、WMAPやPlanckではより細かいむらまで見える。">
        <defs>
          <clipPath id="clip-34-8">
            <ellipse cx={MAP.x + MAP.w / 2} cy={MAP.y + MAP.h / 2} rx={MAP.w / 2} ry={MAP.h / 2} />
          </clipPath>
        </defs>
        <ellipse cx={MAP.x + MAP.w / 2} cy={MAP.y + MAP.h / 2} rx={MAP.w / 2} ry={MAP.h / 2} fill="var(--fig-bg)" />
        <g shapeRendering="crispEdges" clipPath="url(#clip-34-8)">
          {cells.map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width={c.s} height={c.s} fill={c.v > 0 ? 'var(--fig-danger)' : 'var(--fig-accent)'} fillOpacity={Math.min(0.9, Math.abs(c.v) * 1.1)} />
          ))}
        </g>
        <ellipse cx={MAP.x + MAP.w / 2} cy={MAP.y + MAP.h / 2} rx={MAP.w / 2} ry={MAP.h / 2} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
        <T x={30} y={352} fs={12.5} bold>
          {SAT[sat].label}
        </T>
        <T x={250} y={352} fs={12.5}>
          {SAT[sat].note}
        </T>
        <rect x={30} y={368} width={14} height={12} fill="var(--fig-danger)" fillOpacity={0.8} />
        <T x={50} y={375} fs={12}>
          平均より少し高い
        </T>
        <rect x={180} y={368} width={14} height={12} fill="var(--fig-accent)" fillOpacity={0.8} />
        <T x={200} y={375} fs={12}>
          平均より少し低い（差は約10万分の1）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図34-9 地平線問題とインフレーション（動・切り替え） ---------- */

const HZ = { ex: 350, y: 150, ax: 70, bx: 630, rh: 34 }

export function FigHorizon() {
  const [infl, setInfl] = useState<'no' | 'yes'>('no')
  const yes = infl === 'yes'
  return (
    <Anim
      n="34-9"
      title="インフレーションがあったとすると、遠く離れた場所の温度が同じ理由を説明できる"
      still={yes ? 6.2 : 5}
      period={yes ? 7 : 6.5}
      controls={
        <Choice
          label="インフレーション"
          options={[
            { value: 'no', label: 'なし' },
            { value: 'yes', label: 'あり' },
          ]}
          value={infl}
          onChange={setInfl}
        />
      }
      caption="模式図です。AとBは、空の反対の方向にある、背景放射が出た場所です。色の付いた円は、宇宙の始まりからその時までに光が届いた範囲です。「なし」では、AとBは一度も影響し合えないのに温度が同じ理由を説明できません。「あり」を選ぶと、AとBがもとは1つの小さな領域にあったことが分かります。"
    >
      {(t) => {
        // 「あり」：0〜1.4秒はインフレーションの前、1.4〜2.6秒で倍々に広がる
        const u = clamp01((t - 1.4) / 1.2)
        const sep = yes ? 8 * 35 ** u : HZ.ex - HZ.ax
        const ax = HZ.ex - sep
        const bx = HZ.ex + sep
        const after = !yes || t > 2.6
        const tt = yes ? t - 2.6 : t
        const rh = after ? HZ.rh * ease(tt / 2) : 0
        const ray = after ? clamp01((tt - 2.2) / 1.2) : 0
        const msg = !yes
          ? ['AとBの光が届いた範囲は、一度も重なっていない。', 'それでも、届く背景放射の温度は10万分の1の精度で同じ']
          : t < 1.4
            ? ['インフレーションの前：AとBは1つの小さな領域の中にあり、', '互いに影響し合って温度がそろう']
            : t < 2.6
              ? ['インフレーション：ほんの一瞬で、空間が倍々に広がる', '']
              : ['その後：AとBは遠く離れたが、温度はそろったまま。', '点線の楕円の内側が、もとは1つの小さな領域だった範囲']
        return (
          <Svg id="34-9" w={700} h={262} label="空の反対の方向にあるAとBは、宇宙の始まりから光が届いた範囲が重ならないのに、背景放射の温度が同じである。インフレーションがあったとすると、AとBはもとは1つの小さな領域にあって温度がそろい、その後、一瞬で遠く離れたと説明できる。">
            <T x={20} y={20} fs={12.5}>
              {msg[0]}
            </T>
            <T x={20} y={40} fs={12.5} tone="acc">
              {msg[1]}
            </T>
            {yes && t < 2.6 && <ellipse cx={HZ.ex} cy={HZ.y} rx={sep + 20} ry={Math.min(72, 16 + sep * 0.3)} fill="var(--fig-box2)" opacity={0.8} />}
            {yes && t >= 2.6 && <ellipse cx={HZ.ex} cy={HZ.y} rx={HZ.ex - HZ.ax + 16} ry={72} fill="none" stroke="var(--fig-muted)" strokeDasharray="5 5" />}
            {after && (
              <>
                <circle cx={ax} cy={HZ.y} r={rh} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeDasharray="4 3" />
                <circle cx={bx} cy={HZ.y} r={rh} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeDasharray="4 3" />
                {rh > 20 && (
                  <>
                    <T x={ax} y={HZ.y - 72} anchor="middle" fs={12}>
                      Aの光が届いた範囲
                    </T>
                    <T x={bx} y={HZ.y - 72} anchor="middle" fs={12}>
                      Bの光が届いた範囲
                    </T>
                  </>
                )}
                {ray > 0 && (
                  <>
                    <Arrow x1={ax + 40} y1={HZ.y} x2={lerp(ax + 40, HZ.ex - 16, ray)} y2={HZ.y} dashed />
                    <Arrow x1={bx - 40} y1={HZ.y} x2={lerp(bx - 40, HZ.ex + 16, ray)} y2={HZ.y} dashed />
                  </>
                )}
                <Ball x={HZ.ex} y={HZ.y} r={9} fill="var(--fig-box4)" />
                <T x={HZ.ex} y={HZ.y + 24} anchor="middle" fs={12}>
                  地球
                </T>
              </>
            )}
            <circle cx={ax} cy={HZ.y} r={5} fill="var(--fig-line)" />
            <circle cx={bx} cy={HZ.y} r={5} fill="var(--fig-line)" />
            {(after || t < 1.4) && (
              <>
                <T x={ax} y={after ? HZ.y + 50 : HZ.y + 36} anchor="middle" fs={13} bold>
                  A
                </T>
                <T x={bx} y={after ? HZ.y + 50 : HZ.y + 36} anchor="middle" fs={13} bold>
                  B
                </T>
              </>
            )}
            {after && (
              <T x={HZ.ex} y={HZ.y + 96} anchor="middle" fs={12} tone="muted">
                点線の矢印：背景放射の光が地球に届く道筋
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}
