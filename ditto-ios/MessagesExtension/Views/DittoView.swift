import SwiftUI
import UIKit

struct DittoView: View {
    @ObservedObject var viewModel: DittoViewModel
    @State private var draft: String = ""
    @FocusState private var draftFocused: Bool

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
            } else if viewModel.isLoading {
                // Shown for first generation AND tone-switch regenerations
                loadingState
            } else if viewModel.suggestions.isEmpty {
                initialPromptState
            } else {
                suggestionList
            }

            Spacer(minLength: 0)
            footer
        }
        .background(BrandColor.paper)
        .onAppear { Haptics.prepare() }
        .task {
            if !viewModel.contextText.isEmpty && viewModel.suggestions.isEmpty {
                await viewModel.generate()
            } else if viewModel.contextText.isEmpty, draft.isEmpty,
                      UIPasteboard.general.hasStrings,
                      let pasted = UIPasteboard.general.string?
                        .trimmingCharacters(in: .whitespacesAndNewlines),
                      !pasted.isEmpty {
                // Prefill from the clipboard, and when it looks like a fresh
                // message go straight to suggestions with zero taps. The
                // shouldAutoGenerate gate protects the daily quota from URLs,
                // over-long text, and clipboard content already used once.
                draft = pasted
                if viewModel.shouldAutoGenerate(pasted) {
                    viewModel.autoGenerate(pasted)
                }
            }
        }
    }

    private var header: some View {
        HStack(spacing: 8) {
            DittoLogo()
                .frame(width: 24, height: 24)
            Text("Ditto")
                .font(.brandSerif(20))
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
                            if tone == .smart {
                                Image(systemName: "sparkles")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundStyle(BrandColor.persimmon)
                            } else {
                                Text(tone.emoji)
                            }
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
                                ? BrandColor.inkInverse
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
        VStack(spacing: 12) {
            Text("What are you replying to?")
                .font(.brandSerif(19, weight: .bold))
                .foregroundStyle(BrandColor.ink)
            Text("Copy a message and Ditto picks it up, or paste it below.")
                .font(.system(size: 13))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)

            HStack(spacing: 8) {
                TextField("Their message...", text: $draft, axis: .vertical)
                    .lineLimit(1...3)
                    .font(.system(size: 14))
                    .foregroundStyle(BrandColor.ink)
                    .focused($draftFocused)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 9)
                    .background(
                        RoundedRectangle(cornerRadius: 12).fill(BrandColor.paperLight)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 12).stroke(BrandColor.line, lineWidth: 1)
                    )
                    .onChange(of: draftFocused) { focused in
                        // The keyboard can't appear in compact presentation
                        if focused { viewModel.requestExpand() }
                    }

                if draft.isEmpty {
                    Button {
                        Haptics.tap()
                        if let pasted = UIPasteboard.general.string?
                            .trimmingCharacters(in: .whitespacesAndNewlines),
                           !pasted.isEmpty {
                            draft = pasted
                            viewModel.setContext(pasted)
                        }
                    } label: {
                        Label("Paste", systemImage: "doc.on.clipboard")
                            .font(.system(size: 13, weight: .medium))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 9)
                            .background(Capsule().fill(BrandColor.ink))
                            .foregroundStyle(BrandColor.inkInverse)
                    }
                    .buttonStyle(.plain)
                }
            }

            if !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                Button {
                    Haptics.tap()
                    draftFocused = false
                    viewModel.setContext(draft)
                } label: {
                    Text("Suggest replies")
                        .font(.system(size: 14, weight: .semibold))
                        .padding(.horizontal, 18)
                        .padding(.vertical, 10)
                        .background(Capsule().fill(BrandColor.persimmon))
                        .foregroundStyle(.white)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 28)
        .padding(.vertical, 20)
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
                Haptics.soften()
                Task { await viewModel.generate() }
            } label: {
                Label("more options", systemImage: "arrow.clockwise")
                    .font(.system(size: 12, weight: .medium))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Capsule().fill(BrandColor.ink))
                    .foregroundStyle(BrandColor.inkInverse)
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
// BrandColor moved to Shared/BrandColor.swift so both targets share it.

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
