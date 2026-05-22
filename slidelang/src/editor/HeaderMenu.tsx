import { useEffect, useRef, useState } from "react";

interface MenuItem {
  label: string;
  shortcut?: string;
  onClick: () => void;
  destructive?: boolean;
  divider?: boolean;
}

export function HeaderMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-ghost"
        title="More actions"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-[110%] z-50 bg-bg-surface border border-rule rounded-xl shadow-2xl py-1.5 min-w-[200px]"
          style={{ boxShadow: "0 24px 60px -20px rgba(0,0,0,0.25)" }}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="h-px bg-rule my-1.5" />
            ) : (
              <button
                key={i}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center justify-between hover:bg-bg-surface-2 transition-colors ${
                  item.destructive ? "text-[#b04a3a]" : "text-ink"
                }`}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-ink-3 font-mono text-[11px]">{item.shortcut}</span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
