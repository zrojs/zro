import { getRequest, Middleware } from "zro/router";

export const logger = new Middleware(async ({ next }) => {
  const request = getRequest();
  const data = await next();

  console.log("Request to", request.request.url);
  return data;
});
