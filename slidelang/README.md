# Slidelang

A hosted deck-as-code authoring platform. Humans and AI agents collaborate on a typed YAML deck spec that compiles into editable, validatable, presentable slides — with a layout validator and one-click AI auto-repair.

## Running locally

```bash
bun install
bun run dev       # → http://localhost:5173
```

## Worker (AI endpoints)

Without a Worker deployed, AI generate/repair run in a mock mode that uses canned content. For real Claude Opus 4.7 calls:

```bash
bunx wrangler login
bunx wrangler secret put ANTHROPIC_API_KEY
bun run worker:deploy
```

Then point the frontend at the Worker:

```bash
echo 'VITE_API_BASE=https://slidelang.<your-subdomain>.workers.dev' > .env.production
bun run build
```

## Architecture

- `src/spec/` — Zod schema + JSON Schema for AI structured output
- `src/compiler/` — `yaml → typed deck → React vDOM` (isomorphic)
- `src/validator/` — overflow, collision, contrast, chart-sanity rules
- `src/editor/` — Monaco editor, live preview, repair pills, present mode
- `src/ai/` — generate + repair clients (mocked offline)
- `src/share/` — base64+deflate share URLs (no backend required)
- `worker/` — Cloudflare Worker calling Anthropic API with prompt caching

## Build

```bash
bun run build
# dist/ is a static site, deployable to Cloudflare Pages or GitHub Pages
```
