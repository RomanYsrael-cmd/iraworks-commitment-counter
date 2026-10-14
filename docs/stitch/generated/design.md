---
name: Pastoral Stewardship
colors:
  surface: '#fff8f0'
  surface-dim: '#e0d9cf'
  surface-bright: '#fff8f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf3e8'
  surface-container: '#f4ede3'
  surface-container-high: '#eee7dd'
  surface-container-highest: '#e9e2d7'
  on-surface: '#1e1b15'
  on-surface-variant: '#424844'
  inverse-surface: '#333029'
  inverse-on-surface: '#f7f0e5'
  outline: '#727974'
  outline-variant: '#c2c8c2'
  surface-tint: '#476556'
  primary: '#042217'
  on-primary: '#ffffff'
  primary-container: '#1b382b'
  on-primary-container: '#82a291'
  inverse-primary: '#adcebc'
  secondary: '#8f4e00'
  on-secondary: '#ffffff'
  secondary-container: '#fea047'
  on-secondary-container: '#6d3a00'
  tertiary: '#002218'
  on-tertiary: '#ffffff'
  tertiary-container: '#17382c'
  on-tertiary-container: '#7fa292'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9ead7'
  primary-fixed-dim: '#adcebc'
  on-primary-fixed: '#022015'
  on-primary-fixed-variant: '#304d3f'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77a'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6d3a00'
  tertiary-fixed: '#c6ebd9'
  tertiary-fixed-dim: '#abcebe'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#2d4d40'
  background: '#fff8f0'
  on-background: '#1e1b15'
  surface-variant: '#e9e2d7'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 3rem
    fontWeight: '500'
    lineHeight: 3.5rem
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 2.25rem
    fontWeight: '500'
    lineHeight: 2.75rem
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 2.25rem
    fontWeight: '500'
    lineHeight: 2.75rem
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 1.75rem
    fontWeight: '500'
    lineHeight: 2.25rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 1.625rem
    fontWeight: '500'
    lineHeight: 2.125rem
  headline-sm:
    fontFamily: Newsreader
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.625rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.0625rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: 2rem
    letterSpacing: -0.02em
  label-numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 1rem
    fontWeight: '500'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  label-numeric-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.125rem
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style

This design system embodies quiet authority, pastoral warmth, and meticulous fiduciary stewardship. Tailored specifically for faith-based communities, parishes, and non-profit finance committees, the aesthetic avoids corporate SaaS tropes, growth-hacking visual clutter, and transactional coldness. Instead, it projects the quiet gravitas of archival ledgers, physical stewardship records, and local-first institutional software.

The UI philosophy is rooted in a refined **Tactile Minimalist** style:
- **Atmosphere:** Contemplative, grounded, and unhurried. Elements breathe with generous internal margins and structured typographic rhythm.
- **Audience Resonance:** Designed for volunteer treasurers, pastors, and finance councils who manage sacred tithes, capital campaigns, and communal commitments. It communicates total discretion, offline-first reliability, and integrity.
- **Emotional Response:** Calm reassurance, fiduciary confidence, and unencumbered clarity.

## Colors

The color palette draws inspiration from monastic libraries, liturgical vestments, and botanical sanctuary tones. The application operates strictly in a calibrated light mode to evoke daylight-lit parchment and legible printed registers.

### Palette Architecture
- **Primary (`#1B382B` & `#142B21`):** Deep evergreen forest. Used for primary calls-to-action, prominent section titles, active navigation states, and key tally markers. Text on dark evergreen is strictly off-white ivory (`#FAF7F2`). Deep text uses `#0E2018`.
- **Secondary / Accent (`#D9822B` & `#C26E1D`):** Warm burnished marigold and amber. Deployed sparingly to highlight active contribution milestones, pledge fulfillment markers, warnings, and intentional audit focal points.
- **Tertiary (`#4A6B5D`):** Weathered sage green. Used for secondary status badges, contextual metadata, table column categorizations, and supportive progress bars.
- **Neutrals & Surfaces:**
  - Base Page Canvas: `#FAF7F2` (Warm Linen) with deep inset regions in `#F4EFE6`.
  - Surface Containers: Pure `#FFFFFF` cards framed by hairline borders of `#E6DFD5` and divider rules of `#D8CFBE`.
  - Text Coloration: Primary body is `#0E2018` for optimal contrast, with secondary metadata in `#526056`.
- **Semantic Feedback:**
  - Safe / Reconciled: `#2D5A43` (Deep Herb Green).
  - Attention / Pending Pledge: `#D9822B` (Amber Ochre).
  - Discrepancy / Over-allocation: `#A33B30` (Brick Terracotta).

## Typography

The typographic hierarchy relies on a tripartite structure balancing literary tradition, human-centered UI clarity, and tabular rigor:

1. **Editorial Serifs (Newsreader):** Used for view titles, commitment campaign names, stewardship summaries, and total fund headers. It imbues figures with permanence and human dignity.
2. **Workhorse Sans (Plus Jakarta Sans):** Governs structural UI, form controls, field descriptions, body narrative, and helper instructions. It presents soft, open apertures that enhance legibility in dimly lit council rooms.
3. **Ledger Monospace (JetBrains Mono):** Dedicated entirely to quantitative data: currency figures, date stamps, pledge intervals, campaign percent allocations, and tabular ledgers. All financial values must align tabularly without optical shift.

### Editorial Guidelines
- Use `label-caps` strictly with CSS text-transform uppercase for ledger column headers, category badges, and ledger batch markers.
- Never set narrative body copy in italics; reserve italic styles strictly for scriptural or historical motto dedications within campaign overviews.

## Layout & Spacing

The layout philosophy uses a disciplined **Fixed-Max Fluid Grid** anchored at a maximum content boundary of `1200px` to maintain optimal scanning width for financial sheets and input forms.

### Grid & Breakpoints
- **Desktop (≥ 1024px):** 12-column grid, `gutter-lg` (2rem), side margin minimum `2rem`. Ledger sheets can expand to a wide-aspect 1400px container for cross-tabulation.
- **Tablet (768px – 1023px):** 8-column grid, `gutter` (1.5rem), `margin` (1.5rem). Multi-column pledge forms collapse into a two-column paired layout.
- **Mobile (≤ 767px):** 4-column grid, `gutter-sm` (1rem), `margin-mobile` (1rem). Ledger rows transition to stacked card structures with explicit boundary cards.

### Spacing Principles
- Vertical rhythm follows an explicit 8px base grid.
- Generous outer breathing room: sections are demarcated by `space-xl` and `space-2xl` increments rather than heavy tinted backgrounds.
- Field groupings maintain strict internal proximity (`space-sm` between label and input; `space-md` between discrete form fields).

## Elevation & Depth

Visual hierarchy rejects artificial floating glass layers and heavy black drop-shadows in favor of grounded physical paper stock and fine stonework borders.

### Surface Tiers
- **Tier 0 (Canvas Base):** `#FAF7F2` warm linen background.
- **Tier 1 (Ledger Cards & Working Pads):** Crisp `#FFFFFF` surface bounded by a crisp 1px `#E6DFD5` solid border. Shadow: `0 1px 3px rgba(20, 43, 33, 0.04), 0 1px 2px rgba(20, 43, 33, 0.02)`.
- **Tier 2 (Popovers, Calculation Drawers, Dropdowns):** `#FFFFFF` surface, framed by 1px `#D8CFBE` edge. Shadow: `0 8px 24px -4px rgba(20, 43, 33, 0.08), 0 2px 6px -1px rgba(20, 43, 33, 0.04)`.
- **Tier 3 (Modals & Audit Confirmation Windows):** `#FFFFFF` anchored over a tinted scrim of `rgba(14, 32, 24, 0.45)`. Shadow: `0 16px 40px -8px rgba(14, 32, 24, 0.18)`.

### Tactile Detail
- Interactive surfaces (buttons, clickable table rows) employ an optical inset micro-line on the top edge (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2)` on dark buttons) to mimic letterpress craftsmanship.

## Shapes

The design system maintains a **Soft** shape language (`roundedness: 1`). Radii are restrained and intentional, reinforcing stability, order, and traditional record-keeping.

- **Standard Elements (Buttons, Inputs, Badges, Tabs):** `0.25rem` (4px). Crisp, architectural, and reliable.
- **Containers (Cards, Ledger Enclosures, Panels):** `0.5rem` (8px). Softens large form surfaces without making them look casual or juvenile.
- **Dialogs & Sheet Modals:** `0.75rem` (12px).
- **Prohibited:** Circular pills for buttons or continuous tags. Avoid hyper-rounded aesthetic patterns that diminish fiduciary seriousness.

## Components

### Buttons
- **Primary:** Background `#1B382B`, text `#FAF7F2`, hairline border `#142B21`, radius `0.25rem`. Hover state transitions to `#142B21` with a delicate lift. Focus ring is a 2px offset ring in `#D9822B`.
- **Secondary / Outlined:** Background `#FFFFFF`, text `#1B382B`, border 1px solid `#D8CFBE`. Hover: `#F4EFE6` background with border `#1B382B`.
- **Accent / Special Action:** Background `#D9822B`, text `#FFFFFF`, border `#C26E1D`. Reserved for commitment confirmation and ledger finalization.
- **Tertiary / Ghost:** Background transparent, text `#1B382B`, hover: background `#F4EFE6`.

### Inputs & Financial Entry Controls
- **Standard Input:** Crisp `#FFFFFF` surface, 1px solid border `#D8CFBE`, text `#0E2018`, font `Plus Jakarta Sans`. Height: `2.625rem` (42px) with horizontal padding `0.75rem`.
- **Currency Entry Fields:** Monospaced (`JetBrains Mono`), right-aligned numeric format with a fixed evergreen prefix symbol (`$`) enclosed in a subtle `#FAF7F2` container flank.
- **Focus States:** `outline: none; border-color: #1B382B; box-shadow: 0 0 0 3px rgba(27, 56, 43, 0.15)`.

### Cards & Ledger Sheets
- Constructed with `#FFFFFF` background, wrapped in 1px `#E6DFD5` border, and standard padding of `1.5rem`.
- Header partitions use subtle horizontal hairline dividers (`1px solid #F4EFE6`) accompanied by serif subheaders and monospaced balance totals.

### Table & Data Grids (Commitment Counter Ledger)
- Alternating row zebra tints are avoided; distinct rows are marked by a 1px bottom border of `#E6DFD5`.
- Row hover yields a gentle `#FAF7F2` background transition.
- Header cells set in `label-caps` using `#526056` over an off-white `#F4EFE6` sub-canvas.
- Tabular figures use right alignment with matching width decimal fractions.

### Checkboxes & Radios
- Box size: `1.125rem` with `0.25rem` border-radius for checkboxes, fully circular for radio toggles.
- Unchecked: 1.5px border in `#D8CFBE`, background `#FFFFFF`.
- Checked: Background `#1B382B`, checkmark icon in `#FAF7F2`. Focus rings mirror the secondary marigold tone (`#D9822B`).

### Chips & Stewardship Badges
- **Pledged / Active:** `#E9F0EC` background, `#1B382B` text, 1px `#C3D5CB` border.
- **Fitted / Met Target:** `#FEF6EE` background, `#C26E1D` text, 1px `#F5D6B8` border.
- **Reconciliation Audit Pill:** Monospaced date/hash reference in `#FAF7F2` background with `#526056` text.

### Specialized Commitment Components
- **Local Ledger Safe Badge:** A persistent micro-indicator in the footer/header demonstrating local-only browser storage (`IndexedDB` verified) using an evergreen dot indicator `#2D5A43` and tiny monospace notice: `LOCAL FILE ARCHIVE · NO EXTERNAL TRANSMISSION`.
- **Pledge Progress Gauge:** A horizontal stepped progress track: unfulfilled tracks use `#E6DFD5`, fulfilled portions use a dual gradient from `#1B382B` to `#D9822B`, without round ends, maintaining architectural 4px corners.