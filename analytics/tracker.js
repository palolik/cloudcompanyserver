// Express middleware that turns successful API requests into CC Events
// events, using the route table in eventRules.js. Mounted before every
// router (index2.js) so it sees each request; the work happens on 'finish',
// after the response is sent, and never affects the response.
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { trackEvent, identify, contextFromRequest, getConfig } = require('../utils/ccEvents');
const RULES = require('./eventRules');

const trackAllReads = () => process.env.CC_EVENTS_TRACK_ALL_READS === 'true';

// Client/employee token, when the frontend sends one. Routes don't have to be
// authenticated for this to work.
function tokenClaims(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
}

// Most requests carry no token, so remember who logged in from each
// browser (ip + user agent) and credit their later anonymous requests to them.
const VISITOR_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_VISITORS = 50000;
const visitors = new Map();

const visitorKey = (req) => `${contextFromRequest(req).ip}|${req.get('user-agent') || ''}`;

function rememberVisitor(req, externalId) {
  const key = visitorKey(req);
  visitors.delete(key);
  visitors.set(key, { externalId: String(externalId), at: Date.now() });
  if (visitors.size > MAX_VISITORS) visitors.delete(visitors.keys().next().value);
}

function recallVisitor(req) {
  const key = visitorKey(req);
  const entry = visitors.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > VISITOR_TTL_MS) {
    visitors.delete(key);
    return null;
  }
  return entry.externalId;
}

function resolveExternalId(req, rule, body) {
  const ruleId = rule.id?.(req, body);
  if (ruleId) {
    if (rule.actor === 'client' || rule.actor === 'employee') rememberVisitor(req, ruleId);
    return String(ruleId);
  }
  if (rule.actor === 'admin') return 'admin';
  const claims = tokenClaims(req);
  if (claims?.userId) return String(claims.userId);
  return recallVisitor(req) || req.get('x-device-id') || `anon:${contextFromRequest(req).ip}`;
}

const dropUndefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// Keep whatever the route sends so rules can read it. res.send(object) in
// Express goes through res.json, so both are covered.
function captureResponse(res) {
  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    res.locals.responseBody = payload;
    return originalJson(payload);
  };
  const originalSend = res.send.bind(res);
  res.send = (payload) => {
    if (payload && typeof payload === 'object' && !Buffer.isBuffer(payload)) res.locals.responseBody = payload;
    return originalSend(payload);
  };
}

const ruleFor = (req) => RULES[`${req.method} ${req.route?.path}`];
const responseBody = (res) => (res.locals.responseBody && typeof res.locals.responseBody === 'object' ? res.locals.responseBody : {});

async function handle(req, res) {
  const rule = ruleFor(req);
  if (!rule) return;
  if (rule.noisy && !trackAllReads()) return;

  const body = responseBody(res);
  const properties = rule.props ? await rule.props(req, body) : {};
  if (properties === null) return;

  const externalId = resolveExternalId(req, rule, body);
  const base = { actorType: rule.actor, route: `${req.method} ${req.route.path}` };
  const context = contextFromRequest(req);

  const profile = rule.identify?.(req, body);
  if (profile?.externalId) identify({ externalId: profile.externalId, traits: dropUndefined(profile.traits || {}) });

  trackEvent({ externalId, event: rule.event, properties: dropUndefined({ ...base, ...properties }), context });

  // Extra events are about someone else (e.g. the client whose order an
  // admin updated) and carry their own externalId/actorType.
  const extras = rule.extra ? await rule.extra(req, body) : [];
  for (const extra of extras) {
    if (!extra?.event) continue;
    trackEvent({
      externalId: extra.externalId ? String(extra.externalId) : externalId,
      event: extra.event,
      properties: dropUndefined({ ...base, ...(extra.actorType ? { actorType: extra.actorType } : {}), ...extra.properties }),
      context,
    });
  }
}

// Rules with onFailure also record rejected requests (4xx), e.g. failed logins.
function handleFailure(req, res) {
  const rule = ruleFor(req);
  if (!rule?.onFailure || res.statusCode < 400 || res.statusCode >= 500) return;
  const body = responseBody(res);
  trackEvent({
    externalId: recallVisitor(req) || req.get('x-device-id') || `anon:${contextFromRequest(req).ip}`,
    event: rule.onFailure.event,
    properties: dropUndefined({
      actorType: rule.actor,
      route: `${req.method} ${req.route.path}`,
      status: res.statusCode,
      reason: body.message || body.error,
      ...(rule.onFailure.props?.(req, body) || {}),
    }),
    context: contextFromRequest(req),
  });
}

function eventTracking(req, res, next) {
  if (!getConfig()) return next();
  captureResponse(res);
  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return handleFailure(req, res);
    handle(req, res).catch((err) => console.error('CC Events tracking failed:', err.message));
  });
  next();
}

module.exports = eventTracking;
