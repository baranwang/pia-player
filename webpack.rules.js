module.exports = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules\/.+\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'esbuild-loader',
      options: {
        loader: 'tsx',
        tsconfigRaw: require('./tsconfig.json'),
      },
    },
  },
  {
    test: /\.css$/,
    exclude: /insert\.css/,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /\.css$/,
    include: /insert\.css/,
    use: [
      'to-string-loader',
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [
              require('autoprefixer')({
                overrideBrowserslist: ['chrome 96'],
              }),
            ],
          },
        },
      },
    ],
  },
  {
    test: /\.less$/,
    use: [
      'style-loader',
      {
        loader: 'dts-css-modules-loader',
        options: {
          dropEmptyFile: true,
        },
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            auto: (resourcePath) => resourcePath.endsWith('.module.less'),
          },
        },
      },
      {
        loader: 'less-loader',
        options: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [
              require('autoprefixer')({
                overrideBrowserslist: ['chrome 96'],
              }),
            ],
          },
        },
      },
    ],
  },
  {
    test: /\.ttf$/,
    type: 'asset/resource',
  },
  {
    test: /\.png$/,
    type: 'asset/resource',
  },
];
