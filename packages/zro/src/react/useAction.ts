import { FormEvent, useCallback } from "react";
import { useNavigate } from "./index";

export const useAction = (url: string) => {
  const { navigate } = useNavigate();
  const sendReq = useCallback(
    (formData: FormData) => {
      return fetch(url, {
        method: "POST",
        body: formData,
      }).then((res) => {
        if (res.redirected) navigate(res.url, { replace: true });
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

  return {
    formProps: {
      onSubmit,
      action: url,
    },
    data: {},
    errors: {},
  };
};
