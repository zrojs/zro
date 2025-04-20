import { defineConfig } from "@zro/db";
import libsql from "@zro/db/connectors/libsql/http";

export default defineConfig({
  connector: libsql({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  }),
  orm: "drizzle",
});
