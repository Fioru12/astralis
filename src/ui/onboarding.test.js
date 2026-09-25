// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onboarding } from './onboarding.js';
import { setLang } from '../i18n/index.js';

describe('onboarding', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    onboarding.container = null;
    onboarding.overlay = null;
    onboarding.currentStep = 0;
    setLang('it');
    vi.stubGlobal('requestAnimationFrame', (cb) => cb());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('mostra una volta sola e ricorda lo skip', () => {
    expect(onboarding.shouldShow()).toBe(true);
    onboarding.show();
    expect(document.body.textContent).toContain('Benvenuto');
    document.getElementById('obSkip').click();
    expect(onboarding.shouldShow()).toBe(false);
  });
});
