@echo off
title Sistema Solare 3D - Apertura Browser
cd /d "%~dp0"
echo Compilazione progetto in corso...
call npm run build
echo.
echo Apertura nel browser...
start dist\index.html
echo Progetto aperto nel browser. Puoi chiudere questo terminale.
timeout /t 3 >nul
