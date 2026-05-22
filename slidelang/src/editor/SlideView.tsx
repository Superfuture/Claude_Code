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
  onPillClick?: (issue: Issue, anchor: { x: number; y: number }) => void;
}

function getBlockId(issue: Issue): string {
  return issue.kind === "collision" ? issue.aId : (issue as any).blockId;
}

// Anti-collision for pills. Stagger pills that would overlap.
function pillPositions(slide: TSlide, issues: Issue[]) {
  const seen = new Map<string, number>(); // blockId → count
  return issues.map((iss) => {
    const blockId = getBlockId(iss);
    const block = slide.blocks.find((b) => b.id === blockId);
    if (!block) return null;
    const count = seen.get(blockId) ?? 0;
    seen.set(blockId, count + 1);
    return {
      issue: iss,
      blockId,
      block,
      // Stack pills vertically when multiple are on the same block.
      offsetY: count * 22,
    };
  }).filter(Boolean) as Array<{ issue: Issue; blockId: string; block: any; offsetY: number }>;
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
    raf = requestAnimationFrame(() => {
      measure();
      setTimeout(measure, 250);
    });
    return () => cancelAnimationFrame(raf);
  }, [slide, onOverflow]);

  const myIssues = issues.filter((i) => i.slideId === slide.id);
  const pills = pillPositions(slide, myIssues);

  return (
    <div className="slide-canvas" data-theme={deck.meta.theme} ref={ref}>
      {slide.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} />
      ))}
      {pills.map((p, i) => {
        const label =
          p.issue.kind === "overflow" ? "Overflow" :
          p.issue.kind === "collision" ? "Overlap" :
          p.issue.kind === "contrast" ? "Contrast" : "Chart";
        return (
          <button
            key={`${p.blockId}-${i}`}
            className="repair-pill"
            style={{
              left: `${p.block.x}%`,
              top: `${p.block.y}%`,
              transform: `translate(-6px, calc(-10px + ${p.offsetY}px))`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const containerRect = (e.currentTarget.offsetParent as HTMLElement)?.getBoundingClientRect();
              const x = r.left - (containerRect?.left ?? 0) + r.width;
              const y = r.top - (containerRect?.top ?? 0) + r.height + 4;
              onPillClick?.(p.issue, { x, y });
            }}
            title={p.issue.message}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
