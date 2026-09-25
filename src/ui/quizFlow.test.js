// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QUESTIONS, Quiz } from './quiz.js';
import { setLang } from '../i18n/index.js';

describe('Quiz flow', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setLang('it');
    vi.useFakeTimers();
  });

  it('risponde giusto/sbagliato e mostra il punteggio finale', () => {
    const quiz = new Quiz();
    quiz.toggle();
    expect(document.getElementById('quizPanel')).not.toBeNull();
    // Q1: correct = 1
    document.querySelectorAll('#qOpts button')[1].click();
    expect(quiz.score).toBe(1);
    expect(document.getElementById('qExplain').textContent).toContain('Corretto');
    document.getElementById('qNext').click();
    // Q2: correct = 0, sbaglio con 2
    document.querySelectorAll('#qOpts button')[2].click();
    expect(quiz.score).toBe(1);
    expect(document.getElementById('qExplain').textContent).toContain('Sbagliato');
    quiz.currentQ = QUESTIONS.length;
    quiz._render();
    expect(document.getElementById('qRestart')).not.toBeNull();
    document.getElementById('qRestart').click();
    expect(quiz.score).toBe(0);
    expect(quiz.currentQ).toBe(0);
    vi.useRealTimers();
  });

  it('rende le domande nella lingua corrente', () => {
    setLang('en');
    const quiz = new Quiz();
    quiz.toggle();
    expect(document.querySelector('#quizPanel').textContent).toContain('Largest planet?');
    setLang('it');
  });
});
