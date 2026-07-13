import * as THREE from 'three';
import GUI from 'lil-gui';
import './dev-heartbeat.js'; // Keep dev server alive

import { AU, DEG, SUN_R } from './utils/constants.js';
import { julianDate, makeCanvasSprite, makeGlow, createTooltip } from './utils/helpers.js';
import { textureLoader as TL } from './utils/textureLoader.js';
import { getProceduralPlanetTexture, generateSaturnRingTexture, generateProceduralMilkyWay } from './utils/proceduralTextures.js';
import { keplerPos } from './utils/kepler.js';
import { createCameraSystem, enterFly as enterFlyModule, exitFly as exitFlyModule, enterFollow as enterFollowModule } from './core/camera.js';
import { setupPostProcessing } from './core/postprocessing.js';
import { createStarfield, updateStarfieldParallax, setMilkyWayVisible } from './core/starfield.js';
import { setupControls } from './core/controls.js';
import { rebuildOrbits } from './core/orbits.js';
// (state.js - funzioni utilitarie non usate direttamente)

import { createUIRefs, showHint, setCamLabel, timeMultiplier, speedText } from './ui/manager.js';
import { setupInfoPanel, showInfo } from './ui/infoPanel.js';
import { buildInventory, updateInventoryDistances, filterInventory, highlightInventory } from './ui/inventory.js';
import { updateLabels } from './ui/labels.js';
import { buildStarList, setupMenuUI } from './ui/celestialMenu.js';
import { setupTabs } from './ui/tabs.js';
import { setupGlobalSearch } from './ui/search.js';
import { createNavGrid, setNavGridVisible } from './core/navGrid.js';

import { ORBITAL_ELEMENTS, PLANETS, MOONS, ASTEROIDS, COMETS, NEARBY_STARS, SPACE_PROBES, EXOPLANETS } from './data/celestialData.js';
import { createComets, updateComets } from './bodies/comets.js';
import { generateAsteroidBelt, buildAsteroidBody, createDustBelts, createOortCloud, updateDustBelts, updateAsteroidBelts } from './bodies/asteroidBelts.js';
import { createNearbyStars, createHyperlanes, createSpaceProbes, createExoplanets, createLocalBubbleConnections, createLocalBubbleAxes, createLocalBubbleDistanceLabels, cleanupLocalBubbleLabels } from './bodies/starsAndExoplanets.js';
import { customCursor } from './ui/customCursor.js';
import { particleEffects } from './ui/particleEffects.js';
import { ComparisonMode } from './ui/comparisonMode.js';
import { creditsPage } from './ui/credits.js';
import { toast } from './ui/toast.js';
import { themeManager } from './core/theme.js';
import { a11y } from './core/a11y.js';
import { HUD } from './ui/hud.js';
import { Screenshot } from './core/screenshot.js';
import { XRManager } from './core/xr.js';
import { SpaceNews } from './ui/spaceNews.js';
import { Quiz } from './ui/quiz.js';
import { TimeTravel } from './ui/timeTravel.js';
import { ViewPresets } from './ui/viewPresets.js';
import { GravitySandbox } from './ui/gravitySandbox.js';
import { commandPalette } from './ui/commandPalette.js';
import { urlState } from './core/urlState.js';
import { soundManager } from './core/soundManager.js';
import { shortcutsPanel } from './ui/shortcuts.js';
import { getLang, setLang, applyI18nToDOM } from './i18n/index.js';
import { settingsPanel } from './ui/settings.js';
import { CameraBookmarks } from './ui/bookmarks.js';
import { Observatory } from './core/observatory.js';
import { createAdvancedSun, createSunCorona, updateSunShader } from './core/sunShader.js';
import { showMissionsPanel } from './core/spaceMissions.js';
import { MissionsSystem } from './ui/missions.js';
import { addAtmosphereEffects, updateAtmosphereEffects, getAtmosphericPlanets } from './ui/atmosphereEffects.js';

let paused = false;
let timeOffsetMs = 0;
let lastPerf = performance.now();
let selectedBody = null;
let selectedStars = new Set(); // Multi-selection for star systems
let customDate = null;
let galaxyMapMode = false;
let localBubbleMode = false; // Local Bubble 3D graph visualization
const lastOrbitTRef = { current: null };
const hintTimerRef = { current: null };

// Global arrays (must be declared early, before functions use them)
const allBodies = [];
const meshList = [];
const hitboxList = [];
const lodList = [];
let mainBelt = null;
let kuiperBelt = null;
let cometObjects = null;
let invDistFrame = 0;
let hoveredBody = null;

function getTimeOffset() { return timeOffsetMs; }
function getSelectedBody() { return selectedBody; }

const loadingScreen = document.getElementById('loadingScreen');
const loadingBar = document.getElementById('loadingBar');
const loadingText = document.getElementById('loadingText');

const manager = new THREE.LoadingManager();
manager.onProgress = (_u, loaded, total) => {
  const p = Math.round((loaded / total) * 100);
  if (loadingBar) loadingBar.style.width = p + '%';
  if (loadingText) loadingText.textContent = 'Loading... ' + p + '%';
};
manager.onLoad = () => {
  if (loadingBar) loadingBar.style.width = '100%';
  if (loadingText) loadingText.textContent = 'Ready!';
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.8s ease';
      loadingScreen.style.opacity = '0';
      setTimeout(() => { loadingScreen.style.display = 'none'; }, 850);
    }
    startApp();
  }, 300);
};
manager.onError = url => console.warn('Texture not found:', url);
TL.setManager(manager);

const scene = new THREE.Scene();
// Fix: aumenta far plane per vedere stelle lontane (Kepler-452 è a ~88M unità)
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200000000);
const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
document.body.appendChild(renderer.domElement);

const mwTex = TL.load('./assets/textures/8k_stars_milky_way.jpg', generateProceduralMilkyWay);
mwTex.mapping = THREE.EquirectangularReflectionMapping;
mwTex.minFilter = THREE.LinearFilter;
mwTex.magFilter = THREE.LinearFilter;
mwTex.generateMipmaps = false;
scene.background = mwTex;

const { composer, bloomPass, outlinePass } = setupPostProcessing(renderer, scene, camera);

// Create dynamic starfield
const starfield = createStarfield(scene);

// ═══ Setup nuove features ═══
themeManager.apply();
a11y.apply();
const hud = new HUD();
const screenshot = new Screenshot(renderer, scene, camera);
new XRManager(renderer);
const spaceNews = new SpaceNews();
const quiz = new Quiz();
const timeTravel = new TimeTravel({ onDateChange: (d) => { customDate = d; timeOffsetMs = d.getTime() - Date.now(); } });
const viewPresets = new ViewPresets({ onSelect: (p) => { if (p.pos) { const target = new THREE.Vector3(...p.pos); if (p.target === 'earth') { const eb = allBodies.find(b => b.key === 'Earth'); if (eb) zoomToBody(eb); } else { zoomToPosition(target, Math.max(p.pos[1] * 0.6, 50)); } } } });
const gravitySandbox = new GravitySandbox(scene);
const observatory = new Observatory(scene, camera, renderer);

const missions = new MissionsSystem();

// Command palette actions
commandPalette.registerActions({
  pause: () => { if (ui.toggle) ui.toggle.click(); },
  resume: () => { if (ui.toggle) ui.toggle.click(); },
  reset_cam: () => { if (ui.resetCam) ui.resetCam.click(); },
  toggle_orbits: () => { if (ui.orbits) { ui.orbits.checked = !ui.orbits.checked; } },
  toggle_labels: () => { if (ui.labels) { ui.labels.checked = !ui.labels.checked; } },
  toggle_theme: () => { themeManager.toggle(); },
  help: () => shortcutsPanel.toggle(),
  timetravel: () => timeTravel.toggle(),
  screenshot: () => screenshot.capture(),
  share: () => { urlState.setMany({ body: selectedBody?.key, date: (customDate || new Date()).toISOString() }); urlState.copyShareURL(); },
  sound: () => soundManager.toggle(),
  quiz: () => quiz.toggle(),
  home: () => viewPresets._build && viewPresets.show(),
  system: () => { exitFly(); CAM.tRadius = 800; CAM.tPhi = 1.2; CAM.tPivot.set(0,0,0); setCamLabel(ui, 'orbit'); },
  goToBody: (b) => { const body = allBodies.find(x => x.key === b.key || x.label === b.name); if (body) selectBody(body); },
});

// Apply URL state on load
if (urlState.has('body')) {
  const b = allBodies.find(x => x.key === urlState.get('body'));
  if (b) setTimeout(() => selectBody(b), 1500);
}
if (urlState.has('date')) {
  const d = new Date(urlState.get('date'));
  if (!isNaN(d.getTime())) { customDate = d; timeOffsetMs = d.getTime() - Date.now(); }
}

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

const gui = new GUI({ title: 'Solar System Controls' });
const postFolder = gui.addFolder('Postprocessing');
postFolder.add(bloomPass, 'strength', 0, 3).name('Bloom Strength');
postFolder.add(bloomPass, 'radius', 0, 1).name('Bloom Radius');
postFolder.add(bloomPass, 'threshold', 0, 1).name('Bloom Threshold');
postFolder.add(outlinePass, 'edgeStrength', 0, 10).name('Outline Strength');
postFolder.add(outlinePass, 'edgeThickness', 0, 5).name('Outline Thickness');
postFolder.close();

const simFolder = gui.addFolder('Simulation');
simFolder.add({ speed: 1 }, 'speed', -2, 7).name('Time Speed').onChange(v => {
  const speedInput = document.getElementById('speed');
  if (speedInput) speedInput.value = v;
});
simFolder.add({ paused: false }, 'paused').name('Pause').onChange(v => {
  paused = v;
  const toggleBtn = document.getElementById('toggle');
  if (toggleBtn) toggleBtn.textContent = v ? 'Play' : 'Pause';
});
simFolder.open();

const viewFolder = gui.addFolder('Display');
viewFolder.add({ showOrbits: true }, 'showOrbits').name('Show Orbits').onChange(v => {
  const orbitsCheckbox = document.getElementById('orbits');
  if (orbitsCheckbox) orbitsCheckbox.checked = v;
});
viewFolder.add({ showLabels: true }, 'showLabels').name('Show Labels').onChange(v => {
  const labelsCheckbox = document.getElementById('labels');
  if (labelsCheckbox) labelsCheckbox.checked = v;
});
viewFolder.close();

const camFolder = gui.addFolder('Camera');
camFolder.add(camera, 'fov', 30, 120).name('FOV').onChange(() => camera.updateProjectionMatrix());
camFolder.add({ near: 0.1 }, 'near', 0.01, 10).name('Near Plane').onChange(v => { camera.near = v; camera.updateProjectionMatrix(); });
camFolder.add({ far: 200000000 }, 'far', 10000, 500000000).name('Far Plane').onChange(v => { camera.far = v; camera.updateProjectionMatrix(); });
camFolder.close();

const renderFolder = gui.addFolder('Rendering');
renderFolder.add(renderer, 'toneMappingExposure', 0.5, 3).name('Exposure');
renderFolder.add({ pixelRatio: Math.min(devicePixelRatio, 2) }, 'pixelRatio', 0.5, 3).name('Pixel Ratio').onChange(v => renderer.setPixelRatio(v));
renderFolder.close();

const navFolder = gui.addFolder('Navigation');
navFolder.add({ reset: () => { camera.position.set(0, 300, 500); camera.lookAt(0, 0, 0); selectedBody = null; } }, 'reset').name('Reset View');
navFolder.add({ top: () => { camera.position.set(0, 800, 0); camera.lookAt(0, 0, 0); } }, 'top').name('Top View');
navFolder.add({ side: () => { camera.position.set(800, 0, 0); camera.lookAt(0, 0, 0); } }, 'side').name('Side View');
navFolder.add({ inner: () => { camera.position.set(0, 50, 100); camera.lookAt(0, 0, 0); } }, 'inner').name('Inner System');
navFolder.add({ outer: () => { camera.position.set(0, 400, 600); camera.lookAt(0, 0, 0); } }, 'outer').name('Outer System');
navFolder.close();

function jumpToNow() {
  customDate = null;
  timeOffsetMs = 0;
  const nowBtn = document.getElementById('now');
  if (nowBtn) nowBtn.click();
  showHint(ui, 'Back to present', hintTimerRef);
}

function jumpYears(years) {
  const current = customDate || new Date(Date.now() + timeOffsetMs);
  const newDate = new Date(Date.UTC(current.getUTCFullYear() + years, current.getUTCMonth(), current.getUTCDate()));
  customDate = newDate;
  timeOffsetMs = newDate.getTime() - Date.now();
  showHint(ui, `${years > 0 ? '+' : ''}${years} years`, hintTimerRef);
}

const ui = createUIRefs();
setupInfoPanel(ui);

// Add sector and Local Bubble toggle to UI
ui.showSectors = document.getElementById('showSectors');
ui.localBubbleBtn = document.getElementById('localBubbleBtn');

if (ui.toggle) ui.toggle.onclick = () => { paused = !paused; ui.toggle.textContent = paused ? 'Play' : 'Pause'; lastPerf = performance.now(); };
if (ui.now) ui.now.onclick = () => { jumpToNow(); };
if (ui.resetCam) ui.resetCam.onclick = () => { exitFly(); CAM.zoomTarget = null; CAM.tRadius = 1400; CAM.tTheta = 0.9; CAM.tPhi = 1.05; CAM.tPivot.set(0, 0, 0); CAM.followBody = null; setCamLabel(ui, 'orbit'); };
if (ui.yearBack) ui.yearBack.onclick = () => { jumpYears(-1); };
if (ui.yearFwd) ui.yearFwd.onclick = () => { jumpYears(1); };
if (ui.decBack) ui.decBack.onclick = () => { jumpYears(-10); };
if (ui.decFwd) ui.decFwd.onclick = () => { jumpYears(10); };

const CAM = createCameraSystem();
CAM.DAMP_FAST = 0.15;

function enterFly() { enterFlyModule(CAM, camera, renderer, (m) => setCamLabel(ui, m), (msg) => showHint(ui, msg, hintTimerRef)); }
function exitFly() { exitFlyModule(CAM, (m) => setCamLabel(ui, m), (msg) => showHint(ui, msg, hintTimerRef)); }
function enterFollow(body) { enterFollowModule(CAM, body, (m) => setCamLabel(ui, m), (msg) => showHint(ui, msg, hintTimerRef)); CAM.followDist = Math.max(body.visualR * 10, 40); }

function zoomToBody(body, duration = 1000) {
  if (!body || !body.pivot) return;
  CAM.zoomTarget = {
    body,
    finalRadius: Math.max(body.visualR * 10, 30),
    startTime: performance.now(),
    duration,
    startRadius: CAM.radius,
    startPivot: CAM.pivot.clone(),
  };
  CAM.mode = 'orbit';
  CAM.followBody = null;
  setCamLabel(ui, 'orbit');
}

function zoomToPosition(position, radius = 200) {
  CAM.tRadius = radius;
  CAM.tPivot.copy(position);
  CAM.tPhi = Math.atan2(Math.sqrt(position.x * position.x + position.z * position.z), position.y);
  CAM.tTheta = Math.atan2(position.z, position.x);
  CAM.mode = 'orbit';
  CAM.followBody = null;
  setCamLabel(ui, 'orbit');
}

function zoomToStar(starKey) {
  const star = allBodies.find(b => b.key === starKey);
  if (!star) return;
  exitFly();
  CAM.zoomTarget = {
    body: star,
    finalRadius: 500,
    startTime: performance.now(),
    duration: 1500,
    startRadius: CAM.radius,
    startPivot: CAM.pivot.clone(),
  };
  CAM.mode = 'orbit';
  CAM.followBody = null;
  setCamLabel(ui, 'star');
  showHint(ui, `Star system: ${star.label}. WASD/Arrows to navigate.`, hintTimerRef);
  if (galaxyMapMode) {
    galaxyMapMode = false;
    if (ui.galaxyMapBtn) ui.galaxyMapBtn.textContent = 'Galactic Map';
    if (ui.minimapContainer) ui.minimapContainer.style.display = 'none';
  }
}

function toggleGalaxyMap() {
  galaxyMapMode = !galaxyMapMode;
  localBubbleMode = false; // Disable Local Bubble when switching to galaxy map
  if (galaxyMapMode) {
    setMilkyWayVisible(scene, true);
    exitFly();
    CAM.tRadius = 500000;
    CAM.tTheta = 0;
    CAM.tPhi = 1.57;
    CAM.tPivot.set(0, 0, 0);
    CAM.followBody = null;
    setCamLabel(ui, 'galaxy');
    showHint(ui, 'Galactic Map: Solar System centered. WASD/Arrows to navigate. Click star to zoom.', hintTimerRef);
    if (ui.galaxyMapBtn) ui.galaxyMapBtn.textContent = 'Back to Solar System';
    if (ui.galaxyGuide) ui.galaxyGuide.classList.add('open');
    buildStarList(ui.starList, allBodies, '', zoomToStar);
    if (ui.minimapContainer) ui.minimapContainer.style.display = 'block';
    allBodies.filter(b => b.type === 'star').forEach(star => {
      if (star.glow) { star.glow.scale.set(star.radius * 20, star.radius * 20, 1); star.glow.material.opacity = 0.9; }
    });
  } else {
    setMilkyWayVisible(scene, false, 'orbit');
    exitFly();
    CAM.tRadius = 1400; CAM.tTheta = 0.9; CAM.tPhi = 1.05; CAM.tPivot.set(0, 0, 0);
    CAM.followBody = null;
    setCamLabel(ui, 'orbit');
    if (ui.galaxyMapBtn) ui.galaxyMapBtn.textContent = 'Galactic Map';
    if (ui.galaxyGuide) ui.galaxyGuide.classList.remove('open');
    if (ui.minimapContainer) ui.minimapContainer.style.display = 'none';
    allBodies.filter(b => b.type === 'star').forEach(star => {
      if (star.glow) { star.glow.scale.set(star.radius * 7, star.radius * 7, 1); star.glow.material.opacity = 0.72; }
    });
  }
}

function toggleLocalBubble() {
  localBubbleMode = !localBubbleMode;
  if (localBubbleMode) {
    setMilkyWayVisible(scene, false, 'localbubble');
    // Disable galaxy map when switching to Local Bubble
    galaxyMapMode = false;

    exitFly();
    // Position camera for Local Bubble view (Sun at origin, looking at nearby stars)
    CAM.tRadius = 200000; // Closer view for Local Bubble
    CAM.tTheta = 0.5;
    CAM.tPhi = 1.2;
    CAM.tPivot.set(0, 0, 0);
    CAM.followBody = null;
    setCamLabel(ui, 'localbubble');
    showHint(ui, 'Local Bubble: 3D graph of nearby stars. WASD/Arrows to navigate. Click star to zoom.', hintTimerRef);
    if (ui.localBubbleBtn) ui.localBubbleBtn.textContent = 'Back to Solar System';
    if (ui.galaxyGuide) ui.galaxyGuide.classList.remove('open');
    if (ui.minimapContainer) ui.minimapContainer.style.display = 'none';
    // Show Local Bubble connections and hide hyperlanes
    if (localBubbleGroup) localBubbleGroup.visible = true;
    if (hyperlaneGroup) hyperlaneGroup.visible = false;
    if (sectorGroup) sectorGroup.visible = false;
    // Show stars with enhanced glow for graph visualization
    allBodies.filter(b => b.type === 'star').forEach(star => {
      if (star.glow) { star.glow.scale.set(star.radius * 15, star.radius * 15, 1); star.glow.material.opacity = 0.85; }
      // Show distance labels
      if (star.distanceLabel) star.distanceLabel.style.opacity = '1';
    });
  } else {
    setMilkyWayVisible(scene, false, 'orbit');
    exitFly();
    CAM.tRadius = 1400; CAM.tTheta = 0.9; CAM.tPhi = 1.05; CAM.tPivot.set(0, 0, 0);
    CAM.followBody = null;
    setCamLabel(ui, 'orbit');
    if (ui.localBubbleBtn) ui.localBubbleBtn.textContent = 'Local Bubble';
    // Hide Local Bubble connections
    if (localBubbleGroup) localBubbleGroup.visible = false;
    if (hyperlaneGroup) hyperlaneGroup.visible = true;
    if (sectorGroup) sectorGroup.visible = true;
    allBodies.filter(b => b.type === 'star').forEach(star => {
      if (star.glow) { star.glow.scale.set(star.radius * 7, star.radius * 7, 1); star.glow.material.opacity = 0.72; }
      // Hide distance labels
      if (star.distanceLabel) star.distanceLabel.style.opacity = '0';
    });
    // Cleanup distance labels to prevent memory leak
    cleanupLocalBubbleLabels(allBodies);
  }
}

if (ui.galaxyMapBtn) ui.galaxyMapBtn.onclick = () => toggleGalaxyMap();
if (ui.localBubbleBtn) ui.localBubbleBtn.onclick = () => toggleLocalBubble();

// Toggle sectors visibility
if (ui.showHyperlanes) {
  ui.showHyperlanes.addEventListener('change', (e) => {
    if (hyperlaneGroup) hyperlaneGroup.visible = e.target.checked;
  });
}

if (ui.showSectors) {
  ui.showSectors.addEventListener('change', (e) => {
    if (sectorGroup) sectorGroup.visible = e.target.checked;
  });
}

// Minimap click handler for navigation
if (ui.minimapCanvas) {
  ui.minimapCanvas.addEventListener('click', (e) => {
    if (!galaxyMapMode) return;
    
    const canvas = ui.minimapCanvas;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const stars = allBodies.filter(b => b.type === 'star');
    if (stars.length === 0) return;
    
    const positions = stars.map(s => s.pivot.position);
    const xs = positions.map(p => p.x), ys = positions.map(p => p.z);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const padding = 20;
    const width = canvas.width, height = canvas.height;
    
    const scale = (val, mn, mx, tMin, tMax) => tMin + ((val - mn) / (mx - mn)) * (tMax - tMin);
    
    // Find nearest star to click position
    let nearestStar = null;
    let minDistance = Infinity;
    
    stars.forEach(star => {
      const x = scale(star.pivot.position.x, minX, maxX, padding, width - padding);
      const y = scale(star.pivot.position.z, minY, maxY, padding, height - padding);
      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      
      if (distance < minDistance && distance < 20) { // 20px click radius
        minDistance = distance;
        nearestStar = star;
      }
    });
    
    if (nearestStar) {
      zoomToStar(nearestStar.key);
    }
  });
  
  // Add cursor pointer on hover
  ui.minimapCanvas.style.cursor = 'pointer';
}

function openInventory() {
  if (!ui.invPanel) return;
  const open = ui.invPanel.style.opacity === '1';
  if (open) {
    ui.invPanel.style.opacity = '0';
    ui.invPanel.style.pointerEvents = 'none';
    ui.invPanel.style.transform = 'translateY(-50%) translateX(100%)';
  } else {
    ui.invPanel.style.opacity = '1';
    ui.invPanel.style.pointerEvents = 'auto';
    ui.invPanel.style.transform = 'translateY(-50%) translateX(0)';
  }
}
if (ui.invToggle) ui.invToggle.onclick = () => openInventory();
const invCloseBtn = document.getElementById('inventoryClose');
if (invCloseBtn) invCloseBtn.onclick = () => openInventory();
if (ui.invSearch) ui.invSearch.addEventListener('input', () => filterInventory(ui.invList, ui.invSearch.value));

const tooltip = createTooltip();
const mouseMove = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const pGroup = new THREE.Group(); scene.add(pGroup);
const oGroup = new THREE.Group(); scene.add(oGroup);
const navGrid = createNavGrid(); scene.add(navGrid);
const cGroup = new THREE.Group(); scene.add(cGroup);
const aGroup = new THREE.Group(); scene.add(aGroup);
const hyperlaneGroup = new THREE.Group(); hyperlaneGroup.name = 'hyperlanes'; scene.add(hyperlaneGroup);
const sectorGroup = new THREE.Group(); sectorGroup.name = 'sectors'; scene.add(sectorGroup);
sectorGroup.visible = false; // Hidden by default, only visible in galactic map mode
const localBubbleGroup = new THREE.Group(); localBubbleGroup.name = 'localBubble'; scene.add(localBubbleGroup);

function selectBody(body) {
  selectedBody = body;
  if (!body) {
    if (ui.infoPanel) ui.infoPanel.classList.remove('visible');
    highlightInventory(ui.invList, null);
    return;
  }
  // ═══ Gamification: track body visited ═══
  if (missions) missions.onBodyVisited(body.key);
  showInfo(ui, body, zoomToBody, enterFollow);
  highlightInventory(ui.invList, body.key);
  if (CAM.mode === 'orbit') {
    zoomToBody(body, 1000);
  } else if (CAM.mode === 'follow') {
    enterFollow(body);
  }
}

function updateStarSelectionVisuals() {
  allBodies.forEach(body => {
    if (body.type === 'star' && body.glow) {
      if (selectedStars.has(body.key)) {
        // Highlight selected stars with brighter glow
        body.glow.material.opacity = 1.0;
        body.glow.scale.set(body.radius * 25, body.radius * 25, 1);
      } else {
        // Normal glow for unselected stars
        body.glow.material.opacity = galaxyMapMode ? 0.9 : 0.72;
        body.glow.scale.set(body.radius * (galaxyMapMode ? 20 : 7), body.radius * (galaxyMapMode ? 20 : 7), 1);
      }
    }
  });
}

setupControls(CAM, camera, renderer, ui, raycaster, mouse, mouseMove, meshList, hitboxList, allBodies, tooltip, (m) => setCamLabel(ui, m), (msg) => showHint(ui, msg, hintTimerRef), selectBody);

const keys = {};
window.addEventListener('keydown', e => {
  // Ignore keyboard shortcuts when typing in an input/textarea
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
    return;
  }
  keys[e.key] = true;
  if (e.key === 'Escape') {
    if (observatory.active) { observatory.exit(); }
    else if (CAM.mode !== 'orbit') exitFly();
    if (ui.infoPanel) ui.infoPanel.classList.remove('visible');
    // Clear multi-selection
    if (selectedStars.size > 0) {
      selectedStars.clear();
      updateStarSelectionVisuals();
      showHint(ui, 'Selezione cancellata', hintTimerRef);
    }
  }
  if (e.key === 'f' || e.key === 'F') { CAM.mode === 'fly' ? exitFly() : enterFly(); }
  if (e.key === '1') { exitFly(); }
  if (e.key === '2') { if (selectedBody) enterFollow(selectedBody); }
  if (e.key === '3') { enterFly(); }
  if (e.key === 'Tab') { e.preventDefault(); if (ui.invPanel) ui.invPanel.classList.toggle('open'); }
  if (e.key === 'Shift') CAM.flyBoost = true;
  if (e.key === 'r' || e.key === 'R') { jumpToNow(); }
  if (e.key === '[') { jumpYears(-1); }
  if (e.key === ']') { jumpYears(1); }
  if (e.key === '{') { jumpYears(-10); }
  if (e.key === '}') { jumpYears(10); }
  // ═══ Shortcuts nuove features ═══
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); commandPalette.toggle(); }
  if (e.key === 'h' || e.key === 'H') { e.preventDefault(); shortcutsPanel.toggle(); }
  if (e.key === 'v' || e.key === 'V') { e.preventDefault(); viewPresets.toggle(); }
  if (e.key === 't' || e.key === 'T') { themeManager.toggle(); }
  if (e.key === 'l' || e.key === 'L') { setLang(getLang() === 'it' ? 'en' : 'it'); applyI18nToDOM(); }
  if (e.key === 'n' || e.key === 'N') { spaceNews.toggle(); }
  if (e.key === 'q' || e.key === 'Q') { quiz.toggle(); }
  if (e.key === 'g' || e.key === 'G') { gravitySandbox.toggle(); }
  if (e.key === 'c' || e.key === 'C') { comparisonMode.toggle(); }
  if (e.key === 'i' || e.key === 'I') { creditsPage.toggle(); }
  if (e.key === 'p' || e.key === 'P') { e.preventDefault(); settingsPanel.toggle(); }
  if (e.key === 'm' || e.key === 'M') { showMissionsPanel(); }
  if (e.key === 'x' || e.key === 'X') { missions.toggle(); }
  // ═══ Observatory: shortcut O ═══
  if (e.key === 'o' || e.key === 'O') {
    if (selectedBody && (selectedBody.type === 'planet' || selectedBody.type === 'dwarf')) {
      const sunBody = allBodies.find(b => b.key === 'Sun');
      const sunPos = sunBody ? sunBody.pivot.position : new THREE.Vector3(0, 0, 0);
      observatory.toggle(selectedBody, sunPos);
    } else if (!observatory.active) {
      toast.warning('Seleziona prima un pianeta per atterrare!');
    } else {
      observatory.exit();
    }
  }
  // ═══ Bookmarks ═══
  if (e.key === 'b' || e.key === 'B') { bookmarks.toggle(CAM); }
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    const entry = bookmarks.save(CAM);
    toast.success(`Bookmark salvato: ${entry.name}`, 2000);
  }
});
window.addEventListener('keyup', e => { keys[e.key] = false; if (e.key === 'Shift') CAM.flyBoost = false; });

window.addEventListener('mousedown', e => {
  if (CAM.pointerLocked) return;
  // Star zoom raycast (orbit mode only — controls.js handles drag & body clicks)
  mouseMove.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouseMove, camera);
  const hits = raycaster.intersectObjects([...meshList, ...hitboxList]).filter(h => h.object.userData.isStar);
  if (hits.length > 0 && hits[0].object.userData.starKey) {
    const starKey = hits[0].object.userData.starKey;
    
    // Multi-selection with Ctrl+Click
    if (e.ctrlKey || e.metaKey) {
      if (selectedStars.has(starKey)) {
        selectedStars.delete(starKey);
      } else {
        selectedStars.add(starKey);
      }
      updateStarSelectionVisuals();
      showHint(ui, `${selectedStars.size} sistemi selezionati`, hintTimerRef);
    } else {
      // Single selection - clear multi-selection and zoom
      selectedStars.clear();
      zoomToStar(starKey);
    }
  }
});

// ═══ Observatory mousemove handler ═══
window.addEventListener('mousemove', e => {
  if (!observatory.active) return;
  const dx = e.movementX || 0;
  const dy = e.movementY || 0;
  observatory.onMouseMove(dx, dy);
});

scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const sunLight = new THREE.PointLight(0xfff4e0, 8.0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 8000;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

const sun = createAdvancedSun(SUN_R, './assets/textures/2k_sun.jpg', manager);
scene.add(sun);

// Corona solare
const sunCorona = createSunCorona(SUN_R * 1.5, SUN_R * 4);
scene.add(sunCorona);

[[8, 128, 'rgba(255,200,50,0.9)', 'rgba(255,120,0,0.4)', SUN_R * 6],
 [2, 128, 'rgba(255,240,100,0.5)', 'rgba(255,160,0,0.1)', SUN_R * 14],
 [0, 128, 'rgba(255,180,30,0.18)', 'rgba(255,80,0,0)', SUN_R * 30]].forEach(([iR, , cIn, cOut, sc]) => {
  const sp = makeCanvasSprite((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, iR, s / 2, s / 2, 128);
    g.addColorStop(0, cIn); g.addColorStop(0.45, cOut); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  }, 256, sc);
  scene.add(sp);
  sp._isSunGlow = true;
});

function makePlanetMesh(radius, texPath, color, key, bodyType) {
  const procFallback = () => getProceduralPlanetTexture({ key, type: bodyType || 'planet', color });
  const segs = texPath ? 48 : 24;

  if (key === 'Earth') {
    const vertShader = `
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPosition; varying vec3 vWorldNormal;
      void main() {
        vUv = uv; vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragShader = `
      uniform sampler2D dayTexture; uniform vec3 sunDirection; uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldNormal;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        float a = hash(i); float b = hash(i + vec2(1.0,0.0));
        float c = hash(i + vec2(0.0,1.0)); float d = hash(i + vec2(1.0,1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      vec3 proceduralNight(vec2 uv) {
        float cityLights = 0.0;
        for (int i = 0; i < 5; i++) {
          float scale = float(i + 1) * 8.0;
          vec2 offset = vec2(float(i) * 0.17, float(i) * 0.13);
          cityLights += noise(uv * scale + offset) * 0.2;
        }
        float coast = noise(uv * 3.0 + 1.5);
        cityLights *= smoothstep(0.3, 0.7, coast);
        cityLights = clamp(cityLights, 0.0, 1.0);
        vec3 warm = vec3(1.0, 0.75, 0.35);
        vec3 cool = vec3(0.6, 0.8, 1.0);
        vec3 nightColor = mix(cool, warm, cityLights * 0.7 + 0.3);
        nightColor *= cityLights * 0.5 + 0.05;
        return nightColor;
      }
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 worldNormal = normalize(vWorldNormal);
        float ndotl = dot(worldNormal, normalize(sunDirection));
        float dayFactor = smoothstep(-0.15, 0.25, ndotl);
        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = proceduralNight(vUv);
        float specular = pow(max(0.0, ndotl), 32.0) * 0.3;
        vec3 specColor = vec3(1.0) * specular;
        vec3 finalColor = mix(nightColor, dayColor + specColor, dayFactor);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: TL.load(texPath, procFallback) },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
        time: { value: 0 },
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
    });
    const highMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segs, segs), mat);
    highMesh.castShadow = true;
    const lowMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, Math.max(8, Math.floor(segs / 3)), Math.max(6, Math.floor(segs / 3))), mat.clone());
    const lod = new THREE.LOD();
    lod.addLevel(highMesh, 0);
    lod.addLevel(lowMesh, radius * 30);
    return { mesh: highMesh, lod, lodMeshes: [highMesh, lowMesh] };
  }

  const mat = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.05 });
  if (texPath) {
    mat.map = TL.load(texPath, procFallback);
  } else {
    const procTex = procFallback();
    if (procTex) {
      mat.map = procTex;
      mat.needsUpdate = true;
    } else {
      mat.color = new THREE.Color(color);
      mat.emissive = new THREE.Color(color);
      mat.emissiveIntensity = 0.15;
    }
  }

  const highMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segs, segs), mat);
  highMesh.castShadow = true;
  const lowMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, Math.max(8, Math.floor(segs / 3)), Math.max(6, Math.floor(segs / 3))), mat.clone());
  const lod = new THREE.LOD();
  lod.addLevel(highMesh, 0);
  lod.addLevel(lowMesh, radius * 20);
  return { mesh: highMesh, lod, lodMeshes: [highMesh, lowMesh] };
}

function buildPlanet(def) {
  const pivot = new THREE.Group();
  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.z = (def.tilt || 0) * DEG;
  const pm = makePlanetMesh(def.radius, def.tex || null, def.color, def.key, def.type);
  const mesh = pm.mesh || pm;
  const lod = pm.lod || null;
  const lodMeshes = pm.lodMeshes || [mesh];
  lodMeshes.forEach(m => { if (m) m.userData.bodyKey = def.key; });
  if (lod) { tiltGroup.add(lod); lodList.push(lod); }
  else tiltGroup.add(mesh);
  pivot.add(tiltGroup);
  pGroup.add(pivot);
  lodMeshes.forEach(m => { if (m) meshList.push(m); });

  const glow = makeGlow(def.radius, def.color);
  pivot.add(glow);

  let atmosphere = null;
  if (def.hasAtmosphere) {
    atmosphere = makeCanvasSprite((ctx, s) => {
      const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.28, s / 2, s / 2, s / 2);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.65, 'rgba(50,120,255,0)');
      g.addColorStop(0.80, 'rgba(60,140,255,0.28)'); g.addColorStop(0.90, 'rgba(80,160,255,0.18)'); g.addColorStop(1, 'rgba(0,60,200,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    }, 256, def.radius * 2.85);
    pivot.add(atmosphere);
  }

  if (def.key === 'Saturn') {
    const ri = def.radius * 1.4, ro = def.radius * 2.7;
    const rGeo = new THREE.RingGeometry(ri, ro, 256);
    const pos = rGeo.attributes.position, uv = rGeo.attributes.uv, v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v3.fromBufferAttribute(pos, i); uv.setXY(i, (v3.length() - ri) / (ro - ri), 0); }
    const rt = TL.load('./assets/textures/2k_saturn_ring_alpha.png', generateSaturnRingTexture);
    const ring = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({ map: rt, alphaMap: rt, color: 0xd4c070, side: THREE.DoubleSide, transparent: true, opacity: 0.88, depthWrite: false }));
    ring.castShadow = true;
    ring.receiveShadow = true;
    ring.rotation.x = Math.PI / 2; pivot.add(ring);
  }
  if (def.key === 'Uranus') {
    const ur = new THREE.Mesh(new THREE.RingGeometry(def.radius * 1.5, def.radius * 1.9, 64),
      new THREE.MeshBasicMaterial({ color: 0x88eedd, side: THREE.DoubleSide, transparent: true, opacity: 0.25 }));
    ur.rotation.x = Math.PI / 2; pivot.add(ur);
  }

  let labelEl = null;
  if (ui.labelsLayer) {
    labelEl = document.createElement('div');
    labelEl.className = 'label';
    labelEl.textContent = def.label;
    if (def.type === 'dwarf') labelEl.style.opacity = '0.7';
    labelEl.style.pointerEvents = 'auto';
    labelEl.style.cursor = 'pointer';
    labelEl.addEventListener('click', () => selectBody(body));
    ui.labelsLayer.appendChild(labelEl);
  }

  const body = {
    ...def, pivot, mesh, glow, atmosphere, labelEl, visualR: def.radius,
    getPos: def.type === 'moon' ? null : T => keplerPos(def.key, T, ORBITAL_ELEMENTS),
  };
  allBodies.push(body);
  return body;
}

PLANETS.forEach(buildPlanet);

MOONS.forEach(def => {
  const parentFn = () => allBodies.find(b => b.key === def.parent);
  const pivot = new THREE.Group();

  let mesh;
  if (def.key === 'Phobos' || def.key === 'Deimos') {
    const irregularGeometry = new THREE.DodecahedronGeometry(def.radius, 0);
    const positions = irregularGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const noise = 0.8 + Math.random() * 0.4;
      positions.setXYZ(i, x * noise, y * noise, z * noise);
    }
    irregularGeometry.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0.1 });
    const procTex = getProceduralPlanetTexture({ key: def.key, type: 'moon', color: def.color });
    if (procTex) { mat.map = procTex; mat.needsUpdate = true; }
    else mat.color = new THREE.Color(def.color);
    mesh = new THREE.Mesh(irregularGeometry, mat);
    mesh.castShadow = true;
  } else {
  const pm = makePlanetMesh(def.radius, def.tex || null, def.color, def.key, def.type);
    mesh = pm.mesh || pm;
    const lodMeshes = pm.lodMeshes || [mesh];
    lodMeshes.forEach(m => { if (m) m.userData.bodyKey = def.key; });
    if (pm.lod) { pivot.add(pm.lod); lodList.push(pm.lod); }
    else pivot.add(mesh);
    lodMeshes.forEach(m => { if (m) meshList.push(m); });
  }

  const glow = makeGlow(def.radius, def.color);
  pivot.add(glow);

  let labelEl = null;
  if (ui.labelsLayer) {
    labelEl = document.createElement('div');
    labelEl.className = 'label';
    labelEl.textContent = def.label;
    labelEl.style.opacity = '0.65';
    labelEl.style.pointerEvents = 'auto';
    labelEl.style.cursor = 'pointer';
    const capturedDef = def;
    labelEl.addEventListener('click', () => { const b = allBodies.find(x => x.key === capturedDef.key); if (b) selectBody(b); });
    ui.labelsLayer.appendChild(labelEl);
  }

  const body = {
    ...def, pivot, mesh, glow, labelEl, visualR: def.radius,
    getPos: () => {
      const pb = parentFn(); if (!pb) return new THREE.Vector3();
      const ms = Date.now() + timeOffsetMs;
      const angle = ((ms / (def.period * 1000)) * Math.PI * 2) % (Math.PI * 2);
      const incl = (def.inclination || 5) * DEG;
      return pb.pivot.position.clone().add(new THREE.Vector3(
        Math.cos(angle) * def.dist,
        Math.sin(angle) * def.dist * Math.sin(incl),
        Math.sin(angle) * def.dist * Math.cos(incl * 0.3),
      ));
    },
  };
  allBodies.push(body);
});

ASTEROIDS.forEach(def => buildAsteroidBody(def, aGroup, meshList, hitboxList, ui, allBodies, selectBody, getTimeOffset));

mainBelt = generateAsteroidBelt(180, 280, 1000, 0x887766);
mainBelt.userData.name = 'mainBelt';
scene.add(mainBelt);
kuiperBelt = generateAsteroidBelt(350, 450, 3000, 0x776655);
kuiperBelt.userData.name = 'kuiperBelt';
scene.add(kuiperBelt);

cometObjects = createComets(COMETS, cGroup, hitboxList, ui, allBodies, meshList, selectBody);
createNearbyStars(NEARBY_STARS, pGroup, ui, allBodies, meshList, selectBody);
createHyperlanes(allBodies, hyperlaneGroup);
createSpaceProbes(SPACE_PROBES, pGroup, ui, allBodies, selectBody);
createExoplanets(EXOPLANETS, pGroup, ui, allBodies, selectBody, getTimeOffset);
createDustBelts(scene);
createOortCloud(scene);

// Create Local Bubble graph connections and axes
createLocalBubbleConnections(allBodies, localBubbleGroup);
createLocalBubbleAxes(localBubbleGroup);
createLocalBubbleDistanceLabels(allBodies, ui);
localBubbleGroup.visible = false; // Hidden by default

// Create territorial sectors after stars are positioned
createSectors();

// ═══ Aggiungi effetti atmosferici ai pianeti ═══
getAtmosphericPlanets().forEach(planetKey => {
  const planetBody = allBodies.find(b => b.key === planetKey);
  if (planetBody) addAtmosphereEffects(planetBody, planetKey);
});

setupMenuUI(ui, allBodies, getSelectedBody, selectBody, zoomToStar, hyperlaneGroup);

const comparisonMode = new ComparisonMode(allBodies);
const bookmarks = new CameraBookmarks();

function updateCamera(dt) {
  const distToTarget = CAM.zoomTarget ? Math.abs(CAM.radius - CAM.zoomTarget.finalRadius) : 0;
  const useFastDamp = distToTarget > 500 || CAM.isTransitioning;
  const damp = useFastDamp ? CAM.DAMP_FAST : CAM.DAMP;
  const sp = 1 - Math.pow(1 - damp, dt * 60);

  if (CAM.mode === 'orbit') {
    const moveSpeed = CAM.radius * 0.005 * dt * 60;
    if (keys['w'] || keys['W'] || keys['ArrowUp']) { const fwd = new THREE.Vector3(-Math.sin(CAM.theta), 0, -Math.cos(CAM.theta)); CAM.tPivot.addScaledVector(fwd, moveSpeed); }
    if (keys['s'] || keys['S'] || keys['ArrowDown']) { const fwd = new THREE.Vector3(-Math.sin(CAM.theta), 0, -Math.cos(CAM.theta)); CAM.tPivot.addScaledVector(fwd, -moveSpeed); }
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) { const right = new THREE.Vector3(-Math.cos(CAM.theta), 0, Math.sin(CAM.theta)); CAM.tPivot.addScaledVector(right, -moveSpeed); }
    if (keys['d'] || keys['D'] || keys['ArrowRight']) { const right = new THREE.Vector3(-Math.cos(CAM.theta), 0, Math.sin(CAM.theta)); CAM.tPivot.addScaledVector(right, moveSpeed); }
    if (keys['q'] || keys['Q']) CAM.tPivot.y += moveSpeed;
    if (keys['e'] || keys['E']) CAM.tPivot.y -= moveSpeed;

    if (CAM.zoomTarget) {
      const pos = CAM.zoomTarget.body.pivot?.position;
      if (pos) {
        CAM.tRadius = CAM.zoomTarget.finalRadius;
        CAM.tPhi = Math.atan2(Math.sqrt(pos.x * pos.x + pos.z * pos.z), pos.y);
        CAM.tTheta = Math.atan2(pos.z, pos.x);
        CAM.tPivot.copy(pos);
        if (Math.abs(CAM.radius - CAM.tRadius) < 0.5) { CAM.zoomTarget = null; CAM.isTransitioning = false; }
      }
    }
    CAM.radius += (CAM.tRadius - CAM.radius) * sp;
    CAM.phi += (CAM.tPhi - CAM.phi) * sp;
    CAM.theta += (CAM.tTheta - CAM.theta) * sp;
    CAM.pivot.lerp(CAM.tPivot, sp);
    camera.position.set(
      CAM.pivot.x + CAM.radius * Math.sin(CAM.phi) * Math.cos(CAM.theta),
      CAM.pivot.y + CAM.radius * Math.cos(CAM.phi),
      CAM.pivot.z + CAM.radius * Math.sin(CAM.phi) * Math.sin(CAM.theta),
    );
    camera.lookAt(CAM.pivot);
  } else if (CAM.mode === 'fly') {
    const speed = CAM.flySpeed * (CAM.flyBoost ? 5 : 1) * dt;
    const fwd = new THREE.Vector3(-Math.sin(CAM.flyYaw) * Math.cos(CAM.flyPitch), Math.sin(CAM.flyPitch), -Math.cos(CAM.flyYaw) * Math.cos(CAM.flyPitch));
    const right = new THREE.Vector3(Math.cos(CAM.flyYaw), 0, -Math.sin(CAM.flyYaw));
    const up = new THREE.Vector3(0, 1, 0);
    if (keys['w'] || keys['W'] || keys['ArrowUp']) CAM.flyPos.addScaledVector(fwd, speed);
    if (keys['s'] || keys['S'] || keys['ArrowDown']) CAM.flyPos.addScaledVector(fwd, -speed);
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) CAM.flyPos.addScaledVector(right, -speed);
    if (keys['d'] || keys['D'] || keys['ArrowRight']) CAM.flyPos.addScaledVector(right, speed);
    if (keys['q'] || keys['Q']) CAM.flyPos.addScaledVector(up, speed);
    if (keys['e'] || keys['E']) CAM.flyPos.addScaledVector(up, -speed);
    camera.position.copy(CAM.flyPos);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = CAM.flyYaw;
    camera.rotation.x = CAM.flyPitch;
    CAM.isTransitioning = false;
  } else if (CAM.mode === 'follow' && CAM.followBody) {
    const target = CAM.followBody.pivot?.position || new THREE.Vector3();
    const targetDist = Math.max(CAM.followBody.visualR * 10, 40);
    CAM.followDist += (targetDist - CAM.followDist) * sp * 2;
    const offset = new THREE.Vector3(
      CAM.followDist * Math.sin(CAM.followPhi) * Math.cos(CAM.followTheta),
      CAM.followDist * Math.cos(CAM.followPhi),
      CAM.followDist * Math.sin(CAM.followPhi) * Math.sin(CAM.followTheta),
    );
    camera.position.lerp(target.clone().add(offset), sp * 2);
    camera.lookAt(target);
    if (Math.abs(CAM.followDist - targetDist) < 1) CAM.isTransitioning = false;
  }
}

function createSectors() {
  const stars = allBodies.filter(b => b.type === 'star');
  if (stars.length === 0) return;
  
  const positions = stars.map(s => s.pivot.position);
  const xs = positions.map(p => p.x), ys = positions.map(p => p.z);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  
  // Divide galaxy into 4x4 grid sectors
  const gridSize = 4;
  const sectorWidth = (maxX - minX) / gridSize;
  const sectorHeight = (maxY - minY) / gridSize;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = minX + i * sectorWidth;
      const z = minY + j * sectorHeight;
      
      // Create sector boundary
      const geometry = new THREE.PlaneGeometry(sectorWidth, sectorHeight);
      const material = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide
      });
      const sector = new THREE.Mesh(geometry, material);
      sector.rotation.x = -Math.PI / 2;
      sector.position.set(x + sectorWidth / 2, 0, z + sectorHeight / 2);
      sector.userData = { sectorX: i, sectorY: j };
      sectorGroup.add(sector);
      
      // Add sector border
      const borderGeometry = new THREE.EdgesGeometry(geometry);
      const borderMaterial = new THREE.LineBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.15
      });
      const border = new THREE.LineSegments(borderGeometry, borderMaterial);
      border.rotation.x = -Math.PI / 2;
      border.position.copy(sector.position);
      sectorGroup.add(border);
    }
  }
}

function updateMinimap() {
  if (!ui.minimapCanvas || !galaxyMapMode) return;
  const canvas = ui.minimapCanvas;
  const ctx = canvas.getContext('2d');
  const width = canvas.width, height = canvas.height;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, width, height);
  const stars = allBodies.filter(b => b.type === 'star');
  if (stars.length === 0) return;
  const positions = stars.map(s => s.pivot.position);
  const xs = positions.map(p => p.x), ys = positions.map(p => p.z);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const padding = 20;
  const scale = (val, mn, mx, tMin, tMax) => tMin + ((val - mn) / (mx - mn)) * (tMax - tMin);
  stars.forEach(star => {
    const x = scale(star.pivot.position.x, minX, maxX, padding, width - padding);
    const y = scale(star.pivot.position.z, minY, maxY, padding, height - padding);
    const color = '#' + star.color.toString(16).padStart(6, '0');
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    if (star.key === 'Sun' || star.key.includes('Alpha') || star.key.includes('Sirius')) {
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 255, 100, 0.3)'; ctx.fill();
    }
  });
  const camX = scale(CAM.pivot.x, minX, maxX, padding, width - padding);
  const camY = scale(CAM.pivot.z, minY, maxY, padding, height - padding);
  ctx.beginPath(); ctx.arc(camX, camY, 5, 0, Math.PI * 2); ctx.strokeStyle = '#00ff00'; ctx.lineWidth = 2; ctx.stroke();
}

function animate() {
  requestAnimationFrame(animate);
  try {
  const now = performance.now(), dt = Math.min((now - lastPerf) / 1000, 0.1);
  lastPerf = now;

  updateCamera(dt);

  const mult = timeMultiplier(ui);
  if (ui.speedLabel) ui.speedLabel.textContent = speedText(mult);
  if (!paused) timeOffsetMs += dt * 1000 * (mult - 1);

  const d = customDate || new Date(Date.now() + timeOffsetMs);
  const locale = getLang() === 'it' ? 'it-IT' : 'en-US';
  if (ui.clock) ui.clock.textContent = d.toLocaleString(locale, { hour12: false });
  const T = (julianDate(d) - 2451545.0) / 36525.0;

  allBodies.forEach(b => {
    if (b.type === 'comet' || !b.pivot) return;
    const pos = b.getPos ? b.getPos(T) : null;
    if (pos) {
      if (b.type === 'exoplanet') {
        b.mesh.position.copy(pos.sub(b.pivot.position));
      } else {
        b.pivot.position.copy(pos);
      }
    }
    if (b.mesh) b.mesh.rotation.y += 0.002 * dt * 60;
    if (b.glow?.quaternion) b.glow.quaternion.copy(camera.quaternion);
    if (b.atmosphere?.quaternion) b.atmosphere.quaternion.copy(camera.quaternion);
    const isH = hoveredBody?.key === b.key || selectedBody?.key === b.key;
    if (b.glow?.material) { b.glow.material.opacity = isH ? 0.95 : 0.72; const sc = b.radius * (isH ? 9 : 7); b.glow.scale.set(sc, sc, 1); }
    if (b.key === 'Earth' && b.mesh?.material?.uniforms) {
      b.mesh.material.uniforms.time.value = performance.now();
      const sunBody = allBodies.find(s => s.key === 'Sun');
      if (sunBody) {
        const dir = new THREE.Vector3().copy(sunBody.pivot.position).sub(b.pivot.position).normalize();
        b.mesh.material.uniforms.sunDirection.value.copy(dir);
      }
    }
    if (b.type === 'star' && b.mesh?.material?.uniforms) b.mesh.material.uniforms.time.value = performance.now();
    if (b.type === 'exoplanet' && b.mesh?.material?.uniforms) b.mesh.material.uniforms.time.value = performance.now();
  });

  updateAsteroidBelts(mainBelt, kuiperBelt, mult, paused);
  updateComets(cometObjects, dt, mult, paused, ui, camera);
  updateDustBelts(scene, dt, mult);
  // ═══ Atmosphere effects update ═══
  allBodies.forEach(b => { if (b.clouds || b.upperClouds || b.aurora || b.atmosphereGlow) updateAtmosphereEffects(b, camera); });
  
  // ═══ Update Local Bubble distance labels position ═══
  if (localBubbleMode) {
    allBodies.filter(b => b.type === 'star' && b.distanceLabel).forEach(star => {
      const label = star.distanceLabel;
      const pos = star.pivot.position.clone();
      pos.project(camera);
      
      const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (pos.y * -0.5 + 0.5) * window.innerHeight;
      
      // Hide if behind camera
      if (pos.z > 1) {
        label.style.display = 'none';
      } else {
        label.style.display = 'block';
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
      }
    });
  }

  if (ui.orbits) oGroup.visible = ui.orbits.checked;
  rebuildOrbits(T, oGroup, lastOrbitTRef);

  sun.rotation.y += 0.0006;
  scene.children.forEach(c => { if (c._isSunGlow) c.quaternion.copy(camera.quaternion); });
  // ═══ Advanced sun shader update ═══
  updateSunShader(sun, sunCorona);
  if (sunCorona) sunCorona.quaternion.copy(camera.quaternion);

  invDistFrame++;
  if (invDistFrame % 60 === 0) updateInventoryDistances(allBodies, AU);

  updateLabels(allBodies, camera, ui, selectedBody);
  updateMinimap();

  // ═══ Observatory update ═══
  if (observatory.active) {
    const sunBody = allBodies.find(b => b.key === 'Sun');
    const sunPos = sunBody ? sunBody.pivot.position : new THREE.Vector3();
    observatory.update(dt, sunPos);
  }

  for (let i = 0; i < lodList.length; i++) lodList[i].update(camera);

  hud.updateFPS(1 / Math.max(dt, 0.001));
  if (selectedBody) hud.setBody(selectedBody.label); else hud.setBody('Libero');
  if (d) hud.setDate(d);

  // Update starfield parallax
  updateStarfieldParallax(starfield, camera);

  composer.render();
  } catch (err) {
    // Log SOLO il primo errore identico (non cascata) e continua il rendering
    if (!animate._lastErr || animate._lastErr !== err.message) {
      animate._lastErr = err.message;
      console.error('[ASTRALIS animate]', err);
    }
  }
}

function startApp() {
  if (window.__solarStarted) return;
  window.__solarStarted = true;

  // Ensure we start in orbit mode (not galaxy/local bubble)
  galaxyMapMode = false;
  localBubbleMode = false;
  CAM.tRadius = 1400;
  CAM.tTheta = 0.9;
  CAM.tPhi = 1.05;
  CAM.tPivot.set(0, 0, 0);
  if (ui.galaxyMapBtn) ui.galaxyMapBtn.textContent = 'Galactic Map';
  if (ui.localBubbleBtn) ui.localBubbleBtn.textContent = 'Local Bubble';
  if (ui.galaxyGuide) ui.galaxyGuide.classList.remove('open');
  if (ui.celestialMenu) ui.celestialMenu.classList.remove('open');
  if (ui.minimapContainer) ui.minimapContainer.style.display = 'none';

  rebuildOrbits((julianDate(new Date()) - 2451545.0) / 36525.0, oGroup, lastOrbitTRef);
  buildInventory(ui.invList, allBodies, selectBody);
  // Build star list AFTER allBodies is populated
  if (ui.starList) buildStarList(ui.starList, allBodies, '', zoomToStar);
  setCamLabel(ui, 'orbit');
  
  // Init nuovi moduli
  setupTabs();
  setupGlobalSearch(allBodies, selectBody, zoomToBody);
  hud.init();
  customCursor.init();
  particleEffects.init();
  toast.init();
  settingsPanel.init();
  
  // Bind bottoni UI con feedback toast
  if (ui.compareBtn) ui.compareBtn.onclick = () => {
    comparisonMode.toggle();
    toast.info('Modalità confronto attivata');
  };
  if (ui.creditsBtn) ui.creditsBtn.onclick = () => {
    creditsPage.toggle();
    toast.info('Credits & About');
  };
  if (ui.settingsBtn) ui.settingsBtn.onclick = () => {
    settingsPanel.toggle();
  };
  const missionsBtn = document.getElementById('missionsBtn');
  if (missionsBtn) missionsBtn.onclick = () => {
    missions.toggle();
    toast.info('Missioni astronautiche');
  };
  const spaceMissionsBtn = document.getElementById('spaceMissionsBtn');
  if (spaceMissionsBtn) spaceMissionsBtn.onclick = () => {
    showMissionsPanel();
    toast.info('Missioni spaziali reali');
  };
  const observatoryBtn = document.getElementById('observatoryBtn');
  if (observatoryBtn) observatoryBtn.onclick = () => {
    if (selectedBody && (selectedBody.type === 'planet' || selectedBody.type === 'dwarf')) {
      const sunBody = allBodies.find(b => b.key === 'Sun');
      const sunPos = sunBody ? sunBody.pivot.position : new THREE.Vector3(0, 0, 0);
      observatory.toggle(selectedBody, sunPos);
    } else if (!observatory.active) {
      toast.warning('Seleziona prima un pianeta per atterrare!');
    } else {
      observatory.exit();
    }
  };
  
  // Settings panel onChange callback
  settingsPanel.onChange((key, value) => {
    if (key === 'theme') {
      toast.info(value === 'light' ? 'Tema chiaro attivato' : 'Tema scuro attivato');
    } else if (key === 'language') {
      toast.info(value === 'it' ? 'Lingua: Italiano' : 'Language: English');
    } else if (key === 'quality') {
      const labels = { low: 'Bassa', medium: 'Media', high: 'Alta' };
      toast.info(`Qualità grafica: ${labels[value] || value}`);
    } else if (key === 'hud') {
      setNavGridVisible(navGrid, value === 'nav');
      toast.info(value === 'nav' ? 'HUD: Navigation Computer' : 'HUD: Standard');
    }
  });

  // Applica lo stato iniziale della griglia in base alla preferenza salvata
  setNavGridVisible(navGrid, document.documentElement.getAttribute('data-hud') === 'nav');
  
  showHint(ui, 'WASD muovi · Scroll zoom · H comandi · P impostazioni', hintTimerRef);
  toast.success('ASTRALIS pronto! Esplora il cosmo.', 3000);
  animate();
}

setTimeout(() => { if (!window.__solarStarted) { if (loadingScreen) loadingScreen.style.display = 'none'; startApp(); } }, 8000);


