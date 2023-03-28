/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const TerserPlugin = require('terser-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const { readFileSync } = require('fs');
const { join } = require('path');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const libraryName = 'microsoftTeams';
const { expect } = require('expect');
const path = require('path');
const { DefinePlugin } = require('webpack');
const packageVersion = require('./package.json').version;
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
  entry: {
    MicrosoftTeams: './src/index.ts',
    'MicrosoftTeams.min': './src/index.ts',
  },
  output: {
    filename: '[name].js',
    // the following setting is required for SRI to work
    crossOriginLoading: 'anonymous',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: libraryName,
      type: 'umd',
      umdNamedDefine: true,
    },
    //Typically resolves to 'self' unless running in a server side rendered environment
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            reduce_funcs: false,
            inline: false,
          },
        },
        include: /\.min\.js$/,
      }),
    ],
    nodeEnv: 'production',
  },
  // webpack.production.config.js
  mode: 'production',
  performance: {
    hints: false,
  },
  plugins: [
    new DefinePlugin({
      PACKAGE_VERSION: JSON.stringify(packageVersion),
    }),

    new DtsBundleWebpack({
      name: '@microsoft/teams-js',
      main: 'dts/index.d.ts',
      out: '~/dist/MicrosoftTeams.d.ts',
      removeSource: true,
      outputAsModuleFolder: true,
    }),

    // https://www.npmjs.com/package/webpack-subresource-integrity
    new SubresourceIntegrityPlugin({ enabled: true }),

    // Webpackmanifest produces the json file containing asset(JS file) and its corresponding hash values(Example: https://github.com/waysact/webpack-subresource-integrity/blob/main/examples/webpack-assets-manifest/webpack.config.js)
    new WebpackAssetsManifest({
      integrity: true,
      integrityHashes: ['sha384'],
      output: 'MicrosoftTeams-manifest.json',
    }),

    {
      apply: (compiler) => {
        compiler.hooks.done.tap('wsi-test', () => {
          const manifest = JSON.parse(readFileSync(join(__dirname, 'dist/MicrosoftTeams-manifest.json'), 'utf-8'));
          // If for some reason hash was not generated for the assets, this test will fail in build.
          expect(manifest['MicrosoftTeams.min.js'].integrity).toMatch(/sha384-.*/);
        });
      },
    },

    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            {
              source: './dist/MicrosoftTeams.min.js',
              destination: '../../apps/blazor-test-app/wwwroot/js/MicrosoftTeams.min.js',
            },
          ],
        },
      },
    }),
  ],
};
