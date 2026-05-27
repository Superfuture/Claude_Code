import Foundation
import RevenueCat

/// Centralises RevenueCat setup and mirrors the Pro entitlement into the shared
/// App Group store, so the iMessage extension also sees Pro status (it reads
/// `AppGroupStore.shared.isPro` to lift the 5/day free limit).
///
/// One-time dashboard setup (app.revenuecat.com), required for purchases to work:
///   • An **Entitlement** with identifier exactly `PurchasesManager.proEntitlement` ("pro")
///   • An **Offering** (e.g. `default`) whose packages map to the App Store products
///     `ditto.pro.monthly` and `ditto.pro.annual`.
final class PurchasesManager: NSObject, ObservableObject {
    static let shared = PurchasesManager()

    /// RevenueCat entitlement identifier — must match the dashboard exactly.
    static let proEntitlement = "pro"

    /// RevenueCat public SDK API key.
    /// ⚠️ This is the TEST key from onboarding (RevenueCat Test Store). Before
    /// shipping real App Store purchases, replace it with your PRODUCTION key
    /// (starts with `appl_`) from RevenueCat → Apps & providers → your App Store app.
    private static let apiKey = "test_rPEdUiXubsipFVjNhEAEheWJrYs"

    @Published private(set) var isPro: Bool = AppGroupStore.shared.isPro

    /// Call once, as early as possible (from `DittoApp.init`).
    func configure() {
        Purchases.logLevel = .info
        Purchases.configure(withAPIKey: Self.apiKey)
        Purchases.shared.delegate = self
        Task { await refresh() }
    }

    /// Fetch the latest entitlement state and mirror it into the App Group.
    func refresh() async {
        guard let info = try? await Purchases.shared.customerInfo() else { return }
        await MainActor.run { self.apply(info) }
    }

    @MainActor
    private func apply(_ info: CustomerInfo) {
        let active = info.entitlements[Self.proEntitlement]?.isActive == true
        isPro = active
        AppGroupStore.shared.isPro = active
    }
}

extension PurchasesManager: PurchasesDelegate {
    func purchases(_ purchases: Purchases, receivedUpdated customerInfo: CustomerInfo) {
        Task { await MainActor.run { self.apply(customerInfo) } }
    }
}
