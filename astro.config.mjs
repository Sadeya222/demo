// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { SITE_URL } from './src/config/site.mjs';

// https://astro.build/config
export default defineConfig({
  // Absolute origin used by /sitemap.xml, /robots.txt and canonical/OG URLs.
  site: SITE_URL,
  // Zero-database: everything is pre-rendered at build time.
  output: 'static',
  // Allow the preview/dev proxy hostnames (sandbox previews use dynamic subdomains).
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
