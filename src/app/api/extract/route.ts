import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { orchestrateExtraction, structureData } from "@/lib/extraction";
import { curateData } from "@/lib/curation";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper to save buffer to temp file for Python
async function saveTempFile(buffer: Buffer, filename: string): Promise<string> {
  const tmpDir = path.join(os.tmpdir(), "resume-uploads");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(tmpDir, `${Date.now()}_${safeName}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function POST(request: Request) {
  // Auth check — supports both cookie (browser) and Bearer token (API/test)
  let user: { id: string; email?: string } | null = null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  user = data.user;
  if (!user) {
    const auth = request.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      // create a temp client with token
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      const tmp = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: tokenData } = await tmp.auth.getUser(token);
      user = tokenData.user;
    }
  }
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const filename = file.name || "resume.pdf";
  const isPdf = filename.toLowerCase().endsWith(".pdf");
  const isDoc = filename.toLowerCase().endsWith(".doc") || filename.toLowerCase().endsWith(".docx");
  if (!isPdf && !isDoc && !allowed.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type} ${filename}` }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const tempPath = await saveTempFile(buffer, filename);

  try {
    // Orchestrator makes retry/skip/proceed decisions; workers do one job only
    const extraction = await orchestrateExtraction({
      filePath: tempPath,
      fileBuffer: buffer,
      filename,
      mimetype: file.type,
    });

    const structuring = structureData(extraction.data);

    // Content curation step: rewrite/condense portfolio copy (distinct agent responsibility)
    let curation: { status: "ok" | "error"; curated_data: typeof structuring.structured_data } = {
      status: "ok",
      curated_data: structuring.structured_data,
    };
    if (structuring.status === "ok") {
      curation = await curateData(structuring.structured_data);
    }
    const finalData = curation.status === "ok" ? curation.curated_data : structuring.structured_data;

    // Persist to Supabase per api-data-contract.md
    const service = createServiceClient();
    let resume_id: string | null = null;
    let portfolio_data_id: string | null = null;

    if (extraction.status === "ok" && structuring.status === "ok") {
      // Upload to storage (optional, best-effort)
      try {
        const storagePath = `${user.id}/${Date.now()}_${filename}`;
        await service.storage.from("resumes").upload(storagePath, buffer, {
          contentType: file.type || (isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
          upsert: false,
        });
      } catch {}

      const { data: resumeRow, error: resumeErr } = await service
        .from("resumes")
        .insert({
          user_id: user.id,
          original_filename: filename,
          raw_extraction_status: "ok",
          raw_extraction_confidence: extraction.confidence,
        })
        .select("id")
        .single();

      if (resumeErr) throw new Error(`resumes insert failed: ${resumeErr.message}`);
      resume_id = resumeRow.id;

      const { data: pdRow, error: pdErr } = await service
        .from("portfolio_data")
        .insert({
          resume_id,
          user_id: user.id,
          schema_data: finalData,
        })
        .select("id")
        .single();

      if (pdErr) throw new Error(`portfolio_data insert failed: ${pdErr.message}`);
      portfolio_data_id = pdRow.id;
    } else if (extraction.status === "error") {
      // still log resume as error
      try {
        const { data: resumeRow } = await service
          .from("resumes")
          .insert({
            user_id: user.id,
            original_filename: filename,
            raw_extraction_status: "error",
            raw_extraction_confidence: 0,
          })
          .select("id")
          .single();
        resume_id = resumeRow?.id ?? null;
      } catch {}
    }

    // Clean up temp
    try {
      fs.unlinkSync(tempPath);
    } catch {}

    return NextResponse.json({
      status: extraction.status,
      data: extraction.data,
      structured_data: structuring.structured_data,
      curated_data: curation.curated_data,
      curation_status: curation.status,
      confidence: extraction.confidence,
      used_vision_fallback: extraction.used_vision_fallback,
      resume_id,
      portfolio_data_id,
      structuring_status: structuring.status,
    });
  } catch (e) {
    try {
      fs.unlinkSync(tempPath);
    } catch {}
    console.error("extract route error", e);
    return NextResponse.json({ status: "error", error: String(e), data: {}, confidence: 0, used_vision_fallback: false }, { status: 500 });
  }
}
