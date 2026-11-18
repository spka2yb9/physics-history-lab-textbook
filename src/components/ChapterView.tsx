import { useEffect, useState } from 'react'
import { chapterByKey, chapterLabel, loadChapter, type ChapterMeta } from '../content/chapters'
import { BOOK_TITLE, CHAPTER_KEYS, PARTS, labelFor } from '../content/book'
import type { Chapter } from '../content/types'
import { hrefFor } from '../utils/route'
import { SourceList } from './content'
import { glossify } from './glossary'
import { ChapterPeople } from './history'

/** 学習順に並べた、執筆済みの章 */
const ordered = CHAPTER_KEYS.map((k) => chapterByKey.get(k)).filter((c): c is ChapterMeta => c != null)

export function ChapterView({ chapter, section, restoreY }: { chapter: ChapterMeta; section: string | null; restoreY: number | null }) {
  const [loaded, setLoaded] = useState<{ key: string; full?: Chapter; failed?: boolean } | null>(null)
  useEffect(() => {
    let live = true
    loadChapter(chapter.key).then(
      (full) => live && setLoaded({ key: chapter.key, full }),
      () => live && setLoaded({ key: chapter.key, failed: true }),
    )
    return () => {
      live = false
    }
  }, [chapter.key])
  const state = loaded?.key === chapter.key ? loaded : null
  const full = state?.full

  const idx = ordered.indexOf(chapter)
  const prev = ordered[idx - 1]
  const next = ordered[idx + 1]
  const part = PARTS.find((p) => p.id === chapter.part)

  // 節へのハッシュ遷移では固定ヘッダー分を CSS の scroll-margin で避ける
  useEffect(() => {
    if (restoreY != null) {
      scrollTo(0, restoreY) // 前回の読書位置へ復帰
    } else if (section) {
      document.getElementById(section)?.scrollIntoView()
    } else {
      scrollTo(0, 0)
    }
  }, [chapter.key, section, restoreY, full])

  useEffect(() => {
    document.title = `${chapterLabel(chapter)} ${chapter.title} | ${BOOK_TITLE}`
  }, [chapter])

  return (
    <article className="chapter">
      <header className="chapter-head">
        {part?.title && <p className="chapter-part">{part.title}</p>}
        <h1>
          <span className="chapter-num">{chapterLabel(chapter)}</span> {chapter.title}
        </h1>
        <p className="chapter-summary">{chapter.summary}</p>
        <div className="chapter-goals">
          <h2 id="goals">この章で分かること</h2>
          <ul>
            {chapter.goals.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
          {chapter.prerequisites.length > 0 && (
            <p className="chapter-prereq">
              前提となる章：
              {chapter.prerequisites.map((k, i) => {
                const c = chapterByKey.get(k)
                return (
                  <span key={k}>
                    {i > 0 && '、'}
                    <a href={hrefFor(k)}>
                      {labelFor(k)}
                      {c ? ` ${c.title}` : ''}
                    </a>
                  </span>
                )
              })}
            </p>
          )}
        </div>
      </header>

      {state?.failed && (
        <p className="chapter-loading">
          本文を読み込めませんでした。
          <a href={hrefFor(chapter.key)} onClick={() => location.reload()}>
            ページを再読み込み
          </a>
          してください。
        </p>
      )}
      {!state && <p className="chapter-loading">本文を読み込んでいます</p>}
      {full?.sections.map((s) => (
        <section key={s.id} id={s.id} className="section" aria-labelledby={`${s.id}-h`}>
          <h2 id={`${s.id}-h`}>
            <a className="anchor" href={hrefFor(chapter.key, s.id)}>
              {s.title}
            </a>
          </h2>
          {glossify(s.body, { chapter: chapter.key, section: s.id })}
        </section>
      ))}

      {full && chapter.people && <ChapterPeople ids={chapter.people} />}
      {full && <SourceList sources={chapter.sources} />}

      <nav className="prev-next" aria-label="前後の章">
        {prev ? (
          <a className="prev" href={hrefFor(prev.key)}>
            <span className="pn-label">前の章</span>
            {chapterLabel(prev)} {prev.title}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a className="next" href={hrefFor(next.key)}>
            <span className="pn-label">次の章</span>
            {chapterLabel(next)} {next.title}
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
