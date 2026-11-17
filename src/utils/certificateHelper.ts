export interface CertificateBookingLike {
  id: string;
  vaccineId?: string;
  vaccineIds?: string[];
  date: string;
  time?: string;
  status?: string;
  user_id?: string;
  created_at?: string;
  doctor_name?: string;
  vaccinator_name?: string;
  patient?: {
    name?: string;
    fullName?: string;
    nik?: string;
    email?: string;
    passport?: string;
    no_passport?: string;
    targetCountry?: string;
    negaraTujuan?: string;
    purpose?: string;
    e_icv_url?: string;
    e_icv_file_name?: string;
    e_icv_status?: string;
    e_icv_issued_at?: string;
    selectedVaccineNames?: string;
    selectedVaccines?: string[];
  };
}

export interface CertificateUserLike {
  id?: string;
  nik?: string;
  email?: string;
  name?: string;
}

export function isCertificateIssued(booking?: CertificateBookingLike | null): boolean {
  if (!booking) return false;
  return Boolean(
    booking.patient?.e_icv_url ||
      booking.patient?.e_icv_status === 'diterbitkan' ||
      booking.status === 'selesai'
  );
}

export function getVisibleCertificateBookings<T extends CertificateBookingLike>(
  bookings: T[],
  user: CertificateUserLike | null | undefined,
  role: string,
  searchQuery = ''
): T[] {
  const list = Array.isArray(bookings) ? bookings : [];

  const scoped =
    role === 'admin' || !user
      ? list
      : list.filter(
          (b) =>
            b.user_id === user.id ||
            (!b.user_id &&
              ((user.nik && b.patient?.nik === user.nik) ||
                (user.email &&
                  b.patient?.email?.toLowerCase() === user.email.toLowerCase())))
        );

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? scoped.filter((b) => {
        const name = (b.patient?.name || b.patient?.fullName || '').toLowerCase();
        const passport = (b.patient?.passport || b.patient?.no_passport || '').toLowerCase();
        const nik = (b.patient?.nik || '').toLowerCase();
        const id = (b.id || '').toLowerCase();
        return name.includes(q) || passport.includes(q) || nik.includes(q) || id.includes(q);
      })
    : scoped;

  return [...filtered].sort((a, b) => {
    const aIssued = isCertificateIssued(a) ? 1 : 0;
    const bIssued = isCertificateIssued(b) ? 1 : 0;
    if (bIssued !== aIssued) return bIssued - aIssued;
    return (b.created_at || b.date || '').localeCompare(a.created_at || a.date || '');
  });
}

export function getCertificateStats(bookings: CertificateBookingLike[]) {
  const total = bookings.length;
  const issued = bookings.filter((b) => isCertificateIssued(b)).length;
  const pending = Math.max(0, total - issued);
  return { total, issued, pending };
}
