import { defineConfig } from "@zro/db";
import sqlite from "@zro/db/connectors/node-sqlite";

export default defineConfig({
  connector: sqlite({
    path: "db.sqlite",
  }),
  orm: "drizzle",
  /*
  production:{
    connector: cloudflareD1({
      bindingName: "DB",
    })
  }
  */
});
