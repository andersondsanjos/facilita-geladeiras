const allowedEvents = new Set([
  'PageView',
  'ViewContent',
  'InitiateCheckout',
  'tosa_scroll_depth',
  'tosa_cta_click',
]);

const readBody = (body) => {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
};

const safeCustomData = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([, item]) => ['string', 'number', 'boolean'].includes(typeof item))
    .map(([key, item]) => [key.slice(0, 80), typeof item === 'string' ? item.slice(0, 500) : item]));
};

module.exports = async (request, response) => {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'method_not_allowed' });
  }

  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID || '1105034049175942';
  const body = readBody(request.body);

  if (!token) return response.status(503).json({ error: 'capi_not_configured' });
  if (!body || !allowedEvents.has(body.event_name) || typeof body.event_id !== 'string') {
    return response.status(400).json({ error: 'invalid_event' });
  }

  const forwardedFor = request.headers['x-forwarded-for'];
  const clientIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim();
  const userData = {
    client_ip_address: clientIp || request.socket?.remoteAddress,
    client_user_agent: request.headers['user-agent'],
  };
  if (typeof body.fbp === 'string') userData.fbp = body.fbp.slice(0, 500);
  if (typeof body.fbc === 'string') userData.fbc = body.fbc.slice(0, 500);

  const event = {
    event_name: body.event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.event_id.slice(0, 100),
    action_source: 'website',
    event_source_url: typeof body.event_source_url === 'string' ? body.event_source_url.slice(0, 2048) : undefined,
    user_data: userData,
    custom_data: safeCustomData(body.custom_data),
  };

  try {
    const metaResponse = await fetch(`https://graph.facebook.com/v24.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event] }),
    });

    if (!metaResponse.ok) {
      console.error('Meta CAPI rejected event', { status: metaResponse.status, eventName: event.event_name });
      return response.status(502).json({ error: 'meta_event_rejected' });
    }

    return response.status(202).json({ received: true, event_name: event.event_name });
  } catch (error) {
    console.error('Meta CAPI request failed', { eventName: event.event_name, message: error.message });
    return response.status(502).json({ error: 'meta_event_unavailable' });
  }
};
