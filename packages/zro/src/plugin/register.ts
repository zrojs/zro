import { createRequire } from "module";
import { addDependency } from "nypm";
import { joinURL } from "ufo";
import { Plugin, PluginConfigContext, RouteTree } from ".";
import { useVite } from "../dev-server";

export const registerPlugins = async (
  plugins: string[],
  routeTree: RouteTree
) => {
  for (const plugin of plugins) {
    const { default: pluginModule } = (await importPlugin(
      plugin,
      process.cwd()
    )) as {
      default: Plugin<any>;
    };
    const vite = useVite();
    const config = (
      await vite.ssrLoadModule(
        joinURL(process.cwd(), `configs/${pluginModule.configFileName}`)
      )
    ).default;
    await PluginConfigContext.call(config, async () => {
      return await pluginModule.setup(routeTree);
    });
  }
};

const importPlugin = async (plugin: string, userRoot: string) => {
  const requireFromUser = createRequire(userRoot);
  try {
    return await import(
      /* @vite-ignore */
      plugin
    );
  } catch (err) {
    try {
      return requireFromUser(plugin); // fallback for CJS/dev-monorepo
    } catch (err2) {
      console.error(
        `Both import() and require() failed for plugin "${plugin}"`
      );
      await addDependency(plugin, {
        cwd: process.cwd(),
        silent: false,
      });
      throw err2;
    }
  }
};
