import SwiftUI

struct ContentView: View {
    @EnvironmentObject var store: Store
    @State private var isLoading: Bool = false
    @State private var error: String?
    @State private var showIntentionEditor: Bool = false
    @State private var showPaywall: Bool = false

    private let hPad: CGFloat = 24

    var body: some View {
        ScrollView {
            VStack(spacing: 22) {
                topBar
                intentionCard

                if let ritual = store.todaysRitual {
                    RitualCard(ritual: ritual)
                } else if isLoading {
                    loadingCard
                } else {
                    invitationCard
                }

                if let error { errorBanner(error) }

                streakCard

                Color.clear.frame(height: 24)
            }
            .padding(.horizontal, hPad)
            .padding(.top, 8)
            .frame(maxWidth: .infinity)
        }
        .scrollIndicators(.hidden)
        .sheet(isPresented: $showIntentionEditor) { IntentionEditor() }
        .sheet(isPresented: $showPaywall) { PaywallView() }
    }

    // MARK: - Top bar

    private var topBar: some View {
        HStack(spacing: 14) {
            EnochianGlyph()
                .frame(width: 36, height: 36)
            VStack(alignment: .leading, spacing: 0) {
                Text("Cusp")
                    .font(BrandFont.display(28))
                    .foregroundStyle(BrandColor.lunar)
                    .lineLimit(1)
                    .fixedSize()
                Text(todayLabel)
                    .font(BrandFont.micro(9))
                    .tracking(1.6)
                    .foregroundStyle(BrandColor.gold)
            }
            Spacer(minLength: 8)
            if !store.isPro {
                Button { showPaywall = true } label: {
                    Text("Pro")
                        .font(BrandFont.micro(11))
                        .tracking(1.4)
                        .foregroundStyle(BrandColor.gold)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 7)
                        .overlay(
                            Capsule().stroke(BrandColor.gold, lineWidth: 0.8)
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.vertical, 4)
    }

    private var todayLabel: String {
        let f = DateFormatter()
        f.dateFormat = "EEEE · MMMM d"
        return f.string(from: .now).uppercased()
    }

    // MARK: - Intention card (always visible)

    private var intentionCard: some View {
        Button { showIntentionEditor = true } label: {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 6) {
                    Image(systemName: "circle.dotted")
                        .font(.system(size: 9, weight: .semibold))
                    Text("Intention")
                        .font(BrandFont.micro(10))
                        .tracking(1.6)
                    Spacer()
                    if !store.currentIntention.isEmpty {
                        Image(systemName: "square.and.pencil")
                            .font(.system(size: 12, weight: .regular))
                            .foregroundStyle(BrandColor.gold.opacity(0.6))
                    }
                }
                .foregroundStyle(BrandColor.gold)

                if store.currentIntention.isEmpty {
                    HStack(spacing: 8) {
                        Text("Tap to set what you're bringing in")
                            .font(BrandFont.serif(17))
                            .italic()
                            .foregroundStyle(BrandColor.parchment.opacity(0.85))
                        Image(systemName: "arrow.right")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(BrandColor.gold)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                } else {
                    Text("\u{201C}\(store.currentIntention)\u{201D}")
                        .font(BrandFont.serif(17))
                        .italic()
                        .foregroundStyle(BrandColor.lunar)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(20)
            .background(BrandColor.smoke.opacity(0.6))
            .overlay(geometricFrame())
        }
        .buttonStyle(.plain)
    }

    // MARK: - Invitation (no ritual cast yet)

    private var invitationCard: some View {
        VStack(spacing: 22) {
            EnochianMonas()
                .frame(width: 56, height: 56)

            Text("Today is unwritten.")
                .font(BrandFont.display(28))
                .foregroundStyle(BrandColor.parchment)
                .multilineTextAlignment(.center)

            Button {
                Task { await generate() }
            } label: {
                Text("Cast Today's Ritual")
                    .font(BrandFont.micro(12))
                    .tracking(1.8)
                    .foregroundStyle(BrandColor.void)
                    .padding(.horizontal, 22)
                    .padding(.vertical, 14)
                    .background(BrandColor.parchment)
            }
            .buttonStyle(.plain)
            .disabled(store.currentIntention.isEmpty)
            .opacity(store.currentIntention.isEmpty ? 0.4 : 1)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 44)
        .padding(.horizontal, 24)
        .background(BrandColor.onyx.opacity(0.6))
        .overlay(geometricFrame())
    }

    // MARK: - Loading

    private var loadingCard: some View {
        VStack(spacing: 18) {
            EnochianGlyph()
                .frame(width: 36, height: 36)
                .opacity(0.6)
                .rotationEffect(.degrees(loadingRotation))
                .onAppear { startLoading() }
            Text("READING THE SKY")
                .font(BrandFont.micro(10))
                .tracking(2)
                .foregroundStyle(BrandColor.gold)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 56)
        .background(BrandColor.onyx.opacity(0.6))
        .overlay(geometricFrame())
    }

    @State private var loadingRotation: Double = 0
    private func startLoading() {
        withAnimation(.linear(duration: 6).repeatForever(autoreverses: false)) {
            loadingRotation = 360
        }
    }

    // MARK: - Error

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "diamond")
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(BrandColor.gold)
            Text(message)
                .font(BrandFont.body(13))
                .foregroundStyle(BrandColor.parchment)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 8)
            Button("Retry") { Task { await generate() } }
                .font(BrandFont.micro(11))
                .tracking(1.4)
                .foregroundStyle(BrandColor.gold)
        }
        .padding(14)
        .background(BrandColor.onyx.opacity(0.7))
        .overlay(geometricFrame(lineWidth: 0.5))
    }

    // MARK: - Streak

    private var streakCard: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 4) {
                Text("STREAK")
                    .font(BrandFont.micro(10))
                    .tracking(1.6)
                    .foregroundStyle(BrandColor.gold)
                HStack(alignment: .lastTextBaseline, spacing: 6) {
                    Text("\(store.streak)")
                        .font(BrandFont.display(28))
                        .foregroundStyle(BrandColor.parchment)
                    Text(store.streak == 1 ? "day" : "days")
                        .font(BrandFont.body(13))
                        .foregroundStyle(BrandColor.inkMuted)
                }
            }
            Spacer()
            HStack(spacing: 6) {
                ForEach(0..<7, id: \.self) { i in
                    Rectangle()
                        .fill(i < min(store.streak, 7) ? BrandColor.gold : BrandColor.line)
                        .frame(width: 7, height: 7)
                        .rotationEffect(.degrees(45))
                }
            }
        }
        .padding(18)
        .background(BrandColor.onyx.opacity(0.7))
        .overlay(geometricFrame())
    }

    // MARK: - Generation

    @MainActor
    private func generate() async {
        guard !store.currentIntention.isEmpty else { return }
        guard store.birthData.isSet else { return }
        error = nil
        isLoading = true
        defer { isLoading = false }
        do {
            let ritual = try await APIClient.shared.ritual(
                intention: store.currentIntention,
                birth: store.birthData,
                isPro: store.isPro,
                deviceID: store.deviceID
            )
            store.todaysRitual = ritual
        } catch let err as APIClient.APIError {
            error = err.errorDescription
            if case .rateLimited = err { showPaywall = true }
        } catch {
            self.error = "The sky was quiet. Try again in a moment."
        }
    }
}

// MARK: - Geometric brand marks

/// Small Enochian-style compass glyph — circle + inscribed cross with a
/// hexagram. Used as the topbar mark and the loading indicator.
struct EnochianGlyph: View {
    var body: some View {
        GeometryReader { geo in
            let s = min(geo.size.width, geo.size.height)
            ZStack {
                Circle()
                    .stroke(BrandColor.gold, lineWidth: s * 0.04)
                Path { p in
                    p.move(to: CGPoint(x: s * 0.08, y: s / 2))
                    p.addLine(to: CGPoint(x: s * 0.92, y: s / 2))
                    p.move(to: CGPoint(x: s / 2, y: s * 0.08))
                    p.addLine(to: CGPoint(x: s / 2, y: s * 0.92))
                }
                .stroke(BrandColor.gold, lineWidth: s * 0.025)
                Circle()
                    .stroke(BrandColor.gold, lineWidth: s * 0.025)
                    .frame(width: s * 0.42, height: s * 0.42)
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
        .aspectRatio(1, contentMode: .fit)
    }
}

/// John Dee's Monas Hieroglyphica-inspired symbol — moon, sun, cross,
/// flames synthesized in one mark.
struct EnochianMonas: View {
    var body: some View {
        GeometryReader { geo in
            let s = min(geo.size.width, geo.size.height)
            ZStack {
                // Outer crescent
                CrescentShape()
                    .stroke(BrandColor.gold, lineWidth: s * 0.04)
                    .frame(width: s * 0.85, height: s * 0.55)
                    .offset(y: -s * 0.18)
                // Sun disc
                Circle()
                    .stroke(BrandColor.gold, lineWidth: s * 0.04)
                    .frame(width: s * 0.45, height: s * 0.45)
                    .offset(y: s * 0.02)
                Circle()
                    .fill(BrandColor.gold)
                    .frame(width: s * 0.08, height: s * 0.08)
                    .offset(y: s * 0.02)
                // Cross beneath
                Path { p in
                    let center = s * 0.5
                    p.move(to: CGPoint(x: center, y: s * 0.42))
                    p.addLine(to: CGPoint(x: center, y: s * 0.95))
                    p.move(to: CGPoint(x: s * 0.30, y: s * 0.62))
                    p.addLine(to: CGPoint(x: s * 0.70, y: s * 0.62))
                }
                .stroke(BrandColor.gold, lineWidth: s * 0.04)
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
        .aspectRatio(1, contentMode: .fit)
    }
}

struct CrescentShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let r = min(rect.width, rect.height) / 2
        let c = CGPoint(x: rect.midX, y: rect.midY)
        p.move(to: CGPoint(x: c.x - r, y: c.y))
        p.addArc(center: c, radius: r,
                 startAngle: .degrees(180), endAngle: .degrees(0),
                 clockwise: true)
        p.addArc(center: CGPoint(x: c.x, y: c.y - r * 0.25), radius: r * 0.85,
                 startAngle: .degrees(0), endAngle: .degrees(180),
                 clockwise: false)
        return p
    }
}

// MARK: - Intention editor (sheet)

struct IntentionEditor: View {
    @EnvironmentObject var store: Store
    @Environment(\.dismiss) private var dismiss
    @State private var text: String = ""

    var body: some View {
        ZStack {
            CosmicBackground().ignoresSafeArea()
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Text("Intention")
                        .font(BrandFont.display(28))
                        .foregroundStyle(BrandColor.parchment)
                    Spacer()
                    Button("Done") {
                        store.currentIntention = text.trimmingCharacters(in: .whitespaces)
                        dismiss()
                    }
                    .font(BrandFont.micro(12))
                    .tracking(1.4)
                    .foregroundStyle(BrandColor.gold)
                }

                Text("Specific beats aspirational.")
                    .font(BrandFont.body(13))
                    .foregroundStyle(BrandColor.inkMuted)

                IntentionField(text: $text)
                    .frame(maxHeight: 200)

                Spacer()
            }
            .padding(24)
        }
        .onAppear { text = store.currentIntention }
    }
}
