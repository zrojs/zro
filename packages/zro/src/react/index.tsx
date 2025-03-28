import { createContext, FC, HTMLProps, MouseEvent, PropsWithChildren, startTransition, Suspense, use, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { UnheadProvider } from 'src/unhead'
import { createHead } from 'unhead/client'
import { isRedirectResponse, Route, RouteData, Router as ZroRouter } from '../router'
import { Cache } from './cache'

export type RouterProps = {
  router: ZroRouter
  initialUrl?: URL
  cache?: Cache
}

let currentLoadingRoute: { path: string; loader: Promise<any> | null; cacheKey: string } = {
  // handle the case where the user navigates to a different route before the current route is done loading
  // handle the case where no route is found
  // handle the case where no route loaded yet
  // what if no loader found?!
  path: '',
  loader: null,
  cacheKey: '',
}

const getRouterCacheKey = (request: Request) => JSON.stringify(request.url)
const head = createHead()
head.hooks.hook('entries:updated', ctx => {
  // ctx.resolveTags().then(console.log)
  // renderSSRHead(ctx).then(console.log)
})

type NavigateFn = (url: string, options: { replace?: boolean }) => void
type NavigateContext = { navigate: NavigateFn; url: string }
const navigateContext = createContext<NavigateContext>(null!)
export const useNavigate = () => useContext(navigateContext)

export const Router: FC<RouterProps> = ({ router, initialUrl, cache = new Cache() }) => {
  const [url, setUrl] = useState(initialUrl?.pathname || window.location.pathname)

  const { route, params, tree } = useMemo(() => {
    const routeInfo = router.findRoute(url)!
    if (currentLoadingRoute.path !== routeInfo.route.getPath()) {
      const req = new Request(new URL(url, initialUrl?.origin || window.location.origin))
      const reqKey = getRouterCacheKey(req)
      const loaderFn = () =>
        router.load(req).then(ctx => {
          if (ctx instanceof Response && isRedirectResponse(ctx)) {
            cache.delete(reqKey)
            return ctx
          }
          return ctx.data
        })
      if (!cache.getRevalidateCallback(reqKey)) cache.setRevalidateCallback(reqKey, loaderFn)
      currentLoadingRoute.loader = cache.get(reqKey) || cache.set(reqKey, loaderFn())
      currentLoadingRoute.path = routeInfo.route.getPath()
      currentLoadingRoute.cacheKey = reqKey
    }
    return routeInfo
  }, [url])

  const navigateValue = useMemo((): NavigateContext => {
    return {
      url,
      navigate: (url, { replace = false }) => {
        if (replace) window.history.replaceState({}, '', url)
        else window.history.pushState({}, '', url)
      },
    } as NavigateContext
  }, [url])

  useLayoutEffect(() => {
    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray) => {
        startTransition(() => {
          setUrl(argArray[2])
        })
        return target.apply(thisArg, argArray as [any, string, string?])
      },
    })
    window.history.replaceState = new Proxy(window.history.replaceState, {
      apply: (target, thisArg, argArray) => {
        startTransition(() => {
          setUrl(argArray[2])
        })
        return target.apply(thisArg, argArray as [any, string, string?])
      },
    })
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      startTransition(async () => {
        setUrl(window.location.pathname)
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <UnheadProvider head={head}>
      <ErrorBoundary FallbackComponent={GlobalErrorBoundary}>
        <navigateContext.Provider value={navigateValue}>
          <RenderTree tree={tree} />
        </navigateContext.Provider>
      </ErrorBoundary>
    </UnheadProvider>
  )
}

const GlobalErrorBoundary: FC<FallbackProps> = ({ error }) => {
  console.error(error)
  return (
    <div>
      <h2>{error.message}</h2>
      <span style={{ whiteSpace: 'pre' }}>{error.stack}</span>
    </div>
  )
}

const RenderTree: FC<{ tree: any[] }> = ({ tree }) => {
  const route = tree[0]
  const remainingTree = tree
  if (route)
    return (
      <OutletContext.Provider
        value={{
          route,
          tree: remainingTree,
        }}
      >
        <Outlet />
      </OutletContext.Provider>
    )
}

const OutletContext = createContext<{ route: Route<any, any>; tree: Route<any, any>[] }>(null!)

export const Outlet = () => {
  const { route, tree } = use(OutletContext)
  if (!route) return null
  const routeProps = route.getProps() as any
  const childRoute = tree[0]
  const remainingTree = tree.slice(1)
  const { url } = useNavigate()
  const children = useMemo(() => {
    return (
      <OutletContext.Provider
        value={{
          route: childRoute,
          tree: remainingTree,
        }}
      >
        <RouteErrorBoundary key={`${route.getPath()}-${url}`}>
          <RenderRouteComponent />
        </RouteErrorBoundary>
      </OutletContext.Provider>
    )
  }, [childRoute, remainingTree])

  if (routeProps.loading) {
    return <Suspense fallback={<routeProps.loading />}>{children}</Suspense>
  }

  return children
}

const RouteErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  const { route } = useContext(OutletContext)
  const routeProps = route.getProps() as any
  if (routeProps?.errorBoundary) return <ErrorBoundary FallbackComponent={routeProps.errorBoundary}>{children}</ErrorBoundary>
  return children
}

const RenderRouteComponent: FC = () => {
  const { route } = use(OutletContext)
  const loaderData = useLoaderData()

  const routeProps = route.getProps() as any
  if (!routeProps?.component) return null
  return <routeProps.component loaderData={loaderData} />
}

export const Link: FC<HTMLProps<HTMLAnchorElement>> = props => {
  const onClick = async (e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
    props.onClick && (await props.onClick(e))
    if (!e.defaultPrevented) {
      e.preventDefault()
      window.history.pushState({}, '', props.href)
    }
  }
  return <a {...props} onClick={onClick} />
}

export const useLoaderData = <R extends Route<any, any>>(): RouteData<R> => {
  const currentData = use(currentLoadingRoute.loader!)
  const route = useContext(OutletContext).route
  const { navigate } = useNavigate()
  useLayoutEffect(() => {
    if (currentData instanceof Response && isRedirectResponse(currentData)) {
      const url = new URL(currentData.headers.get('Location')!)
      navigate(url.pathname, { replace: true })
    }
  }, [currentData])
  const data = currentData instanceof Map ? currentData.get(route.getPath()) : null
  if (data instanceof Error) throw data
  return data
}
