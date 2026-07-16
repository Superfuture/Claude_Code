import SwiftUI

struct SettingsView: View {
    @State private var defaultTone: Tone = AppGroupStore.shared.lastTone

    var body: some View {
        Form {
            Section("Default tone") {
                Picker("Tone", selection: $defaultTone) {
                    ForEach(Tone.allCases) { tone in
                        Label("\(tone.emoji) \(tone.label)", systemImage: "")
                            .tag(tone)
                    }
                }
                .pickerStyle(.inline)
                .labelsHidden()
            }
            .onChange(of: defaultTone) { _, new in
                AppGroupStore.shared.lastTone = new
            }

            Section("About") {
                LabeledContent("Version", value: appVersion)
                Link("Privacy Policy", destination: URL(string: "https://policies.superfuturelabs.com/ditto/privacy")!)
                Link("Terms of Use (EULA)", destination: URL(string: "https://policies.superfuturelabs.com/ditto/terms")!)
                Link("Support", destination: URL(string: "https://policies.superfuturelabs.com/ditto/support")!)
            }
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var appVersion: String {
        let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "—"
        let b = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? ""
        return b.isEmpty ? v : "\(v) (\(b))"
    }
}
