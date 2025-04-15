import { AuthConfig } from "index";
import { getConfig } from "zro/plugin";
import { getRequest } from "zro/router/Router";
import { redirect } from "zro/router/redirect";
import { getSession } from "zro/router/server";
import { GithubProvider, GithubUser } from "./index";

export const loader = async () => {
  const config = getConfig<AuthConfig>();
  const { request } = getRequest();
  const reqUrl = new URL(request.url);
  const code = reqUrl.searchParams.get("code");
  if (!code) {
    throw new Error("Missing code or state");
  }
  const providerConfig = config.providers.find(
    (provider) => provider instanceof GithubProvider
  );
  const origin = new URL(request.url).origin;
  const redirect_uri = new URL(
    `${config.authPrefix}/github/callback`,
    origin
  ).toString();
  if (!providerConfig) throw new Error("Unable to find the github provider");
  const appProps = (providerConfig as unknown as GithubProvider).appOptions;
  const authorization = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      body: JSON.stringify({
        client_id: appProps.clientId,
        client_secret: appProps.clientSecret,
        code,
        redirect_uri,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  ).then(
    (r) =>
      r.json() as Promise<
        | {
            access_token: string;
            token_type: "bearer";
            scope: string;
          }
        | { error: string; error_description: string }
      >
  );

  if ("error" in authorization) {
    throw new Error(authorization.error_description);
  }
  const fetchUser = () =>
    fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${authorization.access_token}`,
      },
    }).then((r) => r.json()) as Promise<GithubUser>;

  const user = await providerConfig.authenticate({
    ...authorization,
    fetchUser,
  });
  const session = await getSession(config.session);
  if (!user) {
    session.clear();
    throw new Error("Invalid credentials");
  }
  const token = await config.generateToken(user);

  await session.update({
    token,
  });

  if (config.onLoginSuccessRedirect)
    return redirect(config.onLoginSuccessRedirect);
  return user;
};
