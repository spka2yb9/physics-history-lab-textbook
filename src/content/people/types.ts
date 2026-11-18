import type { FieldId } from '../fields'

/** 肖像の画像と利用条件。Wikimedia Commons などで1枚ずつ確かめたものか、サイト運営者が利用の許可を確かめて用意したものだけを載せる。 */
export interface Portrait {
  /** public/portraits/ の下のファイル名（例 newton.jpg） */
  file: string
  /** 撮影者・画家。分からないときは「不明」 */
  author: string
  /** 撮影・制作の年（分かるとき） */
  date?: string
  /** 画像の出典ページ（Wikimedia Commons のファイルのページなど）。サイト運営者が用意した画像では省く */
  source?: string
  /** 利用条件。「パブリックドメイン」「CC BY-SA 4.0」など */
  license: string
  /** 利用条件の説明ページ（CC ライセンスのとき） */
  licenseUrl?: string
  /** 利用条件を確かめた日 YYYY-MM-DD */
  accessed: string
}

export interface Person {
  /** URL に使う英小文字の id（例 newton）。#/people/newton */
  id: string
  /** フルネーム（一般的なカタカナ表記。日本人は漢字） */
  name: string
  /** 本文やカードで呼ぶ短い名前（ニュートン、湯川秀樹） */
  short: string
  /** 原語のつづり */
  original: string
  born: number
  died: number
  /** 主な分野。図鑑の色分けと絞り込みに使う */
  field: FieldId
  /** 主に研究した国（「イギリス」「ドイツ→アメリカ」など） */
  country: string
  /** カードに出す1文（40〜60字） */
  tagline: string
  /** 経歴。段落ごとの文字列（全体で400〜700字） */
  bio: string[]
  /** 主な業績（3〜5件） */
  achievements: { year?: string; text: string }[]
  /** この人が研究を受け継いだ相手（people の id）と、受け継いだ内容。相手の人物ページには「研究を引き継いだ人」として出る */
  inherits: { id: string; what: string }[]
  /** 飾りとして載せる有名な式と、その意味を言葉で書いた1文。説明には使わない */
  equation?: { text: string; meaning: string }
  portrait?: Portrait
}
