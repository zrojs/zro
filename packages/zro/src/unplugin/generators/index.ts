// import { parse as parseModule } from 'es-module-lexer'

import { existsSync } from 'fs'
import { loadFile } from 'magicast'
import { exit } from 'process'
import { createTypesFile } from 'src/unplugin/generators/types'
import glob from 'tiny-glob'
import { joinURL } from 'ufo'
import { logger } from '../../utils/log'
import { createRouterFile } from './router'
const filePathToRoutePath = (file: string, cwd: string) => {
  return file
    .replace(cwd, '')
    .replace(/\/index\.(tsx|jsx|js|ts)$/, '/') // Replace /index.{ext} with /
    .replace(/\$([a-zA-Z0-9_]+)(?=\/|$)/g, ':$1') // Replace $param with :param
    .replace(/\/\//g, '/') // Ensure no double slashes
    .replace(/\.(tsx|jsx|js|ts)/g, '') // Remove file extensions
}

export type RouteModuleInfo = {
  hasLoader: boolean
  hasMiddleware: boolean
  hasActions: boolean
  hasLoading: boolean
  hasComponent: boolean
  hasErrorBoundary: boolean
}

export type Tree = {
  path: string
  filePath: string
  isLeaf: boolean
  moduleInfo?: RouteModuleInfo
  children: {
    [file: string]: Tree | null
  }
}

const getModuleInfo = async (file: string) => {
  const module = await loadFile(file)
  const exports = Object.keys(module.exports)
  const d = {
    hasLoader: !!exports.includes('loader'),
    hasMiddleware: !!exports.includes('middlewares'),
    hasActions: !!exports.includes('actions'),
    hasComponent: !!exports.includes('default'),
    hasErrorBoundary: !!exports.includes('ErrorBoundary'),
    hasLoading: !!exports.includes('Loading'),
  } satisfies RouteModuleInfo
  return d
}

async function buildTree(files: string[], cwd: string): Promise<Tree> {
  // A file is a layout if its name ends with '_layout.tsx'
  const isLayoutFile = (file: string) => file.endsWith('_layout.tsx')

  // Build a set of layout file names for quick lookup.
  const layoutFiles = new Set(files.filter(isLayoutFile))

  // Prepare a map to store each layout file's children.
  const layoutChildren = new Map<string, Tree>()
  for (const layout of layoutFiles) {
    layoutChildren.set(layout, {
      children: {},
      path: filePathToRoutePath(layout, cwd),
      isLeaf: false,
      filePath: layout,
      moduleInfo: await getModuleInfo(layout),
    })
  }

  // Helper to find the nearest parent layout.
  // For non-layout files, we check the file's directory ancestry.
  // For layout files, we “skip” its own directory by looking one level higher.
  function findParentLayout(file: string, isLayout: boolean): string | null {
    const parts = file.split('/')
    // If a layout file is at the root level, it has no parent.
    if (isLayout && parts.length === 1) return null

    // Remove the file name.
    parts.pop()
    // For layout files, remove one more segment so we don't pick itself.
    if (isLayout && parts.length) {
      parts.pop()
    }
    // Now, walk upward trying to find a layout file.
    while (parts.length >= 0) {
      const candidate = parts.length > 0 ? `${parts.join('/')}/_layout.tsx` : '_layout.tsx'
      if (layoutFiles.has(candidate)) return candidate
      if (parts.length === 0) break
      parts.pop()
    }
    return null
  }

  // Our synthetic root for files that have no parent layout.
  const root: Tree = {
    filePath: '',
    isLeaf: false,
    path: '',
    children: {},
  }

  // Process files in order of increasing path depth so that parent layouts are handled first.
  const filesWithDepth = files.map(f => ({ file: f, depth: f.split('/').length }))
  filesWithDepth.sort((a, b) => a.depth - b.depth)

  for (const { file } of filesWithDepth) {
    const isLayout = isLayoutFile(file)
    const parent = findParentLayout(file, isLayout)

    // Determine the insertion target: either a layout's children or the root.
    let target: Tree
    if (parent) {
      // The parent's children exist because we pre-created an object for every layout file.
      target = layoutChildren.get(parent)!
    } else {
      target = root
    }

    if (isLayout) {
      // For a layout file, assign its children object.
      target.children[file] = layoutChildren.get(file)!
    } else {
      target.children[file] = {
        moduleInfo: await getModuleInfo(file),
        path: filePathToRoutePath(file, cwd),
        isLeaf: true,
        filePath: file,
        children: {},
      }
    }
  }

  return root
}

type PrepareOptions = {
  routesDir: string
}
export const prepare = async ({ routesDir }: PrepareOptions) => {
  if (!(await existsSync(routesDir))) {
    logger.error('Please create a "routes" directory')
    exit()
  }
  // more precise glob to includes only _layout.tsx and index.tsx
  const files = await glob('**/*.{ts,tsx,js,jsx}', { cwd: routesDir, filesOnly: true, absolute: true })
  const routeTree = await (await buildTree(files, routesDir)).children

  await createRouterFile(routeTree, joinURL(process.cwd(), '.zro'))
  await createTypesFile(routeTree, joinURL(process.cwd(), '.zro'))
  // console.log(routeTree)
}
