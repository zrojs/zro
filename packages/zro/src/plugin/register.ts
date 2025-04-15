import { createRequire } from "module";
import { addDependency } from "nypm";
import { useVite } from "src/dev-server";
import { joinURL } from "ufo";
import { Plugin, PluginConfigContext, RouteTree } from ".";

const require = createRequire(process.cwd());

export const registerPlugins = async (
  plugins: string[],
  routeTree: RouteTree
) => {
  for (const plugin of plugins) {
    const { default: pluginModule } = (await importPlugin(plugin)) as {
      default: Plugin<any>;
    };
    const { configFileName, setup } = pluginModule;
    const vite = useVite();
    const config = (
      await vite.ssrLoadModule(
        joinURL(process.cwd(), `configs/${configFileName}`)
      )
    ).default;
    await PluginConfigContext.call(config, async () => {
      return await setup.call(pluginModule, routeTree);
    });
  }
};

const importPlugin = async (plugin: string) => {
  try {
    return await require(plugin);
  } catch (e) {
    console.error(e);
    await addDependency(plugin, { cwd: process.cwd(), silent: true });
    return importPlugin(plugin);
  }
};
