import {
  FC,
  use,
  useMemo,
  useCallback,
  useLayoutEffect,
  createContext,
  Suspense,
  useState,
  startTransition,
  useEffect,
  PropsWithChildren,
  HTMLProps,
  MouseEvent,
} from "react";
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
const navigateContext = createContext<NavigateContext>(null!);
export const useNavigate = () => use(navigateContext);
let hydrated = false;
const ssr = typeof window === "undefined";
export type ErrorBoundaryProps = FallbackProps;
const fallbackHead = createHead();
fallbackHead.push({
  script: [
    {
      type: "module",
      src: "/@zro/client-entry",
      tagPosition: "bodyClose",
    },
  ],
});
const fallbackCache = new Cache();
export const Router: FC<RouterProps> = (props) => {
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
            <Suspense>
              <ClientRouter
                router={router}
                cache={cache}
                head={head}
                initialUrl={initialUrl}
              />
            </Suspense>
          </ErrorBoundary>
          <DataStreammer />
        </body>
      </html>
    </UnheadProvider>
  );
};

const ClientRouter: FC<RouterProps & { cache: Cache }> = ({
  router,
  cache,
  head,
  initialUrl,
}) => {
  const [url, setUrl] = useState(
    initialUrl?.pathname || window.location.pathname
  );

  const findTree = useCallback((url: string, where?: string) => {
    const req = new Request(
      new URL(url, initialUrl?.origin || window.location.origin)
    );
    const routeInfo = router.findRoute(req)!;
    if (!routeInfo) throw new Error("Page not found");
    // if (
    //   currentLoadingRoute.path !== withTrailingSlash(routeInfo.route.getPath())
    // ) {
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

    currentLoadingRoute.loader = ssr
      ? cache.get(reqKey)
      : cache.set(reqKey, loaderFn());
    currentLoadingRoute.cacheKey = reqKey;
    if (!ssr)
      currentLoadingRoute.path = withTrailingSlash(routeInfo.route.getPath());
    // }
    return routeInfo.tree;
  }, []);

  const [tree, setTree] = useState<Route<any, any, any, readonly any[]>[]>(() =>
    findTree(url)
  );

  const navigateValue = useMemo((): NavigateContext => {
    return {
      url,
      navigate: (url, { replace = false }) => {
        if (replace) window.history.replaceState({}, "", url);
        else window.history.pushState({}, "", url);
      },
    } as NavigateContext;
  }, [url]);

  useLayoutEffect(() => {
    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray) => {
        startTransition(() => {
          setUrl(argArray[2]);
          setTree(findTree(argArray[2]));
        });
        return target.apply(thisArg, argArray as [any, string, string?]);
      },
    });
    window.history.replaceState = new Proxy(window.history.replaceState, {
      apply: (target, thisArg, argArray) => {
        startTransition(() => {
          setUrl(argArray[2]);
          setTree(findTree(argArray[2]));
        });
        return target.apply(thisArg, argArray as [any, string, string?]);
      },
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      startTransition(async () => {
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
  const globalReaderStream = useMemo(
    () =>
      encode(currentLoadingRoute.loader, {
        redactErrors: false,
      }),
    []
  );
  const reader = useMemo(() => globalReaderStream.getReader(), []);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `_rc = null;  window._readableStream = new ReadableStream({ start(controller) { _rc = controller } })`,
        }}
      ></script>
      <Suspense>
        <StreamLoaderData rs={globalReaderStream} reader={reader} />
      </Suspense>
    </>
  );
};

const StreamLoaderData: FC<{
  rs: ReadableStream<string>;
  reader: ReadableStreamDefaultReader<string>;
}> = ({ rs, reader }) => {
  const read = useMemo(async () => {
    return reader.read().finally(() => {
      reader.releaseLock();
    });
  }, []);
  const { value, done } = use(read);
  reader.releaseLock();
  const readerN = useMemo(() => rs.getReader(), []);

  if (!done)
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `_rc.enqueue(${JSON.stringify(value)})`,
          }}
        ></script>
        <Suspense>
          <StreamLoaderData rs={rs} reader={readerN} />
        </Suspense>
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

const GlobalErrorBoundary: FC<FallbackProps> = ({ error }) => {
  return (
    <div>
      <h2>{error.message}</h2>
      <span style={{ whiteSpace: "pre" }}>{error.stack}</span>
    </div>
  );
};

const RenderTree: FC<{ tree: any[] }> = ({ tree }) => {
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

const RouteLoading: FC<PropsWithChildren<{ route: Route<any, any> }>> = ({
  route,
  children,
}) => {
  const routeProps = route.getProps();
  if (routeProps?.loading)
    return <Suspense fallback={<routeProps.loading />}>{children}</Suspense>;
  return children;
};
const OutletContext = createContext<{
  route: Route<any, any>;
  tree: Route<any, any>[];
}>(null!);

export const Outlet = () => {
  const ctx = use(OutletContext);
  if (!ctx) return null;
  const { route, tree } = ctx;
  if (!route) return null;
  const routeProps = route.getProps() as any;
  const childRoute = tree[0];
  const remainingTree = tree.slice(1);
  const { url } = useNavigate();
  const children = useMemo(() => {
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
    return <Suspense fallback={<routeProps.loading />}>{children}</Suspense>;
  }

  return children;
};

const RouteErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  const { route } = use(OutletContext);
  const routeProps = route.getProps() as any;
  if (routeProps?.errorBoundary)
    return (
      <ErrorBoundary FallbackComponent={routeProps.errorBoundary}>
        {children}
      </ErrorBoundary>
    );
  return children;
};

const RenderRouteComponent: FC = () => {
  const { route } = use(OutletContext);
  const routeProps = route.getProps() as any;
  const data = useLoaderData();
  if (!routeProps?.component) return null;

  if (data instanceof Error && routeProps.errorBoundary) {
    return <routeProps.errorBoundary error={data} />;
  }

  return <routeProps.component />;
};

export const Link: FC<HTMLProps<HTMLAnchorElement>> = (props) => {
  const onClick = async (
    e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>
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
  const route = use(OutletContext).route;
  const currentData = use(currentLoadingRoute.loader!);
  const { navigate } = useNavigate();
  useLayoutEffect(() => {
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

export const useRevalidate = () => {
  const { navigate } = useNavigate();
  const revalite = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("_zro");
    navigate(url.pathname, { replace: true });
  }, [navigate]);
  return { revalite };
};

export * from "./useAction";
