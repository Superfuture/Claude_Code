import { useEffect, useRef } from "react";
import type { TSlide, TDeck } from "../spec/schema";
import { BlockRenderer } from "../compiler/renderers";
import type { Issue } from "../validator/validate";
import { validateOverflow } from "../validator/validate";

interface SlideViewProps {
  slide: TSlide;
  deck: TDeck;
  issues: Issue[];
  onOverflow?: (issues: Issue[]) => void;
  onPillClick?: (issue: Issue) => void;
}

export function SlideView({ slide, deck, issues, onOverflow, onPillClick }: SlideViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !onOverflow) return;
    let raf = 0;
    const measure = () => {
      if (!ref.current) return;
      const fresh = validateOverflow(ref.current, slide);
      onOverflow(fresh);
    };
    // Two-pass: once after layout, once after fonts settle.
    raf = requestAnimationFrame(() => {
      measure();
      setTimeout(measure, 250);
    });
    return () => cancelAnimationFrame(raf);
  }, [slide, onOverflow]);

  const myIssues = issues.filter((i) => i.slideId === slide.id);

  return (
    <div className="slide-canvas" data-theme={deck.meta.theme} ref={ref}>
      {slide.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} />
      ))}
      {myIssues.map((issue, i) => {
        const blockId =
          issue.kind === "collision" ? issue.aId :
          (issue as any).blockId;
        const block = slide.blocks.find((b) => b.id === blockId);
        if (!block) return null;
        const label =
          issue.kind === "overflow" ? "Overflow" :
          issue.kind === "collision" ? "Overlap" :
          issue.kind === "contrast" ? "Contrast" : "Chart";
        return (
          <button
            key={i}
            className="repair-pill"
            style={{ left: `${block.x}%`, top: `${block.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              onPillClick?.(issue);
            }}
            title={issue.message}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
