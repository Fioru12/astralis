import * as THREE from 'three';
import GUI from 'lil-gui';
import './dev-heartbeat.js'; // Keep dev server alive

import { AU, SUN_R } from './utils/constants.js';
import { julianDate, makeCanvasSprite, createTooltip } from './utils/helpers.js';
import { textureLoader as TL } from './utils/textureLoader.js';
import { generateProceduralMilkyWay } from './utils/proceduralTextures.js';
import { createCameraSystem } from './core/camera.js';
import { setupPostProcessing } from './core/postprocessing.js';
import { createStarfield, updateStarfieldParallax, setMilkyWayVisible } from './core/starfield.js';
import { create3DSpiralGalaxy } from './core/spiralGalaxy.js';
import { setupControls } from './core/controls.js';
import { rebuildOrbits } from './core/orbits.js';
// (state.js - funzioni utilitarie non usate direttamente)

import { createUIRefs, showHint, setCamLabel, timeMultiplier, speedText } from './ui/manager.js';
import { setupInfoPanel, showInfo } from './ui/infoPanel.js';
import {
  buildInventory,
  updateInventoryDistances,
  filterInventory,
  highlightInventory,
} from './ui/inventory.js';
import { updateLabels, refreshLabelLanguage } from './ui/labels.js';
import { buildStarList, setupMenuUI } from './ui/celestialMenu.js';
import { setupTabs } from './ui/tabs.js';
import { setupGlobalSearch } from './ui/search.js';
import { createNavGrid, setNavGridVisible } from './core/navGrid.js';
import { createGalaxySectors } from './core/galaxyGrid.js';
import { GalaxyModal } from './ui/galaxyModal.js';

import {
  COMETS,
  NEARBY_STARS,
  SPACE_PROBES,
  EXOPLANETS,
  getBodyLabel,
} from './data/celestialData.js';
import { createComets, updateComets } from './bodies/comets.js';
import {
  createDustBelts,
  createOortCloud,
  updateDustBelts,
  updateAsteroidBelts,
} from './bodies/asteroidBelts.js';
import {
  createNearbyStars,
  createHyperlanes,
  createSpaceProbes,
  createExoplanets,
  createLocalBubbleConnections,
  createLocalBubbleAxes,
  createLocalBubbleDistanceLabels,
  cleanupLocalBubbleLabels,
} from './bodies/starsAndExoplanets.js';
import { customCursor } from './ui/customCursor.js';
import { particleEffects } from './ui/particleEffects.js';
import { toast } from './ui/toast.js';
import { themeManager } from './core/theme.js';
import { a11y } from './core/a11y.js';
import { HUD } from './ui/hud.js';
import { Screenshot } from './core/screenshot.js';
import { XRManager } from './core/xr.js';
import { ViewPresets } from './ui/viewPresets.js';
import { commandPalette } from './ui/commandPalette.js';
import { HabitableZoneManager } from './core/habitableZone.js';
import { urlState } from './core/urlState.js';
import { soundManager } from './core/soundManager.js';
import { shortcutsPanel } from './ui/shortcuts.js';
import { getLang, setLang, applyI18nToDOM, onLangChange, t } from './i18n/index.js';
import { settingsPanel } from './ui/settings.js';
import { createAdvancedSun, createSunCorona, updateSunShader } from './core/sunShader.js';
import {
  addAtmosphereEffects,
  updateAtmosphereEffects,
  getAtmosphericPlanets,
} from './ui/atmosphereEffects.js';
import { onboarding } from './ui/onboarding.js';
import { createLazyFeatures } from './ui/lazyFeatures.js';
import { registerCommandActions } from './ui/commandActions.js';
import { createTimeControls } from './core/timeControls.js';
import { createNavigation } from './core/navigation.js';
import { buildPlanetsAndMoons } from './bodies/planetBuilder.js';
import { adaptiveQuality } from './core/adaptiveQuality.js';
import { ConstellationManager } from './core/constellations.js';
import { MeteorShowerManager } from './core/meteorShowers.js';
import { EclipseSimulator } from './core/eclipses.js';
import { Minimap } from './ui/minimap.js';
import { travelCalc } from './ui/travelCalc.js';

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
let activeGraphicsQuality = 'high';

function getTimeOffset() {
  return timeOffsetMs;
}
function getSelectedBody() {
  return selectedBody;
}

const loadingScreen = document.getElementById('loadingScreen');
const loadingBar = document.getElementById('loadingBar');
const loadingText = document.getElementById('loadingText');
const loadingPct = document.getElementById('loadingPct');

const manager = new THREE.LoadingManager();
manager.onProgress = (_u, loaded, total) => {
  const p = Math.round((loaded / total) * 100);
  if (loadingBar) loadingBar.style.width = p + '%';
  if (loadingPct) loadingPct.textContent = p + '%';
  if (loadingText) loadingText.textContent = `${t('load_textures')} (${p}%)`;
};
manager.onLoad = () => {
  if (loadingBar) loadingBar.style.width = '100%';
  if (loadingPct) loadingPct.textContent = '100%';
  if (loadingText) loadingText.textContent = t('load_ready');
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.8s ease';
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 850);
    }
    startApp();
  }, 300);
};
manager.onError = () => {
  if (loadingText) loadingText.textContent = t('load_alt');
};
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

renderer.domElement.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  if (loadingScreen) {
    loadingScreen.style.display = 'flex';
    loadingScreen.style.opacity = '1';
  }
  if (loadingText) loadingText.textContent = t('load_restoring');
});
renderer.domElement.addEventListener('webglcontextrestored', () => {
  // Recreate GPU-backed textures and post-processing safely after a context loss.
  window.location.reload();
});

const mwTex = TL.load(
  './assets/textures/optimized/8k_stars_milky_way.webp',
  generateProceduralMilkyWay
);
mwTex.mapping = THREE.EquirectangularReflectionMapping;
mwTex.minFilter = THREE.LinearFilter;
mwTex.magFilter = THREE.LinearFilter;
mwTex.generateMipmaps = false;
scene.background = mwTex;

const { composer, bloomPass, outlinePass } = setupPostProcessing(renderer, scene, camera);

// Create dynamic starfield, constellations & meteor showers
const starfield = createStarfield(scene);
const constellationManager = new ConstellationManager(scene);
const meteorShowerManager = new MeteorShowerManager(scene);
const habitableZoneManager = new HabitableZoneManager(scene, { visible: false });

const eclipseSimulator = new EclipseSimulator({
  onDateChange: (d) => {
    customDate = d;
    timeOffsetMs = d.getTime() - Date.now();
  },
  onFocus: (bodyKey) => {
    const body = allBodies.find((b) => b.key === bodyKey);
    if (body) {
      selectBody(body);
      CAM.tRadius = bodyKey === 'Moon' ? 12 : 60;
    }
  },
});

// ═══ Setup nuove features ═══
themeManager.apply();
a11y.apply();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
const hud = new HUD();
const minimap = new Minimap({
  onSelectBody: (body) => selectBody(body),
  onSelectStar: (starKey) => zoomToStar(starKey),
});
const screenshot = new Screenshot(renderer, scene, camera, composer);
const xrManager = new XRManager(renderer);
const viewPresets = new ViewPresets({
  onSelect: (p) => {
    if (p.pos) {
      const target = new THREE.Vector3(...p.pos);
      if (p.target === 'earth') {
        const eb = allBodies.find((b) => b.key === 'Earth');
        if (eb) zoomToBody(eb);
      } else {
        zoomToPosition(target, Math.max(p.pos[1] * 0.6, 50));
      }
    }
  },
});

function applyInitialURLState() {
  const lang = urlState.get('lang');
  if (lang === 'it' || lang === 'en') setLang(lang);
  const theme = urlState.get('theme');
  if (theme === 'dark' || theme === 'light') themeManager.set(theme);
  const speed = Number(urlState.get('speed'));
  if (ui.speed && Number.isFinite(speed)) {
    const min = Number(ui.speed.min);
    const max = Number(ui.speed.max);
    ui.speed.value = String(Math.min(max, Math.max(min, speed)));
  }
  const dateParam = urlState.get('date');
  if (dateParam) {
    const d = new Date(dateParam);
    if (!Number.isNaN(d.getTime())) {
      customDate = d;
      timeOffsetMs = d.getTime() - Date.now();
    }
  }

  const bodyKey = urlState.getBodyKey();
  const view = urlState.get('view');
  const presetBody = view === 'earth' ? 'Earth' : view === 'sun' ? 'Sun' : null;
  const requestedBody = bodyKey || presetBody;
  if (requestedBody) {
    const body = allBodies.find((item) => item.key === requestedBody);
    if (body) selectBody(body);
  }
  if (view === 'galaxy' && !galaxyMapMode) toggleGalaxyMap();
  if (view === 'local-bubble' && !localBubbleMode) toggleLocalBubble();
  if (view === 'timetravel') void toggleTimeTravel();
  applyI18nToDOM();
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
simFolder
  .add({ speed: 1 }, 'speed', -2, 7)
  .name('Time Speed')
  .onChange((v) => {
    const speedInput = document.getElementById('speed');
    if (speedInput) speedInput.value = v;
  });
simFolder
  .add({ paused: false }, 'paused')
  .name('Pause')
  .onChange((v) => {
    paused = v;
    const toggleBtn = document.getElementById('toggle');
    if (toggleBtn) toggleBtn.textContent = v ? 'Play' : 'Pause';
  });
simFolder.open();

const viewFolder = gui.addFolder('Display');
viewFolder
  .add({ showOrbits: true }, 'showOrbits')
  .name('Show Orbits')
  .onChange((v) => {
    const orbitsCheckbox = document.getElementById('orbits');
    if (orbitsCheckbox) orbitsCheckbox.checked = v;
  });
viewFolder
  .add({ showLabels: true }, 'showLabels')
  .name('Show Labels')
  .onChange((v) => {
    const labelsCheckbox = document.getElementById('labels');
    if (labelsCheckbox) labelsCheckbox.checked = v;
  });
viewFolder.close();

const camFolder = gui.addFolder('Camera');
camFolder
  .add(camera, 'fov', 30, 120)
  .name('FOV')
  .onChange(() => camera.updateProjectionMatrix());
camFolder
  .add({ near: 0.1 }, 'near', 0.01, 10)
  .name('Near Plane')
  .onChange((v) => {
    camera.near = v;
    camera.updateProjectionMatrix();
  });
camFolder
  .add({ far: 200000000 }, 'far', 10000, 500000000)
  .name('Far Plane')
  .onChange((v) => {
    camera.far = v;
    camera.updateProjectionMatrix();
  });
camFolder.close();

const renderFolder = gui.addFolder('Rendering');
renderFolder.add(renderer, 'toneMappingExposure', 0.5, 3).name('Exposure');
renderFolder
  .add({ pixelRatio: Math.min(devicePixelRatio, 2) }, 'pixelRatio', 0.5, 3)
  .name('Pixel Ratio')
  .onChange((v) => renderer.setPixelRatio(v));
renderFolder.close();

const navFolder = gui.addFolder('Navigation');
navFolder
  .add(
    {
      reset: () => {
        camera.position.set(0, 300, 500);
        camera.lookAt(0, 0, 0);
        selectedBody = null;
      },
    },
    'reset'
  )
  .name('Reset View');
navFolder
  .add(
    {
      top: () => {
        camera.position.set(0, 800, 0);
        camera.lookAt(0, 0, 0);
      },
    },
    'top'
  )
  .name('Top View');
navFolder
  .add(
    {
      side: () => {
        camera.position.set(800, 0, 0);
        camera.lookAt(0, 0, 0);
      },
    },
    'side'
  )
  .name('Side View');
navFolder
  .add(
    {
      inner: () => {
        camera.position.set(0, 50, 100);
        camera.lookAt(0, 0, 0);
      },
    },
    'inner'
  )
  .name('Inner System');
navFolder
  .add(
    {
      outer: () => {
        camera.position.set(0, 400, 600);
        camera.lookAt(0, 0, 0);
      },
    },
    'outer'
  )
  .name('Outer System');
navFolder.close();

// Pannello avanzato (debug) nascosto di default — Shift+D per mostrarlo
let guiVisible = false;
gui.hide();

const ui = createUIRefs();
setupInfoPanel(ui);

// Add sector and Local Bubble toggle to UI
ui.showSectors = document.getElementById('showSectors');
ui.localBubbleBtn = document.getElementById('localBubbleBtn');

if (ui.toggle)
  ui.toggle.onclick = () => {
    paused = !paused;
    ui.toggle.textContent = paused ? t('resume') : t('pause');
    lastPerf = performance.now();
  };
if (ui.now)
  ui.now.onclick = () => {
    jumpToNow();
  };
if (ui.resetCam)
  ui.resetCam.onclick = () => {
    exitFly();
    CAM.zoomTarget = null;
    CAM.tRadius = 900;
    CAM.tTheta = 0.9;
    CAM.tPhi = 1.05;
    CAM.tPivot.set(0, 0, 0);
    CAM.followBody = null;
    setCamLabel(ui, 'orbit');
  };
if (ui.yearBack)
  ui.yearBack.onclick = () => {
    jumpYears(-1);
  };
if (ui.yearFwd)
  ui.yearFwd.onclick = () => {
    jumpYears(1);
  };
if (ui.decBack)
  ui.decBack.onclick = () => {
    jumpYears(-10);
  };
if (ui.decFwd)
  ui.decFwd.onclick = () => {
    jumpYears(10);
  };

const CAM = createCameraSystem();
CAM.DAMP_FAST = 0.15;

// ═══ Controlli temporali + navigazione (moduli estratti) ═══
// Stessa logica di prima, solo spostata in core/timeControls.js e
// core/navigation.js per ridurre il punto di composizione.
const { jumpToNow, jumpYears } = createTimeControls({
  getSimDate: () => customDate || new Date(Date.now() + timeOffsetMs),
  setCustomDate: (d) => {
    customDate = d;
    timeOffsetMs = d ? d.getTime() - Date.now() : 0;
  },
  clickNowBtn: () => document.getElementById('now')?.click(),
  showHintFn: (msg) => showHint(ui, msg, hintTimerRef),
});

const {
  enterFly,
  exitFly,
  enterFollow,
  zoomToBody,
  zoomToPosition,
  exploreBody,
  exploreRandomBody,
} = createNavigation({
  CAM,
  camera,
  renderer,
  ui,
  allBodies,
  hintTimerRef,
  selectBody,
  setCamLabel,
  showHint,
});

// ═══ Lazy features + command palette (moduli estratti) ═══
// Stessa logica di prima, solo spostata in ui/lazyFeatures.js e
// ui/commandActions.js per ridurre il punto di composizione.
const {
  toggleSpaceNews,
  toggleQuiz,
  toggleTimeTravel,
  toggleGravitySandbox,
  toggleGrandTour,
  toggleSystemsExplorer,
  toggleComparison,
  toggleCredits,
  toggleMissions,
  openSpaceMissions,
  getBookmarks,
  getMissionsIfCreated,
  getObservatoryIfCreated,
  toggleObservatory,
} = createLazyFeatures({
  scene,
  camera,
  renderer,
  allBodies,
  CAM,
  getSelectedBody,
  selectBody,
  exitFly,
  exitGalaxyMapIfActive: () => {
    if (galaxyMapMode) toggleGalaxyMap();
  },
  setCamLabel: (mode) => setCamLabel(ui, mode),
  setCustomDate: (d) => {
    customDate = d;
    timeOffsetMs = d.getTime() - Date.now();
  },
});

registerCommandActions({
  ui,
  allBodies,
  CAM,
  commandPalette,
  themeManager,
  soundManager,
  screenshot,
  travelCalc,
  viewPresets,
  shortcutsPanel,
  urlState,
  constellationManager,
  meteorShowerManager,
  eclipseSimulator,
  minimap,
  getSelectedBody,
  selectBody,
  exitFly,
  getGalaxyMapMode: () => galaxyMapMode,
  getLocalBubbleMode: () => localBubbleMode,
  getCustomDate: () => customDate,
  setCamLabel: (mode) => setCamLabel(ui, mode),
  toggleTimeTravel,
  toggleGrandTour,
  toggleSystemsExplorer,
  toggleQuiz,
  getLang,
  t,
});

function applyViewMode(mode) {
  const cinematic = mode === 'cinema';
  const scientific = mode === 'science';
  if (ui.orbits) ui.orbits.checked = !cinematic;
  if (ui.labels) ui.labels.checked = !cinematic;
  if (ui.labelsLayer) ui.labelsLayer.style.display = cinematic ? 'none' : 'block';
  bloomPass.strength = cinematic ? 1.45 : scientific ? 0.7 : 1.2;
  outlinePass.enabled = !cinematic;
  renderer.toneMappingExposure = cinematic ? 1.22 : 1.4;
  [ui.viewExplore, ui.viewCinema, ui.viewScience].forEach((button) =>
    button?.classList.remove('active')
  );
  const activeButton = { explore: ui.viewExplore, cinema: ui.viewCinema, science: ui.viewScience }[
    mode
  ];
  activeButton?.classList.add('active');
  camera.fov = cinematic ? 48 : 55;
  camera.updateProjectionMatrix();
  showHint(
    ui,
    cinematic
      ? t('view_hint_cinema')
      : scientific
        ? t('view_hint_science')
        : t('view_hint_explore'),
    hintTimerRef
  );
}

function zoomToStar(starKey) {
  const star = allBodies.find((b) => b.key === starKey);
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
  showHint(
    ui,
    `Star system: ${getBodyLabel(star, getLang())}. WASD/Arrows to navigate.`,
    hintTimerRef
  );
  if (galaxyMapMode) {
    galaxyMapMode = false;
    if (ui.galaxyMapBtn) ui.galaxyMapBtn.textContent = t('galaxy_map');
    if (ui.minimapContainer) ui.minimapContainer.style.display = 'none';
  }
}

function toggleGalaxyMap() {
  galaxyMapMode = !galaxyMapMode;
  localBubbleMode = false; // Disable Local Bubble when switching to galaxy map
  if (galaxyMapMode) {
    setMilkyWayVisible(scene, true);
    spiralGalaxy.visible = true;
    earthBeaconGroup.visible = true;
    exitFly();
    CAM.tRadius = 420000;
    CAM.tTheta = 0;
    CAM.tPhi = 0.15; // Vista dall'alto (Top-down view of galaxy)
    CAM.tPivot.set(0, 0, 0);
    CAM.followBody = null;
    setCamLabel(ui, 'galaxy');
    showHint(ui, t('galaxy_hint'), hintTimerRef);
    if (ui.galaxyMapBtn) ui.galaxyMapBtn.textContent = t('galaxy_back');
    ui.galaxyMapBtn?.setAttribute('aria-pressed', 'true');
    if (ui.galaxyGuide) ui.galaxyGuide.classList.add('open');
    buildStarList(ui.starList, allBodies, '', zoomToStar);
    if (ui.minimapContainer) ui.minimapContainer.style.display = 'block';
    allBodies
      .filter((b) => b.type === 'star')
      .forEach((star) => {
        if (star.glow) {
          star.glow.scale.set(star.radius * 20, star.radius * 20, 1);
          star.glow.material.opacity = 0.9;
        }
      });
  } else {
    setMilkyWayVisible(scene, false, 'orbit');
    spiralGalaxy.visible = false;
    exitFly();
    CAM.tRadius = 900;
    CAM.tTheta = 0.9;
    CAM.tPhi = 1.05;
    CAM.tPivot.set(0, 0, 0);
    CAM.followBody = null;
    earthBeaconGroup.visible = false;
    setCamLabel(ui, 'orbit');
    if (ui.galaxyMapBtn) ui.galaxyMapBtn.textContent = t('galaxy_map');
    ui.galaxyMapBtn?.setAttribute('aria-pressed', 'false');
    if (ui.galaxyGuide) ui.galaxyGuide.classList.remove('open');
    if (ui.minimapContainer) ui.minimapContainer.style.display = 'none';
    allBodies
      .filter((b) => b.type === 'star')
      .forEach((star) => {
        if (star.glow) {
          star.glow.scale.set(star.radius * 7, star.radius * 7, 1);
          star.glow.material.opacity = 0.72;
        }
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
    showHint(ui, t('lb_hint'), hintTimerRef);
    if (ui.localBubbleBtn) ui.localBubbleBtn.textContent = t('galaxy_back');
    if (ui.galaxyGuide) ui.galaxyGuide.classList.remove('open');
    if (ui.minimapContainer) ui.minimapContainer.style.display = 'none';
    // Show Local Bubble connections and hide hyperlanes
    if (localBubbleGroup) localBubbleGroup.visible = true;
    if (hyperlaneGroup) hyperlaneGroup.visible = false;
    if (sectorGroup) sectorGroup.visible = false;
    // Show stars with enhanced glow for graph visualization
    allBodies
      .filter((b) => b.type === 'star')
      .forEach((star) => {
        if (star.glow) {
          star.glow.scale.set(star.radius * 15, star.radius * 15, 1);
          star.glow.material.opacity = 0.85;
        }
        // Show distance labels
        if (star.distanceLabel) star.distanceLabel.style.opacity = '1';
      });
  } else {
    setMilkyWayVisible(scene, false, 'orbit');
    exitFly();
    CAM.tRadius = 900;
    CAM.tTheta = 0.9;
    CAM.tPhi = 1.05;
    CAM.tPivot.set(0, 0, 0);
    CAM.followBody = null;
    setCamLabel(ui, 'orbit');
    if (ui.localBubbleBtn) ui.localBubbleBtn.textContent = 'Local Bubble';
    // Hide Local Bubble connections
    if (localBubbleGroup) localBubbleGroup.visible = false;
    if (hyperlaneGroup) hyperlaneGroup.visible = true;
    if (sectorGroup) sectorGroup.visible = true;
    allBodies
      .filter((b) => b.type === 'star')
      .forEach((star) => {
        if (star.glow) {
          star.glow.scale.set(star.radius * 7, star.radius * 7, 1);
          star.glow.material.opacity = 0.72;
        }
        // Hide distance labels
        if (star.distanceLabel) star.distanceLabel.style.opacity = '0';
      });
    // Cleanup distance labels to prevent memory leak
    cleanupLocalBubbleLabels(allBodies);
  }
}

const galaxyModal = new GalaxyModal({
  onEnterSolarSystem: () => {
    exitFly();
    CAM.tRadius = 900;
    CAM.tTheta = 0.9;
    CAM.tPhi = 1.05;
    CAM.tPivot.set(0, 0, 0);
    CAM.followBody = null;
    selectedBody = allBodies.find((b) => b.key === 'Sun') || null;
    if (galaxyMapMode) toggleGalaxyMap();
    showHint(ui, t('welcome_sun'), hintTimerRef);
  },
});

if (ui.galaxyMapBtn) ui.galaxyMapBtn.onclick = () => galaxyModal.open();
window.openGalaxyModal = () => galaxyModal.open();
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
if (ui.invSearch)
  ui.invSearch.addEventListener('input', () => filterInventory(ui.invList, ui.invSearch.value));

const tooltip = createTooltip();
const mouseMove = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const pGroup = new THREE.Group();
scene.add(pGroup);
const oGroup = new THREE.Group();
scene.add(oGroup);
const navGrid = createNavGrid();
scene.add(navGrid);
const cGroup = new THREE.Group();
scene.add(cGroup);
const aGroup = new THREE.Group();
scene.add(aGroup);
const hyperlaneGroup = new THREE.Group();
hyperlaneGroup.name = 'hyperlanes';
scene.add(hyperlaneGroup);
const sectorGroup = new THREE.Group();
sectorGroup.name = 'sectors';
scene.add(sectorGroup);
sectorGroup.visible = false; // Hidden by default, only visible in galactic map mode
const localBubbleGroup = new THREE.Group();
localBubbleGroup.name = 'localBubble';
scene.add(localBubbleGroup);

// ═══ 3D Spiral Galaxy (Milky Way) ═══
const spiralGalaxy = create3DSpiralGalaxy();
scene.add(spiralGalaxy);

// ═══ Earth / Solar System Galactic Beacon (3D Red Pulsing Dot) ═══
const earthBeaconGroup = new THREE.Group();
earthBeaconGroup.name = 'earthBeaconGroup';
earthBeaconGroup.visible = false;
scene.add(earthBeaconGroup);

const beaconCanvas = document.createElement('canvas');
beaconCanvas.width = 128;
beaconCanvas.height = 128;
const bCtx = beaconCanvas.getContext('2d');
if (bCtx) {
  const grad = bCtx.createRadialGradient(64, 64, 2, 64, 64, 60);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.2, '#ff1144');
  grad.addColorStop(0.5, 'rgba(255, 30, 70, 0.7)');
  grad.addColorStop(1, 'transparent');
  bCtx.fillStyle = grad;
  bCtx.beginPath();
  bCtx.arc(64, 64, 60, 0, Math.PI * 2);
  bCtx.fill();
}
const beaconTexture = new THREE.CanvasTexture(beaconCanvas);
const beaconSpriteMat = new THREE.SpriteMaterial({
  map: beaconTexture,
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const earthBeaconSprite = new THREE.Sprite(beaconSpriteMat);
earthBeaconSprite.scale.set(16000, 16000, 1);
earthBeaconGroup.add(earthBeaconSprite);

const beaconRingGeo = new THREE.RingGeometry(8000, 11000, 32);
const beaconRingMat = new THREE.MeshBasicMaterial({
  color: 0xff2255,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.75,
  blending: THREE.AdditiveBlending,
});
const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
beaconRing.rotation.x = -Math.PI / 2;
earthBeaconGroup.add(beaconRing);

function selectBody(body) {
  selectedBody = body;
  if (!body) {
    if (ui.infoPanel) ui.infoPanel.classList.remove('visible');
    highlightInventory(ui.invList, null);
    return;
  }
  // ═══ Gamification: track body visited ═══
  getMissionsIfCreated()?.onBodyVisited(body.key);
  soundManager.playBodyResonance(body.key);
  showInfo(ui, body, zoomToBody, enterFollow, selectBody, allBodies);
  highlightInventory(ui.invList, body.key);
  if (CAM.mode === 'orbit') {
    zoomToBody(body, 1000);
  } else if (CAM.mode === 'follow') {
    enterFollow(body);
  }
}

function updateStarSelectionVisuals() {
  allBodies.forEach((body) => {
    if (body.type === 'star' && body.glow) {
      if (selectedStars.has(body.key)) {
        // Highlight selected stars with brighter glow
        body.glow.material.opacity = 1.0;
        body.glow.scale.set(body.radius * 25, body.radius * 25, 1);
      } else {
        // Normal glow for unselected stars
        body.glow.material.opacity = galaxyMapMode ? 0.9 : 0.72;
        body.glow.scale.set(
          body.radius * (galaxyMapMode ? 20 : 7),
          body.radius * (galaxyMapMode ? 20 : 7),
          1
        );
      }
    }
  });
}

setupControls(
  CAM,
  camera,
  renderer,
  ui,
  raycaster,
  mouse,
  mouseMove,
  meshList,
  hitboxList,
  allBodies,
  tooltip,
  (m) => setCamLabel(ui, m),
  (msg) => showHint(ui, msg, hintTimerRef),
  selectBody
);

const keys = {};
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    commandPalette.toggle();
    return;
  }
  // Ignore keyboard shortcuts when typing in an input/textarea
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
    return;
  }
  keys[e.key] = true;
  if (e.repeat) return;
  if (e.code === 'Space' || (!(e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K'))) {
    e.preventDefault();
    ui.toggle?.click();
  }
  if (e.key === 'Escape') {
    const obs = getObservatoryIfCreated();
    if (obs?.active) {
      obs.exit();
    } else if (CAM.mode !== 'orbit') exitFly();
    if (ui.infoPanel) ui.infoPanel.classList.remove('visible');
    // Clear multi-selection
    if (selectedStars.size > 0) {
      selectedStars.clear();
      updateStarSelectionVisuals();
      showHint(ui, t('sel_cleared'), hintTimerRef);
    }
  }
  if (e.key === 'f' || e.key === 'F') {
    CAM.mode === 'fly' ? exitFly() : enterFly();
  }
  if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
    guiVisible = !guiVisible;
    guiVisible ? gui.show() : gui.hide();
    toast.info(guiVisible ? t('toast_debug_on') : t('toast_debug_off'));
  }
  if (e.key === '1') {
    exitFly();
  }
  if (e.key === '2') {
    if (selectedBody) enterFollow(selectedBody);
  }
  if (e.key === '3') {
    enterFly();
  }
  if (e.key === 'j' || e.key === 'J') openInventory();
  if (e.key === 'Shift') CAM.flyBoost = true;
  if (e.key === 'r' || e.key === 'R') {
    jumpToNow();
  }
  if (e.key === '[') {
    jumpYears(-1);
  }
  if (e.key === ']') {
    jumpYears(1);
  }
  if (e.key === '{') {
    jumpYears(-10);
  }
  if (e.key === '}') {
    jumpYears(10);
  }
  // ═══ Shortcuts nuove features ═══
  if (e.key === 'h' || e.key === 'H') {
    e.preventDefault();
    shortcutsPanel.toggle();
  }
  if (e.key === 'v' || e.key === 'V') {
    e.preventDefault();
    viewPresets.toggle();
  }
  if (e.key === 't' || e.key === 'T') {
    themeManager.toggle();
  }
  if (e.key === 'l' || e.key === 'L') {
    setLang(getLang() === 'it' ? 'en' : 'it');
    applyI18nToDOM();
    if (ui.toggle) ui.toggle.textContent = paused ? t('resume') : t('pause');
  }
  if (e.key === 'n' || e.key === 'N') {
    void toggleSpaceNews();
  }
  if (e.key === 'q' || e.key === 'Q') {
    void toggleQuiz();
  }
  if (e.key === 'g' || e.key === 'G') {
    void toggleGravitySandbox();
  }
  if (e.key === 'c' || e.key === 'C') {
    void toggleComparison();
  }
  if (e.key === 'i' || e.key === 'I') {
    void toggleCredits();
  }
  if (e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    settingsPanel.toggle();
  }
  if (e.key === 'm' || e.key === 'M') {
    const visible = minimap.toggle();
    const cb = document.getElementById('minimapToggle');
    if (cb) cb.checked = visible;
    toast.info(visible ? t('toggle_minimap_on') : t('toggle_minimap_off'));
  }
  if (e.key === 'x' || e.key === 'X') {
    void toggleMissions();
  }
  // ═══ Observatory: shortcut O ═══
  if (e.key === 'o' || e.key === 'O') {
    void toggleObservatory();
  }
  // ═══ Bookmarks ═══
  if (e.key === 'b' || e.key === 'B') {
    void getBookmarks().then((tool) => tool.toggle(CAM));
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    void getBookmarks().then((tool) => {
      const entry = tool.save(CAM);
      toast.success(`${t('bmk_saved')}: ${entry.name}`, 2000);
    });
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  if (e.key === 'Shift') CAM.flyBoost = false;
});

window.addEventListener('mousedown', (e) => {
  if (CAM.pointerLocked) return;
  // Star zoom raycast (orbit mode only — controls.js handles drag & body clicks)
  mouseMove.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouseMove, camera);
  const hits = raycaster
    .intersectObjects([...meshList, ...hitboxList])
    .filter((h) => h.object.userData.isStar);
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
window.addEventListener('mousemove', (e) => {
  const obs = getObservatoryIfCreated();
  if (!obs?.active) return;
  const dx = e.movementX || 0;
  const dy = e.movementY || 0;
  obs.onMouseMove(dx, dy);
});

// Keep the dark side of planets genuinely dark; the Sun remains the dominant key light.
scene.add(new THREE.HemisphereLight(0x6b84b8, 0x050507, 0.22));
const sunLight = new THREE.PointLight(0xfff4e0, 8.0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 8000;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

// A subtle camera-side fill keeps the selected body's night side readable.
// It stays far weaker than the Sun and fades almost completely in free flight,
// preserving terminators and the sense of depth without showing a black disc.
const inspectionFill = new THREE.DirectionalLight(0xfff1dc, 0.05);
inspectionFill.target.name = 'inspectionFillTarget';
scene.add(inspectionFill, inspectionFill.target);

const sun = createAdvancedSun(SUN_R, './assets/textures/optimized/2k_sun.webp', manager);
const sunPivot = new THREE.Group();
sunPivot.name = 'sunPivot';
sun.userData.bodyKey = 'Sun';
sunPivot.add(sun);
scene.add(sunPivot);
meshList.push(sun);

// Corona solare
const sunCorona = createSunCorona(SUN_R * 1.18, SUN_R * 3.1);
scene.add(sunCorona);

[
  [8, 128, 'rgba(255,200,50,0.72)', 'rgba(255,120,0,0.24)', SUN_R * 4.5],
  [2, 128, 'rgba(255,240,100,0.34)', 'rgba(255,160,0,0.07)', SUN_R * 9],
  [0, 128, 'rgba(255,180,30,0.11)', 'rgba(255,80,0,0)', SUN_R * 16],
].forEach(([iR, , cIn, cOut, sc]) => {
  const sp = makeCanvasSprite(
    (ctx, s) => {
      const g = ctx.createRadialGradient(s / 2, s / 2, iR, s / 2, s / 2, 128);
      g.addColorStop(0, cIn);
      g.addColorStop(0.45, cOut);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
    },
    256,
    sc
  );
  scene.add(sp);
  sp._isSunGlow = true;
  sp._baseOpacity = sp.material.opacity;
});

let sunLabel = null;
if (ui.labelsLayer) {
  sunLabel = document.createElement('div');
  sunLabel.className = 'label';
  sunLabel.textContent = '☀ Sole';
  sunLabel.dataset.iconPrefix = '☀ ';
  sunLabel.style.pointerEvents = 'auto';
  sunLabel.style.cursor = 'pointer';
  sunLabel.addEventListener('click', () => {
    const body = allBodies.find((candidate) => candidate.key === 'Sun');
    if (body) selectBody(body);
  });
  ui.labelsLayer.appendChild(sunLabel);
}
allBodies.push({
  key: 'Sun',
  label: 'Sole',
  labelEn: 'Sun',
  icon: '☀',
  type: 'star',
  color: 0xffcc55,
  radius: SUN_R,
  visualR: SUN_R,
  pivot: sunPivot,
  mesh: sun,
  labelEl: sunLabel,
  distAU: 0,
  period: null,
  moons: 8,
  desc: 'La stella al centro del Sistema Solare. Contiene oltre il 99,8% della massa dell’intero sistema.',
  descEn:
    'The star at the center of the Solar System. It holds over 99.8% of the entire system’s mass.',
  getPos: () => new THREE.Vector3(0, 0, 0),
});

// ═══ Pianeti, lune, asteroidi e fasce (modulo estratto) ═══
({ mainBelt, kuiperBelt } = buildPlanetsAndMoons({
  scene,
  ui,
  pGroup,
  aGroup,
  allBodies,
  meshList,
  hitboxList,
  lodList,
  selectBody,
  getTimeOffset,
  getTimeOffsetMs: () => timeOffsetMs,
}));

cometObjects = createComets(COMETS, cGroup, hitboxList, ui, allBodies, meshList, selectBody);
createNearbyStars(NEARBY_STARS, pGroup, ui, allBodies, meshList, selectBody);
createHyperlanes(allBodies, hyperlaneGroup);
createSpaceProbes(SPACE_PROBES, pGroup, ui, allBodies, selectBody);
createExoplanets(EXOPLANETS, pGroup, ui, allBodies, meshList, selectBody, getTimeOffset);
createDustBelts(scene);
createOortCloud(scene);

// Create Local Bubble graph connections and axes
createLocalBubbleConnections(allBodies, localBubbleGroup);
createLocalBubbleAxes(localBubbleGroup);
createLocalBubbleDistanceLabels(allBodies, ui);
localBubbleGroup.visible = false; // Hidden by default

// Create territorial sectors after stars are positioned
createGalaxySectors(allBodies, sectorGroup);

// ═══ Aggiungi effetti atmosferici ai pianeti ═══
getAtmosphericPlanets().forEach((planetKey) => {
  const planetBody = allBodies.find((b) => b.key === planetKey);
  if (planetBody) addAtmosphereEffects(planetBody, planetKey);
});

setupMenuUI(ui, allBodies, getSelectedBody, selectBody, zoomToStar, hyperlaneGroup);

function updateCamera(dt) {
  const distToTarget = CAM.zoomTarget ? Math.abs(CAM.radius - CAM.zoomTarget.finalRadius) : 0;
  const useFastDamp = distToTarget > 500 || CAM.isTransitioning;
  const damp = useFastDamp ? CAM.DAMP_FAST : CAM.DAMP;
  const sp = 1 - Math.pow(1 - damp, dt * 60);

  if (CAM.mode === 'orbit') {
    const moveSpeed = CAM.radius * 0.005 * dt * 60;
    if (keys['w'] || keys['W'] || keys['ArrowUp']) {
      const fwd = new THREE.Vector3(-Math.sin(CAM.theta), 0, -Math.cos(CAM.theta));
      CAM.tPivot.addScaledVector(fwd, moveSpeed);
    }
    if (keys['s'] || keys['S'] || keys['ArrowDown']) {
      const fwd = new THREE.Vector3(-Math.sin(CAM.theta), 0, -Math.cos(CAM.theta));
      CAM.tPivot.addScaledVector(fwd, -moveSpeed);
    }
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
      const right = new THREE.Vector3(-Math.cos(CAM.theta), 0, Math.sin(CAM.theta));
      CAM.tPivot.addScaledVector(right, -moveSpeed);
    }
    if (keys['d'] || keys['D'] || keys['ArrowRight']) {
      const right = new THREE.Vector3(-Math.cos(CAM.theta), 0, Math.sin(CAM.theta));
      CAM.tPivot.addScaledVector(right, moveSpeed);
    }
    if (keys['q'] || keys['Q']) CAM.tPivot.y += moveSpeed;
    if (keys['e'] || keys['E']) CAM.tPivot.y -= moveSpeed;

    if (CAM.zoomTarget) {
      const pos = CAM.zoomTarget.body.pivot?.position;
      if (pos) {
        CAM.tRadius = CAM.zoomTarget.finalRadius;
        CAM.tPivot.copy(pos);
        if (Math.abs(CAM.radius - CAM.tRadius) < 0.5) {
          CAM.zoomTarget = null;
          CAM.isTransitioning = false;
        }
      }
    }
    CAM.radius += (CAM.tRadius - CAM.radius) * sp;
    CAM.phi += (CAM.tPhi - CAM.phi) * sp;
    CAM.theta += (CAM.tTheta - CAM.theta) * sp;
    CAM.pivot.lerp(CAM.tPivot, sp);
    camera.position.set(
      CAM.pivot.x + CAM.radius * Math.sin(CAM.phi) * Math.cos(CAM.theta),
      CAM.pivot.y + CAM.radius * Math.cos(CAM.phi),
      CAM.pivot.z + CAM.radius * Math.sin(CAM.phi) * Math.sin(CAM.theta)
    );
    camera.lookAt(CAM.pivot);
  } else if (CAM.mode === 'fly') {
    const speed = CAM.flySpeed * (CAM.flyBoost ? 5 : 1) * dt;
    const fwd = new THREE.Vector3(
      -Math.sin(CAM.flyYaw) * Math.cos(CAM.flyPitch),
      Math.sin(CAM.flyPitch),
      -Math.cos(CAM.flyYaw) * Math.cos(CAM.flyPitch)
    );
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
      CAM.followDist * Math.sin(CAM.followPhi) * Math.sin(CAM.followTheta)
    );
    camera.position.lerp(target.clone().add(offset), sp * 2);
    camera.lookAt(target);
    if (Math.abs(CAM.followDist - targetDist) < 1) CAM.isTransitioning = false;
  }
}

function updateMinimap() {
  minimap.render({
    allBodies,
    camera,
    cameraSystem: CAM,
    selectedBody,
    isGalaxyMode: galaxyMapMode,
  });
}

function applyGraphicsQuality(quality) {
  const presets = {
    low: { pixelRatio: 0.85, shadows: false, bloom: 0, outline: false, dust: false, oort: false },
    medium: {
      pixelRatio: Math.min(devicePixelRatio, 1.25),
      shadows: false,
      bloom: 0.75,
      outline: true,
      dust: true,
      oort: false,
    },
    high: {
      pixelRatio: Math.min(devicePixelRatio, 1.75),
      shadows: true,
      bloom: 1.1,
      outline: true,
      dust: true,
      oort: true,
    },
    ultra: {
      pixelRatio: Math.min(devicePixelRatio, 2.5),
      shadows: true,
      bloom: 1.35,
      outline: true,
      dust: true,
      oort: true,
    },
  };
  const preset = presets[quality] || presets.high;
  activeGraphicsQuality = presets[quality] ? quality : 'high';
  renderer.setPixelRatio(preset.pixelRatio);
  composer.setPixelRatio?.(preset.pixelRatio);
  renderer.shadowMap.enabled = preset.shadows;
  bloomPass.enabled = preset.bloom > 0;
  bloomPass.strength = preset.bloom;
  outlinePass.enabled = preset.outline;
  if (scene.userData.belt?.geo)
    scene.userData.belt.geo.setDrawRange(0, preset.dust ? scene.userData.belt.N : 0);
  if (scene.userData.kuiper?.geo)
    scene.userData.kuiper.geo.setDrawRange(0, preset.dust ? scene.userData.kuiper.N : 0);
  const oort = scene.getObjectByName('oortCloud');
  if (oort) oort.visible = preset.oort;
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
}

function updateSceneDetailVisibility() {
  // Wide-scale belts are useful for orientation, but visually overpower a
  // planet close-up. Restore them automatically as soon as the camera pulls back.
  const closeFocus = !!selectedBody && CAM.radius < 160 && !galaxyMapMode && !localBubbleMode;
  const quality = activeGraphicsQuality;
  const showBelts = !closeFocus && quality !== 'low';
  const selectedIsComet = selectedBody?.type === 'comet';
  const selectedIsAsteroid = selectedBody?.type === 'asteroid';
  const closeSunFocus =
    selectedBody?.key === 'Sun' && camera.position.distanceTo(sunPivot.position) < 260;
  allBodies.forEach((body) => {
    if (body.pivot) body.pivot.visible = !closeSunFocus || body.key === 'Sun';
  });
  if (mainBelt) mainBelt.visible = showBelts;
  if (kuiperBelt) kuiperBelt.visible = showBelts;
  // Small moving objects are useful in the overview, but at planet scale
  // they can pass directly in front of the camera and read as large squares.
  // Keep the relevant collection visible when the user is actually exploring it.
  cGroup.visible = !closeFocus || selectedIsComet;
  aGroup.visible = !closeFocus || selectedIsAsteroid;
  const mainDust = scene.getObjectByName('mainDustBelt');
  const kuiperDust = scene.getObjectByName('kuiperDustBelt');
  const oort = scene.getObjectByName('oortCloud');
  if (mainDust) mainDust.visible = !closeFocus && quality !== 'low';
  if (kuiperDust) kuiperDust.visible = !closeFocus && quality !== 'low';
  if (oort) oort.visible = !closeFocus && quality === 'high';
  if (closeFocus) {
    allBodies.forEach((body) => {
      if ((body.type === 'comet' || body.type === 'asteroid') && body.labelEl) {
        body.labelEl.style.display = body === selectedBody ? 'block' : 'none';
      }
    });
  }
}

function animate() {
  try {
    const now = performance.now(),
      dt = Math.min((now - lastPerf) / 1000, 0.1);
    lastPerf = now;

    adaptiveQuality.update(now);

    updateCamera(dt);

    inspectionFill.position.copy(camera.position);
    inspectionFill.target.position.copy(selectedBody?.pivot?.position || CAM.pivot);
    inspectionFill.intensity = THREE.MathUtils.lerp(
      inspectionFill.intensity,
      selectedBody && selectedBody.key !== 'Sun' ? 1.8 : 0.05,
      Math.min(1, dt * 5)
    );

    const mult = timeMultiplier(ui);
    if (ui.speedLabel) ui.speedLabel.textContent = speedText(mult);
    if (!paused) timeOffsetMs += dt * 1000 * (mult - 1);

    const d = customDate || new Date(Date.now() + timeOffsetMs);
    const locale = getLang() === 'it' ? 'it-IT' : 'en-US';
    if (ui.clock) ui.clock.textContent = d.toLocaleString(locale, { hour12: false });
    const T = (julianDate(d) - 2451545.0) / 36525.0;

    allBodies.forEach((b) => {
      if (b.type === 'comet' || !b.pivot) return;
      const pos = b.getPos ? b.getPos(T) : null;
      if (pos) b.pivot.position.copy(pos);
      if (b.mesh) b.mesh.rotation.y += 0.002 * dt * 60;
      if (b.glow?.quaternion) b.glow.quaternion.copy(camera.quaternion);
      if (b.atmosphereMesh?.quaternion) b.atmosphereMesh.quaternion.copy(camera.quaternion);
      const isH = ui.hoveredBody?.key === b.key || selectedBody?.key === b.key;
      if (b.glow?.material) {
        b.glow.material.opacity = isH ? 0.9 : 0.42;
        const sc = b.radius * (isH ? 7 : 5.5);
        b.glow.scale.set(sc, sc, 1);
      }
      if (b.key === 'Earth' && b.mesh?.material?.uniforms) {
        b.mesh.material.uniforms.time.value = performance.now();
        const sunBody = allBodies.find((s) => s.key === 'Sun');
        if (sunBody) {
          const dir = new THREE.Vector3()
            .copy(sunBody.pivot.position)
            .sub(b.pivot.position)
            .normalize();
          b.mesh.material.uniforms.sunDirection.value.copy(dir);
        }
      }
      if (b.type === 'star' && b.mesh?.material?.uniforms)
        b.mesh.material.uniforms.time.value = performance.now();
      if (b.type === 'exoplanet') {
        if (b.mesh?.material?.uniforms) b.mesh.material.uniforms.time.value = performance.now();
        if (typeof b.updatePos === 'function') b.updatePos();
      }
    });

    updateAsteroidBelts(mainBelt, kuiperBelt, mult, paused);
    updateComets(cometObjects, dt, mult, paused, ui, camera);
    updateDustBelts(scene, dt, mult);
    // ═══ Paesaggio Sonoro Cosmico Generativo & Audio 8D ═══
    soundManager.update8DAudio(now, CAM.radius, selectedBody);

    // ═══ Atmosphere effects update ═══
    allBodies.forEach((b) => {
      if (b.clouds || b.upperClouds || b.aurora || b.atmosphereGlow)
        updateAtmosphereEffects(b, camera);
    });

    // ═══ Update Local Bubble distance labels position ═══
    if (localBubbleMode) {
      allBodies
        .filter((b) => b.type === 'star' && b.distanceLabel)
        .forEach((star) => {
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

    if (earthBeaconGroup.visible) {
      const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.3;
      earthBeaconSprite.scale.set(16000 * pulse, 16000 * pulse, 1);
      beaconRing.scale.set(pulse, pulse, pulse);
    }

    if (spiralGalaxy.visible) {
      spiralGalaxy.rotation.y += 0.0003;
    }

    if (ui.orbits) oGroup.visible = ui.orbits.checked;
    rebuildOrbits(T, oGroup, lastOrbitTRef);

    sun.rotation.y += 0.0006;
    scene.children.forEach((c) => {
      if (c._isSunGlow) c.quaternion.copy(camera.quaternion);
    });
    // ═══ Advanced sun shader update ═══
    updateSunShader(sun, sunCorona);
    const sunDistance = camera.position.distanceTo(sunPivot.position);
    const farFromSun = THREE.MathUtils.smoothstep(sunDistance, SUN_R * 4, SUN_R * 16);
    if (sun.userData.material?.uniforms?.intensity) {
      sun.userData.material.uniforms.intensity.value = THREE.MathUtils.lerp(0.68, 1.1, farFromSun);
    }
    if (sunCorona) {
      sunCorona.quaternion.copy(camera.quaternion);
      sunCorona.userData.material.uniforms.intensity.value = THREE.MathUtils.lerp(
        0.18,
        0.72,
        farFromSun
      );
    }
    scene.children.forEach((child) => {
      if (child._isSunGlow && child.material) {
        child.material.opacity = child._baseOpacity * THREE.MathUtils.lerp(0.16, 1, farFromSun);
      }
    });

    invDistFrame++;
    if (invDistFrame % 60 === 0) updateInventoryDistances(allBodies, AU);

    updateLabels(allBodies, camera, ui, selectedBody);
    updateMinimap();
    updateSceneDetailVisibility();

    // The outline pass is deliberately limited to the active target, keeping the
    // scene readable while giving click/hover feedback that is impossible to miss.
    const outlinedBody = ui.hoveredBody || selectedBody;
    outlinePass.selectedObjects = outlinedBody?.mesh ? [outlinedBody.mesh] : [];

    // ═══ Observatory update ═══
    const obs = getObservatoryIfCreated();
    if (obs?.active) {
      const sunBody = allBodies.find((b) => b.key === 'Sun');
      const sunPos = sunBody ? sunBody.pivot.position : new THREE.Vector3();
      obs.update(dt, sunPos);
    }

    for (let i = 0; i < lodList.length; i++) lodList[i].update(camera);

    hud.updateFPS(1 / Math.max(dt, 0.001));
    if (selectedBody) hud.setBody(getBodyLabel(selectedBody, getLang()));
    else hud.setBody(t('hud_free'));
    if (d) hud.setDate(d);

    // Update starfield parallax, meteor showers & spatial audio
    updateStarfieldParallax(starfield, camera);
    meteorShowerManager.update(dt, d);
    habitableZoneManager.update(performance.now());
    const camDist = selectedBody?.pivot
      ? camera.position.distanceTo(selectedBody.pivot.position)
      : camera.position.length();
    soundManager.updateSpatialAudio(camDist);

    composer.render();
  } catch (err) {
    // Log SOLO il primo errore identico (non cascata) e continua il rendering
    if (!animate._lastErr || animate._lastErr !== err.message) {
      animate._lastErr = err.message;
      toast.warning('Un dettaglio grafico non è disponibile: l’esplorazione continua.');
    }
  }
}

function startApp() {
  if (window.__solarStarted) return;
  window.__solarStarted = true;

  // Ensure we start in orbit mode (not galaxy/local bubble)
  galaxyMapMode = false;
  localBubbleMode = false;
  CAM.tRadius = 900;
  CAM.tTheta = 0.9;
  CAM.tPhi = 1.05;
  CAM.tPivot.set(0, 0, 0);
  if (ui.galaxyMapBtn) ui.galaxyMapBtn.textContent = t('galaxy_map');
  if (ui.localBubbleBtn) ui.localBubbleBtn.textContent = 'Local Bubble';
  if (ui.galaxyGuide) ui.galaxyGuide.classList.remove('open');
  if (ui.celestialMenu) ui.celestialMenu.classList.remove('open');
  if (ui.minimapContainer) ui.minimapContainer.style.display = 'block';

  rebuildOrbits((julianDate(new Date()) - 2451545.0) / 36525.0, oGroup, lastOrbitTRef);
  buildInventory(ui.invList, allBodies, selectBody);
  // Build star list AFTER allBodies is populated
  if (ui.starList) buildStarList(ui.starList, allBodies, '', zoomToStar);
  // Cambio lingua: ri-localizza etichette 3D, inventario e pannello aperto.
  // Registrato una sola volta (startApp è idempotente via __solarStarted).
  if (!window.__astralisLangHook) {
    window.__astralisLangHook = true;
    onLangChange((lang) => {
      refreshLabelLanguage(allBodies, lang);
      if (ui.invList) buildInventory(ui.invList, allBodies, selectBody);
      if (ui.starList) buildStarList(ui.starList, allBodies, '', zoomToStar);
      if (selectedBody && ui.infoPanel?.classList.contains('visible')) {
        showInfo(ui, selectedBody, zoomToBody, enterFollow, selectBody, allBodies);
      }
    });
  }
  setCamLabel(ui, 'orbit');

  // Init nuovi moduli
  setupTabs();
  setupGlobalSearch(allBodies, selectBody, zoomToBody);
  habitableZoneManager.init(allBodies);

  commandPalette.registerActions({
    toggle_habitable_zone: () => {
      const isVis = habitableZoneManager.toggle();
      toast.info(isVis ? 'Zona Abitabile: Visibile' : 'Zona Abitabile: Nascosta');
    },
    space_travel: () => {
      travelCalc.openModal();
    },
  });

  travelCalc.init({
    allBodies,
    selectBody,
    zoomToBody,
    onTravelExecute: (days, arrivalDate) => {
      timeOffsetMs += days * 86400 * 1000;
      customDate = arrivalDate;
    },
  });
  hud.init();
  customCursor.init();
  particleEffects.init();
  document.addEventListener('visibilitychange', () => {
    const reduceMotion = document.documentElement.getAttribute('data-reduce-motion') === '1';
    if (document.hidden || reduceMotion) {
      particleEffects.hide();
      customCursor.hide();
    } else {
      particleEffects.show();
      customCursor.show();
    }
  });
  toast.init();
  window.addEventListener('offline', () =>
    toast.warning('Sei offline: le risorse già visitate restano disponibili.')
  );
  window.addEventListener('online', () => toast.success('Connessione ripristinata.', 1800));
  settingsPanel.init();
  applyI18nToDOM();
  ui.viewExplore?.addEventListener('click', () => applyViewMode('explore'));
  ui.viewCinema?.addEventListener('click', () => applyViewMode('cinema'));
  ui.viewScience?.addEventListener('click', () => applyViewMode('science'));
  document.getElementById('quickEarth')?.addEventListener('click', () => exploreBody('Earth'));
  document.getElementById('quickSun')?.addEventListener('click', () => exploreBody('Sun'));
  document.getElementById('quickRandom')?.addEventListener('click', exploreRandomBody);
  const constCheckbox = document.getElementById('constellations');
  if (constCheckbox) {
    constCheckbox.addEventListener('change', (e) => {
      constellationManager.setVisible(e.target.checked);
      toast.info(e.target.checked ? 'Costellazioni visibili' : 'Costellazioni nascoste');
    });
  }
  const minimapCheckbox = document.getElementById('minimapToggle');
  if (minimapCheckbox) {
    minimapCheckbox.addEventListener('change', (e) => {
      minimap.setVisible(e.target.checked);
      toast.info(e.target.checked ? 'Radar minimappa attivo' : 'Radar minimappa nascosto');
    });
  }
  const initialQuality = settingsPanel.getQuality();
  if (initialQuality === 'auto') {
    adaptiveQuality.setAutoScale(true);
    applyGraphicsQuality(adaptiveQuality.getQualityLevel());
  } else {
    adaptiveQuality.setQualityLevel(initialQuality, true);
    applyGraphicsQuality(initialQuality);
  }

  adaptiveQuality.onChange((level) => {
    applyGraphicsQuality(level);
    if (settingsPanel.getQuality() === 'auto') {
      const labels = { low: 'Bassa', medium: 'Media', high: 'Alta', ultra: 'Ultra' };
      toast.info(`Qualità dinamica adattata: ${labels[level] || level}`, 2500);
    }
  });
  if (hud.el) hud.el.style.display = settingsPanel.shouldShowFPS() ? 'flex' : 'none';
  void xrManager.init();
  if (
    'serviceWorker' in navigator &&
    import.meta.env.PROD &&
    (location.protocol === 'https:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1')
  ) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  } else if ('serviceWorker' in navigator && import.meta.env.DEV) {
    // A SW productionale non deve intercettare gli asset Vite/HMR durante lo sviluppo:
    // in caso di server riavviato restituirebbe fallback 503 al posto dell'errore reale.
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      )
      .catch(() => {});
  }

  // Bind bottoni UI con feedback toast
  if (ui.compareBtn)
    ui.compareBtn.onclick = () => {
      void toggleComparison();
      toast.info(t('toast_compare'));
    };
  if (ui.creditsBtn)
    ui.creditsBtn.onclick = () => {
      void toggleCredits();
      toast.info('Credits & About');
    };
  if (ui.settingsBtn)
    ui.settingsBtn.onclick = () => {
      settingsPanel.toggle();
    };
  const spaceTravelQuickBtn = document.getElementById('spaceTravelQuickBtn');
  if (spaceTravelQuickBtn) {
    spaceTravelQuickBtn.onclick = () => {
      travelCalc.openModal();
    };
  }
  const cmdPaletteQuickBtn = document.getElementById('cmdPaletteQuickBtn');
  if (cmdPaletteQuickBtn) {
    cmdPaletteQuickBtn.onclick = () => {
      commandPalette.toggle();
    };
  }
  const missionsBtn = document.getElementById('missionsBtn');
  if (missionsBtn)
    missionsBtn.onclick = () => {
      void toggleMissions();
      toast.info(t('toast_astronaut'));
    };
  const spaceMissionsBtn = document.getElementById('spaceMissionsBtn');
  if (spaceMissionsBtn)
    spaceMissionsBtn.onclick = () => {
      void openSpaceMissions();
      toast.info(t('toast_spacereal'));
    };
  const quizBtn = document.getElementById('quizBtn');
  if (quizBtn)
    quizBtn.onclick = () => {
      void toggleQuiz();
    };
  const timeTravelBtn = document.getElementById('timeTravelBtn');
  if (timeTravelBtn)
    timeTravelBtn.onclick = () => {
      void toggleTimeTravel();
    };
  const grandTourBtn = document.getElementById('grandTourBtn');
  if (grandTourBtn)
    grandTourBtn.onclick = () => {
      void toggleGrandTour();
      toast.info(t('toast_grandtour'));
    };
  const observatoryBtn = document.getElementById('observatoryBtn');
  if (observatoryBtn)
    observatoryBtn.onclick = () => {
      void toggleObservatory();
    };
  const systemsBtn = document.getElementById('systemsBtn');
  if (systemsBtn)
    systemsBtn.onclick = () => {
      void toggleSystemsExplorer();
    };

  // Settings panel onChange callback
  settingsPanel.onChange((key, value) => {
    if (key === 'theme') {
      toast.info(value === 'light' ? t('toast_theme_light') : t('toast_theme_dark'));
    } else if (key === 'language') {
      toast.info(value === 'it' ? t('toast_lang_it') : t('toast_lang_en'));
    } else if (key === 'quality') {
      const qualityLabel = (q) =>
        ({
          low: t('quality_low'),
          medium: t('quality_medium'),
          high: t('quality_high'),
          ultra: t('quality_ultra'),
        })[q] || q;
      if (value === 'auto') {
        adaptiveQuality.setAutoScale(true);
        const effectiveQuality = adaptiveQuality.getQualityLevel();
        applyGraphicsQuality(effectiveQuality);
        toast.info(
          `${t('toast_quality')}: ${t('toast_quality_auto')} (${qualityLabel(effectiveQuality)})`
        );
      } else {
        adaptiveQuality.setQualityLevel(value, true);
        applyGraphicsQuality(value);
        toast.info(`${t('toast_quality')}: ${qualityLabel(value)}`);
      }
    } else if (key === 'showFPS') {
      if (hud.el) hud.el.style.display = value ? 'flex' : 'none';
    } else if (key === 'reduceMotion') {
      if (value) {
        particleEffects.hide();
        customCursor.hide();
      } else {
        particleEffects.show();
        customCursor.show();
      }
    } else if (key === 'hud') {
      setNavGridVisible(navGrid, value === 'nav');
      toast.info(value === 'nav' ? t('toast_hud_nav') : t('toast_hud_std'));
    }
  });

  // Applica lo stato iniziale della griglia in base alla preferenza salvata
  setNavGridVisible(navGrid, document.documentElement.getAttribute('data-hud') === 'nav');
  applyInitialURLState();

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__pwaInstallPrompt = e;
    toast.info(t('install_pwa'), 5000);
  });

  showHint(ui, t('hint_controls'), hintTimerRef);
  toast.success(t('toast_ready'), 3000);
  setTimeout(() => onboarding.show(), 500);
  renderer.setAnimationLoop(animate);
}

setTimeout(() => {
  if (!window.__solarStarted) {
    if (loadingScreen) loadingScreen.style.display = 'none';
    startApp();
  }
}, 8000);
