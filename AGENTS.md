# Prevoz — Coding Conventions

SPA for searching the Serbian railway (Srbija Voz) timetable: direct trains and
one-transfer journeys. `CLAUDE.md` is a symlink to this file.

## Stack

- **Framework:** React 19 + TypeScript (strict)
- **Build/dev:** Vite 8
- **Package manager:** pnpm
- **Router:** React Router 7 (`react-router-dom`)
- **UI:** shadcn/ui-style components + Tailwind CSS v4 (`@tailwindcss/vite`)
- **Lint/format:** Biome 2 (`pnpm check` / `pnpm lint` / `pnpm format`)
- **Data SDK:** `@dusansimic/srbijavoz-sdk`, vendored under `src/lib/srbijavoz-sdk`
  (see § SDK)

## Commands

- `pnpm dev` — dev server (with the upstream proxy, see § Networking)
- `pnpm build` — `tsc` typecheck + `vite build`
- `pnpm check` — Biome format + lint + import sort, with `--write`
- `pnpm lint` — lint only

Run `pnpm check` and `pnpm build` before every commit.

## Project structure

```
src/
├── components/
│   ├── ui/         # shadcn/ui-style primitives (button, card, command, …)
│   ├── features/   # StationCombobox, SearchForm, results, train details
│   └── theme-toggle.tsx
├── hooks/          # use-theme, use-stations, use-train-search
├── lib/
│   ├── srbijavoz-sdk/  # VENDORED SDK (third-party; excluded from lint)
│   ├── sdk.ts      # configured SrbijaVoz client (proxy baseUrl + bound fetch)
│   ├── transfers.ts    # one-transfer journey planner
│   ├── datetime.ts, types.ts, utils.ts
├── pages/          # route pages (SearchPage, SettingsPage)
├── stores/         # zustand stores (settings — persisted to localStorage)
├── services/       # train-service.ts — the only module UI calls for data
├── App.tsx         # providers + router + layout
└── main.tsx        # entry (#root)
```

## SDK

The SDK is published to **GitHub Packages**, which requires a token with
`read:packages`. The current environment's token lacks that scope, so the SDK
source is **vendored** under `src/lib/srbijavoz-sdk/` (imports made extensionless
for Vite). To switch to the published package:

1. In `.npmrc`, uncomment the `_authToken` line and export a `GITHUB_TOKEN`
   with `read:packages`.
2. `pnpm add @dusansimic/srbijavoz-sdk`
3. Delete `src/lib/srbijavoz-sdk/` and point the imports in `src/lib/sdk.ts` and
   `src/lib/types.ts` at `@dusansimic/srbijavoz-sdk`.

Always go through `src/services/train-service.ts`; never import the SDK from a
component. `train-service` handles station caching, Belgrade-first ordering,
direct search, transfer planning, and details.

## Networking (important)

The upstream site (`w3.srbvoz.rs/redvoznje`) sends **no CORS headers** and 404s
requests without a browser-like `User-Agent` (which the browser cannot set from
`fetch`). Two consequences already handled:

- **Proxy:** `vite.config.ts` proxies `/redvoznje` → the upstream and injects a
  UA. The SDK's `baseUrl` is `/redvoznje` so all calls flow through it. This
  proxy exists for `server` **and** `preview`. In production the same `/redvoznje`
  path is served by the Cloudflare Pages Function (see § Deployment) — a plain
  static host alone will not work.
- **Bound fetch:** the SDK stores `fetch` as an instance field, so it must be
  passed a wrapper (`(i, init) => fetch(i, init)`) or the browser throws
  "Illegal invocation". Done in `src/lib/sdk.ts`.

## Deployment (Cloudflare Workers + static assets)

Deployed as a **Cloudflare Worker with static assets** — the Worker serves the
built SPA **and** proxies the `/redvoznje` API on the same origin, so there is no
CORS problem and **no `VITE_API_BASE` is needed**; the SDK's default `/redvoznje`
works in production exactly as in dev.

In-repo config (all committed, nothing to configure by hand):

- `worker/index.ts` — the Worker. Serves `dist` via the `ASSETS` binding and
  proxies `/redvoznje/*` to the upstream with the browser UA. It is bundled by
  Wrangler, not by Vite, and is excluded from the app `tsc` build.
- `wrangler.toml` — `main = worker/index.ts`, `[assets] directory = "./dist"` with
  `not_found_handling = "single-page-application"` (SPA fallback).
- `.nvmrc` (Node 22) and `package.json#packageManager` (pnpm) pin the toolchain.
- `VITE_BASE` stays `/` — served from a custom-domain root.

The build pipeline runs `pnpm build` then `npx wrangler deploy`. Every push to
`main` (Git integration) rebuilds and redeploys. Custom domain + free SSL are set
on the Worker. See README for the console steps. Local check:
`pnpm build && npx wrangler dev`.

## Features: search & transfers

- **Direct:** `searchDirect(from, to, dateIso)`.
- **Transfers (one change):** `planTransfers(...)` in `train-service` →
  `planOneTransfer` in `lib/transfers.ts`. Candidate transfer stations are tried
  **Belgrade stations first, then all others** (`scope: "belgrade" | "all"`; the
  UI defaults to `belgrade`, with a toggle for `all`). For each candidate it
  searches both legs and pairs each first leg with the earliest valid second leg
  (layover between `minTransferMinutes` and `maxTransferMinutes`). Concurrency is
  capped; a failing relation is skipped, not fatal. The min-transfer and
  max-layover bounds are user-configurable on the **Settings** page (`/settings`),
  persisted via the zustand store in `stores/settings.ts`; unset → the defaults
  in `lib/transfers.ts`. `use-train-search` reads them at search time.
- Station selectors filter the cached directory locally, accent-insensitive
  (`foldText`); typing does not hit the network.

## Conventions

- **Components:** PascalCase files. **Non-components:** kebab-case
  (`use-train-search.ts`, `train-service.ts`).
- **Types:** shared domain shapes live in `lib/types.ts` (SDK types re-exported
  there). Prefer interfaces for props; avoid `any` (`unknown` + narrowing).
- **Functional components + hooks** only; extract non-trivial logic into hooks.
- **Styling:** Tailwind utilities over the shadcn token set (`bg-background`,
  `text-foreground`, `bg-primary`, `border-border`, …). The **navy** palette and
  light/dark values are defined once as CSS variables in `src/index.css`; dark
  mode is the `.dark` class on `<html>`, driven by `ThemeProvider`. No inline
  styles, no ad-hoc hex colors in components.
- **UI text is in Serbian (Latin).**
- **Biome:** 2-space indent, double quotes, semicolons, trailing commas, ~90 col.
  The vendored SDK and `*.svg` are exempted via `biome.json` overrides.

## Git & commits

- **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`…).
- **One feature / logical unit per commit.** Stage and commit related changes
  together, not the whole tree at once.
- Generate messages with **`/caveman:caveman-commit`**.
- Run `pnpm check` before committing.

## References

- **shadcn/ui:** https://ui.shadcn.com/llms.txt
- **Tailwind CSS v4:** https://tailwindcss.com/docs
- **React Router 7:** https://reactrouter.com/
- **Biome:** https://biomejs.dev/
- **SDK:** https://github.com/dusansimic/srbijavoz-sdk
