/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  escapeAttr,
  safeJsonParse,
  isValidBodyKey,
  isValidUrl,
  limitLength,
} from './sanitize.js';

describe('sanitize', () => {
  describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '<script>alert("xss")<&#x2F;script>'
      );
    });

    it('handles ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a & b');
    });

    it('handles single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#39;s');
    });

    it('handles equals signs', () => {
      expect(escapeHtml('a = b')).toBe('a &#x3D; b');
    });

    it('handles backticks and forward slashes', () => {
      expect(escapeHtml('`test`/path')).toBe('&#x60;test&#x60;&#x2F;path');
    });

    it('returns empty string for null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('converts non-string to string', () => {
      expect(escapeHtml(123)).toBe('123');
      expect(escapeHtml(true)).toBe('true');
    });
  });

  describe('escapeAttr', () => {
    it('delegates to escapeHtml', () => {
      expect(escapeAttr('<b>')).toBe('<b>');
    });
  });

  describe('safeJsonParse', () => {
    it('parses valid JSON', () => {
      expect(safeJsonParse('{"key":"value"}')).toEqual({ key: 'value' });
    });

    it('returns fallback for invalid JSON', () => {
      expect(safeJsonParse('invalid', null)).toBeNull();
      expect(safeJsonParse('invalid', 'default')).toBe('default');
    });

    it('handles array JSON', () => {
      expect(safeJsonParse('[1,2,3]')).toEqual([1, 2, 3]);
    });
  });

  describe('isValidBodyKey', () => {
    it('accepts alphanumeric keys with dash/underscore', () => {
      expect(isValidBodyKey('Earth')).toBe(true);
      expect(isValidBodyKey('Proxima_Centauri')).toBe(true);
      expect(isValidBodyKey('Kepler-442b')).toBe(true);
    });

    it('rejects keys with special characters', () => {
      expect(isValidBodyKey('Earth<script>')).toBe(false);
      expect(isValidBodyKey('Earth?param=1')).toBe(false);
    });

    it('rejects keys exceeding 50 chars', () => {
      expect(isValidBodyKey('a'.repeat(51))).toBe(false);
      expect(isValidBodyKey('a'.repeat(50))).toBe(true);
    });

    it('rejects non-string', () => {
      expect(isValidBodyKey(123)).toBe(false);
      expect(isValidBodyKey(null)).toBe(false);
      expect(isValidBodyKey(undefined)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('accepts http and https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('accepts data URLs', () => {
      expect(isValidUrl('data:image/png;base64,abc')).toBe(true);
    });

    it('rejects javascript: URLs', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('rejects non-browser protocols', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('file:///etc/passwd')).toBe(false);
    });

    it('accepts relative URLs (resolved against origin)', () => {
      expect(isValidUrl('/path/to/resource')).toBe(true);
    });
  });

  describe('limitLength', () => {
    it('limits string to max length', () => {
      expect(limitLength('hello world', 5)).toBe('hello');
    });

    it('keeps string if under max', () => {
      expect(limitLength('hello', 100)).toBe('hello');
    });

    it('returns empty string for non-string input', () => {
      expect(limitLength(123)).toBe('');
      expect(limitLength(null)).toBe('');
    });

    it('uses default max length of 10000', () => {
      const longStr = 'a'.repeat(10001);
      expect(limitLength(longStr)).toHaveLength(10000);
    });
  });
});
