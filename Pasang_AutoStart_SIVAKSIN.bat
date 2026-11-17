@echo off
setlocal enabledelayedexpansion
title Pasang AutoStart SIVAKSIN Server & Auto-Sync GitHub
cd /d "%~dp0"

echo ====================================================================
echo   PASANG AUTO-START SIVAKSIN (PORT 3003 + AUTO-SYNC GITHUB)
echo ====================================================================
echo.
echo Skrip ini memasang pintasan di Windows Startup agar setiap kali
echo komputer dinyalakan:
echo  1. Server lokal SIVAKSIN (port 3003) aktif otomatis di background
echo  2. Auto-Sync 2-arah GitHub ^<-^> AI Studio langsung aktif otomatis
echo.

set "VBS_PATH=%~dp0Jalankan_AutoSync_Background.vbs"
set "WORK_DIR=%~dp0"
if "%WORK_DIR:~-1%"=="\" set "WORK_DIR=%WORK_DIR:~0,-1%"
set "STARTUP_LNK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\SIVAKSIN_AutoSync_Dan_Server.lnk"

powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%STARTUP_LNK%'); $sc.TargetPath = 'wscript.exe'; $sc.Arguments = ([char]34 + '%VBS_PATH%' + [char]34); $sc.WorkingDirectory = '%WORK_DIR%'; $sc.Description = 'Auto-Start Server SIVAKSIN Port 3003 dan Auto-Sync 2-Arah GitHub'; $sc.Save()"

if exist "%STARTUP_LNK%" (
    echo [OK] Auto-Start berhasil dipasang di:
    echo      %STARTUP_LNK%
    echo.
    echo [*] Mengaktifkan server SIVAKSIN ^& Auto-Sync GitHub sekarang...
    wscript.exe "%VBS_PATH%"
    echo [OK] SIVAKSIN siap di http://localhost:3003 dan tersinkron otomatis!
) else (
    echo [GAGAL] Tidak dapat membuat shortcut Windows Startup.
)

echo.
pause
