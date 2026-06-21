import type { Ball } from "./types";

// パーツは1つの球で構成され、輪郭表現のため inner(色) と outer(黒・大) の
// 2つの描画ボールを持つ。src は投影前のローカル座標・半径。
export class Parts {
  public src: Ball;
  public inner: Ball;
  public outer: Ball;

  public constructor(
    x: number,
    y: number,
    z: number,
    r: number,
    c: string,
    k: string,
  ) {
    this.src = { x, y, z, r, c: "", k: "" };
    this.inner = { x: 0, y: 0, z: 0, r: 0, c, k: `${k}_1` };
    this.outer = { x: 0, y: 0, z: 0, r: 0, c: "black", k: `${k}_2` };
  }
}
