import SwiftUI
import StoreKit
import RevenueCat

/// Ditto Pro paywall. Prices are loaded live from the App Store (via RevenueCat)
/// so they can never drift from App Store Connect. Includes the App Review
/// required disclosures: trial + price + auto-renew terms, and tappable links to
/// the Terms of Use (EULA) and Privacy Policy (App Store Guideline 3.1.2).
struct PaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selected: Plan = .annual
    /// productID -> localized store price string (e.g. "$4.99"); empty until loaded.
    @State private var livePrice: [String: String] = [:]
    /// productID -> whether THIS account gets the intro trial (App Review 2.1(b):
    /// never advertise a trial the confirmation sheet won't honor, e.g. for an
    /// account that already consumed it).
    @State private var trialEligible: [String: Bool] = [:]
    @State private var purchaseError: String?

    private func isTrialEligible(_ plan: Plan) -> Bool { trialEligible[plan.productID] ?? false }

    /// Required legal links shown on the paywall (must also be set in App Store Connect).
    private enum Legal {
        static let terms = "https://policies.superfuturelabs.com/ditto/terms"
        static let privacy = "https://policies.superfuturelabs.com/ditto/privacy"
    }

    enum Plan: String, CaseIterable, Identifiable {
        case monthly, annual
        var id: String { rawValue }
        var label: String { self == .monthly ? "Monthly" : "Annual" }
        /// Fallback price, used only until the live App Store price loads.
        var price: String { self == .monthly ? "$4.99" : "$29.99" }
        var period: String { self == .monthly ? "per month" : "per year" }
        var note: String? { self == .annual ? "Save 50%" : nil }
        var productID: String { self == .monthly ? "ditto.pro.monthly" : "ditto.pro.annual" }
    }

    /// Live App Store price for a plan, falling back to the static string.
    private func priceText(_ plan: Plan) -> String { livePrice[plan.productID] ?? plan.price }

    /// The exact disclosure App Review requires next to the purchase button.
    private var trialDisclosure: String {
        let base = "Payment is charged to your Apple ID at confirmation of purchase. Your subscription "
        + "auto-renews unless canceled at least 24 hours before the end of the current period. "
        + "Manage or cancel anytime in Settings › Apple ID › Subscriptions."
        if isTrialEligible(selected) {
            return "7 days free, then \(priceText(selected)) \(selected.period), until canceled. " + base
        }
        return "\(priceText(selected)) \(selected.period), until canceled. " + base
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Spacer()
                Button { dismiss() } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(BrandColor.inkMuted)
                        .frame(width: 32, height: 32)
                        .background(Circle().fill(BrandColor.creamDeep))
                }
            }
            .padding()

            ScrollView {
                VStack(spacing: 32) {
                    DittoLogo().frame(width: 64, height: 64)

                    VStack(spacing: 8) {
                        Text("Unlimited Ditto")
                            .font(.brandSerif(34))
                        Text("Three perfect replies. Whenever you need them.")
                            .font(.system(size: 16))
                            .foregroundStyle(BrandColor.inkSoft)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 24)

                    VStack(spacing: 12) {
                        ForEach(Plan.allCases) { plan in
                            planCard(plan)
                        }
                    }
                    .padding(.horizontal, 24)

                    Button {
                        Task { await purchase() }
                    } label: {
                        Text(isTrialEligible(selected)
                             ? "Start 7‑day free trial"
                             : "Subscribe · \(priceText(selected)) \(selected.period)")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(BrandColor.inkInverse)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(BrandColor.ink)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .padding(.horizontal, 24)

                    Button("Restore purchases") {
                        Task { await restore() }
                    }
                    .font(.system(size: 13))
                    .foregroundStyle(BrandColor.inkMuted)

                    // Required App Review disclosure + legal links (Guideline 3.1.2).
                    VStack(spacing: 10) {
                        Text(trialDisclosure)
                            .font(.system(size: 11))
                            .foregroundStyle(BrandColor.inkMuted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 28)

                        HStack(spacing: 6) {
                            Link("Terms of Use (EULA)", destination: URL(string: Legal.terms)!)
                            Text("·").foregroundStyle(BrandColor.inkMuted)
                            Link("Privacy Policy", destination: URL(string: Legal.privacy)!)
                        }
                        .font(.system(size: 11, weight: .medium))
                        .tint(BrandColor.persimmon)
                    }
                }
                .padding(.bottom, 32)
            }
        }
        .background(BrandColor.cream.ignoresSafeArea())
        .task { await loadPrices() }
        .alert("Purchase Failed", isPresented: Binding(
            get: { purchaseError != nil },
            set: { if !$0 { purchaseError = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(purchaseError ?? "")
        }
    }

    private func planCard(_ plan: Plan) -> some View {
        Button { selected = plan } label: {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(plan.label)
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(BrandColor.ink)
                        if let note = plan.note {
                            Text(note)
                                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Capsule().fill(BrandColor.persimmon))
                        }
                    }
                    Text("\(priceText(plan)) \(plan.period)")
                        .font(.system(size: 14))
                        .foregroundStyle(BrandColor.inkSoft)
                }
                Spacer()
                Image(systemName: selected == plan ? "circle.inset.filled" : "circle")
                    .font(.system(size: 22))
                    .foregroundStyle(selected == plan ? BrandColor.persimmon : BrandColor.line)
            }
            .padding(16)
            .background(BrandColor.paperLight)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(selected == plan ? BrandColor.persimmon : BrandColor.line,
                            lineWidth: selected == plan ? 2 : 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }

    // MARK: - RevenueCat hooks

    /// Load live App Store prices so the paywall always matches App Store Connect,
    /// and per-account trial eligibility so the CTA never over-promises.
    private func loadPrices() async {
        guard let offerings = try? await Purchases.shared.offerings() else { return }
        var map: [String: String] = [:]
        var hasIntro: [String: Bool] = [:]
        for pkg in offerings.current?.availablePackages ?? [] {
            let pid = pkg.storeProduct.productIdentifier
            map[pid] = pkg.storeProduct.localizedPriceString
            hasIntro[pid] = pkg.storeProduct.introductoryDiscount?.paymentMode == .freeTrial
        }
        let ids = Array(map.keys)
        let elig = await Purchases.shared.checkTrialOrIntroDiscountEligibility(productIdentifiers: ids)
        var eligible: [String: Bool] = [:]
        for id in ids {
            eligible[id] = (hasIntro[id] ?? false) && elig[id]?.status == .eligible
        }
        await MainActor.run {
            livePrice = map
            trialEligible = eligible
        }
    }

    private func purchase() async {
        do {
            let offerings = try await Purchases.shared.offerings()
            // Match the tapped plan to the package selling that product ID.
            guard let package = offerings.current?.availablePackages
                .first(where: { $0.storeProduct.productIdentifier == selected.productID }) else {
                await MainActor.run {
                    purchaseError = "Subscriptions are temporarily unavailable. Please try again in a moment."
                }
                return
            }
            let result = try await Purchases.shared.purchase(package: package)
            guard !result.userCancelled else { return }
            if result.customerInfo.entitlements[PurchasesManager.proEntitlement]?.isActive == true {
                AppGroupStore.shared.isPro = true
                dismiss()
            }
        } catch {
            await MainActor.run { purchaseError = error.localizedDescription }
        }
    }

    private func restore() async {
        do {
            let info = try await Purchases.shared.restorePurchases()
            if info.entitlements[PurchasesManager.proEntitlement]?.isActive == true {
                AppGroupStore.shared.isPro = true
                dismiss()
            }
        } catch {
            await MainActor.run { purchaseError = error.localizedDescription }
        }
    }
}
