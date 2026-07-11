// Cloudflare Pages Function: proxies /redvoznje/* to the Srbija Voz timetable
// site, injecting the browser User-Agent it requires. Because it runs on the
// same origin as the static app, no CORS headers are needed and the SDK's
// default baseUrl (`/redvoznje`) works unchanged — no VITE_API_BASE required.
//
// The `[[path]]` catch-all matches every path under /redvoznje.

const UPSTREAM = "https://w3.srbvoz.rs";
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0";

interface Context {
  request: Request;
}

export const onRequest = async ({ request }: Context): Promise<Response> => {
  const url = new URL(request.url);
  // url.pathname already starts with `/redvoznje`, mirroring the Vite proxy.
  const upstream = `${UPSTREAM}${url.pathname}${url.search}`;

  const res = await fetch(upstream, {
    headers: { "User-Agent": BROWSER_UA, Accept: "*/*" },
  });

  // Pass the body and content-type straight through (same-origin, so no CORS).
  const headers = new Headers();
  const contentType = res.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  return new Response(res.body, { status: res.status, headers });
};
