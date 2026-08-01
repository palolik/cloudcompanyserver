require('dotenv').config();

const PORT = process.env.PORT || 5000;

const JWT_SECRET = '237a3f9e2d1cc34bc6d731b9c1640d4a2dc821cd199ff6a37562643b5090e61f';

// Used only by /adminlogin, exactly as in the original file (falls back to a
// different literal than the shared JWT_SECRET above).
const ADMIN_JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

const SITE_URL = 'https://cloudcompany.cc';

const MONGO_URI = `mongodb+srv://prottoy2441139:PCcEnjG5yyVwyxIw@cluster0.fagav7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

const VAPID_PUBLIC_KEY = 'BIf5he-5B_gZevYmrEe58o6z9gEb2vaP8UY604u25m51-HcWR84hxrF_k2XWmQtTaqjrWqL4xLI7frK1-8mV_H4';
const VAPID_PRIVATE_KEY = 'tQabVyot50UCE-TpFNoIq0n2YoFhG-Qg9eal5HOB5aI';
const VAPID_CONTACT_EMAIL = 'mailto:prottoy.ceo@cloudcompany.cc';

module.exports = {
  PORT,
  JWT_SECRET,
  ADMIN_JWT_SECRET,
  SITE_URL,
  MONGO_URI,
  DB_NAME,
  CORS_ORIGINS,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_CONTACT_EMAIL,
};
