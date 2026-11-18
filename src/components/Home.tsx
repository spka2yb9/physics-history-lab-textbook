import { useEffect } from 'react'
import { chapterByKey, chapterLabel } from '../content/chapters'
import { BOOK_TITLE, CHAPTER_KEYS, PARTS } from '../content/book'
import { FIELDS, FieldIcon } from '../content/fields'
import { PEOPLE, personById, portraitUrl } from '../content/people'
import { hrefFor, personHref } from '../utils/route'
import { OverviewMap } from './OverviewMap'
import { PersonCard } from './history'

/** トップに並べる科学者（10人目の枠は「ほかにも」） */
const FEATURED = ['newton', 'maxwell', 'boltzmann', 'planck', 'bohr', 'heisenberg', 'schrodinger', 'einstein', 'oppenheimer']
const OTHERS = ['galileo', 'faraday', 'curie', 'dirac', 'yukawa', 'feynman']

/** 見出し画像に重ねる肖像（画像がある人だけ）。位置は CSS の .hero-p-<id> */
const HERO = ['newton', 'maxwell', 'planck', 'einstein']

export function Home() {
  useEffect(() => {
    document.title = BOOK_TITLE
    scrollTo(0, 0)
  }, [])
  const featured = FEATURED.map((id) => personById.get(id)).filter((p) => p != null)
  const others = OTHERS.map((id) => personById.get(id)).filter((p) => p != null)
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-h">
        <div className="hero-text">
          <h1 id="hero-h">物理学の歴史ラボ</h1>
          <p className="hero-lead">
            物理学の7つの分野を、歴史の流れと重要な科学者たちとともに学ぶサイトです。数式は使わず、図と動く図で説明します。
          </p>
          <div className="hero-buttons">
            <a className="btn btn-primary" href={hrefFor('1')}>
              <span aria-hidden="true">▶</span> 第1章から読む
            </a>
            <a className="btn" href="#/fields">
              <span aria-hidden="true">▦</span> 分野から探す
            </a>
          </div>
        </div>
        <HeroArt />
        <p className="hero-credit">
          肖像：<a href={personHref('newton')}>ニュートン</a>、<a href={personHref('maxwell')}>マクスウェル</a>、<a href={personHref('planck')}>プランク</a>、<a href={personHref('einstein')}>アインシュタイン</a>。作者と利用条件は各人物のページに載せています。
        </p>
      </section>

      <section className="home-section" aria-labelledby="map-h">
        <div className="home-head">
          <h2 id="map-h">物理学の歴史マップ</h2>
          <span className="home-head-sub">物理学の発展と分岐の全体像</span>
          <a className="home-head-link" href="#/map">
            詳しい歴史マップを見る ›
          </a>
        </div>
        <p className="home-desc">
          物理学は、17世紀にニュートンが運動の法則を示したことから始まり、19世紀に電磁気学と熱力学が加わりました。20世紀の初めに相対性理論と量子力学が生まれ、そこから素粒子の理論と宇宙の理論へ広がって、現在も研究が続いています。分野の箱を押すと、その分野の章の一覧へ移動します。
        </p>
        <OverviewMap />
      </section>

      <section className="home-section" aria-labelledby="people-h">
        <div className="home-head">
          <h2 id="people-h">主要な科学者たち</h2>
          <span className="home-head-sub">物理学の発展を支えた科学者</span>
          <a className="home-head-link" href="#/people">
            すべての科学者を見る（{PEOPLE.length}人） ›
          </a>
        </div>
        <div className="person-grid">
          {featured.map((p) => (
            <PersonCard key={p.id} p={p} />
          ))}
          <a className="person-card person-card-more" href="#/people">
            <span className="person-card-name">ほかにも</span>
            <span className="more-names">
              {others.map((p) => (
                <span key={p.id}>{p.name}</span>
              ))}
            </span>
            <span className="person-card-tagline">など、合わせて{PEOPLE.length}人を紹介しています。</span>
          </a>
        </div>
      </section>

      <section className="home-section" aria-labelledby="fields-h">
        <div className="home-head">
          <h2 id="fields-h">学べる分野</h2>
          <span className="home-head-sub">物理学の主要な7つの分野を、歴史の順に</span>
        </div>
        <div className="field-cards">
          {FIELDS.map((f) => (
            <a key={f.id} className={`field-card f-${f.id}`} href={`#/fields/${f.part}`}>
              <FieldIcon id={f.id} size={40} />
              <span className="field-card-name">
                {f.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </span>
              <span className="field-card-lead">{f.lead}</span>
              <span className="field-card-more">詳しく見る ›</span>
            </a>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="toc-h">
        <div className="home-head">
          <h2 id="toc-h">全37章の目次</h2>
          <span className="home-head-sub">第1章から順に読むと、ニュートンから現在までを年代順にたどれます</span>
        </div>
        <div className="home-toc">
          {PARTS.map((p) => {
            const list = CHAPTER_KEYS.map((k) => chapterByKey.get(k)).filter((c) => c?.part === p.id)
            return (
              <div key={p.id} className="toc-part">
                <h3>{p.title}</h3>
                {list.length > 0 ? (
                  <ol className="toc-list">
                    {list.map((c) => (
                      <li key={c!.key}>
                        <a href={hrefFor(c!.key)}>
                          <span className="toc-num">{chapterLabel(c!)}</span> {c!.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="toc-summary">準備中</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="home-cta" aria-labelledby="cta-h">
        <h2 id="cta-h">ニュートンから現在まで、物理学の流れを順にたどる</h2>
        <div className="hero-buttons">
          <a className="btn btn-primary" href={hrefFor('1')}>
            <span aria-hidden="true">▶</span> 第1章から読む
          </a>
          <a className="btn btn-ghost" href="#/map">
            歴史マップを見る
          </a>
        </div>
      </section>
    </div>
  )
}

/** 見出し画像。肖像（利用条件を確かめた画像だけ）と、飾りとしての有名な式、星空と銀河。装飾なので読み上げない。 */
function HeroArt() {
  const stars = Array.from({ length: 70 }, (_, i) => {
    const a = Math.sin(i * 12.9898) * 43758.5453
    const b = Math.sin(i * 78.233) * 12543.123
    return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 100, r: i % 7 === 0 ? 1.4 : 0.7 }
  })
  return (
    <div className="hero-art" aria-hidden="true">
      <svg className="hero-sky" viewBox="0 0 100 100" preserveAspectRatio="none">
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.25} />
        ))}
      </svg>
      <svg className="hero-galaxy" viewBox="0 0 120 80">
        <g transform="translate(60 40) rotate(-20) scale(1 0.45)">
          {[0, 1, 2].map((k) => (
            <path key={k} d="M0 0 C 10 -14, 30 -10, 34 6 C 38 24, 14 40, -8 34" transform={`rotate(${k * 120})`} />
          ))}
          <circle r="6" className="hero-galaxy-core" />
        </g>
      </svg>
      <svg className="hero-well" viewBox="0 0 200 90">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = 14 + i * 9
          const d = 22 - i * 3.2
          return <path key={i} d={`M${10 + i * 6} ${y} C 70 ${y}, 82 ${y + d}, 100 ${y + d + 6} C 118 ${y + d}, 130 ${y}, ${190 - i * 6} ${y}`} />
        })}
        {[-4, -2, 0, 2, 4].map((k) => (
          <path key={k} d={`M${100 + k * 18} 10 C ${100 + k * 14} 40, ${100 + k * 5} 60, 100 ${66 + Math.abs(k)}`} />
        ))}
      </svg>
      {HERO.map((id) => {
        const p = personById.get(id)
        return p?.portrait ? <img key={id} className={`hero-p hero-p-${id}`} src={portraitUrl(p.portrait.file)} alt="" /> : null
      })}
      <span className="hero-eq hero-eq-1">
        <i>F</i> = <i>ma</i>
      </span>
      <span className="hero-eq hero-eq-2">
        ∇ × <i>E</i> = − ∂<i>B</i>/∂<i>t</i>
      </span>
      <span className="hero-eq hero-eq-3">
        <i>E</i> = <i>mc</i>²
      </span>
      <span className="hero-eq hero-eq-4">
        ℏ<i>ω</i>
      </span>
      <span className="hero-eq hero-eq-5">
        <i>i</i>ℏ ∂<i>ψ</i>/∂<i>t</i> = <i>Ĥψ</i>
      </span>
      <span className="hero-eq hero-eq-6">
        <i>S</i> = <i>k</i> log <i>W</i>
      </span>
    </div>
  )
}
