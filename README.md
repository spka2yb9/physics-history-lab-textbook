# 物理学の歴史ラボ

物理学の7つの分野を、歴史の流れと科学者たちとともに、数式を使わずに図と動く図で学ぶWeb教科書です。

Vite + React + TypeScript で作った静的な Web 教科書です。サーバーや外部サービスは使いません。

## 必要なもの

- Node.js 24 以上（npm 同梱）

## 起動

```bash
npm install
npm run dev
```

ブラウザーで表示された URL（既定では http://localhost:5173/ ）を開きます。`npm run dev` は起動の前に `npm run build:index` を実行し、目次と検索に使うデータを章のファイルから作り直します。

## ビルド

```bash
npm run build
```

`dist/` に静的ファイルが出力されます。ビルドは次の順で動きます。

1. `npm run build:index` — 各章を描画して、全文検索の索引 `src/content/search-index.json`、目次・前後の章に使う章の情報 `src/content/chapter-meta.json`、用語の一覧 `src/content/terms.json` を生成
2. `tsc -b` — 型チェック
3. `vite build` — `dist/` へ出力

ビルド結果の確認は `npm run preview` です。

## 章の検査

```bash
npm run check            # 全章
npm run check -- 1 intro # 指定した章
npm run lint
```

節 ID の重複、図番号と章の対応と掲載順、図のアクセシブル名、本文の分量、用語の定義の重複などを機械的に検査します。用語が定義より前の節に出てくる箇所は注意（`·`）として表示します。

## ファイルの構成

- `src/content/book.ts` — 書名、部、章の並び
- `src/chapters/` — 各章の本文（第N章は `chNN.tsx`、それ以外は `<キー>.tsx`）
- `src/figures/` — 各章の図
- `src/components/` — 画面と図の部品
- `src/content/people/` — 科学者図鑑の人物（経歴、業績、肖像の出典と利用条件）
- `src/content/fields.tsx` — 7分野の名前、色、アイコン
- `public/portraits/` — 肖像画像（利用条件を確かめたもの）

## 静的ホスティングでの公開手順

ハッシュルーティング（`#/3/section` の形式）を使っているため、サーバー側のリライト設定は不要です。`dist/` をそのまま配置すれば動きます。

### GitHub Pages（プロジェクトサイト `https://<user>.github.io/<repo>/`）

`main` ブランチに push すると `.github/workflows/deploy.yml` がビルドして公開します。初回はリポジトリの Settings → Pages → Build and deployment で Source を「GitHub Actions」にしてください（ワークフローからも有効化を試みます）。

手動で公開する場合は次のとおりです。

```bash
BASE_PATH=/<repo>/ npm run build
```

`dist/` の中身を Pages の公開元（`gh-pages` ブランチや Actions の成果物など）に配置します。ユーザーサイト（`https://<user>.github.io/`）やカスタムドメインでルート配信する場合は `BASE_PATH` を付けずにビルドします。

### Cloudflare Pages

- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- リライト設定: 不要
