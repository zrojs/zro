import { H3Event } from "h3";
// import { AsyncLocalStorage } from "node:async_hooks";
import { createContext } from "unctx";

export type ServerContextValue = {
  event: H3Event;
};

export const ServerContext = createContext<ServerContextValue | undefined>({});
export const getServerContext = ServerContext.tryUse;
