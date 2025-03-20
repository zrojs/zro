import { createContext, FC, HTMLProps, use } from 'react'
import { Route, Router as ZroRouter } from '../router'

export type RouterProps = {
  router: ZroRouter
}

let currentLoadingRoute: { path: string; loader: Promise<any> | null } = {
  // handle the case where the user navigates to a different route before the current route is done loading
  // handle the case where no route is found
  // handle the case where no route loaded yet
  // what if no loader found?!
  path: window.location.pathname,
  loader: null,
}

export const Router: FC<RouterProps> = ({ router }) => {
  const { route, params, tree } = router.findRoute(window.location.pathname)!
  if (!currentLoadingRoute.loader) {
    currentLoadingRoute.loader = router.load(new Request(new URL(window.location.pathname, window.location.origin)))
    currentLoadingRoute.path = route.getPath()
  }
  return <RenderTree tree={tree} />
}

const RenderTree: FC<{ tree: any[] }> = ({ tree }) => {
  const route = tree[0]
  const remainingTree = tree.slice(1)
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
  return (
    <OutletContext.Provider
      value={{
        route: childRoute,
        tree: remainingTree,
      }}
    >
      <routeProps.component />
    </OutletContext.Provider>
  )
}

export const Link: FC<HTMLProps<HTMLAnchorElement>> = props => {
  return <a {...props} />
}

export const useLoaderData = () => {
  return use(currentLoadingRoute.loader!)
}
