
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import * as React from "react";
import ComponentViewPage01 from "./ComponentViewPage01";
import ComponentViewPage02 from "./ComponentViewPage02";
import ComponentViewPage03 from "./ComponentViewPage03";
import ComponentViewPage04 from "./ComponentViewPage04";
import ComponentViewPage05 from "./ComponentViewPage05";

// 情報構造体
interface ComponentViewRootProps extends React.Props<any>{
	pages: any[];
}

// 状態構造体
interface ComponentViewRootState{
	page: number;
}

// コンポーネント
export default class ComponentViewRoot extends React.Component<ComponentViewRootProps, ComponentViewRootState>{
	// プロパティ初期値
	static defaultProps: ComponentViewRootProps = {
		pages: [
			<ComponentViewPage01 />,
			<ComponentViewPage02 />,
			<ComponentViewPage03 />,
			<ComponentViewPage04 />,
			<ComponentViewPage05 />,
		],
	};

	// コンストラクタ
	constructor(props: ComponentViewRootProps){
		super(props);
		// 状態設定
		this.state = {
			page: 0,
		};
	}

	// 戻るボタン
	private onPrev(): void{
		if(this.state.page - 1 < 0){return;}
		this.setState({page: this.state.page - 1,});
	}

	// 進むボタン
	private onNext(): void{
		if(this.state.page + 1 >= this.props.pages.length){return;}
		this.setState({page: this.state.page + 1,});
	}

	// レンダー
	public render(): JSX.Element{
		return(
			<div style={{
				display: "flex",
				flexDirection: "column",
				position: "absolute",
				left: "0",
				right: "0",
				top: "0",
				bottom: "0",
			}}>
				<div style={{
					flexGrow: 1,
					position: "relative",
				}}><div style={{
					position: "absolute",
					left: "0",
					right: "0",
					top: "0",
					bottom: "0",
				}}>{this.props.pages[this.state.page]}</div></div>

				<div style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "40px",
				}}>
					<button onClick={this.onPrev.bind(this)}>prev</button>
					<div style={{width: "80px", textAlign: "center",}}>{this.state.page + 1}/{this.props.pages.length}</div>
					<button onClick={this.onNext.bind(this)}>next</button>
				</div>
			</div>
		);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

