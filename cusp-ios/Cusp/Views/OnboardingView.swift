import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var store: Store
    let onFinish: () -> Void

    @State private var page: Int = 0
    @State private var birthDate: Date = Calendar.current.date(from: DateComponents(year: 1995, month: 1, day: 1)) ?? Date()
    @State private var intentionText: String = ""

    var body: some View {
        VStack(spacing: 0) {
            TabView(selection: $page) {
                welcome.tag(0)
                birthDateStep.tag(1)
                intentionStep.tag(2)
            }
            .tabViewStyle(.page(indexDisplayMode: .always))
            .indexViewStyle(.page(backgroundDisplayMode: .never))

            Button { advance() } label: {
                Text(page < 2 ? "Continue" : "Begin")
                    .font(BrandFont.bodyBold(17))
                    .foregroundStyle(BrandColor.midnight)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(BrandColor.cream)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
            .disabled(page == 2 && intentionText.trimmingCharacters(in: .whitespaces).isEmpty)
            .opacity(page == 2 && intentionText.trimmingCharacters(in: .whitespaces).isEmpty ? 0.5 : 1)
        }
    }

    private func advance() {
        if page < 2 {
            withAnimation { page += 1 }
        } else {
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

    // MARK: - Pages

    private var welcome: some View {
        VStack(spacing: 28) {
            Spacer()
            CuspMark()
                .frame(width: 96, height: 96)
            VStack(spacing: 12) {
                Text("Cusp")
                    .font(BrandFont.display(48))
                    .foregroundStyle(BrandColor.cream)
                Text("Three steps a day, tuned to the sky.")
                    .font(BrandFont.serif(18))
                    .foregroundStyle(BrandColor.creamMuted)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            Spacer()
        }
    }

    private var birthDateStep: some View {
        VStack(alignment: .leading, spacing: 24) {
            Spacer().frame(height: 40)
            VStack(alignment: .leading, spacing: 8) {
                Text("Born when?")
                    .font(BrandFont.display(36))
                    .foregroundStyle(BrandColor.cream)
                Text("Your sun sign sets the temperature for every ritual.")
                    .font(BrandFont.body(15))
                    .foregroundStyle(BrandColor.creamMuted)
            }
            .padding(.horizontal, 32)

            DatePicker(
                "Birth date",
                selection: $birthDate,
                in: ...Date(),
                displayedComponents: .date
            )
            .datePickerStyle(.wheel)
            .labelsHidden()
            .colorScheme(.dark)
            .padding(.horizontal, 24)

            Spacer()
        }
    }

    private var intentionStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Spacer().frame(height: 40)
            VStack(alignment: .leading, spacing: 8) {
                Text("What are you bringing in?")
                    .font(BrandFont.display(36))
                    .foregroundStyle(BrandColor.cream)
                Text("One sentence. Specific is better than aspirational.")
                    .font(BrandFont.body(15))
                    .foregroundStyle(BrandColor.creamMuted)
            }
            .padding(.horizontal, 32)

            ZStack(alignment: .topLeading) {
                if intentionText.isEmpty {
                    Text("e.g. I want to stop putting off the conversation with my landlord.")
                        .font(BrandFont.serif(17))
                        .italic()
                        .foregroundStyle(BrandColor.creamMuted.opacity(0.55))
                        .padding(.horizontal, 24)
                        .padding(.vertical, 16)
                        .allowsHitTesting(false)
                }
                TextEditor(text: $intentionText)
                    .font(BrandFont.serif(17))
                    .italic()
                    .foregroundStyle(BrandColor.cream)
                    .scrollContentBackground(.hidden)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .colorScheme(.dark)
            }
            .frame(height: 140)
            .background(Color.white.opacity(0.04))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(BrandColor.line, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .padding(.horizontal, 24)

            Spacer()
        }
    }
}

/// Compact logo mark — crescent moon overlaid with a tiny star
struct CuspMark: View {
    var body: some View {
        GeometryReader { geo in
            let s = min(geo.size.width, geo.size.height)
            ZStack {
                Circle()
                    .stroke(BrandColor.gold, lineWidth: s * 0.025)
                    .frame(width: s * 0.84, height: s * 0.84)

                // Crescent (subtract one circle from another)
                CrescentShape()
                    .fill(BrandColor.gold)
                    .frame(width: s * 0.62, height: s * 0.62)
                    .offset(x: -s * 0.04)

                // Small star
                Image(systemName: "sparkle")
                    .font(.system(size: s * 0.13, weight: .regular))
                    .foregroundStyle(BrandColor.cream)
                    .offset(x: s * 0.22, y: -s * 0.18)
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
        .aspectRatio(1, contentMode: .fit)
    }
}

private struct CrescentShape: Shape {
    func path(in rect: CGRect) -> Path {
        let outer = Path(ellipseIn: rect)
        let inset = rect.insetBy(dx: rect.width * 0.10, dy: rect.height * 0.10)
            .offsetBy(dx: rect.width * 0.22, dy: 0)
        let inner = Path(ellipseIn: inset)
        return outer.subtracting(inner)
    }
}

extension Path {
    func subtracting(_ other: Path) -> Path {
        // Even-odd fill rule: combining outer + inner with even-odd works
        var p = Path()
        p.addPath(self)
        p.addPath(other)
        return p
    }
}
