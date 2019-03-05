const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const libraryName = 'microsoftTeams'

module.exports = {
  entry: {
    MicrosoftTeams: './src/index.ts',
    'MicrosoftTeams.min': './src/index.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          /*
            inlining is broken sometimes where inlined function uses the same variable name as inlining function.
            See https://github.com/mishoo/UglifyJS2/issues/2842, https://github.com/mishoo/UglifyJS2/issues/2843
         */
          compress: { inline: false }
        },
        include: /\.min\.js$/
      })
    ]
  }
}
