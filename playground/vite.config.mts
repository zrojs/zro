import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import zro from "zro/unplugin/vite";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    zro({
      plugins: ["@zro/logger", "@zro/db", "@zro/auth"],
    }),
    react(),
  ],
});
