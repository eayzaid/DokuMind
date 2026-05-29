# DokuMindEntreprise — Complete UI/UX Design Skill Specification

> **Project:** DokuMindEntreprise — SaaS Platform for Intelligent Knowledge Management  
> **Status:** In Development  
> **Purpose:** This document is the single source of truth for all design decisions made for the DokuMindEntreprise landing page and application interface. Use it as a reference when building any component, page, or feature.

---

## 1. Design Philosophy & Direction

### Concept: "Warm Enterprise, Bootstrap-Disciplined"
The aesthetic direction is **refined minimalism with warm authority** and a **bootstrap-like layout discipline**. Enterprise software is typically cold and sterile — DokuMind differentiates itself by feeling trustworthy, human, and calm. Every decision reinforces the message: *"Your company's knowledge, safe and accessible."*

### Tone Keywords
- Trustworthy · Warm · Secure · Intelligent · Professional · Approachable · Structured

### What Makes It Unforgettable
The use of a **warm cream base** (#FFF8EA) instead of pure white eliminates eye strain when working with dense document-heavy UIs, while the **rosewood accent** (#9E7676) adds a sense of premium quality without losing enterprise clarity.

### Layout Logic (Bootstrap-Adjacent)
- Prefer container + row/column rhythm, aligned gutters, and clear section hierarchy.
- Surfaces are mostly flat with thin borders; shadows are subtle and used sparingly.
- Cards are not the default. Use them only when a block needs strong separation (hero mockup, CTA callout, or isolated stats).

---

## 2. Color Palette & Design Tokens

All colors originate from the palette: [colorhunt.co/palette/fff8ea9e7676815b5b594545](https://colorhunt.co/palette/fff8ea9e7676815b5b594545)

| Token Name | Hex | Role | Usage |
|---|---|---|---|
| `--bg-main` | `#FFF8EA` | Primary Background | Main canvas, page backgrounds, card faces, modal backgrounds |
| `--accent-primary` | `#9E7676` | Primary Accent (Rosewood) | CTA buttons, active nav states, progress bars, user chat bubbles, icon fills |
| `--accent-secondary` | `#815B5B` | Secondary Accent (Dusty Rose) | Sidebar backgrounds, hover states, secondary buttons, dashed borders, code text |
| `--text-main` | `#594545` | Primary Text (Chocolate) | All headings, body text, high-contrast labels, dark sidebar background |

### CSS Variables (Root Definition)

```css
:root {
  /* Color Tokens */
  --bg-main:          #FFF8EA;
  --accent-primary:   #9E7676;
  --accent-secondary: #815B5B;
  --text-main:        #594545;

  /* Derived / Utility */
  --bg-card:          #FFFFFF;
  --border-subtle:    rgba(129, 91, 91, 0.25);
  --border-strong:    #815B5B;
  --text-muted:       rgba(89, 69, 69, 0.55);
  --text-on-dark:     #FFF8EA;
  --shadow-warm:      0 4px 24px rgba(89, 69, 69, 0.10);
  --shadow-card:      0 2px 8px rgba(89, 69, 69, 0.08);

  /* Layout */
  --sidebar-width:    260px;
  --navbar-height:    64px;
  --radius-sm:        2px;
  --radius-md:        4px;
  --radius-lg:        8px;
  --radius-pill:      999px; /* use for badges only, not buttons */
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        doku: {
          cream:     '#FFF8EA',
          rose:      '#9E7676',
          dusty:     '#815B5B',
          chocolate: '#594545',
        },
      },
      fontFamily: {
        heading: ['IBM Plex Sans', 'sans-serif'],
        body:    ['IBM Plex Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        warm: '0 4px 24px rgba(89, 69, 69, 0.10)',
        card: '0 2px 8px rgba(89, 69, 69, 0.08)',
      },
      borderRadius: {
        sm: '2px',
        md: '4px',
        lg: '8px',
      },
    },
  },
}
```

### Shadcn UI Theme Tokens (HSL)

```css
:root {
  --background: 43 55% 94%;
  --foreground: 20 13% 30%;
  --card: 0 0% 100%;
  --card-foreground: 20 13% 30%;
  --popover: 0 0% 100%;
  --popover-foreground: 20 13% 30%;
  --primary: 7 20% 54%;
  --primary-foreground: 43 55% 96%;
  --secondary: 10 17% 43%;
  --secondary-foreground: 43 55% 96%;
  --muted: 30 25% 90%;
  --muted-foreground: 20 10% 45%;
  --accent: 10 17% 43%;
  --accent-foreground: 43 55% 96%;
  --border: 20 8% 78%;
  --input: 20 8% 78%;
  --ring: 7 20% 54%;
  --radius: 0.375rem;
}
```

---

## 3. Typography System

### Font Stack

| Role | Font Family | Weight | Color |
|---|---|---|---|
| H1 (Hero Title) | IBM Plex Sans | 700 (Bold) | `#594545` |
| H2 (Section Title) | IBM Plex Sans | 600 (SemiBold) | `#594545` |
| H3 (Section Subhead) | IBM Plex Sans | 600 (SemiBold) | `#594545` |
| Body / Paragraph | IBM Plex Sans | 400 (Regular) | `#594545` |
| Muted / Caption | IBM Plex Sans | 400 (Regular) | `rgba(89,69,69,0.55)` |
| Code / Metadata | JetBrains Mono | 400 (Regular) | `#815B5B` |
| Button Label | Lexend or Inter | 500 (Medium) | Depends on button variant |

### Type Scale (rem-based)

```css
/* Typography Scale */
h1 { font-size: 2.75rem; line-height: 1.2;  letter-spacing: -0.015em; }
h2 { font-size: 2rem;    line-height: 1.3;  letter-spacing: -0.01em; }
h3 { font-size: 1.25rem; line-height: 1.4; }
p  { font-size: 1rem;    line-height: 1.65; }
small, caption { font-size: 0.875rem; line-height: 1.5; }
code { font-size: 0.875rem; }
```

### Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

---

## 4. Component Library

### 4A. Navigation Bar

**Purpose:** Top-level navigation for the landing page (public-facing).

| Property | Value |
|---|---|
| Background | `#FFF8EA` |
| Border Bottom | `1px solid rgba(129,91,91,0.15)` |
| Height | `64px` |
| Logo Color | `#594545` (bold weight) |
| Nav Links | `#594545`, opacity 0.7 on inactive, 1.0 on hover |
| CTA Button | See Primary Button below |
| Position | `sticky top-0`, `z-index: 50` |

```css
.navbar {
  background: var(--bg-main);
  border-bottom: 1px solid var(--border-subtle);
  height: var(--navbar-height);
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}
```

---

### 4B. Sidebar (App Shell — Isolated Workspaces)

**Purpose:** Left navigation for the authenticated app. Represents the "Isolated Workspaces" feature visually.

| Property | Value |
|---|---|
| Background | `#594545` (Chocolate) |
| Width | `260px` |
| Text / Icons (inactive) | `#FFF8EA` at 55% opacity |
| Text / Icons (active) | `#FFF8EA` at 100% opacity |
| Active Item Indicator | `4px` left border, color `#9E7676` |
| Active Item Background | `rgba(158, 118, 118, 0.20)` |
| Hover Background | `rgba(255, 248, 234, 0.08)` |
| Section Dividers | `rgba(255, 248, 234, 0.12)` |
| Workspace Folder Icon | `#9E7676` |

```css
.sidebar {
  width: var(--sidebar-width);
  background: var(--text-main);
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-item {
  color: rgba(255, 248, 234, 0.55);
  padding: 0.625rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background: rgba(255, 248, 234, 0.08);
  color: #FFF8EA;
}

.sidebar-item.active {
  border-left-color: var(--accent-primary);
  background: rgba(158, 118, 118, 0.20);
  color: #FFF8EA;
}
```

---

### 4C. Buttons

#### Primary CTA Button

| Property | Value |
|---|---|
| Background | `#9E7676` |
| Text | `#FFF8EA` |
| Padding | `10px 22px` |
| Border Radius | `4px` |
| Font Weight | `500` |
| Hover Background | `#815B5B` |
| Active Scale | `scale(0.97)` |
| Transition | `background 0.25s ease, transform 0.15s ease` |

```css
.btn-primary {
  background-color: var(--accent-primary);
  color: var(--bg-main);
  padding: 10px 22px;
  border-radius: var(--radius-md);
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.1s ease;
}
.btn-primary:hover  { background-color: var(--accent-secondary); }
.btn-primary:active { transform: translateY(1px); }
```

#### Secondary / Ghost Button

| Property | Value |
|---|---|
| Background | `transparent` |
| Border | `1.5px solid #815B5B` |
| Text | `#594545` |
| Hover Background | `rgba(129, 91, 91, 0.08)` |
| Border Radius | `4px` |

```css
.btn-secondary {
  background: transparent;
  border: 1px solid var(--accent-secondary);
  color: var(--text-main);
  padding: 10px 22px;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.btn-secondary:hover { background: rgba(129, 91, 91, 0.08); }

**Shadcn Button Guidance**
- Use `rounded-md` or `rounded-[4px]` for buttons. Avoid `rounded-full`.
- Use `variant="default"` for primary and `variant="outline"` for secondary; override with `bg-[#9E7676] text-[#FFF8EA] hover:bg-[#815B5B]` as needed.
```

---

### 4D. Feature Rows (Core Functionalities Section)

**Purpose:** Present core features as structured rows with separators. Use cards only when a feature requires strong separation or a distinct callout.

| Property | Value |
|---|---|
| Background | `transparent` (page surface) |
| Border Bottom | `1px solid rgba(129, 91, 91, 0.18)` |
| Padding | `1rem 0` |
| Icon Container BG | `rgba(158, 118, 118, 0.12)` |
| Icon Color | `#9E7676` |
| Title Font | IBM Plex Sans, 600, `#594545` |
| Body Font | IBM Plex Sans, 400, muted `#594545` opacity 0.65 |

```css
.feature-row {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-subtle);
}
.feature-row:last-child {
  border-bottom: none;
}
.feature-row .icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: rgba(158, 118, 118, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.feature-row .icon-wrap svg {
  color: var(--accent-primary);
  width: 22px;
  height: 22px;
}
```

---

### 4E. Smart Assistant Chat Interface

**Purpose:** Core product UI — the conversational AI that answers from company documents.

#### User Message Bubble
| Property | Value |
|---|---|
| Background | `#9E7676` |
| Text Color | `#FFF8EA` |
| Border Radius | `12px 12px 0 12px` |
| Padding | `10px 14px` |
| Max Width | `75%` |
| Alignment | Right |

#### Assistant Message Bubble
| Property | Value |
|---|---|
| Background | `#FFF8EA` |
| Text Color | `#594545` |
| Border | `1px solid #815B5B` |
| Border Radius | `12px 12px 12px 0` |
| Padding | `10px 14px` |
| Max Width | `75%` |
| Alignment | Left |

#### Chat Input Field
| Property | Value |
|---|---|
| Shape | Slightly rounded |
| Background | `#FFFFFF` |
| Border | `1px solid #815B5B` |
| Border Radius | `6px` |
| Padding | `10px 18px` |
| Placeholder Color | `rgba(89,69,69,0.4)` |
| Send Icon Color | `#9E7676` |

```css
.chat-bubble-user {
  background: var(--accent-primary);
  color: var(--bg-main);
  border-radius: 12px 12px 0 12px;
  padding: 10px 14px;
  max-width: 75%;
  align-self: flex-end;
  font-size: 0.9rem;
  line-height: 1.55;
}

.chat-bubble-assistant {
  background: var(--bg-main);
  color: var(--text-main);
  border: 1px solid var(--accent-secondary);
  border-radius: 12px 12px 12px 0;
  padding: 10px 14px;
  max-width: 75%;
  align-self: flex-start;
  font-size: 0.9rem;
  line-height: 1.55;
}

.chat-input {
  border-radius: var(--radius-lg);
  border: 1px solid var(--accent-secondary);
  background: #fff;
  padding: 10px 18px;
  width: 100%;
  font-size: 0.9rem;
  color: var(--text-main);
  outline: none;
  transition: border-color 0.2s ease;
}
.chat-input:focus { border-color: var(--accent-primary); }
```

---

### 4F. Knowledge Base Ingestion — Upload Zone

**Purpose:** Drag-and-drop area for uploading PDF documents.

| Property | Value |
|---|---|
| Border | `2px dashed #815B5B` |
| Background | `rgba(158, 118, 118, 0.05)` |
| Border Radius | `8px` |
| Padding | `3rem 2rem` |
| Icon (PDF) | Color `#9E7676`, size 48px |
| Label Text | `#815B5B` |
| Hover Border | `#9E7676` (solid) |
| Progress Track | `#FFF8EA` |
| Progress Fill | `#9E7676` |
| Progress Height | `6px`, Border Radius `999px` |

```css
.upload-zone {
  border: 2px dashed var(--accent-secondary);
  background: rgba(158, 118, 118, 0.05);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.upload-zone:hover, .upload-zone.drag-over {
  border-color: var(--accent-primary);
  border-style: solid;
  background: rgba(158, 118, 118, 0.09);
}

.progress-bar-track {
  background: var(--bg-main);
  border-radius: var(--radius-pill);
  height: 6px;
  overflow: hidden;
}
.progress-bar-fill {
  background: var(--accent-primary);
  height: 100%;
  border-radius: var(--radius-pill);
  transition: width 0.4s ease;
}
```

---

### 4G. Dashboard App UI Window (Hero Mockup)

**Purpose:** The product screenshot/mockup shown in the hero section of the landing page.

| Element | Style |
|---|---|
| Window Frame | White card, `border-radius: 8px`, `box-shadow: 0 20px 60px rgba(89,69,69,0.18)` |
| Window Dots (macOS style) | Red `#FF6058`, Yellow `#FFBD2E`, Green `#28CA41` — small circles, 10px diameter |
| Sidebar Panel | Background `#594545` (matches app sidebar) |
| Folder Icons | `#9E7676` |
| Active Folder Row | Highlighted with `rgba(158,118,118,0.25)` |
| Panel Divider | Thin `1px` line, `rgba(255,248,234,0.12)` |
| Chat Panel | Background `#FFF8EA` |
| Referenced Doc Thumbnails | White card with subtle drop shadow, PDF icon in `#9E7676` |

---

### 4H. Role Badge / Permission Indicator

**Purpose:** Visual tag to indicate user role (Admin, Manager, Curator, Employee).

| Role | Background | Text | Usage |
|---|---|---|---|
| Admin | `#594545` | `#FFF8EA` | Highest authority |
| Manager | `#815B5B` | `#FFF8EA` | Elevated access |
| Curator | `rgba(158,118,118,0.2)` | `#9E7676` | Document management |
| Employee | `rgba(89,69,69,0.08)` | `#594545` | Read-only / chat |

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}
.badge-admin    { background: #594545; color: #FFF8EA; }
.badge-manager  { background: #815B5B; color: #FFF8EA; }
.badge-curator  { background: rgba(158,118,118,0.2); color: #9E7676; }
.badge-employee { background: rgba(89,69,69,0.08);  color: #594545; }
```

---

## 5. Layout & Spacing System

### Grid

- **Landing Page:** 12-column grid, max-width `1200px`, centered, `padding: 0 2rem`.
- **App Shell:** Sidebar (`260px`) + main content (`flex: 1`), full viewport height.
- **Hero Section:** Two-column layout — left: headline + CTA (5 cols), right: product mockup (7 cols).
- **Feature Rows:** Single column list with separators; optional two-column layout only on large screens (`minmax(260px, 1fr)`), gap `1.5rem`.

### Spacing Scale (8px base)

| Token | Value | Use |
|---|---|---|
| `--space-1` | `4px` | Micro gaps (icons, inline) |
| `--space-2` | `8px` | Inner padding small |
| `--space-3` | `12px` | Standard inner padding |
| `--space-4` | `16px` | Card padding sm |
| `--space-5` | `24px` | Card padding lg |
| `--space-6` | `32px` | Section sub-gap |
| `--space-8` | `48px` | Section vertical padding |
| `--space-12` | `96px` | Major section separation |

---

## 6. Motion & Interaction

### Philosophy
Subtle, purposeful animation. No bouncing or attention-grabbing effects. Motion should feel like a natural part of the document metaphor — smooth, calm, confident.

### Standard Transitions

```css
/* Default transition for interactive elements */
--transition-fast:   all 0.15s ease;
--transition-base:   all 0.25s ease;
--transition-slow:   all 0.4s ease;
```

### Key Animations

| Element | Animation | Details |
|---|---|---|
| Hero content | Fade up on load | `opacity 0→1`, `translateY 20px→0`, `duration: 0.6s`, `delay: staggered` |
| Feature cards | Fade up on scroll | Intersection Observer, `delay: 0.1s * index` |
| Card hover | `translateY(-3px)` | `0.25s ease` |
| CTA button | Background darken + `scale(0.97)` on active | `0.15s ease` |
| Chat bubbles | Slide in from side | User: slide from right, Assistant: slide from left, `0.3s ease` |
| Upload zone | Border pulses | `border-color` transition on drag-over |
| Progress bar | Width expansion | `0.4s ease` |

### Staggered Hero Load (CSS)

```css
.hero-title   { animation: fadeUp 0.6s ease 0.1s both; }
.hero-sub     { animation: fadeUp 0.6s ease 0.25s both; }
.hero-cta     { animation: fadeUp 0.6s ease 0.4s both; }
.hero-mockup  { animation: fadeUp 0.8s ease 0.2s both; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## 7. Background & Texture

### Landing Page Background
- Base: `#FFF8EA` (solid, no pure white)
- Optional subtle noise texture: `filter: url(#noise)` SVG filter or `background-image: url('noise.png')` at `opacity: 0.03` to add warmth and depth.
- Hero section: consider a very soft radial gradient — `radial-gradient(ellipse at 60% 40%, rgba(158,118,118,0.08) 0%, transparent 65%)` — for depth without distraction.

### App Shell Background
- Main content area: `#F5F0E8` (slightly warmer than `#FFF8EA`)
- Panel separators: `rgba(89,69,69,0.10)`

---

## 8. Iconography

- **Icon Library:** Lucide Icons (MIT licensed, clean line icons)
- **Icon Size:** 20–24px for UI, 44–48px for feature card heroes
- **Icon Color:** 
  - On light background → `#9E7676`
  - On dark sidebar → `rgba(255,248,234,0.75)` (inactive), `#FFF8EA` (active)
  - Feature card icons → `#9E7676` on `rgba(158,118,118,0.12)` container

### Feature Card Icons (Mapping)
| Feature | Icon |
|---|---|
| Isolated Workspaces | `folder-lock` |
| Knowledge Base Ingestion | `database` or `file-plus` |
| Smart Assistant | `message-square` or `bot` |
| Reliable Responses | `shield-check` |
| Role-Based Access | `users` or `user-check` |
| Strict Data Isolation | `lock` |

---

## 9. Important Implementation Notes

### Data Isolation Visual Distinction
When implementing the app shell, **use `--accent-secondary` (#815B5B)** for Manager/Admin-level views to visually distinguish elevated permission states from standard Employee views. This is a UX signal, not just a style choice.

### CSS Variable Inheritance
Define all `:root` variables at the highest level (in `index.css` or `globals.css`) to enable future dark mode theming without refactoring individual components. A dark mode would invert the palette — `#594545` backgrounds with `#FFF8EA` text — while keeping `#9E7676` as a consistent accent.

### Tailwind Arbitrary Values (Rapid Prototyping)
If not using a full `tailwind.config.js`, use bracket notation for these specific colors:
```html
<button class="bg-[#9E7676] text-[#FFF8EA] hover:bg-[#815B5B]">
  Get Started
</button>
```

### Shadcn UI Usage Notes
- Prefer `Separator`, `Table`, `Tabs`, and `Accordion` for structure instead of stacking `Card` components.
- Use `Card` only for hero mockups, pricing or CTA emphasis, and isolated stats.
- Keep `Button` and `Input` shapes at `rounded-md` (4–6px) to avoid overly rounded AI-looking controls.
- Favor `border` + `shadow-sm` over heavy shadows to stay enterprise-clean.

### Accessibility
- All body text `#594545` on `#FFF8EA` has a contrast ratio of ~5.4:1 — **passes WCAG AA**.
- `#9E7676` on `#FFF8EA` has a contrast ratio of ~3.2:1 — acceptable for large text/buttons; add font-weight ≥ 600 for small text.
- Always include `:focus-visible` ring styles for keyboard navigation:
```css
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## 10. File & Asset Reference

| Asset | Description |
|---|---|
| `#FFF8EA` base canvas | No image needed — CSS background |
| Noise texture (optional) | Generate via [grainy.app](https://grainy.app) at 15% opacity |
| PDF document icon | Lucide `file-text` or custom SVG |
| Dashboard mockup | Coded HTML/CSS component (not a static image) |
| Logo wordmark | "DokuMind" in Lexend Bold, color `#594545` |
| Favicon | Stylized "D" in `#9E7676` on `#FFF8EA` background, `32x32` |

---

*End of DokuMindEntreprise Design Skill Specification*  
*Version: 1.0 — Derived from Gemini-generated landing page concept and colorhunt.co/palette/fff8ea9e7676815b5b594545*
