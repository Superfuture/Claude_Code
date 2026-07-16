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

const MAX_FREE_PER_DAY = 10;

// Joey's simulator device ids: bypass the daily cap for testing.
const TESTER_IDS = new Set([
  "D4EE3BE4-B9D0-4B61-AD6C-F441332FE415",
  "7FEC6446-2765-4CA8-BC4C-CDFE28068A11",
]);
const ANTHROPIC_MODEL = "claude-sonnet-4-6";

// Pro check via the RevenueCat REST API. The app user id is the shared
// device_id. Fails closed (not pro) when RC_SECRET isn't configured.
async function isPro(env, appUserId) {
  if (!appUserId || !env.RC_SECRET) return false;
  try {
    const r = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
      headers: { Authorization: `Bearer ${env.RC_SECRET}` },
    });
    if (!r.ok) return false;
    const d = await r.json();
    const ent = d.subscriber?.entitlements?.pro;
    if (!ent) return false;
    return ent.expires_date == null || new Date(ent.expires_date) > new Date();
  } catch { return false; }
}

// Usage event → Superfuture Command Center. anonId = device_id, so dashboard
// users line up 1:1 with app installs. Fire-and-forget, never blocks a reply.
function track(ctx, event, anonId, props) {
  const p = fetch("https://superfuture-metrics.pages.dev/api/ingest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ app: "Ditto", event, anonId, ...(props ? { props } : {}) }),
  }).catch(() => {});
  ctx?.waitUntil?.(p);
}

export default {
  /** @param {Request} request @param {Env} env @param {ExecutionContext} ctx */
  async fetch(request, env, ctx) {
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

    const { context, tone, device_id, is_thread, is_draft } = body || {};
    if (typeof context !== "string" || !context.trim()) {
      return cors(json({ error: "missing_context" }, 400));
    }
    if (!["smart", "funny", "flirty", "formal", "supportive"].includes(tone)) {
      return cors(json({ error: "invalid_tone" }, 400));
    }
    if (typeof device_id !== "string" || device_id.length < 8) {
      return cors(json({ error: "missing_device_id" }, 400));
    }

    // Rate limit (skip if no KV binding configured). Pro subscribers bypass:
    // device_id doubles as the RevenueCat app user id, verified server-side
    // when RC_SECRET is configured.
    if (env.RATELIMIT && !TESTER_IDS.has(device_id)) {
      const key = `usage:${device_id}:${todayUTC()}`;
      const current = parseInt((await env.RATELIMIT.get(key)) || "0", 10);
      if (current >= MAX_FREE_PER_DAY && !(await isPro(env, device_id))) {
        return cors(json({ error: "rate_limited" }, 429));
      }
      await env.RATELIMIT.put(key, String(current + 1), {
        expirationTtl: 60 * 60 * 36,
      });
    }

    // Build Anthropic request with prompt caching on the system block.
    // Draft mode skips the few-shots: they are reply examples and bias the
    // model into replying to the draft instead of rewriting it.
    const messages = [
      ...(is_draft === true ? [] : FEW_SHOTS_BY_TONE[tone]),
      { role: "user", content: is_draft === true ? draftTurn(context, tone)
                              : is_thread === true ? threadTurn(context, tone)
                              : userTurn(context, tone) },
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

    track(ctx, "replies_generated", device_id, {
      tone,
      mode: is_draft === true ? "draft" : is_thread === true ? "thread" : "message",
    });
    return cors(json({ suggestions }));
  },
};

// ---------- helpers ----------

function userTurn(context, tone) {
  const ask = tone === "smart"
    ? "Reply with the 3 best natural reply options that the user could send, the way a thoughtful friend would text back"
    : `Reply with 3 short ${tone} reply options that the user could send`;
  return `Incoming message: """${context}"""

${ask}. Return strict JSON in the form { "suggestions": ["...", "...", "..."] } and nothing else.`;
}

// OCR'd conversation from a screenshot: "You:" lines were sent by the user,
// "Them:" lines were received. Reply as "You" to the latest message.
function threadTurn(context, tone) {
  const style = tone === "smart"
    ? "the 3 best natural replies, the way a thoughtful friend would text back"
    : `3 short ${tone} replies`;
  return `Conversation from the user's screenshot. Lines marked "You:" are messages the user sent; "Them:" are messages the user received. OCR may include minor artifacts; ignore anything that isn't conversation.

"""${context}"""

Considering the whole conversation, write ${style} that the user ("You") could send next in response to the most recent message from "Them". If the text is unclear or mostly OCR artifacts, still return 3 short friendly replies that would work in most conversations. Never comment on the input, the OCR, or ask for a re-upload; your entire output must be sendable replies. Return strict JSON in the form { "suggestions": ["...", "...", "..."] } and nothing else.`;
}

// The user typed a rough draft reply; rewrite it, don't reply to it.
function draftTurn(context, tone) {
  const style = tone === "smart"
    ? "clearer, more natural, more confident"
    : `more ${tone}`;
  return `The user typed this draft reply in a chat:

"""${context}"""

Rewrite the draft as 3 improved versions the user could send instead: ${style}, keeping the user's intent and roughly similar length, sounding like a real person texting. Do not reply to the draft; rewrite it. Return strict JSON in the form { "suggestions": ["...", "...", "..."] } and nothing else.`;
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
