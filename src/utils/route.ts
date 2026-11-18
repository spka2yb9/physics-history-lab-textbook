import { useEffect, useState } from 'react'

/**
 * ハッシュルーティング。静的ホスティングでリロードしても壊れない。
 *   #/                トップページ
 *   #/3               第3章の先頭
 *   #/3/structure     第3章の節 id="structure"
 *   #/map             歴史マップ
 *   #/fields          分野から学ぶ（#/fields/p2 で第2部の位置へ）
 *   #/people          科学者図鑑（#/people/newton で人物ページ）
 *   #/sources         参考資料の一覧
 */
export type Page = 'home' | 'chapter' | 'map' | 'fields' | 'people' | 'person' | 'sources'

export interface Route {
  page: Page
  /** 章のページのときの章のキー */
  chapter: string | null
  /** 章の節、分野のページの部 */
  section: string | null
  /** 人物ページの id */
  id: string | null
  sources: boolean
}

const SITE_PAGES = new Set(['map', 'fields', 'people', 'sources'])

export function parseHash(hash: string): Route {
  const base: Route = { page: 'home', chapter: null, section: null, id: null, sources: false }
  const m = /^#\/([\w-]+)(?:\/([\w-]+))?/.exec(hash)
  if (!m) return base
  const [, a, b = null] = m
  if (a === 'sources') return { ...base, page: 'sources', sources: true }
  if (a === 'people') return b ? { ...base, page: 'person', id: b } : { ...base, page: 'people' }
  if (SITE_PAGES.has(a)) return { ...base, page: a as Page, section: b }
  return { ...base, page: 'chapter', chapter: a, section: b }
}

export function hrefFor(chapter: string, section?: string): string {
  return section ? `#/${chapter}/${section}` : `#/${chapter}`
}

export const personHref = (id: string) => `#/people/${id}`

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseHash(location.hash))
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])
  return route
}
