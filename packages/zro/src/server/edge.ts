import { createRequestHandler } from ".";
// @ts-ignore
import { renderToReadableStream } from "react-dom/server.edge";

export const handleRequest = createRequestHandler(renderToReadableStream);
