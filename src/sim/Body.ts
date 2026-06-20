import type { mat4 } from "gl-matrix";
import type { Ball } from "./types";

// ブロック・パペット共通のボディインターフェイス。
export interface Body {
  getZIndex(): number;
  getBallList(): Ball[];

  // 周期境界条件による位置補正。
  calcPosition(params: { cx: number; cy: number; stageSize: number }): void;

  // ポーズ角度の更新（ブロックは何もしない）。
  updatePoses(params: { step: number }): void;

  // 各パーツを2D座標の描画ボールへ投影する。
  updateParts(params: { radiusScale: number; worldMatrix: mat4 }): void;
}
