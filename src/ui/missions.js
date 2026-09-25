// src/ui/missions.js
// ══════════════════════════════════════════════════════════════════
// GAMIFICATION - MISSIONI EDUCATIVE INTERATTIVE
// "Diventa un astronauta": missioni a tappe con obiettivi
// ══════════════════════════════════════════════════════════════════
import { toast } from './toast.js';
import { getLang, t } from '../i18n/index.js';

const L = (localized) => localized?.[getLang()] ?? localized?.it ?? localized;

export const MISSIONS = [
  {
    id: 'explorer',
    name: { it: '🌍 Esploratore del Sistema Solare', en: '🌍 Solar System Explorer' },
    description: { it: 'Visita tutti e 8 i pianeti principali', en: 'Visit all 8 major planets' },
    icon: '🌍',
    steps: [
      {
        target: 'Mercury',
        label: { it: 'Visita Mercurio', en: 'Visit Mercury' },
        hint: { it: 'Il pianeta più vicino al Sole', en: 'The closest planet to the Sun' },
      },
      {
        target: 'Venus',
        label: { it: 'Visita Venere', en: 'Visit Venus' },
        hint: {
          it: 'Il pianeta più caldo del sistema solare',
          en: 'The hottest planet in the solar system',
        },
      },
      {
        target: 'Earth',
        label: { it: 'Visita la Terra', en: 'Visit Earth' },
        hint: { it: 'La nostra casa', en: 'Our home' },
      },
      {
        target: 'Mars',
        label: { it: 'Visita Marte', en: 'Visit Mars' },
        hint: { it: 'Il Pianeta Rosso', en: 'The Red Planet' },
      },
      {
        target: 'Jupiter',
        label: { it: 'Visita Giove', en: 'Visit Jupiter' },
        hint: { it: 'Il gigante gassoso più grande', en: 'The largest gas giant' },
      },
      {
        target: 'Saturn',
        label: { it: 'Visita Saturno', en: 'Visit Saturn' },
        hint: { it: 'Il pianeta degli anelli', en: 'The ringed planet' },
      },
      {
        target: 'Uranus',
        label: { it: 'Visita Urano', en: 'Visit Uranus' },
        hint: { it: 'Il gigante di ghiaccio inclinato', en: 'The tilted ice giant' },
      },
      {
        target: 'Neptune',
        label: { it: 'Visita Nettuno', en: 'Visit Neptune' },
        hint: { it: 'Il pianeta più lontano', en: 'The farthest planet' },
      },
    ],
    reward: { xp: 200, badge: { it: '🏅 Esploratore', en: '🏅 Explorer' } },
  },
  {
    id: 'moon_hunter',
    name: { it: '🌙 Cacciatore di Lune', en: '🌙 Moon Hunter' },
    description: {
      it: 'Scopri le principali lune del sistema solare',
      en: 'Discover the major moons of the solar system',
    },
    icon: '🌙',
    steps: [
      {
        target: 'Moon',
        label: { it: 'Osserva la Luna', en: 'Observe the Moon' },
        hint: { it: 'La nostra compagna fedele', en: 'Our faithful companion' },
      },
      {
        target: 'Phobos',
        label: { it: 'Scopri Phobos', en: 'Discover Phobos' },
        hint: { it: 'La luna irregolare di Marte', en: 'Mars’ irregular moon' },
      },
      {
        target: 'Io',
        label: { it: 'Osserva Io', en: 'Observe Io' },
        hint: { it: 'La luna più vulcanica', en: 'The most volcanic moon' },
      },
      {
        target: 'Europa',
        label: { it: 'Scopri Europa', en: 'Discover Europa' },
        hint: {
          it: 'Potrebbe avere un oceano sotto la crosta',
          en: 'It may hide an ocean under its crust',
        },
      },
      {
        target: 'Ganymede',
        label: { it: 'Visita Ganimede', en: 'Visit Ganymede' },
        hint: {
          it: 'La luna più grande del sistema solare',
          en: 'The largest moon in the solar system',
        },
      },
      {
        target: 'Titan',
        label: { it: 'Esplora Titano', en: 'Explore Titan' },
        hint: { it: 'Ha laghi di metano liquido', en: 'It has lakes of liquid methane' },
      },
    ],
    reward: { xp: 150, badge: { it: '🌙 Astronomo Lunare', en: '🌙 Lunar Astronomer' } },
  },
  {
    id: 'dwarf_planets',
    name: { it: '❄️ Pianeti Nani', en: '❄️ Dwarf Planets' },
    description: {
      it: 'Scopri i 5 pianeti nani del sistema solare',
      en: 'Discover the 5 dwarf planets of the solar system',
    },
    icon: '❄️',
    steps: [
      {
        target: 'Ceres',
        label: { it: 'Visita Cerere', en: 'Visit Ceres' },
        hint: {
          it: 'Il più grande della fascia asteroidale',
          en: 'The largest in the asteroid belt',
        },
      },
      {
        target: 'Pluto',
        label: { it: 'Scopri Plutone', en: 'Discover Pluto' },
        hint: { it: 'Il pianeta nano più famoso', en: 'The most famous dwarf planet' },
      },
      {
        target: 'Eris',
        label: { it: 'Visita Eris', en: 'Visit Eris' },
        hint: { it: 'Il più massiccio tra i nani', en: 'The most massive dwarf' },
      },
      {
        target: 'Makemake',
        label: { it: 'Scopri Makemake', en: 'Discover Makemake' },
        hint: { it: 'Nella fascia di Kuiper', en: 'In the Kuiper belt' },
      },
      {
        target: 'Haumea',
        label: { it: 'Visita Haumea', en: 'Visit Haumea' },
        hint: { it: 'Ha forma ellissoidale', en: 'It has an ellipsoidal shape' },
      },
    ],
    reward: { xp: 120, badge: { it: '❄️ Esploratore Glaciale', en: '❄️ Glacial Explorer' } },
  },
  {
    id: 'comet_chaser',
    name: { it: '☄️ Inseguitori di Comete', en: '☄️ Comet Chasers' },
    description: {
      it: 'Trova le comete più famose del sistema solare',
      en: 'Find the most famous comets of the solar system',
    },
    icon: '☄️',
    steps: [
      {
        target: 'Halley',
        label: { it: 'Scopri Halley', en: 'Discover Halley' },
        hint: {
          it: 'La cometa più famosa, torna ogni 75 anni',
          en: 'The most famous comet, back every 75 years',
        },
      },
      {
        target: 'HaleBopp',
        label: { it: 'Osserva Hale-Bopp', en: 'Observe Hale-Bopp' },
        hint: {
          it: 'Visibile ad occhio nudo per 18 mesi',
          en: 'Visible to the naked eye for 18 months',
        },
      },
      {
        target: 'Churyumov',
        label: { it: 'Visita 67P', en: 'Visit 67P' },
        hint: { it: 'La cometa esplorata da Rosetta', en: 'The comet explored by Rosetta' },
      },
    ],
    reward: { xp: 100, badge: { it: '☄️ Cacciatore di Comete', en: '☄️ Comet Hunter' } },
  },
  {
    id: 'deep_space',
    name: { it: '🚀 Viaggiatore Spaziale', en: '🚀 Space Traveler' },
    description: {
      it: 'Esplora lo spazio profondo al di fuori del sistema solare',
      en: 'Explore deep space beyond the solar system',
    },
    icon: '🚀',
    steps: [
      {
        target: 'Voyager1',
        label: { it: 'Segui Voyager 1', en: 'Follow Voyager 1' },
        hint: { it: 'La sonda più lontana dalla Terra', en: 'The farthest probe from Earth' },
      },
      {
        target: 'Webb',
        label: { it: 'Scopri James Webb', en: 'Discover James Webb' },
        hint: { it: 'Il telescopio spaziale più potente', en: 'The most powerful space telescope' },
      },
      {
        target: 'ProximaCentauri',
        label: { it: 'Vai a Proxima Centauri', en: 'Go to Proxima Centauri' },
        hint: { it: 'La stella più vicina al Sole', en: 'The closest star to the Sun' },
      },
    ],
    reward: { xp: 180, badge: { it: '🚀 Esploratore Profondo', en: '🚀 Deep Explorer' } },
  },
  {
    id: 'time_traveler',
    name: { it: '⏰ Viaggiatore nel Tempo', en: '⏰ Time Traveler' },
    description: {
      it: 'Usa il Time Travel per saltare tra epoche diverse',
      en: 'Use Time Travel to jump between eras',
    },
    icon: '⏰',
    steps: [
      {
        target: 'timetravel:1969',
        label: { it: 'Vai al 1969', en: 'Go to 1969' },
        hint: { it: "L'uomo cammina sulla Luna", en: 'Humans walk on the Moon' },
      },
      {
        target: 'timetravel:2029',
        label: { it: 'Vai al 2029', en: 'Go to 2029' },
        hint: { it: 'Apophis passerà vicino alla Terra', en: 'Apophis will pass near Earth' },
      },
      {
        target: 'timetravel:2061',
        label: { it: 'Vai al 2061', en: 'Go to 2061' },
        hint: { it: 'Il ritorno della cometa Halley', en: "Halley's Comet returns" },
      },
    ],
    reward: { xp: 100, badge: { it: '⏰ Crononauta', en: '⏰ Chrononaut' } },
  },
];

/**
 * Classe per gestire le missioni gamificate
 */
export class MissionsSystem {
  constructor() {
    this.panel = null;
    this.completedMissions = JSON.parse(
      localStorage.getItem('astralis_completed_missions') || '[]'
    );
    this.missionProgress = JSON.parse(localStorage.getItem('astralis_mission_progress') || '{}');
    this.totalXP = parseInt(localStorage.getItem('astralis_total_xp') || '0');
    this.badges = JSON.parse(localStorage.getItem('astralis_badges') || '[]');
    this.activeMission = null;
  }

  /**
   * Apri/chiudi il pannello missioni
   */
  toggle() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
      return;
    }
    this.show();
  }

  /**
   * Mostra il pannello missioni
   */
  show() {
    this.panel = document.createElement('div');
    this.panel.id = 'gamificationPanel';
    this.panel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 650px; max-height: 85vh; background: rgba(0,0,0,0.92);
      border: 1px solid rgba(100,150,255,0.3); border-radius: 16px;
      padding: 24px; z-index: 1000; overflow-y: auto;
      font-family: 'Space Grotesk', system-ui, sans-serif; color: white;
      backdrop-filter: blur(20px);
    `;

    const totalMissions = MISSIONS.length;
    const completedCount = this.completedMissions.length;

    this.panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="margin:0;font-size:1.4rem;">${t('m_title')}</h2>
        <button id="closeGamification" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;">✕</button>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:20px;">
        <div style="background:rgba(255,255,255,0.05);padding:12px 20px;border-radius:12px;flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:#5bc4cf;">${this.totalXP}</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.5);">${t('m_xp')}</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);padding:12px 20px;border-radius:12px;flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:#a78bfa;">${completedCount}/${totalMissions}</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.5);">${t('m_done_count')}</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);padding:12px 20px;border-radius:12px;flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:#f59e0b;">${this.badges.length}</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.5);">${t('m_badges_count')}</div>
        </div>
      </div>
      <div id="missionCards"></div>
    `;

    const cardsContainer = this.panel.querySelector('#missionCards');
    MISSIONS.forEach((mission) => {
      const isCompleted = this.completedMissions.includes(mission.id);
      const progress = this.missionProgress[mission.id] || 0;
      const totalSteps = mission.steps.length;
      const progressPercent = Math.round((progress / totalSteps) * 100);

      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(255,255,255,0.05); border: 1px solid ${
          isCompleted ? '#44ff88' : 'rgba(255,255,255,0.1)'
        };
        border-radius: 12px; padding: 16px; margin-bottom: 12px; cursor: pointer;
        transition: all 0.3s ease;
      `;
      card.onmouseenter = () => {
        card.style.borderColor = isCompleted ? '#44ff88' : '#5bc4cf';
      };
      card.onmouseleave = () => {
        card.style.borderColor = isCompleted ? '#44ff88' : 'rgba(255,255,255,0.1)';
      };

      const statusBadge = isCompleted
        ? `<span style="background:#44ff88;color:#000;padding:2px 8px;border-radius:8px;font-size:0.7rem;">${t(
            'm_completed_badge'
          )}</span>`
        : `<span style="background:rgba(91,196,207,0.2);color:#5bc4cf;padding:2px 8px;border-radius:8px;font-size:0.7rem;">${progressPercent}%</span>`;

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-size:1rem;">${mission.icon} ${L(mission.name)}</strong>
          ${statusBadge}
        </div>
        <div style="color:rgba(255,255,255,0.6);font-size:0.85rem;margin-bottom:8px;">${L(
          mission.description
        )}</div>
        <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;margin-bottom:8px;">
          <div style="height:100%;width:${progressPercent}%;background:linear-gradient(90deg,#5bc4cf,#a78bfa);border-radius:2px;transition:width 0.3s;"></div>
        </div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);">🏆 ${L(
          mission.reward.badge
        )} • ${mission.reward.xp} XP</div>
      `;

      cardsContainer.appendChild(card);
    });

    this.panel.querySelector('#closeGamification').onclick = () => this.toggle();
    document.body.appendChild(this.panel);
  }

  /**
   * Aggiorna il progresso di una missione quando un corpo celeste viene visitato
   * @param {string} bodyKey - Chiave del corpo celeste visitato
   * @param {Function} selectBodyFn - Funzione per selezionare un corpo celeste
   * @param {Function} jumpToDateFn - Funzione per saltare a una data
   */
  onBodyVisited(bodyKey) {
    MISSIONS.forEach((mission) => {
      if (this.completedMissions.includes(mission.id)) return;

      const currentProgress = this.missionProgress[mission.id] || 0;
      const nextStep = mission.steps[currentProgress];

      if (!nextStep) return;

      // Controlla se il step corrente è un target temporaneo
      if (nextStep.target.startsWith('timetravel:')) {
        // Questo viene gestito separatamente
        return;
      }

      if (nextStep.target === bodyKey) {
        // Step completato!
        this.missionProgress[mission.id] = currentProgress + 1;

        const newProgress = this.missionProgress[mission.id];
        const totalSteps = mission.steps.length;

        if (newProgress >= totalSteps) {
          // Missione completata!
          this.completedMissions.push(mission.id);
          this.totalXP += mission.reward.xp;
          this.badges.push(mission.reward.badge);

          // Salva nel localStorage
          this.save();

          // Mostra notifica
          toast.success(
            `🎉 ${t('m_done')}: ${L(mission.name)}! ${L(mission.reward.badge)} +${
              mission.reward.xp
            } XP`
          );
        } else {
          // Step completato, prossimo step
          const nextStepLabel = L(mission.steps[newProgress]?.label) || t('m_next_goal');
          toast.info(`✅ ${L(nextStep.label)} ${t('m_step_done')} ${nextStepLabel}`);
          this.save();
        }
      }
    });
  }

  /**
   * Gestisce il time travel per le missioni
   * @param {number} year - Anno visitato
   */
  onTimeTravel(year) {
    MISSIONS.forEach((mission) => {
      if (this.completedMissions.includes(mission.id)) return;

      const currentProgress = this.missionProgress[mission.id] || 0;
      const nextStep = mission.steps[currentProgress];

      if (!nextStep || !nextStep.target.startsWith('timetravel:')) return;

      const targetYear = parseInt(nextStep.target.split(':')[1]);
      if (Math.abs(year - targetYear) <= 5) {
        // Anno visitato con tolleranza di 5 anni
        this.missionProgress[mission.id] = currentProgress + 1;

        if (this.missionProgress[mission.id] >= mission.steps.length) {
          this.completedMissions.push(mission.id);
          this.totalXP += mission.reward.xp;
          this.badges.push(mission.reward.badge);
          this.save();
          toast.success(
            `🎉 ${t('m_done')}: ${L(mission.name)}! ${L(mission.reward.badge)} +${
              mission.reward.xp
            } XP`
          );
        } else {
          this.save();
          toast.info(
            `${t('m_time_done')} ${L(mission.steps[this.missionProgress[mission.id]]?.label)}`
          );
        }
      }
    });
  }

  /**
   * Salva lo stato nel localStorage
   */
  save() {
    localStorage.setItem('astralis_completed_missions', JSON.stringify(this.completedMissions));
    localStorage.setItem('astralis_mission_progress', JSON.stringify(this.missionProgress));
    localStorage.setItem('astralis_total_xp', this.totalXP.toString());
    localStorage.setItem('astralis_badges', JSON.stringify(this.badges));
  }
}
