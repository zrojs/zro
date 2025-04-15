import { Middleware } from "src/router";
import { createContext } from "unctx";
export * from "./RouteTree";

export const PluginConfigContext = createContext();

export const getConfig = PluginConfigContext.tryUse as <T>() => T;
export const middlewareWithPluginContext = <T extends Middleware<any, any>>(
  config: any,
  fn: T
) => {
  return new Middleware(async (options) => {
    return PluginConfigContext.call(config, async () => {
      return await fn.run(options);
    });
  });
};

export const fnWithPluginContext = <T extends Function>(config: any, fn: T) => {
  return PluginConfigContext.call(config, async () => {
    return await fn();
  });
};
