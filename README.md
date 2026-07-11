# Prevoz

Pretraga reda vožnje Srbija Voza — direktni vozovi i putovanja sa jednim
presedanjem. React + TypeScript + Vite SPA.

## Development

```sh
pnpm install
pnpm dev        # http://localhost:5173 (proxies /redvoznje to the upstream site)
pnpm build      # typecheck + production build to dist/
pnpm check      # Biome format + lint
```

See `AGENTS.md` for architecture and conventions.

## Deploying to Cloudflare (Workers + static assets)

Everything code-side is already in the repo — the Worker that serves the app and
proxies the API (`worker/index.ts`), `wrangler.toml`, and Node/pnpm pins. No
environment variables are required: the proxy is same-origin, so the app fetches
data with zero extra config.

Manual steps in the Cloudflare dashboard (one-time):

1. **Push this repo to GitHub** (if not already): `git push -u origin main`.
2. Cloudflare dashboard → **Workers & Pages → Create → Import a repository**.
   Authorize GitHub and select this repository.
3. **Build settings** (usually auto-detected from `wrangler.toml`):
   - Build command: `pnpm build`
   - Deploy command: `npx wrangler deploy`
   - Environment variables: **none needed.**
4. **Save and Deploy** and wait for the first build.
5. **Custom domain:** open the Worker → **Settings → Domains & Routes → Add →
   Custom domain** → enter your domain. If its DNS is on Cloudflare the records
   are wired automatically; SSL is issued automatically.

After this, every push to `main` auto-builds and deploys. Local check:
`pnpm build && npx wrangler dev`.
