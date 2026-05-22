// Resolves image block sources to actual URLs.
// - url: pass-through
// - unsplash/flux: use Unsplash API if a key is configured, otherwise picsum.photos with a deterministic seed.

import { getUnsplashKey } from "./key";

type Source =
  | { provider: "url"; src: string }
  | { provider: "unsplash"; query: string }
  | { provider: "flux"; prompt: string };

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return h >>> 0;
}

function picsumUrl(seedStr: string): string {
  const seed = djb2(seedStr).toString(36);
  return `https://picsum.photos/seed/${seed}/1600/900`;
}

// In-memory cache so we don't re-query Unsplash on every re-render.
const cache = new Map<string, string>();

async function unsplashSearch(query: string, key: string): Promise<string | null> {
  const k = `u:${query}`;
  if (cache.has(k)) return cache.get(k)!;
  try {
    const r = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (!r.ok) return null;
    const data = await r.json();
    const url = data.results?.[0]?.urls?.regular ?? data.results?.[0]?.urls?.full;
    if (url) cache.set(k, url);
    return url ?? null;
  } catch {
    return null;
  }
}

export async function resolveImageSrc(source: Source): Promise<string> {
  if (source.provider === "url") return source.src;
  const query = source.provider === "unsplash" ? source.query : source.prompt;
  const key = getUnsplashKey();
  if (key) {
    const u = await unsplashSearch(query, key);
    if (u) return u;
  }
  return picsumUrl(query);
}
