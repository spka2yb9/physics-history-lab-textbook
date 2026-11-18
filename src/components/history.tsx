import { Fragment, type ReactNode } from 'react'
import { lifeLabel, personById, portraitUrl, type Person } from '../content/people'
import { FieldIcon, fieldById } from '../content/fields'
import { personHref } from '../utils/route'

/* ---------- 人物へのリンク ---------- */

/** 本文の中の人物名。科学者図鑑の人物ページへリンクする。文字を省略すると短い名前（「ニュートン」）を出す。 */
export function Who({ id, children }: { id: string; children?: ReactNode }) {
  const p = personById.get(id)
  if (!p) return <>{children ?? id}</> // 図鑑にまだいない人。リンクにしない
  return (
    <a className="who" href={personHref(id)}>
      {children ?? p.short}
    </a>
  )
}

/* ---------- 確かさの印 ---------- */

export type LevelId = 'confirmed' | 'hypothesis' | 'candidate'

export const LEVELS: Record<LevelId, { label: string; desc: string }> = {
  confirmed: { label: '確かめられている', desc: '観測や実験で何度も確かめられ、研究者の間で受け入れられている。' },
  hypothesis: { label: '有力な仮説', desc: '観測と合う有力な説明だが、決め手になる確認はまだない。' },
  candidate: { label: '検証されていない候補', desc: '理論の候補として研究されているが、観測や実験による確認がない。' },
}

/** 確かさの印。色だけでなく形（塗った丸・半分の丸・点線の丸）と文字で区別する。 */
export function Level({ of }: { of: LevelId }) {
  return (
    <span className={`level level-${of}`} title={LEVELS[of].desc}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        {of === 'confirmed' && <circle cx="7" cy="7" r="5.5" fill="currentColor" />}
        {of === 'hypothesis' && (
          <>
            <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 1.5a5.5 5.5 0 0 1 0 11Z" fill="currentColor" />
          </>
        )}
        {of === 'candidate' && <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.2 1.8" />}
      </svg>
      {LEVELS[of].label}
    </span>
  )
}

/* ---------- 肖像と人物カード ---------- */

/** 肖像。画像がない人は、名前の頭文字と分野の印の札を出す。 */
export function PortraitImg({ p, size = 'md' }: { p: Person; size?: 'sm' | 'md' | 'lg' }) {
  if (p.portrait)
    return <img className={`portrait portrait-${size}`} src={portraitUrl(p.portrait.file)} alt={`${p.name}の肖像`} loading="lazy" decoding="async" />
  return (
    <div className={`portrait portrait-${size} portrait-none f-${p.field}`} role="img" aria-label={`${p.name}（肖像なし）`}>
      <FieldIcon id={p.field} size={size === 'sm' ? 18 : 28} />
      <span className="portrait-initial">{p.short.slice(0, 1)}</span>
    </div>
  )
}

export function FieldTag({ id }: { id: Person['field'] }) {
  const f = fieldById.get(id)!
  // 「・」の後ろでだけ折り返す（狭いカードで「量子場理論・素粒子物理学」がはみ出さないように）
  const parts = f.name.split('・')
  return (
    <span className={`field-tag f-${id}`}>
      {parts.map((s, i) => (
        <Fragment key={i}>
          {i > 0 && '・'}
          {i > 0 && <wbr />}
          {s}
        </Fragment>
      ))}
    </span>
  )
}

/** 人物カード。図鑑の一覧・トップ・章末で使う。 */
export function PersonCard({ p, compact }: { p: Person; compact?: boolean }) {
  return (
    <a className={`person-card ${compact ? 'person-card-compact' : ''}`} href={personHref(p.id)}>
      <PortraitImg p={p} size={compact ? 'sm' : 'md'} />
      <span className="person-card-body">
        <span className="person-card-name">{p.name}</span>
        <span className="person-card-life">{lifeLabel(p)}</span>
        <FieldTag id={p.field} />
        {!compact && <span className="person-card-tagline">{p.tagline}</span>}
      </span>
    </a>
  )
}

/** 章末の「この章に登場する科学者」。chapter.people から作る。 */
export function ChapterPeople({ ids }: { ids: string[] }) {
  const list = ids.map((id) => personById.get(id)).filter((p): p is Person => p != null)
  if (list.length === 0) return null
  return (
    <section className="chapter-people" aria-labelledby="chapter-people-h">
      <h2 id="chapter-people-h">この章に登場する科学者</h2>
      <div className="person-grid person-grid-compact">
        {list.map((p) => (
          <PersonCard key={p.id} p={p} compact />
        ))}
      </div>
    </section>
  )
}
