import { getRequest } from "src/router/Router";

export const redirect = (url: string, code: number = 302) => {
  const { request } = getRequest();
  const origin = new URL(request.url).origin;
  let dest = "";
  try {
    // check if it is a valid url
    new URL(url);
    dest = url;
  } catch (e) {
    dest = new URL(url, origin).href;
  }
  throw Response.redirect(dest, code);
};

export const isRedirectResponse = (res: Response) => {
  return res instanceof Response && res.status > 300 && res.status < 400;
};
