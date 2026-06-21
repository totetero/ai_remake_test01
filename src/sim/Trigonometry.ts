// 角度から cos/sin を保持する小さなヘルパ。set() 時に即計算する。
export class Trigonometry {
  public c: number;
  public s: number;

  public constructor(r: number) {
    this.c = Math.cos(r);
    this.s = Math.sin(r);
  }

  public set(r: number): void {
    this.c = Math.cos(r);
    this.s = Math.sin(r);
  }
}
