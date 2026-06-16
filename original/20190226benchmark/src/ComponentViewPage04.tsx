
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import * as React from "react";
import {World,} from "./ball/World";

// 情報構造体
interface ComponentViewPage04Props extends React.Props<any>{
	w: number;
	h: number;
}

// 状態構造体
interface ComponentViewPage04State{
	requestId: number;
}

// コンポーネント
export default class ComponentViewPage04 extends React.Component<ComponentViewPage04Props, ComponentViewPage04State>{
	// プロパティ初期値
	static defaultProps: ComponentViewPage04Props = {
		w: 300,
		h: 300,
	};

	// コンストラクタ
	constructor(props: ComponentViewPage04Props){
		super(props);
		// 状態設定
		this.state = {
			requestId: -1,
		};
	}

	// コンポーネントのマウント
	public componentDidMount(): void{
		const canvas: HTMLCanvasElement = this.refs.canvas as HTMLCanvasElement;
		const context: CanvasRenderingContext2D = canvas.getContext("2d");
		(update => update(update))(update => {
			World.getInstance().update(canvas.width, canvas.height);
			context.fillStyle = "#ff0000";
			context.fillRect(0, 0, canvas.width, canvas.height);
			const ballList = World.getInstance().getBallList();
			for(let i = 0; i < ballList.length; i++){
				context.beginPath();
				context.fillStyle = ballList[i].c;
				context.arc(ballList[i].x, ballList[i].y, ballList[i].r, 0, Math.PI*2, false);
				context.fill();
			}
			const requestId: number = window.requestAnimationFrame(() => update(update));
			this.setState({requestId: requestId,});
		});
	}

	// コンポーネントのアンマウント
	public componentWillUnmount(): void{
		window.cancelAnimationFrame(this.state.requestId);
		this.setState({requestId: -1,});
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
					結果
				</div>
				<div style={{
					flexGrow: 1,
					display: "flex",
				}}>
					<div style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						width: "50%",
					}}>
						<table><thead>
							<tr><td>フレームワーク</td><td>-</td><td>秒間フレーム</td></tr>
						</thead><tbody>
							<tr><td><a href="./ball_vue.html" target="_blank">vue.js</a></td><td></td><td>約20fps</td></tr>
							<tr><td><a href="./ball_react.html" target="_blank">react.js</a></td><td></td><td>約13fps</td></tr>
							<tr><td><a href="./ball_riot.html" target="_blank">riot.js</a></td><td></td><td>約15fps</td></tr>
							<tr><td><a href="./ball_svg.html" target="_blank">vanilla.js svg</a></td><td></td><td>約26fps</td></tr>
							<tr><td><a href="./ball_canvas.html" target="_blank">vanilla.js canvas</a></td><td></td><td>約60fps</td></tr>
						</tbody></table>
						<div>
							フレームワークは基本的にpure jsよりも性能は落ちる。<br />
							フレームワークの中ではvue.jsが最も早い。<br />
						</div>
					</div>
					<div style={{
						flexGrow: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
					}}>
						<canvas ref="canvas" width={this.props.w} height={this.props.h} />
						<div>たくさんの円を使ってキャラクターを描画してみる。</div>
					</div>
				</div>
			</div>
		);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

