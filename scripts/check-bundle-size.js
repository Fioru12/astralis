import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const assetDirectory = join(process.cwd(), 'dist', 'assets');
const limits = [
  // three-vendor isolato via codeSplitting.groups (Vite 8 / Rolldown):
  // ~524 KiB, senza più import circolari dai chunk applicativi.
  { pattern: /^three-vendor-.*\.js$/, maxBytes: 600 * 1024, label: 'Three.js vendor' },
  // Bundle app sincrono (lazy features già code-splittate in chunk async):
  // ~306 KiB dopo la rimozione del vecchio manualChunks a funzione.
  { pattern: /^index-.*\.js$/, maxBytes: 350 * 1024, label: 'App bundle' },
];

const files = readdirSync(assetDirectory);
let failed = false;

for (const limit of limits) {
  const file = files.find((name) => limit.pattern.test(name));
  if (!file) {
    console.error(`Missing ${limit.label} bundle in ${assetDirectory}`);
    failed = true;
    continue;
  }

  const bytes = statSync(join(assetDirectory, file)).size;
  const kib = (bytes / 1024).toFixed(1);
  const maxKib = (limit.maxBytes / 1024).toFixed(0);
  console.log(`${limit.label}: ${kib} KiB (budget: ${maxKib} KiB)`);
  if (bytes > limit.maxBytes) {
    console.error(`${limit.label} exceeds its size budget.`);
    failed = true;
  }
}

if (failed) process.exitCode = 1;
