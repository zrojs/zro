import { cloudflare } from "@cloudflare/vite-plugin";
import { build as viteBuild } from "vite";

export const build = async () => {
  // Build client
  await viteBuild({
    appType: "custom",
    mode: "production",
    plugins: [cloudflare()],
    resolve: {
      alias: {
        "virtual:zro/router.client": "./.zro/router.client.ts",
      },
    },
    build: {
      outDir: "./dist/client",
      emptyOutDir: false,
      rollupOptions: {
        input: ["zro/react/client-entry"],
        output: {
          entryFileNames: "zro_client-entry.js",
        },
      },
    },
  });

  // Build server
  await viteBuild({
    appType: "custom",
    mode: "production",
    plugins: [cloudflare()],
    resolve: {
      alias: {
        "react-dom/server.browser": "react-dom/server.edge",
      },
    },
    build: {
      outDir: "./dist/server",
      emitAssets: false,
      emptyOutDir: false,
      copyPublicDir: false,
      ssr: true,
      rollupOptions: {
        input: "./.zro/router.server.ts",
      },
    },
  });
};
