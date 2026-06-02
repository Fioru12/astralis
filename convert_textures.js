// convert_textures.js
// Simple texture conversion script using sharp.
// Install with: npm install --save-dev sharp

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.join(__dirname, 'assets', 'textures');
const OUT_DIR = path.join(SRC_DIR, 'optimized');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function convertFile(file) {
  const inPath = path.join(SRC_DIR, file);
  const base = path.parse(file).name;
  const outWebp = path.join(OUT_DIR, base + '.webp');
  const outAvif = path.join(OUT_DIR, base + '.avif');
  try {
    await sharp(inPath).resize({ width: 2048 }).toFile(outWebp);
    await sharp(inPath).resize({ width: 2048 }).avif({ quality: 50 }).toFile(outAvif);
    console.log('Converted', file);
  } catch (e) {
    console.warn('Failed', file, e.message);
  }
}

fs.readdir(SRC_DIR, (err, files) => {
  if (err) return console.error(err);
  files.filter(f => /\.(png|jpe?g|tga)$/i.test(f)).forEach(f => convertFile(f));
});
