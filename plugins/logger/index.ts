import defu from "defu";

type Config = {
  /** @default true */
  colorized: boolean;
};

const defaultConfig: Config = {
  colorized: true,
};

export const defineConfig = (config?: Partial<Config>) => {
  return defu(config, defaultConfig);
};

const configName = "logger";

export const setup = (tree: any) => {
  /**
   * get config // getConfig<Config>
   * tree.findRootRoutes()[0].addMiddleware(unImportObj)
   * tree.getRoute("_id").addChildRoute(filePath)
   * tree.getRoute("_id").addMiddleware(unImportObj)
   */
  Object.keys(tree).forEach((file) => {});
  // console.log("logger setup");
};
