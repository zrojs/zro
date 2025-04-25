import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: "file:local.db",
  },
  schema: "./configs/db.schema.ts",
  out: "./migrations",
});
