import * as THREE from 'three';

const SUN_OCC_R = 24;

const proj = new THREE.Vector3();

function isOccluded(wp, camera) {
  const C = camera.position.clone(), v = wp.clone().sub(C);
  const vv = v.dot(v);
  if (vv < 1e-12) return false;
  const t = -(C.dot(v)) / vv;
  if (t <= 0 || t >= 1) return false;
  return C.clone().add(v.multiplyScalar(t)).length() < SUN_OCC_R;
}

export function updateLabels(allBodies, camera, ui, selectedBody) {
  const show = ui.labels ? ui.labels.checked : true;
  if (ui.labelsLayer) ui.labelsLayer.style.display = show ? 'block' : 'none';
  if (!show) return;

  allBodies.forEach(b => {
    if (!b.labelEl || !b.pivot) return;
    proj.copy(b.pivot.position).project(camera);
    const inV = proj.z < 1 && proj.z > -1 && Math.abs(proj.x) < 1 && Math.abs(proj.y) < 1;
    const occ = isOccluded(b.pivot.position.clone(), camera);
    b.labelEl.style.display = (inV && !occ) ? 'block' : 'none';
    if (inV && !occ) {
      b.labelEl.style.left = ((proj.x * 0.5 + 0.5) * innerWidth) + 'px';
      b.labelEl.style.top = ((-0.5 * proj.y + 0.5) * innerHeight - 20) + 'px';
      b.labelEl.classList.toggle('label-selected', selectedBody?.key === b.key);
    }
  });
}
