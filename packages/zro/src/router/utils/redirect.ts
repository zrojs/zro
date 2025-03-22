export const redirect = (url: string, code: number = 301) => {
  throw Response.redirect(url, code)
}

export const isRedirectResponse = (res: Response) => {
  return res instanceof Response && res.status > 300 && res.status < 400
}
