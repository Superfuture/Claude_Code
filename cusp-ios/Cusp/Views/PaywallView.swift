import SwiftUI

/// Lightweight paywall placeholder. Wire to StoreKit2 the same way as Ditto's
/// SubscriptionManager when you're ready — products `cusp.pro.monthly` and
/// `cusp.pro.annual` at $7.99/mo and $49.99/yr.
struct PaywallView: View {
    @EnvironmentObject var store: Store
    @Environment(\.dismiss) private var dismiss
    @State private var plan: Plan = .annual

    enum Plan: Identifiable, CaseIterable {
        case monthly, annual
        var id: String { String(describing: self) }
        var label: String { self == .monthly ? "Monthly" : "Annual" }
        var price: String { self == .monthly ? "$7.99 / month" : "$49.99 / year" }
        var note: String? { self == .annual ? "Save ~48%" : nil }
    }

    var body: some View {
        ZStack {
            CosmicBackground().ignoresSafeArea()
            ScrollView {
                VStack(spacing: 28) {
                    HStack {
                        Spacer()
                        Button { dismiss() } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(BrandColor.creamMuted)
                                .frame(width: 30, height: 30)
                                .background(Circle().fill(Color.white.opacity(0.06)))
                        }
                    }

                    CuspMark()
                        .frame(width: 64, height: 64)

                    VStack(spacing: 10) {
                        Text("Cusp Pro")
                            .font(BrandFont.display(38))
                            .foregroundStyle(BrandColor.cream)
                        Text("Unlimited rituals. Tarot draws. Transit alerts. Pattern insights across your manifestation history.")
                            .font(BrandFont.serif(15))
                            .italic()
                            .foregroundStyle(BrandColor.creamMuted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                    }

                    VStack(spacing: 10) {
                        ForEach(Plan.allCases) { p in planRow(p) }
                    }

                    Button {
                        // TODO: wire StoreKit2 here. For now toggle pro state for testing.
                        store.isPro = true
                        dismiss()
                    } label: {
                        Text("Start 7-day free trial")
                            .font(BrandFont.bodyBold(17))
                            .foregroundStyle(BrandColor.midnight)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(BrandColor.gold)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .buttonStyle(.plain)

                    Text("Cancel anytime in Settings → Apple ID → Subscriptions. Renews automatically.")
                        .font(.system(size: 11))
                        .foregroundStyle(BrandColor.creamMuted.opacity(0.7))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)

                    Spacer(minLength: 32)
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
            }
        }
    }

    private func planRow(_ p: Plan) -> some View {
        let selected = plan == p
        return Button { plan = p } label: {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(p.label)
                            .font(BrandFont.bodyBold(17))
                            .foregroundStyle(BrandColor.cream)
                        if let n = p.note {
                            Text(n)
                                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                                .foregroundStyle(BrandColor.midnight)
                                .padding(.horizontal, 7)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(BrandColor.gold))
                        }
                    }
                    Text(p.price)
                        .font(BrandFont.body(14))
                        .foregroundStyle(BrandColor.creamMuted)
                }
                Spacer()
                Image(systemName: selected ? "circle.inset.filled" : "circle")
                    .font(.system(size: 22))
                    .foregroundStyle(selected ? BrandColor.gold : BrandColor.line)
            }
            .padding(16)
            .background(Color.white.opacity(0.04))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(selected ? BrandColor.gold : BrandColor.line,
                            lineWidth: selected ? 2 : 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }
}
