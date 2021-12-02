const path = require('path')
const commonConfig = require('./webpack.common.js')
const {merge} = require('webpack-merge')
const webpack = require('webpack')
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
//const nodeExternals = require('webpack-node-externals');

module.exports = merge(commonConfig, {
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "indexLocal.js",
  },
  plugins: [
    new HtmlWebPackPlugin({ template: "./index_local.html", filename: "index.html", }),
  ],
  externals: {
    '@microsoft/teams-js': 'microsoftTeams'
  }
});