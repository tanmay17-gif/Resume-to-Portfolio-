"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { stylePresets } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import { GenerativeProjectVisual } from "@/components/project-visual";
import { ExperienceEntry, TechPill, SkillsSection, ContactRow , CustomSections } from "@/components/portfolio-primitives";
import { SoftHero, SoftProjectVisual, SoftSkillsBg } from "@/components/threeui-adapter";
import { ExternalLink } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";

const p = "soft";

export function SoftLayout({ data }: { data: SchemaData }) {
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

  const clay = (children: React.ReactNode, extraClass = "") => (
    <div className={`rounded-[28px] p-6 sm:p-8 ${extraClass}`}
      style={{ background: "#e8eef7", boxShadow: "8px 8px 16px rgba(163,177,198,0.5), -8px -8px 16px rgba(255,255,255,0.9)" }}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen relative" style={{ fontFamily: preset.typography.fontFamily, background: "#e8eef7" }}>
      
      {/* Tactile Pill Navigation */}
      <div className="sticky top-4 sm:top-6 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap justify-center items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-full"
             style={{ background: "#e8eef7", boxShadow: "inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.7), 4px 4px 10px rgba(163,177,198,0.4)" }}>
          {navSections.map((s) => {
            const isActive = activeId === s.id;
            return (
              <button 
                key={s.id} 
                onClick={() => scrollTo(s.id)}
                className="relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest outline-none transition-all duration-300"
                style={{ 
                  color: isActive ? preset.palette.text : preset.palette.muted,
                  boxShadow: isActive ? "inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.9)" : "none",
                  background: isActive ? "#e1e8f3" : "transparent"
                }}
              >
                <span className="relative z-10">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-10 sm:space-y-12">

        {/* Hero — large soft blob */}
        <motion.div 
          id="section-about" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative overflow-hidden rounded-[36px] text-center p-8 sm:p-12 lg:p-16 scroll-mt-24 mt-4"
          style={{ background: "linear-gradient(135deg, #dde4f0 0%, #e8eef7 50%, #f0e8f7 100%)", boxShadow: "12px 12px 24px rgba(163,177,198,0.4), -12px -12px 24px rgba(255,255,255,0.95)" }}>
          <SoftHero className="z-0" />
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight break-words" style={{ color: preset.palette.text }}>
              {data.name}
            </h1>
            {role && <p className="mt-4 text-xs sm:text-sm font-semibold uppercase tracking-widest opacity-70" style={{ color: preset.palette.accent }}>{role}</p>}
            {data.summary && <p className="mt-6 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto opacity-70" style={{ color: preset.palette.text }}>{data.summary}</p>}
            <ContactRow data={data} presetKey={p} className="justify-center mt-8" />
          </div>
        </motion.div>

        {/* Projects — clay bubbles */}
        {has(data.projects) && (
          <section id="section-work" className="scroll-mt-24">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-6 pl-4" style={{ color: preset.palette.muted }}>Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {data.projects!.map((proj, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                  className="rounded-[28px] overflow-hidden flex flex-col"
                  style={{ background: "#e8eef7", boxShadow: "8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.9)" }}
                >
                  <div className="relative h-48 sm:h-52 overflow-hidden rounded-t-[28px] shrink-0">
                    <GenerativeProjectVisual seed={proj.name} presetKey={p} />
                    <SoftProjectVisual className="z-[1]" />
                    {proj.link && (
                      <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank"
                        className="absolute top-4 right-4 z-[2] size-10 flex items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-offset-2 transition-transform hover:scale-110"
                        style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(163,177,198,0.3), -4px -4px 10px rgba(255,255,255,0.8)" }}>
                        <ExternalLink className="size-4" style={{ color: preset.palette.accent }} />
                      </a>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg line-clamp-2" style={{ color: preset.palette.text }}>{proj.name}</h3>
                    <p className="text-sm mt-3 leading-relaxed line-clamp-3 opacity-70" style={{ color: preset.palette.text }}>{proj.description}</p>
                    {proj.tech && (
                      <div className="mt-auto pt-5 flex flex-wrap gap-2">
                        {proj.tech.slice(0, 4).map((t, ti) => <TechPill key={ti} tech={t} presetKey={p} />)}
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {clay(
              <section id="section-experience" className="scroll-mt-24">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-6" style={{ color: preset.palette.muted }}>Experience</h2>
                <div className="space-y-8">
                  {data.experience!.map((exp, i) => (
                    <ExperienceEntry key={i} exp={exp} i={i} presetKey={p} expandedExp={expandedExp} setExpandedExp={setExpandedExp} />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}

        {/* Capabilities (Skills + Education + Achievements) */}
        <div id="section-capabilities" className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 scroll-mt-24">
          {has(data.skills) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[32px] flex flex-col" style={{ boxShadow: "8px 8px 16px rgba(163,177,198,0.5), -8px -8px 16px rgba(255,255,255,0.9)" }}
            >
              <SoftSkillsBg className="z-0 rounded-[32px]" />
              <div className="relative z-10 p-6 sm:p-8 flex-1">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-6" style={{ color: preset.palette.muted }}>Skills</h2>
                <SkillsSection skills={data.skills!} presetKey={p} />
              </div>
            </motion.div>
          )}
          
          <div className="flex flex-col gap-6 sm:gap-8">
            {has(data.education) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {clay(
                  <section>
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-6" style={{ color: preset.palette.muted }}>Education</h2>
                    <div className="space-y-5">
                      {data.education!.map((ed, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="font-bold text-sm line-clamp-2" style={{ color: preset.palette.text }}>{ed.degree}</div>
                          <div className="text-xs flex justify-between gap-2" style={{ color: preset.palette.muted }}>
                            <span className="truncate">{ed.institution}</span>
                            <span className="shrink-0 font-bold" style={{ color: preset.palette.accent }}>{ed.year}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </motion.div>
            )}

            {has(data.achievements) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {clay(
                  <section>
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-6" style={{ color: preset.palette.muted }}>Achievements</h2>
                    <div className="space-y-3">
                      {data.achievements!.map((a, i) => (
                        <div key={i} className="flex gap-3 text-sm" style={{ color: preset.palette.text }}>
                          <span className="shrink-0 mt-0.5" style={{ color: preset.palette.accent }}>✦</span> 
                          <span className="line-clamp-3">{a}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </motion.div>
            )}
          </div>

          {/* Custom Sections */}
          {has(data.custom_sections) && (
            <div id="section-custom" className="mt-8">
              <CustomSections data={data} presetKey={p} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
