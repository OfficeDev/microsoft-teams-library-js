const path = require('path')
const commonConfig = require('./webpack.common.js')
const {merge} = require('webpack-merge')
const webpack = require('webpack')
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = merge(commonConfig, {
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "index_local.js",
  },
  plugins: [
    new HtmlWebPackPlugin({ template: "./index_local.html", filename: "index.html", }),
    // new webpack.DllReferencePlugin({ manifest: path.resolve(__dirname, 'dll/manifest.json')}),
    // new AddAssetHtmlWebpackPlugin({ filepath: path.resolve(__dirname, 'dll/MicrosoftTeams.js'), publicPath: ''})
  ],
  externals:[
    {
      ["@Microsoft/teams-js"]:{
        root: "@Microsoft/teams-js"
      }
    }
  ]
});