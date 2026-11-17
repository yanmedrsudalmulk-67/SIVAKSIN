import { randomBytes } from 'node:crypto';
const sessions = new Map();
const publicUser = ({ password, ...user }) => user;
import { getDb, saveDb, saveUploadedFile } from './dbHandler.js';
import { getTunnelStatus, startTunnel, stopTunnel } from './tunnelManager.js';
import { syncFromApiik, getSyncStatus, startAutoSync } from './apiikService.js';
import { syncBookingToSimrs, deleteBookingFromSimrs, testSimrsConnection, updateSimrsDoctor, DEFAULT_SIMRS_CONFIG } from './simrsService.js';

let backgroundStarted = false;
/** Mulai layanan sinkronisasi latar belakang APIIK hanya saat server HTTP berjalan. */
export function initBackgroundServices() {
  if (backgroundStarted) return;
  backgroundStarted = true;
  startAutoSync(10);
}

export async function handleLocalApi(req, res, next) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Hanya proses jika path diawali dengan /api
  if (!pathname.startsWith('/api')) {
    return next();
  }

  const sessionToken = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('sivaksin_session='))?.slice(17);
  const session = sessions.get(sessionToken);
  const actor = session && session.expires > Date.now() ? getDb().users.find(u => u.id === session.id) : null;
  const isAdmin = actor?.role === 'admin';
  // Response helper
  const sendJson = (statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    return sendJson(200, { ok: true });
  }

  // Body parser helper
  const readBody = (callback) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 15 * 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : {};
        callback(null, json);
      } catch (err) {
        callback(err, null);
      }
    });
  };

  if (pathname === '/api/users/logout' && req.method === 'POST') {
    sessions.delete(sessionToken);
    res.setHeader('Set-Cookie', 'sivaksin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    return sendJson(200, { success: true });
  }
  if (pathname === '/api/admin/users' && req.method === 'GET') {
    if (!isAdmin) return sendJson(403, { error: 'Silakan masuk dengan akun admin.' });
    return sendJson(200, getDb().users.map(publicUser));
  }
  const certificateMatch = pathname.match(/^\/api\/bookings\/([^/]+)\/certificate$/);
  if (certificateMatch && req.method === 'POST') {
    if (!isAdmin) return sendJson(403, { error: 'Hanya admin yang dapat mengunggah sertifikat.' });
    readBody((err, body) => {
      if (err || !/^data:application\/pdf;base64,/.test(body.fileData || '')) return sendJson(400, { error: 'Pilih file PDF sertifikat.' });
      const bytes = Buffer.from(body.fileData.split(',')[1], 'base64');
      if (bytes.length > 10 * 1024 * 1024 || bytes.subarray(0, 5).toString() !== '%PDF-') return sendJson(400, { error: 'PDF tidak valid atau melebihi 10 MB.' });
      const db = getDb();
      const booking = db.bookings.find(b => b.id === decodeURIComponent(certificateMatch[1]));
      if (!booking) return sendJson(404, { error: 'Pendaftaran tidak ditemukan.' });
      const upload = saveUploadedFile(body.fileData, 'certificate.pdf', 'eicv');
      if (!upload.success) return sendJson(500, { error: upload.error || 'Gagal menyimpan PDF.' });
      booking.patient = { ...booking.patient, e_icv_url: upload.url, e_icv_file_name: body.fileName || 'Sertifikat E-ICV.pdf', e_icv_status: 'diterbitkan', e_icv_issued_at: new Date().toISOString(), e_icv_uploaded_by: actor.id };
      booking.status = 'selesai';
      db.notifications ||= [];
      db.notifications.unshift({ id: 'cert_' + Date.now(), userId: booking.user_id || booking.patient.nik || booking.patient.email, bookingId: booking.id, type: 'general', title: 'Sertifikat E-ICV tersedia', message: 'Admin telah mengunggah sertifikat Anda. Silakan buka menu E-ICV.', actionUrl: '/certificate', createdAt: new Date().toISOString(), read: false });
      if (!saveDb(db)) return sendJson(500, { error: 'Gagal menyimpan sertifikat ke database.' });
      return sendJson(200, { success: true, booking });
    });
    return;
  }
  // 1. Health check & Status
  if (pathname === '/api/status' || pathname === '/api/health') {
    return sendJson(200, {
      status: 'online',
      storage: 'local_computer',
      port: 3003,
      app: 'SIVAKSIN - RSUD AL-MULK',
      timestamp: new Date().toISOString()
    });
  }

  // 1.1 Cloudflare Tunnel Status & Control
  if (pathname === '/api/tunnel' && req.method === 'GET') {
    return sendJson(200, getTunnelStatus());
  }

  if (pathname === '/api/tunnel/start' && req.method === 'POST') {
    startTunnel(3003).then((result) => {
      return sendJson(result.success ? 200 : 500, result);
    });
    return;
  }

  if (pathname === '/api/tunnel/stop' && req.method === 'POST') {
    const result = stopTunnel();
    return sendJson(200, result);
  }

  // 1.2 APIIK BKK Bandung Live Sync
  if (pathname === '/api/apiik/status' && req.method === 'GET') {
    return sendJson(200, getSyncStatus());
  }

  if (pathname === '/api/apiik/sync' && req.method === 'POST') {
    readBody(async (err, body) => {
      const fullSync = Boolean(body && body.fullSync);
      const result = await syncFromApiik(fullSync);
      return sendJson(result.ok ? 200 : 500, result);
    });
    return;
  }

  // 2. Full Database Sync
  if (pathname === '/api/db' && req.method === 'GET') {
    if (!isAdmin) return sendJson(403, { error: 'Akses admin diperlukan.' });
    const db = getDb();
    return sendJson(200, { ...db, users: db.users.map(publicUser) });
  }

  if (pathname === '/api/db' && req.method === 'POST') return sendJson(403, { error: 'Gunakan endpoint khusus untuk mengubah data.' });

  // 3. Vaccines
  if (pathname === '/api/vaccines' && req.method === 'GET') {
    const db = getDb();
    return sendJson(200, db.vaccines || []);
  }

  if (pathname === '/api/vaccines' && req.method === 'POST') {
    readBody((err, body) => {
      if (err || !body.name) return sendJson(400, { error: 'Nama vaksin harus diisi' });
      const db = getDb();
      const newVaccine = {
        id: body.id || `v_${Date.now()}`,
        name: body.name,
        price: Number(body.price) || 0,
        stock: Number(body.stock) || 0,
        description: body.description || '',
        benefits: Array.isArray(body.benefits) ? body.benefits : ['Sertifikat Internasional (ICV)'],
        category: body.category || 'Wajib',
        protectionDuration: body.protectionDuration || '2 Tahun'
      };
      db.vaccines = db.vaccines.filter(v => v.id !== newVaccine.id);
      db.vaccines.push(newVaccine);
      saveDb(db);
      return sendJson(201, { success: true, vaccine: newVaccine });
    });
    return;
  }

  const vaccineMatch = pathname.match(/^\/api\/vaccines\/([^/]+)$/);
  if (vaccineMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
    const id = vaccineMatch[1];
    readBody((err, body) => {
      if (err) return sendJson(400, { error: 'Invalid JSON' });
      const db = getDb();
      const idx = db.vaccines.findIndex(v => v.id === id);
      if (idx === -1) return sendJson(404, { error: 'Vaksin tidak ditemukan' });
      db.vaccines[idx] = { ...db.vaccines[idx], ...body };
      saveDb(db);
      return sendJson(200, { success: true, vaccine: db.vaccines[idx] });
    });
    return;
  }

  if (vaccineMatch && req.method === 'DELETE') {
    const id = vaccineMatch[1];
    const db = getDb();
    db.vaccines = db.vaccines.filter(v => v.id !== id);
    saveDb(db);
    return sendJson(200, { success: true });
  }

  // 4. Bookings
  if (pathname === '/api/bookings' && req.method === 'GET') {
    const db = getDb();
    // Return all bookings for register table, or filter by specific user if requested
    const all = url.searchParams.get('all') === 'true' || url.searchParams.get('all') === '1' || isAdmin || !actor;
    if (all) {
      return sendJson(200, db.bookings || []);
    }
    return sendJson(200, (db.bookings || []).filter(b => b.user_id === actor.id || (!b.user_id && ((actor.nik && b.patient?.nik === actor.nik) || (actor.email && b.patient?.email?.toLowerCase() === actor.email.toLowerCase())))));
  }

  if (pathname === '/api/bookings' && req.method === 'POST') {
    readBody((err, body) => {
      if (err || !body.patient) return sendJson(400, { error: 'Data booking tidak valid' });
      for (const key of Object.keys(body.patient)) if (key.startsWith('e_icv_')) delete body.patient[key];
      const db = getDb();
      if (body.id && db.bookings.some(b => b.id === body.id)) return sendJson(409, { error: 'Nomor pendaftaran sudah digunakan.' });
      
      const newBooking = {
        id: body.id || `BK-${Date.now().toString().slice(-6)}`,
        vaccineId: body.vaccineId || (body.vaccineIds?.[0]) || 'v1',
        vaccineIds: body.vaccineIds || [body.vaccineId || 'v1'],
        date: body.date || new Date().toISOString().split('T')[0],
        time: body.time || '09:00 WIB',
        status: body.status || 'menunggu',
        doctor_code: body.doctor_code || body.kd_dokter || 'D00057',
        doctor_name: body.doctor_name || (body.doctor_code === 'D00179' ? 'dr. Chrysman Andreria Hatulely' : 'dr. M. Arifin Ramadhani'),
        vaccinator_name: body.vaccinator_name || 'Adi Tresa Purnama, A.M.Kep',
        admin_officer_name: body.admin_officer_name || 'Ina Nuraeni, S.AP',
        patient: {
          ...body.patient,
          nationality: body.patient.nationality || 'INDONESIA'
        },
        user_id: (actor && actor.id) || body.user_id || 'public_booking',
        created_at: new Date().toISOString()
      };
      
      db.bookings = db.bookings || [];
      db.bookings = db.bookings.filter(b => b.id !== newBooking.id);
      db.bookings.unshift(newBooking);

      // Auto update daily report for today if exists
      const todayStr = newBooking.date;
      db.daily_usage_reports = db.daily_usage_reports || [];
      
      saveDb(db);

      // Integrasi otomatis ke SIMRS Khanza (Poli U0029 & dr. M. Arifin Ramadhani D00057)
      syncBookingToSimrs(newBooking).then(simrsRes => {
        if (simrsRes && simrsRes.success) {
          const currentDb = getDb();
          const target = (currentDb.bookings || []).find(b => b.id === newBooking.id);
          if (target) {
            target.simrs_synced = true;
            target.simrs_no_rawat = simrsRes.no_rawat;
            target.simrs_no_reg = simrsRes.no_reg;
            target.simrs_no_rkm_medis = simrsRes.no_rkm_medis;
            target.simrs_synced_at = new Date().toISOString();
            target.simrs_message = simrsRes.message;
            saveDb(currentDb);
            console.log(`[SIMRS Auto-Sync] Berhasil: ${newBooking.patient?.fullName || newBooking.patient?.name} -> No.Rawat: ${simrsRes.no_rawat}`);
          }
        }
      }).catch(simrsErr => {
        console.warn('[SIMRS Auto-Sync Note]:', simrsErr.message);
      });

      return sendJson(201, { success: true, booking: newBooking });
    });
    return;
  }

  const bookingMatch = pathname.match(/^\/api\/bookings\/([^/]+)$/);
  if (bookingMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
    const id = bookingMatch[1];
    readBody((err, body) => {
      if (err) return sendJson(400, { error: 'Invalid JSON' });
      const db = getDb();
      delete body.id;
      if (body.patient) for (const key of Object.keys(body.patient)) if (key.startsWith('e_icv_')) delete body.patient[key];
      const idx = (db.bookings || []).findIndex(b => b.id === id);
      if (idx === -1) return sendJson(404, { error: 'Booking tidak ditemukan' });
      
      const prevStatus = db.bookings[idx].status;
      db.bookings[idx] = {
        ...db.bookings[idx],
        ...body,
        patient: body.patient ? { ...db.bookings[idx].patient, ...body.patient } : db.bookings[idx].patient
      };

      // Jika status berubah menjadi selesai, catat mutasi stok keluar jika belum tercatat
      if (body.status === 'selesai' && prevStatus !== 'selesai') {
        const vIds = db.bookings[idx].vaccineIds || [db.bookings[idx].vaccineId];
        db.stock_mutations = db.stock_mutations || [];
        vIds.forEach(vId => {
          const v = (db.vaccines || []).find(vac => vac.id === vId);
          if (v) {
            v.stock = Math.max(0, (v.stock || 0) - 1);
            db.stock_mutations.unshift({
              id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              date: new Date().toISOString().split('T')[0],
              type: 'keluar',
              vaccine_id: v.id,
              vaccine_name: v.name,
              batch_no: '-',
              qty: 1,
              source_or_purpose: `Pelayanan Vaksinasi Peserta: ${db.bookings[idx].patient?.name || 'Peserta'}`,
              notes: `Registrasi ID: ${id}`,
              officer: actor?.name || 'Tim Vaksinator RSUD Al-Mulk',
              created_at: new Date().toISOString()
            });
          }
        });
      }

      saveDb(db);

      // Jika ada perubahan dokter pemeriksa dan pasien sudah terdaftar di SIMRS, update juga di SIMRS Khanza
      const updatedBooking = db.bookings[idx];
      if (body.doctor_code && (updatedBooking.simrs_synced || updatedBooking.simrs_no_rawat)) {
        updateSimrsDoctor(updatedBooking.simrs_no_rawat, body.doctor_code).catch(e => {
          console.warn('[SIMRS Doctor Update Note]:', e.message);
        });
      }

      return sendJson(200, { success: true, booking: db.bookings[idx] });
    });
    return;
  }

  // Tunda Vaksinasi: Batalkan antrean di SIMRS & ubah status ke 'ditunda'
  const postponeMatch = pathname.match(/^\/api\/bookings\/([^/]+)\/postpone$/);
  if (postponeMatch && req.method === 'POST') {
    const id = decodeURIComponent(postponeMatch[1]);
    readBody(async (err, body) => {
      const db = getDb();
      const idx = (db.bookings || []).findIndex(b => b.id === id);
      if (idx === -1) {
        return sendJson(404, { success: false, error: 'Pendaftaran tidak ditemukan.' });
      }

      const booking = db.bookings[idx];
      let simrsResult = null;

      // Hapus data pendaftaran di SIMRS jika sudah terdaftar
      if (booking.simrs_synced || booking.simrs_no_rawat) {
        try {
          simrsResult = await deleteBookingFromSimrs(booking);
        } catch (simrsErr) {
          console.warn('[SIMRS Postpone Warning]:', simrsErr.message);
        }
      }

      booking.status = 'ditunda';
      booking.simrs_synced = false;
      booking.simrs_no_rawat = null;
      booking.simrs_no_reg = null;
      booking.postponed_at = new Date().toISOString();
      booking.postponed_reason = (body && body.reason) ? body.reason : 'Kondisi kesehatan/penyakit belum memungkinkan vaksin';
      booking.simrs_message = 'Pendaftaran ditunda (antrean SIMRS telah dibatalkan). Klik "Daftar Ulang ke SIMRS" jika pasien sudah siap divaksin.';

      saveDb(db);

      return sendJson(200, {
        success: true,
        message: 'Vaksinasi berhasil ditunda dan data pendaftaran di SIMRS telah dibatalkan.',
        booking,
        simrsResult
      });
    });
    return;
  }

  if (bookingMatch && req.method === 'DELETE') {
    const id = decodeURIComponent(bookingMatch[1]);
    const db = getDb();
    const targetBooking = (db.bookings || []).find(b => b.id === id);

    // Otomatis hapus juga dari SIMRS jika sudah pernah terdaftar
    if (targetBooking && (targetBooking.simrs_synced || targetBooking.simrs_no_rawat)) {
      try {
        await deleteBookingFromSimrs(targetBooking);
      } catch (errSimrs) {
        console.warn('[SIMRS auto-delete note]:', errSimrs.message);
      }
    }

    db.bookings = (db.bookings || []).filter(b => b.id !== id);
    saveDb(db);
    return sendJson(200, { success: true, message: 'Data peserta berhasil dihapus dan antrean di SIMRS telah dibersihkan.' });
  }

  // 4.1 Daily Usage Reports (Laporan Harian Penggunaan ICV & Vaksin)
  if (pathname === '/api/daily-reports' && req.method === 'GET') {
    const db = getDb();
    let reports = db.daily_usage_reports || [];
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');
    const vaccineId = url.searchParams.get('vaccine');

    if (fromDate) {
      reports = reports.filter(r => r.date >= fromDate);
    }
    if (toDate) {
      reports = reports.filter(r => r.date <= toDate);
    }
    if (vaccineId && vaccineId !== 'all') {
      reports = reports.filter(r => r.vaccine_id === vaccineId);
    }

    return sendJson(200, reports);
  }

  if (pathname === '/api/daily-reports' && req.method === 'POST') {
    readBody((err, body) => {
      if (err) return sendJson(400, { error: 'Invalid JSON' });
      const db = getDb();
      db.daily_usage_reports = db.daily_usage_reports || [];

      const newReport = {
        id: body.id || `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: body.date || new Date().toISOString().split('T')[0],
        updated_at: body.updated_at || new Date().toLocaleString('id-ID'),
        clinic: body.clinic || 'RSUD AL-MULK',
        vaccine_id: body.vaccine_id || 'v1',
        vaccine_name: body.vaccine_name || 'Meningitis Polysakarida',
        icv_issued: Number(body.icv_issued) || 0,
        vaccine_used: Number(body.vaccine_used) || 0,
        icv_remaining: Number(body.icv_remaining) ?? (db.app_settings?.eicv_stock ?? 18),
        vaccine_remaining: Number(body.vaccine_remaining) ?? 0,
        notes: body.notes || ''
      };

      const existingIndex = db.daily_usage_reports.findIndex(r => r.id === newReport.id);
      if (existingIndex !== -1) {
        db.daily_usage_reports[existingIndex] = { ...db.daily_usage_reports[existingIndex], ...newReport };
      } else {
        db.daily_usage_reports.unshift(newReport);
      }

      saveDb(db);
      return sendJson(201, { success: true, report: newReport });
    });
    return;
  }

  // 4.2 Stock Mutations (Riwayat Penambahan & Pengeluaran Stok Vaksin)
  if (pathname === '/api/stock-mutations' && req.method === 'GET') {
    const db = getDb();
    let mutations = db.stock_mutations || [];
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');
    const type = url.searchParams.get('type');

    if (fromDate) mutations = mutations.filter(m => m.date >= fromDate);
    if (toDate) mutations = mutations.filter(m => m.date <= toDate);
    if (type && type !== 'all') mutations = mutations.filter(m => m.type === type);

    return sendJson(200, mutations);
  }

  if (pathname === '/api/stock-mutations' && req.method === 'POST') {
    readBody((err, body) => {
      if (err || !body.vaccine_id || !body.type) {
        return sendJson(400, { error: 'Data mutasi stok tidak lengkap' });
      }
      const db = getDb();
      db.stock_mutations = db.stock_mutations || [];
      db.vaccines = db.vaccines || [];

      const qty = Math.abs(Number(body.qty) || 0);
      const targetVac = db.vaccines.find(v => v.id === body.vaccine_id);
      if (!targetVac) return sendJson(404, { error: 'Vaksin tidak ditemukan' });

      const prevStock = Number(body.initial_stock ?? targetVac.stock ?? 0);

      // Update stok vaksin
      if (body.type === 'masuk') {
        targetVac.stock = (targetVac.stock || 0) + qty;
      } else if (body.type === 'keluar') {
        targetVac.stock = Math.max(0, prevStock - qty);
      } else if (body.type === 'penyesuaian') {
        targetVac.stock = qty;
      }

      // Update stok E-ICV jika disertakan
      if (body.icv_qty !== undefined && db.app_settings) {
        const icvQty = Number(body.icv_qty) || 0;
        if (body.type === 'masuk') {
          db.app_settings.eicv_stock = (db.app_settings.eicv_stock || 0) + icvQty;
        } else if (body.type === 'keluar') {
          db.app_settings.eicv_stock = Math.max(0, (db.app_settings.eicv_stock || 0) - icvQty);
        } else if (body.type === 'penyesuaian') {
          db.app_settings.eicv_stock = icvQty;
        }
      }

      const defaultBrandName =
        targetVac.id === 'v1' ? 'Menivax' :
        targetVac.id === 'v2' ? 'IPV' :
        targetVac.id === 'v3' ? 'Flubio 0,5 ml' : targetVac.name;

      const newMutation = {
        id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: body.date || new Date().toISOString().split('T')[0],
        type: body.type, // 'masuk' | 'keluar' | 'penyesuaian'
        vaccine_id: targetVac.id,
        vaccine_name: body.vaccine_name || defaultBrandName,
        initial_stock: body.initial_stock !== undefined ? Number(body.initial_stock) : prevStock,
        qty: qty,
        batch_no: body.batch_no || '-',
        exp_date: body.exp_date || (targetVac.id === 'v3' ? 'Mar 2027' : 'Apr 2029'),
        final_stock: body.final_stock !== undefined ? Number(body.final_stock) : targetVac.stock,
        source_or_purpose: body.source_or_purpose || (body.type === 'masuk' ? 'Penerimaan Stok Baru' : 'Pelayanan Vaksinasi'),
        notes: body.notes || '',
        officer: body.officer || actor?.name || 'Petugas RSUD Al-Mulk',
        created_at: new Date().toISOString()
      };

      db.stock_mutations.unshift(newMutation);
      saveDb(db);
      return sendJson(201, { success: true, mutation: newMutation, updated_stock: targetVac.stock });
    });
    return;
  }

  // 5. Users & Auth
  if (pathname === '/api/users' && req.method === 'GET') {
    const db = getDb();
    return sendJson(200, isAdmin ? (db.users || []).map(publicUser) : actor ? [publicUser(actor)] : []);
  }

  if (pathname === '/api/users/login' && req.method === 'POST') {
    readBody((err, body) => {
      if (err || !body.username || !body.password) {
        return sendJson(400, { error: 'Username dan kata sandi harus diisi' });
      }
      const db = getDb();
      const usernameInput = body.username.trim().toLowerCase();
      const user = db.users.find(u => 
        (u.username?.toLowerCase() === usernameInput || u.email?.toLowerCase() === usernameInput) &&
        u.password === body.password
      );
      if (user) {
        const token = randomBytes(32).toString('hex');
        sessions.set(token, { id: user.id, expires: Date.now() + 12 * 60 * 60 * 1000 });
        res.setHeader('Set-Cookie', 'sivaksin_session=' + token + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200');
        return sendJson(200, { success: true, user: publicUser(user) });
      }
      return sendJson(401, { success: false, error: 'Email atau kata sandi tidak cocok' });
    });
    return;
  }

  if (pathname === '/api/users' && req.method === 'POST') {
    readBody((err, body) => {
      if (err || !body.username) return sendJson(400, { error: 'Username harus diisi' });
      const db = getDb();
      const existing = db.users.find(u => u.username === body.username || (body.email && u.email === body.email));
      if (existing) {
        return sendJson(400, { success: false, error: 'Username atau email sudah terdaftar' });
      }
      const newUser = {
        id: 'u_' + randomBytes(12).toString('hex'),
        username: body.username,
        name: body.name || body.username,
        email: body.email || '',
        password: body.password || 'password123',
        role: 'user',
        nik: body.nik || '',
        no_hp: body.no_hp || '',
        no_passport: body.no_passport || '',
        alamat: body.alamat || '',
        avatar_url: body.avatar_url || null,
        ktp_url: body.ktp_url || null,
        passport_url: body.passport_url || null,
        created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      if (!saveDb(db)) return sendJson(500, { error: 'Gagal menyimpan akun.' });
      const token = randomBytes(32).toString('hex');
      sessions.set(token, { id: newUser.id, expires: Date.now() + 12 * 60 * 60 * 1000 });
      res.setHeader('Set-Cookie', 'sivaksin_session=' + token + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200');
      return sendJson(201, { success: true, user: publicUser(newUser) });
    });
    return;
  }

  const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
    const id = userMatch[1];
    if (!actor || (!isAdmin && actor.id !== id && actor.username !== id)) return sendJson(403, { error: 'Akses ditolak.' });
    readBody((err, body) => {
      if (err) return sendJson(400, { error: 'Invalid JSON' });
      const db = getDb();
      delete body.role;
      delete body.id;
      let user = db.users.find(u => u.id === id || u.username === id);
      if (!user) {
        user = { id, ...body };
        db.users.push(user);
      } else {
        Object.assign(user, body);
      }
      saveDb(db);
      return sendJson(200, { success: true, user: publicUser(user) });
    });
    return;
  }

  // 6. App Settings
  if (pathname === '/api/settings' && req.method === 'GET') {
    const db = getDb();
    return sendJson(200, db.app_settings || {});
  }

  if (pathname === '/api/settings' && req.method === 'POST') {
    readBody((err, body) => {
      if (err) return sendJson(400, { error: 'Invalid JSON' });
      const db = getDb();
      db.app_settings = {
        ...db.app_settings,
        ...body,
        updated_at: new Date().toISOString()
      };
      saveDb(db);
      return sendJson(200, { success: true, settings: db.app_settings });
    });
    return;
  }

  // 7. Anaphylactic Kit
  if (pathname === '/api/anaphylactic' && req.method === 'GET') {
    const db = getDb();
    return sendJson(200, {
      items: db.anaphylactic_items || [],
      meta: db.anaphylactic_meta || {},
      history: db.anaphylactic_history || []
    });
  }

  if (pathname === '/api/anaphylactic/sync' && req.method === 'POST') {
    readBody((err, body) => {
      if (err) return sendJson(400, { error: 'Invalid JSON' });
      const db = getDb();
      if (body.items) db.anaphylactic_items = body.items;
      if (body.meta) db.anaphylactic_meta = body.meta;
      if (body.history) db.anaphylactic_history = body.history;
      saveDb(db);
      return sendJson(200, { success: true, message: 'Data kit anafilaktik berhasil disimpan' });
    });
    return;
  }

  // 8. Notifications
  if (pathname === '/api/notifications' && req.method === 'GET') {
    const db = getDb();
    return sendJson(200, isAdmin ? db.notifications || [] : actor ? (db.notifications || []).filter(n => !n.userId || [actor.id, actor.nik, actor.email].filter(Boolean).includes(n.userId)) : []);
  }

  if (pathname === '/api/notifications' && req.method === 'POST') {
    readBody((err, body) => {
      if (err) return sendJson(400, { error: 'Invalid JSON' });
      const db = getDb();
      if (Array.isArray(body)) {
        db.notifications = body;
      } else {
        const notif = {
          id: body.id || `notif_${Date.now()}`,
          ...body,
          createdAt: body.createdAt || new Date().toISOString(),
          read: body.read ?? false
        };
        db.notifications.unshift(notif);
      }
      saveDb(db);
      return sendJson(200, { success: true, notifications: db.notifications });
    });
    return;
  }

  // 9. File Uploads (Base64 atau Data URL)
  if (pathname === '/api/upload' && req.method === 'POST') {
    readBody((err, body) => {
      if (err || !body.fileData) {
        return sendJson(400, { success: false, error: 'Data file tidak ditemukan' });
      }
      const prefix = body.prefix || 'doc';
      const fileName = body.fileName || `${prefix}.jpg`;
      const result = saveUploadedFile(body.fileData, fileName, prefix);
      if (result.success) {
        return sendJson(200, result);
      } else {
        return sendJson(500, result);
      }
    });
    return;
  }

  // 10. Integrasi SIMRS Khanza RSUD Al-Mulk (Poli U0029 & dr. M. Arifin Ramadhani D00057)
  if (pathname === '/api/simrs/status' && req.method === 'GET') {
    testSimrsConnection()
      .then(result => sendJson(200, result))
      .catch(err => sendJson(500, { success: false, error: err.message }));
    return;
  }

  if (pathname === '/api/simrs/sync' && req.method === 'POST') {
    readBody(async (err, body) => {
      if (err || (!body.bookingId && !body.booking)) {
        return sendJson(400, { success: false, error: 'Data bookingId atau booking tidak ditemukan' });
      }
      const db = getDb();
      const targetId = body.bookingId || body.booking?.id;
      const idx = (db.bookings || []).findIndex(b => b.id === targetId);
      const bookingData = idx !== -1 ? db.bookings[idx] : body.booking;

      if (!bookingData) {
        return sendJson(404, { success: false, error: 'Data pendaftaran tidak ditemukan' });
      }

      try {
        const isReregister = body.reregister || bookingData.status === 'ditunda';
        const doctorCode = body.doctorCode || bookingData.doctor_code || bookingData.kd_dokter;
        const simrsRes = await syncBookingToSimrs(
          { ...bookingData, ...(doctorCode ? { doctor_code: doctorCode } : {}) },
          { useCurrentDate: isReregister, doctorCode }
        );
        if (simrsRes && simrsRes.success) {
          if (idx !== -1) {
            db.bookings[idx].simrs_synced = true;
            db.bookings[idx].simrs_no_rawat = simrsRes.no_rawat;
            db.bookings[idx].simrs_no_reg = simrsRes.no_reg;
            db.bookings[idx].simrs_no_rkm_medis = simrsRes.no_rkm_medis;
            db.bookings[idx].simrs_synced_at = new Date().toISOString();
            db.bookings[idx].simrs_message = simrsRes.message;
            if (simrsRes.kd_dokter) {
              db.bookings[idx].doctor_code = simrsRes.kd_dokter;
              db.bookings[idx].doctor_name = simrsRes.nm_dokter;
            }
            if (isReregister) {
              db.bookings[idx].status = 'menunggu';
              db.bookings[idx].date = simrsRes.tgl_registrasi;
            }
            saveDb(db);
          }
          return sendJson(200, {
            success: true,
            ...simrsRes,
            booking: idx !== -1 ? db.bookings[idx] : bookingData
          });
        } else {
          return sendJson(500, { success: false, error: simrsRes.error || 'Gagal sinkronisasi ke SIMRS' });
        }
      } catch (e) {
        return sendJson(500, { success: false, error: e.message });
      }
    });
    return;
  }

  if (pathname === '/api/simrs/sync-all' && req.method === 'POST') {
    const db = getDb();
    const unsynced = (db.bookings || []).filter(b => !b.simrs_synced);
    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    (async () => {
      for (const b of unsynced) {
        try {
          const res = await syncBookingToSimrs(b);
          if (res && res.success) {
            b.simrs_synced = true;
            b.simrs_no_rawat = res.no_rawat;
            b.simrs_no_reg = res.no_reg;
            b.simrs_no_rkm_medis = res.no_rkm_medis;
            b.simrs_synced_at = new Date().toISOString();
            b.simrs_message = res.message;
            successCount++;
          } else {
            failedCount++;
            errors.push(`${b.patient?.fullName || b.id}: ${res.error || 'Gagal'}`);
          }
        } catch (e) {
          failedCount++;
          errors.push(`${b.patient?.fullName || b.id}: ${e.message}`);
        }
      }
      saveDb(db);
      return sendJson(200, {
        success: true,
        total: unsynced.length,
        successCount,
        failedCount,
        errors: errors.slice(0, 10)
      });
    })().catch(err => sendJson(500, { success: false, error: err.message }));
    return;
  }

  // Fallback 404
  return sendJson(404, { error: 'Endpoint API tidak ditemukan' });
}
