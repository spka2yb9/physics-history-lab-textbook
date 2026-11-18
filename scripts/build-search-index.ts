// 各章を静的HTMLに描画し、次の3つを書き出す。
//   search-index.json  節ごとの本文テキスト（全文検索）
//   chapter-meta.json  章と節の見出しなど（目次・前後の章・参考資料一覧）
//   terms.json         Term で定義した用語と、定義している章・節（glossary モジュールの解説）
// 実行: npm run build:index
import { writeFileSync } from 'node:fs'
import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import type { Chapter } from '../src/content/types'
import { DFN, NOINDEX, parseDfn, stripDivs, toText, type TermDef } from './html.ts'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const mod = (await server.ssrLoadModule('/src/content/all-chapters.ts')) as { chapters: Chapter[] }
  const entries = []
  const terms = new Map<string, TermDef & { chapter: string; section: string }>()
  for (const ch of mod.chapters) {
    for (const sec of ch.sections) {
      const html = renderToStaticMarkup(createElement('div', null, sec.body))
      for (const m of html.matchAll(DFN)) {
        const t = parseDfn(m[1], m[2])
        if (!terms.has(t.term)) terms.set(t.term, { ...t, chapter: ch.key, section: sec.id }) // 重複は npm run check が報告する
      }
      entries.push({
        chapter: ch.key,
        chapterTitle: ch.title,
        sectionId: sec.id,
        sectionTitle: sec.title,
        text: toText(NOINDEX.reduce(stripDivs, html)),
      })
    }
  }
  // 科学者図鑑の人物ページも検索の対象にする（#/people/<id>）
  const peopleMod = (await server.ssrLoadModule('/src/content/people/index.ts')) as {
    PEOPLE: { id: string; name: string; original: string; tagline: string; bio: string[]; achievements: { text: string }[] }[]
  }
  for (const p of peopleMod.PEOPLE)
    entries.push({
      chapter: 'people',
      chapterTitle: '科学者図鑑',
      sectionId: p.id,
      sectionTitle: p.name,
      text: [p.original, p.tagline, ...p.bio, ...p.achievements.map((a) => a.text)].join(' '),
    })
  const out = (file: string, data: unknown) => writeFileSync(new URL(`../src/content/${file}`, import.meta.url), JSON.stringify(data))
  out('search-index.json', entries)
  // 目次などに使う章の情報（節の本文を除く）。アプリは本文を章ごとに遅れて読み込む。
  out('chapter-meta.json', mod.chapters.map(({ sections, ...rest }) => ({ ...rest, sections: sections.map(({ id, title }) => ({ id, title })) })))
  out('terms.json', [...terms.values()])
  console.log(`search index: ${entries.length} entries from ${mod.chapters.length} chapters and ${peopleMod.PEOPLE.length} people, ${terms.size} terms`)
} finally {
  await server.close()
}
