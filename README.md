# Beauty 的故事森林

小軟童話森林首頁，直接以 GitHub Pages 提供靜態網站。

## 文章

由助手整理文章或小說並更新網站即可，不必手動編輯 HTML。
自行新增日常文章時，在 `posts/` 建立 `yyyy-mm-dd-slug.md`：

```markdown
---
title: 文章標題
category: 日常
tag: 手記
excerpt: 一句文章摘要
---

文章正文。
```

執行 `python build.py` 後，提交 Markdown、產生的 `post/` 頁面與 `posts.js`。
首頁的搜尋與分類會自動納入新文章。

## 原始資料

完整改版前網站快照保留在 `old/2026-10-06/`，所有原始檔與圖片均保留。
`old/index.html` 是舊資料入口。舊文章 URL 保留導向頁，小遊戲維持原路徑。
目前沒有移動或改寫小說來源文件，也未公開小說正文。

## 設計

首頁插畫與三張封面由 imagegen 產生，網頁使用 WebP 壓縮版本。
`assets/forest/site.css` 控制手機與桌面版；`site.js` 處理搜尋、分類與書架介紹。
`archive-posts.js` 連接四篇舊文章，原有文字保留在舊資料內。
