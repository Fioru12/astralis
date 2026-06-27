// src/ui/search.js
// ══════════════════════════════════════════════════════════════════
// GLOBAL SEARCH - Ricerca oggetti celesti in tempo reale
// ══════════════════════════════════════════════════════════════════

import { escapeHtml } from '../utils/sanitize.js';

export function setupGlobalSearch(allBodies, selectBody, zoomToBody) {
  const searchInput = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query.length === 0) {
      searchResults.style.display = 'none';
      return;
    }

    // Filter bodies by name or label
    const results = allBodies.filter(body => {
      const name = (body.label || body.key || '').toLowerCase();
      const aliases = (body.aliases || []).map(a => a.toLowerCase());
      return name.includes(query) || aliases.some(a => a.includes(query));
    }).slice(0, 12); // Limit to 12 results

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item" style="color: var(--text-faint);">Nessun risultato trovato</div>';
      searchResults.style.display = 'block';
      return;
    }

    searchResults.innerHTML = results.map(body => `
      <div class="search-result-item" data-key="${escapeHtml(body.key)}">
        <span class="search-result-icon">${body.icon || '⭐'}</span>
        <div style="flex: 1;">
          <div class="search-result-name">${body.label || body.key}</div>
          <div class="search-result-type">${body.type || 'unknown'}</div>
        </div>
      </div>
    `).join('');

    searchResults.style.display = 'block';

    // Add click handlers
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const key = item.dataset.key;
        const body = allBodies.find(b => b.key === key);
        if (body) {
          selectBody(body);
          if (body.pivot) {
            zoomToBody(body);
          }
          searchInput.value = '';
          searchResults.style.display = 'none';
        }
      });
    });
  });

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchResults.style.display = 'none';
      searchInput.value = '';
      searchInput.blur();
    }
  });
}
