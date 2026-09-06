import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Globe, X } from 'lucide-react';
import { ALL_COUNTRIES, Country } from '../data/countries';

interface CountrySelectProps {
  value: string;
  onChange: (countryName: string) => void;
  placeholder?: string;
  error?: string;
}

export default function CountrySelect({
  value,
  onChange,
  placeholder = 'Pilih Negara Tujuan',
  error
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return ALL_COUNTRIES;
    const q = search.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedCountryObj = useMemo(() => {
    if (!value) return null;
    return ALL_COUNTRIES.find(
      c => c.name.toLowerCase() === value.toLowerCase() || c.nameEn.toLowerCase() === value.toLowerCase()
    );
  }, [value]);

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="text-[13px] font-extrabold text-slate-800 pl-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span>Negara Tujuan</span>
          <span className="text-red-500">*</span>
        </span>
        <span className="text-[11px] font-semibold text-slate-400">Seluruh Dunia (A–Z)</span>
      </label>

      {/* Select trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full h-[56px] lg:h-[60px] bg-white border rounded-[18px] lg:rounded-[20px] px-4 text-left flex items-center justify-between transition-all cursor-pointer shadow-xs ${
          isOpen
            ? 'border-blue-500 ring-4 ring-blue-500/10'
            : error
            ? 'border-rose-400 bg-rose-50/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            {selectedCountryObj ? (
              <span className="text-lg leading-none">{selectedCountryObj.flag}</span>
            ) : (
              <Globe size={18} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {selectedCountryObj ? (
              <div className="flex items-baseline gap-2 truncate">
                <span className="text-[14px] font-bold text-slate-800 truncate">
                  {selectedCountryObj.name}
                </span>
                <span className="text-[11px] font-medium text-slate-400 shrink-0">
                  ({selectedCountryObj.nameEn})
                </span>
              </div>
            ) : value ? (
              <span className="text-[14px] font-bold text-slate-800 truncate">{value}</span>
            ) : (
              <span className="text-[14px] font-semibold text-slate-400">{placeholder}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Hapus pilihan"
            >
              <X size={16} />
            </span>
          )}
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
          />
        </div>
      </button>

      {error && <p className="text-[11px] font-bold text-rose-600 pl-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[22px] border border-slate-200/90 shadow-[0_15px_40px_rgba(15,23,42,0.15)] z-50 overflow-hidden flex flex-col max-h-[340px] animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search bar inside dropdown */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70 sticky top-0 z-10">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari negara (misal: Arab Saudi, Jepang, Malaysia...)"
                className="w-full h-10 pl-9 pr-8 text-[13px] font-semibold text-slate-800 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex justify-between items-center px-1 mt-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Menampilkan {filteredCountries.length} negara</span>
              {search && <span>Filter aktif</span>}
            </div>
          </div>

          {/* List of Countries */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50 scroll-smooth p-1">
            {filteredCountries.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                Tidak ada negara yang cocok dengan "{search}"
              </div>
            ) : (
              filteredCountries.map((c: Country) => {
                const isSelected =
                  value?.toLowerCase() === c.name.toLowerCase() ||
                  value?.toLowerCase() === c.nameEn.toLowerCase();

                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c.name);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 text-blue-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-xl shrink-0 leading-none">{c.flag}</span>
                      <div className="min-w-0">
                        <span className={`text-[13px] block truncate ${isSelected ? 'font-black text-blue-900' : 'font-bold text-slate-800'}`}>
                          {c.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {c.nameEn} • {c.code}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
