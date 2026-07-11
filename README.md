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

## Deploying to Cloudflare Pages

Everything code-side is already in the repo — the `/redvoznje` proxy
(`functions/redvoznje/[[path]].ts`), `wrangler.toml`, SPA `_redirects`, and Node/
pnpm pins. No environment variables are required: the proxy is same-origin, so the
app fetches data with zero extra config.

Manual steps in the Cloudflare dashboard (one-time):

1. **Push this repo to GitHub** (if not already): create a repo and
   `git push -u origin main`.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
   Authorize GitHub and select this repository.
3. **Build settings:**
   - Production branch: `main`
   - Framework preset: **Vite** (or None)
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - (Root directory: leave as `/`.)
   - Environment variables: **none needed.**
4. Click **Save and Deploy** and wait for the first build.
5. **Custom domain:** open the Pages project → **Custom domains → Set up a custom
   domain** → enter your domain. If the domain's DNS is on Cloudflare it wires the
   records automatically; otherwise follow the shown CNAME. SSL is issued
   automatically.

After this, every push to `main` auto-builds and deploys. To test the Function
locally: `pnpm build && npx wrangler pages dev dist`.
