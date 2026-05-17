import SwiftUI

struct DittoView: View {
    @ObservedObject var viewModel: DittoViewModel

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider().opacity(0.4)
            toneChips
                .padding(.horizontal, 14)
                .padding(.vertical, 12)

            if viewModel.contextText.isEmpty {
                emptyState
            } else if let error = viewModel.error {
                errorState(error)
            } else if viewModel.suggestions.isEmpty {
                if viewModel.isLoading {
                    loadingState
                } else {
                    initialPromptState
                }
            } else {
                suggestionList
            }

            Spacer(minLength: 0)
            footer
        }
        .background(BrandColor.paper)
        .task {
            if !viewModel.contextText.isEmpty && viewModel.suggestions.isEmpty {
                await viewModel.generate()
            }
        }
    }

    private var header: some View {
        HStack(spacing: 8) {
            DittoLogo()
                .frame(width: 24, height: 24)
            Text("Ditto")
                .font(.custom("Fraunces-Italic", size: 20))
                .italic()
                .foregroundStyle(BrandColor.ink)
            usageBadge
            Spacer()
            Image(systemName: "gear")
                .foregroundStyle(BrandColor.inkMuted)
                .font(.system(size: 14))
        }
        .padding(.horizontal, 14)
        .padding(.top, 12)
        .padding(.bottom, 10)
    }

    private var usageBadge: some View {
        Text(viewModel.usage.isPro
             ? "PRO"
             : "\(viewModel.usage.used) / \(viewModel.usage.limit) TODAY")
            .font(.system(size: 9, weight: .medium, design: .monospaced))
            .tracking(0.8)
            .foregroundStyle(BrandColor.inkMuted)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Capsule().fill(BrandColor.creamDeep))
    }

    private var toneChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 7) {
                ForEach(Tone.allCases) { tone in
                    Button {
                        viewModel.selectTone(tone)
                    } label: {
                        HStack(spacing: 5) {
                            Text(tone.emoji)
                            Text(tone.label)
                                .font(.system(size: 13, weight: .medium))
                        }
                        .padding(.horizontal, 13)
                        .padding(.vertical, 7)
                        .background(
                            Capsule().fill(
                                tone == viewModel.selectedTone
                                    ? BrandColor.ink
                                    : BrandColor.paperLight
                            )
                        )
                        .foregroundStyle(
                            tone == viewModel.selectedTone
                                ? .white
                                : BrandColor.inkSoft
                        )
                        .overlay(
                            Capsule().stroke(BrandColor.line, lineWidth: 1)
                                .opacity(tone == viewModel.selectedTone ? 0 : 1)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var suggestionList: some View {
        ScrollView {
            VStack(spacing: 8) {
                ForEach(Array(viewModel.suggestions.enumerated()), id: \.element.id) { idx, suggestion in
                    SuggestionCard(
                        index: idx + 1,
                        suggestion: suggestion,
                        onTap: { viewModel.insert(suggestion) },
                        onThumbsUp: { viewModel.recordFeedback(suggestion, thumbsUp: true) },
                        onThumbsDown: { viewModel.recordFeedback(suggestion, thumbsUp: false) }
                    )
                }
            }
            .padding(.horizontal, 14)
        }
    }

    private var loadingState: some View {
        VStack(spacing: 8) {
            ForEach(0..<3, id: \.self) { _ in
                RoundedRectangle(cornerRadius: 14)
                    .fill(BrandColor.creamDeep)
                    .frame(height: 64)
                    .shimmer()
            }
        }
        .padding(.horizontal, 14)
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Text("Open Ditto inside a conversation")
                .font(.custom("Fraunces-Italic", size: 18))
                .italic()
                .foregroundStyle(BrandColor.ink)
            Text("Tap a message and share to Ditto, or paste below.")
                .font(.system(size: 13))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 28)
        .padding(.vertical, 24)
    }

    private var initialPromptState: some View {
        VStack(spacing: 14) {
            Text("Tap a tone to generate replies")
                .font(.system(size: 14))
                .foregroundStyle(BrandColor.inkSoft)
        }
        .padding(.vertical, 32)
    }

    private func errorState(_ message: String) -> some View {
        VStack(spacing: 12) {
            Text(message)
                .font(.system(size: 13))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)
            Button("Retry") {
                Task { await viewModel.generate() }
            }
            .buttonStyle(.borderedProminent)
            .tint(BrandColor.persimmon)
        }
        .padding(28)
    }

    private var footer: some View {
        HStack {
            Text("try")
                .font(.system(size: 9, weight: .medium, design: .monospaced))
                .tracking(1)
                .foregroundStyle(BrandColor.inkMuted)
            ForEach(["shorter", "funnier", "more chill"], id: \.self) { variant in
                Button(variant) {
                    Task { await viewModel.generate() }
                }
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(BrandColor.inkSoft)
                .padding(.horizontal, 11)
                .padding(.vertical, 5)
                .overlay(Capsule().stroke(BrandColor.line, lineWidth: 1))
            }
            Spacer()
            Button {
                Task { await viewModel.generate() }
            } label: {
                Label("more options", systemImage: "arrow.clockwise")
                    .font(.system(size: 12, weight: .medium))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Capsule().fill(BrandColor.ink))
                    .foregroundStyle(.white)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 14)
        .padding(.top, 10)
        .padding(.bottom, 14)
        .background(
            Rectangle()
                .fill(BrandColor.line)
                .frame(height: 1),
            alignment: .top
        )
    }
}

// MARK: - Brand tokens

enum BrandColor {
    static let persimmon = Color(red: 1.0, green: 0.353, blue: 0.212)
    static let cream = Color(red: 0.949, green: 0.914, blue: 0.839)
    static let creamDeep = Color(red: 0.914, green: 0.871, blue: 0.765)
    static let paper = Color(red: 0.973, green: 0.945, blue: 0.875)
    static let paperLight = Color(red: 0.988, green: 0.969, blue: 0.918)
    static let ink = Color(red: 0.106, green: 0.086, blue: 0.067)
    static let inkSoft = Color(red: 0.247, green: 0.212, blue: 0.173)
    static let inkMuted = Color(red: 0.518, green: 0.471, blue: 0.400)
    static let line = Color(red: 0.106, green: 0.086, blue: 0.067).opacity(0.1)
}

extension View {
    func shimmer() -> some View { modifier(ShimmerModifier()) }
}

private struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = -1
    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    colors: [.clear, .white.opacity(0.4), .clear],
                    startPoint: .leading, endPoint: .trailing
                )
                .offset(x: phase * 200)
                .mask(content)
            )
            .onAppear {
                withAnimation(.linear(duration: 1.2).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
    }
}
