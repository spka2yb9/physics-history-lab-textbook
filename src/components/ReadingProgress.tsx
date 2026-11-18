import { useEffect, useRef, useState } from 'react'

/**
 * このページをどこまで読んだかを、ヘッダー下端の棒と百分率で示す。
 * 章の本文や図は後から読み込まれてページの高さが変わるので、大きさが変わるたびに測り直す。
 */
export function ReadingProgress() {
  const fillRef = useRef<HTMLDivElement>(null)
  const [percent, setPercent] = useState(0)
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    let live = true
    let raf = 0
    let lastPercent = 0
    let lastScrollable = false

    const measure = () => {
      raf = 0
      // 画面に入りきらない分（scrollHeight - 画面の高さ）のうち、どこまで進んだか
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      const canScroll = max > 0
      const progress = canScroll ? Math.min(1, Math.max(0, scrollY / max)) : 0
      const next = Math.round(progress * 100)
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`
      if (next !== lastPercent) {
        lastPercent = next
        setPercent(next)
      }
      if (canScroll !== lastScrollable) {
        lastScrollable = canScroll
        setScrollable(canScroll)
      }
    }
    const schedule = () => {
      if (live && !raf) raf = requestAnimationFrame(measure)
    }

    // 本文・図・画像・フォントの読み込みで高さが変わっても追いつく
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    document.fonts?.ready.then(schedule)
    schedule()

    return () => {
      live = false
      observer.disconnect()
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div
        className="reading-progress"
        role="progressbar"
        aria-label="このページの読書の進み具合"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-hidden={!scrollable}
        data-active={scrollable || undefined}
      >
        <div ref={fillRef} className="reading-progress-fill" />
      </div>
      {scrollable && (
        <span className="reading-percent" aria-hidden="true" data-complete={percent === 100 || undefined}>
          {percent}%
        </span>
      )}
    </>
  )
}
