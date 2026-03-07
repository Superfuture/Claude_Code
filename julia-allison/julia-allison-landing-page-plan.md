# Julia Allison — Landing Page: Project Plan

## Overview

A premium single-page landing site for Julia Allison, media personality. Primary conversion goal: **book / hire Julia**. Built with Next.js, deployed to Vercel, with a clear expansion path to a full multi-page site in v2.

---

## Brand & Identity

- **Identity:** Media personality — journalist, columnist, TV personality
- **Primary CTA:** Book / hire Julia (speaking, interviews, consulting)
- **Tagline:** Existing tagline provided by client (to be inserted)
- **Palette:** White / off-white base with teal and rainbow gradient accents — elegant, modern, sophisticated
- **Copy:** Existing tagline + bio provided; hero headline to be distilled from bio

---

## Visual Design System

### Color Palette
- **Base:** `#FFFFFF` and `#FAF9F6` (warm off-white) for backgrounds
- **Gradient system:** Teal → cyan → violet → rose (rainbow arc) used across:
  - Gradient text (hero name, section headlines)
  - Gradient borders and underline accents
  - CTA button fill / border
  - Subtle section background washes (shifting hue per section)
- **Text colors:** Near-black `#111010` for body; dark slate for secondary text
- **Avoid:** High-saturation non-gradient colors that compete with the gradient system

### Typography
- **Headlines / display:** Playfair Display (serif) — name, section headers
- **Body / UI:** Inter or Satoshi (sans-serif) — bio, nav, form labels, captions
- **Accent:** Italic Playfair for pull quotes and subheadings
- **Scale:** Fluid type with `clamp()` — desktop-primary but graceful on mobile

### Gradient Application (Layered System)
1. **Gradient text** — Julia's name in hero, select section headlines
2. **Gradient accents** — CTA button gradient border, section divider lines, underlines
3. **Section background washes** — each scroll section has a very subtle, low-opacity gradient tint that shifts as user scrolls
4. **Gradient glow** — soft radial gradient bloom behind hero portrait

### Accessibility Note
- Gradient text used **display-only** (name, hero headline) — all functional text (nav, body, form, captions) is solid color passing WCAG AA
- Navigation and form elements: AA compliant contrast required
- Gradient CTA button must have sufficient text contrast against gradient fill

---

## Layout & Page Structure

**Pattern:** Hero → Story → Media → Press → Social Proof → Contact/CTA → Footer

### 1. Minimal Fixed Navigation
- Transparent over hero, transitions to frosted-glass white on scroll
- Left: Julia Allison wordmark (or logo)
- Right: `About` · `Press` · `Speaking` · **`[ Book Julia ]`** (gradient border button)
- Desktop-primary; collapses to hamburger on mobile

### 2. Hero Section (Full-bleed)
- **Photo carousel:** Multiple rotating editorial photos — auto-advances, subtle crossfade or parallax slide
- **Text overlay:** Julia Allison (gradient Playfair, large display), tagline, short descriptor
- **CTA:** Primary gradient button — "Book Julia" → smooth scrolls to contact form
- **Background:** Soft radial gradient bloom behind/around portrait; off-white edges
- **Animation:** Hero text entrance (fade-up stagger), gradient name shimmer/pulse, subtle carousel motion

### 3. About / Story Section
- Two-column layout: one additional editorial photo (left) + bio text (right)
- Italic pull quote from bio styled large in Playfair
- Gradient underline beneath section heading
- Subtle teal-wash background on this section

### 4. Speaking Reel / Video Section
- Full-width embedded video — muted autoplay loop (speaking clip or showreel)
- Custom poster image with gradient overlay/duotone treatment
- Video aspect ratio: 16:9, full viewport width
- Section heading with gradient text accent

### 5. Press / "As Seen In" Section
- Auto-scrolling infinite marquee of press logos (grayscale, hover colorizes)
- Logos: e.g. NYT, Wired, Bravo, NBC, Vogue, TechCrunch, etc. (client to provide list)
- Gradient border rule above/below marquee strip

### 6. Social Proof Section
Four sub-elements laid out in a 2×2 or staggered grid:
- **Stats bar:** Highlighted numbers (years in media, publications, appearances, etc.)
- **Press pull quotes:** 2–3 quoted excerpts from named outlets, styled with large quotation marks in gradient
- **Client / booker testimonials:** 2–3 testimonial cards with name, role, organization
- **Notable associations / name-drops:** tastefully displayed (not a logo wall — typographic treatment)

### 7. Contact / Booking Form (Inline)
- Smooth-scroll anchor target (`#book`)
- Section heading: "Work with Julia" or "Book Julia"
- Fields:
  - Full Name (required)
  - Email Address (required)
  - Opportunity Type (dropdown: Speaking Engagement, Media Interview, Consulting, Brand Partnership, Other)
  - Message / Details (textarea)
- Submit button: gradient fill with white text
- Backend: **Resend** — form submission triggers formatted email to Julia's inbox
- Success state: inline confirmation message with graceful animation
- Validation: client-side (required fields) + server-side (Next.js API route or Server Action)

### 8. Footer (Full)
- Left: Julia Allison wordmark + tagline
- Center: nav links (About, Press, Speaking, Contact)
- Right: social icons (Instagram, X/Twitter, LinkedIn) + email link
- Bottom bar: copyright line + privacy policy link
- Gradient rule at top of footer

---

## Technical Implementation

### Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS v3 — no component library, fully custom
- **Animations:** Framer Motion — scroll-triggered reveals, gradient morphing, carousel, entrance animations
- **Video:** Next.js `<video>` tag with poster frame; consider `next/image` for carousel photos
- **Forms:** Next.js Server Actions or `/api/contact` route handler → Resend SDK
- **Analytics:** Google Analytics 4 via `@next/third-parties/google` (Next.js official GA4 integration)
- **Deployment:** Vercel (Next.js native, edge CDN, preview URLs per branch)
- **Domain:** Existing domain (client-provided) — configure via Vercel dashboard

### Project Structure
```
/app
  layout.tsx          # Root layout: fonts, GA4, metadata
  page.tsx            # Landing page — all sections assembled
  /api
    contact/route.ts  # Form handler → Resend
/components
  /sections
    Hero.tsx
    About.tsx
    Video.tsx
    Press.tsx
    SocialProof.tsx
    Contact.tsx
  /ui
    Navbar.tsx
    Footer.tsx
    GradientText.tsx
    Marquee.tsx
    PhotoCarousel.tsx
/lib
  resend.ts           # Resend client + send helper
/public
  /images             # Editorial photos (client-provided)
  /logos              # Press logos
  /video              # Speaking reel
```

### Performance Strategy (Target: 95+ Lighthouse)
- `next/image` for all photos — automatic WebP/AVIF, lazy loading, blur placeholder
- Video: `loading="lazy"`, explicit `width`/`height`, compressed source file (H.264 MP4)
- Fonts: `next/font` with `display: swap` — no layout shift
- Framer Motion: lazy-import with `LazyMotion` + `domAnimation` feature bundle to minimize JS
- Marquee: CSS animation (`@keyframes`) preferred over JS scroll where possible
- No third-party scripts except GA4 (loaded with `afterInteractive` strategy)
- Route: Single page — no additional routing overhead

### Animation System (Framer Motion)
- `useInView` + `whileInView` for all scroll-triggered section reveals (fade-up, stagger)
- Hero text: staggered `initial → animate` entrance on mount
- Gradient shimmer on Julia's name: CSS `@keyframes` background-position animation (no JS cost)
- Section background washes: CSS gradient transitions, not JS-driven
- Photo carousel: Framer Motion `AnimatePresence` + `variants` for crossfade
- Parallax (hero photo): `useScroll` + `useTransform` — subtle, not nauseating

### SEO
- `metadata` export in `layout.tsx`: title, description, OG image, Twitter card
- `Person` structured data (JSON-LD) in `<head>` — name, jobTitle, sameAs (social profiles)
- `/public/sitemap.xml` — single-page sitemap
- `/public/robots.txt` — allow all
- OG image: 1200×630 editorial photo with name/tagline overlay

---

## Content Checklist (Client to Provide)

- [ ] Tagline / brand statement
- [ ] Short bio (250–400 words) + one-line hero descriptor
- [ ] High-res editorial photos (minimum 3–5 for carousel, 1 for About section)
- [ ] Speaking reel video file (MP4, ideally 1–3 min)
- [ ] Press logo files (SVG preferred, or high-res PNG with transparent background)
- [ ] Press pull quotes (outlet name + quote text)
- [ ] Client/booker testimonials (name, role, org, quote)
- [ ] Stats / numbers (years active, number of publications, appearances, etc.)
- [ ] Notable associations or name-drops to feature
- [ ] Full list of social profile URLs
- [ ] Existing domain + DNS access for Vercel configuration
- [ ] Resend-compatible sending email address (or Resend account)
- [ ] GA4 Measurement ID

---

## Key Tradeoffs & Decisions Recorded

| Decision | Choice | Rationale |
|---|---|---|
| Gradient text vs. WCAG AA | Beauty over strict compliance for display text; all functional text AA-compliant | Gradient text is central to brand; functional accessibility preserved |
| CMS | None (hardcoded) | Reduces complexity; single landing page rarely needs self-service editing |
| Component library | None — pure Tailwind | Full design freedom; no library styles to fight against for bespoke gradient system |
| Form backend | Resend | Simple email notification; no database overhead for v1 |
| Analytics | GA4 only | Client's standard; privacy-first alternatives not required |
| Mobile | Desktop-primary with full responsive | Most bookings/PR contacts come from desktop; still fully usable on mobile |
| Autoplay video | Muted loop | Performance trade-off accepted for cinematic feel; lazy loaded |
| Phase 2 | Full multi-page site | Architecture decisions now should not block expansion: App Router, modular components, no CMS lock-in |

---

## Open Questions (To Resolve Before Build)

1. Does Julia have a `juliaallison.com` domain already pointing somewhere, or is it fresh?
2. What email address should booking form submissions be sent to?
3. Is there a video file ready, or is it hosted on YouTube/Vimeo? (affects embed strategy)
4. Any brand colors already established (e.g., existing business cards, stationery) that the gradient system must harmonize with?
5. Is there a deadline or launch target?
6. Who handles DNS / Vercel configuration — dev team or client?

---

## Phase 2 Expansion Path

When the full multi-page site is built:
- `About` page — extended bio, timeline, philosophy
- `Speaking` page — topics, formats, past events, booking details
- `Press` page — full press archive with article links and logos
- `Contact` page — standalone (current inline form becomes its own page)
- Consider: headless CMS (Sanity or Contentful) for press and bio content management
- Consider: blog / writing section for essays and newsletter archive
