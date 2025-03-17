import { defu } from 'defu'
import type { ResolvableHead } from 'unhead/types'
import { Action } from './Action'
import { Middleware } from './Middleware'
import { Merge, MergeMiddlewaresReturnType } from './utils/types'

export type MetaFunction<LoaderData> = (data: LoaderData) => ResolvableHead

export type LoaderOptions<LoaderData, ParentLoaderData, TMiddlewares extends Middleware<ParentLoaderData, any>[]> = {
  parent?: Route<any, ParentLoaderData>
  loader?: () => LoaderData | Promise<LoaderData>
  middlewares: readonly [...TMiddlewares]
  actions: Action[]
  meta?: MetaFunction<LoaderData>
}

export class Route<
  RouteId,
  LoaderData,
  ParentLoaderData = any,
  TMiddlewares extends Middleware<ParentLoaderData, any>[] = Middleware<ParentLoaderData, any>[],
  Data = Merge<Merge<ParentLoaderData, MergeMiddlewaresReturnType<TMiddlewares>>, LoaderData>,
> {
  private options: LoaderOptions<LoaderData, ParentLoaderData, TMiddlewares>

  constructor(private path: RouteId, private _options?: Partial<LoaderOptions<LoaderData, ParentLoaderData, TMiddlewares>>) {
    this.options = defu(_options, {
      middlewares: [] as unknown as TMiddlewares,
      actions: [],
    }) as LoaderOptions<LoaderData, ParentLoaderData, TMiddlewares>
  }

  public getPath() {
    return this.path
  }

  public addMiddleware<MiddlewareReturnType>(middleware: Middleware<ParentLoaderData, MiddlewareReturnType>) {
    // @ts-ignore
    this.options.middlewares.push(middleware)
    return this as unknown as Route<RouteId, LoaderData, ParentLoaderData, [...TMiddlewares, Middleware<ParentLoaderData, MiddlewareReturnType>]>
  }

  public getMiddlewares() {
    return this.options.middlewares
  }

  public async load(): Promise<Data> {
    return {} as Data
  }
}
