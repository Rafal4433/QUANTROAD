import { getStore } from '@netlify/blobs';

// Fallback: esbuild bundluje JSON inline — działa niezależnie od __dirname
import fallbackData from '../../public/historical_data.json';

export default async function handler() {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    // Spróbuj pobrać dane z Netlify Blobs (aktualizowane codziennie przez update-data)
    const store = getStore('historical-data');
    const data = await store.get('data');

    if (data) {
      return new Response(data, { status: 200, headers });
    }
  } catch (err) {
    console.warn('[historical-data] Blobs unavailable, using fallback:', err.message);
  }

  // Fallback: statyczny JSON zbundlowany przez esbuild
  return new Response(JSON.stringify(fallbackData), { status: 200, headers });
}
