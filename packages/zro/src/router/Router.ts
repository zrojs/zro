import { merge } from 'es-toolkit'
import { addRoute, createRouter, findRoute } from 'rou3'
import { createContext, withAsyncContext } from 'unctx'
import { ResolvableHead } from 'unhead/types'
import { Route } from './Route'

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
  }

  public getRoot() {
    return this.rootRoute
  }

  public findRoute(path: string) {
    const destRoute = findRoute(this.router, '', path)
    if (destRoute) return { route: destRoute.data, params: destRoute.params }
    return null
  }

  public async load(request: Request) {
    const path = new URL(request.url).pathname
    const routeInfo = this.findRoute(path)
    if (routeInfo) {
      const { route, params } = routeInfo
      const routes = [route]
      while (routes[0].getParent()) {
        routes.unshift(routes[0].getParent() as Route<any, any>)
      }
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
  }
}
