import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice } from '../components/controls'
import { Ball, rng, wave } from './common'

/* ---------- 共通の部品 ---------- */

/** 陽子（＋の印つき）と中性子（印なし）の玉 */
function Nucleon({ x, y, r, proton }: { x: number; y: number; r: number; proton: boolean }) {
  return (
    <Ball x={x} y={y} r={r} fill={proton ? 'var(--fig-box2)' : 'var(--fig-box)'}>
      {proton && r >= 9 && (
        <text x={x} y={y + 0.5} fontSize={r * 1.15} textAnchor="middle" dominantBaseline="central">
          ＋
        </text>
      )}
    </Ball>
  )
}

/** γ線を表す短い波（縦向きにも置ける） */
function GammaBit({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <path d={wave(x - 9, y, 18, 3, 6)} fill="none" stroke="var(--fig-line)" strokeWidth={1.6} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} />
  )
}

/* ---------- 図27-1 放射線から中性子までの年表 ---------- */

const ROAD = [
  { y: '1896年', who: 'ベクレル', what: ['ウランから出る', '見えない放射線'] },
  { y: '1898年', who: 'キュリー夫妻', what: ['ポロニウムと', 'ラジウム'] },
  { y: '1899年', who: 'ラザフォード', what: ['α線とβ線を', '区別する'] },
  { y: '1900年', who: 'ヴィラール', what: ['曲がらない', '放射線（γ線）'] },
  { y: '1902年', who: 'ラザフォードら', what: ['元素が別の', '元素に変わる'] },
  { y: '1913年', who: 'ソディ', what: ['同位体と', '名づける'] },
  { y: '1919年', who: 'ラザフォード', what: ['窒素から', '陽子が飛び出す'] },
  { y: '1932年', who: 'チャドウィック', what: ['中性子の', '発見'] },
]

export function FigRoad() {
  return (
    <Figure n="27-1" title="放射線の発見から中性子の発見までの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。「ら」は共同研究者がいることを表します。">
      <Svg
        id="27-1"
        w={720}
        h={262}
        label="1896年にベクレルがウランから出る見えない放射線を見つけ、1898年にキュリー夫妻がポロニウムとラジウムを見つけた。1899年にラザフォードがα線とβ線を区別し、1900年にヴィラールが曲がらない放射線（γ線）を見つけた。1902年にラザフォードとソディが元素が別の元素に変わると結論し、1913年にソディが同位体と名づけた。1919年にラザフォードが窒素から陽子が飛び出すことを見つけ、1932年にチャドウィックが中性子を見つけた。"
      >
        <Arrow x1={14} y1={131} x2={710} y2={131} />
        {ROAD.map((r, i) => {
          const x = 58 + i * 86
          const up = i % 2 === 0
          const ty = up ? 22 : 160
          return (
            <g key={r.y}>
              <circle cx={x} cy={131} r={6} fill={i === 0 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 104 : 138} x2={x} y2={up ? 125 : 150} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold fs={12.5}>
                {r.y}
              </T>
              <T x={x} y={ty + 19} anchor="middle" fs={12}>
                {r.who}
              </T>
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + 37 + j * 17} anchor="middle" fs={11.5} tone="muted">
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

/* ---------- 図27-2 ベクレルの2つの実験 ---------- */

/** 十字の形（中心 cx, cy、幅44・高さ34） */
const crossPath = (cx: number, cy: number) => `M${cx - 22},${cy - 5} h14 v-12 h16 v12 h14 v10 h-14 v12 h-16 v-12 h-14 z`

/** 上から見た、黒い紙で包んだ乾板と、その上のウランの塩（と銅の十字） */
function PlatePack({ x, y, cross }: { x: number; y: number; cross: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={200} height={60} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={3} />
      <ellipse cx={x + 70} cy={y + 30} rx={36} ry={20} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <ellipse cx={x + 150} cy={y + 30} rx={30} ry={20} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      {cross && <path d={crossPath(x + 150, y + 30)} fill="var(--fig-box5)" stroke="var(--fig-line)" strokeDasharray="3 2" opacity={0.9} />}
    </g>
  )
}

/** 現像した乾板。黒く写った結晶の形と、少し薄く写った十字 */
function DevPlate({ x, y, cross }: { x: number; y: number; cross: boolean }) {
  return (
    <g>
      {/* 現像した乾板の色は、画面の明暗の設定によらず同じにする */}
      <rect x={x} y={y} width={200} height={60} rx={3} fill="#ecebe6" stroke="var(--fig-line)" />
      <ellipse cx={x + 70} cy={y + 30} rx={36} ry={20} fill="#2d3036" />
      <ellipse cx={x + 150} cy={y + 30} rx={30} ry={20} fill="#2d3036" />
      {cross && <path d={crossPath(x + 150, y + 30)} fill="#8b8f98" />}
    </g>
  )
}

export function FigBecquerel() {
  return (
    <Figure
      n="27-2"
      title="ベクレルの実験：日光に当てなくても、ウランの塩の形が写った"
      caption="1896年2月から3月の実験を上から見た模式図です。左は2月24日に報告した、日光に当てた実験です。右は日が差さないので引き出しにしまった実験で、3月1日に現像すると、結晶の形が濃く写りました。結晶と乾板の間に置いた薄い銅の十字のところは、銅に少しさえぎられて薄く写っています。大きさや形は実際と違います。"
    >
      <Svg id="27-2" w={720} h={322} label="左：黒い紙で包んだ写真の乾板の上にウランの塩の結晶を置き、日光に当てると、現像した乾板に結晶の形が黒く写った。右：同じように準備した物を暗い引き出しにしまっておき、3月1日に現像すると、結晶の形が濃く写り、銅の十字の形も見えた。">
        {/* 左：日光に当てた実験 */}
        <T x={175} y={20} anchor="middle" bold fs={13}>
          日光に当てた実験（2月24日に報告）
        </T>
        <circle cx={40} cy={58} r={14} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        {[20, 45, 70].map((d) => {
          const a = (d * Math.PI) / 180
          return <line key={d} x1={40 + 19 * Math.cos(a)} y1={58 + 19 * Math.sin(a)} x2={40 + 34 * Math.cos(a)} y2={58 + 34 * Math.sin(a)} stroke="var(--fig-muted)" strokeWidth={1.5} />
        })}
        <T x={62} y={44} fs={12} tone="muted">
          日光
        </T>
        <PlatePack x={75} y={88} cross={false} />
        <T x={175} y={166} anchor="middle" fs={12}>
          黒い紙で包んだ乾板の上に、ウランの塩の結晶
        </T>
        <Arrow x1={175} y1={178} x2={175} y2={204} />
        <T x={190} y={191} fs={12} tone="muted">
          現像する
        </T>
        <DevPlate x={75} y={212} cross={false} />
        <T x={175} y={290} anchor="middle" fs={12.5}>
          結晶の形が黒く写る
        </T>
        <T x={175} y={310} anchor="middle" fs={12} tone="muted">
          ベクレルは日光のはたらきだと考えた
        </T>

        <line x1={360} y1={30} x2={360} y2={312} stroke="var(--fig-muted)" strokeDasharray="4 4" />

        {/* 右：引き出しにしまった実験 */}
        <T x={545} y={20} anchor="middle" bold fs={13}>
          引き出しにしまった実験（3月1日に現像）
        </T>
        <rect x={420} y={36} width={250} height={122} rx={4} fill="var(--fig-box3)" opacity={0.5} stroke="var(--fig-line)" />
        <rect x={525} y={150} width={40} height={8} rx={3} fill="var(--fig-line)" />
        <T x={430} y={52} fs={12} tone="muted">
          暗い引き出しの中（2月26日〜3月1日）
        </T>
        <PlatePack x={445} y={70} cross={true} />
        <T x={545} y={176} anchor="middle" fs={12}>
          結晶と乾板の間に薄い銅の十字（点線）
        </T>
        <Arrow x1={545} y1={186} x2={545} y2={206} />
        <T x={560} y={196} fs={12} tone="muted">
          現像する
        </T>
        <DevPlate x={445} y={212} cross={true} />
        <T x={545} y={290} anchor="middle" fs={12.5} tone="acc">
          日光に当てなくても、濃く写った
        </T>
        <T x={545} y={310} anchor="middle" fs={12} tone="muted">
          十字のところは銅にさえぎられて少し薄い
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図27-3 キュリーの測り方と1898年の測定 ---------- */

const CURIE_DATA = [
  { name: '金属のウラン', v: 24, fill: 'var(--fig-box3)' },
  { name: 'トリウムの酸化物（厚い層）', v: 53, fill: 'var(--fig-box3)' },
  { name: 'ピッチブレンド（ドイツ産）', v: 83, fill: 'var(--fig-box2)' },
  { name: 'ピッチブレンド（ボヘミア産）', v: 67, fill: 'var(--fig-box2)' },
  { name: '天然の燐銅ウラン鉱', v: 52, fill: 'var(--fig-box2)' },
  { name: '薬品から作った燐銅ウラン鉱', v: 9, fill: 'var(--fig-box)' },
]

export function FigCurie() {
  const bx = 476
  const k = 2.6
  return (
    <Figure
      n="27-3"
      title="ウランの鉱石は、金属のウランより強い放射線を出していた"
      caption="左は測り方の模式図、右はマリー・キュリーが1898年の論文に載せた測定の一部です。電流が大きいほど、放射線が強いことを表します。ピッチブレンドと燐銅ウラン鉱はウランの鉱石で、薬品から作った燐銅ウラン鉱はウランの化合物と同じ程度の強さでした。"
    >
      <Svg id="27-3" w={720} h={290} label="左：2枚の金属の板の一方に調べる物を広げ、板の間に100ボルトの電圧をかけて、放射線が空気を通して流す弱い電流を測る。右：流れた電流は、金属のウランが24、トリウムの酸化物の厚い層が53、ドイツ産のピッチブレンドが83、ボヘミア産が67、天然の燐銅ウラン鉱が52、薬品から作った燐銅ウラン鉱が9（単位は1兆分の1アンペア）。">
        <T x={130} y={20} anchor="middle" bold fs={13}>
          測り方
        </T>
        <rect x={50} y={70} width={160} height={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <rect x={50} y={170} width={160} height={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <rect x={56} y={162} width={148} height={8} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        {[
          [80, 120],
          [110, 140],
          [140, 104],
          [170, 130],
          [95, 95],
          [158, 150],
        ].map(([x, y], i) => (
          <text key={i} x={x} y={y} fontSize={13} textAnchor="middle" dominantBaseline="central" className="muted">
            {i % 2 ? '−' : '＋'}
          </text>
        ))}
        <T x={130} y={198} anchor="middle" fs={12}>
          調べる物の粉
        </T>
        <T x={130} y={216} anchor="middle" fs={12} tone="muted">
          放射線が当たった空気は
        </T>
        <T x={130} y={233} anchor="middle" fs={12} tone="muted">
          電気を通すようになる
        </T>
        <path d="M210,74 H248 V103" fill="none" stroke="var(--fig-line)" />
        <path d="M210,174 H248 V147" fill="none" stroke="var(--fig-line)" />
        <circle cx={248} cy={125} r={22} fill="var(--fig-bg)" stroke="var(--fig-line)" />
        <T x={248} y={125} anchor="middle" fs={11.5}>
          電流計
        </T>
        <T x={20} y={46} fs={12} tone="muted">
          金属の板（間に100ボルトの電圧）
        </T>

        <line x1={284} y1={30} x2={284} y2={270} stroke="var(--fig-muted)" strokeDasharray="4 4" />

        <T x={bx} y={20} bold fs={13}>
          流れた電流（1兆分の1アンペア）
        </T>
        {CURIE_DATA.map((d, i) => {
          const y = 56 + i * 38
          return (
            <g key={d.name}>
              <T x={bx - 8} y={y} anchor="end" fs={12}>
                {d.name}
              </T>
              <rect x={bx} y={y - 11} width={d.v * k} height={22} fill={d.fill} stroke="var(--fig-line)" />
              <T x={bx + d.v * k + 6} y={y} fs={12}>
                {String(d.v)}
              </T>
            </g>
          )
        })}
        <line x1={bx + 24 * k} y1={40} x2={bx + 24 * k} y2={268} stroke="var(--fig-muted)" strokeDasharray="3 3" />
        <T x={bx + 24 * k + 4} y={276} fs={11.5} tone="muted">
          金属のウランの値
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図27-4 ラザフォードのアルミニウム箔の測定（1899年） ---------- */

const FOIL = [
  [0, 182],
  [1, 77],
  [2, 33],
  [3, 14.6],
  [4, 9.4],
  [12, 7],
] as const

export function FigFoil() {
  const gx = (n: number) => 90 + n * 44
  const gy = (v: number) => 236 - v * 0.95
  const pts = FOIL.map(([n, v]) => [gx(n), gy(v)] as const)
  return (
    <Figure
      n="27-4"
      title="アルミニウム箔を重ねると、放射線は初めに急に弱まり、その後はほとんど弱まらない"
      caption="ラザフォードが1899年1月の論文に載せた、ウランの酸化物の測定値です。放射線が強いほど、空気に電気が流れて、測定器にためた電気が速く逃げます。点は測った値で、4枚と12枚の間は測っていないので点線でつないでいます。"
    >
      <Svg id="27-4" w={720} h={290} label="アルミニウム箔の枚数を0枚、1枚、2枚、3枚、4枚、12枚と増やしたとき、電気が逃げる速さは182、77、33、14.6、9.4、7と変わった。最初の4枚で急に弱まり、その後はほとんど弱まらない。">
        <line x1={gx(0)} y1={gy(0)} x2={gx(12) + 20} y2={gy(0)} stroke="var(--fig-line)" />
        <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(200)} stroke="var(--fig-line)" />
        <T x={gx(0) - 6} y={gy(200) - 12} fs={12} tone="muted">
          電気が逃げる速さ（1分間に測定器の針が動いた目盛りの数）
        </T>
        {[0, 50, 100, 150].map((v) => (
          <g key={v}>
            <line x1={gx(0) - 5} y1={gy(v)} x2={gx(0)} y2={gy(v)} stroke="var(--fig-line)" />
            <T x={gx(0) - 9} y={gy(v)} anchor="end" fs={11.5} tone="muted">
              {String(v)}
            </T>
          </g>
        ))}
        {Array.from({ length: 13 }, (_, n) => (
          <g key={n}>
            <line x1={gx(n)} y1={gy(0)} x2={gx(n)} y2={gy(0) + 5} stroke="var(--fig-line)" />
            <T x={gx(n)} y={gy(0) + 15} anchor="middle" fs={11.5} tone="muted">
              {String(n)}
            </T>
          </g>
        ))}
        <T x={gx(6)} y={gy(0) + 36} anchor="middle" fs={12}>
          重ねたアルミニウム箔の枚数（1枚の厚さは200分の1mm）
        </T>
        <path d={`M${pts.slice(0, 5).map(([x, y]) => `${x},${y}`).join(' L')}`} fill="none" stroke="var(--fig-line)" strokeWidth={1.8} />
        <line x1={pts[4][0]} y1={pts[4][1]} x2={pts[5][0]} y2={pts[5][1]} stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="4 4" />
        {FOIL.map(([n, v], i) => (
          <g key={n}>
            <circle cx={pts[i][0]} cy={pts[i][1]} r={4.5} fill="var(--fig-accent)" />
            <T x={pts[i][0] + 8} y={pts[i][1] - 11} fs={11.5}>
              {String(v)}
            </T>
          </g>
        ))}
        <T x={gx(2) + 30} y={gy(130)} fs={12.5}>
          最初の数枚で急に弱まる
        </T>
        <T x={gx(2) + 30} y={gy(130) + 19} fs={12} tone="acc">
          吸収されやすい放射線（α線）が止まる
        </T>
        <T x={gx(6)} y={gy(60)} fs={12.5}>
          その後はほとんど弱まらない
        </T>
        <T x={gx(6)} y={gy(60) + 19} fs={12} tone="acc">
          通り抜けやすい放射線（β線）が残る
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図27-5 磁場の中で曲がり方が違う（動） ---------- */

const SRC = { x: 360, y: 262 }

/** 曲がる道筋の上の点。R は曲がる半径（符号で左右）、s は 0〜1 */
function arcPoint(R: number, th: number, s: number) {
  if (R === 0) return { x: SRC.x, y: SRC.y - 210 * s }
  const a = th * s
  const cx = SRC.x + R
  return { x: cx - R * Math.cos(a), y: SRC.y - Math.abs(R) * Math.sin(a) }
}

const PATHS = [
  { kind: 'a', R: -520, th: 0.43 },
  { kind: 'g', R: 0, th: 0 },
  { kind: 'b', R: 150, th: 1.2 },
  { kind: 'b', R: 190, th: 1.05 },
  { kind: 'b', R: 240, th: 0.92 },
] as const

export function FigMagnet() {
  const life = 1.6
  const gap = 0.4
  return (
    <Anim
      n="27-5"
      title="磁場の中を通すと、α線とβ線は逆向きに曲がり、γ線は曲がらない"
      still={1.1}
      period={4}
      caption="模式図です。ラジウムを入れた鉛の箱の穴から、放射線が上へ出ていきます。箱のまわりには紙面に垂直な向きの磁場（磁石の極の間）があります。正の電気を持つα線と負の電気を持つβ線は逆向きに曲がり、電気を持たないγ線はまっすぐ進みます。β線の粒は速さがそろっていないので、曲がり方が広がります。α線の曲がり方は、実際にはこの図よりずっと小さいものです。"
    >
      {(t) => (
        <Svg id="27-5" w={720} h={300} label="鉛の箱から上へ出た放射線が磁場の中を通る。α線は左へわずかに曲がり、β線は右へ大きく曲がり、γ線はまっすぐ進む。">
          <rect x={110} y={44} width={500} height={196} rx={6} fill="var(--fig-box3)" opacity={0.35} stroke="var(--fig-muted)" strokeDasharray="5 4" />
          <T x={120} y={232} fs={12} tone="muted">
            磁場の中（紙面に垂直な向き）
          </T>
          {PATHS.map((p, i) => {
            const pts = Array.from({ length: 31 }, (_, j) => arcPoint(p.R, p.th, j / 30))
            return <path key={i} d={pts.map((q, j) => `${j ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')} fill="none" stroke="var(--fig-muted)" strokeWidth={1.2} strokeDasharray="3 4" />
          })}
          {PATHS.map((p, i) => {
            const items = []
            for (let k = Math.floor((t - life) / gap); k <= Math.floor(t / gap); k++) {
              const age = t - (k * gap + i * 0.07)
              if (age < 0 || age > life) continue
              const q = arcPoint(p.R, p.th, age / life)
              if (p.kind === 'a') items.push(<Ball key={k} x={q.x} y={q.y} r={5.5} fill="var(--fig-box2)" />)
              else if (p.kind === 'b') items.push(<Ball key={k} x={q.x} y={q.y} r={3.2} fill="var(--fig-box3)" />)
              else items.push(<GammaBit key={k} x={q.x} y={q.y} rot={90} />)
            }
            return <g key={i}>{items}</g>
          })}
          <rect x={SRC.x - 32} y={SRC.y} width={64} height={30} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={1.5} />
          <rect x={SRC.x - 4} y={SRC.y} width={8} height={18} fill="var(--fig-bg)" stroke="var(--fig-line)" />
          <circle cx={SRC.x} cy={SRC.y + 20} r={4} fill="var(--fig-accent)" />
          <T x={SRC.x + 44} y={SRC.y + 16} fs={12}>
            ラジウムを入れた鉛の箱
          </T>
          <T x={150} y={100} fs={12.5}>
            α線（正の電気）
          </T>
          <T x={150} y={119} fs={12} tone="muted">
            わずかに左へ曲がる
          </T>
          <T x={372} y={30} fs={12.5}>
            γ線（電気を持たない）：曲がらない
          </T>
          <T x={474} y={156} fs={12.5}>
            β線（負の電気）
          </T>
          <T x={474} y={175} fs={12} tone="muted">
            大きく右へ曲がる
          </T>
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図27-6 通り抜けやすさの違い（動） ---------- */

const LANES = [
  { name: 'α線', y: 84, stop: 226 },
  { name: 'β線', y: 146, stop: 392 },
  { name: 'γ線', y: 208, stop: 0 },
] as const

export function FigPenetrate() {
  const speed = 190
  const gap = 0.5
  const life = 3.6
  return (
    <Anim
      n="27-6"
      title="α線は紙で、β線はアルミニウムの板で止まり、γ線は鉛の厚い板でも一部が通り抜ける"
      still={2.3}
      period={6}
      caption="模式図です。α線は紙1枚で止まります。β線は紙を通り抜け、厚さ数mmのアルミニウムの板で止まります。γ線は紙もアルミニウムの板も通り抜け、鉛や鉄の厚い板で弱められますが、一部は通り抜けます。"
    >
      {(t) => (
        <Svg id="27-6" w={720} h={250} label="左の線源から出たα線、β線、γ線が、紙、アルミニウムの板、鉛の厚い板に向かって進む。α線は紙で止まり、β線はアルミニウムの板で止まり、γ線は鉛の板で多くが止まるが一部は通り抜ける。">
          <rect x={226} y={50} width={5} height={190} fill="var(--fig-bg)" stroke="var(--fig-line)" />
          <rect x={386} y={50} width={14} height={190} fill="var(--fig-box)" stroke="var(--fig-line)" />
          <rect x={556} y={50} width={44} height={190} fill="var(--fig-box5)" stroke="var(--fig-line)" />
          <T x={228} y={30} anchor="middle" fs={12.5}>
            紙1枚
          </T>
          <T x={393} y={30} anchor="middle" fs={12.5}>
            アルミニウムの板（数mm）
          </T>
          <T x={578} y={30} anchor="middle" fs={12.5}>
            鉛の厚い板
          </T>
          {LANES.map((l, li) => {
            const items = []
            for (let k = Math.floor((t - life) / gap); k <= Math.floor(t / gap); k++) {
              const age = t - k * gap - li * 0.13
              if (age < 0 || age > life) continue
              const x = 66 + age * speed
              const passLead = ((k % 3) + 3) % 3 === 0
              const stopAt = l.stop || (passLead ? 9999 : 566 + (((k % 4) + 4) % 4) * 8)
              if (x > stopAt || x > 712) continue
              if (l.name === 'α線') items.push(<Ball key={k} x={x} y={l.y} r={6} fill="var(--fig-box2)" />)
              else if (l.name === 'β線') items.push(<Ball key={k} x={x} y={l.y} r={3.5} fill="var(--fig-box3)" />)
              else items.push(<GammaBit key={k} x={x} y={l.y} />)
            }
            return (
              <g key={l.name}>
                <line x1={66} y1={l.y} x2={l.stop || 704} y2={l.y} stroke="var(--fig-muted)" strokeWidth={0.8} strokeDasharray="2 5" />
                <T x={12} y={l.y} fs={13} bold>
                  {l.name}
                </T>
                <rect x={44} y={l.y - 10} width={18} height={20} fill="var(--fig-box)" stroke="var(--fig-line)" />
                {items}
              </g>
            )
          })}
          <T x={634} y={84} fs={12} tone="muted">
            届かない
          </T>
          <T x={634} y={146} fs={12} tone="muted">
            届かない
          </T>
        </Svg>
      )}
    </Anim>
  )
}

/* ---------- 図27-7 ウラン238が鉛206になるまで（動） ---------- */

const ELEMS: Record<number, string> = {
  82: '鉛',
  83: 'ビスマス',
  84: 'ポロニウム',
  85: 'アスタチン',
  86: 'ラドン',
  87: 'フランシウム',
  88: 'ラジウム',
  89: 'アクチニウム',
  90: 'トリウム',
  91: 'プロトアクチニウム',
  92: 'ウラン',
}

/** 主な道筋。z は原子番号、a は名前の後の数、hl は半減期（IAEA の値を丸めたもの） */
const CHAIN = [
  { z: 92, a: 238, hl: '約45億年' },
  { z: 90, a: 234, hl: '約24日' },
  { z: 91, a: 234, hl: '約1分' },
  { z: 92, a: 234, hl: '約25万年' },
  { z: 90, a: 230, hl: '約7万6000年' },
  { z: 88, a: 226, hl: '約1600年' },
  { z: 86, a: 222, hl: '約3.8日' },
  { z: 84, a: 218, hl: '約3分' },
  { z: 82, a: 214, hl: '約27分' },
  { z: 83, a: 214, hl: '約20分' },
  { z: 84, a: 214, hl: '1万分の1.6秒' },
  { z: 82, a: 210, hl: '約22年' },
  { z: 83, a: 210, hl: '約5日' },
  { z: 84, a: 210, hl: '約138日' },
  { z: 82, a: 206, hl: '' },
]

const STEP = 1.1

export function FigChain() {
  const cx = (z: number) => 76 + (z - 82) * 57
  const cy = (a: number) => 92 + ((238 - a) / 4) * 34
  const end = (CHAIN.length - 1) * STEP
  return (
    <Anim
      n="27-7"
      title="ウラン238は、α線とβ線を出しながら別の元素に変わり、鉛206で止まる"
      still={end + 0.5}
      period={end + 3.5}
      caption="主な道筋だけを描いた模式図です。横は原子番号（周期表の順番）、丸の中の数は名前の後の数（原子の重さが水素の原子の約何倍かを表す数）で、下ほど軽くなります。斜めの矢印はα線を出す崩壊、点線の横の矢印はβ線を出す崩壊です。半減期は国際原子力機関（IAEA）の値を丸めたものです。"
    >
      {(t) => {
        const cur = Math.min(CHAIN.length - 1, Math.floor(Math.max(0, t) / STEP))
        const c = CHAIN[cur]
        const next = CHAIN[cur + 1]
        const isAlpha = next && next.z < c.z
        return (
          <Svg id="27-7" w={720} h={482} label="ウラン238がα線を出してトリウム234に、β線を出してプロトアクチニウム234に、と変わっていき、α線を8回、β線を6回出して鉛206になる。α線を出すと原子番号が2減り、名前の後の数が4減る。β線を出すと原子番号が1増え、名前の後の数は変わらない。">
            {Object.entries(ELEMS).map(([zs, name]) => {
              const z = Number(zs)
              return (
                <g key={z}>
                  <T x={cx(z)} y={z % 2 ? 36 : 18} anchor="middle" fs={11.5}>
                    {name}
                  </T>
                  <T x={cx(z)} y={56} anchor="middle" fs={11.5} tone="muted">
                    {zs}
                  </T>
                </g>
              )
            })}
            <T x={10} y={56} fs={11.5} tone="muted">
              原子番号
            </T>
            {CHAIN.slice(0, cur).map((p, i) => {
              const q = CHAIN[i + 1]
              const x1 = cx(p.z)
              const y1 = cy(p.a)
              const x2 = cx(q.z)
              const y2 = cy(q.a)
              const L = Math.hypot(x2 - x1, y2 - y1)
              const ux = (x2 - x1) / L
              const uy = (y2 - y1) / L
              return <Arrow key={i} x1={x1 + ux * 14} y1={y1 + uy * 14} x2={x2 - ux * 15} y2={y2 - uy * 15} dashed={q.z > p.z} />
            })}
            {CHAIN.slice(0, cur + 1).map((p, i) => (
              <g key={i}>
                <circle cx={cx(p.z)} cy={cy(p.a)} r={13} fill={i === CHAIN.length - 1 ? 'var(--fig-box4)' : 'var(--fig-box3)'} stroke={i === cur ? 'var(--fig-accent)' : 'var(--fig-line)'} strokeWidth={i === cur ? 3 : 1.2} />
                <T x={cx(p.z)} y={cy(p.a)} anchor="middle" fs={11.5}>
                  {String(p.a)}
                </T>
              </g>
            ))}
            <line x1={14} y1={392} x2={706} y2={392} stroke="var(--fig-muted)" />
            {next ? (
              <>
                <T x={14} y={412} fs={12.5} bold>
                  {`いま：${ELEMS[c.z]}${c.a}（半減期 ${c.hl}）`}
                </T>
                <T x={14} y={434} fs={12.5} tone="acc">
                  {`次に${isAlpha ? 'α線' : 'β線'}を出して、${ELEMS[next.z]}${next.a}に変わる`}
                </T>
              </>
            ) : (
              <>
                <T x={14} y={412} fs={12.5} bold>
                  鉛206は崩壊しない（安定）
                </T>
                <T x={14} y={434} fs={12.5} tone="acc">
                  ウラン238から、α線を8回、β線を6回出した
                </T>
              </>
            )}
            <T x={400} y={412} fs={12}>
              斜めの矢印：α線を出す
            </T>
            <T x={400} y={431} fs={11.5} tone="muted">
              原子番号が2減り、名前の後の数が4減る
            </T>
            <T x={400} y={452} fs={12}>
              点線の横の矢印：β線を出す
            </T>
            <T x={400} y={471} fs={11.5} tone="muted">
              原子番号が1増え、名前の後の数は同じ
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図27-8 原子核はばらばらの時刻に崩壊し、全体は半分ずつ減る（動・切り替え） ---------- */

const HL = 2 // 図の中の半減期（秒）
const T_END = 5 * HL

/** n 個の原子核が崩壊する時刻（決まった種の乱数で作る）。種は、数による違いが見やすい並びになるものを選んだ */
function decayTimes(n: number, seed: number): number[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => (-HL / Math.LN2) * Math.log(1 - r()))
}

const TIMES: Record<string, number[]> = { '16': decayTimes(16, 272), '100': decayTimes(100, 107), '400': decayTimes(400, 118) }

export function FigHalfLife() {
  const [count, setCount] = useState<'16' | '100' | '400'>('100')
  const times = TIMES[count]
  const n = times.length
  const side = Math.round(Math.sqrt(n))
  const cell = 260 / side
  const sorted = [...times].sort((a, b) => a - b)
  const gx = (s: number) => 380 + (s / T_END) * 320
  const gy = (v: number) => 262 - (v / n) * 200
  return (
    <Anim
      n="27-8"
      title="一つ一つの原子核はばらばらの時刻に崩壊し、全体としては半減期ごとに半分になる"
      still={4.3}
      period={T_END + 2}
      controls={
        <Choice
          label="原子核の数"
          options={[
            { value: '16', label: '16個' },
            { value: '100', label: '100個' },
            { value: '400', label: '400個' },
          ]}
          value={count}
          onChange={setCount}
        />
      }
      caption="模式図です。それぞれの原子核が崩壊する時刻は乱数で決めていて、どの原子核が先に崩壊するかは予測できません。右のグラフの青の線は残っている原子核の数、点線は半減期ごとにちょうど半分になる線です。「原子核の数」を16個にすると青の線は点線から大きくずれ、400個にすると点線にほぼ重なります。"
    >
      {(t) => {
        const tt = Math.min(t, T_END)
        const left = times.filter((d) => d > tt).length
        let step = `M${gx(0)},${gy(n)}`
        let v = n
        for (const d of sorted) {
          if (d > tt) break
          step += ` H${gx(d).toFixed(1)} V${gy(v - 1).toFixed(1)}`
          v--
        }
        step += ` H${gx(tt).toFixed(1)}`
        const ideal = Array.from({ length: 81 }, (_, i) => {
          const s = (i / 80) * T_END
          return `${i ? 'L' : 'M'}${gx(s).toFixed(1)},${gy(n * Math.pow(0.5, s / HL)).toFixed(1)}`
        }).join(' ')
        return (
          <Svg id="27-8" w={720} h={330} label="左に並んだ原子核が、ばらばらの時刻に崩壊していく。右のグラフでは、残っている原子核の数が、半減期がたつごとにほぼ半分になる。原子核の数が少ないと、半分からのずれが大きい。">
            {times.map((d, i) => {
              const x = 30 + (i % side) * cell + cell / 2
              const y = 34 + Math.floor(i / side) * cell + cell / 2
              const r = cell * 0.36
              const alive = d > tt
              const flash = !alive && tt - d < 0.3
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={r} fill={alive ? 'var(--fig-box2)' : 'var(--fig-bg)'} stroke={alive ? 'var(--fig-line)' : 'var(--fig-muted)'} strokeWidth={alive ? 1.2 : 0.8} />
                  {flash && <circle cx={x} cy={y} r={r * 1.7} fill="none" stroke="var(--fig-accent)" strokeWidth={1.5} />}
                </g>
              )
            })}
            <circle cx={40} cy={314} r={6} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={52} y={314} fs={12}>
              まだ崩壊していない
            </T>
            <circle cx={180} cy={314} r={6} fill="var(--fig-bg)" stroke="var(--fig-muted)" />
            <T x={192} y={314} fs={12}>
              崩壊した
            </T>

            <line x1={gx(0)} y1={gy(0)} x2={gx(T_END) + 8} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(n) - 10} stroke="var(--fig-line)" />
            {[1, 2, 3, 4, 5].map((k) => (
              <g key={k}>
                <line x1={gx(k * HL)} y1={gy(0)} x2={gx(k * HL)} y2={gy(0) + 5} stroke="var(--fig-line)" />
                <line x1={gx(k * HL)} y1={gy(0)} x2={gx(k * HL)} y2={gy(n)} stroke="var(--fig-muted)" strokeWidth={0.6} strokeDasharray="2 5" />
                <T x={gx(k * HL)} y={gy(0) + 16} anchor="middle" fs={11.5} tone="muted">
                  {String(k)}
                </T>
              </g>
            ))}
            <T x={gx(T_END / 2)} y={gy(0) + 36} anchor="middle" fs={12}>
              たった時間（半減期の何倍か）
            </T>
            {[
              [1, '最初の数'],
              [0.5, '半分'],
              [0.25, '4分の1'],
              [0.125, '8分の1'],
            ].map(([f, s]) => (
              <T key={String(s)} x={gx(0) - 8} y={gy(n * Number(f))} anchor="end" fs={11.5} tone="muted">
                {String(s)}
              </T>
            ))}
            <path d={ideal} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} strokeDasharray="5 4" />
            <path d={step} fill="none" stroke="var(--fig-accent)" strokeWidth={2.2} />
            <circle cx={gx(tt)} cy={gy(left)} r={4.5} fill="var(--fig-accent)" />
            <T x={gx(0) + 10} y={22} fs={12.5}>
              {`最初の数 ${n}個　いま残っている数 ${left}個`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図27-9 1919年と1925年に分かったこと（動） ---------- */

export function FigNitrogen() {
  const gap = 0.44
  const life = 1.2
  const r = rng(1919)
  const hitX = Array.from({ length: 10 }, () => 90 + r() * 60)
  return (
    <Anim
      n="27-9"
      title="1919年には陽子が飛び出すことが、1925年には窒素が酸素に変わることが分かった"
      still={3.6}
      period={4.4}
      caption="模式図です。左は1919年のラザフォードの実験で、α粒子が届く距離より遠くに置いた幕が光り、窒素の中から遠くまで飛ぶ粒（水素の原子核）が出てくることが分かりました。右は1925年に発表されたブラケットの霧箱の写真で見えた跡で、α粒子の跡が途中で終わり、細く長い陽子の跡と、太く短い酸素の原子核の跡の2本だけが出ています。"
    >
      {(t) => {
        const items = []
        for (let k = Math.floor((t - 2.4) / gap); k <= Math.floor(t / gap); k++) {
          const age = t - k * gap
          if (age < 0) continue
          const kk = ((k % 10) + 10) % 10
          const hit = kk % 5 === 1
          const ax = 52 + age * 110
          const stop = hit ? hitX[kk] : 186
          const y = 100 + ((kk * 37) % 70)
          if (age <= life && ax < stop) items.push(<Ball key={`a${k}`} x={ax} y={y} r={5} fill="var(--fig-box2)" />)
          if (hit) {
            const t0 = (stop - 52) / 110
            const pa = age - t0
            const px = stop + pa * 220
            if (pa > 0 && px < 318) items.push(<Ball key={`p${k}`} x={px} y={y} r={3} fill="var(--fig-box3)" />)
            if (pa > 0 && px >= 318 && px < 318 + 0.35 * 220) items.push(<circle key={`f${k}`} cx={322} cy={y} r={7} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />)
          }
        }
        const g1 = Math.min(1, Math.max(0, t / 1.4))
        const g2 = Math.min(1, Math.max(0, (t - 1.5) / 0.9))
        const fork = { x: 560, y: 140 }
        const a0 = { x: 392, y: 160 }
        return (
          <Svg id="27-9" w={720} h={300} label="左：窒素の気体の中を進むα粒子の大部分はα粒子が届く距離で止まるが、ときどき遠くまで飛ぶ粒が出て、遠くの幕を光らせる。右：霧箱の写真では、α粒子の跡が途中で終わり、そこから細く長い陽子の跡と、太く短い酸素の原子核の跡の2本だけが出ている。">
            <T x={175} y={20} anchor="middle" bold fs={13}>
              1919年 ラザフォードの実験
            </T>
            <rect x={22} y={84} width={310} height={104} rx={4} fill="var(--fig-box)" opacity={0.6} stroke="var(--fig-line)" />
            <T x={28} y={72} fs={12} tone="muted">
              窒素の気体
            </T>
            <rect x={30} y={120} width={14} height={30} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <line x1={186} y1={86} x2={186} y2={186} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <T x={186} y={206} anchor="middle" fs={12} tone="muted">
              α粒子が届く距離
            </T>
            <rect x={316} y={88} width={6} height={96} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={240} y={72} fs={12}>
              光る幕
            </T>
            {items}
            <T x={175} y={238} anchor="middle" fs={12.5}>
              幕が光る：遠くまで飛ぶ粒（水素の原子核）
            </T>
            <T x={175} y={260} anchor="middle" fs={12} tone="acc">
              窒素の原子核から陽子が飛び出した
            </T>
            <T x={175} y={281} anchor="middle" fs={11.5} tone="muted">
              （窒素が何に変わったかは分からなかった）
            </T>

            <line x1={360} y1={30} x2={360} y2={290} stroke="var(--fig-muted)" strokeDasharray="4 4" />

            <T x={545} y={20} anchor="middle" bold fs={13}>
              1925年 ブラケットの霧箱の写真
            </T>
            <rect x={380} y={44} width={326} height={172} rx={4} fill="var(--fig-box)" opacity={0.6} stroke="var(--fig-line)" />
            <line x1={392} y1={190} x2={392 + 180 * g1} y2={190} stroke="var(--fig-muted)" strokeWidth={2.5} />
            <line x1={a0.x} y1={a0.y} x2={a0.x + (fork.x - a0.x) * g1} y2={a0.y + (fork.y - a0.y) * g1} stroke="var(--fig-line)" strokeWidth={2.5} />
            {g2 > 0 && (
              <>
                <line x1={fork.x} y1={fork.y} x2={fork.x + 130 * g2} y2={fork.y - 70 * g2} stroke="var(--fig-line)" strokeWidth={1.2} />
                <line x1={fork.x} y1={fork.y} x2={fork.x + 26 * g2} y2={fork.y + 26 * g2} stroke="var(--fig-line)" strokeWidth={5} />
              </>
            )}
            <T x={400} y={174} fs={12}>
              α粒子の跡
            </T>
            <T x={400} y={202} fs={11.5} tone="muted">
              ほかのα粒子の跡
            </T>
            <T x={536} y={58} fs={12}>
              陽子の跡（細く長い）
            </T>
            <T x={596} y={172} fs={12}>
              酸素の原子核の跡
            </T>
            <T x={596} y={189} fs={11.5} tone="muted">
              （太く短い）
            </T>
            <T x={545} y={238} anchor="middle" fs={12.5}>
              α粒子の跡は途中で終わり、出てくる跡は2本だけ
            </T>
            <T x={545} y={260} anchor="middle" fs={12} tone="acc">
              α粒子が取り込まれ、窒素が酸素に変わった
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図27-10 原子核の中の陽子と中性子（切り替え） ---------- */

const NUCLEI = {
  h1: { label: '水素1', name: 'ふつうの水素', p: 1, n: 0, notes: ['原子核は陽子1個だけ', '崩壊しない'] },
  h2: { label: '水素2', name: '重水素（水素2）', p: 1, n: 1, notes: ['水素の同位体', '崩壊しない'] },
  he4: { label: 'ヘリウム4', name: 'ヘリウム4', p: 2, n: 2, notes: ['α線の粒（α粒子）と同じもの', '崩壊しない'] },
  c12: { label: '炭素12', name: '炭素12', p: 6, n: 6, notes: ['ふつうの炭素', '崩壊しない'] },
  c14: { label: '炭素14', name: '炭素14', p: 6, n: 8, notes: ['炭素の同位体で、放射能を持つ', 'β線を出すと中性子1個が陽子に変わり', '窒素14になる（半減期 約5700年）'] },
  u238: { label: 'ウラン238', name: 'ウラン238', p: 92, n: 146, notes: ['α線を出して崩壊する', '（半減期 約45億年）'] },
} as const

type NucKey = keyof typeof NUCLEI

export function FigNucleus() {
  const [key, setKey] = useState<NucKey>('c14')
  const d = NUCLEI[key]
  const total = d.p + d.n
  const r = total > 20 ? 5.6 : 14
  const c = r * 1.12
  const order = (() => {
    const g = rng(14 + total)
    const arr = Array.from({ length: total }, (_, i) => i < d.p)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(g() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })()
  const golden = Math.PI * (3 - Math.sqrt(5))
  return (
    <Figure
      n="27-10"
      title="原子核は陽子と中性子でできている。陽子の数が同じで中性子の数が違うものが同位体"
      controls={
        <Choice
          label="原子核"
          options={(Object.keys(NUCLEI) as NucKey[]).map((k) => ({ value: k, label: NUCLEI[k].label }))}
          value={key}
          onChange={setKey}
        />
      }
      caption="模式図です。陽子と中性子の並び方は模式的なもので、大きさの比も実際と違います。「原子核」を炭素12と炭素14、水素1と水素2で切り替えると、陽子の数は同じで中性子の数だけが違うことが分かります。名前の後の数は陽子と中性子の数の合計です。"
    >
      <Svg id="27-10" w={720} h={300} label={`${d.name}の原子核。陽子${d.p}個と中性子${d.n}個からできている。`}>
        {order.map((isP, i) => {
          const rad = c * Math.sqrt(i + 0.5) * (total === 1 ? 0 : 1)
          const a = i * golden
          return <Nucleon key={i} x={190 + rad * Math.cos(a)} y={150 + rad * Math.sin(a)} r={r} proton={isP} />
        })}
        <T x={400} y={50} bold fs={14}>
          {d.name}
        </T>
        <T x={400} y={80} fs={13}>
          {`陽子 ${d.p}個・中性子 ${d.n}個`}
        </T>
        <T x={400} y={102} fs={12.5} tone="muted">
          {`合わせて ${total}個（名前の後の数）`}
        </T>
        <T x={400} y={124} fs={12.5} tone="muted">
          {`陽子の数（原子番号）は ${d.p}`}
        </T>
        {d.notes.map((s, i) => (
          <T key={s} x={400} y={156 + i * 21} fs={12.5} tone={i === 0 ? 'acc' : undefined}>
            {s}
          </T>
        ))}
        <Nucleon x={410} y={252} r={11} proton />
        <T x={428} y={252} fs={12}>
          陽子（正の電気）
        </T>
        <Nucleon x={560} y={252} r={11} proton={false} />
        <T x={578} y={252} fs={12}>
          中性子（電気なし）
        </T>
      </Svg>
    </Figure>
  )
}
