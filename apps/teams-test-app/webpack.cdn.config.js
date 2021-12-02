const path = require('path')
const commonConfig = require('./webpack.common.js')
const {merge} = require('webpack-merge')
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = merge(commonConfig, {
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "unbundle_cdn.js",
  },
  plugins: [
    new HtmlWebPackPlugin({ template: "./index_cdn.html", filename: "index.html", })
  ],
  // externals:{
  //   '@microsoft/teams-js': '@microsoft/teams-js',
  // },
  externals: {
    '@microsoft/teams-js': {
      commonjs: '@microsoft/teams-js',
      amd: '@microsoft/teams-js',
      root: '@microsoft/teams-js',
    },
  },
});