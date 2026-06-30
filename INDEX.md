# フォルダ索引（データの保管場所）

## 公開・現役ファイル（ルート直下）
- `index.html` — GitHub Pages用（現状リンク切れ、未対応）
- `netlify_upload/` — Netlify公開用ソース（実際の公開先。FXシミュレーターの最新公開版をここに置いてデプロイ）
- `stock-dashboard/` — 株価ダッシュボードアプリ
- `git-claude-test/` — テスト用

## 種類別データ
- `blog/` — ブログ記事の原稿（運営先ごとに `blog/ameba/` のようにサブフォルダ管理。各フォルダに `articles/`（過去記事）と `template.md`（進化するテンプレ）あり。詳細は[blog/README.md](blog/README.md)）
  - `blog/ameba/sidebar_tools/` — アメブロのサイドバー表示用HTMLツール（FXシミュレーター等）をツール・バージョンごとに管理。詳細は[blog/ameba/sidebar_tools/README.md](blog/ameba/sidebar_tools/README.md)
- `data/` — 通貨・経済データ集
- `images/` — スクリーンショット・画像
- `html_tools/` — HTMLツールの草稿・バックアップ

## AI作業用
- `ai_workspace/prompts/` — 再利用プロンプト集
- `ai_workspace/templates/` — 記事・データ集のテンプレート
- `ai_workspace/logs/` — 作業ログ

## その他
- `trash/` — 削除予定ファイルの一時置き場（完全削除は明示指示時のみ）
- `CLAUDE.md` — Claude Code運用ルール
