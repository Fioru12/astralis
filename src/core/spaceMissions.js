// src/core/spaceMissions.js
// ══════════════════════════════════════════════════════════════════
// MISSIONI SPAZIALI IN TEMPO REALE
// Posizioni attuali di sonde, dati NASA Horizons, missioni storiche
// ══════════════════════════════════════════════════════════════════

/**
 * Database delle missioni spaziali con dati orbitali aggiornati
 * In futuro potrà essere aggiornato via API NASA Horizons
 */
const SPACE_MISSIONS = [
  {
    key: 'Voyager1',
    name: 'Voyager 1',
    agency: 'NASA',
    launchYear: 1977,
    status: 'Attiva',
    description: 'La sonda più lontana dalla Terra. Ha lasciato la eliosfera nel 2012.',
    currentDistance: '24.5 miliardi km',
    currentSpeed: '17 km/s',
    target: 'Costellazione Ofiuco',
    highlights: [
      'Primo oggetto artificiale a lasciare il sistema solare',
      'Golden Record con suoni e immagini della Terra',
      'Foto famosa "Pale Blue Dot" (1990)',
    ],
    orbitalElements: { a: 160, e: 0.3, I: 35.0, w: 17.0, O: 170.0 },
    color: 0xff6600,
  },
  {
    key: 'Voyager2',
    name: 'Voyager 2',
    agency: 'NASA',
    launchYear: 1977,
    status: 'Attiva',
    description: 'Unica sonda ad aver visitato Urano e Nettuno.',
    currentDistance: '20.1 miliardi km',
    currentSpeed: '15 km/s',
    target: 'Costellazione Idra',
    highlights: [
      'Grand Tour: Giove, Saturno, Urano, Nettuno',
      'Scoperta di geyser su Tritone',
      'Ha lasciato la eliosfera nel 2018',
    ],
    orbitalElements: { a: 130, e: 0.25, I: 28.0, w: 294.0, O: 113.0 },
    color: 0xff6600,
  },
  {
    key: 'NewHorizons',
    name: 'New Horizons',
    agency: 'NASA',
    launchYear: 2006,
    status: 'Attiva',
    description: 'Ha visitato Plutone nel 2015 e Arrokoth nel 2019.',
    currentDistance: '8.5 miliardi km',
    currentSpeed: '13 km/s',
    target: 'Fascia di Kuiper',
    highlights: [
      'Primo flyby di Plutone (14 luglio 2015)',
      'Scoperta di montagne e ghiaccio azoto su Plutone',
      'Flyby di Arrokoth (1 gennaio 2019)',
    ],
    orbitalElements: { a: 55, e: 0.15, I: 2.2, w: 180.0, O: 100.0 },
    color: 0x00ccff,
  },
  {
    key: 'ParkerSolar',
    name: 'Parker Solar Probe',
    agency: 'NASA',
    launchYear: 2018,
    status: 'Attiva',
    description: 'La sonda più vicina al Sole mai costruita.',
    currentDistance: '15 milioni km dal Sole',
    currentSpeed: '192 km/s (più veloce)',
    target: 'Corona solare',
    highlights: [
      'Ha toccato la corona solare (2021)',
      'Velocità record: 192 km/s',
      'Studia il vento solare e i campi magnetici',
    ],
    orbitalElements: { a: 0.39, e: 0.72, I: 3.4, w: 20.0, O: 200.0 },
    color: 0xffcc00,
  },
  {
    key: 'Juno',
    name: 'Juno',
    agency: 'NASA',
    launchYear: 2011,
    status: 'Attiva',
    description: 'In orbita attorno a Giove dal 2016.',
    currentDistance: '756 milioni km dalla Terra',
    currentSpeed: 'Orbita polare',
    target: 'Giove',
    highlights: [
      'Mappa dettagliata del campo gravitazionale di Giove',
      'Scoperta di geyser di ammoniaca',
      'Studio della Grande Macchia Rossa',
    ],
    orbitalElements: { a: 5.2, e: 0.45, I: 90.0, w: 0.0, O: 0.0 },
    color: 0xff8844,
  },
  {
    key: 'Cassini',
    name: 'Cassini-Huygens',
    agency: 'NASA/ESA',
    launchYear: 1997,
    status: 'Terminata (2017)',
    description: 'Ha esplorato Saturno per 13 anni.',
    currentDistance: 'Distrutta nell\'atmosfera di Saturno',
    currentSpeed: '-',
    target: 'Saturno',
    highlights: [
      'Lancio di Huygens su Titano (2005)',
      'Scoperta di geyser su Enceladus',
      'Missione di 20 anni (1997-2017)',
    ],
    orbitalElements: { a: 9.5, e: 0.0, I: 0.0, w: 0.0, O: 0.0 },
    color: 0xccaa00,
  },
  {
    key: 'Rosetta',
    name: 'Rosetta',
    agency: 'ESA',
    launchYear: 2004,
    status: 'Terminata (2016)',
    description: 'Prima sonda ad orbitare una cometa.',
    currentDistance: 'Posata sulla cometa 67P',
    currentSpeed: '-',
    target: '67P/Churyumov-Gerasimenko',
    highlights: [
      'Orbita della cometa 67P (2014-2016)',
      'Lancio del lander Philae',
      'Studio dell\'origine dell\'acqua sulla Terra',
    ],
    orbitalElements: { a: 3.5, e: 0.64, I: 7.0, w: 12.8, O: 50.2 },
    color: 0x66ccff,
  },
  {
    key: 'Curiosity',
    name: 'Curiosity',
    agency: 'NASA',
    launchYear: 2011,
    status: 'Attiva (Marte)',
    description: 'Rover su Marte dal 2012.',
    currentDistance: '225 milioni km dalla Terra',
    currentSpeed: '-',
    target: 'Cratere Gale, Marte',
    highlights: [
      'Scoperta di antichi letti fluviali',
      'Rilevamento di molecole organiche',
      'Rivoluzionario design "Sky Crane"',
    ],
    orbitalElements: { a: 1.52, e: 0.0, I: 1.85, w: 0.0, O: 0.0 },
    color: 0xff4422,
  },
  {
    key: 'Perseverance',
    name: 'Perseverance',
    agency: 'NASA',
    launchYear: 2020,
    status: 'Attiva (Marte)',
    description: 'Rover su Marte con elicottero Ingenuity.',
    currentDistance: '225 milioni km dalla Terra',
    currentSpeed: '-',
    target: 'Cratere Jezero, Marte',
    highlights: [
      'Primo volo su un altro pianeta (Ingenuity)',
      'Raccolta campioni per futuro ritorno',
      'Ricerca di segni di vita passata',
    ],
    orbitalElements: { a: 1.52, e: 0.0, I: 1.85, w: 0.0, O: 0.0 },
    color: 0xff5533,
  },
  {
    key: 'Webb',
    name: 'James Webb Space Telescope',
    agency: 'NASA/ESA/CSA',
    launchYear: 2021,
    status: 'Attiva',
    description: 'Il telescopio spaziale più potente mai costruito.',
    currentDistance: '1.5 milioni km (punto L2)',
    currentSpeed: 'Orbita attorno a L2',
    target: 'Punto Lagrange L2',
    highlights: [
      'Immagine più profonda dell\'universo osservata',
      'Studio delle prime galassie',
      'Analisi delle atmosfere di esopianeti',
    ],
    orbitalElements: { a: 1.5e6 * 80 / 1.496e8, e: 0.0, I: 0.0, w: 0.0, O: 0.0 },
    color: 0xffaa66,
  },
  {
    key: 'EuropaClipper',
    name: 'Europa Clipper',
    agency: 'NASA',
    launchYear: 2024,
    status: 'In viaggio',
    description: 'Missione verso Europa per cercare condizioni abitabili.',
    currentDistance: 'In viaggio verso Giove',
    currentSpeed: '-',
    target: 'Europa (luna di Giove)',
    highlights: [
      'Studierà l\'oceano sotto la crosta di Europa',
        'Sarà lanciata nel 2024',
        'Arrivo previsto nel 2030',
    ],
    orbitalElements: { a: 5.2, e: 0.45, I: 0.5, w: 0.0, O: 0.0 },
    color: 0x88ccff,
  },
];

/**
 * Ottieni tutte le missioni
 * @returns {Array} Lista delle missioni
 */
export function getMissions() {
  return SPACE_MISSIONS;
}

/**
 * Ottieni una missione per chiave
 * @param {string} key - Chiave della missione
 * @returns {Object|null} Missione trovata
 */
export function getMission(key) {
  return SPACE_MISSIONS.find(m => m.key === key) || null;
}

/**
 * Ottieni missioni attive
 * @returns {Array} Solo missioni attive
 */
export function getActiveMissions() {
  return SPACE_MISSIONS.filter(m => m.status.includes('Attiva') || m.status.includes('viaggio'));
}

/**
 * Crea un pannello HTML per visualizzare le missioni
 * @returns {HTMLElement} Pannello delle missioni
 */
export function createMissionsPanel() {
  const panel = document.createElement('div');
  panel.id = 'missionsPanel';
  panel.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 700px; max-height: 80vh; background: rgba(0,0,0,0.92);
    border: 1px solid rgba(100,150,255,0.3); border-radius: 16px;
    padding: 24px; z-index: 1000; overflow-y: auto;
    font-family: 'Space Grotesk', system-ui, sans-serif; color: white;
    backdrop-filter: blur(20px);
  `;
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h2 style="margin:0;font-size:1.4rem;">🚀 Missioni Spaziali</h2>
      <button id="closeMissions" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;">✕</button>
    </div>
    <div id="missionsList"></div>
  `;

  const missionsList = panel.querySelector('#missionsList');
  SPACE_MISSIONS.forEach(mission => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 16px; margin-bottom: 12px; cursor: pointer;
      transition: all 0.3s ease;
    `;
    card.onmouseenter = () => { card.style.borderColor = `#${mission.color.toString(16).padStart(6, '0')}`; };
    card.onmouseleave = () => { card.style.borderColor = 'rgba(255,255,255,0.1)'; };

    const statusColor = mission.status.includes('Attiva') || mission.status.includes('viaggio') ? '#44ff88' : '#ff8844';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong style="font-size:1.1rem;">${mission.name}</strong>
        <span style="color:${statusColor};font-size:0.8rem;">● ${mission.status}</span>
      </div>
      <div style="color:rgba(255,255,255,0.6);font-size:0.85rem;margin-bottom:6px;">
        ${mission.agency} • Lancio: ${mission.launchYear}
      </div>
      <div style="font-size:0.9rem;margin-bottom:8px;">${mission.description}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.8rem;color:rgba(255,255,255,0.5);">
        <span>📡 Distanza: ${mission.currentDistance}</span>
        <span>🎯 Target: ${mission.target}</span>
      </div>
    `;
    missionsList.appendChild(card);
  });

  return panel;
}

/**
 * Mostra il pannello delle missioni
 * @param {HTMLElement} container - Dove inserire il pannello (default: document.body)
 */
export function showMissionsPanel(container) {
  const existing = document.getElementById('missionsPanel');
  if (existing) existing.remove();

  const panel = createMissionsPanel();
  (container || document.body).appendChild(panel);

  panel.querySelector('#closeMissions').onclick = () => panel.remove();
}