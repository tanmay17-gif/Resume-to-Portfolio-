import { geminiGenerate } from "./gemini";
import type { SchemaData } from "./schema";

export type CuratedData = SchemaData & {
  _curationMeta?: { truncated: Record<string, number> };
};

const CURATION_PROMPT = `You are a portfolio content curator. Given structured resume data JSON, rewrite it into concise, compelling portfolio copy.

Tasks:
1. Rewrite each experience/project bullet into shorter, punchier portfolio language — cut filler words, keep impact, avoid resume-formal phrasing. Each bullet max 16 words.
2. If summary is missing or generic, generate a 2-3 sentence "about me" narrative from role, focus area, standout skills — should read like a personal website intro, warm and confident, not a resume header.
3. Keep all facts truthful — do not invent jobs, dates, or tech not in input.
4. Return ONLY raw JSON matching the same shape as input, with rewritten bullets and improved summary. Omit empty optional keys.

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

export async function curateData(structured: SchemaData): Promise<{ status: "ok" | "error"; curated_data: SchemaData }> {
  try {
    const prompt = CURATION_PROMPT + JSON.stringify(structured, null, 2);
    const { text } = await geminiGenerate({ prompt, model: "gemini-3.6-flash" });
    const parsed = parseJson(text) as SchemaData;
    // Ensure required fields remain
    if (!parsed.name || !parsed.contact?.email) {
      return { status: "error", curated_data: structured };
    }
    
    // Merge curated data back with structured to guarantee no data loss of sections
    const merged: SchemaData = {
      ...structured,
      ...parsed,
      education: parsed.education && parsed.education.length ? parsed.education : structured.education,
      experience: parsed.experience && parsed.experience.length ? parsed.experience : structured.experience,
      projects: parsed.projects && parsed.projects.length ? parsed.projects : structured.projects,
      skills: parsed.skills && parsed.skills.length ? parsed.skills : structured.skills,
      achievements: parsed.achievements && parsed.achievements.length ? parsed.achievements : structured.achievements,
      custom_sections: parsed.custom_sections && parsed.custom_sections.length ? parsed.custom_sections : structured.custom_sections,
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
