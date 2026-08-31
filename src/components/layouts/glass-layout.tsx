"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { stylePresets } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import { GenerativeProjectVisual } from "@/components/project-visual";
import { ExperienceEntry, TechPill, SkillsSection, ContactRow , CustomSections } from "@/components/portfolio-primitives";
import { GlassHero, GlassProjectVisual, GlassSkillsBg } from "@/components/threeui-adapter";
import { ExternalLink } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";

const p = "glass";

export function GlassLayout({ data }: { data: SchemaData }) {
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
    ...(has(data.experience) ? [{ id: "section-experience", label: "Experience" }] : []),
    ...(has(data.skills) || has(data.education) || has(data.achievements) ? [{ id: "section-capabilities", label: "Capabilities" }] : []),
    ...(has(data.custom_sections) ? [{ id: "section-custom", label: "More" }] : []),
  ];

  const { activeId, scrollTo } = useActiveSection(navSections);

  return (
    <div
      className="min-h-screen relative"
      style={{
        fontFamily: preset.typography.fontFamily,
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      }}
    >
      {/* Floating Spatial Navigation */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-2 sm:px-4 py-2 sm:py-3 rounded-full flex items-center justify-center gap-1 sm:gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300"
           style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(24px)" }}>
        {navSections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <button 
              key={s.id} 
              onClick={() => scrollTo(s.id)}
              className="relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-300"
              style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }}
            >
              {isActive && (
                <motion.div 
                  layoutId="glass-nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.5 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div id="section-about" className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden px-6 pb-12 pt-24">
        <GlassHero className="z-0" />
        {/* Gradient mesh overlay */}
        <div className="absolute inset-0 z-[1]" style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(124,58,237,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(56,189,248,0.2) 0%, transparent 60%)"
        }} />

        {/* Hero glass card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-3xl"
        >
          {role && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)" }}>
              {role}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight text-white leading-none break-words"
            style={{ textShadow: "0 0 80px rgba(124,58,237,0.5)" }}>
            {data.name}
          </h1>
          {data.summary && (
            <p className="mt-6 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
              {data.summary}
            </p>
          )}
          <ContactRow data={data} presetKey={p} className="justify-center mt-8" />
        </motion.div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 lg:px-10 pb-32 max-w-7xl mx-auto space-y-12">

        {/* Projects — glass card magazine grid */}
        {has(data.projects) && (
          <section id="section-work" className="scroll-mt-32">
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              Selected Work
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.projects!.map((proj, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative overflow-hidden rounded-2xl group flex flex-col ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                  style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)" }}
                >
                  <div className={`relative overflow-hidden ${i === 0 ? "h-64 sm:h-80" : "h-44 sm:h-52"}`}>
                    <GenerativeProjectVisual seed={proj.name} presetKey={p} />
                    <GlassProjectVisual className="z-[1]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-[2]" />
                    {proj.link && (
                      <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank"
                        className="absolute top-3 right-3 z-[3] size-8 flex items-center justify-center rounded-full hover:bg-white/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                        <ExternalLink className="size-3.5 text-white" />
                      </a>
                    )}
                  </div>
                  <div className="p-6 relative z-[2] flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-white line-clamp-2">{proj.name}</h3>
                    <p className="text-sm mt-3 leading-relaxed line-clamp-3" style={{ color: "rgba(255,255,255,0.6)" }}>{proj.description}</p>
                    {proj.tech && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {proj.tech.slice(0, 4).map((t, ti) => (
                          <span key={ti} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                            style={{ background: "rgba(124,58,237,0.3)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(124,58,237,0.4)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Experience + Capabilities in 2 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {has(data.experience) && (
            <motion.section
              id="section-experience"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 sm:p-8 rounded-3xl scroll-mt-32"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>Experience</h2>
              <div className="space-y-8">
                {data.experience!.map((exp, i) => (
                  <ExperienceEntry key={i} exp={exp} i={i} presetKey={p} expandedExp={expandedExp} setExpandedExp={setExpandedExp} />
                ))}
              </div>
            </motion.section>
          )}

          <div id="section-capabilities" className="space-y-8 scroll-mt-32">
            {has(data.skills) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden p-6 sm:p-8 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
              >
                <GlassSkillsBg className="z-0" />
                <div className="relative z-10">
                  <h2 className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>Skills</h2>
                  <SkillsSection skills={data.skills!} presetKey={p} />
                </div>
              </motion.section>
            )}
            
            {(has(data.education) || has(data.achievements)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                {has(data.education) && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-6 rounded-3xl"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
                  >
                    <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Education</h2>
                    <div className="space-y-4">
                      {data.education!.map((ed, i) => (
                        <div key={i} className="flex flex-col gap-1 text-sm">
                          <div className="font-semibold text-white">{ed.degree}</div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{ed.institution}</span>
                            <span className="text-xs shrink-0 font-medium" style={{ color: "rgba(124,58,237,0.9)" }}>{ed.year}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}
                
                {has(data.achievements) && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-6 rounded-3xl"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
                  >
                    <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Achievements</h2>
                    <div className="space-y-3">
                      {data.achievements!.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                          <span className="shrink-0 text-white/40">✦</span>
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </div>
            )}
          </div>

          {/* Custom Sections */}
          {has(data.custom_sections) && (
            <div id="section-custom" className="mt-6 p-6 rounded-3xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
              <CustomSections data={data} presetKey={p} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
