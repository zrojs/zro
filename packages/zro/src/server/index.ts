import { H3Event, useSession } from "h3";
import React, { ReactNode } from "react";
import type {
  ReactDOMServerReadableStream,
  RenderToReadableStreamOptions,
} from "react-dom/server";
import { encode } from "turbo-stream";
import { withTrailingSlash } from "ufo";
import { transformHtmlTemplate } from "unhead/server";
import { SerializableHead } from "unhead/types";
import { Router } from "../react";
import { Cache } from "../react/cache";
import { Router as ZroRouter } from "../router/Router";

const encoder = new TextEncoder();

function streamTextAsBytes(stream: ReadableStream) {
  return new ReadableStream({
    start(controller) {
      const reader = stream.getReader();

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
          } else {
            // Make sure each chunk is encoded to Uint8Array
            if (typeof value === "string") {
              controller.enqueue(encoder.encode(value));
            } else if (value instanceof Uint8Array) {
              controller.enqueue(value);
            } else {
              // If unknown, throw an error for safety
              throw new TypeError("Unexpected stream value type");
            }
            read();
          }
        });
      }

      read();
    },
  });
}

type RenderToReadableStreamFn = (
  children: ReactNode,
  options?: RenderToReadableStreamOptions
) => Promise<ReactDOMServerReadableStream>;

export const createRequestHandler = (
  renderToStreamFn: RenderToReadableStreamFn
) => {
  return async (
    e: H3Event,
    router: ZroRouter,

    extraHead?: SerializableHead
  ) => {
    const req = e.req;
    const initialUrl = new URL(req.url);
    const cache = new Cache();
    const accept = e.req.headers.get("accept");

    let { data, head, status } = await router.load(req, { event: e });

    e.res.status = status;

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
    const actionFiredFromJavascript = e.req.headers.get("X-ZRO-Action");

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
        const referer = e.req.headers.get("referer");
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

    if (accept?.includes("text/x-script")) {
      e.res.headers.set("Content-Type", "text/x-script");
      if (data instanceof Response) return data;
      return streamTextAsBytes(
        encode(data, {
          redactErrors: false,
        })
      );
    }

    head.push({
      script: [
        {
          type: "module",
          src: "/zro_client-entry.js",
          tagPosition: "bodyClose",
        },
      ],
    });
    if (extraHead) head.push(extraHead);

    e.res.headers.set("Content-Type", "text/html");
    // set current loading to the router cache
    cache.set(
      JSON.stringify(withTrailingSlash(initialUrl.href)),
      Promise.resolve(data)
    );

    const stream = (await renderToStreamFn(
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
};
