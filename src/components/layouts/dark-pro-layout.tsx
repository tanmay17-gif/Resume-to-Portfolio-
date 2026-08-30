"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { stylePresets } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import { GenerativeProjectVisual } from "@/components/project-visual";
import { P5Background } from "@/components/p5-bg";
import { ExperienceEntry, TechPill, SkillsSection, ContactRow } from "@/components/portfolio-primitives";
import { DarkProHero, DarkProProjectVisual, DarkProSkillsBg, DarkProPanelBg } from "@/components/threeui-adapter";
import { ExternalLink } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";

const p = "dark_pro";

export function DarkProLayout({ data }: { data: SchemaData }) {
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
    ...(has(data.skills) || has(data.education) || has(data.achievements) ? [{ id: "section-capabilities", label: "Capabilities" }] : []),
  ];

  const { activeId, scrollTo } = useActiveSection(navSections);

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row relative"
      style={{ fontFamily: preset.typography.fontFamily, background: preset.palette.bg, color: preset.palette.text }}
    >
      <P5Background preset={p} />

      {/* ── SIDEBAR (Only Navigation for Dark Pro) ─────────────────── */}
      <aside
        className="relative lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-72 xl:w-80 shrink-0 flex flex-col p-8 z-20 overflow-hidden"
        style={{ background: "#0d0d0f", borderRight: "1px solid rgba(255,255,255,0.05)" }}
      >
        <DarkProHero className="z-0" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Identity */}
          <div id="section-about-header">
            <div className="text-[10px] font-mono tracking-widest uppercase mb-3" style={{ color: preset.palette.accent }}>
              &gt; portfolio.init()
            </div>
            <h1
              className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight break-words"
              style={{ color: preset.palette.text, textShadow: `0 0 40px ${preset.palette.accent}30` }}
            >
              {data.name}
            </h1>
            {role && (
              <div className="mt-2 text-xs font-mono" style={{ color: preset.palette.accent }}>
                <span className="opacity-50">// </span>{role}
              </div>
            )}
            {data.summary && (
              <p className="mt-4 text-[13px] leading-relaxed" style={{ color: preset.palette.muted }}>
                {data.summary}
              </p>
            )}
          </div>

          {/* Contact */}
          <ContactRow data={data} presetKey={p} className="mt-6 flex-col !gap-2" />

          {/* Nav links */}
          <nav className="mt-auto pt-8 space-y-1">
            {navSections.map(s => {
              const isActive = activeId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="w-full text-left text-xs font-mono py-2 px-3 rounded transition-colors group flex items-center justify-between outline-none focus-visible:ring-2"
                  style={{ 
                    color: isActive ? preset.palette.text : preset.palette.muted,
                    background: isActive ? "rgba(255,255,255,0.1)" : "transparent"
                  }}
                >
                  <span>
                    <span style={{ color: preset.palette.accent, opacity: isActive ? 1 : 0.5 }}>{isActive ? ">" : "_"}</span> {s.label.toLowerCase()}
                  </span>
                  {isActive && <span className="text-[9px] animate-pulse" style={{ color: preset.palette.accent }}>active</span>}
                </button>
              );
            })}
          </nav>

          {/* Status bar */}
          <div className="mt-6 pt-4 border-t text-[10px] font-mono" style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)" }}>
            status: online · build: stable
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-72 xl:ml-80 p-6 lg:p-10 pb-32 space-y-6 max-w-full">
        {/* We use an invisible anchor for the "About" section since the content is in the sidebar */}
        <div id="section-about" className="absolute top-0 opacity-0 pointer-events-none" aria-hidden="true" />

        {/* Projects — data panels */}
        {has(data.projects) && (
          <section id="section-work">
            <div className="text-[10px] font-mono tracking-widest uppercase mb-4" style={{ color: preset.palette.accent }}>
              &gt; ls ./projects
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {data.projects!.map((proj, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="relative overflow-hidden group"
                  style={{ background: preset.palette.card, border: preset.border, borderRadius: preset.radius }}
                >
                  {/* Visual zone */}
                  <div className="relative h-40 overflow-hidden">
                    <GenerativeProjectVisual seed={proj.name} presetKey={p} />
                    {i === 0 && <DarkProProjectVisual className="z-[1]" />}
                    {i !== 0 && <DarkProSkillsBg className="z-[1]" />}
                    {/* Panel overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#18181b] opacity-80" />
                    <div className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5" style={{ color: preset.palette.accent, border: `1px solid ${preset.palette.accent}30`, borderRadius: "2px" }}>
                      [{String(i + 1).padStart(2, "0")}]
                    </div>
                    {proj.link && (
                      <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank"
                        className="absolute top-3 right-3 size-7 flex items-center justify-center rounded"
                        style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)" }}>
                        <ExternalLink className="size-3.5" style={{ color: preset.palette.accent }} />
                      </a>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-mono font-bold text-sm line-clamp-1" style={{ color: preset.palette.text }}>{proj.name}</h3>
                    <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: preset.palette.muted }}>{proj.description}</p>
                    {proj.tech && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {proj.tech.slice(0, 5).map((t, ti) => <TechPill key={ti} tech={t} presetKey={p} />)}
                      </div>
                    )}
                  </div>
                  {/* Scan line effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(transparent 50%, rgba(56,189,248,0.02) 50%)", backgroundSize: "100% 4px" }} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Experience — timeline */}
        {has(data.experience) && (
          <motion.section
            id="section-experience"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden p-6"
            style={{ background: preset.palette.card, border: preset.border, borderRadius: preset.radius }}
          >
            <DarkProPanelBg className="z-0" />
            <div className="relative z-10">
              <div className="text-[10px] font-mono tracking-widest uppercase mb-4" style={{ color: preset.palette.accent }}>&gt; cat experience.log</div>
              <div className="space-y-6">
                {data.experience!.map((exp, i) => (
                  <ExperienceEntry key={i} exp={exp} i={i} presetKey={p} expandedExp={expandedExp} setExpandedExp={setExpandedExp} />
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Capabilities (Skills + Education + Achievements) */}
        <div id="section-capabilities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {has(data.skills) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden p-6"
                style={{ background: preset.palette.card, border: preset.border, borderRadius: preset.radius }}
              >
                <DarkProSkillsBg className="z-0" />
                <div className="relative z-10">
                  <div className="text-[10px] font-mono tracking-widest uppercase mb-4" style={{ color: preset.palette.accent }}>&gt; skills --list</div>
                  <SkillsSection skills={data.skills!} presetKey={p} />
                </div>
              </motion.section>
            )}
            {has(data.education) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6"
                style={{ background: preset.palette.card, border: preset.border, borderRadius: preset.radius }}
              >
                <div className="text-[10px] font-mono tracking-widest uppercase mb-4" style={{ color: preset.palette.accent }}>&gt; cat education.md</div>
                <div className="space-y-4">
                  {data.education!.map((ed, i) => (
                    <div key={i} className="border-l-2 pl-3" style={{ borderColor: preset.palette.accent }}>
                      <div className="font-mono text-sm font-semibold" style={{ color: preset.palette.text }}>{ed.degree}</div>
                      <div className="text-xs mt-0.5 flex items-center justify-between" style={{ color: preset.palette.muted }}>
                        <span>{ed.institution}</span>
                        <span style={{ color: preset.palette.accent }}>{ed.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Achievements */}
          {has(data.achievements) && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6"
              style={{ background: preset.palette.card, border: preset.border, borderRadius: preset.radius }}
            >
              <div className="text-[10px] font-mono tracking-widest uppercase mb-4" style={{ color: preset.palette.accent }}>&gt; achievements --verbose</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {data.achievements!.map((a, i) => (
                  <div key={i} className="flex gap-2 text-xs font-mono" style={{ color: preset.palette.text }}>
                    <span style={{ color: preset.palette.accent }}>[✓]</span> {a}
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
          &gt; {data.name.toLowerCase().replace(/ /g, "-")}.portfolio — generated via resume-to-portfolio
        </div>
      </main>
    </div>
  );
}
