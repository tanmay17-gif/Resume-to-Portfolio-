import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { extractWithGeminiText, extractWithGeminiVision, structureData } from "@/lib/extraction";
import { curateData } from "@/lib/curation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let user = null;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { pyResult, filename, mimetype } = body;

  try {
    let data;
    let confidence = pyResult.confidence;
    let usedVision = false;
    const textLen = pyResult.text?.trim().length || 0;
    const shouldUseVision = pyResult.is_complex || pyResult.confidence < 0.5 || textLen < 400;

    if (shouldUseVision && pyResult.image_base64) {
      try {
        data = await extractWithGeminiVision(pyResult.image_base64);
        usedVision = true;
        confidence = 0.85;
      } catch {
        if (textLen > 50) {
          data = await extractWithGeminiText(pyResult.text);
          confidence = 0.6;
        } else {
          throw new Error("Failed to extract data from PDF (Vision and Text both failed).");
        }
      }
    } else {
      data = await extractWithGeminiText(pyResult.text);
    }

    const structuring = structureData(data);
    let curation = { status: "ok", curated_data: structuring.structured_data };
    
    if (structuring.status === "ok") {
      curation = await curateData(structuring.structured_data) as any;
    }
    const finalData = curation.status === "ok" ? curation.curated_data : structuring.structured_data;

    // Persist to Supabase
    const service = createServiceClient();
    
    const { data: resumeRow, error: resumeErr } = await service
      .from("resumes")
      .insert({
        user_id: user.id,
        original_filename: filename,
        raw_extraction_status: "ok",
        raw_extraction_confidence: confidence,
      })
      .select("id")
      .single();

    if (resumeErr) throw new Error(`resumes insert failed: ${resumeErr.message}`);
    const resume_id = resumeRow.id;

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

    return NextResponse.json({
      status: "ok",
      data,
      structured_data: structuring.structured_data,
      curated_data: curation.curated_data,
      curation_status: curation.status,
      confidence,
      used_vision_fallback: usedVision,
      resume_id,
      portfolio_data_id: pdRow.id,
      structuring_status: structuring.status,
    });
  } catch (e) {
    console.error("structure route error", e);
    return NextResponse.json({ status: "error", error: String(e) }, { status: 500 });
  }
}
