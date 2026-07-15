# Bloggerブログ ネタ出し＆執筆プロセス

「Bloggerのネタ出しして」「Bloggerの記事を書いて」とClaudeに伝えると、以下の手順で進める。**自動実行はしない。頼んだ時だけ動く。** アメブロ向けの `ネタ出しプロンプト.md` / `blog_article_prompt.md` とは別プロセス（Bloggerとアメブロは内容を完全に分離する方針のため）。

## ネタ出し手順

1. `blog/Bloggerブログ記事/ネタ帳.md` を読み、既出・執筆中のテーマを把握する。
2. `blog/アメブロブログ記事/*.md` の frontmatter `tags` を確認し、アメブロが既にカバーしたテーマと重複しないか照合する。重複しそうな場合は「切り口で差別化できるか」を明示する（同じ通貨でも Blogger は必ずシミュレーター/定量検証の切り口にする — ネタ帳.md の「差別化の軸」参照）。
3. Web検索で、rational-labのジャンル（FXスワップ運用、高金利通貨、新NISA、複利/積立モデル）の直近の話題・データを調べる。
4. 3〜5件のネタ候補を挙げ、それぞれ「テーマ／一言理由／アメブロとの差別化ポイント」を明記する。
5. `blog/Bloggerブログ記事/ネタ帳.md` の該当セクションに追記する。

## 執筆手順（ネタが決まったら）

1. **リサーチは必ず `notebooklm` skill を使用する**（アメブロと同じ方式 — [[rational-lab-blog-workflow]] 参照）。NotebookLM でノートブックを作成し、`source add-research --mode fast` でテーマ関連の情報を集め、`ask` で必要な数値・裏付けを引き出す。Web検索だけで済ませない。
2. 自作FXシミュレーター（`blog/ameba/sidebar_tools/fx-simulator/`）を使って記事の核となる数値・グラフを実際に生成する — Bloggerの差別化軸（ツール実演・定量検証）を毎回体現すること。
3. 記事本文は `blog/Bloggerブログ記事/` 配下の過去記事の文体に合わせる（まだ記事がなければ、創刊記事「ブログ」のトーン＝数字重視・再現性重視を踏襲）。
4. 外部数値の根拠は NotebookLM の `ask` citations と照合するファクトチェックを行う（アメブロと同じ運用、[[rational-lab-blog-workflow]] の fact-check 手順を参照）。
5. 完成した記事は `blog/Bloggerブログ記事/` に保存する。
6. 投稿・下書き作成・削除などBlogger操作の技術的な手順は [[blogger-automation]] メモ（`blogger_automation.md`）を参照する。

## 使用例
- 「Bloggerのネタ出しして」
- 「Bloggerに積立シミュレーションの記事を書いて」
