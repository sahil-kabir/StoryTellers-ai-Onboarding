import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    cloudflare({ viteEnvironment: { name: "ssr" } })
  ],
  optimizeDeps: {
    exclude: ["better-auth"], // don't pre-bundle Node entry
  },
  ssr: {
    noExternal: ["better-auth"], // force Worker-compatible ESM
  },
  build: {
    target: "es2020",
  },
});
