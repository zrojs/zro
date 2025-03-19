import { mkdir, writeFile } from 'fs/promises'
import { genSafeVariableName } from 'knitwork'
import { joinURL } from 'ufo'
import { createUnimport, Import } from 'unimport'
import { Tree } from '.'

export const createRouterFile = async (tree: Tree['children'], destDir: string) => {
  const imports: Import[] = []
  let code = '\n\n export const router = new Router();\n\n'

  imports.push({
    name: 'Route',
    from: 'zro/router',
  })
  imports.push({
    name: 'Router',
    from: 'zro/router',
  })

  const walkRoutes = (route: Tree, parent?: Tree) => {
    imports.push({
      name: '*',
      as: genSafeVariableName(`import_${route.path}`),
      from: route.filePath,
    })

    code += `const ${genSafeVariableName(`route_${route.path}`)} = new Route(${JSON.stringify(route.path)}, {
  parent: ${parent ? genSafeVariableName(`route_${parent.path}`) : 'undefined'},
  loader: ${route.moduleInfo?.hasLoader ? `${genSafeVariableName(`import_${route.path}`)}.loader` : undefined},
  meta: ${route.moduleInfo?.hasMeta ? `${genSafeVariableName(`import_${route.path}`)}.meta` : undefined},
  middlewares: ${route.moduleInfo?.hasMiddleware ? `${genSafeVariableName(`import_${route.path}`)}.middlewares` : undefined},
  actions: ${route.moduleInfo?.hasActions ? `${genSafeVariableName(`import_${route.path}`)}.actions` : undefined},
  props: {
    component: ${route.moduleInfo?.hasComponent ? `${genSafeVariableName(`import_${route.path}`)}.default` : undefined},
    errorBoundary: ${route.moduleInfo?.hasErrorBoundary ? `${genSafeVariableName(`import_${route.path}`)}.ErrorBoundary` : undefined},
    loading: ${route.moduleInfo?.hasLoading ? `${genSafeVariableName(`import_${route.path}`)}.Loading` : undefined},
  }
})
${route.isLeaf ? `router.addRoute(${genSafeVariableName(`route_${route.path}`)})\n` : ''}
\n`
    for (const child of Object.values(route.children)) {
      if (child) walkRoutes(child, route)
    }
  }

  for (const child of Object.values(tree)) {
    if (child) walkRoutes(child)
  }

  const { injectImports } = createUnimport({ imports })
  await mkdir(destDir, { recursive: true })
  await writeFile(joinURL(destDir, 'router.server.ts'), (await injectImports(code)).code)
}
