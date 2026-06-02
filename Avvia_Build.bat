@echo off
title Avvia Build - Sistema Solare
echo =========================================
echo   Avvio Build Sistema Solare
echo =========================================
echo.

if not exist "dist" (
    echo [ERRORE] La cartella dist non esiste!
    echo.
    echo Esegui prima build.bat per creare la build.
    pause
    exit /b 1
)

echo Ricerca server HTTP disponibile...
echo.

:: Prova Python 3
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python trovato
    echo Avvio server HTTP su http://localhost:8080
    echo.
    timeout /t 2 /nobreak > nul
    start http://localhost:8080
    python -m http.server 8080 --directory dist
    goto :end
)

:: Prova Python 2
python2 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python 2 trovato
    echo Avvio server HTTP su http://localhost:8080
    echo.
    timeout /t 2 /nobreak > nul
    start http://localhost:8080
    python2 -m SimpleHTTPServer 8080
    goto :end
)

:: Prova Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js trovato
    echo Avvio server HTTP su http://localhost:8080
    echo.
    timeout /t 2 /nobreak > nul
    start http://localhost:8080
    npx http-server dist -p 8080 -o
    goto :end
)

:: Nessun server trovato
echo [ERRORE] Nessun server HTTP trovato!
echo.
echo Per avviare la build hai bisogno di uno di questi:
echo   - Python 3 (python -m http.server)
echo   - Python 2 (python -m SimpleHTTPServer)
echo   - Node.js (npx http-server)
echo.
echo Oppure usa un server web esterno come:
echo   - Live Server in VS Code
echo   - Apache
echo   - Nginx
echo.

:end
pause
