"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { stylePresets } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import { ExperienceEntry, TechPill, SkillsSection } from "@/components/portfolio-primitives";
import { RetroBg, RetroHero, RetroProjectVisual } from "@/components/threeui-adapter";
import { ExternalLink } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";

const p = "retro";

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [started, text]);

  return <span>{displayed}<span className="animate-pulse">▋</span></span>;
}

export function RetroLayout({ data }: { data: SchemaData }) {
  const preset = stylePresets[p];
  const [expandedExp, setExpandedExp] = useState<Record<number, boolean>>({});
  const role = data.experience?.[0]?.title ?? "";

  const has = (v: unknown) => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    return !!v;
  };

  const navSections = [
    { id: "section-about", label: "ABOUT" },
    ...(has(data.projects) ? [{ id: "section-work", label: "WORK" }] : []),
    ...(has(data.experience) ? [{ id: "section-experience", label: "EXP" }] : []),
    ...(has(data.skills) || has(data.education) ? [{ id: "section-capabilities", label: "CAPABILITIES" }] : []),
  ];

  const { activeId, scrollTo } = useActiveSection(navSections);

  return (
    <div
      className="min-h-screen relative"
      style={{ fontFamily: "'Geist Mono', monospace", background: preset.palette.bg, color: preset.palette.text }}
    >
      {/* CRT Background */}
      <RetroBg className="z-0 fixed" />

      {/* Scanlines overlay */}
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03]"
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,159,0.5) 2px, rgba(0,255,159,0.5) 4px)" }} />

      {/* Terminal window chrome */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 pb-32">

        {/* Menu bar (Sticky Navigation) */}
        <div className="sticky top-4 z-50 flex flex-wrap items-center gap-2 mb-4 px-3 py-2 border-2 backdrop-blur-md" 
             style={{ borderColor: preset.palette.border, background: "rgba(0,0,0,0.85)" }}>
          <div className="flex gap-1.5 shrink-0 mr-4">
            <div className="size-3 rounded-full" style={{ background: "#ff006e" }} />
            <div className="size-3 rounded-full" style={{ background: "#facc15" }} />
            <div className="size-3 rounded-full" style={{ background: "#00ff9f" }} />
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-4 text-[10px] sm:text-xs">
            {navSections.map((s, i) => {
              const isActive = activeId === s.id;
              return (
                <button 
                  key={i} 
                  onClick={() => scrollTo(s.id)}
                  className="px-2 py-0.5 border outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  style={{
                    borderColor: isActive ? preset.palette.accent : "transparent",
                    color: isActive ? preset.palette.accent : preset.palette.muted,
                    background: isActive ? "rgba(0,255,159,0.1)" : "transparent"
                  }}
                >
                  [{s.label}]
                </button>
              );
            })}
          </div>
          
          <div className="ml-auto text-[10px] hidden sm:block shrink-0" style={{ color: preset.palette.muted }}>
            PORTFOLIO.exe
          </div>
        </div>

        {/* Terminal header area with MorphingGlyphCloud */}
        <div
          id="section-about"
          className="relative overflow-hidden border-2 mb-4 scroll-mt-20"
          style={{ borderColor: preset.palette.border, minHeight: "220px" }}
        >
          <RetroHero className="z-0" />
          <div className="relative z-10 p-6">
            <div className="text-xs mb-3" style={{ color: preset.palette.muted }}>
              ┌─ PORTFOLIO.exe ────────────────────────────────────────────────┐
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight break-words" style={{ color: preset.palette.text }}>
              <TypewriterText text={`> ${data.name}_`} delay={0.3} />
            </h1>
            {role && <p className="mt-2 text-sm" style={{ color: preset.palette.muted }}><TypewriterText text={`// ${role}`} delay={1.5} /></p>}
            {data.summary && (
              <p className="mt-4 text-xs sm:text-sm leading-relaxed border-l-2 pl-3 max-w-2xl" style={{ color: preset.palette.text, borderColor: preset.palette.accent }}>
                {data.summary}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: preset.palette.muted }}>
              <span>[email] {data.contact.email}</span>
              {data.contact.phone && <span>[tel] {data.contact.phone}</span>}
              {data.contact.links?.map((l, i) => (
                <a key={i} href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank"
                  className="underline outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" 
                  style={{ color: preset.palette.accent }}>[{l.label}]</a>
              ))}
            </div>
            <div className="text-xs mt-4" style={{ color: preset.palette.muted }}>
              └────────────────────────────────────────────────────────────────┘
            </div>
          </div>
        </div>

        {/* Projects */}
        {has(data.projects) && (
          <section id="section-work" className="mb-4 scroll-mt-20">
            <div className="text-xs font-bold tracking-[0.2em] uppercase mb-3 border-b pb-1" style={{ color: preset.palette.accent, borderColor: preset.palette.border }}>
              // PROJECTS — ls -la ./work/
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.projects!.map((proj, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative border-2 overflow-hidden group"
                  style={{ borderColor: i === 0 ? preset.palette.accent : preset.palette.border }}
                >
                  <div className="relative h-36 overflow-hidden">
                    {i === 0 ? <RetroProjectVisual className="z-0" /> : (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${preset.palette.border}` }}>
                        <div className="text-center text-[10px] font-mono space-y-1" style={{ color: preset.palette.accent }}>
                          <div>■ ■ ■ ■ ■ ■ ■ ■</div>
                          <div>■ ■ ■ ■ ■ ■ ■ ■</div>
                          <div>■ ■ ■ ■ ■ ■ ■ ■</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 text-[10px] font-mono px-1" style={{ color: preset.palette.accent, background: "rgba(0,0,0,0.7)" }}>
                      [{String(i + 1).padStart(2, "0")}]
                    </div>
                    {proj.link && (
                      <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank"
                        className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 font-mono outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        style={{ border: `1px solid ${preset.palette.accent}`, color: preset.palette.accent, background: "rgba(0,0,0,0.8)" }}>
                        [LINK]
                      </a>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-sm line-clamp-1" style={{ color: preset.palette.text }}>[{proj.name}]</div>
                    <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: preset.palette.muted }}>{proj.description}</p>
                    {proj.tech && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {proj.tech.slice(0, 5).map((t, ti) => (
                          <span key={ti} className="text-[10px] px-1.5 py-0.5 font-mono" style={{ border: `1px solid ${preset.palette.border}`, color: preset.palette.muted }}>
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

        {/* Experience */}
        {has(data.experience) && (
          <section id="section-experience" className="mb-4 border-2 p-4 scroll-mt-20" style={{ borderColor: preset.palette.border }}>
            <div className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: preset.palette.accent }}>
              // EXPERIENCE — cat work_history.log
            </div>
            <div className="space-y-5">
              {data.experience!.map((exp, i) => (
                <ExperienceEntry key={i} exp={exp} i={i} presetKey={p} expandedExp={expandedExp} setExpandedExp={setExpandedExp} />
              ))}
            </div>
          </section>
        )}

        {/* Two-col: Skills + Education */}
        <div id="section-capabilities" className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 scroll-mt-20">
          {has(data.skills) && (
            <section className="border-2 p-4" style={{ borderColor: preset.palette.border }}>
              <div className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: preset.palette.accent }}>
                // SKILLS — proficiency.json
              </div>
              <SkillsSection skills={data.skills!} presetKey={p} />
            </section>
          )}
          
          <div className="flex flex-col gap-3">
            {has(data.education) && (
              <section className="border-2 p-4 flex-1" style={{ borderColor: preset.palette.border }}>
                <div className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: preset.palette.accent }}>
                  // EDUCATION — credentials.db
                </div>
                <div className="space-y-3">
                  {data.education!.map((ed, i) => (
                    <div key={i} className="border-l-2 pl-2" style={{ borderColor: preset.palette.accent }}>
                      <div className="text-sm font-bold" style={{ color: preset.palette.text }}>{ed.degree}</div>
                      <div className="text-xs" style={{ color: preset.palette.muted }}>{ed.institution} · {ed.year}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Achievements */}
            {has(data.achievements) && (
              <section className="border-2 p-4" style={{ borderColor: preset.palette.border }}>
                <div className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: preset.palette.accent }}>
                  // ACHIEVEMENTS — awards.list
                </div>
                {data.achievements!.map((a, i) => (
                  <div key={i} className="flex gap-2 text-xs mb-1.5" style={{ color: preset.palette.text }}>
                    <span style={{ color: preset.palette.accent }}>[*]</span> {a}
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] font-mono mt-6" style={{ color: "rgba(0,255,159,0.25)" }}>
          [ END_OF_FILE ] — resume-to-portfolio — {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
