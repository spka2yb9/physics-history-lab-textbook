// 本ごとに書き換える設定。章ファイルから import しても循環しないよう、他のモジュールに依存させない。

export const BOOK_TITLE = "物理学の歴史ラボ"

/** ホームの冒頭に出す本の紹介（1〜2文） */
export const BOOK_LEAD = "物理学の7つの分野を、歴史の流れと科学者たちとともに、数式を使わずに図と動く図で学ぶWeb教科書です。"

/** ブラウザーに保存するときのキーの頭。同じオリジンで別の教科書を開いても保存内容が混ざらないよう、本ごとに変える。 */
export const STORAGE_PREFIX = "physics-history-lab"

export interface Part {
  id: string
  /** 目次に出す名前。「第1部 基礎」など。部を分けない本は部を1つだけ置き、title を空にする */
  title: string
  description: string
}

/** 部の並び。各章の part はここの id のどれかにする（npm run check が検査する）。 */
export const PARTS: Part[] = [
  { id: 'p1', title: '第1部 古典力学', description: '物が動くしくみと天体の運動を、ニュートンの3法則と万有引力で説明した分野です。17世紀末から、決定論の限界が見えた20世紀までをたどります。' },
  { id: 'p2', title: '第2部 電磁気学', description: '静電気、電流、磁石、光が、一つの理論にまとまるまでをたどります。マクスウェルの理論が電磁波の存在を予言し、ヘルツが確かめました。' },
  { id: 'p3', title: '第3部 熱力学・統計力学', description: '熱の正体、エネルギー保存の法則、エントロピーを扱います。熱を分子の運動として説明する考えが、原子の実在の証明につながりました。' },
  { id: 'p4', title: '第4部 相対性理論', description: '光の速さがだれから見ても同じであることから、時間と空間の考え方が変わりました。重力を時空の曲がりとして説明する一般相対性理論までを扱います。' },
  { id: 'p5', title: '第5部 量子力学', description: 'エネルギーのつぶ、原子の構造、物質の波、不確定性、量子もつれを扱います。原子より小さな世界を説明する理論と、そこから生まれた技術です。' },
  { id: 'p6', title: '第6部 量子場理論・素粒子物理学', description: '放射線と原子核の発見から、核分裂、反物質、クォーク、標準模型、ヒッグス粒子とニュートリノまでをたどります。' },
  { id: 'p7', title: '第7部 宇宙論・重力理論', description: '宇宙の膨張、ビッグバン、星の一生とブラックホール、重力波、そして暗黒物質や量子重力などの未解決の問題を扱います。' },
]

/**
 * 承認済みの章の並び（学習順）。URL と章ファイル名に使うキー。
 * 数字のキーは「第N章」と表示し、ファイルは chNN.tsx。数字以外（intro など）は NAMED に表示名を書き、ファイルは <キー>.tsx。
 * 未執筆の章もここに入れておく（目次は執筆済みの章だけを出し、未執筆の章へのリンクは「準備中」になる）。
 */
export const CHAPTER_KEYS: readonly string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37']

/** 数字以外のキーの表示名。label は見出し、short は目次の番号欄と図番号の頭（図序-1 の「序」）。 */
const NAMED: Record<string, { label: string; short: string }> = {}

/** 「第3章」「序章」などの表示名。 */
export function labelFor(key: string): string {
  return NAMED[key]?.label ?? `第${key}章`
}

/** 目次の番号欄と図番号の頭に使う短い表記。「3」「序」など。 */
export function shortFor(key: string): string {
  return NAMED[key]?.short ?? key
}

/** 図番号の頭から章のキーへ。「序」→ intro、「3」→ "3" */
export function keyForShort(short: string): string {
  return Object.keys(NAMED).find((k) => NAMED[k].short === short) ?? short
}

/** 用語を含むが別の意味の語。「舌圧子」と書くと、その中の「舌圧」を用語として扱わない（検査と解説のポップアップの両方） */
export const TERM_IGNORE: readonly string[] = []
