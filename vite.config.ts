import { execSync } from 'node:child_process';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function resolveCommitSha(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA;
  }
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'dev';
  }
}

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// The Matomo tracking code of the former app, kept alongside Vercel Analytics
// for now. Only in builds, and not in Vercel previews, so that neither the dev
// server, the e2e tests nor the previews count as visits.
const matomo: Plugin = {
  name: 'matomo',
  apply: (_, { command }) =>
    command === 'build' &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production'),
  transformIndexHtml: () => [
    {
      tag: 'script',
      injectTo: 'head',
      children: `
      var _paq = (window._paq = window._paq || []);
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function () {
        var u = '//matomo.loicviennois.com/';
        _paq.push(['setTrackerUrl', u + 'matomo.php']);
        _paq.push(['setSiteId', '1']);
        var d = document,
          g = d.createElement('script'),
          s = d.getElementsByTagName('script')[0];
        g.async = true;
        g.src = u + 'matomo.js';
        s.parentNode.insertBefore(g, s);
      })();
    `,
    },
  ],
};

export default defineConfig({
  define: {
    __COMMIT_SHA__: JSON.stringify(resolveCommitSha()),
  },
  plugins: [
    // Must come before the React plugin
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    matomo,
    VitePWA({
      // Registered from src/lib/update.ts, which asks before activating an update.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'favicon.64.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'KSP Delta-V Planner',
        short_name: 'KSP Δv Planner',
        description:
          'Calculate rocket Delta-V for interplanetary travel in Kerbal Space Program.',
        theme_color: '#14111c',
        background_color: '#14111c',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          ...iconSizes.map((size) => ({
            src: `icons/icon-${size}x${size}.png`,
            sizes: `${size}x${size}`,
            type: 'image/png',
            purpose: 'any',
          })),
          {
            src: 'icons/maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
});
