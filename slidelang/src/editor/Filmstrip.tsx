import type { TDeck } from "../spec/schema";
import type { Issue } from "../validator/validate";
import { BlockRenderer } from "../compiler/renderers";

interface FilmstripProps {
  deck: TDeck;
  active: number;
  issues: Issue[];
  onSelect: (i: number) => void;
  generating?: boolean;
  expectedSlides?: number;
}

function getSlideLabel(slide: any, i: number): string {
  // Try to find a title-style text block, else use id.
  for (const b of slide.blocks ?? []) {
    if (b.type === "text" && (b.style === "title" || b.style === "h1")) {
      return b.content.split(/\n/)[0].slice(0, 32);
    }
  }
  return slide.id || `Slide ${i + 1}`;
}

export function Filmstrip({ deck, active, issues, onSelect, generating, expectedSlides }: FilmstripProps) {
  const skeletons = generating && expectedSlides
    ? Math.max(0, expectedSlides - deck.slides.length)
    : 0;

  return (
    <div className="flex flex-col gap-2 p-3 overflow-y-auto h-full">
      {deck.slides.map((slide, i) => {
        const slideIssues = issues.filter((iss) => iss.slideId === slide.id);
        const label = getSlideLabel(slide, i);
        return (
          <div key={slide.id} className="flex flex-col gap-1 group">
            <button
              className="filmstrip-thumb"
              data-active={active === i}
              data-theme={deck.meta.theme}
              onClick={() => onSelect(i)}
              style={{ background: deck.meta.theme === "dark" ? "#131210" : "#fff" }}
              title={label}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "scale(0.23)",
                  transformOrigin: "0 0",
                  width: "435%",
                  height: "435%",
                  pointerEvents: "none",
                }}
              >
                {slide.blocks.map((b) => (
                  <BlockRenderer key={b.id} block={b} />
                ))}
              </div>
              <div className="absolute top-1 left-1 bg-black/55 text-white text-[10px] font-semibold rounded px-1.5 py-0.5 leading-none">
                {i + 1}
              </div>
              {slideIssues.length > 0 && (
                <div
                  className="absolute top-1 right-1 bg-[#b04a3a] text-white text-[10px] font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center"
                  title={`${slideIssues.length} issue${slideIssues.length > 1 ? "s" : ""}`}
                >
                  {slideIssues.length}
                </div>
              )}
            </button>
            <div
              className="text-[11px] text-ink-3 px-0.5 truncate group-hover:text-ink transition-colors"
              data-active={active === i}
              style={{ color: active === i ? "#1f1e1d" : undefined, fontWeight: active === i ? 500 : 400 }}
            >
              {label}
            </div>
          </div>
        );
      })}

      {Array.from({ length: skeletons }).map((_, i) => (
        <div key={`sk-${i}`} className="flex flex-col gap-1">
          <div className="filmstrip-thumb skeleton" />
          <div className="h-3 rounded bg-rule/60 skeleton-bar" />
        </div>
      ))}
    </div>
  );
}
