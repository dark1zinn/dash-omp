import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const input = {
  "index": "index.html"
};

export default defineConfig({
  root,
  base: "/",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: Number.POSITIVE_INFINITY,
    rolldownOptions: {
      input: Object.fromEntries(
        Object.entries(input).map(([name, file]) => [name, path.resolve(root, file)]),
      ),
        output: {
          codeSplitting: false,
          entryFileNames: "assets/index.js",
          assetFileNames(asset) {
            const names = asset.names ?? [];
            return names.some((name) => name.endsWith(".css"))
              ? "assets/index.css"
              : "assets/[name][extname]";
          },
        }
    },
  },
});
