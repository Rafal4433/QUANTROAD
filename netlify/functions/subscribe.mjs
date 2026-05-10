export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let email;
  try {
    const body = await req.json();
    email = (body.email || '').trim().toLowerCase();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Nieprawidłowy adres e-mail' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Brak konfiguracji serwera' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ email }),
  });

  // 200 = already subscribed, 201 = new subscriber — both are success
  if (res.status === 200 || res.status === 201) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json().catch(() => ({}));
  const message = data?.message || 'Błąd serwisu mailingowego';
  return new Response(JSON.stringify({ error: message }), {
    status: 502,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = { path: '/api/subscribe' };
