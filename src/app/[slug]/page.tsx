import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import type { StylePresetKey } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import type { Metadata } from "next";
import { PortfolioPublicPage } from "./portfolio-public-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fetch portfolio data server-side (no auth required - public read via RLS)
async function getPortfolio(slug: string) {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("portfolios")
      .select(`
        id,
        slug,
        style_preset,
        published,
        portfolio_data (
          schema_data
        )
      `)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !data) return null;

    const schemaData = (data.portfolio_data as any)?.schema_data as SchemaData | null;
    if (!schemaData) return null;

    return {
      style: data.style_preset as StylePresetKey,
      data: schemaData,
    };
  } catch {
    return null;
  }
}

// Generate SEO metadata from portfolio data
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getPortfolio(slug);

  if (!portfolio) {
    return {
      title: "Portfolio Not Found",
      description: "This portfolio does not exist or is not public.",
    };
  }

  const name = portfolio.data.name ?? "Portfolio";
  const role = portfolio.data.experience?.[0]?.title;
  const summary = portfolio.data.summary;

  const title = role ? `${name} — ${role}` : `${name}'s Portfolio`;
  const description =
    summary?.slice(0, 160) ??
    `${name}'s personal portfolio — built with Resume to Portfolio.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolio = await getPortfolio(slug);

  if (!portfolio) {
    notFound();
  }

  return <PortfolioPublicPage data={portfolio.data} presetKey={portfolio.style} slug={slug} />;
}
