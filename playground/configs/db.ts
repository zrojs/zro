import { defineConfig } from "@zro/db";
import sqlite from "@zro/db/connectors/node-sqlite";

export default defineConfig({
  connector: sqlite({
    name: ":memory:",
  }),
  orm: "drizzle",
});
