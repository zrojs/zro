import { getHeader, getRequestURL, H3Event, setHeader, toWebRequest } from "h3";
import { Router as ZroRouter } from "src/router";
import { Router } from "./react";
import { encode } from "turbo-stream";
import { SerializableHead } from "unhead/types";
// @ts-expect-error
import { renderToReadableStream } from "react-dom/server.browser";
import React from "react";
import { transformHtmlTemplate } from "unhead/server";
import { Cache } from "src/react/cache";

export const handleRequest = async (
  e: H3Event,
  router: ZroRouter,
  extraHead?: SerializableHead
) => {
  const req = toWebRequest(e);
  const initialUrl = new URL(req.url);
  const cache = new Cache();
  const accpet = getHeader(e, "accept");
  const { data, head } = await router.load(req);
  if (data instanceof Response) return data;
  if (accpet === "text/x-script") {
    setHeader(e, "Content-Type", "text/x-script");
    if (data instanceof Response) return data;
    return encode(data, {
      redactErrors: false,
    });
  }
  // push client-entry
  head.push({
    script: [
      {
        type: "module",
        src: "/app.tsx",
        tagPosition: "bodyClose",
      },
    ],
  });
  if (extraHead) head.push(extraHead);

  setHeader(e, "Content-Type", "text/html");

  const stream = (await renderToReadableStream(
    React.createElement(Router, { router, initialUrl, cache, head })
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
