// Hash-encoded share URLs. No backend needed — the deck is in the URL.
// For long decks we use deflate-raw (browser-native CompressionStream).

async function compress(input: string): Promise<Uint8Array> {
  const enc = new TextEncoder().encode(input);
  if (typeof CompressionStream === "undefined") return enc;
  const cs = new CompressionStream("deflate-raw");
  const blob = new Blob([enc as BlobPart]);
  const stream = new Response(blob.stream().pipeThrough(cs));
  return new Uint8Array(await stream.arrayBuffer());
}

async function decompress(bytes: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === "undefined") return new TextDecoder().decode(bytes);
  const ds = new DecompressionStream("deflate-raw");
  const blob = new Blob([bytes as BlobPart]);
  const stream = new Response(blob.stream().pipeThrough(ds));
  return await stream.text();
}

function bytesToB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64UrlToBytes(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encodeDeckToHash(yaml: string): Promise<string> {
  const bytes = await compress(yaml);
  return "d=" + bytesToB64Url(bytes);
}

export async function decodeDeckFromHash(hash: string): Promise<string | null> {
  const h = hash.replace(/^#/, "");
  const m = h.match(/d=([^&]+)/);
  if (!m) return null;
  try {
    return await decompress(b64UrlToBytes(m[1]));
  } catch {
    return null;
  }
}

export async function buildShareUrl(yaml: string): Promise<string> {
  const hash = await encodeDeckToHash(yaml);
  const url = new URL(window.location.href);
  url.hash = hash;
  return url.toString();
}
