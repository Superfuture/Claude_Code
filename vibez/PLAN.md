# Vibez — Plan

A social network + daily leaderboard for **vibe-coded** (AI-assisted) projects. Think Product Hunt, but exclusively for things shipped with Claude Code, Cursor, v0, Bolt, Lovable, and friends — wrapped in a Y2K-bubblegum, maximalist aesthetic.

> **Owner:** Joey · **Target:** soft launch in 2 weeks · **Status:** plan / pre-build

---

## 1. Vision & Positioning

- **One-liner:** *"Vibez is where vibe-coded projects compete for the day's top spot."*
- **Why now:** AI coding has produced a wave of solo/indie launches with nowhere native to live. Product Hunt is too generalist, X is too ephemeral, GitHub Trending doesn't capture polish or "vibe."
- **Who it's for:** Indie makers, AI-tool power users, Cursor/Claude/v0 communities, designer-developers, build-in-public people.
- **What makes it different from Product Hunt:**
  - Eligibility is *narrow on purpose* — AI-assisted only.
  - Expressive **reactions** instead of upvotes (fits the playful brand).
  - **Daily reset arcade leaderboard** — every day a new high score.
  - Visual-first cards (demo GIFs/video, screenshots) over text descriptions.
  - Surfaces *which AI tool* built each project — meta-discovery layer for the tools themselves.
- **North-star metric:** # of high-quality submissions per day.
- **Secondary metrics:** reactions per project, return-visit rate, maker follow growth.

---

## 2. Brand & Aesthetic

### Direction
**Maximalist, playful, Y2K-bubblegum.** Glossy, fun, slightly nostalgic. Animations, big type, expressive icons. Should feel like a 2003 arcade flyer crashed into a 2026 design system.

### Palette
| Token | Hex | Use |
|---|---|---|
| `bubblegum` | `#FF7BD5` | Primary accent, CTAs, reaction highlights |
| `chrome` | `#C0C5CE` | Borders, dividers, secondary surfaces |
| `iceblue` | `#A8E8FF` | Hover states, alt accent, links |
| `midnight` | `#1A1A2E` | Primary text, dark surface |
| `paper` | `#FFFFFF` | Default surface |

### Type
- **Display:** a chunky geometric or rounded sans (e.g. Druk Wide, Migra, or PP Right Grotesk). Big and confident.
- **Body:** something readable but slightly opinionated — Inter, General Sans, or PP Neue Montreal.
- **Mono accent:** for build-time / prompt-count brags and the leaderboard rank numbers.

### Motion
- Card hover: slight tilt + iridescent sheen sweep.
- Reaction tap: emoji "pops" up the score with a spring + confetti for milestone numbers (10, 100, 500).
- Leaderboard rank changes: smooth reorder animation (Framer Motion `LayoutGroup`).
- Day-reset moment at midnight PT: short celebratory transition.

### Form factor
**Desktop-first, mobile responsive.** Submission is laptop-heavy; browsing/reacting works on phones. PWA support is a stretch goal, not v1.

---

## 3. Eligibility & Submission

### Eligibility rules
- Project must be **AI-assisted** (built primarily with an AI coding tool).
- Must be **deployed at a live URL**.
- Honor system, with light verification: submitter chooses an AI tool from the dropdown; can be flagged.

### Submission requirements
| Field | Required | Notes |
|---|---|---|
| Project name | ✅ | 40 char max |
| Live URL | ✅ | Validated for HTTP 200 at submit |
| Tagline | ✅ | 80 char max |
| Description | ✅ | Markdown, 1000 char max |
| Hero image / screenshot | ✅ | Min 1200×800, stored in Supabase Storage |
| Demo video / GIF | optional | mp4/webm/gif, ≤30s, ≤25MB, autoplays muted in card |
| AI tool used | ✅ | Multi-select: Claude Code, Cursor, v0, Bolt, Lovable, Replit Agent, Windsurf, ChatGPT, Other |
| Build time | optional | Free text, e.g. "4 hours" |
| Prompt count | optional | Integer brag |
| Category | ✅ | Single: Games, Tools, Art, Social, Productivity, Dev, Education, Weird, Other |
| Tags | optional | Free-form, up to 5 |
| Maker(s) | auto | Pulls from logged-in profile; can add co-makers by handle |
| Source/repo | optional | GitHub/GitLab URL |

### Cadence
- **Anytime submission.** Project lands on **today's board** the moment it's posted.
- Daily reset at **00:00 PT** — board freezes, becomes a permanent archive page.

---

## 4. Reactions & Scoring

### Reaction set (5, weighted)
| Emoji | Name | Weight |
|---|---|---|
| 🔥 | fire | 1 |
| 🤯 | mindblown | 2 |
| 🚂 | choo-choo | 3 |
| 🧠 | galaxy-brain | 4 |
| ✨ | sparkle (highest praise) | 5 |

*(Exact emoji choice still open — see Open Questions §13. Weights start as above and tune from there.)*

### Rules
- **One reaction type per user per project.** A user picks 🔥 OR 🤯 OR 🚂 etc. — switching is allowed and replaces the previous reaction.
- This caps a single user's contribution to one project at the highest weight (5), but rewards expressiveness.
- Score = sum of (weight × count) across all reaction types.
- Login required to react.

### Anti-gaming
- 1-per-user enforcement at the DB level (`UNIQUE(project_id, user_id)` on reactions table).
- Google OAuth only at v1 raises the bar for sockpuppets.
- Rate limit: ≤30 reactions/minute per user across all projects (light spam guard).
- Flag system for community policing of obvious manipulation.
- Manual audit query Joey runs daily: "Users who reacted to >50 projects today" → spot-check.

### Leaderboard
- **Daily board** = projects submitted in the current PT day, ranked by score, ties broken by earliest submission.
- **Hall of Fame** = permanent page of every day's #1.
- **Maker leaderboard** = users ranked by cumulative score across their projects (all-time + monthly views).
- **Category boards** = same logic, filtered by category.

---

## 5. Tech Architecture

### Stack
- **Frontend:** Next.js 15 (App Router, RSC), TypeScript, Tailwind CSS, Framer Motion.
- **Backend:** Supabase — Postgres + Auth + Storage + Edge Functions where needed.
- **Hosting:** Vercel (auto-deploy from `main`).
- **Email:** Resend, for digests + notification emails.
- **OG cards:** `@vercel/og` (edge runtime, dynamic).
- **Analytics:** Plausible or Vercel Analytics (privacy-respecting, no cookie banner).
- **Error tracking:** Sentry (free tier).
- **Domain:** TBD — `vibez.app`, `vibez.fm`, `getvibez.com`, etc. (§13).

### Why this stack
- Next.js + Supabase matches Joey's Dream Machine pattern → fast ramp.
- Supabase Storage handles screenshots and short videos in one place. Move to R2/Stream later if bandwidth becomes an issue.
- App Router + RSC means SEO-friendly project pages without a separate API layer.

### Data model (Postgres / Supabase)

```sql
-- auth.users handled by Supabase

profiles (
  id uuid pk references auth.users,
  handle text unique,           -- @username for vibez.app/u/<handle>
  display_name text,
  bio text,
  avatar_url text,
  twitter_handle text,
  github_handle text,
  website_url text,
  created_at timestamptz default now()
)

projects (
  id uuid pk,
  maker_id uuid references profiles,
  name text,
  slug text unique,             -- vibez.app/p/<slug>
  tagline text,
  description text,
  live_url text,
  repo_url text,
  hero_image_url text,
  demo_media_url text,          -- gif/mp4
  demo_media_type text,         -- 'image' | 'video' | 'gif'
  category text,                -- enum-like
  tags text[],
  ai_tools text[],              -- e.g. ['claude-code', 'cursor']
  build_time text,
  prompt_count int,
  submitted_at timestamptz default now(),
  daily_board_date date,        -- date(submitted_at at PT) — indexed
  is_flagged boolean default false,
  is_removed boolean default false
)

project_co_makers (
  project_id uuid references projects,
  profile_id uuid references profiles,
  pk(project_id, profile_id)
)

reactions (
  project_id uuid references projects,
  user_id uuid references profiles,
  reaction text,                -- 'fire' | 'mindblown' | 'choochoo' | 'brain' | 'sparkle'
  created_at timestamptz default now(),
  pk(project_id, user_id)       -- enforces 1-per-user
)

comments (
  id uuid pk,
  project_id uuid references projects,
  author_id uuid references profiles,
  body text,
  created_at timestamptz default now(),
  is_removed boolean default false
)

follows (
  follower_id uuid references profiles,
  followee_id uuid references profiles,
  created_at timestamptz default now(),
  pk(follower_id, followee_id)
)

notifications (
  id uuid pk,
  recipient_id uuid references profiles,
  type text,                    -- 'new_launch_from_followed' | 'comment_on_project' | 'milestone' | 'daily_winner'
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
)

flags (
  id uuid pk,
  project_id uuid references projects,
  reporter_id uuid references profiles,
  reason text,
  created_at timestamptz default now(),
  resolved_at timestamptz
)

daily_winners (
  date date pk,
  project_id uuid references projects,
  final_score int,
  archived_at timestamptz default now()
)

featured_slots (
  id uuid pk,
  project_id uuid references projects,
  starts_at timestamptz,
  ends_at timestamptz,
  sponsor_label text,           -- e.g. 'Sponsored by Cursor'
  created_at timestamptz default now()
)
```

### Materialized score
A `project_scores` materialized view (or trigger-maintained denormalized column on `projects`) computes:
```
score = SUM(reaction_weight[reaction]) GROUPED BY project_id
```
Refreshed on each reaction insert/update/delete via a Postgres trigger. Cheap because reactions are bounded (1 per user per project).

### Row-level security
- `profiles`: public read, self-write.
- `projects`: public read where `not is_removed`, owner write.
- `reactions`: public read, authenticated insert/upsert/delete (self only).
- `comments`: public read where `not is_removed`, authenticated insert, owner edit/delete.
- `flags`: insert by any authed user, read only by service role.

---

## 6. Auth & Onboarding

- **Provider:** Google OAuth via Supabase. Only provider at v1.
- **First-time flow:**
  1. Sign in with Google.
  2. Forced handle picker (suggests from email/name, must be unique).
  3. Optional: bio, avatar (defaults to Google photo), socials.
  4. Land on home (today's board) with a "Drop your first project" CTA.
- **No email/password.** No magic link. No GitHub/X at v1 — they're on the roadmap when there's demand.

---

## 7. Page-by-Page UX

### `/` — Home / Today's Board
- **Hero:** the day, current top 3 in a big card carousel/grid.
- **Daily board:** ranked list of all today's projects. Infinite scroll or paginated.
- **Card contents:** rank, hero media (autoplaying muted GIF/video on hover), name, tagline, maker(s), AI-tool chips, reaction bar with live counts, score, comment count.
- **Right rail (desktop):** featured slot (sponsored), maker leaderboard preview, "Coming soon" upcoming launches.

### `/p/<slug>` — Project page
- Full hero media (video/gif/image), name, tagline, full description (markdown).
- Reaction bar with the 5 emojis and counts.
- Maker(s) profile chips.
- Meta: AI tools, build time, prompt count, category, tags, links (live, repo).
- Flat comment thread.
- "Vote for me" share link generator (with maker's tracking).
- Embed widget code snippet (for makers to paste on their site).
- OG image: auto-generated card (project hero + rank + score).

### `/u/<handle>` — Maker profile
- Avatar, name, handle, bio, socials.
- Stats: total score, # projects, follower count, days-on-board count, hall-of-fame wins.
- Project grid: all their submissions, sortable by score/date.
- Follow button.

### `/leaderboard` — Boards
- Tabs: Today (default) · This Week · This Month · All Time · By Category · Makers.
- Each is a ranked list.

### `/hall-of-fame` — Permanent winners
- One row per day, showing that day's #1 with media + score + winner badge.

### `/submit` — New project
- Multi-step form, very visual. Live preview card on the right showing how it'll look on the board.
- Step 1: URL + name + tagline → Step 2: media upload → Step 3: meta (AI tools, category, etc.) → Step 4: preview & submit.

### `/notifications` — Bell
- List of notifications, unread badge, mark-all-read.

### `/settings` — Account
- Email digest cadence (off / weekly / daily), connected accounts, handle, profile fields.

---

## 8. Notifications

### Channels
- **In-app bell** (always on).
- **Email digests** via Resend:
  - Daily 8am PT digest: top 5 from yesterday, what your followed makers shipped.
  - Weekly Sunday recap: top 10 of the week, biggest movers.
  - Transactional: comment on your project, your project hit a milestone (10/100/1000 score), you won the day.

### Notification triggers
- A maker you follow launches a new project.
- Someone comments on your project.
- Your project hits a score milestone (10, 100, 500, 1000).
- Your project finishes #1 for the day.
- Your project is flagged (only visible to maker + admin).

### Implementation
- DB-driven: every event inserts a `notifications` row.
- Background worker (Supabase Edge Function on cron) batches and sends emails at 8am PT.
- Resend handles delivery, bounces, unsubscribes.

---

## 9. Moderation

- **Auto-publish.** Submissions go live immediately.
- **Flag button** on every project and comment.
- Flagged content stays live but enters an **admin queue** at `/admin` (Joey only, gated by a hardcoded user ID list at v1).
- Admin can: hide project (`is_removed = true`), hide comment, ban user.
- **Automatic guards:**
  - URL validation on submit (must return 2xx).
  - Image NSFW check via a free model (e.g. NSFWJS in an Edge Function) — soft signal, queues for review if positive.
  - Profanity filter on project names/taglines (block-list, surface in queue, not auto-reject).
- **Future:** Claude / OpenAI moderation API on submission text. Skipped at v1 for cost + latency.

---

## 10. Sharing & Virality

- **Auto-generated OG cards** per project via `@vercel/og`: hero image + name + score + rank + bubblegum gradient frame. Renders on the edge in <100ms.
- **"Vote for me" links:** `vibez.app/p/<slug>?via=<maker-handle>` — pre-highlights the project, tracks referrer. Maker can copy from project page.
- **Embed widget:** lightweight `<script>` snippet for makers' own sites. Renders a Vibez badge showing their current rank. Updates daily via static JSON.
- **Weekly recap auto-post:** Vibez account on X auto-tweets top 5 every Sunday. Manual at first (Joey copies a generated tweet), automated once X API budget is approved.

---

## 11. Cold Start Playbook

**Approach:** Invite-only beta with maker waitlist → ramp to public.

### Pre-launch (week before)
- Build maker waitlist landing page (`/waitlist` route, or use Tally/Typeform).
- Personally DM ~50 makers from Joey's network: Cursor power-users, prolific Claude builders, indie devs from X.
- Soft-pitch: *"You're getting first dibs on Vibez, the leaderboard for vibe-coded projects. We launch [date]."*

### Soft-launch day
- Open submissions to the ~50 invited makers only.
- Joey pre-seeds 10-15 known great vibe-coded projects (with maker permission, properly attributed).
- Goal: 20-30 projects on the board within 24 hours.

### Public launch (~1 week after soft launch)
- Open submissions to anyone with Google login.
- Coordinated post on X + relevant Discords (Cursor, Lovable, etc.).
- Submit Vibez itself to Product Hunt — meta + earns PH community attention.

### Sponsor/partner ask (parallel track)
- Pitch Cursor / Lovable / v0 on a launch-week sponsored slot. Even one yes = legitimacy + a featured banner.

---

## 12. Two-Week Sprint Plan

Aggressive. Soft launch in 14 days. Cuts are sacred (§13).

### Days 1–2: Foundation
- Next.js + Supabase scaffold, Tailwind, design tokens, base layout shell.
- Auth (Google OAuth via Supabase).
- DB schema + RLS policies + Storage buckets.
- Brand: logo lockup, type setup, palette tokens, hero card component.

### Days 3–5: Core flows
- Submit project flow (multi-step form, media upload, validation).
- Project page (`/p/<slug>`) with reaction bar.
- Home `/` with today's board, server-rendered.
- Profile `/u/<handle>`.
- Maker leaderboard.

### Days 6–8: Reactions, comments, follows
- 5 weighted reactions with optimistic UI + spring animations.
- Score materialization (trigger-based or matview + cron).
- Flat comments.
- Follow / unfollow + notifications schema.

### Days 9–10: Notifications & sharing
- In-app notification bell.
- OG card generator.
- "Vote for me" links with referrer tracking.
- Resend wired up + transactional emails (no digest yet).

### Days 11–12: Moderation, archive, polish
- Flag button + admin queue.
- Daily reset cron: archives yesterday, opens today, posts winner to `daily_winners`, fires winner notifications.
- Hall of Fame page.
- Hall-of-fame badge on profiles.
- Featured slot rendering (no payment yet — Joey assigns manually).

### Day 13: Seed + soft-launch prep
- Joey loads 10-15 seed projects.
- DM the 50 invited makers with their access link.
- Bug bash with 3-5 friendly testers.

### Day 14: Soft launch
- Open to invited makers + seeded board.
- Joey monitors metrics + queues + Resend deliverability.
- First daily winner crowned at end of day.

### Week 3+ (post-soft-launch)
- Email digests (daily + weekly).
- Embed widget.
- Category boards.
- Public launch.

---

## 13. Explicit Cut List (NOT in v1)

- ❌ **DMs / messaging** — moderation black hole.
- ❌ **Multi-language / i18n** — English only.
- ❌ **Maker analytics dashboard** — Plausible covers Joey's needs; per-maker analytics later.
- ❌ **Native mobile apps** — web + responsive. PWA is a stretch goal.
- ❌ **Custom domains for makers** — they link out, that's enough.
- ❌ **Threaded comments** — flat only, fewer drama vectors.
- ❌ **Payment infra** — featured slots are manually invoiced/free at v1.
- ❌ **GitHub/X auth** — Google only.
- ❌ **AI-tool verification (oauth proof)** — honor system + flagging.

---

## 14. Open Questions / Decisions to Lock

1. **Domain.** `vibez.app`? `vibez.fm`? `getvibez.com`? `vibez.lol`? Need to register before brand work goes deep.
2. **Exact reaction emoji set + weights.** The 🔥/🤯/🚂/🧠/✨ proposal is a starting point. Could be 🔥/💎/🚀/🎨/👑 or something else. Should playtest with 5 makers before locking.
3. **AI-tool list.** Need a canonical dropdown. Initial: Claude Code, Cursor, v0, Bolt, Lovable, Replit Agent, Windsurf, ChatGPT, Other. Add/prune as the space evolves.
4. **Category list.** Starting set: Games, Tools, Art, Social, Productivity, Dev, Education, Weird, Other. Refine after first 100 submissions.
5. **Timezone of day-reset.** PT proposed. Consider UTC for global fairness — but PT matches Joey's working hours and most AI/indie maker overlap.
6. **Logo + wordmark.** Needs to fit the Y2K-bubblegum, arcade-leaderboard energy. Commission or AI-generate + refine.
7. **First sponsored slot.** Pitch ready for Cursor / Lovable / v0 by day 10?
8. **Spam mitigation for Google OAuth.** Google logins are essentially free — a determined bad actor can create dozens. Consider adding a friction step (CAPTCHA on submit, age-of-account minimum) if abuse appears.
9. **Video storage costs.** Supabase Storage egress is $0.09/GB. If a few projects with autoplaying mp4s get 100k+ views, costs scale fast. Have a "switch to Cloudflare R2/Stream" plan ready.

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Empty board on day 1 | Medium | High | Invite-only + seeded projects |
| Reaction gaming / sockpuppets | Medium | Medium | Google OAuth + rate limit + manual audit + flag |
| One viral project drains storage budget | Low | Medium | Egress alerts in Supabase; pre-built R2 fallback |
| "Vibe coded" eligibility disputes | High | Low | Honor system; flag → manual review; lean on community norms |
| Product Hunt cease-and-desist-ish vibes | Low | Low | Different niche, different mechanic; just don't lift their UI |
| Joey burns out at aggressive pace | Medium | High | Cut list is sacred; scope expansion happens post-launch |
| Daily-reset feels stressful to non-PT users | Medium | Low | Surface "submit anytime" prominently; document tz |

---

## 16. Post-v1 Roadmap (rough)

- Email digests, weekly recap automation.
- Embed widget.
- Category leaderboards.
- Public submissions (no invite needed).
- GitHub + X auth.
- AI-tool verification (OAuth into Cursor/Claude/etc. as proof).
- Maker analytics dashboard (views, reaction breakdown, referrers).
- Paid sponsored slots with Stripe.
- Pro tier ($5-10/mo): custom profile, scheduled launches, priority queue.
- iOS PWA polish + push.
- DMs (eventually).
- Native iOS app if traction demands it.
