import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      builder: "rollup",
      input: "./src/react/client/client-entry",
      outDir: "./dist/react/client-entry",
    },
    {
      builder: "rollup",
      input: "./src/react/client/index",
      outDir: "./dist/react/client",
    },
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
      input: "./src/server/node",
      outDir: "./dist/server",
    },
    {
      builder: "rollup",
      input: "./src/server/edge",
      outDir: "./dist/server",
    },
    {
      builder: "rollup",
      input: "./src/adapters/cloudflare",
      outDir: "./dist/adapters",
    },
  ],
  externals: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "react-dom/client",
    "virtual:zro/router.client",
  ],
  sourcemap: true,
  clean: true,
  rollup: {
    preserveDynamicImports: false,
    inlineDependencies: true,
    esbuild: {
      format: "esm",
      minify: false,
      legalComments: "inline",
      jsxSideEffects: true,
      jsx: "automatic",
      treeShaking: true,
    },
  },
  stubOptions: {
    jiti: {
      jsx: true,
    },
  },
  declaration: "compatible",
});
