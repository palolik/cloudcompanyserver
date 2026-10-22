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

const SITE_URL = 'https://cloudcompany.cc';

const MONGO_URI = `mongodb+srv://${encodeURIComponent(required('EMAILDB'))}:${encodeURIComponent(required('PASSDB'))}@cluster0.fagav7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const DB_NAME = 'Cloudcompany';
const DB_NAME = 'Cloudcompanydev';

const CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://crudapp-beb6a.web.app',
  'http://10.0.2.2:5173',
  'http://10.0.2.2:5174',
  'https://cloudcompany.cc/',
  'https://cloudcompany.cc',
  'https://www.cloudcompany.cc/',
  'https://www.cloudcompany.cc',
];

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
  MONGO_URI,
  DB_NAME,
  CORS_ORIGINS,
  WEB_APP_URL,
  CC_EVENTS_URL,
  CC_EVENTS_API_KEY,
  CC_EVENTS_API_SECRET,
  CC_EVENTS_WEBHOOK_SECRET,
  CC_EVENTS_DASHBOARD_URL,
  FIREBASE_SERVICE_ACCOUNT_PATH,
  FIREBASE_SERVICE_ACCOUNT,
};
