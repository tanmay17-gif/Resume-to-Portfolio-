# Resume-to-Portfolio — Antigravity Handoff Report
**Date:** 2026-08-27 15:58 IST | **Workspace:** `C:\Users\tanmay\Documents\Resume to Porfolio` (path contains space — use `workdir` param) | **Repo:** git, no remote | **Build:** `Next.js 16.3.3 Turbopack` `npm run build ✓` | **Mode:** Localhost only — **live Vercel URL NOT yet deployed** per owner request “skip Vercel for now”

---

### 1. Built & Confirmed Working (localhost — NOT live URL)

**Phase 0 — Accounts:** Verified live via trivial calls: Supabase `zaxfqfmrhntqipseoeaa.supabase.co` (`sb_publishable_` + `sb_secret_`) Auth health `v2.195.0` + REST; Gemini 2 keys `AQ.Ab8RN…` both `200` on `gemini-3.6-flash` / `3.5-flash` / `flash-latest` (1.5/2.5 return 404 for new keys); PostHog `phc_xuxpBNKi… @ https://us.i.posthog.com` `capture 200` (initial `phx_…` rejected). Vercel intentionally not connected. Stored in `.env.local` (gitignored).

**Phase 1 — Skeleton:** `Next.js 16.3.3 App Router + TS + Tailwind 4 + shadcn/ui base-nova neutral` + `globals.css`, `lib/supabase/{client,server,middleware}` + `middleware.ts` SSR, `posthog-provider.tsx`, `gemini.ts` 2-key round-robin + backoff, `supabase.sql` (4 tables + RLS + `storage.buckets resumes`), `/api/health` + hero `page.tsx`. `http://localhost:3000` + `/api/health` 200 locally.

**Phase 2 — Auth:** `/login`, `/signup`, `/auth/callback`, `/dashboard` (server `getUser` → `redirect /login`). Verified locally: created `phase2test@example.com / Test1234!` + `tanmay.test123@example.com / Test1234!` via `service.auth.admin.createUser(email_confirm:true)`, login/logout + `307 /dashboard → /login` when unauth. Owner confirmed “login and logout move next” on localhost. Not tested live.

**Phase 3 — Upload & Extraction:** `scripts/extract.py` PyMuPDF `get_text` + `blocks` x-variance heuristic + `confidence` + `get_pixmap(dpi 150/200) → image_base64`; `lib/extraction.ts` orchestrator + `extractWithGeminiText/Vision` (`gemini-3.6-flash`); `api/extract` handles PDF/DOC/DOCX ≤5MB (`mammoth` for DOCX), inserts `resumes` + `portfolio_data` + storage. Verified live: `test_simple2.pdf` → text extraction (`John Doe`), `test_complex.pdf` → vision fallback (`JANE SMITH`), both via live Gemini; owner’s resume → `vision fallback 85% ok` `resume_id 0de02678… portfolio_data a1b69f5d… Tanmay Chaudhary`. Phase 3 confirmed.

**Phase 4 — Review & Edit:** `/review/[id]` server RLS `eq(user_id)` else `notFound()`, `review-client.tsx` editable form for all `api-data-contract.md` fields (add/remove/reorder `ChevronUp/Down`), `Save` via `supabase.from('portfolio_data').update({schema_data})`. Verified: fetched `a1b69f5d… 41 skills` → edited → re-fetched persisted → reverted, both via `service` and via `anon` after `signIn` (RLS pass). Owner confirmed.

**Phase 5 — Token Engine / Style Picker (initial):** `lib/stylePresets.ts` 8 presets per `style-presets-spec.md`, `components/portfolio-renderer.tsx` shared `(data, presetKey)`, `/styles/[id]` picker + 3 thumbnails, `/api/publish` inserts `portfolios {slug, style_preset, published}`. Build ✓ locally. Owner then flagged “too generic — just recolor” and blocked Phase 6.

---

### 2. In Progress / Partially Done (built, not yet user-confirmed)

**Phase 5 Fixes (your 2 fix requests) — code complete, `npm run build ✓`, but owner still saw old UI because dev server not restarted and checked `/` instead of `/dashboard`:**

- **Fix 1 — Layout + Libraries:** Extended `stylePresets.ts` with `layout: stacked/floating/blocky/rounded-stack/dashboard/document/bento/boxed` + `features: {skillsAsIcons, projectsCarousel: carousel/grid/list/animated-list, techPills: colored/mono/neon, motion, threeAccent}`. Rewrote `portfolio-renderer.tsx`: `SkillTag` with **Lucide `Atom/Code2/Database…`**, **colored `TechPill`** (hashed `dbeafe/f3e8ff/…` + neon/mono), **Embla `useEmblaCarousel` for Grid/Bold**, **Framer Motion `motion.div` for Minimal/Glass** (+ all except Classic), **Three.js `THREE.Scene/SphereGeometry` orbs for Glass/Dark Pro**, **p5.js `noise` for Retro/Dark Pro/Bold** via `p5-bg.tsx`, **Show 3 more/less** truncation per job, layout branches (`document` hairline serif, `bento 5/7/12`, `boxed` terminal `┌─ //…`, `dashboard` pulse, etc.). Fonts switched to **Fontshare CDN `Cabinet Grotesk/Clash Display` for headings + `General Sans/Switzer` for body** (`globals.css:1`).

- **Fix 2 — App Shell:** Created `components/app-shell.tsx` + `aurora.tsx` + `liquid-glass.tsx`: **liquid-glass sidebar** `260/64` collapsible (localStorage) with **New session** + **History joined `portfolios → portfolio_data.schema_data.name`** (shows `name + style · /slug` + thumb dot, not filenames ×3), **top-right `Avatar` + `DropdownMenu`**, **bottom liquid-glass prompt bar** with **style `Select` (8 presets) + input + `Send`**. Wrapped `dashboard/upload/review/styles` with `AppShell`; `/` landing still old skeleton (shell lives on `/dashboard` etc.). Added **Aurora** (`28s` `radial-gradient` `blur(36px)`) behind hero/upload + **Liquid Glass** cursor highlight (`--mouse-x/y`), glass only on floating panels, content `clean #fafafa`.

- **Flow + Curation:** Created `lib/curation.ts` `{status, curated_data}` — Gemini rewrites bullets ≤16 words + generates 2-3 sentence about-me; `api/extract` now `extraction → structuring → curation → store curated_data`; `upload-client.tsx` replaced **raw JSON dump with 5-step `ProcessingSteps`** (`Reading… → Extracting… → Structuring… → Curating… → Almost done…` spinners) auto-navigating to `/review/[id]`.

- **Missing to consider done:** Owner must `Ctrl+C → npm run dev → Ctrl+Shift+R` + open **`/dashboard`** (not `/`) to see liquid-glass sidebar/bottom bar; toggle 8 presets at `/styles/[id]` to confirm *structural* distinctness (icons/carousel/motion/Three/p5/show-more), not just recolor; confirm **dev overlay gone** + **Upload → Processing → Review** without raw JSON/404.

---

### 3. Not Started

- **Phase 6 — Publish & Shareable Link:** `/api/publish` exists but **`/[slug]` dynamic public page** not built; need RLS `select where published=true` public read, incognito verification, no per-user deployments.
- **Phase 7 — Result Card + Insights + Request Changes:** Result card (`/slug` link + view insights + request changes), PostHog visit analytics display, chat box `POST /change-request` regenerating **only** `target_section`.
- **Phase 8 — Polish:** Responsive mobile/tablet/desktop, error/loading states throughout.
- **Vercel Live Deploy:** No production deployment, no `NEXT_PUBLIC_SITE_URL` live verification.

---

### 4. Known Issues / Bugs

- **Dev overlay “N — 2 Issues”:** Causes were (1) `lucide-react` `Figma` not exported → replaced with `Palette`, (2) `DropdownMenuTrigger asChild` + inner `<button>` → nested `<button>` hydration mismatch (`app-shell.tsx:275`). Both **fixed** (`DropdownMenuTrigger` now directly styled, no inner button) and `npm run build ✓`, but **not yet confirmed gone in owner’s browser** — requires dev restart + hard-reload.
- **`/review/262eaa42-7e96-4019-be39-d2d4b614bca2` 404:** Not a code bug — **auth mismatch**. That row’s `user_id 7fba25b9` = `phase2test@example.com` (verified live). If opened while logged in as `tanmay.test123` or logged out, `review/[id]/page.tsx:15` `eq(user_id)` → `notFound()` 404. Fix: stay on `phase2test` for that ID, or re-upload under desired account. Page currently returns generic 404; could show “owned by X, you are Y.”
- **Upload terminal error (owner reported, log not pasted):** Unknown — likely from new `p5`/`three` client-only imports or `curation` Gemini call during `POST /api/extract`. Needs pasted stack.
- **Sidebar/Bottom bar not visible (owner screenshot):** Owner checked `/` (landing) which still shows old Phase 1 skeleton; new **liquid-glass sidebar + bottom bar live only on `/dashboard`, `/upload`, `/review/[id]`, `/styles/[id]`** after restart. Not a bug.
- **Home `/` still old:** Still Phase 1 skeleton; not rebuilt to new Aurora/Minimal landing (only header tweaked violet). Not blocking app flow.
- **No live URL:** Everything localhost-only; live auth/public links not verified on Vercel per “Definition of done.”

---

### 5. Tech Stack — Actually Implemented

- **Planned:** `Next.js + Tailwind + shadcn/ Radix + Supabase + PyMuPDF + Gemini vision + Lucide/Tabler + Framer Motion (later) + PostHog + Vercel single deploy + /[slug]`.
- **Implemented Now:** `next 16.3.3 Turbopack + react 19.2.8 + TS 5 + tailwindcss 4 + shadcn base-nova neutral` (`button/card/badge/input/label/textarea/separator/dropdown-menu/avatar/select` + `clsx/cva/tw-merge/tw-animate-css`), `supabase-js 2.112.4 + supabase/ssr 0.12.5` (`client/server/middleware`), `posthog-js 1.421.2`, **PyMuPDF 1.28.0 + `scripts/extract.py` + `python 3.14`**, `mammoth` for DOCX, **Gemini via `fetch v1beta/models/gemini-3.6-flash:generateContent` 2-key pool**, **`lucide-react 1.34` (single set, Figma removed)**, **`framer-motion 13.1.1`**, **`embla-carousel-react` + `three` + `p5@2.3.2`**, Fontshare CDN fonts. No `Tabler`, no `Swiper` (used Embla), no `Rive/Lottie` (Three + p5 only). Email-confirm disabled for test users via `admin.createUser(email_confirm:true)`; manual signup hits “email rate limit exceeded” after 3/hour.

---

### 6. Environment / Credentials

- **Supabase — CONNECTED & VERIFIED LIVE:** `NEXT_PUBLIC_SUPABASE_URL=https://zaxfqfmrhntqipseoeaa.supabase.co`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9fNpOnRY…`, `SUPABASE_SERVICE_ROLE_KEY=sb_secret_MargayFah…` (`auth/v1/health v2.195.0` + `rest/v1/resumes` + `supabase.sql` executed → 4 tables + `storage.buckets resumes` + RLS all exist). Auth works.
- **Gemini — CONNECTED & VERIFIED LIVE:** `GEMINI_API_KEY_1/2 = AQ.Ab8RN…` both `200` on `gemini-3.6-flash`/`3.5-flash`/`flash-latest` (2.5/1.5 → 404 for new keys); pooled.
- **PostHog — CONNECTED & VERIFIED LIVE:** `NEXT_PUBLIC_POSTHOG_KEY=phc_xuxpBNKi…`, `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` (`capture 200`; `phx_…` rejected).
- **Vercel — NOT CONNECTED (deferred):** No project, no live URL, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
- **Files:** `.env.local` + `.env.example` at root (gitignored).

---

### 7. File/Folder Structure

```
Resume to Porfolio/                ← workspace root (git, no remote; space in path → use workdir)
├── .env.local / .env.example
├── supabase.sql                  ← 4 tables + RLS + storage bucket
├── scripts/extract.py            ← PyMuPDF extraction
├── src/
│   ├── app/
│   │   ├── page.tsx              ← landing (still Phase1 skeleton, header violet)
│   │   ├── layout.tsx            ← Geist + PostHogProvider
│   │   ├── globals.css           ← Tailwind4 + shadcn vars + Fontshare @import + aurora/liquid-glass
│   │   ├── login/ + signup/      ← Auth UI
│   │   ├── dashboard/            ← Server auth → DashboardClient (now AppShell)
│   │   ├── upload/ (page + upload-client) ← Aurora + LiquidGlass + ProcessingSteps, no JSON
│   │   ├── review/[id]/          ← RLS fetch → ReviewClient (AppShell)
│   │   ├── styles/[id]/          ← Picker + 3 thumbnails + PortfolioRenderer (AppShell)
│   │   ├── api/{health,extract,publish}/route.ts
│   │   └── auth/callback/route.ts
│   ├── components/
│   │   ├── ui/ (button/card/badge/input/label/textarea/separator/dropdown-menu/avatar/select)
│   │   ├── posthog-provider.tsx
│   │   ├── portfolio-renderer.tsx ← layout-aware (bento/document/boxed…), SkillTag (Lucide), TechPill, ProjectsCarousel (Embla), MotionSection, ThreeAccent, P5Background, show-more
│   │   ├── app-shell.tsx          ← collapsible liquid-glass sidebar (history name/style), top avatar, bottom liquid-glass prompt bar + style Select
│   │   ├── aurora.tsx + liquid-glass.tsx + p5-bg.tsx + processing-steps.tsx
│   │   └── three-bg (inside renderer)
│   └── lib/
│       ├── supabase/{client,server,middleware}.ts
│       ├── gemini.ts + extraction.ts + schema.ts + curation.ts + stylePresets.ts (layout+features)
│       └── utils.ts
├── public/ + node_modules/ + .next/
└── middleware.ts                 ← Supabase session refresh
```

**Next agent:** Have owner `Ctrl+C → npm run dev → Ctrl+Shift+R`, log in as `phase2test@example.com`, hit `/dashboard` to confirm liquid-glass sidebar/bottom bar + overlay gone, then test `Upload → Processing → Review` with same account (avoid cross-account 404), then toggle 8 presets at `/styles/[id]` for structural distinctness before touching Phase 6 (`/[slug]` public page).
