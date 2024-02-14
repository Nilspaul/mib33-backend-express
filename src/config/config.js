import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup für __dirname in ES6-Modulen
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = process.env;

export default {
  env: env.NODE_ENV,
  database: env.DATABASE,
  googlesheet: env.GOOGLE_SHEET,
  port: env.PORT,
  saltrounds: env.SALTROUNDS,
  frontend_domains: env.FRONTEND_DOMAINS,
  jwt: {
    cookiename: env.JWT_COOKIE_NAME,
    secret: env.JWT_SECRET,
    accessExpirationMinutes: env.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: env.JWT_REFRESH_EXPIRATION_DAYS,
  }
};
