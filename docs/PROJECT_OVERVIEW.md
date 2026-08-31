# Resume-to-Portfolio — Complete Project Overview
This document is the single source of truth for a new partner joining this project. It covers everything: what the product is, the full stack, every file's purpose, the design token system, the data flow, what is fully built, and what is left to build.

---

## 1. What Is This Product?

**Resume to Portfolio** is an AI-powered tool that:
1. Takes a user's resume (PDF/DOCX)
2. Uses **Gemini AI** to extract, structure, and polish the content
3. Lets the user review and edit the extracted data
4. Renders it as a premium portfolio website in **8 distinct visual styles**
5. Publishes it at a shareable URL `/{slug}`

The key differentiator is the **8 style presets** — not just color changes, but fundamentally different layout engines, motion systems, typography, and visual languages. A user can get a Brutalist portfolio, a Glassmorphic one, a terminal Retro one, or a clean Minimal one — all from the same resume data.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js 16.3.3 (App Router, Turbopack) | Server + client components, file-based routing |
| **Language** | TypeScript 5 | Strict mode |
| **Styling** | Tailwind CSS 4 + shadcn/ui (base-nova neutral) | Component system from shadcn, design tokens in `globals.css` |
| **Database & Auth** | Supabase (Postgres + Auth + Storage + RLS) | `supabase-js 2.112.4` + `@supabase/ssr` |
| **AI** | Google Gemini via REST API | `gemini-3.6-flash`, 2-key round-robin pool in `lib/gemini.ts` |
| **PDF Parsing** | Python + PyMuPDF (`scripts/extract.py`) | DOCX via `mammoth` in Node |
| **Animations** | Framer Motion 13.1.1 | Motion wrapper in `portfolio-renderer.tsx` |
| **3D / Canvas** | Three.js + p5.js 2.3.2 | Orbs in hero, generative backgrounds |
| **Project Visuals** | CSS 3D transforms + Framer Motion | Taxonomy-driven artwork in `project-visual.tsx` |
| **Carousel** | Embla Carousel React | Used for Bold/Grid project carousels |
| **Icons** | Lucide React 1.34 | Skill icons, UI icons |
| **Analytics** | PostHog | `posthog-js` — live tracking planned for published portfolios |
| **Fonts** | Fontshare CDN | Cabinet Grotesk, Clash Display, General Sans, Switzer |
| **Hosting** | Localhost only (Vercel deferred) | No live URL yet |

---

## 3. Environment Variables

Stored in `.env.local` (gitignored). Copy `.env.example` as a template.

```
NEXT_PUBLIC_SUPABASE_URL=https://zaxfqfmrhntqipseoeaa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9fNpOnRY…
SUPABASE_SERVICE_ROLE_KEY=sb_secret_MargayFah…

GEMINI_API_KEY_1=AQ.Ab8RN…   # Both keys verified working on gemini-3.6-flash
GEMINI_API_KEY_2=AQ.Ab8RN…   # Pooled round-robin with backoff

NEXT_PUBLIC_POSTHOG_KEY=phc_xuxpBNKi…
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Important:** Gemini keys only work on `gemini-3.6-flash`, `3.5-flash`, `flash-latest`. Models `gemini-2.5` and `gemini-1.5` return 404 for these API key types.

---

## 4. Database Schema

Defined in `supabase.sql` (run once to set up the project).

```sql
-- 4 tables + RLS + Storage bucket "resumes"

resumes           -- tracks the uploaded file
  id (uuid)
  user_id (uuid → auth.users)
  original_filename (text)
  uploaded_at (timestamp)
  raw_extraction_status (pending | ok | error)
  raw_extraction_confidence (float 0-1)

portfolio_data    -- stores the AI-extracted JSON data
  id (uuid)
  resume_id (uuid → resumes)
  user_id (uuid → auth.users)
  schema_data (jsonb)   ← the main data blob
  updated_at (timestamp)

portfolios        -- created when user publishes
  id (uuid)
  portfolio_data_id (uuid → portfolio_data)
  user_id (uuid → auth.users)
  slug (text, unique)   ← used in /[slug] URL
  style_preset (text)   ← one of the 8 preset keys
  published (boolean)
  published_at (timestamp)

change_requests   -- for post-publish AI edit loop (not yet built)
  id (uuid)
  portfolio_id (uuid → portfolios)
  request_text (text)
  target_section (text)
  status (pending | applied | failed)
  created_at (timestamp)
```

**RLS Rules:** All tables require `user_id = auth.uid()` for read/write, except `portfolios` which allows public `SELECT WHERE published = true`.

---

## 5. The Core Data Shape (`SchemaData`)

Defined in `src/lib/schema.ts`. This is the single data contract that flows through the entire system.

```typescript
type SchemaData = {
  name: string;                              // REQUIRED
  contact: {                                 // REQUIRED
    email: string;
    phone: string | null;
    links: { label: string; url: string }[]; // e.g. GitHub, LinkedIn
  };
  summary?: string;                          // Optional — AI-generated
  education?: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience?: {
    title: string;
    company: string;
    dates: string;
    bullets: string[];                       // AI-rewritten to ≤16 words each
  }[];
  projects?: {
    name: string;
    description: string;
    tech: string[];
    link: string | null;
  }[];
  skills?: string[];
  achievements?: string[];
  custom_sections?: {
    title: string;
    items: string[];
  }[];
};
```

Everything optional. The renderer only renders sections that exist — no empty blocks.

---

## 6. Full File Map

### Root
```
/
├── .env.local               — secrets (gitignored)
├── .env.example             — template for new devs
├── supabase.sql             — DB schema + RLS + storage bucket setup
├── scripts/extract.py       — Python/PyMuPDF PDF text extraction
├── middleware.ts             — Supabase session refresh (SSR auth)
├── next.config.ts           — Next.js config
├── PROJECT_OVERVIEW.md      — THIS FILE
├── HANDOFF.md               — AI agent handoff notes (technical)
├── api-data-contract.md     — API request/response shapes
├── style-presets-spec.md    — Original design spec for 8 presets
├── build-prompt.md          — Original build instructions for AI agent
├── agent-operating-rules.md — Rules for AI agents working on this repo
└── resume-to-portfolio-plan.md — Original project plan
```

### `src/app/` — Pages (Next.js App Router)
```
page.tsx                      — Landing page (hero, how-it-works, CTA)
layout.tsx                    — Root layout: Geist font + PostHogProvider
globals.css                   — All design tokens: Tailwind4, CSS vars, aurora, liquid-glass, 3D utils

login/page.tsx                — Email/password login
signup/page.tsx               — Email/password signup
auth/callback/route.ts        — Supabase OAuth callback handler

dashboard/
  page.tsx                    — Server: verifies auth → DashboardClient
  dashboard-client.tsx        — Client: wrapped in AppShell (sidebar, history)

upload/
  page.tsx                    — Server: verifies auth → UploadClient
  upload-client.tsx           — Client: drag-drop upload + ProcessingSteps animation → auto-navigate to /review

review/[id]/
  page.tsx                    — Server: RLS fetch portfolio_data OR notFound()
  review-client.tsx           — Client: full edit form for all schema fields (add/remove/reorder)

styles/[id]/
  page.tsx                    — Server: auth check
  styles-client.tsx           — Client: 8-preset picker with thumbnails + live PortfolioRenderer preview

api/
  health/route.ts             — GET /api/health → 200 JSON
  extract/route.ts            — POST /api/extract: upload → Python → Gemini → store
  publish/route.ts            — POST /api/publish: creates portfolios row + slug
```

### `src/components/` — Shared UI Components
```
portfolio-renderer.tsx        — THE HEART. Renders SchemaData into a styled portfolio.
                                Takes (data: SchemaData, presetKey: StylePresetKey).
                                Contains: IdentityHeader, SectionNavigator, SkillsSection,
                                ProjectCard, ProjectsCarousel, ExperienceEntry, ThreeAccent,
                                TechPill — all layout-aware.

project-visual.tsx            — Generative project cover art.
                                Taxonomy-driven (AI / Web / Mobile / Data / Game / Default).
                                3-layer: background blobs → midground CSS 3D object → foreground grain.

app-shell.tsx                 — Dashboard app shell:
                                - Collapsible liquid-glass sidebar (session history)
                                - Top-right avatar + dropdown
                                - Bottom liquid-glass prompt bar + style Select

processing-steps.tsx          — 5-step animated upload progress:
                                Reading → Extracting → Structuring → Curating → Almost done

p5-bg.tsx                     — p5.js generative canvas background (used by Retro, Dark Pro, Bold presets)
aurora.tsx                    — Animated radial-gradient aurora background (landing + upload pages)
liquid-glass.tsx              — Liquid glass panel effect (sidebar, prompt bar)
posthog-provider.tsx          — PostHog analytics wrapper

ui/                           — shadcn/ui components:
  button, card, badge, input, label, textarea, separator,
  dropdown-menu, avatar, select
```

### `src/lib/` — Logic / Utilities
```
schema.ts                     — SchemaData type + validateSchemaData() + EMPTY_SCHEMA
stylePresets.ts               — The 8 style preset config objects (see section 7 below)
gemini.ts                     — 2-key round-robin Gemini API client with backoff
extraction.ts                 — Full extraction pipeline orchestrator:
                                  extractWithGeminiText() + extractWithGeminiVision() + structureWithGemini()
curation.ts                   — AI curation: rewrites bullets ≤16 words, generates summary
utils.ts                      — clsx/cn util

supabase/
  client.ts                   — Browser Supabase client (createBrowserClient)
  server.ts                   — Server Supabase client (createServerClient + cookies)
  middleware.ts               — Session refresh helper for middleware.ts
```

---

## 7. The Design Token System (Style Presets)

All 8 presets are defined in `src/lib/stylePresets.ts` as a single `stylePresets` record. Each preset has the same shape:

```typescript
type StylePreset = {
  label: string;              // User-facing: "Minimal", "Glass", etc.
  internal: string;           // Design language name for devs
  radius: string;             // Border radius CSS value
  shadow: string;             // Box-shadow CSS value
  border: string;             // Border CSS shorthand
  background: string;         // Page background (solid or gradient)
  texture: string;            // Optional CSS for texture overlays
  palette: {
    bg: string;               // Page/section background
    card: string;             // Card/panel background
    text: string;             // Primary text color
    muted: string;            // Secondary/caption text
    accent: string;           // Highlight color (links, icons, underlines)
    accentText: string;       // Text on accent background
    border: string;           // Border color
  };
  typography: {
    fontFamily: string;       // CSS font-family stack
    headingWeight: string;    // Font weight for headings
    bodyWeight: string;       // Font weight for body
  };
  spacing: string;            // Density descriptor
  layout: "stacked" | "floating" | "blocky" | "rounded-stack" |
          "dashboard" | "document" | "bento" | "boxed";
  features: {
    skillsAsIcons: boolean;           // Show Lucide icons next to skill names
    projectsCarousel: "carousel" | "grid" | "list" | "animated-list";
    techPills: "colored" | "mono" | "neon";
    motion: boolean;                  // Enable Framer Motion animations
    threeAccent: boolean;             // Show Three.js orbs in hero
  };
  classes: {
    wrapper: string;          // Tailwind classes for the root wrapper
    card: string;             // Tailwind classes for card elements
    section: string;          // Tailwind classes for section spacing
    heading: string;          // Tailwind classes for section headings
    accent: string;           // Tailwind classes for accent text/elements
  };
};
```

### The 8 Presets At a Glance

| Key | Label | Layout | Identity Hero | Projects |
|---|---|---|---|---|
| `minimal` | Minimal | stacked | Large editorial `Name.` + clean links | Horizontal editorial rows |
| `glass` | Glass | floating | Role badge + glassmorphic contact pills | Animated list |
| `bold` | Bold | blocky | Full-bleed 8xl type + brutalist border | Embla carousel |
| `soft` | Soft | rounded-stack | Centered neumorphic card | Grid |
| `dark_pro` | Dark Pro | dashboard | 7xl dark headline + Three.js orbs | Grid |
| `classic` | Classic | document | Centered serif + hairline dividers | Document list |
| `grid` | Grid | bento | Split 2-panel (name + summary) | Asymmetric bento grid |
| `retro` | Retro | boxed | Terminal box `┌─ PORTFOLIO.exe ─┐` | Grid |

### How Layout Drives the Renderer

In `portfolio-renderer.tsx`, the `layout` field drives branching:
- `document` → Classic linear document (no cards, hairlines)
- `bento` → Grid preset's asymmetric multi-column grid
- `blocky` → Bold's brutalist full-bleed blocks
- All others → Standard stacked sections with preset-specific heroes

The `PortfolioRenderer` component receives `(data, presetKey)` and renders the complete portfolio — including the hero, all sections, the section navigator, and the footer.

---

## 8. The Full User Flow

```
User opens /
    │
    ▼
Clicks "Start Building" → /upload
    │
    ▼
Drags PDF/DOCX (≤5MB)
    │
    POST /api/extract
    │  1. Python/PyMuPDF extracts text → confidence score
    │  2. If confidence < 0.6: Gemini Vision fallback (image_base64)
    │  3. Gemini structures raw text → SchemaData JSON
    │  4. Gemini curates: rewrites bullets, generates summary
    │  5. Inserts: resumes row + portfolio_data row + file in storage
    │
    ▼
ProcessingSteps animation (5 steps, auto-navigate)
    │
    ▼
/review/[id]   — ReviewClient
    │  Show all schema fields in editable form
    │  User can add/remove/reorder any section
    │  Save → supabase portfolio_data.update(schema_data)
    │
    ▼
User clicks "Choose Style" → /styles/[id]
    │  8 preset thumbnails shown
    │  Live PortfolioRenderer preview on right
    │  User selects preset
    │
    POST /api/publish
    │  Creates portfolios row (slug, style_preset, published=true)
    │
    ▼
[NOT YET BUILT] /[slug]   — Public portfolio page
    │  Anyone can view without auth
    │  PostHog tracking visits
```

---

## 9. The Portfolio Renderer Architecture

`portfolio-renderer.tsx` is the most complex file. It contains:

### Sub-components (all in the same file)
- **`SectionNavigator`** — Floating pill bar (About / Work / Experience / Capabilities). Spring-animated active pill via Framer `layoutId`. Scroll-tracked.
- **`IdentityHeader`** — The hero. Has 8 separate render branches, one per preset. The most design-critical component.
- **`ThreeAccent`** — Three.js orb cluster (only for Glass + Dark Pro). Renders into a `div` with absolute position.
- **`ProjectCard`** — Standard card (visual artwork + title + description + tech pills).
- **`ProjectsCarousel`** — Embla carousel wrapper for `carousel` mode.
- **`ExperienceEntry`** — Single job entry with expandable bullets (show 3, expand to all).
- **`SkillsSection`** — Tiered skills: top 6 with Lucide icons, next 10 as pills, rest collapsed.
- **`TechPill`** — Colored/mono/neon tag based on preset `features.techPills`.
- **`SectionHeading`** — Preset-aware section label (retro = `// LABEL`, classic = small-caps underline, etc.).
- **`M`** — Motion wrapper. Applies `whileInView` fade-in only if `preset.features.motion = true`.

### Layout Branching (inside `PortfolioRenderer`)
```
isClassic → document layout (single column, hairlines, no cards)
isBento   → bento layout (asymmetric 12-column grid)
default   → stacked layout (sections stacked vertically)
```

### Bento Grid Structure (Grid preset)
```
[Full width] Project #1 (7 cols wide) | Projects #2–3 (5 cols, stacked)
[Full width strip] Projects #4+ (4-up small grid)
[7 cols] Experience           | [5 cols] Education + Skills
[Full width] Achievements (3-col grid)
```

---

## 10. Project Visual System (`project-visual.tsx`)

Each project gets a generative cover artwork derived from its **name/description taxonomy**:

### Taxonomy Detection
The `getTaxonomy(seed)` function scans the project name for keywords:
- `ai, ml, llm, gpt, vision, model, neural` → `"ai"`
- `web, app, site, portal, react, next` → `"web"`
- `ios, android, mobile, expo, flutter` → `"mobile"`
- `data, pipeline, sql, analytics, dashboard` → `"data"`
- `game, 3d, unity, unreal` → `"game"`
- Anything else → `"default"`

### 3-Layer Composition
1. **Background** — Blurred ambient color orbs (unique palette per project via `hash % palettes.length`)
2. **Midground** — CSS 3D taxonomy object:
   - AI: spinning gyroscope (3 rotating circles + glowing core)
   - Web: tilting 3D browser wireframe
   - Mobile: rotating phone silhouette
   - Data: animated 3D bar chart
   - Game: rotating CSS cube
   - Default: spinning spherical rings
3. **Foreground** — Grain texture overlay

### Preset-specific overrides
- **Bold** → Black background, yellow/color blocks with 3px borders, no 3D
- **Minimal/Classic** → `#fafafa` background, clean line art, no blobs

---

## 11. What Is Fully Built ✅

| Feature | Status | Where |
|---|---|---|
| Auth (login/signup/logout) | ✅ | `/login`, `/signup`, `middleware.ts` |
| PDF/DOCX upload + extraction | ✅ | `upload-client.tsx`, `api/extract`, `scripts/extract.py` |
| Gemini AI structuring + curation | ✅ | `lib/extraction.ts`, `lib/curation.ts` |
| 5-step processing animation | ✅ | `components/processing-steps.tsx` |
| Review + edit all portfolio data | ✅ | `review/[id]/review-client.tsx` |
| 8 style presets | ✅ | `lib/stylePresets.ts` |
| Portfolio renderer (all 8 presets) | ✅ | `components/portfolio-renderer.tsx` |
| Style picker UI | ✅ | `styles/[id]/styles-client.tsx` |
| Publish API (creates slug) | ✅ | `api/publish/route.ts` |
| App shell (sidebar + history) | ✅ | `components/app-shell.tsx` |
| Landing page | ✅ | `app/page.tsx` |
| Section navigator in portfolios | ✅ | `components/portfolio-renderer.tsx` |
| 8 unique hero compositions | ✅ | `IdentityHeader` in `portfolio-renderer.tsx` |
| Generative project visuals | ✅ | `components/project-visual.tsx` |
| Asymmetric bento grid | ✅ | Bento layout in `portfolio-renderer.tsx` |
| PostHog analytics setup | ✅ | `components/posthog-provider.tsx` |
| Supabase RLS security | ✅ | `supabase.sql` |

---

## 12. What Is NOT Yet Built ❌

| Feature | Priority | Notes |
|---|---|---|
| **`/[slug]` public page** | 🔴 HIGH | The most important missing piece. Users can publish, but there's no page to view at `/their-slug`. Needs public read via Supabase RLS `published=true`. |
| **PostHog portfolio analytics** | 🟡 MED | Track visits on `/[slug]`. Show "X people viewed your portfolio this week" in dashboard. |
| **AI change requests** | 🟡 MED | The `change_requests` table exists but no UI. Post-publish "make my summary sound more senior" → Gemini regenerates only that section. |
| **Mobile responsive polish** | 🟡 MED | Reviewed on desktop only. Bento grid may collapse badly on mobile. |
| **Vercel live deploy** | 🟡 MED | Environment is localhost-only. Need: Vercel project, `NEXT_PUBLIC_SITE_URL` set, verify Supabase auth redirect URLs. |
| **Result card / share page** | 🟡 MED | After publish, user should see a card with their link, visit count, and edit options. |
| **Error states** | 🟠 LOW | Upload failures show generic errors. No retry UI. |
| **Rate limit handling** | 🟠 LOW | Supabase email auth has 3/hour limit for new signups. Need to document or work around. |
| **OG image for `/[slug]`** | 🟠 LOW | Portfolio pages need `og:image` for social sharing. |

---

## 13. Known Bugs

| Bug | Severity | Notes |
|---|---|---|
| **Cross-account 404 on `/review/[id]`** | Medium | RLS: if you open another user's review ID, you get a generic 404. Should show a proper error message instead. |
| **Upload terminal error (unconfirmed)** | Medium | Owner reported an error during upload. Stack trace not captured. Likely a Gemini curation step failure. Add better error boundaries. |
| **Sidebar only appears on authenticated routes** | Low | Landing page (`/`) still has old Phase 1 skeleton header. The Aurora + liquid-glass shell only appears after login on `/dashboard`, `/upload`, `/review`, `/styles`. |

---

## 14. Test Accounts

| Account | Password | Notes |
|---|---|---|
| `phase2test@example.com` | `Test1234!` | Working test account, has uploaded portfolio data |
| `tanmay.test123@example.com` | `Test1234!` | Owner's test account |

Login at `http://localhost:3000/login` after running `npm run dev`.

---

## 15. Running the Project

```bash
# Prerequisites
node 20+
python 3.14 with pymupdf: pip install pymupdf

# Install
npm install

# Set up .env.local (copy .env.example, fill in all values)

# Run database migrations
# Execute supabase.sql in your Supabase SQL editor

# Start dev server
npm run dev
# → http://localhost:3000
```

**Important:** Always hard-reload (`Ctrl+Shift+R`) after restarting the dev server or the old JS bundle may be served by the browser.

---

## 16. Architecture Decisions (Why We Made Certain Choices)

| Decision | Why |
|---|---|
| **Single `portfolio-renderer.tsx`** | All 8 presets use the same component tree. Adding a 9th preset = one more entry in `stylePresets.ts`. No separate templates. |
| **`SchemaData` in JSONB** | Flexible — new fields can be added without a DB migration. The renderer uses optional chaining everywhere. |
| **2-key Gemini pool** | Free tier has rate limits. Round-robin between two keys doubles throughput with backoff. |
| **CSS 3D for project visuals** | Three.js per-card creates WebGL context limit issues (browsers cap at ~16 concurrent). CSS 3D scales infinitely. |
| **Floating section navigator** | Long portfolios need quick navigation. Fixed bottom pill avoids disrupting the visual composition. |
| **No 9th style preset** | The spec says 8. Adding a 9th is a product decision, not a dev decision. |
| **PostHog deferred to `/[slug]`** | Tracking on the builder itself adds noise. The valuable metric is portfolio views, not builder usage. |

---

## 17. What a New Developer Should Do First

1. **Read** `api-data-contract.md` — understand the `SchemaData` type before touching anything
2. **Read** `style-presets-spec.md` — understand the design philosophy of each preset
3. **Run** `npm run dev` + open `http://localhost:3000`
4. **Login** as `phase2test@example.com / Test1234!`
5. **Navigate** to `/dashboard` — verify sidebar appears
6. **Upload** a test resume → watch ProcessingSteps → review data → pick a style
7. **Build** the missing `/[slug]` public page — that's Priority 1

The most impactful immediate task is building the public portfolio page at `/[slug]`. Everything else in the pipeline works — users just can't share their portfolios yet.
