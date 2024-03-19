import typescript from '@rollup/plugin-typescript';
import minify from 'rollup-plugin-prototype-minify';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts',
  output: [
    {
      file: 'dist/MicrosoftTeams.js',
      format: 'es',
      name: 'microsoftTeams',
      sourcemap: true,
      globals: {
        buffer: 'buffer',
      },
      plugins: [
        json(),
        minify({
          comments: false,
        }),
      ],
      preserveModules: true,
    },
    {
      file: 'dist/MicrosoftTeams.min.js',
      format: 'es',
      name: 'microsoftTeams',
      sourcemap: true,
      globals: {
        buffer: 'buffer',
      },
      plugins: [
        json(),
        minify({
          comments: false,
        }),
      ],
      preserveModules: true,
    },
  ],
  plugins: [typescript(), json()],
  external: ['buffer'],
};
