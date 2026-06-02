/**
 * Space Quiz - Domande didattiche interattive
 */
import { t } from '../i18n/index.js';

const QUESTIONS = [
  { q: 'Pianeta piu grande?', options: ['Saturno', 'Giove', 'Nettuno', 'Urano'], correct: 1, explain: 'Giove ha diametro ~140.000 km.' },
  { q: 'Anno su Mercurio in giorni?', options: ['88', '365', '225', '687'], correct: 0, explain: '88 giorni terrestri.' },
  { q: 'Pianeta con rotazione piu lenta?', options: ['Giove', 'Saturno', 'Venere', 'Mercurio'], correct: 2, explain: 'Venere: 243 giorni.' },
  { q: 'Quante lune ha Giove?', options: ['4', '12', '50', '95+'], correct: 3, explain: 'Oltre 95 lune confermate.' },
  { q: 'Corpo piu grande fascia asteroidi?', options: ['Vesta', 'Cerere', 'Pallade', 'Hygea'], correct: 1, explain: 'Cerere, riclassificato nano.' },
  { q: 'Distanza Nettuno in UA?', options: ['10', '20', '30', '50'], correct: 2, explain: 'Circa 30 UA.' },
  { q: 'Missione atterrata su Titano?', options: ['Voyager 1', 'Huygens', 'Galileo', 'Cassini'], correct: 1, explain: 'Huygens nel 2005.' },
  { q: 'Peso 1kg su Marte?', options: ['0.38 kg', '0.6 kg', '1.0 kg', '2.3 kg'], correct: 0, explain: '38% gravita terrestre.' },
  { q: 'Periodo rivoluzione Plutone?', options: ['12 anni', '48 anni', '124 anni', '248 anni'], correct: 3, explain: 'Ben 248 anni.' },
  { q: 'Esopianeti confermati?', options: ['500', '2000', '5000+', '50000'], correct: 2, explain: 'Oltre 5000 confermati NASA.' },
];

export class Quiz {
  constructor() { this.isOpen = false; this.panel = null; this.currentQ = 0; this.score = 0; this.answered = false; }
  toggle() { this.isOpen ? this.hide() : this.show(); }
  show() {
    if (this.panel) return;
    this._build();
    this._render();
    this.isOpen = true;
  }
  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    setTimeout(() => { this.panel?.remove(); this.panel = null; }, 220);
    this.isOpen = false;
  }
  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'quizPanel';
    Object.assign(this.panel.style, {
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 'min(480px, 92vw)', padding: '24px',
      background: 'rgba(8, 10, 20, 0.97)', backdropFilter: 'blur(24px)',
      border: '1px solid rgba(91,196,207,0.3)', borderRadius: '20px',
      boxShadow: '0 30px 80px rgba(0,0,0,0.7)', color: '#e4eaf8',
      zIndex: '9990', opacity: '0', transition: 'opacity 0.22s ease',
    });
    document.body.appendChild(this.panel);
  }
  _render() {
    if (this.currentQ >= QUESTIONS.length) { this._results(); return; }
    const q = QUESTIONS[this.currentQ];
    this.answered = false;
    this.panel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
      <h2 style="margin:0;font-size:1.1rem;font-weight:800;color:#5bc4cf;">${t('quiz_title')}</h2>
      <button id="qClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);color:rgba(228,234,248,0.7);width:28px;height:28px;border-radius:50%;cursor:pointer;">X</button>
    </div>
    <div style="font-size:11px;color:rgba(228,234,248,0.5);margin-bottom:10px;">${t('quiz_score', { score: this.score, total: QUESTIONS.length })}</div>
    <div style="font-size:15px;line-height:1.5;margin-bottom:18px;">${q.q}</div>
    <div id="qOpts" style="display:flex;flex-direction:column;gap:8px;">${q.options.map((o, i) =>
      `<button data-q="${i}" style="padding:11px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;cursor:pointer;color:#e4eaf8;font-size:13px;text-align:left;">${o}</button>`
    ).join('')}</div>
    <div id="qExplain" style="margin-top:14px;display:none;padding:10px;background:rgba(91,196,207,0.08);border-left:3px solid #5bc4cf;border-radius:6px;font-size:12.5px;color:rgba(228,234,248,0.85);"></div>
    <button id="qNext" style="display:none;margin-top:12px;width:100%;padding:10px;background:linear-gradient(135deg,#5bc4cf,#8be0ea);border:none;color:#000;border-radius:8px;cursor:pointer;font-weight:700;">${t('quiz_next')}</button>`;
    this.panel.querySelector('#qClose').onclick = () => this.hide();
    this.panel.querySelectorAll('[data-q]').forEach(btn => {
      btn.onclick = () => this._answer(parseInt(btn.dataset.q), q);
    });
  }
  _answer(idx, q) {
    if (this.answered) return;
    this.answered = true;
    const correct = idx === q.correct;
    if (correct) this.score++;
    this.panel.querySelectorAll('[data-q]').forEach((b, i) => {
      b.style.background = i === q.correct ? 'rgba(72,200,100,0.18)' : (i === idx ? 'rgba(220,80,80,0.18)' : 'rgba(255,255,255,0.04)');
      b.style.borderColor = i === q.correct ? '#48c864' : (i === idx ? '#dc5050' : 'rgba(255,255,255,0.1)');
      b.style.cursor = 'default';
      b.onclick = null;
    });
    const exp = this.panel.querySelector('#qExplain');
    exp.style.display = 'block';
    exp.textContent = (correct ? t('quiz_correct') + ' ' : t('quiz_wrong') + ' ') + q.explain;
    this.panel.querySelector('#qNext').style.display = 'block';
    this.panel.querySelector('#qNext').onclick = () => { this.currentQ++; this._render(); };
  }
  _results() {
    const pct = Math.round((this.score / QUESTIONS.length) * 100);
    this.panel.innerHTML = `<div style="text-align:center;padding:20px 0;">
      <div style="font-size:3rem;margin-bottom:10px;">${pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '🚀'}</div>
      <h2 style="margin:0 0 10px;color:#5bc4cf;">${t('quiz_score', { score: this.score, total: QUESTIONS.length })}</h2>
      <p style="margin:0 0 18px;color:rgba(228,234,248,0.7);">${pct}%</p>
      <button id="qRestart" style="padding:10px 20px;background:linear-gradient(135deg,#5bc4cf,#8be0ea);border:none;color:#000;border-radius:8px;cursor:pointer;font-weight:700;margin-right:8px;">Riprova</button>
      <button id="qClose" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);color:#e4eaf8;border-radius:8px;cursor:pointer;">${t('close')}</button>
    </div>`;
    this.panel.querySelector('#qRestart').onclick = () => { this.currentQ = 0; this.score = 0; this._render(); };
    this.panel.querySelector('#qClose').onclick = () => this.hide();
  }
}
