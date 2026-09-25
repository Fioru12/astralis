/**
 * Tab Navigation System
 */
import { t } from '../i18n/index.js';

export function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const tabList = tabButtons[0]?.parentElement;
  tabList?.setAttribute('role', 'tablist');
  tabList?.setAttribute('aria-label', t('tabs_panels'));

  const activate = (btn) => {
    const tabName = btn.getAttribute('data-tab');
    tabButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
      b.tabIndex = active ? 0 : -1;
    });
    tabContents.forEach((content) => {
      const active = content.id === `tab-${tabName}`;
      content.classList.toggle('active', active);
      content.hidden = !active;
    });
  };

  tabButtons.forEach((btn, index) => {
    const tabName = btn.getAttribute('data-tab');
    btn.id ||= `tab-control-${tabName}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', `tab-${tabName}`);
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', btn.id);
    }
    btn.tabIndex = btn.classList.contains('active') ? 0 : -1;
    btn.addEventListener('click', () => {
      activate(btn);
    });
    btn.addEventListener('keydown', (event) => {
      const last = tabButtons.length - 1;
      let next = null;
      if (event.key === 'ArrowRight') next = tabButtons[(index + 1) % tabButtons.length];
      if (event.key === 'ArrowLeft') next = tabButtons[(index + last) % tabButtons.length];
      if (event.key === 'Home') next = tabButtons[0];
      if (event.key === 'End') next = tabButtons[last];
      if (!next) return;
      event.preventDefault();
      activate(next);
      next.focus();
    });
  });
}
