import { useEffect, useState } from "react";
import type { TDeck } from "../spec/schema";
import { SlideView } from "./SlideView";

interface PresentModeProps {
  deck: TDeck;
  onClose: () => void;
}

export function PresentMode({ deck, onClose }: PresentModeProps) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === " ")
        setI((n) => Math.min(deck.slides.length - 1, n + 1));
      else if (e.key === "ArrowLeft")
        setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck.slides.length, onClose]);

  return (
    <div className="present-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full h-full flex items-center justify-center">
        <SlideView slide={deck.slides[i]} deck={deck} issues={[]} />
      </div>
      <div className="present-hint absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs font-mono pointer-events-auto">
        {i + 1} / {deck.slides.length} · ← → · Esc to exit
      </div>
    </div>
  );
}
