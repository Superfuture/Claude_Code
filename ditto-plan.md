# Ditto — Product & Implementation Plan

> **Status:** Pre-build planning doc
> **Owner:** Joey
> **Last updated:** 2026-05-16
> **Working name:** "Ditto" *(placeholder — alternatives below)*

---

## 1. One-liner

A freemium iOS iMessage extension that reads the conversation you're in and gives you three tap-to-insert suggested replies, fast.

## 2. Product summary

Ditto solves a specific everyday problem: **"I read a text, I know I should reply, but I don't have the energy to figure out *what* to say."** It reads the active iMessage conversation, generates three contextually-appropriate replies in a chosen tone, and inserts the chosen one into the draft field so the user can edit and send.

The wedge is the **native iMessage integration** — competitors (Rizz, YourMove, Plug AI) rely on clunky screenshot-and-paste flows. Ditto reads the conversation directly inside the Messages app, so there's no copy-paste, no app switching, no friction.

## 3. Target user (v1)

- iPhone users who reply to a high volume of personal texts
- Pain: reply fatigue, decision paralysis, "left on read" anxiety
- Lives mostly in iMessage (not the primary persona for SMS-to-Android-heavy users — that's v2 with the keyboard)
- Comfortable with consumer AI tools, willing to pay $5/mo for time savings

## 4. v1 scope (lean MVP)

**Ships:**
- iMessage app extension only (no keyboard yet)
- Reads last N messages of active iMessage thread for context
- Generates 3 reply suggestions on open
- Tone preset chips: **Funny · Flirty · Formal · Supportive** (4 presets)
- Tap a suggestion → inserts to iMessage draft field for review/edit
- Regenerate button (unlimited, free for everyone — quality safety net)
- Thumbs up / thumbs down on each suggestion (feedback for prompt iteration)
- Free tier: **5 suggestions/day**
- Pro: **$4.99/mo or $29.99/yr** → unlimited suggestions
- Companion app: minimal — onboarding, settings, paywall, privacy explainer
- Privacy posture: zero-retention API calls, no message storage, explicitly marketed

**Does NOT ship in v1 (parking lot for v2+):**
- Custom keyboard (for SMS / other apps)
- Voice-learning / personalized style mimicry
- Per-contact memory and relationship notes
- Length control slider
- Share Extension fallback
- Account system, cross-device sync
- Android

## 5. Architecture

### 5.1 Surfaces
- **iMessage App Extension** (`MSMessagesAppViewController`) — primary surface, ships in v1
- **Companion iOS app** — onboarding, paywall, settings, About/Privacy
- **App Group** (shared container) — companion app stores entitlement, settings, daily-usage counter; extension reads them

### 5.2 Tech stack
- **Language:** Swift 5.9+
- **UI:** SwiftUI (with UIKit bridging for `MSMessagesAppViewController` host)
- **Min iOS:** 17.0 (covers ~90% of iPhones and unlocks SwiftData)
- **Persistence:** SwiftData (on-device only — no CloudKit, no backend DB)
- **IAP / paywall:** RevenueCat (faster than rolling StoreKit2 directly; handles receipts, trials, analytics)
- **Analytics:** PostHog or Mixpanel (event-based, privacy-respecting config)
- **Crash reporting:** Sentry or Apple-native MetricKit

### 5.3 LLM call path — ⚠️ recommended change from interview
You selected **direct Anthropic API**. Strong recommendation: **don't ship that.** The API key embedded in the binary is extractable, and a single leak = unbounded billing. Two safer options:

**Option A (recommended): thin proxy backend**
- Cloudflare Workers or Vercel Edge Function
- Holds the Anthropic API key as a secret
- Validates app attestation token (DeviceCheck / App Attest) per request
- Enforces server-side daily rate limits per device
- Cost: ~$0–5/mo on free tiers until you scale
- Adds ~50ms latency, well worth it

**Option B: Apple's on-device foundation models for free tier, cloud for Pro**
- Free users get on-device suggestions (no API cost, lower quality)
- Pro users get cloud Claude/GPT
- Naturally aligns cost with revenue

**Decision needed before build starts.** Proceeding doc assumes Option A.

### 5.4 LLM choice
- **Primary:** Claude Sonnet 4.6 — best instruction following, conversational tone quality, supports prompt caching
- **System prompt cached** (90% cost reduction on repeat calls)
- **Output:** structured JSON `{ suggestions: [{ text, tone }, ...] }` for clean parsing
- Fallback: if API fails, surface a friendly error in extension — no offline mode in v1

### 5.5 Data flow per suggestion
1. User opens iMessage thread → taps Ditto icon in iMessage app drawer
2. Extension calls `activeConversation.selectedMessage` and reads recent messages (limited by iMessage API — typically only sent/received via the extension itself; need to validate exact context available)
3. Extension sends `{ recent_messages, user_tone_preset, user_style_profile }` to proxy
4. Proxy → Anthropic API (cached system prompt + few-shot + user payload)
5. Returns 3 suggestions as JSON
6. Extension renders cards; user taps → `activeConversation.insertText(...)`
7. User edits in iMessage's native input → sends

> **⚠️ Critical unknown to validate in week 1 spike:** how much of the conversation history can an iMessage extension actually read? Apple's docs are murky. If the answer is "only messages sent *through* the extension," the whole premise needs rethinking. **This is the single biggest technical risk.** First task: build a throwaway extension that reads the conversation and logs what's available.

## 6. Suggestion quality — the strategy

Quality is your stated top concern, so this gets its own section.

### 6.1 Prompt engineering
- Hand-crafted system prompt with a clear persona: helpful, contextually-aware, never cringe
- 8–12 few-shot examples per tone preset, hand-written by you (mix of real-feeling conversations)
- Negative examples — show what *bad* looks like ("Hey there!" "I hear you!") and instruct against it
- Style invariants: match input length (don't reply with a paragraph to a one-word text), match casing (don't capitalize if they don't), don't use em-dashes, don't start with "I"

### 6.2 Tone variant chips
Below the 3 main suggestions, render quick-action chips: **"Shorter" · "Funnier" · "More chill"** — tap regenerates all 3 in that direction. Cheaper than letting users prompt freely, narrower failure modes.

### 6.3 Feedback loop
- Inline 👍 / 👎 on each suggestion
- 👎 prompts an optional one-tap reason: *generic · wrong tone · too long · weird vibe · would never say this*
- Events streamed to analytics with full prompt context (anonymized)
- Weekly review → update few-shots and system prompt
- Phase 2: use thumbs-up examples as personalized few-shot for that user

### 6.4 Regeneration
- "More options" button → 3 fresh suggestions
- Free for everyone (doesn't count toward 5/day limit; only initial generation counts)
- Why: removes the "I wasted my daily quota on bad replies" anxiety

## 7. Privacy

The keyboard/extension-reads-your-texts angle is press-sensitive. Lean into privacy as a marketing wedge:

- **Zero-retention** at the LLM layer: Anthropic API called with `metadata.user_id` omitted and zero-retention enabled where available
- **No message storage** server-side: proxy doesn't log message contents, only counters
- **No account required** in v1: device-level entitlement via RevenueCat anonymous ID
- **On-device persistence only**: tone preferences, feedback events buffered locally
- **Public privacy page** with plain-language explainer (linked in App Store description and onboarding)
- **Cap retention claims to what you can actually enforce.** Don't promise "no third party ever sees a word" — Anthropic processes the text. Be honest: "We don't store your messages. The AI model processes them in-memory and forgets immediately. We never sell, share, or train on your data."

## 8. UX flows

### 8.1 First-run onboarding (companion app)
1. **Welcome screen** — one sentence: "Three perfect replies, right in iMessage."
2. **How it works** — 3-card carousel showing the extension UI in iMessage
3. **Privacy explainer** — what gets sent, what doesn't, what we don't store
4. **Enable in iMessage** — annotated screenshots: tap App Store icon → drawer → Ditto. Test button at bottom: "Open Messages to try it"
5. **Soft paywall** — "Start free with 5/day · Unlock unlimited for $4.99/mo · 7-day trial"

### 8.2 In-iMessage extension UI
```
┌─────────────────────────────┐
│ Ditto                  ⚙️    │ ← top bar: settings shortcut
├─────────────────────────────┤
│ [Funny][Flirty][Formal][💝] │ ← tone chips
├─────────────────────────────┤
│ 1. suggestion text here  👍👎│ ← tap to insert
│ 2. suggestion text here  👍👎│
│ 3. suggestion text here  👍👎│
├─────────────────────────────┤
│  Shorter · Funnier · Chill  │ ← variant chips
│         ↻ More options       │ ← regenerate
└─────────────────────────────┘
```

- Compact mode (default iMessage drawer size): tone chips + 3 suggestions stacked, scroll to reveal variants
- Expanded mode (user pulls up): full UI w/ settings access
- Loading state: shimmer placeholders on the 3 cards (no spinner)
- Empty state (no recent context): "Open Ditto inside a conversation to get suggestions"

### 8.3 Paywall
- Triggered when free user hits daily limit
- Shown on day 1 after 3rd use as a soft prompt
- Annual plan featured by default with "Save 50%" badge
- 7-day free trial on monthly
- One-tap "Restore Purchases" prominent (Apple requires)

## 9. Brand — playful & expressive

### 9.1 Name options
You said "Ditto" is a placeholder. Three directions to consider:

| Name | Vibe | Pros | Cons |
|---|---|---|---|
| **Ditto** | "Same / echo / agreed" | Friendly, simple, memorable, doubles as an interjection | Pokémon association; "ditto" the word feels passive |
| **Echo** | Reflective, smart | Cleaner sound, premium feel | Amazon Echo conflict, App Store search noise |
| **Volley** | Tennis-rally, back-and-forth | Active, ownable, dynamic | Niche reference, less obvious |
| **Quip** | Wit, brevity | Punchy, on-brand for playful tone | Sounds like a writing tool |
| **Riff** | Improv, musical | Cool, creative | Genre-bound (music/comedy) |

Recommendation: **Ditto or Volley.** Ditto is warmer and more accessible. Volley has more brand-build potential. Worth checking trademark + App Store search density before locking.

### 9.2 Visual direction
"Playful & expressive" means we avoid:
- Generic AI gradients (purple-blue, sparkles ✨ icon)
- Sterile minimal Apple-clone aesthetic
- Dating-bro / "rizz" coded visuals (won't appeal to all-purpose users)

Direction:
- **Type:** Bold sans display face (think Founders Grotesk, Söhne Breit, or a custom geometric) paired with system body
- **Color:** One signature color + deep neutral. Avoid the AI-gradient cliché. Consider: rich coral, electric ochre, deep teal, or off-black + cream
- **Icon concept:** Two speech bubbles overlapping/echoing — readable at app-icon scale. Avoid sparkles/magic-wand iconography.
- **Motion:** Subtle bounce on suggestion appearance, springy chip selection, no chrome shimmer for shimmer's sake
- **Voice:** Casual, smart, warm. Never "Hey there! ✨"

## 10. Pricing & monetization

- **Free:** 5 suggestions/day (resets at local midnight). Regenerations free. All tones available.
- **Pro Monthly:** $4.99 with 7-day free trial
- **Pro Annual:** $29.99 (~50% off vs monthly) — featured plan
- **Family Sharing:** enabled (Apple-native, easy win, helps conversion)
- **No ads** ever. (Keyboard/extension space is sacred — ads here are user-hostile.)

Expected unit economics (rough):
- Claude Sonnet 4.6 call (cached system prompt + few-shot + ~500 token context, ~150 token output) ≈ $0.003 per generation
- Free user max cost: 5 × $0.003 × 30 = **$0.45/mo**
- Pro user (assume 30/day avg) cost: 30 × $0.003 × 30 = **$2.70/mo** vs $4.99 revenue → ~46% gross margin
- Heavy Pro user (100/day) cost: **$9/mo** → unprofitable. Need a soft cap at e.g. 200/day "fair use" with a polite slowdown.

## 11. Top risks & mitigations

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| iMessage extension can't read enough conversation context | Medium | **Critical** | **Week 1 throwaway spike to validate.** If broken, pivot to keyboard-first plan immediately. |
| App Store rejection (extension reading messages + AI) | Medium | High | Frame as "user-initiated suggestion tool"; ensure no background processing; submit early TestFlight to surface issues |
| Suggestion quality feels generic | Medium | High | Quality strategy in §6; weekly prompt iteration; large hand-curated few-shot set |
| API key abuse / unbounded billing | High (with direct API) | **Critical** | **Switch to proxy backend with App Attest** (see §5.3) |
| Privacy backlash / negative press | Low–Medium | High | Strong privacy posture, public-facing explainer, conservative claims, no message storage |
| Heavy users blow up unit economics | Medium | Medium | Fair-use soft cap at 200/day with friendly throttle |
| User declines extension permissions / never enables Ditto | High | High | Tight onboarding with screenshots; "open Messages now" CTA mid-onboarding |
| Competitor with bigger budget replicates | Medium | Medium | Move fast on voice-learning + per-contact memory (the moat) — but only after MVP validates |

## 12. Build phases

### Phase 0 — Validation spike (1 week)
- Bare-bones iMessage extension that logs what conversation context is accessible
- Confirm the core thesis works
- **Go/no-go gate** for full build

### Phase 1 — MVP build (4–6 weeks)
- Companion app shell + onboarding + paywall
- iMessage extension UI (3 suggestions + tone chips + variants)
- Proxy backend (Cloudflare Workers + App Attest)
- Anthropic integration with cached system prompt
- RevenueCat IAP, daily usage counter via App Group
- Feedback events plumbing
- TestFlight build

### Phase 2 — Closed beta (2 weeks)
- 50–100 testers, daily prompt iteration
- Quality bar: ≥70% thumbs-up rate before public launch
- Stress test paywall conversion

### Phase 3 — Public launch
- App Store submission (allow 1–2 weeks for review + likely rejections)
- ProductHunt + indie iOS Twitter / Bluesky launch
- 3–5 demo videos showing real iMessage flows

### Phase 4 — Post-launch (v1.1 → v2)
- Voice-learning (reads user's recent sent messages to derive style)
- Per-contact memory (SwiftData model: relationship, tone history, do/don't list)
- Custom keyboard for SMS / non-iMessage apps
- Share Extension fallback for WhatsApp/Slack screenshots
- Length control
- Multilingual support

## 13. Open decisions (need answers before build)

1. **Proxy backend vs direct API** — strong rec: proxy. (§5.3)
2. **Final name** — Ditto vs Volley vs other?
3. **Tone preset names** — confirm "Funny / Flirty / Formal / Supportive" or swap (e.g. drop Flirty for non-dating-app vibe; replace with "Casual" or "Caring")
4. **Daily limit reset** — local midnight or rolling 24h from first use?
5. **Trial length** — 7-day free trial is standard; consider 3-day for higher signup → trial-to-paid conversion
6. **Brand color** — pick one signature hue before icon/screenshot work
7. **Designer/dev**: solo build or collaborator? Affects timeline

## 14. Success metrics for v1

- **Activation:** % of installs that enable extension and use it ≥3 times within 7 days → target 35%
- **Quality:** thumbs-up rate on suggestions → target 70%
- **Engagement:** Day-7 retention of activated users → target 40%
- **Monetization:** trial-to-paid conversion → target 25%; free-to-Pro conversion at 30 days → target 5%
- **Unit econ:** Pro user gross margin → target 60%+ after fair-use cap

---

*This plan reflects decisions made in interview on 2026-05-16. Anything not explicitly decided is flagged in §13.*
