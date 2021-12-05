import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dts } from '@guanghechen/postcss-modules-dts'
import autoprefixer = require("autoprefixer")
import { chrome } from '../../electron-vendors.config.json';
import { join } from 'path';
import { builtinModules } from 'module';

const PACKAGE_ROOT = __dirname;

export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  resolve: {
    alias: [
      { find: new RegExp('^/@/'), replacement: `${join(PACKAGE_ROOT, 'src')}/` },
      { find: new RegExp('^/@eventKeys'), replacement: `${join(PACKAGE_ROOT, '..', 'eventKeys.ts')}` },
      { find: new RegExp('^~'), replacement: '' }
    ],
  },
  plugins: [react()],
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',

    rollupOptions: {
      external: [...builtinModules],
    },
    emptyOutDir: true,
    brotliSize: false,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    },
    postcss: {
      plugins: [
        autoprefixer()
      ]
    },
    modules: {
      ...dts()
    },
  }
});
