import { AuthConfig } from "index";
import { getConfig } from "zro/plugin";

export const bootstrap = () => {
  const config = getConfig<AuthConfig>();
  (globalThis as any).__auth = config;
};
