import { colors } from "consola/utils";
import {
  eventHandler,
  fromNodeHandler,
  getRequestURL,
  H3,
  toNodeHandler,
} from "h3";
import { listen, Listener } from "listhen";
import { AsyncLocalStorage } from "node:async_hooks";
import { createContext } from "unctx";
import { extractUnheadInputFromHtml } from "unhead/server";
import { createServer } from "vite";
import loadingSpinner from "yocto-spinner";
import { Youch } from "youch";
import { Router as ZroRouter } from "./router/Router";
import { handleRequest } from "./server/node";
import { upperFirst } from "./utils/tools";
import { viteContext } from "./vite-context";

const serverContext = createContext<H3>({
  asyncContext: true,
  AsyncLocalStorage,
});
export const useServer = serverContext.use;

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
  const app = new H3({
    async onError(error, event) {
      const youch = new Youch();
      const html = await youch.toHTML(error);
      console.log(await youch.toANSI(error));
      return html;
    },
  });

  return serverContext.call(app, async () => {
    const vite = await createServer({
      server: {
        middlewareMode: true,
      },
      clearScreen: false,
      appType: "custom",
    });
    return viteContext.call(vite, async () => {
      app.use(fromNodeHandler(vite.middlewares));
      app.use(
        eventHandler(async (e) => {
          const req = getRequestURL(e);
          const { createRouter } = (await vite.ssrLoadModule(
            "/.zro/router.server"
          )) as { createRouter: () => Promise<ZroRouter> };
          const url = req.href;
          const viteHtml = await vite.transformIndexHtml(
            url,
            "<html><head></head><body></body></html>"
          );
          const { input } = extractUnheadInputFromHtml(viteHtml);
          return handleRequest(e, await createRouter(), input);
        })
      );
      await vite.warmupRequest("/.zro/router.client");
      const listener = await listen(toNodeHandler(app), {
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
