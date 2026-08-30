import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { geminiGenerate } from "./gemini";
import type { SchemaData } from "./schema";

export type ExtractionResult = {
  status: "ok" | "error";
  data: Partial<SchemaData>;
  confidence: number;
  used_vision_fallback: boolean;
};

const EXTRACTION_PROMPT = `You are a resume parser. Extract the resume content into JSON matching this exact shape:
{
  "name": "string",
  "contact": { "email": "string", "phone": "string | null", "links": [{ "label": "string", "url": "string" }] },
  "summary": "string | null",
  "education": [{ "degree": "string", "institution": "string", "year": "string" }],
  "experience": [{ "title": "string", "company": "string", "dates": "string", "bullets": ["string"] }],
  "projects": [{ "name": "string", "description": "string", "tech": ["string"], "link": "string | null" }],
  "skills": ["string"],
  "achievements": ["string"],
  "custom_sections": [{ "title": "string", "items": ["string"] }]
}
Rules:
- Only include keys that have data. Omit optional keys if empty (don't return null/[] for missing).
- Only "name" and "contact" are required.
- If a field not found, omit it entirely.
- Return ONLY raw JSON, no markdown, no explanation, no code fences.
- For links, extract LinkedIn, GitHub, portfolio URLs if present.

Resume text:
"""`;

const VISION_PROMPT = `You are a resume parser with vision. Analyze this resume image and extract structured JSON matching this exact shape:
{
  "name": "string",
  "contact": { "email": "string", "phone": "string | null", "links": [{ "label": "string", "url": "string" }] },
  "summary": "string | null",
  "education": [{ "degree": "string", "institution": "string", "year": "string" }],
  "experience": [{ "title": "string", "company": "string", "dates": "string", "bullets": ["string"] }],
  "projects": [{ "name": "string", "description": "string", "tech": ["string"], "link": "string | null" }],
  "skills": ["string"],
  "achievements": ["string"],
  "custom_sections": [{ "title": "string", "items": ["string"] }]
}
Rules:
- Only include keys that have data. Omit optional keys if empty.
- Return ONLY raw JSON, no markdown, no explanation.
Analyze the image and extract all visible information accurately.`;

function parseJsonFromText(text: string): unknown {
  // try direct parse
  try {
    return JSON.parse(text);
  } catch {}
  // try extract from markdown fence
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {}
  }
  // try first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }
  throw new Error("Failed to parse JSON from Gemini response: " + text.slice(0, 400));
}

export async function extractWithGeminiText(text: string): Promise<Partial<SchemaData>> {
  const prompt = EXTRACTION_PROMPT + text + '\n"""';
  const { text: res } = await geminiGenerate({ prompt, model: "gemini-3.6-flash" });
  return parseJsonFromText(res) as Partial<SchemaData>;
}

export async function extractWithGeminiVision(imageBase64: string): Promise<Partial<SchemaData>> {
  const { text: res } = await geminiGenerate({
    prompt: VISION_PROMPT,
    imageBase64,
    model: "gemini-3.6-flash",
  });
  return parseJsonFromText(res) as Partial<SchemaData>;
}

// Run Python PyMuPDF extraction
export function extractViaPython(filePath: string, dpi = 150): Promise<{
  text: string;
  confidence: number;
  is_complex: boolean;
  image_base64: string | null;
  pages: number;
}> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", "extract.py");
    const py = spawn("python", [scriptPath, filePath, String(dpi)], { shell: false });
    let stdout = "";
    let stderr = "";
    py.stdout.on("data", (d) => (stdout += d.toString()));
    py.stderr.on("data", (d) => (stderr += d.toString()));
    py.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python extract failed (${code}): ${stderr || stdout}`));
        return;
      }
      try {
        const json = JSON.parse(stdout);
        if (json.error) reject(new Error(json.error));
        else resolve(json);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${stdout.slice(0, 500)}`));
      }
    });
    py.on("error", (err) => reject(err));
  });
}

// DOCX via mammoth
export async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Orchestrator: single point making retry/skip/proceed decisions
export async function orchestrateExtraction(opts: {
  filePath: string;
  fileBuffer: Buffer;
  filename: string;
  mimetype: string;
}): Promise<ExtractionResult> {
  const { filePath, fileBuffer, filename, mimetype } = opts;
  const isPdf = filename.toLowerCase().endsWith(".pdf") || mimetype === "application/pdf";

  try {
    if (!isPdf) {
      // DOC/DOCX path — simple text extraction, no vision
      const text = await extractDocx(fileBuffer);
      if (!text.trim()) {
        return { status: "error", data: {}, confidence: 0, used_vision_fallback: false };
      }
      const data = await extractWithGeminiText(text);
      return { status: "ok", data, confidence: 0.75, used_vision_fallback: false };
    }

    // PDF path — PyMuPDF + complexity detection
    let pyResult = await extractViaPython(filePath, 150);
    let confidence = pyResult.confidence;
    let isComplex = pyResult.is_complex;
    let usedVision = false;
    let data: Partial<SchemaData>;

    // If text very short but image exists, force vision
    const textLen = pyResult.text.trim().length;

    if (isComplex || confidence < 0.5 || textLen < 400) {
      // Try vision fallback
      if (pyResult.image_base64) {
        try {
          data = await extractWithGeminiVision(pyResult.image_base64);
          usedVision = true;
          confidence = 0.85; // vision confidence higher
        } catch (visionErr) {
          // retry at higher DPI once per spec
          try {
            const retry = await extractViaPython(filePath, 200);
            if (retry.image_base64) {
              data = await extractWithGeminiVision(retry.image_base64);
              usedVision = true;
              confidence = 0.82;
            } else {
              throw visionErr;
            }
          } catch {
            // fallback to text extraction via Gemini
            if (pyResult.text.trim().length > 50) {
              data = await extractWithGeminiText(pyResult.text);
              usedVision = false;
            } else {
              throw visionErr;
            }
          }
        }
      } else {
        // no image, fallback to text
        data = await extractWithGeminiText(pyResult.text);
      }
    } else {
      // simple layout — use text directly
      data = await extractWithGeminiText(pyResult.text);
    }

    // Validate at least name/contact present, otherwise treat as low confidence
    if (!data.name || !(data.contact as any)?.email) {
      // try vision retry if not already used
      if (!usedVision && pyResult.image_base64) {
        try {
          const visionData = await extractWithGeminiVision(pyResult.image_base64);
          if (visionData.name) {
            data = visionData;
            usedVision = true;
            confidence = 0.8;
          }
        } catch {}
      }
    }

    return { status: "ok", data, confidence, used_vision_fallback: usedVision };
  } catch (e) {
    console.error("orchestrateExtraction error", e);
    return { status: "error", data: {}, confidence: 0, used_vision_fallback: false };
  }
}

// Structuring step — normalize raw extraction to full schema (one job only)
export function structureData(raw: Partial<SchemaData>): { status: "ok" | "error"; structured_data: SchemaData } {
  try {
    const structured: SchemaData = {
      name: String(raw.name || "").trim(),
      contact: {
        email: String(raw.contact?.email || "").trim(),
        phone: raw.contact?.phone ? String(raw.contact.phone).trim() : null,
        links: Array.isArray(raw.contact?.links) ? raw.contact.links.filter((l) => l.url) : [],
      },
    };
    if (raw.summary && String(raw.summary).trim()) structured.summary = String(raw.summary).trim();
    
    // Robust normalization for education
    if (raw.education) {
      const eduArray = Array.isArray(raw.education) ? raw.education : [raw.education];
      structured.education = eduArray
        .map((ed: any) => ({
          degree: String(ed?.degree || ed?.title || ed?.course || "").trim(),
          institution: String(ed?.institution || ed?.school || ed?.university || "").trim(),
          year: String(ed?.year || ed?.date || ed?.dates || "").trim(),
        }))
        .filter((ed) => ed.degree || ed.institution);
    }
    
    if (Array.isArray(raw.experience) && raw.experience.length) structured.experience = raw.experience;
    if (Array.isArray(raw.projects) && raw.projects.length) structured.projects = raw.projects;
    if (Array.isArray(raw.skills) && raw.skills.length) structured.skills = raw.skills;
    if (Array.isArray(raw.achievements) && raw.achievements.length) structured.achievements = raw.achievements;
    if (Array.isArray(raw.custom_sections) && raw.custom_sections.length) structured.custom_sections = raw.custom_sections;

    if (!structured.name || !structured.contact.email) {
      return { status: "error", structured_data: structured };
    }
    return { status: "ok", structured_data: structured };
  } catch {
    return { status: "error", structured_data: raw as SchemaData };
  }
}
