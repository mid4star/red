# Design Consistency & Visual Harmony Report

This document reports on the design consistency, typography, card and button geometries, shadows, gradients, and overall visual harmony of the application.

---

## 1. Typography & Font Families

The layout uses two primary fonts imported via Google Fonts:
* **Arabic**: `Cairo` for headers, bold weights, and custom Cairo class elements. `Alyamama` is loaded and applied as a body fallback for RTL texts.
* **English**: `Inter` for general English prose, labels, and numbers.

### 1.1 Inconsistencies Detected
* **Font Weight Scattering**: Font weights are scattered without hierarchical semantic control:
  * Headers use `font-black` (950) in some places (`HomeClient.tsx`), `font-extrabold` (800) in others, and `font-bold` (700) in the dashboard pages.
  * Subtitles and captions alternate between `font-medium` and `font-semibold`.
* **Font Size Mismatches**: Header sizes vary:
  * Page title sizes range from `text-3xl` up to `text-6xl` or `text-[7.5rem]` (on homepage hero sections) without clear scaling ratios.

---

## 2. Component Geometries & Border Radii

Border radius configuration across cards and panels is highly inconsistent:

| Component Type | File & Location | Active Radius Class |
| :--- | :--- | :--- |
| UI Primitive Card | `src/components/ui/Card.tsx` | `rounded-xl` (12px) |
| UI Primitive Button| `src/components/ui/Button.tsx` | `rounded-full` (9999px) |
| UI Primitive Input | `src/components/ui/Input.tsx` | `rounded-md` (6px) |
| Fleet Card | `fleet/page.tsx` | `rounded-2xl` & `rounded-xl` |
| Fleet Stats | `fleet/page.tsx` | `rounded-none` (StatCard inherits card `rounded-xl`) |
| Patrols Banner | `patrols/page.tsx` | `rounded-3xl` |
| Violations Stats | `violations/page.tsx` | `rounded-2xl` |
| Violations Details | `violations/page.tsx` | `rounded-2xl` |
| EIA Modals | `eia/EIAReportModal.tsx` | `rounded-3xl` |
| Media Cards | `media/page.tsx` | `rounded-2xl` |
| Media Banners | `media/page.tsx` | `rounded-3xl` |

### 2.1 Recommendation
Standardize radii rules across all cards:
* **Buttons & Badges**: Keep `rounded-full` (pills) for micro elements, or `rounded-xl` (12px) for general buttons.
* **Small Cards/Inputs/Widgets**: `rounded-2xl` (16px).
* **Large Hero Panels / Main Cards / Modals**: `rounded-3xl` (24px).
* Avoid random combinations like `rounded-[2.5rem]` or custom inline specs.

---

## 3. Shadow and Elevation Systems

The application has custom, hardcoded box shadows, including:
* `shadow-[0_20px_40px_rgba(45,212,191,0.2)]` (Teal branding glow)
* `shadow-[0_4px_30px_rgba(0,0,0,0.5)]` (Mobile navigation bar shadow)
* `shadow-[0_20px_50px_rgba(0,0,0,0.3)]` (Modal shadows)
* `shadow-2xl`, `shadow-xl`, `shadow-sm`, and `shadow-inner`

### 3.1 Recommendation
Rather than hardcoding arbitrary shadow colors and offsets, map shadows to Tailwind config tokens, leveraging `--shadow-color` (which scales with themes) to ensure elevations remain soft in dark mode and clear in light mode.

---

## 4. Visual Language Alignment (Dashboards & Forms)

### 4.1 Empty & Loading States
* In [patrols/page.tsx](file:///D:/MOSTAFA/RED/red/src/app/[lang]/staff/(dashboard)/patrols/page.tsx), empty states are styled using `bg-white/5 border border-white/10`.
* In [fleet/page.tsx](file:///D:/MOSTAFA/RED/red/src/app/[lang]/staff/(dashboard)/fleet/page.tsx), the empty state uses `bg-slate-900/10 rounded-3xl border border-dashed border-white/5`.
* Loading spinners are teal-accented (`animate-spin text-teal-400` or `border-teal-500`) but vary in sizes and containers.
* **Action Item**: Standardize all loading and empty state states into unified styling structures.

### 4.2 Dynamic Color Class Bug (Critical Consistency Defect)
* In [media/page.tsx](file:///D:/MOSTAFA/RED/red/src/app/[lang]/staff/(dashboard)/media/page.tsx), background and text classes are created dynamically:
  ```tsx
  className={`bg-${m.color}-500/10 group-hover:bg-${m.color}-500/20`}
  ```
  Since Tailwind CSS performs static class extraction, dynamic strings like `text-${m.color}-400` are **not compiled** unless explicitly specified in full elsewhere. This results in empty backgrounds and fallback text colors in production builds.
  * **Fix**: Replace dynamic class generation with a color map dictionary to output complete, compile-safe class names.
