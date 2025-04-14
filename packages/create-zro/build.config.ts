import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["index"],
  clean: true,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      target: "node18",
      minify: true,
    },
  },
});
