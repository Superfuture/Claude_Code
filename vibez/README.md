# Vibez

A daily leaderboard for vibe-coded projects to get inspired.

Built with Claude, Cursor, v0, Bolt, Lovable and friends — Vibez is where indie makers drop the AI-assisted things they shipped, and the day's hottest project wins a permanent Hall of Fame badge.

## What's in here

- **`index.html`** — the homepage / today's leaderboard. Single-file prototype: nav, hero, podium, ranked board, side rail (featured, top makers, scoring, countdown), waitlist + invite + submit modals, sign-in flow.
- **`sponsor.html`** — the sponsorship page. Three pricing tiers (daily / weekly / monthly), Stripe Payment Link buttons, partner showcase, FAQ.
- **`PLAN.md`** — the original product plan: vision, brand, data model, two-week sprint, cut list, open questions.

## Run locally

It's plain HTML — open `index.html` in a browser. Or:

```bash
python3 -m http.server 8000
open http://localhost:8000
```

## Plug in your services

Open `index.html` and find the `CONFIG` block at the top of the `<script>` tag:

```js
const CONFIG = {
  waitlistEndpoint: '',  // Formspree, Web3Forms, Resend, etc.
  submitEndpoint:  '',   // same
  validInviteCodes: ['VIBEZ', 'EARLY', 'BAGEL', 'JP', 'CLAUDE'],
  waitlistSeed: 41,
};
```

For the sponsor page (`sponsor.html`), paste your Stripe Payment Link URLs into `STRIPE_LINKS`:

```js
const STRIPE_LINKS = {
  daily:   'https://buy.stripe.com/...',
  weekly:  'https://buy.stripe.com/...',
  monthly: 'https://buy.stripe.com/...',
};
```

Until those are set, the prototype uses `localStorage` so everything still feels real, and the sponsor buttons fall back to email.

## Sign-in

The current sign-in flow is mocked (captures name/email/handle into `localStorage`). To wire real Google OAuth, swap the `signIn()` function in `index.html` for a Supabase, Firebase, or Auth0 client call.

## Demo invite codes

For testing the submit flow without wiring auth:

```
VIBEZ · EARLY · BAGEL · JP · CLAUDE
```

## Brand

- **Display:** Fraunces (italic + WONK axis for accents)
- **Body:** Hanken Grotesk
- **Mono:** JetBrains Mono
- **Palette:** ink `#1A1A2E` · paper `#FCFAF6` · rose `#C76090` · blush `#F2C7DB` · ice `#BBDDED` · sour `#DCEC68`

## Credits

Created by [@jp](https://twitter.com/jp). Built mostly with Claude Code.
