import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';

export default function MobileLayout() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-0 sm:p-4 md:p-8 relative overflow-hidden w-full">
      {/* Decorative large blurred blobs in the background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[100px] pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-health-500/20 rounded-full blur-[100px] pointer-events-none hidden sm:block"></div>

      <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen sm:min-h-[850px] sm:h-[850px] sm:rounded-[48px] sm:border-[8px] sm:border-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col pt-safe px-safe z-10 custom-mobile-frame">
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-24 h-full relative z-10 w-full bg-slate-50">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}

