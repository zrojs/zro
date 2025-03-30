import { createRequire } from "module";
import { addDependency } from "nypm";
import { Tree } from "src/unplugin/generators";

const require = createRequire(process.cwd());

export const registerPlugins = async (
  plugins: string[],
  tree: Tree["children"]
) => {
  for (const plugin of plugins) {
    const { setup, configName } = await importPlugin(plugin);
    // import configName file from /configs dir and create a unctx and run the setup
    await setup(tree);
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
