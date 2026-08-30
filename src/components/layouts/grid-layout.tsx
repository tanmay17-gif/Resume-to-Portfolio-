"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { stylePresets } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import { GenerativeProjectVisual } from "@/components/project-visual";
import { ExperienceEntry, TechPill, SkillsSection, ContactRow } from "@/components/portfolio-primitives";
import { GridHero, GridProjectVisual, GridSkillsBg } from "@/components/threeui-adapter";
import { ExternalLink } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";

const p = "grid";

export function GridLayout({ data }: { data: SchemaData }) {
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
    ...(has(data.skills) || has(data.education) ? [{ id: "section-capabilities", label: "Capabilities" }] : []),
  ];

  const { activeId, scrollTo } = useActiveSection(navSections);

  return (
    <div className="min-h-screen relative" style={{ fontFamily: preset.typography.fontFamily, background: preset.palette.bg }}>
      
      {/* Sticky Grid Navigation */}
      <div className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl border-b flex items-center justify-center sm:justify-start gap-4 sm:gap-8" 
           style={{ background: "rgba(15, 23, 42, 0.7)", borderColor: "rgba(255,255,255,0.05)" }}>
        {navSections.map((s) => (
          <button 
            key={s.id} 
            onClick={() => scrollTo(s.id)}
            className="text-xs font-semibold uppercase tracking-widest outline-none transition-colors"
            style={{ color: activeId === s.id ? preset.palette.accent : preset.palette.muted }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 pb-32">
        {/* Hero Module — full width, tall, NebulaBackground */}
        <motion.div
          id="section-about"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl mb-4 min-h-[280px] sm:min-h-[340px] flex flex-col justify-end p-6 sm:p-10 lg:p-12 scroll-mt-20"
          style={{ background: "#0f172a" }}
        >
          <GridHero className="z-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-[1]" />
          <div className="relative z-10">
            {role && <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: preset.palette.accent }}>{role}</div>}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-none break-words">
              {data.name}
            </h1>
            {data.summary && <p className="mt-4 text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">{data.summary}</p>}
            <ContactRow data={data} presetKey={p} className="mt-6" />
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 auto-rows-auto gap-4">

          {/* Projects */}
          {has(data.projects) && (
            <section id="section-work" className="lg:col-span-12 scroll-mt-20">
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: preset.palette.muted }}>Projects</h2>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Featured project */}
                {data.projects![0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative overflow-hidden rounded-2xl flex flex-col ${data.projects!.length > 1 ? "lg:col-span-7" : "lg:col-span-12"}`}
                    style={{ background: preset.palette.card, border: preset.border, boxShadow: preset.shadow }}
                  >
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      <GenerativeProjectVisual seed={data.projects![0].name} presetKey={p} />
                      <GridProjectVisual seed={data.projects![0].name} className="z-[1]" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-[2]" />
                      <div className="absolute top-3 left-3 z-[3] text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                        style={{ background: "rgba(0,0,0,0.5)", color: "#fff", backdropFilter: "blur(8px)" }}>01</div>
                      {data.projects![0].link && (
                        <a href={data.projects![0].link!.startsWith("http") ? data.projects![0].link! : `https://${data.projects![0].link}`}
                          target="_blank" className="absolute top-3 right-3 z-[3] size-8 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
                          <ExternalLink className="size-4 text-white" />
                        </a>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-center">
                      <h3 className="font-bold text-lg line-clamp-1" style={{ color: preset.palette.text }}>{data.projects![0].name}</h3>
                      <p className="mt-2 text-sm leading-relaxed line-clamp-3" style={{ color: preset.palette.muted }}>{data.projects![0].description}</p>
                      {data.projects![0].tech && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {data.projects![0].tech.slice(0, 5).map((t, ti) => <TechPill key={ti} tech={t} presetKey={p} />)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Side column — 1 to 2 smaller projects */}
                {data.projects!.length > 1 && (
                  <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {data.projects!.slice(1, 3).map((proj, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className="relative overflow-hidden rounded-2xl flex flex-col"
                        style={{ background: preset.palette.card, border: preset.border, boxShadow: preset.shadow }}
                      >
                        <div className="relative h-32 lg:h-28 overflow-hidden">
                          <GenerativeProjectVisual seed={proj.name} presetKey={p} />
                          <div className="absolute top-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>{String(i + 2).padStart(2, "0")}</div>
                          {proj.link && (
                            <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank"
                              className="absolute top-2 right-2 p-1 bg-black/40 rounded backdrop-blur-sm" style={{ color: preset.palette.accent }}>
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1 justify-center">
                          <div className="font-bold text-sm line-clamp-1" style={{ color: preset.palette.text }}>{proj.name}</div>
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: preset.palette.muted }}>{proj.description}</p>
                          {proj.tech && <div className="mt-2 flex flex-wrap gap-1">{proj.tech.slice(0, 3).map((t, ti) => <TechPill key={ti} tech={t} presetKey={p} />)}</div>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* More projects strip */}
                {data.projects!.length > 3 && (
                  <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.projects!.slice(3).map((proj, i) => (
                      <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl overflow-hidden flex"
                        style={{ background: preset.palette.card, border: preset.border }}>
                        <div className="relative w-24 shrink-0 overflow-hidden">
                          <GenerativeProjectVisual seed={proj.name} presetKey={p} />
                        </div>
                        <div className="p-3 flex items-center min-w-0">
                          <div className="font-semibold text-xs truncate" style={{ color: preset.palette.text }}>{proj.name}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Experience */}
          {has(data.experience) && (
            <motion.section
              id="section-experience"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`scroll-mt-20 ${ (has(data.education) || has(data.skills)) ? "lg:col-span-7" : "lg:col-span-12" } p-6 sm:p-8 rounded-2xl`}
              style={{ background: preset.palette.card, border: preset.border, boxShadow: preset.shadow }}
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: preset.palette.muted }}>Experience</h2>
              <div className="space-y-8">
                {data.experience!.map((exp, i) => (
                  <ExperienceEntry key={i} exp={exp} i={i} presetKey={p} expandedExp={expandedExp} setExpandedExp={setExpandedExp} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Capabilities */}
          <div id="section-capabilities" className={`flex flex-col gap-4 scroll-mt-20 ${has(data.experience) ? "lg:col-span-5" : "lg:col-span-12"}`}>
            {has(data.skills) && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden p-6 sm:p-8 rounded-2xl flex-1"
                style={{ background: preset.palette.card, border: preset.border, boxShadow: preset.shadow }}
              >
                <GridSkillsBg className="z-0" />
                <div className="relative z-10">
                  <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: preset.palette.muted }}>Skills</h2>
                  <SkillsSection skills={data.skills!} presetKey={p} />
                </div>
              </motion.section>
            )}
            
            <div className={`grid grid-cols-1 ${(!has(data.experience) && has(data.skills)) ? "sm:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"} gap-4`}>
              {has(data.education) && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl"
                  style={{ background: preset.palette.card, border: preset.border, boxShadow: preset.shadow }}
                >
                  <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: preset.palette.muted }}>Education</h2>
                  {data.education!.map((ed, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="font-semibold text-sm line-clamp-1" style={{ color: preset.palette.text }}>{ed.degree}</div>
                      <div className="text-xs mt-1 flex justify-between gap-2" style={{ color: preset.palette.muted }}>
                        <span className="truncate">{ed.institution}</span>
                        <span className="shrink-0 font-medium" style={{ color: preset.palette.accent }}>{ed.year}</span>
                      </div>
                    </div>
                  ))}
                </motion.section>
              )}
              {has(data.achievements) && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl"
                  style={{ background: preset.palette.card, border: preset.border, boxShadow: preset.shadow }}
                >
                  <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: preset.palette.muted }}>Achievements</h2>
                  <div className="space-y-2">
                    {data.achievements!.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm line-clamp-2" style={{ color: preset.palette.text }}>
                        <span className="shrink-0 mt-0.5" style={{ color: preset.palette.accent }}>✦</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
