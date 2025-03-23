import { Route } from 'src/router/Route'
import { Middleware, MiddlewareReturnType } from '../Middleware'

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Merge<T1, T2> = Prettify<Omit<T1, keyof T2> & T2>

export type MergeArrayOfObjects<TArr extends readonly object[], T1 = {}> = TArr extends [infer T2 extends object, ...infer TRest extends object[]] ? MergeArrayOfObjects<TRest, Merge<T1, T2>> : T1

export type MergeMiddlewaresReturnType<TArr extends ReadonlyArray<Middleware<any, any>>, T1 = {}> = TArr extends readonly [
  infer T2 extends Middleware<any, any>,
  ...infer TRest extends ReadonlyArray<Middleware<any, any>>,
]
  ? MergeMiddlewaresReturnType<TRest, Merge<T1, MiddlewareReturnType<T2>>>
  : T1

export type TRouteLoaderData<R extends Route<any, any>> = R extends Route<any, infer L> ? L : never
export type TRouteParentData<R extends Route<any, any>> = R extends Route<any, any, infer L> ? L : never
