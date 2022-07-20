const { MINIFY } = process.env;
const minified = MINIFY === 'true';
const outputFile = minified ? 'dist/mapboxgl-measure-tools.js' : 'dist/mapboxgl-measure-tools-unminified.js';

import replace from '@rollup/plugin-replace';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';

export default {
	input: ['index.js'],
	output: {
		name: 'MapboxglMeasureTools',
		file: outputFile,
		format: 'umd',
		sourcemap: true,
		indent: false
	},
	treeshake: true,
	plugins: [
		replace({
			'process.env.NODE_ENV': '\'browser\''
		}),
		buble({ transforms: { dangerousForOf: true }, objectAssign: 'Object.assign' }),
		minified ? terser() : false,
		resolve({
			browser: true,
			preferBuiltins: true
		}),
		builtins(),
		commonjs({
			ignoreGlobal: true
		})
	]
};
