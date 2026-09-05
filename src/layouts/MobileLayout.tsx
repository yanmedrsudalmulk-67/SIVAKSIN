import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';

export default function MobileLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative w-full overflow-x-hidden font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 relative">
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}

