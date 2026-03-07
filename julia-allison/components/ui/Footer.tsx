import Link from "next/link";

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const footerLinks = [
  { href: "#about", label: "About" },
  { href: "#press", label: "Press" },
  { href: "#speaking", label: "Speaking" },
  { href: "#book", label: "Contact" },
];

const socialLinks = [
  { href: "https://instagram.com/juliaallison", label: "Instagram", Icon: InstagramIcon },
  { href: "https://twitter.com/juliaallison", label: "X / Twitter", Icon: TwitterIcon },
  { href: "https://linkedin.com/in/juliaallison", label: "LinkedIn", Icon: LinkedInIcon },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-black/5">
      {/* Gradient top rule */}
      <div className="h-px bg-gradient-brand" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {/* Brand */}
          <div>
            <Link href="/" className="font-serif text-xl font-semibold text-ink">
              Julia Allison
            </Link>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed max-w-xs">
              Media personality, journalist, and speaker based in New York.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-light mb-4">
              Navigate
            </p>
            <ul className="flex flex-wrap md:flex-col gap-3 md:gap-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-ink-muted hover:text-ink transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + email */}
          <div className="md:text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-light mb-4">
              Connect
            </p>
            <div className="flex gap-4 md:justify-end mb-4">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-ink-light hover:text-ink transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
            <a
              href="mailto:hello@juliaallison.com"
              className="text-sm text-teal hover:text-teal-dark transition-colors"
            >
              hello@juliaallison.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-ink-light">
            © {new Date().getFullYear()} Julia Allison. All rights reserved.
          </p>
          <a
            href="/privacy"
            className="text-xs text-ink-light hover:text-ink-muted transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
