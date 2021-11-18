const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack');
const libraryName = 'microsoftTeams';

module.exports = {
  entry: {
    MicrosoftTeams: './src/index.ts',
    'MicrosoftTeams.min': './src/index.ts',
  },
  externals: {
    'es6-promise': 'commonjs es6-promise',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: libraryName,
      type: 'umd',
      umdNamedDefine: true,
    },
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            reduce_funcs: false,
            inline: false,
          },
        },
        include: /\.min\.js$/,
      }),
    ],
  },
  plugins: [
    new DtsBundleWebpack({
      name: '@microsoft/teams-js',
      main: 'dts/index.d.ts',
      out: '~/dist/MicrosoftTeams.d.ts',
      removeSource: true,
    }),
  ]
};