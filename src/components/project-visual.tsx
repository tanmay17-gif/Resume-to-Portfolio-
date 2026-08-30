"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

// Taxonomy categories
type Taxonomy = "ai" | "web" | "mobile" | "data" | "game" | "default";

function getTaxonomy(seed: string): Taxonomy {
  const s = seed.toLowerCase();
  if (s.match(/\b(ai|ml|llm|gpt|vision|model|train|neural|predict)\b/)) return "ai";
  if (s.match(/\b(web|app|site|portal|platform|ui|ux|react|next)\b/)) return "web";
  if (s.match(/\b(ios|android|mobile|native|expo|flutter)\b/)) return "mobile";
  if (s.match(/\b(data|pipeline|sql|analytics|dashboard|chart)\b/)) return "data";
  if (s.match(/\b(game|3d|engine|unity|unreal)\b/)) return "game";
  return "default";
}

export function GenerativeProjectVisual({ seed, presetKey }: { seed: string; presetKey: string }) {
  const { colors, taxonomy } = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    
    const palettes = [
      ["#7c3aed", "#38bdf8", "#818cf8"],
      ["#f43f5e", "#fb923c", "#fcd34d"],
      ["#10b981", "#3b82f6", "#6366f1"],
      ["#8b5cf6", "#d946ef", "#f43f5e"],
      ["#14b8a6", "#8b5cf6", "#ec4899"],
    ];
    
    const palette = palettes[hash % palettes.length];
    const tax = getTaxonomy(seed);
    
    return { colors: palette, taxonomy: tax, hash };
  }, [seed]);

  const isDark = ["dark_pro", "retro"].includes(presetKey);
  const isBold = presetKey === "bold";
  const isMinimal = ["minimal", "classic"].includes(presetKey);

  // For Bold, keep the brutalist high-contrast SVG-like style.
  if (isBold) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center p-2">
        <div className="w-full h-full border-[3px] border-white relative bg-[#facc15] overflow-hidden">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear", repeatType: "loop" }} className="absolute -left-1/4 -top-1/4 w-3/4 h-3/4 border-[3px] border-black rounded-full" style={{ background: colors[0] }} />
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-4 -bottom-4 w-1/2 h-1/2 border-[3px] border-black" style={{ background: colors[1] }} />
          <div className="absolute inset-0 flex items-center justify-center font-display font-black text-2xl uppercase tracking-widest text-black mix-blend-overlay opacity-30">{taxonomy}</div>
        </div>
      </div>
    );
  }

  // Minimal / Editorial: Clean lines, abstract layouts
  if (isMinimal) {
    return (
      <div className="absolute inset-0 bg-[#fafafa] flex items-center justify-center p-6 border-b border-slate-200">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '16px 16px' }} />
        {taxonomy === "ai" && <motion.div animate={{ rotate: 180 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-24 h-24 border border-slate-300 rounded-[30%] shadow-sm" />}
        {taxonomy === "web" && <div className="w-full h-full max-w-[120px] max-h-[80px] border border-slate-200 rounded-md shadow-sm bg-white p-2 flex flex-col gap-1"><div className="h-2 w-1/3 bg-slate-100 rounded-sm" /><div className="h-full bg-slate-50 rounded-sm border border-slate-100" /></div>}
        {taxonomy === "mobile" && <div className="w-12 h-24 border-2 border-slate-300 rounded-2xl shadow-sm bg-white relative"><div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-slate-200 rounded-full" /></div>}
        {taxonomy === "data" && <div className="flex items-end justify-center gap-1.5 h-16 w-24">{[0.4, 0.8, 0.5, 1].map((h, i) => <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="flex-1 bg-slate-200 rounded-t-sm" />)}</div>}
        {taxonomy === "game" && <motion.div animate={{ rotateX: 360, rotateY: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="size-16 border border-slate-300 rounded-lg" style={{ transformStyle: "preserve-3d" }} />}
        {taxonomy === "default" && <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} className="size-20 border border-slate-200 rounded-full shadow-sm" />}
      </div>
    );
  }

  // Dimension / Three.js driven for Glass, Soft, Dark Pro, Grid, Retro
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: isDark ? "linear-gradient(135deg, #09090b, #18181b)" : "linear-gradient(135deg, #f1f5f9, #ffffff)" }}>
      {/* Background depth (Out of focus) */}
      <div className="absolute inset-0 opacity-40 blur-xl">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full" style={{ background: colors[0], opacity: 0.3 }} />
        <motion.div animate={{ scale: [1, 1.1, 1], x: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full" style={{ background: colors[1], opacity: 0.3 }} />
      </div>

      {/* Midground 3D abstraction (Perspective) */}
      <div className="absolute inset-0 flex items-center justify-center perspective-[800px]">
        {taxonomy === "ai" && (
          <motion.div animate={{ rotateY: 360, rotateX: 180 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="relative size-20 transform-style-3d">
            <div className="absolute inset-0 border-[2px] border-white/20 rounded-full" style={{ transform: "rotateX(75deg)" }} />
            <div className="absolute inset-0 border-[2px] border-white/20 rounded-full" style={{ transform: "rotateY(75deg)" }} />
            <div className="absolute inset-0 border-[2px] border-white/20 rounded-full" style={{ transform: "rotateZ(75deg)" }} />
            <div className="absolute inset-0 m-auto size-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ background: colors[2] }} />
          </motion.div>
        )}
        {taxonomy === "web" && (
          <motion.div animate={{ rotateX: [10, -10, 10], rotateY: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative w-32 h-24 transform-style-3d">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl transform translate-z-[20px]" />
            <div className="absolute top-3 left-3 w-12 h-2 bg-white/30 rounded-full transform translate-z-[40px]" />
            <div className="absolute bottom-3 left-3 right-3 h-10 bg-white/10 rounded-md transform translate-z-[30px] border border-white/10" />
          </motion.div>
        )}
        {taxonomy === "mobile" && (
          <motion.div animate={{ rotateY: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="relative w-16 h-32 transform-style-3d">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl transform translate-z-[10px]" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl transform -translate-z-[10px]" />
            <div className="absolute inset-0 m-auto w-12 h-24 bg-gradient-to-b from-white/20 to-transparent rounded-lg transform translate-z-[12px]" />
          </motion.div>
        )}
        {taxonomy === "data" && (
          <div className="relative w-32 h-24 flex items-end justify-center gap-2 transform-style-3d rotate-x-[20deg] rotate-y-[-20deg]">
            {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
              <motion.div key={i} animate={{ height: [`${h*80}%`, `${h*100}%`, `${h*80}%`] }} transition={{ duration: 2, delay: i*0.2, repeat: Infinity }} className="w-4 bg-white/20 backdrop-blur-sm rounded-t-sm border border-white/30 transform translate-z-[20px]" style={{ boxShadow: `0 10px 20px ${colors[0]}40` }} />
            ))}
          </div>
        )}
        {taxonomy === "game" && (
          <motion.div animate={{ rotateX: 360, rotateY: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="relative size-20 transform-style-3d">
            <div className="absolute inset-0 bg-white/10 border border-white/30 transform translate-z-[40px] backdrop-blur-sm" />
            <div className="absolute inset-0 bg-white/5 border border-white/20 transform -translate-z-[40px] backdrop-blur-sm" />
            <div className="absolute inset-0 bg-white/10 border border-white/30 transform rotate-y-90 translate-z-[40px] backdrop-blur-sm" />
            <div className="absolute inset-0 bg-white/5 border border-white/20 transform rotate-y-90 -translate-z-[40px] backdrop-blur-sm" />
            <div className="absolute inset-0 bg-white/10 border border-white/30 transform rotate-x-90 translate-z-[40px] backdrop-blur-sm" />
            <div className="absolute inset-0 bg-white/5 border border-white/20 transform rotate-x-90 -translate-z-[40px] backdrop-blur-sm" />
          </motion.div>
        )}
        {taxonomy === "default" && (
          <motion.div animate={{ rotateZ: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="relative size-24 transform-style-3d">
            <div className="absolute inset-0 border-[3px] border-white/20 rounded-full transform translate-z-[20px]" />
            <div className="absolute inset-0 border-[1px] border-white/40 rounded-full transform -translate-z-[20px] scale-75" />
            <div className="absolute inset-0 rounded-full opacity-50 blur-md transform translate-z-[10px]" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }} />
          </motion.div>
        )}
      </div>

      {/* Inline CSS noise pattern — no external requests */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }} />
    </div>
  );
}
