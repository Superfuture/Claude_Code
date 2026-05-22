const KEY = "slidelang.anthropic_key";
const MODEL_KEY = "slidelang.model";
const UNSPLASH_KEY = "slidelang.unsplash_key";

export function getAnthropicKey(): string {
  try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; }
}

export function setAnthropicKey(k: string) {
  try {
    if (k.trim()) localStorage.setItem(KEY, k.trim());
    else localStorage.removeItem(KEY);
  } catch {}
}

export function getModel(): string {
  try { return localStorage.getItem(MODEL_KEY) || "claude-opus-4-7"; } catch { return "claude-opus-4-7"; }
}

export function setModel(m: string) {
  try { localStorage.setItem(MODEL_KEY, m); } catch {}
}

export function getUnsplashKey(): string {
  try { return localStorage.getItem(UNSPLASH_KEY) ?? ""; } catch { return ""; }
}

export function setUnsplashKey(k: string) {
  try {
    if (k.trim()) localStorage.setItem(UNSPLASH_KEY, k.trim());
    else localStorage.removeItem(UNSPLASH_KEY);
  } catch {}
}

export const MODEL_CHOICES: { id: string; label: string }[] = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7 (best)" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (fast)" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (fastest)" },
];
