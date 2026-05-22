# Slidelang — AI Fund Build Challenge Plan

**Candidate:** Joey Primiani
**Challenge:** Slidelang — hosted deck-as-code authoring platform
**Turnaround:** 48 hours from receipt
**Submission:** Reply to AI Fund email with labeled lines (see checklist)

---

## TL;DR

A hosted, deck-as-code authoring platform. You write or generate a strict YAML deck spec; a deterministic compiler renders it to editable HTML slides; a validator measures real DOM boxes and flags overflow, collisions, contrast, and chart-sanity issues; one click runs an LLM-assisted repair that emits a YAML diff. Same compiler runs from a CLI. Ships at a Cloudflare Pages URL with `/d/:id` share links.

**Wedge:** prompt-to-slides tools (Gamma/Tome) produce static, brittle output. Slidelang treats the deck as a typed program — every block is a typed, positioned, validatable artifact — so AI and humans can collaborate on the same source of truth.

**Showpiece depth area:** layout validation + AI auto-repair (visible in product).
**Second depth surface:** decoupled compiler shipped as a CLI (`slidelang gen` / `slidelang render`).

---

## Submission Checklist (labeled reply format)

- [ ] **Demo video:** Loom, 2–5 min, public link
- [ ] **PRD:** Google Doc, 1–2 pages, anyone-with-link
- [ ] **TDD:** Google Doc, 1–2 pages, anyone-with-link
- [ ] **Prototype:** `https://slidelang.pages.dev` (or custom domain)
- [ ] **Source code:** GitHub repo (public)
- [ ] **Access notes / credentials:** none needed — all links public
- [ ] **What I personally built:** authorship note (see §10)
- [ ] **What I reused:** authorship note (see §10)
- [ ] **What broke / How I debugged it:** in submission body

---

## 1. Locked Decisions

| Area | Decision |
|---|---|
| Spec format | **YAML**, strict typed schema, % positions |
| Render target | **HTML + CSS**, absolute-positioned divs |
| Primary AI | **Claude Opus 4.7** with structured output (JSON Schema) |
| Editor UX | **Split-pane**: YAML (Monaco) left, live preview right |
| Showpiece | **Layout validation + AI auto-repair** (inline pill + YAML diff) |
| Secondary depth | **CLI** wrapping the same compiler |
| Primitives | Text, **Vega-Lite charts**, **KaTeX math**, **Flux images** (Unsplash fallback) |
| Validators | Overflow, collision, contrast (WCAG), chart sanity |
| Repair strategy | Deterministic rules first, LLM critic for hard cases |
| Frontend stack | **Vite + React + TS + Tailwind**, Monaco editor |
| Hosting | **Cloudflare Pages** (editor) + **Workers** (API) + **KV** (decks) |
| Persistence | No auth. Deck ID → KV → `/d/:id` share URL |
| Export | **Present mode** (fullscreen + arrow keys). No PDF/PPTX. |
| Demo arc | "Q3 board update" end-to-end (see §7) |
| Reuse stance | Heavy OSS reuse, own the unique parts (see §10) |
| Scope cut order | Templates first (ship one layout system if late) |

---

## 2. Deck Spec Schema (YAML)

```yaml
# deck.yaml
meta:
  title: Q3 Board Update
  theme: light            # light | dark
  size: { w: 1280, h: 720 }
slides:
  - id: title
    blocks:
      - { type: text, x: 8, y: 35, w: 84, h: 20,
          content: "Q3 Board Update", style: title }
      - { type: text, x: 8, y: 58, w: 84, h: 8,
          content: "Acme Inc. — October 2026", style: subtitle }

  - id: metrics
    blocks:
      - { type: text,  x: 6, y: 6,  w: 88, h: 10, content: "Quarterly Metrics", style: h1 }
      - { type: chart, x: 6, y: 20, w: 56, h: 70,
          spec: { $schema: "https://vega.github.io/schema/vega-lite/v5.json",
                  data: { values: [...] }, mark: bar, encoding: {...} } }
      - { type: text,  x: 66, y: 22, w: 28, h: 60, content: "ARR up 38%..." }

  - id: math
    blocks:
      - { type: math,  x: 10, y: 30, w: 80, h: 30,
          latex: "\\text{LTV} = \\frac{\\text{ARPU}}{\\text{churn}}" }

  - id: image
    blocks:
      - { type: image, x: 0, y: 0, w: 100, h: 100,
          source: { provider: flux, prompt: "minimalist data visualization, dark mode" } }
      # or { provider: unsplash, query: "office team" }
      # or { provider: url, src: "https://..." }
```

**Why %**: validator and renderer agree on a single coordinate system; resolution-independent; trivial to detect overflow (x+w > 100).

**Validation invariants** (cheap, deterministic):
- `0 ≤ x, y` and `x + w ≤ 100` and `y + h ≤ 100`
- Pairwise non-overlap among blocks on the same slide (configurable allow-list for layered design)
- Rendered text height ≤ block height (measured post-mount in a hidden ghost DOM)
- WCAG AA contrast for any text block over a colored/image background
- Chart sanity: encodings present, axis fields exist in `data.values[0]`, units string consistent

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Vite + React)                                  │
│  ┌──────────────┐   ┌───────────────────────────────┐   │
│  │ Monaco YAML  │ ⇄ │  Compiler (TS, isomorphic)    │   │
│  └──────────────┘   │   yaml→AST→React vDOM         │   │
│                     └───────────────────────────────┘   │
│                              ↓                           │
│                     ┌───────────────────┐                │
│                     │  Slide canvas     │                │
│                     │  + Validator      │ ← runs in DOM  │
│                     │  + Repair pills   │                │
│                     └───────────────────┘                │
└──────────────────────────┬──────────────────────────────┘
                           │ fetch
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Cloudflare Worker (Hono)                                │
│   POST /generate   → Claude Opus 4.7 (structured out)    │
│   POST /repair     → Claude Opus 4.7 (constrained patch) │
│   POST /image      → Flux via Replicate (cached in R2)   │
│   GET/PUT /d/:id   → KV (deck spec by share id)          │
└─────────────────────────────────────────────────────────┘

CLI (Node):
  slidelang gen "prompt"       → calls /generate, prints YAML
  slidelang render deck.yaml   → emits standalone deck.html
```

The **compiler is a single TypeScript module**, imported by both the React app and the CLI. This is what makes "deck-as-code" real — and gives the TDD a clean architecture diagram.

---

## 4. AI Generation Pipeline

1. **Plan** — Opus 4.7 receives prompt + JSON Schema for the deck spec, emits outline (slide titles + intents). Streamed to UI as a filmstrip skeleton.
2. **Draft per slide** — parallel calls, one per slide, each constrained by the block JSON Schema. Each draft includes provisional positions.
3. **Compile + validate** — local, in-browser, ~10ms.
4. **Auto-repair pass** — for any flagged issue, send `{slide_spec, issue}` to `/repair` with a small system prompt: "Return only the patched blocks as JSON". Apply diff, re-validate, ≤2 retries.

**Why Opus 4.7**: best reasoning for the planner/critic role. Worker calls cache the system prompt + schema via Anthropic prompt caching, so repeated `/repair` calls are cheap and fast.

---

## 5. Validator + Repair Detail (the showpiece)

**Rule engine** (TypeScript, ~200 LOC):

```ts
type Issue =
  | { kind: 'overflow';  slideId; blockId; measured: number; bound: number }
  | { kind: 'collision'; slideId; aId; bId; overlapPct: number }
  | { kind: 'contrast';  slideId; blockId; ratio: number; required: 4.5 }
  | { kind: 'chart';     slideId; blockId; reason: string };
```

**UI surface**: each issue renders as a red pill anchored to the offending block (`position: absolute` over the slide canvas). Clicking opens a popover with:
- Plain-English description
- A 3-line YAML diff preview (red/green)
- `Repair` button → applies patch + re-validates
- `Dismiss` → keeps the issue but hides the pill

**Why this lands on video**: in the demo I deliberately overflow a bullet list. Red pill appears in <100ms (deterministic check). Click `Repair`. Opus returns `{ font_size: 22, content: "<tightened copy>" }`. Diff applies. Pill clears. Total: ~4 seconds of pure depth-area magic.

---

## 6. 48-Hour Build Plan

### Hour 0–8 — Foundations
- Repo + Vite + React + TS + Tailwind + Cloudflare Pages preview
- Spec schema in `packages/spec/` (Zod for runtime, JSON Schema for AI)
- Compiler: `yaml → typed spec → React components` (text, chart, math, image)
- Static example deck renders. Present mode (fullscreen + ←/→).
- **Checkpoint:** "I can render a YAML deck and present it."

### Hour 8–20 — AI generation
- Cloudflare Worker scaffold (Hono), `ANTHROPIC_API_KEY` secret
- `/generate` endpoint: prompt → outline → per-slide structured drafts (Opus 4.7)
- Hook up to a "Generate" button in the UI; stream slides in as they arrive
- Vega-Lite + KaTeX integration
- Flux via Replicate; R2 cache; Unsplash fallback wired
- **Checkpoint:** "Type a prompt, get a 5-slide deck with all 4 primitives."

### Hour 20–32 — Validation + repair (showpiece)
- DOM-measurement validator (ghost render in offscreen container)
- Rule implementations: overflow, collision, contrast, chart sanity
- Repair pill UI + popover + YAML diff renderer
- `/repair` Worker endpoint with prompt caching
- End-to-end: generate → some issues → click-to-repair → clean
- **Checkpoint:** "The demo arc works locally start to finish."

### Hour 32–40 — Persistence + polish
- Workers KV `PUT/GET /d/:id`, share button, public viewer route
- CLI in `packages/cli/`: `slidelang gen` + `slidelang render`, README
- Empty state, error toasts, loading skeletons
- Cloudflare Pages deploy + custom domain (optional)
- **Checkpoint:** "Reviewer can open the live URL and use it without me."

### Hour 40–48 — Docs + demo
- PRD draft (Markdown → Google Doc)
- TDD draft (Markdown → Google Doc, with architecture diagram)
- Record Loom: 3 min, scripted (see §7)
- Submission email: labeled-line reply
- README cleanup + screenshot
- **Checkpoint:** "Submitted."

**Cut order if behind at hour 30:** templates → chart sanity validator → Flux (fall back to Unsplash) → CLI shrinks to README + one command. **Never cut:** generation, overflow/collision/contrast, repair UX, present mode, demo recording.

---

## 7. Demo Video Script (3 min)

| Time | Beat |
|---|---|
| 0:00 | Title card: "Slidelang — AI Fund Build Challenge" + the wedge in one sentence |
| 0:10 | Live URL on screen. Empty state. Type prompt: *"Q3 board update for a Series A SaaS company. 6 slides. Include ARR chart and LTV formula."* |
| 0:25 | Slides stream in as filmstrip. Cut to YAML on the left — point out it's typed, hand-editable. |
| 0:50 | Show chart slide (real Vega-Lite). Click into the YAML, change a data point — chart updates live. |
| 1:10 | Show math slide. Type `\sigma` into the LaTeX — it renders. |
| 1:25 | **The showpiece.** Click a text block, paste in a too-long paragraph. Red pill appears. Click → diff → Repair → clean. |
| 1:55 | Trigger a collision deliberately. Same loop. |
| 2:10 | Present mode. Tab through 6 slides full-screen. |
| 2:30 | Share URL. Open in a new tab as if a reviewer. Loads instantly. |
| 2:45 | Terminal: `slidelang gen "intro to transformers" > deck.yaml && slidelang render deck.yaml`. Open the HTML. |
| 3:00 | End card: links to PRD, TDD, source. |

---

## 8. PRD Outline (1–2 pages)

1. **Problem.** Prompt-to-slides tools produce brittle, static output. Editing the result feels like fighting the AI. Teams revert to PowerPoint.
2. **Target user.** Operators, founders, and engineering leads writing recurring business or technical decks (board updates, design reviews, postmortems, ADRs-as-deck).
3. **Why deck-as-code.** Typed source → AI and humans edit the same artifact → diffable, reviewable, versionable, programmable.
4. **The trust loop.** Generation is cheap; *trustable* generation is the wedge. The validator + repair loop is what turns AI output from "starting point" into "shippable".
5. **Wedge → platform.** Start with board updates and technical reviews (recurring, structured, high-stakes). Expand to: agent-authored decks, design-system templates, embeddable charts, programmatic decks from data sources.
6. **Non-goals (v0).** Real-time collaboration, PPTX export, branded templates, mobile authoring.
7. **Success metric.** Time-to-shippable-deck. Target: 3 minutes from prompt to share link.

---

## 9. TDD Outline (1–2 pages)

1. **Architecture diagram** (browser ⇄ Worker ⇄ KV/R2 + shared compiler + CLI).
2. **Deck spec schema.** Zod source → JSON Schema for AI structured output → TS types for compiler. One source of truth.
3. **Compiler.** Pure function `(spec) → React tree`. Isomorphic — runs in browser and Node. Renderers per primitive (text, chart via Vega-Lite, math via KaTeX, image with provider abstraction).
4. **AI planning.** Outline-then-draft. Per-slide structured calls in parallel. Prompt caching on the schema + system prompt.
5. **Browser editor state model.** Single source: YAML text → debounced parse → spec → render. Repair patches mutate the YAML AST (preserving comments/order) via `yaml` lib, not the spec object.
6. **Validation + repair pipeline.** Deterministic rules over the live DOM; LLM critic only for content rewrites. Two-retry budget.
7. **Chart / math / image rendering.** Why Vega-Lite (declarative ≈ deck-as-code). Why KaTeX (sync, server-renderable). Image provider abstraction with R2 cache.
8. **Hosted API.** Cloudflare Workers, Hono, KV for share, R2 for image cache. Edge latency targets.
9. **Publishing flow.** `/d/:id` is just KV → static render. No JS needed for viewing.
10. **CLI / agent surface.** Same compiler imported as `@slidelang/compiler`. Plugin hook idea sketched for v0.2.
11. **What I'd do with more time.** Real-time collab via Y.js, theme system, slide-level prompt iteration, agent workflows (`fix slide 3`).

---

## 10. Authorship Note (for the submission)

**What I personally built**
- Spec schema (Zod + JSON Schema codegen)
- Isomorphic compiler (yaml → typed AST → React tree)
- Validator (overflow, collision, contrast, chart sanity) with DOM-measurement pass
- Repair pipeline (deterministic patches + Claude critic) with YAML-AST mutation
- Editor shell (Monaco + live preview + repair pills + diff popover)
- AI planning + per-slide structured generation against Opus 4.7
- Cloudflare Worker (Hono) endpoints + KV share + R2 image cache
- CLI: `slidelang gen` / `slidelang render`
- PRD, TDD, demo video, this repo

**What I reused**
- Vite, React, TypeScript, Tailwind (boilerplate)
- Monaco editor, `yaml` (eemeli), Zod
- Vega-Lite (charts), KaTeX (math)
- Hono on Cloudflare Workers, Cloudflare Pages/KV/R2
- Anthropic TypeScript SDK
- Replicate (Flux), Unsplash API

**What broke / How I debugged it** — filled in at submission time.

---

## 11. Risks + Mitigations

| Risk | Mitigation |
|---|---|
| Image API flaky on demo day | Unsplash fallback wired from day 1; record demo with both paths |
| Opus structured output drifts schema | Zod re-validates server-side; retry with the validation error appended to the prompt |
| DOM measurement races (text not yet laid out) | Two-pass: ghost render first, real render second; `requestAnimationFrame` gate |
| Cloudflare cold start on first reviewer visit | Warm with a cron ping; keep Worker bundle small |
| 48h slips | Cut order in §6; never cut: generation, repair UX, demo recording |
| Reviewer can't access docs | All Google Docs set to anyone-with-link before submitting |

---

## 12. Open Items (to do before kickoff)

- [ ] Reserve `slidelang` domain or stick with `pages.dev` subdomain
- [ ] Confirm Anthropic API key + spending cap
- [ ] Replicate account + spending cap
- [ ] Unsplash dev API key
- [ ] Decide repo name; create GitHub repo public
- [ ] Pre-draft the Q3 demo prompt for predictable output

