import SwiftUI

@main
struct DittoApp: App {
    @AppStorage("hasOnboarded") private var hasOnboarded: Bool = false

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
