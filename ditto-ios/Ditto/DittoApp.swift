import SwiftUI

@main
struct DittoApp: App {
    @AppStorage("hasOnboarded") private var hasOnboarded: Bool = false

    init() {
        // Configure RevenueCat at launch; entitlement state is mirrored into the
        // App Group so the iMessage extension sees Pro status too.
        PurchasesManager.shared.configure()
        Analytics.track("app_open")
    }

    var body: some Scene {
        WindowGroup {
            #if DEBUG
            if UserDefaults.standard.bool(forKey: "ditto_preview") {
                DittoExtensionPreview()
            } else if hasOnboarded {
                ContentView()
            } else {
                OnboardingView(onFinish: { hasOnboarded = true })
            }
            #else
            if hasOnboarded {
                ContentView()
            } else {
                OnboardingView(onFinish: { hasOnboarded = true })
            }
            #endif
        }
    }
}

#if DEBUG
/// Screenshot-only host that renders the iMessage extension's DittoView with
/// sample suggestions (the extension itself only runs inside Messages).
private struct DittoExtensionPreview: View {
    @StateObject private var vm: DittoViewModel = {
        let m = DittoViewModel(insertText: { _ in })
        m.contextText = "wanna grab dinner this week?"
        m.selectedTone = .flirty
        m.usage = .init(used: 1, limit: 5, isPro: false)
        m.suggestions = [
            Suggestion(text: "Only if you're buying dessert 😏", tone: .flirty),
            Suggestion(text: "I thought you'd never ask. When and where?", tone: .flirty),
            Suggestion(text: "Yes please, I've been craving a good night out with you.", tone: .flirty),
        ]
        return m
    }()
    var body: some View {
        DittoView(viewModel: vm)
    }
}
#endif
