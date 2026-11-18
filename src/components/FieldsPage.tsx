import { useEffect } from 'react'
import { chapterByKey, chapterLabel } from '../content/chapters'
import { BOOK_TITLE, CHAPTER_KEYS, PARTS } from '../content/book'
import { FIELDS, FieldIcon } from '../content/fields'
import { PEOPLE } from '../content/people'
import { hrefFor, personHref } from '../utils/route'

/** 分野から学ぶ：7つの部の説明と、各部の章の一覧。#/fields/p3 で第3部の位置へ移動する。 */
export function FieldsPage({ part }: { part: string | null }) {
  useEffect(() => {
    document.title = `分野から学ぶ | ${BOOK_TITLE}`
    if (part) document.getElementById(part)?.scrollIntoView()
    else scrollTo(0, 0)
  }, [part])
  return (
    <article className="site-article fields-page">
      <header className="page-head">
        <h1>分野から学ぶ</h1>
        <p className="page-lead">
          全37章を、物理学の7つの分野に分けた部に収めています。部は、前の部の知識を使って次の部を読める順に並べ、部の中の章は年代順にしています。どの部からでも読めますが、前提となる章は各章の冒頭に示しています。
        </p>
        <ul className="fields-jump">
          {FIELDS.map((f) => (
            <li key={f.id}>
              <a className={`f-${f.id}`} href={`#/fields/${f.part}`}>
                <FieldIcon id={f.id} size={18} />
                {f.name}
              </a>
            </li>
          ))}
        </ul>
      </header>
      {FIELDS.map((f) => {
        const p = PARTS.find((x) => x.id === f.part)!
        const list = CHAPTER_KEYS.map((k) => chapterByKey.get(k)).filter((c) => c?.part === p.id)
        const people = PEOPLE.filter((x) => x.field === f.id)
        return (
          <section key={f.id} id={f.part} className={`field-section f-${f.id}`} aria-labelledby={`${f.part}-h`}>
            <div className="field-section-head">
              <FieldIcon id={f.id} size={44} />
              <div>
                <h2 id={`${f.part}-h`}>{p.title}</h2>
                <p className="field-period">主な時代：{f.period}</p>
              </div>
            </div>
            <p>{p.description}</p>
            {people.length > 0 && (
              <p className="field-people">
                この分野の主な科学者：
                {people.map((x, i) => (
                  <span key={x.id}>
                    {i > 0 && '、'}
                    <a href={personHref(x.id)}>{x.short}</a>
                  </span>
                ))}
              </p>
            )}
            {list.length > 0 ? (
              <ol className="field-chapters">
                {list.map((c) => (
                  <li key={c!.key}>
                    <a href={hrefFor(c!.key)}>
                      <span className="toc-num">{chapterLabel(c!)}</span> {c!.title}
                    </a>
                    <p className="toc-summary">{c!.summary}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="toc-summary">準備中</p>
            )}
          </section>
        )
      })}
    </article>
  )
}
