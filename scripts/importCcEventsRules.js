// Creates or updates the rules in analytics/notificationRules.js on the
// CC Events portal, matched by name. Rules that exist only on the portal are
// left alone.
//
//   CC_EVENTS_LOGIN_EMAIL=... CC_EVENTS_LOGIN_PASSWORD=... node scripts/importCcEventsRules.js
//
// The login is a portal (startup) user, not a view-only dashboard link.
// CC_EVENTS_URL is read from .env.
require('dotenv').config();
const rules = require('../analytics/notificationRules');

const baseUrl = (process.env.CC_EVENTS_URL || '').replace(/\/+$/, '');
const { CC_EVENTS_LOGIN_EMAIL: email, CC_EVENTS_LOGIN_PASSWORD: password } = process.env;

async function api(path, { token, ...options } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${path}: ${res.status} ${data.error || ''}`.trim());
  return data;
}

async function main() {
  if (!baseUrl || !email || !password) {
    throw new Error('Set CC_EVENTS_URL in .env and CC_EVENTS_LOGIN_EMAIL / CC_EVENTS_LOGIN_PASSWORD');
  }
  const { token } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  const existing = new Map((await api('/notifications/rules', { token })).map((r) => [r.name, r]));

  for (const rule of rules) {
    const current = existing.get(rule.name);
    if (current) {
      await api(`/notifications/rules/${current._id}`, { token, method: 'PATCH', body: JSON.stringify(rule) });
      console.log(`updated  ${rule.name}`);
    } else {
      await api('/notifications/rules', { token, method: 'POST', body: JSON.stringify(rule) });
      console.log(`created  ${rule.name}`);
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
