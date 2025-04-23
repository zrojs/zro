import {
  getHeader,
  H3Event,
  setHeader,
  setResponseStatus,
  toWebRequest,
  useSession,
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

  let { data, head, status } = await router.load(req, { event: e });

  setResponseStatus(e, status);

  let actionData = data.actionData;

  if (!process.env.APP_KEY) {
    throw new Error(
      "APP_KEY is not set in the environment variables, please run zro:prepare to generate the key"
    );
  }

  const serverSession = await useSession(e, {
    password: process.env.APP_KEY!,
    sessionHeader: "zro",
    name: "zro",
  });

  if (serverSession.data.actionData) {
    try {
      const actionData = JSON.parse(serverSession.data.actionData);
      data.actionData = {
        error: actionData.error,
        data: new Map(actionData.data),
      };
    } catch (e) {
      console.error("Error parsing action data");
      data.actionData = {
        error: false,
        data: new Map(),
      };
    } finally {
      serverSession.clear();
    }
  }

  // we need this for redirections or other throwing responses
  if (data instanceof Response) return data;

  const isAction = !!actionData;
  const actionFiredFromJavascript = getHeader(e, "X-ZRO-Action");

  if (isAction) {
    if (actionFiredFromJavascript) {
      // is action and it's fired from javascript
      const firstActionKey = Object.fromEntries(
        (actionData as Map<string, any>).entries()
      );
      const actionKey = Object.keys(firstActionKey)[0];
      const action = (actionData as Map<string, any>).get(actionKey);
      return action;
    } else {
      // if fired without javascript
      // if referrer provided, flush action data to session and redirect to referrer
      const referer = getHeader(e, "referer");
      if (!!referer) {
        await serverSession.update({
          actionData: JSON.stringify({
            error: status >= 400,
            data: Array.from(actionData.entries()),
          }),
        });
        return Response.redirect(referer, 302);
      } else {
        // if no referrer found, load the router with current url, render the page
        const newReq = new Request(req.url, {
          method: "get",
          headers: req.headers,
          body: undefined,
          mode: req.mode,
          credentials: req.credentials,
          cache: req.cache,
          redirect: req.redirect,
          referrer: req.referrer,
          referrerPolicy: req.referrerPolicy,
          integrity: req.integrity,
          keepalive: req.keepalive,
        });
        const newLoader = await router.load(newReq, { event: e });
        data = newLoader.data;
        data.actionData = actionData;
        head = newLoader.head;
      }
    }
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
