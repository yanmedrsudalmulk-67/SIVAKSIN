import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'sivaksin_db.json');

// Indonesian month map
const MONTHS = {
  'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mei': '05', 'jun': '06',
  'jul': '07', 'agu': '08', 'ags': '08', 'agt': '08', 'aug': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'des': '12'
};

function parseIndoDate(str) {
  if (!str) return '';
  str = str.trim();
  const m = str.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mon = MONTHS[m[2].toLowerCase()] || '01';
    const year = m[3];
    return `${year}-${mon}-${day}`;
  }
  return str;
}

function parseIndoDateTime(str) {
  if (!str) return '';
  str = str.trim();
  const m = str.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{2}:\d{2}(?::\d{2})?)/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mon = MONTHS[m[2].toLowerCase()] || '01';
    const year = m[3];
    const time = m[4];
    return `${year}-${mon}-${day} ${time}`;
  }
  return str;
}

function mapVaccineId(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('meningitis')) return 'v1';
  if (lower.includes('polio')) return 'v2';
  if (lower.includes('influenza') || lower.includes('flubio')) return 'v3';
  return 'v1';
}

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : new URL(url, 'https://apiik.bkkbandung.net').href;
    const u = new URL(fullUrl);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function updateCookies(oldCookies, setCookieHeader) {
  if (!setCookieHeader) return oldCookies;
  const map = new Map();
  if (oldCookies) {
    oldCookies.split(';').forEach(c => {
      const [k, ...v] = c.trim().split('=');
      if (k) map.set(k, v.join('='));
    });
  }
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  headers.forEach(h => {
    const pair = h.split(';')[0].trim();
    const [k, ...v] = pair.split('=');
    if (k) map.set(k, v.join('='));
  });
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

// In-memory status tracker
let syncStatus = {
  isSyncing: false,
  lastSyncTime: null,
  lastSyncResult: null,
  error: null
};

/**
 * Synchronize daily reports from APIIK BKK Bandung.
 * @param {boolean} fullSync If true, requests tableRecordsPerPage="all" to fetch all 1000+ entries. If false, fetches latest entries.
 */
export async function syncFromApiik(fullSync = false) {
  if (syncStatus.isSyncing) {
    return { ok: false, message: 'Sinkronisasi sedang berlangsung...', status: syncStatus };
  }

  syncStatus.isSyncing = true;
  syncStatus.error = null;

  try {
    console.log('[APIIK Sync] Starting sync from https://apiik.bkkbandung.net ...');
    
    // 1. Initial page load to get session & token
    const res1 = await request('https://apiik.bkkbandung.net/');
    let cookies = updateCookies('', res1.headers['set-cookie']);

    const resHome = await request('https://apiik.bkkbandung.net/home', { headers: { Cookie: cookies } });
    cookies = updateCookies(cookies, resHome.headers['set-cookie']);

    const csrfMatch = resHome.body.match(/name="csrf-token"\s+content="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const snapMatch = resHome.body.match(/wire:snapshot="([^"]+)"/);
    if (!snapMatch) throw new Error('Tidak dapat menemukan komponen login APIIK.');
    const rawSnapshot = snapMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');

    // 2. Authenticate
    const apiikLogin = process.env.APIIK_LOGIN || '';
    const apiikPassword = process.env.APIIK_PASSWORD || '';
    if (!apiikLogin || !apiikPassword) {
      throw new Error('Kredensial APIIK belum dikonfigurasi pada .env.local (APIIK_LOGIN & APIIK_PASSWORD).');
    }

    const payloadAuth = {
      _token: csrfToken,
      components: [
        {
          snapshot: rawSnapshot,
          updates: {
            'loginData.login': apiikLogin,
            'loginData.password': apiikPassword,
            'latitude': -6.958742,
            'longitude': 106.918231,
            'isGps': true
          },
          calls: [{ path: '', method: 'authenticate', params: [] }]
        }
      ]
    };

    const resAuth = await request('https://apiik.bkkbandung.net/livewire/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'X-Livewire': 'true',
        'Cookie': cookies,
        'Origin': 'https://apiik.bkkbandung.net',
        'Referer': 'https://apiik.bkkbandung.net/home',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(payloadAuth)
    });
    cookies = updateCookies(cookies, resAuth.headers['set-cookie']);

    // 3. Load /laporan-penggunaan-icv
    const resReports = await request('https://apiik.bkkbandung.net/laporan-penggunaan-icv', {
      headers: {
        Cookie: cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    cookies = updateCookies(cookies, resReports.headers['set-cookie']);

    let htmlToParse = resReports.body;

    // If full sync requested, ask for tableRecordsPerPage = 'all'
    if (fullSync) {
      const repCsrfMatch = resReports.body.match(/name="csrf-token"\s+content="([^"]+)"/);
      const repCsrf = repCsrfMatch ? repCsrfMatch[1] : csrfToken;
      const repSnapMatch = resReports.body.match(/wire:snapshot="([^"]+)"/);
      if (repSnapMatch) {
        const reportSnapshot = repSnapMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const payloadAll = {
          _token: repCsrf,
          components: [{ snapshot: reportSnapshot, updates: { tableRecordsPerPage: 'all' }, calls: [] }]
        };
        const resAll = await request('https://apiik.bkkbandung.net/livewire/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': repCsrf,
            'X-Livewire': 'true',
            'Cookie': cookies,
            'Origin': 'https://apiik.bkkbandung.net',
            'Referer': 'https://apiik.bkkbandung.net/laporan-penggunaan-icv',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: JSON.stringify(payloadAll)
        });
        try {
          const json = JSON.parse(resAll.body);
          if (json.components[0].effects?.html) {
            htmlToParse = json.components[0].effects.html;
          }
        } catch (_) {}
      }
    }

    // 4. Parse table rows
    const rows = [...htmlToParse.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
    console.log(`[APIIK Sync] Found ${rows.length} rows in reports table HTML.`);

    const parsedReports = [];
    for (let i = 1; i < rows.length; i++) {
      const rowHtml = rows[i][0];
      const cells = [...rowHtml.matchAll(/<td[\s\S]*?<\/td>/gi)].map(m => {
        return m[0]
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      });

      if (cells.length < 8) continue;

      const idMatch = rowHtml.match(/value="(\d+)"/);
      const recId = idMatch ? idMatch[1] : `rep_${i}`;

      const rawDate = cells[1];
      const rawUpdatedAt = cells[2];
      const clinic = cells[3] || 'RSUD AL-MULK';
      const vaccineName = cells[4];
      const icvIssued = parseInt(cells[5] || '0', 10) || 0;
      const vaccineUsed = parseInt(cells[6] || '0', 10) || 0;
      const icvRemaining = parseInt(cells[7] || '0', 10) || 0;
      const vaccineRemaining = parseInt(cells[8] || '0', 10) || 0;

      let rawNotes = cells[9] || '';
      rawNotes = rawNotes.replace(/\b(Ubah|Lihat)\b/g, '').trim();

      const isoDate = parseIndoDate(rawDate);
      const isoUpdatedAt = parseIndoDateTime(rawUpdatedAt);

      parsedReports.push({
        id: `rep_${recId}`,
        online_id: recId,
        date: isoDate,
        raw_date: rawDate,
        updated_at: isoUpdatedAt || isoDate,
        clinic: clinic,
        vaccine_id: mapVaccineId(vaccineName),
        vaccine_name: vaccineName,
        icv_issued: icvIssued,
        vaccine_used: vaccineUsed,
        icv_remaining: icvRemaining,
        vaccine_remaining: vaccineRemaining,
        notes: rawNotes
      });
    }

    // 5. Merge with existing Database
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    db.daily_usage_reports = db.daily_usage_reports || [];

    let newCount = 0;
    let updatedCount = 0;

    for (const r of parsedReports) {
      const existingIdx = db.daily_usage_reports.findIndex(x => x.online_id === r.online_id || (x.date === r.date && x.vaccine_name === r.vaccine_name));
      if (existingIdx === -1) {
        db.daily_usage_reports.unshift(r);
        newCount++;
      } else {
        db.daily_usage_reports[existingIdx] = {
          ...db.daily_usage_reports[existingIdx],
          ...r
        };
        updatedCount++;
      }
    }

    // Sort by date & updated_at descending
    db.daily_usage_reports.sort((a, b) => {
      if (b.date !== a.date) return (b.date || '').localeCompare(a.date || '');
      return (b.updated_at || '').localeCompare(a.updated_at || '');
    });

    // Update stocks according to the latest entry on 28 Okt 2026 or newest date
    const latestMeningitis = db.daily_usage_reports.find(r => r.vaccine_id === 'v1');
    const latestPolio = db.daily_usage_reports.find(r => r.vaccine_id === 'v2');
    const latestFlu = db.daily_usage_reports.find(r => r.vaccine_id === 'v3');

    if (latestMeningitis && db.vaccines) {
      const v1 = db.vaccines.find(v => v.id === 'v1');
      if (v1 && latestMeningitis.vaccine_remaining !== undefined) v1.stock = latestMeningitis.vaccine_remaining;
    }
    if (latestPolio && db.vaccines) {
      const v2 = db.vaccines.find(v => v.id === 'v2');
      if (v2 && latestPolio.vaccine_remaining !== undefined) v2.stock = latestPolio.vaccine_remaining;
    }
    if (latestFlu && db.vaccines) {
      const v3 = db.vaccines.find(v => v.id === 'v3');
      if (v3 && latestFlu.vaccine_remaining !== undefined) v3.stock = latestFlu.vaccine_remaining;
    }
    if (!db.app_settings) db.app_settings = {};
    if (latestMeningitis && latestMeningitis.icv_remaining !== undefined) {
      db.app_settings.eicv_stock = latestMeningitis.icv_remaining;
    }

    // Save DB
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');

    syncStatus.lastSyncTime = new Date().toISOString();
    syncStatus.lastSyncResult = {
      total: db.daily_usage_reports.length,
      newCount,
      updatedCount,
      latestDate: db.daily_usage_reports[0]?.date
    };

    console.log(`[APIIK Sync] Done! Total reports: ${db.daily_usage_reports.length} (New: ${newCount}, Updated: ${updatedCount})`);

    return {
      ok: true,
      result: syncStatus.lastSyncResult,
      lastSyncTime: syncStatus.lastSyncTime
    };

  } catch (err) {
    console.error('[APIIK Sync] Error:', err.message);
    syncStatus.error = err.message;
    return { ok: false, error: err.message };
  } finally {
    syncStatus.isSyncing = false;
  }
}

export function getSyncStatus() {
  return syncStatus;
}

// Background auto-sync interval (default every 10 minutes)
let timerId = null;
export function startAutoSync(intervalMinutes = 10) {
  if (timerId) clearInterval(timerId);
  console.log(`[APIIK Sync] Auto-sync scheduled every ${intervalMinutes} minutes.`);
  timerId = setInterval(() => {
    console.log('[APIIK Sync] Running scheduled background sync...');
    syncFromApiik(false).catch(console.error);
  }, intervalMinutes * 60 * 1000);
  if (typeof timerId.unref === 'function') {
    timerId.unref();
  }
}
