// src/ui/search.js
// ══════════════════════════════════════════════════════════════════
// GLOBAL SEARCH - Ricerca oggetti celesti in tempo reale
// ══════════════════════════════════════════════════════════════════

import { escapeHtml } from '../utils/sanitize.js';
import { getLang, t } from '../i18n/index.js';
import { getBodyLabel } from '../data/celestialData.js';

export function setupGlobalSearch(allBodies, selectBody, zoomToBody) {
  const searchInput = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');

  if (!searchInput || !searchResults) return;
  // Etichetta localizzata (applyI18nToDOM la aggiorna via data-i18n-aria).
  searchInput.setAttribute('data-i18n-aria', 'search_placeholder');
  searchInput.setAttribute('aria-label', t('search_placeholder'));
  searchInput.setAttribute('role', 'combobox');
  searchInput.setAttribute('aria-autocomplete', 'list');
  searchInput.setAttribute('aria-controls', 'searchResults');
  searchInput.setAttribute('aria-expanded', 'false');
  searchResults.setAttribute('role', 'listbox');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query.length === 0) {
      searchResults.style.display = 'none';
      searchInput.setAttribute('aria-expanded', 'false');
      return;
    }

    // Filter bodies by label (IT + EN), key or aliases
    const results = allBodies
      .filter((body) => {
        const names = [body.label, body.labelEn, body.key, ...(body.aliases || [])]
          .filter(Boolean)
          .map((a) => String(a).toLowerCase());
        return names.some((a) => a.includes(query));
      })
      .slice(0, 12); // Limit to 12 results

    if (results.length === 0) {
      searchResults.innerHTML = `<div class="search-result-item" style="color: var(--text-faint);">${escapeHtml(
        t('search_no_results')
      )}</div>`;
      searchResults.style.display = 'block';
      searchInput.setAttribute('aria-expanded', 'true');
      return;
    }

    searchResults.innerHTML = results
      .map(
        (body) => `
      <div class="search-result-item" data-key="${escapeHtml(body.key)}" role="option" tabindex="0">
        <span class="search-result-icon">${escapeHtml(body.icon || '⭐')}</span>
        <div style="flex: 1;">
          <div class="search-result-name">${escapeHtml(
            getBodyLabel(body, getLang()) || body.key
          )}</div>
          <div class="search-result-type">${escapeHtml(body.type || 'unknown')}</div>
        </div>
      </div>
    `
      )
      .join('');

    searchResults.style.display = 'block';
    searchInput.setAttribute('aria-expanded', 'true');

    // Add click handlers
    searchResults.querySelectorAll('.search-result-item').forEach((item) => {
      item.addEventListener('click', () => {
        const key = item.dataset.key;
        const body = allBodies.find((b) => b.key === key);
        if (body) {
          selectBody(body);
          if (body.pivot) {
            zoomToBody(body);
          }
          searchInput.value = '';
          searchResults.style.display = 'none';
          searchInput.setAttribute('aria-expanded', 'false');
        }
      });
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          item.click();
          return;
        }
        const options = [...searchResults.querySelectorAll('[role="option"]')];
        const index = options.indexOf(item);
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          options[(index + 1) % options.length]?.focus();
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          if (index === 0) searchInput.focus();
          else options[index - 1]?.focus();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          searchInput.focus();
          searchResults.style.display = 'none';
          searchInput.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      searchResults.querySelector('[role="option"]')?.focus();
      return;
    }
    if (e.key !== 'Enter') return;
    const firstResult = searchResults.querySelector('.search-result-item');
    if (firstResult) {
      e.preventDefault();
      firstResult.click();
    }
  });

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
      searchInput.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchResults.style.display = 'none';
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.value = '';
      searchInput.blur();
    }
  });
}
