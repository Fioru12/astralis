@echo off
title Sistema Solare 3D - Produzione
cd /d "%~dp0"
echo Avvio Sistema Solare 3D in modalita produzione...
npm run build
npm run preview
pause
