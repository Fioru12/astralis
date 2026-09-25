/**
 * lazyFeatures — caricamento pigro dei pannelli secondari.
 * Estratto da main.js per ridurre il punto di composizione: ogni feature
 * viene importata dinamicamente solo alla prima apertura e poi riusata.
 *
 * Il contesto `ctx` inietta le dipendenze di main.js (nessun import circolare):
 * {
 *   scene, camera, renderer, allBodies, CAM,
 *   getSelectedBody(), selectBody(body), exitFly(),
 *   exitGalaxyMapIfActive(), setCamLabel(mode),
 *   setCustomDate(date), importers? (solo test)
 * }
 */
import * as THREE from 'three';
import { TimeTravel } from './timeTravel.js';
import { toast } from './toast.js';
import { getLang } from '../i18n/index.js';
import { getBodyLabel } from '../data/celestialData.js';

const defaultImporters = {
  news: () => import('./spaceNews.js'),
  quiz: () => import('./quiz.js'),
  gravity: () => import('./gravitySandbox.js'),
  grandTour: () => import('../core/grandTour.js'),
  systemsExplorer: () => import('./systemsExplorer.js'),
  comparison: () => import('./comparisonMode.js'),
  credits: () => import('./credits.js'),
  missions: () => import('./missions.js'),
  spaceMissions: () => import('../core/spaceMissions.js'),
  bookmarks: () => import('./bookmarks.js'),
  observatory: () => import('../core/observatory.js'),
  systemInspector: () => import('./systemModal.js'),
};

export function createLazyFeatures(ctx) {
  const importers = { ...defaultImporters, ...(ctx.importers || {}) };
  const cache = {};
  function getFeature(name) {
    if (!cache[name]) cache[name] = importers[name]();
    return cache[name];
  }

  let comparisonMode = null;
  let bookmarks = null;
  let observatory = null;
  let missions = null;
  let systemInspectorInstance = null;

  async function toggleSpaceNews() {
    const { SpaceNews } = await getFeature('news');
    (cache.newsInstance ??= new SpaceNews()).toggle();
  }

  async function toggleQuiz() {
    const { Quiz } = await getFeature('quiz');
    (cache.quizInstance ??= new Quiz()).toggle();
  }

  function toggleTimeTravel() {
    (cache.timeTravelInstance ??= new TimeTravel({
      onDateChange: (d) => {
        ctx.setCustomDate(d);
      },
    })).toggle();
  }

  async function toggleGravitySandbox() {
    const { GravitySandbox } = await getFeature('gravity');
    (cache.gravityInstance ??= new GravitySandbox(ctx.scene)).toggle();
  }

  async function toggleGrandTour() {
    const { GrandTour } = await getFeature('grandTour');
    (cache.grandTourInstance ??= new GrandTour({
      allBodies: ctx.allBodies,
      onSelectBody: (body, distance) => {
        ctx.selectBody(body);
        if (distance) {
          ctx.CAM.tRadius = distance;
        }
      },
    })).toggle();
  }

  async function openSystemInspector(sysKey = 'Trappist1') {
    const { SystemInspectorModal } = await getFeature('systemInspector');
    systemInspectorInstance ??= new SystemInspectorModal({
      onFlyToPlanet: (exo) => {
        const exoBody = ctx.allBodies.find(
          (b) => b.key === exo.id || b.name === exo.name || b.label === exo.name
        );
        if (exoBody) {
          ctx.selectBody(exoBody);
        } else {
          const hostStar = ctx.allBodies.find(
            (b) => b.key && b.key.toLowerCase().includes(exo.id.split('_')[0])
          );
          if (hostStar) ctx.selectBody(hostStar);
        }
      },
    });
    systemInspectorInstance.open(sysKey);
  }

  async function toggleSystemsExplorer() {
    const { SystemsExplorer } = await getFeature('systemsExplorer');
    (cache.systemsExplorerInstance ??= new SystemsExplorer({
      allBodies: ctx.allBodies,
      onWarpJump: (targetStar, sysKey) => {
        ctx.exitFly();
        ctx.exitGalaxyMapIfActive();
        if (targetStar.pivot) {
          ctx.CAM.tPivot.copy(targetStar.pivot.position);
        } else {
          ctx.CAM.tPivot.set(0, 0, 0);
        }
        ctx.CAM.tRadius =
          targetStar.key === 'Sun'
            ? 900
            : targetStar.radius
            ? Math.max(targetStar.radius * 25, 180)
            : 220;
        ctx.CAM.tTheta = 0.95;
        ctx.CAM.tPhi = 1.1;
        ctx.CAM.followBody = null;
        ctx.setCamLabel('star');
        ctx.selectBody(targetStar);
        toast.info(
          `Salto Iperspaziale completato: ${
            getBodyLabel(targetStar, getLang()) || targetStar.name
          }`,
          4000
        );
        if (sysKey && sysKey !== 'SolarSystem') {
          setTimeout(() => {
            openSystemInspector(sysKey);
          }, 1250);
        }
      },
      onInspectSystem: (sysKey) => {
        openSystemInspector(sysKey);
      },
    })).toggle();
  }

  async function toggleComparison() {
    const { ComparisonMode } = await getFeature('comparison');
    comparisonMode ??= new ComparisonMode(ctx.allBodies);
    comparisonMode.toggle();
  }

  async function toggleCredits() {
    const { creditsPage } = await getFeature('credits');
    creditsPage.toggle();
  }

  async function toggleMissions() {
    const { MissionsSystem } = await getFeature('missions');
    missions ??= new MissionsSystem();
    missions.toggle();
  }

  async function openSpaceMissions() {
    const { showMissionsPanel } = await getFeature('spaceMissions');
    showMissionsPanel();
  }

  async function getBookmarks() {
    const { CameraBookmarks } = await getFeature('bookmarks');
    return (bookmarks ??= new CameraBookmarks());
  }

  async function getObservatory() {
    const { Observatory } = await getFeature('observatory');
    return (observatory ??= new Observatory(ctx.scene, ctx.camera, ctx.renderer));
  }

  async function toggleObservatory() {
    const button = document.getElementById('observatoryBtn');
    const selectedBody = ctx.getSelectedBody();
    if (!selectedBody || !['planet', 'dwarf'].includes(selectedBody.type)) {
      if (observatory?.active) observatory.exit();
      else toast.warning('Seleziona prima un pianeta per atterrare!');
      button?.setAttribute('aria-pressed', 'false');
      return;
    }
    const tool = await getObservatory();
    const sunBody = ctx.allBodies.find((b) => b.key === 'Sun');
    tool.toggle(selectedBody, sunBody ? sunBody.pivot.position : new THREE.Vector3());
    button?.setAttribute('aria-pressed', String(tool.active));
  }

  // Accessori sincroni per i punti caldi (selectBody, Escape, mousemove,
  // render loop): non creano le istanze, restituiscono null se mai aperte.
  function getMissionsIfCreated() {
    return missions;
  }

  function getObservatoryIfCreated() {
    return observatory;
  }

  return {
    toggleSpaceNews,
    toggleQuiz,
    toggleTimeTravel,
    toggleGravitySandbox,
    toggleGrandTour,
    openSystemInspector,
    toggleSystemsExplorer,
    toggleComparison,
    toggleCredits,
    toggleMissions,
    openSpaceMissions,
    getBookmarks,
    getObservatory,
    getMissionsIfCreated,
    getObservatoryIfCreated,
    toggleObservatory,
  };
}
