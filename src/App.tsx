import { useEffect, useRef, useState } from 'react'
import { ChapterView } from './components/ChapterView'
import { Home } from './components/Home'
import { SearchDialog } from './components/Search'
import { MapPage } from './components/MapPage'
import { FieldsPage } from './components/FieldsPage'
import { PeoplePage, PersonPage } from './components/PeoplePages'
import { ReadingProgress } from './components/ReadingProgress'
import { BrandMark } from './components/Brand'
import { chapterByKey, chapterLabel } from './content/chapters'
import { CHAPTER_KEYS, PARTS, shortFor } from './content/book'
import { FIELDS, FieldIcon } from './content/fields'
import { loadPosition, savePosition, type Position } from './utils/readingPosition'
import { hrefFor, useRoute, type Page } from './utils/route'

const NAV: { page: Page; href: string; label: string }[] = [
  { page: 'home', href: '#/', label: 'ホーム' },
  { page: 'map', href: '#/map', label: '歴史マップ' },
  { page: 'fields', href: '#/fields', label: '分野から学ぶ' },
  { page: 'people', href: '#/people', label: '科学者図鑑' },
]

/** ヘッダーのどの項目を「現在のページ」にするか */
function navPageOf(page: Page): Page {
  if (page === 'chapter') return 'fields'
  if (page === 'person') return 'people'
  return page
}

export default function App() {
  const route = useRoute()
  // スマホの目次は、開いたときの表示位置にいる間だけ開いておく（移動すると閉じる）
  const routeKey = `${route.page}|${route.chapter}|${route.section}|${route.id}`
  const [navOpenAt, setNavOpenAt] = useState<string | null>(null)
  const navOpen = navOpenAt === routeKey
  const [searchOpen, setSearchOpen] = useState(false)
  const [fieldsMenuAt, setFieldsMenuAt] = useState<string | null>(null)
  const fieldsMenu = fieldsMenuAt === routeKey
  const menuRef = useRef<HTMLLIElement>(null)

  // 初回アクセス時、ハッシュが無ければ前回の読書位置へ戻す
  const [restoreTarget] = useState<Position | null>(() => {
    const pos = loadPosition()
    return !location.hash && pos?.hash ? pos : null
  })
  useEffect(() => {
    if (restoreTarget) location.hash = restoreTarget.hash
  }, [restoreTarget])
  // 復帰先の章を表示している間だけ、保存したスクロール位置を渡す
  const restoreY = restoreTarget && location.hash === restoreTarget.hash ? restoreTarget.scrollY : null

  // 読書位置の保存（スクロール停止後）
  useEffect(() => {
    let t: number | undefined
    const onScroll = () => {
      clearTimeout(t)
      t = setTimeout(() => savePosition({ hash: location.hash, scrollY: scrollY }), 300)
    }
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      removeEventListener('scroll', onScroll)
      clearTimeout(t)
    }
  }, [])

  // ハッシュ遷移時にも保存する
  useEffect(() => {
    savePosition({ hash: location.hash, scrollY: 0 })
  }, [routeKey])

  // キーボード: / または Ctrl/Cmd+K で検索、Esc で分野のメニューを閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') setFieldsMenuAt(null)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  // 分野のメニューの外側を押したら閉じる
  useEffect(() => {
    if (!fieldsMenu) return
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setFieldsMenuAt(null)
    }
    addEventListener('pointerdown', onDown)
    return () => removeEventListener('pointerdown', onDown)
  }, [fieldsMenu])

  const chapter = route.chapter != null ? chapterByKey.get(route.chapter) : undefined
  const isChapter = route.page === 'chapter'
  const current = navPageOf(route.page)

  return (
    <div className={`app ${navOpen ? 'nav-open' : ''} ${isChapter ? 'with-toc' : 'site-page'}`}>
      <a className="skip" href="#main">
        本文へ移動
      </a>
      <header className="topbar">
        <button className="icon-btn nav-toggle" aria-label="メニューと目次を開閉" aria-expanded={navOpen} onClick={() => setNavOpenAt((o) => (o === routeKey ? null : routeKey))}>
          ☰
        </button>
        <a className="brand" href="#/">
          <BrandMark />
          <span className="brand-text">
            <span className="brand-ja">物理学の歴史ラボ</span>
            <span className="brand-en">Physics History Lab</span>
          </span>
        </a>
        <nav className="site-nav" aria-label="サイト">
          <ul>
            {NAV.map((n) =>
              n.page === 'fields' ? (
                <li key={n.page} ref={menuRef} className="has-menu">
                  <a href={n.href} aria-current={current === n.page ? 'page' : undefined}>
                    {n.label}
                  </a>
                  <button
                    type="button"
                    className="menu-btn"
                    aria-label="分野の一覧を開く"
                    aria-expanded={fieldsMenu}
                    aria-controls="fields-menu"
                    onClick={() => setFieldsMenuAt((o) => (o === routeKey ? null : routeKey))}
                  >
                    ▾
                  </button>
                  {fieldsMenu && (
                    <ul id="fields-menu" className="fields-menu">
                      {FIELDS.map((f) => {
                        const p = PARTS.find((x) => x.id === f.part)!
                        return (
                          <li key={f.id}>
                            <a href={`#/fields/${f.part}`} className={`f-${f.id}`}>
                              <FieldIcon id={f.id} size={18} />
                              <span>{p.title}</span>
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={n.page}>
                  <a href={n.href} aria-current={current === n.page ? 'page' : undefined}>
                    {n.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>
        <ReadingProgress key={routeKey} />
        <button className="search-btn" onClick={() => setSearchOpen(true)} aria-label="検索" aria-keyshortcuts="Control+K /">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3.5 3.5" />
          </svg>
          <span className="search-placeholder">キーワードで検索</span>
          <kbd>/</kbd>
        </button>
      </header>

      <nav className="sidebar" aria-label="目次">
        <ul className="sidebar-site">
          {NAV.map((n) => (
            <li key={n.page}>
              <a href={n.href} aria-current={current === n.page && !isChapter ? 'page' : undefined}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="sidebar-title">目次</div>
        <ol className="nav-parts">
          {PARTS.map((p) => (
            <li key={p.id}>
              <div className="nav-part">{p.title}</div>
              <ol className="nav-chapters">
                {CHAPTER_KEYS.filter((k) => chapterByKey.get(k)?.part === p.id).map((k) => {
                  const c = chapterByKey.get(k)!
                  return (
                    <li key={k}>
                      <a href={hrefFor(k)} aria-current={c === chapter ? 'page' : undefined}>
                        <span className="nav-num">{shortFor(k)}</span>
                        {c.title}
                      </a>
                      {c === chapter && (
                        <ol className="nav-sections">
                          {c.sections.map((s) => (
                            <li key={s.id}>
                              <a href={hrefFor(k, s.id)} aria-current={route.section === s.id ? 'location' : undefined}>
                                {s.title}
                              </a>
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  )
                })}
              </ol>
            </li>
          ))}
        </ol>
      </nav>
      <div className="sidebar-backdrop" onClick={() => setNavOpenAt(null)} />

      <main id="main" className="main">
        <PageBody route={route} chapter={chapter} restoreY={restoreY} />
      </main>

      {chapter && (
        <aside className="outline" aria-label="ページ内見出し">
          <div className="outline-title">{chapterLabel(chapter)}の見出し</div>
          <ol>
            {chapter.sections.map((s) => (
              <li key={s.id}>
                <a href={hrefFor(chapter.key, s.id)} aria-current={route.section === s.id ? 'location' : undefined}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>
      )}

      <footer className="site-footer">
        <p>物理学の歴史ラボ</p>
      </footer>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

function PageBody({ route, chapter, restoreY }: { route: ReturnType<typeof useRoute>; chapter: ReturnType<typeof chapterByKey.get>; restoreY: number | null }) {
  switch (route.page) {
    case 'home':
      return <Home />
    case 'map':
      return <MapPage restoreY={restoreY} />
    case 'fields':
      return <FieldsPage part={route.section} />
    case 'people':
      return <PeoplePage restoreY={restoreY} />
    case 'person':
      return <PersonPage id={route.id!} />
    case 'chapter':
      return chapter ? (
        <ChapterView chapter={chapter} section={route.section} restoreY={restoreY} />
      ) : (
        <article className="chapter">
          <h1>{CHAPTER_KEYS.includes(route.chapter!) ? 'この章は準備中です' : '章が見つかりません'}</h1>
          <p>
            <a href="#/">トップページへ戻る</a>
          </p>
        </article>
      )
  }
}
