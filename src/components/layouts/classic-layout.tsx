"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { stylePresets } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import { ExperienceEntry, TechPill, SkillsSection } from "@/components/portfolio-primitives";
import { ExternalLink } from "lucide-react";
import { ClassicHero } from "@/components/threeui-adapter";
import { useActiveSection } from "@/hooks/use-active-section";

const p = "classic";

export function ClassicLayout({ data }: { data: SchemaData }) {
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
    ...(has(data.projects) ? [{ id: "section-work", label: "Selected Works" }] : []),
    ...(has(data.experience) ? [{ id: "section-experience", label: "Experience" }] : []),
    ...(has(data.skills) || has(data.education) ? [{ id: "section-capabilities", label: "Capabilities" }] : []),
  ];

  const { activeId, scrollTo } = useActiveSection(navSections);

  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'Merriweather', Georgia, serif", background: preset.palette.bg }}>
      <ClassicHero className="fixed inset-0 z-0" />
      
      {/* Elegant Sticky Header Navigation */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-lg border-b border-black/10 transition-all duration-300">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: preset.palette.text }}>
          {data.name.split(" ")[0]}.
        </div>
        
        <nav className="hidden md:flex gap-6">
          {navSections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="text-[10px] uppercase tracking-[0.15em] relative transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black"
              style={{ 
                color: activeId === s.id ? preset.palette.text : preset.palette.muted,
                fontWeight: activeId === s.id ? "bold" : "normal"
              }}
            >
              {s.label}
              {activeId === s.id && (
                <motion.div 
                  layoutId="classic-nav-indicator"
                  className="absolute -bottom-2 left-0 right-0 h-[2px]"
                  style={{ background: preset.palette.accent }}
                  transition={{ type: "spring", stiffness: 600, damping: 40, mass: 0.3 }}
                />
              )}
            </button>
          ))}
        </nav>
        
        {/* Mobile Nav Select */}
        <div className="md:hidden">
          <select 
            value={activeId} 
            onChange={(e) => scrollTo(e.target.value)}
            className="bg-transparent text-[10px] uppercase tracking-[0.1em] font-bold outline-none border-b border-black/20 pb-1"
            style={{ color: preset.palette.text }}
          >
            {navSections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 lg:py-24 pb-32">

        {/* Hero */}
        <div id="section-about" className="text-center pb-16 mb-16 border-b-[1px] scroll-mt-24" style={{ borderColor: preset.palette.border }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight break-words" style={{ color: preset.palette.text, fontFamily: "Merriweather, Georgia, serif" }}>
            {data.name}
          </h1>
          {role && <p className="mt-6 text-[10px] sm:text-xs uppercase tracking-[0.3em]" style={{ color: preset.palette.accent }}>{role}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs" style={{ color: preset.palette.muted }}>
            <span className="truncate max-w-[200px] sm:max-w-none">{data.contact.email}</span>
            {data.contact.phone && <><span className="opacity-50">·</span><span>{data.contact.phone}</span></>}
            {data.contact.links?.map((l, i) => (
              <span key={i} className="flex items-center gap-2 sm:gap-4"><span className="opacity-50">·</span>
                <a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank"
                  className="underline underline-offset-4 hover:opacity-70 transition-opacity" style={{ color: preset.palette.accent }}>{l.label}</a>
              </span>
            ))}
          </div>
          {data.summary && <p className="mt-10 text-sm sm:text-base leading-loose text-center max-w-2xl mx-auto" style={{ color: preset.palette.text }}>{data.summary}</p>}
        </div>

        {/* Projects — typographic list */}
        {has(data.projects) && (
          <section id="section-work" className="mb-16 scroll-mt-24">
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b-[1px] pb-3 mb-8" style={{ color: preset.palette.accent, borderColor: preset.palette.accent }}>Selected Works</h2>
            <div className="space-y-10">
              {data.projects!.map((proj, i) => (
                <div key={i} className="pb-8 border-b last:border-0" style={{ borderColor: preset.palette.border }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-bold text-base sm:text-lg" style={{ color: preset.palette.text }}>{proj.name}</div>
                    {proj.link && (
                      <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank"
                        className="text-[10px] sm:text-xs shrink-0 font-bold uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: preset.palette.accent }}>
                        Visit ↗
                      </a>
                    )}
                  </div>
                  <p className="text-sm mt-3 leading-loose" style={{ color: preset.palette.muted }}>{proj.description}</p>
                  {proj.tech && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {proj.tech.slice(0, 6).map((t, ti) => (
                        <span key={ti} className="text-[10px] px-2.5 py-1 border font-sans uppercase tracking-wider" style={{ borderColor: preset.palette.border, color: preset.palette.text }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {has(data.experience) && (
          <section id="section-experience" className="mb-16 scroll-mt-24">
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b-[1px] pb-3 mb-8" style={{ color: preset.palette.accent, borderColor: preset.palette.accent }}>Experience</h2>
            <div className="space-y-10">
              {data.experience!.map((exp, i) => (
                <ExperienceEntry key={i} exp={exp} i={i} presetKey={p} expandedExp={expandedExp} setExpandedExp={setExpandedExp} />
              ))}
            </div>
          </section>
        )}

        {/* Capabilities (Skills + Education + Achievements) */}
        <div id="section-capabilities" className="scroll-mt-24 space-y-16">
          {has(data.skills) && (
            <section>
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b-[1px] pb-3 mb-8" style={{ color: preset.palette.accent, borderColor: preset.palette.accent }}>Skills</h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {data.skills!.map((s, i) => (
                  <span key={i} className="text-xs sm:text-sm px-3 py-1.5 border" style={{ borderColor: preset.palette.border, color: preset.palette.text }}>{s}</span>
                ))}
              </div>
            </section>
          )}

          {has(data.education) && (
            <section>
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b-[1px] pb-3 mb-8" style={{ color: preset.palette.accent, borderColor: preset.palette.accent }}>Education</h2>
              <div className="space-y-6">
                {data.education!.map((ed, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-baseline justify-between text-sm gap-1 sm:gap-4">
                    <div className="font-bold" style={{ color: preset.palette.text }}>{ed.degree}</div>
                    <div className="flex items-baseline justify-between sm:justify-end gap-4 flex-1">
                      <div className="truncate text-xs sm:text-sm" style={{ color: preset.palette.muted }}>{ed.institution}</div>
                      <div className="text-[10px] sm:text-xs shrink-0 font-bold tracking-widest" style={{ color: preset.palette.muted }}>{ed.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {has(data.achievements) && (
            <section>
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b-[1px] pb-3 mb-8" style={{ color: preset.palette.accent, borderColor: preset.palette.accent }}>Achievements</h2>
              <div className="space-y-4">
                {data.achievements!.map((a, i) => (
                  <div key={i} className="flex gap-4 text-sm items-start" style={{ color: preset.palette.text }}>
                    <span className="font-serif italic text-lg leading-none mt-0.5" style={{ color: preset.palette.muted }}>&sect;</span>
                    <span className="leading-relaxed">{a}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-center mt-24 pt-8 border-t-[1px]" style={{ color: preset.palette.muted, borderColor: preset.palette.border, opacity: 0.5 }}>
          {data.name} — Resume to Portfolio
        </div>
      </div>
    </div>
  );
}
