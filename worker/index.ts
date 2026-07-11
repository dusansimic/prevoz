// Cloudflare Worker (static-assets model). Serves the built SPA from the ASSETS
// binding and proxies /redvoznje/* to the Srbija Voz timetable site, injecting
// the browser User-Agent it requires. Because the proxy is same-origin, the SDK
// works against its default `/redvoznje` baseUrl with no CORS and no env vars.

const UPSTREAM = "https://w3.srbvoz.rs";
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0";

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/redvoznje")) {
      const res = await fetch(`${UPSTREAM}${url.pathname}${url.search}`, {
        headers: { "User-Agent": BROWSER_UA, Accept: "*/*" },
      });
      const headers = new Headers();
      const contentType = res.headers.get("content-type");
      if (contentType) headers.set("content-type", contentType);
      return new Response(res.body, { status: res.status, headers });
    }

    // Everything else: static assets, with SPA fallback (see wrangler.toml).
    return env.ASSETS.fetch(request);
  },
};
