import './glossary.css'
import { Children, Fragment, cloneElement, isValidElement, useId, useRef, type ReactElement, type ReactNode } from 'react'
import terms from '../content/terms.json'
import { TERM_IGNORE, labelFor } from '../content/book'
import { chapterByKey } from '../content/chapters'
import { findTerms, termLabels } from '../utils/terms'
import { hrefFor } from '../utils/route'
import { Callout } from './content'

/*
 * 用語の解説のポップアップ。Term に def（短い解説）を書いた用語を、各節の本文の最初の出現だけ押せるようにする。
 * 用語を定義している節の中では付けない。ブラウザー標準の Popover API を使う（Esc や外側を押すと閉じる）。
 *
 * 対象は節の本文の文字だけ。見出し・リンク・ボタン・コード・用語の定義（dfn）・図（Figure）の中と、
 * Callout 以外の自作の部品の中は対象外（部品の中で何を表示するかは部品ごとに違うため）。
 */

interface TermInfo {
  term: string
  en?: string
  def?: string
  aliases?: string[]
  chapter: string
  section: string
}

const withDef = (terms as TermInfo[]).filter((t) => t.def)
const byTerm = new Map(withDef.map((t) => [t.term, t]))
const labels = termLabels(withDef, TERM_IGNORE)

const SKIP_TAGS = new Set(['a', 'button', 'code', 'pre', 'kbd', 'dfn', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'svg', 'textarea', 'select'])
/** 中の文字にも用語の解説を付ける自作の部品 */
const DESCEND = new Set<unknown>([Fragment, Callout])

/** 節の本文に用語の解説を付ける。ChapterView から節ごとに呼ぶ。 */
export function glossify(body: ReactNode, at: { chapter: string; section: string }): ReactNode {
  if (labels.length === 0) return body
  const seen = new Set<string>()
  const link = (text: string): ReactNode => {
    const out: ReactNode[] = []
    let last = 0
    for (const h of findTerms(text, labels)) {
      const t = byTerm.get(h.term)!
      if (seen.has(h.term) || (t.chapter === at.chapter && t.section === at.section)) continue
      seen.add(h.term)
      out.push(text.slice(last, h.at), <Gloss key={h.at} info={t}>{h.label}</Gloss>)
      last = h.at + h.label.length
    }
    if (out.length === 0) return text
    out.push(text.slice(last))
    return out
  }
  const walk = (node: ReactNode): ReactNode => {
    if (typeof node === 'string') return link(node)
    if (Array.isArray(node)) return Children.map(node, walk)
    if (!isValidElement(node)) return node
    const el = node as ReactElement<{ children?: ReactNode }>
    const ok = typeof el.type === 'string' ? !SKIP_TAGS.has(el.type) : DESCEND.has(el.type)
    if (!ok || el.props.children == null) return el
    return cloneElement(el, undefined, Children.map(el.props.children, walk))
  }
  return walk(body)
}

function Gloss({ info, children }: { info: TermInfo; children: ReactNode }) {
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  const ch = chapterByKey.get(info.chapter)
  const sec = ch?.sections.find((s) => s.id === info.section)
  return (
    <>
      <button type="button" className="gloss" popoverTarget={id}>
        {children}
      </button>
      <span popover="auto" id={id} ref={ref} className="gloss-pop" role="dialog" aria-label={`用語の解説：${info.term}`}>
        <span className="gloss-head">
          <span className="gloss-term">
            {info.term}
            {info.en && <span className="term-en">（{info.en}）</span>}
          </span>
          <button type="button" className="gloss-close" popoverTarget={id} popoverTargetAction="hide" aria-label="閉じる">
            ×
          </button>
        </span>
        <span className="gloss-def">{info.def}</span>
        {ch && (
          <a className="gloss-at" href={hrefFor(info.chapter, info.section)} onClick={() => ref.current?.hidePopover()}>
            {labelFor(info.chapter)}「{sec?.title ?? ch.title}」で説明しています
          </a>
        )}
      </span>
    </>
  )
}
