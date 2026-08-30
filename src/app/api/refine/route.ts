import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { geminiGenerate } from "@/lib/gemini";
import type { SchemaData } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const portfolio_data_id = body.portfolio_data_id as string;
    const portfolio_id = body.portfolio_id as string;
    const request_text = body.request_text as string;

    if ((!portfolio_data_id && !portfolio_id) || !request_text) {
      return NextResponse.json({ error: "Missing portfolio_data_id/portfolio_id or request_text" }, { status: 400 });
    }

    const service = createServiceClient();
    let portfolioDataRow: any = null;

    if (portfolio_data_id) {
      const { data, error } = await service
        .from("portfolio_data")
        .select("id, schema_data, user_id")
        .eq("id", portfolio_data_id)
        .single();
      if (error || !data) {
        return NextResponse.json({ error: "portfolio_data not found" }, { status: 404 });
      }
      portfolioDataRow = data;
    } else if (portfolio_id) {
      const { data: port, error: portErr } = await service
        .from("portfolios")
        .select("portfolio_data_id")
        .eq("id", portfolio_id)
        .single();
      if (portErr || !port) {
        return NextResponse.json({ error: "portfolio not found" }, { status: 404 });
      }
      const { data, error } = await service
        .from("portfolio_data")
        .select("id, schema_data, user_id")
        .eq("id", port.portfolio_data_id)
        .single();
      if (error || !data) {
        return NextResponse.json({ error: "portfolio_data not found" }, { status: 404 });
      }
      portfolioDataRow = data;
    }

    // Verify ownership
    if (portfolioDataRow.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currentSchema = portfolioDataRow.schema_data as SchemaData;

    // Use Gemini to detect target section and generate the update
    const prompt = `You are a professional portfolio copy editor.
We have a portfolio schema for ${currentSchema.name || "a candidate"}.
The user has requested the following edit: "${request_text}"

Current full schema:
${JSON.stringify(currentSchema, null, 2)}

Your task:
1. Identify which top-level section key is targeted by the user request.
Possible keys: "name", "contact", "summary", "education", "experience", "projects", "skills", "achievements", "custom_sections".
2. Regenerate ONLY the updated value/object for that section key. If the edit touches multiple or is generic, default to updating the "summary" or the closest matching section.
3. Return ONLY a valid JSON object matching the following structure:
{
  "target_section": "section_key_here",
  "updated_data": <the new updated value/object for this section key matching its schema type>
}

Schema types:
- "name": string
- "contact": { "email": string, "phone": string | null, "links": [{ "label": "string", "url": "string" }] }
- "summary": string
- "education": Array of { "degree": "string", "institution": "string", "year": "string" }
- "experience": Array of { "title": "string", "company": "string", "dates": "string", "bullets": ["string"] }
- "projects": Array of { "name": "string", "description": "string", "tech": ["string"], "link": "string | null" }
- "skills": Array of strings
- "achievements": Array of strings
- "custom_sections": Array of { "title": "string", "items": ["string"] }

Do not include any prose, markdown block formatting, or conversational text. Return ONLY the JSON object.`;

    const geminiResponse = await geminiGenerate({ prompt, model: "gemini-3.6-flash" });
    const cleanText = geminiResponse.text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsed: { target_section: string; updated_data: any };
    try {
      parsed = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("Gemini output parsing failed:", cleanText);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const validKeys = ["name", "contact", "summary", "education", "experience", "projects", "skills", "achievements", "custom_sections"];
    if (!validKeys.includes(parsed.target_section)) {
      return NextResponse.json({ error: `Invalid target section: ${parsed.target_section}` }, { status: 400 });
    }

    // Merge the updated section into the existing schema
    const updatedSchema = {
      ...currentSchema,
      [parsed.target_section]: parsed.updated_data
    };

    // Save updated schema back to Supabase
    const { error: updateErr } = await service
      .from("portfolio_data")
      .update({ schema_data: updatedSchema, updated_at: new Date().toISOString() })
      .eq("id", portfolioDataRow.id);

    if (updateErr) {
      return NextResponse.json({ error: `Database update failed: ${updateErr.message}` }, { status: 500 });
    }

    // Log the change request in change_requests table if portfolio_id exists
    if (portfolio_id) {
      try {
        await service.from("change_requests").insert({
          portfolio_id,
          request_text,
          target_section: parsed.target_section,
          status: "applied"
        });
      } catch {}
    }

    return NextResponse.json({
      status: "ok",
      target_section: parsed.target_section,
      updated_data: parsed.updated_data,
      schema_data: updatedSchema
    });
  } catch (err) {
    console.error("Refine API error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
