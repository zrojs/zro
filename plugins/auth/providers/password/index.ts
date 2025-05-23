import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RouteTree } from "zro/plugin";
import { AuthConstructorOptions, AuthProvider } from "../../auth-provider";
import plugin, { AuthConfig } from "../../index";

type PasswordAuthProps = {
  username: string;
  password: string;
};

export class PasswordProvider extends AuthProvider<PasswordAuthProps> {
  constructor(options: AuthConstructorOptions<PasswordAuthProps>) {
    super("password", options);
  }

  async registerRotes(tree: RouteTree, config: AuthConfig) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const actionRouteFilePath = __dirname + "/password-action.mjs";
    const actionPath = config.authPrefix + "/password";
    await tree.addRootRoute(
      actionRouteFilePath,
      actionPath,
      plugin.configFileName
    );
  }
}
