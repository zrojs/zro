import {
  getHeader,
  H3Event,
  setHeader,
  setResponseStatus,
  toWebRequest,
} from "h3";
import React from "react";
import { encode } from "turbo-stream";
import { SerializableHead } from "unhead/types";
import { Router } from "./react";
import { Router as ZroRouter } from "./router/Router";
// @ts-expect-error
import { renderToReadableStream } from "react-dom/server.browser";
import { withTrailingSlash } from "ufo";
import { transformHtmlTemplate } from "unhead/server";
import { Cache } from "./react/cache";

export const handleRequest = async (
  e: H3Event,
  router: ZroRouter,
  extraHead?: SerializableHead
) => {
  const req = toWebRequest(e);
  const initialUrl = new URL(req.url);
  const cache = new Cache();
  const accept = getHeader(e, "accept");

  const { data, head, status } = await router.load(req, { event: e });
  setResponseStatus(e, status);
  const { loaderData, actionData } = data;

  // we need this for redirections or other throwing responses
  if (data instanceof Response) return data;
  // if (actionData instanceof Response) return actionData;
  const isAction = !!actionData;

  if (isAction && getHeader(e, "X-ZRO-Action")) {
    const firstActionKey = Object.fromEntries(
      (actionData as Map<string, any>).entries()
    );
    const actionKey = Object.keys(firstActionKey)[0];
    const action = (actionData as Map<string, any>).get(actionKey);
    return action;
  }

  if (accept === "text/x-script") {
    setHeader(e, "Content-Type", "text/x-script");
    if (data instanceof Response) return data;
    return encode(data, {
      redactErrors: false,
    });
  }

  head.push({
    script: [
      {
        type: "module",
        src: "/@zro/client-entry",
        tagPosition: "bodyClose",
      },
    ],
  });
  if (extraHead) head.push(extraHead);

  setHeader(e, "Content-Type", "text/html");
  // set current loading to the router cache
  cache.set(
    JSON.stringify(withTrailingSlash(initialUrl.href)),
    Promise.resolve(data)
  );

  const stream = (await renderToReadableStream(
    React.createElement(Router, {
      router,
      initialUrl,
      cache,
      head,
    })
  )) as ReadableStream;

  const transformedStream = stream.pipeThrough(
    new TransformStream({
      transform: async (chunk, controller) => {
        let text = new TextDecoder().decode(chunk);
        text = await transformHtmlTemplate(head, text);
        controller.enqueue(new TextEncoder().encode(text));
      },
    })
  );
  return transformedStream;
};
