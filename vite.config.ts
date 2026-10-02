import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { embeddedAssets } from "./inline-assets.ts";
const root = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({
  root, base: "/", publicDir: false,
  plugins: [embeddedAssets(root)],
  build: {
    outDir: "dist", emptyOutDir: true, target: "esnext", cssCodeSplit: false,
    assetsInlineLimit: Number.POSITIVE_INFINITY, modulePreload: false,
    rolldownOptions: { output: { codeSplitting: false, entryFileNames: "assets/index.js",
      assetFileNames: asset => asset.names.some(name => name.endsWith(".css")) ? "assets/index.css" : "assets/[name][extname]" } },
  },
});
