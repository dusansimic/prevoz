// Cloudflare Worker (static-assets model). Serves the built SPA from the ASSETS
// binding and proxies the two Srbija Voz upstreams, injecting the browser
// User-Agent they require. Because the proxies are same-origin, both the SDK
// (`/redvoznje`) and the e-karta client (`/ekarta`) work with no CORS and no
// env vars.
// - /redvoznje/* → the timetable site (w3.srbvoz.rs).
// - /ekarta/*    → the ticket shop API (webapi1.srbvoz.rs), path rewritten to
//                  the upstream's capital-K `/eKarta`.

const UPSTREAM = "https://w3.srbvoz.rs";
const EKARTA_UPSTREAM = "https://webapi1.srbvoz.rs";
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0";

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

/** Fetch an upstream URL with the browser UA and pass the content-type back. */
async function proxyUpstream(target: string): Promise<Response> {
  const res = await fetch(target, {
    headers: { "User-Agent": BROWSER_UA, Accept: "*/*" },
  });
  const headers = new Headers();
  const contentType = res.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  return new Response(res.body, { status: res.status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/redvoznje")) {
      return proxyUpstream(`${UPSTREAM}${url.pathname}${url.search}`);
    }

    if (url.pathname.startsWith("/ekarta")) {
      const upstreamPath = url.pathname.replace(/^\/ekarta/, "/eKarta");
      return proxyUpstream(`${EKARTA_UPSTREAM}${upstreamPath}${url.search}`);
    }

    // Everything else: static assets, with SPA fallback (see wrangler.toml).
    return env.ASSETS.fetch(request);
  },
};
