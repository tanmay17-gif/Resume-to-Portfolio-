"use client";

/**
 * PortfolioPreviewFrame
 * Renders the portfolio inside a fully isolated <iframe> via /preview-frame route.
 * Prevents CSS variables, ThreeJS canvases, custom fonts, and global styles from
 * the portfolio themes bleeding into the dashboard interface.
 */

import { useEffect, useRef, useState } from "react";
import type { SchemaData } from "@/lib/schema";
import type { StylePresetKey } from "@/lib/stylePresets";
import { Loader2 } from "lucide-react";

interface Props {
  data: SchemaData;
  presetKey: StylePresetKey;
}

export function PortfolioPreviewFrame({ data, presetKey }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef({ data, presetKey });

  // Keep ref in sync so the message handler always sends latest values
  useEffect(() => {
    dataRef.current = { data, presetKey };
    // Push update to already-loaded iframe
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: "PORTFOLIO_DATA", data, presetKey },
        "*"
      );
    }
  }, [data, presetKey]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "PREVIEW_FRAME_READY") {
        setLoading(false);
        // Send data as soon as child signals it is ready
        iframeRef.current?.contentWindow?.postMessage(
          { type: "PORTFOLIO_DATA", ...dataRef.current },
          "*"
        );
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "#f7f5f0" }}>
          <Loader2 className="size-5 animate-spin text-[#6b6860]" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/preview-frame"
        className="w-full h-full border-0"
        title="Portfolio Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
