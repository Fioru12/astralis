import { escapeHtml } from '../utils/sanitize.js';

const invSections = [
  { title: 'Planets', filter: b => b.type === 'planet' },
  { title: 'Moons', filter: b => b.type === 'moon' },
  { title: 'Dwarf Planets', filter: b => b.type === 'dwarf' },
  { title: 'Comets', filter: b => b.type === 'comet' },
  { title: 'Asteroids', filter: b => b.type === 'asteroid' },
];

export function buildInventory(invList, allBodies, selectBody) {
  if (!invList) return;
  invList.innerHTML = '';
  invSections.forEach(sec => {
    const bodies = allBodies.filter(sec.filter);
    if (!bodies.length) return;
    const header = document.createElement('div');
    header.className = 'inv-section-header';
    header.textContent = sec.title;
    invList.appendChild(header);
    bodies.forEach(body => {
      const item = document.createElement('div');
      item.className = 'inv-item';
      item.dataset.key = body.key;
      item.innerHTML = `<span class="inv-icon">${escapeHtml(body.icon)}</span><span class="inv-name">${escapeHtml(body.label)}</span><span class="inv-dist" id="idist_${body.key}">--</span>`;
      item.addEventListener('click', () => selectBody(body));
      invList.appendChild(item);
    });
  });
}

export function updateInventoryDistances(allBodies, AU) {
  allBodies.forEach(b => {
    const el = document.getElementById('idist_' + b.key);
    if (!el || !b.pivot) return;
    const distAU = b.pivot.position.length() / AU;
    el.textContent = distAU < 0.01 ? '\u2605' : distAU.toFixed(2) + ' AU';
  });
}

export function filterInventory(invList, q) {
  if (!invList) return;
  const query = q.toLowerCase();
  invList.querySelectorAll('.inv-item').forEach(item => {
    const name = item.querySelector('.inv-name')?.textContent.toLowerCase() || '';
    item.style.display = name.includes(query) ? '' : 'none';
  });
  invList.querySelectorAll('.inv-section-header').forEach(h => {
    const next = h.nextElementSibling;
    h.style.display = (next && next.style.display !== 'none') ? '' : 'none';
  });
}

export function highlightInventory(invList, key) {
  if (!invList) return;
  invList.querySelectorAll('.inv-item').forEach(item => {
    item.classList.toggle('active', item.dataset.key === key);
  });
}
