import { useEffect } from 'react'
import { chapterByKey, chapterLabel } from '../content/chapters'
import { hrefFor } from '../utils/route'
import { BOOK_TITLE, CHAPTER_KEYS } from '../content/book'

/** 全章の参考資料を章ごとにまとめた一覧。 */
export function SourcesPage() {
  useEffect(() => {
    document.title = `参考資料の一覧 | ${BOOK_TITLE}`
    scrollTo(0, 0)
  }, [])
  const list = CHAPTER_KEYS.map((k) => chapterByKey.get(k)).filter((c) => c != null)
  return (
    <article className="chapter">
      <header className="chapter-head">
        <h1>参考資料の一覧</h1>
        <p className="chapter-summary">
          各章の末尾に載せた参考資料を、章ごとにまとめています。参照日は筆者がその資料を確認した日で、資料側の更新日ではありません。資料側の公開日や版が分かるものは併記しています。
        </p>
      </header>
      {list.map((c) => (
        <section key={c.key} className="sources" aria-labelledby={`srcs-${c.key}`}>
          <h2 id={`srcs-${c.key}`}>
            <a href={hrefFor(c.key)}>
              {chapterLabel(c)} {c.title}
            </a>
          </h2>
          <ol>
            {c.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
                、{s.publisher}
                {s.version && `、${s.version}`}。参照日 {s.accessed}。
              </li>
            ))}
          </ol>
        </section>
      ))}
    </article>
  )
}
