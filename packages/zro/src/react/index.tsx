import {
  createContext,
  FC,
  FormEvent,
  HTMLProps,
  MouseEvent,
  PropsWithChildren,
  startTransition,
  Suspense,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { decode, encode } from "turbo-stream";
import { withQuery, withTrailingSlash } from "ufo";
import type { ResolvableHead, Unhead } from "unhead/types";
import type {
  Actions,
  InferActionReturnType,
  InferActionSchema,
} from "../router";
import { Route, RouteData } from "../router/Route";
import { Router as ZroRouter } from "../router/Router";
import { isRedirectResponse } from "../router/redirect";
import { Cache } from "./cache";
import { createHead, UnheadProvider } from "./unhead";
export * from "./unhead";

export type AlsoAllowString<T> = T | (string & {});
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
  const [url, setUrl] = useState(initialUrl?.href || window.location.href);

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
                new URL(response.url).href
              );
              currentLoadingRoute.cacheKey = reqKey;
              navigateValue.navigate(new URL(response.url).href, {
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
        setUrl(window.location.href);
        setTree(findTree(window.location.href));
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
const useGlobalLoaderData = () => {
  const data = use(currentLoadingRoute.loader!);
  return data.loaderData;
};
const useGlobalActionData = () => {
  const data = use(currentLoadingRoute.loader!);
  return data.actionData;
};
export const useLoaderData = <R extends Route<any, any>>(): RouteData<R> => {
  const route = use(OutletContext).route;
  const loaderData = useGlobalLoaderData();
  const { navigate } = useNavigate();
  useLayoutEffect(() => {
    if (loaderData instanceof Response && isRedirectResponse(loaderData)) {
      const url = new URL(loaderData.headers.get("Location")!);
      navigate(url.href, { replace: true });
    }
  }, [loaderData]);

  const currentLoaderData =
    loaderData instanceof Map ? loaderData.get(route.getPath()) : null;

  if (currentLoaderData instanceof Error && !ssr) throw currentLoaderData;

  return currentLoaderData;
};

export const useRevalidate = () => {
  const { navigate } = useNavigate();
  const revalite = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("_zro");
    navigate(url.href, { replace: true });
  }, [navigate]);
  return { revalite };
};

export const useAction = <
  TRouteId extends keyof Actions,
  TActionKey extends keyof Actions[TRouteId]
>(
  routePath: TRouteId,
  action: TActionKey
) => {
  type TAction = Actions[TRouteId][TActionKey];
  const globalActionData = useGlobalActionData();

  const [data, setData] = useState<InferActionReturnType<TAction>>(() => {
    if (globalActionData && globalActionData.get(routePath))
      return globalActionData.get(routePath);
    return {};
  });

  type TActionErrors = Partial<
    Record<AlsoAllowString<"root" | keyof InferActionSchema<TAction>>, string>
  >;

  const [errors, setErrors] = useState<TActionErrors>({});
  const { navigate } = useNavigate();
  const url = useMemo(
    () => withQuery(routePath, { action: String(action) }),
    [routePath, action]
  );
  const { revalite } = useRevalidate();
  const sendReq = useCallback(
    (formData: FormData) => {
      return fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "X-ZRO-Action": String(action),
        },
      })
        .then((res) => {
          if (!res.ok) throw res;
          console.log(res);
          if (res.redirected) navigate(res.url, { replace: true });
          return res;
        })
        .then(async (res) => {
          const contentType = res.headers.get("Content-Type");
          if (contentType?.includes("application/json")) {
            const json = await res.json();
            setData(json);
            setErrors({});
            return json;
          } else if (contentType?.includes("text/plain")) {
            const text = await res.text();
            setData(text as any);
            setErrors({});
            return text;
          }
        })
        .catch(async (res) => {
          if (res instanceof Response) {
            const contentType = res.headers.get("Content-Type");
            if (contentType?.includes("application/json")) {
              const json = await res.json();
              setErrors({
                ...(json.errors || {}),
                root: json.message,
              });
              return json;
            } else {
              setErrors({
                root: "Invalid response from server",
              } as TActionErrors);
            }
          }
          if (res instanceof Error) {
            setErrors({
              root: res.message,
            } as TActionErrors);
          }
        })
        .finally(revalite);
    },
    [url]
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      return sendReq(new FormData(e.target as HTMLFormElement)).catch((e) => {
        console.log("error");
        console.log(e);
        return e;
      });
    },
    [sendReq]
  );

  const formProps = useMemo(() => {
    return {
      onSubmit,
      action: url,
      method: "post",
    };
  }, [onSubmit, url]);

  return {
    formProps,
    data,
    errors,
  };
};
