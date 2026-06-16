
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import * as React from "react";

// 情報構造体
interface ComponentCtrlRootProps extends React.Props<any>{
}

// 状態構造体
interface ComponentCtrlRootState{
}

// コンポーネント
export default class ComponentCtrlRoot extends React.Component<ComponentCtrlRootProps, ComponentCtrlRootState>{
	// プロパティ初期値
	static defaultProps: ComponentCtrlRootProps = {
	};

	// コンストラクタ
	constructor(props: ComponentCtrlRootProps){
		super(props);
		// 状態設定
		this.state = {
		};
	}

	// レンダー
	public render(): JSX.Element{
		return(
			<div>test</div>
		);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

