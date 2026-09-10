/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const TerserPlugin = require('terser-webpack-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const { readFileSync } = require('fs');
const { join } = require('path');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const libraryName = 'microsoftTeams';
const { expect } = require('expect');
const path = require('path');
const { DefinePlugin, NormalModuleReplacementPlugin } = require('webpack');
const packageVersion = require('./package.json').version;
const FileManagerPlugin = require('filemanager-webpack-plugin');
const { ProvidePlugin } = require('webpack');
const { getTargetCloud, getArtifactPathForCloud, getDistSuffixForCloud, DEFAULT_ARTIFACT } = require('./cloudBuild.cjs');

const targetCloud = getTargetCloud();
const cloudArtifact = getArtifactPathForCloud(targetCloud);
const distSuffix = getDistSuffixForCloud(targetCloud);

module.exports = {
  entry: {
    MicrosoftTeams: './src/index.ts',
    'MicrosoftTeams.min': './src/index.ts',
  },
  output: {
    filename: '[name].js',
    // the following setting is required for SRI to work
    crossOriginLoading: 'anonymous',
    path: path.resolve(__dirname, `dist/umd${distSuffix}`),
    library: {
      name: libraryName,
      type: 'umd',
      umdNamedDefine: true,
    },
    //Typically resolves to 'self' unless running in a server side rendered environment
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      buffer: require.resolve('skeleton-buffer/'),
    },
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
    nodeEnv: 'production',
  },
  // webpack.production.config.js
  mode: 'production',
  performance: {
    hints: false,
  },
  plugins: [
    new DefinePlugin({
      PACKAGE_VERSION: JSON.stringify(packageVersion),
    }),

    // Sovereign builds swap the bundled valid-domains artifact. Prod origins are never
    // imported in a sovereign build, so they cannot appear in the emitted bundle.
    new NormalModuleReplacementPlugin(/validDomains\.json$/, (resource) => {
      const requested = path.resolve(resource.context, resource.request);
      if (requested === DEFAULT_ARTIFACT && cloudArtifact !== DEFAULT_ARTIFACT) {
        resource.request = cloudArtifact;
      }
    }),

    // https://www.npmjs.com/package/webpack-subresource-integrity
    new SubresourceIntegrityPlugin({ enabled: true }),

    new ProvidePlugin({
      Buffer: ['skeleton-buffer', 'Buffer'],
    }),

    // Webpackmanifest produces the json file containing asset(JS file) and its corresponding hash values(Example: https://github.com/waysact/webpack-subresource-integrity/blob/main/examples/webpack-assets-manifest/webpack.config.js)
    new WebpackAssetsManifest({
      integrity: true,
      integrityHashes: ['sha384'],
      output: 'MicrosoftTeams-manifest.json',
    }),

    {
      apply: (compiler) => {
        compiler.hooks.done.tap('wsi-test', () => {
          const manifest = JSON.parse(
            readFileSync(join(__dirname, `dist/umd${distSuffix}/MicrosoftTeams-manifest.json`), 'utf-8'),
          );
          // If for some reason hash was not generated for the assets, this test will fail in build.
          expect(manifest['MicrosoftTeams.min.js'].integrity).toMatch(/sha384-.*/);
        });
      },
    },

    // The Blazor test app only consumes the prod build.
    ...(distSuffix === ''
      ? [
          new FileManagerPlugin({
            events: {
              onEnd: {
                copy: [
                  {
                    source: './dist/umd/MicrosoftTeams.min.js',
                    destination: '../../apps/blazor-test-app/wwwroot/js/MicrosoftTeams.min.js',
                  },
                ],
              },
            },
          }),
        ]
      : []),
  ],
};
