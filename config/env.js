require('dotenv').config();

// Secrets come only from .env (see .env.example); refuse to start without them.
const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name} (see .env.example)`);
  return value;
};

const PORT = process.env.PORT || 5050;

const JWT_SECRET = required('JWT_SECRET');

// Used by /adminlogin and requireAdmin.
const ADMIN_JWT_SECRET = JWT_SECRET;

// Comma-separated env value as a trimmed array.
const list = (value) => String(value || '').split(',').map((s) => s.trim()).filter(Boolean);

const SITE_URL = process.env.SITE_URL || 'https://cloudcompany.cc';

// Public origin of this API, used in links to uploaded files.
const SERVER_URL = (process.env.SERVER_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');

// Where /ref/:code sends visitors after counting the referral.
const REFERRAL_REDIRECT_URL = process.env.REFERRAL_REDIRECT_URL || SITE_URL;

const MONGO_URI = required('MONGO_URI');
const DB_NAME = required('DB_NAME');

const CORS_ORIGINS = list(process.env.CORS_ORIGINS);

// Domain of the company mailboxes (info@, support@, ...).
const MAIL_DOMAIN = process.env.MAIL_DOMAIN || 'cloudcompany.cc';

// Public site (CCUser) origin, used for links in push notifications.
const WEB_APP_URL = process.env.WEB_APP_URL || SITE_URL;

// CC Events (analytics + notification rules). When any of the three is
// missing, tracking is a silent no-op.
const CC_EVENTS_URL = process.env.CC_EVENTS_URL || '';
const CC_EVENTS_API_KEY = process.env.CC_EVENTS_API_KEY || '';
const CC_EVENTS_API_SECRET = process.env.CC_EVENTS_API_SECRET || '';
// Shared secret for the CC Events delivery webhook (POST /events/deliver).
const CC_EVENTS_WEBHOOK_SECRET = process.env.CC_EVENTS_WEBHOOK_SECRET || '';
// Read-only CC Events dashboard link shown in CCAdmin.
const CC_EVENTS_DASHBOARD_URL = process.env.CC_EVENTS_DASHBOARD_URL || '';

// Firebase Cloud Messaging (project "cloudcompany-dbc36"). Path to the
// service-account JSON (relative to the project root), or the JSON itself in
// FIREBASE_SERVICE_ACCOUNT. Unset = push is a silent no-op.
const FIREBASE_SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '';
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT || '';

module.exports = {
  PORT,
  JWT_SECRET,
  ADMIN_JWT_SECRET,
  SITE_URL,
  SERVER_URL,
  REFERRAL_REDIRECT_URL,
  MONGO_URI,
  DB_NAME,
  CORS_ORIGINS,
  MAIL_DOMAIN,
  WEB_APP_URL,
  CC_EVENTS_URL,
  CC_EVENTS_API_KEY,
  CC_EVENTS_API_SECRET,
  CC_EVENTS_WEBHOOK_SECRET,
  CC_EVENTS_DASHBOARD_URL,
  FIREBASE_SERVICE_ACCOUNT_PATH,
  FIREBASE_SERVICE_ACCOUNT,
};
