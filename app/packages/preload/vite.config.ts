import { defineConfig } from 'vite';
import { chrome } from '../../../electron-vendors.config.json';
import { join } from 'path';
import { builtinModules } from 'module';

const PACKAGE_ROOT = __dirname;
const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  resolve: {
    alias: [
      { find: new RegExp('^/@/'), replacement: `${join(PACKAGE_ROOT, 'src')}/` },
      { find: new RegExp('^/@eventKeys'), replacement: `${join(PACKAGE_ROOT, '..', 'eventKeys.ts')}` },
    ],
  },
  build: {
    sourcemap: isDevelopment ? 'inline' : false,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    minify: !isDevelopment,
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      input: [join(PACKAGE_ROOT, 'src/index.ts'), join(PACKAGE_ROOT, 'src/view.ts')],
      external: ['electron', ...builtinModules],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
    brotliSize: false,
  },
});
