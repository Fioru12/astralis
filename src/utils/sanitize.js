/**
 * Sanitization utilities - Protezione XSS
 * Escape HTML entities per inserimento sicuro in innerHTML
 */

const HTML_ESCAPE_MAP = {
  '&': '&',
  '<': '<',
  '>': '>',
  '"': '"',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') return String(str);
  return str.replace(/[&<>"'`=/]/g, (s) => HTML_ESCAPE_MAP[s]);
}

export function escapeAttr(str) {
  return escapeHtml(str);
}

export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Valida che una stringa sia un body key valido (alfanumerico + dash + underscore)
 * Previene injection da URL state sharing
 */
export function isValidBodyKey(key) {
  return typeof key === 'string' && /^[a-zA-Z0-9_-]{1,50}$/.test(key);
}

/**
 * Valida un URL prima di usarlo
 */
export function isValidUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    return ['http:', 'https:'].includes(u.protocol) || u.protocol === 'data:';
  } catch {
    return false;
  }
}

/**
 * Limita dimensione di una stringa per evitare memory exhaustion
 */
export function limitLength(str, max = 10000) {
  if (typeof str !== 'string') return '';
  return str.length > max ? str.slice(0, max) : str;
}
