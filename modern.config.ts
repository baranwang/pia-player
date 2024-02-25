import { appTools, defineConfig } from '@modern-js/app-tools';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig<'rspack'>({
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
    mainEntryName: 'index',
    preEntry: ['./src/global.scss'],
  },
  dev: {
    port: 1420,
  },
  output: {
    enableCssModuleTSDeclaration: true,
    assetPrefix: './',
    distPath: {
      html: '',
    },
    disableSourceMap: process.env.NODE_ENV === 'production',
    overrideBrowserslist: ['last 3 Chrome versions', 'safari 13'],
    legalComments: 'none',
  },
  html: {
    disableHtmlFolder: true,
  },
});
