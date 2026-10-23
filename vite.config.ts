// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { vitePlugin as injectJsxSourcePlugin } from "@draftbit/babel-plugin-inject-jsx-source";
import type { ConfigEnv } from "vite";

const projectConfig = (env: ConfigEnv) =>
  defineConfig({
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this
      server: { entry: "server" },
      client: { entry: "client" },
    },
    vite: {
      optimizeDeps: {
        include: ["@draftbit/iframe-element-picker", "@draftbit/babel-plugin-inject-jsx-source"],
      },
    },
  })(env);

export default async (env: ConfigEnv) => {
  const config = await projectConfig(env);
  const sourcePlugin = injectJsxSourcePlugin();
  // Split routes before injecting helpers, then instrument the split JSX too.
  sourcePlugin.configResolved = (resolved) => {
    for (const plugin of resolved.plugins) {
      if (
        plugin.name.startsWith("tanstack-router:code-splitter:") &&
        typeof plugin.transform === "object"
      ) {
        plugin.transform.order = "pre";
      }
    }
  };
  const transform = sourcePlugin.transform;
  if (typeof transform === "function") {
    sourcePlugin.transform = function (code, id, options) {
      return transform.call(this, code, id.split("?")[0] ?? id, options);
    };
  }
  return {
    ...config,
    plugins: [sourcePlugin, ...(config.plugins ?? [])],
  };
};
