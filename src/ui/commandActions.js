/**
 * commandActions — registrazione delle azioni della Command Palette.
 * Estratto da main.js: stessa logica, dipendenze iniettate via `deps`.
 *
 * deps: {
 *   ui, allBodies, CAM, commandPalette, themeManager, soundManager, screenshot,
 *   travelCalc, viewPresets, shortcutsPanel, urlState, constellationManager,
 *   meteorShowerManager, eclipseSimulator, minimap,
 *   getSelectedBody(), selectBody(body), exitFly(),
 *   getGalaxyMapMode(), getLocalBubbleMode(), getCustomDate(),
 *   setCamLabel(mode),
 *   toggleTimeTravel(), toggleGrandTour(), toggleSystemsExplorer(),
 *   toggleQuiz(), getLang(), t(key)
 * }
 */
import { toast } from './toast.js';

export const COMMAND_ACTION_KEYS = [
  'pause',
  'resume',
  'reset_cam',
  'toggle_orbits',
  'toggle_labels',
  'toggle_constellations',
  'toggle_theme',
  'help',
  'timetravel',
  'eclipses',
  'meteors',
  'grand_tour',
  'systems',
  'travel',
  'toggle_minimap',
  'screenshot',
  'share',
  'sound',
  'quiz',
  'home',
  'system',
  'goToBody',
];

export function registerCommandActions(deps) {
  deps.commandPalette.registerActions({
    pause: () => {
      if (deps.ui.toggle) deps.ui.toggle.click();
    },
    resume: () => {
      if (deps.ui.toggle) deps.ui.toggle.click();
    },
    reset_cam: () => {
      if (deps.ui.resetCam) deps.ui.resetCam.click();
    },
    toggle_orbits: () => {
      if (deps.ui.orbits) {
        deps.ui.orbits.checked = !deps.ui.orbits.checked;
      }
    },
    toggle_labels: () => {
      if (deps.ui.labels) {
        deps.ui.labels.checked = !deps.ui.labels.checked;
      }
    },
    toggle_constellations: () => {
      const visible = deps.constellationManager.toggle();
      const cb = document.getElementById('constellations');
      if (cb) cb.checked = visible;
      toast.info(visible ? deps.t('toggle_const_on') : deps.t('toggle_const_off'));
    },
    toggle_theme: () => {
      deps.themeManager.toggle();
    },
    help: () => deps.shortcutsPanel.toggle(),
    timetravel: () => {
      deps.toggleTimeTravel();
    },
    eclipses: () => {
      const events = deps.eclipseSimulator.getEvents();
      if (events.length > 0) {
        const nextEv = events[0];
        deps.eclipseSimulator.jumpToEclipse(nextEv.key);
        toast.info(`${deps.t('eclipse_toast')}: ${nextEv.displayName}`);
      }
    },
    meteors: () => {
      const visible = deps.meteorShowerManager.toggle();
      toast.info(visible ? deps.t('toggle_meteor_on') : deps.t('toggle_meteor_off'));
    },
    grand_tour: () => {
      deps.toggleGrandTour();
    },
    systems: () => {
      deps.toggleSystemsExplorer();
    },
    travel: () => {
      deps.travelCalc.open(deps.getSelectedBody());
    },
    toggle_minimap: () => {
      const visible = deps.minimap.toggle();
      const cb = document.getElementById('minimapToggle');
      if (cb) cb.checked = visible;
      toast.info(visible ? deps.t('toggle_minimap_on') : deps.t('toggle_minimap_off'));
    },
    screenshot: () => deps.screenshot.capture(),
    share: () => {
      const view = deps.getGalaxyMapMode()
        ? 'galaxy'
        : deps.getLocalBubbleMode()
        ? 'local-bubble'
        : undefined;
      deps.urlState.setMany({
        body: deps.getSelectedBody()?.key,
        view,
        date: (deps.getCustomDate() || new Date()).toISOString(),
        speed: deps.ui.speed?.value,
        theme: deps.themeManager.get(),
        lang: deps.getLang(),
      });
      deps.urlState.copyShareURL();
    },
    sound: () => deps.soundManager.toggle(),
    quiz: () => {
      deps.toggleQuiz();
    },
    home: () => deps.viewPresets._build && deps.viewPresets.show(),
    system: () => {
      deps.exitFly();
      deps.CAM.tRadius = 800;
      deps.CAM.tPhi = 1.2;
      deps.CAM.tPivot.set(0, 0, 0);
      deps.setCamLabel('orbit');
    },
    goToBody: (b) => {
      const body = deps.allBodies.find((x) => x.key === b.key || x.label === b.name);
      if (body) deps.selectBody(body);
    },
  });
}
