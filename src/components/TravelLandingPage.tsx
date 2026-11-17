import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Check, 
  Star, 
  MapPin, 
  Calendar, 
  Plane, 
  ShieldCheck, 
  Award, 
  Sparkles,
  Syringe,
  Stethoscope,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  User,
  Quote,
  Globe,
  FileText,
  QrCode,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export function TravelLandingPage() {
  const navigate = useNavigate();
  const { vaccines } = useAppStore();

  // Data Harga Dinamis Terintegrasi dari Menu Pengaturan Vaksin (AppContext)
  const vMeningitis = (vaccines || []).find(v => v.id === 'v1' || v.name.toLowerCase().includes('meningitis'));
  const vPolio = (vaccines || []).find(v => v.id === 'v2' || v.name.toLowerCase().includes('polio'));
  const vInfluenza = (vaccines || []).find(v => v.id === 'v3' || v.name.toLowerCase().includes('influenza') || v.name.toLowerCase().includes('flu'));

  const priceMeningitis = vMeningitis?.price ?? 320000;
  const pricePolio = vPolio?.price ?? 310000;
  const priceInfluenza = vInfluenza?.price ?? 250000;

  // Paket Bundling Wajib Umroh (Meningitis + Polio)
  const normalBundlingTotal = priceMeningitis + pricePolio;
  const priceBundling = 525000;
  const bundlingDiscount = Math.max(0, normalBundlingTotal - priceBundling);

  // Search State
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'cars' | 'experiences'>('flights');
  const [destination, setDestination] = useState('Arab Saudi (Makkah & Madinah)');
  const [departDate, setDepartDate] = useState('2026-06-12');
  const [returnDate, setReturnDate] = useState('2026-06-20');
  const [travelers, setTravelers] = useState('2 Adults (Paket Bundling)');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/register?dest=${encodeURIComponent(destination)}&date=${departDate}`);
  };

  const handleSelectPackage = (packageName: string) => {
    navigate(`/register?package=${encodeURIComponent(packageName)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-800 font-sans selection:bg-sky-200">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH 3D POP-UP BANNER (Full Viewport Height)              */}
      {/* Tema Warna: Deep Electric Cobalt Blue (#0038D1), Light Green (#A7FF00), */}
      {/* dan Pure White (#FFFFFF) dengan Blueprint Grid Pattern seperti referensi   */}
      {/* ========================================================================= */}
      <section 
        id="hero-section" 
        className="relative bg-gradient-to-b from-[#0038D1] via-[#0033BD] to-[#00299C] text-white min-h-screen flex flex-col justify-center pt-24 sm:pt-28 pb-10 sm:pb-14 overflow-hidden"
      >
        {/* Realistic Sky & Fluffy Clouds Background Layer (Exact Framed Clouds Matching Reference) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          <img 
            src="/hero_sky_clouds_bg.jpg" 
            alt="Langit Biru Cerah & Awan Putih Alami" 
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient overlays to blend seamlessly with SIVAKSIN royal blue theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0038D1]/20 via-transparent to-[#0038D1]/10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0038D1]/20 via-transparent to-[#00299C]/50"></div>
        </div>

        {/* Background Atmospheric Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A7FF00]/10 rounded-full blur-3xl pointer-events-none z-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0047FF]/30 rounded-full blur-3xl pointer-events-none z-10"></div>

        {/* Floating Animation Keyframes */}
        <style>{`
          @keyframes sivaksinFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-9px); }
          }
          @keyframes planeForwardBack {
            0%   { transform: translateX(0px); }
            30%  { transform: translateX(7px); }
            60%  { transform: translateX(-3px); }
            100% { transform: translateX(0px); }
          }
          @keyframes btnJellyEffect {
            0%   { transform: scale(1, 1); }
            20%  { transform: scale(1.18, 0.82); }
            40%  { transform: scale(0.86, 1.14); }
            60%  { transform: scale(1.09, 0.93); }
            80%  { transform: scale(0.97, 1.03); }
            90%  { transform: scale(1.02, 0.98); }
            100% { transform: scale(1, 1); }
          }
          .btn-jelly:hover, .btn-jelly:active {
            animation: btnJellyEffect 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          }
        `}</style>

        {/* Hero Content Container (2-Column Grid on Desktop) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* =================================================================== */}
            {/* LEFT COLUMN: Typography & CTA Buttons                               */}
            {/* =================================================================== */}
            <div className="lg:col-span-6 max-w-xl">
              
              {/* Big Bold Title */}
              <h1 className="font-['League_Spartan',sans-serif] text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.02] drop-shadow-[0_4px_16px_rgba(0,35,140,0.45)]">
                YOUR JOURNEY,<br />
                <span className="tracking-wide text-[#A7FF00]">
                  OUR CARE.
                </span>
              </h1>

              {/* Cursive Subtitle */}
              <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-serif italic text-white drop-shadow-[0_2px_10px_rgba(0,35,140,0.40)] font-medium tracking-wide">
                Travel Safe. Stay Protected.
              </p>

              {/* Subtext description */}
              <p className="mt-4 text-sm sm:text-base text-blue-50/95 leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,35,140,0.35)]">
                Perjalanan sehat dan aman dimulai dari sini. Layanan vaksinasi internasional untuk perjalanan luar negeri, Umroh dan Haji, serta penerbitan sertifikat <span className="whitespace-nowrap font-bold text-white">E-ICV</span> di RSUD Al-Mulk Kota Sukabumi.
              </p>

              {/* CTA Action Buttons: Tombol Daftar Vaksinasi (Warna Hijau #A7FF00 + Teks Hitam Kontras Tinggi) */}
              <div className="mt-7 flex items-center gap-3.5 flex-wrap">
                <button
                  onClick={() => navigate('/register')}
                  className="btn-jelly inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] transition-colors font-black text-base tracking-wide cursor-pointer select-none"
                >
                  <span>Daftar Vaksinasi</span>
                  <span className="text-lg inline-block" style={{ animation: 'planeForwardBack 1.4s ease-in-out infinite' }}>✈</span>
                </button>
              </div>

            </div>

            {/* =================================================================== */}
            {/* RIGHT COLUMN: 3D HERO BANNER (Menyatu Alami Tanpa Garis Card)       */}
            {/* Fitur: Pesawat 3D Real, Buku Kuning HD, Paspor RI, E-ICV HD, Vaksin */}
            {/* =================================================================== */}
            <div className="lg:col-span-6 flex items-center justify-center relative mt-8 lg:mt-0">
              
              {/* Outer 3D Scene Wrapper */}
              <div className="w-full max-w-[580px] lg:max-w-[620px] relative group select-none">
                
                {/* =============================================================== */}
                {/* 3D WHITE BROWSER CARD WINDOW                                    */}
                {/* Desain Card Keren dengan Frame Putih Elegan & Window Header    */}
                {/* =============================================================== */}
                <div className="w-full bg-white/95 backdrop-blur-md rounded-[38px] sm:rounded-[46px] p-2.5 sm:p-3.5 shadow-[0_28px_65px_rgba(0,56,209,0.28),0_12px_32px_rgba(15,23,42,0.12)] border-2 sm:border-[3px] border-white relative transition-all duration-500">
                  
                  {/* Browser Header Bar */}
                  <div className="flex items-center justify-between px-2.5 sm:px-4 pt-1.5 pb-2.5">
                    {/* 3 macOS style window action dots */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56] shadow-xs"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E] shadow-xs"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27C93F] shadow-xs"></div>
                    </div>

                    {/* Right Window Dots */}
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    </div>
                  </div>

                  {/* Inner Image Canvas (Ka'bah Makkah, Menara & Langit - Bersih Tanpa Botol Vaksin Background) */}
                  <div className="w-full h-[320px] sm:h-[370px] lg:h-[400px] rounded-[26px] sm:rounded-[34px] overflow-hidden relative shadow-inner">
                    <img 
                      src="/makkah_kabah_vaccine_bg.jpg" 
                      alt="3D Ka'bah Makkah & Menara Masjid Suci"
                      className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Atmospheric Blue Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0038D1]/20 via-transparent to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* =============================================================== */}
                {/* 1. PHOTOREALISTIC 3D POP-OUT AIRPLANE (DI DEPAN / TANPA GARIS)  */}
                {/* Posisi dinaikkan sedikit 1 baris sesuai permintaan user         */}
                {/* =============================================================== */}
                <div className="absolute -top-20 sm:-top-26 lg:-top-32 -right-2 sm:-right-8 w-[102%] sm:w-[108%] lg:w-[110%] max-w-none pointer-events-none z-30 transition-transform duration-700 group-hover:scale-105 group-hover:-translate-y-2">
                  <img 
                    src="/airplane_photorealistic_3d.png" 
                    alt="Photorealistic 3D Commercial Passenger Jet Airliner" 
                    className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)]"
                  />
                </div>

                {/* =============================================================== */}
                {/* 2. 3D DOKUMEN PERJALANAN (BUKU KUNING HD, PASPOR RI BARU, E-ICV)*/}
                {/* Diperkecil 1 angka proporsional sesuai permintaan user           */}
                {/* =============================================================== */}
                <div className="absolute -bottom-6 sm:-bottom-8 -left-3 sm:-left-6 z-30 flex items-end select-none pointer-events-auto">
                  
                  {/* Layer A: Sertifikat Digital E-ICV SatuSehat HD (Gambar No. 3) */}
                  <div className="relative transform -rotate-10 hover:rotate-0 hover:scale-105 transition-all duration-300 drop-shadow-[0_16px_26px_rgba(15,23,42,0.35)] -mr-5 sm:-mr-6 mb-1.5 cursor-pointer group/eicv">
                    <img 
                      src="/eicv_cert_hd.jpg" 
                      alt="Sertifikat E-ICV Kemenkes RI SatuSehat Resmi" 
                      className="w-14 sm:w-20 lg:w-24 h-auto object-contain rounded-xl border border-sky-100/90 shadow-xl"
                    />
                  </div>

                  {/* Layer B: Paspor Resmi Republik Indonesia Baru (Gambar No. 4) */}
                  <div className="relative z-10 transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 drop-shadow-[0_18px_30px_rgba(15,23,42,0.40)] -mr-5 sm:-mr-6 mb-1 cursor-pointer group/passport">
                    <img 
                      src="/passport_indonesia_3d.png" 
                      alt="Paspor Baru Resmi Republik Indonesia Biometrik" 
                      className="w-16 sm:w-22 lg:w-26 h-auto object-contain drop-shadow-lg"
                    />
                  </div>

                  {/* Layer C: Buku Kuning ICV HD (Gambar No. 2 Resmi Kemenkes RI) */}
                  <div className="relative z-20 transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300 drop-shadow-[0_22px_38px_rgba(15,23,42,0.45)] drop-shadow-[0_0_18px_rgba(234,179,8,0.35)] cursor-pointer group/book">
                    <img 
                      src="/buku_kuning_hd.jpg" 
                      alt="Buku Kuning Vaksinasi Internasional Republik Indonesia HD" 
                      className="w-18 sm:w-26 lg:w-30 h-auto object-contain rounded-xl border-2 border-yellow-300/80 shadow-2xl"
                    />
                  </div>

                </div>

                {/* =============================================================== */}
                {/* 3. 3D VAKSIN RESMI: BOTOL MENINGITIS & POLIO + SPUIT MEDIS      */}
                {/* =============================================================== */}
                <div className="absolute -bottom-5 sm:-bottom-7 -right-2 sm:-right-6 z-30 pointer-events-none transition-transform duration-500 group-hover:scale-105">
                  <img 
                    src="/vaccine_meningitis_polio_3d.png" 
                    alt="3D Vaksin Meningitis & Polio Resmi Bersama Spuit" 
                    className="w-40 sm:w-52 lg:w-60 h-auto object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.35)]"
                  />
                </div>

                {/* =============================================================== */}
                {/* Badge 1: Legalitas Resmi Kemenkes RI - Melayang Turun Naik di Kiri */}
                <div 
                  className="absolute top-20 sm:top-24 lg:top-28 -left-8 sm:-left-12 lg:-left-16 bg-white/95 backdrop-blur-md px-2.5 py-2 rounded-xl shadow-[0_14px_30px_rgba(15,23,42,0.18)] border border-white text-slate-800 flex items-center gap-2 z-40 hidden sm:flex transition-transform select-none"
                  style={{ animation: 'sivaksinFloat 3.5s ease-in-out infinite' }}
                >
                  <img 
                    src="/kemenkes_logo_tight.png" 
                    alt="Logo Resmi Kemenkes RI" 
                    className="h-6 sm:h-7 w-auto object-contain shrink-0"
                  />
                  <div className="flex flex-col justify-center">
                    <span className="text-[8.5px] font-bold text-[#0038D1] uppercase tracking-wider block leading-tight">Legalitas Resmi</span>
                    <span className="text-[11px] sm:text-xs font-black text-slate-800 leading-tight mt-0.5">Kemenkes RI SatuSehat</span>
                  </div>
                </div>

                {/* Badge 2: Sertifikat Digital E-ICV Terintegrasi APIIK - Melayang di Kanan di Atas Botol Vaksin */}
                <div 
                  className="absolute bottom-32 sm:bottom-36 lg:bottom-42 -right-4 sm:-right-8 lg:-right-10 bg-white/95 backdrop-blur-md px-2.5 py-2 rounded-xl shadow-[0_14px_30px_rgba(15,23,42,0.18)] border border-white text-slate-800 flex items-center gap-2 z-40 hidden sm:flex transition-transform select-none"
                  style={{ animation: 'sivaksinFloat 3.8s ease-in-out infinite 0.9s' }}
                >
                  <div className="w-6 h-6 rounded-lg bg-[#A7FF00] text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                    <QrCode size={14} strokeWidth={2.4} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[8.5px] font-bold text-[#0038D1] uppercase tracking-wider block leading-tight">SERTIFIKAT DIGITAL</span>
                    <span className="text-[11px] sm:text-xs font-black text-slate-800 leading-tight mt-0.5">E-ICV Terintegrasi APIIK</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Subtle Floating Scroll Down Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1 text-white/70 pointer-events-none select-none animate-bounce">
          <span className="text-[10px] tracking-widest uppercase font-bold text-sky-100">Scroll ke bawah</span>
          <ChevronDown size={16} className="text-white" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SEARCH / BOOKING WIDGET (Muncul Saat Scroll ke Bawah)                 */}
      {/* ========================================================================= */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        
        {/* Floating Card Outer Wrapper */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_24px_60px_rgba(15,23,42,0.12),0_4px_16px_rgba(2,132,199,0.06)] border border-slate-100 p-3 sm:p-5 relative">
          
          {/* Top Left Navigation Tabs */}
          <div className="flex items-center gap-2 sm:gap-4 border-b border-slate-100/80 pb-3 sm:pb-4 px-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'flights'
                  ? 'bg-[#A7FF00] text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Plane size={16} className={activeTab === 'flights' ? 'text-slate-950' : 'text-slate-400'} />
              <span>Vaksinasi Internasional</span>
            </button>

            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'hotels'
                  ? 'bg-[#A7FF00] text-slate-950 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Award size={16} className={activeTab === 'hotels' ? 'text-slate-950' : 'text-slate-400'} />
              <span>Paket Vaksinasi</span>
            </button>

            <button
              onClick={() => setActiveTab('cars')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'cars'
                  ? 'bg-[#A7FF00] text-slate-950 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck size={16} className={activeTab === 'cars' ? 'text-slate-950' : 'text-slate-400'} />
              <span>Vaksinasi Dewasa</span>
            </button>

            <button
              onClick={() => setActiveTab('experiences')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'experiences'
                  ? 'bg-[#A7FF00] text-slate-950 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles size={16} className={activeTab === 'experiences' ? 'text-slate-950' : 'text-slate-400'} />
              <span>Cek Sertifikat E-ICV</span>
            </button>
          </div>

          {/* Form Fields: Lokasi Pelayanan, Tujuan Perjalanan, Tanggal Vaksinasi, Tanggal Keberangkatan, Tombol Cek Jadwal */}
          <form onSubmit={handleSearchSubmit} className="pt-4 px-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4 items-center">
            
            {/* Field 1: Lokasi Pelayanan */}
            <div className="lg:col-span-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 transition-colors">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Lokasi Pelayanan
              </label>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin size={16} className="text-[#0038D1] shrink-0" />
                <input
                  type="text"
                  readOnly
                  value="Sukabumi, RSUD Al-Mulk"
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 outline-none cursor-default"
                />
              </div>
            </div>

            {/* Field 2: Tujuan Perjalanan */}
            <div className="lg:col-span-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 transition-colors">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tujuan Perjalanan
              </label>
              <div className="flex items-center gap-2 mt-0.5">
                <Plane size={16} className="text-[#0038D1] shrink-0" />
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Arab Saudi (Makkah & Madinah)">Arab Saudi (Makkah / Madinah)</option>
                  <option value="Paris, France">Paris, France (Eropa)</option>
                  <option value="Tokyo, Japan">Tokyo, Japan (Asia Timur)</option>
                  <option value="Istanbul, Turkey">Istanbul, Turkey</option>
                  <option value="Cairo, Egypt">Cairo, Egypt (Afrika)</option>
                </select>
              </div>
            </div>

            {/* Field 3: Tanggal Vaksinasi */}
            <div className="lg:col-span-2 bg-slate-50/80 hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 transition-colors">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tanggal Vaksinasi
              </label>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar size={15} className="text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Field 4: Tanggal Keberangkatan */}
            <div className="lg:col-span-2 bg-slate-50/80 hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 transition-colors">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tanggal Keberangkatan
              </label>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar size={15} className="text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Field 5: Tombol Cek Jadwal */}
            <div className="lg:col-span-2 flex items-center justify-center">
              <button
                type="submit"
                className="w-full h-14 rounded-2xl bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] font-black text-sm tracking-wide shadow-md shadow-[#A7FF00]/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Search size={18} strokeWidth={2.8} />
                <span>Cek Jadwal</span>
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VALUE PROPOSITION: 4 FEATURE CARDS                                     */}
      {/* Tema: Card Biru, Tulisan Putih, Card Icon Hijau, Isi Icon Hitam           */}
      {/* ========================================================================= */}
      <section id="value-propositions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Feature 1: Layanan Vaksinasi Internasional */}
          <div className="bg-[#0038D1] rounded-3xl p-6 shadow-[0_16px_36px_rgba(0,56,209,0.25)] border border-white/10 flex flex-col items-start gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#A7FF00] flex items-center justify-center shadow-md shadow-[#A7FF00]/25 group-hover:scale-110 transition-transform">
              <Syringe size={26} strokeWidth={2.5} className="text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Layanan Vaksinasi Internasional</h3>
              <p className="text-xs text-blue-100 font-medium mt-1 leading-relaxed">
                Melayani vaksinasi Meningitis, Polio, dan Influenza sesuai kebutuhan perjalanan serta indikasi medis.
              </p>
            </div>
          </div>

          {/* Feature 2: Skrining Medis & Keselamatan */}
          <div className="bg-[#0038D1] rounded-3xl p-6 shadow-[0_16px_36px_rgba(0,56,209,0.25)] border border-white/10 flex flex-col items-start gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#A7FF00] flex items-center justify-center shadow-md shadow-[#A7FF00]/25 group-hover:scale-110 transition-transform">
              <Stethoscope size={26} strokeWidth={2.5} className="text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Skrining Medis & Keselamatan</h3>
              <p className="text-xs text-blue-100 font-medium mt-1 leading-relaxed">
                Pemeriksaan kesehatan oleh dokter sebelum vaksinasi untuk memastikan kelayakan dan keamanan peserta.
              </p>
            </div>
          </div>

          {/* Feature 3: Pendaftaran & Jadwal Online */}
          <div className="bg-[#0038D1] rounded-3xl p-6 shadow-[0_16px_36px_rgba(0,56,209,0.25)] border border-white/10 flex flex-col items-start gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#A7FF00] flex items-center justify-center shadow-md shadow-[#A7FF00]/25 group-hover:scale-110 transition-transform">
              <CalendarCheck size={26} strokeWidth={2.5} className="text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Pendaftaran & Jadwal Online</h3>
              <p className="text-xs text-blue-100 font-medium mt-1 leading-relaxed">
                Pendaftaran melalui SIPRAJA untuk memudahkan peserta mengakses layanan dan menentukan jadwal vaksinasi.
              </p>
            </div>
          </div>

          {/* Feature 4: Sertifikat Vaksinasi E-ICV */}
          <div className="bg-[#0038D1] rounded-3xl p-6 shadow-[0_16px_36px_rgba(0,56,209,0.25)] border border-white/10 flex flex-col items-start gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#A7FF00] flex items-center justify-center shadow-md shadow-[#A7FF00]/25 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={26} strokeWidth={2.5} className="text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Sertifikat Vaksinasi E-ICV</h3>
              <p className="text-xs text-blue-100 font-medium mt-1 leading-relaxed">
                Penerbitan sertifikat vaksinasi internasional elektronik melalui sistem APIIK sesuai ketentuan yang berlaku.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. POPULAR PACKAGES SECTION                                               */}
      {/* ========================================================================= */}
      <section id="popular-packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              POPULAR PACKAGES
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Pilihan paket vaksinasi perjalanan internasional terpopuler jamaah Sukabumi.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/register')}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0038D1] hover:text-[#002DB3] transition-colors cursor-pointer group"
          >
            <span>View All Packages</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Popular Package Cards Grid matching Image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Greek Islands Escape */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_16px_36px_rgba(2,132,199,0.08)] border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="h-72 sm:h-80 w-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80"
                  alt="Greek Islands Escape"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#A7FF00] text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black shadow-xs">
                  Eropa & Mediterania
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#0038D1] transition-colors">
                  Greek Islands Escape
                </h3>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    Greece
                  </span>
                  <span>✈ 6 Days / 5 Nights</span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-slate-100/80 flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-slate-900">$1,299</div>
                <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">Per Person (Rp 525.000)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/50">
                  <Star size={12} fill="#F59E0B" className="text-amber-500" />
                  <span>4.8</span>
                </div>

                <button
                  onClick={() => handleSelectPackage('Greek Islands Escape / Wisata Eropa')}
                  className="w-9 h-9 rounded-full bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] hover:scale-105 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                  title="Pilih Paket Ini"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Paket Bundling Umroh (Poster Makkah & Umrah Air Penuh Rapi) */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_16px_36px_rgba(2,132,199,0.12)] border border-sky-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="h-72 sm:h-80 w-full overflow-hidden relative bg-white">
                <img
                  src="/makkah_umrah_poster.jpg"
                  alt="Paket Umroh Makkah - Umrah Air"
                  className="w-full h-full object-cover object-[center_45%] scale-[1.06] group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#A7FF00] text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black shadow-xs">
                  Paket Bundling Umroh
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#0038D1] transition-colors">
                  Paket Umroh Makkah
                </h3>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    Makkah, Arab Saudi
                  </span>
                  <span>✈ Meningitis + Polio</span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-slate-100/80 flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-[#0038D1]">Rp 525.000</div>
                <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5 whitespace-nowrap">Per Peserta (ICV & e-ICV)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/50">
                  <Star size={12} fill="#F59E0B" className="text-amber-500" />
                  <span>4.9</span>
                </div>

                <button
                  onClick={() => handleSelectPackage('Paket Umroh Makkah / Bundling Meningitis + Polio')}
                  className="w-9 h-9 rounded-full bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] hover:scale-105 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                  title="Pilih Paket Ini"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Canadian Rockies */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_16px_36px_rgba(2,132,199,0.08)] border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="h-72 sm:h-80 w-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80"
                  alt="Canadian Rockies"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#A7FF00] text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black shadow-xs">
                  Komplit Umroh & Haji
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#0038D1] transition-colors">
                  Canadian Rockies
                </h3>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    Canada
                  </span>
                  <span>✈ 7 Days / 6 Nights</span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-slate-100/80 flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-slate-900">$1,799</div>
                <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">Per Person (Rp 775.000)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/50">
                  <Star size={12} fill="#F59E0B" className="text-amber-500" />
                  <span>4.7</span>
                </div>

                <button
                  onClick={() => handleSelectPackage('Canadian Rockies / Komplit Haji & Umroh')}
                  className="w-9 h-9 rounded-full bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] hover:scale-105 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                  title="Pilih Paket Ini"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Japan Discovery */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_16px_36px_rgba(2,132,199,0.08)] border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="h-72 sm:h-80 w-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80"
                  alt="Japan Discovery"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#A7FF00] text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black shadow-xs">
                  Asia Timur & Flubio
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#0038D1] transition-colors">
                  Japan Discovery
                </h3>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    Japan
                  </span>
                  <span>✈ 8 Days / 7 Nights</span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-slate-100/80 flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-slate-900">$2,199</div>
                <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">Per Person (Rp 250.000)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/50">
                  <Star size={12} fill="#F59E0B" className="text-amber-500" />
                  <span>4.9</span>
                </div>

                <button
                  onClick={() => handleSelectPackage('Japan Discovery / Vaksin Influenza')}
                  className="w-9 h-9 rounded-full bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] hover:scale-105 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                  title="Pilih Paket Ini"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. DAFTAR HARGA VAKSIN SECTION                                           */}
      {/* Sesuai Permintaan User: 3 Vaksin (Meningitis, Polio, Influenza)          */}
      {/* ========================================================================= */}
      <section id="pricing-details" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Outer Container with Blue Gradient and 4 Vaccine Cards (overflow-visible for 3D Pop-Out effect) */}
        <div className="bg-gradient-to-r from-[#0038D1] via-[#0052FF] to-[#38BDF8] rounded-[36px] p-6 lg:p-10 shadow-[0_24px_60px_rgba(2,132,199,0.20)] relative overflow-visible">
          
          {/* Clipped inner atmospheric glow layer matching Hero Banner depth */}
          <div className="absolute inset-0 rounded-[36px] overflow-hidden pointer-events-none select-none z-0">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#A7FF00]/15 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl"></div>
          </div>

          {/* Header row inside the card */}
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 text-white">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
                DAFTAR HARGA VAKSIN
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 font-medium">
                Tarif resmi pelayanan vaksinasi internasional & penerbitan sertifikat E-ICV RSUD Al-Mulk Kota Sukabumi.
              </p>
            </div>
          </div>

          {/* 4 Vaccine Pricing Cards (Sleek, Compact, & Perfectly Aligned) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
            
            {/* 1. Vaksin Meningitis */}
            <div className="bg-white rounded-[24px] p-5 text-slate-800 shadow-xl flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="h-6 flex items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#A7FF00] text-slate-950 shadow-xs">
                    Wajib Umroh & Haji
                  </span>
                </div>

                <div className="mt-2 h-12 flex flex-col justify-start">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Vaksin Meningitis</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">Meningokokus ACWY (Menveo / Quadrivalent)</p>
                </div>

                <div className="my-3 pb-2.5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1 h-9">
                    <span className="text-sm font-bold text-slate-500">Rp</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{priceMeningitis.toLocaleString('id-ID')}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5 h-4 leading-tight truncate">Per Dosis / Peserta (Termasuk ICV)</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Perlindungan radang selaput otak (Meningokokus A, C, W135, Y)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Masa berlaku kekebalan 3 hingga 5 tahun</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Termasuk Buku Kuning Fisik (ICV) & E-ICV SatuSehat</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Wajib bagi seluruh jamaah Umroh & Haji</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate('/register?vaccine=Meningitis')}
                  className="w-full py-2.5 rounded-full bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] transition-all text-xs font-black shadow-md shadow-[#A7FF00]/30 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Pilih Vaksin Meningitis</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* 2. Vaksin Polio */}
            <div className="bg-white rounded-[24px] p-5 text-slate-800 shadow-xl flex flex-col justify-between relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-200">
              <div>
                <div className="h-6 flex items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#A7FF00] text-slate-950 shadow-xs">
                    Regulasi WHO & RI
                  </span>
                </div>

                <div className="mt-2 h-12 flex flex-col justify-start">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Vaksin Polio</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">Inactivated Poliovirus Vaccine (IPV Suntik)</p>
                </div>

                <div className="my-3 pb-2.5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1 h-9">
                    <span className="text-sm font-bold text-slate-500">Rp</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{pricePolio.toLocaleString('id-ID')}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5 h-4 leading-tight truncate">Per Dosis / Peserta</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Mencegah kelumpuhan & penularan virus polio liar</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Dosis tunggal suntik IPV, aman tanpa efek samping oral</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Sesuai Surat Edaran Kemenkes RI & Regulasi Arab Saudi</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Pencatatan langsung pada Buku Kuning & SatuSehat</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate('/register?vaccine=Polio')}
                  className="w-full py-2.5 rounded-full bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] transition-all text-xs font-black shadow-md shadow-[#A7FF00]/30 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Pilih Vaksin Polio</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* 3. Vaksin Influenza (Trivalen) */}
            <div className="bg-white rounded-[24px] p-5 text-slate-800 shadow-xl flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="h-6 flex items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#A7FF00] text-slate-950 shadow-xs">
                    Sangat Dianjurkan
                  </span>
                </div>

                <div className="mt-2 h-12 flex flex-col justify-start">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Vaksin Influenza</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">Trivalen (Flubio / Bio Farma)</p>
                </div>

                <div className="my-3 pb-2.5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1 h-9">
                    <span className="text-sm font-bold text-slate-500">Rp</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{priceInfluenza.toLocaleString('id-ID')}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5 h-4 leading-tight truncate">Per Dosis / Peserta (Proteksi 1 Tahun)</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Melindungi dari 3 strain virus influenza (Trivalen A & B)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Mencegah batuk pilek ekstrem & ISPA cuaca ekstrem</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Sangat direkomendasikan bagi lansia & jamaah risiko tinggi</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Menjaga stamina ibadah optimal tanpa demam</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate('/register?vaccine=Influenza')}
                  className="w-full py-2.5 rounded-full bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] transition-all text-xs font-black shadow-md shadow-[#A7FF00]/30 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Pilih Vaksin Influenza</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* 4. Paket Bundling Meningitis + Polio (POPULAR & HEMAT) */}
            <div className="bg-white rounded-[24px] p-5 text-slate-800 shadow-2xl flex flex-col justify-between relative z-10 border-2 border-[#A7FF00] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 mt-10 sm:mt-8 lg:mt-0 group/bundling">
              <div className="absolute -top-3 left-5 lg:left-1/2 lg:-translate-x-1/2 bg-[#A7FF00] text-slate-950 px-3.5 py-1 rounded-full text-[9.5px] font-black tracking-wider uppercase shadow-md whitespace-nowrap z-20">
                Paling Hemat & Populer
              </div>

              {/* 3D Pop-Out Hero Banner Floating Dual Vaccine Vials (Polio Kiri Nyerong Kiri + Meningitis Kanan Nyerong Kanan) */}
              <div className="absolute -top-14 right-1 sm:-top-16 sm:right-2 lg:-top-[182px] lg:-right-4 xl:-top-[194px] xl:-right-6 z-30 flex items-end pointer-events-auto select-none">
                {/* Soft Atmospheric 3D Glow Behind Vials (Tanpa Card Glassmorphism) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#38BDF8]/35 via-white/25 to-[#A7FF00]/35 blur-2xl pointer-events-none"></div>

                {/* Botol 1 (Kiri): Vaksin Polio 3D - Agak Nyerong ke Kiri & Melayang */}
                <div
                  className="relative z-10 flex flex-col items-center -mr-3 sm:-mr-4 lg:-mr-5 group/polio"
                  style={{ animation: 'sivaksinFloat 3.8s ease-in-out infinite 0.55s' }}
                >
                  <img
                    src="/assets/aistudio/Vaksin_Polio_Glossy_3D_Vial_12252e7e.png"
                    alt="Botol 3D Vaksin Polio Resmi"
                    className="w-[58px] sm:w-[68px] lg:w-[92px] xl:w-[100px] h-auto object-contain transform -rotate-[8deg] group-hover/polio:rotate-0 group-hover/polio:scale-105 transition-all duration-500 drop-shadow-[0_18px_28px_rgba(15,23,42,0.40)]"
                  />
                  <div className="w-10 sm:w-12 lg:w-16 h-2 -mt-1.5 rounded-full bg-slate-950/25 blur-sm pointer-events-none"></div>
                </div>

                {/* Botol 2 (Kanan): Vaksin Meningitis 3D - Agak Nyerong ke Kanan & Melayang */}
                <div
                  className="relative z-20 flex flex-col items-center group/meningitis"
                  style={{ animation: 'sivaksinFloat 3.5s ease-in-out infinite' }}
                >
                  <img
                    src="/assets/aistudio/Glossy_3D_Meningitis_Vaccine_Vial_d0ffed8a.png"
                    alt="Botol 3D Vaksin Meningitis Resmi"
                    className="w-[64px] sm:w-[74px] lg:w-[102px] xl:w-[112px] h-auto object-contain transform rotate-[7deg] group-hover/meningitis:rotate-0 group-hover/meningitis:scale-105 transition-all duration-500 drop-shadow-[0_22px_32px_rgba(15,23,42,0.45)]"
                  />
                  <div className="w-11 sm:w-13 lg:w-18 h-2.5 -mt-1.5 rounded-full bg-slate-950/30 blur-sm pointer-events-none"></div>
                </div>
              </div>

              <div>
                <div className="h-6 flex items-center pr-28 lg:pr-0">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shadow-xs">
                    Hemat Rp {bundlingDiscount.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="mt-2 h-12 flex flex-col justify-start pr-28 lg:pr-0">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Bundling Umroh</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">Meningitis ACWY + Polio IPV Lengkap</p>
                </div>

                <div className="my-3 pb-2.5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1.5 h-9">
                    <span className="text-sm font-bold text-[#0038D1]">Rp</span>
                    <span className="text-3xl font-black text-[#0038D1] tracking-tight">{priceBundling.toLocaleString('id-ID')}</span>
                    <span className="text-[11px] text-slate-400 line-through font-semibold ml-1">Rp {normalBundlingTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-bold block mt-0.5 h-4 leading-tight truncate">Paket Komplit (Buku Kuning / E-ICV)</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">2 Vaksin resmi sekaligus dalam 1 kali kunjungan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Terbit sertifikat vaksinasi internasional / E-ICV yang terintegrasi dengan Satu Sehat</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Konsultasi & skrining dokter vaksinator gratis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#0038D1] shrink-0 mt-0.5" />
                    <span className="leading-snug">Solusi lengkap & hemat persiapan Umroh & Haji</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate('/register?package=Bundling%20Wajib')}
                  className="w-full py-2.5 rounded-full bg-[#A7FF00] text-slate-950 hover:bg-[#97ea00] transition-all text-xs font-black shadow-lg shadow-[#A7FF00]/40 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Pilih Paket Bundling</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ALUR PELAYANAN VAKSINASI (HOW TO BOOK REPLACEMENT)                     */}
      {/* ========================================================================= */}
      <section id="how-to-book" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wide uppercase">
            ALUR PELAYANAN VAKSINASI
          </h2>
          <div className="w-16 h-1 bg-[#A7FF00] rounded-full mt-2"></div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-3">
            Mudah, terjadwal, dan terintegrasi secara digital
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Step 1: Pendaftaran Online */}
          <div className="flex flex-col items-center text-center relative group">
            <div className="w-20 h-20 rounded-3xl bg-sky-50 flex items-center justify-center border border-sky-100 shadow-sm group-hover:scale-110 transition-transform mb-4 text-[#0038D1]">
              <CalendarCheck size={32} strokeWidth={2.2} />
            </div>
            <h4 className="text-sm font-black text-slate-900">1. Pendaftaran Online</h4>
            <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-[220px] leading-relaxed">
              Daftarkan diri melalui SIPRAJA dan pilih jadwal pelayanan vaksinasi.
            </p>
          </div>

          {/* Step 2: Skrining Kesehatan */}
          <div className="flex flex-col items-center text-center relative group">
            <div className="w-20 h-20 rounded-3xl bg-sky-50 flex items-center justify-center border border-sky-100 shadow-sm group-hover:scale-110 transition-transform mb-4 text-[#0038D1]">
              <Stethoscope size={32} strokeWidth={2.2} />
            </div>
            <h4 className="text-sm font-black text-slate-900">2. Skrining Kesehatan</h4>
            <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-[220px] leading-relaxed">
              Lakukan pemeriksaan dan penilaian kelayakan vaksinasi oleh dokter.
            </p>
          </div>

          {/* Step 3: Pelayanan Vaksinasi */}
          <div className="flex flex-col items-center text-center relative group">
            <div className="w-20 h-20 rounded-3xl bg-sky-50 flex items-center justify-center border border-sky-100 shadow-sm group-hover:scale-110 transition-transform mb-4 text-[#0038D1]">
              <Syringe size={32} strokeWidth={2.2} />
            </div>
            <h4 className="text-sm font-black text-slate-900">3. Pelayanan Vaksinasi</h4>
            <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-[220px] leading-relaxed">
              Terima vaksin sesuai indikasi medis setelah persetujuan tindakan.
            </p>
          </div>

          {/* Step 4: Sertifikat Vaksinasi */}
          <div className="flex flex-col items-center text-center relative group">
            <div className="w-20 h-20 rounded-3xl bg-sky-50 flex items-center justify-center border border-sky-100 shadow-sm group-hover:scale-110 transition-transform mb-4 text-[#0038D1]">
              <FileCheck2 size={32} strokeWidth={2.2} />
            </div>
            <h4 className="text-sm font-black text-slate-900">4. Sertifikat Vaksinasi</h4>
            <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-[220px] leading-relaxed">
              Dapatkan E-ICV sesuai ketentuan atau dokumen vaksinasi yang berlaku.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. BOTTOM STATS BAR & TESTIMONIAL SECTION                                 */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Stats Bar: Informasi Layanan Vaksinasi (Gambar 4) */}
          <div className="lg:col-span-6 bg-[#0038D1] rounded-[32px] p-7 sm:p-8 text-white shadow-xl flex flex-col justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white tracking-wide">
                Informasi Layanan Vaksinasi
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 items-center text-center mt-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">03</div>
                <span className="text-xs text-blue-100 font-semibold mt-1">Jenis Vaksin</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">Online</div>
                <span className="text-xs text-blue-100 font-semibold mt-1">Pendaftaran</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">E-ICV</div>
                <span className="text-xs text-blue-100 font-semibold mt-1">Sertifikat Digital</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">Dokter</div>
                <span className="text-xs text-blue-100 font-semibold mt-1">Skrining Medis</span>
              </div>
            </div>
          </div>

          {/* Right Testimonial Card (Gambar 5) */}
          <div className="lg:col-span-6 bg-[#0038D1] rounded-[32px] p-7 sm:p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div>
              <Quote size={26} className="fill-white text-white mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                "Pendaftaran vaksinasi lebih mudah dengan sistem online. Alur pelayanan jelas, petugas memberikan penjelasan dengan baik, dan proses penerimaan dokumen vaksinasi menjadi lebih praktis."
              </p>
            </div>

            <div className="flex items-center gap-2.5 mt-5 pt-3">
              <div className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Contoh Testimoni Peserta
                </h5>
                <p className="text-[11px] text-blue-100 font-medium leading-tight mt-0.5">
                  Ilustrasi konten — belum merupakan ulasan pasien nyata
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER SECTION                                                         */}
      {/* ========================================================================= */}
      <footer id="contact-section" className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white">
              <Plane size={18} />
            </div>
            <div>
              <p className="text-white font-black text-sm">SIVAKSIN • RSUD AL-MULK KOTA SUKABUMI</p>
              <p className="text-[11px] text-slate-500">Poli MCU Vaksinasi Internasional</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <button onClick={() => navigate('/history')} className="hover:text-white transition-colors cursor-pointer">
              Buku Register
            </button>
            <button onClick={() => navigate('/certificate')} className="hover:text-white transition-colors cursor-pointer">
              E-ICV Sertifikat
            </button>
            <button onClick={() => navigate('/anafilaktik')} className="hover:text-white transition-colors cursor-pointer">
              Anafilaktik Kit
            </button>
            <button onClick={() => navigate('/profile')} className="hover:text-white transition-colors cursor-pointer">
              Profil & Akun
            </button>
          </div>

          <div className="text-slate-500 text-[11px]">
            &copy; 2026 SIVAKSIN. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
