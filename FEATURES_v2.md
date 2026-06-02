# 🪐 Sistema Solare 3D - Features v2.0

## Tutte le feature implementate

### 🎨 UX e Accessibilità
- **🎓 Onboarding interattivo** (5 step) al primo avvio con `localStorage` per skip
- **⌨️ Pannello shortcut** (tasto **H**) - tutti i comandi raggruppati per categoria
- **🔍 Command Palette** (Ctrl/Cmd+K) - ricerca fuzzy su azioni e 40+ corpi celesti
- **🎬 View Presets** (tasto **V**) - 7 viste rapide: Casa, Sistema, Asteroidi, Kuiper, Galassia
- **⏰ Time Travel** - data picker + 8 eventi storici (Apollo 11, Halley, Plutone, ecc.)
- **📊 HUD** sempre visibile - data simulata, FPS, corpo selezionato
- **🎨 Tema Light/Dark** (tasto **T**) - con persistenza
- **🌍 i18n IT/EN** (tasto **L**) - tutte le stringhe tradotte
- **♿ Accessibility**: reduce-motion automatico, high-contrast, focus visibile, skip-link

### 🚀 PWA e Offline
- **📱 Manifest.json** - installabile come app su desktop e mobile
- **🔌 Service Worker** - cache-first per texture, stale-while-revalidate per assets
- **📦 Shortcuts PWA** - Vista Terra, Mappa Galattica, Time Travel

### 🎮 Funzionalità Uniche
- **🧪 Gravity Sandbox** - simulatore N-body, aggiungi corpi e osserva le orbite
- **🎓 Quiz spaziale** - 10 domande con spiegazioni e punteggio
- **📡 Space News** - NASA APOD + Near Earth Objects di oggi (cached 12h)
- **📷 Screenshot** - cattura PNG della vista corrente
- **🔗 URL State Sharing** - link diretto a corpo+data+vista
- **🥽 WebXR/VR** - supporto visore (se disponibile)
- **🔊 Sound Manager** - Web Audio API: drone ambientale, whoosh, click, beep

### ⚡ Performance (già esistenti, preservate)
- LOD system (72% riduzione poligoni)
- Async texture loading
- Bundle chunking
- Tone mapping ACES + bloom selettivo
- Logarithmic depth buffer (range 500.000)

### 🌍 Dati Scientifici
- 40+ corpi celesti con orbite kepleriane NASA/JPL
- 8 pianeti + 5 pianeti nani + 9 lune + 7 asteroidi + 6 comete
- Stelle vicine (HYG catalog) + esopianeti NASA
- Sonde spaziali (Voyager, Pioneer, New Horizons)
- Eventi astronomici storici precaricati

## ⌨️ Tutti gli Shortcut

| Tasto | Azione |
|-------|--------|
| **Space / K** | Pausa/Riprendi |
| **R** | Reset camera / Vai a oggi |
| **N** | Space News (NASA) |
| **Q** | Quiz spaziale |
| **G** | Gravity Sandbox |
| **H** | Pannello shortcut |
| **V** | View Presets |
| **T** | Toggle tema |
| **L** | Switch lingua |
| **Ctrl+K** | Command Palette |
| **Tab** | Inventario |
| **F** | Free flight |
| **1/2/3** | Orbita/Follow/Fly |
| **[/]** | ±1 anno |
| **{/}** | ±10 anni |
| **ESC** | Esci da modalità |

## 🏗️ Architettura

```
src/
├── core/           # Theme, URL State, Sound, A11y, Screenshot, XR
├── i18n/           # IT/EN
├── ui/             # Onboarding, Shortcuts, CommandPalette, TimeTravel,
│                   # ViewPresets, HUD, SpaceNews, Quiz, GravitySandbox
├── bodies/         # (esistente) Pianeti, lune, asteroidi, comete
├── data/           # (esistente) Dati NASA
└── utils/          # (esistente) Kepler, textureLoader, helpers

public/
├── manifest.json   # PWA manifest
└── sw.js           # Service worker
```

## 🧪 Come testare

```bash
npm install
npm run dev
```

Poi nell'app:
1. **Primo avvio**: vedrai l'onboarding (5 step)
2. Premi **H** per vedere tutti gli shortcut
3. Premi **Ctrl+K** e prova a cercare "Giove" o "Screenshot"
4. Premi **V** per le viste rapide
5. Premi **N** per le NASA news di oggi
6. Premi **Q** per iniziare il quiz
7. Premi **G** per aprire il sandbox gravitazionale
8. Premi **T** per cambiare tema
9. Premi **L** per cambiare lingua

## 🎯 Prossimi passi suggeriti

- [ ] Estendere quiz con più domande (target: 30+)
- [ ] Aggiungere più eventi al Time Travel
- [ ] Implementare confronti scala drag&drop
- [ ] Aggiungere Web Workers per calcoli orbitali
- [ ] Service worker più aggressivo (KTX2/Basis textures)
- [ ] Analytics privacy-friendly (Plausible)
- [ ] Embed widget per blog educativi
