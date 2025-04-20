import { FormEvent, useCallback, useMemo, useState } from "react";
import { withQuery } from "ufo";
import type {
  Actions,
  InferActionReturnType,
  InferActionSchema,
} from "../router";
import { useNavigate, useRevalidate } from "./index";

export type AlsoAllowString<T> = T | (string & {});

export const useAction = <
  TRouteId extends keyof Actions,
  TActionKey extends keyof Actions[TRouteId]
>(
  routePath: TRouteId,
  action: TActionKey
) => {
  type TAction = Actions[TRouteId][TActionKey];
  const [data, setData] = useState<InferActionReturnType<TAction>>();

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
      console.log("calling");
      return fetch(url, {
        method: "POST",
        body: formData,
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
