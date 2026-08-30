"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { stylePresets } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import { ExperienceEntry, TechPill, SkillsSection, ContactRow } from "@/components/portfolio-primitives";
import { GenerativeProjectVisual } from "@/components/project-visual";
import { MinimalHero, MinimalProjectVisual } from "@/components/threeui-adapter";
import { ExternalLink } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";

const p = "minimal";

export function MinimalLayout({ data }: { data: SchemaData }) {
  const preset = stylePresets[p];
  const [expandedExp, setExpandedExp] = useState<Record<number, boolean>>({});
  const role = data.experience?.[0]?.title ?? "";

  const has = (v: unknown) => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    return !!v;
  };

  const navSections = [
    { id: "section-about", label: "About" },
    ...(has(data.projects) ? [{ id: "section-work", label: "Work" }] : []),
    ...(has(data.experience) ? [{ id: "section-experience", label: "Exp" }] : []),
    ...(has(data.skills) ? [{ id: "section-capabilities", label: "Skills" }] : []),
  ];

  const { activeId, scrollTo } = useActiveSection(navSections);

  return (
    <div className="min-h-screen" style={{ fontFamily: preset.typography.fontFamily, background: preset.palette.bg }}>
      <div className="flex min-h-screen">
        {/* Sticky sidebar - This is the ONLY navigation for Minimal */}
        {navSections.length > 1 && (
          <aside className="hidden lg:flex flex-col w-16 xl:w-20 shrink-0 sticky top-0 h-screen border-r items-center py-12 gap-8 z-50"
            style={{ borderColor: preset.palette.border, background: preset.palette.bg }}>
            {navSections.map((s, i) => (
              <button key={i} onClick={() => scrollTo(s.id)}
                className="text-[10px] uppercase tracking-widest transition-opacity font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ 
                  writingMode: "vertical-lr",
                  color: preset.palette.text,
                  opacity: activeId === s.id ? 1 : 0.3,
                  transform: activeId === s.id ? "scale(1.05)" : "scale(1)",
                  textOrientation: "mixed",
                }}>
                {s.label}
              </button>
            ))}
          </aside>
        )}

        <main className="flex-1 max-w-4xl mx-auto px-6 lg:px-12 pb-32">
          {/* Hero */}
          <div id="section-about" className="relative py-20 lg:py-32 overflow-hidden">
            <MinimalHero className="z-0" />
            <motion.div 
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-semibold tracking-tighter leading-[1.02]"
                style={{ color: preset.palette.text }}>{data.name}.</h1>
              {role && (
                <p className="mt-6 text-xl" style={{ color: preset.palette.muted }}>{role}</p>
              )}
              {data.summary && (
                <p className="mt-6 text-base leading-relaxed max-w-xl" style={{ color: preset.palette.text, opacity: 0.7 }}>{data.summary}</p>
              )}
              <ContactRow data={data} presetKey={p} className="mt-10" />
            </motion.div>
          </div>

          {/* Divider */}
          <div className="border-t mb-16" style={{ borderColor: preset.palette.border }} />

          {/* Projects — editorial filmstrip */}
          {has(data.projects) && (
            <section id="section-work" className="mb-16">
              <div className="flex items-baseline gap-6 mb-8">
                <h2 className="text-xs uppercase tracking-widest font-semibold" style={{ color: preset.palette.muted }}>Work</h2>
                <div className="flex-1 border-t" style={{ borderColor: preset.palette.border }} />
              </div>
              <div className="space-y-0">
                {data.projects!.map((proj, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 15 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                    className="group flex gap-6 py-6 border-b" 
                    style={{ borderColor: preset.palette.border }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 h-20 shrink-0 overflow-hidden rounded-lg">
                      <GenerativeProjectVisual seed={proj.name} presetKey={p} />
                      <MinimalProjectVisual className="z-[1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-base line-clamp-1" style={{ color: preset.palette.text }}>{proj.name}</h3>
                        {proj.link && (
                          <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank"
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2">
                            <ExternalLink className="size-4" style={{ color: preset.palette.accent }} />
                          </a>
                        )}
                      </div>
                      <p className="text-sm mt-1.5 line-clamp-2" style={{ color: preset.palette.muted }}>{proj.description}</p>
                      {proj.tech && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {proj.tech.slice(0, 5).map((t, ti) => <TechPill key={ti} tech={t} presetKey={p} />)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-mono shrink-0 pt-1" style={{ color: preset.palette.muted }}>{String(i + 1).padStart(2, "0")}</div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {has(data.experience) && (
            <section id="section-experience" className="mb-16">
              <div className="flex items-baseline gap-6 mb-8">
                <h2 className="text-xs uppercase tracking-widest font-semibold" style={{ color: preset.palette.muted }}>Experience</h2>
                <div className="flex-1 border-t" style={{ borderColor: preset.palette.border }} />
              </div>
              <div className="space-y-8">
                {data.experience!.map((exp, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 15 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                  >
                    <ExperienceEntry exp={exp} i={i} presetKey={p} expandedExp={expandedExp} setExpandedExp={setExpandedExp} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Skills + Education */}
          <div id="section-capabilities" className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {has(data.skills) && (
              <section>
                <div className="flex items-baseline gap-6 mb-6">
                  <h2 className="text-xs uppercase tracking-widest font-semibold" style={{ color: preset.palette.muted }}>Skills</h2>
                  <div className="flex-1 border-t" style={{ borderColor: preset.palette.border }} />
                </div>
                <SkillsSection skills={data.skills!} presetKey={p} />
              </section>
            )}
            {has(data.education) && (
              <section>
                <div className="flex items-baseline gap-6 mb-6">
                  <h2 className="text-xs uppercase tracking-widest font-semibold" style={{ color: preset.palette.muted }}>Education</h2>
                  <div className="flex-1 border-t" style={{ borderColor: preset.palette.border }} />
                </div>
                <div className="space-y-5">
                  {data.education!.map((ed, i) => (
                    <div key={i}>
                      <div className="font-semibold text-sm" style={{ color: preset.palette.text }}>{ed.degree}</div>
                      <div className="text-sm mt-0.5" style={{ color: preset.palette.muted }}>{ed.institution} · {ed.year}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="text-xs" style={{ color: preset.palette.muted, opacity: 0.35 }}>
            {data.name} — generated via Resume to Portfolio
          </div>
        </main>
      </div>
    </div>
  );
}
