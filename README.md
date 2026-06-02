# 🪐 Sistema Solare 3D Interattivo

![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)



Un visualizzatore 3D interattivo del Sistema Solare realizzato con Three.js e Vite.

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
- ✅ **Testing:** Vitest suite with smoke tests
- ✅ **CI/CD:** GitHub Actions workflow template
- ✅ **Documentation:** Architecture, texture optimization, deployment guides

**To activate these features locally:**
```bash
npm install
npm run prepare
# Then copy CI_WORKFLOW.yml → .github/workflows/ci.yml
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
│   ├── main.js              # Codice principale
│   ├── data/
│   │   └── celestialData.js # Dati corpi celesti
│   ├── utils/
│   │   ├── constants.js     # Costanti globali
│   │   └── kepler.js        # Funzioni orbitali
│   ├── core/
│   │   ├── scene.js         # Setup scena Three.js
│   │   ├── camera.js        # Sistema camera
│   │   ├── controls.js      # Controlli input
│   │   └── postprocessing.js # Effetti post-processing
│   ├── bodies/
│   │   └── creator.js       # Creazione corpi celesti
│   └── ui/
│       └── manager.js       # Gestione UI
├── assets/textures/         # Texture planetarie
├── dist/                    # Build production
├── index.html              # Pagina principale
├── style.css               # Styling
├── package.json            # Dipendenze
└── vite.config.js          # Configurazione Vite
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
- **1**: Modalità orbita
- **2**: Segui corpo selezionato
- **3**: Volo libero
- **TAB**: Apri/chiudi inventario
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
  --accent: #5bc4cf;  /* Colore principale */
  --glass: rgba(8, 10, 20, 0.80);  /* Sfondo pannelli */
}
```

### Aggiungere nuovi corpi celesti
Modifica `src/data/celestialData.js` aggiungendo nuovi oggetti agli array `PLANETS`, `MOONS`, `ASTEROIDS` o `COMETS`.

## 🛠️ Stack Tecnologico

- **Three.js** v0.170.0 - Rendering 3D
- **Vite** v6.0.0 - Build tool e dev server
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
