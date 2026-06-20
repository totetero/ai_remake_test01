import { mat4, vec4 } from "gl-matrix";
import type { Ball } from "./types";
import { Parts } from "./Parts";
import type { Body } from "./Body";

// 立方体ブロック。不動（速度を持たない）。8つの球で構成される。
export class Block implements Body {
  // ホットパスで参照される位置は public フィールド。
  public px: number;
  public py: number;
  public zIndex = 0;

  private readonly s = 1.0;
  private readonly partsList: Parts[];
  private readonly outerList: Ball[];
  private readonly innerList: Ball[];

  public constructor(params: { key: string; px: number; py: number }) {
    this.px = params.px;
    this.py = params.py;

    this.partsList = [];
    for (let i = 0; i < 2; i++) {
      const z = 0.8 * (i - 0.5);
      for (let j = 0; j < 2; j++) {
        const y = 0.8 * (j - 0.5);
        for (let k = 0; k < 2; k++) {
          const x = 0.8 * (k - 0.5);
          const c = (i + j + k) % 2 === 0 ? "white" : "gray";
          this.partsList.push(
            new Parts(x, y, z, 0.5, c, `${params.key}_${k}_${j}_${i}`),
          );
        }
      }
    }
    this.outerList = this.partsList.map((parts) => parts.outer);
    this.innerList = this.partsList.map((parts) => parts.inner);
  }

  public getZIndex(): number {
    return this.zIndex;
  }

  // body 単位で「全 outer → 全 inner」の順に描く（描画順の維持）。
  public getBallList(): Ball[] {
    return this.outerList.concat(this.innerList);
  }

  // 周期境界条件。中心(cx,cy)を基準にステージ範囲へ折り返す。
  public calcPosition(params: {
    cx: number;
    cy: number;
    stageSize: number;
  }): void {
    let x = this.px - params.cx;
    let y = this.py - params.cy;
    while (x > params.stageSize * 0.5) x -= params.stageSize;
    while (x < params.stageSize * -0.5) x += params.stageSize;
    while (y > params.stageSize * 0.5) y -= params.stageSize;
    while (y < params.stageSize * -0.5) y += params.stageSize;
    this.px = x + params.cx;
    this.py = y + params.cy;
  }

  public updatePoses(): void {
    // ブロックはポーズを持たない。
  }

  public updateParts(params: { radiusScale: number; worldMatrix: mat4 }): void {
    const tempMat1 = mat4.create();
    const tempMat2 = params.worldMatrix;
    mat4.copy(tempMat1, tempMat2);
    mat4.translate(tempMat1, tempMat1, [this.px, 0, this.py]);
    mat4.scale(tempMat1, tempMat1, [this.s, this.s, this.s]);

    const tempVec1 = vec4.create();
    for (let i = 0; i < this.partsList.length; i++) {
      const src = this.partsList[i].src;
      vec4.set(tempVec1, src.x, src.y, src.z, 1.0);
      vec4.transformMat4(tempVec1, tempVec1, tempMat1);
      const x1 = tempVec1[0] / tempVec1[3];
      const y1 = tempVec1[1] / tempVec1[3];
      const z1 = tempVec1[2] / tempVec1[3];
      const r1 = (src.r * this.s * params.radiusScale) / tempVec1[3];
      const outer = this.partsList[i].outer;
      const inner = this.partsList[i].inner;
      outer.x = x1;
      outer.y = y1;
      outer.z = z1;
      outer.r = r1 + 5;
      inner.x = x1;
      inner.y = y1;
      inner.z = z1;
      inner.r = r1 + 0;
    }

    // body 内の inner のみ z 降順でソート（outer は生成順のまま）。
    this.innerList.sort((a, b) => b.z - a.z);

    this.zIndex = tempMat2[2] * this.px + tempMat2[10] * this.py;
  }
}
