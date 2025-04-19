import { FormEvent, useCallback, useMemo } from "react";
import { useNavigate, useRevalidate, useRevalite } from "./index";
import type { Actions } from "../router";
import { withQuery } from "ufo";

export const useAction = <TRouteId extends keyof Actions>(
  routePath: TRouteId,
  action: keyof Actions[TRouteId]
) => {
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
      })
        .then((res) => {
          if (res.redirected) navigate(res.url, { replace: true });
          return res;
        })
        .then(revalite);
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

  return {
    formProps: {
      onSubmit,
      action: url,
    },
    data: {},
    errors: {},
  };
};
