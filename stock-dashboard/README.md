# 株価ダッシュボード

世界の株価を表示するダッシュボードアプリ（React + Vite + Express、Yahoo Finance連携）。

## 構成
- `src/` — Reactフロントエンド
- `server.js` — Express API（Yahoo Finance取得）
- `start.bat` — ローカル起動用

## 起動
```
npm run dev
```
`vite`（フロント）と`node server.js`（API）を同時起動する。

## 位置づけ
個人用の相場チェックツール。ブログ記事用データ（`data/`）や記事執筆（`blog/`, `ブログ記事/`）とは独立したNode.jsアプリ。
