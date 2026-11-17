@echo off
title SIVAKSIN - Tarik Pembaruan dari GitHub & AI Studio
color 0B
cd /d "%~dp0"

echo ====================================================================
echo    TARIK PEMBARUAN SIVAKSIN DARI GITHUB / AI STUDIO SEKARANG
echo ====================================================================
echo.

node scripts/sync-github.js --ensure-server

echo.
echo ====================================================================
echo  Proses tarik pembaruan selesai! Anda dapat menutup jendela ini.
echo ====================================================================
pause
