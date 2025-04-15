import { genSafeVariableName } from "knitwork";
import { mkdir, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { RouteTree, TreeRoute } from "src/plugin/RouteTree";
import { joinURL } from "ufo";
import { createUnimport, Import } from "unimport";

const importPluginConfig = (configFileName: string, imports: Import[]) => {
  const configImportName = genSafeVariableName(
    `import_config_${configFileName}`
  );
  imports.push({
    name: "default",
    as: configImportName,
    from: relative(joinURL(process.cwd(), ".zro"), `configs/${configFileName}`),
  });
  return configImportName;
};

export const createRouterFile = async (tree: RouteTree, destDir: string) => {
  const imports: Import[] = [];

  let serverCode =
    "\n\nexport const createRouter = async () => {\nconst router = new Router();\n";
  let clientCode = "\n\nexport const router = new Router();\n\n";

  imports.push({
    name: "Route",
    from: "zro/router/Route",
  });
  imports.push({
    name: "Router",
    from: "zro/router/Router",
  });
  imports.push({
    name: "middlewareWithPluginContext",
    from: "zro/plugin",
  });
  imports.push({
    name: "PluginConfigContext",
    from: "zro/plugin",
  });

  imports.push({
    name: "wrapWithConfig",
    from: "zro/router/server",
  });

  for (const bootstrapScript of tree.getBootstrapScripts()) {
    const { unImport, configFileName } = bootstrapScript;

    const configImportName = importPluginConfig(configFileName!, imports);

    const fnImportName = genSafeVariableName(
      `import_${configFileName}_${unImport.name}`
    );
    imports.push({
      ...{
        ...unImport,
        from: relative(joinURL(process.cwd(), ".zro"), unImport.from),
      },
      as: fnImportName,
    });
    serverCode += `PluginConfigContext.unset();\nawait PluginConfigContext.call(${configImportName}, ${fnImportName})\n`;
  }

  serverCode += `\n`;

  const walkRoutes = (route: TreeRoute, parent?: TreeRoute) => {
    imports.push({
      name: "*",
      as: genSafeVariableName(`import_${route.path}`),
      from: relative(destDir, route.filePath).replace(/\.[^/.]+$/, ""),
    });
    let configImportName = "";
    if (route.configFileName)
      configImportName = importPluginConfig(route.configFileName!, imports);
    const routeImportVariable = genSafeVariableName(`import_${route.path}`);
    serverCode += `const ${genSafeVariableName(
      `route_${route.path}`
    )} = new Route(${JSON.stringify(route.path)}, {
  parent: ${parent ? genSafeVariableName(`route_${parent.path}`) : "undefined"},
  loader: ${
    route.moduleInfo?.hasLoader
      ? route.configFileName
        ? `() => {
        PluginConfigContext.unset();
        return PluginConfigContext.call(${configImportName}, ${genSafeVariableName(
            `import_${route.path}`
          )}.loader)}`
        : `${routeImportVariable}.loader`
      : undefined
  },
  middlewares: ${
    route.moduleInfo?.hasMiddleware
      ? `${routeImportVariable}.middlewares`
      : undefined
  },
  actions: ${
    route.moduleInfo?.hasActions
      ? route.configFileName
        ? `Object.keys(${routeImportVariable}.actions).reduce(
      (actions, actionKey) => {
        const action = ${routeImportVariable}.actions[actionKey];
        actions[actionKey] = wrapWithConfig(action, ${configImportName});
        return actions;
      },
      ${routeImportVariable}.actions
    )`
        : `${routeImportVariable}.actions`
      : undefined
  },
  props: {
    component: ${
      route.moduleInfo?.hasComponent
        ? `${routeImportVariable}.default`
        : undefined
    },
    errorBoundary: ${
      route.moduleInfo?.hasErrorBoundary
        ? `${routeImportVariable}.ErrorBoundary`
        : undefined
    },
    loading: ${
      route.moduleInfo?.hasLoading
        ? `${routeImportVariable}.Loading`
        : undefined
    },
  }
})${route.extraMiddlewares
      .map((middlewareInfo) => {
        const { unImport, configFileName } = middlewareInfo;
        const as = genSafeVariableName(`import_${unImport.name}`);
        imports.push({
          ...{
            ...unImport,
            from: relative(joinURL(process.cwd(), ".zro"), unImport.from),
          },
          as,
        });
        if (configFileName) {
          imports.push({
            name: "default",
            as: `import_config_${unImport.name}`,
            from: relative(
              joinURL(process.cwd(), ".zro"),
              `configs/${configFileName}`
            ),
          });
          return `.addMiddleware(middlewareWithPluginContext(${`import_config_${unImport.name}`}, ${as}))`;
        }
        return `.addMiddleware(${as})`;
      })
      .join("\n")}
${
  route.isLeaf
    ? `router.addRoute(${genSafeVariableName(`route_${route.path}`)})\n`
    : ""
}
\n`;

    clientCode += `const ${genSafeVariableName(
      `route_${route.path}`
    )} = new Route(${JSON.stringify(route.path)}, {
  parent: ${parent ? genSafeVariableName(`route_${parent.path}`) : "undefined"},
  props: {
    component: ${
      route.moduleInfo?.hasComponent
        ? `${genSafeVariableName(`import_${route.path}`)}.default`
        : undefined
    },
    errorBoundary: ${
      route.moduleInfo?.hasErrorBoundary
        ? `${genSafeVariableName(`import_${route.path}`)}.ErrorBoundary`
        : undefined
    },
    loading: ${
      route.moduleInfo?.hasLoading
        ? `${genSafeVariableName(`import_${route.path}`)}.Loading`
        : undefined
    },
  }
})
${
  route.isLeaf
    ? `router.addRoute(${genSafeVariableName(`route_${route.path}`)})\n`
    : ""
}
\n`;

    if (route.children)
      for (const child of route.children) {
        if (child) walkRoutes(child, route);
      }
  };

  for (const child of tree.findRootRoutes()) {
    if (child) walkRoutes(child);
  }

  serverCode += "\nreturn router;\n}\n";

  const { injectImports } = createUnimport({ imports });
  await mkdir(destDir, { recursive: true });

  await Promise.allSettled([
    writeFile(
      joinURL(destDir, "router.client.ts"),
      (
        await injectImports(clientCode)
      ).code
    ),
    writeFile(
      joinURL(destDir, "router.server.ts"),
      (
        await injectImports(serverCode)
      ).code
    ),
  ]);
};
