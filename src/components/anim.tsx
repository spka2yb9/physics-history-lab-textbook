import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Figure } from './content'

/*
 * 動く図。図が画面に入っている間だけ時刻を進め、外に出ると止める。一時停止と「最初から」のボタンを付ける。
 * 端末で動きを減らす設定（prefers-reduced-motion）の人には、still の時刻で止めた絵を出す（再生ボタンを押せば動く）。
 * 自動テストのブラウザー（navigator.webdriver）でも still で止めて表示し、撮影と図の検査を毎回同じ絵にする。
 *
 * 子は「時刻 t（秒）を受け取って SVG を返す関数」。スライダーの値は呼ぶ側の useState で持ち、関数の中で使う。
 */

const prefersReduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const automated = () => typeof navigator !== 'undefined' && navigator.webdriver === true

interface AnimProps {
  n: string
  title: string
  caption?: ReactNode
  /** 再生ボタンの後ろに並べるスライダーや切り替え */
  controls?: ReactNode
  /** 止めた状態で表示する時刻（秒）。動きがなくても要点が分かる時刻にする */
  still: number
  /** 繰り返しの長さ（秒）。省略すると時刻は増え続ける（関数の側で上限を決める） */
  period?: number
  /** 再生の速さ。1 で実時間 */
  speed?: number
  children: (t: number) => ReactNode
}

export function Anim({ n, title, caption, controls, still, period, speed = 1, children }: AnimProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(() => !prefersReduced() && !automated())
  const [visible, setVisible] = useState(false)
  const [t, setT] = useState(still)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !visible) return
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      setT((v) => {
        const nv = v + dt * speed
        return period ? nv % period : nv
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing, visible, speed, period])

  const buttons = (
    <div className="anim-buttons">
      <button type="button" className="anim-btn" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
        <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span> {playing ? '一時停止' : '再生'}
      </button>
      <button type="button" className="anim-btn" onClick={() => setT(0)}>
        <span aria-hidden="true">↺</span> 最初から
      </button>
    </div>
  )
  return (
    <div ref={ref} className="anim-wrap">
      <Figure n={n} title={title} caption={caption} anim controls={<>{buttons}{controls}</>}>
        {children(t)}
      </Figure>
    </div>
  )
}
