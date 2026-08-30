"use client";

import { useState, useEffect } from "react";
import { PortfolioRenderer } from "@/components/portfolio-renderer";
import type { SchemaData } from "@/lib/schema";
import type { StylePresetKey } from "@/lib/stylePresets";

/**
 * This page is loaded inside an iframe in the dashboard to render
 * portfolio previews in a fully isolated browsing context.
 * Data is passed in via postMessage from the parent window.
 */
export default function PreviewFramePage() {
  const [data, setData] = useState<SchemaData | null>(null);
  const [presetKey, setPresetKey] = useState<StylePresetKey>("minimal");

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "PORTFOLIO_DATA") {
        setData(e.data.data);
        setPresetKey(e.data.presetKey);
      }
    }

    window.addEventListener("message", handleMessage);
    // Signal to parent that we are ready
    window.parent.postMessage({ type: "PREVIEW_FRAME_READY" }, "*");
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!data) {
    return (
      <div
        className="flex items-center justify-center w-full h-screen"
        style={{ background: "#f7f5f0", color: "#9a9890", fontSize: 12, fontFamily: "sans-serif" }}
      >
        Waiting for data...
      </div>
    );
  }

  return <PortfolioRenderer data={data} presetKey={presetKey} />;
}
