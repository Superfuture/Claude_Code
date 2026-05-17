import SwiftUI
import Combine

@MainActor
final class DittoViewModel: ObservableObject {

    @Published var contextText: String = ""
    @Published var selectedTone: Tone = .funny
    @Published var suggestions: [Suggestion] = []
    @Published var isLoading: Bool = false
    @Published var error: String?
    @Published var isExpanded: Bool = false
    @Published var usage: UsageState = .init(used: 0, limit: 5, isPro: false)

    private let insertText: (String) -> Void
    private let api: APIClient
    private let store: AppGroupStore

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
            return
        }
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            let result = try await api.suggest(
                context: contextText,
                tone: selectedTone
            )
            suggestions = result
            store.recordUsage()
            usage = store.currentUsage()
        } catch {
            self.error = "Couldn't generate suggestions. Tap retry."
        }
    }

    func selectTone(_ tone: Tone) {
        guard tone != selectedTone else { return }
        selectedTone = tone
        store.lastTone = tone
        Task { await generate() }
    }

    func insert(_ suggestion: Suggestion) {
        insertText(suggestion.text)
    }

    func recordFeedback(_ suggestion: Suggestion, thumbsUp: Bool) {
        store.recordFeedback(id: suggestion.id, thumbsUp: thumbsUp)
    }
}
