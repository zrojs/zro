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
      builder: "rollup",
      input: "./routes/logout.ts",
      outDir: "./dist/routes",
    },
    {
      builder: "rollup",
      input: "./providers/password/index.ts",
      outDir: "./dist/providers/password",
    },
    {
      builder: "rollup",
      input: "./providers/password/password-action.ts",
      outDir: "./dist/providers/password",
    },
    {
      builder: "rollup",
      input: "./providers/github/github-action.ts",
      outDir: "./dist/providers/github",
    },
    {
      builder: "rollup",
      input: "./providers/github/github-verify.ts",
      outDir: "./dist/providers/github",
    },
    {
      builder: "rollup",
      input: "./providers/github/index.ts",
      outDir: "./dist/providers/github",
    },
    {
      builder: "rollup",
      input: "./providers/github/react.ts",
      outDir: "./dist/providers/github",
    },
  ],
  clean: true,
  rollup: {
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
  failOnWarn: false,
  declaration: "compatible",
  // declaration: false, // handle dts using tsup as mkdist is not able to generate dts with complex types
});
