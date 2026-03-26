役物材料 計算 / キャッシュ事故ゼロ構成

同梱ファイル
- index.html
- manifest.json
- sw.js
- icon-180.png
- icon-192.png
- icon-512.png

削除したもの
- icon-1024.png（PWA運用では不要）
- splash-1170x2532.png（この構成では未使用）
- README.txt（旧説明用）

重要
- 更新時は、このZIPの中身をGitHub Pagesの同じ場所に上書きしてください。
- 旧キャッシュを確実に切り替えるため、manifest / service worker に版番号を入れてあります。
- この index.html は CDN の React / Tailwind / Babel を使っています。したがって「完全オフライン動作」はしません。
  ただし、キャッシュ更新事故を起こしにくい構成にはしてあります。
