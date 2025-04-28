import { createRequestHandler } from ".";
// @ts-ignore
import { renderToReadableStream } from "react-dom/server.browser";

export const handleRequest = createRequestHandler(renderToReadableStream);
