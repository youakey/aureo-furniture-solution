const MAX_BODY_BYTES = 12000;
const LEAD_PATH = '/api/lead';

function reply(ok, status) {
  return Response.json({ ok }, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function readLead(request) {
  const reader = request.body?.getReader();
  if (!reader) return null;

  const decoder = new TextDecoder();
  let body = '';
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
  return JSON.parse(body + decoder.decode());
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== LEAD_PATH) return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return reply(false, 405);
    if (request.headers.get('Origin') !== url.origin) return reply(false, 403);
    const contentType = request.headers.get('Content-Type')?.split(';')[0].trim();
    if (contentType !== 'application/json') return reply(false, 415);

    const lead = await readLead(request).catch(() => null);
    if (!lead || typeof lead !== 'object') return reply(false, 400);
    const { name, email, phone, message } = lead;
    if (
      typeof name !== 'string' || !name.trim() || name.length > 100 ||
      typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof phone !== 'string' || !/^\+1\d{10}$/.test(phone) ||
      typeof message !== 'string' || !message.trim() || message.length > 2000
    ) return reply(false, 400);

    try {
      const response = await env.LEADS.fetch('https://aureo-leads.zerocppscript.workers.dev/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: url.origin },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const result = await response.json();
      return response.ok && result?.ok === true ? reply(true, 200) : reply(false, 502);
    } catch {
      return reply(false, 502);
    }
  },
};
