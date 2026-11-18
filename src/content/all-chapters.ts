import type { Chapter } from './types'
import { CHAPTER_KEYS } from './book'

// 全章の本文を一度に読み込む。検索索引と章の検査を作るスクリプト専用で、アプリからは読み込まない。
const modules = import.meta.glob<{ default: Chapter }>('../chapters/*.tsx', { eager: true })

const order = (c: Chapter) => CHAPTER_KEYS.indexOf(c.key)

export const chapters: Chapter[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => order(a) - order(b))
