import { defineConfig } from "@zro/db";
import libsql from "@zro/db/connectors/libsql/node";

export default defineConfig({
  connector: libsql({
    url: "file:local.db",
  }),
  orm: "drizzle",
});
