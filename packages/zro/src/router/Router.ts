import { toMerged } from "es-toolkit";
import { addRoute, createRouter, findRoute } from "rou3";
import { createContext, withAsyncContext } from "unctx";
import { createHead } from "unhead/server";
import { ResolvableHead, Unhead } from "unhead/types";
import { Route } from "./Route";
import { abort, isRedirectResponse } from "./utils";

type RequestContext = {
  request: Request;
  params: Record<string, string>;
  status: number;
};

const requestContext = createContext<RequestContext>();
export const getRequest = requestContext.use;

export const dataContext = createContext<any>();
export const getDataContext = dataContext.tryUse as <
  R extends Route<any, any>
>() => R extends Route<any, any, any, any, any, infer P> ? P : any;
export const getLoaderData = dataContext.tryUse as <
  R extends Route<any, any>
>() => R extends Route<any, any, any, any, infer P> ? P : any;

const HeadContext = createContext<Unhead<ResolvableHead>>();
export const getHead = HeadContext.tryUse;

export class Router {
  private router = createRouter<Route<any, any>>();
  private rootRoute = new Route("_root");

  public addRoute(route: Route<any, any>) {
    if (route.getPath() === "_root") this.rootRoute = route;
    addRoute(this.router, "", route.getPath(), route);
    // add not found route
    if (route.getParent()) {
      const currentParent = route.getParent()!;
      const notFoundRoute = currentParent.getPath().replace("_layout", "**");
      if (!findRoute(this.router, "", notFoundRoute))
        addRoute(
          this.router,
          "",
          notFoundRoute,
          new Route<any, any>(notFoundRoute, {
            loader: async () => abort(404, "Page not found"),
            parent: currentParent,
          })
        );
    }
  }

  public getRoot() {
    return this.rootRoute;
  }

  public findRoute(path: string) {
    const destRoute = findRoute(this.router, "", path);
    if (destRoute)
      return {
        route: destRoute.data,
        params: destRoute.params,
        tree: destRoute.data.getRouteTree(),
      };
    return null;
  }

  public async load(request: Request) {
    const path = new URL(request.url).pathname;
    const routeInfo = this.findRoute(path);
    const head = createHead();
    if (routeInfo) {
      const { params, tree: routes } = routeInfo;
      const ctx = { request, params: params || {}, status: 200 };
      return requestContext.callAsync(
        ctx,
        withAsyncContext(async () => {
          return HeadContext.callAsync(
            head,
            withAsyncContext(async () => {
              const dataPerRoute: Map<string, any> = new Map();
              const loadRoutes = async (index: number = 0, data: any = {}) => {
                if (index >= routes.length) {
                  return dataPerRoute;
                }
                return dataContext.callAsync(
                  data,
                  withAsyncContext(async () => {
                    return await routes[index].load(
                      async (newData: any): Promise<any> => {
                        dataPerRoute.set(routes[index].getPath(), newData);
                        // if didn't error, load next route
                        if (newData instanceof Error) {
                          ctx.status = 400;
                          return dataPerRoute;
                        }
                        if (newData instanceof Response) {
                          ctx.status = newData.status;
                          if (isRedirectResponse(newData)) return newData;
                        }
                        return loadRoutes(index + 1, toMerged(data, newData!));
                      }
                    );
                  })
                );
              };
              return { data: await loadRoutes(), head, status: ctx.status };
            })
          );
        })
      );
    }

    throw new Error("Route not found");
  }
}
