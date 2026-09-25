/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { URLState } from './urlState.js';

describe('URLState', () => {
  let urlState;

  beforeEach(() => {
    // Reset URL search params before each test
    window.history.replaceState({}, '', '/');
    urlState = new URLState();
  });

  afterEach(() => {
    // Restore original URL
    window.history.replaceState({}, '', '/');
  });

  it('creates instance with empty params by default', () => {
    expect(urlState.params.toString()).toBe('');
  });

  it('get() returns null for missing key', () => {
    expect(urlState.get('body')).toBeNull();
  });

  it('has() returns false for missing key', () => {
    expect(urlState.has('body')).toBe(false);
  });

  it('set() adds a parameter and writes to history', () => {
    urlState.set('body', 'Earth');
    expect(urlState.get('body')).toBe('Earth');
    expect(urlState.has('body')).toBe(true);
    expect(window.location.search).toContain('body=Earth');
  });

  it('set() with null deletes the parameter', () => {
    urlState.set('body', 'Earth');
    urlState.set('body', null);
    expect(urlState.get('body')).toBeNull();
    expect(window.location.search).not.toContain('body=Earth');
  });

  it('setMany() sets multiple parameters', () => {
    urlState.setMany({ body: 'Mars', speed: '3', theme: 'dark' });
    expect(urlState.get('body')).toBe('Mars');
    expect(urlState.get('speed')).toBe('3');
    expect(urlState.get('theme')).toBe('dark');
  });

  it('remove() deletes a parameter', () => {
    urlState.set('body', 'Jupiter');
    urlState.remove('body');
    expect(urlState.get('body')).toBeNull();
  });

  it('getBodyKey() returns validated key', () => {
    urlState.set('body', 'Earth');
    expect(urlState.getBodyKey()).toBe('Earth');
  });

  it('getBodyKey() returns null for invalid key', () => {
    urlState.set('body', '<script>alert(1)</script>');
    expect(urlState.getBodyKey()).toBeNull();
  });

  it('toJSON() returns only known params', () => {
    urlState.set('body', 'Saturn');
    urlState.set('theme', 'light');
    const json = urlState.toJSON();
    expect(json).toHaveProperty('body', 'Saturn');
    expect(json).toHaveProperty('theme', 'light');
    expect(
      Object.keys(json).every((k) =>
        ['body', 'view', 'date', 'speed', 'theme', 'lang', 'preset'].includes(k)
      )
    ).toBe(true);
  });

  it('getShareURL() returns full URL with params', () => {
    urlState.set('body', 'Venus');
    const url = urlState.getShareURL();
    expect(url).toContain('body=Venus');
  });

  it('_fallbackCopy() appends textarea, selects, and removes it', () => {
    // Mock execCommand (jsdom may not implement it)
    document.execCommand = () => true;
    // Use the internal method
    urlState._fallbackCopy('test-url');
    // After copy, textarea should be removed
    expect(document.querySelectorAll('textarea').length).toBe(0);
    // Verify URLState instance still works
    expect(urlState.params).toBeDefined();
  });
});
