import { z } from "zod";

// Position is in % of slide. The renderer and validator agree on this geometry.
const Position = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  w: z.number().min(0).max(100),
  h: z.number().min(0).max(100),
});

const TextStyle = z.enum(["title", "subtitle", "h1", "h2", "body", "bullets", "caption"]);

const TextBlock = Position.extend({
  type: z.literal("text"),
  id: z.string().optional(),
  content: z.string(),
  style: TextStyle.default("body"),
  align: z.enum(["left", "center", "right"]).default("left"),
  color: z.string().optional(),
});

const ChartBlock = Position.extend({
  type: z.literal("chart"),
  id: z.string().optional(),
  // Vega-Lite spec (loose typing — we re-validate at render time)
  spec: z.any(),
});

const MathBlock = Position.extend({
  type: z.literal("math"),
  id: z.string().optional(),
  latex: z.string(),
  display: z.boolean().default(true),
});

const ImageBlock = Position.extend({
  type: z.literal("image"),
  id: z.string().optional(),
  source: z.union([
    z.object({ provider: z.literal("url"), src: z.string() }),
    z.object({ provider: z.literal("unsplash"), query: z.string() }),
    z.object({ provider: z.literal("flux"), prompt: z.string() }),
  ]),
  alt: z.string().optional(),
  fit: z.enum(["cover", "contain"]).default("cover"),
});

export const Block = z.discriminatedUnion("type", [TextBlock, ChartBlock, MathBlock, ImageBlock]);

export const Slide = z.object({
  id: z.string(),
  background: z.string().optional(),
  blocks: z.array(Block),
});

export const Deck = z.object({
  meta: z.object({
    title: z.string(),
    theme: z.enum(["light", "dark"]).default("light"),
    size: z
      .object({ w: z.number(), h: z.number() })
      .default({ w: 1280, h: 720 }),
  }),
  slides: z.array(Slide),
});

export type TBlock = z.infer<typeof Block>;
export type TSlide = z.infer<typeof Slide>;
export type TDeck = z.infer<typeof Deck>;

// JSON Schema for AI structured output — emitted to the model.
// Hand-authored so it stays small + readable in prompts.
export const deckJsonSchema = {
  type: "object",
  required: ["meta", "slides"],
  properties: {
    meta: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        theme: { enum: ["light", "dark"] },
        size: {
          type: "object",
          properties: { w: { type: "number" }, h: { type: "number" } },
        },
      },
    },
    slides: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "blocks"],
        properties: {
          id: { type: "string" },
          blocks: {
            type: "array",
            items: {
              oneOf: [
                {
                  type: "object",
                  required: ["type", "x", "y", "w", "h", "content"],
                  properties: {
                    type: { const: "text" },
                    x: { type: "number" }, y: { type: "number" },
                    w: { type: "number" }, h: { type: "number" },
                    content: { type: "string" },
                    style: { enum: ["title", "subtitle", "h1", "h2", "body", "bullets", "caption"] },
                  },
                },
                {
                  type: "object",
                  required: ["type", "x", "y", "w", "h", "spec"],
                  properties: {
                    type: { const: "chart" },
                    x: { type: "number" }, y: { type: "number" },
                    w: { type: "number" }, h: { type: "number" },
                    spec: { type: "object" },
                  },
                },
                {
                  type: "object",
                  required: ["type", "x", "y", "w", "h", "latex"],
                  properties: {
                    type: { const: "math" },
                    x: { type: "number" }, y: { type: "number" },
                    w: { type: "number" }, h: { type: "number" },
                    latex: { type: "string" },
                    display: { type: "boolean" },
                  },
                },
                {
                  type: "object",
                  required: ["type", "x", "y", "w", "h", "source"],
                  properties: {
                    type: { const: "image" },
                    x: { type: "number" }, y: { type: "number" },
                    w: { type: "number" }, h: { type: "number" },
                    source: { type: "object" },
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
} as const;
