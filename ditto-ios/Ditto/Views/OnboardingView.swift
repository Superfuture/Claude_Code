import SwiftUI

struct OnboardingView: View {
    let onFinish: () -> Void

    @State private var page = 0

    var body: some View {
        ZStack {
            BrandColor.cream.ignoresSafeArea()

            VStack {
                TabView(selection: $page) {
                    welcomePage.tag(0)
                    howItWorksPage.tag(1)
                    privacyPage.tag(2)
                    enablePage.tag(3)
                }
                .tabViewStyle(.page(indexDisplayMode: .always))
                .indexViewStyle(.page(backgroundDisplayMode: .never))

                Button {
                    if page < 3 {
                        withAnimation { page += 1 }
                    } else {
                        onFinish()
                    }
                } label: {
                    Text(page < 3 ? "Continue" : "Open Ditto")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(.white)
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

    private var welcomePage: some View {
        VStack(spacing: 24) {
            Spacer()
            DittoLogo().frame(width: 96, height: 96)
            Text("Welcome to Ditto")
                .font(.custom("Fraunces-Italic", size: 36))
                .italic()
            Text("Three perfect replies, right inside iMessage.")
                .font(.system(size: 17))
                .foregroundStyle(BrandColor.inkSoft)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    private var howItWorksPage: some View {
        VStack(alignment: .leading, spacing: 24) {
            title("How it works")
            ForEach(howSteps, id: \.title) { step in
                bullet(step.num, step.title, step.body)
            }
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    private var privacyPage: some View {
        VStack(alignment: .leading, spacing: 20) {
            title("Privacy first")
            Text("Your messages are processed in‑memory by the AI and forgotten. We don't store, sell, share, or train on anything you send.")
                .font(.system(size: 16))
                .foregroundStyle(BrandColor.inkSoft)
            Text("Full privacy policy on ditto.app/privacy")
                .font(.system(size: 13, design: .monospaced))
                .foregroundStyle(BrandColor.inkMuted)
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    private var enablePage: some View {
        VStack(alignment: .leading, spacing: 20) {
            title("One last step")
            Text("To use Ditto inside iMessage, open Messages, tap the App Store icon in the bottom row, and pick Ditto. You can also long‑press the icon to keep it in your favorites.")
                .font(.system(size: 16))
                .foregroundStyle(BrandColor.inkSoft)
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    private func title(_ s: String) -> some View {
        Text(s)
            .font(.custom("Fraunces-Italic", size: 32))
            .italic()
            .padding(.top, 64)
    }

    private func bullet(_ num: String, _ heading: String, _ body: String) -> some View {
        HStack(alignment: .top, spacing: 14) {
            Text(num)
                .font(.custom("Fraunces-Italic", size: 16))
                .italic()
                .foregroundStyle(.white)
                .frame(width: 28, height: 28)
                .background(Circle().fill(BrandColor.persimmon))
            VStack(alignment: .leading, spacing: 4) {
                Text(heading).font(.system(size: 16, weight: .semibold))
                Text(body).font(.system(size: 14)).foregroundStyle(BrandColor.inkSoft)
            }
        }
    }

    private struct Step { let num, title, body: String }
    private var howSteps: [Step] {
        [
            .init(num: "1", title: "Pick a tone",
                  body: "Funny, flirty, formal, or supportive."),
            .init(num: "2", title: "Pick a reply",
                  body: "Three suggestions, every time."),
            .init(num: "3", title: "Tap to insert",
                  body: "Edit before you hit send.")
        ]
    }
}
