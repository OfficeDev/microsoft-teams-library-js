const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const libraryName = 'microsoftTeams';
var plugins = [];
plugins.push(new DtsBundlePlugin());

module.exports = {
  entry: {
    'MicrosoftTeams': './src/index.ts',
    'MicrosoftTeams.min': './src/index.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  optimization: {
    minimize: false,
    minimizer: [new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          reduce_funcs: false,
          inline: false
        },
      },
      include: /\.min\.js$/
    })]
  },
  plugins: plugins
};

function DtsBundlePlugin() { }
DtsBundlePlugin.prototype.apply = function (compiler) {
  compiler.plugin('done', function () {
    var dts = require('dts-bundle');

    dts.bundle({
      name: libraryName,
      main: 'dts/index.d.ts',
      out: '../dist/MicrosoftTeams.d.ts',
      removeSource: false,
      outputAsModuleFolder: false // to use npm in-package typings
    });
  });
};