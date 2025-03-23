import { genSafeVariableName } from 'knitwork'
import { mkdir, writeFile } from 'node:fs/promises'
import { relative } from 'node:path'
import { joinURL } from 'ufo'
import { createUnimport, Import } from 'unimport'
import { Tree } from '.'

export const createTypesFile = async (tree: Tree['children'], destDir: string) => {
  const imports: Import[] = []
  imports.push({
    name: 'LoaderReturnType',
    from: 'zro/router',
  })
  imports.push({
    name: 'Route',
    from: 'zro/router',
  })
  imports.push({
    name: 'RouteData',
    from: 'zro/router',
  })
  let code = `
export {}
declare global {
  type Routes = {
    --code
  }
}`

  const walkRoutes = (route: Tree, parent?: Tree) => {
    imports.push({
      name: '*',
      as: genSafeVariableName(`import_${route.path}`),
      from: relative(destDir, route.filePath).replace(/\.[^/.]+$/, ''),
    })
    code = code.replace(
      '--code',
      `${JSON.stringify(route.path)}: Route<${JSON.stringify(route.path)}, LoaderReturnType<typeof ${genSafeVariableName(`import_${route.path}`)}.loader>, ${
        parent ? `RouteData<Routes[${JSON.stringify(parent?.path)}]>` : `{}`
      }, ${route.moduleInfo?.hasMiddleware ? `typeof ${genSafeVariableName(`import_${route.path}`)}.middlewares` : `[]`}>,\n    --code`,
    )

    for (const child of Object.values(route.children)) {
      if (child) walkRoutes(child, route)
    }
  }

  for (const child of Object.values(tree)) {
    if (child) walkRoutes(child)
  }

  code = code.replace('--code', '')

  const { injectImports } = createUnimport({ imports })
  await mkdir(destDir, { recursive: true })
  await writeFile(joinURL(destDir, 'router.types.d.ts'), (await injectImports(code)).code)
}
