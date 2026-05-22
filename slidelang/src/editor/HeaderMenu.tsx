import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface MenuItem {
  label: string;
  shortcut?: string;
  onClick: () => void;
  destructive?: boolean;
  divider?: boolean;
}

export function HeaderMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + 6,
      right: window.innerWidth - r.right,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
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
      {open && pos && createPortal(
        <div
          ref={menuRef}
          className="fixed bg-bg-surface border border-rule rounded-xl py-1.5 min-w-[220px]"
          style={{
            top: pos.top,
            right: pos.right,
            zIndex: 1000,
            boxShadow: "0 24px 60px -20px rgba(0,0,0,0.25), 0 2px 6px -2px rgba(0,0,0,0.08)",
          }}
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
                  <span className="text-ink-3 font-mono text-[11px] ml-4">{item.shortcut}</span>
                )}
              </button>
            )
          )}
        </div>,
        document.body
      )}
    </>
  );
}
