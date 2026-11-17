import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getVisibleCertificateBookings,
  getCertificateStats,
  isCertificateIssued,
} from '../src/utils/certificateHelper';

const sampleBookings = [
  {
    id: 'BK-2026-001',
    user_id: 'u_2',
    date: '2026-09-10',
    status: 'menunggu',
    patient: {
      name: 'Adi Tresa Purnama',
      nik: '3202332304890002',
      passport: 'E872888',
      e_icv_status: 'menunggu',
    },
  },
  {
    id: 'BK-RSAM01',
    date: '2026-06-10',
    status: 'selesai',
    patient: {
      name: 'Budi Santoso',
      nik: '3272010101900001',
      passport: 'A9821321',
      e_icv_status: 'diterbitkan',
    },
  },
  {
    id: 'BK-PDF-01',
    user_id: 'u_3',
    date: '2026-08-12',
    status: 'selesai',
    patient: {
      name: 'Siti Aminah',
      nik: '3272010101900099',
      passport: 'B1122334',
      e_icv_url: '/uploads/eicv_siti.pdf',
      e_icv_status: 'diterbitkan',
    },
  },
];

test('isCertificateIssued detects uploaded PDF, diterbitkan status, and selesai status', () => {
  assert.equal(isCertificateIssued(sampleBookings[0]), false);
  assert.equal(isCertificateIssued(sampleBookings[1]), true);
  assert.equal(isCertificateIssued(sampleBookings[2]), true);
  assert.equal(isCertificateIssued(null), false);
});

test('getVisibleCertificateBookings returns populated bookings for guest/admin sorted by issued first', () => {
  const guestVisible = getVisibleCertificateBookings(sampleBookings, null, 'guest');
  assert.equal(guestVisible.length, 3);
  assert.equal(isCertificateIssued(guestVisible[0]), true);

  const adminVisible = getVisibleCertificateBookings(sampleBookings, { id: 'u_admin' }, 'admin');
  assert.equal(adminVisible.length, 3);
});

test('getVisibleCertificateBookings scopes regular user to own bookings by id or nik', () => {
  const byId = getVisibleCertificateBookings(sampleBookings, { id: 'u_2' }, 'user');
  assert.deepEqual(byId.map((b) => b.id), ['BK-2026-001']);

  const byNik = getVisibleCertificateBookings(
    sampleBookings,
    { id: 'u_demo_1', nik: '3272010101900001' },
    'user'
  );
  assert.deepEqual(byNik.map((b) => b.id), ['BK-RSAM01']);
});

test('getVisibleCertificateBookings filters by search query across name, passport, nik, and id', () => {
  const res = getVisibleCertificateBookings(sampleBookings, null, 'guest', 'A9821321');
  assert.deepEqual(res.map((b) => b.id), ['BK-RSAM01']);

  const resName = getVisibleCertificateBookings(sampleBookings, null, 'guest', 'aminah');
  assert.deepEqual(resName.map((b) => b.id), ['BK-PDF-01']);
});

test('getCertificateStats computes issued and pending counts accurately', () => {
  const stats = getCertificateStats(sampleBookings);
  assert.deepEqual(stats, { total: 3, issued: 2, pending: 1 });
});
