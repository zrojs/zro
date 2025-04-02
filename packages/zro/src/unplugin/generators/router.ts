import { genSafeVariableName } from "knitwork";
import { mkdir, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { RouteTree, TreeRoute } from "src/plugin/RouteTree";
import { joinURL } from "ufo";
import { createUnimport, Import } from "unimport";

export const createRouterFile = async (tree: RouteTree, destDir: string) => {
  const imports: Import[] = [];
  let serverCode = "\n\n export const router = new Router();\n\n";
  let clientCode = "\n\n export const router = new Router();\n\n";

  imports.push({
    name: "Route",
    from: "zro/router",
  });
  imports.push({
    name: "Router",
    from: "zro/router",
  });
  imports.push({
    name: "withPluginContext",
    from: "zro/plugin",
  });

  const walkRoutes = (route: TreeRoute, parent?: TreeRoute) => {
    imports.push({
      name: "*",
      as: genSafeVariableName(`import_${route.path}`),
      from: relative(destDir, route.filePath).replace(/\.[^/.]+$/, ""),
    });

    serverCode += `const ${genSafeVariableName(
      `route_${route.path}`
    )} = new Route(${JSON.stringify(route.path)}, {
  parent: ${parent ? genSafeVariableName(`route_${parent.path}`) : "undefined"},
  loader: ${
    route.moduleInfo?.hasLoader
      ? `${genSafeVariableName(`import_${route.path}`)}.loader`
      : undefined
  },
  middlewares: ${
    route.moduleInfo?.hasMiddleware
      ? `${genSafeVariableName(`import_${route.path}`)}.middlewares`
      : undefined
  },
  actions: ${
    route.moduleInfo?.hasActions
      ? `${genSafeVariableName(`import_${route.path}`)}.actions`
      : undefined
  },
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
            from: `configs/${configFileName}`,
          });
          return `.addMiddleware(withPluginContext(${`import_config_${unImport.name}`}, ${as}))`;
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
