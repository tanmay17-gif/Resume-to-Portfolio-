import { useState, useEffect } from "react";
import type { SchemaData } from "@/lib/schema";
import { Plus, Trash2, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { StyleDropdown } from "@/components/app-shell";
import { type StylePresetKey } from "@/lib/stylePresets";

export function ReviewModal({
  isOpen,
  onClose,
  portfolioDataId,
  initialData,
  onProceed,
}: {
  isOpen: boolean;
  onClose: () => void;
  portfolioDataId: string;
  initialData: SchemaData;
  onProceed: (updatedData: SchemaData, style: StylePresetKey) => void;
}) {
  const [data, setData] = useState<SchemaData>(() => ({
    ...initialData,
    contact: {
      email: initialData.contact?.email ?? "",
      phone: initialData.contact?.phone ?? null,
      links: initialData.contact?.links ?? [],
    },
  }));
  const [selectedStyle, setSelectedStyle] = useState<StylePresetKey>("minimal");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [mounted, setMounted] = useState(false);

  // Mount effect for portal
  useEffect(() => setMounted(true), []);

  function update(path: string, value: unknown) {
    setData((prev) => {
      const next = structuredClone(prev) as Record<string, unknown>;
      const keys = path.split(".");
      let cur: Record<string, unknown> = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (k.includes("[")) {
          const [arr, idxStr] = k.split("[");
          const idx = parseInt(idxStr);
          const arrVal = cur[arr] as unknown[];
          cur = arrVal[idx] as Record<string, unknown>;
        } else {
          if (!(k in cur) || typeof cur[k] !== "object") cur[k] = {};
          cur = cur[k] as Record<string, unknown>;
        }
      }
      cur[keys[keys.length - 1]] = value;
      return next as SchemaData;
    });
    setSaved(false);
  }

  function addEducation() {
    setData((p) => ({
      ...p,
      education: [...(p.education ?? []), { degree: "", institution: "", year: "" }],
    }));
  }

  function removeEducation(idx: number) {
    setData((p) => ({ ...p, education: p.education?.filter((_, i) => i !== idx) }));
  }

  function move(arr: unknown[], from: number, to: number) {
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }

  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    setSaved(false);
    
    if (!data.name.trim() || !data.contact.email.trim()) {
      setError("Name and contact email are required.");
      setSaving(false);
      return;
    }
    
    const supabase = createClient();
    const { error } = await supabase
      .from("portfolio_data")
      .update({ schema_data: data, updated_at: new Date().toISOString() })
      .eq("id", portfolioDataId);
      
    setSaving(false);
    
    if (error) {
      setError(error.message);
      return;
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleProceed() {
    await handleSaveDraft();
    onProceed(data, selectedStyle);
  }

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/15 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="w-full max-w-5xl h-full max-h-[85vh] flex flex-col relative shadow-[0_16px_48px_rgba(0,0,0,0.1)] border border-[#d8d5cc]"
              style={{ background: "var(--ed-ivory, #f7f5f0)" }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 flex items-center justify-between border-b border-[#e0ddd4] shrink-0"
                style={{ background: "var(--ed-cream, #faf9f6)" }}
              >
                <div>
                  <h2 className="text-sm font-semibold text-[#1a1a18] tracking-wide">Review Data</h2>
                  <p className="text-[11px] text-[#6b6860] mt-0.5">Verify extracted information before generating.</p>
                </div>
                <button
                  onClick={onClose}
                  className="size-7 flex items-center justify-center hover:bg-[#eeebe3] text-[#6b6860] transition-colors rounded-sm"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Toast overlay */}
              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1a1a18] text-[#faf9f6] text-[11px] font-medium tracking-wide uppercase px-4 py-2 flex items-center gap-2 z-50"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    Saved successfully
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Nav Header */}
              <div
                className="flex md:hidden gap-2 overflow-x-auto px-5 py-2.5 border-b border-[#e0ddd4] shrink-0"
                style={{ background: "var(--ed-cream, #faf9f6)" }}
              >
                {[
                  { id: "basic", label: "Personal" },
                  { id: "experience", label: "Experience" },
                  { id: "education", label: "Education" },
                  { id: "projects", label: "Projects" },
                  { id: "skills", label: "Skills" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap transition-colors border ${
                      activeTab === tab.id
                        ? "bg-[#1a1a18] text-[#faf9f6] border-[#1a1a18]"
                        : "bg-transparent text-[#6b6860] border-[#d8d5cc] hover:bg-[#eeebe3]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Content Split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Nav */}
                <div
                  className="w-[200px] shrink-0 border-r border-[#e0ddd4] overflow-y-auto p-4 hidden md:flex flex-col gap-1"
                  style={{ background: "var(--ed-cream, #faf9f6)" }}
                >
                  {[
                    { id: "basic", label: "Personal", count: 1 },
                    { id: "experience", label: "Experience", count: data.experience?.length || 0 },
                    { id: "education", label: "Education", count: data.education?.length || 0 },
                    { id: "projects", label: "Projects", count: data.projects?.length || 0 },
                    { id: "skills", label: "Skills", count: (data.skills?.length || 0) + (data.achievements?.length || 0) }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-between px-3 py-2.5 transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#e8e4da] text-[#1a1a18]"
                          : "text-[#6b6860] hover:bg-[#eeebe3]"
                      }`}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">{tab.label}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#d8d5cc]/30 text-[#6b6860]">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Forms Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                  
                  {/* Basic Info */}
                  <div className={activeTab === "basic" ? "block" : "hidden md:block md:opacity-30 md:hover:opacity-100 transition-opacity mb-12"} onClick={() => setActiveTab("basic")}>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a9890] mb-5 border-b border-[#e0ddd4] pb-2">Personal & Contact</h3>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                      <div className="space-y-1.5">
                        <label className="text-label">Full Name</label>
                        <input className="ed-input" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-label">Email Address</label>
                        <input className="ed-input" value={data.contact.email} onChange={(e) => update("contact.email", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-label">Phone</label>
                        <input className="ed-input" value={data.contact.phone ?? ""} onChange={(e) => update("contact.phone", e.target.value || null)} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-label">Professional Summary</label>
                        <textarea className="ed-input resize-y min-h-[100px]" value={data.summary ?? ""} onChange={(e) => setData({ ...data, summary: e.target.value || undefined })} rows={4} />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className={activeTab === "experience" ? "block" : "hidden md:block md:opacity-30 md:hover:opacity-100 transition-opacity mb-12"} onClick={() => setActiveTab("experience")}>
                    <div className="flex items-center justify-between mb-5 border-b border-[#e0ddd4] pb-2">
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a9890]">Experience</h3>
                      <button className="ed-btn-ghost text-[10px] py-1 px-2 flex items-center gap-1" onClick={() => setData({ ...data, experience: [...(data.experience ?? []), { title: "", company: "", dates: "", bullets: [""] }] })}>
                        <Plus className="size-3" /> Add Role
                      </button>
                    </div>
                    <div className="space-y-6">
                      {(data.experience ?? []).map((exp, i) => (
                        <div key={i} className="group relative bg-[#faf9f6] border border-[#d8d5cc] p-5 transition-all">
                          <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="size-6 flex items-center justify-center border border-[#d8d5cc] hover:bg-[#e8e4da] text-[#6b6860] bg-[#faf9f6]" onClick={() => setData((p) => ({ ...p, experience: move(p.experience ?? [], i, i - 1) as typeof p.experience }))}><ChevronUp className="size-3" /></button>
                            <button className="size-6 flex items-center justify-center border border-[#d8d5cc] hover:bg-[#e8e4da] text-[#6b6860] bg-[#faf9f6]" onClick={() => setData((p) => ({ ...p, experience: move(p.experience ?? [], i, i + 1) as typeof p.experience }))}><ChevronDown className="size-3" /></button>
                            <button className="size-6 flex items-center justify-center border border-red-200 hover:bg-red-50 text-red-600 bg-[#faf9f6] ml-1" onClick={() => setData((p) => ({ ...p, experience: p.experience?.filter((_, idx) => idx !== i) }))}><Trash2 className="size-3" /></button>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-3 mb-4 pr-24">
                            <div className="space-y-1">
                              <label className="text-label">Title</label>
                              <input className="ed-input text-sm font-semibold" value={exp.title} onChange={(e) => { const n=[...(data.experience??[])]; n[i]={...n[i], title:e.target.value}; setData({...data, experience:n}); }} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-label">Company</label>
                              <input className="ed-input text-sm" value={exp.company} onChange={(e) => { const n=[...(data.experience??[])]; n[i]={...n[i], company:e.target.value}; setData({...data, experience:n}); }} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-label">Timeline</label>
                              <input className="ed-input text-sm text-[#6b6860]" value={exp.dates} onChange={(e) => { const n=[...(data.experience??[])]; n[i]={...n[i], dates:e.target.value}; setData({...data, experience:n}); }} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-label">Achievements</label>
                            {exp.bullets.map((b, bi) => (
                              <div key={bi} className="flex gap-2">
                                <textarea className="ed-input text-sm flex-1 min-h-[40px] resize-y" value={b} onChange={(e) => { const n=[...(data.experience??[])]; const nb=[...n[i].bullets]; nb[bi]=e.target.value; n[i]={...n[i], bullets:nb}; setData({...data, experience:n}); }} rows={2} />
                                <button className="text-[#9a9890] hover:text-red-500 shrink-0 mt-1 size-8 flex items-center justify-center transition-colors" onClick={() => { const n=[...(data.experience??[])]; n[i]={...n[i], bullets:n[i].bullets.filter((_, idx)=>idx!==bi)}; setData({...data, experience:n}); }}><Trash2 className="size-3.5" /></button>
                              </div>
                            ))}
                            <button className="ed-btn-ghost text-[10px] py-1 mt-1" onClick={() => { const n=[...(data.experience??[])]; n[i]={...n[i], bullets:[...n[i].bullets, ""]}; setData({...data, experience:n}); }}>+ Add Bullet</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className={activeTab === "education" ? "block" : "hidden md:block md:opacity-30 md:hover:opacity-100 transition-opacity mb-12"} onClick={() => setActiveTab("education")}>
                    <div className="flex items-center justify-between mb-5 border-b border-[#e0ddd4] pb-2">
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a9890]">Education</h3>
                      <button className="ed-btn-ghost text-[10px] py-1 px-2 flex items-center gap-1" onClick={addEducation}>
                        <Plus className="size-3" /> Add Degree
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {(data.education ?? []).map((ed, i) => (
                        <div key={i} className="group relative bg-[#faf9f6] border border-[#d8d5cc] p-4">
                          <button className="absolute right-2 top-2 size-6 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[#faf9f6] text-red-600 border border-red-200 transition-opacity" onClick={() => removeEducation(i)}><Trash2 className="size-3" /></button>
                          <input className="w-full bg-transparent border-0 font-semibold text-sm outline-none mb-1 focus:bg-white focus:ring-1 ring-[#d8d5cc] px-1 py-0.5" value={ed.degree} onChange={(e) => { const n=[...(data.education??[])]; n[i]={...n[i], degree:e.target.value}; setData({...data, education:n}); }} placeholder="Degree" />
                          <input className="w-full bg-transparent border-0 text-sm text-[#6b6860] outline-none mb-1 focus:bg-white focus:ring-1 ring-[#d8d5cc] px-1 py-0.5" value={ed.institution} onChange={(e) => { const n=[...(data.education??[])]; n[i]={...n[i], institution:e.target.value}; setData({...data, education:n}); }} placeholder="Institution" />
                          <input className="w-full bg-transparent border-0 text-xs text-[#9a9890] outline-none focus:bg-white focus:ring-1 ring-[#d8d5cc] px-1 py-0.5" value={ed.year} onChange={(e) => { const n=[...(data.education??[])]; n[i]={...n[i], year:e.target.value}; setData({...data, education:n}); }} placeholder="Year" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className={activeTab === "projects" ? "block" : "hidden md:block md:opacity-30 md:hover:opacity-100 transition-opacity mb-12"} onClick={() => setActiveTab("projects")}>
                    <div className="flex items-center justify-between mb-5 border-b border-[#e0ddd4] pb-2">
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a9890]">Projects</h3>
                      <button className="ed-btn-ghost text-[10px] py-1 px-2 flex items-center gap-1" onClick={() => setData({ ...data, projects: [...(data.projects ?? []), { name: "", description: "", tech: [], link: null }] })}>
                        <Plus className="size-3" /> Add Project
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(data.projects ?? []).map((proj, i) => (
                        <div key={i} className="group relative bg-[#faf9f6] border border-[#d8d5cc] p-4">
                          <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100">
                            <button className="size-6 flex items-center justify-center border border-[#d8d5cc] bg-[#faf9f6]" onClick={() => setData((p) => ({ ...p, projects: move(p.projects ?? [], i, i - 1) as typeof p.projects }))}><ChevronUp className="size-3 text-[#6b6860]" /></button>
                            <button className="size-6 flex items-center justify-center border border-[#d8d5cc] bg-[#faf9f6]" onClick={() => setData((p) => ({ ...p, projects: move(p.projects ?? [], i, i + 1) as typeof p.projects }))}><ChevronDown className="size-3 text-[#6b6860]" /></button>
                            <button className="size-6 flex items-center justify-center border border-red-200 bg-[#faf9f6] text-red-600" onClick={() => setData((p) => ({ ...p, projects: p.projects?.filter((_, idx) => idx !== i) }))}><Trash2 className="size-3" /></button>
                          </div>
                          
                          <input className="w-full bg-transparent border-0 font-bold text-sm outline-none mb-2 focus:bg-white focus:ring-1 ring-[#d8d5cc] px-1 py-1 pr-24" value={proj.name} onChange={(e) => { const n=[...(data.projects??[])]; n[i]={...n[i], name:e.target.value}; setData({...data, projects:n}); }} placeholder="Project Name" />
                          <textarea className="ed-input text-sm mb-3 resize-y min-h-[60px]" value={proj.description} onChange={(e) => { const n=[...(data.projects??[])]; n[i]={...n[i], description:e.target.value}; setData({...data, projects:n}); }} placeholder="Description..." />
                          <div className="grid grid-cols-2 gap-3">
                            <input className="ed-input text-xs" value={(proj.tech ?? []).join(", ")} onChange={(e) => { const n=[...(data.projects??[])]; n[i]={...n[i], tech:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}; setData({...data, projects:n}); }} placeholder="Tech stack (comma separated)" />
                            <input className="ed-input text-xs" value={proj.link ?? ""} onChange={(e) => { const n=[...(data.projects??[])]; n[i]={...n[i], link:e.target.value || null}; setData({...data, projects:n}); }} placeholder="URL Link" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-6 py-4 border-t border-[#e0ddd4] flex items-center justify-between shrink-0"
                style={{ background: "var(--ed-cream, #faf9f6)" }}
              >
                {error && <div className="text-[10px] text-red-600 flex items-center gap-1.5 uppercase font-semibold tracking-wide"><AlertCircle className="size-3.5" /> {error}</div>}
                {!error && <div />}
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border-r border-[#d8d5cc] pr-4">
                    <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9a9890]">Select Style</span>
                    <StyleDropdown value={selectedStyle} onChange={setSelectedStyle} />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      className="ed-btn-ghost text-xs px-5 py-2 disabled:opacity-60 flex items-center justify-center border border-[#d8d5cc]"
                      onClick={handleSaveDraft}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="size-3.5 animate-spin mr-2" /> : null}
                      Save Draft
                    </button>
                    <button
                      className="ed-btn-primary text-xs px-6 py-2 disabled:opacity-60 flex items-center justify-center"
                      onClick={handleProceed}
                      disabled={saving}
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
