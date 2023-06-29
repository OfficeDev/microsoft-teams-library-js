/* eslint @typescript-eslint/no-var-requires: off*/

const path = require('path');
const fs = require('fs');

let useLocalCert = false;

try {
  fs.accessSync('localhost-key.pem', fs.constants.F_OK);
  fs.accessSync('localhost.pem', fs.constants.F_OK);
  useLocalCert = true;
} catch (err) {
  console.log('Certificates not found: using default https settings...');
}

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
      publicPath: '/',
    },
    compress: true,
    port: 4000,
    https: useLocalCert
      ? {
          key: fs.readFileSync('localhost-key.pem'),
          cert: fs.readFileSync('localhost.pem'),
        }
      : true,
    allowedHosts: 'all',
  },
  performance: { hints: false },
};
