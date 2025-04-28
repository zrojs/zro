import { cloudflare } from "@cloudflare/vite-plugin";
import dotenv from "dotenv";
import fs from "fs";
import { build as viteBuild } from "vite";

function loadAllEnv() {
  const env = dotenv.parse(fs.readFileSync(".env")); // or .env.production if you have one
  return env;
}

function generateProcessEnvShim() {
  const env = loadAllEnv();
  const entries = Object.entries(env).map(([key, value]) => {
    return `${JSON.stringify(key)}: ${JSON.stringify(value)}`;
  });
  return `
globalThis.process = globalThis.process || {};
globalThis.process.env = Object.assign(globalThis.process.env || {}, { ${entries.join(
    ","
  )} });
`.trim();
}

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
      outDir: "./dist",
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
        output: {
          banner: generateProcessEnvShim(),
        },
      },
    },
  });
};
