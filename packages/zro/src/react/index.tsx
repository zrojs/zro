import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { decode, encode } from "turbo-stream";
import { withTrailingSlash } from "ufo";
import type { ResolvableHead, Unhead } from "unhead/types";
import { Route, RouteData } from "../router/Route";
import { Router as ZroRouter } from "../router/Router";
import { isRedirectResponse } from "../router/redirect";
import { createHead, UnheadProvider } from "../unhead";
import { Cache } from "./cache";

export type RouterProps = {
  router: ZroRouter;
  initialUrl?: URL;
  cache?: Cache;
  head?: Unhead<ResolvableHead>;
};

let currentLoadingRoute: {
  path: string;
  loader: Promise<any> | null;
  cacheKey: string;
} = {
  // handle the case where the user navigates to a different route before the current route is done loading
  // handle the case where no route is found
  // handle the case where no route loaded yet
  // what if no loader found?!
  path: "",
  loader: null,
  cacheKey: "",
};

const getRouterCacheKey = (url: string) =>
  JSON.stringify(withTrailingSlash(url));

type NavigateFn = (url: string, options: { replace?: boolean }) => void;
type NavigateContext = { navigate: NavigateFn; url: string };
const navigateContext = React.createContext<NavigateContext>(null!);
export const useNavigate = () => React.useContext(navigateContext);
let hydrated = false;
const ssr = typeof window === "undefined";
export type ErrorBoundaryProps = FallbackProps;
const fallbackHead = createHead();
fallbackHead.push({
  script: [
    {
      type: "module",
      src: "@zro/client-entry",
      tagPosition: "bodyClose",
    },
  ],
});
const fallbackCache = new Cache();
export const Router: React.FC<RouterProps> = (props) => {
  const {
    router,
    initialUrl,
    cache = fallbackCache,
    head = fallbackHead,
  } = props;

  return (
    <UnheadProvider head={head}>
      <html suppressHydrationWarning>
        <head suppressHydrationWarning></head>
        <body suppressHydrationWarning>
          <ErrorBoundary FallbackComponent={GlobalErrorBoundary}>
            <React.Suspense>
              <ClientRouter
                router={router}
                cache={cache}
                head={head}
                initialUrl={initialUrl}
              />
            </React.Suspense>
          </ErrorBoundary>
          <DataStreammer />
        </body>
      </html>
    </UnheadProvider>
  );
};

const ClientRouter: React.FC<RouterProps & { cache: Cache }> = ({
  router,
  cache,
  head,
  initialUrl,
}) => {
  const [url, setUrl] = React.useState(
    initialUrl?.pathname || window.location.pathname
  );

  const findTree = React.useCallback((url: string) => {
    const req = new Request(
      new URL(url, initialUrl?.origin || window.location.origin)
    );
    const routeInfo = router.findRoute(req)!;
    if (!routeInfo) throw new Error("Page not found");
    if (currentLoadingRoute.path !== routeInfo.route.getPath()) {
      let reqKey = getRouterCacheKey(req.url);
      const loaderFn = () => {
        router.setUpRequest(req);
        if (typeof window !== "undefined" && !hydrated) {
          hydrated = true;
          // @ts-ignore
          const res = decode(window._readableStream);
          return res;
        }
        if (!ssr) {
          const reqUrl = new URL(req.url);
          if (reqUrl.origin !== window.location.origin)
            window.location.href = reqUrl.href;
          req.headers.set("accept", "text/x-script");
          return fetch(req).then((response) => {
            let redirect = false;
            if (response.redirected && response.url !== req.url) {
              redirect = true;
              cache.delete(reqKey);
            }
            if (response.body) {
              const res = decode(
                response.body.pipeThrough(new TextDecoderStream())
              );
              if (redirect) {
                let reqKey = getRouterCacheKey(response.url);
                cache.set(reqKey, res);
                currentLoadingRoute.path = withTrailingSlash(
                  new URL(response.url).pathname
                );
                currentLoadingRoute.cacheKey = reqKey;
                navigateValue.navigate(new URL(response.url).pathname, {
                  replace: true,
                });
              }
              return res;
            }
          });
        }
        return router.load(req).then((ctx) => {
          if (ctx instanceof Response && isRedirectResponse(ctx)) {
            cache.delete(reqKey);
            return ctx;
          }
          return ctx.data;
        });
      };

      // if (!cache.getRevalidateCallback(reqKey))
      //   cache.setRevalidateCallback(reqKey, loaderFn);
      currentLoadingRoute.loader =
        cache.get(reqKey) || cache.set(reqKey, loaderFn());
      // console.log(currentLoadingRoute.loader);
      currentLoadingRoute.path = withTrailingSlash(routeInfo.route.getPath());
      currentLoadingRoute.cacheKey = reqKey;
    }
    return routeInfo.tree;
  }, []);

  const [tree, setTree] = React.useState<
    Route<any, any, any, readonly any[]>[]
  >(findTree(url));

  const navigateValue = React.useMemo((): NavigateContext => {
    return {
      url,
      navigate: (url, { replace = false }) => {
        if (replace) window.history.replaceState({}, "", url);
        else window.history.pushState({}, "", url);
      },
    } as NavigateContext;
  }, [url]);

  React.useLayoutEffect(() => {
    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray) => {
        React.startTransition(() => {
          setUrl(argArray[2]);
          setTree(findTree(argArray[2]));
        });
        return target.apply(thisArg, argArray as [any, string, string?]);
      },
    });
    window.history.replaceState = new Proxy(window.history.replaceState, {
      apply: (target, thisArg, argArray) => {
        React.startTransition(() => {
          setUrl(argArray[2]);
          setTree(findTree(argArray[2]));
        });
        return target.apply(thisArg, argArray as [any, string, string?]);
      },
    });
  }, []);

  React.useEffect(() => {
    const handlePopState = () => {
      React.startTransition(async () => {
        setUrl(window.location.pathname);
        setTree(findTree(window.location.pathname));
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  return (
    <navigateContext.Provider value={navigateValue}>
      <RenderTree tree={tree} />
    </navigateContext.Provider>
  );
};

const DataStreammer = () => {
  if (typeof window !== "undefined") return null;
  const globalReaderStream = React.useMemo(
    () =>
      encode(currentLoadingRoute.loader, {
        redactErrors: false,
      }),
    []
  );
  const reader = React.useMemo(() => globalReaderStream.getReader(), []);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `_rc = null;  window._readableStream = new ReadableStream({ start(controller) { _rc = controller } })`,
        }}
      ></script>
      <React.Suspense>
        <StreamLoaderData rs={globalReaderStream} reader={reader} />
      </React.Suspense>
    </>
  );
};

const StreamLoaderData: React.FC<{
  rs: ReadableStream<string>;
  reader: ReadableStreamDefaultReader<string>;
}> = ({ rs, reader }) => {
  const read = React.useMemo(async () => {
    return reader.read().finally(() => {
      reader.releaseLock();
    });
  }, []);
  const { value, done } = React.use(read);
  reader.releaseLock();
  const readerN = React.useMemo(() => rs.getReader(), []);

  if (!done)
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `_rc.enqueue(${JSON.stringify(value)})`,
          }}
        ></script>
        <React.Suspense>
          <StreamLoaderData rs={rs} reader={readerN} />
        </React.Suspense>
      </>
    );
  return (
    <>
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `_rc.close();`,
        }}
      ></script>
    </>
  );
};

const GlobalErrorBoundary: React.FC<FallbackProps> = ({ error }) => {
  return (
    <div>
      <h2>{error.message}</h2>
      <span style={{ whiteSpace: "pre" }}>{error.stack}</span>
    </div>
  );
};

const RenderTree: React.FC<{ tree: any[] }> = ({ tree }) => {
  const route = tree[0];
  const remainingTree = tree;
  if (route)
    return (
      <OutletContext.Provider
        value={{
          route,
          tree: remainingTree,
        }}
      >
        <RouteLoading route={route}>
          <Outlet />
        </RouteLoading>
      </OutletContext.Provider>
    );
};

const RouteLoading: React.FC<
  React.PropsWithChildren<{ route: Route<any, any> }>
> = ({ route, children }) => {
  const routeProps = route.getProps();
  if (routeProps?.loading)
    return (
      <React.Suspense fallback={<routeProps.loading />}>
        {children}
      </React.Suspense>
    );
  return children;
};
const OutletContext = React.createContext<{
  route: Route<any, any>;
  tree: Route<any, any>[];
}>(null!);

export const Outlet = () => {
  const ctx = React.use(OutletContext);
  if (!ctx) return null;
  const { route, tree } = ctx;
  if (!route) return null;
  const routeProps = route.getProps() as any;
  const childRoute = tree[0];
  const remainingTree = tree.slice(1);
  const { url } = useNavigate();
  const children = React.useMemo(() => {
    return (
      <OutletContext.Provider
        value={{
          route: childRoute,
          tree: remainingTree,
        }}
      >
        <RouteLoading route={childRoute}>
          <RouteErrorBoundary key={`${route.getPath()}-${url}`}>
            <RenderRouteComponent />
          </RouteErrorBoundary>
        </RouteLoading>
      </OutletContext.Provider>
    );
  }, [childRoute, remainingTree]);

  if (routeProps.loading) {
    return (
      <React.Suspense fallback={<routeProps.loading />}>
        {children}
      </React.Suspense>
    );
  }

  return children;
};

const RouteErrorBoundary: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { route } = React.useContext(OutletContext);
  const routeProps = route.getProps() as any;
  if (routeProps?.errorBoundary)
    return (
      <ErrorBoundary FallbackComponent={routeProps.errorBoundary}>
        {children}
      </ErrorBoundary>
    );
  return children;
};

const RenderRouteComponent: React.FC = () => {
  const { route } = React.use(OutletContext);
  const routeProps = route.getProps() as any;
  const data = useLoaderData();
  if (!routeProps?.component) return null;

  if (data instanceof Error && routeProps.errorBoundary) {
    return <routeProps.errorBoundary error={data} />;
  }

  return <routeProps.component />;
};

export const Link: React.FC<React.HTMLProps<HTMLAnchorElement>> = (props) => {
  const onClick = async (
    e: React.MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>
  ) => {
    props.onClick && (await props.onClick(e));
    if (!e.defaultPrevented) {
      e.preventDefault();
      window.history.pushState({}, "", props.href);
    }
  };
  return <a {...props} onClick={onClick} />;
};

export const useLoaderData = <R extends Route<any, any>>(): RouteData<R> => {
  const currentData = React.use(currentLoadingRoute.loader!);
  const route = React.useContext(OutletContext).route;
  const { navigate } = useNavigate();
  React.useLayoutEffect(() => {
    if (currentData instanceof Response && isRedirectResponse(currentData)) {
      const url = new URL(currentData.headers.get("Location")!);
      navigate(url.pathname, { replace: true });
    }
  }, [currentData]);
  const data =
    currentData instanceof Map ? currentData.get(route.getPath()) : null;

  if (data instanceof Error && !ssr) throw data;

  return data;
};

export * from "./useAction";
