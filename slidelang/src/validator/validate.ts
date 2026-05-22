import type { TDeck, TBlock, TSlide } from "../spec/schema";

export type Issue =
  | {
      kind: "overflow";
      slideId: string;
      blockId: string;
      measured: number;
      bound: number;
      message: string;
    }
  | {
      kind: "collision";
      slideId: string;
      aId: string;
      bId: string;
      overlapPct: number;
      message: string;
    }
  | {
      kind: "contrast";
      slideId: string;
      blockId: string;
      ratio: number;
      required: number;
      message: string;
    }
  | {
      kind: "chart";
      slideId: string;
      blockId: string;
      reason: string;
      message: string;
    };

// --- collisions (geometric, deck-pure) ---
function overlapPct(a: TBlock, b: TBlock): number {
  const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const inter = ix * iy;
  if (inter <= 0) return 0;
  // Don't flag image backgrounds (full-bleed) overlapping with content blocks.
  const aIsBg = a.type === "image" && a.w >= 95 && a.h >= 95;
  const bIsBg = b.type === "image" && b.w >= 95 && b.h >= 95;
  if (aIsBg || bIsBg) return 0;
  const smaller = Math.min(a.w * a.h, b.w * b.h);
  return inter / smaller;
}

function collisionIssues(slide: TSlide): Issue[] {
  const out: Issue[] = [];
  for (let i = 0; i < slide.blocks.length; i++) {
    for (let j = i + 1; j < slide.blocks.length; j++) {
      const a = slide.blocks[i];
      const b = slide.blocks[j];
      const o = overlapPct(a, b);
      if (o > 0.15) {
        out.push({
          kind: "collision",
          slideId: slide.id,
          aId: a.id!,
          bId: b.id!,
          overlapPct: o,
          message: `Blocks overlap by ${Math.round(o * 100)}%`,
        });
      }
    }
  }
  return out;
}

// --- chart sanity ---
function chartIssues(slide: TSlide): Issue[] {
  const out: Issue[] = [];
  slide.blocks.forEach((b) => {
    if (b.type !== "chart") return;
    const spec = b.spec ?? {};
    const data = spec.data?.values;
    const encoding = spec.encoding;
    if (!Array.isArray(data) || data.length === 0) {
      out.push({
        kind: "chart",
        slideId: slide.id,
        blockId: b.id!,
        reason: "no-data",
        message: "Chart has no data values",
      });
      return;
    }
    if (!encoding) {
      out.push({
        kind: "chart",
        slideId: slide.id,
        blockId: b.id!,
        reason: "no-encoding",
        message: "Chart missing encoding",
      });
      return;
    }
    // verify that referenced fields exist in data
    const sampleKeys = new Set(Object.keys(data[0] ?? {}));
    Object.entries(encoding).forEach(([_, val]: [string, any]) => {
      if (val?.field && !sampleKeys.has(val.field)) {
        out.push({
          kind: "chart",
          slideId: slide.id,
          blockId: b.id!,
          reason: `missing-field:${val.field}`,
          message: `Encoding references field "${val.field}" that doesn't exist in data`,
        });
      }
    });
  });
  return out;
}

// Geometric (pure) pass.
export function validateGeometry(deck: TDeck): Issue[] {
  const out: Issue[] = [];
  deck.slides.forEach((slide) => {
    out.push(...collisionIssues(slide));
    out.push(...chartIssues(slide));
  });
  return out;
}

// --- overflow (needs DOM) ---
// Measures rendered text height vs block height. Run after mount.
export function validateOverflow(slideEl: HTMLElement, slide: TSlide): Issue[] {
  const out: Issue[] = [];
  slide.blocks.forEach((b) => {
    if (b.type !== "text") return;
    const el = slideEl.querySelector<HTMLElement>(`[data-block-id="${b.id}"]`);
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (!inner) return;
    const measured = inner.scrollHeight;
    const bound = el.clientHeight;
    if (measured > bound + 2) {
      out.push({
        kind: "overflow",
        slideId: slide.id,
        blockId: b.id!,
        measured,
        bound,
        message: `Text overflows by ${measured - bound}px`,
      });
    }
  });
  return out;
}

// --- contrast (deck-pure best effort, no image sampling) ---
function relLuminance(hex: string): number {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(fg: string, bg: string): number {
  const L1 = relLuminance(fg);
  const L2 = relLuminance(bg);
  const [a, b] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (b + 0.05);
}

export function validateContrast(deck: TDeck): Issue[] {
  const out: Issue[] = [];
  const themeBg = deck.meta.theme === "dark" ? "#131210" : "#ffffff";
  deck.slides.forEach((slide) => {
    // If a slide has a full-bleed image, contrast against light defaults is risky.
    const hasFullImage = slide.blocks.some(
      (b) => b.type === "image" && b.w >= 95 && b.h >= 95
    );
    slide.blocks.forEach((b) => {
      if (b.type !== "text") return;
      const fg = b.color ?? (deck.meta.theme === "dark" ? "#f6f1e5" : "#1f1e1d");
      if (hasFullImage && !b.color) {
        out.push({
          kind: "contrast",
          slideId: slide.id,
          blockId: b.id!,
          ratio: 0,
          required: 4.5,
          message: "Text over full-bleed image without explicit color — readability risk",
        });
        return;
      }
      try {
        const ratio = contrastRatio(fg, themeBg);
        if (ratio < 4.5) {
          out.push({
            kind: "contrast",
            slideId: slide.id,
            blockId: b.id!,
            ratio,
            required: 4.5,
            message: `Contrast ${ratio.toFixed(2)}:1 fails WCAG AA (4.5:1)`,
          });
        }
      } catch {
        /* color parse failure — skip */
      }
    });
  });
  return out;
}

// Combine all passes. The live preview also runs validateOverflow after layout.
export function validate(deck: TDeck): Issue[] {
  return [...validateGeometry(deck), ...validateContrast(deck)];
}
