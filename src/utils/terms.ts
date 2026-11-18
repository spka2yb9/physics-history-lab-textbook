// 本文の中から用語を探す。章の検査（定義より前に出てくる用語）と glossary モジュール（解説のポップアップ）で使う。
// 他のモジュールに依存させない（検査のスクリプトから直接読み込むため）。

/** 用語の表記。term が空のものは「用語を含むが別の意味の語」で、一致しても用語として扱わない */
export interface TermLabel {
  label: string
  term: string
}

export interface TermHit extends TermLabel {
  at: number
}

const ALNUM = /[A-Za-z0-9]/
const KATA = /[ァ-ヺー]/

/** 用語・別名・英語名から表記の一覧を作る。長い表記を先に並べる（長い語を優先して一致させる）。 */
export function termLabels(terms: { term: string; en?: string; aliases?: string[] }[], ignore: readonly string[] = []): TermLabel[] {
  const seen = new Set<string>()
  return [...terms.flatMap((t) => [t.term, t.en ?? '', ...(t.aliases ?? [])].map((label) => ({ label, term: t.term }))), ...ignore.map((label) => ({ label, term: '' }))]
    .filter((l) => l.label.length > 1 && !seen.has(l.label) && seen.add(l.label))
    .sort((a, b) => b.label.length - a.label.length)
}

/**
 * 語の途中には一致させない。英数字の表記は前後が英数字の位置（FTD の中の FT）、
 * カタカナで始まる・終わる表記は前・後ろがカタカナの位置（サッカードの中のカード、タブレットの中のタブ）を除く。
 */
function indexOfLabel(text: string, label: string, from: number): number {
  const ascii = ALNUM.test(label[0])
  const kataHead = KATA.test(label[0])
  const kataTail = KATA.test(label[label.length - 1])
  for (let at = text.indexOf(label, from); at >= 0; at = text.indexOf(label, at + 1)) {
    const before = text[at - 1] ?? ''
    const after = text[at + label.length] ?? ''
    if (ascii && (ALNUM.test(before) || ALNUM.test(after))) continue
    if ((kataHead && KATA.test(before)) || (kataTail && KATA.test(after))) continue
    return at
  }
  return -1
}

/** 文の中の用語を前から順に返す。同じ位置では長い表記を優先し、重なる位置の短い表記には一致させない。 */
export function findTerms(text: string, labels: TermLabel[]): TermHit[] {
  const next = labels.map((l) => indexOfLabel(text, l.label, 0))
  const hits: TermHit[] = []
  let offset = 0
  for (;;) {
    let best = -1
    for (let i = 0; i < labels.length; i++) {
      if (next[i] >= 0 && next[i] < offset) next[i] = indexOfLabel(text, labels[i].label, offset)
      if (next[i] >= 0 && (best < 0 || next[i] < next[best])) best = i // 同じ位置なら先に並ぶ長い表記が残る
    }
    if (best < 0) return hits
    const l = labels[best]
    if (l.term) hits.push({ at: next[best], ...l })
    offset = next[best] + l.label.length
  }
}
