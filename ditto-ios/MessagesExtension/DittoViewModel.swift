import SwiftUI
import Combine

@MainActor
final class DittoViewModel: ObservableObject {

    @Published var contextText: String = ""
    /// True when contextText is an OCR'd conversation from a screenshot
    /// (speaker-labeled lines) rather than a single pasted message.
    @Published var contextIsThread: Bool = false
    /// True when contextText is the user's own typed draft to rewrite.
    @Published var contextIsDraft: Bool = false
    @Published var selectedTone: Tone = .funny
    @Published var suggestions: [Suggestion] = []
    @Published var isLoading: Bool = false
    @Published var error: String?
    /// True when the current error is the daily quota (drives the Upgrade CTA).
    @Published var errorIsRateLimit: Bool = false
    @Published var isExpanded: Bool = false
    @Published var usage: UsageState = .init(used: 0, limit: 5, isPro: false)

    private let insertText: (String) -> Void
    private let api: APIClient
    private let store: AppGroupStore

    /// Asks the host controller to expand the extension (keyboard needs expanded presentation).
    var requestExpand: () -> Void = {}

    init(
        insertText: @escaping (String) -> Void,
        api: APIClient = .shared,
        store: AppGroupStore = .shared
    ) {
        self.insertText = insertText
        self.api = api
        self.store = store
        self.selectedTone = store.lastTone
        self.usage = store.currentUsage()
    }

    func generate() async {
        guard !contextText.isEmpty else { return }
        guard usage.canRequest else {
            error = "Daily limit reached. Upgrade to Pro for unlimited replies."
            errorIsRateLimit = true
            return
        }
        isLoading = true
        error = nil
        errorIsRateLimit = false
        defer { isLoading = false }
        do {
            let result = try await api.suggest(
                context: contextText,
                tone: selectedTone,
                isThread: contextIsThread,
                isDraft: contextIsDraft
            )
            suggestions = result
            store.recordUsage()
            usage = store.currentUsage()
        } catch APIClient.APIError.rateLimited {
            // The server verifies Pro against RevenueCat on every request, so a
            // 429 means any local Pro flag is stale (e.g. an expired sandbox
            // sub). Flip it so the badge and CTA tell the truth; the app
            // re-mirrors the real entitlement next time it runs.
            store.isPro = false
            usage = store.currentUsage()
            self.error = "Daily limit reached. Upgrade to Pro for unlimited replies."
            self.errorIsRateLimit = true
        } catch {
            self.error = "Couldn't generate suggestions. Tap retry."
        }
    }

    /// Whether pasted clipboard text should generate replies with zero taps.
    /// Guards the free-tier quota: must look like a message (not a URL, sane
    /// length), be new since the last auto-run, and quota must remain.
    func shouldAutoGenerate(_ text: String) -> Bool {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count >= 2, trimmed.count <= 500 else { return false }
        let lower = trimmed.lowercased()
        guard !lower.hasPrefix("http://"), !lower.hasPrefix("https://") else { return false }
        guard trimmed != store.lastAutoContext else { return false }
        guard usage.canRequest else { return false }
        return true
    }

    func autoGenerate(_ text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        store.lastAutoContext = trimmed
        setContext(trimmed)
    }

    func setContext(_ text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        contextText = trimmed
        contextIsThread = false
        contextIsDraft = false
        suggestions = []
        Task { await generate() }
    }

    /// Feed the user's own typed draft and generate 3 rewrites of it.
    func setDraftContext(_ draft: String) {
        let trimmed = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        contextText = trimmed
        contextIsThread = false
        contextIsDraft = true
        suggestions = []
        Task { await generate() }
    }

    /// Feed an OCR'd conversation (from a screenshot) and generate replies
    /// to the latest received message with full thread context.
    func setThreadContext(_ thread: String) {
        let trimmed = thread.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        contextText = trimmed
        contextIsThread = true
        contextIsDraft = false
        suggestions = []
        Task { await generate() }
    }

    func selectTone(_ tone: Tone) {
        guard tone != selectedTone else { return }
        Haptics.tap()
        selectedTone = tone
        store.lastTone = tone
        Task { await generate() }
    }

    func insert(_ suggestion: Suggestion) {
        insertText(suggestion.text)
        Haptics.success()
    }

    func recordFeedback(_ suggestion: Suggestion, thumbsUp: Bool) {
        store.recordFeedback(id: suggestion.id, thumbsUp: thumbsUp)
    }
}
