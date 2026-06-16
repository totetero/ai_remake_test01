
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import * as React from "react";

// 情報構造体
interface ComponentTestProps extends React.Props<any>{
}

// 状態構造体
interface ComponentTestState{
}

// コンポーネント
export default class ComponentTest extends React.Component<ComponentTestProps, ComponentTestState>{
	// プロパティ初期値
	static defaultProps: ComponentTestProps = {
	};

	// コンストラクタ
	constructor(props: ComponentTestProps){
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

