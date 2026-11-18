// 章ファイルを描画して基本的な整合性を検査する。文章の質は検査しない（校閲は人とエージェントが読んで行う）。
// 実行: npm run check -- 1 2 intro   （キーなしなら全章。図への参照と用語は、指定した章だけを出力する場合も全章を見て判定する）
//   [NG] は直す必要がある問題、· は読んで判断する注意（未執筆の章へのリンク、定義より前に出てくる用語など）
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import type { Chapter } from '../src/content/types'
import { CHAPTER_KEYS, PARTS, TERM_IGNORE, labelFor, shortFor } from '../src/content/book.ts'
import { findTerms, termLabels } from '../src/utils/terms.ts'
import { DFN, NOINDEX, parseDfn, stripDivs, toText } from './html.ts'

/** 1章の本文の最小文字数（図・表の中の文字とコードを除く）と図の最小数。要件で決めた分量に合わせて変える */
const MIN_CHARS = 4000
const MIN_FIGS = 8
/** 動く図（Anim）の最小数 */
const MIN_ANIMS = 3
/** 章ではないページ（#/people/newton など） */
const SITE_PAGES = new Set(['map', 'fields', 'people'])

const want = process.argv.slice(2)
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let failed = false

for (const f of ['src/content/book.ts', 'README.md', 'index.html']) {
  if (/__(BOOK|PKG)_\w+__/.test(readFileSync(f, 'utf8'))) {
    console.log(`[NG] ${f} に仮の文字（__BOOK_LEAD__ など）が残っている`)
    failed = true
  }
}

try {
  const mod = (await server.ssrLoadModule('/src/content/all-chapters.ts')) as { chapters: Chapter[] }
  const peopleMod = (await server.ssrLoadModule('/src/content/people/index.ts')) as { PEOPLE: { id: string }[] }
  const personIds = new Set(peopleMod.PEOPLE.map((p) => p.id))
  const known = new Set(mod.chapters.map((c) => c.key))
  const approved = new Set<string>(CHAPTER_KEYS)
  const parts = new Set(PARTS.map((p) => p.id))

  // 全章を先に描画する（描画に失敗した節は html が null）
  const rendered = mod.chapters.map((ch) => ({
    ch,
    secs: ch.sections.map((sec) => {
      try {
        return { sec, html: renderToStaticMarkup(createElement('div', null, sec.body)), error: '' }
      } catch (e) {
        return { sec, html: null, error: (e as Error).message }
      }
    }),
  }))
  const problemsOf = new Map(mod.chapters.map((c) => [c.key, [] as string[]]))
  const notesOf = new Map(mod.chapters.map((c) => [c.key, new Set<string>()]))
  const where = (chapter: string, section: string) => `${labelFor(chapter)}の節 ${section}`

  // 用語：同じ用語を2か所以上で定義していないか（NG）、定義より前の節や同じ節の前の方に出てこないか（注意）
  const defs = new Map<string, { chapter: string; section: string }>()
  for (const { ch, secs } of rendered)
    for (const { sec, html } of secs)
      for (const m of (html ?? '').matchAll(DFN)) {
        const { term } = parseDfn(m[1], m[2])
        const first = defs.get(term)
        if (first) problemsOf.get(ch.key)!.push(`節 ${sec.id} の用語「${term}」は ${where(first.chapter, first.section)} でも定義している（Term は1か所だけにする）`)
        else defs.set(term, { chapter: ch.key, section: sec.id })
      }
  const termInfo = rendered.flatMap(({ secs }) => secs.flatMap(({ html }) => [...(html ?? '').matchAll(DFN)].map((m) => parseDfn(m[1], m[2]))))
  const labels = termLabels(termInfo, TERM_IGNORE)
  const defined = new Set<string>()
  const reported = new Set<string>()
  for (const { ch, secs } of rendered) {
    for (const { sec, html } of secs) {
      if (html == null) continue
      // dfn の前後で区切り、読む順に「使われた」「定義された」を追う。検索索引と同じく図の中とコードは対象外
      const body = NOINDEX.reduce(stripDivs, html).replace(/<code[\s\S]*?<\/code>/g, ' ')
      let last = 0
      const pieces: (string | { term: string })[] = []
      for (const m of body.matchAll(DFN)) {
        pieces.push(body.slice(last, m.index), { term: parseDfn(m[1], m[2]).term })
        last = m.index + m[0].length
      }
      pieces.push(body.slice(last))
      for (const p of pieces) {
        if (typeof p !== 'string') {
          defined.add(p.term)
          continue
        }
        const text = toText(p)
        for (const h of findTerms(text, labels)) {
          if (defined.has(h.term) || reported.has(h.term)) continue
          reported.add(h.term)
          const d = defs.get(h.term)!
          const ctx = text.slice(Math.max(0, h.at - 20), h.at + h.label.length + 20)
          notesOf.get(ch.key)!.add(`用語「${h.term}」が定義（${where(d.chapter, d.section)}）より前の節 ${sec.id} に出てくる：…${ctx}…`)
        }
      }
      for (const m of html.matchAll(DFN)) defined.add(parseDfn(m[1], m[2]).term) // 図の中で定義した用語
    }
  }

  const figsByChapter = new Map<string, Set<string>>()
  const statsOf = new Map<string, string>()
  for (const { ch, secs } of rendered) {
    if (!approved.has(ch.key)) {
      console.log(`[NG] book.ts の CHAPTER_KEYS にないキー: ${ch.key}`)
      failed = true
    }
    const problems = problemsOf.get(ch.key)!
    const notes = notesOf.get(ch.key)!
    const ids = new Set<string>()
    const figIds = new Set<string>()
    let lastFig = 0
    let chars = 0
    let figs = 0
    let codes = 0
    let anims = 0
    const prefix = `${shortFor(ch.key)}-`
    if (!parts.has(ch.part)) problems.push(`book.ts の PARTS にない部: ${ch.part}`)
    for (const { sec, html, error } of secs) {
      if (!/^[a-z0-9-]+$/.test(sec.id)) problems.push(`節 id が不正: ${sec.id}`)
      if (ids.has(sec.id) || sec.id === 'goals') problems.push(`節 id が重複: ${sec.id}`)
      ids.add(sec.id)
      if (html == null) {
        problems.push(`節 ${sec.id} の描画に失敗: ${error}`)
        continue
      }
      figs += (html.match(/<figure/g) ?? []).length
      codes += (html.match(/class="code-block/g) ?? []).length
      anims += (html.match(/<figure class="[^"]*fig-anim/g) ?? []).length
      for (const m of html.matchAll(/id="fig-([^"]+)"/g)) {
        if (!m[1].startsWith(prefix)) problems.push(`図番号が章と合わない: 図${m[1]}`)
        if (figIds.has(m[1])) problems.push(`図番号が重複: 図${m[1]}`)
        figIds.add(m[1])
        const seq = Number(m[1].split('-')[1])
        if (seq !== ++lastFig) problems.push(`図番号が掲載順でない: 図${m[1]}（${lastFig}番目に掲載）`)
      }
      for (const m of html.matchAll(/href="#\/([\w-]+)(?:\/([\w-]+))?"/g)) {
        if (SITE_PAGES.has(m[1])) {
          if (m[1] === 'people' && m[2] && !personIds.has(m[2])) notes.add(`図鑑にまだいない人物へのリンク: ${m[2]}`)
          continue
        }
        if (!approved.has(m[1])) problems.push(`存在しない章へのリンク: ${m[1]}`)
        else if (!known.has(m[1])) notes.add(`未執筆の章へのリンク: ${m[1]}`)
      }
      for (const m of html.matchAll(/<svg(?![^>]*(?:role="img"|aria-hidden="true"))/g)) problems.push(`role="img" の無い svg（節 ${sec.id}）: ${m[0].slice(0, 40)}`)
      if (/\*\*[^*]+\*\*/.test(html.replace(/<pre[\s\S]*?<\/pre>/g, ''))) problems.push(`Markdown の太字記法が残っている（節 ${sec.id}）`)
      // 図の中の文字とコードは本文の分量に数えない
      const text = html
        .replace(/<figure[\s\S]*?<\/figure>/g, '')
        .replace(/<pre[\s\S]*?<\/pre>/g, '')
        .replace(/<[^>]+>/g, '')
      chars += text.length
    }
    figsByChapter.set(ch.key, figIds)
    for (const k of ch.prerequisites) if (!approved.has(k)) problems.push(`前提の章のキーが不正: ${k}`)
    if (chars < MIN_CHARS) problems.push(`本文が短い（${chars} 文字。コード・図を除く。目安 ${MIN_CHARS}）`)
    if (figs < MIN_FIGS) problems.push(`図が ${figs} 点（${MIN_FIGS} 点以上が目安）`)
    if (anims < MIN_ANIMS) problems.push(`動く図が ${anims} 点（${MIN_ANIMS} 点以上が目安）`)
    for (const id of ch.people ?? []) if (!personIds.has(id)) notes.add(`people の id が図鑑にまだない: ${id}`)
    for (const e of ch.events ?? []) {
      if (e.section && !ch.sections.some((s) => s.id === e.section)) problems.push(`歴史マップの項目「${e.title}」の節 ${e.section} がない`)
      for (const id of e.people ?? []) if (!personIds.has(id)) notes.add(`歴史マップの項目「${e.title}」の人物 ${id} が図鑑にまだない`)
    }
    const terms = secs.reduce((n, s) => n + (s.html?.match(DFN) ?? []).length, 0)
    statsOf.set(ch.key, `節 ${ch.sections.length} / 本文 ${chars} 文字 / 図 ${figs}（動く図 ${anims}） / 用語 ${terms} / 人物 ${ch.people?.length ?? 0} / 年表 ${ch.events?.length ?? 0}`)
  }

  // 図への参照（FigRef）の参照先が存在するか
  for (const { ch, secs } of rendered)
    for (const { html } of secs)
      for (const m of (html ?? '').matchAll(/>図([^<\s]+-\d+)<\/a>/g))
        if (![...figsByChapter.values()].some((set) => set.has(m[1]))) problemsOf.get(ch.key)!.push(`存在しない図への参照: 図${m[1]}`)

  for (const { ch } of rendered) {
    if (want.length && !want.includes(ch.key)) continue
    const problems = problemsOf.get(ch.key)!
    const notes = notesOf.get(ch.key)!
    if (problems.length) failed = true
    console.log(`[${problems.length ? 'NG' : 'OK'}] ${ch.key} ${ch.title} — ${statsOf.get(ch.key)}`)
    for (const p of problems) console.log(`      - ${p}`)
    for (const p of notes) console.log(`      · ${p}`)
  }
  const withDef = termInfo.filter((t) => t.def).length
  console.log(`用語 ${defs.size} 件（解説 def あり ${withDef} 件）`)
} finally {
  await server.close()
}
process.exit(failed ? 1 : 0)
