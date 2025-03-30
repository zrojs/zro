import defu from "defu";
import { joinURL } from "ufo";
import { unctxPlugin } from "unctx/plugin";
import { createUnplugin, UnpluginOptions } from "unplugin";
import { prepare } from "./generators";
export type ZroUnpluginOptions = {
  plugins: string[];
};

export default createUnplugin<ZroUnpluginOptions | undefined>(
  (_options, meta) => {
    const routesDir = process.cwd() + "/routes";
    const options = defu(_options, { plugins: [] });

    // import plugins one by one, then set them up here
    return [
      {
        name: "zro-vite-plugin",
        async buildStart() {
          await prepare({ routesDir, options });
        },
        async watchChange(id, change) {
          if (!id.startsWith(joinURL(process.cwd(), ".zro"))) {
            await prepare({ routesDir, options });
          }
        },
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
                exclude: ["zro/router", "zro/react"],
              },
              esbuild: {
                jsx: "automatic",
              },
              resolve: {
                dedupe: [
                  "react",
                  "react-dom",
                  "zro",
                  "zro/router",
                  "zro/react",
                ],
              },
              ssr: {
                external: ["zro/react"],
                noExternal: ["zro/router"],
                optimizeDeps: {
                  include: [
                    "react",
                    "react/jsx-runtime",
                    "react/jsx-dev-runtime",
                    "react-dom/client",
                  ],
                  exclude: ["zro/react", "zro/router"],
                },
              },
            };
          },
        },
      },
      unctxPlugin.raw({}, meta) as UnpluginOptions,
    ];
  }
);
