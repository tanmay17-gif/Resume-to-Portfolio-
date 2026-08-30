"use client";

import { useEffect, useRef } from "react";

/**
 * P5Background — re-implemented without p5.js using native Canvas API.
 * Removes the p5 dependency while keeping the same visual effects.
 */
export function P5Background({ preset, className = "" }: { preset: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldRender = ["retro", "dark_pro", "bold"].includes(preset);

  useEffect(() => {
    if (!shouldRender || typeof window === "undefined" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    let animId: number;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Simple seeded noise approximation
    function noise(x: number, y: number) {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx!.clearRect(0, 0, w, h);
      t += 0.004;

      if (preset === "retro") {
        ctx!.fillStyle = "rgba(0, 255, 159, 0.024)";
        const cols = 14, rows = 9;
        const cw = w / cols, rh = h / rows;
        for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
            const n = noise(x * 0.18 + t, y * 0.18 - t);
            const sz = 18 + n * 28;
            const px = x * cw + cw / 2 + Math.sin(t + x * 0.6) * 6;
            const py = y * rh + rh / 2 + Math.cos(t + y * 0.5) * 6;
            ctx!.beginPath();
            ctx!.rect(px - sz / 2, py - sz / 2, sz, sz);
            ctx!.fill();
          }
        }
      } else if (preset === "dark_pro") {
        for (let i = 0; i < 90; i++) {
          const x = (noise(i * 0.08, t * 0.6) * w) % w;
          const y = (noise(i * 0.11 + 100, t * 0.5) * h) % h;
          const a = (10 + noise(i * 0.2, t) * 14) / 255;
          ctx!.fillStyle = `rgba(14, 165, 233, ${a})`;
          ctx!.beginPath();
          ctx!.ellipse(x, y, 1.1, 1.1, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
      } else if (preset === "bold") {
        ctx!.strokeStyle = "rgba(0,0,0,0.07)";
        ctx!.lineWidth = 1;
        for (let x = -h; x < w; x += 28) {
          ctx!.beginPath();
          ctx!.moveTo(x, 0);
          ctx!.lineTo(x + h, h);
          ctx!.stroke();
        }
        for (let i = 0; i < 40; i++) {
          const x = (i * 73 + t * 120) % w;
          const y = (noise(i * 0.3, t) * h) % h;
          ctx!.fillStyle = "rgba(250, 204, 21, 0.086)";
          ctx!.beginPath();
          ctx!.ellipse(x, y, 5, 5, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [preset, shouldRender]);

  if (!shouldRender) return null;
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full -z-10 opacity-40 ${className}`}
      aria-hidden
    />
  );
}
