# 役物材料 計算 完全版

構成は他の完全版と同じです。

## 配置するファイル
- index.html
- manifest.json
- sw.js
- icon-180.png
- icon-192.png
- icon-512.png
- icon-1024.png
- splash-1170x2532.png
- README.txt

## 公開手順
1. ZIPを解凍
2. 中身をGitHubリポジトリ直下にアップロード
3. Settings > Pages > Deploy from branch > main / root
4. Android Chromeで公開URLを開く
5. 「アプリをインストール」で全画面起動

## 注意
- 旧service workerやmanifestが残っていると更新が反映されにくいです
- 反映しない場合はサイトデータ削除後に再読み込みしてください
