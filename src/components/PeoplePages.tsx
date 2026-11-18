import { useEffect, useState } from 'react'
import { chapters, chapterLabel } from '../content/chapters'
import { BOOK_TITLE } from '../content/book'
import { FIELDS, FieldIcon, fieldById, type FieldId } from '../content/fields'
import { PEOPLE, lifeLabel, personById } from '../content/people'
import { hrefFor, personHref } from '../utils/route'
import { FieldTag, PersonCard, PortraitImg } from './history'
import { Choice } from './controls'

/* ---------- 科学者図鑑の一覧 ---------- */

export function PeoplePage({ restoreY }: { restoreY: number | null }) {
  const [field, setField] = useState<FieldId | 'all'>('all')
  const [order, setOrder] = useState<'born' | 'field'>('born')
  useEffect(() => {
    document.title = `科学者図鑑 | ${BOOK_TITLE}`
    scrollTo(0, restoreY ?? 0)
  }, [restoreY])
  const fieldIdx = (id: FieldId) => FIELDS.findIndex((f) => f.id === id)
  const list = PEOPLE.filter((p) => field === 'all' || p.field === field).sort((a, b) => (order === 'field' ? fieldIdx(a.field) - fieldIdx(b.field) : 0) || a.born - b.born)
  return (
    <article className="site-article people-page">
      <header className="page-head">
        <h1>科学者図鑑</h1>
        <p className="page-lead">
          本書に登場する主な科学者{PEOPLE.length}人を紹介します。人物ページには、経歴、主な業績、だれの研究を受け継ぎ、だれに引き継いだか、関連する章を載せています。肖像は利用条件を確かめた画像だけを載せ、作者と利用条件を各人物のページに記しています。
        </p>
      </header>
      <div className="people-filter">
        <Choice
          label="分野"
          options={[{ value: 'all', label: 'すべて' }, ...FIELDS.map((f) => ({ value: f.id, label: f.name }))] as { value: FieldId | 'all'; label: string }[]}
          value={field}
          onChange={setField}
        />
        <Choice
          label="並べ方"
          options={[
            { value: 'born', label: '生まれた年の順' },
            { value: 'field', label: '分野ごと' },
          ]}
          value={order}
          onChange={setOrder}
        />
      </div>
      <p className="people-count" aria-live="polite">
        {list.length}人を表示しています
      </p>
      <div className="person-grid">
        {list.map((p) => (
          <PersonCard key={p.id} p={p} />
        ))}
      </div>
    </article>
  )
}

/* ---------- 人物ページ ---------- */

/** 飾りの式の「^μ」「^(−r/λ)」を上付き、「_μ」を下付きにして表示する */
function formula(text: string) {
  return text.split(/([\^_](?:\([^)]*\)|.))/u).map((part, i) => {
    const m = /^([\^_])\(?(.*?)\)?$/u.exec(part)
    if (!m || part.length < 2) return part
    return m[1] === '^' ? <sup key={i}>{m[2]}</sup> : <sub key={i}>{m[2]}</sub>
  })
}

export function PersonPage({ id }: { id: string }) {
  const p = personById.get(id)
  useEffect(() => {
    document.title = `${p ? p.name : '人物が見つかりません'} | 科学者図鑑 | ${BOOK_TITLE}`
    scrollTo(0, 0)
  }, [p])
  if (!p)
    return (
      <article className="site-article">
        <h1>人物が見つかりません</h1>
        <p>
          <a href="#/people">科学者図鑑へ戻る</a>
        </p>
      </article>
    )
  const f = fieldById.get(p.field)!
  const successors = PEOPLE.filter((x) => x.inherits.some((i) => i.id === p.id)).map((x) => ({ person: x, what: x.inherits.find((i) => i.id === p.id)!.what }))
  const related = chapters.filter((c) => c.people?.includes(p.id) || c.events?.some((e) => e.people?.includes(p.id)))
  const events = chapters.flatMap((c) => (c.events ?? []).filter((e) => e.people?.includes(p.id)).map((e) => ({ ...e, chapter: c.key }))).sort((a, b) => a.year - b.year)
  const idx = PEOPLE.indexOf(p)
  const prev = PEOPLE[idx - 1]
  const next = PEOPLE[idx + 1]
  return (
    <article className={`site-article person-page f-${p.field}`}>
      <nav className="breadcrumb" aria-label="現在の位置">
        <a href="#/people">科学者図鑑</a> › {p.name}
      </nav>
      <header className="person-head">
        <figure className="person-portrait">
          <PortraitImg p={p} size="lg" />
          {p.portrait && (
            <figcaption>
              {p.portrait.author}
              {p.portrait.date && `（${p.portrait.date}）`}、
              {p.portrait.source && (
                <>
                  <a href={p.portrait.source} target="_blank" rel="noreferrer">
                    出典
                  </a>
                  、
                </>
              )}
              {p.portrait.licenseUrl ? (
                <a href={p.portrait.licenseUrl} target="_blank" rel="noreferrer">
                  {p.portrait.license}
                </a>
              ) : (
                p.portrait.license
              )}
            </figcaption>
          )}
        </figure>
        <div className="person-head-text">
          <p className="person-field">
            <FieldIcon id={p.field} size={18} /> {f.name}
          </p>
          <h1>{p.name}</h1>
          <p className="person-original">{p.original}</p>
          <p className="person-meta">
            {lifeLabel(p)} ／ {p.country}
          </p>
          <p className="person-tagline">{p.tagline}</p>
          {p.equation && (
            <div className="person-eq">
              <span className="person-eq-formula" aria-hidden="true">
                {formula(p.equation.text)}
              </span>
              <span className="person-eq-meaning">
                <span className="sr-only">この人物にちなむ有名な式。</span>
                {p.equation.meaning}
              </span>
            </div>
          )}
        </div>
      </header>

      <section aria-labelledby="bio-h">
        <h2 id="bio-h">経歴</h2>
        {p.bio.map((b, i) => (
          <p key={i}>{b}</p>
        ))}
      </section>

      <section aria-labelledby="ach-h">
        <h2 id="ach-h">主な業績</h2>
        <ul className="ach-list">
          {p.achievements.map((a, i) => (
            <li key={i}>
              <span className="ach-year">{a.year ?? ''}</span>
              <span>{a.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {(p.inherits.length > 0 || successors.length > 0) && (
        <section aria-labelledby="link-h">
          <h2 id="link-h">研究のつながり</h2>
          <div className="lineage">
            {p.inherits.length > 0 && (
              <div>
                <h3>受け継いだ研究</h3>
                <ul>
                  {p.inherits.map((i) => {
                    const q = personById.get(i.id)
                    return (
                      <li key={i.id}>
                        {q ? <a href={personHref(q.id)}>{q.name}</a> : i.id}：{i.what}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {successors.length > 0 && (
              <div>
                <h3>研究を引き継いだ人</h3>
                <ul>
                  {successors.map(({ person, what }) => (
                    <li key={person.id}>
                      <a href={personHref(person.id)}>{person.name}</a>：{what}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="rel-h">
          <h2 id="rel-h">関連する章</h2>
          <ul>
            {related.map((c) => (
              <li key={c.key}>
                <a href={hrefFor(c.key)}>
                  {chapterLabel(c)} {c.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {events.length > 0 && (
        <section aria-labelledby="ev-h">
          <h2 id="ev-h">歴史マップに載せた出来事</h2>
          <ol className="tl-list">
            {events.map((e) => (
              <li key={`${e.chapter}-${e.title}`}>
                <span className="tl-list-year">{e.yearLabel ?? `${e.year}年`}</span>
                <span className="tl-list-body">
                  <a href={hrefFor(e.chapter, e.section)}>{e.title}</a>
                  <span className="tl-list-note">{e.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <nav className="prev-next" aria-label="前後の人物（生まれた年の順）">
        {prev ? (
          <a className="prev" href={personHref(prev.id)}>
            <span className="pn-label">前の人物（生まれた年の順）</span>
            {prev.name}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a className="next" href={personHref(next.id)}>
            <span className="pn-label">次の人物</span>
            {next.name}
          </a>
        ) : (
          <span />
        )}
      </nav>
      <p>
        <FieldTag id={p.field} /> <a href={`#/fields/${f.part}`}>この分野の章の一覧へ</a>
      </p>
    </article>
  )
}
