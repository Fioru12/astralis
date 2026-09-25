// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { setupTabs } from './tabs.js';

function buildDom() {
  document.body.innerHTML = `
    <div>
      <button class="tab-btn active" data-tab="a">A</button>
      <button class="tab-btn" data-tab="b">B</button>
    </div>
    <div class="tab-content active" id="tab-a"></div>
    <div class="tab-content" id="tab-b"></div>`;
}

describe('setupTabs', () => {
  beforeEach(buildDom);

  it('imposta ruoli ARIA e attiva il tab cliccato', () => {
    setupTabs();
    const list = document.querySelector('[role="tablist"]');
    expect(list.getAttribute('aria-label')).toBeTruthy();
    const [btnA, btnB] = [...document.querySelectorAll('.tab-btn')];
    btnB.click();
    expect(btnB.classList.contains('active')).toBe(true);
    expect(btnA.getAttribute('aria-selected')).toBe('false');
    expect(document.getElementById('tab-b').hidden).toBe(false);
    expect(document.getElementById('tab-a').hidden).toBe(true);
  });

  it('naviga con frecce e Home/End', () => {
    setupTabs();
    const [btnA, btnB] = [...document.querySelectorAll('.tab-btn')];
    btnA.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(btnB);
    btnB.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(btnA);
  });
});
