/* eslint @typescript-eslint/no-var-requires: off*/

const path = require('path');
const commonConfig = require('./webpack.common.js');
const { merge } = require('webpack-merge');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = merge(commonConfig, {
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'indexCDNV1.js',
  },
  plugins: [new HtmlWebPackPlugin({ template: './index_cdnV1.html', filename: 'index.html' })],
  externals: {
    '@microsoft/teams-js': 'microsoftTeams',
  },
});
