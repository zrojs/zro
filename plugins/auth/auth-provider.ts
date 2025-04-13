import { RouteTree } from "zro/plugin";
import { AuthConfig, User } from ".";

export type AuthConstructorOptions<TAuthenticationProps> = {
  authenticate: (data: TAuthenticationProps) => User | Promise<User>;
};

export class AuthProvider<TAuthenticationProps = unknown> {
  authenticate: (data: TAuthenticationProps) => User | Promise<User>;

  constructor(options: AuthConstructorOptions<TAuthenticationProps>) {
    this.authenticate = options.authenticate;
  }

  async registerRotes(tree: RouteTree, config: AuthConfig) {
    throw new Error("Each Provider needs to implement registerRotes method");
  }
}
