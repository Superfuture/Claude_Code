import SwiftUI

struct ContentView: View {
    @EnvironmentObject var store: Store
    @State private var isLoading: Bool = false
    @State private var error: String?
    @State private var showIntentionEditor: Bool = false
    @State private var showPaywall: Bool = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                topBar
                intentionCard
                    .padding(.horizontal, 20)

                if let ritual = store.todaysRitual {
                    RitualCard(ritual: ritual)
                        .padding(.horizontal, 20)
                } else if isLoading {
                    loadingCard
                        .padding(.horizontal, 20)
                } else {
                    invitationCard
                        .padding(.horizontal, 20)
                }

                if let error { errorBanner(error) }

                streakCard
                    .padding(.horizontal, 20)

                Spacer(minLength: 32)
            }
            .padding(.top, 8)
        }
        .sheet(isPresented: $showIntentionEditor) {
            IntentionEditor()
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView()
        }
    }

    // MARK: - Sections

    private var topBar: some View {
        HStack {
            CuspMark()
                .frame(width: 32, height: 32)
            Text("Cusp")
                .font(BrandFont.display(22))
                .foregroundStyle(BrandColor.cream)
            Spacer()
            if !store.isPro {
                Button { showPaywall = true } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 11, weight: .semibold))
                        Text("Pro")
                            .font(BrandFont.bodyBold(13))
                    }
                    .foregroundStyle(BrandColor.midnight)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Capsule().fill(BrandColor.gold))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 24)
    }

    private var intentionCard: some View {
        Button { showIntentionEditor = true } label: {
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Today's intention")
                        .font(BrandFont.micro(10))
                        .tracking(1.2)
                        .foregroundStyle(BrandColor.gold)
                    Text(store.currentIntention.isEmpty ? "Set an intention" : "\u{201C}\(store.currentIntention)\u{201D}")
                        .font(BrandFont.serif(17))
                        .italic()
                        .foregroundStyle(BrandColor.cream)
                        .multilineTextAlignment(.leading)
                }
                Spacer(minLength: 0)
                Image(systemName: "square.and.pencil")
                    .font(.system(size: 14))
                    .foregroundStyle(BrandColor.creamMuted)
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white.opacity(0.04))
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(BrandColor.line, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 18))
        }
        .buttonStyle(.plain)
    }

    private var invitationCard: some View {
        VStack(spacing: 16) {
            Text("Today is unwritten.")
                .font(BrandFont.display(26))
                .foregroundStyle(BrandColor.cream)
                .multilineTextAlignment(.center)

            Button {
                Task { await generate() }
            } label: {
                Text("Cast today's ritual")
                    .font(BrandFont.bodyBold(15))
                    .foregroundStyle(BrandColor.midnight)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background(Capsule().fill(BrandColor.cream))
            }
            .buttonStyle(.plain)
            .disabled(store.currentIntention.isEmpty)
            .opacity(store.currentIntention.isEmpty ? 0.4 : 1)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .background(Color.white.opacity(0.03))
        .overlay(
            RoundedRectangle(cornerRadius: 22)
                .stroke(BrandColor.line, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 22))
    }

    private var loadingCard: some View {
        VStack(spacing: 14) {
            ProgressView().tint(BrandColor.gold)
            Text("Reading the sky…")
                .font(BrandFont.serif(15))
                .italic()
                .foregroundStyle(BrandColor.creamMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
        .background(Color.white.opacity(0.03))
        .overlay(
            RoundedRectangle(cornerRadius: 22)
                .stroke(BrandColor.line, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 22))
    }

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.circle.fill")
                .foregroundStyle(BrandColor.gold)
            Text(message)
                .font(BrandFont.body(13))
                .foregroundStyle(BrandColor.cream)
            Spacer()
            Button("Retry") { Task { await generate() } }
                .font(BrandFont.bodyBold(13))
                .foregroundStyle(BrandColor.gold)
        }
        .padding(14)
        .background(Color.white.opacity(0.04))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal, 20)
    }

    private var streakCard: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Streak")
                    .font(BrandFont.micro(10))
                    .tracking(1.2)
                    .foregroundStyle(BrandColor.creamMuted)
                Text("\(store.streak) \(store.streak == 1 ? "day" : "days")")
                    .font(BrandFont.display(24))
                    .foregroundStyle(BrandColor.cream)
            }
            Spacer()
            ForEach(0..<7) { i in
                Circle()
                    .fill(i < min(store.streak, 7) ? BrandColor.gold : BrandColor.line)
                    .frame(width: 8, height: 8)
            }
        }
        .padding(20)
        .background(Color.white.opacity(0.03))
        .overlay(
            RoundedRectangle(cornerRadius: 18)
                .stroke(BrandColor.line, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }

    // MARK: - Actions

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
            self.error = "Something's interfering. Try again."
        }
    }
}

/// Inline intention editor sheet
struct IntentionEditor: View {
    @EnvironmentObject var store: Store
    @Environment(\.dismiss) private var dismiss
    @State private var text: String = ""

    var body: some View {
        ZStack {
            CosmicBackground().ignoresSafeArea()
            VStack(alignment: .leading, spacing: 20) {
                HStack {
                    Text("Intention")
                        .font(BrandFont.display(28))
                        .foregroundStyle(BrandColor.cream)
                    Spacer()
                    Button("Done") {
                        store.currentIntention = text.trimmingCharacters(in: .whitespaces)
                        dismiss()
                    }
                    .font(BrandFont.bodyBold(15))
                    .foregroundStyle(BrandColor.gold)
                }

                Text("Specific is better than aspirational.")
                    .font(BrandFont.body(14))
                    .foregroundStyle(BrandColor.creamMuted)

                TextEditor(text: $text)
                    .font(BrandFont.serif(18))
                    .italic()
                    .foregroundStyle(BrandColor.cream)
                    .scrollContentBackground(.hidden)
                    .padding(12)
                    .frame(maxHeight: .infinity)
                    .background(Color.white.opacity(0.04))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(BrandColor.line, lineWidth: 1)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .colorScheme(.dark)
            }
            .padding(24)
        }
        .onAppear { text = store.currentIntention }
    }
}
