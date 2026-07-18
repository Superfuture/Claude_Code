import SwiftUI
import UIKit
import Photos

/// The Ditto keyboard: tone chips + reply suggestions where the keyboard
/// normally lives, so replies work in every app (not just iMessage).
struct KeyboardView: View {
    @ObservedObject var viewModel: DittoViewModel
    let hasFullAccess: Bool
    let needsGlobe: Bool
    let onGlobe: () -> Void
    let onSpace: () -> Void
    let onBackspace: () -> Void
    let onReturn: () -> Void
    let readDraft: () -> String?
    let onClearDraft: () -> Void
    /// Opens the Ditto app on the paywall (keyboards can't run purchases).
    let onUpgrade: () -> Void
    /// Jumps to Ditto's page in the Settings app (Full Access lives there).
    let onOpenSettings: () -> Void

    /// Pasteboard changeCount already consumed (auto or via Paste), so the
    /// Paste button only surfaces when there's genuinely NEW clipboard text.
    /// Reading changeCount never triggers the iOS paste permission prompt.
    @State private var consumedChangeCount: Int = -1
    @State private var freshClipboard = false
    @State private var readingScreenshot = false
    @State private var photoDenied = false
    @State private var noRecentScreenshot = false
    @State private var clipboardHasText = false
    @State private var thinkingPulse = false
    @State private var cardsAppeared = false
    /// The screenshot asset behind the current thread context, offered for
    /// one-tap cleanup after replies generate (Mei's panel suggestion).
    @State private var readAssetID: String?
    private let clipboardTick = Timer.publish(every: 1.5, on: .main, in: .common).autoconnect()

    private func refreshClipboardState() {
        freshClipboard = hasFullAccess
            && UIPasteboard.general.hasStrings
            && UIPasteboard.general.changeCount != consumedChangeCount
        clipboardHasText = hasFullAccess && UIPasteboard.general.hasStrings
    }

    var body: some View {
        VStack(spacing: 0) {
            header
                .padding(.horizontal, 12)
                .padding(.top, 11)
                .padding(.bottom, 8)

            toneChips
                .padding(.horizontal, 12)
                .padding(.bottom, 9)

            Group {
                if !hasFullAccess {
                    fullAccessPrompt
                } else if let error = viewModel.error {
                    errorState(error)
                } else if readingScreenshot || viewModel.isLoading {
                    loadingState
                } else if viewModel.contextText.isEmpty {
                    emptyState
                } else {
                    suggestionList
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            utilityRow
                .padding(.horizontal, 8)
                .padding(.vertical, 6)
        }
        .background(BrandColor.paper.ignoresSafeArea())
        .onAppear { Haptics.prepare() }
        .onReceive(clipboardTick) { _ in
            refreshClipboardState()
            // Live screenshot detection: catches a screenshot taken WHILE the
            // keyboard is open (the .task only checks once, at open).
            if hasFullAccess, viewModel.contextText.isEmpty, viewModel.error == nil,
               !readingScreenshot, !viewModel.isLoading {
                _ = tryScreenshot()
            }
        }
        .task {
            guard hasFullAccess else { return }
            // Priority 1: a fresh screenshot always wins, even over previously
            // loaded context (a new screenshot means new intent). Dedupe via
            // lastScreenshotID prevents re-reading the same one. Priority 2:
            // clipboard text, only when nothing is loaded.
            if tryScreenshot() {
                consumedChangeCount = UIPasteboard.general.changeCount
            } else if viewModel.contextText.isEmpty,
               UIPasteboard.general.hasStrings,
               let pasted = UIPasteboard.general.string?
                 .trimmingCharacters(in: .whitespacesAndNewlines),
               !pasted.isEmpty,
               viewModel.shouldAutoGenerate(pasted) {
                consumedChangeCount = UIPasteboard.general.changeCount
                viewModel.autoGenerate(pasted)
            } else {
                consumedChangeCount = UIPasteboard.general.changeCount
            }
            refreshClipboardState()
        }
    }

    /// Reads the latest fresh screenshot (if any) and kicks off generation.
    /// Returns true when a screenshot is being processed.
    private func tryScreenshot() -> Bool {
        guard ScreenshotReader.isAuthorized, viewModel.usage.canRequest else { return false }
        guard let asset = ScreenshotReader.latestFreshScreenshot(
            maxAge: 180, excluding: AppGroupStore.shared.lastScreenshotID
        ) else { return false }
        read(asset)
        return true
    }

    /// Explicit user request: read the newest screenshot even if it's older
    /// or was already consumed once (a tap means "use it again").
    private func manualScreenshot() {
        noRecentScreenshot = false
        guard let asset = ScreenshotReader.latestFreshScreenshot(
            maxAge: 1800, excluding: nil
        ) else {
            noRecentScreenshot = true
            return
        }
        read(asset)
    }

    private func read(_ asset: PHAsset) {
        readingScreenshot = true
        ScreenshotReader.readThread(from: asset) { result in
            readingScreenshot = false
            guard let result else { return }
            AppGroupStore.shared.lastScreenshotID = result.assetID
            readAssetID = result.assetID
            viewModel.setThreadContext(result.thread)
        }
    }

    private var header: some View {
        HStack(spacing: 6) {
            DittoLogo().frame(width: 20, height: 20)
            Text("Ditto")
                .font(.brandSerif(16))
                .italic()
                .foregroundStyle(BrandColor.ink)
            Text(viewModel.usage.isPro
                 ? "PRO"
                 : "\(viewModel.usage.used)/\(viewModel.usage.limit)")
                .font(.system(size: 9, weight: .medium, design: .monospaced))
                .foregroundStyle(BrandColor.inkMuted)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Capsule().fill(BrandColor.creamDeep))
            Spacer()
            if viewModel.contextIsThread, let assetID = readAssetID,
               !viewModel.suggestions.isEmpty {
                Button {
                    Haptics.tap()
                    ScreenshotReader.deleteScreenshot(assetID: assetID) { success in
                        if success {
                            readAssetID = nil
                            Haptics.success()
                        }
                    }
                } label: {
                    Label("Clean up", systemImage: "trash")
                        .font(.system(size: 11, weight: .medium))
                        .padding(.horizontal, 9)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(BrandColor.creamDeep))
                        .foregroundStyle(BrandColor.inkSoft)
                }
                .buttonStyle(.plain)
            }
            if freshClipboard {
                Button {
                    Haptics.tap()
                    consumedChangeCount = UIPasteboard.general.changeCount
                    freshClipboard = false
                    if let pasted = UIPasteboard.general.string?
                        .trimmingCharacters(in: .whitespacesAndNewlines),
                       !pasted.isEmpty {
                        viewModel.setContext(pasted)
                    }
                } label: {
                    Label("Paste", systemImage: "doc.on.clipboard")
                        .font(.system(size: 11, weight: .medium))
                        .padding(.horizontal, 9)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(BrandColor.ink))
                        .foregroundStyle(BrandColor.inkInverse)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var toneChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(Tone.allCases) { tone in
                    Button {
                        viewModel.selectTone(tone)
                    } label: {
                        HStack(spacing: 5) {
                            if tone == .smart {
                                // The ✨ emoji washes out on the selected chip in
                                // dark mode; a persimmon symbol reads everywhere.
                                Image(systemName: "sparkles")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundStyle(BrandColor.persimmon)
                            } else {
                                Text(tone.emoji).font(.system(size: 12))
                            }
                            Text(tone.label).font(.system(size: 13, weight: .medium))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(
                            Capsule().fill(
                                tone == viewModel.selectedTone ? BrandColor.ink : BrandColor.paperLight
                            )
                        )
                        .foregroundStyle(
                            tone == viewModel.selectedTone ? BrandColor.inkInverse : BrandColor.inkSoft
                        )
                        .overlay(
                            Capsule().stroke(BrandColor.line, lineWidth: 1)
                                .opacity(tone == viewModel.selectedTone ? 0 : 1)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var fullAccessPrompt: some View {
        VStack(spacing: 8) {
            Text("One switch to flip")
                .font(.brandSerif(16, weight: .bold))
                .foregroundStyle(BrandColor.ink)
            Text("Turn on Allow Full Access so Ditto can fetch replies. Messages are never stored.")
                .font(.system(size: 12))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)
            Button {
                Haptics.tap()
                onOpenSettings()
            } label: {
                Label("Open Settings", systemImage: "gear")
                    .font(.system(size: 13, weight: .semibold))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 9)
                    .background(Capsule().fill(BrandColor.persimmon))
                    .foregroundStyle(BrandColor.inkInverse)
            }
            .buttonStyle(.plain)
            .padding(.top, 2)
            Text("Keyboards > Allow Full Access")
                .font(.system(size: 10))
                .foregroundStyle(BrandColor.inkMuted)
        }
        .padding(.horizontal, 24)
    }

    private var emptyState: some View {
        VStack(spacing: 6) {
            Text("Copy a message or screenshot the chat")
                .font(.brandSerif(15, weight: .bold))
                .foregroundStyle(BrandColor.ink)
            Text("Long-press a message and tap Copy, then use it below. Screenshots of the conversation work too.")
                .font(.system(size: 12))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)

            if clipboardHasText {
                Button {
                    Haptics.tap()
                    consumedChangeCount = UIPasteboard.general.changeCount
                    freshClipboard = false
                    if let pasted = UIPasteboard.general.string?
                        .trimmingCharacters(in: .whitespacesAndNewlines),
                       !pasted.isEmpty {
                        viewModel.setContext(pasted)
                    }
                } label: {
                    Label("Use copied message", systemImage: "doc.on.clipboard")
                        .font(.system(size: 13, weight: .semibold))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(BrandColor.ink))
                        .foregroundStyle(BrandColor.inkInverse)
                }
                .buttonStyle(.plain)
                .padding(.top, 6)
            }

            if let draft = readDraft()?.trimmingCharacters(in: .whitespacesAndNewlines),
               !draft.isEmpty {
                Button {
                    Haptics.tap()
                    viewModel.setDraftContext(draft)
                } label: {
                    Label("Polish what I typed", systemImage: "wand.and.stars")
                        .font(.system(size: 13, weight: .semibold))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(BrandColor.ink))
                        .foregroundStyle(.white)
                }
                .buttonStyle(.plain)
                .padding(.top, 6)
            }

            if ScreenshotReader.isAuthorized {
                Button {
                    Haptics.tap()
                    manualScreenshot()
                } label: {
                    Label("Use my latest screenshot", systemImage: "camera.viewfinder")
                        .font(.system(size: 13, weight: .semibold))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(BrandColor.persimmon))
                        .foregroundStyle(BrandColor.inkInverse)
                }
                .buttonStyle(.plain)
                .padding(.top, 6)
                if noRecentScreenshot {
                    Text("No screenshot from the last 30 minutes found.")
                        .font(.system(size: 10))
                        .foregroundStyle(BrandColor.inkMuted)
                }
            }

            if !ScreenshotReader.isAuthorized {
                Button {
                    Haptics.tap()
                    if ScreenshotReader.authorization == .notDetermined {
                        ScreenshotReader.requestAccess { granted in
                            photoDenied = !granted
                        }
                    } else {
                        photoDenied = true
                    }
                } label: {
                    Label("Enable screenshot replies", systemImage: "photo.on.rectangle")
                        .font(.system(size: 12, weight: .semibold))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(Capsule().fill(BrandColor.persimmon))
                        .foregroundStyle(BrandColor.inkInverse)
                }
                .buttonStyle(.plain)
                .padding(.top, 4)
                if photoDenied {
                    Text("Allow photo access in Settings > Ditto to enable this.")
                        .font(.system(size: 10))
                        .foregroundStyle(BrandColor.inkMuted)
                }
            }
        }
        .padding(.horizontal, 24)
    }

    private var loadingState: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack(spacing: 5) {
                Text("✨").font(.system(size: 11))
                Text("ditto is thinking")
                    .font(.brandSerif(13, weight: .semibold))
                    .italic()
                    .foregroundStyle(BrandColor.inkSoft)
            }
            .opacity(thinkingPulse ? 1 : 0.4)
            .animation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true), value: thinkingPulse)
            .onAppear { thinkingPulse = true }
            .onDisappear { thinkingPulse = false }

            SkeletonRow(widthFraction: 0.92, delay: 0.0)
                .padding(.top, 2)
            SkeletonRow(widthFraction: 0.74, delay: 0.15)
            SkeletonRow(widthFraction: 0.58, delay: 0.3)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 12)
        .padding(.top, 2)
    }

    private var suggestionList: some View {
        ScrollView {
            VStack(spacing: 8) {
                ForEach(Array(viewModel.suggestions.enumerated()), id: \.element.id) { index, suggestion in
                    Button {
                        if viewModel.contextIsDraft { onClearDraft() }
                        viewModel.insert(suggestion)
                    } label: {
                        Text(suggestion.text)
                            .font(.system(size: 14))
                            .lineSpacing(2)
                            .foregroundStyle(BrandColor.ink)
                            .multilineTextAlignment(.leading)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 14)
                        .background(BrandColor.paperLight)
                        .clipShape(RoundedRectangle(cornerRadius: 13))
                        .overlay(
                            RoundedRectangle(cornerRadius: 13)
                                .stroke(BrandColor.line, lineWidth: 1)
                        )
                        .shadow(color: BrandColor.ink.opacity(0.05), radius: 3, y: 1)
                    }
                    .buttonStyle(PressableCard())
                    .opacity(cardsAppeared ? 1 : 0)
                    .offset(y: cardsAppeared ? 0 : 10)
                    .animation(.spring(duration: 0.4).delay(Double(index) * 0.08), value: cardsAppeared)
                }
            }
            .padding(.horizontal, 12)
            .padding(.top, 2)
        }
        .onAppear { cardsAppeared = true }
        .onChange(of: viewModel.suggestions) { _ in
            cardsAppeared = false
            DispatchQueue.main.async { cardsAppeared = true }
        }
    }

    private func errorState(_ message: String) -> some View {
        VStack(spacing: 8) {
            Text(message)
                .font(.system(size: 12))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)
            if viewModel.errorIsRateLimit {
                Button {
                    Haptics.tap()
                    onUpgrade()
                } label: {
                    Label("Upgrade to Pro", systemImage: "sparkles")
                        .font(.system(size: 13, weight: .semibold))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(BrandColor.ink))
                        .foregroundStyle(BrandColor.inkInverse)
                }
                .buttonStyle(.plain)
            } else {
                Button("Retry") {
                    Task { await viewModel.generate() }
                }
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.white)
                .padding(.horizontal, 14)
                .padding(.vertical, 6)
                .background(Capsule().fill(BrandColor.persimmon))
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 24)
    }

    // Slim, quiet typing row. Required by App Review (guideline 4.4.1:
    // keyboards must provide typing functionality) but visually minimal so
    // the replies own the space.
    private var utilityRow: some View {
        HStack(spacing: 4) {
            if needsGlobe {
                utilityKey(systemImage: "globe", width: 40, action: onGlobe)
            }
            Button {
                Haptics.tap()
                onSpace()
            } label: {
                Text("space")
                    .font(.system(size: 11))
                    .foregroundStyle(BrandColor.inkMuted)
                    .frame(maxWidth: .infinity)
                    .frame(height: 26)
                    .background(BrandColor.ink.opacity(0.04))
                    .clipShape(Capsule())
            }
            .buttonStyle(.plain)
            utilityKey(systemImage: "delete.left", width: 40, action: onBackspace)
            utilityKey(systemImage: "return", width: 40, action: onReturn)
        }
    }

    private func utilityKey(systemImage: String, width: CGFloat, action: @escaping () -> Void) -> some View {
        Button {
            Haptics.tap()
            action()
        } label: {
            Image(systemName: systemImage)
                .font(.system(size: 12))
                .foregroundStyle(BrandColor.inkMuted)
                .frame(width: width, height: 26)
                .background(BrandColor.ink.opacity(0.04))
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}

/// Reply-card press feedback: a gentle scale-down while touched.
private struct PressableCard: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(duration: 0.25), value: configuration.isPressed)
    }
}

/// One skeleton reply card: soft base with a diagonal light sweep that
/// travels across it, staggered per row.
private struct SkeletonRow: View {
    let widthFraction: CGFloat
    let delay: Double
    @State private var sweep = false

    var body: some View {
        GeometryReader { geo in
            RoundedRectangle(cornerRadius: 13)
                .fill(BrandColor.creamDeep.opacity(0.75))
                .overlay(
                    LinearGradient(
                        colors: [.clear, .white.opacity(0.55), .clear],
                        startPoint: .leading, endPoint: .trailing
                    )
                    .frame(width: geo.size.width * 0.45)
                    .offset(x: sweep ? geo.size.width : -geo.size.width * 0.45)
                )
                .clipShape(RoundedRectangle(cornerRadius: 13))
                .frame(width: geo.size.width * widthFraction)
                .onAppear {
                    withAnimation(
                        .easeInOut(duration: 1.2)
                        .repeatForever(autoreverses: false)
                        .delay(delay)
                    ) { sweep = true }
                }
        }
        .frame(height: 48)
    }
}
