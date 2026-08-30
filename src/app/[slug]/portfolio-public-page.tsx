"use client";

import { useEffect } from "react";
import { PortfolioRenderer } from "@/components/portfolio-renderer";
import type { SchemaData } from "@/lib/schema";
import type { StylePresetKey } from "@/lib/stylePresets";
import posthog from "posthog-js";

// Thin client boundary — only the renderer needs to be client-side
// because it uses dynamic imports (ThreeUI, canvas, Framer Motion)
export function PortfolioPublicPage({
  data,
  presetKey,
  slug,
}: {
  data: SchemaData;
  presetKey: StylePresetKey;
  slug: string;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      posthog.capture("portfolio_visit", { slug, style_preset: presetKey });
    }
  }, [slug, presetKey]);

  return <PortfolioRenderer data={data} presetKey={presetKey} />;
}
