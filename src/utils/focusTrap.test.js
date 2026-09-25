import { beforeEach, describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { trapFocus } from './focusTrap.js';

describe('trapFocus', () => {
  beforeEach(() => {
    const dom = new JSDOM(
      '<div id="dialog"><button id="first">First</button><input><button id="last">Last</button></div>'
    );
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.getComputedStyle = dom.window.getComputedStyle;
  });

  it('wraps forward from the last to the first control', () => {
    const dialog = document.querySelector('#dialog');
    document.querySelector('#last').focus();
    const event = new window.KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    trapFocus(dialog, event);
    expect(document.activeElement.id).toBe('first');
    expect(event.defaultPrevented).toBe(true);
  });

  it('wraps backward from the first to the last control', () => {
    const dialog = document.querySelector('#dialog');
    document.querySelector('#first').focus();
    const event = new window.KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      cancelable: true,
    });
    trapFocus(dialog, event);
    expect(document.activeElement.id).toBe('last');
    expect(event.defaultPrevented).toBe(true);
  });
});
