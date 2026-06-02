import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three')) return 'three-vendor';
          if (id.includes('node_modules/lil-gui')) return 'gui-vendor';
          if (id.includes('src/data')) return 'data';
          if (id.includes('src/utils')) return 'utils';
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },
});
