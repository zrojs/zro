import { useEffect } from "react";
import { useAction, useNavigate } from "zro/react";

export const useGithubButtonState = () => {
  // @ts-ignore
  const githubAction = useAction("/auth/github/verify", "verify");
  const { url } = useNavigate();
  const searchParams = new URLSearchParams(new URL(url).search);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  useEffect(() => {
    if (code && state === "github-auth") {
      const formData = new FormData();
      formData.append("code", code);
      githubAction.submit(formData);
    }
  }, [code, state]);

  return {
    isPending: githubAction.isPending,
    errors: githubAction.errors as Partial<Record<"root" | "code", string>>,
  };
};
