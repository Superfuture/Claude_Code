import SwiftUI

struct ContentView: View {
    @State private var showPaywall = false
    @State private var usage = AppGroupStore.shared.currentUsage()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    header
                    usageCard
                    howToCard
                    settingsLinks
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 32)
            }
            .background(BrandColor.cream.ignoresSafeArea())
            .toolbar(.hidden)
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView()
        }
        .onAppear {
            usage = AppGroupStore.shared.currentUsage()
        }
        // ditto://upgrade — the keyboard's "Upgrade to Pro" button lands here.
        .onOpenURL { url in
            if url.host == "upgrade" || url.absoluteString.contains("upgrade") {
                showPaywall = true
            }
        }
    }

    private var header: some View {
        VStack(spacing: 8) {
            DittoLogo().frame(width: 56, height: 56)
            Text("Ditto")
                .font(.brandSerif(32))
                .italic()
                .foregroundStyle(BrandColor.ink)
            Text("Three perfect replies, right inside iMessage.")
                .font(.system(size: 15))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .padding(.top, 16)
    }

    private var usageCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(usage.isPro ? "PRO" : "TODAY")
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .tracking(1)
                    .foregroundStyle(BrandColor.persimmon)
                Spacer()
                if !usage.isPro {
                    Button("Upgrade") { showPaywall = true }
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(BrandColor.inkInverse)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(BrandColor.ink))
                }
            }
            if usage.isPro {
                Text("Unlimited replies")
                    .font(.brandSerif(22, weight: .bold))
            } else {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text("\(usage.used)")
                        .font(.brandSerif(32, weight: .bold))
                        .foregroundStyle(BrandColor.ink)
                    Text("of \(usage.limit) used")
                        .font(.system(size: 15))
                        .foregroundStyle(BrandColor.inkSoft)
                }
                ProgressView(value: Double(usage.used), total: Double(usage.limit))
                    .tint(BrandColor.persimmon)
            }
        }
        .padding(20)
        .background(BrandColor.paperLight)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(BrandColor.line, lineWidth: 1)
        )
    }

    private var howToCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("How to use Ditto")
                .font(.brandSerif(22))

            ForEach(steps, id: \.title) { step in
                HStack(alignment: .top, spacing: 12) {
                    Text(step.num)
                        .font(.brandSerif(14, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 24, height: 24)
                        .background(Circle().fill(BrandColor.persimmon))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(step.title)
                            .font(.system(size: 15, weight: .medium))
                        Text(step.body)
                            .font(.system(size: 13))
                            .foregroundStyle(BrandColor.inkSoft)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(BrandColor.paperLight)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(BrandColor.line, lineWidth: 1)
        )
    }

    private var settingsLinks: some View {
        VStack(spacing: 0) {
            NavigationLink(destination: SettingsView()) {
                row("Settings", systemImage: "gear")
            }
            Divider().padding(.leading, 44)
            Link(destination: URL(string: "https://policies.superfuturelabs.com/ditto/privacy")!) {
                row("Privacy Policy", systemImage: "lock.fill")
            }
            Divider().padding(.leading, 44)
            Link(destination: URL(string: "https://policies.superfuturelabs.com/ditto/terms")!) {
                row("Terms of Use (EULA)", systemImage: "doc.text.fill")
            }
            Divider().padding(.leading, 44)
            Link(destination: URL(string: "https://policies.superfuturelabs.com/ditto/support")!) {
                row("Support", systemImage: "questionmark.circle.fill")
            }
        }
        .background(BrandColor.paperLight)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(BrandColor.line, lineWidth: 1)
        )
    }

    private func row(_ title: String, systemImage: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: systemImage)
                .frame(width: 24)
                .foregroundStyle(BrandColor.persimmon)
            Text(title)
                .font(.system(size: 15))
                .foregroundStyle(BrandColor.ink)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(BrandColor.inkMuted)
        }
        .padding(16)
        .contentShape(Rectangle())
    }

    private struct Step { let num, title, body: String }
    private var steps: [Step] {
        [
            .init(num: "1", title: "Open Messages",
                  body: "Start any conversation in iMessage."),
            .init(num: "2", title: "Tap the apps icon",
                  body: "Pick Ditto from the iMessage app drawer."),
            .init(num: "3", title: "Tap a reply",
                  body: "Ditto suggests three. Tap one to insert.")
        ]
    }
}
