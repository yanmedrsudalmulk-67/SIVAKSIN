@echo off
title SIVAKSIN - RSUD AL-MULK
cd /d "%~dp0"

echo ====================================================
echo   SIVAKSIN - RSUD AL-MULK KOTA SUKABUMI
echo   Penyimpanan: Database Komputer Lokal (data/sivaksin_db.json)
echo   Alamat: http://localhost:3003
echo ====================================================
echo.

:: Pastikan Auto-Sync GitHub 2-arah berjalan di background
start "" wscript.exe "%~dp0Jalankan_AutoSync_Background.vbs"

:: Cek apakah server di port 3003 sudah aktif
powershell -NoProfile -Command "try { $res = Invoke-WebRequest -Uri 'http://localhost:3003/api/status' -TimeoutSec 1 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo Server SIVAKSIN sudah aktif.
) else (
    echo Memulai server lokal SIVAKSIN...
    start "SIVAKSIN Server" /min cmd /c "node server.js"
    timeout /t 2 /nobreak >nul
)

:: Buka browser ke localhost:3003
echo Membuka aplikasi di browser...
start http://localhost:3003

exit
