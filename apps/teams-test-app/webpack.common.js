/* eslint @typescript-eslint/no-var-requires: off*/

const path = require('path');
const fs = require('fs');

const keyPath = process.env.SSL_KEY_FILE;
const certPath = process.env.SSL_CRT_FILE;
const sslFilesExist = keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath);
if (sslFilesExist) {
  console.log('Using SSL with the following files:');
  console.log('SSL_KEY_FILE:', keyPath);
  console.log('SSL_CRT_FILE:', certPath);
}

// If the SSL key and certificate files exist, build with SSL options for internal tests.
const serverConfig = {
  type: 'https',
  ...(sslFilesExist && {
    options: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
  }),
};

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
    historyApiFallback: true, // enables react router
    static: {
      directory: path.join(__dirname, 'build'),
      publicPath: '/',
    },
    compress: true,
    port: 4000,
    server: serverConfig,
    allowedHosts: 'all',
  },
  performance: { hints: false },
};
