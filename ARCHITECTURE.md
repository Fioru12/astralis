# ASTRALIS — Architettura tecnica

Documento aggiornato ad agosto 2026. Descrive il codice realmente presente nel repository.

## Stack

- JavaScript ES modules
- Three.js 0.170 per scena e rendering WebGL/WebXR
- Vite 8 con minificazione OXC per sviluppo e build
- Vitest 4 + jsdom per test unitari e Playwright per i flussi end-to-end
- CSS senza framework

## Struttura

```text
index.html                  shell dell'interfaccia
style.css                  tema, pannelli e responsive
src/main.js                composizione della scena e render loop (~2150 righe)
src/ui/lazyFeatures.js     pannelli secondari caricati pigramente (estratto da main.js)
src/ui/commandActions.js   azioni della command palette (estratto da main.js)
src/core/timeControls.js   salti temporali jumpToNow/jumpYears (estratto da main.js)
src/core/navigation.js     camera e selezione corpi (estratto da main.js)
src/bodies/                asteroidi, comete, stelle ed esopianeti
src/core/                  camera, controlli, post-processing, XR, PWA helpers
src/core/galaxyGrid.js     settori e minimappa della modalità galattica
src/data/                  dati orbitali, fisici e cataloghi locali (IT + EN)
src/i18n/                  dizionari italiano/inglese
src/ui/                    pannelli e strumenti interattivi
src/utils/                 Keplero, texture, dispose GPU, sanitizzazione e accessibilità
assets/textures/           sorgenti JPG/PNG e WebP ottimizzati (~1,95 MB in dist)
public/                    manifest, service worker, milky_way WebP (JPG come fallback)
.github/workflows/ci.yml   lint, test e build automatici
```

## Flusso principale

1. Vengono creati renderer, scena, camera e post-processing.
2. I cataloghi costruiscono `allBodies`, l'indice condiviso dei corpi selezionabili.
3. Ogni corpo espone una chiave stabile, un pivot mondiale, una mesh e, quando disponibile, `getPos()`.
4. Il render loop aggiorna camera, posizioni, shader, etichette, LOD e dettagli adattivi.
5. Le funzionalità secondarie sono caricate con import dinamici solo quando richieste.

Le dimensioni sceniche sono volutamente enfatizzate per la leggibilità. I valori fisici usati nei confronti sono conservati separatamente in `PHYSICAL_DATA`.

## Prestazioni implementate

- LOD per pianeti e Terra.
- `InstancedMesh` per le fasce asteroidali.
- qualità automatica basata su hardware e frame rate sostenuto;
- riduzione di bloom, pixel ratio, polvere e nube di Oort nei preset inferiori;
- import dinamici per confronto, quiz, missioni, osservatorio e altri pannelli;
- texture WebP fino a 2048 px, cache e fallback procedurali;
- sospensione degli effetti decorativi con pagina nascosta o movimento ridotto;
- chunk separati per Three.js, GUI, dati e utility.

La build corrente (misurata settembre 2026 con `npm run build`) pesa circa 3,9 MB:
JS sincrono circa 860 kB (three-vendor isolato da 524 kB + index da 306 kB + gui da
30 kB), chunk async circa 100 kB, texture WebP circa 1,95 MB, CSS 50 kB.
Rispetto alle sorgenti JPG/PNG, le texture trasferite sono diminuite di circa il 74%.
Il chunk three-vendor è isolato con `codeSplitting.groups` (Vite 8 / Rolldown):
il precedente `manualChunks` a funzione infilava il core di three in bodies-modules
con import circolare, invalidando la cache di three a ogni modifica. I budget sono
verificati da `npm run check:bundle` (three < 600 KiB, index < 350 KiB).

## Accuratezza e coordinate

- Pianeti e pianeti nani: elementi orbitali J2000 con variazioni secolari dove disponibili.
- Lune e oggetti minori: rappresentazione educativa semplificata.
- Stelle vicine: coordinate scalate per rendere esplorabile la Bolla Locale.
- Esopianeti: orbite visuali amplificate; stato e dati aggiornati devono indicare la fonte.

La scena non è in scala unica: distanze e raggi reali non sarebbero contemporaneamente leggibili.

## Stato dei test

I controlli obbligatori sono:

```bash
npm run lint
npm test -- --run
npm run build
npm run test:e2e
```

La CI esegue gli stessi controlli su push e pull request (37 file / 185 test Vitest
verificati a settembre 2026, con soglie minime di coverage in `vite.config.js`).
La suite Playwright (14 test in `tests/e2e/`) copre
avvio WebGL, ricerca e selezione da tastiera (anche in inglese), impostazioni,
layout mobile, modale galattico, vista galaxy da URL, confronto, osservatorio,
quiz, time travel, missioni astronautiche, missioni spaziali reali, palette
comandi, esploratore di sistemi, assenza del pulsante VR senza sessione
`immersive-vr`.

## Debito tecnico residuo

- `src/main.js` (~2150 righe) resta il punto di composizione: toggle lazy
  (`ui/lazyFeatures.js`), azioni palette (`ui/commandActions.js`), salti temporali
  (`core/timeControls.js`) e navigazione camera (`core/navigation.js`) sono estratti
  e testati; render loop e costruzione della scena restano centralizzati.
- Interfaccia completamente bilingue IT/EN: 106+ corpi di `celestialData.js`
  (`labelEn`, `descEn`, `periodEn`, `scopertaEn`), quiz, missioni gamificate e
  spaziali, veicoli travelCalc, ispettore sistemi, modale galattico, factsheet,
  comparatore, cockpit, achievement, splash e tutti i toast/hint di `main.js`.
  I dataset usano oggetti `{ it, en }` con fallback all'italiano; il test
  `src/ui/i18n-content.test.js` impedisce regressioni e chiavi disallineate.
- KTX2/Basis: `textureLoader` riscrive `.ktx2`/`.basis` sul WebP equivalente con
  fallback procedurale (vedi `TEXTURE_OPTIMIZATION.md`); il transcoder GPU non è
  ancora incluso nel bundle.
- La suite end-to-end copre avvio, ricerca, impostazioni, mobile, mappa galattica,
  confronto, osservatorio, quiz e time travel; missioni, missioni spaziali e WebXR
  sono coperti da test dedicati (vedi `tests/e2e/extended-flows.spec.js`).
- `src/utils/dispose.js` centralizza il rilascio GPU per le scene dinamiche
  (osservatorio, modali, galassia, sandbox); il loop principale riusa un unico
  renderer e gestisce il context-loss con ricaricamento.
