import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  MoreVertical, 
  Activity, 
  CalendarCheck,
  BookOpen,
  CalendarX,
  Package,
  CreditCard,
  Radio
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export function DesktopHomeDashboard() {
  const { bookings, vaccines } = useAppStore();
  const navigate = useNavigate();
  const [showChartDropdown, setShowChartDropdown] = useState(false);

  // Computations for real SIVAKSIN data
  const totalBookings = bookings.length;
  const verifiedCount = bookings.filter(b => b.status === 'selesai' || b.status === 'terverifikasi').length;
  const postponedCount = bookings.filter(b => b.status === 'ditunda').length;
  const waitingCount = bookings.filter(b => b.status === 'menunggu').length;
  const totalStockDoses = vaccines.reduce((sum, v) => sum + (v.stock || 0), 0);

  // Monthly stats for chart (Exact Match to Image)
  const months = [
    { label: 'Feb', height: 42, count: 28 },
    { label: 'Mar', height: 85, count: 64, active: true },
    { label: 'Apr', height: 60, count: 42 },
    { label: 'May', height: 98, count: 78 },
    { label: 'Jun', height: 70, count: 53 },
    { label: 'Jul', height: 50, count: 36 },
    { label: 'Aug', height: 65, count: 48 },
    { label: 'Sep', height: 75, count: 56 },
  ];

  // Recent bookings for bottom history row
  const recentBookings = bookings.slice(-4).reverse();

  return (
    <div className="space-y-7 pb-6 select-none font-sans">
      
      {/* Hidden SVG Definitions for Custom Wave Notch Clip Path */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="purpleCardWaveNotch" clipPathUnits="objectBoundingBox">
            <path d="M 0, 0.09 C 0, 0.03, 0.03, 0, 0.08, 0 C 0.16, 0, 0.22, 0.07, 0.35, 0.07 L 0.65, 0.07 C 0.78, 0.07, 0.84, 0, 0.92, 0 C 0.97, 0, 1, 0.03, 1, 0.09 L 1, 0.92 C 1, 0.97, 0.96, 1, 0.9, 1 L 0.1, 1 C 0.04, 1, 0, 0.97, 0, 0.92 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ========================================================================= */}
      {/* 1. TOP ROW: "BILLS" CARDS (Exact Match to Image 2 with Right Notch Tab)   */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-2">
            <span>Bills</span>
          </h2>
          <ChevronDown size={16} className="text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          
          {/* Card 1: Ready to assign (Dark Blue Accent Tab on Right) */}
          <div className="bg-white rounded-[26px] p-5 shadow-[0_16px_36px_rgba(110,120,200,0.10),0_4px_12px_rgba(15,23,42,0.03)] border border-slate-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            {/* Right Edge Colored Accent Tab with Signature Curved Notch */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-20 pointer-events-none flex items-center justify-end">
              <svg viewBox="0 0 16 80" fill="none" className="w-4 h-20 drop-shadow-sm">
                <defs>
                  <linearGradient id="notchBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E40AF" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <path
                  d="M 16 0 C 16 12, 4 16, 4 28 L 4 52 C 4 64, 16 68, 16 80 L 16 80 Z"
                  fill="url(#notchBlueGrad)"
                />
              </svg>
            </div>

            <div className="flex items-start justify-between pr-4">
              {/* Top-Left Squircle Line Icon matching Image 2 */}
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800">
                <CalendarCheck size={20} strokeWidth={1.8} />
              </div>

              {/* Top-Right Circular Progress Meter (+42%) matching Image 2 */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(215, 225, 245, 0.5)" strokeWidth="2.8" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#2563EB" strokeWidth="2.8" strokeDasharray="88" strokeDashoffset="51" strokeLinecap="round" />
                  <circle cx="28" cy="8" r="2.2" fill="#2563EB" />
                </svg>
                <span className="absolute text-[10px] font-black text-slate-800">+42%</span>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-400 block">Ready to assign</span>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">200 <span className="text-slate-400 font-bold">- 42</span></h3>
              </div>
              <p className="text-[10px] font-medium text-slate-400 mt-2">Bills in this week 221</p>
            </div>
          </div>

          {/* Card 2: Pending sign offs (Cyan Accent Tab on Right) */}
          <div className="bg-white rounded-[26px] p-5 shadow-[0_16px_36px_rgba(110,120,200,0.10),0_4px_12px_rgba(15,23,42,0.03)] border border-slate-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            {/* Right Edge Cyan Accent Tab with Signature Curved Notch */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-20 pointer-events-none flex items-center justify-end">
              <svg viewBox="0 0 16 80" fill="none" className="w-4 h-20 drop-shadow-sm">
                <defs>
                  <linearGradient id="notchCyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0284C7" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
                <path
                  d="M 16 0 C 16 12, 4 16, 4 28 L 4 52 C 4 64, 16 68, 16 80 L 16 80 Z"
                  fill="url(#notchCyanGrad)"
                />
              </svg>
            </div>

            <div className="flex items-start justify-between pr-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800">
                <BookOpen size={20} strokeWidth={1.8} />
              </div>

              {/* Circular Progress Meter (+22%) */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(215, 225, 245, 0.5)" strokeWidth="2.8" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#0EA5E9" strokeWidth="2.8" strokeDasharray="88" strokeDashoffset="68" strokeLinecap="round" />
                  <circle cx="28" cy="11" r="2.2" fill="#0EA5E9" />
                </svg>
                <span className="absolute text-[10px] font-black text-slate-800">+22%</span>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-400 block">Pending sign offs</span>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">63 <span className="text-slate-400 font-bold">- 17</span></h3>
              </div>
              <p className="text-[10px] font-medium text-slate-400 mt-2">Signed off in this week 221</p>
            </div>
          </div>

          {/* Card 3: Declined (Purple Accent Tab on Right) */}
          <div className="bg-white rounded-[26px] p-5 shadow-[0_16px_36px_rgba(110,120,200,0.10),0_4px_12px_rgba(15,23,42,0.03)] border border-slate-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            {/* Right Edge Purple Accent Tab with Signature Curved Notch */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-20 pointer-events-none flex items-center justify-end">
              <svg viewBox="0 0 16 80" fill="none" className="w-4 h-20 drop-shadow-sm">
                <defs>
                  <linearGradient id="notchPurpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <path
                  d="M 16 0 C 16 12, 4 16, 4 28 L 4 52 C 4 64, 16 68, 16 80 L 16 80 Z"
                  fill="url(#notchPurpleGrad)"
                />
              </svg>
            </div>

            <div className="flex items-start justify-between pr-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800">
                <CalendarX size={20} strokeWidth={1.8} />
              </div>

              {/* Circular Progress Meter (-5%) */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(215, 225, 245, 0.5)" strokeWidth="2.8" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#8B5CF6" strokeWidth="2.8" strokeDasharray="88" strokeDashoffset="83" strokeLinecap="round" />
                  <circle cx="28" cy="14" r="2.2" fill="#8B5CF6" />
                </svg>
                <span className="absolute text-[10px] font-black text-rose-500">-5%</span>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-400 block">Declined</span>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">5</h3>
              </div>
              <p className="text-[10px] font-medium text-slate-400 mt-2">Declined this week 2</p>
            </div>
          </div>

          {/* Card 4: RFI (Emerald Green Accent Tab on Right) */}
          <div className="bg-white rounded-[26px] p-5 shadow-[0_16px_36px_rgba(110,120,200,0.10),0_4px_12px_rgba(15,23,42,0.03)] border border-slate-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            {/* Right Edge Emerald Accent Tab with Signature Curved Notch */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-20 pointer-events-none flex items-center justify-end">
              <svg viewBox="0 0 16 80" fill="none" className="w-4 h-20 drop-shadow-sm">
                <defs>
                  <linearGradient id="notchGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                <path
                  d="M 16 0 C 16 12, 4 16, 4 28 L 4 52 C 4 64, 16 68, 16 80 L 16 80 Z"
                  fill="url(#notchGreenGrad)"
                />
              </svg>
            </div>

            <div className="flex items-start justify-between pr-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800">
                <Package size={20} strokeWidth={1.8} />
              </div>

              {/* Circular Progress Meter (+5%) */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(215, 225, 245, 0.5)" strokeWidth="2.8" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="2.8" strokeDasharray="88" strokeDashoffset="75" strokeLinecap="round" />
                  <circle cx="28" cy="10" r="2.2" fill="#10B981" />
                </svg>
                <span className="absolute text-[10px] font-black text-slate-800">+5%</span>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-400 block">RFI</span>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">13 <span className="text-slate-400 font-bold">- 17</span></h3>
              </div>
              <p className="text-[10px] font-medium text-slate-400 mt-2">Requested this week 2</p>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MIDDLE ROW: "INVOICES" & MONTHLY BAR CHART                             */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-2">
            <span>Invoices</span>
          </h2>
          <ChevronDown size={16} className="text-slate-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Card A: Vibrant Purple Card with Signature Wave Top Notch (Exact Match to Image 1) */}
          <div className="lg:col-span-4 filter drop-shadow-[0_20px_45px_rgba(109,40,217,0.30)] flex flex-col">
            <div 
              style={{ clipPath: 'url(#purpleCardWaveNotch)' }}
              className="bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] p-6 text-white relative overflow-hidden flex flex-col justify-between flex-1 min-h-[320px]"
            >
              {/* Top right more dots */}
              <div className="flex justify-end pt-1 pr-1 relative z-10">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                  <MoreVertical size={14} className="text-white" />
                </div>
              </div>

              {/* Center Gauge Arc (Neon Green to Yellow arc with 45% matching Image 1) */}
              <div className="relative flex flex-col items-center justify-center my-auto py-1 z-10">
                <div className="relative w-44 h-24 flex items-end justify-center">
                  <svg className="w-44 h-24 overflow-visible" viewBox="0 0 160 85">
                    <path
                      d="M 15 80 A 65 65 0 0 1 145 80"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 15 80 A 65 65 0 0 1 115 35"
                      fill="none"
                      stroke="url(#neonGaugeGrad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="neonGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22C55E" />
                        <stop offset="60%" stopColor="#EAB308" />
                        <stop offset="100%" stopColor="#FACC15" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Percentage in center */}
                  <div className="absolute bottom-1 inset-x-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-white tracking-tight">45%</span>
                    {/* Small line chart badge below gauge */}
                    <div className="mt-1 p-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20">
                      <Activity size={13} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Amount Owed & Stats matching Image 1 */}
              <div className="relative z-10 pt-2 text-center">
                <span className="text-[11px] font-semibold text-purple-200 block">Amount Owed</span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-0.5">$933,879.45</h3>
                <p className="text-[11px] font-bold text-purple-200/90 mt-0.5">$126,783.89</p>
              </div>
            </div>
          </div>

          {/* Card B: Center 2 Stacked Cards (Paid Invoices & Live Jobs Value) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Top Subcard: Paid Invoices */}
            <div className="flex-1 bg-white rounded-[26px] p-5 shadow-[0_16px_36px_rgba(110,120,200,0.10),0_4px_12px_rgba(15,23,42,0.03)] border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden">
              {/* Right Edge Dark Slate Curved Notch Tab */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-18 pointer-events-none flex items-center justify-end">
                <svg viewBox="0 0 16 72" fill="none" className="w-4 h-18 drop-shadow-sm">
                  <path
                    d="M 16 0 C 16 10, 4 14, 4 24 L 4 48 C 4 58, 16 62, 16 72 Z"
                    fill="#1E293B"
                  />
                </svg>
              </div>

              <div className="flex items-start justify-between pr-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800">
                  <CreditCard size={20} strokeWidth={1.8} />
                </div>
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(215, 225, 245, 0.5)" strokeWidth="2.8" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#0F172A" strokeWidth="2.8" strokeDasharray="88" strokeDashoffset="75" strokeLinecap="round" />
                    <circle cx="28" cy="10" r="2.2" fill="#0F172A" />
                  </svg>
                  <span className="absolute text-[9px] font-black text-slate-800">+5%</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-400 block">Paid Invoices</span>
                <h4 className="text-xl font-black text-slate-900 mt-0.5">$9,034.,49</h4>
                <p className="text-[10px] font-medium text-slate-400 mt-1">Current Financial Year</p>
              </div>
            </div>

            {/* Bottom Subcard: Live Jobs Value */}
            <div className="flex-1 bg-white rounded-[26px] p-5 shadow-[0_16px_36px_rgba(110,120,200,0.10),0_4px_12px_rgba(15,23,42,0.03)] border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden">
              {/* Right Edge Purple Curved Notch Tab */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-18 pointer-events-none flex items-center justify-end">
                <svg viewBox="0 0 16 72" fill="none" className="w-4 h-18 drop-shadow-sm">
                  <path
                    d="M 16 0 C 16 10, 4 14, 4 24 L 4 48 C 4 58, 16 62, 16 72 Z"
                    fill="#7C3AED"
                  />
                </svg>
              </div>

              <div className="flex items-start justify-between pr-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800">
                  <Radio size={20} strokeWidth={1.8} />
                </div>
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(215, 225, 245, 0.5)" strokeWidth="2.8" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#7C3AED" strokeWidth="2.8" strokeDasharray="88" strokeDashoffset="18" strokeLinecap="round" />
                    <circle cx="28" cy="10" r="2.2" fill="#7C3AED" />
                  </svg>
                  <span className="absolute text-[9px] font-black text-purple-700">85%</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-400 block">Live Jobs Value</span>
                <h4 className="text-xl font-black text-slate-900 mt-0.5">$23,7,8.32</h4>
                <p className="text-[10px] font-medium text-slate-400 mt-1">Current Financial Year</p>
              </div>
            </div>

          </div>

          {/* Card C: Monthly Bar Chart (Exact Match to Image 1) */}
          <div className="lg:col-span-5 bg-white rounded-[26px] p-6 shadow-[0_16px_36px_rgba(110,120,200,0.10),0_4px_12px_rgba(15,23,42,0.03)] border border-slate-100 flex flex-col justify-between relative">
            
            {/* Top Bar Options & Dropdown */}
            <div className="flex items-center justify-end relative z-10">
              <button 
                onClick={() => setShowChartDropdown(!showChartDropdown)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <MoreVertical size={16} />
              </button>

              {/* Floating Menu Popover matching Image */}
              {showChartDropdown && (
                <div className="absolute right-0 top-8 w-44 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-30 text-xs">
                  <button 
                    onClick={() => setShowChartDropdown(false)}
                    className="w-full text-left px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                  >
                    Yearly Statement
                  </button>
                  <button 
                    onClick={() => {
                      setShowChartDropdown(false);
                      navigate('/history');
                    }}
                    className="w-full text-left px-3 py-2 text-slate-900 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    View History
                  </button>
                </div>
              )}
            </div>

            {/* Bars Visualization Container (Feb - Sep) */}
            <div className="h-48 pt-6 flex items-end justify-between gap-2 px-2 relative">
              {months.map((m) => (
                <div key={m.label} className="flex-1 flex flex-col items-center h-full justify-end relative group">
                  
                  {/* Floating active marker badge matching 'Mar 2021' from Image 1 */}
                  {m.active && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 rounded-lg shadow-md border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-800 whitespace-nowrap z-20">
                      Mar 2021
                      {/* Downward triangle arrow */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-slate-100"></div>
                    </div>
                  )}

                  {/* Vertical Bar (Rounded pill matching Image) */}
                  <div 
                    style={{ height: `${m.height}%` }}
                    className={`w-full max-w-[24px] rounded-xl transition-all duration-300 group-hover:scale-105 ${
                      m.active 
                        ? 'bg-[#6366F1] shadow-md shadow-indigo-500/30' 
                        : 'bg-[#818CF8]/80 hover:bg-[#6366F1]'
                    }`}
                  ></div>

                  {/* Month Label */}
                  <span className={`text-[11px] font-bold mt-2 ${
                    m.active ? 'text-indigo-600 font-black' : 'text-slate-400 group-hover:text-slate-700'
                  }`}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ROW: "HISTORY" TABLE (Exact Match to Image 1)                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-[26px] p-5 lg:p-6 shadow-[0_16px_36px_rgba(110,120,200,0.10),0_4px_12px_rgba(15,23,42,0.03)] border border-slate-100">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-2">
            <span>History</span>
          </h2>
          <ChevronDown size={16} className="text-slate-400" />
        </div>

        {/* History Item Row matching Image 1 */}
        <div className="divide-y divide-slate-100 text-xs">
          {recentBookings.slice(0, 1).map((b, index) => {
            return (
              <div 
                key={b.id || index}
                onClick={() => navigate('/history')}
                className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-50/80 rounded-2xl transition-all cursor-pointer group"
              >
                {/* Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Leon
                  </span>
                </div>

                {/* Time */}
                <div className="text-slate-400 font-semibold text-xs">
                  12:42:00 PM
                </div>

                {/* Amount */}
                <div className="font-bold text-slate-700 text-xs">
                  $1200.00
                </div>

                {/* Installments */}
                <div className="text-slate-400 font-semibold text-xs hidden sm:block">
                  Installments
                </div>

                {/* Balance */}
                <div className="text-slate-400 font-semibold text-xs hidden md:block">
                  Balance
                </div>

                {/* History */}
                <div className="text-slate-400 font-semibold text-xs hidden lg:block">
                  History
                </div>

                {/* Status Pill matching Image */}
                <div>
                  <span className="px-4 py-1.5 rounded-full text-[11px] font-bold text-emerald-600 bg-emerald-50/80 border border-emerald-200 shadow-2xs">
                    Completed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
