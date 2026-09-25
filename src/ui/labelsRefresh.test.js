// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { refreshLabelLanguage, updateLabels } from './labels.js';
import { setLang } from '../i18n/index.js';

function makeBodies() {
  const pivot = { position: new THREE.Vector3(100, 0, 0) };
  const labelEl = document.createElement('div');
  document.body.appendChild(labelEl);
  return [
    {
      key: 'Earth',
      label: 'Terra',
      labelEn: 'Earth',
      type: 'planet',
      radius: 3.6,
      visualR: 3.6,
      pivot,
      labelEl,
    },
  ];
}

describe('labels', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="labelsLayer"></div>';
    setLang('it');
  });

  it('refreshLabelLanguage applica la lingua preservando il prefisso icona', () => {
    const [body] = makeBodies();
    body.labelEl.dataset.iconPrefix = '🌍 ';
    refreshLabelLanguage([body], 'en');
    expect(body.labelEl.textContent).toBe('🌍 Earth');
    refreshLabelLanguage([body], 'it');
    expect(body.labelEl.textContent).toBe('🌍 Terra');
  });

  it('updateLabels posiziona le etichette visibili senza errori', () => {
    const bodies = makeBodies();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100000);
    camera.position.set(0, 0, 900);
    camera.lookAt(0, 0, 0);
    const ui = {
      labels: { checked: true },
      labelsLayer: document.getElementById('labelsLayer'),
    };
    expect(() => updateLabels(bodies, camera, ui, null)).not.toThrow();
    expect(['block', 'none']).toContain(bodies[0].labelEl.style.display);
  });
});
