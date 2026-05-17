import SwiftUI

@main
struct CuspApp: App {
    @StateObject private var store = Store.shared
    @AppStorage("cusp.onboarded") private var onboarded: Bool = false

    var body: some Scene {
        WindowGroup {
            ZStack {
                CosmicBackground().ignoresSafeArea()
                if onboarded && store.birthData.isSet {
                    ContentView()
                } else {
                    OnboardingView(onFinish: { onboarded = true })
                }
            }
            .environmentObject(store)
            .preferredColorScheme(.dark)
        }
    }
}
