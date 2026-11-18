import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Force, ease, rng } from './common'

/* ---------- この章の部品 ---------- */

/** 熱素（または熱）の粒。模式図の印 */
function Dot({ x, y, o = 1 }: { x: number; y: number; o?: number }) {
  return <circle cx={x} cy={y} r={4} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1} opacity={o} />
}

/** 温度計の液柱。frac は 0〜1 */
function Column({ x, top, bottom, frac }: { x: number; top: number; bottom: number; frac: number }) {
  const h = (bottom - top) * frac
  return (
    <g>
      <rect x={x - 5} y={top} width={10} height={bottom - top} rx={5} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <rect x={x - 3} y={bottom - h} width={6} height={h} fill="var(--fig-muted)" />
      <circle cx={x} cy={bottom + 6} r={8} fill="var(--fig-muted)" stroke="var(--fig-line)" />
    </g>
  )
}

/** 回る車（スポーク6本） */
function Wheel({ x, y, r, a }: { x: number; y: number; r: number; a: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={1.5} />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const t = a + (k * Math.PI) / 3
        return <line key={k} x1={x} y1={y} x2={x + r * Math.cos(t)} y2={y + r * Math.sin(t)} stroke="var(--fig-line)" />
      })}
      <circle cx={x} cy={y} r={4} fill="var(--fig-line)" />
    </g>
  )
}

/* ---------- 図11-1 年表 ---------- */

const ROAD = [
  { y: '1597年', who: 'ガリレオ', what: ['空気の膨らみで', '温度の変化を見る'] },
  { y: '1712年', who: 'ニューコメン', what: ['蒸気で水を', 'くみ上げる機関'] },
  { y: '1724年', who: 'ファーレンハイト', what: ['温度計の', '目盛りを発表'] },
  { y: '1742年', who: 'セルシウス', what: ['水の凍る点と', '沸く点で100等分'] },
  { y: '1761年', who: 'ブラック', what: ['氷が溶ける間', '温度は上がらない'] },
  { y: '1769年', who: 'ワット', what: ['分離凝縮器の', '特許'] },
  { y: '1789年', who: 'ラヴォアジエ', what: ['熱素を元素の', '表に入れる'] },
  { y: '1824年', who: 'カルノー', what: ['『火の動力に', 'ついての考察』'] },
]

export function FigRoad() {
  return (
    <Figure n="11-1" title="温度計の目盛りからカルノーの理論までの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="11-1" w={810} h={250} label="1597年ガリレオの温度の変化を見る器具、1712年ニューコメンの蒸気機関、1724年ファーレンハイトと1742年セルシウスの温度計の目盛り、1761年ブラックの潜熱の実験、1769年ワットの分離凝縮器の特許、1789年ラヴォアジエが熱素を元素の表に入れる、1824年カルノーの『火の動力についての考察』。">
        <Arrow x1={15} y1={125} x2={800} y2={125} />
        {ROAD.map((r, i) => {
          const x = 62 + i * 97
          const up = i % 2 === 0
          const ty = up ? 30 : 152
          return (
            <g key={r.y}>
              <circle cx={x} cy={125} r={6} fill={i === 7 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
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

/* ---------- 図11-2 3つの温度の目盛り ---------- */

/** 今のセルシウス温度 c の高さ */
const yC = (c: number) => 330 - (c + 20) * 2

function Scale({ x, title, year, dir, marks }: { x: number; title: string; year: string; dir: string; marks: { c: number; v: string; note: string }[] }) {
  return (
    <g>
      <T x={x} y={16} anchor="middle" bold fs={12.5}>
        {title}
      </T>
      <T x={x} y={34} anchor="middle" fs={12}>
        {year}
      </T>
      <T x={x} y={54} anchor="middle" fs={12} tone="acc">
        {dir}
      </T>
      <rect x={x - 8} y={72} width={16} height={262} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <circle cx={x} cy={343} r={13} fill="var(--fig-muted)" stroke="var(--fig-line)" />
      {marks.map((m) => (
        <g key={m.v}>
          <line x1={x - 14} y1={yC(m.c)} x2={x + 14} y2={yC(m.c)} stroke="var(--fig-line)" strokeWidth={2} />
          <T x={x + 20} y={yC(m.c) - 7} fs={12.5} bold>
            {m.v}
          </T>
          <T x={x + 20} y={yC(m.c) + 9} fs={11.5} tone="muted">
            {m.note}
          </T>
        </g>
      ))}
    </g>
  )
}

export function FigScales() {
  return (
    <Figure
      n="11-2"
      title="ファーレンハイトの目盛り、セルシウスの元の目盛り、今の目盛り"
      caption="3本の温度計は、同じ温度が同じ高さに来るように並べた模式図です。セルシウスの元の目盛りは、今とは上下が逆で、温度が下がるほど数が大きくなります。"
    >
      <Svg id="11-2" w={720} h={365} label="ファーレンハイトの目盛りは氷と水と塩類の混合物が0度、氷と水が32度、健康な人の体温が96度。セルシウスの元の目盛りは水が沸く点が0度、氷が溶ける点が100度。今のセルシウス温度は氷が溶ける点が0度、水が沸く点が100度。">
        {[
          { c: 100, label: '水が沸く温度' },
          { c: 0, label: '氷が溶ける温度' },
        ].map((l) => (
          <g key={l.c}>
            <line x1={10} y1={yC(l.c)} x2={712} y2={yC(l.c)} stroke="var(--fig-muted)" strokeDasharray="5 5" />
            <T x={10} y={yC(l.c) - 10} fs={11.5} tone="muted">
              {l.label}
            </T>
          </g>
        ))}
        <Scale
          x={150}
          title="ファーレンハイト"
          year="（1724年）"
          dir="上ほど数が大きい"
          marks={[
            { c: 35.6, v: '96度', note: '健康な人の体温' },
            { c: 0, v: '32度', note: '氷と水' },
            { c: -17.8, v: '0度', note: '氷・水・塩類の混合' },
          ]}
        />
        <Scale
          x={370}
          title="セルシウスの元の目盛り"
          year="（1742年）"
          dir="下ほど数が大きい"
          marks={[
            { c: 100, v: '0度', note: '水が沸く点' },
            { c: 0, v: '100度', note: '氷が溶ける点' },
          ]}
        />
        <Scale
          x={580}
          title="今のセルシウス温度"
          year="（1744年以降に広まる）"
          dir="上ほど数が大きい"
          marks={[
            { c: 100, v: '100度', note: '水が沸く点' },
            { c: 0, v: '0度', note: '氷が溶ける点' },
          ]}
        />
      </Svg>
    </Figure>
  )
}

/* ---------- 図11-3 温度がそろう（動・切り替え） ---------- */

export function FigEqualize() {
  const [amount, setAmount] = useState<'1' | '2'>('1')
  const m = Number(amount)
  const tf = (80 + 20 * m) / (1 + m)
  const tau = 1.1
  const tEnd = 6
  const gx = (t: number) => 90 + (t / tEnd) * 520
  const gy = (c: number) => 300 - (c - 10) * 1.2
  const temps = (t: number) => {
    const e = Math.exp(-t / tau)
    return { h: tf + (80 - tf) * e, c: tf + (20 - tf) * e }
  }
  const rightW = 160 * m
  return (
    <Anim
      n="11-3"
      title="温度の違う水を接しておくと、やがて同じ温度になる"
      still={5.5}
      period={8}
      controls={
        <Choice
          label="右の冷たい水の量"
          options={[
            { value: '1', label: '左と同じ' },
            { value: '2', label: '左の2倍' },
          ]}
          value={amount}
          onChange={setAmount}
        />
      }
      caption="熱をよく通す薄い金属の板で仕切った模式図です（外へ逃げる熱はないものとしています）。冷たい水を2倍にすると、そろった後の温度は50℃ではなく40℃になります。熱い水が失った分の熱を、2倍の量の水で分け合うからです。"
    >
      {(t) => {
        const tt = Math.min(t, tEnd)
        const now = temps(tt)
        const pts = (key: 'h' | 'c') => {
          let d = ''
          for (let s = 0; s <= tt + 1e-9; s += 0.1) d += `${s ? 'L' : 'M'}${gx(s).toFixed(1)},${gy(temps(s)[key]).toFixed(1)}`
          return d
        }
        const diff = now.h - now.c
        return (
          <Svg id="11-3" w={700} h={320} label={`80℃の水と20℃の水を金属の板で仕切って接すると、熱い水は冷え、冷たい水は温まり、やがて${tf}℃でそろう。下のグラフは2つの温度の変わり方。`}>
            <T x={140} y={22} anchor="middle" fs={12.5} bold>
              熱い水（初め80℃）
            </T>
            <T x={220 + rightW / 2} y={22} anchor="middle" fs={12.5} bold>
              {m === 1 ? '冷たい水（初め20℃）' : '冷たい水（初め20℃、2倍の量）'}
            </T>
            <rect x={60} y={40} width={160} height={110} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={220} y={40} width={rightW} height={110} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <line x1={220} y1={36} x2={220} y2={154} stroke="var(--fig-line)" strokeWidth={4} />
            <Column x={78} top={52} bottom={124} frac={now.h / 100} />
            <Column x={220 + rightW - 22} top={52} bottom={124} frac={now.c / 100} />
            <T x={150} y={98} anchor="middle" fs={18} bold>
              {`${now.h.toFixed(0)}℃`}
            </T>
            <T x={220 + rightW / 2} y={98} anchor="middle" fs={18} bold>
              {`${now.c.toFixed(0)}℃`}
            </T>
            {diff > 4 && (
              <>
                <Arrow x1={196} y1={130} x2={250} y2={130} accent />
                <T x={258} y={130} fs={12} tone="acc">
                  熱が移る
                </T>
              </>
            )}
            {/* グラフ */}
            <line x1={gx(0)} y1={gy(10)} x2={gx(tEnd) + 14} y2={gy(10)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(10)} x2={gx(0)} y2={gy(90)} stroke="var(--fig-line)" />
            <T x={gx(tEnd) + 20} y={gy(10)} fs={12}>
              時間
            </T>
            <T x={gx(0) - 8} y={gy(90) - 4} fs={12} anchor="end">
              温度
            </T>
            {[20, 80].map((c) => (
              <T key={c} x={gx(0) - 8} y={gy(c)} fs={11.5} anchor="end" tone="muted">
                {`${c}℃`}
              </T>
            ))}
            <line x1={gx(0)} y1={gy(tf)} x2={gx(tEnd)} y2={gy(tf)} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <T x={gx(tEnd) + 4} y={gy(tf) - 12} fs={12} tone="acc">
              {`${tf}℃でそろう`}
            </T>
            <path d={pts('h')} fill="none" stroke="var(--fig-line)" strokeWidth={2.5} />
            <path d={pts('c')} fill="none" stroke="var(--fig-line)" strokeWidth={2.5} strokeDasharray="7 4" />
            <T x={gx(0.9)} y={gy(80) - 2} fs={12}>
              熱い水（実線）
            </T>
            <T x={gx(0.9)} y={gy(20) + 4} fs={12}>
              冷たい水（破線）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図11-4 氷が溶ける間、温度は上がらない（動） ---------- */

export function FigIceMelt() {
  // 加えた熱の量（目安の単位）。氷を0℃まで温める 5、溶かす 80、水を40℃まで温める 40
  const H1 = 5
  const H2 = 85
  const HT = 125
  const dur = 10
  const temp = (h: number) => (h < H1 ? -10 + (h / H1) * 10 : h < H2 ? 0 : (h - H2) * 1)
  const gx = (h: number) => 290 + (h / HT) * 370
  const gy = (c: number) => 230 - (c + 10) * 3
  return (
    <Anim
      n="11-4"
      title="氷が溶けている間は、熱を受け取っても温度が上がらない"
      still={dur + 0.5}
      period={dur + 2.5}
      caption="同じ速さで熱を加え続けたときの模式図です。横の軸は加えた熱の量で、時間に比例します。氷を溶かすのに使う熱は同じ量の水を80℃近く温める熱に当たります。"
    >
      {(t) => {
        const h = (Math.min(t, dur) / dur) * HT
        const melted = h < H1 ? 0 : h < H2 ? (h - H1) / (H2 - H1) : 1
        const nIce = Math.round(9 * (1 - melted))
        const waterTop = 200 - 70 * melted
        let d = ''
        for (let s = 0; s <= h + 1e-9; s += 1) d += `${s ? 'L' : 'M'}${gx(s).toFixed(1)},${gy(temp(s)).toFixed(1)}`
        const ice = [
          [58, 172], [90, 172], [122, 172], [154, 172], [74, 146], [106, 146], [138, 146], [90, 120], [122, 120],
        ]
        return (
          <Svg id="11-4" w={700} h={290} label="氷を同じ速さで温め続けると、0℃になったところで温度が止まり、氷がすべて溶けるまで0℃のまま。溶けきった後は水の温度が上がっていく。">
            {/* ビーカー */}
            {melted > 0 && <rect x={52} y={waterTop} width={136} height={200 - waterTop} fill="var(--fig-box3)" />}
            {ice.slice(0, nIce).map(([x, y], i) => (
              <rect key={i} x={x} y={y} width={26} height={24} rx={3} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            ))}
            <path d="M50,70 L50,202 L190,202 L190,70" fill="none" stroke="var(--fig-line)" strokeWidth={2} />
            <T x={120} y={52} anchor="middle" fs={12.5}>
              {melted < 1 ? (melted > 0 ? '氷と水' : '氷') : '水'}
            </T>
            {/* 火 */}
            <path d="M100,250 Q108,222 120,214 Q132,222 140,250 Z" fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <rect x={80} y={250} width={80} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={120} y={278} anchor="middle" fs={12} tone="muted">
              同じ速さで熱を加える
            </T>
            {/* グラフ */}
            <line x1={gx(0)} y1={gy(-10)} x2={gx(HT) + 10} y2={gy(-10)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(-10)} x2={gx(0)} y2={gy(45)} stroke="var(--fig-line)" />
            <T x={gx(0) - 8} y={58} anchor="end" fs={12}>
              温度
            </T>
            <T x={gx(HT)} y={gy(-10) + 20} anchor="end" fs={12}>
              加えた熱の量（時間）
            </T>
            {[
              [40, '40℃'],
              [0, '0℃'],
              [-10, '−10℃'],
            ].map(([c, s]) => (
              <T key={s} x={gx(0) - 8} y={gy(c as number)} anchor="end" fs={11.5} tone="muted">
                {s}
              </T>
            ))}
            <line x1={gx(0)} y1={gy(0)} x2={gx(HT)} y2={gy(0)} stroke="var(--fig-muted)" strokeDasharray="3 4" />
            <path d={d} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            {h > 0 && <circle cx={gx(h)} cy={gy(temp(h))} r={5} fill="var(--fig-accent)" />}
            {h > 30 && (
              <>
                <T x={gx(45)} y={gy(0) - 34} anchor="middle" fs={12.5}>
                  氷が溶けている間
                </T>
                <T x={gx(45)} y={gy(0) - 16} anchor="middle" fs={12.5} tone="acc">
                  温度は0℃のまま
                </T>
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図11-5 熱素説による説明 ---------- */

function PanelFrame({ x, y, title, lines }: { x: number; y: number; title: string; lines: string[] }) {
  return (
    <g>
      <rect x={x} y={y} width={345} height={178} rx={6} fill="none" stroke="var(--fig-muted)" />
      <T x={x + 12} y={y + 16} bold fs={12.5}>
        {title}
      </T>
      {lines.map((l, i) => (
        <T key={i} x={x + 12} y={y + 142 + i * 17} fs={12}>
          {l}
        </T>
      ))}
    </g>
  )
}

const r5 = rng(11)
const SCATTER = Array.from({ length: 12 }, () => [r5(), r5()])

/** 箱の中に熱素の粒を n 個並べる */
function DotsIn({ x, y, w, h, n }: { x: number; y: number; w: number; h: number; n: number }) {
  return (
    <>
      {SCATTER.slice(0, n).map(([a, b], i) => (
        <Dot key={i} x={x + 8 + a * (w - 16)} y={y + 8 + b * (h - 16)} />
      ))}
    </>
  )
}

export function FigCaloric() {
  const lattice = (x0: number, y0: number, gap: number) =>
    [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => <Ball key={`${i}-${j}`} x={x0 + i * gap} y={y0 + j * gap} r={8} />))
  return (
    <Figure
      n="11-5"
      title="熱素説はいくつもの現象を一つの考えで説明した"
      caption="熱素説による説明を描いた模式図です。丸の小さな粒が熱素を表します。現在では、熱素という物質はないと分かっています（第12章）。"
    >
      <Svg id="11-5" w={720} h={410} label="熱素説による4つの説明。熱素は多い所から少ない所へ流れて温度がそろう。熱素はつくることも消すこともできないので混ぜても合計は変わらない。熱素は物の粒の間を押し広げるので温めると膨らむ。氷が溶けるときに入った熱素は水と結びついて温度を上げない。">
        <Cross x={20} y={16} s={6} />
        <T x={34} y={16} fs={12.5} tone="danger">
          熱素説の考え（のちに誤りと分かった）
        </T>
        {/* A 温度がそろう */}
        <PanelFrame x={10} y={36} title="温度がそろう" lines={['熱素は、多い所から少ない所へ流れる']} />
        <rect x={40} y={70} width={100} height={70} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={200} y={70} width={100} height={70} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <DotsIn x={40} y={70} w={100} h={70} n={10} />
        <DotsIn x={200} y={70} w={100} h={70} n={2} />
        <Arrow x1={146} y1={105} x2={194} y2={105} />
        <T x={90} y={160} anchor="middle" fs={11.5} tone="muted">
          熱い物
        </T>
        <T x={250} y={160} anchor="middle" fs={11.5} tone="muted">
          冷たい物
        </T>
        {/* B 合計は変わらない */}
        <PanelFrame x={370} y={36} title="混ぜても合計は変わらない" lines={['熱素は、つくることも消すこともできない']} />
        <rect x={392} y={80} width={56} height={56} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={456} y={80} width={56} height={56} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <DotsIn x={392} y={80} w={56} h={56} n={6} />
        <DotsIn x={456} y={80} w={56} h={56} n={2} />
        <Arrow x1={520} y1={108} x2={566} y2={108} />
        <rect x={574} y={72} width={112} height={68} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <DotsIn x={574} y={72} w={112} h={68} n={8} />
        <T x={452} y={160} anchor="middle" fs={11.5} tone="muted">
          6個と2個
        </T>
        <T x={630} y={160} anchor="middle" fs={11.5} tone="muted">
          混ぜた後も8個
        </T>
        {/* C 温めると膨らむ */}
        <PanelFrame x={10} y={222} title="温めると膨らむ" lines={['熱素の粒は互いに反発し、物の粒の間を', '押し広げる']} />
        {lattice(48, 262, 20)}
        <Arrow x1={112} y1={282} x2={162} y2={282} />
        <T x={137} y={266} anchor="middle" fs={11.5} tone="muted">
          温める
        </T>
        {lattice(196, 250, 36)}
        {[
          [214, 268], [250, 268], [214, 304], [250, 304], [196, 268], [268, 304],
        ].map(([x, y], i) => (
          <Dot key={i} x={x} y={y} />
        ))}
        {/* D 潜熱 */}
        <PanelFrame x={370} y={222} title="氷が溶けるときの熱" lines={['入った熱素は水と結びつき、', '温度計に現れない']} />
        <rect x={396} y={262} width={64} height={52} rx={4} fill="var(--fig-bg)" stroke="var(--fig-line)" />
        <T x={428} y={326} anchor="middle" fs={11.5} tone="muted">
          氷
        </T>
        {[0, 1, 2].map((i) => (
          <Dot key={i} x={478 + i * 14} y={288} />
        ))}
        <Arrow x1={520} y1={288} x2={560} y2={288} />
        <path d="M572,262 L672,262 L672,314 L572,314 Z" fill="var(--fig-box3)" stroke="var(--fig-line)" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={598 + i * 24} cy={288} r={6} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeDasharray="2 2" />
        ))}
        <T x={622} y={326} anchor="middle" fs={11.5} tone="muted">
          水（結びついた熱素）
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図11-6 ニューコメンの機関とワットの機関（動） ---------- */

const PER6 = 4
/** ピストンの高さ（シリンダーの中の位置 y）と段階 */
function engineState(t: number) {
  const s = t % PER6
  if (s < 1.6) return { y: 200 - 100 * ease(s / 1.6), phase: 'up' as const, s }
  if (s < 2.0) return { y: 100, phase: 'cond' as const, s }
  if (s < 3.6) return { y: 100 + 100 * ease((s - 2.0) / 1.6), phase: 'down' as const, s }
  return { y: 200, phase: 'rest' as const, s }
}

function Engine({ cx, watt, t }: { cx: number; watt: boolean; t: number }) {
  const st = engineState(t)
  // シリンダーの壁の冷え方（0 熱い 〜 1 冷えた）。ニューコメンだけが冷える
  const cool = watt ? 0 : st.phase === 'up' ? Math.max(0, 1 - st.s / 1.0) : st.phase === 'cond' ? (st.s - 1.6) / 0.4 : 1
  const steam = st.phase === 'up' ? 1 : st.phase === 'cond' ? 1 - (st.s - 1.6) / 0.4 : 0
  const top = 80
  const bot = 220
  const py = st.y
  const r = rng(7)
  const puffs = Array.from({ length: 10 }, () => [r(), r()])
  return (
    <g>
      {/* ボイラー */}
      <rect x={cx - 60} y={250} width={120} height={40} rx={14} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={cx} y={270} anchor="middle" fs={12}>
        ボイラー
      </T>
      <line x1={cx} y1={250} x2={cx} y2={bot} stroke="var(--fig-line)" strokeWidth={3} />
      {/* シリンダーの壁 */}
      {[cx - 44, cx + 36].map((x) => (
        <g key={x}>
          <rect x={x} y={top} width={8} height={bot - top} fill="var(--fig-box2)" stroke="var(--fig-line)" />
          <rect x={x} y={top} width={8} height={bot - top} fill="var(--fig-box3)" opacity={cool} />
        </g>
      ))}
      <rect x={cx - 44} y={bot} width={88} height={6} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      {watt && <rect x={cx - 44} y={top - 6} width={88} height={6} fill="var(--fig-box2)" stroke="var(--fig-line)" />}
      {/* 蒸気 */}
      {steam > 0 &&
        puffs.map(([a, b], i) => {
          const y = py + 14 + b * (bot - py - 22)
          return y < bot - 4 ? <circle key={i} cx={cx - 30 + a * 60} cy={y} r={5} fill="var(--fig-box)" stroke="var(--fig-muted)" opacity={steam} /> : null
        })}
      {/* ピストンと棒 */}
      <rect x={cx - 36} y={py} width={72} height={10} fill="var(--fig-muted)" stroke="var(--fig-line)" />
      <line x1={cx} y1={py} x2={cx} y2={40} stroke="var(--fig-line)" strokeWidth={3} />
      <T x={cx - 52} y={150} anchor="end" fs={12}>
        シリンダー
      </T>
      <T x={cx + 52} y={110} fs={12}>
        {cool > 0.5 ? '冷えている' : '熱い'}
      </T>
      {/* 押し下げる力 */}
      {st.phase === 'down' && <Force x1={cx + 18} y1={Math.max(py - 34, watt ? top + 2 : 0)} x2={cx + 18} y2={py - 4} />}
      {/* ニューコメン：冷水を吹き込む */}
      {!watt && st.phase === 'cond' && [0, 1, 2, 3, 4].map((i) => <line key={i} x1={cx - 20 + i * 10} y1={bot - 4} x2={cx - 24 + i * 12} y2={bot - 40} stroke="var(--fig-accent)" strokeDasharray="3 3" />)}
      {/* ワット：分離凝縮器 */}
      {watt && (
        <>
          <line x1={cx + 44} y1={bot - 6} x2={cx + 80} y2={bot - 6} stroke="var(--fig-line)" strokeWidth={3} />
          <rect x={cx + 80} y={180} width={84} height={60} rx={4} fill="var(--fig-box3)" stroke="var(--fig-line)" />
          <T x={cx + 122} y={204} anchor="middle" fs={12}>
            凝縮器
          </T>
          <T x={cx + 122} y={222} anchor="middle" fs={11.5} tone="muted">
            いつも冷たい
          </T>
          {st.phase === 'cond' &&
            [0, 1, 2].map((i) => {
              const u = ((st.s - 1.6) / 0.4 + i / 3) % 1
              return <circle key={i} cx={cx + 44 + u * 40} cy={bot - 6} r={4} fill="var(--fig-box)" stroke="var(--fig-muted)" />
            })}
        </>
      )}
    </g>
  )
}

export function FigEngines() {
  return (
    <Anim
      n="11-6"
      title="ワットは蒸気を水に戻す場所をシリンダーの外に移した"
      still={2.6}
      period={PER6}
      caption="模式図です。青の矢印はピストンを押し下げる力です。ニューコメンの機関では、冷水を吹き込むたびにシリンダーそのものが冷え、次に入る蒸気の一部が壁を温め直すのに使われます。ワットの機関では蒸気を別の凝縮器で水に戻すので、シリンダーは熱いままです。シリンダーの上側のつくりなど、凝縮器以外の違いは省いています。"
    >
      {(t) => {
        const st = engineState(t)
        const nLine = st.phase === 'up' && st.s < 1.2 ? ['入った蒸気の一部が、冷えた', 'シリンダーを温め直すのに使われる'] : ['冷水を吹き込むたびに、', 'シリンダーそのものも冷える']
        return (
          <Svg id="11-6" w={720} h={340} label="左はニューコメンの機関。蒸気をシリンダーの中で冷水によって水に戻すので、シリンダーが毎回冷える。右はワットの機関。蒸気を別の凝縮器で水に戻すので、シリンダーは熱いまま。">
            <T x={175} y={18} anchor="middle" bold fs={13}>
              ニューコメンの機関（1712年）
            </T>
            <T x={540} y={18} anchor="middle" bold fs={13}>
              ワットの機関（分離凝縮器）
            </T>
            <line x1={360} y1={8} x2={360} y2={334} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <Engine cx={175} watt={false} t={t} />
            <Engine cx={510} watt t={t} />
            <T x={175} y={308} anchor="middle" fs={12}>
              {nLine[0]}
            </T>
            <T x={175} y={326} anchor="middle" fs={12}>
              {nLine[1]}
            </T>
            <T x={540} y={308} anchor="middle" fs={12}>
              シリンダーは熱いまま。
            </T>
            <T x={540} y={326} anchor="middle" fs={12}>
              蒸気は凝縮器で水に戻る
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図11-7 水車と熱機関 ---------- */

export function FigWaterwheel() {
  return (
    <Figure
      n="11-7"
      title="カルノーは熱の動力を水車の動力と比べた"
      caption="カルノーの考えを描いた模式図です。カルノーは、温度の差を「熱素の落ちる高さ」と呼びました。熱素が減らないという右の図の考えは、のちに改められます（図11-10）。"
    >
      <Svg id="11-7" w={760} h={300} label="左は水車。高い所の水が落ちて水車を回し、低い所へ移る。動力は水の量と落ちる高さで決まる。右は熱機関。高温の物体の熱素が熱機関を通って低温の物体へ移る。動力は熱素の量と温度の差で決まる。">
        {/* 水車 */}
        <T x={185} y={16} anchor="middle" bold>
          水車
        </T>
        <rect x={30} y={40} width={130} height={40} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <T x={95} y={60} anchor="middle" fs={12}>
          高い所の水
        </T>
        <path d="M160,52 L190,52 L190,90" fill="none" stroke="var(--fig-line)" strokeWidth={2} />
        <Wheel x={190} y={140} r={42} a={0.3} />
        <path d="M195,96 L195,180" fill="none" stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="4 4" />
        <rect x={150} y={210} width={140} height={40} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <T x={220} y={230} anchor="middle" fs={12}>
          低い所の水
        </T>
        <Arrow x1={320} y1={60} x2={320} y2={228} both />
        <T x={330} y={136} fs={12}>
          落ちる
        </T>
        <T x={330} y={153} fs={12}>
          高さ
        </T>
        <T x={20} y={272} fs={12}>
          動力は、水の量と落ちる高さで決まる。
        </T>
        <T x={20} y={290} fs={12} tone="muted">
          水は水車を回しても減らない。
        </T>
        {/* 熱機関 */}
        <line x1={385} y1={10} x2={385} y2={292} stroke="var(--fig-muted)" strokeDasharray="4 4" />
        <T x={575} y={16} anchor="middle" bold>
          熱機関（カルノーの考え）
        </T>
        <rect x={420} y={40} width={250} height={40} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <T x={545} y={60} anchor="middle" fs={12}>
          高温の物体
        </T>
        <Box x={490} y={110} w={110} h={60} lines={['熱機関']} fill="box" />
        <rect x={420} y={210} width={250} height={40} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <T x={545} y={230} anchor="middle" fs={12}>
          低温の物体
        </T>
        {[86, 98, 192, 204].map((y, i) => (
          <Dot key={i} x={i % 2 ? 556 : 534} y={y} />
        ))}
        <Arrow x1={545} y1={82} x2={545} y2={108} />
        <Arrow x1={545} y1={172} x2={545} y2={208} />
        <T x={612} y={96} fs={11.5} tone="muted">
          熱素
        </T>
        <Arrow x1={710} y1={60} x2={710} y2={228} both />
        <T x={700} y={136} fs={12} anchor="end">
          温度
        </T>
        <T x={700} y={153} fs={12} anchor="end">
          の差
        </T>
        <T x={410} y={272} fs={12}>
          動力は、熱素の量と温度の差で決まる。
        </T>
        <T x={410} y={290} fs={12} tone="muted">
          熱素は動力を生んでも減らない。
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図11-8 カルノーの理想的な熱機関（動） ---------- */

const STEPS = [
  { a: '1. 高温Aに触れたまま膨らむ', b: '熱素がAから入る（温度は一定）', base: 'A', h0: 70, h1: 100, T0: 1, T1: 1 },
  { a: '2. 熱を通さずに、さらに膨らむ', b: '温度がBと同じまで下がる', base: 'I', h0: 100, h1: 140, T0: 1, T1: 0 },
  { a: '3. 低温Bに触れたまま縮める', b: '熱素がBへ出る（温度は一定）', base: 'B', h0: 140, h1: 105, T0: 0, T1: 0 },
  { a: '4. 熱を通さずに、さらに縮める', b: '温度がAと同じまで上がる', base: 'I', h0: 105, h1: 70, T0: 0, T1: 1 },
] as const

export function FigCarnotCycle() {
  const dur = 2
  return (
    <Anim
      n="11-8"
      title="カルノーの理想的な熱機関は、4つの段階を1回りとしてくり返す"
      still={1}
      period={dur * 4}
      caption="模式図です。シリンダーの下の台が、高温の物体A、熱を通さない台、低温の物体Bの順に入れ替わります。熱い気体はピストンを強く押すので、膨らむとき（1と2）に出す動力の方が、縮めるとき（3と4）に使う動力より大きくなります。"
    >
      {(t) => {
        const k = Math.min(3, Math.floor(t / dur))
        const u = ease((t - k * dur) / dur)
        const s = STEPS[k]
        const gasH = s.h0 + (s.h1 - s.h0) * u
        const warm = s.T0 + (s.T1 - s.T0) * u
        const bot = 230
        const py = bot - gasH - 10
        const expanding = k < 2
        const baseFill = s.base === 'A' ? 'var(--fig-box2)' : s.base === 'B' ? 'var(--fig-box3)' : 'var(--fig-bg)'
        const baseLabel = s.base === 'A' ? '高温の物体A' : s.base === 'B' ? '低温の物体B' : '熱を通さない台'
        const flow = (t - k * dur) / dur
        return (
          <Svg id="11-8" w={720} h={300} label="シリンダーに閉じ込めた気体を、高温の物体Aに触れさせて膨らませ、熱を通さずにさらに膨らませ、低温の物体Bに触れさせて縮め、熱を通さずにさらに縮める。1回りで熱素がAからBへ移り、動力が残る。">
            {/* 気体 */}
            <rect x={160} y={bot - gasH} width={100} height={gasH} fill="var(--fig-box3)" />
            <rect x={160} y={bot - gasH} width={100} height={gasH} fill="var(--fig-box2)" opacity={warm} />
            <T x={210} y={bot - gasH / 2} anchor="middle" fs={12}>
              {warm > 0.95 ? '気体（高温）' : warm < 0.05 ? '気体（低温）' : '気体'}
            </T>
            {/* シリンダー */}
            <path d={`M156,40 L156,${bot} L264,${bot} L264,40`} fill="none" stroke="var(--fig-line)" strokeWidth={3} />
            <rect x={160} y={py} width={100} height={10} fill="var(--fig-muted)" stroke="var(--fig-line)" />
            <line x1={210} y1={py} x2={210} y2={20} stroke="var(--fig-line)" strokeWidth={3} />
            {expanding ? <Force x1={238} y1={py - 4} x2={238} y2={py - 40} /> : <Force x1={238} y1={py - 44} x2={238} y2={py - 6} />}
            <T x={142} y={70} anchor="end" fs={12}>
              {expanding ? '気体がピストンを' : '外からピストンを'}
            </T>
            <T x={142} y={88} anchor="end" fs={12}>
              {expanding ? '押し上げ、動力を出す' : '押し下げ、動力を使う'}
            </T>
            {/* 台 */}
            <rect x={130} y={bot + 4} width={160} height={34} fill={baseFill} stroke="var(--fig-line)" strokeDasharray={s.base === 'I' ? '5 4' : undefined} />
            <T x={210} y={bot + 21} anchor="middle" fs={12}>
              {baseLabel}
            </T>
            {s.base === 'A' && [0, 1].map((i) => <Dot key={i} x={168 + i * 84} y={bot + 2 - ((flow + i * 0.5) % 1) * 40} />)}
            {s.base === 'B' && [0, 1].map((i) => <Dot key={i} x={168 + i * 84} y={bot - 38 + ((flow + i * 0.5) % 1) * 40} />)}
            {/* 段階の一覧 */}
            {STEPS.map((x, i) => (
              <Box key={i} x={400} y={14 + i * 68} w={300} h={58} lines={[x.a, x.b]} fs={12.5} subTone="muted" fill={i === k ? 'box4' : 'box'} accent={i === k} align="start" />
            ))}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図11-9 永久機関になるという議論 ---------- */

function Units({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * 16} y={y} width={12} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      ))}
    </>
  )
}

export function FigPerpetual() {
  return (
    <Figure
      n="11-9"
      title="カルノーの機関より多くの動力を出す機関があると、動力だけが余り続ける"
      caption="カルノーの議論を描いた模式図です。四角1つを動力の量の目安としています。機関Xを前向きに、カルノーの機関を逆向きに動かすと、熱素は元に戻るのに動力が余ります。カルノーは、このような永久機関はあり得ないとして、機関Xもあり得ないと結論しました。"
    >
      <Svg id="11-9" w={720} h={350} label="高温の物体Aと低温の物体Bの間で、より多くの動力を出すと仮定した機関Xを前向きに動かし、その動力の一部でカルノーの機関を逆向きに動かす。熱素はBからAへ戻るが、動力が1つ分余る。これはあり得ない。">
        <rect x={40} y={20} width={640} height={40} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <T x={360} y={40} anchor="middle" fs={12.5}>
          高温の物体A
        </T>
        <rect x={40} y={250} width={640} height={40} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <T x={360} y={270} anchor="middle" fs={12.5}>
          低温の物体B
        </T>
        {/* 機関X */}
        <Box x={90} y={115} w={170} h={60} lines={['機関X（前向き）', 'より多くの動力を出すと仮定']} fs={12} subTone="muted" />
        <Arrow x1={175} y1={62} x2={175} y2={113} />
        <Arrow x1={175} y1={177} x2={175} y2={248} />
        <T x={185} y={86} fs={11.5} tone="muted">
          熱素
        </T>
        <T x={185} y={212} fs={11.5} tone="muted">
          同じ量の熱素
        </T>
        {/* カルノーの機関（逆） */}
        <Box x={460} y={115} w={170} h={60} lines={['カルノーの機関', '（逆向きに動かす）']} fs={12} subTone="muted" />
        <Arrow x1={545} y1={248} x2={545} y2={177} />
        <Arrow x1={545} y1={113} x2={545} y2={62} />
        <T x={555} y={212} fs={11.5} tone="muted">
          熱素を運び上げる
        </T>
        <T x={555} y={86} fs={11.5} tone="muted">
          Aへ戻す
        </T>
        {/* 動力 */}
        <T x={270} y={110} fs={12}>
          動力
        </T>
        <Units x={304} y={104} n={3} />
        <Arrow x1={270} y1={138} x2={452} y2={138} />
        <T x={300} y={156} fs={11.5}>
          2つ分を渡す
        </T>
        <Units x={392} y={150} n={2} />
        <Arrow x1={300} y1={178} x2={300} y2={214} />
        <Units x={292} y={220} n={1} />
        <T x={314} y={226} fs={12} tone="danger">
          1つ分が余る
        </T>
        <Cross x={430} y={226} s={8} />
        <T x={40} y={312} fs={12}>
          熱素はBからAへ全部戻るのに、動力だけが余る。くり返せば、何も使わずに動力が生まれ続ける。
        </T>
        <T x={40} y={332} fs={12} tone="danger">
          カルノーは、このような機関（永久機関）はあり得ないとした。
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図11-10 カルノーの考えと今の理解（動・スライダー） ---------- */

const N_DOTS = 22
const r10 = rng(23)
const DOTS = Array.from({ length: N_DOTS }, (_, i) => ({ phase: i / N_DOTS, x: 192 + r10() * 56, pick: r10() }))

export function FigFlow() {
  const [view, setView] = useState<'carnot' | 'now'>('now')
  const [hot, setHot] = useState(100)
  const frac = 1 - 293 / (273 + hot) // 取り出せる仕事の上限の割合（今の理解）
  const now = view === 'now'
  return (
    <Anim
      n="11-10"
      title="熱機関は温度の高い物から低い物へ熱が移るときに仕事を取り出す"
      still={2}
      controls={
        <>
          <Choice
            label="見方"
            options={[
              { value: 'carnot', label: 'カルノーの考え（1824年）' },
              { value: 'now', label: '今の理解' },
            ]}
            value={view}
            onChange={setView}
          />
          <Range label="高温の物体の温度" min={60} max={300} step={20} value={hot} onChange={setHot} format={(v) => `${v}℃`} />
        </>
      }
      caption="模式図です。小さな丸は、カルノーの考えでは熱素、今の理解では熱の量を表します。「見方」を切り替えると、熱が低温の物体にすべて届くか、一部が仕事に変わるかが変わります。高温の物体の温度を上げると、取り出せる仕事の上限が大きくなります（棒の長さは目安）。"
    >
      {(t) => {
        const ang = t * (0.5 + frac * 6)
        return (
          <Svg id="11-10" w={700} h={330} label={now ? '今の理解では、高温の物体から受け取った熱の一部が仕事に変わり、残りが低温の物体へ移る。' : 'カルノーの考えでは、熱素は減らずにすべて低温の物体へ移り、そのあいだに動力が生まれる。'}>
            <rect x={30} y={20} width={330} height={50} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={40} y={45} fs={12}>
              {`高温の物体（${hot}℃）`}
            </T>
            <rect x={30} y={250} width={330} height={50} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={40} y={275} fs={12}>
              低温の物体（20℃）
            </T>
            <rect x={150} y={125} width={120} height={70} rx={6} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={142} y={160} anchor="end" fs={12}>
              熱機関
            </T>
            <line x1={270} y1={160} x2={388} y2={160} stroke="var(--fig-line)" strokeWidth={2} />
            <Wheel x={430} y={160} r={40} a={ang} />
            <T x={430} y={222} anchor="middle" fs={12}>
              {now ? '取り出す仕事' : '取り出す動力'}
            </T>
            {DOTS.map((d, i) => {
              const s = (t * 0.22 + d.phase) % 1
              const toWork = now && d.pick < frac
              let x = d.x
              let y: number
              let o = 1
              if (s < 0.4) y = 30 + (s / 0.4) * 130
              else if (toWork) {
                y = 160 + (d.x - 210) * 0.2
                x = d.x + ((s - 0.4) / 0.6) * (390 - d.x)
                o = Math.max(0, 1 - (s - 0.4) / 0.6)
              } else y = 160 + ((s - 0.4) / 0.6) * 128
              return <Dot key={i} x={x} y={y} o={o} />
            })}
            {/* 棒 */}
            <T x={500} y={40} fs={12}>
              {now ? '取り出せる仕事の上限' : '取り出せる動力'}
            </T>
            <rect x={500} y={54} width={180} height={16} fill="none" stroke="var(--fig-line)" />
            <rect x={500} y={54} width={Math.max(4, 180 * frac)} height={16} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <T x={500} y={88} fs={11.5} tone="muted">
              温度の差が大きいほど長い
            </T>
            {now && (
              <T x={500} y={106} fs={11.5} tone="muted">
                枠の全体が、受け取った熱の量
              </T>
            )}
            <T x={500} y={258} fs={12}>
              {now ? '熱の一部が仕事に変わり、' : '熱素は減らずに、'}
            </T>
            <T x={500} y={276} fs={12}>
              {now ? '残りが低温の物体へ移る' : 'すべて低温の物体へ届く'}
            </T>
            <T x={500} y={294} fs={11.5} tone="muted">
              {now ? '（第12章・第13章）' : '（のちに誤りと分かる）'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}
