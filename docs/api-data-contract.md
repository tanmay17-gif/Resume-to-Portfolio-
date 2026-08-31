# API & Data Contract

Exact request/response shapes for every step, and Supabase table schemas. The agent should build to this contract, not invent its own shapes.

---

## 1. Supabase tables

### `users`
Handled by Supabase auth automatically — no custom table needed unless extra profile fields are wanted later.

### `resumes`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| user_id | uuid, fk → auth.users | |
| original_filename | text | |
| uploaded_at | timestamp | |
| raw_extraction_status | text | `pending` \| `ok` \| `error` |
| raw_extraction_confidence | float | 0–1 |

### `portfolio_data`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| resume_id | uuid, fk → resumes | |
| user_id | uuid, fk → auth.users | |
| schema_data | jsonb | the full flexible schema (see below) |
| updated_at | timestamp | |

### `portfolios`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| portfolio_data_id | uuid, fk → portfolio_data | |
| user_id | uuid, fk → auth.users | |
| slug | text, unique | used in the public URL `/[slug]` |
| style_preset | text | one of: minimal, glass, bold, soft, dark_pro, classic, grid, retro |
| published | boolean | |
| published_at | timestamp | |

### `change_requests` (for the chat-based edit loop)
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| portfolio_id | uuid, fk → portfolios | |
| request_text | text | what the user typed |
| target_section | text | which section got regenerated |
| status | text | `pending` \| `applied` \| `failed` |
| created_at | timestamp | |

---

## 2. Schema data shape (stored in `portfolio_data.schema_data`)

```json
{
  "name": "string",
  "contact": {
    "email": "string",
    "phone": "string | null",
    "links": [{ "label": "string", "url": "string" }]
  },
  "summary": "string | null",
  "education": [
    { "degree": "string", "institution": "string", "year": "string" }
  ],
  "experience": [
    { "title": "string", "company": "string", "dates": "string", "bullets": ["string"] }
  ],
  "projects": [
    { "name": "string", "description": "string", "tech": ["string"], "link": "string | null" }
  ],
  "skills": ["string"],
  "achievements": ["string"],
  "custom_sections": [
    { "title": "string", "items": ["string"] }
  ]
}
```
Only `name` and `contact` are required. Every other top-level key is optional and omitted (not null, not empty array) if not found — the renderer only shows sections that exist.

---

## 3. Pipeline request/response contracts

### Step: Extraction
**Input:** uploaded file (PDF/DOC), `resume_id`
**Output:**
```json
{
  "status": "ok" | "error",
  "data": { /* schema data shape above, partially filled */ },
  "confidence": 0.0,
  "used_vision_fallback": true
}
```

### Step: Structuring
**Input:** raw extraction `data` object
**Output:**
```json
{
  "status": "ok" | "error",
  "structured_data": { /* full schema data shape, normalized */ }
}
```

### Step: Generation
**Input:**
```json
{
  "structured_data": { /* schema data shape */ },
  "selected_style": "minimal" | "glass" | "bold" | "soft" | "dark_pro" | "classic" | "grid" | "retro"
}
```
**Output:**
```json
{
  "status": "ok" | "error",
  "portfolio_html_or_component": "...",
  "slug": "string"
}
```

### Step: Change request (post-publish edit)
**Input:**
```json
{
  "portfolio_id": "uuid",
  "request_text": "string (what the user typed, e.g. 'change my summary to sound more senior')"
}
```
**Output:**
```json
{
  "status": "ok" | "error",
  "target_section": "summary" | "experience" | "projects" | "skills" | "...",
  "updated_data": { /* only the changed section */ }
}
```
Only `target_section`'s data is touched and re-rendered — nothing else regenerates.

---

## 4. Environment variables (`.env.example`)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini (2 keys pooled round-robin)
GEMINI_API_KEY_1=
GEMINI_API_KEY_2=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# App
NEXT_PUBLIC_SITE_URL=
```

The agent should stop and ask you for each value the first time it's needed, per the checkpoint rules in the build prompt — never invent placeholder values and continue building on top of them.
