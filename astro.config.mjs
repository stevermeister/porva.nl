// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://porva.nl',
  integrations: [
    sitemap({
      // Keep /review out of the sitemap — it's a private link Vladimir shares
      // directly, not something we want indexed or discoverable.
      filter: (page) => !page.includes("/review"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});