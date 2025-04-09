import { RouteTree } from "zro/plugin";

export type AuthConstructorOptions<
  TUser,
  TAuthenticationProps,
  TOptions = Record<string, unknown>
> = {
  name: string;
  options: TOptions;
  authenticate: (data: TAuthenticationProps) => TUser | Promise<TUser>;
};

export class AuthProvider<
  TUser,
  TAuthenticationProps = unknown,
  TOptions = Record<string, unknown>
> {
  name: string;
  options: TOptions;
  authenticate: (data: TAuthenticationProps) => TUser | Promise<TUser>;

  constructor(
    options: AuthConstructorOptions<TUser, TAuthenticationProps, TOptions>
  ) {
    this.name = options.name;
    this.options = options.options;
    this.authenticate = options.authenticate;
  }

  async registerRotes(tree: RouteTree) {
    throw new Error("Each Provider needs to implement registerRotes method");
  }
}
