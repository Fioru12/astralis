import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    coverage: {
      // Pavimento verificato il 25/09/2026 (53/47/56/55): alzarlo solo
      // aggiungendo test, mai abbassarlo per far passare la CI.
      thresholds: {
        statements: 52,
        branches: 46,
        functions: 55,
        lines: 54,
      },
    },
  },
  base: './',
  plugins: [
    {
      name: 'copy-runtime-textures',
      closeBundle() {
        cpSync(resolve('assets/textures/optimized'), resolve('dist/assets/textures/optimized'), {
          recursive: true,
          filter: (source) => extname(source) === '' || extname(source) === '.webp',
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'oxc',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Vite 8 usa Rolldown: niente manualChunks (la forma a oggetto non
        // è supportata, quella a funzione infilava il core di three dentro
        // bodies-modules creando three-vendor -> bodies-modules circolare).
        // codeSplitting.groups è l'API nativa e isola three correttamente.
        codeSplitting: {
          groups: [
            { name: 'three-vendor', test: /node_modules[\\/]three[\\/]/ },
            { name: 'gui-vendor', test: /node_modules[\\/]lil-gui[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    middlewareMode: false,
    hmr: {
      overlay: false,
    },
  },
  logLevel: 'warn',
});
