# Script per creare automaticamente il collegamento desktop con icona
$ErrorActionPreference = "Stop"

Write-Host "🚀 Creazione collegamento desktop per Sistema Solare 3D..." -ForegroundColor Cyan
Write-Host ""

# Percorsi
$projectPath = $PSScriptRoot
$batFile = Join-Path $projectPath "Avvia Sviluppo.bat"
$svgFile = Join-Path $projectPath "solar-system-icon.svg"
$icoFile = Join-Path $projectPath "solar-system.ico"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Sistema Solare 3D.lnk"

# Verifica file esistenti
if (-not (Test-Path $batFile)) {
    Write-Host "❌ Errore: File 'Avvia Sviluppo.bat' non trovato!" -ForegroundColor Red
    pause
    exit
}

if (-not (Test-Path $svgFile)) {
    Write-Host "❌ Errore: File 'solar-system-icon.svg' non trovato!" -ForegroundColor Red
    pause
    exit
}

Write-Host "📁 File trovati nella cartella del progetto" -ForegroundColor Green
Write-Host ""

# Crea file ICO base usando PowerShell (icona semplice)
Write-Host "🎨 Creazione file .ico..." -ForegroundColor Yellow
try {
    # Crea un ICO base 16x16 pixel (formato ICO semplice)
    $icoBytes = @(
        0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x30, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x20, 0x00,
        0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ) + @(0x00) * 1024
    
    [System.IO.File]::WriteAllBytes($icoFile, $icoBytes)
    Write-Host "✅ File .ico creato" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Impossibile creare .ico automaticamente, useremo icona di default" -ForegroundColor Yellow
    $icoFile = $null
}

Write-Host ""

# Crea collegamento desktop
Write-Host "🔗 Creazione collegamento desktop..." -ForegroundColor Yellow
try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $batFile
    $Shortcut.WorkingDirectory = $projectPath
    $Shortcut.Description = "Sistema Solare 3D - Visualizzazione Interattiva"
    
    if ($icoFile -and (Test-Path $icoFile)) {
        $Shortcut.IconLocation = $icoFile
    }
    
    $Shortcut.Save()
    Write-Host "✅ Collegamento desktop creato!" -ForegroundColor Green
} catch {
    Write-Host "❌ Errore nella creazione del collegamento: $_" -ForegroundColor Red
    pause
    exit
}

Write-Host ""
Write-Host "🎉 COMPLETATO!" -ForegroundColor Green
Write-Host ""
Write-Host "Collegamento creato sul Desktop: 'Sistema Solare 3D'" -ForegroundColor White
Write-Host ""
Write-Host "Per un'icona più bella:" -ForegroundColor Cyan
Write-Host "1. Vai su: https://convertio.co/it/svg-ico/" -ForegroundColor White
Write-Host "2. Carica: solar-system-icon.svg" -ForegroundColor White
Write-Host "3. Scarica il .ico e salvalo come: solar-system.ico" -ForegroundColor White
Write-Host "4. Clic destro sul collegamento desktop → Proprietà → Cambia icona..." -ForegroundColor White
Write-Host ""
Write-Host "Premi un tasto per chiudere..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
