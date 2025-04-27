import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "./index.ts",
    "bootstrap.ts",
    "auth-provider.ts",
    "post-install.ts",
    "providers/**/*.ts",
    "routes/**/*.ts",
  ],
  external: ["react", "react-dom", "zro"],
  outDir: "dist",
  format: ["esm"],
  dts: true,
  splitting: true,
  clean: true,
  minify: false,
  target: "esnext",
});
