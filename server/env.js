import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Muat variabel lingkungan dari .env.local dan .env pada root proyek.
 * Dipanggil satu kali oleh modul server agar kredensial lokal tidak tertulis di kode publik.
 */
export function loadServerEnv() {
  const envLocalPath = path.join(rootDir, '.env.local');
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath, quiet: true });
  }
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, quiet: true });
  }
}

loadServerEnv();
