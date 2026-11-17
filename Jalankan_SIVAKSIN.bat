@echo off
title SIVAKSIN - RSUD AL-MULK
color 0B
cd /d "%~dp0"

:: 1. Pastikan Auto-Sync GitHub 2-arah berjalan di background tanpa popup
start "" wscript.exe "%~dp0Jalankan_AutoSync_Background.vbs"

:: 2. Cek apakah server SIVAKSIN di port 3003 sudah aktif
curl -s -o nul --connect-timeout 1 http://127.0.0.1:3003/api/status >nul 2>&1
if %errorlevel% equ 0 (
    start "" "http://localhost:3003"
    exit /b 0
)

echo ====================================================================
echo             SIVAKSIN - UOBK RSUD AL-MULK KOTA SUKABUMI
echo                    Sistem Informasi Vaksinasi
echo ====================================================================
echo.
echo [1/3] Memeriksa pembaruan terbaru dari GitHub / AI Studio...
node scripts/sync-github.js --startup

echo [2/3] Menyalakan server lokal SIVAKSIN & Auto-Sync GitHub...
echo       Aplikasi akan terbuka di browser Anda secara otomatis.
echo.

:: Buka browser otomatis segera setelah server aktif
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "for ($i=0; $i -lt 30; $i++) { try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3003/api/status' -TimeoutSec 1 -UseBasicParsing; if ($r.StatusCode -eq 200) { Start-Process 'http://localhost:3003'; break } } catch {}; Start-Sleep -Milliseconds 500 }"

:: 3. Jalankan server lokal Node.js
echo [3/3] Server SIVAKSIN aktif di http://localhost:3003
node server.js

pause
