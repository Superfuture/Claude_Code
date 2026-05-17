import SwiftUI
import StoreKit

/// Minimal paywall. Plug in RevenueCat or wire StoreKit2 fully — the
/// scaffold here demonstrates the surface; product fetching + purchase
/// flow must be hooked up to your App Store Connect product IDs.
struct PaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selected: Plan = .annual

    enum Plan: String, CaseIterable, Identifiable {
        case monthly, annual
        var id: String { rawValue }
        var label: String { self == .monthly ? "Monthly" : "Annual" }
        var price: String { self == .monthly ? "$4.99" : "$29.99" }
        var period: String { self == .monthly ? "per month" : "per year" }
        var note: String? { self == .annual ? "Save 50%" : nil }
        var productID: String { self == .monthly ? "ditto.pro.monthly" : "ditto.pro.annual" }
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
                            .font(.custom("Fraunces-Italic", size: 36))
                            .italic()
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
                        Text("Start 7‑day free trial")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(.white)
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

                    Text("Cancel anytime in Settings · App Store. Subscriptions auto‑renew at the end of each period unless canceled at least 24h before.")
                        .font(.system(size: 11))
                        .foregroundStyle(BrandColor.inkMuted)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }
                .padding(.bottom, 32)
            }
        }
        .background(BrandColor.cream.ignoresSafeArea())
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
                    Text("\(plan.price) \(plan.period)")
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

    // MARK: - StoreKit hooks

    private func purchase() async {
        // Phase 1: integrate StoreKit2 or RevenueCat here.
        // Pseudocode for StoreKit2:
        //   let products = try await Product.products(for: [selected.productID])
        //   guard let product = products.first else { return }
        //   let result = try await product.purchase()
        //   // verify, set AppGroupStore.shared.isPro = true, dismiss
        AppGroupStore.shared.isPro = true
        dismiss()
    }

    private func restore() async {
        // try? await AppStore.sync()
    }
}
