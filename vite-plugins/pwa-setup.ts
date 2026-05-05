import { VitePWA } from "vite-plugin-pwa";

/**
 * Wraps `vite-plugin-pwa` with this app's manifest, precache shell list,
 * and runtime caching rules. Returns the Vite plugin (or array of plugins)
 * VitePWA produces — drop straight into `plugins: []`.
 *
 * Caching strategy at a glance:
 *  - Precache: app shell (JS/CSS/HTML/fonts/SVG icons) plus the manifest /
 *    favicon / apple-touch / launcher icons referenced from index.html.
 *  - `ma-images` (CacheFirst): mascot animation frames, cover art, the
 *    static wallpaper. Effectively immutable — fingerprinted or replaced
 *    with a new path when art changes.
 *  - `ma-docs` (StaleWhileRevalidate): component-doc markdown fetched at
 *    runtime by `ComponentDoc`. SWR so docs read offline and pick up
 *    edits on the next online visit.
 *
 * Registration is driven manually from React via `useRegisterSW` so the
 * update toast (see PwaUpdateToast) controls when a new SW takes over —
 * we never want to rip the page out from under a user mid-session.
 */
export function pwaSetupPlugin() {
  return VitePWA({
    // Prompt mode: a new SW waits for explicit user opt-in via the update
    // toast. Avoids ripping the page out from under a user mid-session.
    registerType: "prompt",
    // Registration is handled manually through the useRegisterSW hook so we
    // can drive the toast UI from React state.
    injectRegister: false,
    // Static files referenced from index.html / manifest that aren't picked
    // up by globPatterns (which only sweeps the app shell). Listing them
    // here ensures they're precached.
    includeAssets: [
      "favicon-16.png",
      "favicon-32.png",
      "apple-touch-icon.png",
      "icon-192.png",
      "icon-512.png",
    ],
    manifest: {
      name: "Miku Amp",
      short_name: "Miku Amp",
      description:
        "Local-library music player tuned for the HiBy Digital M500 (Miku edition). Dark, OLED-friendly, two-accent.",
      // `theme_color` tints the browser/OS chrome (Android URL bar, iOS
      // standalone status bar) — the cyan accent doubles as a brand cue,
      // mirroring the M500's own chassis colour. `background_color` is the
      // pre-paint splash on Android — kept matching the app's `--bg` so
      // the cold start doesn't flash a different colour before first paint.
      theme_color: "#39c5bd",
      background_color: "#0a0d0f",
      display: "standalone",
      icons: [
        {
          src: "icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ],
    },
    workbox: {
      // Precache the app shell only — JS/CSS/HTML/fonts/SVG icons. Mascot
      // animation frames, cover art, and doc markdown fall through to the
      // runtimeCaching rules below so a first install stays light and
      // content caches as it's browsed.
      globPatterns: ["**/*.{js,css,html,svg,woff2}"],
      runtimeCaching: [
        {
          // Mascot animation frames (~285 PNGs), cover art, the static
          // wallpaper. Cache-first because these almost never change once
          // shipped — a new build with renamed frames bypasses the cache
          // anyway.
          urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "ma-images",
            expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          // Component-doc markdown lives at `public/design-system/.../*.md`
          // and is fetched at runtime by `ComponentDoc`. SWR so docs read
          // offline against the last-seen copy and pick up edits on the
          // next online visit.
          urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.endsWith(".md"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "ma-docs",
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
      ],
    },
    devOptions: {
      // Enabling this lets you test the service worker during `vp dev`.
      // Off by default to avoid stale-cache surprises while iterating.
      enabled: false,
    },
  });
}
