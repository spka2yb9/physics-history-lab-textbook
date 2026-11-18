import { useEffect, useMemo, useState } from 'react'
import { chapters, chapterLabel } from '../content/chapters'
import { BOOK_TITLE } from '../content/book'
import { FIELDS, FieldIcon, fieldByPart, type FieldId } from '../content/fields'
import { PEOPLE, personById } from '../content/people'
import type { MapEvent } from '../content/types'
import { hrefFor, personHref } from '../utils/route'
import { OverviewMap } from './OverviewMap'
import { FieldTag } from './history'

/*
 * 歴史マップ。横軸が年、行が分野。各章の events（発見・実験）と、科学者図鑑の人物の生きた期間を並べる。
 * 年の目盛りは、出来事の多い20世紀を広くとるため、区間ごとに縮尺を変えている（画面に注記する）。
 * 図の下に同じ内容の一覧を置き、図を見られない環境や狭い画面でも読めるようにする。
 */

type Ev = MapEvent & { field: FieldId; chapter: string; chapterTitle: string }

const ALL_EVENTS: Ev[] = chapters
  .flatMap((c) => (c.events ?? []).map((e) => ({ ...e, field: fieldByPart.get(c.part)!.id, chapter: c.key, chapterTitle: c.title })))
  .sort((a, b) => a.year - b.year)

/** 年 → 横の位置。区間ごとに縮尺を変える */
const ANCHORS: [number, number][] = [
  [1640, 0],
  [1800, 300],
  [1900, 700],
  [1950, 1180],
  [2030, 1720],
]
const X0 = 20
function xOf(year: number) {
  for (let i = 1; i < ANCHORS.length; i++) {
    const [y0, x0] = ANCHORS[i - 1]
    const [y1, x1] = ANCHORS[i]
    if (year <= y1 || i === ANCHORS.length - 1) return X0 + x0 + ((Math.min(year, 2030) - y0) / (y1 - y0)) * (x1 - x0)
  }
  return X0
}
const WIDTH = X0 + 1720 + 170

const TICKS = [1650, 1700, 1750, 1800, 1820, 1840, 1860, 1880, 1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030]
const ERAS = [
  { from: 1640, to: 1700, name: '17世紀' },
  { from: 1700, to: 1900, name: '18〜19世紀' },
  { from: 1900, to: 1950, name: '20世紀前半' },
  { from: 1950, to: 2030, name: '20世紀後半〜現在' },
]

/** 文字列の幅の見積もり（全角は1文字分、半角は0.6文字分） */
const textW = (s: string, fs: number) => [...s].reduce((w, c) => w + (c.charCodeAt(0) < 0x2000 ? 0.6 : 1), 0) * fs

const yearText = (e: MapEvent) => e.yearLabel ?? `${e.year}年`

const ROW_H = 40
const LANE_PAD = 10
const AXIS_H = 44
const PEOPLE_ROW = 26

/** 左から順に、重ならない一番上の行へ置く */
function pack<T>(items: T[], start: (t: T) => number, end: (t: T) => number): { item: T; row: number }[] {
  const rowEnds: number[] = []
  return items.map((item) => {
    const s = start(item)
    let row = rowEnds.findIndex((e) => e + 8 <= s)
    if (row < 0) row = rowEnds.length
    rowEnds[row] = end(item)
    return { item, row }
  })
}

export function MapPage({ restoreY }: { restoreY: number | null }) {
  const [shown, setShown] = useState<Set<FieldId>>(() => new Set(FIELDS.map((f) => f.id)))
  const [showEvents, setShowEvents] = useState(true)
  const [showPeople, setShowPeople] = useState(true)

  useEffect(() => {
    document.title = `歴史マップ | ${BOOK_TITLE}`
    scrollTo(0, restoreY ?? 0)
  }, [restoreY])

  const lanes = useMemo(() => {
    const out: { field: (typeof FIELDS)[number]; top: number; h: number; placed: { item: Ev; row: number }[] }[] = []
    for (const f of FIELDS.filter((x) => shown.has(x.id))) {
      const evs = showEvents ? ALL_EVENTS.filter((e) => e.field === f.id) : []
      const placed = pack(
        evs,
        (e) => xOf(e.year) - 6,
        (e) => xOf(e.year) + 12 + Math.max(textW(e.title, 12.5), textW(yearText(e), 11)),
      )
      const rows = Math.max(1, ...placed.map((p) => p.row + 1))
      const top = out.length ? out[out.length - 1].top + out[out.length - 1].h : AXIS_H
      out.push({ field: f, top, h: rows * ROW_H + LANE_PAD * 2, placed })
    }
    return out
  }, [shown, showEvents])

  const lanesBottom = lanes.length ? lanes[lanes.length - 1].top + lanes[lanes.length - 1].h : AXIS_H
  const people = useMemo(
    () =>
      showPeople
        ? pack(
            PEOPLE.filter((p) => shown.has(p.field)),
            (p) => xOf(p.born),
            (p) => (xOf(p.died) - xOf(p.born) >= textW(p.short, 12) + 10 ? xOf(p.died) : xOf(p.died) + 8 + textW(p.short, 12)),
          )
        : [],
    [shown, showPeople],
  )
  const peopleRows = people.length ? Math.max(...people.map((p) => p.row)) + 1 : 0
  const peopleTop = lanesBottom + (people.length ? 20 : 0)
  const H = peopleTop + (people.length ? 26 + peopleRows * PEOPLE_ROW + 10 : 10)

  const toggle = (id: FieldId) =>
    setShown((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const listed = ALL_EVENTS.filter((e) => shown.has(e.field))

  return (
    <article className="site-article map-page">
      <header className="page-head">
        <h1>歴史マップ</h1>
        <p className="page-lead">
          物理学の7分野の主な発見と実験を、年代順に並べた地図です。分野ごとの行に発見を置き、下の段に科学者の生きた期間を並べています。項目を押すと、その発見を説明している章へ移動します。人物の帯を押すと、科学者図鑑の人物ページへ移動します。
        </p>
      </header>

      <section aria-labelledby="ov-h" className="map-section">
        <h2 id="ov-h">分野のつながり</h2>
        <OverviewMap timeline={false} />
      </section>

      <section aria-labelledby="tl-h" className="map-section">
        <h2 id="tl-h">年表の地図</h2>
        <fieldset className="map-filter">
          <legend>表示する分野</legend>
          {FIELDS.map((f) => (
            <label key={f.id} className={`map-chip f-${f.id} ${shown.has(f.id) ? 'on' : ''}`}>
              <input type="checkbox" checked={shown.has(f.id)} onChange={() => toggle(f.id)} />
              <FieldIcon id={f.id} size={16} />
              {f.name}
            </label>
          ))}
        </fieldset>
        <div className="map-filter map-filter-2">
          <label className="ctl-check">
            <input type="checkbox" checked={showEvents} onChange={(e) => setShowEvents(e.target.checked)} />
            発見と実験（{listed.length}項目）
          </label>
          <label className="ctl-check">
            <input type="checkbox" checked={showPeople} onChange={(e) => setShowPeople(e.target.checked)} />
            科学者の生きた期間
          </label>
        </div>
        <p className="map-note">
          年の目盛りは区間ごとに縮尺が違います。1800年までは狭く、出来事の多い1900〜1950年をいちばん広くとっています。横にスクロールすると現在まで見られます。
        </p>
        <div className="timeline">
          <div className="timeline-labels" style={{ height: H }} aria-hidden="true">
            {lanes.map((l) => (
              <div key={l.field.id} className={`tl-lane-label f-${l.field.id}`} style={{ top: l.top, height: l.h }}>
                <FieldIcon id={l.field.id} size={20} />
                <span>
                  {l.field.lines.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </span>
              </div>
            ))}
            {people.length > 0 && (
              <div className="tl-lane-label tl-people-label" style={{ top: peopleTop, height: H - peopleTop }}>
                <span>
                  <span>科学者の</span>
                  <span>生きた期間</span>
                </span>
              </div>
            )}
          </div>
          <div className="timeline-scroll" tabIndex={0} aria-label="年表の地図（横にスクロールできます）">
            <svg className="timeline-svg" width={WIDTH} height={H} viewBox={`0 0 ${WIDTH} ${H}`} role="img" aria-label="物理学の主な発見と科学者の生きた期間を、分野ごとの行に年代順に並べた地図。同じ内容を下の一覧にも載せています。">
              {ERAS.map((e, i) => (
                <g key={e.name}>
                  <rect x={xOf(e.from)} y={0} width={xOf(e.to) - xOf(e.from)} height={H} className={`tl-era tl-era-${i % 2}`} />
                  <text x={xOf(e.from) + 8} y={13} fontSize={12} fontWeight={700} className="tl-era-name">
                    {e.name}
                  </text>
                </g>
              ))}
              {TICKS.map((y) => (
                <g key={y}>
                  <line x1={xOf(y)} x2={xOf(y)} y1={AXIS_H - 12} y2={H} className="tl-tick" />
                  <text x={xOf(y)} y={AXIS_H - 18} fontSize={11} textAnchor="middle" className="tl-tick-label">
                    {y}
                  </text>
                </g>
              ))}
              {lanes.map((l) => (
                <g key={l.field.id} className={`f-${l.field.id}`}>
                  <line x1={0} x2={WIDTH} y1={l.top} y2={l.top} className="tl-lane-line" />
                  {l.placed.map(({ item: e, row }) => {
                    const x = xOf(e.year)
                    const y = l.top + LANE_PAD + row * ROW_H + ROW_H / 2
                    return (
                      <a key={`${e.chapter}-${e.title}`} href={hrefFor(e.chapter, e.section)} className="tl-event" aria-label={`${yearText(e)} ${e.title}（${chapterLabel({ key: e.chapter })}）`}>
                        <title>{`${yearText(e)} ${e.title}：${e.note}`}</title>
                        <circle cx={x} cy={y} r={6} className="tl-dot" />
                        <text x={x + 11} y={y - 7} fontSize={12.5} fontWeight={700} dominantBaseline="central">
                          {e.title}
                        </text>
                        <text x={x + 11} y={y + 10} fontSize={11} dominantBaseline="central" className="tl-year">
                          {yearText(e)}
                        </text>
                      </a>
                    )
                  })}
                </g>
              ))}
              {people.length > 0 && (
                <g>
                  <line x1={0} x2={WIDTH} y1={peopleTop} y2={peopleTop} className="tl-lane-line" />
                  {people.map(({ item: p, row }) => {
                    const x1 = xOf(p.born)
                    const x2 = xOf(p.died)
                    const y = peopleTop + 18 + row * PEOPLE_ROW
                    const inside = x2 - x1 >= textW(p.short, 12) + 10
                    return (
                      <a key={p.id} href={personHref(p.id)} className={`tl-person f-${p.field}`} aria-label={`${p.name}（${p.born}〜${p.died}年）`}>
                        <title>{`${p.name}（${p.born}〜${p.died}年）`}</title>
                        <rect x={x1} y={y} width={Math.max(4, x2 - x1)} height={18} rx={4} className="tl-bar" />
                        <text x={inside ? x1 + 5 : x2 + 5} y={y + 9} fontSize={12} dominantBaseline="central">
                          {p.short}
                        </text>
                      </a>
                    )
                  })}
                </g>
              )}
            </svg>
          </div>
        </div>
      </section>

      <section aria-labelledby="list-h" className="map-section">
        <h2 id="list-h">年表の一覧</h2>
        <p className="map-note">上の地図と同じ項目を、年代順に並べています。表示する分野の選択は、この一覧にも反映されます。</p>
        {ERAS.map((era) => {
          const items = listed.filter((e) => e.year >= era.from && (e.year < era.to || (era.to === 2030 && e.year <= 2030)))
          if (items.length === 0) return null
          return (
            <div key={era.name} className="tl-list-era">
              <h3>{era.name}</h3>
              <ol className="tl-list">
                {items.map((e) => (
                  <li key={`${e.chapter}-${e.title}`} className={`f-${e.field}`}>
                    <span className="tl-list-year">{yearText(e)}</span>
                    <span className="tl-list-body">
                      <a href={hrefFor(e.chapter, e.section)}>{e.title}</a> <FieldTag id={e.field} />
                      <span className="tl-list-note">{e.note}</span>
                      <span className="tl-list-meta">
                        {chapterLabel({ key: e.chapter })}「{e.chapterTitle}」
                        {e.people?.length ? '／' : ''}
                        {e.people?.map((id, i) => {
                          const p = personById.get(id)
                          return (
                            <span key={id}>
                              {i > 0 && '、'}
                              {p ? <a href={personHref(id)}>{p.short}</a> : id}
                            </span>
                          )
                        })}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
        {listed.length === 0 && <p>表示する分野を1つ以上選んでください。</p>}
      </section>
    </article>
  )
}
