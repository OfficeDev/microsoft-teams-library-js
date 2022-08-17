/* eslint @typescript-eslint/no-var-requires: off*/

const path = require('path');
const commonConfig = require('./webpack.common.js');
const { merge } = require('webpack-merge');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(commonConfig, {
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'indexBundle.js',
  },
  plugins: [
    new HtmlWebPackPlugin({ template: './index_bundle.html', filename: 'index.html' }),
    new CopyWebpackPlugin({ patterns: [{ from: './src/public' }] }),
  ],
});
