# ブログ記事（rational-lab用）

Ameba「合理的生活と投資の実験室」（ID: rational-lab）向けの記事執筆フォルダ。
2026-07-06〜このフォルダを実作業場所として使用しており、2026-07-09に`blog/`直下（`blog/アメブロブログ記事/`）へ移動して、運営先ごとにサブフォルダを分ける`blog/`の汎用構造に統合した（以前は`blog/`とは別のトップレベルフォルダだった）。

## 中身
- `アメブロ執筆ワークフロー.md` — リサーチ→執筆→図解→投稿までの標準手順（**まずこれを読む**）
- `images/` — 記事用に生成した図解・グラフ
- `*_blog_article.md` / `.html` / `_ameba.txt` — 記事本体（下書き・投稿用HTML・アメブロ貼り付け用テキスト）
- `YYYY-MM-DD_<slug>.md` + `.html`（2026-07-09追加） — Amebaに既に公開済みだった過去記事をアーカイブしたもの。`.md`はfrontmatter（status/tags/date/account/url/entry_id/likes）と短い抜粋のみのstub、本文全体は同名`.html`に保存。取得元はAmebaの公開ページ（`https://ameblo.jp/rational-lab/entry-<entry_id>.html`）

## 運用ルール
- 新しい記事は上記ワークフローの手順どおりに作成する
- 保存先はこのフォルダ直下（Googleドライブ経由でPC間・セッション間同期される）
- 全記事（このフォルダ内の11本、2026-07-09時点）は`status: 公開済み`または`下書き`のfrontmatterを持ち、状況.mdのDataviewテーブルで一覧できる
