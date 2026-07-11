import { SrbijaVoz } from "@/lib/srbijavoz-sdk";

// Where SDK requests are sent. Defaults to the Vite dev/preview proxy
// (`/redvoznje` → w3.srbvoz.rs), which injects the browser User-Agent the
// upstream site requires. On a static host (e.g. GitHub Pages) there is no such
// proxy, so set `VITE_API_BASE` at build time to an external proxy that adds
// CORS headers and the UA — see AGENTS.md § Deployment.
const API_BASE = import.meta.env.VITE_API_BASE ?? "/redvoznje";

// Single shared client.
export const sv = new SrbijaVoz({
  baseUrl: API_BASE,
  lang: "sr",
  // The browser's `fetch` throws "Illegal invocation" when called with a
  // receiver other than `window`; the SDK stores it as an instance field, so
  // hand it a wrapper bound to the global scope.
  fetch: (input, init) => fetch(input, init),
});
