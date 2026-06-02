@echo off
title Build Production - Sistema Solare
echo =========================================
echo   Build Production Sistema Solare
echo =========================================
echo.

echo [1/3] Pulizia cartella dist...
if exist "dist" rmdir /s /q "dist"
echo.

echo [2/3] Esecuzione build Vite...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERRORE] Build fallita!
    pause
    exit /b 1
)
echo.

echo [3/3] Copia assets nella build...
if not exist "dist\assets\textures" mkdir "dist\assets\textures"
xcopy "assets\textures" "dist\assets\textures\" /E /I /Y > nul
echo.

echo =========================================
echo [SUCCESSO] Build completata!
echo =========================================
echo.
echo La build e stata creata nella cartella 'dist'
echo Puoi caricare questa cartella su qualsiasi server web statico
echo o usarla localmente con un server HTTP semplice.
echo.
echo Per avviare localmente la build, usa: Avvia_Build.bat
echo.

pause
