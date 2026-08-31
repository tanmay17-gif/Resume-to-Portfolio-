"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { stylePresets } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import { GenerativeProjectVisual } from "@/components/project-visual";
import { ExperienceEntry, TechPill, SkillsSection , CustomSections } from "@/components/portfolio-primitives";
import { BoldHero, BoldProjectVisual, BoldSectionAccent } from "@/components/threeui-adapter";
import { ExternalLink } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";

const p = "bold";

export function BoldLayout({ data }: { data: SchemaData }) {
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
    ...(has(data.skills) || has(data.education) ? [{ id: "section-capabilities", label: "SKILLS" }] : []),
  ];

  const { activeId, scrollTo } = useActiveSection(navSections);

  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'Clash Display', sans-serif", background: preset.palette.bg }}>
      
      {/* Brutalist Sticky Nav Rail */}
      <div className="sticky top-0 z-50 bg-[#facc15] border-b-[4px] border-black flex flex-wrap shadow-[0_4px_0_#000]">
        {navSections.map((s, i) => {
          const isActive = activeId === s.id;
          return (
            <button 
              key={s.id} 
              onClick={() => scrollTo(s.id)}
              className={`flex-1 min-w-[80px] text-xs sm:text-sm font-black uppercase tracking-widest px-2 sm:px-4 py-3 sm:py-4 transition-colors outline-none focus-visible:bg-white border-r-[4px] border-black last:border-r-0 ${isActive ? "bg-black text-[#facc15]" : "hover:bg-black hover:text-[#facc15]"}`}
              style={{ color: isActive ? "#facc15" : "#000" }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Hero — full-width brutal banner */}
      <div id="section-about" className="relative overflow-hidden border-b-[4px] border-black scroll-mt-[60px]" style={{ background: "#facc15", minHeight: "50vh" }}>
        <BoldHero className="z-0" />
        <div className="absolute inset-0 bg-yellow-400/60 mix-blend-multiply z-[1]" />
        <div className="relative z-10 p-6 sm:p-8 lg:p-16 flex flex-col justify-end min-h-[50vh]">
          <h1 className="text-5xl sm:text-7xl lg:text-[120px] font-black uppercase tracking-[-2px] lg:tracking-[-4px] leading-none break-words" style={{ color: "#000" }}>
            {data.name}
          </h1>
          {role && (
            <div className="mt-4 inline-block bg-black text-[#facc15] text-sm sm:text-lg font-black uppercase tracking-widest px-4 py-2 self-start">
              {role}
            </div>
          )}
          {data.summary && (
            <p className="mt-6 text-sm sm:text-base font-bold max-w-3xl border-t-[4px] border-black pt-6" style={{ color: "#000" }}>
              {data.summary}
            </p>
          )}
          
          {/* Custom Sections */}
          <CustomSections data={data} presetKey={p} />

          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm font-black uppercase">
            <a href={`mailto:${data.contact.email}`} className="border-[3px] border-black px-4 py-2 hover:bg-black hover:text-[#facc15] transition-colors" style={{ color: "#000", background: "#fff", boxShadow: "4px 4px 0 #000" }}>EMAIL</a>
            {data.contact.links?.map((l, i) => (
              <a key={i} href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank"
                className="border-[3px] border-black px-4 py-2 hover:bg-black hover:text-[#facc15] transition-colors flex items-center gap-2"
                style={{ color: "#000", background: "#fff", boxShadow: "4px 4px 0 #000" }}>
                {l.label} <ExternalLink className="size-3" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 pb-32 space-y-16">

        {/* Projects — newspaper collage grid */}
        {has(data.projects) && (
          <section id="section-work" className="scroll-mt-[100px]">
            <div className="relative overflow-hidden mb-8">
              <BoldSectionAccent className="z-0" />
              <h2 className="relative z-10 text-3xl sm:text-5xl font-black uppercase tracking-tighter border-b-[4px] border-black pb-3" style={{ color: "#000" }}>
                Selected Work
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-[4px] border-black bg-white">
              {data.projects!.map((proj, i) => {
                // Determine responsive border logic for a brutalist grid without empty gaps
                const isLastInOddRow = (i % 2 !== 0);
                const isLastInMd = i === data.projects!.length - 1;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                    className="border-b-[4px] border-black md:border-r-[4px] lg:border-r-[4px] last:border-b-0 md:last:border-r-0 lg:last:border-r-0 overflow-hidden group flex flex-col"
                    style={{ 
                      borderRightWidth: "4px",
                      borderRightColor: "#000",
                      // Override for nth children based on breakpoint grid structure
                    }}
                  >
                    <div className="relative h-48 sm:h-56 overflow-hidden border-b-[4px] border-black shrink-0 bg-[#f1f5f9]">
                      <GenerativeProjectVisual seed={proj.name} presetKey={p} />
                      {i === 0 && <BoldProjectVisual className="z-[1]" />}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      <div className="absolute top-2 left-2 bg-black text-white text-[12px] font-black px-2 py-0.5 uppercase z-10">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      {proj.link && (
                        <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank"
                          className="absolute top-2 right-2 bg-[#ef4444] text-white text-[10px] font-black px-2 py-1 flex items-center gap-1 hover:bg-black transition-colors z-10 outline-none focus-visible:ring-4 focus-visible:ring-black">
                          LINK <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight line-clamp-2" style={{ color: "#000" }}>{proj.name}</h3>
                      <p className="text-sm mt-3 font-bold leading-relaxed line-clamp-3" style={{ color: "#1f2937" }}>{proj.description}</p>
                      <div className="mt-auto pt-4 flex flex-wrap gap-1.5">
                        {proj.tech?.slice(0, 4).map((t, ti) => (
                          <span key={ti} className="text-[10px] font-black uppercase px-2 py-1 border-[2px] border-black bg-[#facc15]" style={{ color: "#000" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience + Capabilities 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {has(data.experience) && (
            <motion.section 
              id="section-experience" 
              className="border-[4px] border-black p-6 sm:p-8 bg-white scroll-mt-[100px]" 
              style={{ boxShadow: "8px 8px 0 #000" }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter border-b-[4px] border-black pb-3 mb-6" style={{ color: "#000" }}>Experience</h2>
              <div className="space-y-8">
                {data.experience!.map((exp, i) => (
                  <ExperienceEntry key={i} exp={exp} i={i} presetKey={p} expandedExp={expandedExp} setExpandedExp={setExpandedExp} />
                ))}
              </div>
            </motion.section>
          )}
          
          <div id="section-capabilities" className="space-y-10 scroll-mt-[100px]">
            {has(data.skills) && (
              <motion.section 
                className="border-[4px] border-black p-6 sm:p-8 bg-white" 
                style={{ boxShadow: "8px 8px 0 #000" }}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter border-b-[4px] border-black pb-3 mb-6" style={{ color: "#000" }}>Skills</h2>
                <SkillsSection skills={data.skills!} presetKey={p} />
              </motion.section>
            )}
            
            {(has(data.education) || has(data.achievements)) && (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {has(data.education) && (
                  <section className="border-[4px] border-black p-6 sm:p-8 bg-[#facc15]" style={{ boxShadow: "8px 8px 0 #000" }}>
                    <h2 className="text-2xl font-black uppercase tracking-tighter border-b-[4px] border-black pb-3 mb-5" style={{ color: "#000" }}>Education</h2>
                    <div className="space-y-4">
                      {data.education!.map((ed, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="font-black text-sm uppercase line-clamp-2" style={{ color: "#000" }}>{ed.degree}</div>
                          <div className="text-sm font-bold flex justify-between gap-2" style={{ color: "#1f2937" }}>
                            <span className="truncate">{ed.institution}</span>
                            <span className="shrink-0 text-black border-[2px] border-black px-1.5 py-0.5 text-[10px] bg-white">{ed.year}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
                {has(data.achievements) && (
                  <section className="border-[4px] border-black p-6 sm:p-8 bg-[#38bdf8]" style={{ boxShadow: "8px 8px 0 #000" }}>
                    <h2 className="text-2xl font-black uppercase tracking-tighter border-b-[4px] border-black pb-3 mb-5" style={{ color: "#000" }}>Awards</h2>
                    <div className="space-y-3">
                      {data.achievements!.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm font-bold" style={{ color: "#000" }}>
                          <span className="shrink-0 text-white mt-0.5 text-lg">★</span>
                          <span className="line-clamp-2">{a}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
