import { useEffect, useRef, useState } from "react";
import { World } from "../sim/World";

// 物理シミュレーションを Canvas 2D へ描画する。
// rAF ループはホットパスのため React のレンダリングを経由せず直接描画する。
// FPS のみ低頻度で state へ反映して表示する。
export function SimCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState<string>("計算中…");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const world = new World();
    let rafId = 0;
    let lastFpsUpdate = 0;

    // Canvas の実ピクセルサイズをビューポート（DPR考慮）へ追従させる。
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      // ゼロ除算ガード（リサイズ直後やレイアウト未確定時）。
      if (w > 0 && h > 0) {
        world.update(w, h);

        context.fillStyle = "#ff0000";
        context.fillRect(0, 0, w, h);

        const ballList = world.getBallList();
        for (let i = 0; i < ballList.length; i++) {
          const ball = ballList[i];
          // 半径が NaN / 負値のときは描画をスキップ（破綻防止）。
          if (!Number.isFinite(ball.r) || ball.r <= 0) continue;
          if (!Number.isFinite(ball.x) || !Number.isFinite(ball.y)) continue;
          context.beginPath();
          context.fillStyle = ball.c;
          context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, false);
          context.fill();
        }

        // FPS 表示は約200ms間隔で更新（再レンダリング頻度を抑制）。
        const now = performance.now();
        if (now - lastFpsUpdate > 200) {
          lastFpsUpdate = now;
          setFps(world.getFrameRate());
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="sim-canvas" />
      <div className="sim-fps" data-testid="fps">
        {fps}
      </div>
    </>
  );
}
