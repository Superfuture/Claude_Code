import UIKit
import SwiftUI

/// Custom keyboard entry point. Hosts the SwiftUI Ditto keyboard and bridges
/// text insertion + keyboard switching to the system.
final class KeyboardViewController: UIInputViewController {

    private var viewModel: DittoViewModel!
    private var hostingController: UIHostingController<KeyboardView>!
    private var heightConstraint: NSLayoutConstraint?

    override func viewDidLoad() {
        super.viewDidLoad()

        viewModel = DittoViewModel(
            insertText: { [weak self] text in
                self?.textDocumentProxy.insertText(text)
            }
        )

        let rootView = KeyboardView(
            viewModel: viewModel,
            hasFullAccess: hasFullAccess,
            needsGlobe: needsInputModeSwitchKey,
            onGlobe: { [weak self] in self?.advanceToNextInputMode() },
            onSpace: { [weak self] in self?.textDocumentProxy.insertText(" ") },
            onBackspace: { [weak self] in self?.textDocumentProxy.deleteBackward() },
            onReturn: { [weak self] in self?.textDocumentProxy.insertText("\n") },
            readDraft: { [weak self] in self?.textDocumentProxy.documentContextBeforeInput },
            onClearDraft: { [weak self] in self?.clearTypedText() },
            onUpgrade: { [weak self] in self?.openFromKeyboard("ditto://upgrade") },
            onOpenSettings: { [weak self] in self?.openFromKeyboard("app-settings:") }
        )
        let host = UIHostingController(rootView: rootView)
        hostingController = host

        // Flush brand background: paint the controller + host views paper so no
        // system-gray chrome shows around the SwiftUI content.
        let paper = UIColor(BrandColor.paper)
        view.backgroundColor = paper
        inputView?.backgroundColor = paper

        addChild(host)
        host.view.translatesAutoresizingMaskIntoConstraints = false
        host.view.backgroundColor = paper
        view.addSubview(host.view)
        NSLayoutConstraint.activate([
            host.view.topAnchor.constraint(equalTo: view.topAnchor),
            host.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            host.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            host.view.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        host.didMove(toParent: self)
    }

    /// Opens a URL from the keyboard (the containing app via ditto://, or the
    /// app's Settings page via app-settings:). Keyboard extensions can't call
    /// UIApplication.open directly, so walk the responder chain to the host.
    private func openFromKeyboard(_ urlString: String) {
        guard let url = URL(string: urlString) else { return }
        let selector = sel_registerName("openURL:")
        var responder: UIResponder? = self
        while let r = responder {
            if r.responds(to: selector), !(r is UIInputViewController) {
                r.perform(selector, with: url)
                return
            }
            responder = r.next
        }
    }

    /// Deletes whatever the user already typed in the field, so a rewritten
    /// draft replaces the original instead of appending to it.
    private func clearTypedText() {
        var guardCounter = 0
        while let before = textDocumentProxy.documentContextBeforeInput,
              !before.isEmpty, guardCounter < 60 {
            for _ in before { textDocumentProxy.deleteBackward() }
            guardCounter += 1
        }
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if heightConstraint == nil {
            let c = view.heightAnchor.constraint(equalToConstant: 344)
            c.priority = .init(999)
            c.isActive = true
            heightConstraint = c
        }
    }
}
