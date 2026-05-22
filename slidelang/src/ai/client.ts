import type { Issue } from "../validator/validate";
import type { TBlock } from "../spec/schema";

// Endpoint base. Override via Vite env or window for prod deploy.
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (window as any).SLIDELANG_API_BASE ||
  "";

export interface GenerateResult {
  ok: boolean;
  yaml?: string;
  error?: string;
}

export async function generateDeck(prompt: string): Promise<GenerateResult> {
  if (!API_BASE) {
    // Offline mock — used when no Worker is deployed.
    return mockGenerate(prompt);
  }
  try {
    const r = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!r.ok) return { ok: false, error: `Server error ${r.status}` };
    const data = await r.json();
    return { ok: true, yaml: data.yaml };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "network error" };
  }
}

export interface RepairSuggestion {
  before: string;
  after: string;
  patch: any; // block partial that overrides
}

export async function repairIssue(
  issue: Issue,
  block: TBlock
): Promise<RepairSuggestion | null> {
  if (!API_BASE) {
    return mockRepair(issue, block);
  }
  try {
    const r = await fetch(`${API_BASE}/repair`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ issue, block }),
    });
    if (!r.ok) return mockRepair(issue, block);
    return await r.json();
  } catch {
    return mockRepair(issue, block);
  }
}

// --- mocks (work offline / on static deploy) ---

function mockRepair(issue: Issue, block: TBlock): RepairSuggestion {
  if (issue.kind === "overflow" && block.type === "text") {
    const content = block.content;
    const trimmed = content
      .split(/\n+/)
      .slice(0, Math.max(1, Math.ceil(content.split(/\n+/).length * 0.7)))
      .join("\n");
    const short = trimmed.length > 240 ? trimmed.slice(0, 230).trim() + "…" : trimmed;
    return {
      before: content.slice(0, 60) + (content.length > 60 ? "…" : ""),
      after: short.slice(0, 60) + (short.length > 60 ? "…" : ""),
      patch: { content: short },
    };
  }
  if (issue.kind === "collision" && block.type === "text") {
    const newH = Math.max(8, block.h - 6);
    return {
      before: `h: ${block.h}`,
      after: `h: ${newH}`,
      patch: { h: newH },
    };
  }
  if (issue.kind === "collision") {
    const newW = Math.max(20, block.w - 4);
    return {
      before: `w: ${block.w}`,
      after: `w: ${newW}`,
      patch: { w: newW },
    };
  }
  if (issue.kind === "contrast" && block.type === "text") {
    return {
      before: `color: ${block.color ?? "(default)"}`,
      after: `color: "#ffffff"`,
      patch: { color: "#ffffff" },
    };
  }
  if (issue.kind === "chart") {
    return {
      before: "spec.data.values: []",
      after: "spec.data.values: [{...sample...}]",
      patch: {
        spec: {
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          data: { values: [{ x: "A", y: 1 }, { x: "B", y: 2 }, { x: "C", y: 3 }] },
          mark: "bar",
          encoding: {
            x: { field: "x", type: "nominal" },
            y: { field: "y", type: "quantitative" },
          },
        },
      },
    };
  }
  return { before: "—", after: "—", patch: {} };
}

function mockGenerate(prompt: string): GenerateResult {
  // Honor a few keywords so the demo still shows variety without a backend.
  const p = prompt.toLowerCase();
  if (p.includes("transformer") || p.includes("attention")) {
    return { ok: true, yaml: TRANSFORMERS_YAML };
  }
  // Default: return the Q3 board update for any business prompt.
  return { ok: true, yaml: Q3_FALLBACK };
}

const Q3_FALLBACK = `meta:
  title: Generated Deck
  theme: light

slides:
  - id: title
    blocks:
      - type: text
        x: 8
        y: 38
        w: 84
        h: 18
        content: "Generated from your prompt"
        style: title
      - type: text
        x: 8
        y: 60
        w: 84
        h: 8
        content: "Deploy a Worker with ANTHROPIC_API_KEY to enable real AI generation"
        style: subtitle

  - id: bullets
    blocks:
      - type: text
        x: 6
        y: 6
        w: 88
        h: 10
        content: "Key points"
        style: h1
      - type: text
        x: 6
        y: 22
        w: 88
        h: 70
        content: "• Strict typed YAML deck spec\\n• Deterministic compiler to editable HTML\\n• DOM-measured validator catches overflow / overlap / contrast\\n• One-click AI repair returns a YAML patch"
        style: bullets
`;

const TRANSFORMERS_YAML = `meta:
  title: Intro to Transformers
  theme: light

slides:
  - id: title
    blocks:
      - type: text
        x: 8
        y: 38
        w: 84
        h: 18
        content: "Intro to Transformers"
        style: title
      - type: text
        x: 8
        y: 60
        w: 84
        h: 8
        content: "Attention is all you need"
        style: subtitle

  - id: attention
    blocks:
      - type: text
        x: 6
        y: 6
        w: 88
        h: 10
        content: "Scaled Dot-Product Attention"
        style: h1
      - type: math
        x: 10
        y: 30
        w: 80
        h: 30
        latex: "\\\\text{Attention}(Q,K,V) = \\\\text{softmax}\\\\left(\\\\frac{QK^T}{\\\\sqrt{d_k}}\\\\right)V"
        display: true
      - type: text
        x: 10
        y: 64
        w: 80
        h: 26
        content: "Query/Key dot-products are scaled by √d_k, softmaxed to attention weights, then used to mix Values."
        style: body
`;
