"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { stylePresets, type StylePresetKey } from "@/lib/stylePresets";
import type { SchemaData } from "@/lib/schema";
import {
  Loader2, ArrowUp, Paperclip, CheckCircle, ExternalLink,
  Copy, BarChart3, Sparkles, FileText, Check, X, Layers
} from "lucide-react";
import Link from "next/link";
import { AppShell, StyleDropdown } from "@/components/app-shell";
import { ReviewModal } from "@/components/review-modal";
import { PortfolioPreviewFrame } from "@/components/portfolio-preview-frame";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

// ─── Types ─────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: "user" | "agent";
  type: "text" | "upload" | "checklist" | "preview" | "published";
  content?: string;
  file?: { name: string; size: string };
  stylePreset?: StylePresetKey;
  schemaData?: SchemaData;
  publishedSlug?: string;
  steps?: string[];
  completedSteps?: number;
};

// ─── Checklist Block ─────────────────────────────────────────────────────────
function ChecklistBlock({ steps, completed, label }: { steps: string[]; completed: number; label: string }) {
  return (
    <div
      className="border border-[#d8d5cc] p-4 w-[320px]"
      style={{ background: "var(--ed-cream, #faf9f6)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-3 text-[#6b6860]" />
        <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#6b6860]">{label}</span>
      </div>
      <div className="space-y-2.5">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="size-4 shrink-0 flex items-center justify-center">
              {idx < completed ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : idx === completed ? (
                <Loader2 className="size-3.5 animate-spin text-[#1a1a18]" />
              ) : (
                <div className="size-1.5 rounded-full bg-[#d8d5cc]" />
              )}
            </div>
            <span className={`text-sm ${
              idx < completed
                ? "text-[#6b6860] line-through decoration-[#d8d5cc]"
                : idx === completed
                ? "text-[#1a1a18] font-medium"
                : "text-[#9a9890]"
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Published Card ──────────────────────────────────────────────────────────
function PublishedCard({ slug, onCopy, copied, views }: { slug: string; onCopy: () => void; copied: boolean; views: number }) {
  const url = `${window.location.origin}/${slug}`;
  return (
    <div className="border border-[#d8d5cc] p-5 w-full max-w-md" style={{ background: "var(--ed-cream, #faf9f6)" }}>
      <div className="flex items-center gap-2 text-emerald-700 mb-4">
        <Check className="size-4" />
        <span className="text-sm font-semibold">Published successfully</span>
      </div>
      <div className="border border-[#d8d5cc] p-3 flex items-center justify-between gap-2 mb-4" style={{ background: "var(--ed-ivory, #f7f5f0)" }}>
        <span className="text-xs font-mono text-[#6b6860] truncate">{url}</span>
        <button onClick={onCopy} className="p-1.5 hover:bg-[#e8e4da] transition-colors text-[#9a9890] hover:text-[#1a1a18] shrink-0">
          {copied ? <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider px-1">Copied</span> : <Copy className="size-3.5" />}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="ed-btn-ghost flex items-center justify-center gap-1.5 text-xs py-2 pointer-events-none opacity-80">
          <BarChart3 className="size-3.5" /> {views} Views
        </div>
        <Link
          href={`/${slug}`}
          target="_blank"
          className="ed-btn-primary flex items-center justify-center gap-1.5 text-xs py-2"
        >
          Open <ExternalLink className="size-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Workspace ───────────────────────────────────────────────────────────────
export function ChatWorkspace({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStyle, setSelectedStyle] = useState<StylePresetKey>("minimal");
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── WAKE UP RENDER MICROSERVICE ──────────────────────────────────────────
  useEffect(() => {
    // Ping to wake up the Render service as soon as they land on the dashboard.
    // This hides the 50-second cold start penalty inside the user's "think time"
    // (the time they spend reading the page and finding their PDF).
    fetch("/api/wake").catch(() => {});
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [publishing, setPublishing] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [processing, setProcessing] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [portfolioDataId, setPortfolioDataId] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<SchemaData | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const hasGenerated = messages.some(m => m.type === "preview");

  // Reset all workspace state when ?new= param changes (triggered by New Portfolio button)
  const newParam = searchParams.get("new");
  useEffect(() => {
    if (newParam) {
      setMessages([]);
      setPortfolioDataId(null);
      setLiveData(null);
      setAttachedFile(null);
      setSelectedStyle("minimal");
      setPromptText("");
      setProcessing(false);
      setPublishing(false);
      setReviewModalOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newParam]);

  // Load session from Supabase if ?session= URL parameter is present
  const sessionParam = searchParams.get("session");
  useEffect(() => {
    if (sessionParam) {
      const fetchSession = async () => {
        setProcessing(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("portfolios")
          .select("style_preset, portfolio_data_id, views, portfolio_data(schema_data)")
          .eq("id", sessionParam)
          .single();
        
        if (error) {
          setMessages([{ id: "error", role: "agent", type: "text", content: `Failed to load session: ${error.message}` }]);
          setProcessing(false);
          return;
        }

        if (data && data.portfolio_data) {
          // data.portfolio_data can be an array if not a unique foreign key, but it's a 1:1 or 1:N so supabase might return an object
          const schema = Array.isArray(data.portfolio_data) ? data.portfolio_data[0]?.schema_data : (data.portfolio_data as any).schema_data;
          
          if (schema) {
            setPortfolioDataId(data.portfolio_data_id);
            setLiveData(schema);
            setSelectedStyle((data.style_preset as StylePresetKey) || "minimal");
            setViews(data.views || 0);
            
            setMessages([{ 
              id: crypto.randomUUID(), 
              role: "agent", 
              type: "preview", 
              stylePreset: (data.style_preset as StylePresetKey) || "minimal", 
              schemaData: schema 
            }]);
          } else {
            setMessages([{ id: "error", role: "agent", type: "text", content: `Session found, but portfolio data schema is empty or missing.` }]);
          }
        } else {
           setMessages([{ id: "error", role: "agent", type: "text", content: `No data returned from database for this session ID.` }]);
        }
        setProcessing(false);
      };
      fetchSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionParam]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [promptText]);

  async function handlePublish(preset: StylePresetKey) {
    if (!portfolioDataId) return;
    setPublishing(true);
    const actId = crypto.randomUUID();
    const checklistSteps = ["Finalising design", "Building pages", "Deploying portfolio"];
    setMessages(prev => [...prev, {
      id: actId, role: "agent", type: "checklist",
      steps: checklistSteps, completedSteps: 0, label: "Publishing",
    } as any]);

    for (let i = 1; i <= checklistSteps.length; i++) {
      await new Promise(r => setTimeout(r, 900));
      setMessages(prev => prev.map(m => m.id === actId ? { ...m, completedSteps: i } : m));
    }

    try {
      let recaptchaToken = "";
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("publish_portfolio");
      }

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio_data_id: portfolioDataId, style_preset: preset, recaptcha_token: recaptchaToken }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Publish failed");

      setMessages(prev => prev.filter(m => m.id !== actId).concat([
        { id: crypto.randomUUID(), role: "agent", type: "published", publishedSlug: json.slug }
      ]));
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== actId).concat([
        { id: crypto.randomUUID(), role: "agent", type: "text", content: `Error publishing: ${(e as Error).message}` }
      ]));
    } finally {
      setPublishing(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!promptText.trim() && !attachedFile) || processing || publishing) return;

    const userMsg = promptText;
    const file = attachedFile;
    setPromptText("");
    setAttachedFile(null);

    // 1. Initial Upload Flow
    if (file && !portfolioDataId) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: "user", type: "upload",
        file: { name: file.name, size: `${(file.size / 1024).toFixed(0)} KB` }
      }]);
      
      setProcessing(true);
      const actId = crypto.randomUUID();
      const extractSteps = ["Scanning your story", "Mapping your journey", "Decoding credentials", "Cataloguing your craft", "Composing the blueprint"];
      
      setMessages(prev => [...prev, {
        id: actId, role: "agent", type: "checklist",
        steps: extractSteps, completedSteps: 0, label: "Bringing you to life",
      } as any]);

      // Fake fast progress for UI until actual request
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < 2) {
          currentStep++;
          setMessages(prev => prev.map(m => m.id === actId ? { ...m, completedSteps: currentStep } : m));
        }
      }, 1500);

      try {
        const formData = new FormData();
        formData.append("file", file);
        
        // Step 1: Parse PDF (can take up to 50s on cold start)
        const parseRes = await fetch("/api/extract/parse", { method: "POST", body: formData });
        const parseJson = await parseRes.json();
        
        if (!parseRes.ok || parseJson.status === "error" || parseJson.error) {
          throw new Error(parseJson.error || "Extraction failed during PDF parsing.");
        }

        // Step 2: Structure Data with Gemini (takes ~15s)
        const structRes = await fetch("/api/extract/structure", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pyResult: parseJson.pyResult,
            filename: parseJson.filename,
            mimetype: parseJson.mimetype
          }) 
        });
        const json = await structRes.json();
        
        clearInterval(interval);
        
        if (!structRes.ok || json.status === "error" || json.error) {
          throw new Error(json.error || "Extraction failed during AI structuring.");
        }
        
        setMessages(prev => prev.map(m => m.id === actId ? { ...m, completedSteps: extractSteps.length } : m));
        setPortfolioDataId(json.portfolio_data_id);
        setLiveData(json.curated_data || json.structured_data);

        setMessages(prev => prev.filter(m => m.id !== actId).concat([
          {
            id: actId, role: "agent", type: "checklist",
            steps: extractSteps, completedSteps: extractSteps.length, label: "Resume Extraction",
          } as any,
          {
            id: crypto.randomUUID(), role: "agent", type: "text",
            content: "Your story is ready to tell. Review your data below — make sure every detail shines before we craft your portfolio.",
          }
        ]));
      } catch (e) {
        clearInterval(interval);
        setMessages(prev => prev.filter(m => m.id !== actId).concat([
          { id: crypto.randomUUID(), role: "agent", type: "text", content: `Error: ${(e as Error).message}` }
        ]));
      } finally {
        setProcessing(false);
      }
      return;
    }

    // 2. Refining Flow (if already have data)
    if (portfolioDataId) {
      if (file) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(), role: "user", type: "upload",
          file: { name: file.name, size: `${(file.size / 1024).toFixed(0)} KB` }
        }]);
      } else {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", type: "text", content: userMsg }]);
      }

      setProcessing(true);
      const actId = crypto.randomUUID();
      const refineSteps = ["Reading between the lines", "Reshaping your narrative", "Painting the final strokes"];
      setMessages(prev => [...prev, {
        id: actId, role: "agent", type: "checklist",
        steps: refineSteps, completedSteps: 0, label: "Evolving your portfolio",
      } as any]);

      for (let i = 1; i <= refineSteps.length; i++) {
        await new Promise(r => setTimeout(r, 700));
        setMessages(prev => prev.map(m => m.id === actId ? { ...m, completedSteps: i } : m));
      }

      try {
        const res = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolio_data_id: portfolioDataId, request_text: userMsg }),
        });
        const json = await res.json();
        
        if (!res.ok || json.status === "error" || json.error) {
          throw new Error(json.error || "Refinement failed");
        }

        setLiveData(json.schema_data);
        setMessages(prev => prev.filter(m => m.id !== actId).concat([
          { id: crypto.randomUUID(), role: "agent", type: "preview", stylePreset: selectedStyle, schemaData: json.schema_data }
        ]));
      } catch (e) {
        setMessages(prev => prev.filter(m => m.id !== actId).concat([
          { id: crypto.randomUUID(), role: "agent", type: "text", content: `Error: ${(e as Error).message}` }
        ]));
      } finally {
        setProcessing(false);
      }
    }
  }

  function handleCopyLink(slug: string) {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleReviewProceed(updatedData: SchemaData, style: StylePresetKey) {
    setSelectedStyle(style);
    setLiveData(updatedData);
    setReviewModalOpen(false);
    
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", type: "text", content: "Looks good. Let's build it." }]);
    
    const actId = crypto.randomUUID();
    const generateSteps = ["Applying layout", "Generating sections", "Styling components", "Finalising portfolio"];
    setMessages(prev => [...prev, {
      id: actId, role: "agent", type: "checklist",
      steps: generateSteps, completedSteps: 0, label: "Portfolio Generation",
    } as any]);

    for (let i = 1; i <= generateSteps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setMessages(prev => prev.map(m => m.id === actId ? { ...m, completedSteps: i } : m));
    }
    
    setMessages(prev => prev.filter(m => m.id !== actId).concat([
      {
        id: actId, role: "agent", type: "checklist",
        steps: generateSteps, completedSteps: generateSteps.length, label: "Portfolio Generation",
      } as any,
      { id: crypto.randomUUID(), role: "agent", type: "preview", stylePreset: style, schemaData: updatedData }
    ]));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setAttachedFile(f);
    e.target.value = "";
  }

  return (
    <AppShell userEmail={userEmail}>
      {reviewModalOpen && liveData && portfolioDataId && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          portfolioDataId={portfolioDataId}
          initialData={liveData}
          onProceed={handleReviewProceed}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload resume"
      />

      <div className="flex flex-col flex-1 min-h-0 w-full relative">

        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 pb-44 space-y-7 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] h-full text-center px-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="size-20 rounded-2xl bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex items-center justify-center relative z-10 rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default">
                  <Sparkles className="size-8 text-emerald-600 drop-shadow-sm" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[2.8rem] md:text-[4.5rem] font-semibold tracking-tight text-[#1a1a18] max-w-xl mx-auto leading-[1.05]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your professional story,{" "}
                <span style={{ fontStyle: "italic", color: "var(--ed-accent, #059669)" }}>
                  beautifully told.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15px] md:text-base text-[#6b6860] mt-5 max-w-md mx-auto leading-relaxed"
              >
                Upload your standard PDF or DOCX resume, and watch our AI agents transform it into a stunning, production-ready portfolio in seconds.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="mt-12 flex items-center gap-6 text-[#9a9890] text-xs font-medium uppercase tracking-widest"
              >
                <span className="flex items-center gap-2"><CheckCircle className="size-3 text-emerald-500" /> Instant Extraction</span>
                <span className="hidden sm:flex items-center gap-2"><CheckCircle className="size-3 text-emerald-500" /> Auto-Themed</span>
                <span className="flex items-center gap-2"><CheckCircle className="size-3 text-emerald-500" /> Live URL</span>
              </motion.div>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              {msg.role === "user" ? (
                /* ── User bubble ── */
                <div className="max-w-[75%]">
                  <div
                    className="px-4 py-2.5 text-sm leading-relaxed"
                    style={{ background: "var(--ed-charcoal, #1a1a18)", color: "var(--ed-ivory, #f7f5f0)" }}
                  >
                    {msg.type === "text" && msg.content}
                    {msg.type === "upload" && (
                      <div className="flex items-center gap-3">
                        <div className="size-7 flex items-center justify-center border border-white/20">
                          <FileText className="size-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{msg.file?.name}</div>
                          <div className="text-[10px] opacity-60 mt-0.5">{msg.file?.size} · Uploaded</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ── Agent bubble ── */
                <div className="flex items-start gap-3 w-full">
                  <div
                    className="size-6 flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "var(--ed-line, #d8d5cc)" }}
                  >
                    <Sparkles className="size-3 text-[#6b6860]" />
                  </div>

                  <div className="flex-1 max-w-[90%]">
                    {msg.type === "text" && (
                      <div>
                        <div
                          className="text-sm text-[#1a1a18] border border-[#d8d5cc] px-4 py-3 inline-block leading-relaxed"
                          style={{ background: "var(--ed-cream, #faf9f6)" }}
                        >
                        {msg.content}
                        </div>
                      </div>
                    )}

                    {msg.type === "checklist" && (
                      <ChecklistBlock
                        steps={(msg as any).steps}
                        completed={(msg as any).completedSteps ?? 0}
                        label={(msg as any).label ?? "Processing"}
                      />
                    )}

                    {msg.type === "preview" && msg.schemaData && (
                      <div className="w-full mt-1">
                        <div className="flex items-center justify-between mb-2 pl-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9a9890]">
                              Preview
                            </span>
                            <span className="text-[10px] text-[#6b6860]">— {stylePresets[msg.stylePreset!].label}</span>
                          </div>
                          <button
                            onClick={() => handlePublish(msg.stylePreset!)}
                            disabled={publishing}
                            className="ed-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-60"
                          >
                            {publishing ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                            Publish
                          </button>
                        </div>

                        <div className="border border-[#d8d5cc] overflow-hidden h-[580px] max-h-[60vh] w-full flex flex-col">
                          <div
                            className="h-9 border-b border-[#e0ddd4] flex items-center px-4 gap-3 shrink-0"
                            style={{ background: "var(--ed-ivory, #f7f5f0)" }}
                          >
                            <div className="flex gap-1.5">
                              {[0,1,2].map(i => (
                                <div key={i} className="size-2 rounded-full bg-[#d8d5cc]" />
                              ))}
                            </div>
                            <div className="flex-1 text-center text-[10px] text-[#9a9890] font-mono tracking-wider">
                              preview / {msg.stylePreset}
                            </div>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <PortfolioPreviewFrame data={msg.schemaData} presetKey={msg.stylePreset!} />
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.type === "published" && msg.publishedSlug && (
                      <PublishedCard
                        slug={msg.publishedSlug}
                        onCopy={() => handleCopyLink(msg.publishedSlug!)}
                        copied={copied}
                        views={views}
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Premium Floating Toolbar */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 md:px-6 pb-6 pt-10 z-10 pointer-events-none flex flex-col items-center justify-end"
          style={{ background: "linear-gradient(to top, var(--ed-ivory, #f7f5f0) 50%, transparent)" }}
        >
          <AnimatePresence>
            {attachedFile && !portfolioDataId && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="pointer-events-auto mb-4"
              >
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 backdrop-blur-md"
                  style={{ background: "rgba(250,249,246,0.9)" }}
                >
                  <div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <FileText className="size-3 text-emerald-700" />
                  </div>
                  <span className="max-w-[200px] truncate text-xs font-medium text-[#1a1a18]">{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="ml-1 p-1 text-[#9a9890] hover:text-[#1a1a18] hover:bg-[#e8e4da] rounded-full transition-colors">
                    <X className="size-3" />
                  </button>
                  {!processing && (
                    <button
                      onClick={handleSend as any}
                      className="ml-2 size-7 rounded-full bg-[#1a1a18] text-[#faf9f6] flex items-center justify-center hover:bg-[#2e2d2a] transition-transform hover:scale-105 active:scale-95 shadow-md"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pointer-events-auto flex flex-col items-center">
            <div
              className="flex items-center gap-1 p-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e0ddd4] backdrop-blur-xl"
              style={{ background: "rgba(255,255,255,0.85)" }}
            >
              {/* Only show upload button BEFORE initial extraction */}
              {!portfolioDataId && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processing}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full hover:bg-white text-[#1a1a18] transition-all disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  {processing ? (
                    <Loader2 className="size-4 animate-spin text-[#9a9890]" />
                  ) : (
                    <Paperclip className="size-4 text-[#9a9890]" />
                  )}
                  <span className="text-xs font-semibold tracking-wide">{processing ? "Processing..." : "Attach Resume"}</span>
                </button>
              )}

              {/* Show controls AFTER extraction is complete */}
              {portfolioDataId && (
                <div className="flex items-center">
                  {hasGenerated && (
                    <div className="px-1">
                      <StyleDropdown value={selectedStyle} onChange={setSelectedStyle} />
                    </div>
                  )}
                  
                  {hasGenerated && <div className="w-px h-6 bg-[#e0ddd4] mx-2" />}

                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white text-[#1a1a18] transition-all group"
                  >
                    <Layers className="size-4 text-[#9a9890] group-hover:text-[#1a1a18] transition-colors" />
                    <span className="text-xs font-semibold tracking-wide">Review Data</span>
                  </button>
                </div>
              )}
            </div>

            {!portfolioDataId && !attachedFile && !processing && (
              <div className="mt-4 opacity-60">
                <span className="text-[10px] font-medium text-[#1a1a18] tracking-widest uppercase">
                  Start by uploading a PDF or DOCX
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {portfolioDataId && liveData && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          portfolioDataId={portfolioDataId}
          initialData={liveData}
          onProceed={handleReviewProceed}
        />
      )}
    </AppShell>
  );
}

