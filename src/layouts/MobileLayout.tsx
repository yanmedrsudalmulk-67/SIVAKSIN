import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TravelNavbar } from '../components/TravelNavbar';
import { BottomNav } from '../components/BottomNav';

export default function MobileLayout() {
  const location = useLocation();

  const hidePaths = ['/splash', '/login', '/signup'];
  const isAuthPage = hidePaths.includes(location.pathname);

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full bg-slate-50">
        <Outlet />
      </main>
    );
  }

  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  return (
    <div className={`min-h-screen ${isHomePage ? 'bg-[#0038D1]' : 'bg-[#EEF2F6]'} flex flex-col font-sans antialiased text-slate-800 selection:bg-[#A7FF00]/30`}>
      {/* Top Travel Navbar with Glassmorphism */}
      <TravelNavbar />

      {/* Main Page Content */}
      <main className={`flex-1 w-full ${isHomePage ? '-mt-20' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
