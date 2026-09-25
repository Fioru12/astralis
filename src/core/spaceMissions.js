// src/core/spaceMissions.js
// ══════════════════════════════════════════════════════════════════
// MISSIONI SPAZIALI IN TEMPO REALE
// Posizioni attuali di sonde, dati NASA Horizons, missioni storiche
// ══════════════════════════════════════════════════════════════════
import { escapeHtml } from '../utils/sanitize.js';
import { getLang, t } from '../i18n/index.js';

const L = (localized) =>
  typeof localized === 'string' ? localized : (localized?.[getLang()] ?? localized?.it);

/**
 * Database delle missioni spaziali con dati orbitali aggiornati
 * In futuro potrà essere aggiornato via API NASA Horizons
 */
export const SPACE_MISSIONS = [
  {
    key: 'Voyager1',
    name: 'Voyager 1',
    agency: 'NASA',
    launchYear: 1977,
    status: { it: 'Attiva', en: 'Active' },
    description: {
      it: 'La sonda più lontana dalla Terra. Ha lasciato la eliosfera nel 2012.',
      en: 'The farthest probe from Earth. It left the heliosphere in 2012.',
    },
    currentDistance: { it: '24.5 miliardi km', en: '24.5 billion km' },
    currentSpeed: '17 km/s',
    target: { it: 'Costellazione Ofiuco', en: 'Ophiuchus constellation' },
    highlights: [
      {
        it: 'Primo oggetto artificiale a lasciare il sistema solare',
        en: 'First human-made object to leave the solar system',
      },
      {
        it: 'Golden Record con suoni e immagini della Terra',
        en: 'Golden Record with sounds and images of Earth',
      },
      { it: 'Foto famosa "Pale Blue Dot" (1990)', en: 'Famous "Pale Blue Dot" photo (1990)' },
    ],
    orbitalElements: { a: 160, e: 0.3, I: 35.0, w: 17.0, O: 170.0 },
    color: 0xff6600,
  },
  {
    key: 'Voyager2',
    name: 'Voyager 2',
    agency: 'NASA',
    launchYear: 1977,
    status: { it: 'Attiva', en: 'Active' },
    description: {
      it: 'Unica sonda ad aver visitato Urano e Nettuno.',
      en: 'The only probe to visit Uranus and Neptune.',
    },
    currentDistance: { it: '20.1 miliardi km', en: '20.1 billion km' },
    currentSpeed: '15 km/s',
    target: { it: 'Costellazione Idra', en: 'Hydra constellation' },
    highlights: [
      {
        it: 'Grand Tour: Giove, Saturno, Urano, Nettuno',
        en: 'Grand Tour: Jupiter, Saturn, Uranus, Neptune',
      },
      { it: 'Scoperta di geyser su Tritone', en: 'Discovery of geysers on Triton' },
      { it: 'Ha lasciato la eliosfera nel 2018', en: 'It left the heliosphere in 2018' },
    ],
    orbitalElements: { a: 130, e: 0.25, I: 28.0, w: 294.0, O: 113.0 },
    color: 0xff6600,
  },
  {
    key: 'NewHorizons',
    name: 'New Horizons',
    agency: 'NASA',
    launchYear: 2006,
    status: { it: 'Attiva', en: 'Active' },
    description: {
      it: 'Ha visitato Plutone nel 2015 e Arrokoth nel 2019.',
      en: 'It visited Pluto in 2015 and Arrokoth in 2019.',
    },
    currentDistance: { it: '8.5 miliardi km', en: '8.5 billion km' },
    currentSpeed: '13 km/s',
    target: { it: 'Fascia di Kuiper', en: 'Kuiper belt' },
    highlights: [
      { it: 'Primo flyby di Plutone (14 luglio 2015)', en: 'First Pluto flyby (14 July 2015)' },
      {
        it: 'Scoperta di montagne e ghiaccio azoto su Plutone',
        en: 'Discovery of mountains and nitrogen ice on Pluto',
      },
      { it: 'Flyby di Arrokoth (1 gennaio 2019)', en: 'Arrokoth flyby (1 January 2019)' },
    ],
    orbitalElements: { a: 55, e: 0.15, I: 2.2, w: 180.0, O: 100.0 },
    color: 0x00ccff,
  },
  {
    key: 'ParkerSolar',
    name: 'Parker Solar Probe',
    agency: 'NASA',
    launchYear: 2018,
    status: { it: 'Attiva', en: 'Active' },
    description: {
      it: 'La sonda più vicina al Sole mai costruita.',
      en: 'The closest probe to the Sun ever built.',
    },
    currentDistance: { it: '15 milioni km dal Sole', en: '15 million km from the Sun' },
    currentSpeed: { it: '192 km/s (più veloce)', en: '192 km/s (fastest)' },
    target: { it: 'Corona solare', en: 'Solar corona' },
    highlights: [
      { it: 'Ha toccato la corona solare (2021)', en: 'It touched the solar corona (2021)' },
      { it: 'Velocità record: 192 km/s', en: 'Record speed: 192 km/s' },
      {
        it: 'Studia il vento solare e i campi magnetici',
        en: 'It studies the solar wind and magnetic fields',
      },
    ],
    orbitalElements: { a: 0.39, e: 0.72, I: 3.4, w: 20.0, O: 200.0 },
    color: 0xffcc00,
  },
  {
    key: 'Juno',
    name: 'Juno',
    agency: 'NASA',
    launchYear: 2011,
    status: { it: 'Attiva', en: 'Active' },
    description: { it: 'In orbita attorno a Giove dal 2016.', en: 'Orbiting Jupiter since 2016.' },
    currentDistance: { it: '756 milioni km dalla Terra', en: '756 million km from Earth' },
    currentSpeed: { it: 'Orbita polare', en: 'Polar orbit' },
    target: { it: 'Giove', en: 'Jupiter' },
    highlights: [
      {
        it: 'Mappa dettagliata del campo gravitazionale di Giove',
        en: 'Detailed map of Jupiter’s gravitational field',
      },
      { it: 'Scoperta di geyser di ammoniaca', en: 'Discovery of ammonia geysers' },
      { it: 'Studio della Grande Macchia Rossa', en: 'Study of the Great Red Spot' },
    ],
    orbitalElements: { a: 5.2, e: 0.45, I: 90.0, w: 0.0, O: 0.0 },
    color: 0xff8844,
  },
  {
    key: 'Cassini',
    name: 'Cassini-Huygens',
    agency: 'NASA/ESA',
    launchYear: 1997,
    status: { it: 'Terminata (2017)', en: 'Ended (2017)' },
    description: {
      it: 'Ha esplorato Saturno per 13 anni.',
      en: 'It explored Saturn for 13 years.',
    },
    currentDistance: {
      it: "Distrutta nell'atmosfera di Saturno",
      en: "Destroyed in Saturn's atmosphere",
    },
    currentSpeed: '-',
    target: { it: 'Saturno', en: 'Saturn' },
    highlights: [
      { it: 'Lancio di Huygens su Titano (2005)', en: 'Huygens landing on Titan (2005)' },
      { it: 'Scoperta di geyser su Enceladus', en: 'Discovery of geysers on Enceladus' },
      { it: 'Missione di 20 anni (1997-2017)', en: '20-year mission (1997–2017)' },
    ],
    orbitalElements: { a: 9.5, e: 0.0, I: 0.0, w: 0.0, O: 0.0 },
    color: 0xccaa00,
  },
  {
    key: 'Rosetta',
    name: 'Rosetta',
    agency: 'ESA',
    launchYear: 2004,
    status: { it: 'Terminata (2016)', en: 'Ended (2016)' },
    description: { it: 'Prima sonda ad orbitare una cometa.', en: 'First probe to orbit a comet.' },
    currentDistance: { it: 'Posata sulla cometa 67P', en: 'Resting on comet 67P' },
    currentSpeed: '-',
    target: { it: '67P/Churyumov-Gerasimenko', en: '67P/Churyumov-Gerasimenko' },
    highlights: [
      { it: 'Orbita della cometa 67P (2014-2016)', en: 'Orbit of comet 67P (2014–2016)' },
      { it: 'Lancio del lander Philae', en: 'Deployment of the Philae lander' },
      {
        it: "Studio dell'origine dell'acqua sulla Terra",
        en: "Study of the origin of Earth's water",
      },
    ],
    orbitalElements: { a: 3.5, e: 0.64, I: 7.0, w: 12.8, O: 50.2 },
    color: 0x66ccff,
  },
  {
    key: 'Curiosity',
    name: 'Curiosity',
    agency: 'NASA',
    launchYear: 2011,
    status: { it: 'Attiva (Marte)', en: 'Active (Mars)' },
    description: { it: 'Rover su Marte dal 2012.', en: 'Rover on Mars since 2012.' },
    currentDistance: { it: '225 milioni km dalla Terra', en: '225 million km from Earth' },
    currentSpeed: '-',
    target: { it: 'Cratere Gale, Marte', en: 'Gale crater, Mars' },
    highlights: [
      { it: 'Scoperta di antichi letti fluviali', en: 'Discovery of ancient riverbeds' },
      { it: 'Rilevamento di molecole organiche', en: 'Detection of organic molecules' },
      { it: 'Rivoluzionario design "Sky Crane"', en: 'Revolutionary “Sky Crane” design' },
    ],
    orbitalElements: { a: 1.52, e: 0.0, I: 1.85, w: 0.0, O: 0.0 },
    color: 0xff4422,
  },
  {
    key: 'Perseverance',
    name: 'Perseverance',
    agency: 'NASA',
    launchYear: 2020,
    status: { it: 'Attiva (Marte)', en: 'Active (Mars)' },
    description: {
      it: 'Rover su Marte con elicottero Ingenuity.',
      en: 'Rover on Mars with the Ingenuity helicopter.',
    },
    currentDistance: { it: '225 milioni km dalla Terra', en: '225 million km from Earth' },
    currentSpeed: '-',
    target: { it: 'Cratere Jezero, Marte', en: 'Jezero crater, Mars' },
    highlights: [
      {
        it: 'Primo volo su un altro pianeta (Ingenuity)',
        en: 'First flight on another planet (Ingenuity)',
      },
      { it: 'Raccolta campioni per futuro ritorno', en: 'Collecting samples for future return' },
      { it: 'Ricerca di segni di vita passata', en: 'Searching for signs of past life' },
    ],
    orbitalElements: { a: 1.52, e: 0.0, I: 1.85, w: 0.0, O: 0.0 },
    color: 0xff5533,
  },
  {
    key: 'Webb',
    name: 'James Webb Space Telescope',
    agency: 'NASA/ESA/CSA',
    launchYear: 2021,
    status: { it: 'Attiva', en: 'Active' },
    description: {
      it: 'Il telescopio spaziale più potente mai costruito.',
      en: 'The most powerful space telescope ever built.',
    },
    currentDistance: { it: '1.5 milioni km (punto L2)', en: '1.5 million km (L2 point)' },
    currentSpeed: { it: 'Orbita attorno a L2', en: 'Orbit around L2' },
    target: { it: 'Punto Lagrange L2', en: 'Lagrange point L2' },
    highlights: [
      {
        it: "Immagine più profonda dell'universo osservata",
        en: 'Deepest image of the universe ever taken',
      },
      { it: 'Studio delle prime galassie', en: 'Study of the first galaxies' },
      { it: 'Analisi delle atmosfere di esopianeti', en: 'Analysis of exoplanet atmospheres' },
    ],
    orbitalElements: { a: (1.5e6 * 80) / 1.496e8, e: 0.0, I: 0.0, w: 0.0, O: 0.0 },
    color: 0xffaa66,
  },
  {
    key: 'EuropaClipper',
    name: 'Europa Clipper',
    agency: 'NASA',
    launchYear: 2024,
    status: { it: 'In viaggio', en: 'En route' },
    description: {
      it: 'Missione verso Europa per cercare condizioni abitabili.',
      en: 'Mission to Europa to seek habitable conditions.',
    },
    currentDistance: { it: 'In viaggio verso Giove', en: 'En route to Jupiter' },
    currentSpeed: '-',
    target: { it: 'Europa (luna di Giove)', en: 'Europa (moon of Jupiter)' },
    highlights: [
      {
        it: "Studierà l'oceano sotto la crosta di Europa",
        en: 'It will study the ocean under Europa’s crust',
      },
      { it: 'Sarà lanciata nel 2024', en: 'Launched in 2024' },
      { it: 'Arrivo previsto nel 2030', en: 'Arrival expected in 2030' },
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
  return SPACE_MISSIONS.find((m) => m.key === key) || null;
}

/**
 * Ottieni missioni attive
 * @returns {Array} Solo missioni attive
 */
export function getActiveMissions() {
  return SPACE_MISSIONS.filter((m) => {
    const st = L(m.status);
    return (
      st.includes('Attiva') ||
      st.includes('Active') ||
      st.includes('viaggio') ||
      st.includes('En route')
    );
  });
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
      <h2 style="margin:0;font-size:1.4rem;">${t('sm_title')}</h2>
      <button id="closeMissions" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;">✕</button>
    </div>
    <div id="missionsList"></div>
  `;

  const missionsList = panel.querySelector('#missionsList');
  SPACE_MISSIONS.forEach((mission) => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 16px; margin-bottom: 12px; cursor: pointer;
      transition: all 0.3s ease;
    `;
    card.onmouseenter = () => {
      card.style.borderColor = `#${mission.color.toString(16).padStart(6, '0')}`;
    };
    card.onmouseleave = () => {
      card.style.borderColor = 'rgba(255,255,255,0.1)';
    };

    const statusText = L(mission.status);
    const statusColor =
      statusText.includes('Attiva') ||
      statusText.includes('Active') ||
      statusText.includes('viaggio') ||
      statusText.includes('En route')
        ? '#44ff88'
        : '#ff8844';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong style="font-size:1.1rem;">${escapeHtml(mission.name)}</strong>
        <span style="color:${statusColor};font-size:0.8rem;">● ${escapeHtml(statusText)}</span>
      </div>
      <div style="color:rgba(255,255,255,0.6);font-size:0.85rem;margin-bottom:6px;">
        ${escapeHtml(mission.agency)} • ${escapeHtml(t('sm_launch'))}: ${escapeHtml(
          String(mission.launchYear)
        )}
      </div>
      <div style="font-size:0.9rem;margin-bottom:8px;">${escapeHtml(L(mission.description))}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.8rem;color:rgba(255,255,255,0.5);">
        <span>📡 ${escapeHtml(t('sm_distance'))}: ${escapeHtml(L(mission.currentDistance))}</span>
        <span>🎯 ${escapeHtml(t('sm_target'))}: ${escapeHtml(L(mission.target))}</span>
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
