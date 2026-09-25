# 🌌 ASTRALIS - 3D Solar System Explorer

![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)
![Version: 2.0.0](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-v0.170-green.svg)

**ASTRALIS** - Un visualizzatore 3D interattivo e completamente immersivo del Sistema Solare e dello spazio circostante.

Realizzato con **Three.js** e **Vite**, con una UI moderna, effetti visivi professionali, e dati scientifici accurati.

## ✨ Caratteristiche

- **Visualizzazione 3D realistica** di pianeti, lune, asteroidi e comete
- **Orbite kepleriane accurate** basate su dati NASA/JPL
- **3 modalità camera**: Orbita, Volo libero, Follow
- **UI moderna** con glassmorphism e animazioni fluide
- **Completamente offline** - funziona senza connessione internet
- **Portatile** - facile da trasferire tra computer
- **Shortcut desktop** per avvio rapido

## 🚀 Avvio Rapido

### **Important: Recent Improvements**

Recent repository improvements were applied:

- ✅ **Code Quality:** ESLint, Prettier, Husky pre-commit hooks
- ✅ **Performance:** LOD system, async texture loading, bundle chunking
- ✅ **Testing:** Vitest unit/integration tests and Playwright browser flows
- ✅ **CI/CD:** workflow GitHub Actions attivo (`.github/workflows/ci.yml`)
- ✅ **Documentation:** Architecture, texture optimization, deployment guides

**To activate these features locally:**

```bash
npm install
npm run prepare
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [TEXTURE_OPTIMIZATION.md](./TEXTURE_OPTIMIZATION.md) for details.

---

### Metodo 1: Sviluppo (consigliato per modifiche)

```bash
# Installa le dipendenze (solo la prima volta)
npm install

# Avvia il server di sviluppo
npm run dev
```

Il browser si aprirà automaticamente su `http://localhost:5173`

### Metodo 2: Shortcut Desktop (Windows)

Esegui `Crea_Shortcut.bat` per creare un'icona sul desktop.

### Metodo 3: Build Production

```bash
# Crea la build ottimizzata
build.bat

# Avvia la build
Avvia_Build.bat
```

## 📁 Struttura del Progetto

```
Solar-System/
├── src/
│   ├── main.js              # Composizione scena + render loop
│   ├── data/                # celestialData (IT+EN), stellarData, cataloghi
│   ├── utils/               # kepler, textureLoader, dispose, sanitize, focusTrap
│   ├── core/                # scene, camera, timeControls, navigation,
│   │                        # orbits, xr, urlState, adaptiveQuality, ...
│   ├── bodies/              # creator, asteroidBelts, comets, starsAndExoplanets
│   ├── ui/                  # lazyFeatures, commandActions, infoPanel, search,
│   │                        # minimap, quiz, missions, galaxyModal, ...
│   └── i18n/                # dizionari it/en
├── tests/e2e/               # Suite Playwright (14 test)
├── public/                  # manifest, service worker, milky_way WebP
├── assets/textures/         # Texture planetarie (WebP ottimizzati)
├── dist/                    # Build production (gitignored)
├── index.html              # Pagina principale
├── style.css               # Styling
├── package.json            # Dipendenze (engines: node >= 20)
└── vite.config.js          # Configurazione Vite + budget bundle
```

## 🎮 Controlli

### Mouse

- **Trascina**: Ruota la camera
- **Scroll**: Zoom in/out
- **Shift + Trascina**: Pan della camera
- **Doppio click**: Entra in modalità volo
- **Click su pianeta**: Mostra informazioni

### Tastiera

- **F**: Attiva/disattiva volo libero
- **W / Freccia su**: Avanza
- **S / Freccia giù**: Indietreggia
- **A / D**: Spostamento laterale
- **1**: Modalità orbita
- **2**: Segui corpo selezionato
- **3**: Volo libero
- **J**: Apri/chiudi inventario
- **ESC**: Esci dalla modalità corrente

### Touch (Mobile)

- **1 dito**: Ruota
- **2 dita**: Zoom

## 🔧 Script Utili

- `Avvia_Sistema.bat` - Avvia server di sviluppo
- `build.bat` - Crea build production
- `Avvia_Build.bat` - Avvia build production
- `Crea_Shortcut.bat` - Crea icona desktop

## 📦 Portabilità

Per trasferire il progetto su un altro computer:

1. Copia l'intera cartella del progetto
2. Sul nuovo computer:
   - Se hai Node.js: esegui `npm install` poi `npm run dev`
   - Altrimenti: usa `Avvia_Build.bat` (richiede Python o Node.js)

## 🎨 Personalizzazione

### Modificare i colori UI

Modifica le variabili CSS in `style.css`:

```css
:root {
  --accent: #5bc4cf; /* Colore principale */
  --glass: rgba(8, 10, 20, 0.8); /* Sfondo pannelli */
}
```

### Aggiungere nuovi corpi celesti

Modifica `src/data/celestialData.js` aggiungendo nuovi oggetti agli array `PLANETS`, `MOONS`, `ASTEROIDS` o `COMETS`.

## 🛠️ Stack Tecnologico

- **Three.js** v0.170.0 - Rendering 3D
- **Vite** v8 - Build tool e dev server con minificazione OXC
- **JavaScript ES6+** - Linguaggio
- **CSS3** - Styling con glassmorphism

## 📊 Corpi Celesti Inclusi

### Pianeti (8)

Mercurio, Venere, Terra, Marte, Giove, Saturno, Urano, Nettuno

### Pianeti Nani (5)

Cerere, Plutone, Eris, Makemake, Haumea

### Lune Principali (9)

Luna, Phobos, Deimos, Io, Europa, Ganimede, Callisto, Titano, Tritone

### Asteroidi (7)

Vesta, Pallas, Hygiea, Eros, Apophis, Itokawa, Bennu

### Comete (6)

Halley, Hale-Bopp, 67P/Churyumov, Tempel 1, Encke, Borrelly

## 🔬 Accuratezza Scientifica

Le orbite sono calcolate usando elementi orbitali kepleriani NASA/JPL (epoca J2000):

- Semiasse maggiore (a)
- Eccentricità (e)
- Inclinazione (I)
- Longitudine media (L)
- Longitudine del perielio (p)
- Longitudine del nodo ascendente (n)

## 📝 Note

- Il progetto è completamente offline dopo il primo caricamento delle texture
- Le texture sono incluse nella cartella `assets/textures/`
- Per performance ottimali, usa un browser moderno (Chrome, Firefox, Edge)
- Su mobile, la modalità volo libero potrebbe non essere disponibile

## 🤝 Contributi

Questo è un progetto personale. Sentiti libero di forkare e modificare per i tuoi scopi!

## 📄 Licenza

Progetto open source. Usa e modifica liberamente.

---

Creato con ❤️ usando Three.js e Vite
