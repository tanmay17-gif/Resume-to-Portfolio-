import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractViaService, extractViaPython } from "@/lib/extraction";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function saveTempFile(buffer: Buffer, filename: string): Promise<string> {
  const tmpDir = path.join(os.tmpdir(), "resume-uploads");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(tmpDir, `${Date.now()}_${safeName}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function POST(request: Request) {
  let user = null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  user = data.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const filename = file.name || "resume.pdf";
  const buffer = Buffer.from(await file.arrayBuffer());
  const tempPath = await saveTempFile(buffer, filename);

  try {
    let pyResult;
    if (process.env.EXTRACT_SERVICE_URL) {
      pyResult = await extractViaService(buffer, filename, 150);
    } else if (process.env.VERCEL === "1") {
      throw new Error("EXTRACT_SERVICE_URL is missing in Vercel Environment Variables! Cannot extract PDF.");
    } else {
      pyResult = await extractViaPython(tempPath, 150);
    }

    try { fs.unlinkSync(tempPath); } catch {}

    return NextResponse.json({
      status: "ok",
      pyResult,
      filename,
      mimetype: file.type
    });
  } catch (e) {
    try { fs.unlinkSync(tempPath); } catch {}
    console.error("parse route error", e);
    return NextResponse.json({ status: "error", error: String(e) }, { status: 500 });
  }
}
