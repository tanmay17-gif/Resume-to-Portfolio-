export type SchemaData = {
  name: string;
  contact: {
    email: string;
    phone: string | null;
    links: { label: string; url: string }[];
  };
  summary?: string;
  education?: { degree: string; institution: string; year: string }[];
  experience?: { title: string; company: string; dates: string; bullets: string[] }[];
  projects?: { name: string; description: string; tech: string[]; link: string | null }[];
  skills?: string[];
  achievements?: string[];
  custom_sections?: { title: string; items: string[] }[];
};

export function validateSchemaData(data: unknown): { ok: boolean; error?: string } {
  if (typeof data !== "object" || data === null) return { ok: false, error: "Not an object" };
  const d = data as Record<string, unknown>;
  if (typeof d.name !== "string" || !d.name.trim()) return { ok: false, error: "name required" };
  if (typeof d.contact !== "object" || d.contact === null) return { ok: false, error: "contact required" };
  const c = d.contact as Record<string, unknown>;
  if (typeof c.email !== "string" || !c.email.includes("@")) return { ok: false, error: "contact.email invalid" };
  return { ok: true };
}

export const EMPTY_SCHEMA: SchemaData = {
  name: "",
  contact: { email: "", phone: null, links: [] },
};
