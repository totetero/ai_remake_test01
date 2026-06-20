// パペットの配色セット。原作 PuppetColorSet をクラスから定数配列へ整理。
export interface PuppetColorSet {
  head: string;
  body: string;
  hand: string;
  foot: string;
  hair: string;
  eyes: string;
}

// 原作の配色定義。コンストラクタ引数 (c1,c2,c3,c4) は
// head=c1, body=c2, hand=foot=hair=c3, eyes=c4 にマップされる。
const make = (
  c1: string,
  c2: string,
  c3: string,
  c4: string,
): PuppetColorSet => ({
  head: c1,
  body: c2,
  hand: c3,
  foot: c3,
  hair: c3,
  eyes: c4,
});

export const COLOR_SETS: readonly PuppetColorSet[] = [
  make("#ffffff", "#ffffff", "#ffffff", "#000000"),
  make("#ffffff", "#0000ff", "#ff0000", "#000000"),
  make("#000000", "#000000", "#ff0000", "#ffffff"),
  make("#ff0000", "#ff0000", "#00ff00", "#000000"),
  make("#0000ff", "#0000ff", "#ff0000", "#ffffff"),
  make("#00ff00", "#00ff00", "#ff0000", "#000000"),
  make("#ffff00", "#ffff00", "#ffff00", "#000000"),
];

export function randomColorSet(): PuppetColorSet {
  return COLOR_SETS[Math.floor(Math.random() * COLOR_SETS.length)];
}
