import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import zro from "zro/unplugin/vite";
// import inspect from "vite-plugin-inspect";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    zro({
      plugins: ["@zro/logger", "@zro/db"],
    }),
    react(),
    // inspect(),
  ],
});
