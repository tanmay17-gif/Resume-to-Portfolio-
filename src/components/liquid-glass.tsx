"use client";

import { useRef, useCallback } from "react";

export function LiquidGlassPanel({
  children,
  className = "",
  intensity = "default",
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: "default" | "strong" | "subtle";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mouse-x", `${x}%`);
    el.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  const base = intensity === "strong" ? "liquid-glass" : intensity === "subtle" ? "liquid-glass" : "liquid-glass";

  return (
    <div ref={ref} onMouseMove={onMouseMove} className={`${base} ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
