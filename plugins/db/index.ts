import { Connector, Database } from "db0";
import sqlite from "db0/connectors/node-sqlite";
import type { DrizzleDatabase } from "db0/integrations/drizzle";
import defu from "defu";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Plugin } from "zro/plugin";
export * from "db0";

export type DBConfig = {
  connector: Connector;
  orm?: "drizzle";
};

const plugin: Plugin<DBConfig> = {
  name: "db",
  configFileName: "db",
  setup(tree) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    tree.addBootstrapScript(
      {
        name: "bootstrap",
        from: __dirname + "/bootstrap",
      },
      this.configFileName
    );
    // tree.addAutoImport // TODO
  },
};
export default plugin;

export const defineConfig = (config: Partial<DBConfig>) => {
  const defaultConfig: DBConfig = {
    connector: sqlite({
      name: ":memory:",
    }),
    orm: undefined,
  };
  return defu(config, defaultConfig);
};

export const getDB = () => {
  return (globalThis as any).__db0 as Database<Connector>;
};

export const getOrm = <
  TSchema extends Record<string, unknown> = Record<string, never>
>() => {
  return (globalThis as any).__orm as DrizzleDatabase<TSchema>;
};
