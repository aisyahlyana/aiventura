// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Brand images live on Lovable's asset host (/__l5e/...). Off Lovable, `npm run dev:local`
// proxies them from the project's Lovable preview so they show on localhost.
const lovableAssets = process.env["LOVABLE_ASSETS_PROXY"]
  ? { "/__l5e": { target: "https://5cd3f99d-afb4-4001-a344-85ac6093f5cc.lovableproject.com", changeOrigin: true } }
  : undefined;

export default defineConfig({
  vite: lovableAssets ? { server: { proxy: lovableAssets } } : {},
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
