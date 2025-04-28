import z from "zod";
import { getConfig } from "zro/plugin";
import { Action, getRequest, redirect } from "zro/router";
import { getSession } from "zro/router/server";
import { AuthConfig } from "../../index";
import { GithubProvider, GithubUser } from "./index";
import { verify } from "./utils";

export const actions = {
  verify: new Action({
    input: z.object({
      code: z.string().min(1),
    }),
    handler: async ({ code }) => {
      const config = getConfig<AuthConfig>();
      const { request } = getRequest();
      const redirect_uri = request.headers.get("referer");
      const providerConfig = config.providers.find(
        (provider) => provider.name === "github"
      );
      if (!providerConfig)
        throw new Error("Unable to find the Github provider");
      if (!redirect_uri) {
        throw new Error("Unable to find the redirect uri");
      }
      const appProps = (providerConfig as unknown as GithubProvider).appOptions;
      const ghAuthorization = await verify({
        clientId: appProps.clientId,
        clientSecret: appProps.clientSecret,
        code,
        redirect_uri,
      });

      if ("error" in ghAuthorization) {
        return new Error(ghAuthorization.error_description);
      }
      const fetchUser = () =>
        fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${ghAuthorization.access_token}`,
            "User-Agent": "zro-auth",
          },
        }).then((r) => r.json()) as Promise<GithubUser>;
      const user = await providerConfig.authenticate({
        ...ghAuthorization,
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
    },
  }),
};
