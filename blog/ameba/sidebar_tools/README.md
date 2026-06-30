# アメブロ サイドバー表示ツール管理

アメブロのサイドバーに設置するWebツール（FXシミュレーター等）を
ツールごと・バージョンごとに管理するフォルダ。

```
sidebar_tools/
  fx-simulator/
    versions/
      v1_2026-06-29.html   ← 過去版（公開中の元データ）
      v2_...html            ← 編集・改良したら次のバージョンとして追加
    notes.md                各バージョンの変更点・公開状況
  fx-swap-guide/
    versions/
      v1_2026-06-30.html
    notes.md
```

## 運用ルール
1. 新しいバージョンを作るときは `versions/` に `v2_YYYY-MM-DD.html` のように追加保存する（上書きしない）。
2. どのバージョンが現在アメブロ・Netlifyで公開中かを `notes.md` に必ず記録する。
3. 公開（更新）する際は、対象バージョンの内容を `netlify_upload/index.html` にコピーしてからNetlifyへ再デプロイする。
4. 新しいツールを追加する場合は `sidebar_tools/<ツール名>/versions/` `notes.md` を同じ形式で作成する。

これにより過去バージョンを残したまま、いつでも呼び出し・編集・新バージョン作成ができる。
