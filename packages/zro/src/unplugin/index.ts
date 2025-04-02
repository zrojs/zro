import { transform } from "@babel/core";
import defu from "defu";
import { viteContext } from "src/dev-server";
import deadImportsRemover from "src/unplugin/babel/dead-imports-remover";
import serverCodeRemover from "src/unplugin/babel/server-code-remover";
import { joinURL } from "ufo";
import { unctxPlugin } from "unctx/plugin";
import { createUnplugin, UnpluginOptions } from "unplugin";
import { createFilter, ViteDevServer } from "vite";
import { prepare } from "./generators";

export type ZroUnpluginOptions = {
  plugins: string[];
};

export default createUnplugin<ZroUnpluginOptions | undefined>(
  (_options, meta) => {
    const routesDir = process.cwd() + "/routes";
    const options = defu(_options, { plugins: [] });
    let vite: ViteDevServer | null = null;
    const routeFilesFilter = createFilter(
      ["routes/**/index.{js,jsx,ts,tsx}", "routes/**/_layout.{js,jsx,ts,tsx}"],
      null
    );
    const configFilesFilter = createFilter(
      ["configs/**/*.{js,jsx,ts,tsx}"],
      null
    );

    // import plugins one by one, then set them up here
    return [
      {
        name: "zro-vite-plugin",
        vite: {
          config(config, env) {
            return {
              ...config,
              logLevel: "warn",
              optimizeDeps: {
                include: [
                  "react",
                  "react/jsx-runtime",
                  "react/jsx-dev-runtime",
                  "react-dom/client",
                ],
                exclude: [
                  "zro/plugin",
                  "zro/router",
                  "zro/react",
                  ...options.plugins,
                ],
              },
              esbuild: {
                jsx: "automatic",
              },
              resolve: {
                dedupe: [
                  "react",
                  "react-dom",
                  "zro/router",
                  "zro/react",
                  "zro/plugin",
                ],
              },
              ssr: {
                external: ["zro/react"],
                noExternal: ["zro/router", "zro/plugin", ...options.plugins],
              },
            };
          },
          configureServer(server) {
            vite = server;
          },
          async buildStart() {
            await viteContext.callAsync(vite!, async () => {
              return await prepare({ routesDir, options });
            });
          },
          async watchChange(id, change) {
            if (!id.startsWith(joinURL(process.cwd(), ".zro"))) {
              vite!.moduleGraph.invalidateModule(
                vite?.moduleGraph.getModuleById(id)!
              );
              await viteContext.callAsync(vite!, async () => {
                return await prepare({ routesDir, options });
              });
            }
          },
          async transform(code, id, options) {
            const { ssr } = options || { ssr: false };
            if (_options && !ssr && routeFilesFilter(id)) {
              const res = transform(code, {
                filename: id,
                targets: {
                  esmodules: true,
                },
                plugins: [serverCodeRemover(), deadImportsRemover()],
              });

              return transform(res!.code!, {
                filename: id,
                targets: {
                  esmodules: true,
                },
                plugins: [deadImportsRemover()],
              })!.code!;
            }
            return code;
          },
        },
      },
      unctxPlugin.raw({}, meta) as UnpluginOptions,
    ];
  }
);
