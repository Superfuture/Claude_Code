import type { TDeck } from "../spec/schema";
import type { Issue } from "../validator/validate";
import { BlockRenderer } from "../compiler/renderers";

interface FilmstripProps {
  deck: TDeck;
  active: number;
  issues: Issue[];
  onSelect: (i: number) => void;
}

export function Filmstrip({ deck, active, issues, onSelect }: FilmstripProps) {
  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto h-full">
      {deck.slides.map((slide, i) => {
        const slideIssues = issues.filter((iss) => iss.slideId === slide.id);
        return (
          <div key={slide.id} className="flex flex-col gap-1">
            <button
              className="filmstrip-thumb"
              data-active={active === i}
              data-theme={deck.meta.theme}
              onClick={() => onSelect(i)}
              style={{ background: deck.meta.theme === "dark" ? "#131210" : "#fff" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "scale(0.18)",
                  transformOrigin: "0 0",
                  width: "555%",
                  height: "555%",
                  pointerEvents: "none",
                }}
              >
                {slide.blocks.map((b) => (
                  <BlockRenderer key={b.id} block={b} />
                ))}
              </div>
              {slideIssues.length > 0 && (
                <div
                  className="absolute top-1 right-1 bg-[#b04a3a] text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center"
                  title={`${slideIssues.length} issue${slideIssues.length > 1 ? "s" : ""}`}
                >
                  {slideIssues.length}
                </div>
              )}
            </button>
            <div className="text-[10px] text-ink-3 px-1 truncate">
              {i + 1}. {slide.id}
            </div>
          </div>
        );
      })}
    </div>
  );
}
