# Style Preset Spec (Design-Token Values)

This file defines the 8 style presets referenced in the build prompt. Each preset is just a set of values plugged into the same token system (Tailwind + shadcn/Radix base) — there is no separate template or component per style. Apply these tokens to the shared components.

Token categories per preset: `radius`, `shadow`, `border`, `background`, `texture`, `color palette`, `typography`, `spacing`, `internal morphism name` (for your reference/code naming — never shown to the user).

---

## 1. Minimal
- User-facing name: **Minimal**
- Internal name: Flat / Minimalism
- Radius: small (4–6px)
- Shadow: none
- Border: 1px solid, low-contrast gray
- Background: solid white / near-white
- Texture: none
- Palette: black/white/one muted accent color
- Typography: clean sans-serif, generous line-height
- Spacing: generous whitespace, wide gaps

## 2. Glass
- User-facing name: **Glass**
- Internal name: Glassmorphism
- Radius: medium-large (16–20px)
- Shadow: soft, diffused, low-opacity
- Border: 1px, semi-transparent white/light
- Background: semi-transparent panels (`background: rgba(255,255,255,0.15)`) over a blurred/gradient backdrop
- Texture: `backdrop-filter: blur(12–20px)`
- Palette: soft pastels or cool tones, translucent layers
- Typography: light-medium weight sans-serif
- Spacing: medium, cards float with visible gaps

## 3. Bold
- User-facing name: **Bold**
- Internal name: Neo-Brutalism
- Radius: none or very small (0–2px)
- Shadow: hard offset shadow (e.g. `4px 4px 0 #000`, no blur)
- Border: thick (2–4px), solid black or high-contrast color
- Background: solid, saturated colors (not gradients)
- Texture: none, flat solid fills
- Palette: high-contrast primary colors (yellow, red, blue, black)
- Typography: heavy/bold sans-serif, large sizes
- Spacing: tight, blocky grid

## 4. Soft
- User-facing name: **Soft**
- Internal name: Claymorphism / Neumorphism
- Radius: large (20–24px), pill-like on small elements
- Shadow: dual soft shadow (light from top-left, dark from bottom-right) for an embossed/clay feel
- Border: none or very subtle
- Background: solid pastel, same tone as shadow base (neumorphic feel)
- Texture: subtle inner glow/highlight
- Palette: muted pastels (soft blue, lavender, peach)
- Typography: rounded sans-serif, medium weight
- Spacing: medium, elements look "puffy"/3D

## 5. Dark Pro
- User-facing name: **Dark Pro**
- Internal name: Tech Minimalism / Dark Mode
- Radius: small-medium (6–10px)
- Shadow: subtle, dark-on-dark, barely visible
- Border: 1px, low-opacity light gray on dark background
- Background: near-black / dark gray (#0d0d0d–#1a1a1a)
- Texture: none, flat
- Palette: monochrome dark + one accent (electric blue, teal, or lime)
- Typography: clean sans-serif or monospace accents for code/skills
- Spacing: compact, dashboard-like density

## 6. Classic
- User-facing name: **Classic**
- Internal name: Editorial / Print-style
- Radius: minimal (2–4px)
- Shadow: none or very light
- Border: thin hairline dividers between sections
- Background: white/cream, no cards — content flows like a document
- Texture: none
- Palette: black/navy text on white, single accent for links
- Typography: serif or classic sans-serif, resume-like hierarchy (name large, section labels small caps/uppercase)
- Spacing: single-column, print-document proportions

## 7. Grid
- User-facing name: **Grid**
- Internal name: Bento Grid
- Radius: medium (12–16px)
- Shadow: light, card-based
- Border: 1px light gray
- Background: white/light gray cards on a light canvas
- Texture: none
- Palette: neutral base + 1–2 accent colors per card category
- Typography: medium-weight sans-serif
- Spacing: grid of asymmetric-sized cards (bento layout), tight internal padding, visible gutters between cards

## 8. Retro
- User-facing name: **Retro**
- Internal name: Y2K / Retro-futurism / Terminal
- Radius: 0px (sharp corners) or small on tag pills only
- Shadow: none, or hard neon glow substitute using solid border instead of blur
- Border: 2–3px, neon color (pink, cyan, yellow), dashed for section dividers
- Background: dark navy/black
- Texture: optional scanline/grain texture at low opacity
- Palette: neon on dark — hot pink, cyan, yellow on near-black
- Typography: monospace font throughout
- Spacing: boxed sections, terminal/command-line feel, uppercase labels with `//` or `[ ]` prefixes

---

## Implementation note for the agent
Store these as a single `stylePresets` config object (one entry per style, same key shape as above: radius, shadow, border, background, texture, palette, typography, spacing). The portfolio renderer takes `(schemaData, presetKey)` and applies the matching preset's tokens to the shared Tailwind/shadcn components — do not create 8 separate component trees. Adding a 9th style later should only mean adding one more entry to `stylePresets`.
