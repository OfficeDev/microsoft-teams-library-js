const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    MicrosoftTeams: ['@microsoft/teams-js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dll'),
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.resolve(__dirname, 'dll/manifest.json')
    })
  ],
  mode: 'production'
};