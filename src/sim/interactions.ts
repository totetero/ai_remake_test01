import type { Block } from "./Block";
import type { Puppet } from "./Puppet";

// 周期境界条件で最短距離成分へ折り返す。
function wrap(d: number, stageSize: number): number {
  while (d > stageSize * 0.5) d -= stageSize;
  while (d < stageSize * -0.5) d += stageSize;
  return d;
}

// LJ（レナード=ジョーンズ）力の係数を計算する。
function ljForce(rr: number, sigma: number): number {
  if (rr === 0) return 0;
  const irr = (sigma * sigma) / rr;
  const irrrrrr = irr * irr * irr;
  if (irrrrrr < 1) return 0;
  return (2 * irrrrrr * irrrrrr - irrrrrr) / rr;
}

// パペット同士の相互作用。作用反作用（対称）で双方の速度を更新する。
export function interactPuppets(params: {
  dt: number;
  puppet0: Puppet;
  puppet1: Puppet;
  stageSize: number;
}): void {
  const dx = wrap(params.puppet1.px - params.puppet0.px, params.stageSize);
  const dy = wrap(params.puppet1.py - params.puppet0.py, params.stageSize);

  const sigma = 2.0;
  const rr = dx * dx + dy * dy;
  const lj = ljForce(rr, sigma);
  const dvx = lj * dx * params.dt;
  const dvy = lj * dy * params.dt;
  params.puppet0.vx -= dvx;
  params.puppet0.vy -= dvy;
  params.puppet1.vx += dvx;
  params.puppet1.vy += dvy;
}

// ブロックとパペットの相互作用。ブロックは不動なのでパペット側のみ更新する。
export function interactBlock(params: {
  dt: number;
  block: Block;
  puppet: Puppet;
  stageSize: number;
}): void {
  const dx = wrap(params.puppet.px - params.block.px, params.stageSize);
  const dy = wrap(params.puppet.py - params.block.py, params.stageSize);

  const sigma = 3.0;
  const rr = dx * dx + dy * dy;
  const lj = ljForce(rr, sigma);
  const dvx = lj * dx * params.dt;
  const dvy = lj * dy * params.dt;
  params.puppet.vx += dvx;
  params.puppet.vy += dvy;
}
