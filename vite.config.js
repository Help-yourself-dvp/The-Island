import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    sourcemap: false,
    assetsInlineLimit: 4096,
    rollupOptions: { output: { inlineDynamicImports: true } }
  },
  server: { host: '0.0.0.0', strictPort: true, allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true }
});
