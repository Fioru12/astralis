import * as THREE from 'three';
import { SEG, DEG, AU } from '../utils/constants.js';
import { makeCanvasSprite } from '../utils/helpers.js';

const TAIL_OFF = Array.from({ length: 80 }, () => ({
  ox: (Math.random() - 0.5) * 2,
  oz: (Math.random() - 0.5) * 2,
  oy: (Math.random() - 0.5) * 0.5,
}));

export function cometVisualA(def) {
  const q = def.a * (1 - def.e);
  return Math.min(q * AU * (1 / (1 - def.e)), 1200);
}

export function cometPosFromAngle(def, angle) {
  const a = cometVisualA(def),
    e = def.e,
    b = a * Math.sqrt(Math.max(0, 1 - e * e));
  const xP = a * (Math.cos(angle) - e),
    yP = b * Math.sin(angle);
  const wR = def.w * DEG,
    OR = def.O * DEG,
    IR = def.I * DEG;
  const cw = Math.cos(wR),
    sw = Math.sin(wR),
    cO = Math.cos(OR),
    sO = Math.sin(OR),
    ci = Math.cos(IR),
    si = Math.sin(IR);
  return new THREE.Vector3(
    (cw * cO - sw * sO * ci) * xP + (-sw * cO - cw * sO * ci) * yP,
    sw * si * xP + cw * si * yP,
    (cw * sO + sw * cO * ci) * xP + (-sw * sO + cw * cO * ci) * yP
  );
}

export function buildCometOrbit(def) {
  const pts = [];
  for (let i = 0; i <= SEG; i++) pts.push(cometPosFromAngle(def, (i / SEG) * Math.PI * 2));
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineDashedMaterial({
      color: new THREE.Color(def.color),
      dashSize: 6,
      gapSize: 10,
      transparent: true,
      opacity: 0.35,
    })
  );
  line.computeLineDistances();
  return line;
}

export function cometAngSpeed(def, angle) {
  const a = cometVisualA(def),
    e = def.e,
    r = a * (1 - e * Math.cos(angle));
  return (0.00006 * a * a) / (r * r);
}

export function createComets(COMETS, cGroup, hitboxList, ui, allBodies, meshList, selectBody) {
  return COMETS.map((def) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 16, 16),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(def.color),
        emissive: new THREE.Color(def.color),
        emissiveIntensity: 2.5,
        roughness: 0.3,
      })
    );
    mesh.userData.bodyKey = def.key;
    cGroup.add(mesh);

    const hitbox = new THREE.Mesh(
      new THREE.SphereGeometry(8, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.userData.bodyKey = def.key;
    cGroup.add(hitbox);
    hitboxList.push(hitbox);

    const cHex = new THREE.Color(def.color);
    const cr = Math.round(cHex.r * 255),
      cg = Math.round(cHex.g * 255),
      cb = Math.round(cHex.b * 255);
    const glow = makeCanvasSprite(
      (ctx, s) => {
        const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},0.9)`);
        g.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.3)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);
      },
      128,
      18
    );
    cGroup.add(glow);

    const tailCount = 80;
    const tailPos = new Float32Array(tailCount * 3);
    const tailGeo = new THREE.BufferGeometry();
    tailGeo.setAttribute('position', new THREE.BufferAttribute(tailPos, 3));
    const tC = new THREE.Color(def.tailColor);
    const tailCol = new Float32Array(tailCount * 3);
    for (let i = 0; i < tailCount; i++) {
      const t = i / tailCount;
      tailCol[i * 3] = tC.r * (1 - t * 0.8);
      tailCol[i * 3 + 1] = tC.g * (1 - t * 0.7);
      tailCol[i * 3 + 2] = tC.b;
    }
    tailGeo.setAttribute('color', new THREE.BufferAttribute(tailCol, 3));
    const tail = new THREE.Points(
      tailGeo,
      new THREE.PointsMaterial({
        size: 1.8,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
      })
    );
    cGroup.add(tail);

    const orbitLine = buildCometOrbit(def);
    cGroup.add(orbitLine);

    const pivot = new THREE.Group();
    cGroup.add(pivot);

    let labelEl = null;
    if (ui.labelsLayer) {
      labelEl = document.createElement('div');
      labelEl.className = 'label';
      labelEl.style.color = '#aaddff';
      labelEl.textContent = def.label;
      labelEl.style.pointerEvents = 'auto';
      labelEl.style.cursor = 'pointer';
      const capturedDef = def;
      labelEl.addEventListener('click', () => {
        const b = allBodies.find((x) => x.key === capturedDef.key);
        if (b) selectBody(b);
      });
      ui.labelsLayer.appendChild(labelEl);
    }

    const body = {
      ...def,
      type: 'comet',
      pivot,
      mesh,
      glow,
      labelEl,
      visualR: 4,
      moons: 0,
      day: null,
      distAU: def.perielio,
    };
    allBodies.push(body);

    return {
      def,
      mesh,
      hitbox,
      glow,
      tail,
      tailGeo,
      tailPos,
      orbitLine,
      labelEl,
      pivot,
      body,
      angle: Math.random() * Math.PI * 2,
    };
  });
}

export function updateComets(cometObjects, dt, mult, paused, ui, camera) {
  if (!cometObjects || cometObjects.length === 0) return;
  const proj = new THREE.Vector3();
  if (!paused) {
    const cSpeed = Math.max(mult * 0.00003, 0.00003) * Math.sign(mult || 1);
    cometObjects.forEach((c) => {
      c.angle =
        (c.angle + cometAngSpeed(c.def, c.angle) * dt * 60 * Math.abs(cSpeed) * 500) %
        (Math.PI * 2);
    });
  }
  cometObjects.forEach((c) => {
    const pos = cometPosFromAngle(c.def, c.angle);
    c.mesh.position.copy(pos);
    c.hitbox.position.copy(pos);
    c.pivot.position.copy(pos);
    c.glow.position.copy(pos);
    c.glow.quaternion.copy(camera.quaternion);
    const a = cometVisualA(c.def),
      distSun = pos.length();
    const tailLen = Math.max(4, a * 0.6 * (1 - distSun / (a * 3)));
    const toSun = pos.clone().negate().normalize();
    for (let i = 0; i < 80; i++) {
      const t = i / 80;
      c.tailPos[i * 3] = pos.x + toSun.x * t * tailLen + TAIL_OFF[i].ox * t * 4;
      c.tailPos[i * 3 + 1] = pos.y + toSun.y * t * tailLen + TAIL_OFF[i].oy * t * 4;
      c.tailPos[i * 3 + 2] = pos.z + toSun.z * t * tailLen + TAIL_OFF[i].oz * t * 4;
    }
    c.tailGeo.attributes.position.array.set(c.tailPos);
    c.tailGeo.attributes.position.needsUpdate = true;
    c.orbitLine.visible = ui.orbits ? ui.orbits.checked : true;
    if (c.labelEl) {
      proj.copy(pos).project(camera);
      const inV = proj.z < 1 && proj.z > -1 && Math.abs(proj.x) < 1 && Math.abs(proj.y) < 1;
      const show = ui.labels ? ui.labels.checked : true;
      c.labelEl.style.display = inV && show ? 'block' : 'none';
      if (inV && show) {
        c.labelEl.style.left = (proj.x * 0.5 + 0.5) * innerWidth + 'px';
        c.labelEl.style.top = (-0.5 * proj.y + 0.5) * innerHeight - 20 + 'px';
      }
      c.labelEl.classList.toggle('label-selected', false);
    }
  });
}
