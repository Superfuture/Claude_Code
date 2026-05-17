# Ditto — iOS iMessage Extension

Source code for the Ditto app. This directory contains everything needed to build, test, and submit the app to the App Store. **The submission itself requires manual steps Apple controls (enrollment, signing, App Store Connect, binary upload, review).** Those are listed at the bottom.

---

## What's here

```
ditto-ios/
├── Ditto/                  Main iOS app (companion: onboarding, paywall, settings)
├── DittoMessages/          iMessage extension (the actual product surface)
├── Shared/                 Code shared between both targets (App Group)
├── Backend/                Cloudflare Worker proxy for the Anthropic API
└── docs/                   App Store submission checklist
```

---

## Prerequisites (one-time, manual)

1. **Apple Developer Program** membership — $99/yr. Sign up at developer.apple.com.
2. **Xcode 15+** installed on this Mac. From the App Store.
3. **Anthropic API key** — get one at console.anthropic.com. Add credits ($10+ minimum to start).
4. **Cloudflare account** (free tier is fine) — for the backend proxy that hides your API key from the app binary.
5. **RevenueCat account** (free up to $2.5k/mo revenue) — for IAP / subscriptions. Roll your own StoreKit2 if you want to avoid this.

---

## Local setup

### 1. Create the Xcode project

In Xcode: **File → New → Project → iOS → App**
- Product name: `Ditto`
- Bundle identifier: `com.yourdomain.ditto` (use one you own)
- Language: Swift, Interface: SwiftUI, Storage: SwiftData
- Save it somewhere outside this repo (e.g. `~/Code/Ditto.xcodeproj`)

Then **File → New → Target → iOS → iMessage Extension**
- Name: `DittoMessages`
- Embed in: Ditto

### 2. Add an App Group

In project settings → Signing & Capabilities → +Capability → App Groups, for **both** targets:
- Group ID: `group.com.yourdomain.ditto`

Update `Shared/AppGroupStore.swift` if you change the group ID.

### 3. Drop in the source files

Copy these directories into your Xcode project, adding each to the correct target:

- `Ditto/*` → Ditto target
- `DittoMessages/*` → DittoMessages target
- `Shared/*` → **both** targets (check both boxes in the file inspector)

### 4. Configure the backend URL

Edit `Shared/APIClient.swift`:
```swift
static let baseURL = URL(string: "https://your-worker.your-subdomain.workers.dev")!
```

### 5. Deploy the backend

```bash
cd Backend
npm install
npx wrangler login
# Set your Anthropic API key as a secret
npx wrangler secret put ANTHROPIC_API_KEY
# Deploy
npx wrangler deploy
```

The deploy command prints your Worker URL. Paste it into `Shared/APIClient.swift`.

### 6. Run on simulator / device

Select the `Ditto` scheme → Cmd+R. The companion app launches.

To test the iMessage extension:
- Select the `DittoMessages` scheme → Cmd+R
- Pick **Messages** as the host app when prompted
- The simulator's Messages app opens with Ditto in the app drawer
- Real device testing requires the developer account + provisioning

---

## What still needs human work before App Store submission

See `docs/app-store-checklist.md` for the full punch list. The high points:

- **Privacy policy** must be hosted at a public URL (required by Apple for any app that sends user content to a server)
- **App icon** in all required sizes (1024×1024, plus all the smaller variants — Xcode's asset catalog will generate from a single 1024×1024 source if you provide one)
- **Screenshots** for at least one iPhone size class (Apple requires 6.7" and/or 6.5" displays for iMessage apps)
- **App Store Connect listing** — name, description, keywords, support URL, marketing URL
- **In-App Purchase products** configured in App Store Connect (monthly + annual subscriptions)
- **App Review Information** — demo account if needed, notes for reviewers
- **Binary upload** via Xcode (Product → Archive → Distribute App → App Store Connect)
- **Submit for review** — typically 24–72hr turnaround

---

## Architecture decisions baked in

These match `ditto-plan.md` at the project root:

- iMessage extension is the v1 surface (no keyboard)
- Cloud LLM via Anthropic Claude Sonnet 4.6 with prompt caching
- Proxy backend (Cloudflare Worker) — API key never ships in the app binary
- Zero-retention privacy posture (no message storage server-side)
- 5 suggestions/day free, $4.99/mo or $29.99/yr Pro
- Tone presets: Funny, Flirty, Formal, Supportive
- On-device persistence (SwiftData) for tone preference and daily usage counter

---

## Realistic timeline from "code copied into Xcode" to "live in App Store"

| Step | Time |
|---|---|
| Xcode project setup + first build green | 1–2 hours |
| Backend deployed, end-to-end test passes | 1–2 hours |
| App icon, screenshots, listing copy | 4–8 hours |
| Privacy policy written + hosted | 1–2 hours |
| TestFlight build, internal testing | 1 day |
| Submit for review | 5 min |
| Apple review | 1–3 days (sometimes longer for AI/keyboard/extension apps) |

Plan for ~1 week realistically.
