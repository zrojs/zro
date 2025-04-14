import { toMerged } from "es-toolkit";
import { addRoute, createRouter, findAllRoutes, findRoute } from "rou3";
import { ServerContext } from "src/router/server";
import { abort } from "src/router/utils";
import { getQuery } from "ufo";
import { createContext, withAsyncContext } from "unctx";
import { createHead } from "unhead/server";
import { ResolvableHead, Unhead } from "unhead/types";
import { Route } from "./Route";

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

    if (route.hasGet()) addRoute(this.router, "get", route.getPath(), route);

    // add route to actions
    for (const actionKey of route.getActionKeys()) {
      addRoute(this.router, `action-${actionKey}`, route.getPath(), route);
    }

    // add not found route
    if (
      route.getParent() &&
      (route.getParent()!.getPath() as string).endsWith("_layout")
    ) {
      const currentParent = route.getParent()!;
      const notFoundRoute = currentParent.getPath().replace("_layout", "**");
      const allRoutes = findAllRoutes(this.router, "", notFoundRoute).find(
        (r) => r.data.getPath() === notFoundRoute
      );
      if (!allRoutes) {
        console.log("adding not found entry to", notFoundRoute);
        addRoute(
          this.router,
          "",
          notFoundRoute,
          new Route<any, any>(notFoundRoute, {
            loader: async () => {
              abort(404, "Page not found");
            },
            parent: currentParent,
            props: {
              info: "not-found",
            },
          })
        );
      }
    }
  }

  public getRoot() {
    return this.rootRoute;
  }

  public findRoute(request: Request) {
    const path = new URL(request.url).pathname;
    const isAction = request.method.toLowerCase() === "post";
    let method = "get";
    if (isAction) {
      const actionName = getQuery(request.url).action;
      method = `action-${actionName}`;
    }
    const destRoute = findRoute(this.router, method, path);
    if (destRoute) {
      if (destRoute.data.getProps()?.info === "not-found") {
        // find the parent and throw error on the loader
        const parent = destRoute.data.getParent();
        const _loader = parent?.getLoader();
        parent?.setLoader(() => {
          if (_loader) parent.setLoader(_loader);
          abort(404, "Page not found");
        });
      }
      return {
        route: destRoute.data,
        params: destRoute.params,
        tree: destRoute.data.getRouteTree(),
      };
    }
    return null;
  }

  public setUpRequest(request: Request) {
    const routeInfo = this.findRoute(request);
    const { params } = routeInfo!;
    const ctx = { request, params: params || {}, status: 200 };
    requestContext.unset();
    requestContext.set(ctx);
  }

  public async load(request: Request, serverCtx?: any) {
    const routeInfo = this.findRoute(request);
    const head = createHead();
    this.setUpRequest(request);

    const { tree: routes } = routeInfo!;

    if (serverCtx) {
      ServerContext.unset();
      ServerContext.set(serverCtx);
    }

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
                    if (requestContext.use().status < 400)
                      requestContext.use().status = 400;
                    return dataPerRoute;
                  }
                  if (newData instanceof Response) {
                    requestContext.use().status = newData.status;
                    // if (isRedirectResponse(newData))
                    return newData;
                  }
                  return loadRoutes(index + 1, toMerged(data, newData!));
                },
                index === routes.length - 1
              );
            })
          );
        };
        return {
          data: await loadRoutes(),
          head,
          status: requestContext.use().status,
        };
      })
    );
  }
}
