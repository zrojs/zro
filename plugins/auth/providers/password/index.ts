import { AuthConfig } from "index";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RouteTree } from "zro/plugin";
import { AuthConstructorOptions, AuthProvider } from "../../auth-provider";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type PasswordAuthProps = {
  username: string;
  password: string;
};

export class PasswordProvider<TUser> extends AuthProvider<
  TUser,
  PasswordAuthProps
> {
  constructor(options: AuthConstructorOptions<TUser, PasswordAuthProps>) {
    super(options);
  }

  async registerRotes(tree: RouteTree, config: AuthConfig) {
    const actionRouteFilePath = __dirname + "/password-action.js";
    const actionPath = config.authPrefix + "/password";
    await tree.addRootRoute(actionRouteFilePath, actionPath, "auth");
    /*
      const config = getConfig<AuthConfig>()
      const prefix = config.prefix;

      register post route ${prefix}/password
    */
  }
}
