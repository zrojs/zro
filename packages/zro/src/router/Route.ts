import { defu } from "defu";
import { merge } from "es-toolkit/compat";
import { getQuery } from "ufo";
import { withAsyncContext } from "unctx";
import { abort } from "./abort";
import { Action } from "./Action";
import { Middleware } from "./Middleware";
import { dataContext, getDataContext, getRequest } from "./Router";
import { safeRespose } from "./safe-response";
import { Merge, MergeMiddlewaresReturnType } from "./types";

type MaybePromise<T> = T | Promise<T>;

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
  loader?: () => MaybePromise<LoaderData>;
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

  public getActionKeys() {
    return Object.keys(this.options.actions || {});
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
    if (!action) abort(404, "Action not found");
    const res = await safeRespose(action.run.bind(action));

    const status = getRequest().status;

    if (!(res instanceof Response)) {
      const isJSON = typeof res === "object";
      return new Response(isJSON ? JSON.stringify(res) : String(res), {
        headers: {
          "Content-Type": isJSON ? "application/json" : "text/plain",
        },
        status,
      });
    }
    return res;
  }

  public setLoader(fn: () => MaybePromise<LoaderData>) {
    this.options.loader = fn;
  }

  public getLoader() {
    return this.options.loader;
  }

  public async load(
    next: (data: any) => Promise<any> = async (data: any) => data,
    isDestRoute?: boolean
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
          if (request.method.toLowerCase() === "post" && isDestRoute) {
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
          }, true)
        );
      }, true)().catch((e) => {
        loadedData = e;
        return next(loadedData);
      });
    };

    return (await runMiddlewares(0)) as Data;
  }

  public hasGet() {
    return !!this.options.loader || this.options.props?.["component"];
  }
}
