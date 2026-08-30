# Build Prompt: Resume-to-Portfolio Platform

You are building a real product (not a hackathon demo). Build it in the phases below, in order. Do not skip ahead. After each phase, verify it actually works end-to-end before moving to the next — don't just write code and assume it's correct.

**Hard rule:** every service used must be free-tier and must NOT require a credit card. If at any point you need me to sign up for an account, generate an API key, or click "create project" on some dashboard — STOP, tell me exactly what to go create/click and what to paste back to you, and wait for me to give you the value before continuing.

## Accompanying files (read all of these before starting — they are part of this spec, not optional reference)

- **`style-presets-spec.md`** — exact token values (radius, shadow, border, background, texture, palette, typography, spacing) for each of the 8 style presets. Use this directly when building the `stylePresets` config in Phase 5. Do not invent your own values for the presets.
- **`api-data-contract.md`** — exact Supabase table schemas, the flexible resume data shape, and the exact JSON request/response contract for every pipeline step (extraction, structuring, generation, change requests), plus the full list of environment variables you'll need. Build the database and all pipeline functions to match this file exactly.
- **`agent-operating-rules.md`** — how you should behave while building: when to stop and ask me for credentials, how to report errors, how to handle checkpoints, what counts as "done." Follow this for the entire build, not just Phase 0.

If anything in this build prompt seems to conflict with one of these three files, the more specific file wins (e.g. style-presets-spec.md overrides any style detail mentioned loosely here) — flag the conflict to me either way.

---

## Tech stack

- **Frontend/backend:** Next.js (single app, both UI and API routes)
- **Styling:** Tailwind CSS + shadcn/ui + Radix UI primitives
- **Database + Auth:** Supabase (free tier)
- **Resume parsing:** PyMuPDF (Python) — either as a small Python microservice or via a Node wrapper, your call, but keep it simple
- **Vision extraction (complex layouts only):** Gemini API (free tier), 2 API keys pooled with round-robin + retry/backoff
- **Icons:** Lucide / Tabler (pick one, be consistent)
- **Motion:** Framer Motion (add later, not phase 1)
- **Analytics:** PostHog (free tier)
- **Hosting:** Vercel (free tier), single deployment, portfolios rendered dynamically by slug — never a new deployment per user

---

## Overall flow (what the finished product does)

1. User signs up / logs in (Supabase auth).
2. User uploads a resume (PDF or DOC).
3. System extracts resume data:
   - Try plain text extraction (PyMuPDF).
   - If layout looks simple/single-column → use that text directly.
   - If layout looks complex/multi-column → render page(s) to image, send to Gemini vision, extract structured data.
4. Extracted data is normalized into the flexible schema (see below) and shown to the user on an editable review screen.
5. User edits/confirms the data, then picks a visual style (Minimal, Glass, Bold, Soft, Dark Pro, Classic, Grid, Retro).
6. System generates the portfolio page using the design-token engine + chosen style, and publishes it to a unique slug/URL.
7. User gets a result card: live link, "view insights" button, "request changes" button.
8. "Request changes" opens a chat box — user describes what to change, system regenerates only the affected section.
9. "View insights" shows PostHog analytics for that portfolio (visits, etc.).

---

## Data schema (flexible)

```
{
  name: string,
  contact: { email, phone?, links: [{label, url}] },
  summary?: string,
  education?: [{ degree, institution, year }],
  experience?: [{ title, company, dates, bullets: [string] }],
  projects?: [{ name, description, tech?: [string], link? }],
  skills?: [string],
  achievements?: [string],
  custom_sections?: [{ title: string, items: [string] }]  // catch-all for anything that doesn't fit above
}
```
All top-level fields except `name` and `contact` are optional — only render sections that have data.

---

## Agent communication contract (for the extraction/structuring/generation pipeline)

Use structured JSON between steps, never free-text prompts between agents:
- Extraction step returns: `{ status: "ok"|"error", data: {...schema fields}, confidence: 0-1 }`
- If `confidence` is low, retry once (e.g. re-render at higher resolution) before failing.
- Structuring step returns: `{ status, structured_data: {...full schema} }`
- Generation step receives: `{ structured_data, selected_style }` and returns the rendered portfolio.
- A single orchestrator function/service makes all retry/skip/proceed decisions. Worker functions do one job only and return a result object.

---

## Phases (build and verify in this order)

### Phase 0 — Accounts & setup
Tell me to create, in this order, and tell me exactly what to paste back after each:
1. Supabase project (free tier) → paste back the project URL + anon key.
2. Gemini API — 2 free API keys → paste both back.
3. Vercel account (free tier, connect to GitHub) → confirm once connected.
4. PostHog account (free tier) → paste back the project API key.

Do not proceed to Phase 1 until all four are confirmed working with a trivial test call/connection.

### Phase 1 — Skeleton app
- Scaffold Next.js app with Tailwind + shadcn/ui installed.
- Connect Supabase (auth + a placeholder table).
- Deploy the empty skeleton to Vercel and confirm the live URL loads.
- **Checkpoint:** confirm with me that the live URL works before continuing.

### Phase 2 — Auth
- Build sign up / log in / log out using Supabase auth.
- **Checkpoint:** I create a test account and confirm login works on the live deployed URL (not localhost).

### Phase 3 — Resume upload & extraction
- Build upload UI (PDF/DOC).
- Implement PyMuPDF text extraction + layout-complexity detection.
- Implement Gemini vision fallback for complex layouts, with the 2-key round-robin + retry/backoff.
- Return data in the schema format above.
- **Checkpoint:** test with (a) a simple single-column resume and (b) a multi-column/styled resume. Confirm both extract correctly before continuing.

### Phase 4 — Review & edit screen
- Show extracted data in an editable form (add/remove/reorder sections, edit any field).
- Save edits back to Supabase.
- **Checkpoint:** confirm edits persist correctly.

### Phase 5 — Design-token engine + style picker
- Build the token system (radius, shadow, color palette, texture, spacing) as configurable variables.
- Implement the 8 style presets: Minimal, Glass, Bold, Soft, Dark Pro, Classic, Grid, Retro.
- Build the style picker UI.
- Build the portfolio renderer that takes schema data + selected style and outputs the page.
- **Checkpoint:** confirm the same resume data renders visibly differently across at least 3 styles.

### Phase 6 — Publish & shareable link
- Generate a unique slug per portfolio.
- Render portfolios dynamically at `/[slug]` from Supabase data (no per-user deployments).
- **Checkpoint:** confirm the live public link works when opened in an incognito window (i.e. actually public, not just for the logged-in user).

### Phase 7 — Result card + insights + request changes
- Build the final result card (link, insights button, request-changes button).
- Integrate PostHog and show basic visit analytics.
- Build the "request changes" chat box → route the request to regenerate only the relevant section.
- **Checkpoint:** confirm a real change request (e.g. "change my summary") only updates that section and nothing else breaks.

### Phase 8 — Polish
- Responsive check across mobile/tablet/desktop.
- Error states (upload fails, extraction fails, low confidence).
- Loading states throughout.

---

## Rules while building
- After every phase, tell me clearly: what was built, what to test, and wait for my confirmation before moving on.
- Never silently skip a checkpoint.
- If any integration fails (API key invalid, rate limit hit, deployment error), stop and report the exact error — don't guess a workaround that hides the problem.
- Keep the token system and style presets easy to extend — new styles should only require adding a new token preset, not new components.
