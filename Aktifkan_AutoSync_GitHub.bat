@echo off
title SIVAKSIN - Auto-Sync 2-Arah GitHub & AI Studio
color 0A
cd /d "%~dp0"

echo ====================================================================
echo         SIVAKSIN - PENGHUBUNG OTOMATIS GITHUB & AI STUDIO
echo   Repository: https://github.com/yanmedrsudalmulk-67/SIVAKSIN
echo ====================================================================
echo  Layanan latar belakang ini berjalan otomatis setiap 15 detik:
echo  [1] AUTO-PUSH : Setiap perubahan lokal langsung di-commit ^& push
echo                  ke GitHub (data pasien/KTP/.env tetap dilindungi)
echo  [2] AUTO-PULL : Setiap perubahan dari Google AI Studio di GitHub
echo                  otomatis ditarik, di-build, ^& me-restart port 3003
echo ====================================================================
echo.

node scripts/sync-github.js --watch
