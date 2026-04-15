import { getStore } from '@netlify/blobs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

  // Fallback: statyczny plik z repozytorium (bundlowany razem z funkcją przez esbuild)
  try {
    const fallbackPath = join(__dirname, '../../public/historical_data.json');
    const fallback = readFileSync(fallbackPath, 'utf-8');
    return new Response(fallback, { status: 200, headers });
  } catch (err) {
    console.error('[historical-data] Fallback also failed:', err.message);
    return new Response(JSON.stringify({ error: 'Data unavailable' }), {
      status: 503,
      headers,
    });
  }
}
