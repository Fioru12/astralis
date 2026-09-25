// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildInventory, filterInventory, highlightInventory } from './inventory.js';
import { buildCelestialMenu } from './celestialMenu.js';
import { setLang } from '../i18n/index.js';

const bodies = [
  { key: 'Earth', label: 'Terra', labelEn: 'Earth', icon: '🌍', type: 'planet' },
  { key: 'Moon', label: 'Luna', labelEn: 'Moon', icon: '🌙', type: 'moon' },
  { key: 'Halley', label: 'Halley', icon: '☄️', type: 'comet' },
];

describe('inventory', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="invList"></div>';
    setLang('it');
  });

  it('costruisce sezioni localizzate e filtra per nome', () => {
    const invList = document.getElementById('invList');
    buildInventory(invList, bodies, vi.fn());
    expect(invList.querySelectorAll('.inv-item').length).toBe(3);
    expect(invList.textContent).toContain('Terra');
    filterInventory(invList, 'lun');
    const visible = [...invList.querySelectorAll('.inv-item')].filter(
      (el) => el.style.display !== 'none'
    );
    expect(visible.length).toBe(1);
    expect(visible[0].textContent).toContain('Luna');
  });

  it('evidenzia il corpo selezionato', () => {
    const invList = document.getElementById('invList');
    buildInventory(invList, bodies, vi.fn());
    highlightInventory(invList, 'Earth');
    const item = invList.querySelector('[data-key="Earth"]');
    expect(item.className).toMatch(/selected|active|highlight/);
  });
});

describe('celestialMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="menuContent"></div><div id="celestialMenu"></div>';
    setLang('en');
  });

  it('mostra i nomi in inglese e seleziona al click', () => {
    const menuContent = document.getElementById('menuContent');
    const selected = [];
    buildCelestialMenu(menuContent, bodies, null, (b) => selected.push(b), null);
    expect(menuContent.textContent).toContain('Earth');
    menuContent.querySelector('.menu-item').click();
    expect(selected.length).toBe(1);
    setLang('it');
  });
});
