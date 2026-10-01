# Linguative Website — Design System Specification (for Bricks Builder)

2026-10-01. Platform decision locked by Ala: WordPress + Bricks Builder + existing AxenCloud hosting. No Webflow or WordPress.com migration; Elementor only if a concrete technical reason rules out Bricks. This spec translates the brand guide (`marketing/brand/BRAND.md`) and Ala's 2026-10-01 design direction into Bricks-ready tokens and components. No client names, media, or live-site facts appear here — those stay in `/mnt/project-files/website/` once gathered from the backup.

Design direction (Ala, 2026-10-01): premium, modern, technically sophisticated, clean, immersive without being gimmicky — appropriate for conferences, multilingual events, AV, and professional language services. Motion used selectively; never at the cost of usability, accessibility, or Core Web Vitals.

---

## 1. Source of truth

- Brand guide: `marketing/brand/BRAND.md` — colors, logo rule, photography rule, tone are authoritative and unchanged by this spec.
- **Gap flagged, not a conflict:** BRAND.md specifies no Arabic typeface. Ala confirmed directly (2026-10-01) that Cairo is the Arabic font where appropriate. Using Cairo for Arabic headings/body until BRAND.md is updated to include it formally.

## 2. Design tokens

### 2.1 Color

| Token | Hex | Bricks global class | Usage |
|---|---|---|---|
| `--color-navy` | `#071A2E` | `g-navy` | Primary dark field, headers, footer, dark-background sections |
| `--color-gold` | `#C9A46A` | `g-gold` | Accents, dividers, CTAs, icon highlights |
| `--color-gold-highlight` | `#E5C79A` | `g-gold-light` | Hover states, subtle highlight fields |
| `--color-gold-shadow` | `#8E6537` | `g-gold-dark` | Depth/shadow accents on gold elements, never a flat fill substitute |
| `--color-ivory` | `#F8F5F0` | `g-ivory` | Light-background sections, cards on navy |
| `--color-charcoal` | `#2B2B2B` | `g-charcoal` | Body text on light backgrounds |
| `--color-white` | `#FFFFFF` | `g-white` | Text on navy/dark backgrounds, logo clear space |

Dominant system stays Navy + Gold + Ivory per BRAND.md. Charcoal is body text only, never a large fill. No additional brand colors are introduced.

### 2.2 Typography

| Token | Family | Fallback | Usage |
|---|---|---|---|
| `--font-heading` | Futura PT | Montserrat, sans-serif | H1–H4, nav labels, buttons, eyebrow labels |
| `--font-body` | Acumin Pro | Source Sans 3, sans-serif | Body copy, captions, forms, proposals/technical content |
| `--font-accent` | Cormorant Garamond Semibold Italic | Georgia, serif | Rare editorial/campaign accents only — pull quotes, not structural |
| `--font-arabic` | Cairo | Tajawal, sans-serif | Arabic headings and body (confirmed by Ala 2026-10-01; flagged as a BRAND.md gap above) |

Type scale (desktop / mobile), modular, golden-ratio-leaning per BRAND.md's "golden-ratio-inspired proportions":

| Role | Desktop | Mobile |
|---|---|---|
| H1 | 56px / 1.1 | 34px / 1.15 |
| H2 | 40px / 1.15 | 28px / 1.2 |
| H3 | 28px / 1.2 | 22px / 1.25 |
| H4 | 20px / 1.3 | 18px / 1.3 |
| Body | 17px / 1.6 | 16px / 1.6 |
| Caption/label | 13px / 1.4, letter-spacing 0.04em | 13px / 1.4 |

Arabic line-height runs slightly looser (1.7–1.8 for body) to accommodate Cairo's vertical rhythm — set as a separate `[dir="rtl"]` override, not a global change.

### 2.3 Spacing scale

8px base unit: `4, 8, 16, 24, 32, 48, 64, 96, 128, 192`. Section vertical rhythm defaults to 96/128 desktop, 48/64 mobile. No arbitrary one-off spacing values in Bricks — every spacing value pulled from this scale via global classes (`g-space-*`), per Ala's "avoid page-by-page one-off styling" instruction.

### 2.4 Breakpoints

Match Bricks' defaults, confirmed against this project's needs: `mobile_portrait` (≤480px), `mobile_landscape` (≤640px), `tablet_portrait` (≤768px), `tablet_landscape` (≤1024px), desktop base, `desktop_xl` (≥1440px). Design and build mobile-first; verify against Ala's "phone limits" pattern from other deliverables (test on an actual small screen, not just a resized browser).

## 3. Core components (Bricks global components)

Each is a Bricks reusable component/template so changes propagate site-wide — never built page-by-page.

- **Buttons** — primary (gold fill, navy text), secondary (navy outline, navy text), ghost (ivory/navy text, for dark backgrounds). One consistent hover state (gold-highlight fill or underline, not both). No more than these three variants.
- **Cards** — service card, project/case-study card, industry card. Shared structure: image/media, eyebrow label, title, 2–3 line summary, link. Ivory or white surface, thin gold rule as the only decorative divider (per BRAND.md: "thin champagne-gold rules and dividers").
- **Containers/grids** — a constrained max-width container (practical default ~1280–1320px) with consistent gutters from the spacing scale; 12-column grid for desktop, collapsing to stacked single-column under tablet_portrait.
- **Forms** — Request a Quote and Contact forms share one field-component library (text, email, phone, select, multi-select, conditional fields, file upload) styled once, reused everywhere so Phase 32's audit (validation, spam protection, accessible labels) only has to be fixed in one place.
- **Navigation** — primary nav (desktop: horizontal, mega-menu-capable for the Services group; mobile: off-canvas), sticky behavior evaluated against performance, not assumed by default.
- **Footer** — single global footer component carrying centralized business info (email, phone, address, social, logo) — ties directly into Phase 8/33's "centralize company information" requirement. Never hand-duplicated page by page.
- **Media** — image component (responsive `srcset`, lazy-loaded below the fold, explicit intrinsic dimensions to protect CLS) and video component (poster image required, no autoplay with sound, lazy-loaded, accessible controls) — both reused rather than ad hoc per Phase 3/4/30.

## 4. Imagery and video direction

Per Ala's 2026-10-01 "media-first" instruction: authentic Linguative photography and video lead, not generic stock. Patterns to design the component library around: full-width event imagery, controlled video hero/background use (only where it doesn't cost Core Web Vitals), project showcase grids, equipment close-ups, booths, technician/setup footage. Stock is a fallback only where no suitable authentic asset exists — per BRAND.md's existing photography rule, which this doesn't change.

## 5. Motion

Used selectively: entrance fades/slides on scroll for section reveals, subtle hover states on cards/buttons, no parallax or scroll-jacking that risks usability or Core Web Vitals. Respect `prefers-reduced-motion`. No motion is load-bearing for understanding content — everything must read correctly with motion off (ties to Phase 23's semantic-HTML/no-content-locked-in-animation rule).

## 6. Bricks build discipline (per Ala's instruction)

- Global classes and design tokens defined once, referenced everywhere — no per-page overrides for things covered by this system.
- Reusable components/templates for every repeating pattern (cards, forms, nav, footer, CTAs).
- Query loops for repeating content (project/case-study grids, service grids) rather than manually duplicated sections.
- Minimal plugins — only what the audit (once the backup is in hand) shows is actually load-bearing.
- Semantic HTML throughout (`main`, `article`, `section`, `header`, `nav`, `footer`) — Bricks supports this natively via element tag settings; enforced at build time, not left to defaults.

## 7. Open until the backup/live-site audit lands

- Exact existing typography rendering and any live overrides (can't confirm without the theme/CSS).
- Current plugin stack, which determines how much of "minimal unnecessary plugins" is a removal task vs. a clean start.
- Any existing component patterns worth preserving for SEO/URL-equity reasons even if visually rebuilt.

This spec is the baseline for the Bricks build; it will be revised once the WordPress backup is available and the real site is audited, not before.
