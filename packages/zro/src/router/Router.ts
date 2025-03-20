import { merge } from 'es-toolkit'
import { addRoute, createRouter, findRoute } from 'rou3'
import { createContext, withAsyncContext } from 'unctx'
import { ResolvableHead } from 'unhead/types'
import { Route } from './Route'
import { abort } from './utils'

type RequestContext = {
  request: Request
  params?: Record<string, string>
}

const requestContext = createContext<RequestContext>()
export const useRequest = requestContext.use

const HeadContext = createContext<ResolvableHead>()
export const useHead = HeadContext.use

export class Router {
  private router = createRouter<Route<any, any>>()
  private rootRoute = new Route('_root')

  public addRoute(route: Route<any, any>) {
    if (route.getPath() === '_root') this.rootRoute = route
    addRoute(this.router, '', route.getPath(), route)
    // add not found route
    if (route.getParent()) {
      const currentParent = route.getParent()!
      const notFoundRoute = currentParent.getPath().replace('_layout', '**')
      if (!findRoute(this.router, '', notFoundRoute))
        addRoute(
          this.router,
          '',
          notFoundRoute,
          new Route<any, any>(notFoundRoute, {
            loader: async () => abort(404, 'Page not found'),
            parent: currentParent,
          }),
        )
    }
  }

  public getRoot() {
    return this.rootRoute
  }

  public findRoute(path: string) {
    const destRoute = findRoute(this.router, '', path)
    if (destRoute) return { route: destRoute.data, params: destRoute.params, tree: destRoute.data.getRouteTree() }
    return null
  }

  public async load(request: Request) {
    const path = new URL(request.url).pathname
    const routeInfo = this.findRoute(path)
    if (routeInfo) {
      const { params, tree: routes } = routeInfo
      return requestContext.callAsync(
        { request, params },
        withAsyncContext(async () => {
          const loadRoutes = async (index: number = 0, data: any = {}) => {
            if (index >= routes.length) return data
            return await routes[index].load(data, async (newData: any): Promise<any> => loadRoutes(index + 1, merge(data, newData!)))
          }
          return await loadRoutes()
        }),
      )
    }
    throw new Error('Route not found')
  }
}
