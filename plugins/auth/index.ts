import { AuthProvider } from "auth-provider";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig, type Plugin } from "zro/plugin";
import { Middleware, redirect } from "zro/router";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type AuthConfig<TUser = unknown> = {
  authPrefix: string;
  loginPage: string;
  appKey: string;
  verifyToken: (token: string) => TUser | Promise<TUser>;
  generateToken: (user: TUser) => Promise<string> | string;
  providers: [AuthProvider<TUser>, ...AuthProvider<TUser>[]];
};

const plugin: Plugin<AuthConfig> = {
  name: "auth",
  configFileName: "auth",
  setup(tree) {
    const config = getConfig<AuthConfig>();
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
