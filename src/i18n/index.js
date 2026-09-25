/**
 * i18n minimale - Internazionalizzazione Sistema Solare
 * Supporta IT e EN, fallback automatico a IT
 */

import { it } from './it.js';
import { en } from './en.js';

const locales = { it, en };
const STORAGE_KEY = 'solar-system.lang';
let currentLang = 'it';
const listeners = new Set();

export function detectLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && locales[stored]) return stored;
  const browser = (navigator.language || 'it').slice(0, 2).toLowerCase();
  return locales[browser] ? browser : 'it';
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (!locales[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  listeners.forEach((fn) => fn(lang));
}

export function t(key, params) {
  const dict = locales[currentLang] || locales.it;
  let str = dict[key];
  if (str === undefined) str = locales.it[key] || key;
  if (params && typeof str === 'string') {
    Object.keys(params).forEach((k) => {
      str = str.replace(new RegExp(`{${k}}`, 'g'), params[k]);
    });
  }
  return str;
}

export function tPlural(key, count, params) {
  const dict = locales[currentLang] || locales.it;
  const plurals = dict[key + '_plural'];
  if (!plurals) return t(key, { ...params, count });
  const rule =
    typeof Intl !== 'undefined' && Intl.PluralRules
      ? new Intl.PluralRules(currentLang).select(count)
      : count === 1
        ? 'one'
        : 'other';
  let str = plurals[rule] || plurals.other || plurals.one || key;
  if (params) {
    Object.keys(params).forEach((k) => {
      str = str.replace(new RegExp(`{${k}}`, 'g'), params[k]);
    });
  }
  return str;
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function applyI18nToDOM(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
}

// Inizializza al primo import
currentLang = detectLang();
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLang;
}

export const availableLangs = Object.keys(locales);
