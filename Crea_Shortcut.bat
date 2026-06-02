@echo off
title Crea Shortcut Desktop - Sistema Solare
echo =========================================
echo   Creazione Shortcut Desktop
echo =========================================
echo.

set "SCRIPT_DIR=%~dp0"
set "SHORTCUT_TARGET=%SCRIPT_DIR%Avvia_Sistema.bat"
set "SHORTCUT_NAME=Sistema Solare 3D.lnk"
set "DESKTOP=%USERPROFILE%\Desktop"

echo Cartella del progetto: %SCRIPT_DIR%
echo Target: %SHORTCUT_TARGET%
echo Desktop: %DESKTOP%
echo.

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP%\%SHORTCUT_NAME%'); $s.TargetPath = '%SHORTCUT_TARGET%'; $s.WorkingDirectory = '%SCRIPT_DIR%'; $s.Description = 'Sistema Solare 3D Interattivo'; $s.Save()"

if exist "%DESKTOP%\%SHORTCUT_NAME%" (
    echo.
    echo [SUCCESSO] Shortcut creato sul desktop!
    echo.
    echo Puoi ora aprire il Sistema Solare direttamente dal desktop.
) else (
    echo.
    echo [ERRORE] Impossibile creare lo shortcut.
    echo.
    echo Verifica che PowerShell sia disponibile.
)

pause
