export const abort = (
  code: number,
  text?: string,
  responseInit: ResponseInit = {}
) => {
  throw new Response(text, { status: code, statusText: text, ...responseInit });
};
