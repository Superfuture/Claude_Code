import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var store: Store
    let onFinish: () -> Void

    enum Step: Int, CaseIterable { case welcome, birth, intention }

    @State private var step: Step = .welcome
    @State private var birthDate: Date = Calendar.current.date(
        from: DateComponents(year: 1995, month: 1, day: 1)
    ) ?? Date()
    @State private var intentionText: String = ""

    var body: some View {
        GeometryReader { geo in
            VStack(spacing: 0) {
                // Page content
                Group {
                    switch step {
                    case .welcome: welcome
                    case .birth: birthStep
                    case .intention: intentionStep
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .transition(.opacity.combined(with: .move(edge: .leading)))

                // Footer
                VStack(spacing: 14) {
                    progressDots
                    Button(action: advance) {
                        Text(step == .intention ? "Begin" : "Continue")
                            .font(BrandFont.bodyBold(17))
                            .foregroundStyle(BrandColor.midnight)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(BrandColor.cream)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .buttonStyle(.plain)
                    .disabled(!canAdvance)
                    .opacity(canAdvance ? 1 : 0.45)
                }
                .padding(.horizontal, geo.size.width * 0.06)
                .padding(.bottom, max(geo.safeAreaInsets.bottom, 16))
            }
        }
    }

    // MARK: - Steps

    private var welcome: some View {
        VStack(spacing: 24) {
            Spacer()
            EnochianMonas().frame(width: 92, height: 92)
            VStack(spacing: 10) {
                Text("Cusp")
                    .font(BrandFont.display(48))
                    .foregroundStyle(BrandColor.cream)
                Text("Three steps a day, tuned to the sky.")
                    .font(BrandFont.serif(17))
                    .foregroundStyle(BrandColor.creamMuted)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }
            Spacer()
            Spacer()
        }
        .padding(.horizontal, 24)
    }

    private var birthStep: some View {
        VStack(alignment: .leading, spacing: 24) {
            Spacer().frame(height: 20)
            VStack(alignment: .leading, spacing: 8) {
                Text("Born when?")
                    .font(BrandFont.display(32))
                    .foregroundStyle(BrandColor.cream)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                Text("Your sun sign sets the temperature for every ritual.")
                    .font(BrandFont.body(15))
                    .foregroundStyle(BrandColor.creamMuted)
                    .fixedSize(horizontal: false, vertical: true)
            }

            DatePicker(
                "Birth date",
                selection: $birthDate,
                in: ...Date(),
                displayedComponents: .date
            )
            .datePickerStyle(.wheel)
            .labelsHidden()
            .colorScheme(.dark)
            .frame(maxWidth: .infinity)

            Spacer()
        }
        .padding(.horizontal, 24)
    }

    private var intentionStep: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer().frame(height: 20)
            VStack(alignment: .leading, spacing: 8) {
                Text("Your intention.")
                    .font(BrandFont.display(32))
                    .foregroundStyle(BrandColor.cream)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                Text("Specific beats aspirational.")
                    .font(BrandFont.body(15))
                    .foregroundStyle(BrandColor.creamMuted)
                    .fixedSize(horizontal: false, vertical: true)
            }

            IntentionField(text: $intentionText)
                .frame(maxHeight: 160)

            Spacer()
        }
        .padding(.horizontal, 24)
    }

    private var progressDots: some View {
        HStack(spacing: 8) {
            ForEach(Step.allCases, id: \.rawValue) { s in
                Capsule()
                    .fill(s == step ? BrandColor.cream : BrandColor.line)
                    .frame(width: s == step ? 20 : 6, height: 6)
                    .animation(.easeInOut(duration: 0.25), value: step)
            }
        }
    }

    // MARK: - Logic

    private var canAdvance: Bool {
        switch step {
        case .welcome: return true
        case .birth: return true
        case .intention: return !intentionText.trimmingCharacters(in: .whitespaces).isEmpty
        }
    }

    private func advance() {
        switch step {
        case .welcome:
            withAnimation(.easeInOut(duration: 0.3)) { step = .birth }
        case .birth:
            withAnimation(.easeInOut(duration: 0.3)) { step = .intention }
        case .intention:
            let comps = Calendar.current.dateComponents([.year, .month, .day], from: birthDate)
            store.birthData = BirthData(
                year: comps.year ?? 0,
                month: comps.month ?? 0,
                day: comps.day ?? 0
            )
            store.currentIntention = intentionText.trimmingCharacters(in: .whitespaces)
            onFinish()
        }
    }
}

/// Resilient placeholder text editor that resizes with the screen and never
/// crops its contents.
struct IntentionField: View {
    @Binding var text: String
    @FocusState private var focused: Bool

    var body: some View {
        ZStack(alignment: .topLeading) {
            if text.isEmpty {
                Text("e.g. I want to stop putting off the conversation with my landlord.")
                    .font(BrandFont.serif(15))
                    .italic()
                    .foregroundStyle(BrandColor.creamMuted.opacity(0.55))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 14)
                    .allowsHitTesting(false)
            }
            TextEditor(text: $text)
                .font(BrandFont.serif(16))
                .foregroundStyle(BrandColor.cream)
                .scrollContentBackground(.hidden)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .focused($focused)
        }
        .background(Color.white.opacity(0.06))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(BrandColor.line, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

