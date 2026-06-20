import { mat4, vec4 } from "gl-matrix";
import type { Ball } from "./types";
import { Parts } from "./Parts";
import { Trigonometry } from "./Trigonometry";
import type { Body } from "./Body";
import { randomColorSet } from "./colors";

// ボールで構成された人型キャラクター。LJ相互作用で速度を受け取り移動する。
export class Puppet implements Body {
  // ホットパスで参照される位置・速度は public フィールド。
  public px: number;
  public py: number;
  public vx: number;
  public vy: number;
  public zIndex = 0;

  private r: number;
  private readonly s = 1.0;
  private jump = 0;
  private isMove = true;

  // 描画内部パラメータ（各パーツの角度）。
  private readonly trigFotr1: Trigonometry;
  private readonly trigFotr2: Trigonometry;
  private readonly trigFotl1: Trigonometry;
  private readonly trigFotl2: Trigonometry;
  private readonly trigHndr1: Trigonometry;
  private readonly trigHndr2: Trigonometry;
  private readonly trigHndl1: Trigonometry;
  private readonly trigHndl2: Trigonometry;
  private readonly trigHead1: Trigonometry;
  private readonly trigHair1: Trigonometry;
  private readonly trigEyer1: Trigonometry;
  private readonly trigEyel1: Trigonometry;

  private readonly partsFotR: Parts;
  private readonly partsFotL: Parts;
  private readonly partsBody: Parts;
  private readonly partsHndR: Parts;
  private readonly partsHndL: Parts;
  private readonly partsFace: Parts;
  private readonly partsHair: Parts;
  private readonly partsEyeR: Parts;
  private readonly partsEyeL: Parts;

  // ポーズウエイト（立ち / 走り の補間）。
  private statusWeightStand = 1.0;
  private statusWeightRun = 0.0;

  private readonly partsList: Parts[];
  private readonly outerList: Ball[];
  private readonly innerList: Ball[];

  public constructor(params: {
    key: string;
    px: number;
    py: number;
    vx: number;
    vy: number;
    r: number;
  }) {
    this.px = params.px;
    this.py = params.py;
    this.vx = params.vx;
    this.vy = params.vy;
    this.r = params.r;

    const deg = Math.PI / 180;
    this.trigFotr1 = new Trigonometry(60 * deg);
    this.trigFotr2 = new Trigonometry(0 * deg);
    this.trigFotl1 = new Trigonometry(60 * deg);
    this.trigFotl2 = new Trigonometry(0 * deg);
    this.trigHndr1 = new Trigonometry(0 * deg);
    this.trigHndr2 = new Trigonometry(0 * deg);
    this.trigHndl1 = new Trigonometry(0 * deg);
    this.trigHndl2 = new Trigonometry(0 * deg);
    this.trigHead1 = new Trigonometry(0 * deg);
    this.trigHair1 = new Trigonometry(-60 * deg);
    this.trigEyer1 = new Trigonometry(-30 * deg);
    this.trigEyel1 = new Trigonometry(30 * deg);

    const cs = randomColorSet();
    this.partsFotR = new Parts(0, 0, 0, 0.3, cs.foot, `${params.key}_fotR`);
    this.partsFotL = new Parts(0, 0, 0, 0.3, cs.foot, `${params.key}_fotL`);
    this.partsBody = new Parts(0, 0, 0, 0.5, cs.body, `${params.key}_body`);
    this.partsHndR = new Parts(0, 0, 0, 0.2, cs.hand, `${params.key}_hndR`);
    this.partsHndL = new Parts(0, 0, 0, 0.2, cs.hand, `${params.key}_hndL`);
    this.partsFace = new Parts(0, 0, 0, 0.6, cs.head, `${params.key}_face`);
    this.partsHair = new Parts(0, 0, 0, 0.2, cs.hair, `${params.key}_hair`);
    this.partsEyeR = new Parts(0, 0, 0, 0.1, cs.eyes, `${params.key}_eyeR`);
    this.partsEyeL = new Parts(0, 0, 0, 0.1, cs.eyes, `${params.key}_eyeL`);

    this.partsList = [
      this.partsFotR,
      this.partsFotL,
      this.partsBody,
      this.partsHndR,
      this.partsHndL,
      this.partsFace,
      this.partsHair,
      this.partsEyeR,
      this.partsEyeL,
    ];
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

  // 速度クリップ・位置更新・周期境界条件。
  public calcPosition(params: {
    cx: number;
    cy: number;
    stageSize: number;
  }): void {
    const vmin = 0.01;
    const vmax = 0.1;
    const vrr = this.vx * this.vx + this.vy * this.vy;
    this.isMove = vrr > vmin * vmin;
    if (!this.isMove) {
      this.vx = 0;
      this.vy = 0;
    } else if (vrr > vmax * vmax) {
      const vr = Math.sqrt(vrr);
      this.vx *= vmax / vr;
      this.vy *= vmax / vr;
    }

    // 移動方向計算
    if (this.isMove) this.r = Math.PI / 2 - Math.atan2(this.vy, this.vx);

    // 速度から位置の計算
    this.px += this.vx;
    this.py += this.vy;

    // 周期境界条件
    let x = this.px - params.cx;
    let y = this.py - params.cy;
    while (x > params.stageSize * 0.5) x -= params.stageSize;
    while (x < params.stageSize * -0.5) x += params.stageSize;
    while (y > params.stageSize * 0.5) y -= params.stageSize;
    while (y < params.stageSize * -0.5) y += params.stageSize;
    this.px = x + params.cx;
    this.py = y + params.cy;
  }

  public updatePoses(params: { step: number }): void {
    // ステータスウエイト計算
    this.statusWeightStand *= 0.9;
    this.statusWeightRun *= 0.9;
    if (this.statusWeightStand < 0.1) this.statusWeightStand = 0.0;
    if (this.statusWeightRun < 0.1) this.statusWeightRun = 0.0;
    const remain = 1 - (this.statusWeightStand + this.statusWeightRun);
    if (this.isMove) this.statusWeightRun += remain;
    else this.statusWeightStand += remain;

    // ポーズ角度計算
    const swing = Math.sin((9 * params.step) * (Math.PI / 180));
    const theta01 =
      (0 * this.statusWeightStand + 30 * this.statusWeightRun) *
      (Math.PI / 180);
    const theta02 =
      (0 * this.statusWeightStand + 30 * swing * this.statusWeightRun) *
      (Math.PI / 180);
    this.trigHead1.set(theta01);
    this.trigHndr2.set(theta02);
    this.trigHndl2.set(-theta02);
    this.trigFotr2.set(-theta02);
    this.trigFotl2.set(theta02);
    this.jump = this.statusWeightRun * 0.3 * Math.abs(swing);
  }

  public updateParts(params: { radiusScale: number; worldMatrix: mat4 }): void {
    const tempMat1 = mat4.create();
    const tempMat2 = params.worldMatrix;
    mat4.copy(tempMat1, tempMat2);
    mat4.translate(tempMat1, tempMat1, [this.px, 0, this.py]);
    mat4.rotateY(tempMat1, tempMat1, this.r);
    mat4.scale(tempMat1, tempMat1, [this.s, this.s, this.s]);

    const body = this.partsBody.src;
    const fotR = this.partsFotR.src;
    const fotL = this.partsFotL.src;
    const hndR = this.partsHndR.src;
    const hndL = this.partsHndL.src;
    const face = this.partsFace.src;
    const hair = this.partsHair.src;
    const eyeR = this.partsEyeR.src;
    const eyeL = this.partsEyeL.src;

    // 体
    const rf =
      fotR.r +
      (body.r + fotR.r * 0.7) * this.trigFotr1.s * this.trigFotr2.c;
    const lf =
      fotL.r +
      (body.r + fotL.r * 0.7) * this.trigFotl1.s * this.trigFotl2.c;
    const rh =
      hndR.r -
      (body.r + hndR.r * 0.5) * this.trigHndr2.c * this.trigHndr1.s;
    const lh =
      hndL.r -
      (body.r + hndL.r * 0.5) * this.trigHndl2.c * this.trigHndl1.s;
    body.x = 0.0;
    body.y = Math.max(body.r, rf, lf, rh, lh) + this.jump;
    body.z = 0.0;
    // 両足
    fotR.x = body.x + (body.r + fotR.r * 0.7) * this.trigFotr1.c;
    fotR.y =
      body.y - (body.r + fotR.r * 0.7) * this.trigFotr1.s * this.trigFotr2.c;
    fotR.z =
      body.z + (body.r + fotR.r * 0.7) * this.trigFotr1.s * this.trigFotr2.s;
    fotL.x = body.x - (body.r + fotL.r * 0.7) * this.trigFotl1.c;
    fotL.y =
      body.y - (body.r + fotL.r * 0.7) * this.trigFotl1.s * this.trigFotl2.c;
    fotL.z =
      body.z + (body.r + fotL.r * 0.7) * this.trigFotl1.s * this.trigFotl2.s;
    // 両手
    hndR.x = body.x + (body.r + hndR.r * 0.5) * this.trigHndr2.c * this.trigHndr1.c;
    hndR.y = body.y + (body.r + hndR.r * 0.5) * this.trigHndr2.c * this.trigHndr1.s;
    hndR.z = body.z + (body.r + hndR.r * 0.5) * this.trigHndr2.s;
    hndL.x = body.x - (body.r + hndL.r * 0.5) * this.trigHndl2.c * this.trigHndl1.c;
    hndL.y = body.y + (body.r + hndL.r * 0.5) * this.trigHndl2.c * this.trigHndl1.s;
    hndL.z = body.z + (body.r + hndL.r * 0.5) * this.trigHndl2.s;
    // 顔
    face.x = body.x;
    face.y = body.y + (body.r + face.r * 0.7) * this.trigHead1.c;
    face.z = body.z + (body.r + face.r * 0.7) * this.trigHead1.s;
    // 髪の毛
    hair.x = face.x + (face.r + hair.r * 0.5) * 0;
    hair.y = face.y + (face.r + hair.r * 0.5) * this.trigHair1.c;
    hair.z = face.z + (face.r + hair.r * 0.5) * this.trigHair1.s;
    // 目
    eyeR.x = face.x + (face.r - eyeR.r) * this.trigEyer1.s;
    eyeR.y = face.y + (face.r - eyeR.r) * 0;
    eyeR.z = face.z + (face.r - eyeR.r) * this.trigEyer1.c;
    eyeL.x = face.x + (face.r - eyeL.r) * this.trigEyel1.s;
    eyeL.y = face.y + (face.r - eyeL.r) * 0;
    eyeL.z = face.z + (face.r - eyeL.r) * this.trigEyel1.c;

    // 座標変換
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
