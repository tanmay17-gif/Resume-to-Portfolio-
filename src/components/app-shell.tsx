"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { stylePresets, type StylePresetKey } from "@/lib/stylePresets";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  History,
  LogOut,
  Settings,
  User,
  HelpCircle,
  X,
  ChevronDown,
  Check,
  FileText as FileIcon,
  Clock,
  Loader2,
  AlertCircle,
  Trash,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
type SessionItem = {
  id: string;
  label: string;
  styleName: string;
  styleColor: string;
  publishedAt: string;
  slug?: string;
  portfolio_data_id?: string;
};

type PanelType = "profile" | "settings" | "help" | null;

// ─── Style meta ────────────────────────────────────────────────────────────
const STYLE_META: Record<string, { color: string; bg: string; dot: string }> = {
  minimal:  { color: "#374151", bg: "#f9fafb", dot: "#374151" },
  glass:    { color: "#4f46e5", bg: "#eef2ff", dot: "#4f46e5" },
  bold:     { color: "#b45309", bg: "#fef3c7", dot: "#f59e0b" },
  soft:     { color: "#6d6d80", bg: "#f5e9ff", dot: "#a78bfa" },
  dark_pro: { color: "#38bdf8", bg: "#09090b", dot: "#38bdf8" },
  classic:  { color: "#1e3a8a", bg: "#fffefb", dot: "#1e3a8a" },
  grid:     { color: "#4f46e5", bg: "#f8fafc", dot: "#4f46e5" },
  retro:    { color: "#00ff9f", bg: "#0a0e1a", dot: "#00ff9f" },
};

// ─── Style Dropdown ──────────────────────────────────────────────────────────
export function StyleDropdown({
  value,
  onChange,
}: {
  value: StylePresetKey;
  onChange: (v: StylePresetKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<StylePresetKey | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = stylePresets[value];
  const previewKey = hovered ?? value;
  const preview = stylePresets[previewKey];
  const meta = STYLE_META[previewKey] ?? STYLE_META.minimal;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-[#6b6860] hover:text-[#1a1a18] transition-colors py-0.5 px-1.5 rounded hover:bg-black/5"
      >
        <span className="size-1.5 rounded-full shrink-0" style={{ background: STYLE_META[value]?.dot ?? "#374151" }} />
        {current.label}
        <ChevronDown className="size-3" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full mb-2 left-0 z-50 flex gap-2"
          >
            <div className="bg-[#faf9f6] border border-[#d8d5cc] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-1.5 min-w-[140px]">
              {(Object.entries(stylePresets) as [StylePresetKey, typeof stylePresets[StylePresetKey]][]).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => { onChange(key); setOpen(false); }}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-[#f0ede4] group"
                >
                  <span className="size-1.5 rounded-full shrink-0 transition-transform group-hover:scale-125" style={{ background: STYLE_META[key]?.dot ?? "#374151" }} />
                  <span className="text-xs font-medium text-[#1a1a18]">{preset.label}</span>
                  {value === key && <Check className="size-3 text-[#1a1a18] ml-auto" />}
                </button>
              ))}
            </div>

            <motion.div
              key={previewKey}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="w-[150px] border border-[#d8d5cc] overflow-hidden self-start shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
              style={{ background: meta.bg }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: `${meta.color}25` }}>
                <div className="h-1.5 w-14 mb-1" style={{ background: meta.color, opacity: 0.9 }} />
                <div className="h-1 w-8" style={{ background: meta.color, opacity: 0.3 }} />
              </div>
              <div className="p-3 space-y-1.5">
                {[0.9, 0.7, 0.8, 0.5].map((w, i) => (
                  <div key={i} className="h-1" style={{ width: `${w * 100}%`, background: meta.color, opacity: 0.15 + i * 0.04 }} />
                ))}
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-7" style={{ background: meta.color, opacity: i === 0 ? 0.12 : 0.07, border: `1px solid ${meta.color}25` }} />
                  ))}
                </div>
              </div>
              <div className="px-3 pb-3">
                <span className="text-[8px] font-semibold uppercase tracking-[0.16em]" style={{ color: meta.color }}>
                  {preview.internal}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full shrink-0 transition-colors duration-200 ${checked ? "bg-[#1a1a18]" : "bg-[#d8d5cc]"}`}
    >
      <span className={`absolute top-0.5 size-4 rounded-full bg-[#faf9f6] shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

// ─── Right Side Panel ────────────────────────────────────────────────────────
function RightPanel({ type, userEmail, onClose }: { type: PanelType; userEmail?: string; onClose: () => void }) {
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "U";

  const [displayName, setDisplayName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [compactSidebar, setCompactSidebar] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCompactSidebar(localStorage.getItem("setting-compact-sidebar") === "true");
    setAnalyticsEnabled(localStorage.getItem("setting-analytics") !== "false");
    setEmailNotifs(localStorage.getItem("setting-email-notifs") === "true");
    setReducedMotion(localStorage.getItem("setting-reduced-motion") === "true");
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setDisplayName(data.user?.user_metadata?.display_name ?? "");
    });
  }, []);

  function persist(key: string, value: boolean) {
    localStorage.setItem(key, String(value));
  }

  async function handleProfileSave() {
    setProfileSaving(true);
    setProfileError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
    setProfileSaving(false);
    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  }

  const titles: Record<NonNullable<PanelType>, string> = {
    profile: "Profile",
    settings: "Settings",
    help: "Help & Support",
  };

  return (
    <AnimatePresence>
      {type && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/15 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.6 }}
            className="fixed right-0 top-0 bottom-0 w-[340px] max-w-full border-l border-[#d8d5cc] z-50 flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.06)]"
            style={{ background: "var(--ed-cream, #faf9f6)" }}
            role="dialog"
            aria-modal
            aria-label={titles[type]}
          >
            {/* Header */}
            <div className="h-12 flex items-center justify-between px-5 border-b border-[#e0ddd4] shrink-0">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9a9890]">{titles[type]}</span>
              <button onClick={onClose} className="size-7 flex items-center justify-center hover:bg-[#eeebe3] transition-colors" aria-label="Close panel">
                <X className="size-3.5 text-[#6b6860]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {type === "profile" && (
                <>
                  <div className="flex items-center gap-4 py-4 border-b border-[#e0ddd4]">
                    <div className="size-12 bg-[#1a1a18] flex items-center justify-center text-[#faf9f6] font-semibold text-base shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1a1a18]">Your Account</div>
                      <div className="text-xs text-[#6b6860] mt-0.5 truncate max-w-[200px]">{userEmail}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9a9890]" htmlFor="ed-display-name">Display Name</label>
                      <input
                        id="ed-display-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => { setDisplayName(e.target.value); setProfileSaved(false); }}
                        placeholder="Your name"
                        className="w-full bg-[#f7f5f0] border border-[#d8d5cc] px-3 py-2.5 text-sm text-[#1a1a18] outline-none focus:border-[#1a1a18] transition-colors placeholder:text-[#9a9890]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9a9890]">Email</label>
                      <input
                        type="email"
                        value={userEmail ?? ""}
                        readOnly
                        className="w-full bg-[#eeebe3] border border-[#d8d5cc] px-3 py-2.5 text-sm text-[#9a9890] outline-none cursor-not-allowed"
                      />
                    </div>
                    {profileError && (
                      <div className="flex items-center gap-2 text-xs text-red-600">
                        <AlertCircle className="size-3.5" />
                        {profileError}
                      </div>
                    )}
                  </div>
                </>
              )}

              {type === "settings" && (
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9a9890] pb-3 border-b border-[#e0ddd4]">Interface</div>
                  {[
                    { id: "toggle-compact", label: "Compact sidebar", desc: "Always use icon-only sidebar", value: compactSidebar, setter: (v: boolean) => { setCompactSidebar(v); persist("setting-compact-sidebar", v); } },
                    { id: "toggle-motion", label: "Reduce motion", desc: "Minimise animations and transitions", value: reducedMotion, setter: (v: boolean) => { setReducedMotion(v); persist("setting-reduced-motion", v); } },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3.5 border-b border-[#eeebe3]">
                      <div>
                        <div className="text-sm font-medium text-[#1a1a18]">{item.label}</div>
                        <div className="text-xs text-[#9a9890] mt-0.5">{item.desc}</div>
                      </div>
                      <Toggle checked={item.value} onChange={item.setter} id={item.id} />
                    </div>
                  ))}

                  <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9a9890] pb-3 pt-5 border-b border-[#e0ddd4]">Privacy & Data</div>
                  {[
                    { id: "toggle-analytics", label: "Usage analytics", desc: "Share anonymous data to improve the product", value: analyticsEnabled, setter: (v: boolean) => { setAnalyticsEnabled(v); persist("setting-analytics", v); } },
                    { id: "toggle-notifs", label: "Email notifications", desc: "Receive updates when your portfolio is viewed", value: emailNotifs, setter: (v: boolean) => { setEmailNotifs(v); persist("setting-email-notifs", v); } },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3.5 border-b border-[#eeebe3]">
                      <div>
                        <div className="text-sm font-medium text-[#1a1a18]">{item.label}</div>
                        <div className="text-xs text-[#9a9890] mt-0.5">{item.desc}</div>
                      </div>
                      <Toggle checked={item.value} onChange={item.setter} id={item.id} />
                    </div>
                  ))}

                  <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9a9890] pb-3 pt-5 border-b border-[#e0ddd4]">Account</div>
                  <div className="py-3 space-y-3">
                    <button className="w-full text-left text-sm text-[#6b6860] hover:text-[#1a1a18] transition-colors py-1 border-b border-[#eeebe3]">Export my data</button>
                    <button className="w-full text-left text-sm text-red-600 hover:text-red-700 transition-colors py-1">Delete account</button>
                  </div>
                </div>
              )}

              {type === "help" && (
                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9a9890] mb-3">How it works</div>
                    <div className="space-y-2.5">
                      {[
                        "Upload a PDF or DOCX resume in the chat.",
                        "AI extracts and structures your data automatically.",
                        "Review and edit the extracted information.",
                        "Choose a visual style from the dropdown.",
                        "Publish your portfolio — get a shareable link instantly.",
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[10px] font-semibold text-[#9a9890] w-4 shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-xs text-[#6b6860] leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-[#e0ddd4]" />
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9a9890] mb-3">FAQ</div>
                    <div className="space-y-4">
                      {[
                        { q: "What file types are supported?", a: "PDF and DOCX files up to 5MB." },
                        { q: "Can I edit my portfolio after publishing?", a: "Yes — use the AI refine bar to make changes any time." },
                        { q: "Is the public link permanent?", a: "Yes, your portfolio stays live at /your-slug." },
                        { q: "Can I change the style after publishing?", a: "Yes — select a new style from the dropdown and republish." },
                      ].map((faq, i) => (
                        <div key={i} className="pb-4 border-b border-[#eeebe3]">
                          <div className="text-sm font-medium text-[#1a1a18] mb-1">{faq.q}</div>
                          <div className="text-xs text-[#6b6860]">{faq.a}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer — only profile */}
            {type === "profile" && (
              <div className="p-5 border-t border-[#e0ddd4] shrink-0">
                {profileSaved && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 mb-3">
                    <Check className="size-3.5" /> Changes saved
                  </div>
                )}
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a1a18] text-[#faf9f6] text-sm font-medium py-2.5 hover:bg-[#2e2d2a] transition-colors disabled:opacity-60"
                >
                  {profileSaving && <Loader2 className="size-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Avatar Menu ─────────────────────────────────────────────────────────────
function AvatarMenu({ userEmail, onSelect, onLogout }: { userEmail?: string; onSelect: (panel: NonNullable<PanelType>) => void; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "U";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { icon: User, label: "Profile", action: () => { onSelect("profile"); setOpen(false); } },
    { icon: Settings, label: "Settings", action: () => { onSelect("settings"); setOpen(false); } },
    { icon: HelpCircle, label: "Help", action: () => { onSelect("help"); setOpen(false); } },
  ] as const;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="size-7 flex items-center justify-center bg-[#1a1a18] text-[#faf9f6] text-[10px] font-semibold hover:bg-[#2e2d2a] transition-colors"
        aria-label="Account menu"
      >
        {initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-48 bg-[#faf9f6] border border-[#d8d5cc] shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-1.5 z-50"
          >
            <div className="px-2.5 py-2 mb-1 border-b border-[#eeebe3]">
              <div className="text-[10px] font-medium text-[#9a9890] truncate">{userEmail ?? "Account"}</div>
            </div>
            {items.map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-[#f0ede4] transition-colors text-sm text-[#1a1a18]"
              >
                <Icon className="size-3.5 text-[#9a9890]" />
                {label}
              </button>
            ))}
            <div className="h-px bg-[#eeebe3] my-1" />
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-red-50 transition-colors text-sm text-red-600"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main AppShell ───────────────────────────────────────────────────────────
export function AppShell({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    const compact = localStorage.getItem("setting-compact-sidebar");
    if (compact === "true") setCollapsed(true);
    else if (saved) setCollapsed(saved === "true");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("portfolios")
        .select("id, slug, style_preset, published, published_at, portfolio_data_id, portfolio_data!inner(schema_data)")
        .order("published_at", { ascending: false })
        .limit(12);

      const items: SessionItem[] = (data ?? []).map((p: any) => {
        const meta = STYLE_META[p.style_preset] ?? STYLE_META.minimal;
        const preset = stylePresets[p.style_preset as StylePresetKey];
        return {
          id: p.id,
          label: p.portfolio_data?.schema_data?.name ?? p.slug ?? "Untitled",
          styleName: preset?.label ?? p.style_preset,
          styleColor: meta.dot,
          publishedAt: p.published_at
            ? new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "",
          slug: p.slug,
          portfolio_data_id: p.portfolio_data_id,
        };
      });
      setSessions(items);
    })();
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function openSession(session: SessionItem) {
    setActiveSessionId(session.id);
    setMobileOpen(false);
    // For now, we'll route to /dashboard and let the app manage state based on URL/localStorage
    router.push(`/dashboard?session=${session.id}`);
  }

  async function deleteSession(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const supabase = createClient();
    await supabase.from("portfolios").delete().eq("id", id);
    setSessions(s => s.filter(x => x.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      router.push("/dashboard");
    }
  }

  const SidebarContent = (
    <>
      <div className="h-12 flex items-center gap-2.5 px-3.5 border-b border-[#e0ddd4] shrink-0">
        <div className="size-6 bg-[#1a1a18] flex items-center justify-center shrink-0">
          <FileIcon className="size-3.5 text-[#faf9f6]" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-[#1a1a18] leading-none tracking-tight">Resume to Portfolio</div>
            <div className="text-[9px] text-[#9a9890] mt-0.5 tracking-[0.12em] uppercase">AI Studio</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="size-6 flex items-center justify-center hover:bg-[#eeebe3] transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-3 text-[#9a9890]" /> : <PanelLeftClose className="size-3 text-[#9a9890]" />}
        </button>
      </div>

      <div className="p-3 shrink-0">
        <button
          onClick={() => router.push(`/dashboard?new=${Date.now()}`)}
          className={`flex items-center gap-2 bg-[#1a1a18] text-[#faf9f6] text-[11px] font-medium tracking-wide hover:bg-[#2e2d2a] transition-colors w-full ${collapsed ? "justify-center p-2" : "px-3 py-2"}`}
        >
          <Plus className="size-3.5 shrink-0" />
          {!collapsed && "New portfolio"}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-auto px-2.5 pb-4">
          <div className="px-1 py-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9a9890] flex items-center gap-1.5">
            <History className="size-2.5" /> Sessions
          </div>
          {sessions.length === 0 ? (
            <div className="text-[11px] text-[#9a9890] px-3 py-6 text-center leading-relaxed">
              No sessions yet.<br />Upload a resume to start.
            </div>
          ) : (
            <div className="space-y-px">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => openSession(s)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openSession(s)}
                  className={`group w-full flex items-center gap-2.5 px-2.5 py-2 text-left transition-colors relative cursor-pointer ${activeSessionId === s.id ? "bg-[#e8e4da]" : "hover:bg-[#eeebe3]"}`}
                >
                  <span className="size-1.5 rounded-full shrink-0" style={{ background: s.styleColor }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium text-[#1a1a18] pr-6">{s.label}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#9a9890]">{s.styleName}</span>
                      {s.publishedAt && (
                        <>
                          <span className="text-[#d8d5cc]">·</span>
                          <span className="text-[10px] text-[#9a9890] flex items-center gap-0.5">
                            <Clock className="size-2.5" />{s.publishedAt}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteSession(e, s.id)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#d8d5cc] rounded transition-all"
                    title="Delete session"
                  >
                    <Trash className="size-3 text-[#6b6860]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <div className="flex-1 flex flex-col items-center gap-1.5 py-3">
          <Link href="/dashboard" className="size-7 flex items-center justify-center hover:bg-[#eeebe3] transition-colors" title="New portfolio">
            <Plus className="size-3.5 text-[#6b6860]" />
          </Link>
          <div className="size-7 flex items-center justify-center" title="Sessions">
            <History className="size-3.5 text-[#9a9890]" />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--ed-ivory, #f7f5f0)" }}>
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-[#e0ddd4] transition-all duration-200 z-20 ${collapsed ? "w-14" : "w-[228px]"}`}
        style={{ background: "var(--ed-cream, #faf9f6)" }}
      >
        {SidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/20 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.6 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-56 z-50 flex flex-col border-r border-[#e0ddd4]"
              style={{ background: "var(--ed-cream, #faf9f6)" }}
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-12 flex items-center px-4 md:px-5 gap-3 border-b border-[#e0ddd4] shrink-0 sticky top-0 z-30"
          style={{ background: "var(--ed-cream, #faf9f6)" }}
        >
          <button
            className="md:hidden size-7 flex items-center justify-center hover:bg-[#eeebe3] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <PanelLeftOpen className="size-3.5 text-[#6b6860]" />
          </button>

          <div className="hidden md:flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase font-medium text-[#9a9890]">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            AI Workspace
          </div>

          <div className="ml-auto flex items-center gap-2">
            <AvatarMenu
              userEmail={userEmail}
              onSelect={(panel) => setActivePanel(panel)}
              onLogout={handleLogout}
            />
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0 relative">
          {children}
        </main>
      </div>

      <RightPanel
        type={activePanel}
        userEmail={userEmail}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
}

