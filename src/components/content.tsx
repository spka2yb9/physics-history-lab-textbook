import type { ReactNode } from 'react'
import { hrefFor } from '../utils/route'
import { keyForShort, labelFor } from '../content/book'

/* ---------- 図 ---------- */

interface FigureProps {
  /** 図番号。例 "3-1"、数字以外のキーの章は "序-1"（頭は book.ts の short） */
  n: string
  title: string
  /** 図の読み方や補足。模式図ならその旨を含める */
  caption?: ReactNode
  /** 操作できる図のスライダーや切り替え。図の上に置く（controls モジュールの部品を入れる） */
  controls?: ReactNode
  /** 動く図（Anim）のとき true。章の検査が動く図の数を数える */
  anim?: boolean
  children: ReactNode
}

/** 図解の共通枠。幅が足りないときは横スクロールで全体を見られる。中身は検索索引に入れない。 */
export function Figure({ n, title, caption, controls, anim, children }: FigureProps) {
  return (
    <figure className={['fig', controls ? 'fig-interactive' : '', anim ? 'fig-anim' : ''].join(' ').trim()} id={`fig-${n}`}>
      {controls && <div className="fig-controls">{controls}</div>}
      <div className="fig-body">{children}</div>
      <figcaption>
        <span className="fig-label">図 {n}</span> {title}
        {caption && <span className="fig-caption">{caption}</span>}
      </figcaption>
    </figure>
  )
}

interface ComparePanel {
  /** 「修正前」「修正後」など。色だけで区別しないよう、必ず文字で示す */
  label: string
  tone?: 'before' | 'after'
  children: ReactNode
  note?: ReactNode
}

/** 並べて比べる図。広い画面では横、狭い画面では縦に並ぶ。Figure の中に置く。 */
export function Compare({ panels, cols }: { panels: ComparePanel[]; cols?: number }) {
  return (
    <div className="cmp" style={{ '--cmp-cols': cols ?? panels.length } as React.CSSProperties}>
      {panels.map((p, i) => (
        <div key={i} className={`cmp-panel ${p.tone ? `cmp-${p.tone}` : ''}`}>
          <div className="cmp-label">{p.label}</div>
          <div className="cmp-body">{p.children}</div>
          {p.note && <div className="cmp-note">{p.note}</div>}
        </div>
      ))}
    </div>
  )
}

/* ---------- 補足枠 ---------- */

interface CalloutProps {
  /** evidence は通説や根拠の強さについての注記、unverified は確認できなかった事項 */
  kind?: 'note' | 'warn' | 'evidence' | 'unverified'
  title?: string
  children: ReactNode
}

const calloutTitle = { note: '補足', warn: '注意', evidence: '根拠の強さ', unverified: '未検証' }

export function Callout({ kind = 'note', title, children }: CalloutProps) {
  return (
    <aside className={`callout callout-${kind}`}>
      <div className="callout-title">{title ?? calloutTitle[kind]}</div>
      <div className="callout-body">{children}</div>
    </aside>
  )
}

/* ---------- 用語・章リンク ---------- */

interface TermProps {
  /** 用語。1つの用語を定義する Term は本全体で1か所だけ（npm run check が検査する） */
  children: ReactNode
  /** 英語名など。（ ）で添えて表示し、本文の中のこの表記も同じ用語として扱う */
  en?: string
  /** 1〜2文の短い解説。glossary モジュールを入れた本では、以降の節でこの用語を押すと表示する */
  def?: string
  /** 本文で使う別の表記（略語など） */
  aliases?: string[]
}

/** 初出の用語。dfn 要素として強調する。build:index が terms.json に集める。 */
export function Term({ children, en, def, aliases }: TermProps) {
  return (
    <dfn className="term" data-en={en} data-def={def} data-aliases={aliases?.join('|')}>
      {children}
      {en && <span className="term-en">（{en}）</span>}
    </dfn>
  )
}

/** 章・節へのリンク。文字を省略すると「第3章」などの表示名になる。 */
export function ChapterLink({ n, section, children }: { n: string; section?: string; children?: ReactNode }) {
  return <a href={hrefFor(n, section)}>{children ?? labelFor(n)}</a>
}

/** 図への参照。「図1-2」。同じ章の図ならその場でスクロールする。 */
export function FigRef({ n }: { n: string }) {
  const key = keyForShort(n.split('-')[0])
  return (
    <a href={hrefFor(key)} onClick={(e) => scrollToId(e, `fig-${n}`)}>
      図{n}
    </a>
  )
}

/* ---------- 図への参照のスクロール ---------- */

function scrollToId(e: React.MouseEvent, id: string) {
  const el = document.getElementById(id)
  if (el) {
    e.preventDefault()
    el.scrollIntoView({ block: 'center' })
  }
}
