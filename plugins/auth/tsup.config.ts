import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "./index.ts",
    "bootstrap.ts",
    "auth-provider.ts",
    "post-install.ts",
    "providers/**/*.ts",
  ],
  outDir: "dist",
  format: ["esm"],
  dts: true,
  splitting: true,
  clean: true,
  minify: false,
  target: "esnext",
});
