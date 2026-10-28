import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// SvelteKit 3: everything lives here; options SvelteKit does not know pass through to vite-plugin-svelte.
export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ strict: true }),
      alias: { '#lib': 'src/lib' },
      extensions: ['.svelte', '.svx'],
      preprocess: [
        mdsvex({
          extensions: ['.svx'],
          layout: { runbook: resolve('src/lib/layouts/runbook.svelte') },
        }),
      ],
    }),
  ],
});
