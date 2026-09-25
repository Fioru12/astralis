// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { openFactsheetModal } from './factsheetModal.js';
import { ComparisonMode } from './comparisonMode.js';
import { setLang } from '../i18n/index.js';

const earth = {
  key: 'Earth',
  label: 'Terra',
  labelEn: 'Earth',
  icon: '🌍',
  type: 'planet',
  distAU: 1,
  moons: 1,
  day: 23.9,
  tilt: 23.4,
  desc: 'Pianeta blu.',
  descEn: 'Blue planet.',
};
const mars = { ...earth, key: 'Mars', label: 'Marte', labelEn: 'Mars' };

describe('factsheetModal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setLang('en');
  });

  it('apre la scheda con titolo e descrizione localizzati', () => {
    openFactsheetModal(earth);
    const modal = document.getElementById('factsheetModal');
    expect(modal).not.toBeNull();
    expect(modal.textContent).toContain('Earth');
    expect(modal.textContent).toContain('Blue planet.');
    document.getElementById('factsheetOkBtn').click();
    expect(modal.style.display).toBe('none');
    setLang('it');
  });
});

describe('ComparisonMode', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setLang('it');
  });

  it('confronta due corpi e mostra la tabella', () => {
    const cmp = new ComparisonMode([earth, mars]);
    cmp.toggle();
    const panel = document.getElementById('comparisonPanel');
    expect(panel).not.toBeNull();
    panel.querySelector('#cmpBody1').value = 'Earth';
    panel.querySelector('#cmpBody2').value = 'Mars';
    panel.querySelector('#cmpBody1').dispatchEvent(new Event('change'));
    expect(document.getElementById('cmpResult').textContent).toContain('Terra');
    cmp.hide();
  });
});
