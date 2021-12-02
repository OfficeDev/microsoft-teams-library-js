const path = require('path')
const commonConfig = require('./webpack.common.js')
const {merge} = require('webpack-merge')
const webpack = require('webpack')
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = merge(commonConfig, {
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "indexLocal.js",
    //libraryTarget: 'umd'
  },
  plugins: [
    new HtmlWebPackPlugin({ template: "./index_local.html", filename: "index.html", }),
    //new webpack.DllReferencePlugin({ manifest: path.resolve(__dirname, 'dll/manifest.json')}),
    // new AddAssetHtmlWebpackPlugin({ filepath: path.resolve(__dirname, 'dll/MicrosoftTeams.js'), publicPath: ''})
  ],
  // externalsPresets: { node: true },
  // externals: [nodeExternals()],
  externals:[
    {
      ["@microsoft/teams-js"]:{
        root: "@microsoft/teams-js"
      }
    }
  ]
  // externals: {
  //   //react: 'React',
  //   // '@microsoft/teams-js': {
  //   //   commonjs: '@microsoft/teams-js',
  //   //   commonjs2: '@microsoft/teams-js',
  //   //   amd: '@microsoft/teams-js',
  //   //   root: '@microsoft/teams-js'
  //   // }
  //   '@microsoft/teams-js': true
  // },
  // externals: {
  //   '@microsoft/teams-js': '@microsoft/teams-js'
  // }
});