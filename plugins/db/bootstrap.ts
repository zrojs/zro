import { createDatabase } from "db0";
import { DBConfig } from "index";
import { getConfig } from "zro/plugin";

export const bootstrap = async () => {
  const config = getConfig<DBConfig>();
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
