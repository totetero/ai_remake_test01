
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import {mat4, vec4,} from "gl-matrix";
import {Ball,} from "../util/Ball";
import {Parts,} from "../util/Parts";
import {Trigonometry,} from "../util/Trigonometry";
import {Body,} from "./Body";
import {PuppetColorSet,} from "./PuppetColorSet";

// パペットクラス
export class Puppet implements Body{
	private _px: number;
	private _py: number;
	private _vx: number;
	private _vy: number;
	private _r: number;
	private _s: number = 1.0;
	private _jump: number = 0;
	private _zIndex: number = 0;
	private _isMove: boolean = true;

	// 描画内部パラメータ
	private _trigonometryFotr1: Trigonometry;
	private _trigonometryFotr2: Trigonometry;
	private _trigonometryFotl1: Trigonometry;
	private _trigonometryFotl2: Trigonometry;
	private _trigonometryHndr1: Trigonometry;
	private _trigonometryHndr2: Trigonometry;
	private _trigonometryHndl1: Trigonometry;
	private _trigonometryHndl2: Trigonometry;
	private _trigonometryHead1: Trigonometry;
	private _trigonometryHair1: Trigonometry;
	private _trigonometryEyer1: Trigonometry;
	private _trigonometryEyel1: Trigonometry;
	private _partsFotR: Parts;
	private _partsFotL: Parts;
	private _partsBody: Parts;
	private _partsHndR: Parts;
	private _partsHndL: Parts;
	private _partsFace: Parts;
	private _partsHair: Parts;
	private _partsEyeR: Parts;
	private _partsEyeL: Parts;

	// ポーズウエイト
	private _statusWeightStand: number = 1.0;
	private _statusWeightRun: number = 0.0;

	// 出力用リスト
	private _partsList: Parts[];
	private _outerList: Ball[];
	private _innerList: Ball[];

	// コンストラクタ
	public constructor(params: {
		key: string;
		px: number;
		py: number;
		vx: number;
		vy: number;
		r: number;
	}){
		this._px = params.px;
		this._py = params.py;
		this._vx = params.vx;
		this._vy = params.vy;
		this._r = params.r;

		// 描画内部パラメータ 角度初期化
		this._trigonometryFotr1 = new Trigonometry( 60 * Math.PI / 180);
		this._trigonometryFotr2 = new Trigonometry(  0 * Math.PI / 180);
		this._trigonometryFotl1 = new Trigonometry( 60 * Math.PI / 180);
		this._trigonometryFotl2 = new Trigonometry(  0 * Math.PI / 180);
		this._trigonometryHndr1 = new Trigonometry(  0 * Math.PI / 180);
		this._trigonometryHndr2 = new Trigonometry(  0 * Math.PI / 180);
		this._trigonometryHndl1 = new Trigonometry(  0 * Math.PI / 180);
		this._trigonometryHndl2 = new Trigonometry(  0 * Math.PI / 180);
		this._trigonometryHead1 = new Trigonometry(  0 * Math.PI / 180);
		this._trigonometryHair1 = new Trigonometry(-60 * Math.PI / 180);
		this._trigonometryEyer1 = new Trigonometry(-30 * Math.PI / 180);
		this._trigonometryEyel1 = new Trigonometry( 30 * Math.PI / 180);

		// 描画内部パラメータ 位置初期化
		const puppetColorSet: PuppetColorSet = PuppetColorSet.get();
		this._partsFotR = new Parts(0, 0, 0, 0.3, puppetColorSet.foot, `${params.key}_fotR`);
		this._partsFotL = new Parts(0, 0, 0, 0.3, puppetColorSet.foot, `${params.key}_fotL`);
		this._partsBody = new Parts(0, 0, 0, 0.5, puppetColorSet.body, `${params.key}_body`);
		this._partsHndR = new Parts(0, 0, 0, 0.2, puppetColorSet.hand, `${params.key}_hndR`);
		this._partsHndL = new Parts(0, 0, 0, 0.2, puppetColorSet.hand, `${params.key}_hndL`);
		this._partsFace = new Parts(0, 0, 0, 0.6, puppetColorSet.head, `${params.key}_face`);
		this._partsHair = new Parts(0, 0, 0, 0.2, puppetColorSet.hair, `${params.key}_hair`);
		this._partsEyeR = new Parts(0, 0, 0, 0.1, puppetColorSet.eyes, `${params.key}_eyeR`);
		this._partsEyeL = new Parts(0, 0, 0, 0.1, puppetColorSet.eyes, `${params.key}_eyeL`);

		// 出力用リスト初期化
		this._partsList = [];
		this._partsList.push(this._partsFotR);
		this._partsList.push(this._partsFotL);
		this._partsList.push(this._partsBody);
		this._partsList.push(this._partsHndR);
		this._partsList.push(this._partsHndL);
		this._partsList.push(this._partsFace);
		this._partsList.push(this._partsHair);
		this._partsList.push(this._partsEyeR);
		this._partsList.push(this._partsEyeL);
		this._outerList = this._partsList.map(parts => parts.outer);
		this._innerList = this._partsList.map(parts => parts.inner);
	}

	// ゲッター
	public getPx(): number{return this._px;}
	public getPy(): number{return this._py;}
	public getVx(): number{return this._vx;}
	public getVy(): number{return this._vy;}
	public getZIndex(): number{return this._zIndex;}
	public getBallList(): Ball[]{return this._outerList.concat(this._innerList);}
	// セッター
	public setPx(value: number): void{this._px = value;}
	public setPy(value: number): void{this._py = value;}
	public setVx(value: number): void{this._vx = value;}
	public setVy(value: number): void{this._vy = value;}

	// 位置計算
	public calcPosition(params: {
		cx: number,
		cy: number,
		stageSize: number,
	}): void{
		// 速度のクリッピング
		const vmin: number = 0.01;
		const vmax: number = 0.10;
		const vrr: number = this._vx * this._vx + this._vy * this._vy;
		this._isMove = (vrr > vmin * vmin);
		if(!this._isMove){
			this._vx = 0;
			this._vy = 0;
		}else if(vrr > vmax * vmax){
			const vr = Math.sqrt(vrr);
			this._vx *= vmax / vr;
			this._vy *= vmax / vr;
		}

		// 移動方向計算
		if(this._isMove){this._r = Math.PI / 2 - Math.atan2(this._vy, this._vx);}

		// 速度から位置の計算
		this._px += this._vx;
		this._py += this._vy;

		// 周期境界条件
		let x: number = this._px - params.cx;
		let y: number = this._py - params.cy;
		while(x > params.stageSize *  0.5){x -= params.stageSize;}
		while(x < params.stageSize * -0.5){x += params.stageSize;}
		while(y > params.stageSize *  0.5){y -= params.stageSize;}
		while(y < params.stageSize * -0.5){y += params.stageSize;}
		this._px = x + params.cx;
		this._py = y + params.cy;
	}

	// ポーズアップデート関数
	public updatePoses(params: {
		step: number;
	}): void{
		// ステータスウエイト計算
		this._statusWeightStand *= 0.9;
		this._statusWeightRun *= 0.9;
		if(this._statusWeightStand < 0.1){this._statusWeightStand = 0.0;}
		if(this._statusWeightRun < 0.1){this._statusWeightRun = 0.0;}
		const statusWeightRemain: number = 1 - (this._statusWeightStand + this._statusWeightRun);
		if(this._isMove){this._statusWeightRun += statusWeightRemain;}
		else{this._statusWeightStand += statusWeightRemain;}

		// ポーズ角度計算
		const swing: number = Math.sin((9 * params.step) * Math.PI / 180);
		const theta01: number = (0 * this._statusWeightStand + 30 * this._statusWeightRun) * Math.PI / 180;
		const theta02: number = (0 * this._statusWeightStand + 30 * swing * this._statusWeightRun) * Math.PI / 180;
		this._trigonometryHead1.set(theta01);
		this._trigonometryHndr2.set(theta02);
		this._trigonometryHndl2.set(-theta02);
		this._trigonometryFotr2.set(-theta02);
		this._trigonometryFotl2.set(theta02);
		this._jump = this._statusWeightRun * 0.3 * Math.abs(swing);
	}

	// パーツアップデート関数
	public updateParts(params: {
		radiusScale: number;
		worldMatrix: mat4;
	}): void{
		// 行列計算
		const tempMat1: mat4 = mat4.create();
		const tempMat2: mat4 = params.worldMatrix;
		mat4.copy(tempMat1, tempMat2);
		mat4.translate(tempMat1, tempMat1, [this._px, 0, this._py]);
		mat4.rotateY(tempMat1, tempMat1, this._r);
		mat4.scale(tempMat1, tempMat1, [this._s, this._s, this._s]);

		// 体
		const rf: number = this._partsFotR.src.r + (this._partsBody.src.r + this._partsFotR.src.r * 0.7) * this._trigonometryFotr1.s * this._trigonometryFotr2.c;
		const lf: number = this._partsFotL.src.r + (this._partsBody.src.r + this._partsFotL.src.r * 0.7) * this._trigonometryFotl1.s * this._trigonometryFotl2.c;
		const rh: number = this._partsHndR.src.r - (this._partsBody.src.r + this._partsHndR.src.r * 0.5) * this._trigonometryHndr2.c * this._trigonometryHndr1.s;
		const lh: number = this._partsHndL.src.r - (this._partsBody.src.r + this._partsHndL.src.r * 0.5) * this._trigonometryHndl2.c * this._trigonometryHndl1.s;
		this._partsBody.src.x = 0.0;
		this._partsBody.src.y = Math.max(this._partsBody.src.r, rf, lf, rh, lh) + this._jump;
		this._partsBody.src.z = 0.0;
		// 両足
		this._partsFotR.src.x = this._partsBody.src.x + (this._partsBody.src.r + this._partsFotR.src.r * 0.7) * this._trigonometryFotr1.c;
		this._partsFotR.src.y = this._partsBody.src.y - (this._partsBody.src.r + this._partsFotR.src.r * 0.7) * this._trigonometryFotr1.s * this._trigonometryFotr2.c;
		this._partsFotR.src.z = this._partsBody.src.z + (this._partsBody.src.r + this._partsFotR.src.r * 0.7) * this._trigonometryFotr1.s * this._trigonometryFotr2.s;
		this._partsFotL.src.x = this._partsBody.src.x - (this._partsBody.src.r + this._partsFotL.src.r * 0.7) * this._trigonometryFotl1.c;
		this._partsFotL.src.y = this._partsBody.src.y - (this._partsBody.src.r + this._partsFotL.src.r * 0.7) * this._trigonometryFotl1.s * this._trigonometryFotl2.c;
		this._partsFotL.src.z = this._partsBody.src.z + (this._partsBody.src.r + this._partsFotL.src.r * 0.7) * this._trigonometryFotl1.s * this._trigonometryFotl2.s;
		// 両手
		this._partsHndR.src.x = this._partsBody.src.x + (this._partsBody.src.r + this._partsHndR.src.r * 0.5) * this._trigonometryHndr2.c * this._trigonometryHndr1.c;
		this._partsHndR.src.y = this._partsBody.src.y + (this._partsBody.src.r + this._partsHndR.src.r * 0.5) * this._trigonometryHndr2.c * this._trigonometryHndr1.s;
		this._partsHndR.src.z = this._partsBody.src.z + (this._partsBody.src.r + this._partsHndR.src.r * 0.5) * this._trigonometryHndr2.s;
		this._partsHndL.src.x = this._partsBody.src.x - (this._partsBody.src.r + this._partsHndL.src.r * 0.5) * this._trigonometryHndl2.c * this._trigonometryHndl1.c;
		this._partsHndL.src.y = this._partsBody.src.y + (this._partsBody.src.r + this._partsHndL.src.r * 0.5) * this._trigonometryHndl2.c * this._trigonometryHndl1.s;
		this._partsHndL.src.z = this._partsBody.src.z + (this._partsBody.src.r + this._partsHndL.src.r * 0.5) * this._trigonometryHndl2.s;
		// 顔
		this._partsFace.src.x = this._partsBody.src.x;
		this._partsFace.src.y = this._partsBody.src.y + (this._partsBody.src.r + this._partsFace.src.r * 0.7) * this._trigonometryHead1.c;
		this._partsFace.src.z = this._partsBody.src.z + (this._partsBody.src.r + this._partsFace.src.r * 0.7) * this._trigonometryHead1.s;
		// 髪の毛
		this._partsHair.src.x = this._partsFace.src.x + (this._partsFace.src.r + this._partsHair.src.r * 0.5) * 0;
		this._partsHair.src.y = this._partsFace.src.y + (this._partsFace.src.r + this._partsHair.src.r * 0.5) * this._trigonometryHair1.c;
		this._partsHair.src.z = this._partsFace.src.z + (this._partsFace.src.r + this._partsHair.src.r * 0.5) * this._trigonometryHair1.s;
		// 目
		this._partsEyeR.src.x = this._partsFace.src.x + (this._partsFace.src.r - this._partsEyeR.src.r) * this._trigonometryEyer1.s;
		this._partsEyeR.src.y = this._partsFace.src.y + (this._partsFace.src.r - this._partsEyeR.src.r) * 0;
		this._partsEyeR.src.z = this._partsFace.src.z + (this._partsFace.src.r - this._partsEyeR.src.r) * this._trigonometryEyer1.c;
		this._partsEyeL.src.x = this._partsFace.src.x + (this._partsFace.src.r - this._partsEyeL.src.r) * this._trigonometryEyel1.s;
		this._partsEyeL.src.y = this._partsFace.src.y + (this._partsFace.src.r - this._partsEyeL.src.r) * 0;
		this._partsEyeL.src.z = this._partsFace.src.z + (this._partsFace.src.r - this._partsEyeL.src.r) * this._trigonometryEyel1.c;

		// 座標変換
		const tempVec1: vec4 = vec4.create();
		for(let i = 0; i < this._partsList.length; i++){
			const x0: number = this._partsList[i].src.x;
			const y0: number = this._partsList[i].src.y;
			const z0: number = this._partsList[i].src.z;
			const r0: number = this._partsList[i].src.r;
			vec4.set(tempVec1, x0, y0, z0, 1.0);
			vec4.transformMat4(tempVec1, tempVec1, tempMat1);
			const x1: number = tempVec1[0] / tempVec1[3];
			const y1: number = tempVec1[1] / tempVec1[3];
			const z1: number = tempVec1[2] / tempVec1[3];
			const r1: number = r0 * this._s * params.radiusScale / tempVec1[3];
			this._partsList[i].outer.x = x1;
			this._partsList[i].outer.y = y1;
			this._partsList[i].outer.z = z1;
			this._partsList[i].outer.r = r1 + 5;
			this._partsList[i].inner.x = x1;
			this._partsList[i].inner.y = y1;
			this._partsList[i].inner.z = z1;
			this._partsList[i].inner.r = r1 + 0;
		}

		// 並べ替え
		this._innerList.sort((a, b) => b.z - a.z);

		// ソートパラメータ計算
		this._zIndex = tempMat2[2] * this._px + tempMat2[10] * this._py;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

