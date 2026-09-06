import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import {
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight,
  User, Syringe, Globe, ArrowRight, Filter, Search,
  CheckCircle2, AlertCircle, FileCheck2, Printer
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { id } from 'date-fns/locale';

type ViewMode = 'agenda' | 'calendar';
type CalendarSubView = 'month' | 'week' | 'day';

export default function Schedule() {
  const navigate = useNavigate();
  const { bookings, vaccines, user, role } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [calendarSubView, setCalendarSubView] = useState<CalendarSubView>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'upcoming'>('all');

  // Parse booking date helper
  const getBookingDate = (b: any): Date | null => {
    if (!b?.date) return null;
    const d = new Date(b.date);
    if (!isNaN(d.getTime())) return d;
    const match = b.date.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    return null;
  };

  const getVaccineNames = (b: any): string => {
    const ids: string[] = Array.isArray(b.vaccineIds) && b.vaccineIds.length > 0
      ? b.vaccineIds
      : (Array.isArray(b.patient?.selectedVaccines) && b.patient.selectedVaccines.length > 0)
        ? b.patient.selectedVaccines
        : (b.vaccineId ? [b.vaccineId] : []);

    const matched = vaccines.filter(v => ids.includes(v.id));
    if (matched.length > 0) return matched.map(v => v.name).join(', ');
    return b.patient?.selectedVaccineNames || b.patient?.selectedVaccine || 'Vaksinasi Internasional';
  };

  // Filter and sort bookings by date and time
  const processedBookings = useMemo(() => {
    const list = bookings.filter((b) => {
      const bDate = getBookingDate(b);
      if (!bDate) return false;

      // Filter query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pName = (b.patient?.name || b.patient?.fullName || '').toLowerCase();
        const vName = getVaccineNames(b).toLowerCase();
        const country = (b.patient?.targetCountry || '').toLowerCase();
        if (!pName.includes(q) && !vName.includes(q) && !country.includes(q)) {
          return false;
        }
      }

      // Filter period
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bDay = new Date(bDate);
      bDay.setHours(0, 0, 0, 0);

      if (filterPeriod === 'today') {
        return bDay.getTime() === today.getTime();
      }
      if (filterPeriod === 'upcoming') {
        return bDay.getTime() >= today.getTime();
      }

      return true;
    });

    // Sort chronologically
    return list.sort((a, b) => {
      const dateA = getBookingDate(a)?.getTime() || 0;
      const dateB = getBookingDate(b)?.getTime() || 0;
      if (dateA !== dateB) return dateA - dateB;
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });
  }, [bookings, searchQuery, filterPeriod, vaccines]);

  // Group bookings by date for Agenda View
  const agendaGroups = useMemo(() => {
    const groups: { [dateStr: string]: { date: Date; items: any[] } } = {};

    processedBookings.forEach((b) => {
      const bDate = getBookingDate(b);
      if (!bDate) return;
      const key = format(bDate, 'yyyy-MM-dd');
      if (!groups[key]) {
        groups[key] = { date: bDate, items: [] };
      }
      groups[key].items.push(b);
    });

    return Object.values(groups).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [processedBookings]);

  // Calendar dates calculation
  const calendarDays = useMemo(() => {
    if (calendarSubView === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else if (calendarSubView === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      return [currentDate];
    }
  }, [calendarSubView, currentDate]);

  const prevPeriod = () => {
    if (calendarSubView === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (calendarSubView === 'week') {
      setCurrentDate(prev => addDays(prev, -7));
    } else {
      setCurrentDate(prev => addDays(prev, -1));
    }
  };

  const nextPeriod = () => {
    if (calendarSubView === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else if (calendarSubView === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      setCurrentDate(prev => addDays(prev, 1));
    }
  };

  // Bookings for the selected day in calendar view
  const selectedDayBookings = useMemo(() => {
    return bookings.filter(b => {
      const bDate = getBookingDate(b);
      return bDate && isSameDay(bDate, selectedDay);
    }).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [bookings, selectedDay]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-6 px-4 shadow-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>JADWAL VAKSINASI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-400/30 text-blue-200 border border-blue-300/30">
                  Senin - Jum'at
                </span>
              </h1>
              <p className="text-xs text-blue-100 font-medium">
                08.00 - 14.00 WIB • RSUD Al-Mulk Kota Sukabumi
              </p>
            </div>
          </div>

          {/* Switcher View: Agenda vs Calendar */}
          <div className="flex bg-blue-900/60 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Kalender
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-4 space-y-4">
        {/* Search & Filter Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pasien, vaksin, atau negara tujuan..."
              className="w-full h-10 pl-9 pr-4 text-xs font-semibold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {(['all', 'upcoming', 'today'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                  filterPeriod === period
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {period === 'all' ? 'Semua' : period === 'upcoming' ? 'Mendatang' : 'Hari Ini'}
              </button>
            ))}
          </div>
        </div>

        {/* 1. AGENDA VIEW (Format sesuai permintaan user) */}
        {viewMode === 'agenda' && (
          <div className="space-y-5">
            {agendaGroups.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
                <CalendarIcon size={36} className="text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 text-sm">Tidak Ada Jadwal Vaksinasi</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada pendaftaran vaksinasi yang dijadwalkan.'}
                </p>
              </div>
            ) : (
              agendaGroups.map((group) => {
                const dateHeader = format(group.date, 'dd MMMM yyyy', { locale: id });
                const dayName = format(group.date, 'EEEE', { locale: id });

                return (
                  <div key={dateHeader} className="space-y-2.5">
                    {/* Date Header matching user format */}
                    <div className="flex items-center justify-between px-2 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                        <h2 className="font-black text-slate-900 text-base tracking-tight">
                          {dateHeader}
                        </h2>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {dayName}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {group.items.length} Pasien Terjadwal
                      </span>
                    </div>

                    {/* Schedule items in format: 08.00 - [Vaccine] - [Patient Name] */}
                    <div className="space-y-2">
                      {group.items.map((item) => {
                        const vName = getVaccineNames(item);
                        const pName = item.patient?.name || item.patient?.fullName || 'Pasien';
                        const country = item.patient?.targetCountry || item.patient?.purpose || 'Umroh';

                        return (
                          <div
                            key={item.id}
                            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                              {/* Time Pill */}
                              <div className="w-16 h-12 bg-blue-50 text-blue-700 rounded-xl flex flex-col items-center justify-center shrink-0 border border-blue-100/80">
                                <span className="font-black text-sm leading-none">
                                  {item.time?.replace(' WIB', '') || '08:00'}
                                </span>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-500 mt-0.5">
                                  WIB
                                </span>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-black text-sm text-slate-900 truncate">
                                    {vName}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Globe size={11} /> {country}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                  <User size={13} className="text-slate-400" />
                                  <span className="text-slate-800 font-bold">{pName}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-400">ID #{item.id.substring(0, 8)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                onClick={() => navigate(`/informed-consent?id=${item.id}`)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Buka Dokumen Resmi & Informed Consent"
                              >
                                <FileCheck2 size={14} />
                                <span>Informed Consent</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. CALENDAR VIEW (Hari, Minggu, Bulan) */}
        {viewMode === 'calendar' && (
          <div className="space-y-4">
            {/* Sub-view selection: Hari, Minggu, Bulan */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPeriod}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-black text-slate-800 min-w-[160px] text-center">
                  {calendarSubView === 'month' && format(currentDate, 'MMMM yyyy', { locale: id })}
                  {calendarSubView === 'week' && `Minggu, ${format(currentDate, 'dd MMM yyyy', { locale: id })}`}
                  {calendarSubView === 'day' && format(currentDate, 'EEEE, dd MMMM yyyy', { locale: id })}
                </span>
                <button
                  onClick={nextPeriod}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['day', 'week', 'month'] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setCalendarSubView(sub)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      calendarSubView === sub
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sub === 'day' ? 'Hari' : sub === 'week' ? 'Minggu' : 'Bulan'}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Calendar Grid */}
            {calendarSubView === 'month' && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-2">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span className="text-rose-400">Sab</span>
                  <span className="text-rose-400">Min</span>
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day, idx) => {
                    const isCurMonth = isSameMonth(day, currentDate);
                    const isSelected = isSameDay(day, selectedDay);
                    const isToday = isSameDay(day, new Date());
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                    // Find bookings on this day
                    const dayBookings = bookings.filter(b => {
                      const d = getBookingDate(b);
                      return d && isSameDay(d, day);
                    });

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDay(day)}
                        className={`min-h-[58px] p-1.5 rounded-2xl flex flex-col items-center justify-between border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                            : isToday
                            ? 'border-indigo-300 bg-indigo-50/30'
                            : 'border-slate-100 hover:border-slate-300'
                        } ${!isCurMonth ? 'opacity-30' : ''}`}
                      >
                        <span
                          className={`text-xs font-extrabold ${
                            isSelected
                              ? 'text-blue-700'
                              : isWeekend
                              ? 'text-rose-500'
                              : 'text-slate-700'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>

                        {dayBookings.length > 0 && (
                          <div className="flex items-center gap-0.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            {dayBookings.length > 1 && (
                              <span className="text-[9px] font-bold text-blue-700 leading-none">
                                {dayBookings.length}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Schedule List for Selected Date */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <CalendarIcon size={16} className="text-blue-600" />
                  <span>Jadwal Tanggal: {format(selectedDay, 'dd MMMM yyyy', { locale: id })}</span>
                </h3>
                <span className="text-xs font-bold text-blue-600">
                  {selectedDayBookings.length} Pendaftar
                </span>
              </div>

              {selectedDayBookings.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Tidak ada jadwal pelayanan vaksinasi pada tanggal ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-blue-700">
                          {b.time || '08:00'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{getVaccineNames(b)}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {b.patient?.name || 'Pasien'} • Tujuan: {b.patient?.targetCountry || 'Umroh'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/informed-consent?id=${b.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs hover:bg-emerald-200 transition-colors cursor-pointer"
                      >
                        Formulir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
