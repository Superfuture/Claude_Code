# Joey Primiani — Personal Website Plan

A dark, cinematic, experimental portfolio for a tech builder. Inspired by peggygou.com, syedadam.com, and leonardjung.com.

---

## Core Identity

- **Who:** Tech / Builder — engineer, founder, hacker
- **Primary purpose:** Showcase projects, signal credibility, create a memorable digital identity
- **Tone:** Serious craft, elegant restraint, experimental technology

---

## Design System

### Colors

```
Background:   #050505
Surface:      #0D0D0D  (cards, overlays)
Border:       #1A1A1A
Text primary: #FFFFFF
Text muted:   #888888
Accent:       #00D4FF  (electric cyan)
Accent hover: #7EEEFF
```

### Typography

```
Headline:  Playfair Display — 120px, italic for dramatic moments
Subhead:   Playfair Display — 32–64px
Body:      Inter — 16px / 1.6 line-height
Label/UI:  Inter — 12px, letter-spacing 0.1em, uppercase
Code/meta: JetBrains Mono — 12–14px (optional accent for engineer feel)
```

Font loading strategy: `next/font` with `display: swap`. Preload Playfair Display 700 italic and Inter 400/500 only.

### Spacing & Grid

- Base unit: 8px
- Section padding: 120px vertical (desktop), 80px (mobile)
- Max content width: 1200px, centered
- Full-bleed sections break out of max-width

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SEO, file-based routing, RSC for static content |
| Styling | Tailwind CSS v4 | Utility-first, no CSS-in-JS overhead |
| Animation | GSAP + ScrollTrigger | Industry standard for scroll-driven animation |
| Smooth scroll | Lenis | Buttery momentum scroll; integrates with GSAP |
| 3D / WebGL | Three.js (r3f optional) | Particle hero scene |
| Page transitions | Framer Motion | Dark curtain wipe between routes |
| Fonts | next/font (Google + local) | Zero layout shift |
| Icons | Lucide React | Minimal, consistent |
| Analytics | Vercel Analytics or Plausible | Privacy-respecting |
| Hosting | Vercel | Zero-config Next.js, global CDN, free tier |
| Content | Hard-coded TypeScript files | Simplest now; refactor to MDX/Notion later |

---

## Site Architecture

```
/                        Home (hero + work preview + about snippet + contact)
/work                    All projects index
/work/[slug]             Individual case study pages
/about                   Full about page (optional expansion)
```

---

## Page Sections

### 1. Loading Screen

Full-screen cinematic loader on first visit (session-gated, not every navigation):

```
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│                   JP                         │
│               (monogram)                     │
│                                              │
│  ────────────────────────────── 100%         │
│  (progress bar fills as Three.js + assets    │
│   load; animated with GSAP)                  │
│                                              │
└──────────────────────────────────────────────┘
```

- Tracks: Three.js init, font load, hero image preload
- On complete: curtain slides up, hero fades in
- `sessionStorage` flag prevents re-showing on navigation

---

### 2. Hero (Section 1 — snap)

Full-viewport. Three.js particle field behind large typographic statement.

```
┌──────────────────────────────────────────────┐
│  Joey Primiani            Work  About  ✉     │  ← nav
│                                              │
│  · · ∙ ·  ∙   · ∙  ∙ · ·  ∙  ·              │
│   ∙  · ·    ·   ·  ∙ · ∙  ·    ·  ∙         │
│                                              │
│  Designer.                                   │
│  Engineer.             ← Playfair Display    │
│  Builder.                 120px, left-aligned│
│                           staggered line     │
│                           reveal on load     │
│                                              │
│  · ∙ ·  ∙   · ∙  ∙ · ·  ∙  ·  ∙  ·  ∙      │
│                                              │
│                              ↓ scroll       │
└──────────────────────────────────────────────┘
```

**Three.js particle system:**
- ~3000 particles, BufferGeometry + PointsMaterial
- Mouse movement: raycaster repulsion (particles flee from mouse)
- Slow drift: sin/cos time-based oscillation per particle
- Color: white particles with #00D4FF tint on particles near mouse
- Performance: `devicePixelRatio` capped at 1.5; skip on `prefers-reduced-motion`

**Custom cursor (enabled across entire site):**
- Dot (4px, white, instant position)
- Ring (32px, white 30% opacity, lerp factor 0.12 in RAF loop)
- Hover link: ring scale(2.5), dot opacity(0)
- Hover image/card: ring fills cyan, text "VIEW" appears
- Implementation: `useEffect` + `requestAnimationFrame` + CSS transform

---

### 3. Work / Projects (Section 2 — snap)

Full-bleed case study cards stacked vertically within the snap section (internal scroll or featured 2-3 only).

```
┌──────────────────────────────────────────────┐
│                                              │
│  Selected Work                               │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │  ← project image
│  │                                        │  │
│  │  01   Project Alpha        2024  →     │  │
│  │       Short punchy description         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │  02   Project Beta         2024  →     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│                    [ View all work → ]       │
└──────────────────────────────────────────────┘
```

**Card interactions:**
- Hover: image scale(1.03) with overflow hidden, overlay fades in with title
- Arrow icon translates right on hover
- GSAP ScrollTrigger: cards slide up from 40px on enter

---

### 4. About (Section 3 — snap)

Split layout: large text left, portrait or abstract visual right.

```
┌──────────────────────────────────────────────┐
│                                              │
│  About                                       │
│                                              │
│  ┌────────────────────┐  ┌────────────────┐  │
│  │                    │  │                │  │
│  │  Bio text goes     │  │  [Portrait or  │  │
│  │  here. 2–3 short   │  │   abstract     │  │
│  │  paragraphs.       │  │   visual]      │  │
│  │                    │  │                │  │
│  │  Currently: ___    │  │                │  │
│  │  Previously: ___   │  └────────────────┘  │
│  │                    │                      │
│  └────────────────────┘                      │
│                                              │
│  [ GitHub ]  [ Twitter ]  [ Email ]          │
└──────────────────────────────────────────────┘
```

---

### 5. Footer / Contact (bottom of home)

Minimal. Full-width dark strip.

```
Joey Primiani                    © 2026
                    Twitter  LinkedIn  Email
```

---

## /work/[slug] — Case Study Pages

Each case study is a dedicated full-page layout:

```
┌──────────────────────────────────────────────┐
│  ← Back to work                              │
│                                              │
│  01                                          │
│  Project Alpha                               │
│  Playfair Display, very large                │
│                                              │
│  Category · Year · Role                      │
├──────────────────────────────────────────────┤
│                                              │
│  [Full-bleed hero image]                     │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  Overview          The challenge, approach,  │
│                    and outcome. 3–5 graphs   │
│                    or rich media embeds.     │
│                                              │
│  [Image gallery or video]                    │
│                                              │
│  [ ← Prev Project ]       [ Next Project → ] │
└──────────────────────────────────────────────┘
```

**Content schema (TypeScript):**

```typescript
// lib/projects.ts
export interface Project {
  slug: string
  title: string
  index: number          // "01", "02"...
  year: number
  category: string
  role: string
  description: string    // short, for card
  body: string           // longer, for case study (or MDX later)
  heroImage: string
  images?: string[]
  url?: string
  github?: string
  password?: string      // if set, page requires password
}
```

---

## Scroll Architecture

**CSS snap** on the home page:

```css
html {
  scroll-snap-type: y mandatory;
}

.section {
  height: 100svh;
  scroll-snap-align: start;
}
```

**Lenis** wraps the page for inertia; configured to work with snap sections by using `syncToNative: true` or a hybrid approach.

**GSAP ScrollTrigger** handles within-section animations (not cross-section snap) and case study page scroll animations.

---

## Page Transitions

**Framer Motion** dark curtain wipe:

```
Route change triggered:
  1. Black div animates from x: "100%" → x: "0%" (200ms ease-in)
  2. Old page content fades out simultaneously
  3. New page mounts under curtain
  4. Curtain animates from x: "0%" → x: "-100%" (200ms ease-out)
  5. New page content fades in
```

Implemented via a layout-level `AnimatePresence` wrapper in `app/layout.tsx`.

---

## Authentication — Password-Protected Projects

For confidential work, a simple in-memory password gate:

- `/work/[slug]` checks if `project.password` is set
- If set, render a password form component before showing content
- On correct password: store `sessionStorage[slug] = "unlocked"`, re-render
- No server-side auth needed; this is soft protection for casual gatekeeping
- Implementation: React state + `useEffect` to check sessionStorage on mount

---

## Dark / Light Mode

- Default: dark (matches the brand)
- Toggle: sun/moon icon in nav
- Implementation: `next-themes` library, `class` strategy
- CSS: `dark:` Tailwind variants + CSS custom properties for Three.js colors
- Persisted: `localStorage` via next-themes

**Light mode palette:**
```
bg: #F8F8F8
text: #111111
accent: #0077AA  (darker cyan for contrast)
```

---

## SEO & Meta

Every page gets full metadata:

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: 'Joey Primiani', template: '%s — Joey Primiani' },
  description: 'Builder, designer, engineer.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://joeyprimiani.com',
    siteName: 'Joey Primiani',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@jp',
  },
}
```

Additional:
- `app/sitemap.ts` — auto-generates sitemap including all `/work/[slug]` pages
- `app/robots.ts` — allow all, point to sitemap
- `public/og.png` — static 1200×630 OG image (designed, not generated)
- JSON-LD `Person` schema in root layout
- Case study pages get JSON-LD `CreativeWork` schema

---

## Analytics

**Vercel Analytics** (zero-config, privacy-respecting):

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
// ...
<Analytics />
```

Or swap for **Plausible** if self-hosting analytics is preferred. Both are script-injection, no cookie consent required in most jurisdictions.

---

## Accessibility

- `prefers-reduced-motion`: All GSAP animations wrapped in `matchMedia`, Three.js canvas hidden via CSS, Lenis disabled
- Focus states: visible cyan ring on all interactive elements (`outline: 2px solid #00D4FF`)
- Semantic HTML: `<main>`, `<section aria-label>`, `<nav>`, `<article>` on case study pages
- Skip link: visually hidden `<a href="#main">Skip to content</a>` at top of DOM
- Custom cursor: CSS `cursor: none` only applied on `pointer` devices (not touch)

---

## Performance Budget

| Metric | Target |
|---|---|
| LCP | < 2.5s on desktop (4G) |
| FID / INP | < 100ms |
| CLS | < 0.05 (fonts preloaded, images sized) |
| JS bundle (initial) | < 200KB gzipped |
| Three.js chunk | Lazy loaded, ~150KB — not in critical path |

**Strategies:**
- `next/dynamic` for Three.js canvas component (no SSR)
- `next/image` for all project images (WebP, auto-sized)
- `loading="eager"` on hero image only; lazy everything else
- GSAP tree-shaken to only `gsap`, `ScrollTrigger`, `Draggable`
- Framer Motion: import only `motion` and `AnimatePresence`

---

## File Structure

```
joey-primiani/
├── app/
│   ├── layout.tsx               Global layout, nav, cursor, analytics
│   ├── page.tsx                 Home: Hero + Work preview + About + Contact
│   ├── work/
│   │   ├── page.tsx             All projects index
│   │   └── [slug]/
│   │       └── page.tsx         Case study page
│   ├── about/
│   │   └── page.tsx             (optional expansion)
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── Loader.tsx               Cinematic loading screen
│   ├── Nav.tsx                  Fixed nav with hide-on-scroll
│   ├── Cursor.tsx               Custom dot + ring cursor
│   ├── ParticleHero.tsx         Three.js canvas (dynamic import)
│   ├── ProjectCard.tsx          Full-bleed work card
│   ├── PageTransition.tsx       Framer Motion curtain wipe
│   ├── PasswordGate.tsx         Soft auth for protected projects
│   └── ThemeToggle.tsx          Dark/light switcher
├── lib/
│   ├── projects.ts              Hard-coded project data + types
│   └── lenis.ts                 Lenis singleton setup
├── public/
│   ├── og.png
│   └── images/
│       └── work/
└── styles/
    └── globals.css              Tailwind base + custom properties
```

---

## Development Phases

### Phase 1 — Foundation
- Next.js + Tailwind setup, font loading, color tokens
- Nav component (hide/show on scroll, mobile responsive)
- Custom cursor component
- Page transition (Framer Motion curtain)
- Cinematic loader with Three.js preload gate

### Phase 2 — Hero
- Three.js particle field with mouse repulsion
- Hero typography and layout
- Lenis smooth scroll + GSAP integration
- CSS scroll-snap on home sections
- prefers-reduced-motion fallback

### Phase 3 — Work
- Project data schema and hard-coded content
- Home work preview (2–3 cards)
- `/work` index page
- `/work/[slug]` case study template
- Password gate component

### Phase 4 — About & Contact
- About section layout
- Footer with social links

### Phase 5 — Polish
- Dark/light mode (next-themes)
- Vercel Analytics
- Full SEO (metadata, OG, JSON-LD, sitemap)
- Performance audit (Lighthouse, bundle analyzer)
- Final animation tuning

---

---

## Real Content

### Bio (About section)

```
Award-winning designer, engineer, and entrepreneur. Founded his first company at 8.
Sold his second to Yahoo! at 21. Forbes 30 Under 30. Named one of Business Insider's
25 Under 25 Hot Young Stars in Silicon Valley.

Work at the intersection of technology, art, and pop culture — building things that
enable creative connection. Fast Company called it "ingenious." Mashable:
"charming and incredibly unique." TechCrunch: "simple and brilliant."

Currently building Official.com.
```

**Press pull quotes (use as accents in About section):**
- "Ingenious" — Fast Company
- "Simple and brilliant" — TechCrunch
- "Charming and incredibly unique" — Mashable

**Credentials to surface:**
- Forbes 30 Under 30 (Consumer Technology, 2016)
- Business Insider 25 Under 25, Silicon Valley
- US Patent 8869068 B2 (content sharing radial menus)
- Fast Company Top 12 Best Ideas in Interface Design
- Stanford University guest lecturer
- TEDx speaker

---

### Projects (hard-coded data)

```typescript
export const projects: Project[] = [
  {
    slug: 'official',
    index: '01',
    title: 'Official',
    year: 2024,
    category: 'Founder · Product',
    role: 'Founder & CEO',
    description: 'Building the next generation of fan-to-creator connection.',
    heroImage: '/images/work/official.jpg',
    url: 'https://official.com',
  },
  {
    slug: 'google-x',
    index: '02',
    title: 'Google X — Project Wing',
    year: 2016,
    category: 'Product Design',
    role: 'Lead Designer',
    description: 'Designed the user experience for Google\'s drone delivery system.',
    heroImage: '/images/work/google-x.jpg',
  },
  {
    slug: 'little-monsters',
    index: '03',
    title: 'Little Monsters',
    year: 2012,
    category: 'Product Design',
    role: 'Product Designer',
    description: 'Lady Gaga\'s super-fan social network — a creative community for sharing, creating, and inspiring.',
    heroImage: '/images/work/little-monsters.jpg',
  },
  {
    slug: 'linkedin',
    index: '04',
    title: 'LinkedIn',
    year: 2019,
    category: 'Product Design',
    role: 'Senior Product Designer',
    description: 'Designed core product experiences for the world\'s largest professional network.',
    heroImage: '/images/work/linkedin.jpg',
    url: 'https://linkedin.com',
  },
  {
    slug: 'intuit',
    index: '05',
    title: 'Intuit Labs',
    year: 2015,
    category: 'Design Leadership',
    role: 'Design Lead',
    description: 'Led Intuit Labs, working across Mint, TurboTax, and QuickBooks to launch new product experiences.',
    heroImage: '/images/work/intuit.jpg',
    url: 'https://intuit.com',
  },
]
```

---

### Contact details

```typescript
export const contact = {
  email: 'jprimiani@gmail.com',
  twitter: 'https://twitter.com/jp',
  linkedin: 'https://linkedin.com/in/jprim',
}
```

---

## Key Technical Tradeoffs Noted

| Decision | Tradeoff accepted |
|---|---|
| Full Experimental WebGL | Heavy JS; offset by lazy loading Three.js |
| Snap scroll on home | Can feel restrictive; accept for dramatic pacing |
| Desktop-first mobile | Mobile experience is lighter; fine for this audience |
| Hard-coded content | Fastest to ship; tech debt if content grows significantly |
| Dark curtain wipe | Adds ~10KB Framer Motion; worth it for the cinematic feel |
| No WCAG 2.1 AA | Accepted; `prefers-reduced-motion` is the minimum responsible floor |
| Password gate (client-side) | Soft protection only; not secure against determined users — appropriate for portfolio |
| No CMS | Zero ops overhead; refactor path is clear (MDX files) when needed |

---

## Resolved Decisions

| Question | Answer |
|---|---|
| Domain | `joeyprimiani.com` — owned, ready to point at Vercel |
| Hero tagline | "Designer. Engineer. Builder." — three-word declarative statement in Playfair Display |
| Project count | 4–5 projects at launch |
| Portrait photo | Available — use in About section |
| OG image | Hand-crafted static 1200×630 PNG (`public/og.png`) |
| Twitter/X | Handle available — include in footer and `twitter:creator` meta tag |
| Password gate | Per-project passwords (each confidential project has its own) |

## Remaining Unknowns (Fill In Before Launch)

1. ~~**Twitter/X handle**~~ — confirmed: `@jp` (twitter.com/jp)
2. ~~**Email address**~~ — confirmed: `jprimiani@gmail.com`
3. ~~**LinkedIn URL**~~ — confirmed: `linkedin.com/in/jprim`
4. **Project images** — actual screenshots/hero images for each of the 4–5 project cards
5. **Portrait photo** — place at `public/images/joey.jpg`
6. **Official.com project details** — current role/description at Official.com to include in project list
