
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import * as React from "react";

// 情報構造体
interface ComponentViewPage03Props extends React.Props<any>{
}

// 状態構造体
interface ComponentViewPage03State{
}

// コンポーネント
export default class ComponentViewPage03 extends React.Component<ComponentViewPage03Props, ComponentViewPage03State>{
	// プロパティ初期値
	static defaultProps: ComponentViewPage03Props = {
	};

	// コンストラクタ
	constructor(props: ComponentViewPage03Props){
		super(props);
		// 状態設定
		this.state = {
		};
	}

	// レンダー
	public render(): JSX.Element{
		return(
			<div style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
			}}>
				<div style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "50px",
				}}>
					やりかた
				</div>
				<div style={{
					flexGrow: 1,
					display: "flex",
				}}>
					<div style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						width: "50%",
					}}>
						SVGで多数の円を描画し、<br />
						ループ性能を計測してみる。<br />
						<br />
						vue.jsの場合は右コードのような雰囲気<br />
						partsListに1000個程度の要素を用意する<br />
					</div>
					<div style={{
						flexGrow: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "flex-start",
					}}>
						&lt;svg :width="w" :height="h"&gt;<br />
						&emsp;&emsp;&lt;circle<br />
						&emsp;&emsp;&emsp;&emsp;v-for="parts in partsList"<br />
						&emsp;&emsp;&emsp;&emsp;:key="parts.k"<br />
						&emsp;&emsp;&emsp;&emsp;:cx="parts.x"<br />
						&emsp;&emsp;&emsp;&emsp;:cy="parts.y"<br />
						&emsp;&emsp;&emsp;&emsp;:r="parts.r"<br />
						&emsp;&emsp;&emsp;&emsp;:fill="parts.c"<br />
						&emsp;&emsp;/&gt;<br />
						&lt;/svg&gt;<br />
					</div>
				</div>
			</div>
		);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

