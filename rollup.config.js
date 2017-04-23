import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const minify = process.env.MINIFY;
const format = process.env.FORMAT;

export default {
  format,
  entry: 'src/index.js',
  targets: [
    { dest: `lib/vox-parser.${format}${minify ? '.min' : ''}.js`, format },
  ],
  moduleName: 'VoxParser',
  plugins: [
    babel({
      babelrc: false,
      presets: [['env', { modules: false }]],
      plugins: ['external-helpers'],
    }),
    minify ? uglify() : null,
  ].filter(Boolean),
};
