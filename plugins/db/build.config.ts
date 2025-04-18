import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      builder: "rollup",
      input: "./index",
      outDir: "./dist",
    },
    {
      builder: "rollup",
      input: "./bootstrap",
      outDir: "./dist",
    },
    {
      builder: "mkdist",
      input: "./connectors/",
      outDir: "./dist/connectors/",
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
