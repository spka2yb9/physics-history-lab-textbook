// 章を描画した HTML の処理。build-search-index.ts と check-chapter.ts で使う。

/** 索引に入れない枠の class。図の中身・図の操作部・コードの枠（code モジュール） */
export const NOINDEX = ['fig-body', 'fig-controls', 'code-block']

/** class が cls で始まる div 要素（入れ子の div を含む）を取り除く。 */
export function stripDivs(html: string, cls: string): string {
  const open = `<div class="${cls}`
  let out = ''
  let i = 0
  for (let start = html.indexOf(open); start >= 0; start = html.indexOf(open, i)) {
    out += html.slice(i, start)
    let depth = 0
    const tag = /<(\/?)div\b[^>]*>/g
    tag.lastIndex = start
    for (let m = tag.exec(html); m; m = tag.exec(html)) {
      depth += m[1] ? -1 : 1
      if (depth === 0) {
        i = tag.lastIndex
        break
      }
    }
    if (depth !== 0) return out // 閉じタグが見つからない（起こらない想定）
  }
  return out + html.slice(i)
}

export function decode(s: string): string {
  return s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

/** HTML から文字だけを取り出す。 */
export function toText(html: string): string {
  return decode(
    html
      .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
      .replace(/<\/?span[^>]*>/g, '') // コード強調の span は語を分断しない
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

/** 用語の定義（Term が描画する dfn 要素）。 */
export interface TermDef {
  term: string
  en?: string
  def?: string
  aliases?: string[]
}

export const DFN = /<dfn class="term"([^>]*)>([\s\S]*?)<\/dfn>/g

export function parseDfn(attrs: string, inner: string): TermDef {
  const attr = (name: string) => {
    const m = new RegExp(` data-${name}="([^"]*)"`).exec(attrs)
    return m ? decode(m[1]) : undefined
  }
  const t: TermDef = { term: toText(inner.replace(/<span class="term-en">[\s\S]*?<\/span>/, '')) }
  const en = attr('en')
  const def = attr('def')
  const aliases = attr('aliases')?.split('|').filter(Boolean)
  if (en) t.en = en
  if (def) t.def = def
  if (aliases?.length) t.aliases = aliases
  return t
}
