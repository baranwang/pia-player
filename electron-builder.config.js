const { productName, repository } = require('./package.json');
const path = require('path');
const fs = require('fs');
const lessToJs = require('less-vars-to-js');

const lessVars = lessToJs(
  fs.readFileSync(path.resolve('./packages/renderer/src/vars.less'), 'utf8'),
  {
    stripPrefix: true,
  }
);

const [_, owner, repo] = repository.url.match(/github.com\/(.*)\/(.*).git/);

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  productName,
  appId: 'wang.baran.pia-player',
  asar: true,
  files: ['packages/**/dist/**'],
  win: {
    target: ['nsis', 'appx'],
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    uninstallDisplayName: productName,
    license: 'LICENSE',
  },
  appx: {
    identityName: 'pia-player',
    backgroundColor: lessVars['primary-color'],
    languages: 'zh-Hans',
  },
  mac: {
    target: ['dmg'],
  },
  dmg: {
    background: 'build/dmg-background.png',
    contents: [
      {
        x: 200,
        y: 320,
      },
      {
        x: 440,
        y: 320,
        type: 'link',
        path: '/Applications',
      },
    ],
    window: {
      width: 640,
      height: 480,
    },
  },
  publish: {
    provider: 'github',
    owner,
    repo,
  },
};

module.exports = config;
