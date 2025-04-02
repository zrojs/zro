import defu from "defu";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig, type RouteTree } from "zro/plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type LoggerConfig = {
  /** @default true */
  enabled: boolean;
};

const defaultConfig: LoggerConfig = {
  enabled: true,
};

export const defineConfig = (config?: Partial<LoggerConfig>) => {
  return defu(config, defaultConfig);
};

export const configName = "logger";

export const setup = (tree: RouteTree) => {
  /**
   * get config // getConfig<Config>
   * tree.findRootRoutes()[0].addMiddleware(unImportObj)
   * tree.getRoute("_id").addChildRoute(filePath)
   * tree.getRoute("_id").addMiddleware(unImportObj)
   */
  const config = getConfig<LoggerConfig>();
  if (config.enabled)
    tree.findRootRoutes().forEach((route) => {
      route?.addMiddleware(
        {
          name: "logger",
          from: __dirname + "/plugin",
        },
        configName
      );
    });
  // console.log("logger setup");
};
