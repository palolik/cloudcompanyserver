// Visitor country (ISO 3166 alpha-2, e.g. "BD") from the request IP.

// Set by CDNs / hosts in front of the API, when there is one.
const COUNTRY_HEADERS = ['cf-ipcountry', 'x-vercel-ip-country', 'cloudfront-viewer-country'];

const LOOKUP_TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 5000;
const cache = new Map(); // ip -> { country, at }

const clientIp = (req) =>
  (req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '').replace(/^::ffff:/, '');

const isPrivateIp = (ip) =>
  !ip ||
  ip === '::1' ||
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|fc|fd|fe80)/i.test(ip);

const lookupIp = async (ip) => {
  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.country;

  const res = await fetch(`https://api.country.is/${encodeURIComponent(ip)}`, {
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`country lookup ${res.status}`);
  const { country } = await res.json();
  const code = typeof country === 'string' ? country.toUpperCase() : null;

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(ip, { country: code, at: Date.now() });
  return code;
};

// Resolves to null when the country can't be determined (local dev, lookup down).
const countryFromRequest = async (req) => {
  for (const name of COUNTRY_HEADERS) {
    const value = req.headers[name];
    if (value && /^[A-Z]{2}$/i.test(value) && value.toUpperCase() !== 'XX') return value.toUpperCase();
  }

  const ip = clientIp(req);
  if (isPrivateIp(ip)) return null;
  try {
    return await lookupIp(ip);
  } catch (err) {
    console.error('Country lookup failed:', err.message);
    return null;
  }
};

module.exports = { countryFromRequest };
