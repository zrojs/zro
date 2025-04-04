import { Middleware } from "src/router";
import { createContext, withAsyncContext } from "unctx";

export * from "./RouteTree";

export const PluginConfigContext = createContext();
export const getConfig = PluginConfigContext.tryUse as <T>() => T;
export const withPluginContext = <T extends Middleware<any, any>>(
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
