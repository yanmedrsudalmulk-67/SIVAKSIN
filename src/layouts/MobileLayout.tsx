import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { DesktopSidebar } from '../components/DesktopSidebar';

export default function MobileLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative w-full overflow-x-hidden font-sans">
      {/* Desktop & Landscape Sidebar (Blue theme with white icons/text) */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8 relative">
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation - automatically hidden on md: and print */}
      <BottomNav />
    </div>
  );
}

