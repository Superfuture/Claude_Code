# Ditto — Submission Walkthrough

Everything you need to do, in order. Estimated time end-to-end: **6–10 hours of your time + ~2 days for Apple's review.**

I've done what I can:
- ✅ Full codebase (Swift app + iMessage extension)
- ✅ Cloudflare Worker backend
- ✅ App icon at 1024×1024 (`ditto-ios/assets/AppIcon-1024.png`)
- ✅ Privacy policy hosted at `https://superfuture.github.io/Claude_Code/ditto-privacy.html`
- ✅ App Store Connect checklist (`docs/app-store-checklist.md`)

What follows is what only you can do. Items marked **🔒 you must** require your Apple ID, payment method, or 2FA — there is no automation path.

---

## Step 1 — Apple Developer Program 🔒 you must (30 min, then 24–48hr wait)

1. Go to <https://developer.apple.com/programs/enroll/>
2. Sign in with your Apple ID (the one you'll use for the developer account — pick carefully, this becomes your developer identity)
3. Enroll as an **Individual** (simplest) or **Organization** (if you want a company name on the listing — requires a DUNS number, takes 1–2 weeks longer)
4. Pay **$99 USD**
5. Wait for Apple to approve (usually <48hr for individuals)

You **cannot proceed past this step** without enrollment. Everything downstream is gated by it.

---

## Step 2 — Install Xcode (30 min)

Install **Xcode 15+** from the Mac App Store. ~10GB download. After install, run it once to accept the license and let it install command-line tools.

```bash
sudo xcode-select --install
```

---

## Step 3 — Create the Xcode project (15 min)

1. Open Xcode → **File → New → Project → iOS → App**
2. Settings:
   - **Product Name:** `Ditto`
   - **Team:** your developer team (now visible after Step 1)
   - **Organization Identifier:** `com.yourdomain` (use a real domain you own)
   - **Bundle Identifier:** auto-fills as `com.yourdomain.Ditto`
   - **Interface:** SwiftUI
   - **Language:** Swift
   - **Storage:** None (we use App Group UserDefaults)
   - **Include Tests:** unchecked for now
3. Save somewhere outside this repo (e.g. `~/Code/Ditto.xcodeproj`)

Then add the iMessage extension target:

4. **File → New → Target → iOS → iMessage Extension**
5. Name: `DittoMessages`, Language: Swift
6. Make sure "Embed in: Ditto" is selected

---

## Step 4 — Drop in source files (10 min)

In Finder:
- Copy `ditto-ios/Ditto/*` (all .swift + Info.plist) into your Xcode project's `Ditto/` folder
- Copy `ditto-ios/DittoMessages/*` into the `DittoMessages/` folder
- Copy `ditto-ios/Shared/*` into a new `Shared/` folder

In Xcode:
- Right-click project navigator → **Add Files to "Ditto"**
- Select all the files you just copied
- **Critical:** for files in `Shared/`, check **both** the `Ditto` AND `DittoMessages` target boxes in the inspector
- For files in `Ditto/`, only check `Ditto`. For `DittoMessages/`, only check that target.

Replace Xcode's default `ContentView.swift` and `DittoApp.swift` with the ones from the scaffold.

---

## Step 5 — Configure App Group capability (5 min)

In Xcode project settings, for **both** targets (Ditto and DittoMessages):

1. Click target → **Signing & Capabilities** tab
2. **+ Capability** → **App Groups**
3. Click **+** under App Groups → enter `group.com.yourdomain.ditto` (replace with your domain)
4. Both targets must have the exact same group ID

Then update `Shared/AppGroupStore.swift`:
```swift
private let groupID = "group.com.yourdomain.ditto"  // ← match what you entered above
```

---

## Step 6 — Deploy the backend 🔒 you must (15 min)

You need:
- An **Anthropic API key** from <https://console.anthropic.com> (add ~$10 of credits)
- A **Cloudflare account** at <https://cloudflare.com> (free)

Then:
```bash
cd ditto-ios/Backend
npm install
npx wrangler login              # opens browser to auth with Cloudflare
npx wrangler kv:namespace create RATELIMIT   # creates KV store, prints an ID
# paste the printed ID into wrangler.toml under [[kv_namespaces]] (uncomment the block)
npx wrangler secret put ANTHROPIC_API_KEY    # paste your key when prompted
npx wrangler deploy             # prints your Worker URL
```

Copy the Worker URL (e.g. `https://ditto-api.you.workers.dev`) into `Shared/APIClient.swift`:
```swift
static let baseURL = URL(string: "https://ditto-api.you.workers.dev")!
```

---

## Step 7 — Add the app icon (10 min)

1. In Xcode, open the `Assets.xcassets` catalog inside the `Ditto` target
2. Click `AppIcon`
3. Drag `ditto-ios/assets/AppIcon-1024.png` into the **1024×1024** slot
4. Xcode auto-generates all the smaller sizes

For the iMessage extension icon (separate slot):
1. In `DittoMessages/Assets.xcassets` → `iMessage App Icon`
2. Apple requires multiple sizes here. Either drag the same 1024×1024 (Xcode generates) OR create per-size variants.

---

## Step 8 — First build (5 min)

1. Top of Xcode, pick a simulator (e.g. **iPhone 15 Pro**)
2. Select the **Ditto** scheme → **Cmd+R**
3. The app should launch and show the onboarding screen
4. To test the extension: stop, change scheme to **DittoMessages** → **Cmd+R** → pick **Messages** as the host
5. In the simulator's Messages app, open any conversation, tap the iMessage Apps icon next to the input, find **Ditto**, tap to open

End-to-end test: tap a tone chip → should call your Worker → return 3 suggestions → tap one → inserts into the iMessage draft.

If anything errors here, fix it before going further. Most likely culprits:
- Backend URL wrong in `APIClient.swift`
- App Group ID mismatch between targets
- Anthropic API credits exhausted

---

## Step 9 — Configure App Store Connect 🔒 you must (45 min)

Go to <https://appstoreconnect.apple.com>:

### Create the app listing
1. **My Apps → + → New App**
2. **Platform:** iOS, **Name:** `Ditto - Smart Reply Suggestions`, **Primary Language:** English (U.S.)
3. **Bundle ID:** select `com.yourdomain.Ditto` (must match what you used in Xcode)
4. **SKU:** anything unique, e.g. `ditto-001`

### Set up subscriptions
1. **In-App Purchases → + → Auto-Renewable Subscription**
2. Create a **Subscription Group** called `Ditto Pro`
3. Add product: **Reference Name** `Ditto Pro Monthly`, **Product ID** `ditto.pro.monthly`, **Duration** 1 month, **Price** $4.99
4. Configure **Introductory Offer** → Free Trial → 7 days
5. Repeat: `ditto.pro.annual`, 1 year, $29.99

### App information
- **Category:** Social Networking
- **Content Rights:** check "No"
- **Age Rating:** answer the questionnaire (likely 12+ because of Flirty tone)

### Privacy
- **Privacy Policy URL:** `https://superfuture.github.io/Claude_Code/ditto-privacy.html` (already hosted)
- **App Privacy Details:**
  - Data Type Collected: User Content → Messages
  - Linked to user: **No**
  - Used for tracking: **No**
  - Purpose: App Functionality

### Listing copy
Copy from `docs/app-store-listing.md` (next file I'll create for you) into the description, keywords, etc. fields.

---

## Step 10 — Take screenshots 🔒 you must (1–2 hours)

App Store requires at least one screenshot at 6.7" (1290×2796).

1. Run the app on **iPhone 15 Pro Max** simulator
2. Open the iMessage extension (Messages → app drawer → Ditto)
3. **Cmd+S** in the simulator captures the screen at native resolution
4. Capture 3–5 screens showing:
   - Hero (extension open with suggestions visible)
   - Tone variation (different preset, different replies)
   - Onboarding (the welcome page)
   - Paywall

You can optionally use a tool like **Screenshot Builder** or build marketing screenshots with text overlays in Figma — but bare device screenshots are sufficient for v1.

Upload via App Store Connect → your app's iOS version → Screenshots.

---

## Step 11 — TestFlight (30 min + ~24h wait)

1. In Xcode: **Product → Archive** (takes a few minutes)
2. In Organizer (auto-opens) → **Distribute App → App Store Connect → Upload**
3. Xcode signs and uploads. Watch for errors — first archive often surfaces signing issues.
4. In App Store Connect → TestFlight → wait for "Ready to Submit" (Apple does a quick technical check, ~10 min to a few hours)
5. Add yourself to the **Internal Testers** group
6. Install TestFlight on your phone, accept the invite, install Ditto, test on a real device
7. **Critical real-device test:** does the iMessage extension actually appear in Messages? Does the API call work over cellular?

---

## Step 12 — Submit for review 🔒 you must (5 min + 1–3 day Apple review)

1. App Store Connect → your app → **App Store** tab → click the version (e.g. 1.0)
2. Fill **App Review Information**:
   - **Sign-In Required:** No
   - **Notes:** paste from `docs/app-store-checklist.md` reviewer notes
3. **Version Release:** "Automatically release this version" (or manual if you want to control timing)
4. Save → **Add for Review** → **Submit for Review**

Apple typically reviews within 24–72 hours. They may:
- Approve → app goes live (or you release manually)
- Reject → they message you via Resolution Center with specifics → fix, resubmit

Common rejection reasons for AI apps:
- Description doesn't disclose AI clearly enough
- Privacy policy URL 404s
- Demo flow not clear for reviewer

---

## Where to ask me for more help

- "Write App Store listing copy" → I can draft description, keywords, promo text
- "Generate placeholder screenshots" → I can render them from the prototype
- "Help me debug build error X" → paste it
- "Walk me through TestFlight" → I can be very specific
- "Write reviewer notes" → I can draft them

What I cannot do under any circumstances:
- Enroll in Apple Developer Program for you
- Sign builds with your certificates
- Upload binaries to App Store Connect
- Submit on your behalf
- Reply to Apple in Resolution Center

These are all gated by your Apple ID + 2FA. They're the actual bottleneck. Everything else is just code.
