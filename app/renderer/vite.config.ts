import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dts } from '@guanghechen/postcss-modules-dts';
import autoprefixer = require('autoprefixer');
import { chrome } from '../../electron-vendors.config.json';
import { join } from 'path';
import { builtinModules } from 'module';
import copy from 'rollup-plugin-copy';

const PACKAGE_ROOT = __dirname;
const isDevelopment = process.env.MODE === 'development';

export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  resolve: {
    alias: [
      {
        find: new RegExp('^/@/'),
        replacement: `${join(PACKAGE_ROOT, 'src')}/`,
      },
      {
        find: new RegExp('^/@eventKeys'),
        replacement: `${join(PACKAGE_ROOT, '..', 'eventKeys.ts')}`,
      },
      { find: new RegExp('^~'), replacement: '' },
    ],
  },
  plugins: [
    react(),
    copy({
      targets: [
        {
          src: join(process.cwd(), 'node_modules', '@ffmpeg', 'core', 'dist'),
          dest: PACKAGE_ROOT,
        },
      ],
      hook: 'writeBundle',
    }),
  ],
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: isDevelopment,
    target: `chrome${chrome}`,
    outDir: 'dist',
    minify: !isDevelopment,
    assetsDir: '.',
    rollupOptions: {
      external: [...builtinModules],
      output: {
        assetFileNames: '[name][extname]',
      },
    },
    emptyOutDir: true,
    brotliSize: false,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    postcss: {
      plugins: [autoprefixer()],
    },
    modules: {
      ...dts(),
    },
  },
});
