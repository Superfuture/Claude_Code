// Cloudflare Worker for Cusp.
// POST /v1/ritual with { intention, birth: { year, month, day }, device_id }
// Returns one ritual as strict JSON.

import { SYSTEM_PROMPT, FEW_SHOT_EXAMPLE, buildUserTurn } from "./prompts.js";
import { sunSign, todayContext } from "./astrology.js";

const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const MAX_FREE_PER_DAY = 1; // Free tier: one ritual per day

export default {
  /** @param {Request} request @param {Env} env */
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
    if (url.pathname !== "/v1/ritual") return cors(new Response("Not found", { status: 404 }));
    if (request.method !== "POST") return cors(new Response("Method not allowed", { status: 405 }));

    let body;
    try {
      body = await request.json();
    } catch {
      return cors(json({ error: "invalid_json" }, 400));
    }

    const { intention, birth, device_id, is_pro } = body || {};
    if (typeof intention !== "string" || !intention.trim()) {
      return cors(json({ error: "missing_intention" }, 400));
    }
    if (!birth || !Number.isInteger(birth.year) || !Number.isInteger(birth.month) || !Number.isInteger(birth.day)) {
      return cors(json({ error: "missing_birth_data" }, 400));
    }
    if (typeof device_id !== "string" || device_id.length < 8) {
      return cors(json({ error: "missing_device_id" }, 400));
    }

    // Rate limit free users (1 ritual/day)
    if (env.RATELIMIT && !is_pro) {
      const key = `cusp:${device_id}:${todayUTC()}`;
      const current = parseInt((await env.RATELIMIT.get(key)) || "0", 10);
      if (current >= MAX_FREE_PER_DAY) {
        return cors(json({ error: "daily_limit", message: "You've used today's ritual. Upgrade to Cusp Pro for unlimited rituals." }, 429));
      }
      await env.RATELIMIT.put(key, String(current + 1), { expirationTtl: 60 * 60 * 30 });
    }

    const userSunSign = sunSign(birth.year, birth.month, birth.day).name;
    const ctx = { ...todayContext(new Date()), userSunSign };

    const messages = [
      ...FEW_SHOT_EXAMPLE,
      { role: "user", content: buildUserTurn(intention, ctx) },
    ];

    const anthropicReq = {
      model: ANTHROPIC_MODEL,
      max_tokens: 800,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
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
    const ritual = parseRitual(text);
    if (!ritual) {
      return cors(json({ error: "parse_error" }, 502));
    }

    return cors(json({ ritual, context: ctx }));
  },
};

// ---------- helpers ----------

function parseRitual(text) {
  const cleaned = text.replace(/```json\s*|```/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    if (
      obj?.title && obj?.intro && Array.isArray(obj?.steps) && obj.steps.length === 3 && obj?.close
    ) {
      return obj;
    }
  } catch { /* fall through */ }
  return null;
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
