import { AsyncLocalStorage } from "node:async_hooks";
import { Middleware } from "src/router";
import { createContext, withAsyncContext } from "unctx";
export * from "./RouteTree";

export const PluginConfigContext = createContext({
  AsyncLocalStorage,
  asyncContext: true,
});

export const getConfig = PluginConfigContext.tryUse as <T>() => T;
export const middlewareWithPluginContext = <T extends Middleware<any, any>>(
  config: any,
  fn: T
) => {
  return new Middleware(async (options) => {
    return PluginConfigContext.callAsync(
      config,
      withAsyncContext(async () => {
        return await fn.run(options);
      })
    );
  });
};

export const fnWithPluginContext = <T extends Function>(config: any, fn: T) => {
  return PluginConfigContext.callAsync(
    config,
    withAsyncContext(async () => {
      return await fn();
    })
  );
};
