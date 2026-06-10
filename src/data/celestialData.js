// src/data/celestialData.js
// ══════════════════════════════════════════════════════════════════
// SINGOLA FONTE DI VERITÀ — Tutti i dati del sistema solare
// ══════════════════════════════════════════════════════════════════

// Parametri Orbitali NASA/JPL (Epoca J2000)
// a = semiasse maggiore (AU), e = eccentricità, I = inclinazione (gradi)
// L = longitudine media, p = longitudine perielio, n = nodo ascendente
// Suffisso "0" = valore base, "1" = variazione secolare
export const ORBITAL_ELEMENTS = {
  Mercury: { a0:.38709927,a1:.00000037,  e0:.20563069,e1:.00002527,  I0:7.00497902,I1:-.00594749, L0:252.250323,L1:149472.6741, p0:77.4577962,p1:.15940013, n0:48.3307659,n1:-.12534081 },
  Venus:   { a0:.72333199,a1:.00000390,  e0:.00677323,e1:-.00004938, I0:3.39467605,I1:-.00078890, L0:181.979099,L1:58517.81538, p0:131.602467,p1:.00268329, n0:76.6798425,n1:-.27769418 },
  Earth:   { a0:1.00000011,a1:-.00000005,e0:.01671022,e1:-.00003804, I0:.00005,    I1:-.01337178, L0:100.46435, L1:35999.37244, p0:102.94719, p1:.32327364, n0:0,         n1:0          },
  Mars:    { a0:1.52366231,a1:-.00007221,e0:.09341233,e1:.00011902,  I0:1.85061,   I1:-.00813131, L0:-4.55343,  L1:19140.30268, p0:-23.94362, p1:.44441088, n0:49.57854,  n1:-.29257343 },
  Jupiter: { a0:5.20336301,a1:.00060737, e0:.04839266,e1:-.00012880, I0:1.30530,   I1:-.00183714, L0:34.40438,  L1:3034.746127, p0:14.75385,  p1:.21252668, n0:100.55615, n1:.12171703  },
  Saturn:  { a0:9.53707032,a1:-.00301530,e0:.05415060,e1:-.00036762, I0:2.48446,   I1:.00193609,  L0:49.94432,  L1:1222.493622, p0:92.43194,  p1:-.41897216,n0:113.66242, n1:-.28867794 },
  Uranus:  { a0:19.1912639,a1:.00152025, e0:.04716771,e1:-.00019150, I0:.76986,    I1:-.00206928, L0:313.23218, L1:428.4820278, p0:170.96424, p1:.40805281, n0:74.22988,  n1:.04240589  },
  Neptune: { a0:30.0689634,a1:-.00125196,e0:.00858587,e1:.00002514,  I0:1.76917,   I1:-.00027063, L0:-55.12002, L1:218.4594532, p0:44.97135,  p1:-.32241464,n0:131.72169, n1:-.00508664 },
  Pluto:   { a0:39.48,a1:0, e0:.2488,e1:0, I0:17.14,I1:0, L0:238.9, L1:.00397,   p0:224.07,p1:0, n0:110.3,n1:0  },
  Ceres:   { a0:2.767,a1:0, e0:.0758,e1:0, I0:10.59,I1:0, L0:95.99, L1:.21408,   p0:73.6,  p1:0, n0:80.3, n1:0  },
  Eris:    { a0:67.67,a1:0, e0:.4417,e1:0, I0:44.04,I1:0, L0:204.16,L1:.000173,  p0:150.98,p1:0, n0:35.96,n1:0  },
  Makemake:{ a0:45.79,a1:0, e0:.1559,e1:0, I0:29.0, I1:0, L0:174.5, L1:.000267,  p0:298.2, p1:0, n0:79.6, n1:0  },
  Haumea:  { a0:43.13,a1:0, e0:.1912,e1:0, I0:28.21,I1:0, L0:198.0, L1:.000282,  p0:239.5, p1:0, n0:122.1,n1:0  },
  Vesta:   { a0:2.3615,a1:0,e0:.0887,e1:0, I0:7.14, I1:0, L0:103.9, L1:.27127,   p0:151.2, p1:0, n0:103.8,n1:0  },
  Pallas:  { a0:2.7724,a1:0,e0:.2299,e1:0, I0:34.84,I1:0, L0:78.2,  L1:.21340,   p0:310.1, p1:0, n0:173.1,n1:0  },
  Hygiea:  { a0:3.1399,a1:0,e0:.1125,e1:0, I0:3.83, I1:0, L0:42.6,  L1:.17524,   p0:316.0, p1:0, n0:283.2,n1:0  },
  Eros:    { a0:1.4579,a1:0,e0:.2228,e1:0, I0:10.83,I1:0, L0:207.5, L1:.55961,   p0:178.9, p1:0, n0:304.3,n1:0  },
  Apophis: { a0:.9224,a1:0, e0:.1912,e1:0, I0:3.34, I1:0, L0:327.2, L1:1.11168,  p0:126.4, p1:0, n0:204.5,n1:0  },
  Itokawa: { a0:1.3240,a1:0,e0:.2801,e1:0, I0:1.62, I1:0, L0:165.0, L1:.65107,   p0:162.8, p1:0, n0:69.1, n1:0  },
  Bennu:   { a0:1.1264,a1:0,e0:.2037,e1:0, I0:6.03, I1:0, L0:290.8, L1:.81984,   p0:66.2,  p1:0, n0:2.1,  n1:0  },
};

export const PLANETS = [
  { key:'Mercury', label:'Mercurio', icon:'☿', color:0xb5a99a, radius:2.2, type:'planet', tex:'./assets/textures/2k_mercury.jpg',      tilt:0.03,   distAU:'0.39 AU', period:'88 giorni',  moons:0,   day:1407.6,  desc:'Il pianeta più piccolo e più vicino al Sole. Temperature da -180 a +430°C.' },
  { key:'Venus',   label:'Venere',   icon:'♀', color:0xf0c060, radius:3.5, type:'planet', tex:'./assets/textures/2k_venus_surface.jpg', tilt:177.3,  distAU:'0.72 AU', period:'225 giorni', moons:0,   day:-5832.5, desc:'Il pianeta più caldo (465°C). Ruota in senso retrogrado.' },
  { key:'Earth',   label:'Terra',    icon:'🌍',color:0x3a8fff, radius:3.6, type:'planet', tex:'./assets/textures/2k_earth_daymap.jpg',  tilt:23.44,  distAU:'1.00 AU', period:'365 giorni', moons:1,   day:23.93,   desc:"L'unico pianeta con vita conosciuta. 71% coperto d'acqua.", hasAtmosphere:true },
  { key:'Mars',    label:'Marte',    icon:'♂', color:0xff5533, radius:2.8, type:'planet', tex:'./assets/textures/2k_mars.jpg',          tilt:25.19,  distAU:'1.52 AU', period:'687 giorni', moons:2,   day:24.62,   desc:'Il Pianeta Rosso. Ospita Olympus Mons, il vulcano più alto del sistema solare.' },
  { key:'Jupiter', label:'Giove',    icon:'♃', color:0xd4956a, radius:8.5, type:'planet', tex:'./assets/textures/2k_jupiter.jpg',       tilt:3.13,   distAU:'5.20 AU', period:'11.9 anni',  moons:95,  day:9.93,    desc:'Il pianeta più grande. La Grande Macchia Rossa è attiva da oltre 350 anni.' },
  { key:'Saturn',  label:'Saturno',  icon:'♄', color:0xe8d080, radius:7.5, type:'planet', tex:'./assets/textures/2k_saturn.jpg',        tilt:26.73,  distAU:'9.54 AU', period:'29.5 anni',  moons:146, day:10.66,   desc:"Il pianeta degli anelli. Così poco denso che galleggerebbe sull'acqua." },
  { key:'Uranus',  label:'Urano',    icon:'⛢', color:0x55ddcc, radius:5.5, type:'planet', tex:'./assets/textures/2k_uranus.jpg',        tilt:97.77,  distAU:'19.2 AU', period:'84 anni',    moons:28,  day:-17.24,  desc:'Asse inclinato di 98° a causa di una probabile antica collisione.' },
  { key:'Neptune', label:'Nettuno',  icon:'♆', color:0x2255ff, radius:5.2, type:'planet', tex:'./assets/textures/2k_neptune.jpg',       tilt:28.32,  distAU:'30.1 AU', period:'165 anni',   moons:16,  day:16.11,   desc:'Venti fino a 2100 km/h. Triton orbita in senso retrogrado.' },
  { key:'Ceres',   label:'Cerere',   icon:'⚳', color:0x998877, radius:1.5, type:'dwarf',                                               tilt:4.0,    distAU:'2.77 AU', period:'4.6 anni',   moons:0,   day:9.07,    desc:'Il pianeta nano più grande della fascia asteroidale. Diametro 945 km.' },
  { key:'Pluto',   label:'Plutone',  icon:'♇', color:0xddbb99, radius:1.4, type:'dwarf',                                               tilt:122.5,  distAU:'39.5 AU', period:'248 anni',   moons:5,   day:153.3,   desc:"Pianeta nano nella fascia di Kuiper. Ha un'atmosfera tenue di azoto." },
  { key:'Eris',    label:'Eris',     icon:'⊕', color:0xddddcc, radius:1.3, type:'dwarf',                                               tilt:44.0,   distAU:'67.7 AU', period:'559 anni',   moons:1,   day:25.9,    desc:'Il pianeta nano più massiccio. Quasi della dimensione di Plutone.' },
  { key:'Makemake',label:'Makemake', icon:'🥚',color:0xffccaa, radius:1.2, type:'dwarf',                                               tilt:29.0,   distAU:'45.8 AU', period:'309 anni',   moons:1,   day:22.5,    desc:'Pianeta nano nella fascia di Kuiper, privo di atmosfera rilevante.' },
  { key:'Haumea',  label:'Haumea',   icon:'🏉',color:0xeeddcc, radius:1.1, type:'dwarf',                                               tilt:28.2,   distAU:'43.1 AU', period:'283 anni',   moons:2,   day:3.9,     desc:'Forma ellissoidale per la sua rotazione rapidissima (3.9 ore).' },
];

export const MOONS = [
  { key:'Moon',     label:'Luna',     icon:'🌑',color:0xbbbbaa, radius:1.0, parent:'Earth',   dist:25, period:2361600,  type:'moon', tex:'./assets/textures/2k_moon.jpg', desc:"L'unico satellite naturale della Terra. Influenza le maree." },
  { key:'Phobos',   label:'Phobos',   icon:'🌑',color:0xaa9988, radius:0.55,parent:'Mars',    dist:18, period:27553,    type:'moon', desc:'La luna più grande di Marte. Si avvicina lentamente al pianeta.' },
  { key:'Deimos',   label:'Deimos',   icon:'🌑',color:0x998877, radius:0.45,parent:'Mars',    dist:22, period:109123,   type:'moon', desc:'La luna più piccola di Marte. Probabilmente un asteroide catturato.' },
  { key:'Io',       label:'Io',       icon:'🌋',color:0xffdd44, radius:1.1, parent:'Jupiter', dist:45, period:152853,   type:'moon', desc:'Il corpo con la maggiore attività vulcanica del sistema solare.' },
  { key:'Europa',   label:'Europa',   icon:'🧊',color:0xaaccff, radius:1.0, parent:'Jupiter', dist:55, period:306822,   type:'moon', desc:'Sotto la superficie ghiacciata potrebbe esserci un oceano liquido.' },
  { key:'Ganymede', label:'Ganimede', icon:'🌑',color:0x998866, radius:1.3, parent:'Jupiter', dist:70, period:618153,   type:'moon', desc:'Il satellite più grande del sistema solare, più grande di Mercurio.' },
  { key:'Callisto', label:'Callisto', icon:'🌑',color:0x776655, radius:1.2, parent:'Jupiter', dist:90, period:1441931,  type:'moon', desc:'La luna più craterizzata del sistema solare.' },
  { key:'Amalthea', label:'Amalthea',icon:'🌑',color:0xcc9966, radius:0.4, parent:'Jupiter', dist:35, period:112435,   type:'moon', desc:'Luna interna di Giove, forma irregolare.' },
  { key:'Titan',    label:'Titano',   icon:'🟠',color:0xff9944, radius:1.3, parent:'Saturn',  dist:55, period:1377648,  type:'moon', desc:'Ha una densa atmosfera di azoto e laghi di metano liquido.' },
  { key:'Enceladus',label:'Enceladus',icon:'🧊',color:0xaaddff, radius:0.5, parent:'Saturn',  dist:40, period:118371,   type:'moon', desc:'Geyser di ghiaccio sulla superficie. Potenziale habitat extraterrestre.' },
  { key:'Mimas',    label:'Mimas',    icon:'🌑',color:0xaaaacc, radius:0.4, parent:'Saturn',  dist:45, period:82414,    type:'moon', desc:'Ha un grande cratere che le dà l\'aspetto della "Morte Nera" di Star Wars.' },
  { key:'Rhea',     label:'Rea',      icon:'🌑',color:0xccccee, radius:0.6, parent:'Saturn',  dist:60, period:390896,   type:'moon', desc:'Seconda luna più grande di Saturno.' },
  { key:'Triton',   label:'Tritone',  icon:'🌑',color:0x88bbff, radius:1.0, parent:'Neptune', dist:50, period:507773,   type:'moon', desc:'Orbita in senso retrogrado. Si avvicina lentamente a Nettuno.' },
  { key:'Miranda',  label:'Miranda',  icon:'🌑',color:0x99aadd, radius:0.4, parent:'Uranus',  dist:40, period:120576,   type:'moon', desc:'Ha una superficie estremamente frastagliata con canyon profondi.' },
  { key:'Ariel',    label:'Ariel',    icon:'🌑',color:0xaabbcc, radius:0.45,parent:'Uranus',  dist:45, period:216840,   type:'moon', desc:'Luna più brillante di Urano.' },
  { key:'Umbriel',  label:'Umbriel',  icon:'🌑',color:0x8899aa, radius:0.45,parent:'Uranus',  dist:50, period:357280,   type:'moon', desc:'Superficie scura e craterizzata.' },
  { key:'Titania',  label:'Titania',  icon:'🌑',color:0xbbccdd, radius:0.5, parent:'Uranus',  dist:55, period:875648,   type:'moon', desc:'La luna più grande di Urano.' },
  { key:'Oberon',   label:'Oberone',  icon:'🌑',color:0xaabbcc, radius:0.5, parent:'Uranus',  dist:60, period:1314480,  type:'moon', desc:'Superficie antica e craterizzata.' },
];

export const ASTEROIDS = [
  { key:'Vesta',   label:'Vesta',   icon:'🪨',color:0xff8844, radius:1.3, type:'asteroid', distAU:'2.36 AU', period:'3.6 anni', moons:0, day:5.34,  desc:'Il secondo asteroide più massiccio. Esplorato da Dawn (2011). Diametro ~525 km.' },
  { key:'Pallas',  label:'Pallas',  icon:'🪨',color:0xff8844, radius:1.2, type:'asteroid', distAU:'2.77 AU', period:'4.6 anni', moons:0, day:7.81,  desc:'Alta inclinazione orbitale (34°). Diametro ~512 km.' },
  { key:'Hygiea',  label:'Hygiea',  icon:'🪨',color:0xff8844, radius:1.1, type:'asteroid', distAU:'3.14 AU', period:'5.6 anni', moons:0, day:27.6,  desc:'Il quarto asteroide per massa. Diametro ~430 km.' },
  { key:'Eros',    label:'Eros',    icon:'🪨',color:0xff8844, radius:0.9, type:'asteroid', distAU:'1.46 AU', period:'1.76 anni',moons:0, day:5.27,  desc:'Primo asteroide orbitato da una sonda (NEAR, 2000). Forma allungata.' },
  { key:'Apophis', label:'Apophis', icon:'🪨',color:0xff8844, radius:0.8, type:'asteroid', distAU:'0.92 AU', period:'0.89 anni',moons:0, day:30.4,  desc:'Passerà a ~31.000 km dalla Terra il 13 aprile 2029. Diametro ~340 m.' },
  { key:'Itokawa', label:'Itokawa', icon:'🪨',color:0xff8844, radius:0.7, type:'asteroid', distAU:'1.32 AU', period:'1.52 anni',moons:0, day:12.13, desc:'Campioni portati a Terra da Hayabusa (JAXA, 2010). Solo 540×270 m.' },
  { key:'Bennu',   label:'Bennu',   icon:'🪨',color:0xff8844, radius:0.7, type:'asteroid', distAU:'1.13 AU', period:'1.20 anni',moons:0, day:4.3,   desc:'Campioni raccolti da OSIRIS-REx (NASA, 2020). Diametro ~490 m.' },
  { key:'Psyche',  label:'Psyche',  icon:'🪨',color:0xff8844, radius:1.4, type:'asteroid', distAU:'2.90 AU', period:'5.0 anni', moons:0, day:4.2,   desc:'Asteroid metallico ricco di ferro e nichel. Target della missione NASA Psyche (2022).' },
  { key:'Ryugu',   label:'Ryugu',   icon:'🪨',color:0xff8844, radius:0.6, type:'asteroid', distAU:'1.19 AU', period:'1.30 anni',moons:0, day:7.6,   desc:'Campioni raccolti da Hayabusa2 (JAXA, 2018). Diametro ~880 m.' },
  { key:'Dimorphos',label:'Dimorphos',icon:'🪨',color:0xff8844, radius:0.5, type:'asteroid', distAU:'2.24 AU', period:'2.11 anni',moons:0, day:11.9,  desc:'Luna di Didymos. Target della missione DART (NASA, 2022) per test deflessione.' },
];

export const COMETS = [
  { key:'Halley',    label:'Halley',     icon:'☄️',a:17.834,e:0.96714,I:162.26,w:111.33,O:58.42,  color:0x00ffff,tailColor:0x00aaff,period:'~75 anni',   perielio:'0.586 AU',scoperta:'antichità',desc:'La cometa più famosa. Ultima visita 1986, prossima 2061.' },
  { key:'HaleBopp',  label:'Hale-Bopp',  icon:'☄️',a:186.5, e:0.9951, I:89.43, w:130.59,O:282.47, color:0x00ffff,tailColor:0x00aaff,period:'~2520 anni',  perielio:'0.914 AU',scoperta:'1995',      desc:'Visibile ad occhio nudo per 18 mesi nel 1997.' },
  { key:'Churyumov', label:'67P/Chury.', icon:'☄️',a:3.463, e:0.6410, I:7.04,  w:12.78, O:50.15,  color:0x00ffff,tailColor:0x00aaff,period:'6.44 anni',  perielio:'1.243 AU',scoperta:'1969',      desc:'Esplorata da Rosetta ESA (2014-2016). Philae fu il primo lander su cometa.' },
  { key:'Tempel1',   label:'Tempel 1',   icon:'☄️',a:3.123, e:0.5175, I:10.47, w:178.84,O:68.93,  color:0x00ffff,tailColor:0x00aaff,period:'5.52 anni',  perielio:'1.500 AU',scoperta:'1867',      desc:'Impattata da Deep Impact NASA (2005).' },
  { key:'Encke',     label:'Encke',      icon:'☄️',a:2.5,   e:0.82,   I:11.78, w:186.54,O:334.57, color:0x00ffff,tailColor:0x00aaff,period:'3.30 anni',  perielio:'0.45 AU', scoperta:'1786',      desc:'Periodo orbitale più breve conosciuto. Perielio aumentato per evitare il sole.' },
  { key:'Borrelly',  label:'Borrelly',   icon:'☄️',a:3.611, e:0.6241, I:30.32, w:353.36,O:75.42,  color:0x00ffff,tailColor:0x00aaff,period:'6.86 anni',  perielio:'1.358 AU',scoperta:'1904',      desc:'Visitata da Deep Space 1 nel 2001.' },
];

export const ORBIT_COLORS = {
  Mercury:0xff8855, Venus:0xffcc44,  Earth:0x44aaff,  Mars:0xff4422,
  Jupiter:0xffaa66, Saturn:0xeedd77, Uranus:0x44ffee, Neptune:0x2266ff,
  Pluto:0xddaa88,   Ceres:0xbbaa99,  Eris:0xddddcc,   Makemake:0xffccaa,
  Haumea:0xeeddcc,  Vesta:0xbb9988,  Pallas:0x9988bb, Hygiea:0x88bb99,
  Eros:0xccaa88,    Apophis:0xee9966,Itokawa:0xbb9977,Bennu:0xaa8866,
};

// Palette standard per comete (azzurro/ciano)
export const COMET_COLORS = {
  Halley: 0x88ddff,
  HaleBopp: 0xaaeeff,
  Churyumov: 0xffddaa,
  Tempel1: 0xffcc88,
  Encke: 0xffeeaa,
  Borrelly: 0xddffcc,
};

// Palette standard per asteroidi (marrone/rossastro)
export const ASTEROID_COLORS = {
  Vesta: 0x998888,
  Pallas: 0x887799,
  Hygiea: 0x778877,
  Eros: 0xaa8866,
  Apophis: 0xcc7755,
  Itokawa: 0x997755,
  Bennu: 0x886644,
};

// Stelle vicine al sistema solare (in anni luce) con coordinate 3D della Local Bubble
// Coordinate basate su dati Gaia e posizione reale nella Local Bubble
// Il Sole è all'origine (0, 0, 0)
export const NEARBY_STARS = [
  { key:'ProximaCentauri', label:'Proxima Centauri', icon:'⭐', color:0xff6644, radius:3.0, type:'star', distLY:4.24, distAU:268332, x:-0.47, y:-4.22, z:-1.38, desc:'La stella più vicina al Sole. Nana rossa, ospita un pianeta nella zona abitabile.' },
  { key:'AlphaCentauriA', label:'Alpha Centauri A', icon:'⭐', color:0xffffcc, radius:4.0, type:'star', distLY:4.37, distAU:276000, x:-0.50, y:-4.34, z:-1.40, desc:'Componente principale del sistema Alpha Centauri. Simile al Sole ma leggermente più grande.' },
  { key:'AlphaCentauriB', label:'Alpha Centauri B', icon:'⭐', color:0xffeeaa, radius:3.5, type:'star', distLY:4.37, distAU:276000, x:-0.52, y:-4.33, z:-1.41, desc:'Seconda componente del sistema Alpha Centauri. Nana arancione leggermente più piccola del Sole.' },
  { key:'BarnardsStar', label:'Stella di Barnard', icon:'⭐', color:0xff8866, radius:2.8, type:'star', distLY:5.96, distAU:376000, x:1.21, y:5.82, z:-0.19, desc:'Nana rossa con il moto proprio più alto. Seconda stella più vicina.' },
  { key:'Wolf359', label:'Wolf 359', icon:'⭐', color:0xff5544, radius:2.5, type:'star', distLY:7.86, distAU:496000, x:2.39, y:7.47, z:-0.01, desc:'Nana rossa molto debole. Terza stella più vicina.' },
  { key:'Lalande21185', label:'Lalande 21185', icon:'⭐', color:0xff7766, radius:2.6, type:'star', distLY:8.29, distAU:523000, x:-2.05, y:8.04, z:0.20, desc:'Nana rossa con alta attività magnetica.' },
  { key:'Sirius', label:'Sirio', icon:'⭐', color:0xaaccff, radius:5.0, type:'star', distLY:8.60, distAU:543000, x:-1.61, y:8.44, z:-0.89, desc:'La stella più luminosa del cielo notturno. Sistema binario con nana bianca.' },
  { key:'SiriusB', label:'Sirio B', icon:'⭐', color:0xffffff, radius:2.0, type:'star', distLY:8.60, distAU:543000, x:-1.62, y:8.43, z:-0.90, desc:'Nana bianca compagna di Sirio. Prima nana bianca scoperta.' },
  { key:'Trappist1', label:'TRAPPIST-1', icon:'⭐', color:0xff5533, radius:2.5, type:'star', distLY:39.0, distAU:2460000, x:-5.38, y:-38.61, z:-6.17, desc:'Nana ultra-fredda con 7 pianeti terrestri. 3 nella zona abitabile.' },
  { key:'Kepler186', label:'Kepler-186', icon:'⭐', color:0xffaa66, radius:3.0, type:'star', distLY:500.0, distAU:31600000, x:-452.1, y:213.8, z:89.3, desc:'Nana rossa con pianeta terrestre nella zona abitabile.' },
  { key:'Kepler452', label:'Kepler-452', icon:'⭐', color:0xffffcc, radius:3.5, type:'star', distLY:1400.0, distAU:88500000, x:1298.7, y:-428.5, z:234.1, desc:'Stella simile al Sole con Super-Terra nella zona abitabile.' },
  { key:'Kepler22', label:'Kepler-22', icon:'⭐', color:0xffffaa, radius:3.2, type:'star', distLY:620.0, distAU:39200000, x:579.4, y:219.8, z:-103.6, desc:'Stella simile al Sole con pianeta nella zona abitabile.' },
  { key:'Kepler62', label:'Kepler-62', icon:'⭐', color:0xffaa55, radius:2.9, type:'star', distLY:1200.0, distAU:75800000, x:1121.8, y:-428.9, z:234.7, desc:'Nana rossa con 5 pianeti, uno nella zona abitabile.' },
  { key:'Kepler442', label:'Kepler-442', icon:'⭐', color:0xffffcc, radius:3.3, type:'star', distLY:1200.0, distAU:75800000, x:1122.1, y:-429.2, z:234.5, desc:'Stella simile al Sole con pianeta nella zona abitabile.' },
  { key:'Gliese667C', label:'Gliese 667 C', icon:'⭐', color:0xff6644, radius:2.7, type:'star', distLY:23.6, distAU:1490000, x:8.22, y:-22.02, z:0.13, desc:'Nana rossa con pianeta nella zona abitabile.' },
  { key:'Gliese581', label:'Gliese 581', icon:'⭐', color:0xff5544, radius:2.6, type:'star', distLY:20.5, distAU:1290000, x:6.27, y:-19.46, z:-4.73, desc:'Nana rossa con pianeta nella zona abitabile.' },
  { key:'Ross128', label:'Ross 128', icon:'⭐', color:0xff7766, radius:2.5, type:'star', distLY:11.0, distAU:695000, x:-6.49, y:-8.96, z:-2.08, desc:'Nana rossa con alta attività magnetica. Ospita pianeta nella zona abitabile.' },
  { key:'Teegarden', label:"Teegarden's Star", icon:'⭐', color:0xff6644, radius:2.4, type:'star', distLY:12.5, distAU:790000, x:12.15, y:-2.98, z:-0.52, desc:'Nana ultra-fredda con due pianeti nella zona abitabile.' },
  { key:'Luyten', label:"Luyten's Star", icon:'⭐', color:0xff8866, radius:2.6, type:'star', distLY:12.4, distAU:784000, x:8.79, y:-8.66, z:-2.84, desc:'Nana rossa con Super-Terra nella zona abitabile.' },
  // Stelle aggiuntive della Local Bubble per visualizzazione più completa
  { key:'Vega', label:'Vega', icon:'⭐', color:0xaaddff, radius:4.5, type:'star', distLY:25.0, distAU:1580000, x:5.12, y:24.36, z:6.58, desc:'Stella principale della costellazione della Lira. Quinta più luminosa.' },
  { key:'Altair', label:'Altair', icon:'⭐', color:0xffffcc, radius:4.2, type:'star', distLY:16.7, distAU:1050000, x:8.81, y:14.26, z:-10.91, desc:'Stella dell\'Aquila. Ruota molto velocemente.' },
  { key:'Fomalhaut', label:'Fomalhaut', icon:'⭐', color:0xffffff, radius:4.3, type:'star', distLY:25.0, distAU:1580000, x:-21.15, y:12.62, z:-8.67, desc:'Stella del Pesce Australe. Ha un disco di polvere.' },
  { key:'Deneb', label:'Deneb', icon:'⭐', color:0xffffff, radius:5.5, type:'star', distLY:802.0, distAU:50600000, x:801.6, y:-21.4, z:189.7, desc:'Stella più luminosa del Cigno. Super-gigante bianca.' },
  { key:'Arcturus', label:'Arturo', icon:'⭐', color:0xffaa66, radius:6.0, type:'star', distLY:36.7, distAU:2320000, x:-11.23, y:34.89, z:-10.34, desc:'Stella più luminosa del Boote. Gigante arancione.' },
  { key:'Capella', label:'Capella', icon:'⭐', color:0xffffee, radius:5.5, type:'star', distLY:42.9, distAU:2710000, x:13.76, y:40.61, z:6.67, desc:'Sestima stella più luminosa. Sistema quadruplo.' },
  { key:'Aldebaran', label:'Aldebaran', icon:'⭐', color:0xffaa44, radius:6.2, type:'star', distLY:65.3, distAU:4120000, x:20.08, y:61.88, z:-16.26, desc:'Stella più luminosa del Toro. Gigante arancione.' },
  { key:'Pleiades', label:'Pleiadi', icon:'✨', color:0xaaccff, radius:8.0, type:'star', distLY:444.0, distAU:28000000, x:136.8, y:421.9, z:37.6, desc:'Ammasso aperto delle Sette Sorelle. 100+ stelle giovani.' },
];

// Importiamo i dati reali NASA Exoplanet Catalog
import nasaExoplanetsData from './nasaExoplanets.json';

// Importiamo il database HYG per le stelle
import hygStarsData from './hygStars.json';

// Pianeti extrasolari riconosciuti nei sistemi vicini
export const EXOPLANETS = [
  { key:'ProximaB', label:'Proxima Centauri b', icon:'🌍', color:0x88ccff, radius:1.1, type:'exoplanet', parent:'ProximaCentauri', distAU:0.0485, period:'11.2 giorni', mass:'1.27 M⊕', temp:'234 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Pianeta nella zona abitabile di Proxima Centauri. Terrestre, potenzialmente abitabile.' },
  { key:'ProximaC', label:'Proxima Centauri c', icon:'🌍', color:0x88aacc, radius:1.0, type:'exoplanet', parent:'ProximaCentauri', distAU:0.0289, period:'5.2 giorni', mass:'1.17 M⊕', temp:'39 K', atmosphere:'Sconosciuta', habitability:'Troppo freddo', desc:'Pianeta interno di Proxima Centauri. Troppo freddo per la vita.' },
  { key:'BarnardsB', label:'Barnard b', icon:'🌍', color:0x99ddff, radius:1.0, type:'exoplanet', parent:'BarnardsStar', distAU:0.404, period:'233 giorni', mass:'3.23 M⊕', temp:'170 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Super-Terra nella zona abitabile della Stella di Barnard.' },
  { key:'Ross128b', label:'Ross 128 b', icon:'🌍', color:0x77bbee, radius:1.1, type:'exoplanet', parent:'Ross128', distAU:0.049, period:'9.9 giorni', mass:'1.35 M⊕', temp:'280 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Pianeta nella zona abitabile. Ross 128 è a 11 anni luce dal Sole.' },
  { key:'TeegardenB', label:'Teegarden b', icon:'🌍', color:0x66aadd, radius:1.05, type:'exoplanet', parent:'Teegarden', distAU:0.0252, period:'4.9 giorni', mass:'1.05 M⊕', temp:'283 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Pianeta nella zona abitabile. Teegarden è a 12 anni luce dal Sole.' },
  { key:'LuytenB', label:'Luyten b', icon:'🌍', color:0x88ccdd, radius:1.2, type:'exoplanet', parent:'Luyten', distAU:0.061, period:'18.6 giorni', mass:'2.89 M⊕', temp:'259 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Super-Terra nella zona abitabile. Luyten è a 12.4 anni luce dal Sole.' },
  { key:'Trappist1b', label:'TRAPPIST-1 b', icon:'🌍', color:0x88ccff, radius:1.02, type:'exoplanet', parent:'Trappist1', distAU:0.011, period:'1.5 giorni', mass:'1.02 M⊕', temp:'400 K', atmosphere:'Sconosciuta', habitability:'Troppo caldo', desc:'Pianeta terrestre molto vicino alla stella. Troppo caldo per la vita.' },
  { key:'Trappist1c', label:'TRAPPIST-1 c', icon:'🌍', color:0x88ccff, radius:1.38, type:'exoplanet', parent:'Trappist1', distAU:0.015, period:'2.4 giorni', mass:'1.38 M⊕', temp:'341 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Pianeta terrestre nella zona abitabile. Potenzialmente abitabile.' },
  { key:'Trappist1d', label:'TRAPPIST-1 d', icon:'🌍', color:0x88ccff, radius:0.29, type:'exoplanet', parent:'Trappist1', distAU:0.021, period:'4.0 giorni', mass:'0.29 M⊕', temp:'288 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Pianeta terrestre nella zona abitabile. Potenzialmente abitabile.' },
  { key:'Trappist1e', label:'TRAPPIST-1 e', icon:'🌍', color:0x88ccff, radius:0.62, type:'exoplanet', parent:'Trappist1', distAU:0.028, period:'6.1 giorni', mass:'0.62 M⊕', temp:'251 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Pianeta terrestre nella zona abitabile. Molto simile alla Terra.' },
  { key:'Trappist1f', label:'TRAPPIST-1 f', icon:'🌍', color:0x88ccff, radius:0.68, type:'exoplanet', parent:'Trappist1', distAU:0.037, period:'9.2 giorni', mass:'0.68 M⊕', temp:'219 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Pianeta terrestre nella zona abitabile. Potenzialmente abitabile.' },
  { key:'Trappist1g', label:'TRAPPIST-1 g', icon:'🌍', color:0x88ccff, radius:1.32, type:'exoplanet', parent:'Trappist1', distAU:0.045, period:'12.4 giorni', mass:'1.32 M⊕', temp:'198 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Pianeta terrestre nella zona abitabile. Potenzialmente abitabile.' },
  { key:'Kepler186f', label:'Kepler-186 f', icon:'🌍', color:0x77bbee, radius:1.1, type:'exoplanet', parent:'Kepler186', distAU:0.35, period:'130 giorni', mass:'1.1 M⊕', temp:'188 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Primo pianeta terrestre nella zona abitabile di una stella simile al Sole.' },
  { key:'Kepler452b', label:'Kepler-452 b', icon:'🌍', color:0x66aadd, radius:1.3, type:'exoplanet', parent:'Kepler452', distAU:1.04, period:'385 giorni', mass:'5.0 M⊕', temp:'265 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Super-Terra nella zona abitabile. "Cugino" della Terra.' },
  { key:'Kepler22b', label:'Kepler-22 b', icon:'🌍', color:0x5599cc, radius:2.4, type:'exoplanet', parent:'Kepler22', distAU:0.84, period:'290 giorni', mass:'2.4 M⊕', temp:'262 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Super-Terra nella zona abitabile. Scoperto nel 2011.' },
  { key:'Kepler62f', label:'Kepler-62 f', icon:'🌍', color:0x66aadd, radius:1.4, type:'exoplanet', parent:'Kepler62', distAU:0.72, period:'267 giorni', mass:'1.4 M⊕', temp:'208 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Super-Terra nella zona abitabile del sistema Kepler-62.' },
  { key:'Kepler442b', label:'Kepler-442 b', icon:'🌍', color:0x5588bb, radius:1.3, type:'exoplanet', parent:'Kepler442', distAU:0.41, period:'112 giorni', mass:'1.3 M⊕', temp:'233 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Super-Terra nella zona abitabile.' },
  { key:'Gliese667Cc', label:'Gliese 667 Cc', icon:'🌍', color:0x77aacc, radius:1.5, type:'exoplanet', parent:'Gliese667C', distAU:0.125, period:'28 giorni', mass:'1.5 M⊕', temp:'277 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Super-Terra nella zona abitabile di Gliese 667 C.' },
  { key:'Gliese581g', label:'Gliese 581 g', icon:'🌍', color:0x6699bb, radius:1.2, type:'exoplanet', parent:'Gliese581', distAU:0.146, period:'36.6 giorni', mass:'1.2 M⊕', temp:'228 K', atmosphere:'Sconosciuta', habitability:'Potenzialmente abitabile', desc:'Super-Terra nella zona abitabile di Gliese 581.' },
];

// Esporta i dati NASA grezzi per riferimento futuro
export const NASA_EXOPLANETS_RAW = nasaExoplanetsData;

// Funzione per convertire il colore basato sulla classe spettrale
function spectralToColor(spect) {
  if (!spect) return 0xffffff;
  const type = spect.charAt(0);
  switch(type) {
    case 'O': return 0x9bb0ff;
    case 'B': return 0xaabfff;
    case 'A': return 0xcad7ff;
    case 'F': return 0xf8f7ff;
    case 'G': return 0xfff4ea;
    case 'K': return 0xffd2a1;
    case 'M': return 0xffcc6f;
    default: return 0xffffff;
  }
}

// Funzione per convertire i dati HYG in formato del progetto
function convertHYGToStarData(hygStar) {
  const color = spectralToColor(hygStar.spect);
  const radius = Math.max(1.0, Math.min(6.0, 5.0 - hygStar.absmag / 2));
  return {
    key: hygStar.proper || hygStar.base || `HYG_${hygStar.id}`,
    label: hygStar.proper || hygStar.base || `Star ${hygStar.id}`,
    icon: '⭐',
    color: color,
    radius: radius,
    type: 'star',
    distLY: hygStar.dist,
    distAU: hygStar.dist * 63241,
    desc: `Classe spettrale: ${hygStar.spect}, Magnitudine: ${hygStar.mag}`,
    spectral: hygStar.spect,
    magnitude: hygStar.mag,
    absoluteMagnitude: hygStar.absmag
  };
}

// Genera stelle dal database HYG (prime 10 per performance)
export const HYG_STARS = hygStarsData.stars.slice(0, 10).map(convertHYGToStarData);

// Esporta i dati HYG grezzi per riferimento futuro
export const HYG_STARS_RAW = hygStarsData;

// Sonde spaziali importanti con parametri orbitali
export const SPACE_PROBES = [
  { key:'Voyager1', label:'Voyager 1', icon:'🛸', color:0xff00ff, radius:0.3, type:'probe', parent:'Sun', distAU:162, a:160, e:0.3, I:0, w:0, O:0, desc:'La sonda più lontana dalla Terra. Ha lasciato il sistema solare nel 2012. Diretta verso costellazione Ofiuco.' },
  { key:'Voyager2', label:'Voyager 2', icon:'🛸', color:0xff00ff, radius:0.3, type:'probe', parent:'Sun', distAU:134, a:130, e:0.25, I:0, w:0, O:0, desc:'Unica sonda ad aver visitato Urano e Nettuno. Ha lasciato il sistema solare nel 2018. Diretta verso costellazione Idra.' },
  { key:'NewHorizons', label:'New Horizons', icon:'🛸', color:0xff00ff, radius:0.25, type:'probe', parent:'Sun', distAU:58, a:55, e:0.15, I:2.2, w:0, O:0, desc:'Ha visitato Plutone nel 2015 e Arrokoth nel 2019. Diretta verso la fascia di Kuiper.' },
  { key:'ParkerSolar', label:'Parker Solar Probe', icon:'🛸', color:0xff00ff, radius:0.2, type:'probe', parent:'Sun', distAU:0.3, a:0.4, e:0.65, I:3.4, w:0, O:0, desc:'Sonda solare più vicina al Sole. Raggiunge 6.9 milioni di km dalla superficie solare. Orbita altamente ellittica.' },
  { key:'Juno', label:'Juno', icon:'🛸', color:0xff00ff, radius:0.25, type:'probe', parent:'Jupiter', distAU:5.2, a:5.2, e:0.0, I:0, w:0, O:0, desc:'In orbita attorno a Giove dal 2016. Studia la struttura interna del gigante gassoso.' },
  { key:'Cassini', label:'Cassini', icon:'🛸', color:0xff00ff, radius:0.3, type:'probe', parent:'Saturn', distAU:9.5, a:9.5, e:0.0, I:0, w:0, O:0, desc:'Ha esplorato Saturno dal 2004 al 2017. Missione conclusa con tuffo nell\'atmosfera. (Missione terminata)' },
  { key:'Rosetta', label:'Rosetta', icon:'🛸', color:0xff00ff, radius:0.25, type:'probe', parent:'Churyumov', distAU:3.5, a:3.5, e:0.64, I:7.0, w:12.8, O:50.2, desc:'Prima sonda ad orbitare una cometa (67P/Churyumov-Gerasimenko). Philae fu il primo lander su cometa. (Missione terminata)' },
  { key:'Curiosity', label:'Curiosity', icon:'🛸', color:0xff00ff, radius:0.2, type:'probe', parent:'Mars', distAU:1.5, a:1.5, e:0.0, I:0, w:0, O:0, desc:'Rover su Marte dal 2012. Studia la geologia e l\'abitabilità del pianeta rosso. Nel cratere Gale.' },
  { key:'Perseverance', label:'Perseverance', icon:'🛸', color:0xff00ff, radius:0.2, type:'probe', parent:'Mars', distAU:1.5, a:1.5, e:0.0, I:0, w:0, O:0, desc:'Rover su Marte dal 2021. Raccoglie campioni per futura missione di ritorno. Nel cratere Jezero.' },
];