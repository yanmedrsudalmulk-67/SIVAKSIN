/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import MobileLayout from './layouts/MobileLayout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Register from './pages/Register';
import History from './pages/History';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Certificate from './pages/Certificate';
import Status from './pages/Status';
import Notifications from './pages/Notifications';
import AnafilaktikKit from './pages/AnafilaktikKit';
import InformedConsent from './pages/InformedConsent';
import Schedule from './pages/Schedule';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/splash" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<MobileLayout />}>
            <Route path="/" element={<Navigate to="/splash" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/history" element={<History />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/informed-consent" element={<InformedConsent />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/status" element={<Status />} />
          </Route>

          <Route path="/anafilaktik" element={<AnafilaktikKit />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
