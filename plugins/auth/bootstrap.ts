import { getConfig } from "zro/plugin";
import { AuthConfig } from "./index";

export const bootstrap = () => {
  const config = getConfig<AuthConfig>();
  (globalThis as any).__auth = config;
};
