# Julia Allison — Landing Page

Next.js 14 landing page for Julia Allison. Teal/rainbow gradient design system, Framer Motion animations, Resend form backend, GA4 analytics, full SEO.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (fully custom, no UI library)
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Email:** Resend
- **Analytics:** Google Analytics 4
- **Deploy:** Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
- `RESEND_API_KEY` — from [resend.com](https://resend.com)
- `CONTACT_EMAIL` — email where booking inquiries are delivered

### 3. Add GA4 Measurement ID

In `app/layout.tsx`, replace `G-XXXXXXXXXX` with your actual GA4 Measurement ID.

### 4. Add media assets

See `public/images/ASSETS.md` and `public/video/ASSETS.md` for required files.

### 5. Replace placeholder content

All placeholder copy is marked clearly in the components:

| File | What to replace |
|---|---|
| `app/layout.tsx` | Meta title, description, OG image path |
| `components/sections/Hero.tsx` | Tagline (line ~70) |
| `components/sections/About.tsx` | Bio paragraphs, stats, pull quote |
| `components/sections/VideoSection.tsx` | Speaking topics list, pull quote |
| `components/sections/PressMarquee.tsx` | Press outlet names |
| `components/sections/SocialProof.tsx` | Press quotes, testimonials, name-drops |

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Connect custom domain via Vercel dashboard

## Project Structure

```
julia-allison/
├── app/
│   ├── api/contact/route.ts   # Form handler → Resend
│   ├── globals.css            # Tailwind + gradient utilities
│   ├── layout.tsx             # Root layout, fonts, SEO, GA4
│   ├── page.tsx               # Landing page composition
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── sections/
│   │   ├── Hero.tsx           # Hero carousel
│   │   ├── About.tsx          # Bio section
│   │   ├── VideoSection.tsx   # Speaking reel
│   │   ├── PressMarquee.tsx   # Press logos marquee
│   │   ├── SocialProof.tsx    # Quotes + testimonials
│   │   └── Contact.tsx        # Booking form
│   └── ui/
│       ├── Navbar.tsx         # Fixed nav
│       └── Footer.tsx         # Full footer
├── public/
│   ├── images/                # Editorial photos (add assets)
│   └── video/                 # Speaking reel (add assets)
└── .env.local.example
```

## Phase 2 Expansion

This landing page is architected for v2 expansion into a full multi-page site:
- `/about` — Extended bio and timeline
- `/speaking` — Topics, formats, past events
- `/press` — Full press archive
- `/contact` — Standalone contact page
- Consider adding Sanity or Contentful CMS at that stage
