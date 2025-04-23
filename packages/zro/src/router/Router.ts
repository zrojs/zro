import { addRoute, createRouter, findAllRoutes, findRoute } from "rou3";
import { getQuery } from "ufo";
import { createContext, withAsyncContext } from "unctx";
import { createHead } from "unhead/server";
import { ResolvableHead, Unhead } from "unhead/types";
import { toMerged } from "../utils/tools";
import { abort } from "./abort";
import { Route } from "./Route";
import { ServerContext } from "./server/context";

type RequestContext = {
  request: Request;
  params: Record<string, string>;
  status: number;
};

export const requestContext = createContext<RequestContext>();
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

  public addRoute(route: Route<any, any>) {
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
      // add parent actions to the router
      for (const actionKey of currentParent.getActionKeys()) {
        addRoute(
          this.router,
          `action-${actionKey}`,
          currentParent.getPath(),
          currentParent
        );
      }
      const notFoundRoute = currentParent.getPath().replace("_layout", "**");
      const allRoutes = findAllRoutes(this.router, "", notFoundRoute).find(
        (r) => r.data.getPath() === notFoundRoute
      );
      if (!allRoutes) {
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
    if (routeInfo) {
      const { params } = routeInfo!;
      const ctx = { request, params: params || {}, status: 200 };
      requestContext.unset();
      requestContext.set(ctx);
    }
  }

  public async load(request: Request, serverCtx?: any) {
    if (serverCtx) {
      ServerContext.unset();
      ServerContext.set(serverCtx);
    }

    const routeInfo = this.findRoute(request);
    const head = createHead();
    this.setUpRequest(request);

    if (!routeInfo) {
      return {
        data: {},
        head,
        status: 404,
      };
    }
    const { tree: routes } = routeInfo!;

    return HeadContext.callAsync(
      head,
      withAsyncContext(async () => {
        const loaderDataPerRoute: Map<string, any> = new Map();
        let actionDataPerRoute: Map<string, any> | undefined = undefined;
        const loadRoutes = async (index: number = 0, data: any = {}) => {
          if (index >= routes.length) {
            return {
              loaderData: loaderDataPerRoute,
              actionData: actionDataPerRoute,
            };
          }
          return dataContext.callAsync(
            data,
            withAsyncContext(async () => {
              return await routes[index].load(
                async (
                  newLoaderData: any,
                  newActionData?: any
                ): Promise<any> => {
                  loaderDataPerRoute.set(
                    routes[index].getPath(),
                    newLoaderData
                  );
                  if (newActionData) {
                    actionDataPerRoute = new Map();
                    actionDataPerRoute.set(
                      routes[index].getPath(),
                      newActionData
                    );
                  }
                  // if didn't error, load next route
                  if (
                    newLoaderData instanceof Error ||
                    newActionData instanceof Error
                  ) {
                    if (requestContext.use().status < 400)
                      requestContext.use().status = 400;
                    // early return on facing error
                    return {
                      loaderData: loaderDataPerRoute,
                      actionData: actionDataPerRoute,
                    };
                  }
                  if (newLoaderData instanceof Response) {
                    requestContext.use().status = newLoaderData.status;
                    return newLoaderData;
                  }
                  if (newActionData instanceof Response) {
                    requestContext.use().status = newActionData.status;
                    return newActionData;
                  }
                  return loadRoutes(index + 1, toMerged(data, newLoaderData!));
                },
                index === routes.length - 1
              );
            }, true)
          );
        };
        return {
          data: await loadRoutes(),
          head,
          status: requestContext.use().status,
        };
      }, true)
    );
  }
}
