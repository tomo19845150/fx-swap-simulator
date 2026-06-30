@echo off
title 世界の株価ダッシュボード
cd /d "%~dp0"
start "" http://localhost:5173
npx concurrently "npx vite" "node server.js"
