import { Merge } from './utils/types'

type NextFn<LoaderData> = <ReturnType>(data?: ReturnType) => Promise<Merge<LoaderData, ReturnType>>

export class Middleware<LoaderData, ReturnedValue> {
  constructor(private fn: (args: { data: LoaderData; next: NextFn<LoaderData> }) => Promise<ReturnedValue>) {}

  public run(args: { data: LoaderData; next: NextFn<LoaderData> }) {
    return this.fn(args)
  }
}

export type MiddlewareReturnType<T extends Middleware<any, any>> = T extends Middleware<any, infer R> ? R : never
