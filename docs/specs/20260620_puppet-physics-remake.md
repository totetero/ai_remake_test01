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
