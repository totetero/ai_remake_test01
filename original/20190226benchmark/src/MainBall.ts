
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import {World,} from "./ball/World";

// 処理はここから始まる
document.addEventListener("DOMContentLoaded", e => {
	(window as any).bombBall = {
		update: (w: number, h: number): void => {World.getInstance().update(w, h);},
		getFrameRate: (): string => {return World.getInstance().getFrameRate();},
		getBallList: (): any => {return World.getInstance().getBallList();},
	};
});

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

