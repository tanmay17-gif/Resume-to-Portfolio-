import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stylePresets, type StylePresetKey } from "@/lib/stylePresets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "portfolio";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const portfolio_data_id = body.portfolio_data_id as string;
  const style_preset = body.style_preset as StylePresetKey;
  const recaptcha_token = body.recaptcha_token as string;

  if (!portfolio_data_id || !style_preset || !(style_preset in stylePresets)) {
    return NextResponse.json({ error: "Invalid portfolio_data_id or style_preset" }, { status: 400 });
  }

  // Verify reCAPTCHA token only if configured
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (secretKey) {
    if (!recaptcha_token) {
      return NextResponse.json({ error: "Missing reCAPTCHA token" }, { status: 400 });
    }
    const recaptchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${recaptcha_token}`,
    });
    const recaptchaJson = await recaptchaRes.json();
    if (!recaptchaJson.success || recaptchaJson.score < 0.5) {
      return NextResponse.json({ error: "reCAPTCHA verification failed, score too low" }, { status: 403 });
    }
  }

  const service = createServiceClient();

  // Verify ownership of portfolio_data
  const { data: pd, error: pdErr } = await service.from("portfolio_data").select("id, schema_data, user_id").eq("id", portfolio_data_id).single();
  if (pdErr || !pd) return NextResponse.json({ error: "portfolio_data not found" }, { status: 404 });
  if (pd.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const name = (pd.schema_data as { name?: string })?.name ?? "portfolio";
  let slug = slugify(name);
  // ensure uniqueness: retry if conflict
  for (let i = 0; i < 3; i++) {
    const { data: existing } = await service.from("portfolios").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = slugify(name + "-" + Math.random().toString(36).slice(2, 4));
  }

  const { data, error } = await service
    .from("portfolios")
    .insert({
      portfolio_data_id,
      user_id: user.id,
      slug,
      style_preset,
      published: true,
      published_at: new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ status: "ok", portfolio_html_or_component: "rendered via PortfolioRenderer", slug: data.slug, id: data.id });
}
