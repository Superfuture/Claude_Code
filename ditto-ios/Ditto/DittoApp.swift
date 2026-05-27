import SwiftUI

@main
struct DittoApp: App {
    @AppStorage("hasOnboarded") private var hasOnboarded: Bool = false

    init() {
        // Configure RevenueCat at launch; entitlement state is mirrored into the
        // App Group so the iMessage extension sees Pro status too.
        PurchasesManager.shared.configure()
    }

    var body: some Scene {
        WindowGroup {
            if hasOnboarded {
                ContentView()
            } else {
                OnboardingView(onFinish: { hasOnboarded = true })
            }
        }
    }
}
