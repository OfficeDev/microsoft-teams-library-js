/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const TerserPlugin = require('terser-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const { readFileSync } = require('fs');
const { join } = require('path');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const libraryName = 'microsoftTeams';
const expect = require('expect');
const path = require('path');

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
  },
  plugins: [
    new DtsBundleWebpack({
      name: '@microsoft/teams-js',
      main: 'dts/index.d.ts',
      out: '~/dist/MicrosoftTeams.d.ts',
      removeSource: true,
      outputAsModuleFolder: true,
    }),
    new HtmlWebpackPlugin(),
    new SubresourceIntegrityPlugin({
      enabled: true,
    }),
    new WebpackAssetsManifest({ integrity: true }),
    {
      apply: compiler => {
        compiler.hooks.done.tap('wsi-test', () => {
          const manifest = JSON.parse(readFileSync(join(__dirname, 'dist/assets-manifest.json'), 'utf-8'));
          expect(manifest['MicrosoftTeams.js'].integrity).toMatch(/sha256-.*/);
          expect(manifest['MicrosoftTeams.min.js'].integrity).toMatch(/sha256-.*/);
        });
      },
    },
  ],
};
