/* eslint @typescript-eslint/no-var-requires: off*/

const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const { BundleComparisonPlugin } = require('@mixer/webpack-bundle-compare/dist/plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    symlinks: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.json',
          projectReferences: true,
        },
      },
    ],
  },
  performance: { hints: false },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.resolve(process.cwd(), 'bundleAnalysis/report.html'),
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: path.resolve(process.cwd(), 'bundleAnalysis/report.json'),
    }),
    // Plugin that generates a compressed version of the stats file that can be uploaded to blob storage
    new BundleComparisonPlugin({
      // File to create, relative to the webpack build output path:
      file: path.resolve(process.cwd(), 'bundleAnalysis/bundleStats.msp.gz'),
    }),
    new HtmlWebPackPlugin({ template: './index.html', filename: 'index.html' }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        // Disable the vendors split chunks optimizations provided by webpack
        defaultVendors: false,
      },
    },
  },
};
