# Script PowerShell per convertire SVG in ICO
# Questo script richiede ImageMagick o un convertitore online

Write-Host "Per creare un file .ico dall'icona SVG, hai due opzioni:" -ForegroundColor Yellow
Write-Host ""
Write-Host "OPZIONE 1: Convertitore online (più semplice)" -ForegroundColor Green
Write-Host "1. Vai su: https://convertio.co/it/svg-ico/" -ForegroundColor White
Write-Host "2. Carica il file: solar-system-icon.svg" -ForegroundColor White
Write-Host "3. Scarica il file .ico risultante" -ForegroundColor White
Write-Host "4. Salvalo come: solar-system.ico" -ForegroundColor White
Write-Host ""
Write-Host "OPZIONE 2: ImageMagick (se installato)" -ForegroundColor Green
Write-Host "1. Installa ImageMagick da: https://imagemagick.org/" -ForegroundColor White
Write-Host "2. Esegui: magick solar-system-icon.svg -define icon:auto-resize=256,128,96,64,48,32,16 solar-system.ico" -ForegroundColor White
Write-Host ""
Write-Host "Dopo aver creato il file .ico:" -ForegroundColor Yellow
Write-Host "1. Clic destro su 'Avvia Sviluppo.bat' o 'Avvia Produzione.bat'" -ForegroundColor White
Write-Host "2. Seleziona 'Invia a' > 'Desktop (crea collegamento)'" -ForegroundColor White
Write-Host "3. Clic destro sul nuovo collegamento desktop" -ForegroundColor White
Write-Host "4. Seleziona 'Proprietà'" -ForegroundColor White
Write-Host "5. Clic su 'Cambia icona...'" -ForegroundColor White
Write-Host "6. Seleziona il file solar-system.ico" -ForegroundColor White
Write-Host "7. Clic su 'OK' e poi 'Applica'" -ForegroundColor White
Write-Host ""
Write-Host "Premi un tasto per aprire il convertitore online..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "https://convertio.co/it/svg-ico/"
