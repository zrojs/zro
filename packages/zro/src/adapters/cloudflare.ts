import { Router } from "../router";
import { handleRequest } from "../server/edge";
import { createH3App } from "../server/h3";

export type RequestHandlerOptions = {
  request: Request;
  env: Record<string, any>;
};

export type CreateRequestHandlerOptions = {
  getRouter: () => Promise<Router>;
};

export const createRequestHandler = ({
  getRouter,
}: CreateRequestHandlerOptions) => {
  return async ({ request, env }: RequestHandlerOptions) => {
    try {
      let response = await env.ASSETS.fetch(request.url, request.clone());
      response =
        response && response.status >= 200 && response.status < 400
          ? new Response(response.body, response)
          : undefined;
      if (response) return response;
    } catch {
      // ignore
    }
    globalThis.process = globalThis.process || {};
    globalThis.process.env = Object.assign(globalThis.process.env || {}, env);
    // @ts-ignore
    globalThis.__env__ = env;

    // TODO: needs optimization
    const app = createH3App({
      onError(error) {
        return new Response(error.message, { status: 500 });
      },
    });
    app.use(async (e) => handleRequest(e, await getRouter()));
    return await app.fetch(request, env);
  };
};
