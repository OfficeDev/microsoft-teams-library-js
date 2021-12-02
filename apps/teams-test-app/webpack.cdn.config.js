const path = require('path')
const commonConfig = require('./webpack.common.js')
const {merge} = require('webpack-merge')
const HtmlWebPackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = merge(commonConfig, {
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "unbundle_cdn.js",
  },
  plugins: [
    new HtmlWebPackPlugin({ template: "./index_cdn.html", filename: "index.html", })
  ],
  externalsPresets: { node: true }, 
  externals: [nodeExternals({
    // this WILL include `jquery` and `webpack/hot/dev-server` in the bundle, as well as `lodash/*`
    allowlist: ['react', 'react-dom']
  })],
  // externals:[
  //   //{"./build/MicrosoftTeams.js":"@Microsoft/teams-js"}
  // ]
});