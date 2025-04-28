import { getConfig } from "zro/plugin";
import { getRequest, redirect } from "zro/router";
import { AuthConfig } from "../../index";
import { GithubProvider } from "./index";

export const loader = () => {
  const config = getConfig<AuthConfig>();
  const { request } = getRequest();

  const providerConfig = config.providers.find(
    (provider) => provider.name === "github"
  );
  if (!providerConfig) throw new Error("Unable to find the Github provider");
  const appProps = (providerConfig as unknown as GithubProvider).appOptions;

  const redirectUri = request.headers.get("referer");
  if (!redirectUri) {
    throw new Error("Unable to find the redirect uri");
  }

  redirect(
    `https://github.com/login/oauth/authorize?client_id=${
      appProps.clientId
    }&redirect_uri=${redirectUri}&scope=${(appProps.scopes || []).join(
      " "
    )}&state=github-auth&allow_signup=true`
  );
};
