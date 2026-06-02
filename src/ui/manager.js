export function createUIRefs() {
  return {
    clock:       document.getElementById('clock'),
    toggle:      document.getElementById('toggle'),
    now:         document.getElementById('now'),
    resetCam:    document.getElementById('resetCam'),
    speed:       document.getElementById('speed'),
    speedLabel:  document.getElementById('speedLabel'),
    orbits:      document.getElementById('orbits'),
    labels:      document.getElementById('labels'),
    labelsLayer: document.getElementById('labelsLayer'),
    infoPanel:   document.getElementById('infoPanel'),
    infoClose:   document.getElementById('infoClose'),
    infoName:    document.getElementById('infoName'),
    infoBody:    document.getElementById('infoBody'),
    modeHint:    document.getElementById('modeHint'),
    invPanel:    document.getElementById('inventoryPanel'),
    invList:     document.getElementById('inventoryList'),
    invSearch:   document.getElementById('inventorySearch'),
    invToggle:   document.getElementById('inventoryToggle'),
    camLabel:    document.getElementById('camModeLabel'),
    yearBack:    document.getElementById('yearBack'),
    yearFwd:     document.getElementById('yearFwd'),
    decBack:     document.getElementById('decBack'),
    decFwd:      document.getElementById('decFwd'),
    menuToggle:  document.getElementById('menuToggle'),
    celestialMenu: document.getElementById('celestialMenu'),
    menuClose:   document.getElementById('menuClose'),
    menuContent: document.getElementById('menuContent'),
    galaxyMapBtn: document.getElementById('galaxyMapBtn'),
    galaxyGuide: document.getElementById('galaxyGuide'),
    guideClose:   document.getElementById('guideClose'),
    starSearch:   document.getElementById('starSearch'),
    starList:     document.getElementById('starList'),
    showHyperlanes: document.getElementById('showHyperlanes'),
    minimapContainer: document.getElementById('minimapContainer'),
    minimapCanvas: document.getElementById('minimapCanvas'),
  };
}

export function showHint(ui, msg, hintTimerRef) {
  if (!ui.modeHint) return;
  ui.modeHint.textContent = msg;
  ui.modeHint.style.opacity = '1';
  clearTimeout(hintTimerRef.current);
  hintTimerRef.current = setTimeout(() => { ui.modeHint.style.opacity = '0'; }, 4000);
}

export function setCamLabel(ui, mode) {
  if (!ui.camLabel) return;
  const labels = { orbit: 'Orbit', fly: 'Free Flight', follow: 'Follow' };
  ui.camLabel.textContent = labels[mode] || mode;
}

export function timeMultiplier(ui) {
  const v = ui.speed ? parseFloat(ui.speed.value) : 0;
  return v < 0 ? -Math.pow(10, -v) : Math.pow(10, v);
}

export function speedText(m) {
  if (Math.abs(m - 1) < 1e-9) return '1x';
  if (Math.abs(m + 1) < 1e-9) return '-1x';
  if (m > 0) return m >= 1 ? m.toFixed(m < 10 ? 1 : 0) + 'x' : '/' + (1 / m).toFixed(1);
  return '-' + (Math.abs(m) >= 1 ? Math.abs(m).toFixed(Math.abs(m) < 10 ? 1 : 0) : '1/' + Math.round(1 / Math.abs(m))) + 'x';
}
