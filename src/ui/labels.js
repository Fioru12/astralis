import * as THREE from 'three';
import { getBodyLabel } from '../data/celestialData.js';

const SUN_OCC_R = 24;

/**
 * Ri-applica la lingua corrente alle etichette 3D già create.
 * Le label con icona usano `dataset.iconPrefix` impostato in creazione.
 */
export function refreshLabelLanguage(allBodies, lang) {
  for (const b of allBodies || []) {
    if (!b?.labelEl) continue;
    const prefix = b.labelEl.dataset?.iconPrefix || '';
    b.labelEl.textContent = prefix + getBodyLabel(b, lang);
  }
}

const proj = new THREE.Vector3();

function isOccluded(wp, camera) {
  const C = camera.position.clone(),
    v = wp.clone().sub(C);
  const vv = v.dot(v);
  if (vv < 1e-12) return false;
  const t = -C.dot(v) / vv;
  if (t <= 0 || t >= 1) return false;
  return C.clone().add(v.multiplyScalar(t)).length() < SUN_OCC_R;
}

export function updateLabels(allBodies, camera, ui, selectedBody) {
  const show = ui.labels ? ui.labels.checked : true;
  if (ui.labelsLayer) ui.labelsLayer.style.display = show ? 'block' : 'none';
  if (!show) return;

  const occupied = [];
  const closeSunFocus =
    selectedBody?.key === 'Sun' && camera.position.distanceTo(selectedBody.pivot.position) < 260;
  allBodies.forEach((b) => {
    if (!b.labelEl || !b.pivot) return;
    if (closeSunFocus && b.key !== 'Sun') {
      b.labelEl.style.display = 'none';
      return;
    }
    proj.copy(b.pivot.position).project(camera);
    const inV = proj.z < 1 && proj.z > -1 && Math.abs(proj.x) < 1 && Math.abs(proj.y) < 1;
    const occ = isOccluded(b.pivot.position.clone(), camera);
    const distance = camera.position.distanceTo(b.pivot.position);
    const isMajor = ['planet', 'dwarf', 'star'].includes(b.type);
    const isSelected = selectedBody?.key === b.key;
    const hasDetailPriority = isMajor || isSelected || distance < Math.max(500, b.visualR * 120);
    const x = (proj.x * 0.5 + 0.5) * innerWidth;
    const y = (-0.5 * proj.y + 0.5) * innerHeight - 20;
    const collides =
      !isSelected && occupied.some((box) => Math.abs(box.x - x) < 72 && Math.abs(box.y - y) < 24);
    const visible = inV && !occ && hasDetailPriority && !collides;
    b.labelEl.style.display = visible ? 'block' : 'none';
    if (visible) {
      b.labelEl.style.left = x + 'px';
      b.labelEl.style.top = y + 'px';
      b.labelEl.classList.toggle('label-selected', selectedBody?.key === b.key);
      occupied.push({ x, y });
    }
  });
}
