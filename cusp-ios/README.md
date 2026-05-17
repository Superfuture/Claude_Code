# Cusp — AI Manifestation Rituals

A daily, personalized ritual app. User enters their birth data and an intention; Cusp generates a 3-step ritual (affirmation, visualization, action) tuned to their astrological signature and today's transits.

Same Apple Developer account, same Cloudflare account, same Anthropic key as Ditto. Mostly reused infrastructure — different prompt, different brand, different aesthetic.

## Structure

```
cusp-ios/
├── Cusp/                  iOS app (SwiftUI)
│   ├── CuspApp.swift      @main entry
│   ├── ContentView.swift  Home screen (today's ritual)
│   ├── Views/             OnboardingView, RitualView, PaywallView, …
│   ├── Models/            BirthData, Ritual, Intention
│   ├── Services/          APIClient, SubscriptionManager
│   ├── Brand/             BrandColor, BrandFont, CuspLogo
│   └── Info.plist
├── Backend/               Cloudflare Worker proxy
│   ├── worker.js          POST /v1/ritual — calculates astrology + calls Anthropic
│   ├── prompts.js         System prompt + few-shots
│   ├── astrology.js       Sun sign, moon phase, transits
│   ├── wrangler.toml
│   └── package.json
├── assets/                Brand mark + app icon
├── scripts/               Build / install helpers
└── docs/                  Walkthrough + listing copy
```

## Aesthetic direction

- **Palette**: Deep midnight (`#1A1B3A`), warm cream (`#F5EDDC`), lavender (`#B8A4D4`), soft gold (`#D4B26F`)
- **Typography**: Editorial serif italic (system New York) for display, refined sans for UI
- **Background**: Layered radial gradients evoking dusk → night sky; slow celestial drift on the home screen
- **Voice**: Specific, ritualistic, action-oriented. Never vague. Never woo-woo. Think Co-Star's tone but for action, not prediction.

## Product positioning

- **Co-Star, The Pattern, Chani**: predictive — *here's what's coming*
- **Cusp**: prescriptive — *here's what to do today to bring it about*

This is the wedge. Manifestation framing + AI personalization + daily ritual = sticky daily-use product in a $2B+ niche.

## Weekend MVP scope

- [x] Project scaffold
- [ ] Onboarding (birth date, time, location)
- [ ] Intention input
- [ ] Daily ritual generation (Anthropic via backend)
- [ ] Ritual completion + streak tracking
- [ ] Premium paywall (StoreKit2)
- [ ] App icon + brand
- [ ] Push notification for daily ritual reminder

## Tech reuse from Ditto

- Cloudflare Worker proxy pattern
- Anthropic API client with prompt caching
- StoreKit2 SubscriptionManager
- BrandColor / BrandFont system (palette swapped)
- pbxproj-based install scripts
- App icon SVG → PNG generation pipeline

## Realistic revenue expectations

- Niche size: ~$2.3B globally (astrology / spiritual apps)
- Top quartile new entrant: $5k–50k/mo MRR
- Cold launch, no audience: $0–$200/mo until viral or organic discovery
- Best growth lever: TikTok / Instagram (this audience lives there)
