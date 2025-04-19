import { genSafeVariableName } from "knitwork";
import { mkdir, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { joinURL } from "ufo";
import { createUnimport, Import } from "unimport";
import { RouteTree, TreeRoute } from "../../plugin";

export const createTypesFile = async (tree: RouteTree, destDir: string) => {
  const imports: Import[] = [];
  imports.push({
    name: "LoaderReturnType",
    from: "zro/router",
  });
  imports.push({
    name: "Route",
    from: "zro/router",
  });
  imports.push({
    name: "RouteData",
    from: "zro/router",
  });
  let code = `
export {}
declare global {
  type Routes = {
    --routes-types
  }
}
declare module 'zro/router' {
  interface Actions {
    --actions-types
  }
}`;

  const walkRoutes = (route: TreeRoute, parent?: TreeRoute) => {
    imports.push({
      name: "*",
      as: genSafeVariableName(`import_${route.path}`),
      from: relative(destDir, route.filePath).replace(/\.[^/.]+$/, ""),
    });
    code = code.replace(
      "--routes-types",
      `${JSON.stringify(route.path)}: Route<${JSON.stringify(route.path)}, ${
        route.moduleInfo.hasLoader
          ? `LoaderReturnType<typeof ${genSafeVariableName(
              `import_${route.path}`
            )}.loader>`
          : "{}"
      }, ${
        parent ? `RouteData<Routes[${JSON.stringify(parent?.path)}]>` : `{}`
      }, ${
        route.moduleInfo?.hasMiddleware
          ? `typeof ${genSafeVariableName(`import_${route.path}`)}.middlewares`
          : `[]`
      }>,\n    --routes-types`
    );

    if (route.moduleInfo.hasActions) {
      code = code.replace(
        "--actions-types",
        `${JSON.stringify(route.path)}: typeof ${genSafeVariableName(
          `import_${route.path}`
        )}.actions,
    --actions-types`
      );
    }
    if (route.children)
      for (const child of route.children) {
        if (child) walkRoutes(child, route);
      }
  };

  for (const child of tree.findRootRoutes()) {
    if (child) walkRoutes(child);
  }

  code = code.replace(`\n    --routes-types`, "");
  code = code.replace(`\n    --actions-types`, "");

  const { injectImports } = createUnimport({ imports });
  await mkdir(destDir, { recursive: true });
  await writeFile(
    joinURL(destDir, "router.types.d.ts"),
    (
      await injectImports(code)
    ).code
  );
};
