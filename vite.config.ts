import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    allowedHosts: [
      "unexpired-usable-jeep.ngrok-free.dev",
      "weekly-distant-sports-supporting.trycloudflare.com",
      "cologne-hint-lid-annotation.trycloudflare.com",
    ],
  },

  ssr: {
    noExternal: ["@shopify/shopify-app-remix"],
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
    tsconfigPaths(),
  ],
});
