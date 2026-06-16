
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import {Block,} from "./Block";
import {Puppet,} from "./Puppet";

export class BodyInteraction{
	// シングルトン処理
	private static _instance: BodyInteraction = null;
	private constructor(){if(BodyInteraction._instance != null){throw new Error("must use the getInstance.");} BodyInteraction._instance = this; this._init();}
	public static getInstance(): BodyInteraction{if(BodyInteraction._instance == null){new BodyInteraction();} return BodyInteraction._instance;}

	// 初期化
	private _init(): void{}

	// 相互作用計算
	public calcInteractionPuppet(params: {
		dt: number,
		puppet0: Puppet,
		puppet1: Puppet,
		stageSize: number,
	}): void{
		// 周期境界条件
		let dx: number = params.puppet1.getPx() - params.puppet0.getPx();
		let dy: number = params.puppet1.getPy() - params.puppet0.getPy();
		while(dx > params.stageSize *  0.5){dx -= params.stageSize;}
		while(dx < params.stageSize * -0.5){dx += params.stageSize;}
		while(dy > params.stageSize *  0.5){dy -= params.stageSize;}
		while(dy < params.stageSize * -0.5){dy += params.stageSize;}

		// LJポテンシャルによる相互作用
		const sigma: number = 2.0;
		const rr: number = dx * dx + dy * dy;
		const irr: number = (rr === 0) ? 0 : (sigma * sigma / rr);
		const irrrrrr: number = irr * irr * irr;
		const lj: number = (rr === 0 || irrrrrr < 1) ? 0 : ((2 * irrrrrr * irrrrrr - irrrrrr) / rr);
		const dvx: number = lj * dx * params.dt;
		const dvy: number = lj * dy * params.dt;
		params.puppet0.setVx(params.puppet0.getVx() - dvx);
		params.puppet0.setVy(params.puppet0.getVy() - dvy);
		params.puppet1.setVx(params.puppet1.getVx() + dvx);
		params.puppet1.setVy(params.puppet1.getVy() + dvy);
	}

	// 相互作用計算
	public calcInteractionBlock(params: {
		dt: number,
		block: Block,
		puppet: Puppet,
		stageSize: number,
	}): void{
		// 周期境界条件
		let dx: number = params.puppet.getPx() - params.block.getPx();
		let dy: number = params.puppet.getPy() - params.block.getPy();
		while(dx > params.stageSize *  0.5){dx -= params.stageSize;}
		while(dx < params.stageSize * -0.5){dx += params.stageSize;}
		while(dy > params.stageSize *  0.5){dy -= params.stageSize;}
		while(dy < params.stageSize * -0.5){dy += params.stageSize;}

		// LJポテンシャルによる相互作用
		const sigma: number = 3.0;
		const rr: number = dx * dx + dy * dy;
		const irr: number = (rr === 0) ? 0 : (sigma * sigma / rr);
		const irrrrrr: number = irr * irr * irr;
		const lj: number = (rr === 0 || irrrrrr < 1) ? 0 : ((2 * irrrrrr * irrrrrr - irrrrrr) / rr);
		const dvx: number = lj * dx * params.dt;
		const dvy: number = lj * dy * params.dt;
		params.puppet.setVx(params.puppet.getVx() + dvx);
		params.puppet.setVy(params.puppet.getVy() + dvy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

