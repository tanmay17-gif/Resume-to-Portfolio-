import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const serviceUrl = process.env.EXTRACT_SERVICE_URL;
  if (serviceUrl) {
    // Fire and forget fetch to wake up the Render service.
    // We set a very short AbortController so this Vercel function 
    // doesn't hang waiting for Render to wake up.
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 2000); 
      await fetch(serviceUrl, { signal: controller.signal }).catch(() => {});
    } catch (e) {
      // ignore timeout
    }
  }
  return NextResponse.json({ status: "waking" });
}
