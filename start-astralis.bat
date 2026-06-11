@echo off
REM ASTRALIS Dev Server Launcher
REM Avvia Vite senza mostrare il terminale

cd /d "%~dp0"
start /min "" cmd /c "npm run dev"
timeout /t 2 /nobreak
start http://localhost:5173/
