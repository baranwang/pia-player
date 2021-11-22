const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(
          __dirname,
          'node_modules',
          '@ffmpeg',
          'core',
          'dist'
        ),
        to: path.resolve(__dirname, '.webpack', 'renderer'),
      },
    ],
  }),
];
