const META_GRAPH_VERSION = 'v24.0';

function readCookie(cookieHeader = '', name) {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function getRequestBody(request) {
  if (typeof request.body === 'string') return JSON.parse(request.body || '{}');
  return request.body || {};
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;
  if (!pixelId || !accessToken) {
    return response.status(204).end();
  }

  try {
    const body = getRequestBody(request);
    const allowedEvents = new Set(['PageView', 'InitiateCheckout']);
    if (!allowedEvents.has(body.eventName) || !body.eventId) {
      return response.status(400).json({ error: 'Invalid event' });
    }

    const forwarded = request.headers['x-forwarded-for'];
    const clientIpAddress = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim();
    const fbp = readCookie(request.headers.cookie, '_fbp');
    const fbc = readCookie(request.headers.cookie, '_fbc');

    const event = {
      event_name: body.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.eventId,
      action_source: 'website',
      event_source_url: body.eventSourceUrl,
      user_data: {
        client_ip_address: clientIpAddress,
        client_user_agent: request.headers['user-agent'],
        fbp,
        fbc
      },
      custom_data: body.customData || undefined
    };

    const metaResponse = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: [event] })
      }
    );

    const metaResult = await metaResponse.json().catch(() => ({}));
    if (!metaResponse.ok) {
      console.error(JSON.stringify({
        service: 'meta-conversions-api',
        event: body.eventName,
        status: metaResponse.status,
        error: metaResult?.error?.message || 'Unknown Meta API error'
      }));
      return response.status(502).json({ error: 'Conversion API unavailable' });
    }

    console.log(JSON.stringify({
      service: 'meta-conversions-api',
      event: body.eventName,
      received: metaResult.events_received || 0
    }));
    return response.status(204).end();
  } catch {
    return response.status(204).end();
  }
}
