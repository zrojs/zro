import { defu } from "defu";
import { merge } from "es-toolkit";
import { dataContext, getDataContext, getRequest } from "src/router/Router";
import { getQuery } from "ufo";
import { withAsyncContext } from "unctx";
import { Action } from "./Action";
import { Middleware } from "./Middleware";
import { Merge, MergeMiddlewaresReturnType } from "./utils/types";

export type LoaderReturnType<T extends () => any> = T extends () => infer R
  ? Awaited<R>
  : never;
export type RouteData<R extends Route<any, any>> = R extends Route<
  any,
  any,
  any,
  any,
  infer D
>
  ? D
  : never;
export type RouteLoaderData<R extends Route<any, any>> = R extends Route<
  any,
  any,
  any,
  any,
  any,
  infer D
>
  ? D
  : never;

export type LoaderOptions<
  LoaderData,
  ParentLoaderData,
  TMiddlewares extends readonly Middleware<any, any>[]
> = {
  parent?: Route<any, ParentLoaderData>;
  loader?: () => LoaderData | Promise<LoaderData>;
  middlewares: TMiddlewares;
  actions: Record<string, Action<any, any>>;
  props?: Record<string, any>;
};

export class Route<
  RouteId,
  LoaderData,
  ParentLoaderData = any,
  TMiddlewares extends readonly Middleware<any, any>[] = Middleware<any, any>[],
  Data = Merge<
    Merge<ParentLoaderData, MergeMiddlewaresReturnType<TMiddlewares>>,
    LoaderData
  >,
  DataToLoaders = Merge<
    ParentLoaderData,
    MergeMiddlewaresReturnType<TMiddlewares>
  >
> {
  private options: LoaderOptions<LoaderData, ParentLoaderData, TMiddlewares>;

  constructor(
    private path: RouteId,
    private _options?: Partial<
      LoaderOptions<LoaderData, ParentLoaderData, TMiddlewares>
    >
  ) {
    this.options = defu(_options, {
      middlewares: [] as unknown as TMiddlewares,
      actions: [],
    }) as LoaderOptions<LoaderData, ParentLoaderData, TMiddlewares>;
  }

  public getPath() {
    return this.path;
  }

  public addMiddleware<MiddlewareReturnType>(
    middleware: Middleware<ParentLoaderData, MiddlewareReturnType>
  ) {
    // @ts-ignore
    this.options.middlewares.push(middleware);
    return this as unknown as Route<
      RouteId,
      LoaderData,
      ParentLoaderData,
      [...TMiddlewares, Middleware<ParentLoaderData, MiddlewareReturnType>]
    >;
  }

  public getParent() {
    return this.options.parent;
  }

  public getProps() {
    return this.options.props;
  }

  public getRouteTree = (): Route<
    any,
    any,
    any,
    readonly any[],
    any,
    any
  >[] => {
    const routes: Route<any, any, any, readonly any[], any, any>[] = [this];
    while (routes[0].getParent()) {
      routes.unshift(routes[0].getParent() as Route<any, any>);
    }
    return routes;
  };

  private getActionName(request: Request) {
    const actionName = getQuery(request.url).action;
    if (Array.isArray(actionName)) return actionName[0];
    return actionName;
  }

  public async handleAction() {
    const { request } = getRequest();
    const actionName = this.getActionName(request);
    const action = this.options.actions[actionName];
    if (!action) throw new Error(`Action ${actionName} not found`);
    const res = await action.run();
    if (!(res instanceof Response)) {
      const isJSON = typeof res === "object";
      return new Response(isJSON ? JSON.stringify(res) : res, {
        headers: {
          "Content-Type": isJSON ? "application/json" : "text/plain",
        },
      });
    }
    return res;
  }

  public async load(
    next: (data: any) => Promise<any> = async (data: any) => data
  ): Promise<Data> {
    const middlewares = this.options.middlewares;
    let loadedData: any = getDataContext();

    const runMiddlewares = async (
      index: number,
      data: any = {}
    ): Promise<any> => {
      const { request } = getRequest();
      return withAsyncContext(async () => {
        if (index >= middlewares.length) {
          if (request.method === "POST") {
            let actionData;
            try {
              actionData = await this.handleAction();
              if (actionData) {
                loadedData = merge(actionData, loadedData);
              }
            } catch (e) {
              actionData = e;
            }
            return await next(actionData);
          }
          if (this.options.loader) {
            let loaderData;
            try {
              loaderData = await this.options.loader();
              if (loaderData) {
                loadedData = merge(loaderData, loadedData);
              }
            } catch (e) {
              loadedData = e;
            }
            return await next(loadedData);
          }
          return await next(loadedData);
        }
        return dataContext.callAsync(
          data,
          withAsyncContext(async () => {
            return await middlewares[index].run({
              next: async (newData) => {
                if (newData) {
                  loadedData = merge(newData, loadedData);
                }
                return runMiddlewares(index + 1, merge(data, newData || {}));
              },
            });
          })
        );
      })().catch((e) => {
        loadedData = e;
        return next(loadedData);
      });
    };

    return (await runMiddlewares(0)) as Data;
  }
}
