@echo off
title SIVAKSIN - Push Perubahan ke GitHub Sekarang
color 0A
cd /d "%~dp0"

echo ====================================================================
echo         PUSH PEMBARUAN LOKAL SIVAKSIN KE GITHUB SEKARANG
echo   Target: https://github.com/yanmedrsudalmulk-67/SIVAKSIN
echo ====================================================================
echo.

git status --short
echo.
node scripts/sync-github.js --push

echo.
echo ====================================================================
echo  Proses sinkronisasi ke GitHub selesai! Jendela ini dapat ditutup.
echo ====================================================================
pause
