/**
 * @file eclipses.js
 * @description Astronomical Eclipse & Celestial Alignment Simulator for Astralis.
 * Provides accurate historical and future solar and lunar eclipses with camera alignment.
 */

import { getLang } from '../i18n/index.js';

export const ECLIPSE_EVENTS = [
  {
    key: 'solar_1999',
    type: 'solar',
    title: {
      it: 'Eclisse Solare Totale Europea (1999)',
      en: 'European Total Solar Eclipse (1999)',
    },
    date: '1999-08-11T11:03:00Z',
    location: { it: 'Europa centrale e Turchia', en: 'Central Europe and Turkey' },
    description: {
      it: 'Una delle eclissi più osservate della storia umana, visibile attraverso tutta l’Europa.',
      en: 'One of the most widely viewed eclipses in history, sweeping across Europe.',
    },
    durationMax: '2m 23s',
  },
  {
    key: 'solar_2017',
    type: 'solar',
    title: { it: 'Great American Solar Eclipse (2017)', en: 'Great American Solar Eclipse (2017)' },
    date: '2017-08-21T18:26:00Z',
    location: {
      it: 'Stati Uniti (dall’Oregon alla Carolina del Sud)',
      en: 'USA (Oregon to South Carolina)',
    },
    description: {
      it: 'La prima eclisse totale da costa a costa negli Stati Uniti dal 1918.',
      en: 'First coast-to-coast total eclipse in the US contiguous territory since 1918.',
    },
    durationMax: '2m 40s',
  },
  {
    key: 'solar_2024',
    type: 'solar',
    title: { it: 'Eclisse Nordamericana (2024)', en: 'Great North American Eclipse (2024)' },
    date: '2024-04-08T18:17:00Z',
    location: { it: 'Messico, USA e Canada', en: 'Mexico, USA and Canada' },
    description: {
      it: 'Fascia di totalità con oltre 4 minuti di oscurità e straordinaria attività coronale.',
      en: 'Totality path with over 4 minutes of darkness and spectacular coronal flares.',
    },
    durationMax: '4m 28s',
  },
  {
    key: 'solar_2026',
    type: 'solar',
    title: { it: 'Eclisse Totale Iberica (2026)', en: 'Iberian Total Solar Eclipse (2026)' },
    date: '2026-08-12T17:47:00Z',
    location: { it: 'Spagna, Islanda e Groenlandia', en: 'Spain, Iceland and Greenland' },
    description: {
      it: 'Il ritorno della totalità in Europa continentale al tramonto sul territorio spagnolo.',
      en: 'The return of totality to mainland Europe at sunset across Spain.',
    },
    durationMax: '2m 18s',
  },
  {
    key: 'solar_2027',
    type: 'solar',
    title: { it: 'Eclisse del Millennio a Luxor (2027)', en: 'Luxor Great Solar Eclipse (2027)' },
    date: '2027-08-02T10:07:00Z',
    location: {
      it: 'Egitto, Spagna meridionale e Nord Africa',
      en: 'Egypt, Southern Spain and North Africa',
    },
    description: {
      it: 'Una delle eclissi più lunghe del secolo: oltre 6 minuti di buio sulla Valle dei Re.',
      en: 'One of the longest eclipses of the century: over 6 minutes of totality at Valley of the Kings.',
    },
    durationMax: '6m 23s',
  },
  {
    key: 'lunar_2019',
    type: 'lunar',
    title: { it: 'Superluna di Sangue (2019)', en: 'Super Blood Wolf Moon (2019)' },
    date: '2019-01-21T05:12:00Z',
    location: { it: 'Americhe, Europa e Africa', en: 'Americas, Europe and Africa' },
    description: {
      it: 'Eclisse lunare totale durante il perigeo, che tinge la Luna di un rosso ramato intenso.',
      en: 'Total lunar eclipse at perigee, painting the Moon in deep copper red.',
    },
    durationMax: '1h 02m',
  },
];

export class EclipseSimulator {
  constructor(options = {}) {
    this.onDateChange = options.onDateChange || (() => {});
    this.onFocus = options.onFocus || (() => {});
  }

  getEvents() {
    const lang = getLang() === 'it' ? 'it' : 'en';
    return ECLIPSE_EVENTS.map((ev) => ({
      ...ev,
      displayName: ev.title[lang] || ev.title.it,
      displayLocation: ev.location[lang] || ev.location.it,
      displayDesc: ev.description[lang] || ev.description.it,
    }));
  }

  jumpToEclipse(key) {
    const ev = ECLIPSE_EVENTS.find((e) => e.key === key);
    if (!ev) return null;

    const date = new Date(ev.date);
    this.onDateChange(date);
    this.onFocus(ev.type === 'lunar' ? 'Moon' : 'Earth', ev);
    return ev;
  }
}
