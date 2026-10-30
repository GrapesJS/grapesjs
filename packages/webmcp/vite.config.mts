import { defineConfig } from 'vite';

/**
 * - `vite build`: ES and CommonJS modules, dependencies are left to the consumer's bundler
 * - `vite build --mode umd`: UMD bundle for the browser, `zod` included
 */
export default defineConfig(({ mode }) => {
  const isUmd = mode === 'umd';

  return {
    build: {
      target: 'es2017',
      sourcemap: true,
      // The UMD build runs after the others, keep their output
      emptyOutDir: !isUmd,
      minify: isUmd,
      lib: {
        entry: 'src/index.ts',
        name: 'grapesjsWebMcp',
        formats: isUmd ? ['umd'] : ['es', 'cjs'],
        // `.mjs`, otherwise Node loads the ES module as CommonJS (the package has no `"type": "module"`)
        fileName: (format) => `index.${format}.${format === 'es' ? 'mjs' : 'js'}`,
      },
      rolldownOptions: {
        // GrapesJS is only used for types
        external: isUmd ? ['grapesjs'] : ['grapesjs', /^zod(\/|$)/],
        output: { exports: 'named' },
      },
    },
  };
});
