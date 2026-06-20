import { mat4 } from "gl-matrix";
import type { Ball } from "./types";
import type { Body } from "./Body";
import { Block } from "./Block";
import { Puppet } from "./Puppet";
import { interactBlock, interactPuppets } from "./interactions";

// 物理シミュレーションのワールド。10x10 グリッドにブロック25個・パペット75体を
// 配置し、update(w,h) で1フレーム進める。React 非依存の純TS。
export class World {
  public readonly stageSize = 40;

  private step = 0;
  private radiusScale = 1;
  private worldMatrix: mat4 = mat4.create();
  private readonly frameList: number[] = [];
  private frameRate = "";

  private readonly bodies: Body[] = [];
  private readonly blocks: Block[] = [];
  private readonly puppets: Puppet[] = [];
  private readonly player: Puppet;

  public constructor() {
    const size = 10;
    for (let i = 0; i < size * size; i++) {
      const x = Math.floor(i % size);
      const y = Math.floor(i / size);
      if (x % 2 === 0 && y % 2 === 0) {
        // 壁（ブロック）作成
        const block = new Block({
          key: `b${i}`,
          px: (this.stageSize / size) * x,
          py: (this.stageSize / size) * y,
        });
        this.bodies.push(block);
        this.blocks.push(block);
      } else {
        // パペット作成
        const r = Math.random() * 2 * Math.PI;
        const puppet = new Puppet({
          key: `p${i}`,
          px: (this.stageSize / size) * x,
          py: (this.stageSize / size) * y,
          vx: 1 * Math.cos(Math.PI / 2 - r),
          vy: 1 * Math.sin(Math.PI / 2 - r),
          r,
        });
        this.bodies.push(puppet);
        this.puppets.push(puppet);
      }
    }

    // 中心パペット（カメラ注視点）。
    this.player = this.puppets[0];
  }

  public getFrameRate(): string {
    return this.frameRate;
  }

  // 描画ボール列。bodies は zIndex 降順、各 body 内は outer群→inner群。
  public getBallList(): Ball[] {
    const list: Ball[] = [];
    for (let i = 0; i < this.bodies.length; i++) {
      const balls = this.bodies[i].getBallList();
      for (let j = 0; j < balls.length; j++) list.push(balls[j]);
    }
    return list;
  }

  public update(w: number, h: number): void {
    this.step++;

    const tempMat1 = mat4.create();
    const tempMat2 = mat4.create();
    const tempMat3 = mat4.create();

    // 座標変換行列（NDC → スクリーン）
    mat4.identity(tempMat1);
    mat4.scale(tempMat1, tempMat1, [w * 0.5, h * -0.5, 1]);
    mat4.translate(tempMat1, tempMat1, [1, -1, 0]);

    // 透視投影行列
    mat4.perspective(tempMat2, Math.PI / 6, w / h, 1.0, 1000.0);

    // カメラ行列（player を注視し毎フレーム1度回転）
    const ex = this.player.px;
    const ey = 0;
    const ez = this.player.py;
    const cr = 30;
    const t1 = (45 * Math.PI) / 180;
    const t2 = (this.step * Math.PI) / 180;
    const cx = ex + cr * Math.cos(t1) * Math.sin(t2);
    const cy = ey + cr * Math.sin(t1);
    const cz = ez + cr * Math.cos(t1) * Math.cos(t2);
    mat4.lookAt(tempMat3, [cx, cy, cz], [ex, ey, ez], [0, 1, 0]);

    // パペット相互作用計算（作用反作用）
    for (let i = 0; i < this.puppets.length; i++) {
      for (let j = i + 1; j < this.puppets.length; j++) {
        interactPuppets({
          dt: 0.01,
          puppet0: this.puppets[i],
          puppet1: this.puppets[j],
          stageSize: this.stageSize,
        });
      }
    }

    // ブロック相互作用計算（パペット側のみ）
    for (let i = 0; i < this.blocks.length; i++) {
      for (let j = 0; j < this.puppets.length; j++) {
        interactBlock({
          dt: 0.01,
          block: this.blocks[i],
          puppet: this.puppets[j],
          stageSize: this.stageSize,
        });
      }
    }

    // ボディ位置計算
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].calcPosition({
        cx: ex,
        cy: ez,
        stageSize: this.stageSize,
      });
    }

    // 行列合成。radiusScale は投影行列のスケール平均。
    mat4.multiply(tempMat1, tempMat1, tempMat2);
    this.radiusScale = (Math.abs(tempMat1[0]) + Math.abs(tempMat1[5])) / 2;
    mat4.multiply(tempMat1, tempMat1, tempMat3);
    this.worldMatrix = tempMat1;

    // ボディ計算（ポーズ更新 + パーツ投影）
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].updatePoses({ step: this.step });
      this.bodies[i].updateParts({
        radiusScale: this.radiusScale,
        worldMatrix: this.worldMatrix,
      });
    }

    // ボディを描画順（zIndex 降順）にソート
    this.bodies.sort((a, b) => b.getZIndex() - a.getZIndex());

    // フレームレート計算（直近100フレームの移動平均）
    const len = 100;
    this.frameList.unshift(Date.now());
    if (this.frameList.length > len) {
      this.frameList.length = len;
      const prev = this.frameList[len - 1];
      const curr = this.frameList[0];
      this.frameRate = `${((1000 * len) / (curr - prev)).toFixed(2)}fps`;
    } else {
      this.frameRate = `計算中${len - this.frameList.length}`;
    }
  }
}
