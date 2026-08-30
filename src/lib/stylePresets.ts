export type StylePresetKey = "minimal" | "glass" | "bold" | "soft" | "dark_pro" | "classic" | "grid" | "retro";

export type StylePreset = {
  label: string;
  internal: string;
  radius: string;
  shadow: string;
  border: string;
  background: string;
  texture: string;
  palette: {
    bg: string;
    card: string;
    text: string;
    muted: string;
    accent: string;
    accentText: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: string;
    bodyWeight: string;
  };
  spacing: string;
  // Layout & library wiring — preset controls structure, not just colors
  layout: "stacked" | "floating" | "blocky" | "rounded-stack" | "dashboard" | "document" | "bento" | "boxed";
  features: {
    skillsAsIcons: boolean;
    projectsCarousel: "carousel" | "grid" | "list" | "animated-list";
    techPills: "colored" | "mono" | "neon";
    motion: boolean;
    threeAccent: boolean;
    threeUIVisual: "none" | "hero" | "project" | "both";
  };
  // Tailwind helper classes for the preset
  classes: {
    wrapper: string;
    card: string;
    section: string;
    heading: string;
    accent: string;
  };
};

export const stylePresets: Record<StylePresetKey, StylePreset> = {
  minimal: {
    label: "Minimal",
    internal: "Swiss / Flat / Minimalism",
    radius: "4px",
    shadow: "none",
    border: "1px solid #e5e5e5",
    background: "#ffffff",
    texture: "none",
    palette: {
      bg: "#f5f5f5",
      card: "#ffffff",
      text: "#171717",
      muted: "#737373",
      accent: "#171717",
      accentText: "#ffffff",
      border: "#e5e5e5",
    },
    typography: { fontFamily: "'Inter', 'Helvetica Neue', sans-serif", headingWeight: "600", bodyWeight: "400" },
    spacing: "generous",
    layout: "stacked",
    features: { skillsAsIcons: true, projectsCarousel: "animated-list", techPills: "mono", motion: true, threeAccent: false, threeUIVisual: "none" },
    classes: {
      wrapper: "bg-[#f5f5f5] text-[#171717]",
      card: "bg-white border border-[#e5e5e5] shadow-none rounded-[4px] p-8",
      section: "space-y-8",
      heading: "text-3xl font-semibold tracking-tight",
      accent: "text-[#171717]",
    },
  },
  glass: {
    label: "Glass",
    internal: "Glassmorphism",
    radius: "18px",
    shadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid rgba(255,255,255,0.4)",
    background: "linear-gradient(135deg, #e0f2fe 0%, #f0e6ff 50%, #ffe4e6 100%)",
    texture: "backdrop-filter: blur(16px)",
    palette: {
      bg: "#e0f2fe",
      card: "rgba(255,255,255,0.55)",
      text: "#1e293b",
      muted: "#64748b",
      accent: "#7c3aed",
      accentText: "#ffffff",
      border: "rgba(255,255,255,0.5)",
    },
    typography: { fontFamily: "'Cabinet Grotesk', 'General Sans', sans-serif", headingWeight: "700", bodyWeight: "400" },
    spacing: "medium",
    layout: "floating",
    features: { skillsAsIcons: true, projectsCarousel: "animated-list", techPills: "colored", motion: true, threeAccent: true, threeUIVisual: "hero" },
    classes: {
      wrapper: "bg-gradient-to-br from-sky-100 via-purple-50 to-rose-100 text-slate-800 min-h-screen",
      card: "bg-white/55 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[18px] p-6",
      section: "space-y-5",
      heading: "text-2xl font-medium tracking-tight",
      accent: "text-violet-600",
    },
  },
  bold: {
    label: "Bold",
    internal: "Neo-Brutalism",
    radius: "2px",
    shadow: "4px 4px 0 #000",
    border: "3px solid #000",
    background: "#facc15",
    texture: "none",
    palette: {
      bg: "#facc15",
      card: "#ffffff",
      text: "#000000",
      muted: "#1f2937",
      accent: "#ef4444",
      accentText: "#ffffff",
      border: "#000000",
    },
    typography: { fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif", headingWeight: "700", bodyWeight: "500" },
    spacing: "tight",
    layout: "blocky",
    features: { skillsAsIcons: true, projectsCarousel: "carousel", techPills: "mono", motion: true, threeAccent: false, threeUIVisual: "none" },
    classes: {
      wrapper: "bg-[#facc15] text-black",
      card: "bg-white border-[3px] border-black shadow-[4px_4px_0_#000] rounded-[2px] p-5",
      section: "space-y-4",
      heading: "text-3xl font-black uppercase tracking-tighter",
      accent: "bg-red-500 text-white px-2 py-1 inline-block",
    },
  },
  soft: {
    label: "Soft",
    internal: "Claymorphism / Neumorphism",
    radius: "22px",
    shadow: "8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.9)",
    border: "none",
    background: "#e8eef7",
    texture: "inset 0 1px 1px rgba(255,255,255,0.8)",
    palette: {
      bg: "#e8eef7",
      card: "#e8eef7",
      text: "#334155",
      muted: "#64748b",
      accent: "#a78bfa",
      accentText: "#ffffff",
      border: "transparent",
    },
    typography: { fontFamily: "'Cabinet Grotesk', 'General Sans', sans-serif", headingWeight: "700", bodyWeight: "500" },
    spacing: "medium",
    layout: "rounded-stack",
    features: { skillsAsIcons: true, projectsCarousel: "grid", techPills: "colored", motion: true, threeAccent: false, threeUIVisual: "none" },
    classes: {
      wrapper: "bg-[#e8eef7] text-slate-700",
      card: "bg-[#e8eef7] rounded-[22px] p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.4),_-8px_-8px_16px_rgba(255,255,255,0.9)] border-0",
      section: "space-y-5",
      heading: "text-2xl font-bold tracking-tight",
      accent: "text-violet-500",
    },
  },
  dark_pro: {
    label: "Dark Pro",
    internal: "Tech Minimalism / Dark Mode",
    radius: "12px",
    shadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#09090b",
    texture: "none",
    palette: {
      bg: "#09090b",
      card: "#18181b",
      text: "#fafafa",
      muted: "#a1a1aa",
      accent: "#38bdf8",
      accentText: "#ffffff",
      border: "rgba(255,255,255,0.08)",
    },
    typography: { fontFamily: "'Inter', 'General Sans', sans-serif", headingWeight: "500", bodyWeight: "400" },
    spacing: "compact",
    layout: "dashboard",
    features: { skillsAsIcons: true, projectsCarousel: "grid", techPills: "mono", motion: true, threeAccent: true, threeUIVisual: "hero" },
    classes: {
      wrapper: "bg-[#09090b] text-zinc-100",
      card: "bg-[#18181b] border border-white/5 rounded-[12px] p-6 shadow-2xl",
      section: "space-y-5",
      heading: "text-xl font-medium tracking-tight font-sans",
      accent: "text-sky-400",
    },
  },
  classic: {
    label: "Classic",
    internal: "Editorial / Print-style",
    radius: "3px",
    shadow: "none",
    border: "1px solid #e7e5e4",
    background: "#fffefb",
    texture: "none",
    palette: {
      bg: "#fffefb",
      card: "#ffffff",
      text: "#1c1917",
      muted: "#78716c",
      accent: "#1e3a8a",
      accentText: "#ffffff",
      border: "#e7e5e4",
    },
    typography: { fontFamily: "'Clash Display', Georgia, serif", headingWeight: "700", bodyWeight: "400" },
    spacing: "single-column",
    layout: "document",
    features: { skillsAsIcons: false, projectsCarousel: "list", techPills: "mono", motion: false, threeAccent: false, threeUIVisual: "none" },
    classes: {
      wrapper: "bg-[#fffefb] text-stone-900",
      card: "bg-white border-b border-stone-200 rounded-[3px] p-6 shadow-none",
      section: "space-y-6 max-w-3xl mx-auto",
      heading: "text-2xl font-serif font-bold tracking-tight uppercase text-xs tracking-widest",
      accent: "text-blue-900 border-b-2 border-blue-900 inline-block pb-1",
    },
  },
  grid: {
    label: "Grid",
    internal: "Bento Grid",
    radius: "14px",
    shadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    background: "#f8fafc",
    texture: "none",
    palette: {
      bg: "#f8fafc",
      card: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      accent: "#7c3aed",
      accentText: "#ffffff",
      border: "#e2e8f0",
    },
    typography: { fontFamily: "'Cabinet Grotesk', 'General Sans', sans-serif", headingWeight: "600", bodyWeight: "400" },
    spacing: "bento",
    layout: "bento",
    features: { skillsAsIcons: true, projectsCarousel: "carousel", techPills: "colored", motion: true, threeAccent: false, threeUIVisual: "project" },
    classes: {
      wrapper: "bg-[#f8fafc] text-slate-900",
      card: "bg-white border border-slate-200 rounded-[14px] p-5 shadow-sm",
      section: "grid gap-4",
      heading: "text-lg font-semibold tracking-tight",
      accent: "text-violet-600",
    },
  },
  retro: {
    label: "Retro",
    internal: "Y2K / Retro-futurism / Terminal",
    radius: "0px",
    shadow: "none",
    border: "2px solid #00ff9f",
    background: "#0a0e1a",
    texture: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,159,0.03) 2px, rgba(0,255,159,0.03) 4px)",
    palette: {
      bg: "#0a0e1a",
      card: "#111827",
      text: "#00ff9f",
      muted: "#06b6d4",
      accent: "#ff006e",
      accentText: "#ffffff",
      border: "#00ff9f",
    },
    typography: { fontFamily: "'Geist Mono', monospace", headingWeight: "700", bodyWeight: "400" },
    spacing: "boxed",
    layout: "boxed",
    features: { skillsAsIcons: true, projectsCarousel: "grid", techPills: "neon", motion: true, threeAccent: false, threeUIVisual: "none" },
    classes: {
      wrapper: "bg-[#0a0e1a] text-[#00ff9f] font-mono",
      card: "bg-[#111827] border-2 border-[#00ff9f] rounded-none p-5 shadow-none",
      section: "space-y-4 font-mono",
      heading: "text-lg font-bold uppercase tracking-widest border-b-2 border-[#ff006e] inline-block",
      accent: "text-[#ff006e]",
    },
  },
};

export const presetKeys = Object.keys(stylePresets) as StylePresetKey[];


