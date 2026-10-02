# Vitified project

This unbuilt Vite wrapper uses no-public mode. Run `bun install`, then
`bun run serve` or `bun run build` yourself. The source project is untouched.

Runtime modules live in `src/embedded` and `src/app`. URL-addressed assets
are embedded as data URLs by `inline-assets.ts`. A small in-page adapter
resolves bundled module imports and local asset fetches; no server or service
worker is required. Unknown URLs retain their original behavior.

Production output is `index.html`, `assets/index.js`, optional
`assets/index.css`, and content-hashed WASM/engine files in `assets/`.
The build fails rather than silently emitting unrelated files.
Source notices and source maps are kept in the wrapper, not deployed as assets.
The base `/` applies to any host serving that path; no domain is required.
