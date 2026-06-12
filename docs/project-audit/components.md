# Component Map & Shared Component Inventory

This document maps all components in the system and provides a detailed shared component inventory.

---

## 1. Directory Structure of Components

All custom components reside under `src/components`:

```
src/components/
├── dashboard/
│   └── UnifiedAIAssistant.tsx
├── eia/
│   └── MapComponent.tsx
├── guide/
│   └── TopographyMap.tsx
├── layout/
│   ├── AccessDenied.tsx
│   ├── PublicFooter.tsx
│   ├── PublicNavbar.tsx
│   ├── StaffSidebar.tsx
│   └── ThemeProvider.tsx
├── monitoring/
│   └── EcoMap.tsx
├── patrols/
│   ├── EnvironmentalConditions.tsx
│   └── PatrolMap.tsx
└── ui/ (Primitives)
    ├── Badge.tsx
    ├── Button.tsx
    ├── Card.tsx
    ├── FileUpload.tsx
    ├── Input.tsx
    └── RichTextEditor.tsx
```

---

## 2. Shared Component Inventory (Primitives & UI)

These components are designed to be reusable across the entire platform.

### 2.1 Card (`src/components/ui/Card.tsx`)
* **Purpose**: Base container for grids, lists, tables, and forms.
* **API Props**:
  * `variant?: 'default' | 'dark'`
  * `interactive?: boolean` (adds hover lifting effect `hover:-translate-y-1` and shadow scaling)
* **Tailwind Classes**: Uses theme-aware variables `bg-th-surface border-th-border text-th-text`.
* **Theme Support**: High. Fully theme-aware.

### 2.2 Button (`src/components/ui/Button.tsx`)
* **Purpose**: General interaction button.
* **API Props**:
  * `intent?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'`
  * `size?: 'sm' | 'md' | 'lg'`
  * `fullWidth?: boolean`
* **Tailwind Classes**: Maps color intents to Tailwind variables (e.g. `bg-teal-500 hover:bg-teal-400` or `dark:bg-white/10 dark:hover:bg-white/20`).
* **Theme Support**: High. Correctly supports `dark:` qualifiers.

### 2.3 Input (`src/components/ui/Input.tsx`)
* **Purpose**: Text field inputs.
* **API Props**:
  * `inputSize?: 'sm' | 'md' | 'lg'`
  * `hasError?: boolean` (toggles red borders)
* **Tailwind Classes**: Integrates with `bg-th-input text-th-text border-th-border focus:border-teal-500`.
* **Theme Support**: High. Fully theme-aware.

### 2.4 Badge (`src/components/ui/Badge.tsx`)
* **Purpose**: Inline labels, status pills, or indicators.
* **API Props**:
  * `color?: 'primary' | 'success' | 'warning' | 'danger' | 'teal'`
  * `size?: 'sm' | 'md'`
* **Tailwind Classes**: Uses translucent backgrounds and high contrast text (e.g. `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`).
* **Theme Support**: High.

### 2.5 FileUpload (`src/components/ui/FileUpload.tsx`)
* **Purpose**: Handles file drops and uploads. Uses `UploadThing` service under the hood.
* **Theme Support**: Moderate. Uses some hardcoded backgrounds and text values (`bg-slate-900/40 border-white/10`). Needs integration with `th-` theme tokens.

### 2.6 RichTextEditor (`src/components/ui/RichTextEditor.tsx`)
* **Purpose**: WYSIWYG text editor, wraps `react-quill` dynamically.
* **Theme Support**: Moderate. Requires CSS overrides for light vs dark mode editor borders and toolbars.

---

## 3. Layout & Layout-Specific Components

These components form the skeleton of the site structure.

### 3.1 PublicNavbar (`src/components/layout/PublicNavbar.tsx`)
* **Purpose**: Header navigation for public pages.
* **Features**:
  * Dynamic scroll detection: Py-6 (transparent) to Py-3 (glassmorphic `bg-th-surface/90 backdrop-blur-xl border-th-border`).
  * Integrates Theme Toggle (`toggleTheme`) and Language Switcher (Ar/En segments parsing).
  * Collapses into a mobile menu overlay using `framer-motion` animations.
* **Aesthetics**: Glassmorphism shadows, teal accents.
* **Mobile Support**: High. Has dedicated menu drawer.

### 3.2 PublicFooter (`src/components/layout/PublicFooter.tsx`)
* **Purpose**: Footing section for public pages.
* **Features**: Displays authority links, socials, site configuration labels, and a live online operational status pill.
* **Theme Support**: Low (Theme-breaking). Hardcoded dark background `bg-[#050b14]` is applied regardless of active theme. Needs refactoring to be theme-aware or respect global theme variables.

### 3.3 StaffSidebar (`src/components/layout/StaffSidebar.tsx`)
* **Purpose**: Side navigation panel in the staff dashboard.
* **Features**:
  * Screen size detection (`mobile`, `tablet`, `desktop`).
  * **Desktop Mode**: Renders full 288px (w-72) sidebar with site logo, section groups, active state highlights, theme switches, and user logout button.
  * **Tablet Mode**: Collapses into a 72px rail representing icons. Can be expanded dynamically.
  * **Mobile Mode**: Converts into a fixed bottom navigation bar (primary tabs) with a "More" drawer that handles secondary items.
* **Theme Support**: Low. Hardcoded colors like `bg-[#0a1628]/90`, `border-white/10`, and `text-slate-500` persist across light and dark modes.

### 3.4 AccessDenied (`src/components/layout/AccessDenied.tsx`)
* **Purpose**: Error screen shown during unauthorized RBAC access.
* **Theme Support**: Moderate.

---

## 4. Feature-Specific Components

These are heavy logical widgets embedded inside specific dashboard pages.

### 4.1 EIA MapComponent (`src/components/eia/MapComponent.tsx`)
* **Purpose**: Renders the Leaflet map in the EIA section.
* **Features**:
  * Custom glowing markers (`L.divIcon`) with animates pulses (`animate-ping`) for violations, accidents, and inspections.
  * Programmatic view transition (`map.flyTo`) when items are focused.
  * Tile layer switcher (Satellite, Dark Tech, Streets, Voyager).
  * Leaflet popup content styling overlays.
* **Theme Support**: Low. Contains hardcoded dark colors (`#0a1628`, `#0d1e36`) in legends and tile containers.

### 4.2 Monitoring EcoMap (`src/components/monitoring/EcoMap.tsx`)
* **Purpose**: Renders the Leaflet map in the Environmental Monitoring section.
* **Features**: Maps sightings, beach surveys, eco programs, and stranding cases using custom icons and filter bindings.
* **Theme Support**: Low. Similar hardcoded tile overlays and legends.

### 4.3 PatrolMap (`src/components/patrols/PatrolMap.tsx`)
* **Purpose**: Maps patrol logs, tracks routes, and captures coordinates during patrol creation.
* **Theme Support**: Low.

### 4.4 EnvironmentalConditions (`src/components/patrols/EnvironmentalConditions.tsx`)
* **Purpose**: Dashboard widget showing real-time environmental factors (sea temperature, wind speed, tide levels, wave heights).
* **Theme Support**: Low. Hardcoded dark container backgrounds.

### 4.5 UnifiedAIAssistant (`src/components/dashboard/UnifiedAIAssistant.tsx`)
* **Purpose**: Chat assistant panel powering AI insights inside the staff command center.
* **Theme Support**: Moderate. Contains some hardcoded slate/dark boundaries.
