
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import * as React from "react";

// 情報構造体
interface ComponentViewPage01Props extends React.Props<any>{
}

// 状態構造体
interface ComponentViewPage01State{
}

// コンポーネント
export default class ComponentViewPage01 extends React.Component<ComponentViewPage01Props, ComponentViewPage01State>{
	// プロパティ初期値
	static defaultProps: ComponentViewPage01Props = {
	};

	// コンストラクタ
	constructor(props: ComponentViewPage01Props){
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
					flexGrow: 4,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					fontSize: "xx-large",
				}}>Vue.jsとかの速度比較</div>

				<div style={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					fontSize: "medium",
				}}>
					<div>勉三さん</div>
					<div>(親しみがこめられたアダ名)</div>
				</div>
			</div>
		);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

