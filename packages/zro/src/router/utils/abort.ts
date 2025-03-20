export const abort = (code: number, text?: string) => {
  throw new Response(text, { status: code, statusText: text })
}
