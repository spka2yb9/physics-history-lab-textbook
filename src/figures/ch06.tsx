import { useState } from 'react'
import { Compare, Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Ball, Cross, Force, ease } from './common'

/** 電気の印（＋か−の入った小さな丸） */
function Chg({ x, y, s, r = 7 }: { x: number; y: number; s: '+' | '-'; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={x} y={y} anchor="middle" fs={r > 9 ? 14 : 12} bold>
        {s === '+' ? '+' : '−'}
      </T>
    </g>
  )
}

/* ---------- 図6-1 静電気から電池までの年表 ---------- */

const ROAD = [
  { y: '1600年', who: 'ギルバート', what: ['磁気と琥珀の', '現象を区別'] },
  { y: '1729年', who: 'グレイ', what: ['電気が伝わる物と', '伝わらない物'] },
  { y: '1733年', who: 'デュ・フェ', what: ['電気には', '2つの種類がある'] },
  { y: '1745〜46年', who: 'クライストら', what: ['ライデン瓶で', '電気をためる'] },
  { y: '1752年', who: 'ダリバール、フランクリン', what: ['雷雲が電気を', '帯びていると示す'] },
  { y: '1785年', who: 'クーロン', what: ['電気の力と', '距離の関係'] },
  { y: '1791年', who: 'ガルヴァーニ', what: ['カエルの実験を', '論文で発表'] },
  { y: '1800年', who: 'ボルタ', what: ['電流を流し続ける', '電池を報告'] },
]

export function FigRoad() {
  return (
    <Figure n="6-1" title="ギルバートからボルタまでの年表" caption="上下に交互に並べています。点の間隔は年数に比例していません。">
      <Svg id="6-1" w={760} h={260} label="1600年ギルバート、1729年グレイ、1733年デュ・フェ、1745〜46年ライデン瓶、1752年ダリバールとフランクリン、1785年クーロン、1791年ガルヴァーニ、1800年ボルタの電池。">
        <Arrow x1={14} y1={130} x2={748} y2={130} />
        {ROAD.map((r, i) => {
          const x = 56 + i * 92
          const up = i % 2 === 0
          const ty = up ? 26 : 156
          return (
            <g key={r.y}>
              <circle cx={x} cy={130} r={6} fill={i === 7 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 108 : 136} x2={x} y2={up ? 124 : 146} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold>
                {r.y}
              </T>
              <T x={x} y={ty + 19} anchor="middle" fs={12}>
                {r.who === 'ダリバール、フランクリン' ? 'ダリバール、' : r.who}
              </T>
              {r.who === 'ダリバール、フランクリン' && (
                <T x={x} y={ty + 36} anchor="middle" fs={12}>
                  フランクリン
                </T>
              )}
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + (r.who.length > 8 ? 55 : 38) + j * 17} anchor="middle" fs={11.5} tone="muted">
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

/* ---------- 図6-2 こすると電気を帯びる（動） ---------- */

const ROD = { x: 40, y: 56, w: 300, h: 40 }
const MARK_X = (i: number) => ROD.x + 22 + i * 23.5
/** ガラスから絹へ移る −（何番目の印か）と、絹の中の行き先 */
const MOVERS = [
  { from: 3, to: 1, t0: 1.4 },
  { from: 7, to: 5, t0: 1.9 },
  { from: 11, to: 9, t0: 2.4 },
]

export function FigRub() {
  return (
    <Anim
      n="6-2"
      title="ガラスの棒を絹でこすると、−の電気の一部がガラスから絹へ移る"
      still={4.6}
      period={7}
      caption="現在の考えで描いた模式図です。−の丸は電子（第22章）を表し、数は実際よりずっと少なくしています。こする前はどちらも＋と−が同じ数ですが、こすった後はガラスに＋が、絹に−が多くなります。全体の＋と−の数は変わりません。"
    >
      {(t) => {
        // 絹の布の位置：近づく → こする → 離れる
        const down = 150
        const touch = ROD.y + ROD.h + 2
        const cy = t < 0.4 ? down : t < 1 ? down + (touch - down) * ease((t - 0.4) / 0.6) : t < 3.4 ? touch : t < 4 ? touch + (down - touch) * ease((t - 3.4) / 0.6) : down
        const rubbing = t >= 1 && t < 3.4
        const dx = rubbing ? 22 * Math.sin(2 * Math.PI * 1.5 * (t - 1)) : 0
        const cloth = { x: ROD.x + dx, y: cy, w: 300, h: 50 }
        const phase = t < 1 ? 0 : t < 3.4 ? 1 : 2
        return (
          <Svg id="6-2" w={680} h={232} label="ガラスの棒と絹の布。こすると、−の電気の一部がガラスから絹へ移り、ガラスは＋の電気を、絹は−の電気を帯びる。">
            <T x={ROD.x} y={40} fs={12.5}>
              ガラスの棒
            </T>
            <rect x={ROD.x} y={ROD.y} width={ROD.w} height={ROD.h} rx={20} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            {Array.from({ length: 12 }, (_, i) => {
              const minus = i % 2 === 1
              const gone = MOVERS.some((m) => m.from === i && t >= m.t0)
              return gone ? null : <Chg key={i} x={MARK_X(i)} y={ROD.y + 20} s={minus ? '-' : '+'} />
            })}
            <rect x={cloth.x} y={cloth.y} width={cloth.w} height={cloth.h} rx={4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            {Array.from({ length: 12 }, (_, i) => (
              <Chg key={i} x={cloth.x + 22 + i * 23.5} y={cloth.y + 16} s={i % 2 === 1 ? '-' : '+'} />
            ))}
            {MOVERS.map((m) => {
              if (t < m.t0) return null
              const u = ease((t - m.t0) / 0.8)
              const x0 = MARK_X(m.from)
              const y0 = ROD.y + 20
              const x1 = cloth.x + 22 + m.to * 23.5 + 11
              const y1 = cloth.y + 36
              return <Chg key={m.from} x={x0 + (x1 - x0) * u} y={y0 + (y1 - y0) * u} s="-" />
            })}
            <T x={cloth.x} y={cloth.y + 64} fs={12.5}>
              絹の布
            </T>
            <T x={380} y={40} bold>
              {['こする前', 'こすっている間', 'こすった後'][phase]}
            </T>
            {phase === 0 && (
              <>
                <T x={380} y={68} fs={12.5}>ガラスも絹も、＋と−が同じ数</T>
                <T x={380} y={92} fs={12.5} tone="muted">→ どちらも電気を帯びていない</T>
              </>
            )}
            {phase === 1 && (
              <>
                <T x={380} y={68} fs={12.5}>−の一部が、</T>
                <T x={380} y={92} fs={12.5}>ガラスから絹へ移る</T>
              </>
            )}
            {phase === 2 && (
              <>
                <T x={380} y={68} fs={12.5}>ガラスの棒：＋が6個、−が3個</T>
                <T x={380} y={90} fs={12.5} tone="acc">→ ＋の電気を帯びる</T>
                <T x={380} y={120} fs={12.5}>絹の布：＋が6個、−が9個</T>
                <T x={380} y={142} fs={12.5} tone="acc">→ −の電気を帯びる</T>
                <T x={380} y={176} fs={12} tone="muted">全体の＋と−の数は変わらない</T>
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図6-3 グレイの実験：絹で支えるか、針金で支えるか（動・切り替え） ---------- */

const LINE_Y = 112
const TUBE_END = 122
const BALL = { x: 640, y: 182, r: 12 }
const SUP = [262, 500]

export function FigGray() {
  const [sup, setSup] = useState<'silk' | 'brass'>('silk')
  const silk = sup === 'silk'
  const speed = 260
  const horiz = BALL.x - TUBE_END
  const pathLen = silk ? horiz + (BALL.y - BALL.r - LINE_Y) : SUP[0] - TUBE_END + (LINE_Y - 36)
  /** 糸の上の距離 s の点 */
  const at = (s: number) => {
    if (silk) return s < horiz ? { x: TUBE_END + s, y: LINE_Y } : { x: BALL.x, y: LINE_Y + (s - horiz) }
    const h = SUP[0] - TUBE_END
    return s < h ? { x: TUBE_END + s, y: LINE_Y } : { x: SUP[0], y: LINE_Y - (s - h) }
  }
  return (
    <Anim
      n="6-3"
      title="麻ひもを絹の糸で支えると、電気は先の玉まで伝わる"
      still={4}
      period={6}
      controls={
        <Choice
          label="麻ひもを支えるもの"
          options={[
            { value: 'silk', label: '絹の糸' },
            { value: 'brass', label: '真ちゅうの針金' },
          ]}
          value={sup}
          onChange={setSup}
        />
      }
      caption="1729年7月のグレイとウィーラーの実験をもとにした模式図です。点は伝わっていく電気を表します。「真ちゅうの針金」に切り替えると、電気は針金を通って梁へ逃げ、玉まで届きません。"
    >
      {(t) => {
        const lift = silk ? ease((t - 2.4) / 0.4) : 0
        const leafY = 230 - lift * (230 - (BALL.y + BALL.r + 3))
        return (
          <Svg id="6-3" w={720} h={256} label="こすったガラス管から張った麻ひもを、天井の梁から2か所でつるしている。絹の糸でつるすと電気は先の象牙の玉まで伝わり、玉が真ちゅうの箔を引きつける。真ちゅうの針金でつるすと、電気は針金から梁へ逃げる。">
            <rect x={200} y={20} width={360} height={16} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={570} y={28} fs={12} tone="muted">
              梁（天井の木材）
            </T>
            {SUP.map((x) => (
              <line key={x} x1={x} y1={36} x2={x} y2={LINE_Y} stroke={silk ? 'var(--fig-muted)' : 'var(--fig-line)'} strokeWidth={silk ? 1.2 : 3} />
            ))}
            <T x={SUP[0] + 10} y={60} fs={12.5}>
              {silk ? '絹の糸（電気を通さない）' : '真ちゅうの針金（電気を通す）'}
            </T>
            {!silk && (
              <T x={SUP[0] + 10} y={84} fs={12.5}>
                電気が針金を通って梁へ逃げる
              </T>
            )}
            <rect x={20} y={LINE_Y - 12} width={TUBE_END - 20} height={24} rx={12} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={20} y={LINE_Y - 30} fs={12.5}>
              こすったガラス管
            </T>
            <line x1={TUBE_END} y1={LINE_Y} x2={BALL.x} y2={LINE_Y} stroke="var(--fig-line)" strokeWidth={1.5} />
            <line x1={BALL.x} y1={LINE_Y} x2={BALL.x} y2={BALL.y - BALL.r} stroke="var(--fig-line)" strokeWidth={1.5} />
            <T x={360} y={LINE_Y + 18} fs={12.5}>
              麻ひも
            </T>
            {Array.from({ length: 15 }, (_, i) => {
              const s = (t - i * 0.2) * speed
              if (s < 0 || s > pathLen) return null
              const p = at(s)
              return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--fig-accent)" />
            })}
            <Ball x={BALL.x} y={BALL.y} r={BALL.r} fill="var(--fig-bg)" />
            <T x={BALL.x + 20} y={BALL.y} fs={12}>
              象牙の玉
            </T>
            <rect x={600} y={236} width={80} height={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={BALL.x - 8} y={leafY} width={16} height={4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={592} y={240} anchor="end" fs={12}>
              真ちゅうの箔
            </T>
            {silk ? (
              t > 2.6 && (
                <T x={420} y={190} fs={12.5} tone="acc">
                  玉が箔を引きつける
                </T>
              )
            ) : (
              <>
                <T x={400} y={190} fs={12.5}>
                  玉は箔を引きつけない
                </T>
                <Cross x={590} y={190} s={7} />
              </>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図6-4 電気の力の向き ---------- */

function Pair({ ox, oy, title, left, right, apart, result, neutral }: { ox: number; oy: number; title: string; left: '+' | '-'; right: '+' | '-'; apart: boolean; result: string; neutral?: boolean }) {
  const px = ox + 160
  const by = oy + 118
  const bx = apart ? 62 : 30
  const fy = by + 30
  return (
    <g>
      <rect x={ox + 4} y={oy + 4} width={312} height={192} rx={6} fill="none" stroke="var(--fig-muted)" strokeOpacity={0.4} />
      <T x={px} y={oy + 24} anchor="middle" bold fs={12.5}>
        {title}
      </T>
      <line x1={px - 120} y1={oy + 44} x2={px + 120} y2={oy + 44} stroke="var(--fig-line)" strokeWidth={2} />
      <line x1={px - 36} y1={oy + 44} x2={px - bx} y2={by - 16} stroke="var(--fig-line)" />
      <line x1={px + 36} y1={oy + 44} x2={px + bx} y2={by - 16} stroke="var(--fig-line)" />
      <Ball x={px - bx} y={by} r={16} fill="var(--fig-bg)" />
      <T x={px - bx} y={by} anchor="middle" fs={14} bold>
        {left === '+' ? '+' : '−'}
      </T>
      <Ball x={px + bx} y={by} r={16} fill="var(--fig-bg)" />
      {neutral ? (
        <>
          <T x={px + bx - 7} y={by} anchor="middle" fs={11.5} bold>
            −
          </T>
          <T x={px + bx + 7} y={by} anchor="middle" fs={11.5} bold>
            +
          </T>
          <T x={px + bx + 26} y={by} fs={11.5} tone="muted">
            近い側に−が寄る
          </T>
        </>
      ) : (
        <T x={px + bx} y={by} anchor="middle" fs={14} bold>
          {right === '+' ? '+' : '−'}
        </T>
      )}
      {apart ? (
        <>
          <Force x1={px - bx} y1={fy} x2={px - bx - 40} y2={fy} />
          <Force x1={px + bx} y1={fy} x2={px + bx + 40} y2={fy} />
        </>
      ) : (
        <>
          <Force x1={px - bx - 34} y1={fy} x2={px - 6} y2={fy} />
          <Force x1={px + bx + 34} y1={fy} x2={px + 6} y2={fy} />
        </>
      )}
      <T x={px} y={oy + 178} anchor="middle" fs={12.5} tone="acc">
        {result}
      </T>
    </g>
  )
}

export function FigForces() {
  return (
    <Figure n="6-4" title="同じ種類の電気は押し合い、違う種類の電気は引き合う" caption="糸でつるした軽い玉に電気を帯びさせた模式図です。青の矢印はそれぞれの玉にはたらく電気の力を表します。右下の図のように、電気を帯びていない物も、近い側に反対の種類の電気が寄るので引きつけられます。">
      <Svg id="6-4" w={640} h={400} label="＋と＋、−と−の玉は押し合って離れ、＋と−の玉は引き合って近づく。電気を帯びていない玉も、＋の玉に近い側に−が寄って引きつけられる。">
        <Pair ox={0} oy={0} title="同じ種類（＋と＋）" left="+" right="+" apart result="押し合う" />
        <Pair ox={320} oy={0} title="同じ種類（−と−）" left="-" right="-" apart result="押し合う" />
        <Pair ox={0} oy={200} title="違う種類（＋と−）" left="+" right="-" apart={false} result="引き合う" />
        <Pair ox={320} oy={200} title="＋と、電気を帯びていない物" left="+" right="+" apart={false} result="引きつけられる" neutral />
      </Svg>
    </Figure>
  )
}

/* ---------- 図6-5 ライデン瓶のつくり ---------- */

export function FigLeyden() {
  const leader = (x1: number, y1: number, x2: number, y2: number) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fig-muted)" />
  return (
    <Figure n="6-5" title="ライデン瓶では、内側と外側の金属の箔がガラスで隔てられている" caption="のちの時代のライデン瓶を簡単にした模式図です。最初のライデン瓶は水を入れたガラス瓶で、外側は手で持っていました。＋と−の向きは内側に＋の電気を送り込んだ場合の例です。">
      <Svg id="6-5" w={640} h={290} label="ライデン瓶。金属の玉と棒が内側の金属箔につながり、ガラスをはさんで外側にも金属箔がある。内側に＋、外側に−の電気がたまる。">
        <rect x={180} y={150} width={160} height={114} rx={6} fill="var(--fig-box2)" stroke="var(--fig-line)" />
        <rect x={196} y={110} width={128} height={146} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
        <rect x={206} y={150} width={108} height={100} rx={4} fill="var(--fig-box3)" stroke="var(--fig-line)" />
        <rect x={192} y={98} width={136} height={14} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <line x1={260} y1={50} x2={260} y2={200} stroke="var(--fig-line)" strokeWidth={3} />
        <path d="M260,200 L252,212 L266,224 L252,236 L262,248" fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
        <circle cx={260} cy={40} r={13} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={1.5} />
        {[172, 228].map((y) => [226, 294].map((x) => <Chg key={`${x}-${y}`} x={x} y={y} s="+" r={7} />))}
        {[176, 212, 246].map((y) => [188, 332].map((x) => <Chg key={`${x}-${y}`} x={x} y={y} s="-" r={6} />))}
        <T x={380} y={40} fs={12.5}>
          金属の玉と棒（内側の箔につながる）
        </T>
        {leader(374, 40, 276, 40)}
        <T x={380} y={120} fs={12.5}>
          ガラス（電気を通さない）
        </T>
        {leader(374, 120, 326, 128)}
        <T x={380} y={194} fs={12.5}>
          内側の金属箔：＋の電気がたまる
        </T>
        {leader(374, 194, 316, 194)}
        <T x={380} y={258} fs={12.5}>
          外側の金属箔：−の電気がたまる
        </T>
        {leader(374, 258, 342, 258)}
        <T x={40} y={150} fs={12} tone="muted">
          ＋と−はガラスに
        </T>
        <T x={40} y={168} fs={12} tone="muted">
          隔てられて、
        </T>
        <T x={40} y={186} fs={12} tone="muted">
          たまったまま残る
        </T>
      </Svg>
    </Figure>
  )
}

/* ---------- 図6-6 フランクリンの凧の実験（動） ---------- */

const KEY = { x: 206, y: 240 }
const KITE = { x: 520, y: 132 }
/** 麻ひもの上の点（u=0 が鍵、u=1 が凧）。少したるませる */
const onString = (u: number) => ({ x: KEY.x + (KITE.x - KEY.x) * u, y: KEY.y + (KITE.y + 26 - KEY.y) * u + 26 * Math.sin(Math.PI * u) })

export function FigKite() {
  return (
    <Anim
      n="6-6"
      title="フランクリンの凧の実験では雷雲のまわりの電気を集めた"
      still={3.6}
      period={6}
      caption="1752年6月の実験を描いた模式図です（大きさの比は実際と違います）。凧に雷は落ちていません。雷が落ちれば命にかかわる、きわめて危険な実験です。まねをしないでください。"
    >
      {(t) => {
        const rise = ease(t / 2)
        const spark = t > 2.5 && (t - 2.5) % 1 < 0.25
        const path = Array.from({ length: 41 }, (_, i) => onString(i / 40))
        return (
          <Svg id="6-6" w={720} h={330} label="雷雲の下で揚げた凧。凧の先のとがった針金が雷雲のまわりの電気を集め、ぬれた麻ひもを伝わって鍵に届く。フランクリンは小屋の戸口で絹のリボンを乾いたまま持ち、鍵に指を近づけると火花が飛び、鍵からライデン瓶に電気をためた。">
            <path d="M340,66 C318,66 318,36 344,36 C350,16 392,14 404,30 C420,8 470,10 480,28 C500,12 548,16 552,36 C584,32 596,64 572,68 Z" fill="var(--fig-box)" stroke="var(--fig-line)" />
            {[372, 412, 452, 492, 532].map((x) => (
              <Chg key={x} x={x} y={52} s="-" r={6} />
            ))}
            <T x={604} y={36} fs={12.5}>
              雷雲
            </T>
            <path d={`M${KITE.x},${KITE.y - 26} L${KITE.x + 22},${KITE.y} L${KITE.x},${KITE.y + 26} L${KITE.x - 22},${KITE.y} Z`} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <line x1={KITE.x} y1={KITE.y - 26} x2={KITE.x} y2={KITE.y - 46} stroke="var(--fig-line)" strokeWidth={2} />
            <T x={KITE.x + 12} y={KITE.y - 40} fs={12}>
              とがった針金
            </T>
            <T x={KITE.x + 30} y={KITE.y + 6} fs={12}>
              凧
            </T>
            <path d={path.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <T x={330} y={250} fs={12}>
              麻ひも（雨にぬれて電気を通す）
            </T>
            {[0.07, 0.11, 0.15, 0.19].map((u) => {
              const p = onString(u)
              const q = onString(u + 0.01)
              const along = Math.atan2(q.y - p.y, q.x - p.x)
              const a = along - (Math.PI / 2) * rise
              return <line key={u} x1={p.x} y1={p.y} x2={p.x + 10 * Math.cos(a)} y2={p.y + 10 * Math.sin(a)} stroke="var(--fig-line)" />
            })}
            {t > 0.3 &&
              [0, 1, 2, 3].map((k) => {
                const u = 1 - (((t - 0.3) * 0.35 + k * 0.25) % 1)
                const p = onString(u)
                return <circle key={k} cx={p.x} cy={p.y} r={3} fill="var(--fig-accent)" />
              })}
            {/* 小屋とフランクリン */}
            <path d="M14,176 L90,146 L166,176" fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <rect x={20} y={176} width={140} height={146} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <circle cx={110} cy={214} r={10} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <line x1={110} y1={224} x2={110} y2={282} stroke="var(--fig-line)" strokeWidth={2} />
            <line x1={110} y1={282} x2={98} y2={316} stroke="var(--fig-line)" strokeWidth={2} />
            <line x1={110} y1={282} x2={122} y2={316} stroke="var(--fig-line)" strokeWidth={2} />
            <line x1={110} y1={236} x2={148} y2={240} stroke="var(--fig-line)" strokeWidth={2} />
            <line x1={110} y1={244} x2={192} y2={266} stroke="var(--fig-line)" strokeWidth={2} />
            <line x1={148} y1={240} x2={KEY.x - 6} y2={KEY.y} stroke="var(--fig-muted)" strokeWidth={4} />
            <T x={20} y={110} fs={12}>
              小屋の戸口で、絹のリボン
            </T>
            <T x={20} y={128} fs={12}>
              （電気を通さない）を乾いたまま持つ
            </T>
            <line x1={150} y1={136} x2={176} y2={236} stroke="var(--fig-muted)" />
            <circle cx={KEY.x} cy={KEY.y} r={5} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <line x1={KEY.x} y1={KEY.y + 5} x2={KEY.x} y2={KEY.y + 14} stroke="var(--fig-line)" strokeWidth={2.5} />
            <T x={KEY.x - 2} y={KEY.y - 18} fs={12} anchor="middle">
              鍵
            </T>
            {spark && <path d={`M${KEY.x - 3},${KEY.y + 15} L${KEY.x - 9},${KEY.y + 19} L${KEY.x - 4},${KEY.y + 22} L${KEY.x - 11},${KEY.y + 27}`} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />}
            <line x1={KEY.x + 4} y1={KEY.y + 4} x2={315} y2={284} stroke="var(--fig-line)" />
            <rect x={300} y={284} width={30} height={38} rx={4} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <T x={340} y={302} fs={12}>
              ライデン瓶に電気をためる
            </T>
            <T x={222} y={274} fs={12} tone="acc">
              火花
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図6-7 クーロンのねじればかり ---------- */

export function FigTorsion() {
  const leader = (x1: number, y1: number, x2: number, y2: number) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fig-muted)" />
  return (
    <Figure n="6-7" title="クーロンのねじればかりは糸のねじれで小さな力を測る" caption="模式図です。玉どうしが押し合うと棒が回り、糸がねじれます。糸がねじれを戻そうとする力と、玉どうしが押し合う力が釣り合った所で棒が止まり、その角度から押し合う力の大きさが分かります。">
      <Svg id="6-7" w={660} h={320} label="ガラスの容器の中に、細い糸で水平の棒をつるす。棒の端の玉と固定した玉が同じ種類の電気を帯びて押し合い、棒が回って糸がねじれる。容器の目盛りでねじれた角度を読む。">
        <rect x={110} y={150} width={260} height={150} rx={6} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
        <rect x={228} y={44} width={24} height={106} fill="none" stroke="var(--fig-line)" />
        <rect x={218} y={28} width={44} height={16} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <line x1={240} y1={44} x2={240} y2={220} stroke="var(--fig-line)" />
        <line x1={175} y1={220} x2={310} y2={220} stroke="var(--fig-line)" strokeWidth={2} />
        <rect x={304} y={213} width={12} height={14} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <line x1={140} y1={150} x2={140} y2={212} stroke="var(--fig-line)" strokeWidth={2} />
        <Chg x={140} y={220} s="+" r={8} />
        <Chg x={168} y={220} s="+" r={8} />
        <Force x1={168} y1={244} x2={204} y2={244} />
        <T x={210} y={244} fs={12} tone="acc">
          押される力
        </T>
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1={116 + i * 10.5} y1={266} x2={116 + i * 10.5} y2={i % 4 === 0 ? 278 : 272} stroke="var(--fig-line)" />
        ))}
        <T x={396} y={36} fs={12.5}>
          つまみ（回して糸をねじる）
        </T>
        {leader(390, 36, 264, 36)}
        <T x={396} y={96} fs={12.5}>
          細い糸（ねじれの強さを調べてある）
        </T>
        {leader(390, 96, 244, 96)}
        <T x={20} y={196} fs={12.5}>
          固定した玉
        </T>
        {leader(86, 200, 132, 215)}
        <T x={396} y={220} fs={12.5}>
          糸でつるした棒（左の端に玉）
        </T>
        {leader(390, 220, 318, 220)}
        <T x={396} y={274} fs={12.5}>
          目盛り（棒が回った角度を読む）
        </T>
        {leader(390, 274, 360, 272)}
      </Svg>
    </Figure>
  )
}

/* ---------- 図6-8 距離による電気の力の変化（動・スライダー） ---------- */

const FRAC = ['1倍（基準）', '4分の1', '9分の1', '16分の1']

export function FigDistance() {
  const [d, setD] = useState(2)
  const unit = 110
  const x0 = 150
  const gx = (r: number) => 150 + ((r - 1) / 3) * 420
  const gy = (f: number) => 290 - f * 120
  const curve = Array.from({ length: 61 }, (_, i) => {
    const r = 1 + (i / 60) * 3
    return `${i ? 'L' : 'M'}${gx(r).toFixed(1)},${gy(1 / (r * r)).toFixed(1)}`
  }).join(' ')
  return (
    <Anim
      n="6-8"
      title="距離が2倍になると、電気の力は4分の1になる"
      still={2}
      period={4}
      controls={<Range label="玉の間の距離" min={1} max={4} step={1} value={d} onChange={setD} format={(v) => `${v}倍`} />}
      caption="同じ種類の電気を帯びた2つの玉が押し合う力です。青の矢印の長さが力の大きさを表します。スライダーで距離を変えると、下のグラフの点がその距離での力の大きさを示します。距離が3倍なら9分の1、4倍なら16分の1になります。"
    >
      {(t) => {
        const r = 1 + (d - 1) * ease(t / 1.5)
        const f = 1 / (r * r)
        const bx = x0 + unit * r
        const len = 110 * f
        return (
          <Svg id="6-8" w={680} h={318} label="同じ種類の電気を帯びた2つの玉。距離を2倍にすると押し合う力は4分の1、3倍にすると9分の1になる。下のグラフは距離と力の大きさの関係。">
            <Chg x={x0} y={56} s="+" r={14} />
            <Chg x={bx} y={56} s="+" r={14} />
            <Force x1={x0 - 16} y1={56} x2={x0 - 16 - len} y2={56} />
            <Force x1={bx + 16} y1={56} x2={bx + 16 + len} y2={56} />
            <Arrow x1={x0} y1={92} x2={bx} y2={92} both />
            <T x={(x0 + bx) / 2} y={110} anchor="middle" fs={12.5}>
              {`距離 ${Math.abs(r - Math.round(r)) < 0.05 ? Math.round(r) : r.toFixed(1)}倍`}
            </T>
            <line x1={gx(1)} y1={gy(0)} x2={gx(4) + 20} y2={gy(0)} stroke="var(--fig-line)" />
            <line x1={gx(1)} y1={gy(0)} x2={gx(1)} y2={gy(1) - 14} stroke="var(--fig-line)" />
            <T x={gx(1) - 8} y={gy(1) - 18} anchor="end" fs={12}>
              力の大きさ
            </T>
            <T x={gx(4) + 26} y={gy(0)} fs={12}>
              距離
            </T>
            {[1, 2, 3, 4].map((k) => (
              <T key={k} x={gx(k)} y={gy(0) + 16} anchor="middle" fs={11.5} tone="muted">
                {`${k}倍`}
              </T>
            ))}
            <path d={curve} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} />
            <circle cx={gx(r)} cy={gy(f)} r={5.5} fill="var(--fig-accent)" />
            {t >= 1.5 && (
              <T x={450} y={180} fs={13} tone="acc">
                {`距離 ${d}倍 → 力は ${FRAC[d - 1]}`}
              </T>
            )}
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図6-9 ガルヴァーニとボルタの考え ---------- */

function Frog({ id, label, volta }: { id: string; label: string; volta?: boolean }) {
  return (
    <Svg id={id} w={330} h={230} label={label} fit>
      <rect x={14} y={38} width={300} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={14} y={24} fs={12}>
        鉄の柵
      </T>
      <path d="M90,48 L90,64 Q90,78 80,78" fill="none" stroke="var(--fig-line)" strokeWidth={2.5} />
      <ellipse cx={86} cy={96} rx={10} ry={16} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <path d="M80,108 Q66,140 70,170 Q72,190 62,206 L74,206 Q84,186 84,160 Q86,130 86,112 Z" fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <path d="M92,108 Q106,140 102,170 Q100,190 110,206 L98,206 Q88,186 88,160 Q86,130 86,112 Z" fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={100} y={66} fs={12}>
        真ちゅうのかぎ
      </T>
      {volta && <circle cx={90} cy={48} r={8} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />}
      {volta ? (
        <>
          <T x={140} y={104} fs={12.5}>
            電気は、種類の違う
          </T>
          <T x={140} y={124} fs={12.5}>
            2つの金属から生まれる
          </T>
          <T x={140} y={160} fs={12.5} tone="muted">
            カエルの脚は、電気を
          </T>
          <T x={140} y={180} fs={12.5} tone="muted">
            感じ取る道具にすぎない
          </T>
        </>
      ) : (
        <>
          <T x={140} y={104} fs={12.5}>
            電気は、カエルの
          </T>
          <T x={140} y={124} fs={12.5}>
            体の中にある（動物電気）
          </T>
          <T x={140} y={160} fs={12.5} tone="muted">
            金属は、その電気の
          </T>
          <T x={140} y={180} fs={12.5} tone="muted">
            通り道になる
          </T>
        </>
      )}
    </Svg>
  )
}

export function FigGalvaniVolta() {
  return (
    <Figure n="6-9" title="カエルの脚が縮む理由について、ガルヴァーニとボルタの考えは分かれた" caption="1786年9月のガルヴァーニの観察をもとにした模式図です。「ボルタの考え」の図の青い丸は、2種類の金属が触れ合う所を示します。現在の理解では、どちらの考えにも正しい部分がありました。">
      <Compare
        panels={[
          { label: 'ガルヴァーニの考え', children: <Frog id="6-9a" label="鉄の柵に真ちゅうのかぎで掛けたカエルの脚。ガルヴァーニは、電気はカエルの体の中にあり、金属はその通り道だと考えた。" />, note: '神経と筋肉が自ら電気の信号を生むことは、のちに確かめられた。' },
          { label: 'ボルタの考え', children: <Frog id="6-9b" volta label="同じカエルの脚。ボルタは、電気は種類の違う2つの金属が触れ合う所から生まれ、脚は電気を感じ取るだけだと考えた。" />, note: '違う金属と湿った物で電気が生まれることは正しく、電池につながった。' },
        ]}
      />
    </Figure>
  )
}

/* ---------- 図6-10 ボルタの電池（動・スライダー） ---------- */

const PILE = { x: 110, w: 100, base: 290, unit: 22 }

export function FigPile() {
  const [n, setN] = useState(4)
  const top = PILE.base - n * PILE.unit
  const right = PILE.x + PILE.w
  const wx = 470
  const yTop = top + 4
  const yBot = PILE.base - 5
  // 電流の向き（＋の端から導線を通って−の端へ）に沿った道
  const segs = [
    { x1: right, y1: yTop, x2: wx, y2: yTop },
    { x1: wx, y1: yTop, x2: wx, y2: yBot },
    { x1: wx, y1: yBot, x2: right, y2: yBot },
  ]
  const lens = segs.map((s) => Math.hypot(s.x2 - s.x1, s.y2 - s.y1))
  const total = lens.reduce((a, b) => a + b, 0)
  const pointAt = (s: number) => {
    for (let i = 0; i < segs.length; i++) {
      if (s <= lens[i]) {
        const g = segs[i]
        const u = s / lens[i]
        return { x: g.x1 + (g.x2 - g.x1) * u, y: g.y1 + (g.y2 - g.y1) * u }
      }
      s -= lens[i]
    }
    return { x: right, y: yBot }
  }
  // ponytail: 電流の強さは組の数に対して少しずつ伸びが鈍る形の目安（内部の抵抗の模式）
  const speed = (70 * n) / (1 + 0.12 * n)
  return (
    <Anim
      n="6-10"
      title="亜鉛・塩水の厚紙・銀の組を積み重ねるほど、電圧が大きくなる"
      still={1}
      period={6}
      controls={<Range label="積み重ねる組の数" min={1} max={10} step={1} value={n} onChange={setN} format={(v) => `${v}組`} />}
      caption="ボルタの電池の模式図です。1組は亜鉛の円板、塩水をしみこませた厚紙、銀の円板の3枚です。組の数を増やすと電圧が大きくなり、同じ導線を流れる電流も強くなります（点の動きの速さで表しています）。ボルタは数十組を重ねました。"
    >
      {(t) => {
        const dots = Math.floor(total / 30)
        return (
          <Svg id="6-10" w={680} h={316} label="亜鉛、塩水をしみこませた厚紙、銀の3枚を1組として積み重ねた電池。上の端と下の端を導線でつなぐと、電流が流れ続ける。組の数を増やすと電圧が大きくなる。">
            {Array.from({ length: n }, (_, i) => {
              const y = PILE.base - (i + 1) * PILE.unit
              return (
                <g key={i}>
                  <rect x={PILE.x} y={y} width={PILE.w} height={8} fill="var(--fig-box3)" stroke="var(--fig-line)" />
                  <rect x={PILE.x + 4} y={y + 8} width={PILE.w - 8} height={6} fill="var(--fig-box2)" stroke="var(--fig-line)" />
                  <rect x={PILE.x} y={y + 14} width={PILE.w} height={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
                </g>
              )
            })}
            <T x={92} y={306} anchor="end" fs={12}>
              亜鉛
            </T>
            <line x1={94} y1={300} x2={PILE.x} y2={PILE.base - 4} stroke="var(--fig-muted)" />
            <T x={92} y={278} anchor="end" fs={12}>
              厚紙（塩水）
            </T>
            <line x1={94} y1={278} x2={PILE.x + 4} y2={PILE.base - 11} stroke="var(--fig-muted)" />
            <T x={92} y={250} anchor="end" fs={12}>
              銀
            </T>
            <line x1={94} y1={252} x2={PILE.x} y2={PILE.base - 18} stroke="var(--fig-muted)" />
            {segs.map((g, i) => (
              <line key={i} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke="var(--fig-line)" strokeWidth={2} />
            ))}
            {Array.from({ length: dots }, (_, k) => {
              const p = pointAt((((t * speed + (k * total) / dots) % total) + total) % total)
              return <circle key={k} cx={p.x} cy={p.y} r={3.5} fill="var(--fig-accent)" />
            })}
            <T x={right + 8} y={yTop - 14} fs={12}>
              ＋の端（銀）
            </T>
            <T x={right + 8} y={yBot + 16} fs={12}>
              −の端（亜鉛）
            </T>
            <Arrow x1={320} y1={yTop - 14} x2={376} y2={yTop - 14} />
            <T x={384} y={yTop - 14} fs={12}>
              電流の向き
            </T>
            <rect x={600} y={290 - n * 24} width={36} height={n * 24} fill="var(--fig-box3)" stroke="var(--fig-line)" />
            <line x1={590} y1={290} x2={646} y2={290} stroke="var(--fig-line)" />
            <T x={618} y={306} anchor="middle" fs={12}>
              電圧
            </T>
            <T x={570} y={40} anchor="end" fs={12.5}>
              {n === 1 ? '1組：これを電圧の基準とする' : `${n}組：電圧は1組のときの${n}倍`}
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}
