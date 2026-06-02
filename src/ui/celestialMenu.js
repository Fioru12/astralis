export function buildCelestialMenu(menuContent, allBodies, selectedBody, selectBody, celestialMenu) {
  if (!menuContent) return;
  menuContent.innerHTML = '';

  const sections = [
    { title: 'Sun', filter: b => b.key === 'Sun' },
    { title: 'Planets', filter: b => b.type === 'planet' },
    { title: 'Moons', filter: b => b.type === 'moon' },
    { title: 'Dwarf Planets', filter: b => b.type === 'dwarf' },
    { title: 'Comets', filter: b => b.type === 'comet' },
    { title: 'Asteroids', filter: b => b.type === 'asteroid' },
    { title: 'Nearby Stars', filter: b => b.type === 'star' },
    { title: 'Exoplanets', filter: b => b.type === 'exoplanet' },
    { title: 'Space Probes', filter: b => b.type === 'probe' },
  ];

  sections.forEach(sec => {
    const bodies = allBodies.filter(sec.filter);
    if (!bodies.length) return;

    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'menu-section';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'menu-section-title';
    titleDiv.textContent = sec.title;
    titleDiv.onclick = () => sectionDiv.classList.toggle('collapsed');

    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'menu-section-items';

    bodies.forEach(body => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'menu-item';
      if (selectedBody?.key === body.key) itemDiv.classList.add('selected');

      itemDiv.innerHTML = `
        <span class="menu-item-icon">${body.icon || '&#8226;'}</span>
        <span class="menu-item-name">${body.label}</span>
        <span class="menu-item-type">${body.type}</span>
      `;

      itemDiv.onclick = () => {
        selectBody(body);
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('selected'));
        itemDiv.classList.add('selected');
        if (celestialMenu) celestialMenu.classList.remove('open');
      };

      itemsDiv.appendChild(itemDiv);
    });

    sectionDiv.appendChild(titleDiv);
    sectionDiv.appendChild(itemsDiv);
    menuContent.appendChild(sectionDiv);
  });
}

export function buildStarList(starList, allBodies, filter, zoomToStar) {
  if (!starList) return;
  const stars = allBodies.filter(b => b.type === 'star');
  const search = (filter || '').toLowerCase();
  const filteredStars = stars.filter(s =>
    s.label.toLowerCase().includes(search) || s.key.toLowerCase().includes(search),
  );

  starList.innerHTML = '';
  filteredStars.forEach(star => {
    const item = document.createElement('div');
    item.style.cssText = 'padding: 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s; display: flex; flex-direction: column; gap: 2px;';

    const planets = allBodies.filter(b => b.type === 'exoplanet' && b.parent === star.key);
    const planetCount = planets.length;

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 500;">${star.icon} ${star.label}</span>
        <span style="color: rgba(255,255,255,0.5); font-size: 11px;">${star.distLY ? star.distLY + ' ly' : ''}</span>
      </div>
      ${planetCount > 0 ? `<div style="font-size: 10px; color: rgba(255,255,255,0.4);">${planetCount} confirmed planets</div>` : ''}
    `;
    item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.1)';
    item.onmouseout = () => item.style.background = 'transparent';
    item.onclick = () => zoomToStar(star.key);
    starList.appendChild(item);
  });
}

export function setupMenuUI(ui, allBodies, selectedBodyRef, selectBody, zoomToStar, hyperlaneGroup) {
  if (ui.menuToggle) {
    ui.menuToggle.onclick = () => {
      if (ui.celestialMenu) ui.celestialMenu.classList.toggle('open');
      buildCelestialMenu(ui.menuContent, allBodies, selectedBodyRef(), selectBody, ui.celestialMenu);
    };
  }
  if (ui.menuClose && ui.celestialMenu) {
    ui.menuClose.onclick = () => ui.celestialMenu.classList.remove('open');
  }
  if (ui.guideClose && ui.galaxyGuide) {
    ui.guideClose.onclick = () => ui.galaxyGuide.classList.remove('open');
  }
  if (ui.starSearch) {
    ui.starSearch.addEventListener('input', (e) => {
      buildStarList(ui.starList, allBodies, e.target.value, zoomToStar);
    });
  }
  if (ui.showHyperlanes) {
    ui.showHyperlanes.addEventListener('change', (e) => {
      const group = hyperlaneGroup || window.hyperlaneGroup;
      if (group) group.visible = e.target.checked;
    });
  }
}
