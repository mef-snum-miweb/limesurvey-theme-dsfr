import { build, context } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('esbuild').BuildOptions} */
const options = {
    entryPoints: [resolve(__dirname, 'src/index.js')],
    outfile: resolve(__dirname, 'scripts/custom.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2017'],
    charset: 'utf8',
    logLevel: 'info',
    legalComments: 'none',
    minify: false,
    sourcemap: false,
    banner: {
        js: '/* Thème DSFR pour LimeSurvey — bundle généré par esbuild depuis src/. Ne pas éditer à la main. */',
    },
};

const watch = process.argv.includes('--watch');

if (watch) {
    const ctx = await context(options);
    await ctx.watch();
    console.log('[esbuild] watch: scripts/custom.js sera reconstruit à chaque modification de src/');
} else {
    await build(options);
    console.log('[esbuild] build: scripts/custom.js reconstruit');
}
