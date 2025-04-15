import { AuthProvider } from "auth-provider";
import { SessionConfig } from "h3";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig, type Plugin } from "zro/plugin";
import { Middleware, redirect } from "zro/router";
import { getSession } from "zro/router/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface User {}

export type AuthConfig<TUser = User> = {
  authPrefix: string;
  loginPage: string;
  onLoginSuccessRedirect?: string;
  session: SessionConfig;
  verifyToken: (token: string) => TUser | Promise<TUser>;
  generateToken: (user: TUser) => Promise<string> | string;
  providers: [AuthProvider<TUser>, ...AuthProvider<TUser>[]];
};

const plugin: Plugin<AuthConfig> = {
  name: "auth",
  configFileName: "auth",
  async setup(tree) {
    tree.addBootstrapScript(
      {
        name: "bootstrap",
        from: __dirname + "/bootstrap",
      },
      this.configFileName
    );
    const config = getConfig<AuthConfig>();
    for (const provider of config.providers) {
      await provider.registerRotes(tree, config);
    }
  },
};

export default plugin;

export const defineConfig = <TUser = User>(config: AuthConfig<TUser>) => {
  // const defaultConfig: AuthConfig = {
  //   enabled: true,
  // };
  // return defu(config, defaultConfig);
  return config;
};

export const getUser = <TUser = User>() => {
  return (globalThis as any).__user as TUser | undefined;
};

export const auth = <TUser = User>() =>
  new Middleware(async ({ next }) => {
    const config = (globalThis as any).__auth as AuthConfig;
    const session = await getSession(config.session);
    const token = session.data.token;
    if (!token) redirect(config.loginPage);
    const user = (await config.verifyToken(token)) as TUser | undefined;
    if (!user) redirect(config.loginPage);

    return next({
      user,
    });
  });

export const guest = (onAuthenticatedRedirect: string) =>
  new Middleware(async ({ next }) => {
    const config = (globalThis as any).__auth as AuthConfig;
    const session = await getSession(config.session);
    const token = session.data.token;
    if (token) redirect(onAuthenticatedRedirect);
    return next();
  });

export const logout = async () => {
  const config = (globalThis as any).__auth as AuthConfig;
  const session = await getSession(config.session);
  session.clear();
  return redirect(config.loginPage);
};
