// src/data/stellarData.js
// ══════════════════════════════════════════════════════════════════
// DATI FISICI STELLARI (valori reali da cataloghi astronomici)
//   t   = temperatura effettiva (K)
//   cls = classe spettrale
//   m   = massa (masse solari, M☉)
//   r   = raggio (raggi solari, R☉)
//   age = età (miliardi di anni, Gyr)
//   mag = magnitudine apparente
//   evo = stadio evolutivo
//   wiki = titolo pagina Wikipedia (EN)
// ══════════════════════════════════════════════════════════════════

export const STELLAR_DATA = {
  Sun:             { t: 5772,  cls: 'G2V',    m: 1.00,  r: 1.00,   age: 4.60,  mag: -26.74, evo: 'Main Sequence', wiki: 'Sun' },
  ProximaCentauri: { t: 3042,  cls: 'M5.5Ve', m: 0.122, r: 0.154,  age: 4.85,  mag: 11.13,  evo: 'Main Sequence', wiki: 'Proxima_Centauri' },
  AlphaCentauriA:  { t: 5790,  cls: 'G2V',    m: 1.079, r: 1.223,  age: 5.30,  mag: 0.01,   evo: 'Main Sequence', wiki: 'Alpha_Centauri' },
  AlphaCentauriB:  { t: 5260,  cls: 'K1V',    m: 0.909, r: 0.863,  age: 5.30,  mag: 1.33,   evo: 'Main Sequence', wiki: 'Alpha_Centauri' },
  BarnardsStar:    { t: 3134,  cls: 'M4.0V',  m: 0.144, r: 0.196,  age: 10.0,  mag: 9.51,   evo: 'Main Sequence', wiki: "Barnard's_Star" },
  Wolf359:         { t: 2800,  cls: 'M6.0V',  m: 0.090, r: 0.160,  age: 0.30,  mag: 13.54,  evo: 'Main Sequence', wiki: 'Wolf_359' },
  Lalande21185:    { t: 3601,  cls: 'M2.0V',  m: 0.390, r: 0.393,  age: 7.50,  mag: 7.52,   evo: 'Main Sequence', wiki: 'Lalande_21185' },
  Sirius:          { t: 9940,  cls: 'A1V',    m: 2.063, r: 1.711,  age: 0.24,  mag: -1.46,  evo: 'Main Sequence', wiki: 'Sirius' },
  SiriusB:         { t: 25000, cls: 'DA2',    m: 1.018, r: 0.0084, age: 0.13,  mag: 8.44,   evo: 'White Dwarf',   wiki: 'Sirius' },
  Trappist1:       { t: 2566,  cls: 'M8V',    m: 0.089, r: 0.121,  age: 7.60,  mag: 18.80,  evo: 'Main Sequence', wiki: 'TRAPPIST-1' },
  Kepler186:       { t: 3788,  cls: 'M1V',    m: 0.544, r: 0.523,  age: 4.00,  mag: 14.62,  evo: 'Main Sequence', wiki: 'Kepler-186' },
  Kepler452:       { t: 5757,  cls: 'G2V',    m: 1.037, r: 1.110,  age: 6.00,  mag: 13.43,  evo: 'Main Sequence', wiki: 'Kepler-452' },
  Kepler22:        { t: 5518,  cls: 'G5V',    m: 0.970, r: 0.979,  age: 4.00,  mag: 11.66,  evo: 'Main Sequence', wiki: 'Kepler-22' },
  Kepler62:        { t: 4925,  cls: 'K2V',    m: 0.690, r: 0.640,  age: 7.00,  mag: 13.75,  evo: 'Main Sequence', wiki: 'Kepler-62' },
  Kepler442:       { t: 4402,  cls: 'K5V',    m: 0.610, r: 0.600,  age: 2.90,  mag: 14.76,  evo: 'Main Sequence', wiki: 'Kepler-442' },
  Gliese667C:      { t: 3700,  cls: 'M1.5V',  m: 0.330, r: 0.420,  age: 6.00,  mag: 10.25,  evo: 'Main Sequence', wiki: 'Gliese_667_C' },
  Gliese581:       { t: 3480,  cls: 'M3V',    m: 0.310, r: 0.300,  age: 8.00,  mag: 10.56,  evo: 'Main Sequence', wiki: 'Gliese_581' },
  Ross128:         { t: 3192,  cls: 'M4V',    m: 0.168, r: 0.197,  age: 9.45,  mag: 11.15,  evo: 'Main Sequence', wiki: 'Ross_128' },
  Teegarden:       { t: 2904,  cls: 'M7V',    m: 0.089, r: 0.107,  age: 8.00,  mag: 15.40,  evo: 'Main Sequence', wiki: "Teegarden's_Star" },
  Luyten:          { t: 3150,  cls: 'M3.5V',  m: 0.260, r: 0.293,  age: 8.00,  mag: 9.87,   evo: 'Main Sequence', wiki: "Luyten's_Star" },
  Vega:            { t: 9602,  cls: 'A0V',    m: 2.135, r: 2.362,  age: 0.455, mag: 0.03,   evo: 'Main Sequence', wiki: 'Vega' },
  Altair:          { t: 7550,  cls: 'A7V',    m: 1.790, r: 1.790,  age: 1.00,  mag: 0.77,   evo: 'Main Sequence', wiki: 'Altair' },
  Fomalhaut:       { t: 8590,  cls: 'A3V',    m: 1.920, r: 1.842,  age: 0.44,  mag: 1.16,   evo: 'Main Sequence', wiki: 'Fomalhaut' },
  Deneb:           { t: 8525,  cls: 'A2Ia',   m: 19.0,  r: 203.0,  age: 0.011, mag: 1.25,   evo: 'Supergiant',    wiki: 'Deneb' },
  Arcturus:        { t: 4286,  cls: 'K1.5III',m: 1.080, r: 25.40,  age: 7.10,  mag: -0.05,  evo: 'Giant',         wiki: 'Arcturus' },
  Capella:         { t: 4970,  cls: 'G3III',  m: 2.570, r: 11.98,  age: 0.59,  mag: 0.08,   evo: 'Giant',         wiki: 'Capella' },
  Aldebaran:       { t: 3910,  cls: 'K5III',  m: 1.160, r: 45.10,  age: 6.40,  mag: 0.86,   evo: 'Giant',         wiki: 'Aldebaran' },
  Pleiades:        { t: 12000, cls: 'B6V',    m: 5.000, r: 4.000,  age: 0.115, mag: 1.60,   evo: 'Open Cluster',  wiki: 'Pleiades' },
};
