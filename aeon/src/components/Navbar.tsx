import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

interface Props {
  onCta: () => void;
}

const LINKS = [
  { label: 'Mission', href: '#capabilities' },
  { label: 'Approach', href: '#capabilities' },
  { label: 'Updates', href: '#subscribe' },
];

export function Navbar({ onCta }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="absolute top-4 left-0 right-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <a href="#" className="liquid-glass w-12 h-12 flex items-center justify-center rounded-full">
          <span className="font-heading italic text-white text-2xl leading-none">a</span>
        </a>

        <div className="hidden md:flex items-center liquid-glass rounded-full p-1.5 gap-0.5">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="px-3 py-2 text-sm font-medium text-white/90 font-body">
              {l.label}
            </a>
          ))}
          <button
            onClick={onCta}
            className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium font-body whitespace-nowrap inline-flex items-center gap-1 ml-1"
          >
            Join the Mission <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="md:hidden liquid-glass w-12 h-12 flex items-center justify-center rounded-full"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md md:hidden">
          <div className="absolute top-4 right-6">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="liquid-glass w-12 h-12 flex items-center justify-center rounded-full"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          <nav className="h-full flex flex-col items-center justify-center gap-8 px-6">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-heading italic text-white text-5xl"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onCta();
              }}
              className="mt-4 bg-white text-black rounded-full px-6 py-3 text-base font-medium font-body inline-flex items-center gap-2"
            >
              Join the Mission <ArrowUpRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
