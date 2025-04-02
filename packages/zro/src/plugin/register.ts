import { createRequire } from "module";
import { addDependency } from "nypm";
import { useVite } from "src/dev-server";
import { PluginConfigContext } from "src/plugin";
import { joinURL } from "ufo";
import { withAsyncContext } from "unctx";
import { RouteTree } from "zro/plugin";

const require = createRequire(process.cwd());

export const registerPlugins = async (
  plugins: string[],
  routeTree: RouteTree
) => {
  for (const plugin of plugins) {
    const { setup, configName } = await importPlugin(plugin);
    const vite = useVite();
    const config = (
      await vite.ssrLoadModule(joinURL(process.cwd(), `configs/${configName}`))
    ).default;
    PluginConfigContext.callAsync(
      config,
      withAsyncContext(async () => {
        return setup(routeTree);
      }, true)
    );
  }
};

const importPlugin = async (plugin: string) => {
  try {
    return await require(plugin);
  } catch (e) {
    await addDependency(plugin, { cwd: process.cwd(), silent: true });
    return importPlugin(plugin);
  }
};
