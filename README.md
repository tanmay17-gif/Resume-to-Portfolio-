# Resume to Portfolio — AI Studio

> **Transform a standard resume into a fully-designed, production-ready personal portfolio website in minutes.**

Resume to Portfolio is an AI-powered single-page application (SPA) that eliminates the friction of building a personal website. By uploading a standard PDF or DOCX resume, the platform leverages large language models (Google Gemini) to intelligently parse your professional history, structure it into a comprehensive data schema, and instantly generate a themed, responsive, and publicly hosted portfolio.

Unlike traditional website builders that require manual drag-and-drop or template configuration, this platform operates as an **AI Studio**. The entire experience — from data extraction to style selection, review, and publishing — happens in one seamless, unified workspace.

---

## 🌟 Core Features

- **Instant AI Extraction:** Upload any standard resume. The AI reads between the lines to map your work experience, parse education, catalogue skills, and structure projects.
- **Human-in-the-Loop Review:** Before generation, you have full control to inspect, edit, and enrich the extracted data via an intuitive modal interface.
- **Dynamic Theming Engine:** Switch between entirely different visual languages (e.g., Minimal, Retro, Dark Pro, Glass) instantly. The themes are built on a robust design token system, ensuring pixel-perfect layouts without manual CSS tweaking.
- **Generative Visuals:** For projects lacking images, the platform uses deterministic hashing to generate unique, theme-aware abstract visual assets based on the project's taxonomy (e.g., AI, Web, Mobile).
- **Single-Page Workspace:** A continuous, conversational UI flow. No wizards, no page reloads, no context switching.
- **One-Click Publishing:** Once satisfied, publish the portfolio to a unique URL instantly, ready to be shared with recruiters and clients.

---

## 🧠 How the AI Agents Work

The core intelligence of the platform is divided into specialised agents that handle different parts of the pipeline:

### 1. The Extraction Agent
When a file is uploaded, the Extraction Agent processes the unstructured document:
- **Scanning & Mapping:** Reads the raw text and identifies key sections (Experience, Education, Skills, Projects).
- **Structuring (Schema Mapping):** Maps the unstructured data into a strict, predefined JSON schema.
- **Curation & Enrichment:** A secondary pass cleans up formatting, standardizes dates, infers missing fields (like generating short summaries for roles), and ensures high data quality.

### 2. The Refinement Agent
If a user wants to change the design or rewrite content post-extraction:
- The Refinement Agent receives the current structured data and the user's natural language request (e.g., *"Make my summary sound more professional"* or *"Add a new skill: Next.js"*).
- It surgically updates only the necessary fields in the schema without requiring a full re-process of the original resume.

---

## 📐 Design Token System & Themes

The visual presentation is powered by a custom design token system that bridges the AI-generated data with the React components. 

### Base Tokens
The UI is styled using CSS Custom Properties (Tokens) that define the foundational aesthetic:
- `--ed-ivory`, `--ed-cream` for backgrounds and surfaces.
- `--ed-charcoal`, `--ed-muted` for typography hierarchy.
- `--ed-accent`, `--ed-line` for interactive elements and borders.

### Style Presets
Each portfolio style is a self-contained preset. Switching presets completely alters the layout, typography, colour palette, and component density:
- **Minimal:** Editorial restraint, ample whitespace, classic serif headings.
- **Dark Pro:** Deep blacks, neon accents, tech-forward aesthetic.
- **Retro:** Terminal-style monospace fonts, scan lines, hacker nostalgia.
- **Bold:** Brutalist high-contrast, oversized typography, pure impact.
- **Glass:** Frosted glass layers, soft gradients, modern depth.
- **Classic:** Traditional, structured, professional.
- **Soft:** Warm pastels, rounded elements, approachable tone.
- **Grid:** Information-dense, dashboard-like layout.

---

## 🏗 Architecture & Tech Stack

The application is built for performance, scalability, and seamless AI integration.

- **Frontend Framework:** Next.js 16 (App Router, Server + Client Components)
- **Styling:** Vanilla CSS + Tailwind CSS utility classes
- **AI Integration:** Google Gemini REST API (Models: `gemini-3.6-flash`)
- **Database & Auth:** Supabase (PostgreSQL for session state and portfolio storage, Supabase Auth for user management)
- **Animations:** Framer Motion for fluid transitions and micro-interactions
- **Analytics:** PostHog

### End-to-End Data Flow

1. **Upload:** User attaches a resume in the `ChatWorkspace` component.
2. **Extraction (`POST /api/extract`):** The file is sent to the backend. Gemini processes the file and returns a structured `SchemaData` object. The data is saved to Supabase.
3. **Review:** User edits the `SchemaData` in the `ReviewModal`.
4. **Preview:** The `PortfolioRenderer` component maps the `SchemaData` and selected `StylePreset` into a live, interactive preview within the workspace.
5. **Publish (`POST /api/publish`):** The finalized schema and style are committed, generating a public `slug` (e.g., `/portfolio-xyz`). The public route `app/[slug]/page.tsx` serves the final portfolio.

---

## 💻 The Studio Interface

The primary user experience happens in `/dashboard`, designed to feel like an editorial workspace:

- **Sidebar (Session Management):** Every resume upload creates a distinct session. Users can switch between past sessions, view generation timestamps, or delete old sessions. A "New Portfolio" action resets the workspace.
- **Workspace Canvas:** A timeline-style view that logs the extraction process, displays the structured data confirmation, and hosts the live portfolio preview.
- **Contextual Toolbar:** The controls adapt to the user's state:
  - *Initial State:* A clean upload button to attach a resume.
  - *Post-Extraction:* Options to "Review Data" appear.
  - *Preview State:* A style dropdown appears, allowing instant toggling between themes alongside the review options.

---

## 🚀 Getting Started for Developers

### Prerequisites
- Node.js (v18+)
- A Supabase Project (Database & Auth)
- A Google Gemini API Key

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to access the studio.

---

## 🌍 Deployment

The application is optimized for deployment on **Vercel**. Ensure all environment variables (Supabase, Gemini) are configured in your Vercel project settings before deploying. 

```bash
npm run build
```
