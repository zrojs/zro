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
  path: "",
  loader: null,
  cacheKey: "",
};

const getRouterCacheKey = (url: string) =>
  JSON.stringify(withTrailingSlash(url));

type NavigateFn = (
  url: string,
  options: {
    replace?: boolean;
    async?: boolean;
    readableStream?: ReadableStream;
  }
) => Promise<void>;
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
            <ClientRouter
              router={router}
              cache={cache}
              head={head}
              initialUrl={initialUrl}
            />
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

  const navigateValue = useMemo((): NavigateContext => {
    return {
      url,
      navigate: async (url, { replace = false, async, readableStream }) => {
        let __zro_tree;
        if (async) {
          __zro_tree = findTree(url, readableStream);
          await currentLoadingRoute.loader;
        }
        if (replace)
          window.history.replaceState(
            { __zro_tree, needsLoader: !!!readableStream },
            "",
            url
          );
        else
          window.history.pushState(
            { __zro_tree, needsLoader: !!!readableStream },
            "",
            url
          );
      },
    } as NavigateContext;
  }, [url]);

  const findTree = useCallback(
    (url: string, readableStream?: ReadableStream, where?: string) => {
      const req = new Request(
        new URL(url, initialUrl?.origin || window.location.origin)
      );
      const routeInfo = router.findRoute(req)!;
      if (!routeInfo) throw new Error("Page not found");
      let reqKey = getRouterCacheKey(req.url);
      const loaderFn = (readableStream?: ReadableStream) => {
        router.setUpRequest(req);
        if (typeof window !== "undefined" && (!hydrated || !!readableStream)) {
          hydrated = true;
          // @ts-ignore
          const res = decode(readableStream || window._readableStream);
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
              // cache.delete(reqKey);
            }
            if (response.body) {
              const res = response.body.pipeThrough(new TextDecoderStream());
              if (redirect) {
                let reqKey = getRouterCacheKey(response.url);
                // cache.set(reqKey, res);
                const redirectedTo = new URL(response.url).href;
                currentLoadingRoute.path = withTrailingSlash(redirectedTo);
                currentLoadingRoute.cacheKey = reqKey;
                navigateValue.navigate(redirectedTo, {
                  replace: true,
                  async: true,
                  readableStream: res,
                });
              }
              return decode(res);
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
        : cache.set(reqKey, loaderFn(readableStream));

      currentLoadingRoute.cacheKey = reqKey;
      if (!ssr)
        currentLoadingRoute.path = withTrailingSlash(routeInfo.route.getPath());
      // }
      return routeInfo.tree;
    },
    [navigateValue]
  );

  const [tree, setTree] = useState<Route<any, any, any, readonly any[]>[]>(() =>
    findTree(url)
  );

  useLayoutEffect(() => {
    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray) => {
        startTransition(() => {
          const _zroTree = argArray[0]?.__zro_tree;
          let tree;
          if (_zroTree) {
            tree = _zroTree;
            delete argArray[0].__zro_tree;
          } else {
            tree = findTree(argArray[2]);
          }
          setUrl(argArray[2]);
          setTree(tree);
        });
        return target.apply(thisArg, argArray as [any, string, string?]);
      },
    });
    window.history.replaceState = new Proxy(window.history.replaceState, {
      apply: (target, thisArg, argArray) => {
        startTransition(() => {
          const _zroTree = argArray[0]?.__zro_tree;
          let tree;
          if (_zroTree) {
            tree = _zroTree;
            delete argArray[0].__zro_tree;
          } else {
            tree = findTree(argArray[2]);
          }
          setUrl(argArray[2]);
          setTree(tree);
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
  return <Suspense>{children}</Suspense>;
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
  return data.actionData as { error: boolean; data: Map<any, any> };
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
  const revalidate = useCallback(
    async (readableStream?: ReadableStream) => {
      const url = new URL(window.location.href);
      return navigate(url.href, { replace: true, async: true, readableStream });
    },
    [navigate]
  );
  return { revalidate };
};

const parseServerError = (json: any) => {
  return {
    ...(json?.errors || {}),
    root: json?.message,
  };
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
    if (
      globalActionData &&
      !globalActionData.error &&
      globalActionData.data.get(routePath)
    ) {
      return globalActionData.data.get(routePath);
    }
    return {};
  });

  type TActionErrors = Partial<
    Record<AlsoAllowString<"root" | keyof InferActionSchema<TAction>>, string>
  >;

  const [errors, setErrors] = useState<TActionErrors>(() => {
    if (
      globalActionData &&
      globalActionData.error &&
      globalActionData.data.get(routePath)
    )
      return parseServerError(globalActionData.data.get(routePath));
    return {};
  });
  const { navigate } = useNavigate();
  const url = useMemo(
    () => withQuery(routePath, { action: String(action) }),
    [routePath, action]
  );
  const { revalidate } = useRevalidate();
  const sendReq = useCallback(
    (formData: FormData) => {
      fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "X-ZRO-Action": String(action),
          accept: "text/x-script",
        },
      })
        .then((res) => {
          if (!res.ok) throw res;
          return res;
        })
        .then(async (res) => {
          const contentType = res.headers.get("Content-Type");
          if (contentType?.includes("application/json")) {
            const json = await res.json();
            return [
              res,
              json,
              () => {
                setData(json);
                setErrors({});
              },
            ];
          } else if (
            contentType?.includes("text/") &&
            !contentType?.includes("text/x-script")
          ) {
            const text = await res.text();
            return [
              res,
              text,
              () => {
                setData(text as any);
                setErrors({});
              },
            ];
          }
          return [res, undefined, () => {}, "success"];
        })
        .catch(async (res) => {
          if (res instanceof Response) {
            const contentType = res.headers.get("Content-Type");
            if (contentType?.includes("application/json")) {
              const json = await res.json();
              const errorObj = parseServerError(json);
              return [
                res,
                errorObj,
                () => {
                  setErrors(errorObj);
                },
                "error",
              ];
            } else {
              const errorObj = parseServerError({
                message: "Invalid response from server",
              });
              return [
                res,
                errorObj,
                () => {
                  setErrors(errorObj);
                },
                "error",
              ];
            }
          }
          if (res instanceof Error) {
            const errorObj = parseServerError({
              message: res.message,
            });
            return [
              errorObj,
              () => {
                setErrors(errorObj);
              },
              "error",
            ];
          }
        })
        .then(([response, returnData, callback, type = "success"]: any) => {
          let redirectedTo = undefined;
          if (response instanceof Response) {
            if (response.redirected) {
              redirectedTo = response.url;
            }
          }
          if (
            redirectedTo &&
            (response as Response).headers
              .get("content-type")
              ?.includes("text/x-script")
          ) {
            navigate(redirectedTo, {
              replace: true,
              async: true,
              readableStream: (response as Response).body?.pipeThrough(
                new TextDecoderStream()
              ),
            }).then(() => {
              return startTransition(callback);
            });
          } else {
            revalidate().then(() => {
              return startTransition(callback);
            });
          }

          if (type === "error") throw returnData;
          return returnData;
        });
    },
    [url]
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      return sendReq(new FormData(e.target as HTMLFormElement));
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
