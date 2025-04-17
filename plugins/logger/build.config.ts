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
      input: "./plugin.ts",
      outDir: "./dist",
    },
  ],
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
