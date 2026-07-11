import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const UPSTREAM = "https://w3.srbvoz.rs";
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0";

// The timetable site sends no CORS headers, so the browser cannot call it
// directly, and it 404s any request without a browser-like User-Agent (which
// the browser is not allowed to set from fetch). Proxy `/redvoznje` to the
// upstream site and inject a UA. The SDK is pointed at `/redvoznje` in
// src/lib/sdk.ts so every call flows through here.
const proxy = {
  "/redvoznje": {
    target: UPSTREAM,
    changeOrigin: true,
    headers: { "User-Agent": BROWSER_UA },
  },
};

export default defineConfig({
  // Public base path. Root by default; a project GitHub Pages site is served
  // under `/<repo>/`, so the deploy workflow sets `VITE_BASE=/<repo>/`.
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: { proxy },
  preview: { proxy },
});
