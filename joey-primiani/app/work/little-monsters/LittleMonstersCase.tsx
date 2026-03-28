'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

const HERO_IMAGE =
  'https://storage.googleapis.com/pr-newsroom-wp/1/2025/03/lady-gaga-little-monster-press-conference-spotify-12-1024x683.jpg'

const D = 'https://assets.dunked.com/assets/prod/117833/'

/* ─── Image collections ─────────────────────────────── */

const sketches = [
  D + 'p1bbc96apj1addi2313ii1hpnu4u3.jpeg', // Original whiteboard sketches, 2011
  D + 'p1bbi623jhjdk12c81rsua8d1gm23.jpg',  // First visual design concepts
]

const screens = [
  { src: D + 'p1bba6c1vgqpv1oda1g0k6d9g5p1p.png',   label: 'Homepage',        caption: "Fan-submitted artwork surfaces to the top — the more you create, the more you're seen by Gaga herself" },
  { src: D + 'p1bba63p7i1595m541rbs1k441oht8.png',  label: 'Live Chat',        caption: 'Real-time chatroom for Gaga and her monsters — translated live via Google into any language, zero friction' },
  { src: D + 'p1bba63p7lhihnsm17tbrbtpnut.png',     label: 'Mother Monster',   caption: 'Lady Gaga\'s official profile — Monster #00001, joined May 4, 2011. She was present, not just a mascot' },
  { src: D + 'p1bba97aiv13bq56s1ruc1m09hv43.png',   label: 'Profile',          caption: 'Your superfan identity — showcase your creative work, passions, and story to the entire community' },
  { src: D + 'p1bba63p7i15u5f2f1i8m1qvl17na.png',   label: 'Edit Profile',     caption: 'Personalize your online superfan persona — username, location, profession, and bio' },
  { src: D + 'p1bba63p7i1g7e198vo37rac1s075.png',   label: 'Avatar Picker',    caption: "Choose from Gaga's most iconic looks as your fan avatar — your identity within the community" },
  { src: D + 'p1bba63p7jvqu10au1ag31r4s1kf0h.png',  label: 'Remix Studio',     caption: 'Remix any artwork with built-in drawing tools — text, shapes, brushes, and color. Fan creativity as a first-class feature' },
  { src: D + 'p1bba63p7k8n3139cs0b1h5f1vntp.png',   label: 'Color Studio',     caption: 'Full color picker for artistic remixing — every fan a creator, every post a canvas' },
  { src: D + 'p1bba63p7j1ff91daq1qqbc7s13ng.png',   label: 'Merch',            caption: 'One-click fan art on apparel — your creation ships to monsters worldwide the same day it\'s made' },
  { src: D + 'p1bba63p7k1nij1ql01irs1c514d7o.png',  label: '"Inspired By"',    caption: 'The inspiration tree — track how creative ideas branch and evolve as they travel through the community' },
  { src: D + 'p1bbnus4nhnptc6r1v6nsjn1tf36.png',    label: 'Webcam Drops',     caption: 'Instant webcam-to-community content — zero friction between creative impulse and published post' },
  { src: D + 'p1bbnus4ni5eoknm162l1ksk5518.png',    label: 'Translation',      caption: 'Real-time translation — a fan in Tokyo and one in São Paulo, talking directly with no friction whatsoever' },
  { src: D + 'p1bbl7rkjp1frd1otp3mrost1ljs42.png',  label: 'Fan Merch',        caption: 'Superfan-designed merchandise increased concert sales by 30% — fans as the ultimate taste-makers' },
  { src: D + 'p1bbl7rkjodan1hje1cors4ioce41.png',   label: 'Community Feed',   caption: "When Gaga hearted your post — the moment that made every Little Monster's day unforgettable" },
  { src: D + 'p1bbc97paq1vmmqbbgm78e1rv95.png',     label: 'Profile Page',     caption: 'Fan identity on full display — creative work, community stats, and connections across the platform' },
  { src: D + 'p1bbc983aukro1tic1sgb11atqkc7.png',   label: "Creator's Profile", caption: "Joey Primiani's own profile on the platform he built. Lady Gaga commented: 'hey i love you!! our creator!!!'" },
  { src: D + 'p1bba63p7ka81d4r10ti1ihcfk2k.png',    label: 'Explore',          caption: 'Discover artwork, fans, events, and moments happening across the Little Monsters universe in real time' },
]

const fanArt = [
  D + 'p1bba6gobs1ro9kn6cclch18pu1r.png',
  D + 'p1bba6hv5g14s41t1r5m61rrp1n5021.jpg',
  D + 'p1bbdv3dpu1atu10cj81m1ohc57h9.png',
  D + 'p1bbcac5fs1lt5uogj181rqd4fk5.png',
  D + 'p1bbdqr8b8dbontm1o1j1cii6h83.jpg',
  D + 'p1bba6lujeipu1ii31vqv1unq1ghf9.jpg',
  D + 'p1bba6ns7c6hh167at5un6np79f.jpg',
  D + 'p1bba6mqa61qbr6ldjvm1p311d84d.png',
  D + 'p1bba6hh1cinp1n9g1t17fok158r1t.png',
  D + 'p1bba6hplmmdtab877e1utu5du1v.jpg',
  D + 'p1bba6k2ms13jb18a24li33v1dgn7.jpg',
  D + 'p1bbq7mb9616tatged3712rt52g3.jpg',
]

/* ─── Feature grid ─────────────────────────────────── */

const features = [
  {
    n: '01',
    title: 'Creative Studio',
    body: '"Inspired by" remixing — fans built on each other\'s art, creating collaborative chains of creativity that spanned the globe.',
  },
  {
    n: '02',
    title: 'Live Translation',
    body: 'Real-time community chat via Google Translate — a fan in Tokyo and one in São Paulo, connected without friction.',
  },
  {
    n: '03',
    title: 'One-Click Merch',
    body: 'Fan artwork on apparel in minutes, inspired by Threadless. Your creation could ship to the world the same day.',
  },
  {
    n: '04',
    title: 'Monster Map',
    body: 'Location-based fan discovery for concert meetups — turning strangers in a venue into community before the first song.',
  },
  {
    n: '05',
    title: 'Monstervisions',
    body: "Exclusive behind-the-scenes from Gaga — VIP access that felt genuinely personal, not broadcast. The real Gaga, for her real fans.",
  },
  {
    n: '06',
    title: 'Webcam Drops',
    body: 'Instant content from webcam to community. Zero friction between creative impulse and published post.',
  },
]

/* ─── Impact stats ─────────────────────────────────── */

const impact = [
  { value: '+30%', label: 'Concert merchandise\nsales increase' },
  { value: '2011', label: 'Built before fan\nplatforms existed' },
  { value: 'Lives', label: 'Changed — especially\nfor LGBTQ+ youth' },
]

/* ─── Cultural sections ─────────────────────────────── */

const cultural = [
  {
    title: 'A refuge for the vulnerable',
    body: "The platform became a lifeline for LGBTQ+ youth, bullied teenagers, and young people battling anxiety and depression. A space built around love and acceptance that existed nowhere else for its community.",
  },
  {
    title: 'Launching creative careers',
    body: "Artists like Helen Green gained global recognition through the platform — her fan art caught Gaga's eye and opened doors to Haus of Gaga collaboration. Little Monsters turned fans into professionals.",
  },
  {
    title: 'Artist–fan reinvented',
    body: "Gaga participated in chatrooms, shared Monstervisions — raw, personal content — and responded directly to fan art. This wasn't broadcasting to an audience. It was being present with a community.",
  },
  {
    title: 'Fan art as fine art',
    body: "The central philosophy: fan creativity deserves to be treated with the same reverence as fine art. We imagined these works eventually exhibited at MoMA or the Louvre. That belief shaped every product decision.",
  },
  {
    title: 'The Body Revolution',
    body: "Gaga posted a single message about body acceptance. The community responded with an outpouring of personal stories — fans embracing their scars, their weight, their differences. It became a movement. The platform turned one post into a cultural moment that helped people battling eating disorders, depression, and anxiety feel seen.",
  },
  {
    title: 'No borders, one community',
    body: "Real-time Google Translate in the chatrooms meant a fan in Tokyo and one in São Paulo could talk directly — no friction, no barrier. The platform became genuinely global in a way no fan community had been before. Language was no longer a wall. Creativity was the common language.",
  },
]

/* ─── Press ─────────────────────────────────────────── */

const press = [
  {
    outlet: 'WIRED',
    description: 'The inside story of how Little Monsters launched',
    url: 'http://www.wired.co.uk/article/troy-carter',
  },
  {
    outlet: 'TechCrunch',
    description: 'First look: Backplane, the Lady Gaga-backed community platform',
    url: 'https://techcrunch.com/2012/01/20/first-look-backplane-the-lady-gaga-backed-community-platform-with-all-star-investors-invites/',
  },
  {
    outlet: 'Rolling Stone',
    description: 'Lady Gaga launches social network for Little Monsters',
    url: 'https://www.rollingstone.com/culture/culture-news/lady-gaga-launches-social-network-for-little-monsters-backplane-ceo-talks-online-fan-identity-191943/',
  },
  {
    outlet: 'Fast Company',
    description: 'What Lady Gaga can teach you about creating a following',
    url: 'https://www.fastcompany.com/3034586/what-lady-gaga-can-teach-you-about-creating-a-following',
  },
  {
    outlet: 'CNN',
    description: 'Lady Gaga launches social site Little Monsters',
    url: 'https://www.cnn.com/2012/02/08/tech/social-media/lady-gaga-social-little-monsters',
  },
  {
    outlet: 'ABC News',
    description: "Lady Gaga's Little Monsters social network launches",
    url: 'https://abcnews.go.com/blogs/technology/2012/07/lady-gagas-little-monsters-social-network-launches',
  },
  {
    outlet: 'NME',
    description: 'Lady Gaga launches social network for Little Monsters',
    url: 'https://www.nme.com/news/music/lady-gaga-276-1268750',
  },
  {
    outlet: 'TIME',
    description: 'Monsters Inc. — inside Lady Gaga\'s Little Monsters community',
    url: 'https://content.time.com/time/magazine/article/0,9171,2071124,00.html',
  },
]

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

export default function LittleMonstersCase() {
  type LbItem = { src: string; label?: string; caption?: string }
  const [lb, setLb] = useState<{ items: LbItem[]; index: number } | null>(null)

  const openLb  = (items: LbItem[], index: number) => setLb({ items, index })
  const closeLb = useCallback(() => setLb(null), [])
  const prevImg = useCallback(() => setLb(s => s ? { items: s.items, index: (s.index - 1 + s.items.length) % s.items.length } : s), [])
  const nextImg = useCallback(() => setLb(s => s ? { items: s.items, index: (s.index + 1) % s.items.length } : s), [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('lm-visible')
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('[data-lm-reveal]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!lb) { document.body.style.overflow = ''; return }
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLb()
      if (e.key === 'ArrowLeft')  prevImg()
      if (e.key === 'ArrowRight') nextImg()
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [lb, closeLb, prevImg, nextImg])

  return (
    <main style={{ background: 'var(--bg)', overflowX: 'hidden' }}>

      {/* ─── Scoped styles ─── */}
      <style>{`
        @keyframes lm-fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lm-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes lm-heroScale {
          from { transform: scale(1.06); }
          to   { transform: scale(1); }
        }
        @keyframes lm-scrollLine {
          0%   { transform: scaleY(0); transform-origin: top; }
          50%  { transform: scaleY(1); transform-origin: top; }
          51%  { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }

        [data-lm-reveal] {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1),
                      transform 0.9s cubic-bezier(0.16,1,0.3,1);
        }
        [data-lm-reveal].lm-visible {
          opacity: 1;
          transform: translateY(0);
        }
        [data-lm-delay="1"] { transition-delay: 0.08s; }
        [data-lm-delay="2"] { transition-delay: 0.16s; }
        [data-lm-delay="3"] { transition-delay: 0.24s; }
        [data-lm-delay="4"] { transition-delay: 0.32s; }
        [data-lm-delay="5"] { transition-delay: 0.40s; }
        [data-lm-delay="6"] { transition-delay: 0.48s; }

        /* Feature cards */
        .lm-feature-card {
          padding: 40px 32px;
          background: var(--bg);
          transition: background 0.3s ease;
          cursor: default;
        }
        .lm-feature-card:hover { background: var(--surface); }

        /* Product gallery */
        .lm-gallery-track {
          overflow-x: auto;
          display: flex;
          gap: 12px;
          scroll-snap-type: x mandatory;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .lm-gallery-track::-webkit-scrollbar { display: none; }
        .lm-product-img {
          height: 460px;
          width: auto;
          max-width: 680px;
          display: block;
          flex-shrink: 0;
          scroll-snap-align: start;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .lm-product-img:hover { transform: scale(1.025); }
        .lm-product-img { cursor: pointer; }

        /* Lightbox */
        .lm-lb {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(5,5,5,0.97);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          animation: lmLbIn 0.3s ease forwards;
        }
        @keyframes lmLbIn { from { opacity: 0; } to { opacity: 1; } }
        .lm-lb-img {
          max-width: min(90vw, 1200px); max-height: 82vh;
          object-fit: contain;
          box-shadow: 0 48px 140px rgba(0,0,0,0.9);
          border: 1px solid var(--border);
          display: block;
        }
        .lm-lb-body { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .lm-lb-caption {
          font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--muted);
          text-align: center; max-width: 560px; line-height: 1.6;
        }
        .lm-lb-label { color: var(--accent); margin-right: 8px; }
        .lm-lb-counter { font-family: var(--font-sans); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.25); }
        .lm-lb-close {
          position: fixed; top: 28px; right: 36px;
          background: none; border: 1px solid var(--border); cursor: pointer;
          font-family: var(--font-sans); font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted);
          padding: 8px 16px; transition: all 0.2s; border-radius: 2px;
        }
        .lm-lb-close:hover { color: var(--fg); border-color: var(--fg); }
        .lm-lb-arrow {
          position: fixed; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 24px; color: var(--muted); padding: 24px; transition: color 0.2s;
          line-height: 1; user-select: none;
        }
        .lm-lb-arrow:hover { color: var(--fg); }
        .lm-lb-prev { left: 12px; }
        .lm-lb-next { right: 12px; }

        /* Masonry fan art */
        .lm-masonry {
          columns: 3;
          column-gap: 4px;
        }
        .lm-masonry-img {
          width: 100%;
          display: block;
          margin-bottom: 4px;
          break-inside: avoid;
          transition: opacity 0.3s;
        }
        .lm-masonry-img:hover { opacity: 0.82; }
        .lm-masonry-img { cursor: pointer; }

        /* Press bar */
        .lm-press-link {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 24px 0;
          border-bottom: 1px solid var(--border);
          transition: opacity 0.2s;
        }
        .lm-press-link:hover { opacity: 0.6; }

        /* Prev/next */
        .lm-prev-next a {
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .lm-prev-next a:hover { opacity: 0.55; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .lm-press-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 680px) {
          .lm-two-col { grid-template-columns: 1fr !important; gap: 24px !important; }
          .lm-sketch-grid { grid-template-columns: 1fr !important; }
          .lm-stats-row { grid-template-columns: 1fr !important; }
          .lm-stats-row > div {
            border-right: none !important;
            padding-left: 0 !important;
            border-bottom: 1px solid var(--border);
          }
          .lm-stats-row > div:last-child { border-bottom: none; }
          .lm-masonry { columns: 2 !important; }
          .lm-product-img { height: 280px !important; }
          .lm-scroll-hint { display: none !important; }
          .lm-hero-scroll-cue { display: none !important; }
        }
        @media (max-width: 480px) {
          .lm-masonry { columns: 1 !important; }
          .lm-press-grid { grid-template-columns: 1fr !important; }
          .lm-product-img { height: 220px !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          height: '100svh',
          minHeight: '640px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${HERO_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 25%',
            filter: 'saturate(0.65) brightness(0.9)',
            animation: 'lm-heroScale 14s ease-out forwards',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #050505 0%, rgba(5,5,5,0.72) 42%, rgba(5,5,5,0.22) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 15% 90%, rgba(0,212,255,0.07) 0%, transparent 55%)' }} />

        <div
          style={{
            position: 'absolute', top: '-0.05em', right: '-0.04em',
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(160px, 28vw, 400px)',
            fontWeight: 900, color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.055)',
            lineHeight: 1, userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.04em',
          }}
        >03</div>

        <Link
          href="/work"
          style={{
            position: 'absolute', top: '92px', left: 'clamp(24px, 6vw, 80px)',
            fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '8px',
            opacity: 0, animation: 'lm-fadeUp 0.6s ease 0.2s forwards',
          }}
        >← Work</Link>

        <div style={{ position: 'relative', zIndex: 10, padding: '0 clamp(24px, 6vw, 80px) clamp(52px, 9vh, 88px)' }}>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.25em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '20px',
            opacity: 0, animation: 'lm-fadeUp 0.6s ease 0.45s forwards',
          }}>Co-Founder · Product Designer</p>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(60px, 13vw, 164px)',
            fontWeight: 900, lineHeight: 0.87, letterSpacing: '-0.025em', margin: 0,
            opacity: 0, animation: 'lm-fadeUp 0.9s ease 0.65s forwards',
          }}>
            <span style={{ display: 'block', color: 'var(--fg)' }}>Little</span>
            <span style={{ display: 'block', color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.88)', fontStyle: 'italic' }}>Monsters.com</span>
          </h1>

          <div style={{
            marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '8px 28px',
            opacity: 0, animation: 'lm-fadeUp 0.6s ease 0.9s forwards',
          }}>
            {['Lady Gaga', '2011–2012', 'littlemonsters.com'].map((t) => (
              <span key={t} style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: '32px', right: 'clamp(24px, 6vw, 80px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
          opacity: 0, animation: 'lm-fadeUp 0.6s ease 1.2s forwards',
        }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', writingMode: 'vertical-rl' }}>Scroll</span>
          <div style={{ width: '1px', height: '52px', background: 'var(--muted)', animation: 'lm-scrollLine 2s ease-in-out 1.5s infinite' }} />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TICKER STRIP
      ═══════════════════════════════════════ */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '13px 0', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'lm-ticker 28s linear infinite' }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {['Fan Art = Fine Art', 'Lady Gaga', 'Co-Founded 2011', 'Creative Community', 'Love & Acceptance', 'Social Network', 'littlemonsters.com', 'Cultural Impact', 'Lives Changed', 'Superfan Platform'].map((item) => (
                <span key={item} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', padding: '0 28px', whiteSpace: 'nowrap' }}>
                  {item}<span style={{ color: 'var(--accent)', margin: '0 6px', opacity: 0.7 }}>·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          THE BRIEF
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(80px, 13vh, 144px) clamp(24px, 6vw, 80px)' }}>
        <div className="lm-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 240px) 1fr', gap: '64px', alignItems: 'start' }}>
          <div data-lm-reveal>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>The Brief</p>
            <div style={{ width: '24px', height: '1px', background: 'var(--accent)' }} />
          </div>
          <div>
            <h2 data-lm-reveal style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.6vw, 50px)', fontWeight: 700, lineHeight: 1.12, color: 'var(--fg)', marginBottom: '32px', maxWidth: '700px' }}>
              Co-founded a creative social platform with Lady Gaga — before fan platforms were a category.
            </h2>
            <p data-lm-reveal data-lm-delay="2" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 1.8vw, 20px)', lineHeight: 1.72, color: 'rgba(255,255,255,0.65)', maxWidth: '640px' }}>
              In 2011, I co-founded Little Monsters with Lady Gaga — a purpose-built creative community for her global superfan base. Inspired by what DeviantArt did for my own creative development, I designed a platform that treated fans as artists, not audience. A place to share, create, and inspire — where fan art was fine art, and belonging was the product.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THE PROBLEM
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(80px, 13vh, 144px) clamp(24px, 6vw, 80px)' }}>
        <p data-lm-reveal style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '40px' }}>The Problem</p>
        <h2 data-lm-reveal style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(44px, 9vw, 110px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.025em', color: 'var(--fg)', maxWidth: '900px', marginBottom: '52px' }}>
          Fans had no real home.
        </h2>
        <div data-lm-reveal data-lm-delay="2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', maxWidth: '820px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.72, color: 'var(--muted)' }}>
            In 2011, fan communities lived in comment sections, Facebook groups, and scattered forums. They had no dedicated creative infrastructure — no tools, no identity, no sense of permanence.
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.72, color: 'var(--muted)' }}>
            Little Monsters was built to change that. Not just a social network, but a creative platform purpose-built for one of the world's most passionate fan communities — with tools, culture, and a philosophy to match their energy.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SKETCH GALLERY — From whiteboard to world
      ═══════════════════════════════════════ */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(64px, 10vh, 112px) clamp(24px, 6vw, 80px) clamp(40px, 6vh, 64px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <div data-lm-reveal>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Origin · 2011</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--fg)' }}>From whiteboard to world.</p>
            </div>
            <p data-lm-reveal data-lm-delay="2" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--muted)', maxWidth: '320px', textAlign: 'right', lineHeight: 1.6 }}>
              The first sketches, age 22. Built for myself, as a Little Monster.
            </p>
          </div>
        </div>

        <div
          className="lm-sketch-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
          }}
        >
          {sketches.map((src, i) => (
            <div key={src} data-lm-reveal data-lm-delay={String(i + 1)} style={{ overflow: 'hidden' }}>
              <img
                src={src}
                alt={i === 0 ? 'Whiteboard sketches, 2011' : 'First visual design concepts'}
                loading="lazy"
                style={{ width: '100%', height: 'clamp(300px, 42vh, 520px)', objectFit: 'cover', objectPosition: 'top', display: 'block', cursor: 'pointer' }}
                onClick={() => openLb([
                  { src: sketches[0], label: 'Whiteboard Sketches, 2011', caption: 'The original whiteboard sketches — hand-drawn concepts for what would become LittleMonsters.com' },
                  { src: sketches[1], label: 'First Visual Design Concepts', caption: 'Early visual explorations, age 22. Built for myself, as a Little Monster.' },
                ], i)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES — What We Built
      ═══════════════════════════════════════ */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(80px, 13vh, 144px) clamp(24px, 6vw, 80px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <p data-lm-reveal style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>What We Built</p>
              <h2 data-lm-reveal style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--fg)', lineHeight: 1.1, margin: 0 }}>Six tools.<br />One culture.</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', border: '1px solid var(--border)' }}>
            {features.map((f, i) => (
              <div key={f.n} className="lm-feature-card" data-lm-reveal data-lm-delay={String(i + 1)} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.22em', color: 'var(--accent)', display: 'block', marginBottom: '18px' }}>{f.n}</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: 'var(--fg)', marginBottom: '12px', lineHeight: 1.2 }}>{f.title}</h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.72, color: 'var(--muted)', margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRODUCT GALLERY — The Platform
      ═══════════════════════════════════════ */}
      <section style={{ paddingTop: 'clamp(80px, 13vh, 144px)', paddingBottom: 'clamp(80px, 13vh, 144px)', borderBottom: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 6vw, 80px)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p data-lm-reveal style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>The Platform</p>
              <h2 data-lm-reveal style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--fg)', lineHeight: 1.1, margin: 0 }}>Every screen,<br />designed with purpose.</h2>
            </div>
            <p data-lm-reveal className="lm-scroll-hint" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>← Scroll to explore →</p>
          </div>
        </div>

        {/* Horizontal scroll track — full bleed */}
        <div
          className="lm-gallery-track"
          style={{ paddingLeft: 0 }}
        >
          {screens.map((s, i) => (
            <div key={s.src} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: i === 0 ? 'clamp(24px, 6vw, 80px)' : 0 }}>
              <img
                src={s.src}
                alt={s.label}
                loading="lazy"
                className="lm-product-img"
                onClick={() => openLb(screens, i)}
              />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>{s.label}</span>
            </div>
          ))}
          {/* trailing spacer */}
          <div style={{ flexShrink: 0, width: 'clamp(24px, 6vw, 80px)' }} />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          IMPACT STATS
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(80px, 13vh, 144px) clamp(24px, 6vw, 80px)' }}>
        <p data-lm-reveal style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '64px' }}>Impact</p>
        <div className="lm-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          {impact.map((s, i) => (
            <div key={s.value} data-lm-reveal data-lm-delay={String(i + 1)} style={{ padding: 'clamp(40px, 7vh, 80px) 0', borderRight: i < impact.length - 1 ? '1px solid var(--border)' : 'none', paddingLeft: i > 0 ? 'clamp(28px, 4vw, 60px)' : '0' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 8vw, 92px)', fontWeight: 900, color: 'var(--fg)', lineHeight: 1, letterSpacing: '-0.025em', marginBottom: '14px' }}>{s.value}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', letterSpacing: '0.04em', color: 'var(--muted)', lineHeight: 1.5, whiteSpace: 'pre-line', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PULL QUOTE
      ═══════════════════════════════════════ */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', padding: 'clamp(80px, 15vh, 168px) clamp(24px, 6vw, 80px)', textAlign: 'center' }}>
          <div data-lm-reveal style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(64px, 10vw, 120px)', lineHeight: 0.6, color: 'var(--accent)', opacity: 0.3, marginBottom: '24px', userSelect: 'none' }}>"</div>
          <blockquote data-lm-reveal style={{ margin: 0 }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(22px, 3.2vw, 38px)', fontWeight: 400, lineHeight: 1.42, color: 'var(--fg)', marginBottom: '36px' }}>
              This isn't a social network. It's a place of love and acceptance — where every fan is also a creator, and every creation matters.
            </p>
            <footer style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)' }}>Joey Primiani, Co-Founder</footer>
          </blockquote>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CULTURAL IMPACT
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(80px, 13vh, 144px) clamp(24px, 6vw, 80px)' }}>
        <p data-lm-reveal style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '20px' }}>Cultural</p>
        <h2 data-lm-reveal data-lm-delay="1" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 80px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.02em', color: 'var(--fg)', marginBottom: '64px' }}>Impact.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px 64px' }}>
          {cultural.map((item, i) => (
            <div key={item.title} data-lm-reveal data-lm-delay={String((i % 2) + 1)}>
              <div style={{ width: '16px', height: '2px', background: 'var(--accent)', marginBottom: '20px', opacity: 0.6 }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 700, color: 'var(--fg)', marginBottom: '14px', lineHeight: 1.2 }}>{item.title}</h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.72, color: 'var(--muted)', margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAN ART GALLERY
      ═══════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(64px, 10vh, 112px) clamp(24px, 6vw, 80px) clamp(40px, 6vh, 56px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
            <div>
              <p data-lm-reveal style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>Fan Art = Fine Art</p>
              <h2 data-lm-reveal style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--fg)', lineHeight: 1.1, margin: 0 }}>What the community created.</h2>
            </div>
            <p data-lm-reveal style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--muted)', maxWidth: '280px', textAlign: 'right', lineHeight: 1.6 }}>
              Artwork by Helen Green, Iggy Proof, DendaReloaded, and community artists worldwide.
            </p>
          </div>
        </div>

        <div
          className="lm-masonry"
          style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 6vw, 80px)' }}
        >
          {fanArt.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Community artwork ${i + 1}`}
              loading="lazy"
              className="lm-masonry-img"
              onClick={() => openLb(fanArt.map(s => ({ src: s })), i)}
            />
          ))}
        </div>
        <div style={{ height: 'clamp(48px, 8vh, 80px)' }} />
      </section>

      {/* ═══════════════════════════════════════
          PRESS — As covered by
      ═══════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(64px, 10vh, 112px) clamp(24px, 6vw, 80px)' }}>
          <p data-lm-reveal style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '56px' }}>As Covered By</p>
          <div className="lm-press-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0' }}>
            {press.map((p, i) => (
              <a
                key={p.outlet + i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lm-press-link"
                data-lm-reveal
                data-lm-delay={String((i % 3) + 1)}
                style={{ paddingRight: '40px' }}
              >
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: 'var(--fg)', letterSpacing: '-0.01em' }}>{p.outlet}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.55 }}>{p.description} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PHILOSOPHY CLOSER
      ═══════════════════════════════════════ */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(80px, 13vh, 160px) clamp(24px, 6vw, 80px)' }}>
          <div className="lm-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 240px) 1fr', gap: '64px', alignItems: 'start' }}>
            <div data-lm-reveal>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>Design Philosophy</p>
              <div style={{ width: '24px', height: '1px', background: 'var(--accent)' }} />
            </div>
            <div>
              <h2 data-lm-reveal style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(40px, 7.5vw, 88px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.025em', color: 'var(--fg)', marginBottom: '40px' }}>
                Fan art<br />= fine art.
              </h2>
              <p data-lm-reveal data-lm-delay="2" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 1.8vw, 20px)', lineHeight: 1.72, color: 'rgba(255,255,255,0.62)', maxWidth: '600px', margin: 0 }}>
                DeviantArt shaped who I am as a designer. I wanted to build for the next generation of young creatives what DeviantArt did for mine — a special place that takes their work seriously, that builds infrastructure for passion, and that proves creativity is a legitimate path. Little Monsters was that platform. And it worked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PREV / NEXT NAV
      ═══════════════════════════════════════ */}
      <div className="lm-prev-next" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(48px, 8vh, 96px) clamp(24px, 6vw, 80px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
          <Link href="/work/google-x" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>← Previous</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--fg)' }}>Google X</span>
          </Link>
          <Link href="/work/linkedin" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>Next →</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--fg)' }}>LinkedIn</span>
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lb !== null && (
        <div
          className="lm-lb"
          onClick={(e) => { if (e.target === e.currentTarget) closeLb() }}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button className="lm-lb-close" onClick={closeLb}>✕ Close</button>
          <button className="lm-lb-arrow lm-lb-prev" onClick={(e) => { e.stopPropagation(); prevImg() }}>&#8592;</button>
          <div className="lm-lb-body">
            <img
              className="lm-lb-img"
              src={lb.items[lb.index].src}
              alt={lb.items[lb.index].label || ''}
            />
            {(lb.items[lb.index].label || lb.items[lb.index].caption) && (
              <p className="lm-lb-caption">
                {lb.items[lb.index].label && <span className="lm-lb-label">{lb.items[lb.index].label} — </span>}
                {lb.items[lb.index].caption}
              </p>
            )}
            <p className="lm-lb-counter">{lb.index + 1} / {lb.items.length}</p>
          </div>
          <button className="lm-lb-arrow lm-lb-next" onClick={(e) => { e.stopPropagation(); nextImg() }}>&#8594;</button>
        </div>
      )}
    </main>
  )
}
