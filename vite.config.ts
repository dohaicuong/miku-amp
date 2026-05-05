import { defineConfig } from "vite-plus";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { pwaSetupPlugin } from "./vite-plugins/pwa-setup.ts";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site under /<repo-name>/. The deploy workflow sets
  // BASE_URL accordingly; locally it falls back to "/".
  base: process.env.BASE_URL ?? "/",
  staged: {
    "*": "vp check --fix",
  },
  fmt: { ignorePatterns: ["src/routeTree.gen.ts"] },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    options: { typeAware: true, typeCheck: true },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // tanstackRouter must run before @vitejs/plugin-react so its codegen lands
  // before React's transform sees the file.
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    pwaSetupPlugin(),
  ],
});
