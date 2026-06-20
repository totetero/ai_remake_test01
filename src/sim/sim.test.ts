import { describe, expect, it } from "vitest";
import { World } from "./World";
import { Puppet } from "./Puppet";
import { interactPuppets } from "./interactions";

// AC-12: 周期境界条件。ステージ範囲外の座標が中心相対で
// [-stageSize/2, +stageSize/2] へ折り返されることを検証する。
describe("periodic boundary condition", () => {
  const stageSize = 40;
  const cx = 0;
  const cy = 0;

  function makePuppet(px: number, py: number): Puppet {
    // 速度を 0 にして位置のみが折り返し対象になるようにする。
    return new Puppet({ key: "t", px, py, vx: 0, vy: 0, r: 0 });
  }

  it("wraps a position far above the stage range back inside", () => {
    const p = makePuppet(stageSize * 2, 0);
    p.calcPosition({ cx, cy, stageSize });
    const rel = p.px - cx;
    expect(rel).toBeGreaterThanOrEqual(-stageSize / 2);
    expect(rel).toBeLessThanOrEqual(stageSize / 2);
  });

  it("wraps a position far below the stage range back inside", () => {
    const p = makePuppet(0, -stageSize * 2);
    p.calcPosition({ cx, cy, stageSize });
    const rel = p.py - cy;
    expect(rel).toBeGreaterThanOrEqual(-stageSize / 2);
    expect(rel).toBeLessThanOrEqual(stageSize / 2);
  });

  it("wraps both axes simultaneously", () => {
    const p = makePuppet(stageSize * 1.5, -stageSize * 1.5);
    p.calcPosition({ cx, cy, stageSize });
    const relX = p.px - cx;
    const relY = p.py - cy;
    expect(relX).toBeGreaterThanOrEqual(-stageSize / 2);
    expect(relX).toBeLessThanOrEqual(stageSize / 2);
    expect(relY).toBeGreaterThanOrEqual(-stageSize / 2);
    expect(relY).toBeLessThanOrEqual(stageSize / 2);
  });
});

// AC-13: パペット間 LJ 相互作用の作用反作用（対称性）。
describe("puppet-puppet LJ interaction symmetry", () => {
  it("applies equal and opposite velocity changes", () => {
    // 近距離（sigma=2.0 で力が発生する距離）に2体を配置する。
    const p0 = new Puppet({ key: "a", px: 0, py: 0, vx: 0, vy: 0, r: 0 });
    const p1 = new Puppet({ key: "b", px: 1.5, py: 0.7, vx: 0, vy: 0, r: 0 });

    interactPuppets({ dt: 0.01, puppet0: p0, puppet1: p1, stageSize: 40 });

    // p0 の変化量 (-dvx,-dvy)、p1 の変化量 (+dvx,+dvy) で符号反転・同量。
    expect(p0.vx).toBeCloseTo(-p1.vx, 12);
    expect(p0.vy).toBeCloseTo(-p1.vy, 12);
    // 実際に力が発生していること（恒等的に 0 でない）。
    expect(Math.abs(p1.vx) + Math.abs(p1.vy)).toBeGreaterThan(0);
  });
});

// AC-14: World 初期化と update 後の有限値検証。
describe("World", () => {
  it("creates 25 blocks and 75 puppets (100 bodies)", () => {
    const world = new World();
    const list = world.getBallList();
    // 100 body × 1体あたり (block 8パーツ or puppet 9パーツ) × 2(outer/inner)。
    // block: 25 × 8 × 2 = 400, puppet: 75 × 9 × 2 = 1350, 合計 1750。
    expect(list.length).toBe(25 * 8 * 2 + 75 * 9 * 2);
    expect(Array.isArray(list)).toBe(true);
  });

  it("getBallList returns Ball objects with required fields", () => {
    const world = new World();
    world.update(800, 600);
    const ball = world.getBallList()[0];
    expect(ball).toHaveProperty("x");
    expect(ball).toHaveProperty("y");
    expect(ball).toHaveProperty("z");
    expect(ball).toHaveProperty("r");
    expect(ball).toHaveProperty("c");
    expect(ball).toHaveProperty("k");
  });

  it("produces finite x/y/r for every ball after update", () => {
    const world = new World();
    for (let i = 0; i < 5; i++) world.update(800, 600);
    for (const ball of world.getBallList()) {
      expect(Number.isFinite(ball.x)).toBe(true);
      expect(Number.isFinite(ball.y)).toBe(true);
      expect(Number.isFinite(ball.r)).toBe(true);
    }
  });
});
