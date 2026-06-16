
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import {mat4, vec4,} from "gl-matrix";
import {Ball,} from "../util/Ball";

// ボディインターフェイス
export interface Body{
	getZIndex(): number;
	getBallList(): Ball[];

	// 位置計算
	calcPosition(params: {
		cx: number,
		cy: number,
		stageSize: number,
	}): void;

	// ポーズアップデート関数
	updatePoses(params: {
		step:number;
	}): void;

	// パーツアップデート関数
	updateParts(params: {
		radiusScale:number;
		worldMatrix:mat4;
	}): void;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

