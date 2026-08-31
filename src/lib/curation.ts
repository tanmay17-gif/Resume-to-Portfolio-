import { geminiGenerate } from "./gemini";
import type { SchemaData } from "./schema";

export type CuratedData = SchemaData & {
  _curationMeta?: { truncated: Record<string, number> };
};

// Curate only the parts worth rewriting — summary + bullets
// This keeps the prompt small and fast instead of sending the entire JSON
const CURATION_PROMPT = `You are a portfolio content curator. Given structured resume data JSON, do two things:
1. If summary is missing or generic (reads like a resume objective), generate a 2-3 sentence first-person "about me" narrative — warm, confident, personal-website tone. Keep it under 60 words.
2. Rewrite each experience/project bullet into shorter, punchier portfolio copy — max 15 words each, cut filler, keep impact verbs and numbers.
3. Keep all facts truthful — do not invent anything.
4. Return ONLY raw JSON matching the same shape as input. Omit empty optional keys.

Input JSON:
`;

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) try { return JSON.parse(fence[1]); } catch {}
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s !== -1 && e !== -1) try { return JSON.parse(text.slice(s, e + 1)); } catch {}
  throw new Error("Failed to parse curated JSON: " + text.slice(0, 400));
}

// Checks whether curation would actually improve anything
function needsCuration(data: SchemaData): boolean {
  const hasBullets = data.experience?.some(e => e.bullets?.length > 0) ||
    data.projects?.some(p => p.description?.length > 0);
  const hasSummary = !!data.summary;
  return hasBullets || !hasSummary;
}

// Build a minimal payload — only fields curation can improve
function buildCurationPayload(data: SchemaData): Partial<SchemaData> {
  return {
    name: data.name,
    contact: data.contact,
    ...(data.summary ? { summary: data.summary } : {}),
    ...(data.experience?.length ? {
      experience: data.experience.map(e => ({
        title: e.title, company: e.company, dates: e.dates,
        bullets: e.bullets.slice(0, 5) // cap bullets to reduce tokens
      }))
    } : {}),
    ...(data.projects?.length ? {
      projects: data.projects.map(p => ({
        name: p.name, description: p.description, tech: p.tech, link: p.link
      }))
    } : {}),
  };
}

export async function curateData(structured: SchemaData): Promise<{ status: "ok" | "error"; curated_data: SchemaData }> {
  try {
    // Skip curation if nothing to improve — saves one full LLM round-trip
    if (!needsCuration(structured)) {
      return { status: "ok", curated_data: structured };
    }

    // Only send curation-relevant fields, not the entire schema
    const payload = buildCurationPayload(structured);
    const prompt = CURATION_PROMPT + JSON.stringify(payload, null, 0); // compact JSON
    const { text } = await geminiGenerate({ prompt, model: "gemini-3.6-flash" });
    const parsed = parseJson(text) as Partial<SchemaData>;

    if (!parsed.name) {
      return { status: "error", curated_data: structured };
    }

    // Deep merge: curated fields override structured, everything else preserved exactly
    const merged: SchemaData = {
      ...structured,
      // Only override summary and content that curation touched
      ...(parsed.summary ? { summary: parsed.summary } : {}),
      experience: (parsed.experience?.length ? parsed.experience : null)?.map((ce, i) => ({
        ...(structured.experience?.[i] ?? ce),
        bullets: ce.bullets?.length ? ce.bullets : structured.experience?.[i]?.bullets ?? [],
      })) ?? structured.experience,
      projects: (parsed.projects?.length ? parsed.projects : null)?.map((cp, i) => ({
        ...(structured.projects?.[i] ?? cp),
        description: cp.description || structured.projects?.[i]?.description || "",
      })) ?? structured.projects,
    };

    return { status: "ok", curated_data: merged };
  } catch (e) {
    console.error("curation failed, falling back to original", e);
    return { status: "error", curated_data: structured };
  }
}

// Helper for UI truncation — not part of pipeline, just render logic
export function getVisibleBullets(bullets: string[], expanded: boolean, cap = 3) {
  if (expanded) return bullets;
  return bullets.slice(0, cap);
}
