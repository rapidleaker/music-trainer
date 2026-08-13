# Music Trainer Ver.1.1

五線譜を見て音名を答える反復練習用Webアプリです。

## Ver.1.1の変更点

- 黒い音符の中心位置と縦棒の基準位置を統一
- 音符の縦位置を12.5px刻みで管理
- 音符と五線の位置関係を整理
- 参考デザインに合わせてUIを大幅に整理
- レベル、コンボ、スコア、タイマーをヘッダーに配置
- 正解数・正答率・ベストコンボを下部に表示
- スコア計算とコンボボーナスを追加
- ギブアップ機能を追加
- スマートフォン表示を改善

## 起動

`index.html` をブラウザで開いてください。

## ファイル

- `index.html` : 画面
- `style.css` : デザイン
- `script.js` : 出題・判定・スコア・音符描画


## Ver.1.2 - iPhone / PWA対応

- iPhoneのSafe Areaに対応
- タップしやすいボタンサイズに調整
- PWA manifestを追加
- ホーム画面用アイコンを追加
- Service Workerを追加
- HTTPSで公開後、ホーム画面からアプリのように起動可能
- Service Workerによる基本的なオフラインキャッシュに対応

### GitHub Pagesで公開する場合

1. GitHubにリポジトリを作る
2. このフォルダの中身をリポジトリのルートにアップロード
3. Settings → Pages → Sourceで「Deploy from a branch」
4. `main` / `/(root)` を選んでSave
5. 公開されたURLをiPhoneのSafariで開く
6. 共有メニューから「ホーム画面に追加」

GitHub PagesはHTTPSで公開されるため、PWAとして利用する条件を満たせます。
