// Cloudflare Pages Function: POST /api/subscribe
// Inserts an email into the `subscribers` table on Supabase via REST.
//
// Required environment variables (set in Cloudflare Pages dashboard):
//   SUPABASE_URL       e.g. https://abcdef.supabase.co
//   SUPABASE_ANON_KEY  the anon (public) key from Supabase
//
// Table schema lives in /supabase.sql — run that once in your Supabase SQL editor.

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ error: 'Backend not configured' }, 500);
  }

  let payload: { email?: string; source?: string };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const email = (payload.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email' }, 400);
  }

  const source = (payload.source || 'aeon-landing').slice(0, 64);

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify([{ email, source }]),
  });

  if (!res.ok) {
    const detail = await res.text();
    return json({ error: 'Supabase rejected request', detail }, 502);
  }

  return json({ ok: true });
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
