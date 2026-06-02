@echo off
title Server Sistema Solare 3D
echo =========================================
echo    Avviando il Sistema Solare 3D...
echo =========================================
echo.
echo Avvio del server Vite in corso...
echo Attendi qualche secondo, il browser si aprira' da solo!

:: Attende 2 secondi per dare tempo a Vite di partire, poi apre il browser
timeout /t 2 /nobreak > nul
start http://localhost:5173

:: Lancia il server locale di Node.js
npm run dev

pause