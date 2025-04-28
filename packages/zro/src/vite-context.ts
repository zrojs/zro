import { AsyncLocalStorage } from "node:async_hooks";
import { createContext } from "unctx";
import { ViteDevServer } from "vite";

export const viteContext = createContext<ViteDevServer>({
  asyncContext: true,
  AsyncLocalStorage,
});
export const useVite = viteContext.use;
