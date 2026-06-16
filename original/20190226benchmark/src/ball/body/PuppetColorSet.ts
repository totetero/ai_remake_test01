
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// パペットカラーセットクラス
export class PuppetColorSet{
	public head: string;
	public body: string;
	public hand: string;
	public foot: string;
	public hair: string;
	public eyes: string;
	private constructor(c1: string, c2: string, c3: string, c4: string){
		this.head = c1;
		this.body = c2;
		this.hand = c3;
		this.foot = c3;
		this.hair = c3;
		this.eyes = c4;
	}
	private static _list: PuppetColorSet[] = [
		new PuppetColorSet("#ffffff", "#ffffff", "#ffffff", "#000000"),
		new PuppetColorSet("#ffffff", "#0000ff", "#ff0000", "#000000"),
		new PuppetColorSet("#000000", "#000000", "#ff0000", "#ffffff"),
		new PuppetColorSet("#ff0000", "#ff0000", "#00ff00", "#000000"),
		new PuppetColorSet("#0000ff", "#0000ff", "#ff0000", "#ffffff"),
		new PuppetColorSet("#00ff00", "#00ff00", "#ff0000", "#000000"),
		new PuppetColorSet("#ffff00", "#ffff00", "#ffff00", "#000000"),
	];
	public static get(): PuppetColorSet{
		return PuppetColorSet._list[Math.floor(Math.random() * PuppetColorSet._list.length)];
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

