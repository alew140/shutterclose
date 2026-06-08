import { defineConfig } from 'tsup'

export default defineConfig([
  // Core — vanilla JS, all formats
  {
    entry: { index: 'src/core/index.ts' },
    format: ['esm', 'cjs', 'iife'],
    globalName: 'ShutterClose',
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    esbuildOptions(opts) {
      opts.loader = { ...opts.loader, '.css': 'text' }
    },
  },
  // No-CSS variant
  {
    entry: { 'no-css': 'src/core/no-css.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'dist',
    esbuildOptions(opts) {
      opts.loader = { ...opts.loader, '.css': 'text' }
    },
  },
  // Standalone CSS file copy
  {
    entry: { shutterclose: 'src/core/shutterclose.css' },
    outDir: 'dist',
    loader: { '.css': 'copy' },
  },
  // React wrapper
  {
    entry: { index: 'src/react/index.tsx' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    outDir: 'dist/react',
    external: ['react', 'react/jsx-runtime'],
    esbuildOptions(opts) {
      opts.jsx = 'automatic'
      opts.loader = { ...opts.loader, '.css': 'text' }
    },
  },
  // Vue wrapper
  {
    entry: { index: 'src/vue/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    outDir: 'dist/vue',
    external: ['vue'],
    esbuildOptions(opts) {
      opts.loader = { ...opts.loader, '.css': 'text' }
    },
  },
])
