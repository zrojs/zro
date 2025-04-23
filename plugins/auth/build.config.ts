import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      builder: "rollup",
      input: "./index.ts",
      outDir: "./dist",
    },
    {
      builder: "rollup",
      input: "./bootstrap.ts",
      outDir: "./dist",
    },
    {
      builder: "rollup",
      input: "./auth-provider.ts",
      outDir: "./dist",
    },
    {
      builder: "mkdist",
      input: "./providers/",
      outDir: "./dist/providers/",
    },
  ],
  clean: true,
  rollup: {
    esbuild: {
      format: "esm",
      minify: true,
    },
  },
  stubOptions: {
    jiti: {
      jsx: true,
    },
  },
  declaration: "compatible",
});
