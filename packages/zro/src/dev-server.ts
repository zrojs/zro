import { colors } from "consola/utils";
import { upperFirst } from "es-toolkit";
import {
  App,
  createApp,
  eventHandler,
  fromNodeMiddleware,
  toNodeListener,
  toWebRequest,
} from "h3";
import { listen, Listener } from "listhen";
import { AsyncLocalStorage } from "node:async_hooks";
import { Router as ZroRouter } from "src/router";
import { handleRequest } from "src/server";
import { extractUnheadInputFromHtml } from "src/unhead/server";
import { createContext } from "unctx";
import { createServer, ViteDevServer } from "vite";
import loadingSpinner from "yocto-spinner";

const serverContext = createContext<App>({
  asyncContext: true,
  AsyncLocalStorage,
});
export const useServer = serverContext.use;

const viteContext = createContext<ViteDevServer>({
  asyncContext: true,
  AsyncLocalStorage,
});
export const useVite = viteContext.use;

const startingServerSpinner = loadingSpinner({
  text: colors.dim(`Starting server...`),
  spinner: {
    interval: 160,
    frames: [`  ${colors.yellow(`⦾`)}`, `  ${colors.yellow(`⦿`)}`],
  },
});

export const bootstrapDevServer = async ({
  host = false,
}: {
  host: boolean;
}) => {
  startingServerSpinner.start();
  const app = createApp();

  return serverContext.call(app, async () => {
    const vite = await createServer({
      server: {
        middlewareMode: true,
      },
      clearScreen: false,
      appType: "custom",
    });
    return viteContext.call(vite, async () => {
      // load zro options here
      app.use(fromNodeMiddleware(vite.middlewares));
      app.use(
        eventHandler(async (e) => {
          const { router } = (await vite.ssrLoadModule(
            "/.zro/router.server"
          )) as { router: ZroRouter };
          const req = toWebRequest(e);
          const viteHtml = await vite.transformIndexHtml(
            req.url,
            "<html><head></head><body></body></html>"
          );
          const { input } = extractUnheadInputFromHtml(viteHtml);
          return handleRequest(e, router, input);
        })
      );
      const listener = await listen(toNodeListener(app), {
        isProd: false,
        showURL: false,
        ws: false,
        autoClose: true,
      });
      startingServerSpinner.stop();
      startingServerSpinner.clear();
      await new Promise((r) => setTimeout(r, 10));
      printServerInfo(listener, host);
      return { listener, vite, h3: app };
    });
  });
};

const printServerInfo = async (listener: Listener, host: boolean) => {
  console.log(`  ${colors.green(`⦿`)} ${colors.dim(`Server is up!`)}`);
  const maxTypeLength =
    Math.max(
      ...(await listener.getURLs()).map((serverUrl) => serverUrl.type.length),
      "network".length
    ) + 1;
  (await listener.getURLs()).forEach((serverUrl) => {
    const paddedType = serverUrl.type.padEnd(maxTypeLength);
    console.log(
      `  ${colors.blueBright("⦿")} ${colors.dim(
        upperFirst(paddedType)
      )}: ${colors.whiteBright(colors.bold(colors.underline(serverUrl.url)))}`
    );
  });
  if (!host)
    console.log(
      `  ${colors.dim("𐄂")} ${colors.dim(
        "Network".padEnd(maxTypeLength) + ":"
      )} ${colors.dim("use --host to expose network access")}`
    );
  console.log();
};
