import { useState } from 'react'
import { Figure } from '../components/content'
import { Arrow, Svg, T } from '../components/diagram'
import { Anim } from '../components/anim'
import { Choice, Range } from '../components/controls'
import { Force, Trail, Vel, ease } from './common'

/*
 * 第8章の図。電流の向きは黒の細い矢印に「電流」の文字を添えて示す（力は青の太い矢印、速さは黒の矢印）。
 * 磁石の極は N・S の文字で示す（色だけで区別しない）。
 */

const DEG = Math.PI / 180

/* ---------- 共通の部品 ---------- */

/** 方位磁針の針。(ux, uy) は中心からN極の先までのベクトル。N極は塗り、S極は白抜き */
function Needle({ x, y, ux, uy, w = 4 }: { x: number; y: number; ux: number; uy: number; w?: number }) {
  const L = Math.hypot(ux, uy) || 1
  const px = (-uy / L) * w
  const py = (ux / L) * w
  return (
    <g stroke="var(--fig-line)" strokeWidth={1.2} strokeLinejoin="round">
      <path d={`M${x + ux},${y + uy} L${x + px},${y + py} L${x - px},${y - py} Z`} fill="var(--fig-line)" />
      <path d={`M${x - ux},${y - uy} L${x + px},${y + py} L${x - px},${y - py} Z`} fill="var(--fig-bg)" />
    </g>
  )
}

/** 検流計。deg は針の振れ（右が正）。下に名前を出す */
function Galv({ x, y, r = 34, deg, label = '検流計' }: { x: number; y: number; r?: number; deg: number; label?: string }) {
  const py = y + r * 0.55
  const L = r * 1.2
  const a = deg * DEG
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
      {[-60, -30, 0, 30, 60].map((d) => (
        <line key={d} x1={x + Math.sin(d * DEG) * (L - 6)} y1={py - Math.cos(d * DEG) * (L - 6)} x2={x + Math.sin(d * DEG) * L} y2={py - Math.cos(d * DEG) * L} stroke="var(--fig-muted)" />
      ))}
      <line x1={x} y1={py} x2={x + Math.sin(a) * (L - 4)} y2={py - Math.cos(a) * (L - 4)} stroke="var(--fig-line)" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={x} cy={py} r={3} fill="var(--fig-line)" />
      <T x={x} y={y + r + 14} anchor="middle" fs={12}>
        {label}
      </T>
    </g>
  )
}

/** 電池の箱。plus が left・right なら箱の中の両端に、top・bottom なら箱の右に + と − を書く（導線と重ねない） */
function Battery({ x, y, w, h = 28, plus }: { x: number; y: number; w?: number; h?: number; plus: 'left' | 'right' | 'top' | 'bottom' }) {
  const side = plus === 'left' || plus === 'right'
  const W = w ?? (side ? 76 : 56)
  const [p, m] = side
    ? [
        [x + (plus === 'left' ? 10 : W - 10), y + h / 2],
        [x + (plus === 'left' ? W - 10 : 10), y + h / 2],
      ]
    : [
        [x + W + 9, plus === 'top' ? y + 7 : y + h - 7],
        [x + W + 9, plus === 'top' ? y + h - 7 : y + 7],
      ]
  return (
    <g>
      <rect x={x} y={y} width={W} height={h} rx={4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={x + W / 2} y={y + h / 2} anchor="middle" fs={12}>
        電池
      </T>
      <T x={p[0]} y={p[1]} anchor="middle" fs={13} bold>
        +
      </T>
      <T x={m[0]} y={m[1]} anchor="middle" fs={13} bold>
        −
      </T>
    </g>
  )
}

/** 横向きのコイル（らせん）。layer='back' は奥側の線、'front' は手前側の線。手前の線は上から下へ巻いている */
function Helix({ x0, x1, cy, h, turns, layer }: { x0: number; x1: number; cy: number; h: number; turns: number; layer: 'back' | 'front' }) {
  const p = (x1 - x0) / turns
  return (
    <g>
      {Array.from({ length: turns }, (_, i) => {
        const xa = x0 + i * p
        return layer === 'back' ? (
          <line key={i} x1={xa} y1={cy + h / 2} x2={xa + p / 2} y2={cy - h / 2} stroke="var(--fig-muted)" strokeWidth={1.5} />
        ) : (
          <line key={i} x1={xa + p / 2} y1={cy - h / 2} x2={xa + p} y2={cy + h / 2} stroke="var(--fig-line)" strokeWidth={2.4} strokeLinecap="round" />
        )
      })}
    </g>
  )
}

/** 棒磁石（横向き）。左半分の極を left で指定する。hide に入る位置の文字は出さない（コイルの線と重ねない） */
function BarMagnet({ x, y, w, h, left, hide }: { x: number; y: number; w: number; h: number; left: 'N' | 'S'; hide?: [number, number] }) {
  const right = left === 'N' ? 'S' : 'N'
  const show = (cx: number) => !hide || cx < hide[0] || cx > hide[1]
  return (
    <g>
      <rect x={x} y={y} width={w / 2} height={h} fill={left === 'N' ? 'var(--fig-box2)' : 'var(--fig-box5)'} stroke="var(--fig-line)" />
      <rect x={x + w / 2} y={y} width={w / 2} height={h} fill={right === 'N' ? 'var(--fig-box2)' : 'var(--fig-box5)'} stroke="var(--fig-line)" />
      {show(x + w / 4) && (
        <T x={x + w / 4} y={y + h / 2} anchor="middle" fs={13} bold>
          {left}
        </T>
      )}
      {show(x + (3 * w) / 4) && (
        <T x={x + (3 * w) / 4} y={y + h / 2} anchor="middle" fs={13} bold>
          {right}
        </T>
      )}
    </g>
  )
}

/** 時間と電流のグラフの線。f(t) は -1〜1 程度の値。t0〜t1 の範囲を描く */
function curve(f: (t: number) => number, t0: number, t1: number, x0: number, x1: number, T0: number, T1: number, y0: number, amp: number) {
  const n = Math.max(2, Math.ceil(((t1 - t0) / (T1 - T0)) * 240))
  let d = ''
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n
    const x = x0 + ((t - T0) / (T1 - T0)) * (x1 - x0)
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${(y0 - amp * f(t)).toFixed(1)}`
  }
  return d
}

/* ---------- 図8-1 年表 ---------- */

const ROAD = [
  { y: '1800年', who: 'ボルタ', what: ['電池を作り', '電流を流し続ける'] },
  { y: '1820年', who: 'エルステッド', what: ['電流が', '方位磁針を動かす'] },
  { y: '1820年', who: 'アンペール', what: ['電流どうしが', '力を及ぼし合う'] },
  { y: '1821年', who: 'ファラデー', what: ['電磁回転', '（電流で回り続ける）'] },
  { y: '1825年', who: 'スタージャン', what: ['鉄の芯を入れた', '電磁石'] },
  { y: '1831年', who: 'ファラデー', what: ['電磁誘導の発見'] },
  { y: '1832年', who: 'ピクシー', what: ['手回しの発電機'] },
  { y: '1834年', who: 'ヤコビ', what: ['電磁石を使った', 'モーター'] },
  { y: '1866年', who: 'ジーメンス', what: ['永久磁石のない', '発電機'] },
]

export function FigRoad() {
  return (
    <Figure n="8-1" title="電池の発明から約70年間の主な出来事" caption="上下に交互に並べています。点の間隔は年数に比例していません。1820年から14年ほどの間に、電流で物を動かす装置と、物を動かして電流を作る装置がそろいました。">
      <Svg
        id="8-1"
        w={800}
        h={250}
        label="1800年にボルタが電池を作り、1820年にエルステッドが電流で方位磁針が動くことを、アンペールが電流どうしの力を見つけた。1821年にファラデーの電磁回転、1825年にスタージャンの電磁石、1831年にファラデーの電磁誘導の発見、1832年にピクシーの発電機、1834年にヤコビのモーター、1866年にジーメンスの発電機。"
      >
        <Arrow x1={15} y1={125} x2={788} y2={125} />
        {ROAD.map((r, i) => {
          const x = 52 + i * 87
          const up = i % 2 === 0
          const ty = up ? 26 : 150
          return (
            <g key={r.y + r.who}>
              <circle cx={x} cy={125} r={6} fill={i === 5 ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" strokeWidth={1.5} />
              <line x1={x} y1={up ? 104 : 131} x2={x} y2={up ? 119 : 144} stroke="var(--fig-line)" />
              <T x={x} y={ty} anchor="middle" bold>
                {r.y}
              </T>
              <T x={x} y={ty + 19} anchor="middle" fs={12.5}>
                {r.who}
              </T>
              {r.what.map((w, j) => (
                <T key={j} x={x} y={ty + 38 + j * 17} anchor="middle" fs={11.5} tone="muted">
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

/* ---------- 図8-2 エルステッドの実験（動） ---------- */

/** [始まる時刻, 針の振れ（度、東が正）, 電流（1 北向き, -1 南向き, 0 なし）] */
const OE_STEPS: [number, number, number][] = [
  [0, 0, 0],
  [2, -55, 1],
  [5.5, 0, 0],
  [7, 55, -1],
  [10.5, 0, 0],
]

export function FigOersted() {
  const cx = 200
  const cy = 150
  return (
    <Anim
      n="8-2"
      title="電流を流すと、導線の下の方位磁針が向きを変える"
      still={4}
      period={12}
      caption="上から見た模式図です。導線は方位磁針の少し上を、南北の向きに通っています。電流を北向きに流すとN極（黒い側）は西へ、南向きに流すと東へ振れます。振れの大きさは電流の強さと導線までの距離で変わります。"
    >
      {(t) => {
        let k = 0
        while (k + 1 < OE_STEPS.length && t >= OE_STEPS[k + 1][0]) k++
        const [t0, target, cur] = OE_STEPS[k]
        const prev = k > 0 ? OE_STEPS[k - 1][1] : 0
        const ang = (prev + (target - prev) * ease((t - t0) / 0.9)) * DEG
        const L = 62
        return (
          <Svg id="8-2" w={640} h={300} label="方位磁針の上に南北の向きに導線を通す。電流を北向きに流すと針のN極は西へ振れ、南向きに流すと東へ振れ、電流を切ると北に戻る。">
            <circle cx={cx} cy={cy} r={95} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={80} fill="var(--fig-bg)" stroke="var(--fig-muted)" />
            <T x={cx - 12} y={36} anchor="end" fs={12.5}>
              北
            </T>
            <T x={cx - 12} y={266} anchor="end" fs={12.5}>
              南
            </T>
            <T x={cx - 112} y={cy} anchor="middle" fs={12.5}>
              西
            </T>
            <T x={cx + 112} y={cy} anchor="middle" fs={12.5}>
              東
            </T>
            <Needle x={cx} y={cy} ux={L * Math.sin(ang)} uy={-L * Math.cos(ang)} w={7} />
            <circle cx={cx} cy={cy} r={4} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            {/* 導線（針の上を通る。下の針が見えるよう半透明） */}
            <line x1={cx} y1={12} x2={cx} y2={288} stroke="var(--fig-line)" strokeWidth={6} strokeOpacity={0.35} strokeLinecap="round" />
            {cur !== 0 && (
              <>
                <Arrow x1={cx + 14} y1={cur > 0 ? 54 : 18} x2={cx + 14} y2={cur > 0 ? 18 : 54} />
                <Arrow x1={cx + 14} y1={cur > 0 ? 284 : 248} x2={cx + 14} y2={cur > 0 ? 248 : 284} />
                <T x={cx + 22} y={36} fs={12}>
                  電流
                </T>
              </>
            )}
            <T x={360} y={60} fs={13} bold>
              {cur === 0 ? '電流：なし' : cur > 0 ? '電流：北向き' : '電流：南向き'}
            </T>
            <T x={360} y={86} fs={13} tone={cur === 0 ? undefined : 'acc'}>
              {cur === 0 ? '針は北を指す' : cur > 0 ? 'N極が西へ振れる' : 'N極が東へ振れる'}
            </T>
            <T x={360} y={196} fs={12} tone="muted">
              太い線：導線（針の少し上を通る）
            </T>
            <T x={360} y={218} fs={12} tone="muted">
              黒い側：針のN極
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図8-3 導線を囲む方位磁針 ---------- */

function WirePanel({ cx, up }: { cx: number; up: boolean }) {
  const cy = 170
  const R = 100
  const r = 48
  const s = up ? 1 : -1
  const comps = Array.from({ length: 8 }, (_, k) => (22.5 + 45 * k) * DEG)
  const one = (a: number) => {
    const x = cx + R * Math.cos(a)
    const y = cy + r * Math.sin(a)
    // 上から見て反時計回りの接線（電流が上向きのとき N極が指す向き）
    return (
      <g key={a}>
        <ellipse cx={x} cy={y} rx={18} ry={18 * (r / R) + 3} fill="var(--fig-bg)" stroke="var(--fig-muted)" />
        <Needle x={x} y={y} ux={s * 16 * Math.sin(a)} uy={-s * 16 * (r / R) * Math.cos(a)} w={3.2} />
      </g>
    )
  }
  const ay = 86
  const arc = up
    ? `M${cx + 34 * Math.cos(160 * DEG)},${ay + 11 * Math.sin(160 * DEG)} A34,11 0 0 0 ${cx + 34 * Math.cos(20 * DEG)},${ay + 11 * Math.sin(20 * DEG)}`
    : `M${cx + 34 * Math.cos(20 * DEG)},${ay + 11 * Math.sin(20 * DEG)} A34,11 0 0 1 ${cx + 34 * Math.cos(160 * DEG)},${ay + 11 * Math.sin(160 * DEG)}`
  return (
    <g>
      <T x={cx} y={16} anchor="middle" bold>
        {up ? '電流が上向き' : '電流が下向き'}
      </T>
      <line x1={cx} y1={cy + 62} x2={cx} y2={252} stroke="var(--fig-line)" strokeWidth={3} />
      <ellipse cx={cx} cy={cy} rx={145} ry={62} fill="var(--fig-box)" stroke="var(--fig-line)" />
      {comps.filter((a) => Math.sin(a) < 0).map(one)}
      <line x1={cx} y1={38} x2={cx} y2={cy} stroke="var(--fig-line)" strokeWidth={3} />
      <Arrow x1={cx + 12} y1={up ? 76 : 40} x2={cx + 12} y2={up ? 40 : 76} />
      <T x={cx + 20} y={52} fs={12}>
        電流
      </T>
      <Arrow d={arc} accent={false} />
      {comps.filter((a) => Math.sin(a) >= 0).map(one)}
      <T x={cx} y={274} anchor="middle" fs={12.5} tone="acc">
        {up ? '上から見て反時計回りの向き' : '上から見て時計回りの向き'}
      </T>
    </g>
  )
}

export function FigAround() {
  return (
    <Figure
      n="8-3"
      title="導線のまわりの方位磁針は、導線を囲む円に沿った向きを指す"
      caption="縦に立てた導線のまわりに、方位磁針を円く並べた模式図です（地球の磁石の力は無視しています）。黒い側がN極です。電流の向きに右ねじを進めるとき、ねじを回す向きにN極がそろいます。"
    >
      <Svg id="8-3" w={720} h={290} label="縦の導線に上向きの電流を流すと、まわりの方位磁針のN極は上から見て反時計回りの向きにそろう。下向きに流すと時計回りの向きにそろう。">
        <WirePanel cx={180} up />
        <WirePanel cx={540} up={false} />
      </Svg>
    </Figure>
  )
}

/* ---------- 図8-4 平行な2本の電流（動・切り替え） ---------- */

export function FigAmpere() {
  const [dir, setDir] = useState<'same' | 'opp'>('same')
  const same = dir === 'same'
  const xa = 250
  const xb = 370
  return (
    <Anim
      n="8-4"
      title="電流が同じ向きなら引き合い、逆向きなら反発し合う"
      still={2.5}
      period={5}
      controls={
        <Choice
          label="電流の向き"
          options={[
            { value: 'same', label: '同じ向き' },
            { value: 'opp', label: '逆向き' },
          ]}
          value={dir}
          onChange={setDir}
        />
      }
      caption="上下を固定した、曲がりやすい2本の導線の模式図です（電池は省略）。青の矢印は導線どうしが及ぼし合う力、黒の細い矢印は電流の向きです。「電流の向き」を切り替えると、力の向きが逆になります。"
    >
      {(t) => {
        const on = t >= 0.6 && t < 3.8
        const d = 16 * (t < 3.8 ? ease((t - 0.6) / 0.8) : 1 - ease((t - 3.8) / 0.8))
        const da = same ? d : -d
        const wire = (x: number, dx: number) => <path d={`M${x},44 Q${x + 2 * dx},140 ${x},236`} fill="none" stroke="var(--fig-line)" strokeWidth={2.5} />
        return (
          <Svg id="8-4" w={680} h={280} label="平行な2本の導線に同じ向きの電流を流すと2本は引き合い、逆向きに流すと反発し合う。">
            {[xa, xb].map((x) => (
              <g key={x}>
                <rect x={x - 12} y={32} width={24} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
                <rect x={x - 12} y={236} width={24} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
              </g>
            ))}
            {wire(xa, da)}
            {wire(xb, -da)}
            {on && (
              <>
                <Arrow x1={xa - 20} y1={62} x2={xa - 20} y2={102} />
                <Arrow x1={xb + 20} y1={same ? 62 : 102} x2={xb + 20} y2={same ? 102 : 62} />
                <T x={xa - 28} y={82} anchor="end" fs={12}>
                  電流
                </T>
                <T x={xb + 28} y={82} fs={12}>
                  電流
                </T>
                {same ? (
                  <>
                    <Force x1={xa + da + 6} y1={140} x2={xa + da + 38} y2={140} />
                    <Force x1={xb - da - 6} y1={140} x2={xb - da - 38} y2={140} />
                  </>
                ) : (
                  <>
                    <Force x1={xa + da - 6} y1={140} x2={xa + da - 38} y2={140} />
                    <Force x1={xb - da + 6} y1={140} x2={xb - da + 38} y2={140} />
                  </>
                )}
              </>
            )}
            <T x={470} y={110} fs={13} bold>
              {on ? (same ? '電流が同じ向き' : '電流が逆向き') : '電流を流していない'}
            </T>
            <T x={470} y={136} fs={13} tone={on ? 'acc' : undefined}>
              {on ? (same ? '→ 2本は引き合う' : '→ 2本は反発し合う') : '→ 力ははたらかない'}
            </T>
            <T x={470} y={186} fs={12} tone="muted">
              静電気とは逆の関係
            </T>
            <T x={470} y={206} fs={12} tone="muted">
              （同じ種類の電気は反発する）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図8-5 コイルと電磁石 ---------- */

function CoilPanel({ cx, core }: { cx: number; core: boolean }) {
  const cy = 106
  const x0 = cx - 80
  const x1 = cx + 80
  const h = 60
  return (
    <g>
      <T x={cx} y={18} anchor="middle" bold>
        {core ? '鉄の芯を入れる（電磁石）' : 'コイルだけ'}
      </T>
      <Helix x0={x0} x1={x1} cy={cy} h={h} turns={8} layer="back" />
      {core && <rect x={cx - 98} y={cy - 13} width={196} height={26} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />}
      <Helix x0={x0} x1={x1} cy={cy} h={h} turns={8} layer="front" />
      <Arrow x1={x0 - 10} y1={186} x2={x0 - 10} y2={150} />
      <Arrow x1={x1 + 10} y1={150} x2={x1 + 10} y2={186} />
      <T x={x0 - 16} y={168} anchor="end" fs={12}>
        電流
      </T>
      <T x={cx - 110} y={cy - 46} anchor="middle" fs={14} bold>
        S
      </T>
      <T x={cx + 110} y={cy - 46} anchor="middle" fs={14} bold>
        N
      </T>
      {core &&
        [0, 1, 2].map((i) => <rect key={i} x={cx + 99} y={cy - 6 + i * 21} width={9} height={20} rx={4} fill="none" stroke="var(--fig-line)" strokeWidth={1.6} />)}
      {core && (
        <T x={cx + 116} y={cy + 30} fs={11.5} tone="muted">
          鉄のクリップ
        </T>
      )}
      <polyline points={`${x0},${cy + h / 2} ${x0},196 ${cx - 38},196`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      <polyline points={`${x1},${cy + h / 2} ${x1},196 ${cx + 38},196`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      <Battery x={cx - 38} y={182} plus="left" />
      <T x={cx} y={240} anchor="middle" fs={12.5} tone="acc">
        {core ? '引きつける力がずっと強くなる' : '棒磁石と同じはたらきをする'}
      </T>
    </g>
  )
}

export function FigElectromagnet() {
  return (
    <Figure
      n="8-5"
      title="電流を流したコイルは棒磁石と同じはたらきをし、鉄の芯を入れると強くなる"
      caption="模式図です。太い線はコイルの手前側、細い線は奥側の導線です。黒の細い矢印は電流の向きで、電流は手前側の導線を上から下へ流れます。電流の向きを逆にすると、N極とS極が入れ替わります。電流を切ると、鉄の芯はほとんど磁石のはたらきを失います。"
    >
      <Svg id="8-5" w={720} h={256} label="電池につないだコイルの両端にN極とS極ができる。コイルの中に鉄の芯を入れた電磁石は、鉄のクリップを引きつける力がずっと強くなる。">
        <CoilPanel cx={180} core={false} />
        <CoilPanel cx={530} core />
      </Svg>
    </Figure>
  )
}

/* ---------- 図8-6 ファラデーの電磁回転（動） ---------- */

export function FigRotation() {
  const cx = 230
  const sy = 200 // 水銀の面
  const R = 85
  const r = 17
  return (
    <Anim
      n="8-6"
      title="電流を流した導線が、磁石のまわりを回り続ける"
      still={2.6}
      period={4}
      caption="1821年のファラデーの実験の模式図です。器の底に立てた棒磁石のまわりに水銀を入れ、上からつるした導線の先を水銀にひたします。電流は電池から導線を下り、水銀を通って電池に戻ります。磁石のS極は水銀の中にあります。点線は導線の先が通る道筋です。"
    >
      {(t) => {
        const th = 150 * DEG + (2 * Math.PI * t) / 4
        const ex = cx + R * Math.cos(th)
        const ey = sy + r * Math.sin(th)
        const back = Math.sin(th) < 0
        const tx = -Math.sin(th)
        const ty = (r / R) * Math.cos(th)
        const tl = Math.hypot(tx, ty)
        const wire = (
          <g>
            <line x1={cx} y1={44} x2={ex} y2={ey} stroke="var(--fig-line)" strokeWidth={2.5} />
            <Arrow x1={cx + (ex - cx) * 0.3} y1={44 + (ey - 44) * 0.3} x2={cx + (ex - cx) * 0.52} y2={44 + (ey - 44) * 0.52} />
          </g>
        )
        const magnet = (
          <g>
            <rect x={cx - 12} y={108} width={24} height={sy - 108} fill="var(--fig-box2)" stroke="var(--fig-line)" />
          </g>
        )
        return (
          <Svg id="8-6" w={680} h={320} label="水銀を入れた器の中央に棒磁石を立て、上からつるした導線の先を水銀にひたして電流を流すと、導線は磁石のまわりを回り続ける。">
            {/* 器と水銀 */}
            <path d={`M${cx - 120},120 L${cx - 120},280 A120,24 0 0 0 ${cx + 120},280 L${cx + 120},120`} fill="none" stroke="var(--fig-line)" />
            <path d={`M${cx - 120},${sy} L${cx - 120},280 A120,24 0 0 0 ${cx + 120},280 L${cx + 120},${sy} Z`} fill="var(--fig-box)" stroke="none" />
            <ellipse cx={cx} cy={sy} rx={120} ry={24} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <Trail d={`M${cx - R},${sy} A${R},${r} 0 1 0 ${cx + R},${sy} A${R},${r} 0 1 0 ${cx - R},${sy}`} />
            {back && wire}
            {magnet}
            {!back && wire}
            <ellipse cx={cx} cy={120} rx={120} ry={24} fill="none" stroke="var(--fig-line)" />
            <Vel x1={ex} y1={ey} x2={ex + (tx / tl) * 34} y2={ey + (ty / tl) * 34} />
            <T x={cx + 70} y={262} fs={12.5} tone="muted">
              水銀
            </T>
            {/* 棒磁石の説明 */}
            <line x1={98} y1={90} x2={cx - 13} y2={114} stroke="var(--fig-muted)" />
            <T x={20} y={70} fs={12.5}>
              棒磁石
            </T>
            <T x={20} y={88} fs={12} tone="muted">
              （上がN極）
            </T>
            {/* つり下げる点と電池への配線 */}
            <circle cx={cx} cy={44} r={5} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={1.5} />
            <polyline points={`${cx + 5},44 480,44 480,140`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <polyline points={`480,176 480,314 ${cx},314 ${cx},304`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <Arrow x1={430} y1={44} x2={370} y2={44} />
            <T x={400} y={28} anchor="middle" fs={12}>
              電流
            </T>
            <Battery x={452} y={144} h={30} plus="top" />
            <T x={530} y={210} fs={13} tone="acc">
              上から見ると
            </T>
            <T x={530} y={230} fs={13} tone="acc">
              時計回りに回り続ける
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図8-7 鉄の輪の実験（動） ---------- */

const RING_ON = 1.5
const RING_OFF = 5
const ringA = (t: number) => (t >= RING_ON && t < RING_OFF ? 1 : 0)
const ringB = (t: number) => (t >= RING_ON ? Math.exp(-(t - RING_ON) / 0.22) : 0) - (t >= RING_OFF ? Math.exp(-(t - RING_OFF) / 0.22) : 0)

export function FigRing() {
  const cx = 300
  const cy = 118
  const R = 72
  const turns = (a0: number, a1: number) =>
    Array.from({ length: 9 }, (_, i) => {
      const a = (a0 + ((a1 - a0) * i) / 8) * DEG
      return <line key={i} x1={cx + (R - 12) * Math.cos(a)} y1={cy + (R - 12) * Math.sin(a)} x2={cx + (R + 12) * Math.cos(a)} y2={cy + (R + 12) * Math.sin(a)} stroke="var(--fig-line)" strokeWidth={2.2} />
    })
  const pa = (a: number) => [cx + (R + 12) * Math.cos(a * DEG), cy + (R + 12) * Math.sin(a * DEG)] as const
  const [a1x, a1y] = pa(212)
  const [a2x, a2y] = pa(148)
  const [b1x, b1y] = pa(-32)
  const [b2x, b2y] = pa(32)
  const gx0 = 130
  const gx1 = 680
  const gt = (t: number) => gx0 + (t / 8) * (gx1 - gx0)
  return (
    <Anim
      n="8-7"
      title="コイルBに電流が流れるのは、コイルAの電流を入れた瞬間と切った瞬間だけ"
      still={1.7}
      period={8}
      caption="1831年8月29日のファラデーの実験の模式図です。鉄の輪の左にコイルA、右にコイルBが巻いてあり、2つのコイルは導線でつながっていません。下のグラフはそれぞれのコイルを流れる電流の変化で、縦の線が今の時刻です。"
    >
      {(t) => {
        const on = ringA(t) > 0
        const status =
          t < RING_ON ? 'スイッチを入れる前' : t < RING_ON + 0.8 ? '入れた瞬間：Bに電流が流れる' : t < RING_OFF ? '入れたまま：Bには流れない' : t < RING_OFF + 0.8 ? '切った瞬間：Bに逆向きの電流' : '切ったまま：Bには流れない'
        return (
          <Svg id="8-7" w={720} h={370} label="鉄の輪に巻いた2つのコイル。コイルAの電流を入れた瞬間と切った瞬間だけ、コイルBにつないだ検流計の針が振れる。切ったときは逆向きに振れる。電流を流し続けている間は振れない。">
            {/* 鉄の輪 */}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--fig-line)" strokeWidth={18} />
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--fig-box)" strokeWidth={15} />
            {turns(148, 212)}
            {turns(-32, 32)}
            <T x={cx} y={cy} anchor="middle" fs={12} tone="muted">
              鉄の輪
            </T>
            <T x={cx - 96} y={cy - 92} anchor="middle" fs={12.5} bold>
              コイルA
            </T>
            <T x={cx + 96} y={cy - 92} anchor="middle" fs={12.5} bold>
              コイルB
            </T>
            {/* コイルA側：電池とスイッチ */}
            <Battery x={52} y={104} plus="top" />
            <polyline points={`80,96 80,46 112,46`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <circle cx={114} cy={46} r={3} fill="var(--fig-line)" />
            <line x1={114} y1={46} x2={on ? 150 : 145} y2={on ? 46 : 26} stroke="var(--fig-line)" strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={152} cy={46} r={3} fill="var(--fig-line)" />
            <polyline points={`152,46 ${a1x},46 ${a1x},${a1y}`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <polyline points={`80,140 80,186 ${a2x},186 ${a2x},${a2y}`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <T x={132} y={16} anchor="middle" fs={12}>
              {on ? 'スイッチ：入' : 'スイッチ：切'}
            </T>
            {/* コイルB側：検流計 */}
            <polyline points={`${b1x},${b1y} ${b1x},46 470,46 470,92`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <polyline points={`${b2x},${b2y} ${b2x},190 560,190 560,154`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <Galv x={515} y={122} r={34} deg={55 * ringB(t)} />
            <T x={590} y={66} fs={12.5} tone="acc">
              {status.split('：')[0]}
            </T>
            <T x={590} y={86} fs={12.5} tone="acc">
              {status.split('：')[1] ?? ''}
            </T>
            {/* グラフ */}
            <line x1={gx0} y1={268} x2={gx1} y2={268} stroke="var(--fig-muted)" />
            <line x1={gx0} y1={330} x2={gx1} y2={330} stroke="var(--fig-muted)" />
            <T x={gx0 - 10} y={258} anchor="end" fs={12}>
              Aの電流
            </T>
            <T x={gx0 - 10} y={330} anchor="end" fs={12}>
              Bの電流
            </T>
            <path d={curve(ringA, 0, 8, gx0, gx1, 0, 8, 268, 24)} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
            <path d={curve(ringB, 0, 8, gx0, gx1, 0, 8, 330, 26)} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
            <T x={gt(RING_ON)} y={228} anchor="middle" fs={11.5} tone="muted">
              入れる
            </T>
            <T x={gt(RING_OFF)} y={228} anchor="middle" fs={11.5} tone="muted">
              切る
            </T>
            <line x1={gt(t)} y1={238} x2={gt(t)} y2={362} stroke="var(--fig-accent)" strokeWidth={1.5} />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図8-8 磁石の出し入れ（動・スライダー） ---------- */

export function FigMagnetCoil() {
  const [speed, setSpeed] = useState(2)
  const D = 1.8 / speed
  const xOut = 500
  const xIn = 318
  /** 磁石の進み具合（0：外、1：中） */
  const u = (t: number) => (t < 4 ? ease((t - 1) / D) : 1 - ease((t - 4) / D))
  /** 速さ（入れるとき正、出すとき負） */
  const vel = (t: number) => {
    const a = (t - 1) / D
    const b = (t - 4) / D
    if (a > 0 && a < 1) return (6 * a * (1 - a)) / D
    if (b > 0 && b < 1) return (-6 * b * (1 - b)) / D
    return 0
  }
  const gx0 = 110
  const gx1 = 690
  const gt = (t: number) => gx0 + (t / 8) * (gx1 - gx0)
  return (
    <Anim
      n="8-8"
      title="磁石を動かしている間だけ、コイルに電流が流れる"
      still={1 + 0.35 * D}
      period={8}
      controls={<Range label="磁石を動かす速さ" min={1} max={3} step={1} value={speed} onChange={setSpeed} format={(v) => `${v}倍`} />}
      caption="模式図です。磁石を入れるときと出すときで、検流計の針は逆の向きに振れます。止めている間は、磁石がコイルの中にあっても振れません。「磁石を動かす速さ」を上げると、短い時間に強い電流が流れます。"
    >
      {(t) => {
        const mx = xOut + (xIn - xOut) * u(t)
        const v = vel(t)
        const moving = Math.abs(v) > 0.05
        const status = !moving ? (u(t) > 0.5 ? '磁石を中で止めている：振れない' : '磁石を外で止めている：振れない') : v > 0 ? '磁石を入れている：右に振れる' : '磁石を出している：左に振れる'
        return (
          <Svg id="8-8" w={720} h={340} label="コイルに棒磁石を入れると検流計の針が一方に振れ、止めると戻り、引き出すと逆に振れる。磁石を速く動かすほど、短い時間に強い電流が流れる。">
            <Helix x0={300} x1={440} cy={110} h={56} turns={7} layer="back" />
            <BarMagnet x={mx} y={97} w={130} h={26} left="N" hide={[288, 452]} />
            <Helix x0={300} x1={440} cy={110} h={56} turns={7} layer="front" />
            <T x={370} y={66} anchor="middle" fs={12.5} bold>
              コイル
            </T>
            <polyline points="300,138 300,168 190,168 190,110 154,110" fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <polyline points="440,138 440,184 66,184 66,110 86,110" fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <Galv x={120} y={110} r={34} deg={24 * v} />
            <T x={20} y={26} fs={12.5} tone="acc">
              {status}
            </T>
            {/* グラフ */}
            <line x1={gx0} y1={268} x2={gx1} y2={268} stroke="var(--fig-muted)" />
            <T x={gx0 - 10} y={268} anchor="end" fs={12}>
              電流
            </T>
            <path d={curve(vel, 0, 8, gx0, gx1, 0, 8, 268, 18)} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
            <T x={gt(1 + D / 2)} y={318} anchor="middle" fs={11.5} tone="muted">
              入れる
            </T>
            <T x={gt(4 + D / 2)} y={226} anchor="middle" fs={11.5} tone="muted">
              出す
            </T>
            <line x1={gt(t)} y1={236} x2={gt(t)} y2={308} stroke="var(--fig-accent)" strokeWidth={1.5} />
          </Svg>
        )
      }}
    </Anim>
  )
}

/* ---------- 図8-9・8-10 発電機とモーター（共通の立体の図） ---------- */

const MC = { cx: 215, cy: 135, rc: 55, half: 70 }
/** 立体の点を図の上の点に移す（奥行き Z は右上へずらして描く） */
const P = (X: number, Y: number, Z: number): [number, number] => [MC.cx + X + 0.4 * Z, MC.cy - Y - 0.28 * Z]
const pts = (...ps: [number, number][]) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/** 磁石の極（直方体）。X の範囲 x0〜x1 */
function Pole({ x0, x1, name }: { x0: number; x1: number; name: string }) {
  const [y0, y1, z0, z1] = [-55, 55, -50, 50]
  const fill = name === 'N' ? 'var(--fig-box2)' : 'var(--fig-box5)'
  const c = P((x0 + x1) / 2, 0, z0)
  return (
    <g stroke="var(--fig-line)" strokeLinejoin="round">
      <polygon points={pts(P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1))} fill={fill} opacity={0.75} />
      <polygon points={pts(P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1), P(x1, y0, z0))} fill={fill} opacity={0.6} />
      <polygon points={pts(P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0))} fill={fill} />
      <T x={c[0]} y={c[1]} anchor="middle" fs={20} bold>
        {name}
      </T>
    </g>
  )
}

/** コイル（長方形の枠）と電流の矢印。th はコイルの角度。cur は辺Aの電流（正なら奥へ、負なら手前へ） */
function RotCoil({ th, cur, mark }: { th: number; cur: number; mark?: boolean }) {
  const { rc, half } = MC
  const ax = rc * Math.cos(th)
  const ay = rc * Math.sin(th)
  const Af = P(ax, ay, -half)
  const Ab = P(ax, ay, half)
  const Bf = P(-ax, -ay, -half)
  const Bb = P(-ax, -ay, half)
  const arrow = (sx: number, sy: number, c: number) => {
    if (Math.abs(c) < 0.2) return null
    const o = rc + 10
    const ox = (o / rc) * sx
    const oy = (o / rc) * sy
    const z = 34 * c
    const [x1, y1] = P(ox, oy, -z)
    const [x2, y2] = P(ox, oy, z)
    return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} />
  }
  const mid = P(ax, ay, 0)
  return (
    <g>
      <polyline points={pts(Af, Ab, Bb, Bf)} fill="none" stroke="var(--fig-muted)" strokeWidth={5} strokeLinejoin="round" />
      <polyline points={pts(Af, Ab, Bb, Bf)} fill="none" stroke="var(--fig-line)" strokeWidth={1.2} strokeLinejoin="round" />
      {arrow(ax, ay, cur)}
      {arrow(-ax, -ay, -cur)}
      {mark && <circle cx={mid[0]} cy={mid[1]} r={5.5} fill="var(--fig-line)" stroke="var(--fig-bg)" strokeWidth={1.5} />}
    </g>
  )
}

/** 回す向きを示す、軸のまわりの曲がった矢印（奥の端）。cw は時計回り */
function TurnArrow({ cw }: { cw: boolean }) {
  const [x, y] = P(0, 0, 112)
  const r = 26
  const a0 = cw ? 200 : 340
  const a1 = cw ? 340 : 200
  const p0 = [x + r * Math.cos(a0 * DEG), y + r * Math.sin(a0 * DEG)]
  const p1 = [x + r * Math.cos(a1 * DEG), y + r * Math.sin(a1 * DEG)]
  return <Arrow d={`M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${r},${r} 0 0 ${cw ? 1 : 0} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`} />
}

/** 時間のグラフの枠 */
function GraphFrame({ x0, x1, y0, top, bottom }: { x0: number; x1: number; y0: number; top: string; bottom: string }) {
  return (
    <g>
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="var(--fig-muted)" />
      <line x1={x0} y1={y0 - 70} x2={x0} y2={y0 + 70} stroke="var(--fig-muted)" />
      <T x={x0 + 6} y={y0 - 76} fs={11.5} tone="muted">
        {top}
      </T>
      <T x={x0 + 6} y={y0 + 76} fs={11.5} tone="muted">
        {bottom}
      </T>
      <T x={x1} y={y0 + 16} anchor="end" fs={11.5} tone="muted">
        時間
      </T>
    </g>
  )
}

export function FigGenerator() {
  const per = 4
  const th = (t: number) => (2 * Math.PI * t) / per
  const I = (t: number) => Math.cos(th(t))
  const gx0 = 470
  const gx1 = 740
  const gy = 150
  const gt = (t: number) => gx0 + (t / 8) * (gx1 - gx0)
  return (
    <Anim
      n="8-9"
      title="発電機では、コイルが半回転するごとに電流の向きが入れ替わる"
      still={11 / 3}
      period={8}
      caption="模式図です。外から回すコイルの2つの辺が、N極とS極の前を上下に通るときに電流が流れます。黒の細い矢印はコイルの中の電流の向きで、両辺が磁極のすぐ前を通るとき（コイルの面が水平のとき）最も強く、コイルの面が垂直のとき0になります。手前の2つの輪（スリップリング）を通して、電流を外の検流計へ取り出します。"
    >
      {(t) => {
        const a = th(t)
        const c = I(t)
        const [r1x, r1y] = P(0, 0, -100)
        const [r2x, r2y] = P(0, 0, -138)
        const [f0x, f0y] = P(0, 0, -MC.half)
        const [fax, fay] = P(0, 0, -160)
        const [b0x, b0y] = P(0, 0, MC.half)
        const [b1x, b1y] = P(0, 0, 135)
        const Af = P(MC.rc * Math.cos(a), MC.rc * Math.sin(a), -MC.half)
        const Bf = P(-MC.rc * Math.cos(a), -MC.rc * Math.sin(a), -MC.half)
        return (
          <Svg id="8-9" w={760} h={340} label="N極とS極の間でコイルを回すと、コイルの辺に電流が流れる。電流の向きは半回転ごとに入れ替わり、時間とともに波のように変わる。">
            <Pole x0={-175} x1={-110} name="N" />
            <line x1={b0x} y1={b0y} x2={b1x} y2={b1y} stroke="var(--fig-line)" strokeWidth={3} />
            <TurnArrow cw={false} />
            <T x={P(0, 0, 112)[0]} y={50} anchor="middle" fs={12}>
              回す向き
            </T>
            <RotCoil th={a} cur={-c} />
            <line x1={f0x} y1={f0y} x2={fax} y2={fay} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={Af[0]} y1={Af[1]} x2={r1x} y2={r1y} stroke="var(--fig-line)" strokeWidth={1.2} />
            <line x1={Bf[0]} y1={Bf[1]} x2={r2x} y2={r2y} stroke="var(--fig-line)" strokeWidth={1.2} />
            <circle cx={r1x} cy={r1y} r={11} fill="none" stroke="var(--fig-line)" strokeWidth={3} />
            <circle cx={r2x} cy={r2y} r={11} fill="none" stroke="var(--fig-line)" strokeWidth={3} />
            <rect x={r1x - 3} y={r1y + 12} width={6} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={r2x - 3} y={r2y + 12} width={6} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <polyline points={`${r1x},${r1y + 24} ${r1x},268 123,268`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <polyline points={`${r2x},${r2y + 24} ${r2x},216 60,216 60,268 67,268`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <Galv x={95} y={268} r={28} deg={45 * c} />
            <Pole x0={110} x1={175} name="S" />
            <T x={250} y={262} fs={11.5} tone="muted">
              細い矢印：
            </T>
            <T x={250} y={280} fs={11.5} tone="muted">
              コイルの中の電流の向き
            </T>
            {/* グラフ */}
            <T x={gx0} y={40} fs={12.5} bold>
              取り出した電流の強さと向き
            </T>
            <GraphFrame x0={gx0} x1={gx1} y0={gy} top="一方の向き" bottom="逆の向き" />
            <path d={curve(I, 0, 8, gx0, gx1, 0, 8, gy, 55)} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} />
            <path d={curve(I, 0, Math.max(t, 0.01), gx0, gx1, 0, 8, gy, 55)} fill="none" stroke="var(--fig-line)" strokeWidth={2.5} />
            <circle cx={gt(t)} cy={gy - 55 * c} r={5} fill="var(--fig-accent)" />
            <T x={gt(4)} y={gy + 16} anchor="middle" fs={11.5} tone="muted">
              1回転
            </T>
            <line x1={gt(4)} y1={gy - 4} x2={gt(4)} y2={gy + 4} stroke="var(--fig-muted)" />
            <T x={gx0} y={250} fs={12}>
              電流の強さと向きが波のように変わる
            </T>
            <T x={gx0} y={270} fs={12}>
              （交流）
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}

export function FigMotor() {
  const per = 4
  const th0 = 150 * DEG
  const th = (t: number) => th0 - (2 * Math.PI * t) / per
  /** 印を付けた辺の電流。左側にあるとき奥向き（正） */
  const curA = (t: number) => (Math.cos(th(t)) < 0 ? 1 : -1)
  const gx0 = 470
  const gx1 = 740
  const gy = 150
  const gt = (t: number) => gx0 + (t / 8) * (gx1 - gx0)
  return (
    <Anim
      n="8-10"
      title="モーターでは、整流子が半回転ごとにコイルの電流の向きを入れ替える"
      still={23 / 6}
      period={8}
      caption="模式図です。電池の電流は左右のブラシと、2つに分かれた整流子を通ってコイルに入ります。磁極の前にあるコイルの辺には、左では上向き、右では下向きの力（青の矢印）がはたらき、コイルは時計回りに回ります。黒い丸を付けた辺の電流は、半回転ごとに向きが入れ替わります。"
    >
      {(t) => {
        const a = th(t)
        const c = curA(t)
        const { rc } = MC
        const [kx, ky] = P(0, 0, -100)
        const kr = 14
        const [f0x, f0y] = P(0, 0, -MC.half)
        const [fax, fay] = P(0, 0, -150)
        const [b0x, b0y] = P(0, 0, MC.half)
        const [b1x, b1y] = P(0, 0, 135)
        const Af = P(rc * Math.cos(a), rc * Math.sin(a), -MC.half)
        const Bf = P(-rc * Math.cos(a), -rc * Math.sin(a), -MC.half)
        // 整流子の2つの半分（隙間は 16度）
        const half = (s: number) => {
          const c0 = a + (s > 0 ? 0 : Math.PI)
          let d = ''
          for (let i = 0; i <= 16; i++) {
            const p = c0 - 82 * DEG + ((164 * DEG) * i) / 16
            d += `${i ? 'L' : 'M'}${(kx + kr * Math.cos(p)).toFixed(1)},${(ky - kr * Math.sin(p)).toFixed(1)}`
          }
          return d
        }
        const forceAt = (sx: number, sy: number) => {
          const [mx, my] = P(sx, sy, 0)
          const up = sx < 0
          return <Force x1={mx} y1={my + (up ? -8 : 8)} x2={mx} y2={my + (up ? -44 : 44)} />
        }
        const ax = rc * Math.cos(a)
        const ay = rc * Math.sin(a)
        const vertical = Math.abs(Math.cos(a)) < 0.12
        return (
          <Svg id="8-10" w={760} h={340} label="電池の電流が整流子を通ってコイルに流れる。磁極の前のコイルの辺に上向きと下向きの力がはたらいてコイルが回り、半回転ごとに整流子がコイルの電流の向きを入れ替えるので、回り続ける。">
            <Pole x0={-175} x1={-110} name="N" />
            <line x1={b0x} y1={b0y} x2={b1x} y2={b1y} stroke="var(--fig-line)" strokeWidth={3} />
            <TurnArrow cw />
            <T x={P(0, 0, 112)[0]} y={50} anchor="middle" fs={12}>
              回る向き
            </T>
            <RotCoil th={a} cur={c} mark />
            {!vertical && forceAt(ax, ay)}
            {!vertical && forceAt(-ax, -ay)}
            <line x1={f0x} y1={f0y} x2={fax} y2={fay} stroke="var(--fig-line)" strokeWidth={3} />
            <line x1={Af[0]} y1={Af[1]} x2={kx + kr * 0.7 * Math.cos(a)} y2={ky - kr * 0.7 * Math.sin(a)} stroke="var(--fig-line)" strokeWidth={1.2} />
            <line x1={Bf[0]} y1={Bf[1]} x2={kx - kr * 0.7 * Math.cos(a)} y2={ky + kr * 0.7 * Math.sin(a)} stroke="var(--fig-line)" strokeWidth={1.2} />
            <path d={half(1)} fill="none" stroke="var(--fig-line)" strokeWidth={4} />
            <path d={half(-1)} fill="none" stroke="var(--fig-muted)" strokeWidth={4} />
            <rect x={kx - kr - 12} y={ky - 5} width={10} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={kx + kr + 2} y={ky - 5} width={10} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <polyline points={`${kx - kr - 12},${ky} 142,${ky} 142,232 104,232 104,296 120,296`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <polyline points={`${kx + kr + 12},${ky} 230,${ky} 230,296 196,296`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
            <Battery x={120} y={282} plus="left" />
            <T x={22} y={252} fs={11.5} tone="muted">
              ブラシ
            </T>
            <line x1={58} y1={248} x2={kx - kr - 10} y2={ky + 6} stroke="var(--fig-muted)" />
            <Pole x0={110} x1={175} name="S" />
            <T x={250} y={262} fs={11.5} tone="muted">
              細い矢印：コイルの中の電流
            </T>
            <T x={250} y={280} fs={11.5} tone="muted">
              青の矢印：コイルの辺にはたらく力
            </T>
            {/* グラフ */}
            <T x={gx0} y={40} fs={12.5} bold>
              黒い丸を付けた辺の電流
            </T>
            <GraphFrame x0={gx0} x1={gx1} y0={gy} top="奥へ向かう向き" bottom="手前へ向かう向き" />
            <path d={curve(curA, 0, 8, gx0, gx1, 0, 8, gy, 45)} fill="none" stroke="var(--fig-muted)" strokeWidth={1.5} />
            <path d={curve(curA, 0, Math.max(t, 0.01), gx0, gx1, 0, 8, gy, 45)} fill="none" stroke="var(--fig-line)" strokeWidth={2.5} />
            <circle cx={gt(t)} cy={gy - 45 * c} r={5} fill="var(--fig-accent)" />
            <T x={gx0} y={250} fs={12}>
              半回転ごとに、整流子が
            </T>
            <T x={gx0} y={270} fs={12}>
              コイルの電流の向きを入れ替える
            </T>
          </Svg>
        )
      }}
    </Anim>
  )
}
