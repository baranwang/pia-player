import { appTools, defineConfig } from '@modern-js/app-tools';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
    state: true,
  },
  plugins: [
    appTools({
      bundler: 'experimental-rspack',
    }),
  ],
  source: {
    entries: {
      '/': {
        entry: './src/routes',
      },
    },
    disableDefaultEntries: true,
    preEntry: ['./src/global.scss'],
  },
  dev: {
    port: 1420,
  },
  output: {
    enableCssModuleTSDeclaration: true,
    assetPrefix: './',
    distPath: {
      html: './',
    },
    overrideBrowserslist: ['last 3 Chrome versions', 'safari 13'],
  },
});
