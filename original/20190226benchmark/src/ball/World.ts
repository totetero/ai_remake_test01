
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import {Ball,} from "./util/Ball";
import {Body,} from "./body/Body";
import {BodyInteraction,} from "./body/BodyInteraction";
import {Block,} from "./body/Block";
import {Puppet,} from "./body/Puppet";
import {mat4,} from "gl-matrix";

export class World{
	// シングルトン処理
	private static _instance: World = null;
	private constructor(){if(World._instance != null){throw new Error("must use the getInstance.");} World._instance = this; this._init();}
	public static getInstance(): World{if(World._instance == null){new World();} return World._instance;}

	private _step: number;
	private _stageSize: number;
	private _radiusScale: number;
	private _worldMatrix: mat4;
	private _frameList: number[];
	private _frameRate: string;
	private _bodies: Body[];
	private _blocks: Block[];
	private _puppets: Puppet[];
	private _player: Puppet;

	// 初期化
	private _init(): void{
		this._step = 0;
		this._stageSize = 40;
		this._radiusScale = 1;
		this._worldMatrix = mat4.create();
		this._frameList = [];
		this._frameRate = "";

		this._bodies = [];
		this._puppets = [];
		this._blocks = [];
		const size = 10;

		// 初期配置
		for(let i = 0; i < size * size; i++){
			const x: number = Math.floor(i % size);
			const y: number = Math.floor(i / size);
			if(x % 2 === 0 && y % 2 === 0){
				// 壁作成
				const block: Block = new Block({
					key: `b${i}`,
					px: (this._stageSize / size) * x,
					py: (this._stageSize / size) * y,
				});
				this._bodies.push(block);
				this._blocks.push(block);
			}else{
				// パペット作成
				const r: number = Math.random() * 2 * Math.PI;
				const puppet: Puppet = new Puppet({
					key: `p${i}`,
					px: (this._stageSize / size) * x,
					py: (this._stageSize / size) * y,
					vx: 1 * Math.cos(Math.PI / 2 - r),
					vy: 1 * Math.sin(Math.PI / 2 - r),
					r: r,
				});
				this._bodies.push(puppet);
				this._puppets.push(puppet);
			}
		}

		// 中心パペット認定
		this._player = this._puppets[0];
	}

	// ゲッター
	public getFrameRate(): string{return this._frameRate;}
	public getBallList(): Ball[]{return [].concat(...this._bodies.map(body => body.getBallList()));}

	public update(w: number, h: number): void{
		this._step++;

		const tempMat1: mat4 = mat4.create();
		const tempMat2: mat4 = mat4.create();
		const tempMat3: mat4 = mat4.create();

		// 座標変換行列
		mat4.identity(tempMat1);
		mat4.scale(tempMat1, tempMat1, [w * 0.5, h * -0.5, 1]);
		mat4.translate(tempMat1, tempMat1, [1, -1, 0]);

		// 透視投影行列
		mat4.perspective(tempMat2, Math.PI / 6, w / h, 1.0, 1000.0);

		// カメラ行列
		const ex: number = this._player.getPx();
		const ey: number = 0;
		const ez: number = this._player.getPy();
		const cr: number = 30;
		const t1: number = 45 * Math.PI / 180;
		const t2: number = this._step * Math.PI / 180
		const cx: number = ex + cr * Math.cos(t1) * Math.sin(t2);
		const cy: number = ey + cr * Math.sin(t1);
		const cz: number = ez + cr * Math.cos(t1) * Math.cos(t2); 
		mat4.lookAt(tempMat3, [cx, cy, cz], [ex, ey, ez], [0, 1, 0]);

		// パペット相互作用計算
		for(let i = 0; i < this._puppets.length; i++){
			for(let j = i + 1; j < this._puppets.length; j++){
				BodyInteraction.getInstance().calcInteractionPuppet({
					dt: 0.01,
					puppet0: this._puppets[i],
					puppet1: this._puppets[j],
					stageSize: this._stageSize,
				});
			}
		}

		// ブロック相互作用計算
		for(let i = 0; i < this._blocks.length; i++){
			for(let j = 0; j < this._puppets.length; j++){
				BodyInteraction.getInstance().calcInteractionBlock({
					dt: 0.01,
					block: this._blocks[i],
					puppet: this._puppets[j],
					stageSize: this._stageSize,
				});
			}
		}

		// ボディ位置計算
		for(let i = 0; i < this._bodies.length; i++){
			this._bodies[i].calcPosition({
				cx: ex,
				cy: ez,
				stageSize: this._stageSize,
			});
		}

		// 行列計算
		mat4.multiply(tempMat1, tempMat1, tempMat2);
		this._radiusScale = (Math.abs(tempMat1[0]) + Math.abs(tempMat1[5])) / 2;
		mat4.multiply(tempMat1, tempMat1, tempMat3);
		this._worldMatrix = tempMat1;

		// ボディ計算
		for(let i = 0; i < this._bodies.length; i++){
			this._bodies[i].updatePoses({step: this._step,});
			this._bodies[i].updateParts({radiusScale: this._radiusScale, worldMatrix: this._worldMatrix,});
		}

		// ボディを描画順にソート
		this._bodies.sort((a, b) => b.getZIndex() - a.getZIndex());

		// フレームレート計算
		const len: number = 100;
		this._frameList.unshift(Date.now());
		if(this._frameList.length > len){
			this._frameList.length = len;
			const prev: number = this._frameList[len - 1];
			const curr: number = this._frameList[0];
			this._frameRate = `${(1000 * len / (curr - prev)).toFixed(2)}fps`;
		}else{
			this._frameRate = `計算中${len - this._frameList.length}`;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

