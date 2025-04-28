import { H3 } from "h3";
import { handleRequest } from "zro/server.edge";
import { createRouter } from "../dist/server/router.server.mjs";

const app = new H3();
app.use(async (e) => handleRequest(e, await createRouter()));

export const onRequest = async ({ request, env }) => {
  try {
    let response = await env.ASSETS.fetch(request.url, request.clone());
    response =
      response && response.status >= 200 && response.status < 400
        ? new Response(response.body, response)
        : undefined;
    if (response) return response;
  } catch (e) {
    console.error(e);
  }
  globalThis.process = globalThis.process || {};
  globalThis.process.env = Object.assign(globalThis.process.env || {}, env);
  globalThis.__env__ = env;
  return await app.fetch(request, env);
};
