import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  devToolbar: { enabled: false },
  site: 'https://isabelly.des.br',
  output: 'static',
  build: { inlineStylesheets: 'always' },
  trailingSlash: 'ignore',
  i18n: { locales: ['pt', 'en'], defaultLocale: 'pt', routing: { prefixDefaultLocale: false } },
  integrations: [
    sitemap({ filter: (url) => !/\/(?:404|treino|projetos\/case)\/?$/.test(new URL(url).pathname) }),
    {
      name: 'cloudflare-pages-localized-404',
      hooks: {
        'astro:build:done': ({ dir }) =>
          copyFile(new URL('en/404/index.html', dir), new URL('en/404.html', dir)),
      },
    },
  ],
  vite: {
    server: {
      watch: { ignored: ['**/_material/**', '**/curadoria/**', '**/docs/briefing/referencias/**'] },
    },
  },
});
