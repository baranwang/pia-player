import { appTools, defineConfig } from '@modern-js/app-tools';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  plugins: [
    appTools({
      bundler: 'experimental-rspack',
    }),
  ],
  source: {
    preEntry: ['./src/global.scss'],
  },
  dev: {
    port: 1420,
  },
  output: {
    svgDefaultExport: 'component',
    enableCssModuleTSDeclaration: true,
  },
});
