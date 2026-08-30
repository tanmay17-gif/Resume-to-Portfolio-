# Resume-to-Portfolio Platform — Full Build Plan

This is a real product to launch (not a hackathon submission — the idea originated from a GNKC Hackathon 2026 problem statement, but scope/approach here is our own). It converts any resume (PDF/DOC, any layout) into a live, editable, shareable portfolio website.

**Hard constraint: free tier only, everywhere. No service that requires a card.**

---

## 1. Resume Extraction

**Goal:** get accurate structured data out of any resume, regardless of layout, color, or images.

- Open the PDF (convert DOC → PDF first if needed) with **PyMuPDF**.
- Attempt plain text extraction first.
- Detect layout complexity: check for multi-column structure / non-linear text order / low extraction confidence — **not** presence of color or images (a plain 2-column resume breaks; a single-column resume with a colored header doesn't).
- **Simple/single-column layout** → use the plain extracted text directly. No LLM vision call needed (cost + speed optimization).
- **Complex/multi-column layout** → render that page to an image with PyMuPDF, send the image to a **vision-capable LLM (Gemini)** for extraction. This avoids field-jumbling that raw draw-order text extraction causes on non-linear layouts.
- Rate-limit handling: pool **2 free Gemini API keys** behind a round-robin queue with retry/backoff.
- Extraction agent returns a **confidence score** alongside its output — used by the orchestrator to decide retry/escalate, not to separately judge "how hard" the layout was.

## 2. Data Schema (flexible, not rigid)

- Common **optional** fields: name, contact, education, experience, projects, skills, achievements, links.
- Only populate fields that are actually found in the resume — nothing pre-forced.
- Plus **one catch-all array** for unusual/custom sections (Certifications, Publications, Volunteering, etc.) so nothing found gets dropped just because it doesn't fit the standard fields.
- This single schema is what every layout/style renders from — the layout engine shows only sections that exist for that user.

## 3. Portfolio Generation — Design-Token System

- **Not** separate full templates per style. One shared component base: **Tailwind + shadcn/Radix**.
- Tokens control: corner radius, shadow/blur intensity, color palette, texture, spacing scale.
- Each visual style = one preset combination of these tokens. New style later = new preset, not new codebase.
- **User-facing style options (shown in the picker):** Minimal, Glass, Bold, Soft, Dark Pro, Classic, Grid, Retro.
  (Internal/technical names can stay as Glassmorphism, Neo-Brutalism, Bento, etc. — don't show jargon to users.)
- User selects their style from the main upload screen (or right after extraction).

### Supplementary libraries (layered on top of the token engine, not replacing it)
Safe to add — these don't impose their own visual system:
- Icons: Lucide, Phosphor, Tabler, Heroicons, Font Awesome
- Motion: Framer Motion, GSAP, AOS, Lenis
- 3D/visual flair (for select styles only): Three.js, React Three Fiber, Lottie, Rive
- Carousels (for Grid/Bento project galleries): Swiper, Embla
- Unstyled accessible primitives: Radix UI, Ark UI, Base UI, Headless UI

**Explicitly excluded** — full component libraries with their own baked-in design systems (would fight the token engine): MUI, Chakra, Ant Design, Bootstrap, Bulma, DaisyUI, NextUI/HeroUI, Mantine, PrimeReact, Preline, Flowbite, Aceternity UI, Magic UI, HyperUI, Uiverse.
→ Use these only as visual inspiration; rebuild anything useful as our own token-driven components.

## 4. Agent Architecture

One main **orchestrator** agent coordinates specialized subagents. Start with 1–2 agents; expand only if a specific step becomes a bottleneck or hits rate limits — don't over-build upfront.

**Agent-to-agent communication:** structured JSON only, never free text / natural-language chatter between agents.
- Extraction agent → `{ status, data: {schema fields}, confidence }`
- Orchestrator checks status/confidence → decides retry, skip, or proceed
- Structuring agent → `{ status, structured_data }`
- Generation agent receives `{ structured_data, selected_style }` → produces the portfolio
- The orchestrator is the only decision-maker (retry/skip/proceed logic). Worker agents just do their one job and return a result object. No agent "asks" another agent anything conversationally — keeps it fast, debuggable, avoids coordination overhead.

**Relative build difficulty** (based on scope + integration points + judgment/branching needed, not code volume):
- Extraction agent: **Hard** (vision LLM + fallback logic + confidence handling)
- Structuring agent: **Moderate**
- Generation agent: **Moderate–hard** (token system + many style combos)
- Orchestrator: **Easy to build, hard to debug**

## 5. Backend & Auth

- **Supabase** — auth + database. Free tier, no card.

## 6. Editing & Iteration

- **Pre-publish:** user reviews/edits extracted data before the portfolio goes live.
- **Post-publish:** user can request changes via a chat prompt → triggers **targeted re-generation of just the affected section** (not a full re-run through all agents). This iterative editing loop is a core product feature, not an afterthought.

## 7. Deployment

- **Single Next.js app, one Vercel deployment** (free tier, no card).
- Each user's portfolio is rendered **dynamically by slug/ID** from Supabase data — **not** a separate deployment per user. This avoids per-user build/deployment limits and keeps it free and fast at any scale.

## 8. Insights

- **PostHog** — portfolio visit analytics. Free tier, no card. (Not Tinybird — gets card-gated sooner.)

## 9. Output / Final UX

- Every published portfolio gets a **unique shareable link**.
- Delivered via a card UI with: the link, a short message, an **insights** button, and a **request changes** button (opens the chat prompt flow described in section 6).

## 10. Main Interface

- Should feel **Claude-like in interaction pattern** (conversational, simple) but **visually distinct** — using one of the chosen style presets from section 3.

---

## Known open problem (unsolved, worth designing early)
How resume content maps onto **arbitrary** style/layout combinations reliably — i.e., ensuring any schema shape renders cleanly no matter which of the 8 style presets is picked. This is harder than either OCR accuracy or style variety and should be designed before scaling the number of styles.
