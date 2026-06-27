import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  output: 'static',
  build: {
    assets: 'wba-verify/_astro',
  },
})
