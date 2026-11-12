import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const allowedEvents = new Set(['PageView', 'ViewContent', 'InitiateCheckout', 'scroll_depth']);
const types = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
function reply(res, status, data) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); }
async function bodyOf(req) { let data = ''; for await (const chunk of req) { data += chunk; if (data.length > 65536) throw new Error('payload_too_large'); } return JSON.parse(data || '{}'); }
async function metaEvent(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'method_not_allowed' });
  const token = process.env.META_CAPI_ACCESS_TOKEN || process.env.META_CAPI_TOKEN;
  const pixelId = process.env.META_PIXEL_ID;
  if (!token || !pixelId) return reply(res, 503, { error: 'capi_not_configured' });
  try {
    const body = await bodyOf(req); const eventName = body.event_name || body.eventName; const eventId = body.event_id || body.eventId;
    if (!allowedEvents.has(eventName) || typeof eventId !== 'string') return reply(res, 400, { error: 'invalid_event' });
    const forwarded = req.headers['x-forwarded-for']; const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim();
    const event = { event_name: eventName, event_time: Math.floor(Date.now() / 1000), event_id: eventId.slice(0, 100), action_source: 'website', event_source_url: String(body.event_source_url || body.eventSourceUrl || '').slice(0, 2048), user_data: { client_ip_address: ip || req.socket.remoteAddress, client_user_agent: req.headers['user-agent'], ...(body.fbp ? { fbp: String(body.fbp).slice(0, 500) } : {}), ...(body.fbc ? { fbc: String(body.fbc).slice(0, 500) } : {}) }, custom_data: body.custom_data || body.customData || {} };
    const response = await fetch(`https://graph.facebook.com/v24.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: [event] }) });
    return response.ok ? reply(res, 202, { received: true }) : reply(res, 502, { error: 'meta_event_rejected' });
  } catch { return reply(res, 502, { error: 'meta_event_unavailable' }); }
}
async function staticFile(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname); const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''); const requested = path.resolve(root, relative);
  if (!requested.startsWith(root + path.sep) && requested !== path.join(root, 'index.html')) return reply(res, 403, { error: 'forbidden' });
  try { const info = await stat(requested); if (!info.isFile()) throw new Error('not_file'); const extension = path.extname(requested).toLowerCase(); res.writeHead(200, { 'content-type': types[extension] || 'application/octet-stream', 'cache-control': extension === '.html' ? 'no-cache' : 'public, max-age=3600' }); res.end(await readFile(requested)); } catch { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Página não encontrada'); }
}
process.on('uncaughtException', error => console.error('uncaught_exception', error));
process.on('unhandledRejection', error => console.error('unhandled_rejection', error));
http.createServer((req, res) => req.url?.startsWith('/api/meta-events') ? metaEvent(req, res) : staticFile(req, res)).listen(port, () => console.log(`server_listening:${port}`));
