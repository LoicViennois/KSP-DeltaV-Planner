# KSP Delta-V Planner

<a href="https://ksp.loicviennois.com/" target="_blank" rel="noopener"><img src="public/icons/icon-192x192.png" width="192" alt="logo" /></a>

KSP Delta-V Planner is a tool to calculate your rocket Delta-V for
interplanetary travels in [Kerbal Space Program](https://www.kerbalspaceprogram.com/).

It features an interactive map inspired by [Kowgan](https://github.com/Kowgan/ksp_cheat_sheets).

KSP Delta-V Planner is a static single-page app built with [React](https://react.dev), [TanStack Router](https://tanstack.com/router), [Tailwind CSS](https://tailwindcss.com) and [Vite](https://vite.dev), deployed on Vercel.

## Development

Tools are pinned in `mise.toml` (`mise install`).

```bash
pnpm install
pnpm dev     # dev server on http://localhost:5173
pnpm build   # type-check and build to dist/
pnpm lint
pnpm e2e     # Playwright end-to-end and accessibility tests
pnpm map     # regenerate src/assets/dv-map.svg from svg/DvMap_KSPedia.svg
pnpm icons   # regenerate the favicon and PWA icons
```
