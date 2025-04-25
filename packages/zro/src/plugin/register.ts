import { createRequire } from "module";
import { addDependency } from "nypm";
import { glob } from "tinyglobby";
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
      process.cwd(),
      true
    )) as {
      default: Plugin<any>;
    };
    const vite = useVite();
    let config = undefined;
    try {
      const configPath = await glob(
        joinURL(
          process.cwd(),
          `configs/${pluginModule.configFileName}.{js,ts,jsx,tsx}`
        ),
        {
          absolute: true,
        }
      ).then((res) => res[0]);
      const configExists = !!configPath;
      if (configExists)
        config = (
          await vite.ssrLoadModule(
            joinURL(process.cwd(), `configs/${pluginModule.configFileName}`)
          )
        ).default;
    } catch (e) {}
    await PluginConfigContext.call(config, async () => {
      return await pluginModule.setup(routeTree);
    });
  }
};

const importPlugin = async (
  plugin: string,
  userRoot: string,
  tryInstall: boolean
) => {
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
      if (tryInstall) {
        await addDependency(plugin, {
          cwd: process.cwd(),
          silent: true,
        });
        return importPlugin(plugin, userRoot, false);
      }
      throw err2;
    }
  }
};
