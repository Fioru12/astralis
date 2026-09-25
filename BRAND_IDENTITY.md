# ASTRALIS - Brand Identity Guide

## Brand Name

**ASTRALIS** - dal latino "astra" (stelle) + suffisso "-alis" (relativo a)

## Tagline

> "Esplora il cosmo, un'orbita alla volta"
> "Explore the cosmos, one orbit at a time"

## Visual Identity

### Logo

File: `public/astralis-logo.svg`

- Simbolo: pianeta stilizzato con orbite multiple
- Gradiente: cyan (#5bc4cf) → viola (#a78bfa) → ambra (#f59e0b)
- Animazione: rotazione lenta (8s) con glow

### Palette Colori Brand

| Colore        | HEX       | Uso                 |
| ------------- | --------- | ------------------- |
| Cosmic Cyan   | `#5bc4cf` | Primary accent      |
| Astral Violet | `#a78bfa` | Secondary accent    |
| Solar Amber   | `#f59e0b` | Highlight/Tertiary  |
| Deep Space    | `#0a0e1f` | Background gradient |
| Void Black    | `#000000` | Pure background     |

### Typography

- **Display**: Space Grotesk (Google Fonts) - titoli, brand
- **Mono**: JetBrains Mono (Google Fonts) - dati, percentuali, codice
- **Fallback**: system-ui, sans-serif

## Brand Elements Implementati

### 1. Splash Screen Cinematografico

- Logo centrato con animazione rotazione
- Gradient title con brand colors
- Progress bar animata con narrative stages
- 8 messaggi di "caricamento" tematici
- Suono whoosh al completamento

### 2. Watermark

- Logo piccolo in basso a destra
- Versione visibile
- Opacity 25% per non essere invasivo
- Font: Space Grotesk con letter-spacing ampio

### 3. Achievement System

10 achievement sbloccabili con toast animati:

- 🚀 Primo Contatto (+10 XP)
- 🧭 Esploratore (+25 XP) - 5 corpi visitati
- 🔭 Astronomo (+50 XP) - tutti i pianeti
- ⏰ Viaggiatore del Tempo (+30 XP) - 100 anni nel passato
- 🎓 Maestro Spaziale (+40 XP) - quiz al 100%
- 🧪 Costruttore (+20 XP) - 5+ corpi nel sandbox
- 📷 Fotografo Cosmico (+15 XP) - 3 screenshot
- 🎮 Cheater (+50 XP) - Konami Code
- 🌌 Cartografo (+25 XP) - mappa galattica
- 🦉 Civetta Notturna (+15 XP) - usato di notte

### 4. Konami Code Easter Egg

Sequenza: ↑ ↑ ↓ ↓ ← → ← → B A
Effetto: hyperspace mode con flash bianco + whoosh
Sblocca achievement "Cheater"

### 5. Pannello Achievement (tasto Y)

- Lista completa con stato locked/unlocked
- Progress bar XP
- Icone per ogni achievement
- Design coerente con brand

## File Brand

- `public/astralis-logo.svg` - Logo vettoriale
- `src/core/brand.js` - Sistema brand completo
- `public/manifest.json` - Usa brand name in PWA

## Come Personalizzare

Per cambiare il brand:

1. Modifica `BRAND` constant in `src/core/brand.js`
2. Sostituisci `public/astralis-logo.svg`
3. Aggiorna colori in `style.css` (variabili CSS)
4. Aggiorna fonts in `index.html` Google Fonts link

## Note di Design

- Il brand è volutamente **minimal ma riconoscibile**
- Gradient multi-color (cyan→viola→ambra) ricorda l'aurora boreale
- L'uso di glassmorphism + gradient è il "nostro stile" distintivo
- Tutti i microinteractions (whoosh, beep, achievement) sono brandizzate
