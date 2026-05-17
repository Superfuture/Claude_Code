# Important: about the Xcode project you started

It looks like you created an Xcode project at `ditto-ios/DittoMessages/DittoMessages.xcodeproj` — that's great, that's the manual step I can't do for you. A few things to know:

## What you created vs. what Ditto actually needs

The project at `ditto-ios/DittoMessages/` is set up as a **regular iOS app**. Ditto actually needs:

- One **iOS App target** named `Ditto` (the companion app with onboarding, paywall, settings)
- One **iMessage Extension target** named `DittoMessages` (the actual product surface, embedded in the app)

These are *two targets in one Xcode project*, not two separate projects.

## What to do

### Option A — start fresh (recommended, 10 min)

1. Close Xcode
2. Delete `ditto-ios/DittoMessages/` entirely
3. In Xcode: **File → New → Project → iOS → App**
   - Product Name: `Ditto`
   - Bundle ID: `com.yourdomain.Ditto`
   - Interface: SwiftUI, Storage: None
4. Save to `~/Code/Ditto/` (outside this repo — keeps the source-of-truth scaffold clean)
5. With Ditto open in Xcode: **File → New → Target → iOS → iMessage Extension**
   - Name: `DittoMessages`
   - Embed in: Ditto
6. Drag source files in:
   - Files in `ditto-ios/Ditto/` → drop into the `Ditto` target only
   - Files in `ditto-ios/MessagesExtension/` → drop into the `DittoMessages` target only
   - Files in `ditto-ios/Shared/` → check **both** target boxes when adding
7. Continue from Step 5 in `docs/walkthrough.md` (App Group capability, backend, icon, etc.)

### Option B — adapt the existing project

If you'd rather not redo it:

1. In Xcode, rename the current "DittoMessages" target to "Ditto" (target → Identity → rename + change bundle ID)
2. Add a NEW target: **File → New → Target → iOS → iMessage Extension** → name it `DittoMessages`
3. Same drag-and-drop steps as Option A

I recommend Option A — Xcode's target rename has rough edges and the file structure ends up tidier with a clean project.

## Where the source files live now

- `ditto-ios/Ditto/` — main companion app source (unchanged)
- `ditto-ios/MessagesExtension/` — iMessage extension source (restored to this path so it doesn't conflict with the Xcode project at `ditto-ios/DittoMessages/`)
- `ditto-ios/Shared/` — files for both targets
- `ditto-ios/Backend/` — Cloudflare Worker (deploy with `npx wrangler deploy`)
- `ditto-ios/assets/AppIcon-1024.png` — drop into Assets.xcassets in Xcode

## The rest is unchanged

- Full walkthrough: `ditto-ios/docs/walkthrough.md`
- App Store checklist: `ditto-ios/docs/app-store-checklist.md`
- Listing copy: `ditto-ios/docs/app-store-listing.md`
- Privacy policy (already hosted): https://superfuture.github.io/Claude_Code/ditto-privacy.html
