import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vitePlugin as injectJsxSourcePlugin } from "@draftbit/babel-plugin-inject-jsx-source";

const sourcePlugin = injectJsxSourcePlugin();
const transform = sourcePlugin.transform;
if (typeof transform === "function") {
  sourcePlugin.transform = function (code, id, options) {
    return transform.call(this, code, id.split("?")[0] ?? id, options);
  };
}

export default defineConfig({
  plugins: [
    sourcePlugin,
    tanstackRouter({ target: "react", autoCodeSplitting: false }),
    reactRouter(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: { dedupe: ["react", "react-dom", "@tanstack/react-router"] },
  optimizeDeps: {
    include: ["@draftbit/iframe-element-picker", "@draftbit/babel-plugin-inject-jsx-source"],
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env["WORKING_METRO_PORT"] ?? 36259),
    strictPort: true,
    cors: true,
    allowedHosts: true,
  },
});
