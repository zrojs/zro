import { createContext, FC, HTMLProps, MouseEvent, PropsWithChildren, startTransition, Suspense, use, useContext, useEffect, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, Router as ZroRouter } from '../router'
import { Cache } from './cache'

export type RouterProps = {
  router: ZroRouter
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

type NavigateFn = (url: string) => void
type NavigateContext = { navigate: NavigateFn }
const navigateContext = createContext<NavigateContext>(null!)
const useNavigate = () => useContext(navigateContext)

export const Router: FC<RouterProps> = ({ router }) => {
  const [url, setUrl] = useState(window.location.pathname)
  const { route, params, tree } = useMemo(() => {
    const routeInfo = router.findRoute(url)!
    if (currentLoadingRoute.path !== routeInfo.route.getPath()) {
      const req = new Request(new URL(url, window.location.origin))
      const reqKey = getRouterCacheKey(req)
      const loaderFn = () => router.load(req)
      if (!Cache.getRevalidateCallback(reqKey)) Cache.setRevalidateCallback(reqKey, loaderFn)
      currentLoadingRoute.loader = Cache.get(reqKey) || Cache.set(reqKey, loaderFn())
      currentLoadingRoute.path = routeInfo.route.getPath()
      currentLoadingRoute.cacheKey = reqKey
    }
    return routeInfo
  }, [url])

  const navigateValue = useMemo(() => {
    return {
      navigate: (url: string, { replace = false }: { replace?: boolean }) => {
        if (replace) window.history.replaceState({}, '', url)
        else window.history.pushState({}, '', url)
      },
    } as NavigateContext
  }, [])

  useEffect(() => {
    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray) => {
        // trigger here what you need
        // Handle the browser Back Button.
        startTransition(() => {
          setUrl(argArray[2])
        })
        return target.apply(thisArg, argArray as [any, string, string?])
      },
    })
    window.history.replaceState = new Proxy(window.history.replaceState, {
      apply: (target, thisArg, argArray) => {
        // trigger here what you need
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
    <navigateContext.Provider value={navigateValue}>
      <RenderTree tree={tree} />
    </navigateContext.Provider>
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

  const children = useMemo(() => {
    return (
      <OutletContext.Provider
        value={{
          route: childRoute,
          tree: remainingTree,
        }}
      >
        <RouteErrorBoundary key={`${route.getPath()}-${window.location.pathname}`}>
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
  if (routeProps.errorBoundary) return <ErrorBoundary FallbackComponent={routeProps.errorBoundary}>{children}</ErrorBoundary>
  return children
}

const RenderRouteComponent: FC = () => {
  const { route } = use(OutletContext)
  const loaderData = useLoaderData()
  const routeProps = route.getProps() as any
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

export const useLoaderData = () => {
  const currentData = use(currentLoadingRoute.loader!)
  const route = useContext(OutletContext).route
  const data = currentData.get(route.getPath())
  if (data instanceof Error) throw data
  return data
}
