import { H3 } from "h3";
import { handleRequest } from "zro/server.edge";
import { createRouter } from "./dist/server/router.server.mjs";

const app = new H3();
app.use(async (e) => handleRequest(e, await createRouter()));

export default {
  fetch: (req, env, ctx) => {
    return app.fetch(req, env, ctx);
  },
};
