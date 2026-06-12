# Theme System & CSS Audit

This document audits the theme architecture, global styles, configuration systems, and identifies all hardcoded and theme-breaking visual variables in the project.

---

## 1. Styling System Overview

The project uses a hybrid styling architecture consisting of:
1. **Tailwind CSS (v3.4.1)**: Used for utility-first responsive styling and layout.
2. **Stitches React (v1.2.8)**: Present as a legacy CSS-in-JS configuration ([stitches.config.ts](file:///D:/MOSTAFA/RED/red/src/stitches.config.ts)).
3. **CSS Variables & Custom Selectors Layer**: Defined in [globals.css](file:///D:/MOSTAFA/RED/red/src/app/globals.css) to force theme overrides.

---

## 2. Design Token Configurations

### 2.1 Tailwind Config ([tailwind.config.ts](file:///D:/MOSTAFA/RED/red/src/tailwind.config.ts))
Extends colors under two categories:
* **Legacy Brand Tokens** (Hardcoded hex values):
  * `oceanPrimary`: `#003366`
  * `reefTeal`: `#008080`
  * `sandyBeige`: `#F5DEB3`
  * `whiteFoam`: `#F8FAFC`
  * `accentCoral`: `#FF6B6B`
  * `surfaceDark`: `#0F172A`
* **Theme-Aware Tokens** (Mapped to CSS variables):
  * `th-bg`: `var(--bg-base)`
  * `th-surface`: `var(--bg-surface)`
  * `th-surface2`: `var(--bg-surface-2)`
  * `th-border`: `var(--border-color)`
  * `th-text`: `var(--text-primary)`
  * `th-muted`: `var(--text-secondary)`
  * `th-dim`: `var(--text-muted)`
  * `th-input`: `var(--input-bg)`
  * `th-sidebar`: `var(--sidebar-bg)`

### 2.2 Stitches Configuration ([stitches.config.ts](file:///D:/MOSTAFA/RED/red/src/stitches.config.ts))
Defines duplicate tokens and theme overrides for light/dark mode:
* **Default colors**: Mapped to oceanic keywords (e.g. `oceanPrimary: '#003366'`, `reefTeal: '#008080'`, etc.).
* **Dark theme createTheme override**: Mapped to dark slate values (`oceanPrimary: '#0F172A'`, `whiteFoam: '#1E293B'`, `textDark: '#F8FAFC'`, `sandyBeige: '#334155'`).

> [!WARNING]
> Stitches configuration is largely disconnected from the Tailwind CSS variables layer. Modern code pages primarily use Tailwind classes, making the Stitches theme config a legacy layer that risks theme duplication and visual divergence.

---

## 3. CSS Variables & Theme Layers ([globals.css](file:///D:/MOSTAFA/RED/red/src/app/globals.css))

The theme variables defined in `:root` and `.dark` block are:

| Variable Name | Light Mode Value | Dark Mode Value |
| :--- | :--- | :--- |
| `--bg-base` | `#f0f6ff` (Light blue) | `#0a1628` (Deep navy) |
| `--page-bg-real`| `#f0f6ff` | `#0a1628` |
| `--bg-surface` | `#ffffff` (White) | `rgba(255,255,255,0.05)` (Glass white) |
| `--bg-surface-2` | `#f8fafc` (Slate 50) | `rgba(255,255,255,0.03)` |
| `--border-color` | `rgba(15, 37, 68, 0.08)`| `rgba(255,255,255,0.08)` |
| `--text-primary` | `#0f172a` (Slate 900) | `#ffffff` (White) |
| `--text-secondary`| `#475569` (Slate 600) | `#e2e8f0` (Slate 200) |
| `--text-muted` | `#94a3b8` (Slate 400) | `#94a3b8` (Slate 400) |
| `--sidebar-bg` | `#0f2544` (Navy) | `#0a1628` (Deep navy) |
| `--sidebar-text` | `#e2e8f0` (Slate 200) | `#e2e8f0` |
| `--input-bg` | `rgba(15, 37, 68, 0.03)`| `rgba(5,11,20,0.4)` |
| `--shadow-color` | `rgba(15, 37, 68, 0.04)`| `rgba(0,0,0,0.4)` |
| `--hero-bg` | `#0d2240` (Ocean Navy) | `#0a1628` (Page base) |

---

## 4. Fragile Theme Overrides Audit

### 4.1 The Light Mode Adaptation Layer (Lines 145-278)
In [globals.css](file:///D:/MOSTAFA/RED/red/src/app/globals.css), there is a massive stylesheet override targeting `:not(.dark)` nodes:
```css
html:not(.dark) main :not(.dark):not(.dark *) {
  /* Forced backgrounds */
  &.bg-slate-900\/40, &.bg-slate-950, ... {
     background-color: var(--bg-surface) !important;
  }
  /* Forced inputs */
  & select, & input, & textarea {
     background-color: var(--bg-surface) !important;
     color: var(--text-primary) !important;
  }
}
```
* **Why it exists**: A previous developer hardcoded dark backgrounds (`bg-slate-900`, etc.) in many dashboard pages and components. Rather than refactoring the code, they wrote this CSS block to intercept and replace them at runtime.
* **Why it's fragile**:
  1. Any new inline class variant (e.g. `bg-slate-900/60` or `bg-[#0c1628]/80`) that is *not* explicitly listed inside this adaptation CSS will **bypass** the override, resulting in a dark background in light mode.
  2. High-contrast colors are hard-overridden with `!important`, causing text styling issues.
  3. It increases build size and selector complexity, making CSS rendering slower.

---

## 5. Hardcoded Colors & Theme-Breaking Selectors Inventory

Below is a detailed inventory of pages and components bypassing the design tokens:

### 5.1 Dashboard EIA Page ([eia/page.tsx](file:///D:/MOSTAFA/RED/red/src/app/[lang]/staff/(dashboard)/eia/page.tsx))
* **Line 45**: Dynamic loading container uses hardcoded `#0d1e36` background.
* **Line 1808**: Toggles tabs with `bg-slate-100 dark:bg-[#0a1628]/90`.
* **Line 2367**: Form filters container uses hardcoded `bg-slate-900/60`.
* **Line 2398 & 2405**: Uses `bg-slate-900/10` and `bg-slate-900/40`.

### 5.2 Fleet Page ([fleet/page.tsx](file:///D:/MOSTAFA/RED/red/src/app/[lang]/staff/(dashboard)/fleet/page.tsx))
* **Line 63**: StatCard uses hardcoded `bg-slate-900/40`.
* **Line 143**: VesselCard uses hardcoded `bg-slate-900/40`.
* **Line 149**: Image wrapper uses hardcoded `bg-[#0a1628]`.
* **Line 758**: Filters panel uses hardcoded `bg-slate-900/40`.

### 5.3 Patrols & Maps
* **Patrols List Page ([patrols/page.tsx](file:///D:/MOSTAFA/RED/red/src/app/[lang]/staff/(dashboard)/patrols/page.tsx))**:
  * **Line 69**: Main banner uses hardcoded `bg-slate-900/60`.
  * **Line 159**: Filter card uses hardcoded `bg-[#0c1628]/80`.
* **EIA MapComponent ([MapComponent.tsx](file:///D:/MOSTAFA/RED/red/src/components/eia/MapComponent.tsx))**:
  * **Line 164**: Styles menu uses `bg-[#0a1628]/90`.
  * **Line 307**: Legend panel uses `bg-[#0a1628]/90`.
* **Monitoring EcoMap ([EcoMap.tsx](file:///D:/MOSTAFA/RED/red/src/components/monitoring/EcoMap.tsx))**:
  * Contains identical hardcoded `bg-[#0a1628]` variables in map UI control overlays.

### 5.4 Public Layout Components
* **PublicFooter ([PublicFooter.tsx](file:///D:/MOSTAFA/RED/red/src/components/layout/PublicFooter.tsx))**:
  * **Line 82**: Outer container uses hardcoded background `bg-[#050b14]`.
  * **Line 92**: Logo container uses hardcoded `bg-[#050b14]`.

---

## 6. Proposed Centralization Architecture

To achieve clean theme governance, we will execute a systematic migration:
1. **Unify Layout Components**: Update `StaffSidebar` and `PublicFooter` to use theme tokens (`bg-th-surface`, `border-th-border`) instead of hardcoded dark backgrounds.
2. **Migrate Page Cards & Panels**:
   * Replace `bg-slate-900/40` and `bg-[#0c1628]/80` with `bg-th-surface border border-th-border` or `bg-th-surface2`.
   * Replace hardcoded inline inputs (`bg-white/5 border-white/10`) with `bg-th-input border-th-border text-th-text`.
3. **Deprecate the CSS Adaptation Layer**:
   * Once components use `bg-th-surface` and `text-th-text`, they automatically reflect the variables in `:root` and `.dark`.
   * The complex intercept rules in `globals.css` can then be safely deprecated, restoring standard Tailwind theme behaviors.
