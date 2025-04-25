import { transform } from "@babel/core";
import defu from "defu";
import { joinURL } from "ufo";
import { createUnplugin } from "unplugin";
import { createFilter, loadEnv, ViteDevServer } from "vite";
import { viteContext } from "../dev-server";
import deadImportsRemover from "./babel/dead-imports-remover";
import serverCodeRemover, {
  stripAnnotatedBlocks,
} from "./babel/server-code-remover";
import { prepare } from "./generators";

export type ZroUnpluginOptions = {
  plugins: string[];
};

export default createUnplugin<ZroUnpluginOptions | undefined>(
  (_options, meta) => {
    const routesDir = process.cwd() + "/routes";
    const options = defu(_options, { plugins: [] });
    let vite: ViteDevServer | null = null;
    const ziroRouterLibFilter = createFilter(
      ["**/zro/dist/src/router/*.{js,jsx,ts,tsx}"],
      null
    );
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
            const vars = loadEnv(env.mode, process.cwd(), "");
            Object.assign(process.env, vars);
            return {
              ...config,
              logLevel: "warn",
              optimizeDeps: {
                include: [
                  "react",
                  "react/jsx-runtime",
                  "react/jsx-dev-runtime",
                  "react-dom",
                  "react-dom/client",
                  "zro/router",
                ],
                exclude: [
                  "zro/react",
                  "zro/plugin",
                  "zro/react/client-entry",
                  ...options.plugins,
                ],
              },
              esbuild: {
                jsx: "automatic",
              },
              resolve: {
                dedupe: ["react", "react-dom", "zro/react", "zro/plugin"],
              },
              ssr: {
                external: ["zro/react"],
                noExternal: ["zro/plugin", ...options.plugins],
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
            // console.log(id);
            if (
              !id.startsWith(joinURL(process.cwd(), ".zro")) &&
              !!vite?.moduleGraph.getModuleById(id)
            ) {
              vite.moduleGraph.invalidateModule(
                vite.moduleGraph.getModuleById(id)!
              );
              await viteContext.callAsync(vite!, async () => {
                return await prepare({ routesDir, options });
              });
            }
          },
          async transform(code, id, options) {
            const { ssr } = options || { ssr: false };
            if (!ssr && ziroRouterLibFilter(id)) {
              const res = transform(code, {
                filename: id,
                targets: {
                  esmodules: true,
                },
                plugins: [stripAnnotatedBlocks()],
              });

              return transform(res!.code!, {
                filename: id,
                targets: {
                  esmodules: true,
                },
                plugins: [deadImportsRemover()],
              })!.code!;
            }
            if (!ssr && routeFilesFilter(id)) {
              let res = transform(code, {
                filename: id,
                targets: {
                  esmodules: true,
                },
                plugins: [serverCodeRemover()],
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
          async resolveId(source, importer, options) {
            if (source == "virtual:zro/router.client") {
              return "/.zro/router.client";
            }
            if (source == "/@zro/client-entry") {
              const isClientEntryExists = await this.resolve("/client-entry");
              if (isClientEntryExists) return isClientEntryExists.id;
              return await this.resolve("zro/react/client-entry", undefined, {
                skipSelf: true,
              }).then((resolved) => resolved?.id);
            }
            return null;
          },
        },
      },
      // unctxPlugin.raw({}, meta) as UnpluginOptions,
    ];
  }
);
