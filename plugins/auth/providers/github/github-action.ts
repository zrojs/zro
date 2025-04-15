import { AuthConfig } from "index";
import { getConfig } from "zro/plugin";
import { getRequest } from "zro/router/Router";
import { redirect } from "zro/router/redirect";
import { GithubProvider } from "./index";

export const loader = () => {
  const config = getConfig<AuthConfig>();
  const { request } = getRequest();

  const providerConfig = config.providers.find(
    (provider) => provider instanceof GithubProvider
  );
  if (!providerConfig) throw new Error("Unable to find the password provider");
  const appProps = (providerConfig as unknown as GithubProvider).appOptions;

  const origin = new URL(request.url).origin;
  const callbackUrl = new URL(
    `${config.authPrefix}/github/callback`,
    origin
  ).toString();

  redirect(
    `https://github.com/login/oauth/authorize?client_id=${
      appProps.clientId
    }&redirect_uri=${callbackUrl}&scope=${(appProps.scopes || []).join(" ")}`
  );
};
