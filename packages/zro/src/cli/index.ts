import { defineCommand, runMain } from "citty";
import { colors } from "consola/utils";
import { readPackageJSON } from "pkg-types";
import { useZro, zroContext } from "./context";

const cli = defineCommand({
  meta: {
    name: "zro",
  },
  subCommands: {
    dev: defineCommand({
      meta: {
        name: "dev",
        description: "Start the development server",
      },
      args: {
        host: {
          type: "boolean",
          description: "bind development server on network",
        },
      },
      run: async ({ args }) => {
        const { bootstrapDevServer } = await import("../dev-server");
        console.clear();
        const { title, version } = useZro();
        console.log(
          ` ${colors.bold(title)} ${colors.dim(`v${version}`)} ${colors.dim(
            `(Development)`
          )}`
        );
        console.log();
        const { h3 } = await bootstrapDevServer({ host: !!args.host });
      },
    }),
    prepare: defineCommand({
      meta: {
        name: "prepare",
        description: "Prepare the project for dev and production",
      },
      run: async () => {
        const { prepare } = await import("./prepare");
        console.clear();
        const { title, version } = useZro();
        console.log(
          ` ${colors.bold(title)} ${colors.dim(`v${version}`)} ${colors.dim(
            `(Prepare)`
          )}`
        );
        console.log();
        await prepare();
      },
    }),
  },
});

readPackageJSON(import.meta.resolve("../../package.json")).then((pkg) => {
  zroContext.call(
    {
      title: "[Z•RO]",
      version: pkg.version!,
    },
    () => {
      runMain(cli);
    }
  );
});
