import type { ReactNode } from 'react'

/** 参考文献（出典）1件。 */
export interface Source {
  /** 資料名 */
  title: string
  /** 発行者・著者・サイト名 */
  publisher: string
  url: string
  /** 参照日 YYYY-MM-DD。実際に資料を確認した日 */
  accessed: string
  /** 対象バージョン・版・刊行年（該当する場合） */
  version?: string
  /** この資料が何の主張を支えるか */
  note?: string
}

/** 章内の節（h2 相当）。 */
export interface Section {
  /** URL ハッシュに使う ID（英小文字・数字・ハイフン） */
  id: string
  title: string
  body: ReactNode
}

export interface Chapter {
  /** book.ts の CHAPTER_KEYS のどれか */
  key: string
  /** book.ts の PARTS の id */
  part: string
  title: string
  /** 目次と章の冒頭に出す1〜2文の要約 */
  summary: string
  /** この章で分かること（箇条書き） */
  goals: string[]
  /** 前提となる章のキー */
  prerequisites: string[]
  sections: Section[]
  /** 本文の <Ref n={1} /> は sources[0] を指す */
  sources: Source[]
  /** この章に登場する科学者（people の id）。章末に人物カードを並べ、人物ページの「関連する章」にも使う */
  people?: string[]
  /** 歴史マップに載せる、この章で扱う発見や実験 */
  events?: MapEvent[]
}

/** 歴史マップの1項目（発見・実験・論文など）。 */
export interface MapEvent {
  /** 年。並べる位置に使う */
  year: number
  /** 年の表示を変えたいとき（「1909〜1911年」など）。省略すると「1909年」 */
  yearLabel?: string
  /** 短い名前（地図の上に出す。12字以内が目安） */
  title: string
  /** 何が分かったか、なぜ重要か（1文） */
  note: string
  /** 関わった科学者（people の id） */
  people?: string[]
  /** 本文で扱う節の id */
  section?: string
}
