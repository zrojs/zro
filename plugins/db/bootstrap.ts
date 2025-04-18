import { createDatabase } from "db0";
import { getConfig } from "zro/plugin";
import { DBConfig } from ".";

export const bootstrap = async () => {
  const config = getConfig<DBConfig>();
  if (!config) {
    throw new Error("DB Config is required!");
  }
  const db = createDatabase(config.connector);
  (globalThis as any).__db0 = db;
  if (!!config.orm) {
    let orm;
    if (config.orm === "drizzle") {
      const { drizzle } = await import("db0/integrations/drizzle");
      orm = drizzle;
    }
    if (orm) (globalThis as any).__orm = orm(db);
  }
};
