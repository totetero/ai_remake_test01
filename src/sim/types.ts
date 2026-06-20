// 描画用ボール構造体。World#update が返す描画プリミティブ。
export interface Ball {
  x: number;
  y: number;
  z: number;
  r: number;
  c: string;
  k: string;
}
