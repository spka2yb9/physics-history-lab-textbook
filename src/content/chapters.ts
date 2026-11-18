import type { Chapter, Section } from './types'
import { labelFor } from './book'
import meta from './chapter-meta.json'

/** 目次・前後の章に使う章の情報。節の本文は含まない。 */
export type ChapterMeta = Omit<Chapter, 'sections'> & { sections: Pick<Section, 'id' | 'title'>[] }

// chapter-meta.json は npm run build:index が章ファイルから生成する。
export const chapters = meta as ChapterMeta[]

export const chapterByKey = new Map(chapters.map((c) => [c.key, c]))

export function chapterLabel(c: { key: string }): string {
  return labelFor(c.key)
}

/** 章のキーから章ファイル名へ。"3" → ch03、intro → intro */
export function chapterFile(key: string): string {
  return /^\d+$/.test(key) ? `ch${key.padStart(2, '0')}` : key
}

// 章の本文は章ごとに別ファイルにして、開いたときに読み込む。
const loaders = import.meta.glob<{ default: Chapter }>('../chapters/*.tsx')
const cache = new Map<string, Promise<Chapter>>()

export function loadChapter(key: string): Promise<Chapter> {
  let p = cache.get(key)
  if (!p) {
    const load = loaders[`../chapters/${chapterFile(key)}.tsx`]
    p = load ? load().then((m) => m.default) : Promise.reject(new Error(`chapter ${key} not found`))
    p.catch(() => cache.delete(key)) // 失敗したら次に開いたときに再試行する
    cache.set(key, p)
  }
  return p
}
