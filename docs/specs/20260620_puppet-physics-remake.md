# パペット物理シミュレーション リメイク設計

- 作成日: 2026-06-20
- 対象: `original/20190226benchmark` のリメイク
- スタック: React 19 + Vite + TypeScript + Canvas 2D

## 1. 背景と目的

`original/20190226benchmark` は2019年に作られた「パペット（ボールで構成された人型キャラ）」の
3D物理シミュレーションで、同一シーンを canvas / svg / react / vue / riot の5方式で描画して
FPSを比較するベンチマーク兼プレゼン資料だった。

本リメイクでは **物理シミュレーション部分のみ** を現行スタック（React 19 + Vite + TypeScript）へ
移植し、描画は **Canvas 2D の1方式に絞る**。複数フレームワークのベンチ比較機構、および
Ctrl/View分離のプレゼン用スライド機構（ComponentViewPage01-05 等）は移植対象外とする。

物理コアは原作の振る舞い（見た目・動き）を維持しつつ、idiomatic な TypeScript / React へ
モダンにリファクタする。3D行列演算には引き続き `gl-matrix` を使用する。

## 2. スコープ

### 含むもの
- パペット（人型）とブロック（立方体）の物理シミュレーション
- LJ（レナード=ジョーンズ）ポテンシャルによる相互作用、周期境界条件
- gl-matrix による3D透視投影・回転カメラ
- Canvas 2D による描画（背景 + 輪郭付きの円）
- FPS表示、ウィンドウリサイズ対応
- 物理コアの軽量ユニットテスト（vitest）

### 含まないもの
- canvas以外の描画方式（svg/react/vue/riot）とのベンチ比較
- Ctrl/View分離のプレゼン用スライド機構
- `original/` 配下の改変（参照用にそのまま残す）

## 3. アーキテクチャ

物理エンジンとReactシェルの2層に分離する。

- **`src/sim/` — 物理エンジン（React非依存の純TS）**
  原作の `ball/` を移植。`World#update(w, h)` で1フレーム進め、描画用の円リスト `Ball[]` を返す。
  フレームワークに一切依存しない。
- **`src/components/` + `App.tsx` — Reactシェル**
  Canvasを保持し、`requestAnimationFrame` ループでエンジンを駆動。2Dコンテキストへ円を
  直接描画する。FPSはReactのstateで表示する。

ホットパス（毎フレーム数百個の円描画）はCanvas直描きでReactのレンダリングを経由しないため
高FPSを保てる。Reactはマウント・ループ起動・FPS表示・リサイズのみを担当する。

## 4. モジュール構成

| 新ファイル | 原作 | リファクタ方針 |
|---|---|---|
| `src/sim/types.ts` | `util/Ball.ts` | `Ball` を型（interface）として定義 |
| `src/sim/Trigonometry.ts` | `util/Trigonometry.ts` | ほぼそのまま（cos/sinのキャッシュ） |
| `src/sim/Parts.ts` | `util/Parts.ts` | そのまま移植 |
| `src/sim/colors.ts` | `body/PuppetColorSet.ts` | クラス→定数配列 + `randomColorSet()` 関数 |
| `src/sim/Body.ts` | `body/Body.ts` | interface そのまま |
| `src/sim/Block.ts` | `body/Block.ts` | シングルトン無し。ホットパスは public フィールド化 |
| `src/sim/Puppet.ts` | `body/Puppet.ts` | シングルトン無し。getter/setter整理、public フィールド化 |
| `src/sim/interactions.ts` | `body/BodyInteraction.ts` | シングルトン廃止 → 純関数 `interactPuppets()` / `interactBlock()` |
| `src/sim/World.ts` | `World.ts` | シングルトン廃止 → 通常の `class World`。`window.bombBall` グローバル廃止 |
| `src/components/SimCanvas.tsx` | `public/ball_canvas.html` | Canvas + rAFループ + リサイズ対応 |
| `src/App.tsx` / `src/main.tsx` | — | エントリ。FPS表示UI。既存テンプレを置き換え |

依存追加: `gl-matrix`（runtime）、`vitest`（dev）。

### モダン化の要点
- `World` / `BodyInteraction` のシングルトン（`getInstance()`）を廃止し、通常のクラス／純関数にする。
- `window.bombBall` のグローバル公開を廃止し、Reactコンポーネントが `World` インスタンスを保持する。
- 物理ホットパスで多用される getter/setter（`getPx`/`setPx` 等）は public フィールドへ整理する。
- 罫線コメント（`// ----`）などのノイズは除去し、意味のあるコメントのみ残す。
- 振る舞い（数値計算式・係数）は原作と一致させ、見た目が変わらないようにする。

## 5. データフロー（毎フレーム）

1. `SimCanvas` マウント時に `new World()` を生成する（10×10グリッド：ブロック25個・パペット75体）。
2. rAFループで `world.update(w, h)` を呼ぶ:
   - パペット同士／ブロックとパペットの相互作用計算（LJポテンシャル）
   - 速度クリップ・位置更新・周期境界条件
   - 透視投影行列・カメラ行列を計算し、各パーツを2D座標の円へ投影
   - bodyをzIndexで描画順ソート
3. `world.getBallList()` が返す円を Canvas に描画する:
   - 背景を赤で塗りつぶし
   - outer（黒・やや大）→ inner（色・小）の順に描画して輪郭を表現
4. 直近100フレームの移動平均からFPSを算出し、React state へ反映して表示する。

## 6. エラー処理 / ライフサイクル

- Canvas 2D context が取得できない場合はガードして早期return。
- アンマウント時に `cancelAnimationFrame` でループを停止し、リスナを解除する。
- リサイズ時はCanvasの実ピクセルサイズを更新し、投影に渡す w/h を追従させる。

## 7. テスト（vitest）

物理コアが純TSのため、軽量なユニットテストを置く。

- 周期境界条件: 位置がステージ範囲内へ正しく折り返されること。
- LJ相互作用: 2パペット間の力が作用反作用（対称）になっていること。
- `World`: 初期化で期待数（block 25 / puppet 75）の Body を生成し、`getBallList()` が
  円の配列を返すこと。`update()` 実行後に座標が有限値であること。

## 8. このリポジトリへの配置

既存の Vite scaffold（`src/App.tsx`, `src/App.css`, `src/assets/` 等のテンプレート）は
本シミュレーションで置き換える。`original/` 配下は参照用にそのまま残す。

## 9. 原作との突き合わせメモ（実装担当向けの注意点）

仕様確定にあたり `original/20190226benchmark/src/ball/` の実装と突き合わせて確認した。
振る舞いを原作と一致させるため、以下は**必ず守ること**。

### 9.1 描画順（重要・見た目に直結）
原作の描画順は「全 outer → 全 inner」のグローバル2パスでは**ない**。実際は次の通り。

1. `World#update` の末尾で `_bodies` を `getZIndex()` の降順（`b - a`）でソートする。
2. 描画は `getBallList()` の返り値を**先頭から順に**そのまま描く。
3. 各 body の `getBallList()` は `outerList.concat(innerList)` を返す。
   つまり **body 単位で「その body の全 outer → その body の全 inner」** の順になる。
4. さらに各 body 内では `_innerList` のみ `z` の降順でソートされる
   （`_outerList` はソートされない＝パーツ生成順のまま）。

→ 実装では「body を zIndex 降順に並べ、body ごとに outer 群→inner 群を描く」構造を維持すること。
グローバルに outer をまとめて先に描くと前後関係（輪郭の重なり）が崩れ、見た目が変わる。

### 9.2 数値・係数（原作と一致させる）
- ステージサイズ `stageSize = 40`、グリッド `size = 10`。
- 初期配置: `x%2===0 && y%2===0` がブロック（25個）、それ以外がパペット（75体）。
- パペット初速: `vx = cos(π/2 - r)`, `vy = sin(π/2 - r)`（`r = random()*2π`）。
- LJ: `dt = 0.01`。パペット間 `sigma = 2.0`、ブロック↔パペット `sigma = 3.0`。
  力の式 `lj = (irrrrrr < 1) ? 0 : (2*irrrrrr^2 - irrrrrr)/rr`、`irr = sigma^2/rr`。
- 速度クリップ: `vmin = 0.01`（下回ると停止）、`vmax = 0.10`（上回るとクリップ）。
- カメラ: `cr = 30`, 仰角 `t1 = 45deg`, 方位角 `t2 = step*deg`（毎フレーム1度回転）。
  注視点は `player`(=`puppets[0]`) の位置。透視 `fovy = π/6`, near `1.0`, far `1000.0`。
- 半径補正: `outer.r = r1 + 5`, `inner.r = r1 + 0`。`radiusScale` は投影行列の
  `(|m0| + |m5|)/2`。背景塗りつぶし色は `#ff0000`。

### 9.3 相互作用の対称性
- パペット間相互作用は `puppet0` に `-dvx/-dvy`、`puppet1` に `+dvx/+dvy` を加える
  （作用反作用＝対称）。ブロック↔パペットは**パペット側のみ**に `+dvx/+dvy`（ブロックは不動）。
  純関数へ移す際もこの非対称性（ブロックは速度を持たない）を保つこと。

### 9.4 補足（誤解しやすい点・任意対応）
- `Trigonometry` は「キャッシュ」ではなく `set()` 時に `cos/sin` を即計算して保持するだけ。
  4章の表現は実体に合わせて読み替えてよい（挙動上の差異なし）。
- 原作の `MainBall.ts` は `window.bombBall` を公開するが、`bombBall` という名前に反し
  クリック等の「爆発」インタラクションは実装されていない。移植時に追加不要（スコープ外）。
- 原作キャンバスは固定 300x300。本リメイクは**ウィンドウ追従**へ拡張するため、
  投影に渡す `w/h` は実ピクセルサイズに同期させること（9.5 のガードに注意）。

### 9.5 実装上のリスク / ガード
- `mat4.perspective` に渡すアスペクト比は `w/h`。`h === 0`（リサイズ直後やレイアウト未確定時）で
  ゼロ除算・NaN を生む恐れがある。`w`/`h` が 0 以下のフレームは更新・描画をスキップするガードを入れる。
- DPR（devicePixelRatio）対応をする場合、`canvas.width/height`（実ピクセル）と CSS サイズを分け、
  投影に渡すのは**実ピクセルの w/h**にすること（座標が実ピクセル基準で算出されるため）。
- `getBallList()` は毎フレーム新規配列・`concat` を行うホットパス。原作通りでも動くが、
  GC 負荷が気になる場合は描画ループ側でバッファ再利用を検討してよい（任意・挙動不変が条件）。

## 10. 受け入れ基準（Acceptance Criteria）

開発担当の完成判断、および確認担当（Playwright 等）の検証に用いる。観測可能な基準のみを列挙する。

### 10.1 ビルド / 起動
- AC-1: `npm install` 後、`gl-matrix`（dependencies）と `vitest`（devDependencies）が
  `package.json` に存在し、インストールできる。
- AC-2: `npm run build`（`tsc -b && vite build`）が型エラー・ビルドエラーなく完了する。
- AC-3: `npm run dev` で開発サーバが起動し、ブラウザでルート（`/`）が HTTP 200 で表示される。
  既存テンプレの Vite ロゴ・カウンタUIは表示されない（置き換え済み）。

### 10.2 描画 / シミュレーション（ブラウザ実行時）
- AC-4: ページ内に `<canvas>` が 1 つ存在し、表示領域いっぱい（ウィンドウサイズ相当）に描画される。
- AC-5: Canvas の背景が赤（`#ff0000` 相当）で塗られ、その上に多数の円が描画される。
- AC-6: 連続する複数フレームのスクリーンショットを比較すると、Canvas の内容が変化している
  （静止画でない＝アニメーションが進行している）。カメラが毎フレーム回転するため画面全体が動く。
- AC-7: FPS表示要素が DOM 上に存在し、起動からおよそ100フレーム経過後に
  `xx.xxfps` 形式（数値＋`fps`）の文字列が表示される（それ以前は `計算中…` 系の文字列でよい）。
- AC-8: ブラウザのコンソールに未処理例外（uncaught error）が出力されない。
  特に座標・半径に `NaN` が混入しない（円が消失・破綻しない）。

### 10.3 リサイズ
- AC-9: ウィンドウ（ビューポート）サイズを変更すると Canvas の実ピクセルサイズが追従し、
  リサイズ後も AC-5/AC-6/AC-8 を満たす（描画破綻・例外なし）。
- AC-10: 一時的に高さが極小（または 0）になっても例外を投げず、サイズ回復後に描画が継続する
  （9.5 のゼロ除算ガードが効いている）。

### 10.4 物理コアのユニットテスト（vitest）
- AC-11: `npx vitest run`（または `npm test`）が全テスト成功で終了する（exit code 0）。
- AC-12: 周期境界条件のテストが存在し、ステージ範囲外の座標が
  `[-stageSize/2, +stageSize/2]`（中心相対）へ正しく折り返されることを検証している。
- AC-13: パペット間 LJ 相互作用のテストが存在し、`puppet0` と `puppet1` の速度変化が
  作用反作用（符号反転で同量）になっていることを検証している。
- AC-14: `World` の初期化テストが存在し、ブロック 25 個・パペット 75 体（合計100 body）を
  生成すること、`getBallList()` が `Ball` 配列を返すこと、`update(w,h)` 実行後に
  すべての円の `x/y/r` が有限値（`Number.isFinite`）であることを検証している。

### 10.5 構造 / スコープ遵守
- AC-15: 物理エンジン（`src/sim/`）が React に依存しない純 TS である
  （`react`/`react-dom` を import しない）。
- AC-16: シングルトン（`getInstance()`）と `window.bombBall` グローバルが存在しない
  （`World` はインスタンス化、相互作用は純関数）。
- AC-17: `original/` 配下に変更が無い（参照用に不変）。
- AC-18: ベンチ比較機構（svg/vue/riot 等）およびプレゼン用スライド機構（ComponentView*）は
  移植されていない。
