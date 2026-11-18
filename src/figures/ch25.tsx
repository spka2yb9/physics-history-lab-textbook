import { useState } from 'react'
import { Compare, Figure } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Trail, Vel, rng } from './common'

/*
 * 第25章の図。偏光の測定装置の向きは「真上を0度、右回り」で描く。
 * 測定の結果は、塗った丸＝光子が通った、白い丸＝止められた、で表す（色だけで区別しない）。
 */

const rad = (deg: number) => (deg * Math.PI) / 180
/** 向きの差 deg のとき、量子力学で2つの結果がそろう割合 */
const agreeQM = (deg: number) => Math.cos(rad(deg)) ** 2
/** 隠れた変数の例（2つの光子が同じ「隠れた向き」を持ち、それに近い向きの装置だけを通る）でそろう割合 */
const agreeHV = (deg: number) => 1 - Math.abs(deg) / 90

/** 決まった乱数の並び（開くたびに同じ結果になる） */
function randoms(seed: number, n: number) {
  const r = rng(seed)
  return Array.from({ length: n }, () => r())
}
const U1 = randoms(3617, 400)
const U2 = randoms(2859, 400)
/** i 番目の光子の対の結果。A は半々、B は向きの差に応じた割合で A とそろう */
const pair = (i: number, diff: number) => {
  const a = U1[i % 400] < 0.5
  const same = U2[i % 400] < agreeQM(diff)
  return { a, b: same ? a : !a }
}

/** 偏光の測定装置（偏光板）。真上を0度として deg だけ右に回した線が、通す向き */
function Pol({ x, y, deg, r = 22 }: { x: number; y: number; deg: number; r?: number }) {
  const dx = Math.sin(rad(deg)) * (r - 4)
  const dy = -Math.cos(rad(deg)) * (r - 4)
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={1.5} />
      <line x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} stroke="var(--fig-line)" strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

/** 測定の結果の印。通った＝塗った丸、止められた＝白い丸 */
function Res({ x, y, pass, r = 7 }: { x: number; y: number; pass: boolean; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={pass ? 'var(--fig-line)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
}

/** 光子（小さな丸） */
const Photon = ({ x, y }: { x: number; y: number }) => <Ball x={x} y={y} r={6} fill="var(--fig-box2)" />

/** 「塗った丸＝通った、白い丸＝止められた」の凡例 */
function ResLegend({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Res x={x} y={y} pass />
      <T x={x + 12} y={y} fs={12}>
        通った
      </T>
      <Res x={x + 74} y={y} pass={false} />
      <T x={x + 86} y={y} fs={12}>
        止められた
      </T>
    </g>
  )
}

/* ---------- 図25-1 論争から実験までの年表 ---------- */

const ROAD = [
  { y: '1926年', who: 'アインシュタイン', what: ['ボルンへの手紙', '（サイコロの文）'] },
  { y: '1927年', who: 'ソルベー会議', what: ['1個の粒子の', '思考実験で論争'] },
  { y: '1930年', who: 'ソルベー会議', what: ['光の箱の', '思考実験'] },
  { y: '1935年', who: 'EPRの論文', what: ['量子力学は', '不完全と主張'] },
  { y: '1935年', who: 'シュレーディンガー', what: ['「もつれ」の名と', '猫の思考実験'] },
  { y: '1964年', who: 'ベル', what: ['ベルの不等式'] },
  { y: '1972年', who: 'クラウザーら', what: ['初めての', '検証の実験'] },
  { y: '1982年', who: 'アスペら', what: ['飛行中に装置の', '向きを切り替え'] },
  { y: '2015年', who: '3つのグループ', what: ['2つの抜け穴を', '同時にふさぐ'] },
  { y: '2022年', who: 'ノーベル賞', what: ['アスペ、クラウザー、', 'ツァイリンガー'] },
]

export function FigRoad25() {
  return (
    <Figure n="25-1" title="アインシュタインとボーアの論争から、ノーベル賞までの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。青い点はこの章で詳しく扱う出来事です。">
      <Svg id="25-1" w={800} h={240} label="1926年にアインシュタインがボルンへの手紙で量子力学への疑問を書いた。1927年と1930年のソルベー会議でボーアと論争した。1935年にEPRの論文とシュレーディンガーのもつれと猫の論文が出た。1964年にベルが不等式を示し、1972年にクラウザーら、1982年にアスペらが実験で確かめた。2015年に2つの抜け穴を同時にふさいだ実験が行われ、2022年にアスペ、クラウザー、ツァイリンガーがノーベル物理学賞を受けた。">
        <Arrow x1={20} y1={124} x2={785} y2={124} />
        {ROAD.map((r, i) => {
          const x = 70 + i * 73
          const up = i % 2 === 0
          const ty = up ? 20 : 160
          const key = [2, 3, 4, 5, 6, 7].includes(i)
          return (
            <g key={`${r.y}-${r.who}`}>
              <circle cx={x} cy={124} r={6} fill={key ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 94 : 130} x2={x} y2={up ? 118 : 148} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold>
                {r.y}
              </T>
              <T x={x} y={ty + 19} anchor="middle" fs={12}>
                {r.who}
              </T>
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + 37 + j * 16} anchor="middle" fs={11.5} tone="muted">
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

/* ---------- 図25-2 光の箱（動） ---------- */

export function FigPhotonBox() {
  const open = 1
  const close = 1.35
  return (
    <Anim
      n="25-2"
      title="光の箱：アインシュタインは、光子が出た時刻とエネルギーを両方正確に知れると考えた"
      still={3.6}
      period={7}
      caption="1930年の議論をもとにした模式図です。箱はばねばかりにつるしてあり、中の時計が決まった時刻にふたを一瞬開けて、光子を1個だけ外へ出します。光子が出ると箱は軽くなって少し上がり、揺れます。ボーアは、箱の高さがずれると中の時計の進み方が変わることに注目しました。"
    >
      {(t) => {
        const after = Math.max(0, t - close)
        // 軽くなった箱は新しいつり合いの位置（6px上）のまわりで揺れながら止まる
        const dy = t < close ? 0 : -6 + 6 * Math.exp(-0.6 * after) * Math.cos(5 * after)
        const isOpen = t >= open && t < close
        const px = t < open + 0.1 ? null : Math.min(250 + (t - open - 0.1) * 160, 370)
        const by = 90 + dy
        const hand = rad(-90 + Math.min(t, open) * 90)
        return (
          <Svg id="25-2" w={720} h={260} label="ばねばかりにつるした箱。中の時計が決まった時刻にふたを一瞬開け、光子が1個外へ出る。箱は軽くなって少し上がる。">
            {/* ばねばかり */}
            <line x1={110} y1={20} x2={270} y2={20} stroke="var(--fig-line)" strokeWidth={4} />
            <path
              d={`M190,22 ${Array.from({ length: 8 }, (_, k) => `L${k % 2 ? 180 : 200},${22 + ((k + 1) * (by - 26)) / 9}`).join(' ')} L190,${by}`}
              fill="none"
              stroke="var(--fig-line)"
              strokeWidth={1.5}
            />
            {/* 目盛りと針 */}
            <line x1={92} y1={60} x2={92} y2={130} stroke="var(--fig-line)" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
              <line key={k} x1={86} y1={64 + k * 9} x2={92} y2={64 + k * 9} stroke="var(--fig-line)" />
            ))}
            <T x={84} y={145} anchor="middle" fs={11.5} tone="muted">
              目盛り
            </T>
            <line x1={96} y1={by + 8} x2={130} y2={by + 8} stroke="var(--fig-accent)" strokeWidth={2} />
            {/* 箱 */}
            <rect x={130} y={by} width={120} height={110} fill="var(--fig-box3)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <circle cx={170} cy={by + 40} r={18} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <line x1={170} y1={by + 40} x2={170 + 13 * Math.cos(hand)} y2={by + 40 + 13 * Math.sin(hand)} stroke="var(--fig-line)" strokeWidth={2} />
            <T x={170} y={by + 74} anchor="middle" fs={11.5}>
              時計
            </T>
            <T x={170} y={by + 92} anchor="middle" fs={11.5} tone="muted">
              中に光
            </T>
            {/* ふた（右の壁の穴） */}
            <rect x={246} y={by + 28 - (isOpen ? 16 : 0)} width={8} height={18} fill="var(--fig-line)" />
            {px != null && px < 360 && <Photon x={px} y={by + 37} />}
            {px != null && px >= 360 && (
              <>
                <Photon x={370} y={127} />
                <T x={370} y={152} anchor="middle" fs={11.5}>
                  出た光子
                </T>
              </>
            )}
            {/* 2人の考え */}
            <T x={420} y={30} bold fs={12.5}>
              アインシュタインの考え
            </T>
            <T x={420} y={52} fs={12}>
              時計がふたを開けた時刻は正確に分かる。
            </T>
            <T x={420} y={70} fs={12}>
              光子が出る前と後の箱の重さの差から、
            </T>
            <T x={420} y={88} fs={12}>
              光子のエネルギーも正確に分かる。
            </T>
            <T x={420} y={130} bold fs={12.5}>
              ボーアの答え
            </T>
            <T x={420} y={152} fs={12}>
              重さを細かく量るほど、箱の高さが
            </T>
            <T x={420} y={170} fs={12}>
              はっきりしなくなる。高さが違うと時計の
            </T>
            <T x={420} y={188} fs={12}>
              進み方が違う（第20章）ので、ふたが
            </T>
            <T x={420} y={206} fs={12}>
              開いた時刻があいまいになる。
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図25-3 EPRの思考実験（動・切り替え） ---------- */

export function FigEPR() {
  const [q, setQ] = useState<'pos' | 'mom'>('pos')
  const cx = 360
  const y = 100
  const v = 62
  return (
    <Anim
      n="25-3"
      title="Aを測ると、離れたBの位置か運動量のどちらかが、Bに触れずに分かる"
      still={3.6}
      period={6.5}
      controls={
        <Choice
          label="Aで測る量"
          options={[
            { value: 'pos', label: '位置' },
            { value: 'mom', label: '運動量' },
          ]}
          value={q}
          onChange={setQ}
        />
      }
      caption="1935年のEPRの論文の考えを、粒子を丸で描いた模式図です。2つの粒子は一度ぶつかってから、同じ速さで反対向きに離れていきます。「Aで測る量」を切り替えると、Bについて分かる量が変わります。"
    >
      {(t) => {
        const tt = Math.min(t, 3)
        const xa = cx + v * tt
        const xb = cx - v * tt
        const done = t >= 3
        return (
          <Svg id="25-3" w={720} h={250} label="一度ぶつかった2つの粒子AとBが反対向きに離れていく。Aの位置を測ると、Bは中心から反対側の同じ距離にいると分かる。Aの運動量を測ると、Bの運動量は同じ大きさで逆向きだと分かる。">
            <line x1={40} y1={y} x2={680} y2={y} stroke="var(--fig-muted)" strokeDasharray="2 5" />
            <circle cx={cx} cy={y} r={4} fill="var(--fig-line)" />
            <T x={cx} y={y + 26} anchor="middle" fs={11.5} tone="muted">
              2つが離れ始めた場所
            </T>
            <Trail points={[[xb, y], [xa, y]]} />
            <Ball x={xa} y={y} r={11} />
            <Ball x={xb} y={y} r={11} />
            <T x={xa} y={y - 28} anchor="middle" fs={12.5} bold>
              A
            </T>
            <T x={xb} y={y - 28} anchor="middle" fs={12.5} bold>
              B
            </T>
            {/* 測定装置 */}
            <rect x={cx + v * 3 + 18} y={y - 24} width={44} height={48} rx={4} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={cx + v * 3 + 40} y={y - 38} anchor="middle" fs={11.5}>
              Aを測る
            </T>
            {done && q === 'pos' && (
              <>
                <line x1={cx} y1={y + 50} x2={xa} y2={y + 50} stroke="var(--fig-accent)" strokeWidth={2} />
                <line x1={xb} y1={y + 50} x2={cx} y2={y + 50} stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="5 4" />
                {[xb, cx, xa].map((x) => (
                  <line key={x} x1={x} y1={y + 43} x2={x} y2={y + 57} stroke="var(--fig-accent)" strokeWidth={2} />
                ))}
              </>
            )}
            {done && q === 'mom' && (
              <>
                <Vel x1={xa} y1={y + 30} x2={xa + 55} y2={y + 30} />
                <Vel x1={xb} y1={y + 30} x2={xb - 55} y2={y + 30} />
              </>
            )}
            <T x={40} y={200} fs={12.5}>
              {q === 'pos' ? 'Aの位置を測る：Aは中心から右へある距離の所にいた。' : 'Aの運動量を測る：Aの速さと向きが分かった。'}
            </T>
            <T x={40} y={224} fs={12.5} tone={done ? 'acc' : 'muted'}>
              {q === 'pos' ? '→ Bは中心から左へ同じ距離の所にいると、Bに触れずに分かる。' : '→ Bは同じ速さで逆向きに動いていると、Bに触れずに分かる。'}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図25-4 シュレーディンガーの猫 ---------- */

function Cat({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="var(--fig-line)" strokeWidth={1.5} fill="var(--fig-box2)">
      <ellipse cx={x} cy={y + 8} rx={26} ry={14} />
      <circle cx={x - 26} cy={y - 8} r={11} />
      <path d={`M${x - 35},${y - 14} L${x - 33},${y - 25} L${x - 27},${y - 18} M${x - 25},${y - 18} L${x - 19},${y - 25} L${x - 18},${y - 13}`} />
      <path d={`M${x + 24},${y + 4} Q${x + 44},${y - 4} ${x + 40},${y - 20}`} fill="none" />
    </g>
  )
}

export function FigCat() {
  return (
    <Figure
      n="25-4"
      title="シュレーディンガーの猫：原子1個の状態と猫の生死が、波動関数の中で結びつく"
      caption="1935年のシュレーディンガーの論文の思考実験を描いた模式図です。実際に行う実験ではありません。左の箱の中の仕掛けは、原子が崩れると検出器が反応し、金づちが毒のびんを割るようにつながっています。右は1時間後の箱の中身を、量子力学の波動関数で書いたときの内容です。"
    >
      <Svg id="25-4" w={720} h={250} label="鋼鉄の箱の中に、ごく少量の放射性の物質、検出器、金づち、毒のびん、猫が入っている。1時間後の波動関数は、原子が崩れておらず猫が生きている状態と、原子が崩れて猫が死んでいる状態が半分ずつ重なり合ったものになる。">
        <rect x={20} y={24} width={330} height={210} rx={6} fill="none" stroke="var(--fig-line)" strokeWidth={3} />
        <T x={30} y={14} fs={12} tone="muted">
          閉じた鋼鉄の箱
        </T>
        <Box x={36} y={44} w={150} h={50} lines={['ごく少量の', '放射性の物質']} fs={12} />
        <Box x={226} y={44} w={110} h={50} lines={['検出器']} fs={12} />
        <Box x={226} y={122} w={110} h={46} lines={['金づち']} fs={12} />
        <Box x={36} y={122} w={150} h={46} lines={['毒のびん']} fs={12} />
        <Arrow x1={188} y1={69} x2={224} y2={69} />
        <Arrow x1={281} y1={96} x2={281} y2={120} />
        <Arrow x1={224} y1={145} x2={188} y2={145} />
        <Cat x={150} y={200} />
        <T x={198} y={205} fs={12}>
          猫
        </T>
        <Arrow x1={360} y1={130} x2={392} y2={130} />
        <T x={540} y={30} anchor="middle" bold fs={12.5}>
          1時間後の、波動関数による記述
        </T>
        <Box x={400} y={50} w={280} h={56} lines={['原子は崩れていない', '猫は生きている']} fs={12.5} fill="box3" />
        <Box x={400} y={140} w={280} h={56} lines={['原子が崩れた', '猫は死んでいる']} fs={12.5} fill="box" />
        <path d="M688,52 Q700,52 700,64 L700,112 Q700,124 710,124 Q700,124 700,136 L700,182 Q700,194 688,194" fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
        <T x={540} y={124} anchor="middle" fs={12}>
          と
        </T>
        <T x={540} y={222} anchor="middle" fs={12.5} tone="acc">
          2つが半分ずつ重なり合った状態
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図25-5 同じ向きで測ると結果がそろう（動） ---------- */

const N5 = 12

export function FigSameAngle() {
  const dt = 0.8
  const fly = 0.6
  const sx = 360
  const ax = 110
  const bx = 610
  const y = 74
  return (
    <Anim
      n="25-5"
      title="同じ向きの装置で測ると、もつれた光子の対の結果は必ずそろう"
      still={7.3}
      period={N5 * dt + 1.2}
      caption="模式図です。光源は光子を2個ずつ、反対向きに出します。装置はどちらも真上（0度）の向きの偏光を通します。1個ずつの結果は通るか止められるかがでたらめですが、AとBの結果は毎回そろいます。"
    >
      {(t) => {
        const arrived = Math.max(0, Math.min(N5, Math.floor((t - fly) / dt) + 1))
        const k = Math.floor(t / dt)
        const u = (t - k * dt) / fly
        const flying = k < N5 && u < 1
        return (
          <Svg id="25-5" w={720} h={240} label="中央の光源から光子が2個ずつ左右に飛び、同じ向きの偏光の装置AとBで測られる。Aの結果の並びはでたらめだが、Bの結果の並びとまったく同じになる。">
            <Box x={sx - 34} y={y - 18} w={68} h={36} lines="光源" fs={12} />
            <Pol x={ax} y={y} deg={0} />
            <Pol x={bx} y={y} deg={0} />
            <T x={ax} y={y + 38} anchor="middle" fs={12}>
              装置A（0度）
            </T>
            <T x={bx} y={y + 38} anchor="middle" fs={12}>
              装置B（0度）
            </T>
            {flying && (
              <>
                <Photon x={sx - 40 - (sx - 40 - ax - 26) * u} y={y} />
                <Photon x={sx + 40 + (bx - 26 - sx - 40) * u} y={y} />
              </>
            )}
            <T x={30} y={150} fs={12.5}>
              Aの結果
            </T>
            <T x={30} y={180} fs={12.5}>
              Bの結果
            </T>
            {Array.from({ length: arrived }, (_, i) => {
              const r = pair(i, 0)
              const x = 130 + i * 30
              return (
                <g key={i}>
                  <Res x={x} y={150} pass={r.a} />
                  <Res x={x} y={180} pass={r.b} />
                </g>
              )
            })}
            <ResLegend x={130} y={216} />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図25-6 隠れた変数の考えと量子力学の考え ---------- */

function CardPanel({ id, hidden }: { id: string; hidden: boolean }) {
  const label = hidden
    ? '光源を出るとき、2つの光子は同じ内容の指示書を持っている。指示書には、どの向きの装置なら通るかが書いてある。'
    : '光子は指示書を持っていない。測ったときに、通るか止められるかがでたらめに決まる。そのとき相手の光子の結果もそろう。'
  return (
    <Svg id={id} w={320} h={200} label={label}>
      <Box x={130} y={20} w={60} h={30} lines="光源" fs={12} />
      <Photon x={70} y={35} />
      <Photon x={250} y={35} />
      <Arrow x1={126} y1={35} x2={82} y2={35} />
      <Arrow x1={194} y1={35} x2={238} y2={35} />
      {hidden ? (
        [20, 180].map((x) => (
          <g key={x}>
            <rect x={x} y={64} width={120} height={92} rx={4} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={x + 60} y={80} anchor="middle" fs={11.5} bold>
              指示書
            </T>
            <T x={x + 8} y={100} fs={11.5}>
              0度なら 通る
            </T>
            <T x={x + 8} y={118} fs={11.5}>
              30度なら 通る
            </T>
            <T x={x + 8} y={136} fs={11.5}>
              60度なら 止まる
            </T>
          </g>
        ))
      ) : (
        <>
          <rect x={30} y={64} width={260} height={92} rx={4} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
          <T x={160} y={92} anchor="middle" fs={12}>
            指示書はない
          </T>
          <T x={160} y={116} anchor="middle" fs={12}>
            結果は測ったときに決まる
          </T>
        </>
      )}
      <T x={160} y={180} anchor="middle" fs={12} tone="muted">
        {hidden ? '2枚の指示書は同じ内容（対ごとに違う）' : '1個ずつの結果はでたらめ'}
      </T>
    </Svg>
  )
}

export function FigCards() {
  return (
    <Figure
      n="25-6"
      title="結果がそろう理由についての2つの考え方"
      caption="模式図です。同じ向きの装置で測るかぎり、どちらの考え方でも、2つの結果は必ずそろいます。そのため、図25-5のような測り方だけでは、どちらが正しいかを決められません。"
    >
      <Compare
        panels={[
          { label: '隠れた変数の考え（EPRの立場）', children: <CardPanel id="25-6a" hidden />, note: '結果は光源を出るときに決まっていて、測ると読み出されるだけ。' },
          { label: '量子力学の考え', children: <CardPanel id="25-6b" hidden={false} />, note: '測るまで結果は決まっていないが、2つの結果は結びついている。' },
        ]}
      />
    </Figure>
  )
}

/* ---------- 図25-7 30度ずつずらしたときの食い違い ---------- */

function Dials({ x, y, a, b }: { x: number; y: number; a: number; b: number }) {
  return (
    <g>
      <Pol x={x} y={y} deg={a} r={16} />
      <Pol x={x + 46} y={y} deg={b} r={16} />
      <T x={x} y={y - 24} anchor="middle" fs={11.5}>
        A
      </T>
      <T x={x + 46} y={y - 24} anchor="middle" fs={11.5}>
        B
      </T>
    </g>
  )
}

const BAR = { x: 400, w: 260 }
const barX = (p: number) => BAR.x + BAR.w * p

export function FigThirty() {
  const rows = [
    { a: 0, b: 0, text: ['Aは0度、Bは0度'], p: 0 },
    { a: 30, b: 0, text: ['Aだけ右へ30度'], p: 0.25 },
    { a: 0, b: -30, text: ['Bだけ左へ30度'], p: 0.25 },
  ]
  return (
    <Figure
      n="25-7"
      title="向きの差が30度なら食い違いは4分の1。60度では、隠れた変数の考えでは半分以下のはずが、4分の3になる"
      caption="横の棒は、結果が食い違う（片方だけ通る）対の割合です。上の3段は実験と量子力学の予想の値です。いちばん下の段では、点線の枠が隠れた変数の考えで起こりうる範囲（半分まで）、青い棒が量子力学の予想と実験の値（4分の3）です。"
    >
      <Svg id="25-7" w={720} h={300} label="Aの装置とBの装置が同じ向きなら食い違いは0。片方だけ30度回すと食い違いは4分の1。両方を逆向きに30度ずつ回して差を60度にすると、隠れた変数の考えでは食い違いは4分の1と4分の1を足した半分以下のはずだが、量子力学の予想と実験では4分の3になる。">
        <T x={BAR.x} y={18} fs={12} tone="muted">
          結果が食い違う割合
        </T>
        <line x1={BAR.x} y1={274} x2={barX(1)} y2={274} stroke="var(--fig-line)" />
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <g key={p}>
            <line x1={barX(p)} y1={274} x2={barX(p)} y2={280} stroke="var(--fig-line)" />
            <T x={barX(p)} y={291} anchor="middle" fs={11.5} tone="muted">
              {['0', '4分の1', '半分', '4分の3', 'すべて'][p * 4]}
            </T>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = 52 + i * 56
          return (
            <g key={i}>
              <Dials x={40} y={y} a={r.a} b={r.b} />
              <T x={120} y={y} fs={12.5}>
                {r.text[0]}
              </T>
              {r.p > 0 ? (
                <rect x={BAR.x} y={y - 10} width={BAR.w * r.p} height={20} fill="var(--fig-accent)" opacity={0.8} />
              ) : (
                <line x1={BAR.x} y1={y - 10} x2={BAR.x} y2={y + 10} stroke="var(--fig-accent)" strokeWidth={3} />
              )}
              <T x={barX(r.p) + 8} y={y} fs={12}>
                {r.p === 0 ? '食い違わない' : '4分の1'}
              </T>
            </g>
          )
        })}
        <line x1={20} y1={198} x2={700} y2={198} stroke="var(--fig-line)" />
        <Dials x={40} y={236} a={30} b={-30} />
        <T x={120} y={226} fs={12.5}>
          両方を回す
        </T>
        <T x={120} y={246} fs={12.5}>
          （向きの差は60度）
        </T>
        <rect x={BAR.x} y={212} width={BAR.w * 0.5} height={18} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="5 4" />
        <T x={barX(0.5) + 8} y={221} fs={12}>
          隠れた変数：半分まで
        </T>
        <rect x={BAR.x} y={242} width={BAR.w * 0.75} height={18} fill="var(--fig-accent)" opacity={0.8} />
        <T x={barX(0.75) + 8} y={251} fs={12} tone="acc">
          実験：4分の3
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図25-8 向きの差と結果の一致の割合（動・スライダー） ---------- */

export function FigBell() {
  const [diff, setDiff] = useState(22.5)
  const dt = 0.5
  const fly = 0.45
  const sx = 360
  const ax = 120
  const bx = 600
  const y = 66
  const gx = (d: number) => 90 + (d / 90) * 330
  const gy = (p: number) => 336 - p * 120
  const qmPath = Array.from({ length: 91 }, (_, d) => `${d ? 'L' : 'M'}${gx(d).toFixed(1)},${gy(agreeQM(d)).toFixed(1)}`).join(' ')
  const pct = (p: number) => `${Math.round(p * 100)}%`
  const label = (d: number) => `${d % 1 ? d.toFixed(1) : d}度`
  return (
    <Anim
      n="25-8"
      title="2つの装置の向きの差を変えると、結果がそろう割合は量子力学の曲線に沿って変わる"
      still={40}
      period={100}
      controls={<Range label="2つの装置の向きの差" min={0} max={90} step={7.5} value={diff} onChange={setDiff} format={label} />}
      caption="上は、装置Aを0度に固定し、装置Bを回して測る様子です。下のグラフの実線は量子力学の予想で、実験の結果はこの線に乗ります。点線は、隠れた変数の考えでつくった例の一つです。この例は0度、45度、90度では量子力学と同じ値ですが、その間では違います。ベルは、隠れた変数の考えでは、どう工夫してもすべての角度で実線に合わせられないことを示しました。スライダーで向きの差を変えると、数えた組の割合が変わります。"
    >
      {(t) => {
        const arrived = Math.max(0, Math.floor((t - fly) / dt) + 1)
        let same = 0
        for (let i = 0; i < arrived; i++) {
          const r = pair(i, diff)
          if (r.a === r.b) same++
        }
        const k = Math.floor(t / dt)
        const u = (t - k * dt) / fly
        const recent = Array.from({ length: Math.min(arrived, 14) }, (_, j) => arrived - Math.min(arrived, 14) + j)
        return (
          <Svg id="25-8" w={720} h={380} label={`装置Aは0度、装置Bは${label(diff)}。結果がそろう割合は、量子力学の予想では${pct(agreeQM(diff))}、隠れた変数でつくった例では${pct(agreeHV(diff))}。`}>
            <Box x={sx - 34} y={y - 18} w={68} h={36} lines="光源" fs={12} />
            <Pol x={ax} y={y} deg={0} />
            <Pol x={bx} y={y} deg={diff} />
            <T x={ax} y={y + 36} anchor="middle" fs={12}>
              装置A（0度）
            </T>
            <T x={bx} y={y + 36} anchor="middle" fs={12}>
              {`装置B（${label(diff)}）`}
            </T>
            {u < 1 && (
              <>
                <Photon x={sx - 40 - (sx - 40 - ax - 26) * u} y={y} />
                <Photon x={sx + 40 + (bx - 26 - sx - 40) * u} y={y} />
              </>
            )}
            {/* 最近の結果 */}
            <T x={20} y={136} fs={12}>
              Aの結果
            </T>
            <T x={20} y={160} fs={12}>
              Bの結果
            </T>
            {recent.map((i, j) => {
              const r = pair(i, diff)
              const x = 100 + j * 24
              return (
                <g key={i}>
                  <Res x={x} y={136} pass={r.a} r={6} />
                  <Res x={x} y={160} pass={r.b} r={6} />
                  {r.a !== r.b && <rect x={x - 10} y={124} width={20} height={48} rx={3} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />}
                </g>
              )
            })}
            <T x={460} y={136} fs={12}>
              {`数えた組 ${arrived}組`}
            </T>
            <T x={460} y={160} fs={12}>
              {`そろった組 ${same}組（${arrived ? pct(same / arrived) : '0%'}）`}
            </T>
            <T x={460} y={184} fs={11.5} tone="muted">
              点線の枠は、結果が食い違った組
            </T>
            {/* グラフ */}
            <line x1={gx(0)} y1={gy(0)} x2={gx(90) + 10} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(1) - 8} stroke="var(--fig-line)" />
            {[0, 0.5, 1].map((p) => (
              <T key={p} x={gx(0) - 8} y={gy(p)} anchor="end" fs={11.5}>
                {pct(p)}
              </T>
            ))}
            {[0, 45, 90].map((d) => (
              <T key={d} x={gx(d)} y={gy(0) + 14} anchor="middle" fs={11.5}>
                {`${d}度`}
              </T>
            ))}
            <T x={20} y={gy(1) - 22} fs={11.5} tone="muted">
              結果がそろう割合
            </T>
            <T x={gx(45)} y={gy(0) + 30} anchor="middle" fs={11.5} tone="muted">
              2つの装置の向きの差
            </T>
            <line x1={gx(0)} y1={gy(1)} x2={gx(90)} y2={gy(0)} stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="6 5" />
            <path d={qmPath} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
            <line x1={gx(diff)} y1={gy(0)} x2={gx(diff)} y2={gy(1)} stroke="var(--fig-line)" strokeDasharray="2 3" />
            <circle cx={gx(diff)} cy={gy(agreeHV(diff))} r={5} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <circle cx={gx(diff)} cy={gy(agreeQM(diff))} r={5} fill="var(--fig-accent)" />
            {/* 凡例と読み */}
            <line x1={450} y1={226} x2={482} y2={226} stroke="var(--fig-accent)" strokeWidth={2.5} />
            <T x={490} y={226} fs={12}>
              {`量子力学の予想 ${pct(agreeQM(diff))}`}
            </T>
            <line x1={450} y1={252} x2={482} y2={252} stroke="var(--fig-muted)" strokeWidth={2} strokeDasharray="6 5" />
            <T x={490} y={252} fs={12}>
              {`隠れた変数の例 ${pct(agreeHV(diff))}`}
            </T>
            <T x={450} y={284} fs={12} tone="acc">
              {Math.abs(agreeQM(diff) - agreeHV(diff)) < 0.005 ? 'この角度では同じ値' : `差は ${Math.round(Math.abs(agreeQM(diff) - agreeHV(diff)) * 100)}ポイント`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図25-9 アスペの実験装置（1982年） ---------- */

export function FigAspect() {
  const y = 130
  /** 片側の装置。dir は右なら 1、左なら -1 */
  const side = (dir: 1 | -1) => {
    const sw = 360 + dir * 100
    const p1 = 360 + dir * 240
    const p2 = 360 + dir * 160
    const d1 = p1 + dir * 30
    const d2 = p2 + dir * 30
    const wire = 360 + dir * 310
    return (
      <g>
        <Box x={sw - 26} y={y - 18} w={52} h={36} lines="切替" fs={12} fill="box3" />
        <Arrow x1={sw + dir * 28} y1={y} x2={p1 - dir * 22} y2={y} />
        <Arrow x1={sw + dir * 10} y1={y - 20} x2={p2 - dir * 12} y2={y - 72} />
        <Pol x={p1} y={y} deg={dir === 1 ? 22.5 : 0} r={18} />
        <Pol x={p2} y={y - 88} deg={dir === 1 ? 67.5 : 45} r={18} />
        <rect x={d1 - 11} y={y - 12} width={22} height={24} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={d2 - 11} y={y - 100} width={22} height={24} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <path d={`M${d1},${y + 12} L${d1},220`} fill="none" stroke="var(--fig-muted)" />
        <path d={`M${d2 + dir * 11},${y - 88} L${wire},${y - 88} L${wire},220`} fill="none" stroke="var(--fig-muted)" />
      </g>
    )
  }
  return (
    <Figure
      n="25-9"
      title="アスペの実験：光子が飛んでいる間に、測る装置の向きを切り替えた"
      caption="1982年のアスペ、ダリバール、ロジェの実験の模式図です（大きさの比は実際と違います）。左右の「切替」は光子を向きの違う2つの偏光の装置のどちらかへ振り分けます。振り分け先は約1億分の1秒ごとに変わりました。小さな四角は光子を数える検出器で、下の装置は左右で同時に届いた光子の組を数えます。"
    >
      <Svg id="25-9" w={720} h={300} label="中央のカルシウムの原子の光源から左右に光子が飛ぶ。左右それぞれの切替が、光子を向きの違う2つの偏光の装置のどちらかへ振り分ける。各装置の後ろに検出器があり、左右で同時に届いた光子の組を数える装置につながる。左右の偏光の装置は約12m離れている。">
        <Box x={318} y={y - 20} w={84} h={40} lines={['カルシウム', 'の光源']} fs={11.5} />
        <Arrow x1={316} y1={y} x2={288} y2={y} />
        <Arrow x1={404} y1={y} x2={432} y2={y} />
        {side(-1)}
        {side(1)}
        <line x1={50} y1={220} x2={670} y2={220} stroke="var(--fig-muted)" />
        <Box x={270} y={205} w={180} h={30} lines="同時に届いた組を数える" fs={11.5} fill="bg" />
        <T x={260} y={y + 34} anchor="middle" fs={11.5} tone="muted">
          約1億分の1秒
        </T>
        <T x={260} y={y + 50} anchor="middle" fs={11.5} tone="muted">
          ごとに切り替え
        </T>
        <Arrow x1={120} y1={262} x2={600} y2={262} both />
        <T x={360} y={284} anchor="middle" fs={12}>
          左右の偏光の装置の間は約12m。光でも約1億分の4秒かかる
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図25-10 光より速く情報は送れない（動・切り替え） ---------- */

const N10 = 12

export function FigNoSignal() {
  const [bset, setBset] = useState<'0' | '30' | '60'>('0')
  const diff = Number(bset)
  const dt = 0.45
  const msgStart = N10 * dt + 0.4
  const msgEnd = msgStart + 1.6
  const arrived = (t: number) => Math.max(0, Math.min(N10, Math.floor(t / dt) + 1))
  return (
    <Anim
      n="25-10"
      title="Bの装置の向きを変えても、Aの結果の並びからは何も読み取れない"
      still={8.6}
      period={10.5}
      controls={
        <Choice
          label="Bさんの装置の向き"
          options={[
            { value: '0', label: '0度' },
            { value: '30', label: '30度' },
            { value: '60', label: '60度' },
          ]}
          value={bset}
          onChange={setBset}
        />
      }
      caption="Aさんの装置は0度のままです。「Bさんの装置の向き」を切り替えても、Aさんの側で通る光子はいつも約半分で、並びはでたらめに見えます。違いが分かるのは、Bさんの結果を電話や光ファイバーなどで受け取り、2人の結果を並べたときだけです。その連絡は光より速くは届きません。"
    >
      {(t) => {
        const n = arrived(t)
        const res = Array.from({ length: n }, (_, i) => pair(i + 48, diff))
        const passA = res.filter((r) => r.a).length
        const same = res.filter((r) => r.a === r.b).length
        const m = Math.max(0, Math.min(1, (t - msgStart) / (msgEnd - msgStart)))
        const got = t >= msgEnd
        return (
          <Svg id="25-10" w={720} h={290} label={`Aさんの装置は0度、Bさんの装置は${diff}度。Aさんの側では通る光子がいつも約半分で、Bさんの向きを変えても変わらない。2人の結果を連絡して比べたときに初めて、そろった割合が分かる。`}>
            <T x={40} y={24} bold fs={12.5}>
              Aさんの側（0度）
            </T>
            <T x={420} y={24} bold fs={12.5}>
              {`Bさんの側（${diff}度）`}
            </T>
            <line x1={360} y1={10} x2={360} y2={150} stroke="var(--fig-muted)" strokeDasharray="4 4" />
            <T x={360} y={164} anchor="middle" fs={11.5} tone="muted">
              遠く離れている
            </T>
            {res.map((r, i) => (
              <g key={i}>
                <Res x={52 + (i % 6) * 26} y={56 + Math.floor(i / 6) * 28} pass={r.a} />
                <Res x={432 + (i % 6) * 26} y={56 + Math.floor(i / 6) * 28} pass={r.b} />
              </g>
            ))}
            <T x={40} y={126} fs={12}>
              {`通った ${passA}／${n}個`}
            </T>
            <T x={40} y={146} fs={11.5} tone="muted">
              いつも約半分。Bの向きは分からない
            </T>
            <ResLegend x={432} y={126} />
            {/* Bさんからの連絡 */}
            {t >= msgStart && (
              <>
                <Trail points={[[600, 190], [600 - 470 * m, 190]]} />
                <rect x={590 - 470 * m} y={180} width={22} height={18} rx={2} fill="var(--fig-box3)" stroke="var(--fig-line)" />
              </>
            )}
            <T x={630} y={190} fs={11.5}>
              Bの結果を送る
            </T>
            <T x={360} y={214} anchor="middle" fs={11.5} tone="muted">
              電話や光ファイバーで送る（光より速くは届かない）
            </T>
            <T x={40} y={250} fs={12.5} tone={got ? 'acc' : 'muted'}>
              {got ? `2人の結果を並べると：${N10}組のうち${same}組がそろった` : '2人の結果を並べるには、Bさんからの連絡を待つ'}
            </T>
            <T x={40} y={272} fs={11.5} tone="muted">
              そろう割合は、多くの組で数えると向きの差で決まる（図25-8）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}
