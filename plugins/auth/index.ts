import { AuthProvider } from "auth-provider";
import { SessionConfig } from "h3";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig, type Plugin } from "zro/plugin";
import { Middleware, redirect } from "zro/router";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type AuthConfig<TUser = unknown> = {
  authPrefix: string;
  loginPage: string;
  session: SessionConfig;
  verifyToken: (token: string) => TUser | Promise<TUser>;
  generateToken: (user: TUser) => Promise<string> | string;
  providers: [AuthProvider<TUser>, ...AuthProvider<TUser>[]];
};

const plugin: Plugin<AuthConfig> = {
  name: "auth",
  configFileName: "auth",
  async setup(tree) {
    const config = getConfig<AuthConfig>();
    for (const provider of config.providers) {
      await provider.registerRotes(tree, config);
    }
    // register some routes based on the config
  },
};

export default plugin;

export const defineConfig = <User>(config: AuthConfig<User>) => {
  // const defaultConfig: AuthConfig = {
  //   enabled: true,
  // };
  // return defu(config, defaultConfig);
  return config;
};

export const getUser = <TUser = unknown>() => {
  return (globalThis as any).__user as TUser | undefined;
};

export const authenticatedMiddleware = () =>
  new Middleware(async ({ next }) => {
    const config = getConfig<AuthConfig>();
    const user = getUser();
    if (!user) redirect(config.loginPage);
    return next({
      user: getUser(),
    });
  });
