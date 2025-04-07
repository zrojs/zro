import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: "file:db.sqlite",
  },
  schema: "./configs/db.schema.ts",
  out: "./migrations",
});
