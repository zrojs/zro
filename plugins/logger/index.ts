import defu from "defu";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig, type Plugin } from "zro/plugin";

export type LoggerConfig = {
  /** @default true */
  enabled: boolean;
};

const plugin: Plugin<LoggerConfig> = {
  name: "logger",
  configFileName: "logger",
  setup(tree) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const config = defineConfig(getConfig<LoggerConfig>());
    if (config.enabled)
      tree.findRootRoutes().forEach((route) => {
        route?.addMiddleware(
          {
            name: "logger",
            from: __dirname + "/plugin",
          },
          this.configFileName
        );
      });
  },
};

export default plugin;

export const defineConfig = (config: Partial<LoggerConfig>) => {
  const defaultConfig: LoggerConfig = {
    enabled: true,
  };
  return defu(config, defaultConfig);
};
