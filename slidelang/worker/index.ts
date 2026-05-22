// Slidelang Worker — /generate and /repair endpoints.
// Calls Claude Opus 4.7 via the Anthropic API.
// Deploy with: bun run worker:deploy (uses wrangler.toml).

interface Env {
  ANTHROPIC_API_KEY: string;
}

const SYSTEM_GENERATE = `You are Slidelang, a deck-as-code generator. The user gives you a prompt; you return a YAML deck spec.

The YAML schema:
- Top-level: meta (title, theme: light|dark) and slides (array)
- Each slide has: id (string), blocks (array)
- Blocks are positioned in PERCENT of the slide (0-100): x, y, w, h
- Block types: text, chart, math, image
- text blocks have: content (string), style (one of: title, subtitle, h1, h2, body, bullets, caption)
- chart blocks have: spec (a Vega-Lite v5 spec)
- math blocks have: latex (string), display (boolean)
- image blocks have: source ({ provider: "unsplash", query } OR { provider: "url", src } OR { provider: "flux", prompt })

Rules:
- Aim for 5-7 slides for a typical prompt
- Block positions must not overflow (x+w <= 100, y+h <= 100)
- Avoid overlapping content blocks (full-bleed image backgrounds are fine)
- Title slides: large title centered around y=40
- For "bullets" style text, use one bullet per line, joined by "\\n"
- Math should use real LaTeX
- Charts should include 3-6 realistic data points

Return ONLY the YAML — no prose, no code fences.`;

const SYSTEM_REPAIR = `You are Slidelang's repair agent. The user gives you a deck block and a validation issue. Return a JSON patch that fixes the issue.

Return format (JSON, no prose):
{ "before": "short description of current state", "after": "short description after fix", "patch": { ...partial block override... } }

The patch is shallow-merged into the existing block. Only return fields that need to change.

Common fixes:
- overflow: tighten text content, or increase h, or shrink font (via style change)
- collision: shrink w/h or move x/y
- contrast: set explicit color (e.g. "#ffffff" for text over images)
- chart: fix spec.data.values or spec.encoding`;

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, GET, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

async function callClaude(env: Env, system: string, user: string, maxTokens = 2048) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-7",
      max_tokens: maxTokens,
      system: [
        { type: "text", text: system, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Anthropic API ${r.status}: ${err}`);
  }
  const data: any = await r.json();
  const text = data.content?.[0]?.text ?? "";
  return text as string;
}

async function handleGenerate(req: Request, env: Env): Promise<Response> {
  const { prompt } = (await req.json()) as { prompt: string };
  if (!prompt) {
    return new Response(JSON.stringify({ error: "missing prompt" }), {
      status: 400,
      headers: { "content-type": "application/json", ...corsHeaders() },
    });
  }
  const yaml = await callClaude(env, SYSTEM_GENERATE, prompt, 4096);
  // Strip any accidental code fences.
  const cleaned = yaml
    .replace(/^```ya?ml\s*\n?/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return new Response(JSON.stringify({ yaml: cleaned }), {
    headers: { "content-type": "application/json", ...corsHeaders() },
  });
}

async function handleRepair(req: Request, env: Env): Promise<Response> {
  const { issue, block } = (await req.json()) as { issue: any; block: any };
  const user = `Block:\n${JSON.stringify(block, null, 2)}\n\nIssue:\n${JSON.stringify(issue, null, 2)}`;
  const raw = await callClaude(env, SYSTEM_REPAIR, user, 800);
  // Strip code fences if present, then parse JSON.
  let cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  let parsed: any;
  try { parsed = JSON.parse(cleaned); } catch {
    parsed = { before: "(unparseable)", after: "(unparseable)", patch: {} };
  }
  return new Response(JSON.stringify(parsed), {
    headers: { "content-type": "application/json", ...corsHeaders() },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    try {
      if (url.pathname === "/generate" && req.method === "POST")
        return await handleGenerate(req, env);
      if (url.pathname === "/repair" && req.method === "POST")
        return await handleRepair(req, env);
      if (url.pathname === "/" || url.pathname === "/health")
        return new Response("slidelang worker ok", { headers: corsHeaders() });
      return new Response("not found", { status: 404, headers: corsHeaders() });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders() },
      });
    }
  },
};
