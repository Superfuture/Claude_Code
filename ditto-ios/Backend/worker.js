// Cloudflare Worker proxy for the Ditto iMessage extension.
//
// Responsibilities:
//   1. Hide the Anthropic API key from the app binary
//   2. Validate the request shape
//   3. Enforce per-device rate limiting (Workers KV)
//   4. Call Anthropic Claude Sonnet 4.6 with a cached system prompt
//   5. Return strict JSON to the client
//
// Deploy with: `npx wrangler deploy` (after `wrangler secret put ANTHROPIC_API_KEY`).

import { SYSTEM_PROMPT, FEW_SHOTS_BY_TONE } from "./prompts.js";

const MAX_FREE_PER_DAY = 5;
const ANTHROPIC_MODEL = "claude-sonnet-4-6";

export default {
  /** @param {Request} request @param {Env} env */
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS for testing in browser; iOS app doesn't need it
    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }));
    }

    if (url.pathname !== "/v1/suggest") {
      return cors(new Response("Not found", { status: 404 }));
    }
    if (request.method !== "POST") {
      return cors(new Response("Method not allowed", { status: 405 }));
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return cors(json({ error: "invalid_json" }, 400));
    }

    const { context, tone, device_id } = body || {};
    if (typeof context !== "string" || !context.trim()) {
      return cors(json({ error: "missing_context" }, 400));
    }
    if (!["funny", "flirty", "formal", "supportive"].includes(tone)) {
      return cors(json({ error: "invalid_tone" }, 400));
    }
    if (typeof device_id !== "string" || device_id.length < 8) {
      return cors(json({ error: "missing_device_id" }, 400));
    }

    // Rate limit (skip if no KV binding configured)
    if (env.RATELIMIT) {
      const key = `usage:${device_id}:${todayUTC()}`;
      const current = parseInt((await env.RATELIMIT.get(key)) || "0", 10);
      if (current >= MAX_FREE_PER_DAY) {
        return cors(json({ error: "rate_limited" }, 429));
      }
      await env.RATELIMIT.put(key, String(current + 1), {
        expirationTtl: 60 * 60 * 36,
      });
    }

    // Build Anthropic request with prompt caching on the system block.
    const messages = [
      ...FEW_SHOTS_BY_TONE[tone],
      { role: "user", content: userTurn(context, tone) },
    ];

    const anthropicReq = {
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" }, // 90% discount on repeat
        },
      ],
      messages,
    };

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(anthropicReq),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Anthropic error:", resp.status, errText);
      return cors(json({ error: "upstream_error" }, 502));
    }

    const data = await resp.json();
    const text = data?.content?.[0]?.text || "";
    const suggestions = parseSuggestions(text);

    if (suggestions.length === 0) {
      return cors(json({ error: "no_suggestions" }, 502));
    }

    return cors(json({ suggestions }));
  },
};

// ---------- helpers ----------

function userTurn(context, tone) {
  return `Incoming message: """${context}"""

Reply with 3 short ${tone} reply options that the user could send. Return strict JSON in the form { "suggestions": ["...", "...", "..."] } and nothing else.`;
}

function parseSuggestions(text) {
  // Strip code fences if model wraps in them
  const cleaned = text.replace(/```json\s*|```/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    if (Array.isArray(obj?.suggestions)) {
      return obj.suggestions.filter((s) => typeof s === "string").slice(0, 3);
    }
  } catch {
    // Fall through
  }
  // Salvage: split lines as a last resort
  return cleaned
    .split(/\n+/)
    .map((l) => l.replace(/^[\d\.\)\-\s"]+/, "").replace(/[",]+$/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function cors(response) {
  const r = new Response(response.body, response);
  r.headers.set("Access-Control-Allow-Origin", "*");
  r.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  r.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return r;
}
