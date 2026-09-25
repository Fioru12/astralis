// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastManager } from './toast.js';

describe('ToastManager', () => {
  let container;
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="toastContainer"></div>';
    container = document.getElementById('toastContainer');
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('mostra un toast con tipo e lo rimuove dopo la durata', () => {
    const mgr = new ToastManager();
    mgr.success('ok', 1000);
    expect(container.querySelectorAll('.toast.success').length).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(container.querySelector('.toast').classList.contains('fade-out')).toBe(true);
    vi.advanceTimersByTime(300);
    expect(container.children.length).toBe(0);
  });

  it('non esplode senza container', () => {
    document.body.innerHTML = '';
    const mgr = new ToastManager();
    expect(() => mgr.info('ciao')).not.toThrow();
  });
});
