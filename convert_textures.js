import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = path.resolve('assets/textures');
const outputDir = path.join(sourceDir, 'optimized');
const supported = /\.(png|jpe?g|tga)$/i;
// JPG pubblici serviti dalla root di dist (es. milky_way_topdown.jpg, 823 KB):
// generano il .webp affiancato usato con fallback (vedi TEXTURE_OPTIMIZATION.md).
const publicDir = path.resolve('public');
const publicSources = ['milky_way_topdown.jpg'];

async function convertFile(file) {
  const input = path.join(sourceDir, file);
  const base = path.parse(file).name;
  await sharp(input)
    .resize({ width: 2048, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(outputDir, `${base}.webp`));
  return file;
}

async function convertPublicAsset(file) {
  const input = path.join(publicDir, file);
  const base = path.parse(file).name;
  await sharp(input)
    .resize({ width: 2048, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(path.join(publicDir, `${base}.webp`));
  return `public/${file} -> public/${base}.webp`;
}

await mkdir(outputDir, { recursive: true });
const files = (await readdir(sourceDir)).filter((file) => supported.test(file));
const results = await Promise.allSettled(files.map(convertFile));

results.forEach((result, index) => {
  if (result.status === 'fulfilled') console.log(`Converted ${result.value}`);
  else console.error(`Failed ${files[index]}: ${result.reason?.message || result.reason}`);
});

const publicResults = await Promise.allSettled(publicSources.map(convertPublicAsset));
publicResults.forEach((result, index) => {
  if (result.status === 'fulfilled') console.log(`Converted ${result.value}`);
  else console.error(`Failed ${publicSources[index]}: ${result.reason?.message || result.reason}`);
});

if (
  results.some((result) => result.status === 'rejected') ||
  publicResults.some((result) => result.status === 'rejected')
)
  process.exitCode = 1;
