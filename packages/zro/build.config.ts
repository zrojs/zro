import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      builder: "rollup",
      input: "./src/cli/index",
      outDir: "./dist/cli",
    },
    {
      builder: "rollup",
      input: "./src/router/index",
      outDir: "./dist/router",
    },
    {
      builder: "rollup",
      input: "./src/unplugin/index",
      outDir: "./dist/unplugin",
    },
    {
      builder: "rollup",
      input: "./src/unhead/index",
      outDir: "./dist/unhead",
    },
    {
      builder: "rollup",
      input: "./src/unhead/server",
      outDir: "./dist/unhead/server",
    },
    {
      builder: "rollup",
      input: "./src/react/index",
      outDir: "./dist/react",
    },
    {
      builder: "rollup",
      input: "./src/plugin/index",
      outDir: "./dist/plugin",
    },
    {
      builder: "rollup",
      input: "./src/router/server/index",
      outDir: "./dist/router/server",
    },
    {
      builder: "rollup",
      input: "./src/server",
      outDir: "./dist/server",
    },
  ],
  externals: ["react", "react/jsx-runtime"],
  rollup: {
    inlineDependencies: ["unhead/server", "hookable", "unhead/types"],
    esbuild: {
      format: "esm",
      minify: false,
    },
  },
  stubOptions: {
    jiti: {
      jsx: true,
    },
  },
  declaration: "compatible",
});
