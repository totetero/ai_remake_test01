
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import {mat4, vec4,} from "gl-matrix";
import {Ball,} from "../util/Ball";
import {Parts,} from "../util/Parts";
import {Body,} from "./Body";

// ブロッククラス
export class Block implements Body{
	private _px: number;
	private _py: number;
	private _s: number = 1.0;
	private _zIndex: number = 0;

	// 出力用リスト
	private _partsList: Parts[];
	private _outerList: Ball[];
	private _innerList: Ball[];

	// コンストラクタ
	public constructor(params: {
		key: string;
		px: number;
		py: number;
	}){
		this._px = params.px;
		this._py = params.py;

		this._partsList = [];
		for(let i = 0; i < 2; i++){
			const z: number = 0.8 * (i - 0.5);
			for(let j = 0; j < 2; j++){
				const y: number = 0.8 * (j - 0.5);
				for(let k = 0; k < 2; k++){
					const x: number = 0.8 * (k - 0.5);
					const c: string = (((i + j + k) % 2 === 0) ? "white" : "gray");
					this._partsList.push(new Parts(x, y, z, 0.5, c, `${params.key}_${k}_${j}_${i}`));
				}
			}
		}
		this._outerList = this._partsList.map(parts => parts.outer);
		this._innerList = this._partsList.map(parts => parts.inner);
	}

	// ゲッター
	public getPx(): number{return this._px;}
	public getPy(): number{return this._py;}
	public getZIndex(): number{return this._zIndex;}
	public getBallList(): Ball[]{return this._outerList.concat(this._innerList);}

	// 位置計算
	public calcPosition(params: {
		cx: number,
		cy: number,
		stageSize: number,
	}): void{
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
	updatePoses(params: {
		step:number;
	}): void{
		// 何もしない
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
		mat4.scale(tempMat1, tempMat1, [this._s, this._s, this._s]);

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

