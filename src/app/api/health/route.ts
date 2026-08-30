import { createServiceClient } from "@/lib/supabase/server";
import { geminiGenerate } from "@/lib/gemini";

export async function GET() {
  const results: Record<string, unknown> = { timestamp: new Date().toISOString() };

  // Supabase — use limit(1) not head:true (head hides PGRST205)
  try {
    const supabase = createServiceClient();
    const { error, data } = await supabase.from("resumes").select("*").limit(1);
    if (error) {
      const isMissing = error.code === "PGRST205";
      results.supabase = {
        ok: isMissing ? "auth_ok_table_missing" : false,
        error: error.message,
        code: error.code,
        hint: isMissing ? "Run supabase.sql in SQL Editor" : undefined,
      };
    } else {
      results.supabase = { ok: true, count: data?.length ?? 0 };
    }
  } catch (e) {
    results.supabase = { ok: false, error: String(e) };
  }

  // Gemini (test both keys via round-robin)
  try {
    const r = await geminiGenerate({ prompt: "reply with ok", model: "gemini-3.6-flash", retries: 0 });
    results.gemini = { ok: true, preview: r.text.slice(0, 50), model: r.used_model };
  } catch (e) {
    results.gemini = { ok: false, error: String(e) };
  }

  // PostHog config check (don't hit capture, just check env)
  results.posthog = {
    has_key: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    key_prefix: process.env.NEXT_PUBLIC_POSTHOG_KEY?.slice(0, 8),
  };

  const allOk = (results.supabase as { ok: boolean | string })?.ok && (results.gemini as { ok: boolean })?.ok;
  return Response.json({ status: allOk ? "ok" : "partial", ...results });
}
