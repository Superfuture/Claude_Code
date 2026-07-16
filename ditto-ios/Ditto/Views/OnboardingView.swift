import SwiftUI

struct OnboardingView: View {
    let onFinish: () -> Void

    @State private var page = 0
    private let pageCount = 4

    var body: some View {
        ZStack {
            BrandColor.cream.ignoresSafeArea()

            VStack(spacing: 0) {
                TabView(selection: $page) {
                    welcomePage.tag(0)
                    howItWorksPage.tag(1)
                    privacyPage.tag(2)
                    enablePage.tag(3)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))

                dots
                    .padding(.bottom, 20)

                Button {
                    if page < pageCount - 1 {
                        withAnimation(.spring(duration: 0.4)) { page += 1 }
                    } else {
                        onFinish()
                    }
                } label: {
                    Text(page < pageCount - 1 ? "Continue" : "Open Ditto")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(BrandColor.inkInverse)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(BrandColor.ink)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
        }
    }

    // MARK: - Carousel dots

    private var dots: some View {
        HStack(spacing: 7) {
            ForEach(0..<pageCount, id: \.self) { i in
                Capsule()
                    .fill(i == page ? BrandColor.persimmon : BrandColor.ink.opacity(0.15))
                    .frame(width: i == page ? 24 : 7, height: 7)
            }
        }
        .animation(.spring(duration: 0.35), value: page)
    }

    // MARK: - Page 1: Welcome

    private var welcomePage: some View {
        VStack(spacing: 0) {
            Spacer()
            DittoLogo().frame(width: 120, height: 120)
            Text("Welcome to Ditto")
                .font(.brandSerif(38))
                .foregroundStyle(BrandColor.ink)
                .padding(.top, 24)
            Text("Three perfect replies,\nright inside iMessage.")
                .font(.system(size: 17))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)
                .lineSpacing(3)
                .padding(.top, 12)
            HStack(spacing: 8) {
                toneChip("😄", "Funny", selected: true)
                toneChip("😏", "Flirty", selected: false)
                toneChip("🎩", "Formal", selected: false)
            }
            .padding(.top, 28)
            Spacer()
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    private func toneChip(_ emoji: String, _ label: String, selected: Bool) -> some View {
        HStack(spacing: 5) {
            Text(emoji).font(.system(size: 13))
            Text(label).font(.system(size: 13, weight: .medium))
        }
        .padding(.horizontal, 13)
        .padding(.vertical, 8)
        .background(Capsule().fill(selected ? BrandColor.ink : BrandColor.paperLight))
        .foregroundStyle(selected ? BrandColor.inkInverse : BrandColor.inkSoft)
        .overlay(
            Capsule().stroke(BrandColor.line, lineWidth: 1)
                .opacity(selected ? 0 : 1)
        )
    }

    // MARK: - Page 2: How it works

    private var howItWorksPage: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("How it works")
                .font(.brandSerif(32))
                .foregroundStyle(BrandColor.ink)
                .padding(.top, 40)
                .padding(.bottom, 6)

            stepCard("1", "Pick a tone", "Funny, flirty, formal, or supportive.") {
                HStack(spacing: 6) {
                    miniChip("😄 Funny", selected: true)
                    miniChip("😏 Flirty", selected: false)
                    miniChip("🎩 Formal", selected: false)
                }
            }

            stepCard("2", "Pick a reply", "Three suggestions, every time.") {
                VStack(alignment: .leading, spacing: 5) {
                    miniReplyBar(width: 150, highlighted: false)
                    miniReplyBar(width: 180, highlighted: true)
                    miniReplyBar(width: 120, highlighted: false)
                }
            }

            stepCard("3", "Tap to insert", "Edit before you hit send.") {
                HStack(spacing: 8) {
                    Text("Say less. On my way 🏃")
                        .font(.system(size: 12))
                        .foregroundStyle(BrandColor.inkSoft)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(Capsule().fill(BrandColor.paper))
                        .overlay(Capsule().stroke(BrandColor.line, lineWidth: 1))
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(BrandColor.persimmon)
                }
            }

            Spacer()
        }
        .padding(.horizontal, 28)
    }

    private func stepCard<Content: View>(
        _ num: String, _ heading: String, _ body: String,
        @ViewBuilder illustration: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Text(num)
                    .font(.brandSerif(15, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(width: 26, height: 26)
                    .background(Circle().fill(BrandColor.persimmon))
                Text(heading)
                    .font(.brandSerif(18, weight: .bold))
                    .foregroundStyle(BrandColor.ink)
            }
            Text(body)
                .font(.system(size: 14))
                .foregroundStyle(BrandColor.inkSoft)
            illustration()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(BrandColor.paperLight)
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .overlay(
            RoundedRectangle(cornerRadius: 18)
                .stroke(BrandColor.line, lineWidth: 1)
        )
    }

    private func miniChip(_ label: String, selected: Bool) -> some View {
        Text(label)
            .font(.system(size: 11, weight: .medium))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Capsule().fill(selected ? BrandColor.ink : BrandColor.paper))
            .foregroundStyle(selected ? BrandColor.inkInverse : BrandColor.inkSoft)
            .overlay(
                Capsule().stroke(BrandColor.line, lineWidth: 1)
                    .opacity(selected ? 0 : 1)
            )
    }

    private func miniReplyBar(width: CGFloat, highlighted: Bool) -> some View {
        RoundedRectangle(cornerRadius: 7)
            .fill(highlighted ? BrandColor.persimmon.opacity(0.25) : BrandColor.creamDeep)
            .frame(width: width, height: 14)
            .overlay(
                RoundedRectangle(cornerRadius: 7)
                    .stroke(BrandColor.persimmon, lineWidth: highlighted ? 1.5 : 0)
            )
    }

    // MARK: - Page 3: Privacy

    private var privacyPage: some View {
        VStack(spacing: 0) {
            Spacer()
            ZStack {
                Circle()
                    .fill(BrandColor.creamDeep)
                    .frame(width: 110, height: 110)
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(BrandColor.persimmon)
                Text("✶")
                    .font(.system(size: 22))
                    .foregroundStyle(BrandColor.persimmon)
                    .offset(x: 58, y: -44)
                Text("✶")
                    .font(.system(size: 14))
                    .foregroundStyle(BrandColor.inkMuted)
                    .offset(x: -60, y: 38)
            }
            Text("Privacy first")
                .font(.brandSerif(34))
                .foregroundStyle(BrandColor.ink)
                .padding(.top, 28)
            Text("Your messages are processed in memory and forgotten. We don't store, sell, share, or train on anything you send.")
                .font(.system(size: 16))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .padding(.top, 12)
            Text("policies.superfuturelabs.com/ditto/privacy")
                .font(.system(size: 11, design: .monospaced))
                .foregroundStyle(BrandColor.inkMuted)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Capsule().fill(BrandColor.paperLight))
                .overlay(Capsule().stroke(BrandColor.line, lineWidth: 1))
                .padding(.top, 20)
            Spacer()
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    // MARK: - Page 4: One last step

    private var enablePage: some View {
        VStack(spacing: 0) {
            Spacer()

            // Mini conversation illustration
            VStack(spacing: 8) {
                HStack {
                    Text("dinner tonight? 🍝")
                        .font(.system(size: 14))
                        .foregroundStyle(BrandColor.inkSoft)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(BubbleShape(fromMe: false).fill(BrandColor.creamDeep))
                    Spacer(minLength: 40)
                }
                HStack {
                    Spacer(minLength: 40)
                    Text("Say less. I'll bring dessert 🍰")
                        .font(.system(size: 14))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(BubbleShape(fromMe: true).fill(BrandColor.persimmon))
                }
                HStack(spacing: 6) {
                    Spacer()
                    DittoLogo().frame(width: 16, height: 16)
                    Text("written by Ditto")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(BrandColor.inkMuted)
                }
            }
            .padding(16)
            .background(BrandColor.paperLight)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(BrandColor.line, lineWidth: 1)
            )

            Text("One last step")
                .font(.brandSerif(34))
                .foregroundStyle(BrandColor.ink)
                .padding(.top, 28)

            VStack(alignment: .leading, spacing: 12) {
                enableRow(icon: "message.fill", text: "Open Messages and pick a conversation")
                enableRow(icon: "plus.circle.fill", text: "Tap the plus, then Apps")
                HStack(spacing: 10) {
                    DittoLogo().frame(width: 22, height: 22)
                    Text("Choose Ditto and get replies")
                        .font(.system(size: 15))
                        .foregroundStyle(BrandColor.inkSoft)
                }
            }
            .padding(.top, 16)

            Spacer()
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    private func enableRow(icon: String, text: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(BrandColor.persimmon)
                .frame(width: 22)
            Text(text)
                .font(.system(size: 15))
                .foregroundStyle(BrandColor.inkSoft)
        }
    }
}

/// A message bubble with a rounded rect body and a small tail on the bottom
/// corner (left for received, right for sent).
private struct BubbleShape: Shape {
    let fromMe: Bool

    func path(in rect: CGRect) -> Path {
        // union (not subpaths): a tail subpath wound opposite to the rect
        // cancels under the nonzero fill rule and renders as a hole.
        let body = Path(roundedRect: rect, cornerRadius: 14)
        let tailX = fromMe ? rect.maxX - 8 : rect.minX + 8
        let tipX = fromMe ? rect.maxX + 3 : rect.minX - 3
        var tail = Path()
        tail.move(to: CGPoint(x: tailX - 6, y: rect.maxY - 12))
        tail.addLine(to: CGPoint(x: tipX, y: rect.maxY))
        tail.addLine(to: CGPoint(x: tailX + 6, y: rect.maxY - 12))
        tail.closeSubpath()
        return body.union(tail)
    }
}
