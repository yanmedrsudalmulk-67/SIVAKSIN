import React from 'react';
import { useAppStore } from '../store/AppContext';

export function SukabumiCoatOfArms({ className = "w-20 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid meet" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      {/* Outer Shield Border */}
      <path
        d="M 12 10 L 88 10 C 88 10, 88 65, 50 112 C 12 65, 12 10, 12 10 Z"
        fill="url(#goldGrad)"
        stroke="#854d0e"
        strokeWidth="2"
      />
      {/* Inner Green Shield */}
      <path
        d="M 16 14 L 84 14 C 84 14, 84 62, 50 106 C 16 62, 16 14, 16 14 Z"
        fill="url(#shieldGrad)"
        stroke="#14532d"
        strokeWidth="1.5"
      />
      {/* Mountain & Fort / Gate */}
      <path
        d="M 32 46 L 50 28 L 68 46 L 68 70 L 32 70 Z"
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth="1.5"
      />
      {/* Gate window / opening */}
      <path
        d="M 44 56 C 44 52, 56 52, 56 56 L 56 70 L 44 70 Z"
        fill="#1e293b"
      />
      {/* Water / Waves */}
      <path
        d="M 22 75 Q 36 70 50 75 T 78 75 L 78 84 C 68 94, 58 100, 50 102 C 42 100, 32 94, 22 84 Z"
        fill="#0284c7"
      />
      <path
        d="M 26 78 Q 38 74 50 78 T 74 78"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      {/* Gold Ribbon / Pita */}
      <path
        d="M 8 98 Q 50 90 92 98 L 88 106 Q 50 98 12 106 Z"
        fill="url(#goldGrad)"
        stroke="#a16207"
        strokeWidth="1"
      />
      <text
        x="50"
        y="102"
        textAnchor="middle"
        fontSize="5"
        fontWeight="bold"
        fill="#713f12"
        fontFamily="sans-serif"
      >
        PRAJA GUPTA DHARMA
      </text>
      {/* Rice & Cotton wreath subtle */}
      <path
        d="M 24 22 Q 18 45 22 65"
        fill="none"
        stroke="#fef08a"
        strokeWidth="2"
        strokeDasharray="2 3"
      />
      <path
        d="M 76 22 Q 82 45 78 65"
        fill="none"
        stroke="#fef08a"
        strokeWidth="2"
        strokeDasharray="2 3"
      />
    </svg>
  );
}

export function RsudAlMulkLogo({ className = "w-20 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid meet" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Green Cross base */}
      <g>
        <rect x="36" y="10" width="28" height="74" rx="8" fill="#84cc16" />
        <rect x="13" y="33" width="74" height="28" rx="8" fill="#84cc16" />
      </g>
      {/* White center circle */}
      <circle cx="50" cy="47" r="23" fill="#ffffff" />
      {/* Red heart */}
      <path
        d="M 50 56 C 50 56, 36 47, 36 39 C 36 33, 42 32, 46 36 L 50 40 L 54 36 C 58 32, 64 33, 64 39 C 64 47, 50 56, 50 56 Z"
        fill="#dc2626"
      />
      {/* Cyan & Green caring hands / leaf inside circle */}
      <path
        d="M 40 46 C 42 54, 48 57, 50 57 C 52 57, 58 54, 60 46 C 56 50, 44 50, 40 46 Z"
        fill="#06b6d4"
      />
      {/* Official Text below logo */}
      <text
        x="50"
        y="96"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="900"
        fill="#0284c7"
        fontFamily="sans-serif"
        letterSpacing="0.2"
      >
        RSUD AL-MULK
      </text>
      <text
        x="50"
        y="106"
        textAnchor="middle"
        fontSize="6.5"
        fontWeight="700"
        fill="#16a34a"
        fontFamily="sans-serif"
      >
        Kota Sukabumi
      </text>
    </svg>
  );
}

interface OfficialDocHeaderProps {
  fontFamily?: string;
  className?: string;
}

export default function OfficialDocHeader({ fontFamily, className = '' }: OfficialDocHeaderProps = {}) {
  const { docLogoLeft, docLogoRight } = useAppStore();

  return (
    <div 
      className={`w-full text-black pb-2 ${className}`}
      style={fontFamily ? { fontFamily } : undefined}
    >
      <div className="flex items-center justify-between gap-1 sm:gap-2 px-1 sm:px-2">
        {/* Left: Logo Pemerintah Kota Sukabumi */}
        <div className="w-10 sm:w-20 md:w-24 print:w-24 shrink-0 flex items-center justify-center">
          {docLogoLeft ? (
            <img
              src={docLogoLeft}
              alt="Logo Pemerintah Kota Sukabumi"
              className="w-10 h-12 sm:w-16 sm:h-20 md:w-20 md:h-24 print:w-20 print:h-24 object-contain"
            />
          ) : (
            <SukabumiCoatOfArms className="w-10 h-12 sm:w-16 sm:h-20 md:w-20 md:h-24 print:w-20 print:h-24" />
          )}
        </div>

        {/* Center: Kop Surat Instansi Resmi */}
        <div className="flex-1 text-center leading-tight min-w-0">
          <h2 className="text-[10px] sm:text-[16px] md:text-[19px] print:text-[19px] font-black tracking-normal sm:tracking-wider uppercase text-black whitespace-nowrap sm:whitespace-normal" style={{ color: '#000000' }}>
            PEMERINTAH KOTA SUKABUMI
          </h2>
          <h3 className="text-[9px] sm:text-[15px] md:text-[18px] print:text-[18px] font-black tracking-normal sm:tracking-wider uppercase text-black mt-0.5 whitespace-nowrap sm:whitespace-normal" style={{ color: '#000000' }}>
            DINAS KESEHATAN
          </h3>
          <h1 className="text-[11px] sm:text-[17px] md:text-[21px] print:text-[21px] font-black tracking-tight sm:tracking-wide uppercase text-black mt-0.5 whitespace-nowrap sm:whitespace-normal" style={{ color: '#000000' }}>
            UOBK RSUD AL-MULK
          </h1>
          <p className="text-[7.5px] sm:text-[10.5px] md:text-[12px] print:text-[12px] font-semibold text-black mt-0.5 sm:mt-1 leading-tight sm:leading-snug" style={{ color: '#000000' }}>
            Jl. Pelabuhan II KM 6, Lembursitu Kota Sukabumi Tlp.(0266) 6243088
          </p>
          <p className="text-[7.5px] sm:text-[10.5px] md:text-[12px] print:text-[12px] font-semibold text-black leading-tight sm:leading-snug" style={{ color: '#000000' }}>
            Kode Pos 43169 email: <span className="underline font-bold" style={{ color: '#1e3a8a' }}>rsudalmulk@gmail.com</span>
          </p>
        </div>

        {/* Right: Logo RSUD Al-Mulk */}
        <div className="w-10 sm:w-20 md:w-24 print:w-24 shrink-0 flex items-center justify-center">
          {docLogoRight ? (
            <img
              src={docLogoRight}
              alt="Logo RSUD Al-Mulk"
              className="w-10 h-12 sm:w-16 sm:h-20 md:w-20 md:h-24 print:w-20 print:h-24 object-contain"
            />
          ) : (
            <RsudAlMulkLogo className="w-10 h-12 sm:w-16 sm:h-20 md:w-20 md:h-24 print:w-20 print:h-24" />
          )}
        </div>
      </div>

      {/* Official Black Separator Line */}
      <div className="w-full border-b-[3.5px] border-black mt-2" style={{ borderColor: '#000000' }}></div>
      <div className="w-full border-b-[1px] border-black mt-[1.5px]" style={{ borderColor: '#000000' }}></div>
    </div>
  );
}
