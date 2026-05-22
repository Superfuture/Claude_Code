import type { Issue } from "../validator/validate";
import type { TBlock } from "../spec/schema";
import { SYSTEM_GENERATE, SYSTEM_REPAIR } from "./prompts";
import { getAnthropicKey, getModel } from "./key";

// Endpoint base. Override via Vite env or window for prod deploy.
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (typeof window !== "undefined" && (window as any).SLIDELANG_API_BASE) ||
  "";

export interface GenerateResult {
  ok: boolean;
  yaml?: string;
  error?: string;
  source?: "worker" | "browser" | "mock";
}

export interface RepairSuggestion {
  before: string;
  after: string;
  patch: any;
}

// ---------------- public API ----------------

export async function generateDeck(prompt: string): Promise<GenerateResult> {
  // 1. Worker path
  if (API_BASE) {
    try {
      const r = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (r.ok) {
        const data = await r.json();
        return { ok: true, yaml: data.yaml, source: "worker" };
      }
      return { ok: false, error: `Worker error ${r.status}`, source: "worker" };
    } catch (e: any) {
      return { ok: false, error: e.message ?? "network error", source: "worker" };
    }
  }

  // 2. Browser-direct with stored API key
  const key = getAnthropicKey();
  if (key) {
    try {
      const text = await callClaudeBrowser(key, SYSTEM_GENERATE, prompt, 4096);
      const cleaned = text
        .replace(/^```ya?ml\s*\n?/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      return { ok: true, yaml: cleaned, source: "browser" };
    } catch (e: any) {
      return { ok: false, error: e.message ?? "Anthropic API error", source: "browser" };
    }
  }

  // 3. Offline mock
  return { ...mockGenerate(prompt), source: "mock" };
}

export async function repairIssue(issue: Issue, block: TBlock): Promise<RepairSuggestion | null> {
  if (API_BASE) {
    try {
      const r = await fetch(`${API_BASE}/repair`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ issue, block }),
      });
      if (r.ok) return await r.json();
    } catch { /* fall through */ }
  }

  const key = getAnthropicKey();
  if (key) {
    try {
      const user = `Block:\n${JSON.stringify(block, null, 2)}\n\nIssue:\n${JSON.stringify(issue, null, 2)}`;
      const text = await callClaudeBrowser(key, SYSTEM_REPAIR, user, 800);
      const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      return JSON.parse(cleaned);
    } catch {
      /* fall back to mock */
    }
  }

  return mockRepair(issue, block);
}

// ---------------- browser-direct call ----------------

async function callClaudeBrowser(
  apiKey: string,
  system: string,
  user: string,
  maxTokens: number
): Promise<string> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: getModel(),
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!r.ok) {
    let detail = "";
    try {
      const j = await r.json();
      detail = j?.error?.message || JSON.stringify(j);
    } catch {
      detail = await r.text();
    }
    throw new Error(`Anthropic ${r.status}: ${detail}`);
  }
  const data = await r.json();
  return data.content?.[0]?.text ?? "";
}

// ---------------- mocks (work offline / no key) ----------------

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
    return { before: `h: ${block.h}`, after: `h: ${newH}`, patch: { h: newH } };
  }
  if (issue.kind === "collision") {
    const newW = Math.max(20, block.w - 4);
    return { before: `w: ${block.w}`, after: `w: ${newW}`, patch: { w: newW } };
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
  const p = prompt.toLowerCase();
  if (p.includes("transformer") || p.includes("attention")) {
    return { ok: true, yaml: TRANSFORMERS_YAML };
  }
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
        content: "Add an Anthropic API key to enable real generation"
        style: title
      - type: text
        x: 8
        y: 60
        w: 84
        h: 8
        content: "Click \\"Set API key\\" in the top bar"
        style: subtitle

  - id: bullets
    blocks:
      - type: text
        x: 6
        y: 6
        w: 88
        h: 10
        content: "How it works"
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
