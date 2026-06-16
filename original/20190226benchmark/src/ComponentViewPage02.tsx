
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import * as React from "react";

// 情報構造体
interface ComponentViewPage02Props extends React.Props<any>{
}

// 状態構造体
interface ComponentViewPage02State{
}

// コンポーネント
export default class ComponentViewPage02 extends React.Component<ComponentViewPage02Props, ComponentViewPage02State>{
	// プロパティ初期値
	static defaultProps: ComponentViewPage02Props = {
	};

	// コンストラクタ
	constructor(props: ComponentViewPage02Props){
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
					やりたいこと
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
						様々なフレームワークの<br />速度を比較してみると楽しそう。
					</div>
					<div style={{
						flexGrow: 1,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}>
						<ul>
							<li>vue.js</li>
							<li>react.js</li>
							<li>riot.js</li>
							<li>vanilla.js</li>
						</ul>
					</div>
				</div>
			</div>
		);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

