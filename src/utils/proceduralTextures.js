import * as THREE from 'three';

function noise2D(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const n00 = noise2D(ix, iy), n10 = noise2D(ix + 1, iy);
  const n01 = noise2D(ix, iy + 1), n11 = noise2D(ix + 1, iy + 1);
  return n00 + (n10 - n00) * sx + (n01 - n00) * sy + (n11 - n10 - n01 + n00) * sx * sy;
}

function fbm(x, y, octaves = 4) {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * smoothNoise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return val;
}

// Interpolazione smooth (equivalente a GLSL smoothstep)
function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function generateRockyTexture(width, height, baseColor, variation) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const br = (baseColor >> 16) & 0xff, bg = (baseColor >> 8) & 0xff, bb = baseColor & 0xff;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width, v = y / height;
      const n = fbm(u * 8, v * 8, 5);
      const crater = Math.max(0, 1 - Math.abs(fbm(u * 20, v * 20, 3) - 0.5) * 6);
      const bright = 0.6 + n * variation;
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, br * bright - crater * 40);
      data[idx + 1] = Math.min(255, bg * bright - crater * 30);
      data[idx + 2] = Math.min(255, bb * bright - crater * 20);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function generateIcyTexture(width, height, baseColor = 0xccddff) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const br = (baseColor >> 16) & 0xff, bg = (baseColor >> 8) & 0xff, bb = baseColor & 0xff;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width, v = y / height;
      const n1 = fbm(u * 6, v * 6, 4);
      const n2 = fbm(u * 15 + 3.7, v * 15 + 9.2, 3);
      const crack = n2 > 0.65 ? 0.3 : 0;
      const bright = 0.7 + n1 * 0.3 - crack;
      const blueShift = n1 * 0.2;
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, br * bright * (1 - blueShift * 0.3));
      data[idx + 1] = Math.min(255, bg * bright * (1 - blueShift * 0.1));
      data[idx + 2] = Math.min(255, bb * bright * (1 + blueShift * 0.2));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function generateGasGiantTexture(width, height, baseColor, bands = 8) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const br = (baseColor >> 16) & 0xff, bg = (baseColor >> 8) & 0xff, bb = baseColor & 0xff;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const bandPattern = Math.sin(v * bands * Math.PI * 2) * 0.3 + 0.5;
    const turbulence = fbm(v * 10, 0, 3) * 0.15;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const spot = fbm(u * 12 + v * 8, v * 12 + 5.5, 3) * 0.2;
      const bright = 0.5 + bandPattern * 0.35 + turbulence + spot;
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, br * bright);
      data[idx + 1] = Math.min(255, bg * bright);
      data[idx + 2] = Math.min(255, bb * bright);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function generateSandyTexture(width, height, baseColor = 0xddccaa) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const br = (baseColor >> 16) & 0xff, bg = (baseColor >> 8) & 0xff, bb = baseColor & 0xff;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width, v = y / height;
      const n = fbm(u * 10 + 1.3, v * 10 + 4.7, 4);
      const streak = Math.max(0, Math.sin(u * 30 + v * 15 + n * 2) * 0.15 + 0.15);
      const bright = 0.6 + n * 0.3 + streak;
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, br * bright);
      data[idx + 1] = Math.min(255, bg * bright);
      data[idx + 2] = Math.min(255, bb * bright);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function generateDwarfPlanetTexture(key, color) {
  switch (key) {
    case 'Ceres': return generateRockyTexture(512, 256, color, 0.25);
    case 'Pluto': return generateIcyTexture(512, 256, 0xddccaa);
    case 'Eris': return generateIcyTexture(512, 256, 0xeeeecc);
    case 'Makemake': return generateRockyTexture(512, 256, 0xffddaa, 0.2);
    case 'Haumea': return generateRockyTexture(512, 256, 0xffddcc, 0.15);
    default: return generateRockyTexture(512, 256, color, 0.2);
  }
}

function generateMoonTexture(key, color) {
  switch (key) {
    case 'Io': return generateRockyTexture(512, 256, 0xffdd44, 0.4);
    case 'Europa': return generateIcyTexture(512, 256, 0xaaccff);
    case 'Ganymede': return generateRockyTexture(512, 256, 0x998866, 0.2);
    case 'Callisto': return generateRockyTexture(512, 256, 0x776655, 0.3);
    case 'Titan': return generateSandyTexture(512, 256, 0xff9944);
    case 'Triton': return generateIcyTexture(512, 256, 0x88bbff);
    case 'Enceladus': return generateIcyTexture(512, 256, 0xaaddff);
    case 'Mimas': return generateRockyTexture(512, 256, 0xaaaacc, 0.35);
    case 'Rhea': return generateRockyTexture(512, 256, 0xccccee, 0.15);
    case 'Phobos': return generateRockyTexture(512, 256, 0xaa9988, 0.3);
    case 'Deimos': return generateRockyTexture(512, 256, 0x998877, 0.25);
    case 'Miranda': return generateRockyTexture(512, 256, 0x99aadd, 0.4);
    case 'Ariel': return generateRockyTexture(512, 256, 0xaabbcc, 0.2);
    case 'Umbriel': return generateRockyTexture(512, 256, 0x8899aa, 0.2);
    case 'Titania': return generateRockyTexture(512, 256, 0xbbccdd, 0.15);
    case 'Oberon': return generateRockyTexture(512, 256, 0xaabbcc, 0.2);
    default: return generateRockyTexture(512, 256, color, 0.2);
  }
}

export function generateSaturnRingTexture() {
  const width = 512, height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const dist = v;
      const gap1 = 0.35 + fbm(u * 3, v * 3, 3) * 0.02;
      const gap2 = 0.62 + fbm(u * 4 + 1.3, v * 4 + 7.1, 3) * 0.02;
      const alpha = (dist > gap1 && dist < gap2) ? 0.0
        : (1.0 - Math.abs(dist - 0.5) * 1.2) * (0.6 + fbm(u * 10, v * 10, 3) * 0.3);
      const brightness = 0.5 + fbm(u * 8 + 2.5, v * 8 + 3.7, 3) * 0.3 + fbm(u * 20, v * 20, 2) * 0.1;
      const r = Math.min(255, 200 * brightness);
      const g = Math.min(255, 175 * brightness);
      const b = Math.min(255, 120 * brightness);
      const idx = (y * width + x) * 4;
      data[idx] = r; data[idx + 1] = g; data[idx + 2] = b;
      data[idx + 3] = Math.min(255, alpha * 255);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function generateEarthTexture() {
  const width = 1024, height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width, v = y / height;

      const detail = fbm(u * 16 + 5.1, v * 16 + 8.9, 3) * 0.15;
      const landThreshold = 0.48 + detail;
      const coast = fbm(u * 6 + 1.1, v * 6 + 3.7, 4);

      const isLand = coast > landThreshold;
      const ice = 1.0 - smoothstep(0.7, 1.0, Math.abs(v - 0.5) * 2);

      let r, g, b;
      if (ice > 0.6) {
        r = 240; g = 245; b = 250;
      } else if (isLand) {
        const veg = fbm(u * 8 + 3.2, v * 8 + 5.6, 4);
        const elev = fbm(u * 12 + 7.4, v * 12 + 1.8, 3);
        if (elev > 0.6) {
          r = 160 - elev * 40; g = 140 - elev * 30; b = 120 - elev * 20;
        } else if (veg > 0.45) {
          r = 60 + veg * 80; g = 120 + veg * 60; b = 30 + veg * 20;
        } else {
          r = 140 + veg * 60; g = 130 + veg * 40; b = 80 + veg * 30;
        }
      } else {
        const depth = 0.3 + fbm(u * 5 + 9.2, v * 5 + 4.1, 3) * 0.15;
        r = 20 - depth * 15; g = 80 - depth * 30; b = 160 - depth * 40;
      }

      const polarFade = 1.0 - smoothstep(0.8, 1.0, Math.abs(v - 0.5) * 2) * 0.3;
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, Math.max(0, r * polarFade));
      data[idx + 1] = Math.min(255, Math.max(0, g * polarFade));
      data[idx + 2] = Math.min(255, Math.max(0, b * polarFade));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function generateProceduralMilkyWay() {
  const width = 2048, height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill with pitch black
  ctx.fillStyle = '#020205';
  ctx.fillRect(0, 0, width, height);

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Generate nebula dust using multi-color noise
  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;
    const cosLat = Math.cos(lat);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = u * Math.PI * 2;

      // Milky Way diagonal band formula
      const mwBand = Math.sin(lon + lat * 1.5) * 0.4 + 0.5;
      const distFromBand = Math.abs(v - mwBand);
      const bandIntensity = Math.exp(-distFromBand * distFromBand * 16.0);

      // Noise for nebula variation
      const n1 = fbm(u * 5.0, v * 5.0, 4);
      const n2 = fbm(u * 8.0 - 2.5, v * 8.0 + 3.1, 3);
      const n3 = fbm(u * 12.0 + 4.7, v * 12.0 - 1.9, 3);

      // Colors for nebulae
      const blueGlow = n1 * 0.12 * cosLat;
      const magentaGlow = n2 * 0.10 * cosLat * (0.3 + bandIntensity * 0.7);
      const goldGlow = n3 * 0.08 * cosLat * bandIntensity;

      // Deep space color
      let r = 2 + blueGlow * 20 + magentaGlow * 120 + goldGlow * 180;
      let g = 2 + blueGlow * 80 + magentaGlow * 20 + goldGlow * 110;
      let b = 5 + blueGlow * 150 + magentaGlow * 100 + goldGlow * 40;

      // Add Milky Way star dust glow
      if (bandIntensity > 0.1) {
        const dustGlow = bandIntensity * (0.15 + n2 * 0.15);
        r += dustGlow * 100;
        g += dustGlow * 90;
        b += dustGlow * 85;
      }

      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Draw stars on top with canvas drawing methods
  ctx.fillStyle = '#ffffff';
  
  // 1. Draw 10000 tiny background stars
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 0.8 + 0.1;
    const opacity = Math.random() * 0.6 + 0.1;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(x, y, size, size);
  }

  // 2. Draw 4000 Milky Way dense stars clustered along the band
  for (let i = 0; i < 6000; i++) {
    const u = Math.random();
    const lon = u * Math.PI * 2;
    const lat = (Math.random() - 0.5) * Math.PI;
    const v = lat / Math.PI + 0.5;
    
    const mwBand = Math.sin(lon + lat * 1.5) * 0.4 + 0.5;
    const distFromBand = Math.abs(v - mwBand);
    
    // Concentrate stars near the band
    if (distFromBand < Math.random() * 0.25 + 0.05) {
      const x = u * width;
      const y = v * height;
      const size = Math.random() * 1.2 + 0.2;
      const opacity = Math.random() * 0.85 + 0.15;
      
      // Star color variation (temperature)
      const rIdx = Math.random();
      let color = `rgba(255, 255, 255, ${opacity})`;
      if (rIdx < 0.12) color = `rgba(160, 200, 255, ${opacity})`; // blue
      else if (rIdx < 0.20) color = `rgba(255, 200, 150, ${opacity})`; // red/orange
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size);
    }
  }

  // 3. Draw a few brighter stars with slight glows
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2.0 + 1.0;
    const opacity = Math.random() * 0.7 + 0.3;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Star glow
    const gr = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
    gr.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    gr.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(x, y, size * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function getProceduralPlanetTexture(def) {
  if (def.tex) return null;
  if (def.type === 'dwarf') return generateDwarfPlanetTexture(def.key, def.color);
  if (def.type === 'moon') return generateMoonTexture(def.key, def.color);
  if (def.type === 'asteroid') return generateRockyTexture(256, 128, def.color, 0.2);
  if (def.type === 'planet') {
    if (def.key === 'Earth') return generateEarthTexture();
    if (def.key === 'Venus') return generateSandyTexture(1024, 512, 0xffdd44);
    if (def.key === 'Mercury') return generateRockyTexture(1024, 512, 0xaa8866, 0.35);
    // Giganti gassosi: bande atmosferiche invece di superficie rocciosa
    if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(def.key)) {
      return generateGasGiantTexture(1024, 512, def.color);
    }
    return generateRockyTexture(1024, 512, def.color, 0.25);
  }
  return null;
}
