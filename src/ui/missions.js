// src/ui/missions.js
// ══════════════════════════════════════════════════════════════════
// GAMIFICATION - MISSIONI EDUCATIVE INTERATTIVE
// "Diventa un astronauta": missioni a tappe con obiettivi
// ══════════════════════════════════════════════════════════════════

const MISSIONS = [
  {
    id: 'explorer',
    name: '🌍 Esploratore del Sistema Solare',
    description: 'Visita tutti e 8 i pianeti principali',
    icon: '🌍',
    steps: [
      { target: 'Mercury', label: 'Visita Mercurio', hint: 'Il pianeta più vicino al Sole' },
      { target: 'Venus', label: 'Visita Venere', hint: 'Il pianeta più caldo del sistema solare' },
      { target: 'Earth', label: 'Visita la Terra', hint: 'La nostra casa' },
      { target: 'Mars', label: 'Visita Marte', hint: 'Il Pianeta Rosso' },
      { target: 'Jupiter', label: 'Visita Giove', hint: 'Il gigante gassoso più grande' },
      { target: 'Saturn', label: 'Visita Saturno', hint: 'Il pianeta degli anelli' },
      { target: 'Uranus', label: 'Visita Urano', hint: 'Il gigante di ghiaccio inclinato' },
      { target: 'Neptune', label: 'Visita Nettuno', hint: 'Il pianeta più lontano' },
    ],
    reward: { xp: 200, badge: '🏅 Esploratore' },
  },
  {
    id: 'moon_hunter',
    name: '🌙 Cacciatore di Lune',
    description: 'Scopri le principali lune del sistema solare',
    icon: '🌙',
    steps: [
      { target: 'Moon', label: 'Osserva la Luna', hint: 'La nostra compagna fedele' },
      { target: 'Phobos', label: 'Scopri Phobos', hint: 'La luna irregolare di Marte' },
      { target: 'Io', label: 'Osserva Io', hint: 'La luna più vulcanica' },
      { target: 'Europa', label: 'Scopri Europa', hint: 'Potrebbe avere un oceano sotto la crosta' },
      { target: 'Ganymede', label: 'Visita Ganimede', hint: 'La luna più grande del sistema solare' },
      { target: 'Titan', label: 'Esplora Titano', hint: 'Ha laghi di metano liquido' },
    ],
    reward: { xp: 150, badge: '🌙 Astronomo Lunare' },
  },
  {
    id: 'dwarf_planets',
    name: '❄️ Pianeti Nani',
    description: 'Scopri i 5 pianeti nani del sistema solare',
    icon: '❄️',
    steps: [
      { target: 'Ceres', label: 'Visita Cerere', hint: 'Il più grande della fascia asteroidale' },
      { target: 'Pluto', label: 'Scopri Plutone', hint: 'Il pianeta nano più famoso' },
      { target: 'Eris', label: 'Visita Eris', hint: 'Il più massiccio tra i nani' },
      { target: 'Makemake', label: 'Scopri Makemake', hint: 'Nella fascia di Kuiper' },
      { target: 'Haumea', label: 'Visita Haumea', hint: 'Ha forma ellissoidale' },
    ],
    reward: { xp: 120, badge: '❄️ Esploratore Glaciale' },
  },
  {
    id: 'comet_chaser',
    name: '☄️ Inseguitori di Comete',
    description: 'Trova le comete più famose del sistema solare',
    icon: '☄️',
    steps: [
      { target: 'Halley', label: 'Scopri Halley', hint: 'La cometa più famosa, torna ogni 75 anni' },
      { target: 'HaleBopp', label: 'Osserva Hale-Bopp', hint: 'Visibile ad occhio nudo per 18 mesi' },
      { target: 'Churyumov', label: 'Visita 67P', hint: 'La cometa esplorata da Rosetta' },
    ],
    reward: { xp: 100, badge: '☄️ Cacciatore di Comete' },
  },
  {
    id: 'deep_space',
    name: '🚀 Viaggiatore Spaziale',
    description: 'Esplora lo spazio profondo al di fuori del sistema solare',
    icon: '🚀',
    steps: [
      { target: 'Voyager1', label: 'Segui Voyager 1', hint: 'La sonda più lontana dalla Terra' },
      { target: 'Webb', label: 'Scopri James Webb', hint: 'Il telescopio spaziale più potente' },
      { target: 'ProximaCentauri', label: 'Vai a Proxima Centauri', hint: 'La stella più vicina al Sole' },
    ],
    reward: { xp: 180, badge: '🚀 Esploratore Profondo' },
  },
  {
    id: 'time_traveler',
    name: '⏰ Viaggiatore nel Tempo',
    description: 'Usa il Time Travel per saltare tra epoche diverse',
    icon: '⏰',
    steps: [
      { target: 'timetravel:1969', label: 'Vai al 1969', hint: 'L\'uomo cammina sulla Luna' },
      { target: 'timetravel:2029', label: 'Vai al 2029', hint: 'Apophis passerà vicino alla Terra' },
      { target: 'timetravel:2061', label: 'Vai al 2061', hint: 'Il ritorno della cometa Halley' },
    ],
    reward: { xp: 100, badge: '⏰ Crononauta' },
  },
];

/**
 * Classe per gestire le missioni gamificate
 */
export class MissionsSystem {
  constructor() {
    this.panel = null;
    this.completedMissions = JSON.parse(localStorage.getItem('astralis_completed_missions') || '[]');
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
        <h2 style="margin:0;font-size:1.4rem;">🎮 Missioni Astronautiche</h2>
        <button id="closeGamification" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;">✕</button>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:20px;">
        <div style="background:rgba(255,255,255,0.05);padding:12px 20px;border-radius:12px;flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:#5bc4cf;">${this.totalXP}</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.5);">XP Totali</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);padding:12px 20px;border-radius:12px;flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:#a78bfa;">${completedCount}/${totalMissions}</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.5);">Missioni Completate</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);padding:12px 20px;border-radius:12px;flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:#f59e0b;">${this.badges.length}</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.5);">Badge Ottenuti</div>
        </div>
      </div>
      <div id="missionCards"></div>
    `;

    const cardsContainer = this.panel.querySelector('#missionCards');
    MISSIONS.forEach(mission => {
      const isCompleted = this.completedMissions.includes(mission.id);
      const progress = this.missionProgress[mission.id] || 0;
      const totalSteps = mission.steps.length;
      const progressPercent = Math.round((progress / totalSteps) * 100);

      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(255,255,255,0.05); border: 1px solid ${isCompleted ? '#44ff88' : 'rgba(255,255,255,0.1)'};
        border-radius: 12px; padding: 16px; margin-bottom: 12px; cursor: pointer;
        transition: all 0.3s ease;
      `;
      card.onmouseenter = () => { card.style.borderColor = isCompleted ? '#44ff88' : '#5bc4cf'; };
      card.onmouseleave = () => { card.style.borderColor = isCompleted ? '#44ff88' : 'rgba(255,255,255,0.1)'; };

      const statusBadge = isCompleted 
        ? '<span style="background:#44ff88;color:#000;padding:2px 8px;border-radius:8px;font-size:0.7rem;">✅ COMPLETATA</span>'
        : `<span style="background:rgba(91,196,207,0.2);color:#5bc4cf;padding:2px 8px;border-radius:8px;font-size:0.7rem;">${progressPercent}%</span>`;

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-size:1rem;">${mission.icon} ${mission.name}</strong>
          ${statusBadge}
        </div>
        <div style="color:rgba(255,255,255,0.6);font-size:0.85rem;margin-bottom:8px;">${mission.description}</div>
        <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;margin-bottom:8px;">
          <div style="height:100%;width:${progressPercent}%;background:linear-gradient(90deg,#5bc4cf,#a78bfa);border-radius:2px;transition:width 0.3s;"></div>
        </div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);">🏆 ${mission.reward.badge} • ${mission.reward.xp} XP</div>
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
    MISSIONS.forEach(mission => {
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
          if (window.toast) {
            window.toast.success(`🎉 Missione completata: ${mission.name}! ${mission.reward.badge} +${mission.reward.xp} XP`);
          }
        } else {
          // Step completato, prossimo step
          const nextStepLabel = mission.steps[newProgress]?.label || 'Prossimo obiettivo';
          if (window.toast) {
            window.toast.info(`✅ ${nextStep.label} completato! Prossimo: ${nextStepLabel}`);
          }
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
    MISSIONS.forEach(mission => {
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
          if (window.toast) {
            window.toast.success(`🎉 Missione completata: ${mission.name}! ${mission.reward.badge} +${mission.reward.xp} XP`);
          }
        } else {
          this.save();
          if (window.toast) {
            window.toast.info(`✅ Step temporale completato! Prossimo: ${mission.steps[this.missionProgress[mission.id]]?.label}`);
          }
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