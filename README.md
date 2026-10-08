<div align="center">

  # 🪐 ASTRALIS
  ### Next-Gen 3D Solar System & Keplerian Orbital Simulation

  [![Three.js](https://img.shields.io/badge/Three.js-v0.170-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![NASA JPL](https://img.shields.io/badge/Orbits-NASA%20JPL-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)](https://ssd.jpl.nasa.gov/)
  [![CI/CD](https://img.shields.io/badge/CI-Passing-2ea44f?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Fioru12/astralis/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

  <p align="center">
    <b>Un visualizzatore 3D interattivo e immersivo dello spazio astronomico basato su effemeridi reali.</b>
  </p>

  <p align="center">
    <a href="#-caratteristiche-principali">Caratteristiche</a> •
    <a href="#-quickstart">Quickstart</a> •
    <a href="#-controlli--camera">Controlli</a> •
    <a href="#-architettura">Architettura</a>
  </p>

</div>

---

### ✨ Caratteristiche Principali

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🛰️ Calcolo Orbitale Kepleriano</h3>
      Simulazione ad alta precisione di pianeti, lune, asteroidi e comete alimentata dai parametri orbitali NASA/JPL Horizons.
    </td>
    <td width="50%" valign="top">
      <h3>🌌 Grafica 3D & Post-Processing</h3>
      Illuminazione fisica, bloom atmosferico, texture ad alta risoluzione e sistema Level of Detail (LOD) dinamico con Three.js.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🎥 3 Modalità di Visualizzazione</h3>
      Navigazione libera nello spazio 3D, modalità orbita cinematica attorno ai corpi celesti o inseguimento dinamico (Follow Cam).
    </td>
    <td width="50%" valign="top">
      <h3>💎 UI Glassmorphic & Offline-First</h3>
      Interfaccia fluida con effetti glassmorphism, ricerca e telemetria in tempo reale, funzionante al 100% offline.
    </td>
  </tr>
</table>

---

### 🚀 Quickstart

> [!TIP]
> Assicurati di avere [Node.js](https://nodejs.org/) (v18+) installato sul tuo computer.

```bash
# 1. Clona il repository
git clone https://github.com/Fioru12/astralis.git
cd astralis

# 2. Installa le dipendenze e prepara gli hook
npm install
npm run prepare

# 3. Avvia il server di sviluppo interattivo
npm run dev
```

Apri `http://localhost:5173` nel tuo browser per iniziare l'esplorazione spaziale.

---

### 🎮 Controlli & Navigazione

| Tasto / Input | Azione |
| :--- | :--- |
| **Click Sinistro + Trascina** | Ruota la visuale attorno al centro / pianeta selezionato |
| **Click Destro + Trascina** | Sposta la telecamera (Pan) |
| **Rotellina Mouse** | Zoom In / Zoom Out |
| **Doppio Click** | Aggancia e centra la telecamera sul corpo celeste cliccato |
| **Spazio** | Pausa / Riprendi lo scorrere del tempo orbitale |
| **1 - 9** | Selezione rapida numerica dei corpi celesti principali |

---

### 🏛️ Architettura & Qualità del Codice

<details>
<summary><b>🔍 Dettagli Tecnici & Tooling</b></summary>
<br>

- **Rendering Engine:** Three.js con async asset loader, bundle chunking e rendering pipeline ottimizzato.
- **Testing Suite:** Test unitari e di integrazione con Vitest + test end-to-end browser con Playwright.
- **Code Standards:** ESLint + Prettier con verifica automatica pre-commit via Husky.
- **Documentazione estesa:** Consulta [ARCHITECTURE.md](./ARCHITECTURE.md) e [TEXTURE_OPTIMIZATION.md](./TEXTURE_OPTIMIZATION.md) per approfondire il pipeline di rendering e l'ottimizzazione degli asset.

</details>

---

<div align="center">
  <sub>Sviluppato con passione per l'astronomia e la grafica 3D da <a href="https://github.com/Fioru12">Fioru12</a></sub>
</div>
