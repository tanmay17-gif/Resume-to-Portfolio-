"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { stylePresets, type StylePresetKey } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import { GenerativeProjectVisual } from "@/components/project-visual";
import {
  Code2, Atom, Database, Palette, Container, GitBranch, Smartphone,
  Monitor, Cloud, Box, Layers, Cpu, Terminal, Globe, Brush, Sparkles,
  Braces, FileCode, Server, Zap, Tag, ExternalLink, Mail, Phone,
} from "lucide-react";

// ── Re-exports for shared data types ──────────────────────────────────
export type { StylePresetKey };

// ── Skill icon map ─────────────────────────────────────────────────────
export function getSkillIcon(skill: string) {
  const s = skill.toLowerCase();
  if (s.includes("react") || s.includes("next")) return Atom;
  if (s.includes("python")) return FileCode;
  if (s.includes("javascript") || s.includes("typescript") || s.includes("js")) return Code2;
  if (s.includes("java") && !s.includes("javascript")) return Braces;
  if (s.includes("supabase") || s.includes("postgres") || s.includes("sql") || s.includes("mongo") || s.includes("vector")) return Database;
  if (s.includes("tailwind") || s.includes("css") || s.includes("figma")) return Palette;
  if (s.includes("docker") || s.includes("container")) return Container;
  if (s.includes("git")) return GitBranch;
  if (s.includes("mobile") || s.includes("expo") || s.includes("android")) return Smartphone;
  if (s.includes("blender") || s.includes("3d") || s.includes("unreal")) return Box;
  if (s.includes("vision") || s.includes("opencv") || s.includes("yolo")) return Layers;
  if (s.includes("tensorflow") || s.includes("pytorch") || s.includes("ai") || s.includes("rag") || s.includes("llm")) return Cpu;
  if (s.includes("vercel") || s.includes("cloud") || s.includes("colab")) return Cloud;
  if (s.includes("linux") || s.includes("terminal")) return Terminal;
  if (s.includes("web") || s.includes("html") || s.includes("portfolio")) return Globe;
  if (s.includes("design") || s.includes("animation")) return Brush;
  if (s.includes("fastapi") || s.includes("node")) return Server;
  if (s.includes("openai") || s.includes("gemini") || s.includes("hugging")) return Sparkles;
  return Tag;
}

// ── Tech Pill ──────────────────────────────────────────────────────────
export function TechPill({ tech, presetKey }: { tech: string; presetKey: StylePresetKey }) {
  const preset = stylePresets[presetKey];
  const feature = preset.features.techPills;
  let bg = preset.palette.bg, color = preset.palette.muted, border = preset.palette.border;
  if (feature === "colored") {
    const colors = [
      { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
      { bg: "#f3e8ff", color: "#6b21a8", border: "#e9d5ff" },
      { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
      { bg: "#ffedd5", color: "#9a3412", border: "#fed7aa" },
      { bg: "#fce7f3", color: "#9d174d", border: "#fbcfe8" },
    ];
    let hash = 0;
    for (let i = 0; i < tech.length; i++) hash = (hash * 31 + tech.charCodeAt(i)) >>> 0;
    const c = colors[hash % colors.length];
    bg = c.bg; color = c.color; border = c.border;
    if (presetKey === "dark_pro") { bg = "rgba(56,189,248,0.12)"; color = preset.palette.accent; border = "rgba(56,189,248,0.25)"; }
  } else if (feature === "neon") {
    bg = "transparent"; color = preset.palette.text; border = preset.palette.accent;
  } else {
    bg = preset.palette.bg; color = preset.palette.muted; border = preset.palette.border;
  }
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-md border font-medium"
      style={{ background: bg, color, borderColor: border, borderRadius: presetKey === "retro" ? "0" : presetKey === "bold" ? "2px" : "6px" }}
    >
      {tech}
    </span>
  );
}

// ── Section Heading ────────────────────────────────────────────────────
export function SectionHeading({ label, presetKey }: { label: string; presetKey: StylePresetKey }) {
  const preset = stylePresets[presetKey];
  if (presetKey === "retro") return <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-4 font-mono" style={{ color: preset.palette.accent }}>// {label}</h2>;
  if (presetKey === "classic") return <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b-2 pb-2 mb-5" style={{ color: preset.palette.accent, borderColor: preset.palette.accent }}>{label}</h2>;
  if (presetKey === "dark_pro") return <h2 className="text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: preset.palette.accent }}><span className="w-4 h-px inline-block" style={{ background: preset.palette.accent }} />{label}</h2>;
  return <h2 className="text-section mb-4 font-semibold" style={{ color: preset.palette.muted }}>{label}</h2>;
}

// ── Experience Entry ───────────────────────────────────────────────────
export function ExperienceEntry({ exp, i, presetKey, expandedExp, setExpandedExp }: {
  exp: NonNullable<SchemaData["experience"]>[number];
  i: number; presetKey: StylePresetKey;
  expandedExp: Record<number, boolean>;
  setExpandedExp: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}) {
  const preset = stylePresets[presetKey];
  const expanded = !!expandedExp[i];
  const visible = expanded ? exp.bullets : exp.bullets.slice(0, 3);
  const isRetro = presetKey === "retro";

  return (
    <div className={isRetro ? "border-l-2 pl-3" : ""} style={isRetro ? { borderColor: preset.palette.accent } : {}}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-display font-semibold text-[15px]" style={{ color: preset.palette.text }}>
            {exp.title}
            {!isRetro && <span className="font-normal opacity-60"> · </span>}
            <span style={{ color: isRetro ? preset.palette.accent : preset.palette.text, opacity: isRetro ? 1 : 0.75 }}>{exp.company}</span>
          </div>
        </div>
        <div className="text-xs shrink-0" style={{ color: preset.palette.muted }}>{exp.dates}</div>
      </div>
      <ul className="mt-2.5 space-y-1.5 text-sm" style={{ color: preset.palette.text, opacity: 0.85 }}>
        {visible.map((b, bi) => (
          <li key={bi} className="flex gap-2 leading-relaxed">
            <span style={{ color: preset.palette.accent, flexShrink: 0 }}>{isRetro ? ">" : "–"}</span>
            {b}
          </li>
        ))}
      </ul>
      {exp.bullets.length > 3 && (
        <button
          onClick={() => setExpandedExp(prev => ({ ...prev, [i]: !prev[i] }))}
          className="mt-2 text-xs font-semibold hover:underline"
          style={{ color: preset.palette.accent }}
        >
          {expanded ? "Show less" : `+${exp.bullets.length - 3} more`}
        </button>
      )}
    </div>
  );
}

// ── Motion Wrapper ─────────────────────────────────────────────────────
export function M({ children, delay = 0, enabled }: { children: React.ReactNode; delay?: number; enabled: boolean }) {
  if (!enabled) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.45, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

// ── Skills Section ─────────────────────────────────────────────────────
export function SkillsSection({ skills, presetKey }: { skills: string[]; presetKey: StylePresetKey }) {
  const preset = stylePresets[presetKey];
  const isRetro = presetKey === "retro";
  const primary = skills.slice(0, 6);
  const secondary = skills.slice(6, 16);
  const [showAll, setShowAll] = useState(false);
  const tertiary = skills.slice(16);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {primary.map((s, i) => {
          const Icon = getSkillIcon(s);
          return (
            <span key={i} className="inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 font-medium"
              style={{
                background: preset.palette.card,
                color: preset.palette.text,
                border: `1px solid ${preset.palette.border}`,
                borderRadius: isRetro ? "0" : presetKey === "bold" ? "2px" : "8px",
                boxShadow: presetKey === "soft" ? "2px 2px 4px rgba(163,177,198,0.3)" : "none",
              }}
            >
              <Icon className="size-3.5 shrink-0" style={{ color: preset.palette.accent }} />
              {s}
            </span>
          );
        })}
      </div>
      {secondary.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {secondary.map((s, i) => <TechPill key={i} tech={s} presetKey={presetKey} />)}
        </div>
      )}
      {tertiary.length > 0 && (
        <>
          <AnimatePresence>
            {showAll && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-1.5 overflow-hidden">
                {tertiary.map((s, i) => <TechPill key={i} tech={s} presetKey={presetKey} />)}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setShowAll(!showAll)} className="text-xs font-medium hover:underline" style={{ color: preset.palette.accent }}>
            {showAll ? "Show less" : `+${tertiary.length} more skills`}
          </button>
        </>
      )}
    </div>
  );
}

// ── Projects Carousel ──────────────────────────────────────────────────
export function ProjectsCarousel({ projects, presetKey }: { projects: NonNullable<SchemaData["projects"]>; presetKey: StylePresetKey }) {
  const preset = stylePresets[presetKey];
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  return (
    <div className="relative -mx-2">
      <div className="overflow-hidden px-2" ref={emblaRef}>
        <div className="flex gap-4">
          {projects.map((proj, i) => (
            <div key={i} className="flex-[0_0_82%] sm:flex-[0_0_58%] min-w-0">
              <div className="rounded-xl border overflow-hidden" style={{ background: preset.palette.card, borderColor: preset.palette.border, borderRadius: preset.radius, boxShadow: preset.shadow }}>
                <div className="relative h-44 overflow-hidden">
                  <GenerativeProjectVisual seed={proj.name} presetKey={presetKey} />
                </div>
                <div className="p-4">
                  <div className="font-display font-bold text-base flex items-center justify-between gap-2" style={{ color: preset.palette.text }}>
                    {proj.name}
                    {proj.link && <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" style={{ color: preset.palette.accent }}><ExternalLink className="size-3.5" /></a>}
                  </div>
                  <p className="text-sm mt-1.5 leading-relaxed line-clamp-2" style={{ color: preset.palette.muted }}>{proj.description}</p>
                  {proj.tech && <div className="mt-3 flex flex-wrap gap-1.5">{proj.tech.slice(0, 5).map((t, ti) => <TechPill key={ti} tech={t} presetKey={presetKey} />)}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => emblaApi?.scrollPrev()} className="size-8 rounded-full border flex items-center justify-center text-sm hover:opacity-80 transition-opacity" style={{ borderColor: preset.palette.border, color: preset.palette.text }}>←</button>
        <button onClick={() => emblaApi?.scrollNext()} className="size-8 rounded-full border flex items-center justify-center text-sm hover:opacity-80 transition-opacity" style={{ borderColor: preset.palette.border, color: preset.palette.text }}>→</button>
      </div>
    </div>
  );
}

// ── Inline Three.js accent orbs (kept for fallback) ────────────────────
export function ThreeAccent({ presetKey }: { presetKey: StylePresetKey }) {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !stylePresets[presetKey].features.threeAccent) return;
    let raf = 0, renderer: any, mounted = true;
    (async () => {
      const THREE = await import("three");
      if (!mounted || !mountRef.current) return;
      const el = mountRef.current;
      const w = el.clientWidth, h = el.clientHeight;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
      camera.position.z = 8;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
      el.appendChild(renderer.domElement);
      const group = new THREE.Group();
      scene.add(group);
      const colors = presetKey === "dark_pro" ? [0x38bdf8, 0x7c3aed, 0x0ea5e9] : [0x7c3aed, 0xec4899, 0x38bdf8];
      for (let i = 0; i < 3; i++) {
        const g = new THREE.SphereGeometry(1.0 + i * 0.2, 32, 32);
        const m = new THREE.MeshStandardMaterial({ color: colors[i], transparent: true, opacity: presetKey === "dark_pro" ? 0.5 : 0.3, roughness: 0.3, metalness: 0.1 });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set((i - 1) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
        group.add(mesh);
      }
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const dl = new THREE.DirectionalLight(0xffffff, 1.5);
      dl.position.set(5, 8, 5);
      scene.add(dl);
      const animate = () => {
        raf = requestAnimationFrame(animate);
        group.rotation.y += 0.003;
        group.rotation.x += 0.001;
        group.children.forEach((m: any, idx: number) => { m.position.y += Math.sin(Date.now() * 0.0005 + idx * 1.5) * 0.003; });
        renderer.render(scene, camera);
      };
      animate();
    })();
    return () => { mounted = false; cancelAnimationFrame(raf); renderer?.dispose?.(); if (mountRef.current && renderer?.domElement?.parentNode === mountRef.current) mountRef.current.removeChild(renderer.domElement); };
  }, [presetKey]);
  if (!stylePresets[presetKey].features.threeAccent) return null;
  return <div ref={mountRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden />;
}

// Removed SectionNavigator in favor of custom style-specific layouts
// ── Contact Bar ────────────────────────────────────────────────────────
export function ContactRow({ data, presetKey, className = "" }: { data: SchemaData; presetKey: StylePresetKey; className?: string }) {
  const preset = stylePresets[presetKey];
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
        <Mail className="size-3" style={{ color: preset.palette.accent }} />
        <span style={{ color: preset.palette.muted }}>{data.contact.email}</span>
      </span>
      {data.contact.phone && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <Phone className="size-3" style={{ color: preset.palette.accent }} />
          <span style={{ color: preset.palette.muted }}>{data.contact.phone}</span>
        </span>
      )}
      {data.contact.links?.map((l, i) => (
        <a key={i} href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
          style={{ color: preset.palette.accent }}>
          <ExternalLink className="size-3" />{l.label}
        </a>
      ))}
    </div>
  );
}

// ── Custom Sections ──────────────────────────────────────────────────────
export function CustomSections({ data, presetKey }: { data: SchemaData; presetKey: StylePresetKey }) {
  if (!data.custom_sections || data.custom_sections.length === 0) return null;
  const preset = stylePresets[presetKey];

  return (
    <>
      {data.custom_sections.map((sec, i) => (
        <section key={i} className="mb-10 last:mb-0">
          <SectionHeading label={sec.title} presetKey={presetKey} />
          <ul className="space-y-2 list-none p-0 m-0">
            {sec.items.map((item, j) => (
              <li key={j} className="text-sm leading-relaxed flex items-start gap-3" style={{ color: preset.palette.text }}>
                <span className="shrink-0 mt-1.5 size-1.5 rounded-full" style={{ background: preset.palette.accent }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
