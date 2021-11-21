const path = require('path');
const fs = require('fs');
const packageJson = require('./package.json');

module.exports = {
  packagerConfig: {
    icon: path.resolve('build', 'icon'),
    // asar: true,
    appCopyright: `Copyright © ${new Date().getFullYear()} ${
      packageJson.author.name
    }`,
  },
  makers: [
    {
      name: '@imxeno/electron-forge-maker-nsis',
    },
    {
      name: '@electron-forge/maker-dmg',
    },
  ],
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.ts',
              name: 'main_window',
              preload: {
                js: './src/preload.ts',
              },
            },
          ],
        },
      },
    ],
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'baranwang',
          name: 'pia-player',
        },
        prerelease: true,
      },
    },
  ],
  hooks: {},
};
