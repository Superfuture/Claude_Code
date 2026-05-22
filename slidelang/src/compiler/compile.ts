import YAML from "yaml";
import { Deck, type TDeck } from "../spec/schema";

export interface CompileOk {
  ok: true;
  deck: TDeck;
}
export interface CompileErr {
  ok: false;
  errors: { message: string; line?: number; path?: string }[];
}
export type CompileResult = CompileOk | CompileErr;

export function compile(yamlSource: string): CompileResult {
  let parsed: unknown;
  try {
    parsed = YAML.parse(yamlSource);
  } catch (e: any) {
    return {
      ok: false,
      errors: [{ message: e.message ?? "YAML parse error", line: e?.linePos?.[0]?.line }],
    };
  }
  const result = Deck.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map((i) => ({
        message: i.message,
        path: i.path.join("."),
      })),
    };
  }

  // Auto-assign block IDs for stable validator anchoring.
  const deck = result.data;
  deck.slides.forEach((s, si) => {
    s.blocks.forEach((b, bi) => {
      if (!b.id) b.id = `${s.id}-b${bi}`;
    });
  });
  return { ok: true, deck };
}
