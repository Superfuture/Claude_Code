# Cusp — App Store Listing Copy

Paste these into App Store Connect once your Developer Program is approved.

The framing is deliberately tuned to pass Apple guideline **5.2.5** (fortune-telling apps) — Cusp is described as **reflection rituals tuned to astrology**, never as outcome-producing manifestation magic. This matters; AI + astrology gets extra reviewer scrutiny.

---

## App Name (30 chars)
```
Cusp — Daily Astrology Rituals
```
*(30 chars)* — primary positioning, includes the "astrology" keyword for search.

Alternate if rejected:
```
Cusp · Astrology + Rituals
```

## Subtitle (30 chars)
```
Three steps a day, by the sky
```

## Promotional Text (170 chars — can be updated without resubmission)
```
A new ritual every day, tuned to your sun sign, the moon phase, and the planet of the day. Three steps — affirmation, visualization, one small action.
```

## Keywords (100 chars total, comma separated)
```
astrology,moon,horoscope,ritual,journal,affirmation,daily,intention,reflection,birth chart,mindful
```
*(98 chars — leaves a buffer for keyword swaps)*

## Description (4000 char max)
```
Cusp is a daily ritual app that turns your astrology into something you can do.

Every morning, Cusp reads your sun sign, today's moon phase, and the planet of the day, then writes one small three-step ritual designed around your intention. An affirmation. A visualization. One concrete action you can take today.

Not a horoscope. Not a fortune teller. A practice.

— THREE STEPS A DAY, TUNED TO THE SKY —

Each ritual is generated for the specific intersection of:
• Your sun sign
• Today's moon phase (New, Waxing, Full, Waning)
• The planet ruling today (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
• Whether Mercury is currently in retrograde
• The exact intention you set

The result is three lines of specific, sayable, doable copy. Not "manifest abundance." Something like: "Open the bank app. Look at the actual number. Write it down on a piece of paper. That's it."

— BUILT FOR THE FULL MOON CROWD —

On New Moon and Full Moon days, the ritual takes a different tone. New moons are seeding; full moons are completion and release. The app marks these visually so you know when to pay closer attention.

— PRIVATE, AD-FREE, NO ACCOUNT —

Cusp doesn't ask for your email or phone number. Your birth date and intentions stay on your device. The AI processes each request in-memory and forgets it. Nothing about you is stored on our servers beyond a daily rate-limit counter.

— FREE TIER —

Three rituals a day, free, every day. Mark steps complete to build your streak. Save any ritual as an image to share or keep.

— CUSP PRO —

For $7.99/month or $49.99/year (save 48%):
• Unlimited rituals
• Tarot draws with personalized interpretation
• Weekly transit forecasts
• Pattern insights across your ritual history
• 7-day free trial

— A NOTE ON THE PROMISES —

Cusp doesn't claim to change your life. It's a thoughtful prompt to take small action on the things you say you want. The action is yours. We just write the next line.

Astrology in this app is used as a reflective lens — a way to frame the day with a different vocabulary than the calendar gives you. It's for inspiration and journaling. Not predictions, not promises.

Made independently. No venture capital. No advertising. The next ritual is always free.
```

## What's New (for v1.0)
```
First light. Three steps a day, tuned to the sky.
```

## Support URL
Set up a single-page support site before submission. Easiest path: drop a Markdown page into the existing GitHub Pages site.
```
https://superfuture.github.io/Claude_Code/cusp-support.html
```
*(I haven't created this page yet — ask me when you're ready and I'll generate one matching the privacy policy style.)*

## Marketing URL
```
https://superfuture.github.io/Claude_Code/cusp.html
```
*(Same — placeholder until you have a real landing page.)*

## Privacy Policy URL
Must be hosted and reachable. Use same template as ditto-privacy.html:
```
https://superfuture.github.io/Claude_Code/cusp-privacy.html
```

## Copyright
```
© 2026 Joey Primiani
```

## Primary Category
**Lifestyle**

(Not "Health & Fitness" — Cusp isn't health. Not "Reference" — it's not informational. **Lifestyle** is where Co-Star, The Pattern, Sanctuary, Chani all live. That's the right shelf.)

## Secondary Category
**Productivity** — for the journaling / intention-setting angle.

## Age Rating
**12+**

Trigger questions to answer honestly:
- Frequent/Intense Mature/Suggestive Themes: **None** (Cusp is not flirty/dating)
- Realistic Violence: **None**
- Frequent/Intense Profanity: **None**
- Horror/Fear Themes: **None**

You may need to disclose "Unrestricted Web Access: No" (we never link out except to Apple subscription management).

## Content Rights
Cusp displays AI-generated content. Disclose this honestly in App Store Connect's content rights questionnaire. Don't claim third-party rights you don't own.

---

## Reviewer Notes (App Review Information field)

```
Cusp is a daily reflection app inspired by astrology. To test:

1. Launch the app
2. Onboarding asks for birth date (used to derive sun sign)
3. Onboarding asks for an intention — e.g., "I want to call my mom this week"
4. Home screen shows "Today is unwritten" — tap "Cast Today's Ritual"
5. Cusp's backend computes today's astrological context (sun sign, moon phase, planet of day, mercury retrograde status) and generates a personalized three-step ritual via a private Anthropic API call

The app does not predict outcomes, claim supernatural results, or function as a fortune teller. The astrology is used as a reflective lens for daily journaling and intention-setting — same category as Co-Star, The Pattern, and Chani.

AI disclosure: rituals are generated by an LLM (Anthropic Claude). The app is upfront about this in the description.

In-App Purchase: Cusp Pro subscription with 7-day free trial. Cancel anytime via Settings → Apple ID → Subscriptions.

No account, no login, no advertising, no analytics SDK. The only data sent to our server is the user's stated intention, sun sign, and an anonymous device ID for rate limiting. Server retains nothing.

Contact: hello@cusp.app
```

---

## In-App Purchase setup (mirror in App Store Connect)

| Product ID | Reference Name | Price | Period | Intro |
|---|---|---|---|---|
| `cusp.pro.monthly` | Cusp Pro Monthly | $7.99 | 1 month | 7-day free trial |
| `cusp.pro.annual` | Cusp Pro Annual | $49.99 | 1 year | — |

Subscription Group: **Cusp Pro**

Display Names + Descriptions for each:
- Cusp Pro Monthly: "Unlimited rituals, billed monthly"
- Cusp Pro Annual: "Unlimited rituals, billed annually (save ~48%)"

---

## Screenshots checklist

Required: **6.7" iPhone (iPhone 15/16/17 Pro Max)** — 1290×2796 px

Suggested 5-screen flow:
1. **Onboarding welcome** — sacred geometry + Monas mark + Cusp wordmark
2. **Birth date wheel** — dark date picker on cosmic ground
3. **Intention input** — paste field with serif italic placeholder
4. **Home with today's ritual** — full ritual card, zodiac glyph visible, gold accents
5. **Paywall** — "Cusp Pro" + Monthly/Annual plans

For each screenshot, consider overlaying a one-line caption at the bottom:
1. "Three steps a day, tuned to the sky."
2. "Your sun sign, every day, on autopilot."
3. "One intention. One ritual. One small step."
4. "Affirmation. Visualization. Action."
5. "Pro: unlimited rituals + tarot."

Use Figma or any screenshot frame tool to generate these. The brand colors are: midnight navy `#0A0E22`, parchment `#EDDFC4`, brass gold `#C9A85B`.

---

## Privacy nutrition label answers

Data Type Collected: **Other User Content** (the intention text)
- Linked to user: **No**
- Used to track user: **No**
- Purpose: **App Functionality**

Other data types: **None**

This is permissive — Cusp genuinely collects almost nothing.
