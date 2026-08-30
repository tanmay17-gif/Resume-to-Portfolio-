"use client";

import dynamic from "next/dynamic";
import type { SchemaData } from "@/lib/schema";
import type { StylePresetKey } from "@/lib/stylePresets";

// Lazy-load each layout independently for optimal bundle splitting
const MinimalLayout  = dynamic(() => import("@/components/layouts/minimal-layout").then(m => m.MinimalLayout), { ssr: false });
const GlassLayout    = dynamic(() => import("@/components/layouts/glass-layout").then(m => m.GlassLayout), { ssr: false });
const BoldLayout     = dynamic(() => import("@/components/layouts/bold-layout").then(m => m.BoldLayout), { ssr: false });
const SoftLayout     = dynamic(() => import("@/components/layouts/soft-layout").then(m => m.SoftLayout), { ssr: false });
const DarkProLayout  = dynamic(() => import("@/components/layouts/dark-pro-layout").then(m => m.DarkProLayout), { ssr: false });
const ClassicLayout  = dynamic(() => import("@/components/layouts/classic-layout").then(m => m.ClassicLayout), { ssr: false });
const GridLayout     = dynamic(() => import("@/components/layouts/grid-layout").then(m => m.GridLayout), { ssr: false });
const RetroLayout    = dynamic(() => import("@/components/layouts/retro-layout").then(m => m.RetroLayout), { ssr: false });

interface Props {
  data: SchemaData;
  presetKey: StylePresetKey;
}

export function PortfolioRenderer({ data, presetKey }: Props) {
  switch (presetKey) {
    case "minimal":  return <MinimalLayout data={data} />;
    case "glass":    return <GlassLayout data={data} />;
    case "bold":     return <BoldLayout data={data} />;
    case "soft":     return <SoftLayout data={data} />;
    case "dark_pro": return <DarkProLayout data={data} />;
    case "classic":  return <ClassicLayout data={data} />;
    case "grid":     return <GridLayout data={data} />;
    case "retro":    return <RetroLayout data={data} />;
    default:         return <MinimalLayout data={data} />;
  }
}
