# Cusp — Walkthrough

Mirrors Ditto's setup since you've done this once. The pieces gated by Apple authentication are the same; the code pieces are all done.

## What's done

- ✅ iOS app scaffold (SwiftUI, dark cosmic palette, full onboarding/ritual/paywall flows)
- ✅ Cloudflare Worker backend with lightweight astrology + Anthropic prompt
- ✅ App icon (moon + stars)
- ✅ Brand system (BrandColor, BrandFont, CuspMark)
- ✅ Reused: SubscriptionManager pattern, install scripts, prompt-caching backend pattern

## What you do — in order

### 1. Create Xcode project (5 min)
- File → New → Project → iOS → App
- Product Name: **Cusp**
- Bundle ID: **com.yourdomain.Cusp** (reuse same domain as Ditto)
- Interface: SwiftUI, Storage: None
- Save to: `cusp-ios/Cusp/` (so the .xcodeproj lives at `cusp-ios/Cusp/Cusp.xcodeproj`)
- Delete Xcode's auto-generated `CuspApp.swift` and `ContentView.swift`

### 2. Install source files (1 min)
```bash
cd /Users/jp/Documents/Claude
python3 cusp-ios/scripts/install_into_project.py
```

### 3. Deploy backend (10 min)
```bash
cd cusp-ios/Backend
npm install
npx wrangler kv namespace create RATELIMIT
# Copy the printed id into wrangler.toml under [[kv_namespaces]]
echo "YOUR_ANTHROPIC_KEY" | npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```
Wrangler prints something like `https://cusp-api.jprimiani.workers.dev`. Paste it into `Cusp/Services/APIClient.swift` → `baseURL`.

### 4. Install app icon
- In Xcode, open `Assets.xcassets` → `AppIcon`
- Drag `cusp-ios/assets/AppIcon-1024.png` into the 1024 slot

### 5. Build (Cmd+R)
- Onboarding → date picker → intention → home screen
- Tap "Cast today's ritual" → backend generates + returns ritual
- Tap each step's circle to mark complete → streak increments

### 6. (Optional) Push notifications
- Add Push Notifications capability in Signing & Capabilities
- Request authorization in `CuspApp.swift` on first launch
- Schedule daily local notification at e.g. 8am: "Today's ritual is waiting"
- Defer until after first ship

### 7. App Store assets
- Same path as Ditto: docs/app-store-checklist.md (copy from `ditto-ios/`)
- Listing: lean into the niche language ("daily ritual," "manifestation," "moon phases")
- Screenshots: home screen with ritual, paywall, onboarding

## IAP products for App Store Connect

- `cusp.pro.monthly` — $7.99/mo, 7-day free trial
- `cusp.pro.annual` — $49.99/yr (~48% savings)

## Recommended marketing first 30 days

- TikTok: morning ritual reveals from your own account ("today's cusp ritual: …")
- IG Reels: birth chart + ritual visualizations
- Pinterest: aesthetic ritual cards (high-LTV female demographic lives here)
- Spiritual subreddits (r/Astrology, r/Witch): organic posts, no spam
- Don't pay for FB/IG ads — niche is allergic to brands, audience comes from creator content

## Prompt iteration

The single highest-leverage thing in this entire app is `Backend/prompts.js`. Reading the rituals you get back and adjusting:

- `SYSTEM_PROMPT` rules (the negative word list, the moon-phase mapping, the planet-of-day actions)
- `FEW_SHOT_EXAMPLE` quality bar

You'll know it's working when you'd actually do the suggested action. If a ritual feels generic, the prompt isn't tight enough. Iterate.
