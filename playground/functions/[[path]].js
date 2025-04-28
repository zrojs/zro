import { createRequestHandler } from "zro/adapters/cloudflare";

export const onRequest = createRequestHandler({
  getRouter: () => {
    return import(`../dist/server/router.server.mjs`).then((m) =>
      m.createRouter()
    );
  },
});
